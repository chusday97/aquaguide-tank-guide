import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { fishData } from '../src/data/fishData';
import {
  buildIdentityBulkPreparation,
  isExactBinomialTaxon,
} from '../src/services/compatibility/identity-bulk-research.service';
import {
  buildCompatibilityIdentityBulkQueue,
} from '../src/services/compatibility/compatibility-identity-bulk-plan.service';

const report = buildCompatibilityIdentityBulkQueue();
assert.equal(report.summary.identityDebtSpecies, 157);
assert.equal(report.summary.evidenceCeilingSpecies, 15);
assert.equal(report.summary.automatedResearchEligible, 43);
assert.equal(report.summary.manualOrStructuralReview, 114);
assert.equal(report.summary.automatedParentGroups, 18);
assert.equal(report.promotionAllowed, false);
assert.equal(report.writesAuthority, false);

const automated = report.items.filter(item => item.automatedResearchAllowed);
assert.equal(automated.length, 43);
assert.ok(automated.every(item => item.queue === 'exact_object_identity_research'));
assert.ok(automated.every(item => item.readyBaseSpeciesIds.length > 0));
assert.ok(automated.every(item => item.baseCandidateSpeciesIds.length > 0));
assert.ok(report.items
  .filter(item => item.queue === 'evidence_ceiling_hold')
  .every(item => item.automatedResearchAllowed === false));

const preparation = buildIdentityBulkPreparation(report, fishData);
assert.equal(preparation.items.length, 43);
assert.equal(preparation.uniqueBaseCandidateNames.length, 18);
assert.ok(preparation.uniqueBaseCandidateNames.every(isExactBinomialTaxon));
assert.equal(new Set(preparation.items.map(item => item.speciesId)).size, 43);
assert.ok(preparation.items.every(item => item.hasDeterministicBaseCandidate));

const artifact = JSON.parse(readFileSync('docs/compatibility_identity_bulk_queue.json', 'utf8'));
assert.equal(artifact.generatedAt, undefined);
assert.equal(artifact.generatedFrom, 'compatibility_identity_debt_routing.json');
assert.deepEqual(artifact.summary, report.summary);
assert.deepEqual(artifact.policy, report.policy);
assert.deepEqual(artifact.items, report.items);

console.log('PASS reviewed-ready exact parents unlock 43 safe grouped identity research objects');
console.log('PASS 114 evidence-ceiling/manual/structural objects stay out of automated identity research');
console.log('PASS bulk queue remains draft-only and cannot create identity bridges or inheritance');
