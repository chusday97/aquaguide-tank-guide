import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildCompatibilityCoreFieldCoverage,
  buildCompatibilityTaxonResearchPlan,
} from '../src/services/compatibility/compatibility-field-coverage.service';

const audit = JSON.parse(readFileSync('docs/compatibility_decision_audit.json', 'utf8'));
const leverage = audit.leverageQueues;
assert.ok(leverage, 'decision audit must expose leverage queues');

const plan = buildCompatibilityTaxonResearchPlan();
const coverage = buildCompatibilityCoreFieldCoverage();
const rows = new Map(coverage.rows.map(row => [row.speciesId, row]));

const allQueue = leverage.taxonDecisionImpactQueue ?? [];
const eligible = leverage.completionEligibleTaxonQueue ?? [];
const variantEvidence = leverage.variantObjectEvidenceTaxonQueue ?? [];
const blocked = leverage.terminalBlockedTaxonQueue ?? [];
const summary = leverage.taxonQueueSummary;

assert.equal(summary.totalResearchJobs, plan.length);
assert.equal(summary.completionEligibleJobs + summary.variantObjectEvidenceBlockedJobs + summary.terminalBlockedJobs, summary.totalResearchJobs);
assert.equal(
  summary.completionEligibleCatalogObjects + summary.variantObjectEvidenceBlockedCatalogObjects + summary.terminalBlockedCatalogObjects,
  plan.reduce((sum, job) => sum + job.catalogObjectCount, 0),
);
assert.equal(summary.totalResearchJobs, 4);
assert.equal(summary.completionEligibleJobs, 0);
assert.equal(summary.variantObjectEvidenceBlockedJobs, 4);
assert.equal(summary.terminalBlockedJobs, 0);
assert.equal(summary.completionEligibleCatalogObjects, 0);
assert.equal(summary.variantObjectEvidenceBlockedCatalogObjects, 9);
assert.equal(summary.terminalBlockedCatalogObjects, 0);


assert.equal(allQueue.length, summary.totalResearchJobs);
assert.deepEqual(allQueue.slice(0, eligible.length), eligible, 'completion-eligible work must lead the queue');
assert.deepEqual(allQueue.slice(eligible.length, eligible.length + variantEvidence.length), variantEvidence, 'variant object-evidence work must remain a distinct middle lane');
assert.deepEqual(allQueue.slice(eligible.length + variantEvidence.length), blocked, 'terminal-blocked work must remain a separate tail queue');
for (const item of variantEvidence) {
  assert.equal(item.completionEligible, false);
  assert.equal(item.variantObjectEvidenceBlocked, true);
  assert.equal(item.canCompleteFromBaseTaxonResearch, false);
  assert.deepEqual(item.combinedGapFields, ['water', 'temperature', 'ph']);
  assert.deepEqual(item.exactObjectEvidenceGapFields, ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
}

for (const item of eligible) {
  assert.equal(item.completionEligible, true);
  assert.equal(item.terminalGapInstances, 0);
  const job = plan.find(candidate => candidate.researchKey === item.researchKey);
  assert.ok(job, 'eligible queue item must resolve to a taxon research job: ' + item.researchKey);
  assert.ok(job.catalogObjects.every(object => (rows.get(object.speciesId)?.terminalGapCount ?? 0) === 0));
}

for (const item of blocked) {
  assert.equal(item.completionEligible, false);
  assert.ok(item.terminalGapInstances > 0);
}

const maxEligibleImpact = eligible.reduce((max: number, item: { affectedUnknownPairs: number }) => Math.max(max, item.affectedUnknownPairs), 0);
const fastLane = eligible.filter((item: { affectedUnknownPairs: number; gapInstances: number; nearReadyCatalogObjects: number }) => (
  item.affectedUnknownPairs === maxEligibleImpact
  && item.affectedUnknownPairs > 0
  && item.gapInstances === 1
  && item.nearReadyCatalogObjects > 0
));
const hasNearReadySingleGapWork = eligible.some((item: { affectedUnknownPairs: number; gapInstances: number; nearReadyCatalogObjects: number }) => (
  item.affectedUnknownPairs > 0
  && item.gapInstances === 1
  && item.nearReadyCatalogObjects > 0
));
if (hasNearReadySingleGapWork) {
  assert.ok(fastLane.length > 0, 'current decision-impact audit must surface high-impact near-ready single-gap taxa when such work exists');
  assert.deepEqual(
    eligible.slice(0, fastLane.length).map((item: { researchKey: string }) => item.researchKey),
    fastLane.map((item: { researchKey: string }) => item.researchKey),
    'highest-impact near-ready single-gap taxa must lead the completion-eligible queue dynamically',
  );
} else {
  assert.equal(fastLane.length, 0, 'Fast Lane must be empty when there is no actionable near-ready single-gap research');
}
for (const item of fastLane) {
  assert.equal(item.impactPerGap, item.affectedUnknownPairs, 'single-gap Fast Lane impact-per-gap must track the current dynamic pair impact');
}

const hemigrammusRodwayiRow = rows.get('sp_0362');
assert.ok(hemigrammusRodwayiRow, 'Hemigrammus rodwayi coverage row must remain observable');
assert.equal(hemigrammusRodwayiRow.actionableGapCount, 0, 'reviewed Hemigrammus rodwayi authority must not re-enter ordinary research');
assert.equal(hemigrammusRodwayiRow.terminalGapCount, 0, 'exact-taxon reviewed behavior authority must clear the former terminal behavior holds');
assert.deepEqual(
  ['social_behavior', 'territoriality', 'predation'].filter(field => hemigrammusRodwayiRow.fields[field]?.disposition === 'ready'),
  ['social_behavior', 'territoriality', 'predation'],
);
assert.equal(plan.find(item => item.researchKey === 'Hemigrammus rodwayi'), undefined, 'completed Hemigrammus rodwayi authority must stay out of the actionable taxon research plan');
assert.equal(blocked.find((item: { researchKey: string }) => item.researchKey === 'Hemigrammus rodwayi'), undefined, 'completed work must not remain in the blocked research queue');

assert.equal(audit.fullyInformedUnknownPairs, 0, 'fully informed compatibility pairs must never collapse to UNKNOWN');
assert.equal(audit.systemGapPairs, 0, 'complete-input pair audit must not contain unexplained system-gap UNKNOWN results');
assert.equal(audit.unknownReasons?.system_gap, 0, 'all UNKNOWN outcomes must map to an explicit product/evidence boundary');
assert.equal(audit.unknownReasons?.missing_species_fact, 0, 'internal species-review backlog must never surface as a user-facing UNKNOWN');
assert.equal(audit.unknownReasons?.missing_user_input, 0, 'complete synthetic tank inputs must not be mislabeled as missing user input');
assert.equal(
  (audit.unknownReasons?.unresolved_identity || 0) + (audit.unknownReasons?.public_evidence_insufficient || 0),
  audit.statuses?.insufficient_data,
  'with complete tank inputs, every UNKNOWN must be explained only by unresolved identity or genuinely insufficient public evidence',
);

console.log(
  'Compatibility decision-impact queue PASS:',
  JSON.stringify({
    total: summary.totalResearchJobs,
    completionEligible: summary.completionEligibleJobs,
    variantObjectEvidenceBlocked: summary.variantObjectEvidenceBlockedJobs,
    terminalBlocked: summary.terminalBlockedJobs,
    completionEligibleCatalogObjects: summary.completionEligibleCatalogObjects,
    terminalBlockedCatalogObjects: summary.terminalBlockedCatalogObjects,
    fastLane: fastLane.map((item: { researchKey: string }) => item.researchKey),
  }),
);
