import assert from 'node:assert/strict';

import { evaluateCompatibility, type DomainSpeciesFact } from '../packages/domain-rules/src/compatibility';
import { fishData } from '../src/data/fishData';
import {
  assessCompatibilitySpeciesResearchPacket,
  buildPostReviewCompatibilityPreviewFact,
  getCompatibilitySpeciesResearchCapability,
  runCompatibilitySpeciesOnboardingPipeline,
  researchAndAssessCompatibilitySpecies,
  type CompatibilitySpeciesResearchPacket,
  type CompatibilitySpeciesResearchProvider,
} from '../src/services/compatibility/species-onboarding-research.service';

const catalogKey = 'blind_pseudomugil_luminatus';
const scientificName = 'Pseudomugil luminatus';
assert.equal(
  fishData.some(fish => fish.scientificName.toLowerCase() === scientificName.toLowerCase()),
  false,
  'blind species must not already exist in the 486-object catalog',
);

const sources: CompatibilitySpeciesResearchPacket['sources'] = [
  {
    id: 'blind-source-a',
    title: 'Blind-test exact-taxon husbandry source A',
    publisher: 'Blind Test Fixture',
    url: 'https://example.invalid/blind-source-a',
    sourceType: 'curated_husbandry',
    reviewStatus: 'draft',
    contentVerified: true,
  },
  {
    id: 'blind-source-b',
    title: 'Blind-test exact-taxon biological source B',
    publisher: 'Blind Test Fixture',
    url: 'https://example.invalid/blind-source-b',
    sourceType: 'peer_reviewed',
    reviewStatus: 'draft',
    contentVerified: true,
  },
];

const completePacket: CompatibilitySpeciesResearchPacket = {
  packetId: 'blind-packet-ready',
  providerId: 'blind-provider',
  catalogKey,
  commonName: 'Red neon blue-eye',
  scientificName,
  identityStatus: 'verified',
  sources,
  claims: [
    { field: 'water', proposedValue: 'freshwater', sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'high' },
    { field: 'temperature', proposedValue: { min: 24, max: 28 }, sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'ph', proposedValue: { min: 6.5, max: 7.5 }, sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'adult_size', proposedValue: { min: 3, max: 4.5 }, sourceId: 'blind-source-b', evidenceKind: 'direct', confidence: 'high' },
    { field: 'tank_size', proposedValue: { liters: 60, lengthCm: 60 }, sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 6 }, sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'territoriality', proposedValue: { traits: [] }, sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'predation', proposedValue: { targets: [] }, sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'medium' },
  ],
};

const provider: CompatibilitySpeciesResearchProvider = {
  id: 'blind-provider',
  research: async input => {
    assert.equal(input.scientificName, scientificName);
    return completePacket;
  },
};

assert.deepEqual(getCompatibilitySpeciesResearchCapability(), {
  available: false,
  providerId: null,
  reason: 'research_provider_unavailable',
});
assert.deepEqual(getCompatibilitySpeciesResearchCapability(provider), {
  available: true,
  providerId: 'blind-provider',
  reason: null,
});

const identityResolver = {
  id: 'blind-identity-provider',
  resolve: async (name: string) => ({
    status: 'verified' as const,
    queriedScientificName: name,
    canonicalName: name,
    externalId: 'blind-taxon-1',
    sourceUrl: 'https://example.invalid/taxon/blind-taxon-1',
    confidence: 100,
    reasonCode: 'blind_exact_species',
  }),
};
const pipeline = await runCompatibilitySpeciesOnboardingPipeline(identityResolver, provider, {
  catalogKey,
  scientificName,
  commonName: 'Red neon blue-eye',
});
assert.equal(pipeline.status, 'research_assessed');
assert.equal(pipeline.identity.status, 'verified');
assert.equal(pipeline.assessment?.status, 'ready_for_review');

