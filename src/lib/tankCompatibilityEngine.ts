import type { Aquarium, AquariumSpeciesBatch, CompatibilityLifeStage, Fish } from '../types';
import { isSaltwaterSpecies } from '../modules/species/species.service';
import { evaluateSpeciesForAquarium, getAquariumVolumeLiters } from './speciesFitEngine';
import { getReviewedCompatibilityProfile, getReviewedPairRule, getReviewedStageRiskProfile, type ReviewedPairRule, type ReviewedStageRiskProfile } from '../data/compatibilityEvidence';
import type { CompatibilityEvidenceDto } from '../../packages/contracts/src';
import { estimateBioloadUnits } from '../../packages/domain-rules/src';

export type TankCompatibilityStatus = 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';
export type TankCompatibilityRiskLevel = 'none' | 'low' | 'medium' | 'high' | 'unknown';
export type TankCompatibilityAddPolicy = 'allow' | 'confirm' | 'complete_information' | 'block';
export type TankCompatibilityScope = 'tank' | 'species_only';

export type TankCompatibilityRule = {
  code: string;
  title: string;
  evidence: string;
  severity: 'info' | 'low' | 'medium' | 'high';
} & CompatibilityEvidenceDto;

export type TankCompatibilityResult = {
  status: TankCompatibilityStatus;
  riskLevel: TankCompatibilityRiskLevel;
  summary: string;
  passedRules: TankCompatibilityRule[];
  warningRules: TankCompatibilityRule[];
  blockingRules: TankCompatibilityRule[];
  missingData: TankCompatibilityRule[];
  suggestions: string[];
  metadata: {
    ruleVersion: string;
    speciesDataVersion: string;
    calculatedAt: string;
    scope: TankCompatibilityScope;
  };
};

export type EvaluateTankCompatibilityInput = {
  tank?: Aquarium | null;
  existingSpecies?: Array<Fish | { species?: Fish | null; record?: { quantity?: number; batches?: AquariumSpeciesBatch[] } | null }>;
  candidateSpecies?: Fish | null;
  candidateQuantity?: number;
  candidateLifeStage?: CompatibilityLifeStage;
  scope?: TankCompatibilityScope;
};

const RULE_VERSION = 'tank-compatibility-v3-stage-risk';
const SPECIES_DATA_VERSION = 'local-fish-data-v1+compatibility-evidence-v2-stage-risk';

const asRule = (
  code: string,
  title: string,
  evidence: string,
  severity: TankCompatibilityRule['severity'] = 'info',
  evidenceMeta: Partial<CompatibilityEvidenceDto> = {},
): TankCompatibilityRule => ({
  code,
  title,
  evidence,
  severity,
  basis: evidenceMeta.basis || 'rule_inference',
  confidence: evidenceMeta.confidence || 'unknown',
  reviewStatus: evidenceMeta.reviewStatus || 'draft',
  affectedSpeciesIds: evidenceMeta.affectedSpeciesIds || [],
  citations: evidenceMeta.citations || [],
});

const evidenceFromProfile = (speciesId: string): CompatibilityEvidenceDto => {
  const profile = getReviewedCompatibilityProfile(speciesId);
  return profile ? {
    basis: 'species_trait',
    confidence: profile.confidence,
    reviewStatus: profile.reviewStatus,
    affectedSpeciesIds: [speciesId],
    citations: profile.citations,
  } : {
    basis: 'species_trait',
    confidence: 'unknown',
    reviewStatus: 'draft',
    affectedSpeciesIds: [speciesId],
    citations: [],
  };
};

const reviewedRuleEvidence: CompatibilityEvidenceDto = {
  basis: 'tank_condition',
  confidence: 'high',
  reviewStatus: 'reviewed',
  affectedSpeciesIds: [],
  citations: [],
};

const normalizeExistingSpecies = (
  existingSpecies: EvaluateTankCompatibilityInput['existingSpecies'] = [],
) => existingSpecies
  .map(item => {
    if (!item || typeof item !== 'object') return null;
    if ('species' in item) {
      const species = (item as { species?: Fish | null }).species || null;
      if (!species?.id) return null;
      const record = (item as { record?: { quantity?: number; batches?: AquariumSpeciesBatch[] } | null }).record;
      return {
        species,
        quantity: getQuantity(record?.quantity),
        batches: Array.isArray(record?.batches) ? record.batches : [],
      };
    }
    const species = item as Fish;
    return species?.id ? { species, quantity: 1, batches: [] as AquariumSpeciesBatch[] } : null;
  })
  .filter((item): item is { species: Fish; quantity: number; batches: AquariumSpeciesBatch[] } => Boolean(item?.species?.id));

