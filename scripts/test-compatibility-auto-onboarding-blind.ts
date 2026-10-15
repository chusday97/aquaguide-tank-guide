import assert from 'node:assert/strict';

import { evaluateCompatibility, type DomainSpeciesFact } from '../packages/domain-rules/src/compatibility';
import { fishData } from '../src/data/fishData';
import {
  assessCompatibilitySpeciesResearchPacket,
  buildPostReviewCompatibilityPreviewFact,
  getCompatibilitySpeciesResearchCapability,
  runCompatibilitySpeciesOnboardingPipeline,
  researchAndAssessCompatibilitySpecies,
  researchAndAssessCompatibilitySpeciesDetailed,
  type CompatibilityOnboardingCoreField,
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
    { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 6 }, sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'medium', note: 'Normal husbandry guidance recommends keeping at least six together.' },
    { field: 'territoriality', proposedValue: { traits: [] }, sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'medium', note: 'Direct husbandry guidance explicitly describes this species as non-territorial.' },
    { field: 'predation', proposedValue: { targets: [] }, sourceId: 'blind-source-a', evidenceKind: 'direct', confidence: 'medium', note: 'Community guidance directly states similarly sized tankmates are not treated as prey.' },
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

const targetedRetryCalls: Array<CompatibilityOnboardingCoreField[] | undefined> = [];
const targetedRetryProvider: CompatibilitySpeciesResearchProvider = {
  id: 'targeted-retry-provider',
  research: async input => {
    targetedRetryCalls.push(input.targetFields);
    const targetFields = input.targetFields ?? [];
    const selectedClaims = targetFields.length === 0
      ? completePacket.claims.filter(claim => !['territoriality', 'predation'].includes(claim.field))
      : completePacket.claims.filter(claim => targetFields.includes(claim.field));
    return {
      ...completePacket,
      packetId: targetFields.length === 0 ? 'targeted-initial' : 'targeted-supplement',
      providerId: 'targeted-retry-provider',
      claims: selectedClaims,
    };
  },
};
const targetedRetry = await researchAndAssessCompatibilitySpeciesDetailed(targetedRetryProvider, {
  catalogKey,
  scientificName,
  commonName: 'Red neon blue-eye',
});
assert.equal(targetedRetry.initialAssessment.status, 'research_pending');
assert.equal(targetedRetry.assessment.status, 'ready_for_review');
assert.equal(targetedRetry.targetedRetry.attempted, true);
assert.deepEqual(
  [...targetedRetry.targetedRetry.targetFields].sort(),
  ['predation', 'territoriality'],
  'second-pass research must request only fields that remained missing or unverified after the first pass',
);
assert.equal(targetedRetryCalls.length, 2, 'gap-targeted research must run at most one second pass');
assert.equal(targetedRetryCalls[0], undefined);
assert.deepEqual([...targetedRetryCalls[1]!].sort(), ['predation', 'territoriality']);
assert.equal(targetedRetry.packet.sources.length, completePacket.sources.length, 'packet merge must dedupe already-seen sources');
assert.equal(targetedRetry.packet.claims.length, completePacket.claims.length, 'packet merge must dedupe claims while adding targeted evidence');

const scopedCalls: Array<CompatibilityOnboardingCoreField[] | undefined> = [];
const scopedProvider: CompatibilitySpeciesResearchProvider = {
  id: 'scoped-research-provider',
  research: async input => {
    scopedCalls.push(input.targetFields);
    const requested = input.targetFields ?? [];
    const firstPass = scopedCalls.length === 1;
    const selectedClaims = firstPass
      ? completePacket.claims.filter(claim => claim.field === 'territoriality')
      : completePacket.claims.filter(claim => requested.includes(claim.field));
    return {
      ...completePacket,
      packetId: firstPass ? 'scoped-initial' : 'scoped-retry',
      providerId: 'scoped-research-provider',
      claims: selectedClaims,
    };
  },
};
const scopedResearch = await researchAndAssessCompatibilitySpeciesDetailed(
  scopedProvider,
  { catalogKey, scientificName, commonName: 'Red neon blue-eye' },
  { researchScopeFields: ['territoriality', 'predation'] },
);
assert.equal(scopedResearch.assessment.status, 'research_pending', 'scoped backlog research does not pretend the packet is a complete new-species profile');
assert.equal(scopedResearch.researchScope.complete, true, 'existing-catalog research is complete when all requested backlog fields are supported');
assert.deepEqual(scopedResearch.researchScope.unresolvedFields, []);
assert.deepEqual(scopedCalls[0], ['territoriality', 'predation'], 'existing-catalog first pass must search only real catalog gaps');
assert.deepEqual(scopedCalls[1], ['predation'], 'second pass must retry only the unresolved subset of the real catalog gaps');
assert.equal(scopedResearch.targetedRetry.attempted, true);



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
assert.equal(blindFact.reviewed, false, 'research-complete preview must remain unreviewed until explicit approval');
assert.equal(compatible.status, 'caution');
assert.equal(compatible.decisionReadiness, 'partial');
assert.ok(compatible.ruleCodes.includes('species_review_pending'));
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

const scopeRejectedPacket: CompatibilitySpeciesResearchPacket = {
  ...completePacket,
  packetId: 'blind-packet-scope-rejected',
  claims: completePacket.claims.map(claim => {
    if (claim.field === 'social_behavior') {
      return {
        ...claim,
        proposedValue: { mode: 'group', minimumGroupSize: 10 },
        note: 'Reproduction: grow up a group of 10 young fish to find a breeding pair.',
      };
    }
    if (claim.field === 'predation') {
      return {
        ...claim,
        proposedValue: { targets: ['zooplankton', 'detritus', 'small fish'] },
        note: 'Feed on zooplankton, detritus and small fish.',
      };
    }
    if (claim.field === 'territoriality') {
      return {
        ...claim,
        proposedValue: { traits: [] },
        note: 'No direct statement about territorial behavior or non-territoriality is given.',
      };
    }
    return claim;
  }),
};
const scopeRejected = assessCompatibilitySpeciesResearchPacket(scopeRejectedPacket);
assert.equal(scopeRejected.status, 'research_pending');
assert.ok(scopeRejected.reasonCodes.includes('field_unverified_social_behavior'));
assert.ok(scopeRejected.reasonCodes.includes('field_unverified_predation'));
assert.ok(scopeRejected.reasonCodes.includes('field_unverified_territoriality'));
assert.equal(scopeRejected.candidateProfile, null);


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
      proposedValue: { min: 3.1, max: 6.7 },
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
      note: 'Normal husbandry guidance recommends a group of at least eight.',
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
  { min: 3, max: 6.7 },
  'bounded adult-size variation must widen conservatively instead of creating a false conflict',
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

const adultOutlierPacket: CompatibilitySpeciesResearchPacket = {
  ...completePacket,
  packetId: 'blind-packet-adult-outlier',
  claims: [
    ...completePacket.claims,
    {
      field: 'adult_size',
      proposedValue: { min: null, max: 20 },
      sourceId: 'blind-source-a',
      evidenceKind: 'direct',
      confidence: 'high',
      note: 'Independent exact-taxon source reports a radically larger adult maximum.',
    },
  ],
};
const adultOutlier = assessCompatibilitySpeciesResearchPacket(adultOutlierPacket);
assert.equal(adultOutlier.status, 'terminal_hold');
assert.ok(adultOutlier.reasonCodes.includes('field_conflict_adult_size'));

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
