import assert from 'node:assert/strict';

import {
  runCompatibilityFieldAuthorityOnboardingPipeline,
  type CompatibilityOnboardingCoreField,
  type CompatibilitySpeciesResearchPacket,
  type CompatibilitySpeciesResearchProvider,
  type CompatibilityGenusAuthorityResearchProvider,
} from '../src/services/compatibility/species-onboarding-research.service';
import type { CompatibilityGenusAuthorityResearchResult } from '../src/services/compatibility/taxon-authority-research.service';

const catalogKey = 'blind_opsariichthys_testensis';
const scientificName = 'Opsariichthys testensis';

const verifiedIdentity = {
  id: 'fixture-identity',
  resolve: async (name: string) => ({
    status: 'verified' as const,
    queriedScientificName: name,
    canonicalName: name,
    externalId: 'fixture-taxon',
    sourceUrl: 'https://example.invalid/taxon',
    confidence: 100,
    reasonCode: 'fixture_verified_identity',
  }),
};

const unresolvedIdentity = {
  id: 'fixture-identity-hold',
  resolve: async (name: string) => ({
    status: 'unresolved' as const,
    queriedScientificName: name,
    canonicalName: null,
    externalId: null,
    sourceUrl: null,
    confidence: null,
    reasonCode: 'fixture_identity_unresolved',
  }),
};

const source: CompatibilitySpeciesResearchPacket['sources'][number] = {
  id: 'fixture-exact-source',
  title: 'Exact species research fixture',
  publisher: 'Fixture University',
  url: 'https://example.invalid/exact',
  sourceType: 'university',
  reviewStatus: 'draft',
  contentVerified: true,
};

const exactClaims: CompatibilitySpeciesResearchPacket['claims'] = [
  { field: 'water', proposedValue: 'freshwater', sourceId: source.id, evidenceKind: 'direct', confidence: 'high' },
  { field: 'temperature', proposedValue: { min: 20, max: 26 }, sourceId: source.id, evidenceKind: 'direct', confidence: 'high' },
  { field: 'ph', proposedValue: { min: 6.5, max: 8 }, sourceId: source.id, evidenceKind: 'direct', confidence: 'medium' },
  { field: 'adult_size', proposedValue: { min: 8, max: 14 }, sourceId: source.id, evidenceKind: 'direct', confidence: 'high' },
  { field: 'tank_size', proposedValue: { liters: 100, lengthCm: 90 }, sourceId: source.id, evidenceKind: 'direct', confidence: 'medium' },
  { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 5 }, sourceId: source.id, evidenceKind: 'direct', confidence: 'medium', note: 'Normal aquarium husbandry keeps this exact species in groups.' },
  { field: 'territoriality', proposedValue: { traits: ['territorial'] }, sourceId: source.id, evidenceKind: 'direct', confidence: 'medium', note: 'Exact-species source directly records territorial resource defense.' },
  { field: 'predation', proposedValue: { targets: [] }, sourceId: source.id, evidenceKind: 'direct', confidence: 'medium', note: 'Community guidance directly states similarly sized tankmates are not treated as prey.' },
];

const makeSpeciesProvider = (calls: Array<CompatibilityOnboardingCoreField[] | undefined>): CompatibilitySpeciesResearchProvider => ({
  id: 'fixture-exact-provider',
  research: async input => {
    calls.push(input.targetFields ? [...input.targetFields] : undefined);
    const selected = input.targetFields?.length
      ? exactClaims.filter(claim => input.targetFields!.includes(claim.field))
      : exactClaims;
    return {
      packetId: 'fixture-exact-packet-' + calls.length,
      providerId: 'fixture-exact-provider',
      catalogKey: input.catalogKey,
      commonName: input.commonName || input.scientificName,
      scientificName: input.scientificName,
      identityStatus: 'verified',
      sources: [source],
      claims: selected,
    };
  },
});

const genusReadyResult: CompatibilityGenusAuthorityResearchResult = {
  genus: 'Opsariichthys',
  model: 'fixture',
  targetFields: ['territoriality'],
  sources: [{
    id: 'fixture-genus-source',
    title: 'Opsariichthys genus behavior review',
    publisher: 'Fixture University',
    url: 'https://example.invalid/genus',
    sourceType: 'university',
    contentSha256: 'a'.repeat(64),
    contentVerified: true,
  }],
  fieldCandidates: [{
    field: 'territoriality',
    proposedValue: { traits: ['territorial'] },
    sourceIds: ['fixture-genus-source'],
    confidence: 'high',
    evidenceText: 'Species of the genus Opsariichthys defend territories during resource competition.',
    note: 'Direct genus-wide territoriality statement.',
  }],
  unresolvedFields: [],
  attemptedUrls: ['https://example.invalid/genus'],
  discoveryStatus: 'verified_genus_documents',
  discoveredUrlCount: 1,
  verifiedGenusDocumentCount: 1,
  promotionAllowed: false,
  writesAuthority: false,
};

