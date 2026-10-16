import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildCompatibilityResearchBatchWorkItem,
  selectCompatibilityResearchBatchJobs,
} from '../apps/api/src/compatibility-research-batch';
import {
  buildCompatibilityCoreFieldCoverage,
  buildCompatibilityTaxonResearchPlan,
} from '../src/services/compatibility/compatibility-field-coverage.service';
import type { CompatibilityOnboardingReviewPacket } from '../src/services/compatibility/onboarding-review-packet.service';

const fullPlan = buildCompatibilityTaxonResearchPlan();
const coverage = buildCompatibilityCoreFieldCoverage();
const rows = new Map(coverage.rows.map(row => [row.speciesId, row]));
const expectedActive = fullPlan.filter(job => job.catalogObjects.every(object => (
  (rows.get(object.speciesId)?.terminalGapCount ?? 0) === 0
)));
const selected = selectCompatibilityResearchBatchJobs('active_completion');
assert.equal(selected.sourcePlanJobs, fullPlan.length);
assert.deepEqual(selected.jobs.map(job => job.researchKey), expectedActive.map(job => job.researchKey));
assert.ok(selected.jobs.length > 0, 'active completion queue should contain current non-terminal research work');
assert.ok(selected.jobs.every(job => job.catalogObjects.every(object => (
  (rows.get(object.speciesId)?.terminalGapCount ?? 0) === 0
))), 'terminal-held catalog objects must never enter active completion research');

const packet = (gate: CompatibilityOnboardingReviewPacket['gate'], reasonCodes: string[] = []): CompatibilityOnboardingReviewPacket => ({
  kind: 'compatibility_onboarding',
  packetId: `packet-${gate}`,
  catalogKey: 'sp_fixture',
  scientificName: 'Fixtureus testus',
  status: gate === 'terminal_hold' ? 'terminal_hold' : gate === 'manual_review_required' ? 'ready_for_review' : 'research_pending',
  gate,
  readyFieldCount: gate === 'manual_review_required' ? 8 : 1,
  requiredFieldCount: 8,
  unresolvedFields: gate === 'manual_review_required' ? [] : ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality'],
  reasonCodes,
  fields: [],
  canApprove: gate === 'manual_review_required',
  writesAuthority: false,
});

assert.equal(buildCompatibilityResearchBatchWorkItem({ status: 'identity_hold', resourceLabel: 'A', reasonCodes: ['ambiguous'] }).queue, 'identity_review');
assert.equal(buildCompatibilityResearchBatchWorkItem({ status: 'provider_error', resourceLabel: 'A', reasonCodes: ['network'] }).queue, 'provider_retry');
assert.equal(buildCompatibilityResearchBatchWorkItem({ status: 'research_assessed', resourceLabel: 'A', reviewPacket: packet('manual_review_required') }).queue, 'manual_review');
assert.equal(buildCompatibilityResearchBatchWorkItem({
  status: 'research_assessed', resourceLabel: 'A', reviewPacket: packet('research_incomplete'),
  queueMode: 'active_completion', researchScopeComplete: true, requestedGapFields: ['predation'],
}).queue, 'gap_review', 'existing 7/8 authority only needs the researched gap reviewed, not a fake full-onboarding 8/8 packet');
assert.match(buildCompatibilityResearchBatchWorkItem({
  status: 'research_assessed', resourceLabel: 'A', reviewPacket: packet('research_incomplete'),
  queueMode: 'active_completion', researchScopeComplete: true, requestedGapFields: ['predation'],
}).nextStep, /只审核本批.*predation.*既有 reviewed Profile/);
assert.equal(buildCompatibilityResearchBatchWorkItem({
  status: 'research_assessed', resourceLabel: 'A', reviewPacket: packet('research_incomplete', ['provider_extraction_transport_unavailable']),
  queueMode: 'active_completion', researchScopeComplete: false, requestedGapFields: ['predation'],
}).queue, 'extraction_retry');
assert.equal(buildCompatibilityResearchBatchWorkItem({
  status: 'research_assessed', resourceLabel: 'A', reviewPacket: packet('research_incomplete', ['field_missing_predation']),
  queueMode: 'active_completion', researchScopeComplete: false, requestedGapFields: ['predation'],
}).queue, 'evidence_gap');
assert.equal(buildCompatibilityResearchBatchWorkItem({
  status: 'research_assessed', resourceLabel: 'A', reviewPacket: packet('terminal_hold', ['identity_conflict']),
  queueMode: 'active_completion', researchScopeComplete: false, requestedGapFields: ['predation'],
}).queue, 'terminal_hold');

const runnerSource = readFileSync('scripts/run-compatibility-active-completion-batch.ts', 'utf8');
assert.match(runnerSource, /arg\('offset'\)/, 'active completion runner must support offset-based resume without replaying completed research jobs');
assert.match(runnerSource, /ACTIVE_COMPLETION_CHECKPOINT/, 'active completion runner must persist and expose page checkpoints during long research batches');

console.log('Compatibility active-completion batch PASS: queue membership is derived from current non-terminal coverage, scoped gap research is reviewed without redoing existing authority, and all retry/hold outcomes stay fail-closed.');
