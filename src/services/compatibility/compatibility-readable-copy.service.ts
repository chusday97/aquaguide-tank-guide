import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import {
  buildBeginnerCompatibilityAction,
  getCompatibilityRuleFamily,
  prioritizeDistinctCompatibilityRules,
  type CompatibilityAssessmentMode,
} from './compatibility-action.service';

type ReadableRule = {
  code: string;
  title?: string;
  evidence?: string;
};

export type CompatibilityReadableConclusion = {
  judgment: '可以养' | '有条件可以' | '不建议' | '暂时无法判断';
  why: string[];
  howTo: string[];
};

export type CompatibilityReadableAiNarrative = {
  reasons?: Array<{ text: string }>;
  adjustments?: Array<{ text: string }>;
};

const JUDGMENT: Record<CompatibilityDecision['status'], CompatibilityReadableConclusion['judgment']> = {
  compatible: '可以养',
  caution: '有条件可以',
  not_recommended: '不建议',
  insufficient_data: '暂时无法判断',
};

const forbiddenTechnicalPattern = /(?:\b(?:ruleCodes|evidenceIds|finalDecision|decisionReadiness|deterministic|domainStatus|provider|schema|model|compatibility)\b|sp_\d+|[a-z0-9]+_[a-z0-9_]+|https?:\/\/|\{[^}]*\}|\[[^\]]*\]|阻断性冲突|阻断规则|配对研究证据|基于物种特征的推断|高脆弱性)/i;
const actionablePattern = /(先|不要|暂停|减少|降低|增加|补足|补齐|调整|分隔|隔离|更换|确认|测|保持|准备|加入|观察|重新判断|重新评估|换缸)/;

