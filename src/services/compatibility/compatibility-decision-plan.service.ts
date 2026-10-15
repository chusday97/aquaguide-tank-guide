import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import {
  buildBeginnerCompatibilityAction,
  getCompatibilityRuleFamily,
  prioritizeDistinctCompatibilityRules,
  type BeginnerCompatibilityVerdict,
  type CompatibilityActionAuthorityLevel,
  type CompatibilityAssessmentMode,
} from './compatibility-action.service';
import { buildCompatibilityReadableConclusion } from './compatibility-readable-copy.service';
import type { TankCompatibilityRule } from './compatibility.service';

export type CompatibilityUnknownReason =
  | 'missing_user_input'
  | 'unresolved_identity'
  | 'public_evidence_insufficient'
  | 'missing_species_fact'
  | null;

export type CompatibilityDecisionPlan = {
  judgment: '可以养' | '有条件可以' | '不建议' | '暂时无法判断';
  verdict: BeginnerCompatibilityVerdict;
  fullyInformed: boolean;
  riskSummary: string[];
  nextSteps: string[];
  expectedAfterAdjustment: string;
  reviewCheckpoint: string;
  stopCondition: string;
  unknownReason: CompatibilityUnknownReason;
  evidence: {
    authorityLevel: CompatibilityActionAuthorityLevel;
    sourceRuleCodes: string[];
    evidenceIds: string[];
  };
};

const unique = (values: Array<string | null | undefined>) => Array.from(new Set(
  values.map(value => value?.trim()).filter((value): value is string => Boolean(value)),
));

const decisionCodes = (decision: CompatibilityDecision) => new Set([
  ...(decision.metadata.domainRuleCodes || []),
  ...decision.blockingRules.map(rule => rule.code),
  ...decision.warningRules.map(rule => rule.code),
  ...decision.missingData.map(rule => rule.code),
]);

export const isCompatibilityDecisionFullyInformed = (decision: CompatibilityDecision) => (
  decision.metadata.decisionReadiness === 'reviewed'
  && decision.missingData.length === 0
);

const unknownReasonFor = (decision: CompatibilityDecision): CompatibilityUnknownReason => {
  if (decision.status !== 'insufficient_data') return null;
  const codes = decisionCodes(decision);
  if (
    codes.has('species_identity_unresolved')
    || [...codes].some(code => code.startsWith('identity_') && code.endsWith('_unresolved'))
  ) return 'unresolved_identity';
  if (
    codes.has('species_public_evidence_insufficient')
    || [...codes].some(code => code.startsWith('public_evidence_') && code.endsWith('_insufficient'))
  ) return 'public_evidence_insufficient';
  if (
    codes.has('species_evidence_unreviewed')
    || [...codes].some(code => code.startsWith('required_fact_') && code.endsWith('_missing'))
  ) return 'missing_species_fact';
  return 'missing_user_input';
};

const sourceRulesForPlan = (decision: CompatibilityDecision): TankCompatibilityRule[] => {
  if (decision.status === 'not_recommended') return prioritizeDistinctCompatibilityRules(decision.blockingRules).slice(0, 2);
  if (decision.status === 'caution') return prioritizeDistinctCompatibilityRules(decision.warningRules).slice(0, 2);
  if (decision.status === 'insufficient_data') return prioritizeDistinctCompatibilityRules(decision.missingData).slice(0, 2);
  return prioritizeDistinctCompatibilityRules(decision.passedRules).slice(0, 2);
};

const riskRulesForPair = (decision: CompatibilityDecision, pairIndex: number) => {
  const result = decision.pairResults?.[pairIndex]?.rawResult;
  if (!result) return [] as TankCompatibilityRule[];
  if (decision.status === 'not_recommended') return result.blockingRules;
  if (decision.status === 'caution') return result.warningRules;
  if (decision.status === 'insufficient_data') return result.missingData;
  return result.passedRules;
};