const genusCalls: Array<{ genus: string; targetFields: string[] }> = [];
const readyGenusProvider: CompatibilityGenusAuthorityResearchProvider = {
  id: 'fixture-genus-provider',
  research: async input => {
    genusCalls.push({ genus: input.genus, targetFields: [...input.targetFields] });
    return genusReadyResult;
  },
};

const exactCallsWhenGenusReady: Array<CompatibilityOnboardingCoreField[] | undefined> = [];
const genusReady = await runCompatibilityFieldAuthorityOnboardingPipeline(
  verifiedIdentity,
  makeSpeciesProvider(exactCallsWhenGenusReady),
  readyGenusProvider,
  { catalogKey, scientificName, commonName: 'Blind Opsariichthys' },
);
assert.equal(genusReady.status, 'research_routed');
assert.deepEqual(genusCalls, [{ genus: 'Opsariichthys', targetFields: ['territoriality'] }]);
assert.equal(genusReady.genusResearch.assessment?.status, 'ready_for_review');
assert.deepEqual(genusReady.genusResearch.fallbackToSpeciesFields, []);
assert.equal(exactCallsWhenGenusReady.length, 1);
assert.equal(exactCallsWhenGenusReady[0]?.includes('territoriality'), false, 'review-ready genus evidence must prevent redundant exact-species territoriality research');
assert.equal(exactCallsWhenGenusReady[0]?.length, 7);
assert.equal(genusReady.speciesResearch?.researchScope.complete, true);
assert.equal(genusReady.writesAuthority, false);

const exactCallsWhenGenusFails: Array<CompatibilityOnboardingCoreField[] | undefined> = [];
const failingGenusProvider: CompatibilityGenusAuthorityResearchProvider = {
  id: 'fixture-genus-failure',
  research: async () => {
    throw new Error('fixture_genus_transport_unavailable');
  },
};
const genusFallback = await runCompatibilityFieldAuthorityOnboardingPipeline(
  verifiedIdentity,
  makeSpeciesProvider(exactCallsWhenGenusFails),
  failingGenusProvider,
  { catalogKey, scientificName, commonName: 'Blind Opsariichthys' },
);
assert.equal(genusFallback.status, 'research_routed');
assert.equal(genusFallback.genusResearch.error, 'fixture_genus_transport_unavailable');
assert.deepEqual(genusFallback.genusResearch.fallbackToSpeciesFields, ['territoriality']);
assert.equal(exactCallsWhenGenusFails.length, 1);
assert.equal(exactCallsWhenGenusFails[0]?.length, 8);
assert.equal(exactCallsWhenGenusFails[0]?.includes('territoriality'), true, 'failed genus research must fall back to exact-species research');
assert.equal(genusFallback.speciesResearch?.assessment.status, 'ready_for_review');

let identityHoldSpeciesCalls = 0;
let identityHoldGenusCalls = 0;
const identityHold = await runCompatibilityFieldAuthorityOnboardingPipeline(
  unresolvedIdentity,
  {
    id: 'never-exact',
    research: async () => {
      identityHoldSpeciesCalls += 1;
      throw new Error('should_not_run');
    },
  },
  {
    id: 'never-genus',
    research: async () => {
      identityHoldGenusCalls += 1;
      throw new Error('should_not_run');
    },
  },
  { catalogKey, scientificName, commonName: 'Blind Opsariichthys' },
);
assert.equal(identityHold.status, 'identity_hold');
assert.equal(identityHoldSpeciesCalls, 0);
assert.equal(identityHoldGenusCalls, 0);
assert.equal(identityHold.acquisitionPlan.nextStage, 'identity_resolution');
assert.equal(identityHold.acquisitionPlan.fields.every(item => item.route === 'identity_resolution_required'), true);

const variantCalls: Array<CompatibilityOnboardingCoreField[] | undefined> = [];
let variantGenusCalls = 0;
const variant = await runCompatibilityFieldAuthorityOnboardingPipeline(
  verifiedIdentity,
  makeSpeciesProvider(variantCalls),
  {
    id: 'variant-genus-provider',
    research: async () => {
      variantGenusCalls += 1;
      return genusReadyResult;
    },
  },
  {
    catalogKey: 'blind_opsariichthys_variant',
    scientificName: 'Opsariichthys testensis var. Red',
    commonName: 'Blind red variant',
  },
);
assert.equal(variant.status, 'research_routed');
assert.equal(variantGenusCalls, 0, 'ornamental variants must not enter genus research by default');
assert.equal(variant.acquisitionPlan.fields.some(item => item.route === 'genus_authority_research'), false);
assert.equal(variantCalls[0]?.length, 8);

console.log('PASS field-authority onboarding attempts reusable genus research before exact-species research');
console.log('PASS review-ready genus evidence prevents redundant exact-species field research');
console.log('PASS genus research transport/evidence failure falls back to exact-species targeted research');
console.log('PASS unresolved identity starts no field research');
console.log('PASS ornamental variants bypass genus research unless authority explicitly opts them in');
console.log('PASS orchestration never writes authority or creates pair rules');