const cleanText = (value: string) => (
  value
    .replace(/^\s*[-*•]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
);

export const isCompatibilityUserReadableText = (
  value: string,
  kind: 'reason' | 'action' = 'reason',
) => {
  const text = cleanText(value);
  const maxLength = kind === 'action' ? 64 : 56;
  if (text.length < 4 || text.length > maxLength) return false;
  if (forbiddenTechnicalPattern.test(text)) return false;
  if (kind === 'action' && !actionablePattern.test(text)) return false;
  return true;
};

const plainRuleText = (
  rule: ReadableRule,
  assessmentMode: CompatibilityAssessmentMode = 'planned_addition',
): string => {
  const code = rule.code;

  if (code === 'compatibility_clear') return '目前已审核的水体、温度、空间和行为条件里，没有发现明确冲突。';
  if (code.includes('water_type_conflict') || code === 'species_water_type_conflict') {
    return '这些生物需要的水体类型不同，长期放在同一缸不合适。';
  }
  if (code.includes('temperature') && (code.includes('conflict') || code.includes('no_overlap'))) {
    return '它们适合的长期水温没有安全重叠，勉强取中间值也不适合长期饲养。';
  }
  if (code === 'fry_predation_risk') {
    return '已审核资料明确记录该物种会取食鱼卵或鱼苗；鱼苗阶段不能按普通成鱼混养关系处理。';
  }
  if (code === 'predation_risk') {
    return '体型和捕食关系存在明显风险，较小的一方可能被追逐或吞食。';
  }
  if (code === 'predation_vulnerability_context') {
    return '这组里有更容易被追食或啄咬的一方，需要先确认实际捕食风险。';
  }
  if (code === 'fin_nipping_target_vulnerability') {
    return '一方有追鳍倾向，另一方的鳍型更容易受伤。';
  }
  if (code === 'fin_nipping_group_pressure') {
    return '追鳍物种数量不足时，更容易把骚扰压力转移到同缸其他生物。';
  }
  if (code === 'minimum_group_not_met' || code === 'group_requirement_gap') {
    return assessmentMode === 'current_tank'
      ? '这种生物需要成群生活，当前数量偏少。'
      : '这种生物需要成群生活，当前计划数量偏少。';
  }
  if (code === 'territorial_pressure_context' || code === 'territorial_conflict' || code === 'breeding_territory_active') {
    return '它们会争夺相近活动区域，守地或繁殖时更容易互相压迫。';
  }
  if (code === 'shared_bottom_zone_context') {
    return '它们会使用相近的底层活动区域，数量多时更容易互相挤压。';
  }
  if (code === 'ph_range_conflict') {
    return '它们适合的长期水质酸碱范围重叠不足。';
  }
  if (code === 'ph_range_edge_overlap') {
    return '它们能共同接受的水质范围很窄，长期维持的余量比较小。';
  }
  if (code === 'tank_length_below_species_minimum' || code === 'tank_volume_below_species_minimum') {
    return '按成体需求看，当前鱼缸的活动空间偏紧。';
  }
  if (code.includes('bioload')) {
    return '按当前总数量看，过滤和日常维护压力偏高。';
  }
  if (code === 'species_tank_required' || code === 'single_housing_required') {
    return '其中一方更适合单独饲养，不适合按普通混养方式处理。';
  }
  if (code === 'observed_emergency' || code === 'observed_intervention') {
    return '当前鱼缸已经出现需要优先处理的追逐、进食或应激异常。';
  }
  const factLabels: Record<string, string> = {
    water: '水体类型',
    temperature: '长期适温范围',
    ph: '长期酸碱范围',
    adult_size: '成体体型',
    tank_size: '最低空间需求',
    social_behavior: '社会行为',
    territoriality: '领地行为',
    predation: '捕食关系',
    breeding_behavior: '繁殖期行为',
  };
  if (code === 'species_review_pending') return '主要风险已经可以判断，但仍有资料待补充，本次按保守结论处理。';
  if (code === 'species_identity_unresolved') return '这个商品名或变体还不能可靠对应到明确物种。';
  if (code === 'species_public_evidence_insufficient') return '公开可靠资料不足以确认这个组合的一项关键风险。';
  if (code.startsWith('review_pending_')) {
    const fact = code.slice('review_pending_'.length);
    return `${factLabels[fact] || '一项资料'}仍在补充，本次按保守结论处理。`;
  }
  if (code.startsWith('public_evidence_') && code.endsWith('_insufficient')) {
    const fact = code.slice('public_evidence_'.length, -'_insufficient'.length);
    return `公开可靠资料仍不足以确认${factLabels[fact] || '这项关键风险'}。`;
  }
  if (code.startsWith('identity_') && code.endsWith('_unresolved')) return '物种身份还不能可靠确认，无法安全套用对应资料。';
  if (code.startsWith('required_fact_') && code.endsWith('_missing')) {
    const fact = code.slice('required_fact_'.length, -'_missing'.length);
    return `这个物种的${factLabels[fact] || '关键混养资料'}还没有达到可靠判断要求。`;
  }
  if (code === 'species_evidence_unreviewed') {
    return '其中有物种的关键混养资料还没有审核完整。';
  }
  if (code === 'tank_missing') return '还缺少当前鱼缸的基础信息。';
  if (code === 'tank_water_type_missing' || code === 'water_type_unknown' || code === 'candidate_water_type_missing') {
    return '还不能确认这组生物需要的水体类型是否一致。';
  }
  if (code === 'tank_temperature_missing' || code === 'temperature_range_missing') {
    return '还缺少可靠的长期水温信息。';
  }
  if (code === 'ph_range_missing') return '还缺少可靠的长期水质酸碱范围。';
  if (code === 'reviewed_pair_rule') {
    const evidence = cleanText(rule.evidence || rule.title || '');
    return isCompatibilityUserReadableText(evidence) ? evidence : '这组生物之间存在已经审核确认的混养风险。';
  }

  const evidence = cleanText(rule.evidence || rule.title || '');
  return isCompatibilityUserReadableText(evidence) ? evidence : '有一项已审核条件需要继续确认。';
};

const uniqueReadable = (values: string[], kind: 'reason' | 'action') => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const value = cleanText(raw);
    if (!isCompatibilityUserReadableText(value, kind) || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
};

const primaryRulesFor = (decision: CompatibilityDecision): ReadableRule[] => {
  if (decision.status === 'not_recommended') return prioritizeDistinctCompatibilityRules(decision.blockingRules);
  if (decision.status === 'caution') return prioritizeDistinctCompatibilityRules(decision.warningRules);
  if (decision.status === 'insufficient_data') return prioritizeDistinctCompatibilityRules(decision.missingData);
  return [
    { code: 'compatibility_clear', title: '当前没有发现明确混养冲突。' },
    ...prioritizeDistinctCompatibilityRules(decision.passedRules).filter(rule => rule.code !== 'compatibility_clear'),
  ];
};

const defaultReason = (
  decision: CompatibilityDecision,
  assessmentMode: CompatibilityAssessmentMode = 'planned_addition',
) => {
  if (decision.status === 'compatible') return '目前没有发现明确的混养冲突。';
  if (decision.status === 'caution') return assessmentMode === 'current_tank'
    ? '当前组合有可以处理的风险，需要先调整。'
    : '当前有可以处理的风险，调整后再加入会更稳妥。';
  if (decision.status === 'not_recommended') return '当前存在明确的混养风险。';
  return '关键资料还不够，暂时不能给出可靠结论。';
};

const ruleCodes = (decision: CompatibilityDecision) => new Set([
  ...(decision.metadata.domainRuleCodes || []),
  ...decision.blockingRules.map(rule => rule.code),
  ...decision.warningRules.map(rule => rule.code),
  ...decision.missingData.map(rule => rule.code),
]);

const blockingActionFor = (
  rule: ReadableRule,
  assessmentMode: CompatibilityAssessmentMode,
) => {
  const family = getCompatibilityRuleFamily(rule.code);
  if (assessmentMode === 'current_tank') {
    if (family === 'water_type') return '尽快分缸；分别按淡水或海水需求饲养。';
    if (rule.code === 'fry_predation_risk') return '把鱼苗转入育苗隔离区或独立育苗缸；不要依赖水草躲避来消除已知吞食风险。';
    if (family === 'predation') return '尽快分隔存在捕食关系的物种，并重新调整现有组合。';
    if (family === 'housing') return '按单养方案分开饲养，或重新调整现有组合。';
    if (family === 'temperature') return '不要硬取中间温度；分缸，或调整成温度需求更接近的组合。';
    if (family === 'aggression') return '先分隔持续冲突的物种，确认恢复稳定后再重新评估。';
    if (family === 'territory') return '增加遮挡和退让空间；如果持续压迫就分缸。';
    if (family === 'space') return '先减少现有数量或升级鱼缸空间，再重新评估。';
    return '先分隔或调整高风险组合，再重新判断当前鱼缸。';
  }
  if (family === 'water_type') return '不要放在同一缸；分别按淡水或海水需求饲养，或更换其中一种。';
  if (rule.code === 'fry_predation_risk') return '不要把鱼苗直接放入该组合；优先使用育苗隔离区或独立育苗缸，待脱离鱼苗阶段后再重新评估。';
  if (family === 'predation') return '不要直接混养；更换体型更接近、没有明显捕食关系的混养对象。';
  if (family === 'housing') return '按单养方案处理，或更换更适合混养的物种。';
  if (family === 'temperature') return '不要为了兼顾双方硬取中间温度；分缸，或更换温度需求更接近的物种。';
  if (family === 'aggression') return '不要直接混养；优先更换冲突物种，或先准备可靠分隔方案。';
  if (family === 'territory') return '先不要继续加入；重新规划领地和躲避空间，无法缓解就分缸。';
  if (family === 'space') return '先不要按当前方案加入；先减少数量或更换更合适的鱼缸方案。';
  return '先不要混养；更换其中一种或分缸后，再重新判断。';
};

const deterministicActionsFor = (
  decision: CompatibilityDecision,
  fallback: string,
  assessmentMode: CompatibilityAssessmentMode,
): string[] => {
  const codes = ruleCodes(decision);

  if (decision.status === 'not_recommended') {
    const actions = prioritizeDistinctCompatibilityRules(decision.blockingRules)
      .map(rule => blockingActionFor(rule, assessmentMode));
    return actions.length > 0 ? actions : [fallback];
  }

  if (decision.status === 'insufficient_data') {
    if (codes.has('species_identity_unresolved') || [...codes].some(code => code.startsWith('identity_') && code.endsWith('_unresolved'))) {
      return [assessmentMode === 'current_tank'
        ? '先确认准确物种或品系，再重新判断当前组合。'
        : '先确认准确物种或品系；身份没确认前不要按其他物种结论新增。'];
    }
    if (codes.has('species_public_evidence_insufficient') || [...codes].some(code => code.startsWith('public_evidence_') && code.endsWith('_insufficient'))) {
      return [assessmentMode === 'current_tank'
        ? '现有可靠公开资料不足；先维持谨慎观察，不要据此扩大当前组合。'
        : '这不是你少填了资料；可靠公开证据不足，先不要据此新增。'];
    }
    if ([...codes].some(code => code.startsWith('required_fact_') && code.endsWith('_missing'))) {
      return [assessmentMode === 'current_tank'
        ? '先补齐缺失的物种核心资料，再重新判断当前组合。'
        : '先不要加入；补齐缺失的物种核心资料后再重新判断。'];
    }
    if (codes.has('species_evidence_unreviewed')) {
      return [assessmentMode === 'current_tank'
        ? '等关键混养资料审核完整后，再重新判断当前组合是否需要调整。'
        : '先不要加入；等关键混养资料审核完整后再重新判断。'];
    }
    if (codes.has('tank_water_type_missing') || codes.has('water_type_unknown') || codes.has('candidate_water_type_missing')) {
      return ['先确认双方需要的水体类型，再重新判断是否适合同缸。'];
    }
    if (codes.has('tank_temperature_missing') || codes.has('temperature_range_missing')) {
      return ['先补充当前稳定水温和物种适温范围，再重新判断。'];
    }
    return [assessmentMode === 'current_tank'
      ? '先补齐缺失信息，再重新判断当前组合是否需要调整。'
      : '先不要加入；补齐缺失信息后再重新判断。'];
  }

  return [fallback];
};

export const buildCompatibilityReadableConclusion = (
  decision: CompatibilityDecision,
  aiNarrative: CompatibilityReadableAiNarrative = {},
  assessmentMode: CompatibilityAssessmentMode = 'planned_addition',
): CompatibilityReadableConclusion => {
  const action = buildBeginnerCompatibilityAction(decision, assessmentMode);
  const deterministicWhy = primaryRulesFor(decision).map(rule => plainRuleText(rule, assessmentMode));
  const aiWhy = (aiNarrative.reasons || []).map(item => item.text);
  const why = uniqueReadable(
    decision.status === 'compatible'
      ? [deterministicWhy[0] || action.primaryReason || defaultReason(decision, assessmentMode), ...aiWhy, ...deterministicWhy.slice(1)]
      : [...deterministicWhy, ...aiWhy, action.primaryReason || defaultReason(decision, assessmentMode)],
    'reason',
  ).slice(0, 2);

  const aiActions = decision.status === 'compatible'
    ? []
    : (aiNarrative.adjustments || []).map(item => item.text);
  const deterministicActions = deterministicActionsFor(decision, action.immediateAction, assessmentMode);
  const howTo = uniqueReadable([
    ...deterministicActions,
    ...aiActions,
    ...(action.observeAfterAction ? [action.observeAfterAction] : []),
  ], 'action').slice(0, 2);

  return {
    judgment: JUDGMENT[decision.status],
    why: why.length > 0 ? why : [defaultReason(decision, assessmentMode)],
    howTo: howTo.length > 0 ? howTo : ['先保持当前方案不变，补齐信息后再重新判断。'],
  };
};
