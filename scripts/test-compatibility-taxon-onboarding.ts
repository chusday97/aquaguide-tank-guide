import { fishData } from '../src/data/fishData';
import {
  resolveReviewedCompatibilityTaxonFact,
  type ReviewedCompatibilityTaxonFact,
} from '../src/data/compatibilityTaxonAuthority';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import {
  evaluateTankCompatibility,
  type CompatibilityEvidenceProvider,
} from '../src/lib/tankCompatibilityEngine';
import { getCompatibilityCoreFieldCoverageRow } from '../src/services/compatibility/compatibility-field-coverage.service';

const sourceIds = ['batch18-fishbase-tachysurus-fulvidraco'];

const fixtureFacts: ReviewedCompatibilityTaxonFact[] = [
  {
    rank: 'genus',
    taxonName: 'Pseudobagrus',
    field: 'ph',
    status: 'reviewed_supported',
    patch: { phMin: 6, phMax: 8 },
    evidenceIds: sourceIds,
    confidence: 'medium',
    reviewStatus: 'reviewed',
    note: 'TEST FIXTURE ONLY: proves field-scoped genus fallback plumbing.',
  },
  {
    rank: 'genus',
    taxonName: 'Pseudobagrus',
    field: 'tank_size',
    status: 'reviewed_supported',
    patch: { minTankLiters: 80, minTankLengthCm: 60 },
    evidenceIds: sourceIds,
    confidence: 'medium',
    reviewStatus: 'reviewed',
    note: 'TEST FIXTURE ONLY.',
  },
  {
    rank: 'genus',
    taxonName: 'Pseudobagrus',
    field: 'social_behavior',
    status: 'reviewed_supported',
    patch: { socialMode: 'variable' },
    evidenceIds: sourceIds,
    confidence: 'medium',
    reviewStatus: 'reviewed',
    note: 'TEST FIXTURE ONLY.',
  },
  {
    rank: 'genus',
    taxonName: 'Pseudobagrus',
    field: 'territoriality',
    status: 'reviewed_neutral_or_negative',
    patch: { territoriality: 'none' },
    evidenceIds: sourceIds,
    confidence: 'medium',
    reviewStatus: 'reviewed',
    note: 'TEST FIXTURE ONLY.',
  },
  {
    rank: 'genus',
    taxonName: 'Pseudobagrus',
    field: 'predation',
    status: 'reviewed_neutral_or_negative',
    patch: { predationRisk: 'none', predationTargets: [] },
    evidenceIds: sourceIds,
    confidence: 'medium',
    reviewStatus: 'reviewed',
    note: 'TEST FIXTURE ONLY.',
  },
];

const familyFixture: ReviewedCompatibilityTaxonFact = {
  rank: 'family',
  taxonName: 'Bagridae',
  coveredGenera: ['Pseudobagrus'],
  field: 'social_behavior',
  status: 'reviewed_supported',
  patch: { socialMode: 'group' },
  evidenceIds: sourceIds,
  confidence: 'medium',
  reviewStatus: 'reviewed',
  note: 'TEST FIXTURE ONLY: genus must override family for the same field.',
};

const candidate = fishData.find(item => item.id === 'sp_0047');
const existing = fishData.find(item => item.id === 'sp_0431');
if (!candidate || !existing) throw new Error('required regression fixture species missing');

const resolver = (fish: typeof candidate, field: Parameters<typeof resolveReviewedCompatibilityTaxonFact>[1]) => (
  resolveReviewedCompatibilityTaxonFact(fish, field, [...fixtureFacts, familyFixture])
);

const baseCoverage = getCompatibilityCoreFieldCoverageRow(candidate);
if (getReviewedCompatibilityProfileForFish(candidate)) {
  throw new Error('fixture unexpectedly has a reviewed compatibility profile');
}
if (!baseCoverage.decisionReady || baseCoverage.genericOnboardingReady) {
  throw new Error('profile-less species should be decision-ready from exact hard facts while soft risk coverage remains incomplete');
}

const taxonCoverage = getCompatibilityCoreFieldCoverageRow(candidate, { taxonFactResolver: resolver });
if (!taxonCoverage.genericOnboardingReady || !taxonCoverage.decisionReady) {
  throw new Error('reviewed field-scoped taxon defaults should complete generic onboarding without a compatibility profile');
}
for (const field of ['ph', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const) {
  if (taxonCoverage.fields[field].authoritySource !== 'genus_default') {
    throw new Error(`${field} did not use the reviewed genus default`);
  }
}

const social = resolver(candidate, 'social_behavior');
if (social?.rank !== 'genus' || social.patch.socialMode !== 'variable') {
  throw new Error('genus authority must take precedence over a matching family authority');
}
const unrelated = resolveReviewedCompatibilityTaxonFact(
  { id: 'unrelated', scientificName: 'Othergenus example' },
  'social_behavior',
  [familyFixture],
);
if (unrelated) throw new Error('family authority leaked to a genus not explicitly covered');

const provider: CompatibilityEvidenceProvider = {
  getProfile: () => undefined,
  getPairRule: () => undefined,
  getStageRisks: () => [],
  getTaxonFact: resolver,
  authorityVersion: 'test-taxon-authority-v1',
};

const result = evaluateTankCompatibility({
  scope: 'species_only',
  existingSpecies: [existing],
  candidateSpecies: candidate,
  evidenceProvider: provider,
});

if (result.status === 'insufficient_data') {
  throw new Error(`taxon-backed species still fell to insufficient_data: ${result.metadata.domainRuleCodes.join(',')}`);
}
if (result.metadata.decisionReadiness !== 'reviewed') {
  throw new Error(`expected reviewed readiness, got ${result.metadata.decisionReadiness}`);
}
if (result.metadata.domainRuleCodes.includes('reviewed_pair_rule')) {
  throw new Error('pair rule unexpectedly participated in the decision');
}

console.log('PASS profile-less exact hard facts enter compatibility decision');
console.log('PASS field-scoped genus defaults complete soft risk coverage');
console.log('PASS genus authority outranks family and family scope is fail-closed');
console.log('PASS pairless taxon-backed species reaches canonical compatibility engine');
