import type { Aquarium, Fish } from '../../types';
import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import { evaluateCompatibilityDecision, type CompatibilityItem } from '../../modules/knowledge/compatibilityKnowledge';
import type { CompatibilityDecision, CompatibilityRiskType } from '../../modules/knowledge/knowledge.types';
import {
  evaluateTankState,
  type TankHardConstraint,
  type TankObservation,
  type TankObservationCode,
  type TankPriorRisk,
  type TankPriorRiskKind,
  type TankStateResult,
} from '../../../packages/domain-rules/src';

const HARD_CONSTRAINT_CODES = new Set(['water_type_mismatch', 'species_water_type_conflict']);

const riskKindMap: Partial<Record<CompatibilityRiskType, TankPriorRiskKind>> = {
  water_type: 'water_type',
  predation: 'predation',
  aggression: 'aggression',
  territory: 'territory',
  space: 'space',
  bioload: 'bioload',
  temperature: 'temperature',
  equipment: 'equipment',
};

const normalizeObservation = (code: TankObservationCode, record: DiagnosisRecord): TankObservation => ({
  code,
  observedAt: record.createdAt,
  evidence: `${record.problemType}：${record.resultSummary || record.answers?.behavior || record.answers?.aggression || code}`,
});

const includesOne = (value: string | undefined, options: string[]) => Boolean(value && options.some(option => value.includes(option)));

