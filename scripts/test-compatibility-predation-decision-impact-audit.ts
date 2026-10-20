import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  COMPATIBILITY_HARD_DECISION_FIELDS,
  buildCompatibilityCoreFieldCoverage,
} from '../src/services/compatibility/compatibility-field-coverage.service';

const report = JSON.parse(readFileSync('docs/compatibility_predation_decision_impact_audit.json', 'utf8'));
const coverage = buildCompatibilityCoreFieldCoverage();
const predationBacklog = coverage.backlog.filter(item => item.field === 'predation');

assert.deepEqual(report.policy.hardDecisionFields, [...COMPATIBILITY_HARD_DECISION_FIELDS]);
assert.equal(report.policy.noCounterfactualAuthority, true);
assert.equal(predationBacklog.length, 56);
assert.equal(coverage.summary.hardDecisionResearchDebtFields, 0);
assert.equal(coverage.summary.softRiskDiscoveryResearchDebtFields, 56);
assert.equal(report.summary.predationResearchBacklogFields, predationBacklog.length);
assert.equal(report.summary.hardDecisionResearchDebtFields, 0);
assert.equal(report.summary.softRiskDiscoveryResearchDebtFields, 56);
assert.equal(report.summary.riskDiscoveryReadyCatalogObjects, 5);
assert.equal(report.summary.blockedByIdentityOrVariantCatalogObjects, 49);
assert.equal(report.summary.blockedByOtherHardEvidenceCatalogObjects, 2);
assert.equal(report.summary.currentPredationHardInsufficientDataBlockerFields, 0);
assert.equal(
  report.summary.riskDiscoveryReadyCatalogObjects
    + report.summary.blockedByIdentityOrVariantCatalogObjects
    + report.summary.blockedByOtherHardEvidenceCatalogObjects,
  56,
);

assert.equal(report.riskDiscoveryReady.length, 5);
for (const item of report.riskDiscoveryReady) {
  assert.deepEqual(item.hardHolds, [], `${item.speciesId} risk-discovery candidate must have no unresolved hard decision field`);
  assert.equal(item.pairSurface.totalCounterpartPairs, 307);
  assert.equal(
    item.pairSurface.compatible + item.pairSurface.caution + item.pairSurface.not_recommended + item.pairSurface.insufficient_data,
    307,
    `${item.speciesId} pair surface must partition all fish-domain counterparts`,
  );
  assert.equal(
    item.pairSurface.riskManagementReviewSurfacePairs,
    item.pairSurface.compatible + item.pairSurface.caution,
  );
  assert.ok(item.pairSurface.smallFishReviewSurfacePairs <= item.pairSurface.riskManagementReviewSurfacePairs);
}

for (const item of report.blockedByIdentityOrVariant) {
  assert.ok(item.hardHolds.length > 0);
  assert.ok(item.hardHolds.every((hold: { authoritySource: string }) => (
    hold.authoritySource === 'identity_boundary' || hold.authoritySource === 'variant_evidence_ceiling'
  )));
}
for (const item of report.blockedByOtherHardEvidence) {
  assert.ok(item.hardHolds.length > 0);
  assert.ok(item.hardHolds.some((hold: { authoritySource: string }) => (
    hold.authoritySource !== 'identity_boundary' && hold.authoritySource !== 'variant_evidence_ceiling'
  )));
}

assert.equal(report.summary.riskDiscoveryReadyUniqueTaxa, report.taxonResearchPriority.length);
assert.equal(report.summary.riskDiscoveryReadyUniqueTaxa, report.summary.riskDiscoveryReadyCatalogObjects, 'the five remaining low-surface hard-ready objects are all unique taxa after wave36 closes the duplicated high-impact Semaprochilodus research');
assert.ok(report.taxonResearchPriority.every((item: { catalogObjectCount: number }) => item.catalogObjectCount >= 1));

console.log(`Compatibility predation decision-impact audit PASS: ${report.summary.predationResearchBacklogFields} predation gaps split into ${report.summary.riskDiscoveryReadyCatalogObjects} hard-ready risk-discovery objects / ${report.summary.blockedByIdentityOrVariantCatalogObjects} identity-or-variant held / ${report.summary.blockedByOtherHardEvidenceCatalogObjects} other hard-held, with zero current hard insufficient-data blocker fields.`);
