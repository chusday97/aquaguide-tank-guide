import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

export const compatibilityNumericWave10Sources = {
  pteroisVolitansFishipedia: {
    id: 'fishipedia-pterois-volitans-wave10',
    title: 'Rascasse volante • Pterois volitans • Fiche poissons',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/pterois-volitans',
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

const pVolitans = compatibilityNumericWave10Sources.pteroisVolitansFishipedia.id;

export const compatibilityNumericWave10FieldReviews: CatalogFieldReview[] = [
  supported('sp_0453', 'temperature', { min: 22, max: 26 }, pVolitans,
    'Fishipedia gives 22–26 °C for exact Pterois volitans.'),
  supported('sp_0453', 'ph', { min: 8.2, max: 8.4 }, pVolitans,
    'Fishipedia gives pH 8.2–8.4 for exact Pterois volitans aquarium maintenance.'),
  supported('sp_0453', 'tank_size', { liters: 1200, lengthCm: null }, pVolitans,
    'Fishipedia explicitly recommends a minimum 1200 L aquarium for exact Pterois volitans. No tank-length minimum is inferred.'),
  supported('sp_0453', 'territoriality', { traits: [] }, pVolitans,
    'Fishipedia explicitly marks exact Pterois volitans as non-territorial and states that it is not territorial in the usual sense, while separately noting possible interspecific aggression. The territoriality field therefore remains non-territorial without weakening the already-reviewed predation risk.'),
];

export const compatibilityNumericWave10VerifiedSourceIds = Object.values(
  compatibilityNumericWave10Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityNumericWave10ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0453',
    addCitationIds: [pVolitans],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityNumericWave10AuthorityPatch = {
  patchId: 'numeric-evidence-wave10-20261015',
  speciesIds: ['sp_0453'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave10-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
