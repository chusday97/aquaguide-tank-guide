import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
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

type CompatibilityResearchOutcome = {
  researchGroupKey: string;
  representativeSpeciesId: string;
  status: 'no_pair_evidence_found_in_reviewed_search';
  reviewedAt: string;
  retryAfter: string;
  scope: 'exact_species_pair_level_evidence';
  runtimeEvidencePropagation: 'none';
};

const BEHAVIOR_TEXT_SIGNAL = /捕食|吞食|活鱼|肉食|鱼食|凶猛|攻击|领地|单养|predat|piscivor|carnivor|aggress|territor|solitary/i;
const HIGH_CONSEQUENCE_ROLE_SIGNAL = /雷龙|龙鱼|古代鱼|慈鲷|狮子鱼|炮弹|海水神仙|蝶鱼|大型/i;
const RESEARCH_OUTCOME_PATH = new URL('../evaluation/product/compatibility-research-outcomes.v1.jsonl', import.meta.url);
const AUDIT_AS_OF = process.env.COMPAT_RESEARCH_AS_OF || new Date().toISOString().slice(0, 10);

const parseResearchOutcomes = (): CompatibilityResearchOutcome[] => (
  readFileSync(RESEARCH_OUTCOME_PATH, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => JSON.parse(line) as CompatibilityResearchOutcome)
);

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

const speciesById = new Map(fishData.map(species => [species.id, species] as const));

const reviewedProfileGroupKeys = new Set(
  fishData
    .filter(species => Boolean(getReviewedCompatibilityProfile(species.id)))
    .map(getResearchGroupKey),
);

const reviewedPairGroupKeys = new Set(
  getCompatibilityEvidenceAudit().reviewedPairRules.flatMap(rule => (
    rule.speciesIds.flatMap(speciesId => {
      const species = speciesById.get(speciesId);
      return species ? [getResearchGroupKey(species)] : [];
    })
  )),
);

const completedResearchGroupKeys = new Set([
  ...reviewedProfileGroupKeys,
  ...reviewedPairGroupKeys,
]);

const researchOutcomes = parseResearchOutcomes();
researchOutcomes.forEach(outcome => {
  assert.equal(outcome.runtimeEvidencePropagation, 'none', 'research outcomes must never propagate into runtime evidence');
  assert.match(outcome.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, 'research outcome reviewedAt must be YYYY-MM-DD');
  assert.match(outcome.retryAfter, /^\d{4}-\d{2}-\d{2}$/, 'research outcome retryAfter must be YYYY-MM-DD');
  assert.ok(outcome.retryAfter > outcome.reviewedAt, 'retryAfter must be later than reviewedAt');
});
assert.equal(new Set(researchOutcomes.map(outcome => outcome.researchGroupKey)).size, researchOutcomes.length, 'research outcome groups must be unique');

const deferredResearchGroupKeys = new Set(
  researchOutcomes
    .filter(outcome => outcome.status === 'no_pair_evidence_found_in_reviewed_search' && outcome.retryAfter > AUDIT_AS_OF)
    .map(outcome => outcome.researchGroupKey),
);

