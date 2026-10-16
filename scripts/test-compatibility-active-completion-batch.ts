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
import { isCompatibilityResearchClaimScopeEligible } from '../src/services/compatibility/species-onboarding-research.service';
import { buildCompatibilityResearchSourceStrategy } from '../apps/api/src/compatibility-species-research-provider';

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
const filtered = selectCompatibilityResearchBatchJobs('active_completion', [selected.jobs[0].researchKey]);
assert.deepEqual(filtered.jobs.map(job => job.researchKey), [selected.jobs[0].researchKey], 'targeted expansion must select only manifest-requested research keys');
const excluded = selectCompatibilityResearchBatchJobs(
  'active_completion',
  [],
  [selected.jobs[0].researchKey],
);
assert.equal(excluded.jobs.some(job => job.researchKey === selected.jobs[0].researchKey), false, 'persisted evidence ceiling keys must be excludable from future active completion runs');
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

assert.equal(isCompatibilityResearchClaimScopeEligible({
  field: 'predation',
  proposedValue: { targets: ['small_fish'] },
  note: 'Adults may attack and swallow small fish that fit into the mouth in an aquarium.',
}), true, 'direct predation BY the researched species should remain eligible');
assert.equal(isCompatibilityResearchClaimScopeEligible({
  field: 'predation',
  proposedValue: { targets: ['larger fish', 'crabs', 'octopi'] },
  note: 'Predators of Zebrasoma flavescens include larger fish and predatory invertebrates such as crabs and octopi.',
}), false, 'predators OF the researched species must never be inverted into predation targets');
assert.equal(isCompatibilityResearchClaimScopeEligible({
  field: 'predation',
  proposedValue: { targets: ['crustacés', 'poissons de grande taille'] },
  note: "The species would become a preferred prey of crustaceans or large fish.",
}), false, 'prey-vulnerability evidence must never be inverted into predator authority');
assert.equal(isCompatibilityResearchClaimScopeEligible({
  field: 'predation',
  proposedValue: { targets: ['eggs'] },
  note: 'Adults will eat the eggs given the chance.',
}), false, 'non-runtime egg predation must not falsely close the Compatibility predation field');
assert.equal(isCompatibilityResearchClaimScopeEligible({
  field: 'predation',
  proposedValue: { targets: ['fish_fry'] },
  note: 'Adults will eat fish fry and should not be housed with fry.',
}), true, 'canonical fish-fry predation evidence should remain eligible');
assert.equal(isCompatibilityResearchClaimScopeEligible({
  field: 'predation',
  proposedValue: { targets: ['fish_fry'] },
  note: "The source states that during spawning, adults will eat the eggs given the chance and fry become free-swimming after hatching; since adults consume their own offspring (eggs/fry), this constitutes predation on fish_fry.",
}), false, 'egg predation plus later fry presence must not be inferred into fish-fry predation');



const sourceStrategy = buildCompatibilityResearchSourceStrategy({
  round: 2,
  attemptedUrls: [
    'https://www.fishipedia.fr/fr/poissons/zacco-platypus',
    'https://www.fishipedia.fr/fr/poissons/zacco-platypus#duplicate',
  ],
  attemptedSourceTypes: ['curated_husbandry', 'professional_association'],
});
assert.equal(sourceStrategy.round, 2);
assert.equal(sourceStrategy.attemptedUrls.length, 1, 'source expansion must canonicalize/dedupe attempted URLs');
assert.deepEqual(sourceStrategy.preferredSourceTypes.slice(0, 3), ['government', 'peer_reviewed', 'university'], 'source expansion should upgrade toward untried institutional and peer-reviewed source classes');

const runnerSource = readFileSync('scripts/run-compatibility-active-completion-batch.ts', 'utf8');
assert.match(runnerSource, /arg\('offset'\)/, 'active completion runner must support offset-based resume without replaying completed research jobs');
assert.match(runnerSource, /ACTIVE_COMPLETION_CHECKPOINT/, 'active completion runner must persist and expose page checkpoints during long research batches');
assert.match(runnerSource, /evidence_ceiling_review/, 'active completion runner must report persisted evidence ceilings so exhausted taxa are not silently reopened');
assert.match(runnerSource, /persistedReviewResearchKeys/, 'active completion runner must exclude all persisted review-state taxa from generic research');
assert.match(runnerSource, /include-persisted-review/, 'reopening persisted review-state research must require an explicit runner override');

console.log('Compatibility active-completion batch PASS: queue membership is derived from current non-terminal coverage, scoped gap research is reviewed without redoing existing authority, and all retry/hold outcomes stay fail-closed.');
