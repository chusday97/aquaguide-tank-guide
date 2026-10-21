import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import {
  buildBeginnerCompatibilityAction,
  getExplicitCompatibilityGroupMinimum,
  getExplicitCompatibilitySpaceThreshold,
  getCompatibilityRuleFamily,
  prioritizeDistinctCompatibilityRules,
  type BeginnerCompatibilityVerdict,
  type CompatibilityActionAuthorityLevel,
  type CompatibilityAssessmentMode,
} from './compatibility-action.service';
import { buildCompatibilityReadableConclusion } from './compatibility-readable-copy.service';
import type { CompatibilityChineseStatusLabel } from './compatibility-status-label.service';
import type { TankCompatibilityResult, TankCompatibilityRule } from './compatibility.service';

export type CompatibilityUnknownReason =
  | 'missing_user_input'
  | 'unresolved_identity'
  | 'public_evidence_insufficient'
  | 'missing_species_fact'
  | 'system_gap'
  | null;

export type CompatibilityResolutionMode =
  | 'deterministic_clearance'
  | 'parameter_recheck'
  | 'behavioral_recheck'
  | 'information_required';

export type CompatibilityResolutionTarget = {
  riskFamily: string;
  resolutionMode: CompatibilityResolutionMode;
  criterion: string;
  sourceRuleCode: string;
  speciesIds: string[];
};

export type CompatibilityActionSequenceState = 'current' | 'next' | 'deferred';

export type CompatibilityActionSequenceStep = {
  order: number;
  state: CompatibilityActionSequenceState;
  riskFamily: string;
  action: string;
  sourceRuleCode: string;
  resolutionTarget: CompatibilityResolutionTarget;
  blockedByHardStop: boolean;
};

export type CompatibilityDecisionPlan = {
  judgment: CompatibilityChineseStatusLabel;
  verdict: BeginnerCompatibilityVerdict;
  fullyInformed: boolean;
  riskSummary: string[];
  nextSteps: string[];
  expectedAfterAdjustment: string;
  reviewCheckpoint: string;
  stopCondition: string;
  unknownReason: CompatibilityUnknownReason;
  /**
   * Machine-readable criteria for deciding whether the surfaced risk has
   * actually been removed or still requires a parameter/behavior recheck.
   * This is advisory metadata only and never changes deterministic authority.
   */
  resolutionTargets: CompatibilityResolutionTarget[];
  actionSequence: CompatibilityActionSequenceStep[];
  evidence: {
    authorityLevel: CompatibilityActionAuthorityLevel;
    sourceRuleCodes: string[];
    evidenceIds: string[];
  };
};

const unique = (values: Array<string | null | undefined>) => Array.from(new Set(
  values.map(value => value?.trim()).filter((value): value is string => Boolean(value)),
));

type CompatibilityUnknownReasonInput = Pick<TankCompatibilityResult,
  'status' | 'metadata' | 'blockingRules' | 'warningRules' | 'missingData'
>;

const decisionCodes = (decision: CompatibilityUnknownReasonInput) => new Set([
  ...(decision.metadata.domainRuleCodes || []),
  ...decision.blockingRules.map(rule => rule.code),
  ...decision.warningRules.map(rule => rule.code),
  ...decision.missingData.map(rule => rule.code),
]);

export const isCompatibilityDecisionFullyInformed = (decision: CompatibilityDecision) => (
  decision.metadata.decisionReadiness === 'reviewed'
  && decision.missingData.length === 0
);

const MISSING_USER_INPUT_CODES = new Set([
  'candidate_missing',
  'missing_candidate_species',
  'missing_species_pair',
  'empty_tank_no_existing_species',
  'tank_missing',
  'missing_tank',
  'tank_water_type_missing',
  'missing_tank_water_type',
  'tank_volume_missing',
  'missing_tank_volume',
  'tank_temperature_missing',
  'missing_tank_temperature',
]);

const MISSING_SPECIES_FACT_CODES = new Set([
  'species_evidence_unreviewed',
  'species_review_pending',
  'candidate_water_type_missing',
  'water_type_unknown',
  'temperature_range_missing',
  'ph_range_missing',
  'species_temperature_missing',
  'species_ph_missing',
  'behavior_evidence_unreviewed',
]);

const isIdentityLimitationCode = (code: string) => (
  code === 'species_identity_unresolved'
  || code === 'pair_identity_evidence_ceiling'
  || (code.startsWith('identity_') && code.endsWith('_unresolved'))
);

