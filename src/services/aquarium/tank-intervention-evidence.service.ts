import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import type { TankObservation, TankObservationCode } from '../../../packages/domain-rules/src';

export type TankInterventionType =
  | 'add_hiding'
  | 'temporary_isolation'
  | 'separate_tank'
  | 'increase_aeration'
  | 'water_change'
  | 'filter_check'
  | 'temperature_adjustment'
  | 'reduce_stocking'
  | 'other';

export type TankIntervention = {
  interventionId: string;
  type: TankInterventionType;
  label: string;
  performedAt: string;
  note?: string;
  sourceDiagnosisId: string;
};

export type TankInterventionOutcome =
  | 'improved_after_action'
  | 'problem_persisted_after_action'
  | 'mixed_after_action'
  | 'insufficient_followup';

export type TankInterventionEffect = {
  intervention: TankIntervention;
  outcome: TankInterventionOutcome;
  followupObservationCount: number;
  normalConfirmationCount: number;
  abnormalObservationCount: number;
  evaluationWindowEnd?: string;
  evidence: string[];
  /** Always correlation-safe: never states that the action caused the outcome. */
  summary: string;
};

export type TankInterventionSequencePattern =
  | 'escalated_then_improved'
  | 'relapsed_after_improvement'
  | 'multiple_actions_not_controlled';

