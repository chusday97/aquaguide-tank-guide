import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getLifeType, getSecondaryCategory } from '../src/modules/species/species.service';

export type CompatibilityEvidenceResearchPriority = {
  speciesId: string;
  name: string;
  scientificName: string;
  researchGroupKey: string;
  lifeType: ReturnType<typeof getLifeType>;
  role: string;
  priorityScore: number;
  researchSignals: string[];
  catalogVariantCount: number;
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

const getResearchGroupKey = (species: (typeof fishData)[number]) => {
  const scientificName = species.scientificName.trim();
  const binomial = scientificName.match(/^([A-Z][A-Za-z-]+)\s+([a-z][A-Za-z-]+)/);
  return binomial ? `${binomial[1]} ${binomial[2]}` : `catalog:${species.id}`;
};

export const buildCompatibilityEvidenceResearchQueue = (): CompatibilityEvidenceResearchPriority[] => {
  const candidates = fishData.flatMap<Omit<CompatibilityEvidenceResearchPriority, 'catalogVariantCount'>>(species => {
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
      researchGroupKey: getResearchGroupKey(species),
      lifeType,
      role: getSecondaryCategory(species),
      priorityScore,
      researchSignals,
    }];
  });

  const groups = new Map<string, typeof candidates>();
  candidates.forEach(candidate => {
    const group = groups.get(candidate.researchGroupKey) || [];
    group.push(candidate);
    groups.set(candidate.researchGroupKey, group);
  });

  return Array.from(groups.values())
    .map(group => {
      const representative = [...group].sort((left, right) => (
        right.priorityScore - left.priorityScore
        || left.speciesId.localeCompare(right.speciesId)
      ))[0];
      return {
        ...representative,
        researchSignals: Array.from(new Set(group.flatMap(item => item.researchSignals))).sort(),
        priorityScore: Math.max(...group.map(item => item.priorityScore)),
        catalogVariantCount: group.length,
      };
    })
    .sort((left, right) => (
      right.priorityScore - left.priorityScore
      || left.researchGroupKey.localeCompare(right.researchGroupKey)
      || left.speciesId.localeCompare(right.speciesId)
    ));
};

const queue = buildCompatibilityEvidenceResearchQueue();
assert.ok(queue.length > 0, 'research-only evidence queue should identify at least one unreviewed high-signal animal');
assert.ok(queue.every(item => !getReviewedCompatibilityProfile(item.speciesId)), 'reviewed deterministic profiles must never re-enter the research queue');
assert.ok(queue.every(item => item.lifeType !== 'plant' && item.lifeType !== 'hardscape'), 'plants and hardscape must stay out of animal compatibility research');
assert.ok(queue.every(item => item.priorityScore > 0 && item.researchSignals.length > 0), 'every research priority needs an explicit catalog signal');
assert.equal(new Set(queue.map(item => item.researchGroupKey)).size, queue.length, 'base-species research groups must be unique so catalog variants cannot crowd the queue');
assert.ok(queue.some(item => item.catalogVariantCount > 1), 'the audit should prove at least one catalog variety was collapsed into a base-species research group');

const summary = {
  policy: 'research_only_not_runtime_evidence',
  rankingSource: 'catalog_risk_signals_fallback_until_pair_usage_is_sufficient',
  deduplication: 'base_binomial_scientific_name',
  catalogAnimalCount: fishData.filter(species => !['plant', 'hardscape'].includes(getLifeType(species))).length,
  directReviewedProfileCount: fishData.filter(species => Boolean(getReviewedCompatibilityProfile(species.id))).length,
  highSignalCatalogEntryCount: fishData.filter(species => {
    const lifeType = getLifeType(species);
    return lifeType !== 'plant' && lifeType !== 'hardscape' && !getReviewedCompatibilityProfile(species.id) && scoreSignals(researchSignalsFor(species)) > 0;
  }).length,
  highSignalResearchGroupCount: queue.length,
  topResearchQueue: queue.slice(0, 30),
};

console.log(JSON.stringify(summary, null, 2));
console.log('compatibility evidence priority audit passed: catalog signals rank deduplicated research groups only and are never consumed as runtime compatibility evidence');
