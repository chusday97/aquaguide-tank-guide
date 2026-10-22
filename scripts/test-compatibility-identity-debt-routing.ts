import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildCompatibilityIdentityDebtRoutingReport } from '../src/services/compatibility/compatibility-identity-debt-routing.service';

const report = buildCompatibilityIdentityDebtRoutingReport();
const { summary } = report;

assert.equal(summary.identityFirstSpecies, 157);
assert.equal(summary.variantLikeSpecies, 130);
assert.equal(summary.exactOrUnparsedSpecies, 27);
assert.equal(summary.reviewedEvidenceCeilingSpecies, 15);
assert.equal(summary.actionableIdentityReviewSpecies, 142);
assert.equal(summary.canonicalBridgePresentSpecies, 0, 'identity-first objects must not already have a reviewed canonical bridge');
assert.equal(summary.multiObjectParentClusters, 32);
assert.equal(summary.speciesInMultiObjectParentClusters, 108);
assert.ok(summary.activeBatchReviewClusters > 0);

assert.ok(report.items.every(item => item.candidateForAutomaticBridge === false));
assert.ok(report.clusters.every(cluster => cluster.candidateForAutomaticBridge === false));
assert.ok(report.items
  .filter(item => item.stage === 'reviewed_evidence_ceiling')
  .every(item => item.nextAction === 'keep_identity_hold_until_new_exact_evidence'));
assert.ok(report.items
  .filter(item => item.stage !== 'reviewed_evidence_ceiling')
  .every(item => item.nextAction === 'review_exact_object_identity_with_parent_taxon_context'));

const multi = report.clusters.filter(cluster => cluster.catalogObjectCount >= 2);
assert.equal(multi.length, 32);
assert.equal(multi.reduce((count, cluster) => count + cluster.catalogObjectCount, 0), 108);
assert.ok(multi.some(cluster => cluster.candidateBaseScientificName === 'Gymnocorymbus ternetzi' && cluster.catalogObjectCount === 9));
assert.ok(multi.some(cluster => cluster.candidateBaseScientificName === 'Betta splendens' && cluster.catalogObjectCount === 7));

const artifact = JSON.parse(readFileSync('docs/compatibility_identity_debt_routing.json', 'utf8')) as ReturnType<typeof buildCompatibilityIdentityDebtRoutingReport> & { generatedFrom?: string; generatedAt?: string };
assert.equal(artifact.generatedAt, undefined);
assert.equal(artifact.generatedFrom, 'compatibility_research_debt_routing.json');
assert.equal(artifact.policy, report.policy);
assert.deepEqual(artifact.summary, report.summary);
assert.deepEqual(artifact.items, report.items);
assert.deepEqual(artifact.clusters, report.clusters);

console.log('PASS fish identity debt is separated from non-fish domain debt');
console.log('PASS repeated parent taxa are batched for research context without automatic identity promotion');
console.log('PASS reviewed identity evidence ceilings are excluded from blind repeat research');