const pairsForFamily = (decision: CompatibilityDecision, family: string) => (
  (decision.pairResults || []).filter((_, index) => riskRulesForPair(decision, index)
    .some(rule => getCompatibilityRuleFamily(rule.code) === family))
);

const itemMapFor = (decision: CompatibilityDecision) => new Map(
  (decision.assessmentItems || []).map(item => [item.speciesId, item] as const),
);

const namedItemForFamily = (decision: CompatibilityDecision, family: string) => {
  const items = itemMapFor(decision);
  const pool = [
    ...decision.blockingRules,
    ...decision.warningRules,
    ...decision.missingData,
    ...(decision.pairResults || []).flatMap(pair => [
      ...pair.rawResult.blockingRules,
      ...pair.rawResult.warningRules,
      ...pair.rawResult.missingData,
    ]),
  ].filter(rule => getCompatibilityRuleFamily(rule.code) === family);
  const rule = pool
    .filter(candidate => (candidate.affectedSpeciesIds || []).some(id => items.has(id)))
    .sort((a, b) => (b.affectedSpeciesIds?.length || 0) - (a.affectedSpeciesIds?.length || 0))[0];
  const id = rule?.affectedSpeciesIds?.find(speciesId => items.has(speciesId));
  return id ? items.get(id) : undefined;
};

const pairContextFor = (decision: CompatibilityDecision, family: string, mode: CompatibilityAssessmentMode) => {
  const items = itemMapFor(decision);
  const pairs = pairsForFamily(decision, family);
  const preferred = mode === 'planned_addition'
    ? pairs.find(pair => {
      const a = items.get(pair.speciesA.id)?.origin;
      const b = items.get(pair.speciesB.id)?.origin;
      return (a === 'candidate' && b === 'existing') || (a === 'existing' && b === 'candidate');
    }) || pairs[0]
    : pairs[0];
  if (!preferred) return null;
  const aItem = items.get(preferred.speciesA.id);
  const bItem = items.get(preferred.speciesB.id);
  const candidate = aItem?.origin === 'candidate'
    ? aItem
    : bItem?.origin === 'candidate'
      ? bItem
      : undefined;
  const other = candidate?.speciesId === preferred.speciesA.id ? preferred.speciesB : preferred.speciesA;
  return {
    pairLabel: `${preferred.speciesA.name} 与 ${preferred.speciesB.name}`,
    candidate,
    otherName: other.name,
  };
};

const hasHardTemperatureNoOverlap = (decision: CompatibilityDecision) => (
  decision.blockingRules.some(rule => (
    rule.code === 'temperature_no_overlap' || rule.code === 'temperature_range_conflict'
  ))
);