export type TankInterventionSequenceSummary = {
  pattern: TankInterventionSequencePattern;
  summary: string;
  nextStep: string;
  interventionIds: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const FOLLOWUP_WINDOW_DAYS = 7;

const interventionLabels: Record<TankInterventionType, string> = {
  add_hiding: '增加遮挡 / 躲避空间',
  temporary_isolation: '临时隔离',
  separate_tank: '分缸',
  increase_aeration: '加强曝气 / 水面扰动',
  water_change: '换水',
  filter_check: '检查 / 恢复过滤',
  temperature_adjustment: '调整水温',
  reduce_stocking: '减少生物数量 / 降低负荷',
  other: '其他已执行措施',
};

const interventionAliases: Record<string, TankInterventionType> = {
  add_hiding: 'add_hiding',
  '增加遮挡': 'add_hiding',
  '增加躲避': 'add_hiding',
  '增加躲避空间': 'add_hiding',
  temporary_isolation: 'temporary_isolation',
  '临时隔离': 'temporary_isolation',
  '隔离': 'temporary_isolation',
  separate_tank: 'separate_tank',
  '分缸': 'separate_tank',
  increase_aeration: 'increase_aeration',
  '加强曝气': 'increase_aeration',
  '加强供氧': 'increase_aeration',
  '增加水面扰动': 'increase_aeration',
  water_change: 'water_change',
  '换水': 'water_change',
  filter_check: 'filter_check',
  '检查过滤': 'filter_check',
  '恢复过滤': 'filter_check',
  temperature_adjustment: 'temperature_adjustment',
  '调整水温': 'temperature_adjustment',
  reduce_stocking: 'reduce_stocking',
  '减少数量': 'reduce_stocking',
  '降低负荷': 'reduce_stocking',
  other: 'other',
  '其他': 'other',
};

const relevantSignals: Record<TankInterventionType, {
  normal: TankObservationCode[];
  abnormal: TankObservationCode[];
}> = {
  add_hiding: {
    normal: ['no_persistent_chasing', 'no_hiding_pressure', 'normal_feeding', 'normal_activity', 'no_injury'],
    abnormal: ['persistent_chasing', 'hiding_pressure', 'feeding_exclusion', 'appetite_drop', 'injury', 'severe_injury'],
  },
  temporary_isolation: {
    normal: ['no_persistent_chasing', 'no_hiding_pressure', 'normal_feeding', 'normal_activity', 'no_injury'],
    abnormal: ['persistent_chasing', 'hiding_pressure', 'feeding_exclusion', 'appetite_drop', 'injury', 'severe_injury'],
  },
  separate_tank: {
    normal: ['no_persistent_chasing', 'no_hiding_pressure', 'normal_feeding', 'normal_activity', 'no_injury'],
    abnormal: ['persistent_chasing', 'hiding_pressure', 'feeding_exclusion', 'appetite_drop', 'injury', 'severe_injury'],
  },
  increase_aeration: {
    normal: ['normal_breathing'],
    abnormal: ['respiratory_distress', 'multiple_deaths'],
  },
  water_change: {
    normal: ['normal_breathing', 'normal_activity', 'normal_feeding'],
    abnormal: ['cloudy_water', 'odor', 'respiratory_distress', 'multiple_deaths'],
  },
  filter_check: {
    normal: ['normal_breathing', 'normal_activity'],
    abnormal: ['cloudy_water', 'odor', 'respiratory_distress', 'multiple_deaths'],
  },
  temperature_adjustment: {
    normal: ['normal_breathing', 'normal_activity', 'normal_feeding'],
    abnormal: ['respiratory_distress', 'appetite_drop', 'multiple_deaths'],
  },
  reduce_stocking: {
    normal: ['normal_breathing', 'normal_activity', 'normal_feeding', 'no_persistent_chasing', 'no_hiding_pressure'],
    abnormal: ['respiratory_distress', 'persistent_chasing', 'hiding_pressure', 'feeding_exclusion', 'multiple_deaths'],
  },
  other: {
    normal: ['normal_breathing', 'normal_activity', 'normal_feeding', 'no_persistent_chasing', 'no_hiding_pressure', 'no_injury'],
    abnormal: ['respiratory_distress', 'persistent_chasing', 'hiding_pressure', 'feeding_exclusion', 'appetite_drop', 'injury', 'severe_injury', 'multiple_deaths', 'cloudy_water', 'odor'],
  },
};

const parseTime = (value: string | undefined) => {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

const parseInterventionType = (value: string | undefined): TankInterventionType | null => {
  if (!value) return null;
  return interventionAliases[value.trim()] || null;
};

export const buildTankInterventionsFromDiagnosisRecords = (
  records: DiagnosisRecord[],
  aquariumId: string,
  now = new Date(),
): TankIntervention[] => {
  const nowMs = now.getTime();
  const interventions = records.flatMap(record => {
    if (record.aquariumId !== aquariumId) return [];
    const type = parseInterventionType(record.answers?.interventionType);
    if (!type) return [];
    const explicitAt = record.answers?.interventionAt;
    const performedAt = explicitAt && parseTime(explicitAt) !== null ? explicitAt : record.createdAt;
    const performedMs = parseTime(performedAt);
    if (performedMs === null || performedMs > nowMs) return [];
    return [{
      interventionId: `${record.diagnosisId}:${type}:${performedAt}`,
      type,
      label: interventionLabels[type],
      performedAt,
      note: record.answers?.interventionNote?.trim() || undefined,
      sourceDiagnosisId: record.diagnosisId,
    } satisfies TankIntervention];
  });

  const seen = new Set<string>();
  return interventions
    .sort((a, b) => Date.parse(a.performedAt) - Date.parse(b.performedAt))
    .filter(item => {
      if (seen.has(item.interventionId)) return false;
      seen.add(item.interventionId);
      return true;
    });
};

const observationAfterIntervention = (
  observation: TankObservation,
  intervention: TankIntervention,
  nowMs: number,
  nextInterventionAt?: string,
) => {
  const observedMs = parseTime(observation.observedAt);
  const interventionMs = parseTime(intervention.performedAt);
  const nextInterventionMs = parseTime(nextInterventionAt);
  if (observedMs === null || interventionMs === null) return false;
  return observedMs > interventionMs
    && observedMs <= nowMs
    && observedMs - interventionMs <= FOLLOWUP_WINDOW_DAYS * DAY_MS
    // Once another action is performed, later observations are confounded by
    // that newer action and must not be attributed back to the earlier one.
    && (nextInterventionMs === null || observedMs < nextInterventionMs);
};

const uniqueObservationDates = (items: TankObservation[]) => (
  new Set(items.map(item => item.observedAt)).size
);

export const evaluateTankInterventionEffects = ({
  interventions,
  observations,
  now = new Date(),
}: {
  interventions: TankIntervention[];
  observations: TankObservation[];
  now?: Date;
}): TankInterventionEffect[] => {
  const nowMs = now.getTime();
  return interventions.map((intervention, index) => {
    const nextInterventionAt = interventions[index + 1]?.performedAt;
    const scope = relevantSignals[intervention.type];
    const normalSet = new Set<TankObservationCode>(scope.normal);
    const abnormalSet = new Set<TankObservationCode>(scope.abnormal);
    const followups = observations.filter(item => observationAfterIntervention(item, intervention, nowMs, nextInterventionAt));
    const normal = followups.filter(item => normalSet.has(item.code));
    const abnormal = followups.filter(item => abnormalSet.has(item.code));
    const normalConfirmationCount = uniqueObservationDates(normal);
    const abnormalObservationCount = uniqueObservationDates(abnormal);

    let outcome: TankInterventionOutcome;
    if (abnormalObservationCount > 0 && normalConfirmationCount >= 2) outcome = 'mixed_after_action';
    else if (abnormalObservationCount > 0) outcome = 'problem_persisted_after_action';
    else if (normalConfirmationCount >= 2) outcome = 'improved_after_action';
    else outcome = 'insufficient_followup';

    const summary = outcome === 'improved_after_action'
      ? `记录到「${intervention.label}」之后有 ${normalConfirmationCount} 次相关正常复查，且同一观察窗口内没有记录到对应异常；只能说明时间先后相关，不能据此确认因果关系。`
      : outcome === 'problem_persisted_after_action'
        ? `记录到「${intervention.label}」之后仍出现 ${abnormalObservationCount} 次相关异常，说明目前没有足够证据认为该措施已经控制住问题。`
        : outcome === 'mixed_after_action'
          ? `记录到「${intervention.label}」之后既有正常复查，也仍有相关异常；结果混合，暂不能判断该措施是否有效。`
          : `「${intervention.label}」之后的相关复查不足；先补充至少 2 次结构化复查，再判断是否伴随改善。`;

    return {
      intervention,
      outcome,
      followupObservationCount: followups.length,
      normalConfirmationCount,
      abnormalObservationCount,
      evaluationWindowEnd: nextInterventionAt,
      evidence: [...normal, ...abnormal]
        .sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt))
        .map(item => item.evidence || item.code),
      summary,
    };
  });
};


