import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

export const compatibilityNumericWave8Sources = {
  hypostomusPlecostomusFishipedia: {
    id: 'fishipedia-hypostomus-plecostomus-wave8',
    title: 'Pléco • Hypostomus plecostomus • Fiche poissons',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/hypostomus-plecostomus',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  sourceId: string,
  note: string,
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds: [sourceId],
  conflictNotes: [note],
  reviewedAt,
});

const hPlecostomus = compatibilityNumericWave8Sources.hypostomusPlecostomusFishipedia.id;

export const compatibilityNumericWave8FieldReviews: CatalogFieldReview[] = [
  supported('sp_0026', 'tank_size', { liters: 600, lengthCm: null }, hPlecostomus,
    'Fishipedia explicitly recommends a minimum 600 L aquarium for adult Hypostomus plecostomus. No tank-length minimum is inferred.'),
  supported('sp_0026', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, hPlecostomus,
    'Fishipedia describes Hypostomus plecostomus as naturally gregarious and occurring in large groups, while its aquarium recommendation explicitly allows a population minimum of one. The reviewed aquarium planning mode is therefore variable; no mandatory group minimum is inferred.'),
  supported('sp_0026', 'territoriality', { traits: ['male_conspecific_territoriality'] }, hPlecostomus,
    'Fishipedia states that the largest males are territorial and that multiple individuals may fight. The promoted scope is restricted to male conspecific territoriality and is not widened to generic aggression toward unrelated tankmates.'),
  supported('sp_0026', 'predation', { targets: [] }, hPlecostomus,
    'Fishipedia explicitly states that Hypostomus plecostomus presents no cohabitation problem with small fish. This negative fish-predation scope does not erase the separate warning that large individuals may accidentally capture small shrimp while suction-feeding on the bottom.'),
];

export const compatibilityNumericWave8VerifiedSourceIds = Object.values(
  compatibilityNumericWave8Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityNumericWave8ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0026',
    addBehaviorTraits: ['male_conspecific_territoriality'],
    replacePredationTargets: [],
    addCitationIds: [hPlecostomus],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityNumericWave8AuthorityPatch = {
  patchId: 'numeric-evidence-wave8-20261015',
  speciesIds: ['sp_0026'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave8-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