const specificActionFor = (
  decision: CompatibilityDecision,
  rule: TankCompatibilityRule,
  mode: CompatibilityAssessmentMode,
): string | null => {
  const family = getCompatibilityRuleFamily(rule.code);
  const pair = pairContextFor(decision, family, mode);
  const namedItem = namedItemForFamily(decision, family);
  const min = decision.stockingGuidance?.recommendedMin;

  if (family === 'group_size' && namedItem && min != null) {
    return mode === 'current_tank'
      ? `把 ${namedItem.name} 当前数量从 ${namedItem.quantity} 调整到至少 ${min} 条/只，再观察群游和进食是否恢复稳定。`
      : `把 ${namedItem.name} 计划数量从 ${namedItem.quantity} 调整到至少 ${min} 条/只，再重新判断是否加入。`;
  }

  if (family === 'housing' && namedItem) {
    return mode === 'current_tank'
      ? `${namedItem.name} 有明确单养要求；把 ${namedItem.name} 单独饲养，再重新评估其余组合。`
      : `不要把 ${namedItem.name} 按普通混养方案加入；该物种有明确单养要求。`;
  }

  if (family === 'temperature' && decision.status === 'not_recommended' && !hasHardTemperatureNoOverlap(decision)) {
    const subject = namedItem?.name || pair?.candidate?.name;
    return subject
      ? `先把鱼缸目标温度调整到 ${subject} 的已审核适温范围，并确认与其余物种仍有共同区间，再重新评估。`
      : '先把鱼缸目标温度调整到相关物种的已审核共同适温区间，再重新评估。';
  }

  if (!pair) return null;

  if (family === 'predation' && decision.status === 'caution') {
    if (mode === 'planned_addition' && pair.candidate) {
      return `加入 ${pair.candidate.name} 前，先确认它与 ${pair.otherName} 的实际追食风险，并准备可立即分隔的方案。`;
    }
    if (mode === 'current_tank') {
      return `${pair.pairLabel} 存在被捕食脆弱性；先观察实际追食、躲藏和进食情况，并准备可立即分隔的方案。`;
    }
  }

  if (mode === 'planned_addition' && pair.candidate) {
    if (family === 'water_type') return `不要加入 ${pair.candidate.name}；它与 ${pair.otherName} 的已审核水体需求不一致，应分缸或更换计划物种。`;
    if (family === 'predation') return `不要加入 ${pair.candidate.name}；它与 ${pair.otherName} 存在明确捕食风险，应更换没有该捕食冲突的组合。`;
    if (family === 'aggression') return `不要加入 ${pair.candidate.name}；它与 ${pair.otherName} 存在明确追鳍或行为冲突，应更换组合。`;
    if (family === 'temperature') return `不要加入 ${pair.candidate.name}；它与 ${pair.otherName} 没有安全的长期共同适温区间，应分缸或更换组合。`;
    if (family === 'territory') return `先不要加入 ${pair.candidate.name}；先为它与 ${pair.otherName} 规划遮挡、退让路线和可立即分隔的方案。`;
    if (family === 'ph') return `先确认 ${pair.candidate.name} 与 ${pair.otherName} 有可长期维持的共同 pH 区间，再决定是否加入。`;
  }

  if (mode === 'current_tank') {
    if (family === 'water_type') return `${pair.pairLabel} 的水体需求不一致；尽快分缸，并分别按各自水体条件饲养。`;
    if (family === 'predation') return `${pair.pairLabel} 存在捕食风险；尽快分隔，不要继续按原组合接触。`;
    if (family === 'aggression') return `${pair.pairLabel} 存在明确追鳍或行为冲突；先分隔，再重新评估。`;
    if (family === 'temperature') return `${pair.pairLabel} 没有安全的长期共同适温区间；分缸或调整组合，不要硬取中间温度。`;
    if (family === 'territory') return `先为 ${pair.pairLabel} 增加遮挡和退让路线；若仍持续压迫就分缸。`;
    if (family === 'ph') return `先测当前稳定 pH，并确认 ${pair.pairLabel} 是否有可长期维持的共同区间。`;
  }

  return null;
};

const primaryFamilyFor = (sourceRules: TankCompatibilityRule[]) => (
  sourceRules[0] ? getCompatibilityRuleFamily(sourceRules[0].code) : null
);