const identityHold = await runCompatibilitySpeciesOnboardingPipeline({
  id: 'blind-identity-provider',
  resolve: async name => ({
    status: 'ambiguous' as const,
    queriedScientificName: name,
    canonicalName: null,
    externalId: null,
    sourceUrl: null,
    confidence: 70,
    reasonCode: 'blind_identity_ambiguous',
  }),
}, provider, { catalogKey, scientificName });
assert.equal(identityHold.status, 'identity_hold');
assert.equal(identityHold.assessment, null, 'research provider must not run past an unresolved identity gate');

const ready = await researchAndAssessCompatibilitySpecies(provider, {
  catalogKey,
  scientificName,
  commonName: 'Red neon blue-eye',
});
assert.equal(ready.status, 'ready_for_review');
assert.equal(ready.fieldResolutions.length, 8);
assert.equal(ready.fieldResolutions.every(field => field.status === 'supported'), true);
assert.equal(ready.draftFieldReviews.length, 8);
assert.equal(ready.candidateProfile?.reviewStatus, 'draft');
assert.deepEqual(ready.candidateProfile?.requiredFacts, [
  'water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation',
]);
assert.equal(ready.candidateProfile?.citations.length, 2);

const blindFact = buildPostReviewCompatibilityPreviewFact(ready);
const knownPeaceful: DomainSpeciesFact = {
  id: 'reviewed-peaceful-reference',
  waterType: 'freshwater',
  temperatureMinC: 23,
  temperatureMaxC: 27,
  phMin: 6.4,
  phMax: 7.4,
  minTankLiters: 40,
  minTankLengthCm: 50,
  reviewed: true,
  compatibilityRequiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  compatibilityFactDispositions: {
    water: 'ready',
    temperature: 'ready',
    ph: 'ready',
    adult_size: 'ready',
    tank_size: 'ready',
    social_behavior: 'ready',
    territoriality: 'ready',
    predation: 'ready',
  },
  adultLengthMinCm: 3,
  adultLengthMaxCm: 5,
  socialMode: 'group',
  minimumGroupSize: 6,
  evidenceIds: ['reviewed-reference-source'],
  behaviorTraits: [],
  territoriality: 'none',
  predationRisk: 'none',
  predationTargets: [],
  predationVulnerability: 'low',
  finNippingRisk: 'none',
  finNipVulnerability: 'none',
  swimmingPace: 'moderate',
  lifeType: 'fish',
  size: 'Small',
};

const compatible = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 80, targetTemperatureC: 25 },
  existingSpecies: [knownPeaceful],
  existingQuantities: { [knownPeaceful.id]: 6 },
  candidateSpecies: blindFact,
  candidateQuantity: 6,
});
assert.equal(compatible.status, 'compatible');
assert.equal(compatible.decisionReadiness, 'reviewed');
assert.equal(compatible.ruleCodes.includes('reviewed_pair_rule'), false);
assert.ok(compatible.evidenceIds.includes('blind-source-a'));

const missingPacket: CompatibilitySpeciesResearchPacket = {
  ...completePacket,
  packetId: 'blind-packet-missing',
  claims: completePacket.claims.filter(claim => claim.field !== 'tank_size'),
};
const missing = assessCompatibilitySpeciesResearchPacket(missingPacket);
assert.equal(missing.status, 'research_pending');
assert.ok(missing.reasonCodes.includes('field_missing_tank_size'));
assert.equal(missing.candidateProfile, null);

