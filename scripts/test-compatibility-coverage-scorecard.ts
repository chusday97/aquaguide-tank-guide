import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getLifeType } from '../src/modules/species/species.service';
import type { Aquarium } from '../src/types';

const baseline = {
  catalogObjects: 486,
  reviewedSpeciesProfiles: 7,
  reviewedPairRules: 4,
  minimumRecordablePriorityDirections: 2,
} as const;

const priorityNames = ['红绿灯', '宝莲灯', '黑壳虾', '极火虾', '斑马螺', '咖啡鼠', '白云金丝', '孔雀鱼', '水晶虾'];
const eligibleSpecies = fishData.filter(species => !['plant', 'hardscape'].includes(getLifeType(species)));
const reviewedIds = getCompatibilityEvidenceAudit().reviewedSpeciesIds;
const reviewedPairRules = getCompatibilityEvidenceAudit().reviewedPairRules;
const prioritySpecies = eligibleSpecies.filter(species => priorityNames.includes(species.name));
const reviewedPrioritySpecies = prioritySpecies.filter(species => Boolean(getReviewedCompatibilityProfile(species.id)));

const tank: Aquarium = {
  id: 'compatibility-coverage-scorecard',
  name: 'Compatibility coverage scorecard',
  fishes: [],
  dimensions: { length: '60', width: '40', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  substrate: '水草泥',
  plants: [],
  hardscape: [],
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};

const directionStatuses: Record<string, number> = {};
let priorityDirections = 0;
let recordablePriorityDirections = 0;

for (const existing of prioritySpecies) {
  for (const candidate of prioritySpecies) {
    if (existing.id === candidate.id) continue;
    const decision = evaluateCompatibilityDecision({
      tank,
      items: [
        { species: existing, quantity: existing.id === 'sp_0431' ? 6 : 2, origin: 'existing' },
        { species: candidate, quantity: candidate.id === 'sp_0432' ? 6 : 1, origin: 'candidate' },
      ],
    });
    const pair = decision.pairResults[0];
    if (!pair) continue;
    priorityDirections += 1;
    directionStatuses[pair.status] = (directionStatuses[pair.status] || 0) + 1;
    if (pair.status === 'compatible' || pair.status === 'caution') {
      recordablePriorityDirections += 1;
      assert.ok(getReviewedCompatibilityProfile(existing.id), `recordable priority pair is missing reviewed evidence for ${existing.name}`);
      assert.ok(getReviewedCompatibilityProfile(candidate.id), `recordable priority pair is missing reviewed evidence for ${candidate.name}`);
    }
  }
}

assert.ok(fishData.length >= baseline.catalogObjects, 'catalog size unexpectedly shrank below the audited compatibility baseline');
assert.ok(reviewedIds.length >= baseline.reviewedSpeciesProfiles, 'reviewed compatibility species coverage regressed below baseline');
assert.ok(reviewedPairRules.length >= baseline.reviewedPairRules, 'reviewed pair-rule coverage regressed below baseline');
assert.ok(recordablePriorityDirections >= baseline.minimumRecordablePriorityDirections, 'priority compatibility matrix lost its reviewed recordable path');
assert.ok(reviewedIds.every(id => (getReviewedCompatibilityProfile(id)?.citations.length || 0) > 0), 'every reviewed species profile must keep at least one citation');
assert.ok(reviewedPairRules.every(rule => rule.citations.length > 0 && rule.reviewStatus === 'reviewed'), 'every reviewed pair rule must keep reviewed citations');

const catalogCoverage = fishData.length === 0 ? 0 : reviewedIds.length / fishData.length;
const eligibleCoverage = eligibleSpecies.length === 0 ? 0 : reviewedIds.filter(id => eligibleSpecies.some(species => species.id === id)).length / eligibleSpecies.length;
const priorityProfileCoverage = prioritySpecies.length === 0 ? 0 : reviewedPrioritySpecies.length / prioritySpecies.length;
const priorityRecordableCoverage = priorityDirections === 0 ? 0 : recordablePriorityDirections / priorityDirections;

const scorecard = {
  decisionEngine: 'stable_under_regression',
  goldenPathGp002: 'covered',
  knowledgeCoverage: 'limited',
  catalogObjects: fishData.length,
  compatibilityEligibleSpecies: eligibleSpecies.length,
  reviewedSpeciesProfiles: reviewedIds.length,
  reviewedPairRules: reviewedPairRules.length,
  catalogProfileCoveragePct: Number((catalogCoverage * 100).toFixed(2)),
  eligibleProfileCoveragePct: Number((eligibleCoverage * 100).toFixed(2)),
  prioritySpeciesCount: prioritySpecies.length,
  reviewedPrioritySpecies: reviewedPrioritySpecies.length,
  priorityProfileCoveragePct: Number((priorityProfileCoverage * 100).toFixed(2)),
  priorityDirections,
  recordablePriorityDirections,
  priorityRecordableCoveragePct: Number((priorityRecordableCoverage * 100).toFixed(2)),
  priorityStatuses: directionStatuses,
  claimBoundary: 'CI green means fail-closed behavior is stable; it does not mean broad compatibility knowledge coverage is complete.',
};

console.log(JSON.stringify(scorecard, null, 2));