const expectedOutcomeFor = (
  decision: CompatibilityDecision,
  verdict: BeginnerCompatibilityVerdict,
  sourceRules: TankCompatibilityRule[],
) => {
  const family = primaryFamilyFor(sourceRules);
  if (verdict === 'add') {
    return '当前无需为兼容性额外调整；维持现有条件并持续观察，结论应保持“可以养”。';
  }
  if (decision.status === 'insufficient_data') {
    return '补齐缺失信息或证据后重新计算；在新结论生成前，不预测这组生物可以安全混养。';
  }
  if (decision.status === 'not_recommended') {
    if (family === 'water_type') return '只有把水体需求冲突的物种分缸或更换，使它们不再共享同一水体后，才重新评估；短期看起来正常不代表冲突解除。';
    if (family === 'predation') return '只有将存在捕食风险的组合分隔或替换后，才重新评估；暂时没有发生吞食不能作为解除该阻断的依据。';
    if (family === 'housing') return '只有把明确要求单养的物种改为单养，或从混养方案中移除后，才重新评估其余组合。';
    if (family === 'temperature' && hasHardTemperatureNoOverlap(decision)) return '只有分缸或更换物种，使组合重新具备已审核的共同适温区间后，才考虑混养。';
    if (family === 'temperature') return '先调整鱼缸目标温度并重新评估；只有温度阻断消失、且与现有物种仍有共同适温区间，才考虑继续当前方案。';
    if (family === 'aggression') return '只有更换或分隔明确行为冲突的组合后，才重新评估；不能用“先试试看”替代已审核的直接冲突证据。';
    return '当前不是“观察看看”即可解决；先消除阻断风险或更换/分隔冲突物种，重新评估通过后再考虑混养。';
  }
  if (verdict === 'wait') {
    return '先处理当前现实异常并重新评估；状态恢复稳定前不要继续扩大组合。';
  }
  if (family === 'group_size') {
    const min = decision.stockingGuidance?.recommendedMin;
    return min != null
      ? `把群体数量调整到至少 ${min} 条/只后重新评估；只有群体数量风险解除，才考虑升级为“可以养”。`
      : '把群体数量调整到已审核最低要求后重新评估；只有该风险解除，才考虑升级为“可以养”。';
  }
  if (family === 'territory' || family === 'aggression') return '完成遮挡、退让路线或分隔方案后重新评估；只有持续追逐、压迫和躲藏风险解除，才继续原组合。';
  if (family === 'ph') return '确认实际稳定 pH 落在可长期维持的共同区间后重新评估；不要只按理论中间值判断。';
  if (family === 'space') return '完成数量或空间调整后重新评估；只有空间风险解除且实际活动、进食稳定，才继续原方案。';
  if (family === 'bioload') return '降低总负荷并确认过滤与维护能力稳定后重新评估；只有负荷风险解除，才继续当前组合。';
  if (family === 'predation') return '确认实际捕食风险可控并准备可立即分隔方案后重新评估；出现追食或伤害时不能继续观察等待。';
  if (verdict === 'add_with_conditions') {
    return '完成建议调整后重新评估；只有对应风险项解除，才把结果升级为“可以养”。';
  }
  return '完成建议后重新评估，再决定是否继续当前混养方案。';
};

const reviewCheckpointFor = (
  decision: CompatibilityDecision,
  sourceRules: TankCompatibilityRule[],
  fallback: string | null,
) => {
  const family = primaryFamilyFor(sourceRules);
  if (decision.status === 'not_recommended') {
    if (family === 'water_type') return '完成分缸或更换物种后立即重新运行混养判断；已知水体冲突不需要靠行为观察期来验证。';
    if (family === 'predation') return '完成分隔或替换冲突组合后重新运行混养判断；确认双方不再继续接触该捕食风险。';
    if (family === 'housing') return '单养方案落实后重新运行混养判断，确认要求单养的物种已不在普通混养组合中。';
    if (family === 'temperature' && hasHardTemperatureNoOverlap(decision)) return '分缸或更换物种后重新运行混养判断；无共同适温区间时不靠观察期验证。';
    if (family === 'temperature') return '目标温度调整后重新运行混养判断，确认温度阻断已消失且仍有共同适温区间。';
    if (family === 'aggression') return '完成更换或分隔后重新运行混养判断；不要用短期没有追咬替代直接配对证据。';
  }
  if (family === 'group_size') {
    const min = decision.stockingGuidance?.recommendedMin;
    return min != null
      ? `数量达到至少 ${min} 条/只后，确认正常群游、进食和躲藏状态，再重新运行混养判断。`
      : '达到已审核最低群体数量后，确认正常群游、进食和躲藏状态，再重新运行混养判断。';
  }
  if (family === 'predation' || family === 'aggression' || family === 'territory') return '重点观察持续追逐、躲藏、受伤、破鳍和进食受阻；出现任一持续异常就分隔并重新评估。';
  if (family === 'ph') return '实际稳定 pH 进入共同区间后重新运行混养判断，并继续观察进食、体色和呼吸是否稳定。';
  if (family === 'space') return '数量或空间调整后重新运行混养判断，并确认游动受限、抢位、躲藏和进食问题是否解除。';
  if (family === 'bioload') return '降低负荷后重新运行混养判断，并确认呼吸、进食和明显水质波动恢复稳定。';
  return fallback || '调整后重新运行混养判断，并继续观察实际状态是否稳定。';
};