const isPublicEvidenceLimitationCode = (code: string) => (
  code === 'species_public_evidence_insufficient'
  || code === 'species_evidence_ceiling'
  || code === 'pair_risk_evidence_ceiling'
  || (code.startsWith('public_evidence_') && code.endsWith('_insufficient'))
  || code.startsWith('evidence_ceiling_')
);

const isMissingSpeciesFactCode = (code: string) => (
  MISSING_SPECIES_FACT_CODES.has(code)
  || code.startsWith('review_pending_')
  || (code.startsWith('required_fact_') && code.endsWith('_missing'))
  || (code.startsWith('species_') && code.endsWith('_missing'))
  || code.endsWith('_evidence_unreviewed')
);

export const getCompatibilityDataLimitationCodes = (decision: CompatibilityUnknownReasonInput): string[] => {
  const codes = [...decisionCodes(decision)];
  return codes.filter(code => (
    isIdentityLimitationCode(code)
    || isPublicEvidenceLimitationCode(code)
    || MISSING_USER_INPUT_CODES.has(code)
    || isMissingSpeciesFactCode(code)
  ));
};

export const getCompatibilityDataLimitationReason = (decision: CompatibilityUnknownReasonInput): CompatibilityUnknownReason => {
  const codes = getCompatibilityDataLimitationCodes(decision);
  if (codes.some(isIdentityLimitationCode)) return 'unresolved_identity';
  if (codes.some(isPublicEvidenceLimitationCode)) return 'public_evidence_insufficient';
  if (codes.some(code => MISSING_USER_INPUT_CODES.has(code))) return 'missing_user_input';
  if (codes.some(isMissingSpeciesFactCode)) return 'missing_species_fact';
  if (decision.status === 'insufficient_data' || decision.missingData.length > 0) return 'system_gap';
  return null;
};

export const getCompatibilityUnknownReason = (decision: CompatibilityUnknownReasonInput): CompatibilityUnknownReason => (
  decision.status === 'insufficient_data'
    ? getCompatibilityDataLimitationReason(decision)
    : null
);

const sourceRulesForPlan = (decision: CompatibilityDecision): TankCompatibilityRule[] => {
  if (decision.status === 'not_recommended') return prioritizeDistinctCompatibilityRules(decision.blockingRules).slice(0, 2);
  if (decision.status === 'caution') return prioritizeDistinctCompatibilityRules(decision.warningRules).slice(0, 2);
  if (decision.status === 'insufficient_data') return prioritizeDistinctCompatibilityRules(decision.missingData).slice(0, 2);
  // A compatible decision has no remediation source rules. Feeding passed
  // rules into the action planner can turn a positive water/temperature
  // check into conflict wording such as "不要加入" or "分缸".
  return [];
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
  if (id) return items.get(id);

  // Tank-level rules do not always carry affectedSpeciesIds. A single
  // candidate (or a single assessed species) is safe to name; multiple items
  // remain intentionally unresolved so presentation never guesses the subject.
  const candidates = (decision.assessmentItems || []).filter(item => item.origin === 'candidate');
  if (candidates.length === 1) return candidates[0];
  if ((decision.assessmentItems || []).length === 1) return decision.assessmentItems?.[0];
  return undefined;
};