const parseRange = (value?: string) => {
  const matches = value?.match(/(\d+(?:\.\d+)?)/g);
  if (!matches?.length) return null;
  const values = matches.map(Number).filter(Number.isFinite);
  if (!values.length) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
};

const rangesOverlap = (a: ReturnType<typeof parseRange>, b: ReturnType<typeof parseRange>) => {
  if (!a || !b) return true;
  return Math.max(a.min, b.min) <= Math.min(a.max, b.max);
};

const getQuantity = (value?: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 1;
};

const estimateBioload = (fish: Fish, quantity = 1) => {
  const temperament = fish.temperament === 'Aggressive' || fish.temperament === 'Territorial' ? 1.35 : 1;
  return estimateBioloadUnits(fish.size, getQuantity(quantity)) * temperament;
};

const convertFitItem = (
  item: { type: string; title: string; detail: string; severity?: 'low' | 'medium' | 'high' },
  fallbackSeverity: TankCompatibilityRule['severity'],
): TankCompatibilityRule => asRule(
  item.type,
  item.title,
  item.detail,
  item.severity || fallbackSeverity,
  reviewedRuleEvidence,
);

const buildSummary = (
  status: TankCompatibilityStatus,
  candidate: Fish,
  blockingRules: TankCompatibilityRule[],
  warningRules: TankCompatibilityRule[],
  missingData: TankCompatibilityRule[],
) => {
  if (status === 'not_recommended') return blockingRules[0]?.evidence || `当前条件下不建议加入 ${candidate.name}。`;
  if (status === 'insufficient_data') return missingData[0]?.evidence || '关键资料不足，暂时无法可靠判断。';
  if (status === 'caution') return warningRules[0]?.evidence || `可以尝试加入 ${candidate.name}，但需要先处理风险项。`;
  return `${candidate.name} 当前条件下适合加入，但仍建议少量加入并继续观察。`;
};