const stopConditionForPlan = (
  decision: CompatibilityDecision,
  mode: CompatibilityAssessmentMode,
  sourceRules: TankCompatibilityRule[],
  fallback: string | null,
) => {
  const family = primaryFamilyFor(sourceRules);
  const pair = family ? pairContextFor(decision, family, mode) : null;
  if (decision.status === 'not_recommended') {
    if (mode === 'current_tank') return pair
      ? `${pair.pairLabel} 的明确冲突解除前保持分隔，不要恢复原组合。`
      : '明确冲突消除前保持分隔，不要按原组合继续维持。';
    return pair
      ? `${pair.pairLabel} 的明确阻断风险解除前，不要执行当前混养计划。`
      : '明确阻断风险消除前，不要执行当前混养计划。';
  }
  if (decision.status === 'caution' && family === 'group_size') {
    const min = decision.stockingGuidance?.recommendedMin;
    return min != null
      ? `若达到至少 ${min} 条/只后仍持续躲藏、抢食或群游异常，停止继续增加数量并重新评估。`
      : '若达到最低群体要求后仍持续躲藏、抢食或群游异常，停止继续增加数量并重新评估。';
  }
  if (decision.status === 'caution' && (family === 'predation' || family === 'aggression' || family === 'territory')) {
    return mode === 'current_tank'
      ? '若出现持续追逐、受伤、拒食、长期躲藏或呼吸异常，立即分隔冲突个体并重新评估，不要继续按原组合观察等待。'
      : '若出现持续追逐、受伤、拒食、长期躲藏或呼吸异常，停止新增并分隔冲突个体后重新评估。';
  }
  return fallback || (mode === 'current_tank'
    ? '若出现持续追逐、受伤、拒食、长期躲藏或呼吸异常，立即分隔冲突个体并重新评估。'
    : '若出现持续追逐、受伤、拒食或呼吸异常，停止继续新增并重新评估。');
};

export const buildCompatibilityDecisionPlan = (
  decision: CompatibilityDecision,
  mode: CompatibilityAssessmentMode = 'planned_addition',
): CompatibilityDecisionPlan => {
  const action = buildBeginnerCompatibilityAction(decision, mode);
  const readable = buildCompatibilityReadableConclusion(decision, {}, mode);
  const fullyInformed = isCompatibilityDecisionFullyInformed(decision);

  if (fullyInformed && decision.status === 'insufficient_data') {
    throw new Error('compatibility_invariant_fully_informed_cannot_be_unknown');
  }

  const sourceRules = sourceRulesForPlan(decision);
  const specificActions = sourceRules
    .map(rule => specificActionFor(decision, rule, mode))
    .filter((step): step is string => Boolean(step));
  const specificCoverageComplete = specificActions.length > 0 && specificActions.length >= sourceRules.length;
  const nextSteps = unique(specificCoverageComplete
    ? specificActions
    : [
      ...specificActions,
      ...readable.howTo.filter(step => step !== action.observeAfterAction),
      action.immediateAction,
    ]).slice(0, 2);

  return {
    judgment: readable.judgment,
    verdict: action.verdict,
    fullyInformed,
    riskSummary: unique(readable.why).slice(0, 3),
    nextSteps,
    expectedAfterAdjustment: expectedOutcomeFor(decision, action.verdict, sourceRules),
    reviewCheckpoint: reviewCheckpointFor(decision, sourceRules, action.observeAfterAction),
    stopCondition: stopConditionForPlan(decision, mode, sourceRules, action.stopCondition),
    unknownReason: unknownReasonFor(decision),
    evidence: {
      authorityLevel: action.authorityLevel,
      sourceRuleCodes: action.sourceRuleCodes,
      evidenceIds: action.evidenceIds,
    },
  };
};