const pairContextFor = (decision: CompatibilityDecision, family: string, mode: CompatibilityAssessmentMode) => {
  const items = itemMapFor(decision);
  const pairs = [...pairsForFamily(decision, family)].sort((a, b) => {
    const aKey = [a.speciesA.id, a.speciesB.id].sort().join('::');
    const bKey = [b.speciesA.id, b.speciesB.id].sort().join('::');
    return aKey.localeCompare(bKey, 'en');
  });
  const preferred = mode === 'planned_addition'
    ? pairs.find(pair => {
      const a = items.get(pair.speciesA.id)?.origin;
      const b = items.get(pair.speciesB.id)?.origin;
      return (a === 'candidate' && b === 'existing') || (a === 'existing' && b === 'candidate');
    }) || pairs[0]
    : pairs[0];
  if (!preferred) return null;

  const members = [preferred.speciesA, preferred.speciesB]
    .sort((a, b) => a.id.localeCompare(b.id, 'en'));
  const candidateMembers = members.filter(member => items.get(member.id)?.origin === 'candidate');
  const candidateMember = candidateMembers[0];
  const candidate = candidateMember ? items.get(candidateMember.id) : undefined;
  const other = candidateMember
    ? members.find(member => member.id !== candidateMember.id) || members[0]
    : members[0];

  return {
    pairLabel: `${members[0].name} 与 ${members[1].name}`,
    candidate,
    otherName: other.name,
    speciesIds: members.map(member => member.id),
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
  const min = family === 'group_size'
    ? (getExplicitCompatibilityGroupMinimum([rule]) ?? decision.stockingGuidance?.recommendedMin)
    : decision.stockingGuidance?.recommendedMin;

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

  if (family === 'space') {
    const threshold = getExplicitCompatibilitySpaceThreshold([rule]);
    if (mode === 'current_tank') {
      return threshold
        ? `把当前鱼缸调整到至少 ${threshold}，再重新评估空间风险是否已经解除。`
        : '先减少现有数量或升级鱼缸空间，再重新评估。';
    }
    return threshold
      ? `至少需要 ${threshold}再考虑加入。`
      : '先按成体需求核对最低缸长或水体要求；当前空间达不到要求时不要加入。';
  }

  if (family === 'territory' && decision.status === 'not_recommended') {
    if (mode === 'planned_addition') {
      return pair?.candidate
        ? `不要加入 ${pair.candidate.name}；它与 ${pair.otherName} 存在明确领地冲突，应分隔或更换组合后再重新评估。`
        : '当前存在明确领地冲突；不要继续执行这组混养计划，应先分隔或更换冲突组合后再重新评估。';
    }
    return pair
      ? `${pair.pairLabel} 存在明确领地冲突；先分隔冲突个体或调整组合，再重新评估，不要只靠增加遮挡继续观察。`
      : '当前存在明确领地冲突；先分隔冲突个体或调整组合，再重新评估。';
  }

  if (family === 'ph' && decision.status === 'not_recommended' && rule.code === 'ph_range_conflict') {
    return pair
      ? `${pair.pairLabel} 没有可长期维持的共同 pH 区间；应分缸或更换组合，不要用折中 pH 强行混养。`
      : '当前组合没有可长期维持的共同 pH 区间；应分缸或更换组合。';
  }

  if (family === 'aggression' && decision.status === 'caution') {
    if (mode === 'planned_addition' && pair?.candidate) {
      return `加入 ${pair.candidate.name} 前，先为它与 ${pair.otherName} 增加遮挡和退让路线，并准备可立即分隔的方案；重新评估后再决定是否加入。`;
    }
    if (mode === 'current_tank' && pair) {
      return `先为 ${pair.pairLabel} 增加遮挡和退让路线，并复查追逐、破鳍、躲藏和进食；出现持续异常就分隔。`;
    }
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

const missingInputActionFor = (
  decision: CompatibilityDecision,
  rule: TankCompatibilityRule,
): string => {
  const family = getCompatibilityRuleFamily(rule.code);

  if (family === 'space') {
    const threshold = getExplicitCompatibilitySpaceThreshold([
      ...decision.blockingRules,
      ...decision.warningRules,
    ]);
    if (threshold?.includes('cm 缸长')) {
      return `请先填写鱼缸长度；当前组合涉及已审核的 ${threshold} 条件，填写后再重新评估。`;
    }
    if (threshold?.includes('L 水体')) {
      return `请先补齐鱼缸尺寸或实际水体容量；当前组合涉及已审核的 ${threshold} 条件，填写后再重新评估。`;
    }
    return '请先补齐鱼缸尺寸或实际水体容量，再重新评估空间是否满足要求。';
  }

  if (family === 'temperature') {
    return '请先填写当前或目标水温，再重新评估；缺少水温本身不等于物种之间没有共同适温区间。';
  }
  if (family === 'water_type') {
    return '请先确认当前鱼缸是淡水还是海水，再重新评估。';
  }
  if (family === 'ph') {
    return '请先测量并填写当前稳定 pH，再重新评估。';
  }
  if (family === 'hardness') {
    return '请先测量并填写当前硬度，再重新评估。';
  }

  return '请先补齐这次判断真正缺少的关键信息，再重新运行混养判断。';
};

const uniqueSpeciesIds = (values: Array<string | null | undefined>) => Array.from(new Set(
  values.filter((value): value is string => Boolean(value)),
));

const targetSpeciesIdsFor = (
  decision: CompatibilityDecision,
  rule: TankCompatibilityRule,
  mode: CompatibilityAssessmentMode,
) => {
  const family = getCompatibilityRuleFamily(rule.code);
  const pair = pairContextFor(decision, family, mode);
  const namedItem = namedItemForFamily(decision, family);
  const directSpeciesIds = uniqueSpeciesIds([
    ...(rule.affectedSpeciesIds || []),
    namedItem?.speciesId,
  ]);

  // Housing and group-size rules describe a single species requirement.
  // Pair context is useful for the user-facing sentence, but adding the
  // counterpart species to a machine-readable resolution target makes
  // downstream rechecks act on the wrong subject.
  if (family === 'housing' || family === 'group_size') return directSpeciesIds;

  // Bioload is a whole-tank condition rather than a species-scoped target.
  if (family === 'bioload') return [];

  return uniqueSpeciesIds([
    ...(pair?.speciesIds || []),
    ...directSpeciesIds,
  ]);
};

const resolutionTargetFor = (
  decision: CompatibilityDecision,
  rule: TankCompatibilityRule,
  mode: CompatibilityAssessmentMode,
): CompatibilityResolutionTarget => {
  const family = getCompatibilityRuleFamily(rule.code);
  const pair = pairContextFor(decision, family, mode);
  const namedItem = namedItemForFamily(decision, family);
  const minimumGroupSize = family === 'group_size'
    ? (getExplicitCompatibilityGroupMinimum([rule]) ?? decision.stockingGuidance?.recommendedMin)
    : decision.stockingGuidance?.recommendedMin;
  const speciesIds = targetSpeciesIdsFor(decision, rule, mode);

  const target = (
    resolutionMode: CompatibilityResolutionMode,
    criterion: string,
  ): CompatibilityResolutionTarget => ({
    riskFamily: family,
    resolutionMode,
    criterion,
    sourceRuleCode: rule.code,
    speciesIds,
  });

  if (decision.status === 'insufficient_data' || family === 'missing_information') {
    return target(
      'information_required',
      '补齐对应身份、公开证据、物种核心事实或鱼缸输入后重新运行混养判断；新结论生成前不得把风险视为已解除。',
    );
  }

  if (family === 'water_type') {
    return target(
      'deterministic_clearance',
      pair
        ? `${pair.pairLabel} 不再共享同一水体（分缸或替换其中一方），且重新评估后不再出现 water_type 阻断。`
        : '水体需求冲突的物种不再共享同一水体，并重新评估确认不再出现 water_type 阻断。',
    );
  }

  if (family === 'housing') {
    return target(
      'deterministic_clearance',
      namedItem
        ? `${namedItem.name} 已从普通混养组合中移除并按单养要求处理，重新评估后不再出现 housing 阻断。`
        : '要求单养的物种已从普通混养组合中移除，重新评估后不再出现 housing 阻断。',
    );
  }

  if (family === 'predation') {
    if (decision.status === 'not_recommended') {
      return target(
        'deterministic_clearance',
        pair
          ? `${pair.pairLabel} 不再直接接触（分隔、分缸或替换组合），重新评估后不再出现该捕食阻断。`
          : '存在明确捕食关系的组合已分隔或替换，重新评估后不再出现该捕食阻断。',
      );
    }
    return target(
      'behavioral_recheck',
      pair
        ? `${pair.pairLabel} 只能在实际追食、躲藏、受伤与进食状态持续稳定后维持；出现持续异常立即分隔并重新评估，不能预先宣告风险已解除。`
        : '确认实际追食、躲藏、受伤与进食状态持续稳定；出现持续异常立即分隔并重新评估，不能预先宣告风险已解除。',
    );
  }

  if (family === 'aggression') {
    if (decision.status === 'not_recommended') {
      return target(
        'deterministic_clearance',
        pair
          ? `${pair.pairLabel} 的直接追鳍/攻击冲突已通过分隔或替换组合消除，重新评估后不再出现该直接冲突。`
          : '直接追鳍/攻击冲突已通过分隔或替换组合消除，重新评估后不再出现该直接冲突。',
      );
    }
    return target(
      'behavioral_recheck',
      '调整群体、遮挡或退让路线后，持续复查追逐、破鳍、躲藏和进食；只有实际状态稳定才能继续当前组合。',
    );
  }

  if (family === 'temperature') {
    if (hasHardTemperatureNoOverlap(decision)) {
      return target(
        'deterministic_clearance',
        pair
          ? `${pair.pairLabel} 已分缸或替换，使组合重新具备已审核的共同适温区间，并重新评估确认不再出现 temperature 无交集阻断。`
          : '通过分缸或替换物种使组合重新具备已审核的共同适温区间，并重新评估确认不再出现 temperature 无交集阻断。',
      );
    }
    return target(
      'parameter_recheck',
      namedItem
        ? `把鱼缸目标温度调整到 ${namedItem.name} 的已审核适温范围，同时保持与其余物种的共同适温区间；重新评估后 tank_temperature_conflict 必须消失。`
        : '把鱼缸目标温度调整到相关物种的已审核共同适温区间；重新评估后 tank_temperature_conflict 必须消失。',
    );
  }

  if (family === 'group_size') {
    return target(
      'parameter_recheck',
      minimumGroupSize != null
        ? `${namedItem?.name ? `${namedItem.name} 数量达到至少 ${minimumGroupSize} 条/只` : `群体数量达到至少 ${minimumGroupSize} 条/只`}，重新评估后 group_size 风险必须消失。`
        : '群体数量达到该物种已审核最低要求，并重新评估确认 group_size 风险消失。',
    );
  }

  if (family === 'ph') {
    if (rule.code === 'ph_range_conflict') {
      return target(
        'deterministic_clearance',
        pair
          ? `${pair.pairLabel} 已分缸或替换，使组合重新具备可长期维持的共同 pH 区间，并重新评估确认 pH 冲突消失。`
          : '通过分缸或替换物种使组合重新具备可长期维持的共同 pH 区间，并重新评估确认 pH 冲突消失。',
      );
    }
    return target(
      'parameter_recheck',
      '实际稳定 pH 进入已审核共同区间，并重新评估确认 pH 风险消失；不能只按一次测量值或理论中间值判断。',
    );
  }

  if (family === 'space') {
    return target(
      'parameter_recheck',
      '调整鱼缸尺寸或数量后重新评估；相关 tank length / volume / space 规则必须不再触发，并继续确认实际活动与进食正常。',
    );
  }

  if (family === 'bioload') {
    return target(
      'parameter_recheck',
      '降低总负荷或提升过滤维护能力后重新评估；bioload 风险不再触发，且实际呼吸、进食与水质波动保持稳定。',
    );
  }

  if (family === 'territory') {
    if (decision.status === 'not_recommended') {
      return target(
        'deterministic_clearance',
        pair
          ? `${pair.pairLabel} 已通过分隔或更换组合消除明确领地冲突，重新评估后不再出现 territory 阻断。`
          : '明确领地冲突已通过分隔或更换组合消除，重新评估后不再出现 territory 阻断。',
      );
    }
    return target(
      'behavioral_recheck',
      pair
        ? `为 ${pair.pairLabel} 增加遮挡、退让路线或分区后复查持续追逐、堵角、躲藏与进食；只有实际压迫消失才能继续原组合。`
        : '增加遮挡、退让路线或分区后复查持续追逐、堵角、躲藏与进食；只有实际压迫消失才能继续原组合。',
    );
  }

  if (family === 'observed') {
    return target(
      'behavioral_recheck',
      '当前异常行为或生理状态恢复稳定并经过重新评估前，不得把风险视为已解除。',
    );
  }

  if (family === 'equipment') {
    return target(
      'parameter_recheck',
      '补齐或修复对应设备条件后重新评估，确认相关 equipment 风险不再触发。',
    );
  }

  return target(
    'behavioral_recheck',
    '完成建议调整后重新评估，并用实际状态确认风险是否仍存在；没有新的确定性依据时不自动宣告风险已解除。',
  );
};

export const buildCompatibilityResolutionTargets = (
  decision: CompatibilityDecision,
  mode: CompatibilityAssessmentMode = 'planned_addition',
): CompatibilityResolutionTarget[] => {
  if (decision.status === 'compatible') return [];
  return sourceRulesForPlan(decision)
    .map(rule => resolutionTargetFor(decision, rule, mode))
    .slice(0, 2);
};

const orderedDistinctRules = (rules: TankCompatibilityRule[]) => {
  const seen = new Set<string>();
  return prioritizeDistinctCompatibilityRules(rules).filter(rule => {
    const family = getCompatibilityRuleFamily(rule.code);
    if (seen.has(family)) return false;
    seen.add(family);
    return true;
  });
};

type CompatibilityActionSequenceRule = {
  rule: TankCompatibilityRule;
  kind: 'blocking' | 'warning' | 'missing';
};

const actionSequenceRulesFor = (decision: CompatibilityDecision): CompatibilityActionSequenceRule[] => {
  if (decision.status === 'compatible') return [];

  const blocking = orderedDistinctRules(decision.blockingRules).map(rule => ({ rule, kind: 'blocking' as const }));
  const usedFamilies = new Set(blocking.map(item => getCompatibilityRuleFamily(item.rule.code)));
  const warning = orderedDistinctRules(decision.warningRules)
    .filter(rule => !usedFamilies.has(getCompatibilityRuleFamily(rule.code)))
    .map(rule => ({ rule, kind: 'warning' as const }));
  warning.forEach(item => usedFamilies.add(getCompatibilityRuleFamily(item.rule.code)));
  const missing = orderedDistinctRules(decision.missingData)
    .filter(rule => (
      decision.status === 'insufficient_data'
      || !usedFamilies.has(getCompatibilityRuleFamily(rule.code))
    ))
    .map(rule => ({ rule, kind: 'missing' as const }));

  if (decision.status === 'not_recommended') return [...blocking, ...warning, ...missing].slice(0, 6);
  if (decision.status === 'caution') return [...warning, ...missing].slice(0, 6);
  if (decision.status === 'insufficient_data') {
    // Ask for exactly one decision-critical input at a time. All other missing
    // facts stay in decision.missingData/evidence and are reconsidered after
    // the user supplies the current input, instead of being dumped into the UI.
    const domainCodes = new Set(decision.metadata.domainRuleCodes || []);
    const domainMissing = missing.filter(item => domainCodes.has(item.rule.code));
    return (domainMissing.length > 0 ? domainMissing : missing).slice(0, 1);
  }
  return [];
};

const sequenceResolutionTargetFor = (
  decision: CompatibilityDecision,
  entry: CompatibilityActionSequenceRule,
  mode: CompatibilityAssessmentMode,
) => {
  if (entry.kind === 'blocking') return resolutionTargetFor(decision, entry.rule, mode);
  if (entry.kind === 'warning') {
    return resolutionTargetFor({
      ...decision,
      status: 'caution',
      blockingRules: [],
    }, entry.rule, mode);
  }
  return resolutionTargetFor({
    ...decision,
    status: 'insufficient_data',
    blockingRules: [],
    warningRules: [],
  }, entry.rule, mode);
};

export const buildCompatibilityActionSequence = (
  decision: CompatibilityDecision,
  mode: CompatibilityAssessmentMode = 'planned_addition',
): CompatibilityActionSequenceStep[] => {
  const entries = actionSequenceRulesFor(decision);
  const hasHardStop = decision.status === 'not_recommended' && entries.some(entry => entry.kind === 'blocking');

  return entries.map((entry, index) => {
    const resolutionTarget = sequenceResolutionTargetFor(decision, entry, mode);
    const deferred = hasHardStop && entry.kind !== 'blocking';
    return {
      order: index + 1,
      state: deferred ? 'deferred' : index === 0 ? 'current' : 'next',
      riskFamily: getCompatibilityRuleFamily(entry.rule.code),
      action: entry.kind === 'missing'
        ? missingInputActionFor(decision, entry.rule)
        : specificActionFor(
          entry.kind === 'blocking'
            ? decision
            : {
              ...decision,
              status: 'caution',
              blockingRules: [],
            },
          entry.rule,
          mode,
        ) || resolutionTarget.criterion,
      sourceRuleCode: entry.rule.code,
      resolutionTarget,
      blockedByHardStop: deferred,
    };
  });
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
    const min = getExplicitCompatibilityGroupMinimum(sourceRules) ?? decision.stockingGuidance?.recommendedMin;
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
    const min = getExplicitCompatibilityGroupMinimum(sourceRules) ?? decision.stockingGuidance?.recommendedMin;
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
    const min = getExplicitCompatibilityGroupMinimum(sourceRules) ?? decision.stockingGuidance?.recommendedMin;
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
  const actionSequence = buildCompatibilityActionSequence(decision, mode);

  return {
    judgment: readable.judgment,
    verdict: action.verdict,
    fullyInformed,
    riskSummary: unique(readable.why).slice(0, 3),
    nextSteps,
    expectedAfterAdjustment: expectedOutcomeFor(decision, action.verdict, sourceRules),
    reviewCheckpoint: reviewCheckpointFor(decision, sourceRules, action.observeAfterAction),
    stopCondition: stopConditionForPlan(decision, mode, sourceRules, action.stopCondition),
    unknownReason: getCompatibilityUnknownReason(decision),
    resolutionTargets: buildCompatibilityResolutionTargets(decision, mode),
    actionSequence,
    evidence: {
      authorityLevel: action.authorityLevel,
      sourceRuleCodes: action.sourceRuleCodes,
      evidenceIds: action.evidenceIds,
    },
  };
};
