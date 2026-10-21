import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import {
  buildBeginnerCompatibilityAction,
  getCompatibilityRuleFamily,
  getExplicitCompatibilityGroupMinimum,
  getExplicitCompatibilitySpaceThreshold,
  prioritizeDistinctCompatibilityRules,
  type CompatibilityAssessmentMode,
} from './compatibility-action.service';
import { COMPATIBILITY_STATUS_LABELS, type CompatibilityChineseStatusLabel } from './compatibility-status-label.service';

type ReadableRule = {
  code: string;
  title?: string;
  evidence?: string;
};

export type CompatibilityReadableConclusion = {
  judgment: CompatibilityChineseStatusLabel;
  why: string[];
  howTo: string[];
};

export type CompatibilityReadableAiNarrative = {
  reasons?: Array<{ text: string }>;
  adjustments?: Array<{ text: string }>;
};

const forbiddenTechnicalPattern = /(?:\b(?:ruleCodes|evidenceIds|finalDecision|decisionReadiness|deterministic|domainStatus|provider|schema|model|compatibility)\b|sp_\d+|[a-z0-9]+_[a-z0-9_]+|https?:\/\/|\{[^}]*\}|\[[^\]]*\]|阻断性冲突|阻断规则|配对研究证据|基于物种特征的推断|高脆弱性)/i;
const actionablePattern = /(先|不要|暂停|减少|降低|增加|补足|补齐|调整|分隔|分缸|分开|隔离|更换|确认|测|保持|准备|加入|观察|重新判断|重新评估|换缸)/;

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

