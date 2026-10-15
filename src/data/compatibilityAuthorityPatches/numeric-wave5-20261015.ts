import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

const source = (
  id: string,
  title: string,
  url: string,
): CatalogEvidenceSource => ({
  id,
  title,
  publisher: 'Fishipedia',
  url,
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
});

export const compatibilityNumericWave5Sources = {
  chaetodonAuriga: source(
    'fishipedia-chaetodon-auriga-numeric-husbandry',
    'Poisson-papillon cocher • Chaetodon auriga • Fiche poissons',
    'https://www.fishipedia.fr/fr/poissons/chaetodon-auriga',
  ),
  pterapogonKauderni: source(
    'fishipedia-pterapogon-kauderni-numeric-husbandry',
    'Poisson cardinal de Banggai • Pterapogon kauderni • Fiche poissons',
    'https://www.fishipedia.fr/fr/poissons/pterapogon-kauderni',
  ),
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

const cAuriga = compatibilityNumericWave5Sources.chaetodonAuriga.id;
const pKauderni = compatibilityNumericWave5Sources.pterapogonKauderni.id;

export const compatibilityNumericWave5FieldReviews: CatalogFieldReview[] = [
  supported('sp_0186', 'water', 'saltwater', cAuriga,
    'Fishipedia’s exact Chaetodon auriga page explicitly describes the species as a seawater fish (“poisson d’eau de mer”).'),
  supported('sp_0186', 'temperature', { min: 23, max: 27 }, cAuriga,
    'Fishipedia gives 23–27 °C for exact Chaetodon auriga.'),
  supported('sp_0186', 'adult_size', { min: null, max: 23 }, cAuriga,
    'Fishipedia lists 20 cm average and 23 cm maximum for exact Chaetodon auriga; the 23 cm maximum is retained conservatively.'),
  // The exact page does not expose a species-specific aquarium pH or minimum volume,
  // so those two fields deliberately remain unresolved.

  supported('sp_0025', 'water', 'saltwater', pKauderni,
    'Fishipedia explicitly states that the Banggai cardinalfish is a marine species and presents marine-water husbandry for exact Pterapogon kauderni.'),
  supported('sp_0025', 'temperature', { min: 25, max: 28 }, pKauderni,
    'Fishipedia gives 25–28 °C for exact Pterapogon kauderni.'),
  supported('sp_0025', 'ph', { min: 8.2, max: 8.4 }, pKauderni,
    'Fishipedia gives pH 8.2–8.4 for exact Pterapogon kauderni.'),
  supported('sp_0025', 'adult_size', { min: null, max: 8 }, pKauderni,
    'Fishipedia lists 5 cm average and 8 cm maximum for exact Pterapogon kauderni; the 8 cm maximum is retained conservatively.'),
  supported('sp_0025', 'tank_size', { liters: 150, lengthCm: null }, pKauderni,
    'Fishipedia explicitly recommends a minimum community-aquarium volume of 150 L for exact Pterapogon kauderni. No tank-length minimum is inferred.'),
];

export const compatibilityNumericWave5VerifiedSourceIds = Object.values(
  compatibilityNumericWave5Sources,
).map(item => item.id);

export const compatibilityNumericWave5ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [] as const;

export const compatibilityNumericWave5AuthorityPatch = {
  patchId: 'numeric-evidence-wave5-20261015',
  speciesIds: ['sp_0186', 'sp_0025'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave5-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
