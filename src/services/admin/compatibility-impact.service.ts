import { fishData } from '../../data/fishData';
import { evaluateSpeciesCombination, type TankCompatibilityResult } from '../../lib/tankCompatibilityEngine';
import { getLifeType } from '../../modules/species/species.service';
import type { Fish } from '../../types';
import type { SpeciesAdminInput } from './content-admin.service';

export type CompatibilityRegressionChange = {
  speciesId: string;
  speciesName: string;
  beforeStatus: TankCompatibilityResult['status'];
  afterStatus: TankCompatibilityResult['status'];
  beforeRisk: TankCompatibilityResult['riskLevel'];
  afterRisk: TankCompatibilityResult['riskLevel'];
  beforeRuleCodes: string[];
  afterRuleCodes: string[];
  statusChanged: boolean;
};

export type CompatibilityRegressionResult = {
  cohortSize: number;
  changedPairs: number;
  statusChangedPairs: number;
  ruleChangedPairs: number;
  changes: CompatibilityRegressionChange[];
  truncated: boolean;
};

const statusRank = {
  compatible: 0,
  caution: 1,
  insufficient_data: 2,
  not_recommended: 3,
} as const;
const toFish = (input: SpeciesAdminInput, fallback?: Fish): Fish => ({
  id: input.catalogKey,
  name: input.name,
  scientificName: input.scientificName,
  category: input.category,
  image: fallback?.image || '',
  difficulty: input.difficulty,
  waterTemperature: input.waterTemperatureText,
  phLevel: input.phLevelText,
  waterChangeCycle: input.waterChangeCycleDays,
  description: input.description,
  diet: input.diet,
  ...(fallback?.feedingProfile ? { feedingProfile: { ...fallback.feedingProfile } } : {}),
  tankSize: input.tankSizeText,
  temperament: input.temperament,
  size: input.sizeClass,
  housingMode: input.housingMode,
  housingReason: input.housingReason,
  isCustom: input.isCustom,
});

const ruleCodes = (decision: TankCompatibilityResult) => Array.from(new Set([
  ...decision.blockingRules.map(rule => rule.code),
  ...decision.warningRules.map(rule => rule.code),
  ...decision.missingData.map(rule => rule.code),
])).sort();

const sameCodes = (left: string[], right: string[]) => (
  left.length === right.length && left.every((value, index) => value === right[index])
);

const eligibleCohort = (items: Fish[], selectedId: string) => items.filter(item => {
  if (!item?.id || item.id === selectedId) return false;
  const lifeType = getLifeType(item);
  return lifeType === 'fish' || lifeType === 'invertebrate' || lifeType === 'reptile';
});

export const runCompatibilityRegression = (
  before: SpeciesAdminInput,
  after: SpeciesAdminInput,
  cohort: Fish[] = fishData,
  maxVisibleChanges = 12,
): CompatibilityRegressionResult => {
  const fallback = cohort.find(item => item.id === after.catalogKey) || fishData.find(item => item.id === after.catalogKey);
  const beforeFish = toFish(before, fallback);
  const afterFish = toFish(after, fallback);
  const candidates = eligibleCohort(cohort, after.catalogKey);
  const changes: CompatibilityRegressionChange[] = [];

  for (const counterpart of candidates) {
    const beforeDecision = evaluateSpeciesCombination([beforeFish, counterpart]);
    const afterDecision = evaluateSpeciesCombination([afterFish, counterpart]);
    const beforeRuleCodes = ruleCodes(beforeDecision);
    const afterRuleCodes = ruleCodes(afterDecision);
    const statusChanged = beforeDecision.status !== afterDecision.status || beforeDecision.riskLevel !== afterDecision.riskLevel;
    if (!statusChanged && sameCodes(beforeRuleCodes, afterRuleCodes)) continue;
    changes.push({
      speciesId: counterpart.id,
      speciesName: counterpart.name,
      beforeStatus: beforeDecision.status,
      afterStatus: afterDecision.status,
      beforeRisk: beforeDecision.riskLevel,
      afterRisk: afterDecision.riskLevel,
      beforeRuleCodes,
      afterRuleCodes,
      statusChanged,
    });
  }

  const ordered = [...changes].sort((left, right) => {
    const leftRank = Math.max(statusRank[left.beforeStatus], statusRank[left.afterStatus]);
    const rightRank = Math.max(statusRank[right.beforeStatus], statusRank[right.afterStatus]);
    if (left.statusChanged !== right.statusChanged) return left.statusChanged ? -1 : 1;
    if (leftRank !== rightRank) return rightRank - leftRank;
    return left.speciesName.localeCompare(right.speciesName, 'zh-CN');
  });
  const statusChangedPairs = changes.filter(change => change.statusChanged).length;
  const ruleChangedPairs = changes.length - statusChangedPairs;

  return {
    cohortSize: candidates.length,
    changedPairs: changes.length,
    statusChangedPairs,
    ruleChangedPairs,
    changes: ordered.slice(0, maxVisibleChanges),
    truncated: ordered.length > maxVisibleChanges,
  };
};