export const getCompatibilityReadableRuleText = (
  rule: ReadableRule,
  assessmentMode: CompatibilityAssessmentMode = 'planned_addition',
): string => {
  const code = rule.code;

  if (code === 'compatibility_clear') return '目前已审核的水体、温度、空间和行为条件里，没有发现明确冲突。';
  if (code.includes('water_type_conflict') || code === 'species_water_type_conflict') {
    return '这些生物需要的水体类型不同，长期放在同一缸不合适。';
  }
  if (code === 'tank_temperature_conflict') {
    return '当前鱼缸目标温度不在其中一方的已审核适温范围内；需要先调整目标温度，并确认仍与其余物种有共同适温区间。';
  }
  if (code === 'temperature_range_conflict' || code === 'temperature_no_overlap') {
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
  if (code === 'tank_ph_conflict') {
    return '你记录的 pH 不在至少一种生物的已审核长期适宜范围内，先复测确认稳定值。';
  }
  if (code === 'length_too_short' || code === 'tank_length_below_species_minimum' || code === 'tank_volume_below_species_minimum') {
    const threshold = getExplicitCompatibilitySpaceThreshold([rule]);
    if (threshold) return `当前空间不足；按成体需求至少需要 ${threshold}。`;
    if (code === 'length_too_short') return cleanText(rule.evidence || '当前缸长低于该物种的最低建议。');
    return '按成体需求看，当前鱼缸的活动空间偏紧。';
  }
  if (code === 'bioload_ok') return '按当前数量估算，生物负荷没有超过当前筛查阈值。';
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
  if (code === 'species_evidence_ceiling') return '部分风险缺少足够直接的公开证据；这不等于安全，本次按保守条件继续判断。';
  if (code === 'pair_identity_evidence_ceiling') return '这组商品名或品系的身份资料已达到当前公开证据上限，不能安全套用近似对象。';
  if (code === 'pair_risk_evidence_ceiling') return '这组配对的一项关键风险缺少足够直接的公开证据；不能把缺证据当作没有风险。';
  if (code.startsWith('review_pending_')) {
    const fact = code.slice('review_pending_'.length);
    return `${factLabels[fact] || '一项资料'}仍在补充，本次按保守结论处理。`;
  }
  if (code.startsWith('evidence_ceiling_')) {
    const fact = code.slice('evidence_ceiling_'.length);
    return `${factLabels[fact] || '一项风险'}没有足够直接的公开证据；不能当作“没有风险”，本次按保守条件处理。`;
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
  if (code === 'species_evidence_unreviewed' || code === 'behavior_evidence_unreviewed') {
    return '其中有物种的关键混养资料还没有完成可靠审核。';
  }
  if (code === 'missing_ph') return '未记录 pH 不会单独卡住普通混养判断；仅在水质敏感或边界风险时建议补测复核。';
  if (code === 'missing_hardness') return '未记录 GH / 硬度不会单独卡住普通混养判断；仅在硬度敏感时建议补测复核。';
  if (code === 'missing_filter') return '未记录过滤设备不会单独卡住混养判断；如果后续涉及负荷或维护压力，再补充过滤情况即可。';
  if (code === 'missing_heater') return '未记录加热设备不会单独卡住混养判断；如果需要稳定特定温区，再确认是否具备控温条件。';
  if (code === 'tank_missing') return '还缺少当前鱼缸的基础信息。';
  if (code === 'tank_water_type_missing' || code === 'water_type_unknown' || code === 'candidate_water_type_missing') {
    return '还不能确认这组生物需要的水体类型是否一致。';
  }
  if (code === 'tank_temperature_missing' || code === 'temperature_range_missing') {
    return '还缺少可靠的长期水温信息。';
  }
  if (code === 'ph_range_missing') return '还缺少可靠的长期水质酸碱范围。';
  if (code.startsWith('pair_rule_')) {
    if (code.includes('fin_nipping') || code.includes('long_fin')) {
      return '一方有明确追鳍倾向，另一方是长鳍或慢游类型，持续追咬和鳍损风险较高。';
    }
    if (code.includes('predation') || code.includes('prey')) {
      return '这组生物之间已有直接审核的捕食风险依据，不适合按普通混养处理。';
    }
    if (code.includes('territor') || code.includes('aggression') || code.includes('behavior')) {
      return '这组生物之间已有直接审核的攻击或领地冲突依据，持续追逐风险较高。';
    }
    if (code.includes('group_size') || code.includes('school')) {
      return '这组生物可以共享部分环境条件，但群体数量和长期稳定性需要先满足。';
    }
    const evidence = cleanText(rule.evidence || rule.title || '');
    return isCompatibilityUserReadableText(evidence) ? evidence : '这组生物之间存在已经审核确认的直接混养风险。';
  }
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
  return [{ code: 'compatibility_clear', title: '当前没有发现明确混养冲突。' }];
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
  const isCombinedBehaviorTerritoryConflict = rule.code.startsWith('pair_rule_')
    && rule.code.includes('behavior')
    && rule.code.includes('territor');
  if (assessmentMode === 'current_tank') {
    if (isCombinedBehaviorTerritoryConflict) {
      return '尽快分隔持续追逐或领地冲突的物种；不要把增加躲避物当作消除已知行为冲突的保证。';
    }
    if (family === 'water_type') return '尽快分缸；分别按淡水或海水需求饲养。';
    if (rule.code === 'fry_predation_risk') return '把鱼苗转入育苗隔离区或独立育苗缸；不要依赖水草躲避来消除已知吞食风险。';
    if (family === 'predation') return '尽快分隔存在捕食关系的物种，并重新调整现有组合。';
    if (family === 'housing') return '按单养方案分开饲养，或重新调整现有组合。';
    if (rule.code === 'tank_temperature_conflict') return '先把鱼缸目标温度调整到相关物种的已审核适温范围，并确认与其余物种仍有共同区间，再重新评估。';
    if (family === 'temperature') return '不要硬取中间温度；分缸，或调整成温度需求更接近的组合。';
    if (family === 'aggression') return '先分隔持续冲突的物种，确认恢复稳定后再重新评估。';
    if (family === 'territory') return '增加遮挡和退让空间；如果持续压迫就分缸。';
    if (family === 'space') {
      const threshold = getExplicitCompatibilitySpaceThreshold([rule]);
      return threshold
        ? `当前空间至少需要 ${threshold}；未满足前先减少数量或保持分隔，再重新评估。`
        : '先减少现有数量或补足该物种的最低空间条件，再重新评估。';
    }
    return '先分隔或调整高风险组合，再重新判断当前鱼缸。';
  }
  if (isCombinedBehaviorTerritoryConflict) {
    return '不要直接混养；优先更换组合或准备可靠分隔，不要把增加躲避物当作消除持续追逐和领地冲突的保证。';
  }
  if (family === 'water_type') return '不要放在同一缸；分别按淡水或海水需求饲养，或更换其中一种。';
  if (rule.code === 'fry_predation_risk') return '不要把鱼苗直接放入该组合；优先使用育苗隔离区或独立育苗缸，待脱离鱼苗阶段后再重新评估。';
  if (family === 'predation') return '不要直接混养；更换体型更接近、没有明显捕食关系的混养对象。';
  if (family === 'housing') return '按单养方案处理，或更换更适合混养的物种。';
  if (rule.code === 'tank_temperature_conflict') return '先调整鱼缸目标温度到相关物种的已审核适温范围，并确认与现有物种仍有共同区间，再重新判断。';
  if (family === 'temperature') return '不要为了兼顾双方硬取中间温度；分缸，或更换温度需求更接近的物种。';
  if (family === 'aggression') return '不要直接混养；优先更换冲突物种，或先准备可靠分隔方案。';
  if (family === 'territory') return '先不要继续加入；重新规划领地和躲避空间，无法缓解就分缸。';
  if (family === 'space') {
    const threshold = getExplicitCompatibilitySpaceThreshold([rule]);
    return threshold
      ? `至少满足 ${threshold}后再重新评估；未达到前不要按当前方案混养。`
      : '先不要按当前方案加入；先满足该物种的最低空间条件。';
  }
  return '先不要混养；更换其中一种或分缸后，再重新判断。';
};

const cautionSecondaryActionFor = (
  rule: ReadableRule,
  assessmentMode: CompatibilityAssessmentMode,
): string | null => {
  const family = getCompatibilityRuleFamily(rule.code);
  if (family === 'space') {
    const threshold = getExplicitCompatibilitySpaceThreshold([rule]);
    return threshold
      ? (assessmentMode === 'current_tank'
        ? `当前空间至少需要 ${threshold}；未满足前不要继续增加数量。`
        : `至少满足 ${threshold} 后再考虑加入。`)
      : (assessmentMode === 'current_tank'
        ? '先满足该物种的最低空间条件，再继续增加数量。'
        : '先满足该物种的最低空间条件，再考虑加入。');
  }
  if (family === 'group_size') {
    const minimum = getExplicitCompatibilityGroupMinimum([rule]);
    return minimum != null
      ? `先把该物种数量补到至少 ${minimum} 条/只，再重新评估。`
      : '先满足该物种的最低群体数量，再重新评估。';
  }
  if (family === 'temperature') return '先确认并调整到双方可长期维持的共同适温区间，再重新评估。';
  if (family === 'ph') return '先确认双方有可长期维持的共同 pH 区间；只有水质敏感或边界风险时再补测稳定 pH。';
  if (family === 'bioload') return '先降低新增数量或总负荷，并确认过滤与维护能稳定承受。';
  if (family === 'territory') return '先补足遮挡和退让空间；仍持续压迫就分隔。';
  if (family === 'aggression') return '先避免直接加入容易被追咬的一方，并准备可立即分隔的方案。';
  if (family === 'predation') return '先避免明显体型悬殊或可入口的组合，并准备可立即分隔的方案。';
  return null;
};

const deterministicActionsFor = (
  decision: CompatibilityDecision,
  fallback: string,
  assessmentMode: CompatibilityAssessmentMode,
): string[] => {
  const codes = ruleCodes(decision);

  if (decision.status === 'not_recommended') {
    const primaryBlockingRules = prioritizeDistinctCompatibilityRules(decision.blockingRules);
    const hasNonSpaceBlocker = primaryBlockingRules.some(rule => getCompatibilityRuleFamily(rule.code) !== 'space');
    const combinedSpaceThreshold = getExplicitCompatibilitySpaceThreshold(
      [...decision.blockingRules, ...decision.warningRules]
        .filter(rule => getCompatibilityRuleFamily(rule.code) === 'space'),
    );
    const actions = primaryBlockingRules.map(rule => {
      if (getCompatibilityRuleFamily(rule.code) === 'space' && combinedSpaceThreshold) {
        if (assessmentMode === 'current_tank') {
          return hasNonSpaceBlocker
            ? `先确认该物种至少有 ${combinedSpaceThreshold}；满足空间也仍需处理其他冲突。`
            : `当前空间至少需要 ${combinedSpaceThreshold}；未满足前先保持分隔，再重新评估。`;
        }
        return hasNonSpaceBlocker
          ? `先按该物种至少 ${combinedSpaceThreshold}准备；这仍不能解决上述混养冲突。`
          : `至少满足 ${combinedSpaceThreshold}后再重新评估；未达到前不要按当前方案混养。`;
      }
      return blockingActionFor(rule, assessmentMode);
    });
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
    if (codes.has('species_evidence_unreviewed') || codes.has('behavior_evidence_unreviewed')) {
      return [assessmentMode === 'current_tank'
        ? '这不是你少填了信息；等关键混养资料完成可靠审核后，再重新判断当前组合。'
        : '这不是你少填了信息；先不要加入，等关键混养资料完成可靠审核后再判断。'];
    }
    if (codes.has('tank_volume_missing') || codes.has('missing_tank_volume') || codes.has('missing_volume')) {
      return [assessmentMode === 'current_tank'
        ? '告诉我鱼缸大致长宽高，或实际水体容量，就可以重新判断当前组合。'
        : '告诉我鱼缸大致长宽高，或实际水体容量，就可以继续判断是否适合加入。'];
    }
    if (codes.has('tank_water_type_missing') || codes.has('water_type_unknown') || codes.has('candidate_water_type_missing')) {
      return ['先确认双方需要的水体类型，再重新判断是否适合同缸。'];
    }
    if (codes.has('tank_temperature_missing')) {
      return ['告诉我当前大致水温或目标水温；不知道具体数值时写“室温/常温”也可以，再重新判断。'];
    }
    if (codes.has('temperature_range_missing')) {
      return [assessmentMode === 'current_tank'
        ? '这不是你少填了信息；当前物种缺少可靠的长期适温范围，等资料补齐并审核后再重新判断当前组合。'
        : '这不是你少填了信息；当前物种缺少可靠的长期适温范围，等资料补齐并审核后再判断是否适合加入。'];
    }
    return [assessmentMode === 'current_tank'
      ? '这不是你少填了信息；当前系统资料未完成可靠审核，审核完成后再重新判断当前组合。'
      : '这不是你少填了信息；当前系统资料未完成可靠审核，先不要加入。'];
  }

  if (decision.status === 'caution' && codes.has('predation_scope_uncertain')) {
    return [assessmentMode === 'current_tank'
      ? '已确认存在食鱼行为，但猎物尺寸边界未明确；先避免明显体型悬殊，并准备出现追捕或吞咬时立即分隔。'
      : '先不要把明显更小、能入口的鱼直接加入；先核对双方成体体型和口裂，并准备可立即分隔的方案。'];
  }

  if (decision.status === 'caution') {
    const primaryWarningRules = prioritizeDistinctCompatibilityRules(decision.warningRules);
    const primaryWarning = primaryWarningRules[0];
    const combinedSpaceThreshold = getExplicitCompatibilitySpaceThreshold(
      decision.warningRules.filter(rule => getCompatibilityRuleFamily(rule.code) === 'space'),
    );
    const primaryAction = primaryWarning
      && getCompatibilityRuleFamily(primaryWarning.code) === 'space'
      && combinedSpaceThreshold
      ? (assessmentMode === 'current_tank'
        ? `当前空间至少需要 ${combinedSpaceThreshold}；未满足前先减少现有数量或保持分隔，再重新评估。`
        : `至少满足 ${combinedSpaceThreshold}后再考虑加入。`)
      : fallback;
    const secondaryActions = primaryWarningRules
      .slice(1)
      .map(rule => cautionSecondaryActionFor(rule, assessmentMode))
      .filter((step): step is string => Boolean(step));
    return [primaryAction, ...secondaryActions];
  }

  return [fallback];
};

export const buildCompatibilityReadableConclusion = (
  decision: CompatibilityDecision,
  aiNarrative: CompatibilityReadableAiNarrative = {},
  assessmentMode: CompatibilityAssessmentMode = 'planned_addition',
): CompatibilityReadableConclusion => {
  const action = buildBeginnerCompatibilityAction(decision, assessmentMode);
  const primaryRules = primaryRulesFor(decision);
  const combinedSpaceThreshold = getExplicitCompatibilitySpaceThreshold(
    [...decision.blockingRules, ...decision.warningRules]
      .filter(rule => getCompatibilityRuleFamily(rule.code) === 'space'),
  );
  const deterministicWhy = primaryRules.map(rule => (
    getCompatibilityRuleFamily(rule.code) === 'space' && combinedSpaceThreshold
      ? `当前空间不足；按成体需求至少需要 ${combinedSpaceThreshold}。`
      : getCompatibilityReadableRuleText(rule, assessmentMode)
  ));
  const aiWhy = (aiNarrative.reasons || []).map(item => item.text);
  const whySeed = decision.status === 'compatible'
    ? [deterministicWhy[0] || action.primaryReason || defaultReason(decision, assessmentMode), ...aiWhy]
    : deterministicWhy.length > 0 || aiWhy.length > 0
      ? [...deterministicWhy, ...aiWhy]
      : [action.primaryReason || defaultReason(decision, assessmentMode)];
  const why = uniqueReadable(whySeed, 'reason').slice(0, 2);

  const aiActions = decision.status === 'compatible'
    ? []
    : (aiNarrative.adjustments || []).map(item => item.text);
  const deterministicActions = deterministicActionsFor(decision, action.immediateAction, assessmentMode);
  const howTo = uniqueReadable([
    ...deterministicActions,
    ...aiActions,
    ...(decision.status === 'compatible' && action.observeAfterAction ? [action.observeAfterAction] : []),
  ], 'action').slice(0, 2);

  return {
    judgment: COMPATIBILITY_STATUS_LABELS.zh[decision.status],
    why: why.length > 0 ? why : [defaultReason(decision, assessmentMode)],
    howTo: howTo.length > 0 ? howTo : ['先保持当前方案不变，补齐信息后再重新判断。'],
  };
};