const dedupeRules = (rules: TankCompatibilityRule[]) => {
  const seen = new Set<string>();
  return rules.filter(rule => {
    const key = `${rule.code}::${rule.title}::${rule.evidence}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatReviewedPairRuleEvidence = (rule: ReviewedPairRule) => rule.basis === 'pair_rule'
  ? `${rule.reason} 该结论有直接配对或捕食风险实验支持；实验条件不等于家庭水族箱长期同缸，因此不外推为“已观察到长期同缸捕食”。`
  : `${rule.reason} 此结论根据两种生物各自的已审核行为资料推断，并非直接配对实验。`;

const formatReviewedStageRiskEvidence = (rule: ReviewedStageRiskProfile) => (
  `${rule.reason} 这是生命阶段相关风险，不代表每一只成体都会发生吞食；在没有隔离措施时不应默认安全。`
);

export const evaluateTankCompatibility = ({
  tank,
  existingSpecies = [],
  candidateSpecies,
  candidateQuantity = 1,
  candidateLifeStage = 'unknown',
  scope = 'tank',
}: EvaluateTankCompatibilityInput): TankCompatibilityResult => {
  const metadata = {
    ruleVersion: RULE_VERSION,
    speciesDataVersion: SPECIES_DATA_VERSION,
    calculatedAt: new Date().toISOString(),
    scope,
  };
  const passedRules: TankCompatibilityRule[] = [];
  const warningRules: TankCompatibilityRule[] = [];
  const blockingRules: TankCompatibilityRule[] = [];
  const missingData: TankCompatibilityRule[] = [];
  const suggestions: string[] = [];

  if (!candidateSpecies) {
    missingData.push(asRule('missing_candidate_species', '缺少候选生物', '请先选择要评估的生物。', 'high'));
    return {
      status: 'insufficient_data',
      riskLevel: 'unknown',
      summary: '缺少候选生物，无法判断。',
      passedRules,
      warningRules,
      blockingRules,
      missingData,
      suggestions: ['先选择一个候选生物。'],
      metadata,
    };
  }

  const currentLivestock = normalizeExistingSpecies(existingSpecies);
  const currentSpecies = currentLivestock
    .map(item => item.species)
    .filter(species => species.id !== candidateSpecies.id);

  const sameSpeciesLivestock = currentLivestock.filter(item => item.species.id === candidateSpecies.id);
  const existingSameSpeciesStages: CompatibilityLifeStage[] = Array.from(new Set(
    sameSpeciesLivestock
      .flatMap(item => item.batches.map(batch => batch.lifeStage))
      .filter(stage => Boolean(stage) && stage !== 'unknown'),
  ));
  const reviewedStageRisk = getReviewedStageRiskProfile(candidateSpecies.id);
  const stageRiskApplies = Boolean(
    reviewedStageRisk
    && reviewedStageRisk.youngerStages.includes(candidateLifeStage)
    && reviewedStageRisk.olderStages.some(stage => existingSameSpeciesStages.includes(stage)),
  );

  if (stageRiskApplies && reviewedStageRisk) {
    const target = reviewedStageRisk.verdict === 'not_recommended' ? blockingRules : warningRules;
    target.push(asRule(
      reviewedStageRisk.riskType,
      reviewedStageRisk.verdict === 'not_recommended' ? '同种成鱼与鱼苗存在吞食风险' : '同种不同生命阶段需要谨慎混养',
      formatReviewedStageRiskEvidence(reviewedStageRisk),
      reviewedStageRisk.verdict === 'not_recommended' ? 'high' : 'medium',
      reviewedStageRisk,
    ));
    suggestions.push(...reviewedStageRisk.mitigation);
  } else if (
    candidateLifeStage === 'fry'
    && existingSameSpeciesStages.some(stage => stage === 'adult')
  ) {
    missingData.push(asRule(
      'life_stage_evidence_unreviewed',
      '同种生命阶段风险资料不足',
      `${candidateSpecies.name} 当前已有较大阶段个体，而候选记录为鱼苗；缺少该阶段组合的已审核风险资料，不能默认判断为安全。`,
      'medium',
      {
        basis: 'species_trait',
        confidence: 'unknown',
        reviewStatus: 'draft',
        affectedSpeciesIds: [candidateSpecies.id],
        citations: [],
      },
    ));
  }

  if (scope === 'species_only') {
    if (currentSpecies.length === 0 && sameSpeciesLivestock.length === 0) {
      missingData.push(asRule('missing_species_pair', '还需选择生物', '至少选择两种生物，才能判断它们之间的混养关系。', 'high'));
    }

    currentSpecies.forEach(existing => {
      const pairName = `${existing.name} 与 ${candidateSpecies.name}`;
      const reviewedPairRule = getReviewedPairRule(existing.id, candidateSpecies.id);
      const existingProfile = getReviewedCompatibilityProfile(existing.id);
      const candidateProfile = getReviewedCompatibilityProfile(candidateSpecies.id);
      if (isSaltwaterSpecies(existing) !== isSaltwaterSpecies(candidateSpecies)) {
        blockingRules.push(asRule('species_water_type_conflict', '水体类型冲突', `${pairName} 分属淡水与海水环境，不能混养。`, 'high', reviewedRuleEvidence));
      } else {
        passedRules.push(asRule('species_water_type_match', '水体类型一致', `${pairName} 的水体类型一致。`, 'info', reviewedRuleEvidence));
      }

      const existingTemperature = parseRange(existing.waterTemperature);
      const candidateTemperature = parseRange(candidateSpecies.waterTemperature);
      if (!existingTemperature || !candidateTemperature) {
        missingData.push(asRule('species_temperature_missing', '温度资料不足', `${pairName} 缺少可比较的温度区间。`, 'medium', reviewedRuleEvidence));
      } else if (!rangesOverlap(existingTemperature, candidateTemperature)) {
        blockingRules.push(asRule('temperature_no_overlap', '温度区间不重合', `${pairName} 的适宜温度没有交集。`, 'high', reviewedRuleEvidence));
      } else {
        passedRules.push(asRule('temperature_overlap', '温度区间有交集', `${pairName} 可以找到共同温度区间。`, 'info', reviewedRuleEvidence));
      }

      const existingPh = parseRange(existing.phLevel);
      const candidatePh = parseRange(candidateSpecies.phLevel);
      if (!existingPh || !candidatePh) {
        missingData.push(asRule('species_ph_missing', 'pH 资料不足', `${pairName} 缺少可比较的 pH 区间。`, 'low', reviewedRuleEvidence));
      } else if (!rangesOverlap(existingPh, candidatePh)) {
        warningRules.push(asRule('ph_range_gap', 'pH 区间差异较大', `${pairName} 的 pH 区间没有明确交集。`, 'medium', reviewedRuleEvidence));
      } else {
        passedRules.push(asRule('ph_range_overlap', 'pH 区间有交集', `${pairName} 可以找到共同 pH 区间。`, 'info', reviewedRuleEvidence));
      }

      const predator = [existing, candidateSpecies].find(item => (
        getReviewedCompatibilityProfile(item.id)?.behaviorTraits.includes('predatory')
      ));
      const smaller = predator?.id === existing.id ? candidateSpecies : existing;
      if (predator && smaller.size === 'Small' && predator.id !== smaller.id) {
        blockingRules.push(asRule('predation_risk', '捕食或吞食风险', `${predator.name} 有已审核的捕食特征，可能捕食或吞食 ${smaller.name}。`, 'high', evidenceFromProfile(predator.id)));
      }

      if (reviewedPairRule) {
        const target = reviewedPairRule.verdict === 'not_recommended'
          ? blockingRules
          : reviewedPairRule.verdict === 'caution' ? warningRules : passedRules;
        target.push(asRule(
          `pair_rule_${reviewedPairRule.riskType}`,
          reviewedPairRule.verdict === 'not_recommended' ? '已审核的行为冲突' : '已审核的配对结论',
          formatReviewedPairRuleEvidence(reviewedPairRule),
          reviewedPairRule.verdict === 'not_recommended' ? 'high' : reviewedPairRule.verdict === 'caution' ? 'medium' : 'info',
          reviewedPairRule,
        ));
      } else if (!existingProfile || !candidateProfile) {
        missingData.push(asRule(
          'behavior_evidence_unreviewed',
          '行为资料尚未审核',
          `${pairName} 缺少两者均已审核的行为资料，不能据此判断为安全可混养。`,
          'medium',
          {
            basis: 'species_trait',
            confidence: 'unknown',
            reviewStatus: 'draft',
            affectedSpeciesIds: [existing.id, candidateSpecies.id],
            citations: [],
          },
        ));
      } else {
        const territorialCount = [existingProfile, candidateProfile]
          .filter(profile => profile.behaviorTraits.includes('territorial')).length;
        if (territorialCount >= 2) {
          blockingRules.push(asRule(
            'territorial_conflict',
            '领地冲突',
            `${pairName} 都有已审核的领地防御特征。`,
            'high',
            {
              basis: 'rule_inference',
              confidence: 'medium',
              reviewStatus: 'reviewed',
              affectedSpeciesIds: [existing.id, candidateSpecies.id],
              citations: [...existingProfile.citations, ...candidateProfile.citations],
            },
          ));
        } else {
          passedRules.push(asRule(
            'reviewed_behavior_no_block',
            '行为资料已审核',
            `${pairName} 的已审核行为资料未发现明确阻断。`,
            'info',
            {
              basis: 'rule_inference',
              confidence: 'medium',
              reviewStatus: 'reviewed',
              affectedSpeciesIds: [existing.id, candidateSpecies.id],
              citations: [...existingProfile.citations, ...candidateProfile.citations],
            },
          ));
        }
      }
    });

    const finalPassedRules = dedupeRules(passedRules);
    const finalWarningRules = dedupeRules(warningRules);
    const finalBlockingRules = dedupeRules(blockingRules);
    const finalMissingData = dedupeRules(missingData);
    const hasBlockingMissingData = finalMissingData.some(item => item.severity === 'high' || item.severity === 'medium');
    const status: TankCompatibilityStatus = finalBlockingRules.length > 0
      ? 'not_recommended'
      : hasBlockingMissingData
        ? 'insufficient_data'
        : finalWarningRules.length > 0
          ? 'caution'
          : 'compatible';
    const riskLevel: TankCompatibilityRiskLevel = status === 'not_recommended'
      ? 'high'
      : status === 'insufficient_data'
        ? 'unknown'
        : status === 'caution' ? 'medium' : 'none';
    const names = [candidateSpecies, ...currentSpecies].map(item => item.name).join('、');
    const summary = status === 'not_recommended'
      ? finalBlockingRules[0]?.evidence || '所选组合存在明确阻断。'
      : status === 'insufficient_data'
        ? finalMissingData[0]?.evidence || '所选组合资料不足。'
        : status === 'caution'
          ? finalWarningRules[0]?.evidence || '所选组合需要谨慎观察。'
          : `${names} 暂未发现明确混养冲突。`;

    return {
      status,
      riskLevel,
      summary,
      passedRules: finalPassedRules,
      warningRules: finalWarningRules,
      blockingRules: finalBlockingRules,
      missingData: finalMissingData,
      suggestions: status === 'compatible'
        ? ['进入完整计算，结合鱼缸环境确认容量、设备和负载。']
        : ['进入完整计算查看详细依据与鱼缸环境影响。'],
      metadata,
    };
  }

  if (!tank) {
    missingData.push(asRule('missing_tank', '缺少当前鱼缸', '请先选择一个鱼缸，再判断混养适配。', 'high'));
    return {
      status: 'insufficient_data',
      riskLevel: 'unknown',
      summary: '缺少当前鱼缸，无法判断。',
      passedRules,
      warningRules,
      blockingRules,
      missingData,
      suggestions: ['先选择或创建一个鱼缸。'],
      metadata,
    };
  }

  const livestock = currentLivestock.map(item => ({ species: item.species, record: { quantity: item.quantity } }));
  const fit = evaluateSpeciesForAquarium(candidateSpecies, tank, livestock);

  const isPairRuleFitItem = (item: { type: string }) => item.type.startsWith('pair_rule_');
  fit.matchedItems.filter(item => !isPairRuleFitItem(item)).forEach(item => passedRules.push(convertFitItem(item, 'info')));
  fit.warnings.filter(item => !isPairRuleFitItem(item)).forEach(item => warningRules.push(convertFitItem(item, item.severity || 'medium')));
  fit.hardBlocks.filter(item => !isPairRuleFitItem(item)).forEach(item => blockingRules.push(convertFitItem(item, item.severity || 'high')));
  fit.confirmations.forEach(item => missingData.push(convertFitItem(item, 'low')));

  const tankVolume = getAquariumVolumeLiters(tank);
  if (!tankVolume) {
    missingData.push(asRule('missing_tank_volume', '缺少鱼缸容量', '当前鱼缸尺寸不完整，无法确认容量和负载。', 'medium'));
  }
  if (!tank.targetTemperature) {
    missingData.push(asRule('missing_tank_temperature', '缺少水温', '当前鱼缸未填写目标温度。', 'medium'));
  }

  currentSpecies.forEach(existing => {
    if (!rangesOverlap(parseRange(existing.waterTemperature), parseRange(candidateSpecies.waterTemperature))) {
      blockingRules.push(asRule(
        'temperature_no_overlap',
        '温度区间不重合',
        `${existing.name} 与 ${candidateSpecies.name} 的适宜温度没有交集。`,
        'high',
        reviewedRuleEvidence,
      ));
    }
    if (!rangesOverlap(parseRange(existing.phLevel), parseRange(candidateSpecies.phLevel))) {
      warningRules.push(asRule(
        'ph_range_gap',
        'pH 区间差异较大',
        `${existing.name} 与 ${candidateSpecies.name} 的 pH 区间差异较大，建议先确认水质。`,
        'medium',
        reviewedRuleEvidence,
      ));
    }

    const pairRule = getReviewedPairRule(existing.id, candidateSpecies.id);
    const existingProfile = getReviewedCompatibilityProfile(existing.id);
    const candidateProfile = getReviewedCompatibilityProfile(candidateSpecies.id);
    if (pairRule) {
      const target = pairRule.verdict === 'not_recommended'
        ? blockingRules
        : pairRule.verdict === 'caution' ? warningRules : passedRules;
      target.push(asRule(
        `pair_rule_${pairRule.riskType}`,
        pairRule.verdict === 'not_recommended' ? '已审核的行为冲突' : '已审核的配对结论',
        formatReviewedPairRuleEvidence(pairRule),
        pairRule.verdict === 'not_recommended' ? 'high' : pairRule.verdict === 'caution' ? 'medium' : 'info',
        pairRule,
      ));
    } else if (!existingProfile || !candidateProfile) {
      missingData.push(asRule(
        'behavior_evidence_unreviewed',
        '行为资料尚未审核',
        `${existing.name} 与 ${candidateSpecies.name} 缺少两者均已审核的行为资料，不能据此判断为安全可加入。`,
        'medium',
        {
          basis: 'species_trait',
          confidence: 'unknown',
          reviewStatus: 'draft',
          affectedSpeciesIds: [existing.id, candidateSpecies.id],
          citations: [],
        },
      ));
    }
  });

  const hasPredator = currentSpecies.find(item => (
    getReviewedCompatibilityProfile(item.id)?.behaviorTraits.includes('predatory')
  ));
  if (hasPredator && candidateSpecies.size === 'Small') {
    blockingRules.push(asRule(
      'predation_risk',
      '捕食或吞食风险',
      `当前已有 ${hasPredator.name}，不建议加入明显更小的 ${candidateSpecies.name}。`,
      'high',
      evidenceFromProfile(hasPredator.id),
    ));
  }

  const territorialConflict = currentSpecies.find(item => (
    getReviewedCompatibilityProfile(item.id)?.behaviorTraits.includes('territorial')
  ));
  if (territorialConflict && getReviewedCompatibilityProfile(candidateSpecies.id)?.behaviorTraits.includes('territorial')) {
    const existingProfile = getReviewedCompatibilityProfile(territorialConflict.id)!;
    const candidateProfile = getReviewedCompatibilityProfile(candidateSpecies.id)!;
    blockingRules.push(asRule(
      'territorial_conflict',
      '领地冲突',
      `${territorialConflict.name} 与 ${candidateSpecies.name} 都存在已审核的领地防御特征。`,
      'high',
      {
        basis: 'rule_inference',
        confidence: 'medium',
        reviewStatus: 'reviewed',
        affectedSpeciesIds: [territorialConflict.id, candidateSpecies.id],
        citations: [...existingProfile.citations, ...candidateProfile.citations],
      },
    ));
  }

  if (tankVolume) {
    const currentLoad = currentLivestock.reduce((sum, item) => sum + estimateBioload(item.species, item.quantity), 0);
    const nextLoad = currentLoad + estimateBioload(candidateSpecies, candidateQuantity);
    const loadRate = Math.round((nextLoad / Math.max(1, tankVolume)) * 100);
    if (loadRate >= 90) {
      blockingRules.push(asRule('bioload_over_limit', '生物负荷接近上限', `模拟加入后负载约 ${loadRate}%，不建议继续增加。`, 'high'));
    } else if (loadRate >= 70) {
      warningRules.push(asRule('bioload_near_limit', '生物负荷偏高', `模拟加入后负载约 ${loadRate}%，建议减少数量或加强过滤。`, 'medium'));
    } else {
      passedRules.push(asRule('bioload_ok', '生物负荷可接受', `模拟加入后负载约 ${loadRate}%。`, 'info'));
    }
  }

  const sameSpeciesExistingQuantity = currentLivestock
    .filter(item => item.species.id === candidateSpecies.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const totalCandidateSpeciesQuantity = sameSpeciesExistingQuantity + getQuantity(candidateQuantity);
  const candidateProfile = getReviewedCompatibilityProfile(candidateSpecies.id);
  const reviewedMinimumGroupSize = Number(candidateProfile?.minimumGroupSize);
  if (Number.isFinite(reviewedMinimumGroupSize) && reviewedMinimumGroupSize > 1 && totalCandidateSpeciesQuantity < reviewedMinimumGroupSize) {
    warningRules.push(asRule(
      'group_requirement_gap',
      '群体数量未达到已审核建议',
      `${candidateSpecies.name} 当前模拟合计 ${totalCandidateSpeciesQuantity} 只/条，已审核 minimumGroupSize 为 ${reviewedMinimumGroupSize}。`,
      'medium',
      evidenceFromProfile(candidateSpecies.id),
    ));
  }

  if (candidateProfile?.behaviorTraits.includes('solitary_required') && currentSpecies.length > 0) {
    blockingRules.push(asRule(
      'single_housing_required',
      '更适合单养',
      `${candidateSpecies.name} 的已审核资料支持单养要求，不应作为普通混养候选。`,
      'high',
      evidenceFromProfile(candidateSpecies.id),
    ));
  }

  if (blockingRules.length > 0) {
    suggestions.push('先移除阻断风险或更换候选生物。');
  }
  if (warningRules.length > 0) {
    suggestions.push('如需尝试，请先补充躲避空间、确认水质，并少量加入观察。');
  }
  if (missingData.length > 0) {
    const blockingMissing = missingData.filter(item => item.severity === 'high' || item.severity === 'medium');
    suggestions.push(blockingMissing.length > 0
      ? '先补充鱼缸尺寸、水温或必要设备信息后再评估。'
      : '敏感物种可用试纸或滴定测试复核水质；普通判断无需填写 pH 数值。');
  }
  if (blockingRules.length === 0 && warningRules.length === 0 && missingData.length === 0) {
    suggestions.push('可以少量加入，并在 3-7 天内观察追咬、拒食和水质波动。');
  }

  const finalPassedRules = dedupeRules(passedRules);
  const finalWarningRules = dedupeRules(warningRules);
  const finalBlockingRules = dedupeRules(blockingRules);
  const finalMissingData = dedupeRules(missingData);

  const missingIsBlockingJudgement = finalMissingData.some(item => item.severity === 'high' || item.severity === 'medium');
  const status: TankCompatibilityStatus = finalBlockingRules.length > 0
    ? 'not_recommended'
    : missingIsBlockingJudgement
      ? 'insufficient_data'
      : finalWarningRules.length > 0 || finalMissingData.length > 0
        ? 'caution'
        : 'compatible';

  const riskLevel: TankCompatibilityRiskLevel = status === 'not_recommended'
    ? 'high'
    : status === 'insufficient_data'
      ? 'unknown'
      : status === 'caution'
        ? finalWarningRules.some(rule => rule.severity === 'medium' || rule.severity === 'high') ? 'medium' : 'low'
        : 'none';

  return {
    status,
    riskLevel,
    summary: buildSummary(status, candidateSpecies, finalBlockingRules, finalWarningRules, finalMissingData),
    passedRules: finalPassedRules,
    warningRules: finalWarningRules,
    blockingRules: finalBlockingRules,
    missingData: finalMissingData,
    suggestions: Array.from(new Set(suggestions)).slice(0, 5),
    metadata,
  };
};

export const getTankCompatibilityStatusLabel = (status: TankCompatibilityStatus) => {
  switch (status) {
    case 'compatible':
      return '当前条件下适合';
    case 'caution':
      return '可以尝试，需谨慎';
    case 'not_recommended':
      return '当前条件下不建议加入';
    case 'insufficient_data':
      return '信息不足';
    default:
      return '信息不足';
  }
};

export const evaluateSpeciesCombination = (species: Fish[]): TankCompatibilityResult => {
  const uniqueSpecies = Array.from(new Map(species.filter(item => item?.id).map(item => [item.id, item])).values());
  if (uniqueSpecies.length < 2) {
    return evaluateTankCompatibility({
      scope: 'species_only',
      candidateSpecies: uniqueSpecies[0] || null,
      existingSpecies: [],
    });
  }

  const results = uniqueSpecies.slice(1).map((candidateSpecies, index) => evaluateTankCompatibility({
    scope: 'species_only',
    candidateSpecies,
    existingSpecies: uniqueSpecies.slice(0, index + 1),
  }));
  const rank: Record<TankCompatibilityStatus, number> = {
    compatible: 0,
    caution: 1,
    insufficient_data: 2,
    not_recommended: 3,
  };
  const primary = [...results].sort((a, b) => rank[b.status] - rank[a.status])[0];
  const passedRules = dedupeRules(results.flatMap(result => result.passedRules));
  const warningRules = dedupeRules(results.flatMap(result => result.warningRules));
  const blockingRules = dedupeRules(results.flatMap(result => result.blockingRules));
  const missingData = dedupeRules(results.flatMap(result => result.missingData));

  return {
    ...primary,
    summary: primary.status === 'compatible'
      ? `${uniqueSpecies.map(item => item.name).join('、')} 暂未发现明确混养冲突。`
      : primary.summary,
    passedRules,
    warningRules,
    blockingRules,
    missingData,
    suggestions: Array.from(new Set(results.flatMap(result => result.suggestions))).slice(0, 5),
  };
};

export const getTankCompatibilityAddPolicy = (
  status: TankCompatibilityStatus,
): TankCompatibilityAddPolicy => {
  if (status === 'compatible') return 'allow';
  if (status === 'caution') return 'confirm';
  if (status === 'insufficient_data') return 'complete_information';
  return 'block';
};
