import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  getReviewedCompatibilityProfile,
  getReviewedConditionalBehaviorEvidence,
} from '../src/data/compatibilityEvidence';
import { getLifeType, getSecondaryCategory, getSpeciesWaterType } from '../src/modules/species/species.service';

export type EvidenceResearchPriority = {
  speciesId: string;
  name: string;
  scientificName: string;
  lifeType: ReturnType<typeof getLifeType>;
  waterType: ReturnType<typeof getSpeciesWaterType>;
  role: string;
  coverage: 'unreviewed' | 'contextual_only';
  priorityScore: number;
  researchSignals: string[];
};

const RESEARCH_ONLY_TEXT_SIGNAL = /捕食|吞食|活鱼|肉食|鱼食|凶猛|攻击|领地|单养|predat|piscivor|carnivor|aggress|territor|solitary/i;
const HIGH_RISK_ROLE_SIGNAL = /雷龙|龙鱼|古代鱼|慈鲷|狮子鱼|炮弹|海水神仙|蝶鱼|大型/i;

const buildResearchSignals = (species: (typeof fishData)[number]) => {
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
  if (RESEARCH_ONLY_TEXT_SIGNAL.test(text)) signals.push('catalog_behavior_text_signal');
  if (HIGH_RISK_ROLE_SIGNAL.test(`${species.category} ${getSecondaryCategory(species)}`)) signals.push('catalog_high_consequence_role_signal');
  return signals;
};

const scoreSignals = (signals: string[], contextualOnly: boolean) => {
  let score = 0;
  if (signals.includes('catalog_temperament_aggressive')) score += 5;
  if (signals.includes('catalog_temperament_territorial')) score += 5;
  if (signals.includes('catalog_single_housing_signal')) score += 4;
  if (signals.includes('catalog_large_body_size')) score += 3;
  if (signals.includes('catalog_behavior_text_signal')) score += 4;
  if (signals.includes('catalog_high_consequence_role_signal')) score += 2;
  if (contextualOnly) score -= 2;
  return Math.max(0, score);
};

export const buildCompatibilityEvidenceResearchQueue = (): EvidenceResearchPriority[] => fishData
  .flatMap(species => {
    const lifeType = getLifeType(species);
    if (lifeType === 'plant' || lifeType === 'hardscape') return [];
    if (getReviewedCompatibilityProfile(species.id)) return [];

    const conditional = getReviewedConditionalBehaviorEvidence(species.id);
    const researchSignals = buildResearchSignals(species);
    const priorityScore = scoreSignals(researchSignals, Boolean(conditional));
    if (priorityScore <= 0) return [];

    return [{
      speciesId: species.id,
      name: species.name,
      scientificName: species.scientificName,
      lifeType,
      waterType: getSpeciesWaterType(species),
      role: getSecondaryCategory(species),
      coverage: conditional ? 'contextual_only' as const : 'unreviewed' as const,
      priorityScore,
      researchSignals,
    }];
  })
  .sort((left, right) => (
    right.priorityScore - left.priorityScore
    || left.coverage.localeCompare(right.coverage)
    || left.speciesId.localeCompare(right.speciesId)
  ));

const queue = buildCompatibilityEvidenceResearchQueue();
assert.ok(queue.length > 0, 'evidence research queue should identify at least one unreviewed high-signal animal');
assert.ok(queue.every(item => !getReviewedCompatibilityProfile(item.speciesId)), 'research queue must never re-queue an already reviewed deterministic profile');
assert.ok(queue.every(item => item.lifeType !== 'plant' && item.lifeType !== 'hardscape'));
assert.ok(queue.every(item => item.priorityScore > 0));

const bettaContextual = queue.filter(item => item.scientificName.match(/Betta splendens/i));
assert.ok(bettaContextual.length > 0, 'Betta contextual assignments should remain visible as state-model/evidence follow-up work');
assert.ok(bettaContextual.every(item => item.coverage === 'contextual_only'));

const angelContextual = queue.filter(item => item.scientificName.match(/Pterophyllum scalare/i));
assert.ok(angelContextual.length > 0, 'angelfish contextual assignments should remain visible as state-model/evidence follow-up work');
assert.ok(angelContextual.every(item => item.coverage === 'contextual_only'));

const summary = {
  catalogAnimalCount: fishData.filter(species => {
    const lifeType = getLifeType(species);
    return lifeType !== 'plant' && lifeType !== 'hardscape';
  }).length,
  directReviewedProfileCount: fishData.filter(species => Boolean(getReviewedCompatibilityProfile(species.id))).length,
  contextualOnlyAssignmentCount: fishData.filter(species => (
    !getReviewedCompatibilityProfile(species.id)
    && Boolean(getReviewedConditionalBehaviorEvidence(species.id))
  )).length,
  highSignalResearchQueueCount: queue.length,
  topResearchQueue: queue.slice(0, 30),
};

console.log(JSON.stringify(summary, null, 2));
console.log('compatibility evidence gap audit passed: research priorities are generated from catalog signals only, never consumed as runtime compatibility evidence');
