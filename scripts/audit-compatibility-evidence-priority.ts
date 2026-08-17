import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getLifeType, getSecondaryCategory, getSpeciesWaterType } from '../src/modules/species/species.service';

export type CompatibilityEvidenceResearchPriority = {
  speciesId: string;
  name: string;
  scientificName: string;
  lifeType: ReturnType<typeof getLifeType>;
  waterType: ReturnType<typeof getSpeciesWaterType>;
  role: string;
  priorityScore: number;
  researchSignals: string[];
};

const BEHAVIOR_TEXT_SIGNAL = /捕食|吞食|活鱼|肉食|鱼食|凶猛|攻击|领地|单养|predat|piscivor|carnivor|aggress|territor|solitary/i;
const HIGH_CONSEQUENCE_ROLE_SIGNAL = /雷龙|龙鱼|古代鱼|慈鲷|狮子鱼|炮弹|海水神仙|蝶鱼|大型/i;

const researchSignalsFor = (species: (typeof fishData)[number]) => {
  const signals: string[] = [];
  const text = [
    species.name,
    species.scientificName,
    species.category,
    species.description,
    species.diet,
    species.temperament,
    species.housingMode,
    species.housingReason,
  ].filter(Boolean).join(' ');

  if (species.temperament === 'Aggressive') signals.push('catalog_temperament_aggressive');
  if (species.temperament === 'Territorial') signals.push('catalog_temperament_territorial');
  if (/单养|solitary/i.test(species.housingMode || '')) signals.push('catalog_single_housing_signal');
  if (species.size === 'Large') signals.push('catalog_large_body_size');
  if (BEHAVIOR_TEXT_SIGNAL.test(text)) signals.push('catalog_behavior_text_signal');
  if (HIGH_CONSEQUENCE_ROLE_SIGNAL.test(`${species.category} ${getSecondaryCategory(species)}`)) signals.push('catalog_high_consequence_role_signal');
  return signals;
};

const scoreSignals = (signals: string[]) => {
  let score = 0;
  if (signals.includes('catalog_temperament_aggressive')) score += 5;
  if (signals.includes('catalog_temperament_territorial')) score += 5;
  if (signals.includes('catalog_single_housing_signal')) score += 4;
  if (signals.includes('catalog_large_body_size')) score += 3;
  if (signals.includes('catalog_behavior_text_signal')) score += 4;
  if (signals.includes('catalog_high_consequence_role_signal')) score += 2;
  return score;
};

export const buildCompatibilityEvidenceResearchQueue = (): CompatibilityEvidenceResearchPriority[] => fishData
  .flatMap<CompatibilityEvidenceResearchPriority>(species => {
    const lifeType = getLifeType(species);
    if (lifeType === 'plant' || lifeType === 'hardscape') return [];
    if (getReviewedCompatibilityProfile(species.id)) return [];

    const researchSignals = researchSignalsFor(species);
    const priorityScore = scoreSignals(researchSignals);
    if (priorityScore <= 0) return [];

    return [{
      speciesId: species.id,
      name: species.name,
      scientificName: species.scientificName,
      lifeType,
      waterType: getSpeciesWaterType(species),
      role: getSecondaryCategory(species),
      priorityScore,
      researchSignals,
    }];
  })
  .sort((left, right) => (
    right.priorityScore - left.priorityScore
    || left.speciesId.localeCompare(right.speciesId)
  ));

const queue = buildCompatibilityEvidenceResearchQueue();
assert.ok(queue.length > 0, 'research-only evidence queue should identify at least one unreviewed high-signal animal');
assert.ok(queue.every(item => !getReviewedCompatibilityProfile(item.speciesId)), 'reviewed deterministic profiles must never re-enter the research queue');
assert.ok(queue.every(item => item.lifeType !== 'plant' && item.lifeType !== 'hardscape'), 'plants and hardscape must stay out of animal compatibility research');
assert.ok(queue.every(item => item.priorityScore > 0 && item.researchSignals.length > 0), 'every research priority needs an explicit catalog signal');

const summary = {
  policy: 'research_only_not_runtime_evidence',
  rankingSource: 'catalog_risk_signals_fallback_until_pair_usage_is_sufficient',
  catalogAnimalCount: fishData.filter(species => !['plant', 'hardscape'].includes(getLifeType(species))).length,
  directReviewedProfileCount: fishData.filter(species => Boolean(getReviewedCompatibilityProfile(species.id))).length,
  highSignalResearchQueueCount: queue.length,
  topResearchQueue: queue.slice(0, 30),
};

console.log(JSON.stringify(summary, null, 2));
console.log('compatibility evidence priority audit passed: catalog signals rank research work only and are never consumed as runtime compatibility evidence');
