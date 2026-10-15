import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
): CatalogEvidenceSource => ({
  id,
  title,
  publisher,
  url,
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
});

export const compatibilityNumericWave6Sources = {
  pseudorasboraParva: source(
    'fishipedia-pseudorasbora-parva-wave6',
    'Pseudorasbora parva • Fiche poissons',
    'Fishipedia',
    'https://www.fishipedia.fr/fr/poissons/pseudorasbora-parva',
  ),
  corydorasHastatus: source(
    'seriouslyfish-gastrodermus-hastatus-wave6',
    'Gastrodermus hastatus (Tail-spot Pygmy Cory; formerly Corydoras hastatus)',
    'Seriously Fish',
    'https://www.seriouslyfish.com/species/gastrodermus-hastatus',
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

const pParva = compatibilityNumericWave6Sources.pseudorasboraParva.id;
const cHastatus = compatibilityNumericWave6Sources.corydorasHastatus.id;

export const compatibilityNumericWave6FieldReviews: CatalogFieldReview[] = [
  supported('sp_0042', 'temperature', { min: 5, max: 22 }, pParva,
    'Fishipedia gives 5–22 °C for exact Pseudorasbora parva.'),
  supported('sp_0042', 'ph', { min: 6, max: 7 }, pParva,
    'Fishipedia gives pH 6–7 for exact Pseudorasbora parva.'),
  supported('sp_0042', 'tank_size', { liters: 200, lengthCm: null }, pParva,
    'Fishipedia explicitly recommends a minimum aquarium volume of 200 L for exact Pseudorasbora parva. No tank-length minimum is inferred.'),
  supported('sp_0042', 'territoriality', { traits: [] }, pParva,
    'Fishipedia explicitly marks territoriality as “Non” for exact Pseudorasbora parva; this supports a non-territorial trait set without inferring predation safety.'),
  // Fishipedia describes the species as peaceful/omnivorous but does not directly state
  // that fish or tankmates are not prey, so predation deliberately remains unresolved.

  supported('sp_0052', 'tank_size', { liters: 54, lengthCm: 60 }, cHastatus,
    'Seriously Fish lists a 60 × 30 cm aquarium base and an approximately 54 L aquarium volume for exact Gastrodermus hastatus, explicitly the taxon long known as Corydoras hastatus.'),
  // Peaceful/gregarious and pelagic-zooplankton diet wording do not directly establish
  // non-territoriality or absence of fish/tankmate predation, so both behavior gaps remain.
];

export const compatibilityNumericWave6VerifiedSourceIds = Object.values(
  compatibilityNumericWave6Sources,
).map(item => item.id);

export const compatibilityNumericWave6ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [] as const;

export const compatibilityNumericWave6AuthorityPatch = {
  patchId: 'numeric-evidence-wave6-20261015',
  speciesIds: ['sp_0042', 'sp_0052'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave6-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
