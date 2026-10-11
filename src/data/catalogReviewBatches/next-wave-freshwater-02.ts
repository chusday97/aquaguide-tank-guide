import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-11T12:40:00+08:00';

export const opsariichthysBidensFishBase: CatalogEvidenceSource = {
  id: 'fishbase-opsariichthys-bidens',
  title: 'Opsariichthys bidens species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Opsariichthys-bidens',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

export const opsariichthysBidensDietStudy: CatalogEvidenceSource = {
  id: 'doi-opsariichthys-bidens-ontogeny-diet',
  title: 'The relationship between ontogeny, morphology, and diet in the Chinese hook snout carp (Opsariichthys bidens)',
  publisher: 'Ichthyological Research',
  url: 'https://doi.org/10.1007/s10228-005-0316-0',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

export const opsariichthysBidensEnrichmentStudy: CatalogEvidenceSource = {
  id: 'doi-opsariichthys-bidens-enrichment-2024',
  title: 'Effects of Environmental Enrichment on the Growth, Gonadal Development, and Welfare of the Chinese Hooksnout Carp (Opsariichthys bidens)',
  publisher: 'Fishes',
  url: 'https://doi.org/10.3390/fishes9090339',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const allSources = [
  opsariichthysBidensFishBase.id,
  opsariichthysBidensDietStudy.id,
  opsariichthysBidensEnrichmentStudy.id,
];

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[] = [],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId: 'sp_0038',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

const unknown = (
  field: CatalogFieldReview['field'],
  note: string,
  citationIds = allSources,
): CatalogFieldReview => ({
  speciesId: 'sp_0038',
  field,
  proposedValue: null,
  status: 'reviewed',
  resolution: 'unknown',
  confidence: 'unknown',
  citationIds,
  conflictNotes: [note],
  reviewedAt,
});

export const nextWaveFreshwater02FieldReviews: CatalogFieldReview[] = [
  supported('identity', {
    scientificName: 'Opsariichthys bidens',
    baseSpeciesKey: 'Opsariichthys bidens',
    variantKey: null,
  }, [opsariichthysBidensFishBase.id]),
  supported('water', 'freshwater', [opsariichthysBidensFishBase.id]),
  unknown(
    'temperature',
    'FishBase records a temperate ecological range of 10–20°C, but the reviewed sources do not establish this as a household-aquarium husbandry target. Keep the product setpoint fail-closed.',
    [opsariichthysBidensFishBase.id],
  ),
  unknown('ph', 'Reviewed sources do not establish a household-aquarium pH target for Opsariichthys bidens.'),
  supported('adult_size', { min: null, max: 26.1 }, [opsariichthysBidensFishBase.id], [
    'FishBase reports 26.1 cm maximum total length; this is a biological size ceiling, not a minimum aquarium-size recommendation.',
  ]),
  unknown('tank_size', 'Reviewed sources do not establish a household-aquarium minimum tank length or volume.'),
  supported('social_behavior', { mode: 'variable', minimumGroupSize: null }, [opsariichthysBidensEnrichmentStudy.id], [
    'The 2024 controlled study recorded both clustering and aggressive chasing/nipping under social enrichment and discussed dominance hierarchy effects. No fixed minimum group size is inferred.',
  ], 'medium'),
  unknown(
    'territoriality',
    'The enrichment study supports aggression and dominance interactions, but does not directly establish a stable aquarium territory-size rule. Do not promote territoriality as a quantified husbandry field.',
    [opsariichthysBidensEnrichmentStudy.id],
  ),
  supported('predation', { targets: ['small_fish'] }, [opsariichthysBidensDietStudy.id], [
    'The ontogenetic diet study found that fish dominated the diet of large individuals. The product rule is intentionally scoped to small fish and long-term adult risk rather than all tankmates.',
  ], 'medium'),
  unknown('breeding_behavior', 'Reviewed sources in this batch are not used to enforce a breeding-defense compatibility rule.'),
];

export const nextWaveFreshwater02VerifiedSourceIds = new Set(allSources);
