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
const blocked = leverage.terminalBlockedTaxonQueue ?? [];
const summary = leverage.taxonQueueSummary;

assert.equal(summary.totalResearchJobs, plan.length);
assert.equal(summary.completionEligibleJobs + summary.terminalBlockedJobs, summary.totalResearchJobs);
assert.equal(summary.completionEligibleCatalogObjects + summary.terminalBlockedCatalogObjects, plan.reduce((sum, job) => sum + job.catalogObjectCount, 0));

assert.equal(summary.totalResearchJobs, 57, 'current source-controlled checkpoint must retain 57 actionable base-taxon jobs');
assert.equal(summary.completionEligibleJobs, 20, 'only 20 jobs can currently finish without a terminal hold');
assert.equal(summary.terminalBlockedJobs, 37, '37 jobs must remain outside the active completion queue');
assert.equal(summary.completionEligibleCatalogObjects, 22);
assert.equal(summary.terminalBlockedCatalogObjects, 80);

assert.equal(allQueue.length, summary.totalResearchJobs);
assert.deepEqual(allQueue.slice(0, eligible.length), eligible, 'all completion-eligible jobs must rank ahead of terminal-blocked work');
assert.deepEqual(allQueue.slice(eligible.length), blocked, 'terminal-blocked work must remain a separate tail queue');

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

const expectedFastLane = [
  'Gymnocorymbus ternetzi',
  'Otocinclus vittatus',
  'Petitella rhodostoma',
  'Xiphophorus maculatus',
];
assert.deepEqual(
  eligible.slice(0, 4).map((item: { researchKey: string }) => item.researchKey),
  expectedFastLane,
  'the four 7/8 predation Fast Lane taxa must remain the highest completion-eligible queue',
);
for (const item of eligible.slice(0, 4)) {
  assert.ok(item.affectedUnknownPairs > 0, 'Fast Lane taxon must still participate in current UNKNOWN pairs');
  assert.equal(item.gapInstances, 1);
  assert.equal(item.impactPerGap, item.affectedUnknownPairs, 'single-gap Fast Lane impact-per-gap must track the current dynamic pair impact');
  assert.equal(item.nearReadyCatalogObjects, 1);
}

const hemigrammusRodwayi = blocked.find((item: { researchKey: string }) => item.researchKey === 'Hemigrammus rodwayi');
assert.ok(hemigrammusRodwayi, 'Hemigrammus rodwayi must remain outside the completion queue while reviewed social/territorial/predation ceilings are terminally held');
assert.deepEqual(hemigrammusRodwayi.combinedGapFields, ['water']);
assert.equal(hemigrammusRodwayi.terminalGapInstances, 3);
assert.ok(hemigrammusRodwayi.affectedUnknownPairs > 0, 'terminal-blocked work should retain observable UNKNOWN-pair impact without freezing a stale pair count');

assert.equal(audit.fullyInformedUnknownPairs, 0, 'fully informed compatibility pairs must never collapse to UNKNOWN');

console.log(
  'Compatibility decision-impact queue PASS:',
  JSON.stringify({
    total: summary.totalResearchJobs,
    completionEligible: summary.completionEligibleJobs,
    terminalBlocked: summary.terminalBlockedJobs,
    completionEligibleCatalogObjects: summary.completionEligibleCatalogObjects,
    terminalBlockedCatalogObjects: summary.terminalBlockedCatalogObjects,
    fastLane: expectedFastLane,
  }),
);
