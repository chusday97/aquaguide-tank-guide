import assert from 'node:assert/strict';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import {
  isSpeciesDecisionReady,
  LAUNCH_COHORT_TARGET,
  selectCompatibilityLaunchCohort,
} from '../src/data/compatibility-launch-cohort';

const first = selectCompatibilityLaunchCohort();
const second = selectCompatibilityLaunchCohort();
const firstIds = first.map(species => species.id);
const secondIds = second.map(species => species.id);

assert.equal(first.length, LAUNCH_COHORT_TARGET, 'launch cohort must contain exactly the planned review batch size');
assert.equal(new Set(firstIds).size, first.length, 'launch cohort IDs must be unique');
assert.deepEqual(firstIds, secondIds, 'launch cohort ordering must be deterministic');
for (const reviewedId of getCompatibilityEvidenceAudit().reviewedSpeciesIds) {
  assert.equal(isSpeciesDecisionReady(reviewedId), true, `reviewed species ${reviewedId} must be decision-ready whether or not it remains in the frozen research cohort`);
}
assert.equal(isSpeciesDecisionReady('sp_0258'), true, 'Betta ornamental variant must inherit the explicitly reviewed Betta splendens base-species authority');
assert.equal(isSpeciesDecisionReady('unreviewed-launch-candidate'), false, 'cohort membership cannot grant decision readiness');

console.log(`compatibility launch cohort verified: ${first.length} deterministic research targets; readiness remains evidence-gated`);
