import type { Aquarium, Fish } from '../../types';
import { evaluateTankCompatibility, type TankCompatibilityResult, type TankCompatibilityRule, type TankCompatibilityStatus } from '../../lib/tankCompatibilityEngine';
import { getAquariumVolumeLiters } from '../../lib/speciesFitEngine';
import { assessBioloadScreening } from '../../../packages/domain-rules/src';
import { getReviewedCompatibilityProfile, getReviewedPairRule } from '../../data/compatibilityEvidence';
import type { CompatibilityDecision, CompatibilityRelationship, CompatibilityRiskType, PairCompatibilityResult, WholeTankFeasibility, WholeTankFeasibilityDimension } from './knowledge.types';

export type CompatibilityItem = {
  species: Fish;
  quantity?: number;
  origin?: 'candidate' | 'existing';
};

export type EvaluateCompatibilityDecisionInput = {
  tank?: Aquarium | null;
  items: CompatibilityItem[];
};

const getQuantity = (value?: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 1;
};

const uniqueRules = (rules: TankCompatibilityRule[]) => {
  const seen = new Set<string>();
  return rules.filter(rule => {
    const key = `${rule.code}::${rule.title}::${rule.evidence}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const statusRank: Record<TankCompatibilityStatus, number> = {
  compatible: 0,
  caution: 1,
  insufficient_data: 2,
  not_recommended: 3,
};

const riskPriority: CompatibilityRiskType[] = [
  'water_type',
  'predation',
  'aggression',
  'territory',
  'equipment',
  'space',
  'temperature',
  'ph',
  'group_size',
  'bioload',
  'unknown',
];

const inferRiskType = (rule: TankCompatibilityRule): CompatibilityRiskType => {
  const text = `${rule.code} ${rule.title} ${rule.evidence}`;
  if (/water|水体|海水|淡水/.test(text)) return 'water_type';
  if (/predation|捕食|吞食|体型/.test(text)) return 'predation';
  if (/attack|攻击|追咬|性情/.test(text)) return 'aggression';
  if (/territor|领地|单养/.test(text)) return 'territory';
  if (/equipment|过滤|加热|设备/.test(text)) return 'equipment';
  if (/space|volume|tank|容量|空间|躲避|缸/.test(text)) return 'space';
  if (/temperature|温度|水温/.test(text)) return 'temperature';
  if (/ph|pH/.test(text)) return 'ph';
  if (/school|群游|数量/.test(text)) return 'group_size';
  if (/bioload|负荷|负载/.test(text)) return 'bioload';
  return 'unknown';
};

const severityRank = (relationship: CompatibilityRelationship) => {
  const relationScore = relationship.relationship === 'not_recommended' ? 100 : relationship.relationship === 'conditional' ? 60 : relationship.relationship === 'unknown' ? 40 : 0;
  const severityScore = relationship.severity === 'high' ? 30 : relationship.severity === 'medium' ? 20 : relationship.severity === 'low' ? 10 : 0;
  const priorityScore = riskPriority.length - riskPriority.indexOf(relationship.riskType);
  return relationScore + severityScore + priorityScore;
};

const toRelationship = (
  rule: TankCompatibilityRule,
  relationship: CompatibilityRelationship['relationship'],
  suggestions: string[],
): CompatibilityRelationship => ({
  relationship,
  riskType: inferRiskType(rule),
  title: rule.title,
  evidence: rule.evidence || rule.title,
  severity: rule.severity === 'info' ? 'none' : rule.severity,
  conditions: relationship === 'conditional' || relationship === 'unknown' ? suggestions.slice(0, 2) : [],
  mitigation: relationship === 'not_recommended' ? suggestions.slice(0, 3) : suggestions.slice(0, 2),
  sourceRule: rule,
});

const mergeDirectionalResults = (results: TankCompatibilityResult[]): TankCompatibilityResult => {
  const status = results.reduce<TankCompatibilityStatus>((current, result) => (
    statusRank[result.status] > statusRank[current] ? result.status : current
  ), 'compatible');
  const blockingRules = uniqueRules(results.flatMap(result => result.blockingRules));
  const warningRules = uniqueRules(results.flatMap(result => result.warningRules));
  const missingData = uniqueRules(results.flatMap(result => result.missingData));
  const passedRules = uniqueRules(results.flatMap(result => result.passedRules));
  const summary = results.find(result => result.status === status)?.summary || results[0]?.summary || '暂时无法判断。';
  return {
    status,
    riskLevel: status === 'not_recommended'
      ? 'high'
      : status === 'insufficient_data'
        ? 'unknown'
        : status === 'caution'
          ? 'medium'
          : 'none',
    summary,
    passedRules,
    warningRules,
    blockingRules,
    missingData,
    suggestions: Array.from(new Set(results.flatMap(result => result.suggestions))).slice(0, 5),
    metadata: {
      ruleVersion: results[0]?.metadata.ruleVersion || 'tank-compatibility-v1',
      speciesDataVersion: results[0]?.metadata.speciesDataVersion || 'local-fish-data-v1',
      calculatedAt: new Date().toISOString(),
      scope: results[0]?.metadata.scope || 'tank',
    },
  };
};

const enforcePairEvidenceBoundary = (
  result: TankCompatibilityResult,
  itemA: CompatibilityItem,
  itemB: CompatibilityItem,
): TankCompatibilityResult => {
  if (result.status === 'not_recommended' || getReviewedPairRule(itemA.species.id, itemB.species.id)) {
    return result;
  }

  const profileA = getReviewedCompatibilityProfile(itemA.species.id);
  const profileB = getReviewedCompatibilityProfile(itemB.species.id);
  if (!profileA || !profileB) return result;

  const pairEvidenceRule: TankCompatibilityRule = {
    code: 'pair_evidence_unreviewed',
    title: '配对证据尚未审核',
    evidence: `${itemA.species.name} 与 ${itemB.species.name} 虽各自已有审核物种资料，但缺少已审核的配对结论；物种 profile 未记录风险不能视为已证明不存在配对风险。`,
    severity: 'medium',
    basis: 'rule_inference',
    confidence: 'unknown',
    reviewStatus: 'draft',
    affectedSpeciesIds: [itemA.species.id, itemB.species.id],
    citations: [...profileA.citations, ...profileB.citations],
  };

  return {
    ...result,
    status: 'insufficient_data',
    riskLevel: 'unknown',
    summary: pairEvidenceRule.evidence,
    missingData: uniqueRules([...result.missingData, pairEvidenceRule]),
    suggestions: Array.from(new Set([
      '先补充该物种组合的已审核配对证据，再把结果提升为可记录的 compatible/caution。',
      ...result.suggestions,
    ])).slice(0, 5),
  };
};

const buildPairResult = (
  tank: Aquarium | null | undefined,
  itemA: CompatibilityItem,
  itemB: CompatibilityItem,
): PairCompatibilityResult => {
  const quantityA = getQuantity(itemA.quantity);
  const quantityB = getQuantity(itemB.quantity);
  const forwardResult = evaluateTankCompatibility({
    tank,
    existingSpecies: [{ species: itemA.species, record: { quantity: quantityA } }],
    candidateSpecies: itemB.species,
    candidateQuantity: quantityB,
  });
  const reverseResult = evaluateTankCompatibility({
    tank,
    existingSpecies: [{ species: itemB.species, record: { quantity: quantityB } }],
    candidateSpecies: itemA.species,
    candidateQuantity: quantityA,
  });
  const rawResult = enforcePairEvidenceBoundary(
    mergeDirectionalResults([forwardResult, reverseResult]),
    itemA,
    itemB,
  );

  const blocking = rawResult.blockingRules.map(rule => toRelationship(rule, 'not_recommended', rawResult.suggestions));
  const warnings = rawResult.warningRules.map(rule => toRelationship(rule, 'conditional', rawResult.suggestions));
  const missing = rawResult.missingData.map(rule => toRelationship(rule, 'unknown', rawResult.suggestions));
  const passed = rawResult.passedRules.map(rule => toRelationship(rule, 'compatible', rawResult.suggestions));
  const riskReasons = [...blocking, ...warnings, ...missing].sort((a, b) => severityRank(b) - severityRank(a));

  return {
    pairId: `${itemA.species.id}__${itemB.species.id}`,
    speciesA: itemA.species,
    speciesB: itemB.species,
    quantityA,
    quantityB,
    status: rawResult.status,
    primaryReason: riskReasons[0],
    secondaryReasons: riskReasons.slice(1),
    passedRelationships: passed,
    rawResult,
    adjustable: rawResult.status === 'caution' || rawResult.status === 'insufficient_data',
    actions: rawResult.suggestions,
  };
};

const dimensionResult = ({
  passedRules = [],
  warningRules = [],
  missingData = [],
}: Partial<Omit<WholeTankFeasibilityDimension, 'status'>> = {}): WholeTankFeasibilityDimension => ({
  status: warningRules.length > 0
    ? 'caution'
    : missingData.length > 0
      ? 'unknown'
      : passedRules.length > 0
        ? 'pass'
        : 'not_applicable',
  passedRules,
  warningRules,
  missingData,
});

const parseGenericMinVolumeLiters = (value?: string) => {
  if (!value) return null;
  const match = value.match(/(\d+(?:\.\d+)?)\s*(?:升|l(?:iters?)?\b)/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const uniqueWholeTankItems = (items: CompatibilityItem[]) => {
  const bySpecies = new Map<string, { species: Fish; quantity: number }>();
  items.forEach(item => {
    const quantity = getQuantity(item.quantity);
    const existing = bySpecies.get(item.species.id);
    bySpecies.set(item.species.id, {
      species: item.species,
      quantity: (existing?.quantity || 0) + quantity,
    });
  });
  return Array.from(bySpecies.values());
};

const buildGroupRequirementDimension = (items: CompatibilityItem[]): WholeTankFeasibilityDimension => {
  const passedRules: TankCompatibilityRule[] = [];
  const warningRules: TankCompatibilityRule[] = [];
  const missingData: TankCompatibilityRule[] = [];

  uniqueWholeTankItems(items).forEach(({ species, quantity }) => {
    const profile = getReviewedCompatibilityProfile(species.id);
    if (!profile || profile.reviewStatus !== 'reviewed') {
      missingData.push({
        code: 'whole_tank_group_requirement_unreviewed',
        title: '群体数量证据尚未审核',
        evidence: `${species.name} 暂无已审核的 minimumGroupSize；当前不从名称、描述或“群游”关键词猜测最低数量。`,
        severity: 'low',
        basis: 'species_trait',
        confidence: 'unknown',
        reviewStatus: 'draft',
        affectedSpeciesIds: [species.id],
        citations: [],
      });
      return;
    }

    const minimumGroupSize = Number(profile.minimumGroupSize);
    if (!Number.isFinite(minimumGroupSize) || minimumGroupSize <= 1) {
      if (profile.behaviorTraits.includes('shoaling')) {
        missingData.push({
          code: 'whole_tank_group_requirement_missing_threshold',
          title: '群游物种缺少已审核最低数量',
          evidence: `${species.name} 的已审核资料记录了 shoaling，但没有可用 minimumGroupSize；不能自行补成 5、6 或其他数量。`,
          severity: 'medium',
          basis: 'species_trait',
          confidence: profile.confidence,
          reviewStatus: profile.reviewStatus,
          affectedSpeciesIds: [species.id],
          citations: profile.citations,
        });
      }
      return;
    }

    if (quantity < minimumGroupSize) {
      warningRules.push({
        code: 'whole_tank_group_requirement_gap',
        title: '整缸群体数量未达到已审核建议',
        evidence: `${species.name} 当前整缸计划合计 ${quantity} 只/条，已审核 minimumGroupSize 为 ${minimumGroupSize}；该数量按整缸一次汇总，不按 pair 重复计算。`,
        severity: 'medium',
        basis: 'species_trait',
        confidence: profile.confidence,
        reviewStatus: profile.reviewStatus,
        affectedSpeciesIds: [species.id],
        citations: profile.citations,
      });
    } else {
      passedRules.push({
        code: 'whole_tank_group_requirement_met',
        title: '整缸群体数量达到已审核建议',
        evidence: `${species.name} 当前整缸计划合计 ${quantity} 只/条，达到已审核 minimumGroupSize ${minimumGroupSize}。`,
        severity: 'info',
        basis: 'species_trait',
        confidence: profile.confidence,
        reviewStatus: profile.reviewStatus,
        affectedSpeciesIds: [species.id],
        citations: profile.citations,
      });
    }
  });

  return dimensionResult({ passedRules, warningRules, missingData });
};

const buildPhysicalSpaceDimension = (
  tank: Aquarium | null | undefined,
  items: CompatibilityItem[],
): WholeTankFeasibilityDimension => {
  const passedRules: TankCompatibilityRule[] = [];
  const warningRules: TankCompatibilityRule[] = [];
  const missingData: TankCompatibilityRule[] = [];
  const volumeLiters = getAquariumVolumeLiters(tank);
  const uniqueItems = uniqueWholeTankItems(items);

  if (!volumeLiters) {
    missingData.push({
      code: 'whole_tank_space_context_missing',
      title: '整缸物理空间资料不足',
      evidence: '当前鱼缸尺寸不完整，无法建立整缸物理空间 planning prior。',
      severity: 'medium',
      basis: 'tank_condition',
      confidence: 'unknown',
      reviewStatus: 'draft',
      affectedSpeciesIds: uniqueItems.map(item => item.species.id),
      citations: [],
    });
    return dimensionResult({ passedRules, warningRules, missingData });
  }

  const unparsedSpecies: Fish[] = [];
  uniqueItems.forEach(({ species }) => {
    const genericMinVolume = parseGenericMinVolumeLiters(species.tankSize);
    if (!genericMinVolume) {
      unparsedSpecies.push(species);
      return;
    }
    if (volumeLiters < genericMinVolume) {
      warningRules.push({
        code: 'whole_tank_space_guideline_pressure',
        title: '整缸存在通用空间建议压力',
        evidence: `${species.name} 的资料包含约 ${genericMinVolume}L 通用缸容建议，当前有效水体约 ${volumeLiters}L；这里只作为 planning space prior，不是已审核 hard physical constraint，也不证明当前鱼缸已经失败。`,
        severity: 'medium',
        basis: 'rule_inference',
        confidence: 'low',
        reviewStatus: 'draft',
        affectedSpeciesIds: [species.id],
        citations: [],
      });
    }
  });

  if (warningRules.length === 0) {
    missingData.push({
      code: 'whole_tank_reviewed_space_constraint_unavailable',
      title: '尚无已审核物理空间约束',
      evidence: '当前未发现通用缸容建议缺口，但本地 Compatibility 输入没有已审核的 footprint / swimming-length hard constraint；不能据此宣称物理空间已被证明充足。',
      severity: 'low',
      basis: 'rule_inference',
      confidence: 'unknown',
      reviewStatus: 'draft',
      affectedSpeciesIds: uniqueItems.map(item => item.species.id),
      citations: [],
    });
  }
  if (unparsedSpecies.length > 0) {
    missingData.push({
      code: 'whole_tank_space_guideline_unavailable',
      title: '部分物种缺少可解析空间建议',
      evidence: `${unparsedSpecies.map(species => species.name).join('、')} 缺少可解析的升数型通用缸容建议；不会用体型标签或描述文字补造精确空间阈值。`,
      severity: 'low',
      basis: 'species_trait',
      confidence: 'unknown',
      reviewStatus: 'draft',
      affectedSpeciesIds: unparsedSpecies.map(species => species.id),
      citations: [],
    });
  }

  return dimensionResult({ passedRules, warningRules, missingData });
};

const buildEquipmentDimension = (
  tank: Aquarium | null | undefined,
  items: CompatibilityItem[],
): WholeTankFeasibilityDimension => {
  const missingData: TankCompatibilityRule[] = [];
  const affectedSpeciesIds = uniqueWholeTankItems(items).map(item => item.species.id);

  if (!tank?.equipment || tank.equipment.filter === undefined) {
    missingData.push({
      code: 'whole_tank_equipment_context_missing',
      title: '整缸设备信息不完整',
      evidence: '当前未完整记录过滤设备，无法完成 Whole-Tank equipment sufficiency 复核。',
      severity: 'medium',
      basis: 'tank_condition',
      confidence: 'unknown',
      reviewStatus: 'draft',
      affectedSpeciesIds,
      citations: [],
    });
  } else {
    missingData.push({
      code: 'whole_tank_equipment_requirement_unreviewed',
      title: '物种设备需求证据尚未审核',
      evidence: `当前设备事实已记录（过滤：${tank.equipment.filter}），但 Compatibility profile 尚没有 reviewed species equipment requirement；因此本层不把“已配置设备”直接等同于“设备足够”。`,
      severity: 'low',
      basis: 'species_trait',
      confidence: 'unknown',
      reviewStatus: 'draft',
      affectedSpeciesIds,
      citations: [],
    });
  }

  return dimensionResult({ missingData });
};

const buildBioloadDimension = (
  tank: Aquarium | null | undefined,
  items: CompatibilityItem[],
  totalQuantity: number,
): { dimension: WholeTankFeasibilityDimension; pressure: WholeTankFeasibility['bioloadPressure'] } => {
  const screening = assessBioloadScreening(
    items.map(item => ({ size: item.species.size, quantity: getQuantity(item.quantity) })),
    getAquariumVolumeLiters(tank),
  );
  const evidenceBase = {
    basis: 'rule_inference' as const,
    confidence: 'low' as const,
    reviewStatus: 'draft' as const,
    affectedSpeciesIds: items.map(item => item.species.id),
    citations: [],
  };

  if (screening.pressure === 'unknown') {
    const rule: TankCompatibilityRule = { code: 'whole_tank_bioload_unknown', title: '整缸负荷资料不足', evidence: '缺少可用水体信息，无法完成整缸粗略负荷筛查。', severity: 'medium', ...evidenceBase };
    return { pressure: 'unknown', dimension: dimensionResult({ missingData: [rule] }) };
  }
  if (screening.pressure === 'high') {
    const rule: TankCompatibilityRule = { code: 'whole_tank_bioload_screen_high', title: '整缸粗略负荷筛查偏高', evidence: `已按整缸 ${totalQuantity} 只/条一次性汇总，而不是重复累加 pair；该信号仅用于加入前复核，不等于已证明水质过载。`, severity: 'medium', ...evidenceBase };
    return { pressure: 'high', dimension: dimensionResult({ warningRules: [rule] }) };
  }
  if (screening.pressure === 'elevated') {
    const rule: TankCompatibilityRule = { code: 'whole_tank_bioload_screen_elevated', title: '整缸粗略负荷需要复核', evidence: `已按整缸 ${totalQuantity} 只/条一次性汇总；加入前应结合过滤、喂食和实际水质。`, severity: 'low', ...evidenceBase };
    return { pressure: 'elevated', dimension: dimensionResult({ warningRules: [rule] }) };
  }
  const rule: TankCompatibilityRule = { code: 'whole_tank_bioload_screen_low', title: '整缸粗略负荷未见高压信号', evidence: `已按整缸 ${totalQuantity} 只/条一次性汇总；该结果仍不是水质安全证明。`, severity: 'info', ...evidenceBase };
  return { pressure: 'low', dimension: dimensionResult({ passedRules: [rule] }) };
};

const buildWholeTankFeasibility = (
  tank: Aquarium | null | undefined,
  items: CompatibilityItem[],
): WholeTankFeasibility => {
  const totalQuantity = items.reduce((sum, item) => sum + getQuantity(item.quantity), 0);
  const emptyDimension = dimensionResult();
  if (items.length === 0) {
    return {
      status: 'not_applicable',
      totalQuantity,
      bioloadPressure: 'unknown',
      dimensions: {
        groupRequirement: emptyDimension,
        physicalSpace: emptyDimension,
        equipment: emptyDimension,
        bioload: emptyDimension,
      },
      passedRules: [],
      warningRules: [],
      missingData: [],
      rules: [],
    };
  }

  const groupRequirement = buildGroupRequirementDimension(items);
  const physicalSpace = buildPhysicalSpaceDimension(tank, items);
  const equipment = buildEquipmentDimension(tank, items);
  const bioloadResult = buildBioloadDimension(tank, items, totalQuantity);
  const dimensions = {
    groupRequirement,
    physicalSpace,
    equipment,
    bioload: bioloadResult.dimension,
  };
  const passedRules = uniqueRules(Object.values(dimensions).flatMap(dimension => dimension.passedRules));
  const warningRules = uniqueRules(Object.values(dimensions).flatMap(dimension => dimension.warningRules));
  const missingData = uniqueRules(Object.values(dimensions).flatMap(dimension => dimension.missingData));
  const hasMaterialMissingData = missingData.some(rule => rule.severity === 'medium' || rule.severity === 'high');
  const status: WholeTankFeasibility['status'] = hasMaterialMissingData
    ? 'unknown'
    : warningRules.length > 0
      ? 'caution'
      : 'pass';

  return {
    status,
    totalQuantity,
    bioloadPressure: bioloadResult.pressure,
    dimensions,
    passedRules,
    warningRules,
    missingData,
    rules: uniqueRules([...warningRules, ...missingData, ...passedRules]),
  };
};

const mergeWholeTankFeasibility = (
  aggregate: TankCompatibilityResult,
  wholeTank: WholeTankFeasibility,
): TankCompatibilityResult => {
  if (wholeTank.status === 'not_applicable') return aggregate;
  const warningRules = uniqueRules([...aggregate.warningRules, ...wholeTank.warningRules]);
  const passedRules = uniqueRules([...aggregate.passedRules, ...wholeTank.passedRules]);
  const missingData = uniqueRules([...aggregate.missingData, ...wholeTank.missingData]);
  const hasMaterialWholeTankUnknown = wholeTank.missingData.some(rule => rule.severity === 'medium' || rule.severity === 'high');
  let status = aggregate.status;
  if (status !== 'not_recommended' && hasMaterialWholeTankUnknown) status = 'insufficient_data';
  else if (status === 'compatible' && wholeTank.warningRules.length > 0) status = 'caution';
  const changedSummary = status !== aggregate.status
    ? status === 'insufficient_data'
      ? wholeTank.missingData.find(rule => rule.severity === 'medium' || rule.severity === 'high')?.evidence
      : wholeTank.warningRules[0]?.evidence
    : null;
  return {
    ...aggregate,
    status,
    riskLevel: status === 'not_recommended' ? 'high' : status === 'insufficient_data' ? 'unknown' : status === 'caution' ? 'medium' : 'none',
    warningRules,
    passedRules,
    missingData,
    summary: changedSummary || aggregate.summary,
  };
};

const buildAggregateResult = (pairResults: PairCompatibilityResult[]): TankCompatibilityResult => {
  const status = pairResults.reduce<TankCompatibilityStatus>((current, pair) => (
    statusRank[pair.status] > statusRank[current] ? pair.status : current
  ), 'compatible');
  const blockingRules = uniqueRules(pairResults.flatMap(pair => pair.rawResult.blockingRules));
  const warningRules = uniqueRules(pairResults.flatMap(pair => pair.rawResult.warningRules));
  const missingData = uniqueRules(pairResults.flatMap(pair => pair.rawResult.missingData));
  const passedRules = uniqueRules(pairResults.flatMap(pair => pair.rawResult.passedRules));
  const suggestions = Array.from(new Set(pairResults.flatMap(pair => pair.rawResult.suggestions))).slice(0, 5);
  const riskLevel: TankCompatibilityResult['riskLevel'] = status === 'not_recommended'
    ? 'high'
    : status === 'caution'
      ? 'medium'
      : status === 'insufficient_data'
        ? 'unknown'
        : 'none';
  const summary = status === 'not_recommended'
    ? blockingRules[0]?.evidence || '当前组合存在阻断风险。'
    : status === 'caution'
      ? warningRules[0]?.evidence || '当前组合可以尝试，但需要谨慎观察。'
      : status === 'insufficient_data'
        ? missingData[0]?.evidence || '当前组合缺少关键资料。'
        : '当前组合未发现明确阻断风险。';

  return {
    status,
    riskLevel,
    summary,
    passedRules,
    warningRules,
    blockingRules,
    missingData,
    suggestions,
    metadata: {
      ruleVersion: pairResults[0]?.rawResult.metadata.ruleVersion || 'tank-compatibility-v1',
      speciesDataVersion: pairResults[0]?.rawResult.metadata.speciesDataVersion || 'local-fish-data-v1',
      calculatedAt: new Date().toISOString(),
      scope: pairResults[0]?.rawResult.metadata.scope || 'tank',
    },
  };
};

export const evaluateCompatibilityDecision = ({
  tank,
  items,
}: EvaluateCompatibilityDecisionInput): CompatibilityDecision => {
  const normalized = items.filter(item => item.species?.id);
  const pairResults: PairCompatibilityResult[] = [];

  for (let indexA = 0; indexA < normalized.length; indexA += 1) {
    for (let indexB = indexA + 1; indexB < normalized.length; indexB += 1) {
      pairResults.push(buildPairResult(tank, normalized[indexA], normalized[indexB]));
    }
  }

  const pairAggregateResult = pairResults.length > 0
    ? buildAggregateResult(pairResults)
    : evaluateTankCompatibility({ tank, candidateSpecies: normalized[0]?.species || null, candidateQuantity: normalized[0]?.quantity });
  const wholeTankFeasibility = buildWholeTankFeasibility(tank, normalized);
  const aggregateResult = mergeWholeTankFeasibility(pairAggregateResult, wholeTankFeasibility);
  const primaryConflict = pairResults
    .filter(pair => pair.primaryReason)
    .sort((a, b) => severityRank(b.primaryReason!) - severityRank(a.primaryReason!))[0];
  const blockedReasons = pairResults.flatMap(pair => [pair.primaryReason, ...pair.secondaryReasons])
    .filter((item): item is CompatibilityRelationship => Boolean(item && item.relationship === 'not_recommended'));
  const adjustableReasons = pairResults.flatMap(pair => [pair.primaryReason, ...pair.secondaryReasons])
    .filter((item): item is CompatibilityRelationship => Boolean(item && item.relationship === 'conditional'));
  const missingInformation = pairResults.flatMap(pair => [pair.primaryReason, ...pair.secondaryReasons])
    .filter((item): item is CompatibilityRelationship => Boolean(item && item.relationship === 'unknown'));

  return {
    status: aggregateResult.status,
    riskLevel: aggregateResult.riskLevel,
    summary: aggregateResult.summary,
    pairResults,
    wholeTankFeasibility,
    primaryConflict,
    blockedReasons,
    adjustableReasons,
    missingInformation,
    passedRules: aggregateResult.passedRules,
    warningRules: aggregateResult.warningRules,
    blockingRules: aggregateResult.blockingRules,
    missingData: aggregateResult.missingData,
    suggestions: aggregateResult.suggestions,
    aggregateResult,
    metadata: aggregateResult.metadata,
  };
};