export const buildCompatibilityEvidenceResearchQueue = (): CompatibilityEvidenceResearchPriority[] => {
  const candidates = fishData.flatMap<Omit<CompatibilityEvidenceResearchPriority, 'catalogVariantCount'>>(species => {
    const lifeType = getLifeType(species);
    if (lifeType === 'plant' || lifeType === 'hardscape') return [];

    const researchGroupKey = getResearchGroupKey(species);
    if (completedResearchGroupKeys.has(researchGroupKey) || deferredResearchGroupKeys.has(researchGroupKey)) return [];

    const researchSignals = researchSignalsFor(species);
    const priorityScore = scoreSignals(researchSignals);
    if (priorityScore <= 0) return [];

    return [{
      speciesId: species.id,
      name: species.name,
      scientificName: species.scientificName,
      researchGroupKey,
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
assert.ok(queue.every(item => !completedResearchGroupKeys.has(item.researchGroupKey)), 'a completed base-species research group must never re-enter breadth fallback through another catalog variant');
assert.ok(queue.every(item => !deferredResearchGroupKeys.has(item.researchGroupKey)), 'a recently reviewed no-evidence group must stay deferred until retryAfter');
assert.ok(queue.every(item => item.lifeType !== 'plant' && item.lifeType !== 'hardscape'), 'plants and hardscape must stay out of animal compatibility research');
assert.ok(queue.every(item => item.priorityScore > 0 && item.researchSignals.length > 0), 'every research priority needs an explicit catalog signal');
assert.equal(new Set(queue.map(item => item.researchGroupKey)).size, queue.length, 'base-species research groups must be unique so catalog variants cannot crowd the queue');
assert.ok(queue.some(item => item.catalogVariantCount > 1), 'the audit should prove at least one catalog variety was collapsed into a base-species research group');
assert.ok(reviewedProfileGroupKeys.has('Channa asiatica'), 'regression fixture requires Channa asiatica to be complete through a reviewed species profile');
assert.ok(reviewedPairGroupKeys.has('Astronotus ocellatus'), 'regression fixture requires Astronotus ocellatus to be complete through reviewed pair evidence');
assert.ok(reviewedPairGroupKeys.has('Channa argus'), 'regression fixture requires Channa argus to be complete through reviewed pair evidence');
assert.ok(deferredResearchGroupKeys.has('Channa aurantimaculata'), 'regression fixture requires Channa aurantimaculata to be deferred after a reviewed no-pair-evidence search');
assert.ok(!queue.some(item => item.researchGroupKey === 'Channa asiatica'), 'reviewed Channa asiatica must not re-enter fallback through an unreviewed variety');
assert.ok(!queue.some(item => item.researchGroupKey === 'Astronotus ocellatus'), 'researched Astronotus ocellatus must not remain at the front of breadth fallback after direct pair evidence lands');
assert.ok(!queue.some(item => item.researchGroupKey === 'Channa argus'), 'researched Channa argus must not remain at the front of breadth fallback after direct pair evidence lands');
assert.ok(!queue.some(item => item.researchGroupKey === 'Channa aurantimaculata'), 'recently reviewed Channa aurantimaculata must not immediately consume another breadth-research cycle');

const summary = {
  policy: 'research_only_not_runtime_evidence',
  rankingSource: 'catalog_risk_signals_fallback_until_pair_usage_is_sufficient',
  deduplication: 'base_binomial_scientific_name',
  completedGroupExclusion: 'exclude_base_species_with_reviewed_profile_or_reviewed_pair_rule',
  noEvidenceDeferral: 'exclude_recent_reviewed_no_pair_evidence_until_retry_after',
  auditAsOf: AUDIT_AS_OF,
  runtimeEvidencePropagation: 'none_research_backlog_only',
  catalogAnimalCount: fishData.filter(species => !['plant', 'hardscape'].includes(getLifeType(species))).length,
  directReviewedProfileCount: fishData.filter(species => Boolean(getReviewedCompatibilityProfile(species.id))).length,
  reviewedProfileGroupCount: reviewedProfileGroupKeys.size,
  reviewedPairGroupCount: reviewedPairGroupKeys.size,
  completedResearchGroupCount: completedResearchGroupKeys.size,
  deferredNoEvidenceResearchGroupCount: deferredResearchGroupKeys.size,
  highSignalCatalogEntryCount: fishData.filter(species => {
    const lifeType = getLifeType(species);
    const researchGroupKey = getResearchGroupKey(species);
    return lifeType !== 'plant'
      && lifeType !== 'hardscape'
      && !completedResearchGroupKeys.has(researchGroupKey)
      && !deferredResearchGroupKeys.has(researchGroupKey)
      && scoreSignals(researchSignalsFor(species)) > 0;
  }).length,
  highSignalResearchGroupCount: queue.length,
  topResearchQueue: queue.slice(0, 30),
};

console.log(JSON.stringify(summary, null, 2));
console.log('compatibility evidence priority audit passed: completed and recently reviewed no-evidence base-species groups stay out of breadth fallback, catalog variants are deduplicated, and no evidence is propagated into runtime verdicts');