const reconciledPacket: CompatibilitySpeciesResearchPacket = {
  ...completePacket,
  packetId: 'blind-packet-reconciled',
  claims: [
    ...completePacket.claims,
    {
      field: 'temperature',
      proposedValue: { min: 25, max: 29 },
      sourceId: 'blind-source-b',
      evidenceKind: 'direct',
      confidence: 'high',
    },
    {
      field: 'adult_size',
      proposedValue: { min: 3.1, max: 4.6 },
      sourceId: 'blind-source-a',
      evidenceKind: 'direct',
      confidence: 'high',
    },
    {
      field: 'tank_size',
      proposedValue: { liters: 200, lengthCm: 100 },
      sourceId: 'blind-source-b',
      evidenceKind: 'direct',
      confidence: 'medium',
    },
    {
      field: 'social_behavior',
      proposedValue: { mode: 'group', minimumGroupSize: 8 },
      sourceId: 'blind-source-b',
      evidenceKind: 'direct',
      confidence: 'medium',
    },
  ],
};
const reconciled = assessCompatibilitySpeciesResearchPacket(reconciledPacket);
assert.equal(reconciled.status, 'ready_for_review');
assert.deepEqual(
  reconciled.fieldResolutions.find(field => field.field === 'temperature')?.proposedValue,
  { min: 25, max: 28 },
  'overlapping husbandry ranges must reconcile to the shared conservative intersection',
);
assert.deepEqual(
  reconciled.fieldResolutions.find(field => field.field === 'adult_size')?.proposedValue,
  { min: 3, max: 4.6 },
  'near-equivalent adult measurements must widen conservatively instead of creating a false conflict',
);
assert.deepEqual(
  reconciled.fieldResolutions.find(field => field.field === 'tank_size')?.proposedValue,
  { liters: 200, lengthCm: 100 },
  'aquarium minimums must keep the most conservative direct requirement',
);
assert.deepEqual(
  reconciled.fieldResolutions.find(field => field.field === 'social_behavior')?.proposedValue,
  { mode: 'group', minimumGroupSize: 8 },
  'compatible group evidence must keep the largest explicit minimum group size',
);

const conflictPacket: CompatibilitySpeciesResearchPacket = {
  ...completePacket,
  packetId: 'blind-packet-conflict',
  claims: [
    ...completePacket.claims,
    {
      field: 'water',
      proposedValue: 'saltwater',
      sourceId: 'blind-source-b',
      evidenceKind: 'direct',
      confidence: 'high',
      note: 'Independent direct source creates a genuine environmental contradiction.',
    },
  ],
};
const conflict = assessCompatibilitySpeciesResearchPacket(conflictPacket);
assert.equal(conflict.status, 'terminal_hold');
assert.ok(conflict.reasonCodes.includes('field_conflict_water'));
assert.equal(conflict.candidateProfile, null);

const unverifiedPacket: CompatibilitySpeciesResearchPacket = {
  ...completePacket,
  packetId: 'blind-packet-unverified',
  sources: completePacket.sources.map(source => source.id === 'blind-source-a' ? { ...source, contentVerified: false } : source),
};
const unverified = assessCompatibilitySpeciesResearchPacket(unverifiedPacket);
assert.equal(unverified.status, 'research_pending');
assert.ok(unverified.reasonCodes.some(code => code.startsWith('field_unverified_')));

const ambiguousIdentity = assessCompatibilitySpeciesResearchPacket({
  ...completePacket,
  packetId: 'blind-packet-identity',
  identityStatus: 'ambiguous',
});
assert.equal(ambiguousIdentity.status, 'terminal_hold');
assert.ok(ambiguousIdentity.reasonCodes.includes('identity_unresolved'));

const wrongSpeciesProvider: CompatibilitySpeciesResearchProvider = {
  id: 'blind-provider',
  research: async () => ({ ...completePacket, scientificName: 'Different species' }),
};
const wrongSpecies = await researchAndAssessCompatibilitySpecies(wrongSpeciesProvider, {
  catalogKey,
  scientificName,
});
assert.equal(wrongSpecies.status, 'terminal_hold');
assert.ok(wrongSpecies.reasonCodes.includes('provider_scientific_name_mismatch'));
assert.equal(wrongSpecies.candidateProfile, null);

console.log(
  'compatibility auto-onboarding blind PASS: unseen species research packet -> 8-field validation -> draft candidate -> generic Compatibility preview; missing/unverified/conflicted/ambiguous inputs fail closed.',
);
