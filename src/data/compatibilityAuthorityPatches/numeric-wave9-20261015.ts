import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

export const compatibilityNumericWave9Sources = {
  pterophyllumAltumFishipedia: {
    id: 'fishipedia-pterophyllum-altum-wave9',
    title: 'Scalaire altum • Pterophyllum altum • Fiche poissons',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/pterophyllum-altum',
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

const pAltum = compatibilityNumericWave9Sources.pterophyllumAltumFishipedia.id;

export const compatibilityNumericWave9FieldReviews: CatalogFieldReview[] = [
  supported('sp_0019', 'tank_size', { liters: 600, lengthCm: null }, pAltum,
    'Fishipedia explicitly recommends a minimum 600 L community aquarium for exact Pterophyllum altum. A smaller 120 L setup is described only for a confirmed breeding pair and is not promoted as the general compatibility minimum. No tank-length minimum is inferred.'),
  supported('sp_0019', 'territoriality', { traits: ['territorial', 'breeding_territoriality'] }, pAltum,
    'Fishipedia explicitly marks territoriality as “Oui”, states that Pterophyllum altum rarely leaves its territory, and describes stronger territory defense during reproduction. Both general territorial pressure and breeding territoriality are therefore supported.'),
];

export const compatibilityNumericWave9VerifiedSourceIds = Object.values(
  compatibilityNumericWave9Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityNumericWave9ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0019',
    addBehaviorTraits: ['territorial', 'breeding_territoriality'],
    addCitationIds: [pAltum],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityNumericWave9AuthorityPatch = {
  patchId: 'numeric-evidence-wave9-20261015',
  speciesIds: ['sp_0019'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave9-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
