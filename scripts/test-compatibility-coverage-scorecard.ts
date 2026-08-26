import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import type { Aquarium } from '../src/types';

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

const priorityIds = ['sp_0431', 'sp_0432', 'sp_0434', 'sp_0436'];
const directionStatuses: Record<string, number> = {};
let recordableDirections = 0;

for (const existingId of priorityIds) {
  for (const candidateId of priorityIds) {
    if (existingId === candidateId) continue;
    const existing = fishData.find(species => species.id === existingId);
    const candidate = fishData.find(species => species.id === candidateId);
    assert.ok(existing && candidate, 'priority species must exist in the catalog');
    const decision = evaluateCompatibilityDecision({
      tank,
      items: [
        { species: existing, quantity: existingId === 'sp_0431' ? 6 : 2, origin: 'existing' },
        { species: candidate, quantity: candidateId === 'sp_0432' ? 6 : 1, origin: 'candidate' },
      ],
    });
    const pair = decision.pairResults[0];
    assert.ok(pair, `${existing.name} → ${candidate.name} must produce a pair result`);
    directionStatuses[pair.status] = (directionStatuses[pair.status] || 0) + 1;
    if (pair.status === 'compatible' || pair.status === 'caution') {
      recordableDirections += 1;
      assert.ok(getReviewedCompatibilityProfile(existing.id));
      assert.ok(getReviewedCompatibilityProfile(candidate.id));
      assert.equal(
        pair.rawResult.missingData.some(rule => rule.severity === 'high' || rule.severity === 'medium'),
        false,
        `${existing.name} → ${candidate.name} must not be recordable with unresolved high/medium evidence gaps`,
      );
    }
  }
}

const evidenceAudit = getCompatibilityEvidenceAudit();
assert.ok(fishData.length >= 501);
assert.ok(evidenceAudit.reviewedSpeciesIds.length >= 7);
assert.ok(evidenceAudit.reviewedPairRules.length >= 4);
assert.equal(recordableDirections, 2, 'only the explicit tetra pair directions are recordable in the priority cohort');

console.log(JSON.stringify({
  decisionEngine: 'stable_under_regression',
  catalogObjects: fishData.length,
  reviewedSpeciesProfiles: evidenceAudit.reviewedSpeciesIds.length,
  reviewedPairRules: evidenceAudit.reviewedPairRules.length,
  priorityDirections: priorityIds.length * (priorityIds.length - 1),
  recordablePriorityDirections: recordableDirections,
  priorityStatuses: directionStatuses,
  claimBoundary: 'CI green means fail-closed behavior is stable; it does not mean broad compatibility knowledge coverage is complete.',
}, null, 2));
