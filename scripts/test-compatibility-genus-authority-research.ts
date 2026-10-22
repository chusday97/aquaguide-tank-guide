import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';

import {
  buildCompatibilityResearchProviderConfig,
  researchCompatibilityGenusAuthority,
} from '../apps/api/src/compatibility-species-research-provider';
import {
  assessCompatibilityGenusAuthorityResearchResult,
  buildCompatibilityEvidenceAcquisitionPlan,
  buildCompatibilityGenusAuthorityResearchPlan,
  type CompatibilityGenusAuthorityResearchResult,
} from '../src/services/compatibility/taxon-authority-research.service';
import {
  resolveReviewedCompatibilityTaxonFact,
  type ReviewedCompatibilityTaxonFact,
} from '../src/data/compatibilityTaxonAuthority';

const plan = buildCompatibilityGenusAuthorityResearchPlan();
const opsariichthys = plan.find(item => item.genus === 'Opsariichthys');
assert.ok(opsariichthys, 'real catalog should expose Opsariichthys only after exact-species identities are reviewed');
assert.deepEqual(opsariichthys.targetFields, ['territoriality']);
assert.deepEqual(opsariichthys.impactedSpeciesIds, ['sp_0038', 'sp_0130']);
assert.equal(opsariichthys.variantObjectCount, 0);
assert.equal(plan.some(item => item.genus === 'Semaprochilodus'), false, 'unreviewed identities must not enter genus-authority research');

const opsariichthysFish = fishData.find(item => item.id === 'sp_0038');
assert.ok(opsariichthysFish);
const opsariichthysRoute = buildCompatibilityEvidenceAcquisitionPlan(opsariichthysFish);
assert.equal(opsariichthysRoute.identityReadiness === 'unreviewed_new_object', false);
assert.equal(opsariichthysRoute.fields.find(item => item.field === 'territoriality')?.route, 'genus_authority_research');
assert.notEqual(opsariichthysRoute.fields.find(item => item.field === 'ph')?.route, 'genus_authority_research', 'species-specific numeric fields must never be widened to genus research');

const knownBase = fishData.find(item => item.id === 'sp_0431');
assert.ok(knownBase);
const unreviewedObjectRoute = buildCompatibilityEvidenceAcquisitionPlan({ ...knownBase, id: 'new-unreviewed-object' });
assert.equal(unreviewedObjectRoute.identityReadiness, 'unreviewed_new_object');
assert.equal(unreviewedObjectRoute.nextStage, 'identity_resolution');
assert.equal(unreviewedObjectRoute.fields.every(item => item.route === 'identity_resolution_required' || item.route === 'not_applicable'), true, 'new object must resolve identity before fact acquisition starts');

const config = {
  ...buildCompatibilityResearchProviderConfig({}),
  apiKey: 'test-key',
  baseUrl: 'https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  model: 'qwen3.7-flash-2026-07-15',
  timeoutMs: 5_000,
  maxSearchCandidates: 4,
  maxVerifiedSources: 3,
  maxSourceChars: 8_000,
};

const sourceUrl = 'https://example.edu/aquatic/examplegenus-review';
const genusWideEvidence = 'Species of the genus Examplegenus inhabit freshwater environments.';
const speciesOnlyEvidence = 'Examplegenus alpha is a freshwater fish.';
const sourceHtml = [
  '<html><head><title>Examplegenus review</title></head><body>',
  '<h1>Examplegenus systematic review</h1>',
  '<p>' + genusWideEvidence + '</p>',
  '<p>' + speciesOnlyEvidence + '</p>',
  '<p>' + 'taxonomy ecology aquarium husbandry freshwater evidence '.repeat(90) + '</p>',
  '</body></html>',
].join('');

