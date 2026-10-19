import assert from 'node:assert/strict';

import { buildCompatibilityTaxonResearchPlan } from '../src/services/compatibility/compatibility-field-coverage.service';
import {
  resolveCompatibilityResearchIdentity,
  resolveReviewedCatalogResearchIdentity,
} from '../src/services/compatibility/research-identity.service';
import type { CompatibilitySpeciesIdentityResolver } from '../src/services/compatibility/species-onboarding-research.service';

const plan = buildCompatibilityTaxonResearchPlan();
assert.equal(plan.length, 4);

let externalCalls = 0;
const unavailableExternalResolver: CompatibilitySpeciesIdentityResolver = {
  id: 'fixture-unavailable',
  resolve: async scientificName => {
    externalCalls += 1;
    return {
      status: 'provider_unavailable',
      queriedScientificName: scientificName,
      canonicalName: null,
      externalId: null,
      sourceUrl: null,
      confidence: null,
      reasonCode: 'fixture_provider_unavailable',
    };
  },
};

for (const job of plan) {
  const reviewed = resolveReviewedCatalogResearchIdentity(job);
  assert.ok(reviewed, job.researchKey + ' must have reviewed local identity authority before variant candidate research');
  assert.equal(reviewed.status, 'verified');
  assert.equal(reviewed.reasonCode, 'reviewed_catalog_identity');

  const resolved = await resolveCompatibilityResearchIdentity(job, unavailableExternalResolver);
  assert.equal(resolved.status, 'verified');
  assert.equal(resolved.reasonCode, 'reviewed_catalog_identity');
}
assert.equal(externalCalls, 0, 'reviewed catalog identity must prevent transient external resolver failures from creating identity holds');

const fallbackJob = {
  baseScientificName: 'Fixtureus externalis',
  catalogObjects: [],
};
const fallback = await resolveCompatibilityResearchIdentity(fallbackJob, unavailableExternalResolver);
assert.equal(fallback.status, 'provider_unavailable');
assert.equal(fallback.reasonCode, 'fixture_provider_unavailable');
assert.equal(externalCalls, 1, 'external resolver remains the fallback when no reviewed catalog identity authority exists');

console.log('Compatibility research identity PASS: reviewed catalog identity outranks external resolver availability; unreviewed taxa remain externally resolved.');
