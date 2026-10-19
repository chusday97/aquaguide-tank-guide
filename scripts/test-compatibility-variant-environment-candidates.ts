import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildCompatibilityTaxonResearchPlan } from '../src/services/compatibility/compatibility-field-coverage.service';
import { getCompatibilityVariantFieldResearchPolicy } from '../src/data/compatibilityVariantFieldResearchPolicy';
import { buildCompatibilityVariantEnvironmentCandidateReview } from '../src/services/compatibility/variant-environment-candidate-review.service';

const raw = readFileSync('evaluation/product/compatibility-variant-environment-candidates.v1.json', 'utf8');
const audit = JSON.parse(raw) as {
  version: number;
  kind: string;
  policy: {
    writesAuthority: boolean;
    promotionAllowed: boolean;
    grantsInheritance: boolean;
    exactObjectFieldsExcluded: string[];
  };
  summary: {
    taxonJobs: number;
    variantObjects: number;
    candidateFieldsPerObject: number;
    requestedCandidateSlots: number;
    supportedCandidateSlots: number;
    unresolvedCandidateSlots: number;
    supportedTaxonFacts: number;
    unresolvedTaxonFacts: number;
    exactObjectSlotsExcluded: number;
  };
  jobs: Array<{
    researchKey: string;
    speciesIds: string[];
    objectCount: number;
    fields: Array<{
      field: string;
      status: 'draft_candidate' | 'blocked_by_contract';
      proposedValue: unknown;
      reasonCode?: string;
      evidenceSummary?: string;
      source: { id: string; title: string; publisher: string; url: string; sourceType: string };
    }>;
  }>;
};

const generated = buildCompatibilityVariantEnvironmentCandidateReview();
assert.deepEqual(audit, generated, 'candidate artifact must be generated deterministically from the source-controlled evidence registry and current research plan');

assert.equal(audit.version, 1);
assert.equal(audit.kind, 'compatibility_variant_environment_candidate_review');
assert.equal(audit.policy.writesAuthority, false);
assert.equal(audit.policy.promotionAllowed, false);
assert.equal(audit.policy.grantsInheritance, false);
assert.deepEqual(audit.policy.exactObjectFieldsExcluded, ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
assert.equal(audit.summary.taxonJobs, 4);
assert.equal(audit.summary.variantObjects, 9);
assert.equal(audit.summary.candidateFieldsPerObject, 3);
assert.equal(audit.summary.requestedCandidateSlots, 27);
assert.equal(audit.summary.supportedCandidateSlots, 25);
assert.equal(audit.summary.unresolvedCandidateSlots, 2);
assert.equal(audit.summary.supportedTaxonFacts, 11);
assert.equal(audit.summary.unresolvedTaxonFacts, 1);
assert.equal(audit.summary.exactObjectSlotsExcluded, 45);

const plan = buildCompatibilityTaxonResearchPlan();
assert.equal(plan.length, 4);
assert.deepEqual(audit.jobs.map(job => job.researchKey).sort(), plan.map(job => job.researchKey).sort());

let supportedSlots = 0;
let unresolvedSlots = 0;
let supportedTaxonFacts = 0;
let unresolvedTaxonFacts = 0;
for (const job of audit.jobs) {
  const planned = plan.find(item => item.researchKey === job.researchKey);
  assert.ok(planned, job.researchKey + ' must remain a current guarded research job');
  assert.deepEqual(job.speciesIds, planned.catalogObjects.map(item => item.speciesId));
  assert.equal(job.objectCount, job.speciesIds.length);
  assert.deepEqual(job.fields.map(item => item.field), ['water', 'temperature', 'ph']);

  for (const speciesId of job.speciesIds) {
    const policy = getCompatibilityVariantFieldResearchPolicy(speciesId);
    assert.ok(policy, speciesId + ' must retain a reviewed variant research policy');
    assert.deepEqual(policy.baseTaxonCandidateFacts, ['water', 'temperature', 'ph']);
    assert.deepEqual(policy.exactObjectEvidenceFacts, ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
    assert.equal(policy.grantsInheritance, false);
  }

  for (const field of job.fields) {
    assert.ok(/^https:\/\//.test(field.source.url));
    assert.ok(field.source.publisher.length > 0);
    assert.ok(field.source.title.length > 0);
    assert.equal(new Set<string>(audit.policy.exactObjectFieldsExcluded).has(field.field), false);
    if (field.status === 'draft_candidate') {
      assert.notEqual(field.proposedValue, null);
      supportedTaxonFacts += 1;
      supportedSlots += job.objectCount;
    } else {
      assert.equal(field.proposedValue, null);
      assert.ok(field.reasonCode);
      assert.ok(field.evidenceSummary);
      unresolvedTaxonFacts += 1;
      unresolvedSlots += job.objectCount;
    }
  }
}

assert.equal(supportedSlots, audit.summary.supportedCandidateSlots);
assert.equal(unresolvedSlots, audit.summary.unresolvedCandidateSlots);
assert.equal(supportedTaxonFacts, audit.summary.supportedTaxonFacts);
assert.equal(unresolvedTaxonFacts, audit.summary.unresolvedTaxonFacts);
assert.equal(supportedSlots + unresolvedSlots, audit.summary.requestedCandidateSlots);

const guppy = audit.jobs.find(job => job.researchKey === 'Poecilia reticulata');
assert.ok(guppy);
const guppyWater = guppy.fields.find(field => field.field === 'water');
assert.ok(guppyWater);
assert.equal(guppyWater.status, 'blocked_by_contract');
assert.equal(guppyWater.reasonCode, 'multi_environment_not_representable_by_single_water_value');
assert.match(guppyWater.evidenceSummary || '', /freshwater/i);
assert.match(guppyWater.evidenceSummary || '', /brackish/i);

assert.doesNotMatch(raw, /"resumeBundle"|"text"\s*:|"apiKey"|"contentSha256"/, 'draft candidate artifact must not retain raw fetched text, resume bundles, credentials, or content hashes');

console.log('Compatibility variant environment candidates PASS: 25/27 draft candidate slots are reviewable; 2/27 guppy water slots remain fail-closed because the exact-taxon source is multi-environment while the current water contract is single-valued.');