const mockResearchFetch = (
  extractedEvidence: string,
): typeof fetch => async (input, init) => {
  const url = new URL(String(input));
  if (url.hostname === 'workspace.cn-beijing.maas.aliyuncs.com') {
    const body = JSON.parse(String(init?.body || '{}')) as { enable_search?: boolean };
    if (body.enable_search === true) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ candidates: [{ url: sourceUrl }] }) } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        claims: [{
          field: 'water',
          proposedValue: 'freshwater',
          sourceUrl,
          evidenceKind: 'direct',
          confidence: 'high',
          evidenceText: extractedEvidence,
          note: 'Direct water-scope statement.',
        }],
      }) } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (url.toString() === sourceUrl) {
    return new Response(sourceHtml, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
  throw new Error('unexpected fetch ' + url);
};

const speciesOnlyResult = await researchCompatibilityGenusAuthority(
  { genus: 'Examplegenus', targetFields: ['water'] },
  config,
  mockResearchFetch(speciesOnlyEvidence),
);
assert.equal(speciesOnlyResult.verifiedGenusDocumentCount, 1, 'trusted source may be fetched even when its extracted sentence is only species-scoped');
assert.deepEqual(speciesOnlyResult.fieldCandidates, [], 'species-specific sentence must never become genus authority');
assert.deepEqual(speciesOnlyResult.unresolvedFields, ['water']);

const genusWideResult = await researchCompatibilityGenusAuthority(
  { genus: 'Examplegenus', targetFields: ['water'] },
  config,
  mockResearchFetch(genusWideEvidence),
);
assert.equal(genusWideResult.fieldCandidates.length, 1, 'explicit genus-wide evidence should reach review candidate assessment');
assert.equal(genusWideResult.fieldCandidates[0]?.field, 'water');
assert.equal(genusWideResult.promotionAllowed, false);
assert.equal(genusWideResult.writesAuthority, false);

const assessed = assessCompatibilityGenusAuthorityResearchResult(genusWideResult);
assert.equal(assessed.status, 'ready_for_review');
assert.equal(assessed.reviewCandidates.length, 1);
assert.equal(assessed.reviewCandidates[0]?.rank, 'genus');
assert.equal(assessed.reviewCandidates[0]?.taxonName, 'Examplegenus');
assert.equal(assessed.reviewCandidates[0]?.reviewStatus, 'draft');
assert.equal(assessed.reviewCandidates[0]?.appliesToVariants, false);
assert.deepEqual(assessed.reviewCandidates[0]?.patch, {
  waterType: 'freshwater',
  waterTypes: ['freshwater'],
});
assert.equal(assessed.writesAuthority, false);

const conflictResult: CompatibilityGenusAuthorityResearchResult = {
  genus: 'Conflictgenus',
  model: 'fixture',
  targetFields: ['water'],
  sources: [
    {
      id: 'src-fresh',
      title: 'Freshwater genus review',
      publisher: 'Example University',
      url: 'https://example.edu/fresh',
      sourceType: 'university',
      contentSha256: 'a'.repeat(64),
      contentVerified: true,
    },
    {
      id: 'src-brackish',
      title: 'Brackish genus review',
      publisher: 'Example University',
      url: 'https://example.edu/brackish',
      sourceType: 'university',
      contentSha256: 'b'.repeat(64),
      contentVerified: true,
    },
  ],
  fieldCandidates: [
    {
      field: 'water',
      proposedValue: 'freshwater',
      sourceIds: ['src-fresh'],
      confidence: 'high',
      evidenceText: 'Species of the genus Conflictgenus inhabit freshwater.',
      note: null,
    },
    {
      field: 'water',
      proposedValue: 'brackish',
      sourceIds: ['src-brackish'],
      confidence: 'high',
      evidenceText: 'Species of the genus Conflictgenus inhabit brackish water.',
      note: null,
    },
  ],
  unresolvedFields: [],
  attemptedUrls: [],
  discoveryStatus: 'verified_genus_documents',
  discoveredUrlCount: 2,
  verifiedGenusDocumentCount: 2,
  promotionAllowed: false,
  writesAuthority: false,
};
const conflictAssessment = assessCompatibilityGenusAuthorityResearchResult(conflictResult);
assert.equal(conflictAssessment.status, 'terminal_hold');
assert.ok(conflictAssessment.reasonCodes.includes('field_conflict_water'));
assert.deepEqual(conflictAssessment.reviewCandidates, []);

const baseAuthority: ReviewedCompatibilityTaxonFact = {
  rank: 'genus',
  taxonName: 'Examplegenus',
  field: 'water',
  status: 'reviewed_supported',
  patch: { waterType: 'freshwater', waterTypes: ['freshwater'] },
  evidenceIds: ['reviewed-source'],
  confidence: 'high',
  reviewStatus: 'reviewed',
  appliesToVariants: false,
};
assert.ok(
  resolveReviewedCompatibilityTaxonFact(
    { id: 'base', scientificName: 'Examplegenus exemplaris' },
    'water',
    [baseAuthority],
  ),
  'exact base species may inherit reviewed genus authority',
);
assert.equal(
  resolveReviewedCompatibilityTaxonFact(
    { id: 'variant', scientificName: 'Examplegenus exemplaris var. Red' },
    'water',
    [baseAuthority],
  ),
  undefined,
  'ornamental variant must not inherit genus authority by default',
);
assert.ok(
  resolveReviewedCompatibilityTaxonFact(
    { id: 'variant-opted-in', scientificName: 'Examplegenus exemplaris var. Red' },
    'water',
    [{ ...baseAuthority, appliesToVariants: true }],
  ),
  'reviewed authority may explicitly opt variants into inheritance',
);

console.log('PASS genus research plan targets identity-ready repeated exact-species gaps only');
console.log('PASS acquisition router sends reusable behavior gaps to genus research and blocks unreviewed identities');
console.log('PASS species-specific evidence cannot be promoted to genus authority');
console.log('PASS explicit genus-wide verified evidence becomes draft review candidate only');
console.log('PASS conflicting genus-wide evidence blocks promotion');
console.log('PASS ornamental variants require explicit genus-authority opt-in');