const outcomeIsNotControlled = (outcome: TankInterventionOutcome) => (
  outcome === 'problem_persisted_after_action' || outcome === 'mixed_after_action'
);

/**
 * Summarizes a multi-action trajectory without ranking actions or claiming causality.
 * Only action windows with actual follow-up evidence participate in trajectory patterns.
 */
export const summarizeTankInterventionSequence = (
  effects: TankInterventionEffect[],
): TankInterventionSequenceSummary | null => {
  if (effects.length < 2) return null;
  const ordered = [...effects].sort((left, right) => (
    Date.parse(left.intervention.performedAt) - Date.parse(right.intervention.performedAt)
  ));
  const evaluated = ordered.filter(item => item.outcome !== 'insufficient_followup');
  if (evaluated.length < 2) return null;

  const latest = evaluated[evaluated.length - 1];
  const earlier = evaluated.slice(0, -1);
  const earlierNotControlled = earlier.filter(item => outcomeIsNotControlled(item.outcome));
  const earlierImproved = earlier.filter(item => item.outcome === 'improved_after_action');

  if (latest.outcome === 'improved_after_action' && earlierNotControlled.length > 0) {
    const failedLabels = earlierNotControlled.map(item => `「${item.intervention.label}」`).join('、');
    return {
      pattern: 'escalated_then_improved',
      summary: `${failedLabels}后的复查仍有异常；之后执行「${latest.intervention.label}」后记录到 ${latest.normalConfirmationCount} 次相关正常复查，且该动作自己的观察窗口内没有记录到对应异常。这里只能说明后一个动作之后伴随改善，不能证明它是唯一原因。`,
      nextStep: `暂时保留「${latest.intervention.label}」并继续复查；不要重新依赖前面没有控制住问题的措施作为唯一处理。`,
      interventionIds: evaluated.map(item => item.intervention.interventionId),
    };
  }

  if (outcomeIsNotControlled(latest.outcome) && earlierImproved.length > 0) {
    const improvedLabels = earlierImproved.map(item => `「${item.intervention.label}」`).join('、');
    return {
      pattern: 'relapsed_after_improvement',
      summary: `${improvedLabels}之后曾记录到相关正常复查，但后续在「${latest.intervention.label}」的观察窗口内再次出现相关异常；此前的改善不能视为问题已经长期解决。`,
      nextStep: '按当前最新异常重新处理，并保留前后措施与复查记录；不要因为之前曾改善就降低这次复发的处理级别。',
      interventionIds: evaluated.map(item => item.intervention.interventionId),
    };
  }

  const notControlled = evaluated.filter(item => outcomeIsNotControlled(item.outcome));
  if (notControlled.length >= 2 && latest.outcome !== 'improved_after_action') {
    const labels = notControlled.map(item => `「${item.intervention.label}」`).join('、');
    return {
      pattern: 'multiple_actions_not_controlled',
      summary: `${labels}各自的观察窗口内都仍记录到相关异常；目前没有足够证据认为这些已执行措施已经把问题控制住。`,
      nextStep: '停止继续重复同一层级的处理，重新核对异常来源；行为冲突可升级稳定隔离/分缸，环境异常则重新检查水质、供氧、过滤和温度。',
      interventionIds: evaluated.map(item => item.intervention.interventionId),
    };
  }

  return null;
};
