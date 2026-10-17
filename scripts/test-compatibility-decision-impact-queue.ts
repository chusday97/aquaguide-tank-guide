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
assert.equal(hemigrammusRodwayiRow.actionableGapCount, 0, 'terminal evidence ceilings must not be re-queued as ordinary research');
assert.equal(hemigrammusRodwayiRow.terminalGapCount, 3);
assert.deepEqual(
  ['social_behavior', 'territoriality', 'predation'].filter(field => hemigrammusRodwayiRow.fields[field]?.disposition === 'terminal_hold'),
  ['social_behavior', 'territoriality', 'predation'],
);
assert.equal(plan.find(item => item.researchKey === 'Hemigrammus rodwayi'), undefined, 'terminal-only Hemigrammus rodwayi work must stay out of the actionable taxon research plan');
assert.equal(blocked.find((item: { researchKey: string }) => item.researchKey === 'Hemigrammus rodwayi'), undefined, 'terminal-only work is represented by coverage terminal holds, not a repeated research job');

assert.equal(audit.fullyInformedUnknownPairs, 0, 'fully informed compatibility pairs must never collapse to UNKNOWN');

console.log(
  'Compatibility decision-impact queue PASS:',
  JSON.stringify({
    total: summary.totalResearchJobs,
    completionEligible: summary.completionEligibleJobs,
    terminalBlocked: summary.terminalBlockedJobs,
    completionEligibleCatalogObjects: summary.completionEligibleCatalogObjects,
    terminalBlockedCatalogObjects: summary.terminalBlockedCatalogObjects,
    fastLane: fastLane.map((item: { researchKey: string }) => item.researchKey),
  }),
);