export const buildTankObservationsFromDiagnosisRecords = (
  records: DiagnosisRecord[],
  aquariumId: string,
): TankObservation[] => {
  const observations: TankObservation[] = [];
  const add = (record: DiagnosisRecord, code: TankObservationCode) => observations.push(normalizeObservation(code, record));

  records.filter(record => record.aquariumId === aquariumId).forEach(record => {
    const answers = record.answers || {};

    if (record.problemType === '巡检') {
      if (answers.behavior === '正常游动和进食') {
        add(record, 'normal_activity');
        add(record, 'normal_feeding');
      }
      if (answers.breathing === '正常') add(record, 'normal_activity');
      if (includesOne(answers.behavior, ['追咬打架'])) add(record, 'persistent_chasing');
      if (includesOne(answers.behavior, ['持续躲藏'])) add(record, 'hiding_pressure');
      if (includesOne(answers.behavior, ['拒食'])) add(record, 'appetite_drop');
      if (includesOne(answers.breathing, ['经常浮头', '呼吸明显急促'])) add(record, 'respiratory_distress');
      if (includesOne(answers.waterLook, ['明显浑浊', '发白', '发绿'])) add(record, 'cloudy_water');
      if (includesOne(answers.odor, ['明显异味'])) add(record, 'odor');
    }

    if (record.problemType === '追咬打架') {
      if (includesOne(answers.aggression, ['明显追咬', '持续霸占区域'])) add(record, 'persistent_chasing');
      if (includesOne(answers.aggression, ['咬伤鳍条'])) add(record, 'injury');
    }

    if (record.problemType === '躲藏不动') {
      if (includesOne(answers.hiding, ['长时间躲藏', '趴底不动'])) add(record, 'hiding_pressure');
      if (includesOne(answers.chasing, ['明显追咬'])) add(record, 'persistent_chasing');
    }

    if (record.problemType === '拒食') {
      if (includesOne(answers.feedingResponse, ['连续一天不吃', '连续多天不吃', '全缸都不吃'])) add(record, 'appetite_drop');
      if (includesOne(answers.chasing, ['抢食严重'])) {
        add(record, 'persistent_chasing');
        add(record, 'feeding_exclusion');
      } else if (includesOne(answers.chasing, ['明显追咬'])) {
        add(record, 'persistent_chasing');
      }
    }

    if (['鱼浮头 / 呼吸急促', '鱼只异常'].includes(record.problemType)) {
      const respiratoryAnswer = answers.gasping || answers.symptom || answers.fishBehavior;
      if (includesOne(respiratoryAnswer, ['经常浮头', '呼吸明显急促', '急促呼吸', '浮头喘气'])) add(record, 'respiratory_distress');
    }

    if (['死亡 / 异常死亡', '死亡处理'].includes(record.problemType)) {
      if (includesOne(answers.deathCount, ['死亡多条', '连续死了多条', '2-3 条'])) add(record, 'multiple_deaths');
    }

    if (record.problemType === '水质浑浊 / 异味') {
      if (includesOne(answers.waterLook, ['明显浑浊', '发白', '发绿'])) add(record, 'cloudy_water');
      if (includesOne(answers.waterLook, ['有异味'])) add(record, 'odor');
    }
  });

  const seen = new Set<string>();
  return observations.filter(item => {
    const key = `${item.observedAt}::${item.code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const inferPriorKindFromRule = (code: string, title: string, evidence: string): TankPriorRiskKind => {
  const text = `${code} ${title} ${evidence}`;
  if (/predation|捕食|吞食/.test(text)) return 'predation';
  if (/territor|领地/.test(text)) return 'territory';
  if (/aggress|追咬|攻击|行为冲突/.test(text)) return 'aggression';
  if (/bioload|负荷|负载/.test(text)) return 'bioload';
  if (/space|volume|tank|容量|空间|缸长/.test(text)) return 'space';
  if (/temperature|温度|水温/.test(text)) return 'temperature';
  if (/equipment|过滤|加热|设备/.test(text)) return 'equipment';
  if (/water_type|水体类型|淡水|海水/.test(text)) return 'water_type';
  return 'other';
};

const priorFromRelationship = (
  code: string,
  riskType: CompatibilityRiskType,
  relationship: 'not_recommended' | 'conditional',
  evidence: string,
): TankPriorRisk | null => {
  if (HARD_CONSTRAINT_CODES.has(code)) return null;
  return {
    code,
    kind: riskKindMap[riskType] || 'other',
    level: relationship === 'not_recommended' ? 'high' : 'medium',
    evidence,
    observationTargets: riskType === 'aggression' || riskType === 'territory'
      ? ['持续追逐', '长期躲藏', '摄食受压', '受伤']
      : riskType === 'space'
        ? ['活动受限', '持续领地冲突', '摄食受压']
        : riskType === 'predation'
          ? ['持续追逐', '受伤', '失踪']
          : [],
  };
};

export const buildTankPriorsFromCompatibilityDecision = (decision: CompatibilityDecision): TankPriorRisk[] => {
  const priors = [
    ...decision.blockedReasons.map(item => priorFromRelationship(item.sourceRule.code, item.riskType, 'not_recommended', item.evidence)),
    ...decision.adjustableReasons.map(item => priorFromRelationship(item.sourceRule.code, item.riskType, 'conditional', item.evidence)),
  ].filter((item): item is TankPriorRisk => Boolean(item));

  decision.blockingRules.forEach(rule => {
    if (HARD_CONSTRAINT_CODES.has(rule.code)) return;
    priors.push({
      code: rule.code,
      kind: inferPriorKindFromRule(rule.code, rule.title, rule.evidence),
      level: 'high',
      evidence: rule.evidence,
    });
  });
  decision.warningRules.forEach(rule => {
    if (HARD_CONSTRAINT_CODES.has(rule.code)) return;
    priors.push({
      code: rule.code,
      kind: inferPriorKindFromRule(rule.code, rule.title, rule.evidence),
      level: 'medium',
      evidence: rule.evidence,
    });
  });

  decision.wholeTankFeasibility.warningRules.forEach(rule => {
    if (HARD_CONSTRAINT_CODES.has(rule.code)) return;
    const kind: TankPriorRiskKind = /bioload|负荷|负载/.test(`${rule.code} ${rule.title}`)
      ? 'bioload'
      : /space|volume|容量|空间/.test(`${rule.code} ${rule.title}`)
        ? 'space'
        : /equipment|过滤|加热|设备/.test(`${rule.code} ${rule.title}`)
          ? 'equipment'
          : 'other';
    priors.push({
      code: rule.code,
      kind,
      level: rule.severity === 'high' ? 'high' : rule.severity === 'medium' ? 'medium' : 'low',
      evidence: rule.evidence,
    });
  });

  const seen = new Set<string>();
  return priors.filter(item => {
    const key = `${item.code}::${item.kind}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const buildTankHardConstraintsFromCompatibilityDecision = (decision: CompatibilityDecision): TankHardConstraint[] => (
  decision.blockingRules
    .filter(rule => HARD_CONSTRAINT_CODES.has(rule.code))
    .map(rule => ({
      code: rule.code,
      active: true,
      severity: 'urgent' as const,
      evidence: rule.evidence,
    }))
);

export const getCurrentCombinationAgeDays = (aquarium: Aquarium, now = new Date()): number => {
  const entryDates = aquarium.fishes.flatMap(record => (
    record.batches?.length
      ? record.batches.map(batch => batch.entryDate)
      : [record.entryDate]
  )).filter(Boolean);
  const latestEntryMs = Math.max(...entryDates.map(value => Date.parse(value)).filter(Number.isFinite));
  const fallbackMs = aquarium.startedAt ? Date.parse(aquarium.startedAt) : Number.NaN;
  const startMs = Number.isFinite(latestEntryMs) ? latestEntryMs : fallbackMs;
  if (!Number.isFinite(startMs)) return 0;
  return Math.max(0, Math.floor((now.getTime() - startMs) / (24 * 60 * 60 * 1000)));
};

export type CurrentTankStateEvidence = {
  compatibilityDecision: CompatibilityDecision | null;
  priors: TankPriorRisk[];
  hardConstraints: TankHardConstraint[];
  observations: TankObservation[];
  cohabitationDays: number;
  result: TankStateResult;
};

export const deriveCurrentTankState = ({
  aquarium,
  speciesCatalog,
  diagnosisRecords,
  now = new Date(),
}: {
  aquarium: Aquarium;
  speciesCatalog: Fish[];
  diagnosisRecords: DiagnosisRecord[];
  now?: Date;
}): CurrentTankStateEvidence => {
  const items: CompatibilityItem[] = aquarium.fishes
    .map(record => {
      const species = speciesCatalog.find(item => item.id === record.fishId);
      return species ? { species, quantity: Math.max(1, record.quantity || 1), origin: 'existing' as const } : null;
    })
    .filter((item): item is { species: Fish; quantity: number; origin: 'existing' } => Boolean(item));

  const compatibilityDecision = items.length > 0
    ? evaluateCompatibilityDecision({ tank: aquarium, items })
    : null;
  const priors = compatibilityDecision ? buildTankPriorsFromCompatibilityDecision(compatibilityDecision) : [];
  const hardConstraints = compatibilityDecision ? buildTankHardConstraintsFromCompatibilityDecision(compatibilityDecision) : [];
  const observations = buildTankObservationsFromDiagnosisRecords(diagnosisRecords, aquarium.id);
  const cohabitationDays = getCurrentCombinationAgeDays(aquarium, now);
  const result = evaluateTankState({
    priors,
    hardConstraints,
    observations,
    cohabitationDays,
    now: now.toISOString(),
  });

  return { compatibilityDecision, priors, hardConstraints, observations, cohabitationDays, result };
};
