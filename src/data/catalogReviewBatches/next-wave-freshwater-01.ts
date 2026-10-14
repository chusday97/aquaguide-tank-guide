import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-11T11:10:00+08:00';

export const chindongoSocolofiFishBase: CatalogEvidenceSource = {
  id: 'fishbase-chindongo-socolofi',
  title: 'Chindongo socolofi species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Chindongo-socolofi',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

export const chindongoSocolofiSeriouslyFish: CatalogEvidenceSource = {
  id: 'seriouslyfish-pseudotropheus-socolofi',
  title: 'Pseudotropheus socolofi (Powder Blue Cichlid)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/pseudotropheus-socolofi',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[] = [],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId: 'sp_0018',
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
  citationIds = [chindongoSocolofiFishBase.id, chindongoSocolofiSeriouslyFish.id],
): CatalogFieldReview => ({
  speciesId: 'sp_0018',
  field,
  proposedValue: null,
  status: 'reviewed',
  resolution: 'unknown',
  confidence: 'unknown',
  citationIds,
  conflictNotes: [note],
  reviewedAt,
});

export const nextWaveFreshwater01FieldReviews: CatalogFieldReview[] = [
  supported('identity', {
    scientificName: 'Chindongo socolofi',
    baseSpeciesKey: 'Chindongo socolofi',
    variantKey: null,
  }, [chindongoSocolofiFishBase.id]),
  supported('water', 'freshwater', [chindongoSocolofiFishBase.id]),
  supported('temperature', { min: 24, max: 28 }, [chindongoSocolofiSeriouslyFish.id], [
    'FishBase lists a narrower 24–26°C ecological range; Seriously Fish provides the aquarium husbandry range 24–28°C. The aquarium range is used for product guidance.',
  ]),
  supported('ph', { min: 7.6, max: 8.8 }, [chindongoSocolofiSeriouslyFish.id]),
  supported('adult_size', { min: null, max: 11.5 }, [
    chindongoSocolofiFishBase.id,
    chindongoSocolofiSeriouslyFish.id,
  ], [
    'FishBase reports 6.7 cm SL while Seriously Fish reports 11.5 cm SL. The larger reviewed husbandry value is retained as the conservative planning ceiling.',
  ], 'medium'),
  supported('tank_size', { liters: null, lengthCm: 90 }, [chindongoSocolofiSeriouslyFish.id], [
    'Seriously Fish specifies a minimum tank base of 90 × 45 cm. Only the supported 90 cm minimum length is promoted; no volume is inferred.',
  ]),
  supported('social_behavior', { mode: 'variable', minimumGroupSize: null }, [
    chindongoSocolofiFishBase.id,
    chindongoSocolofiSeriouslyFish.id,
  ], [
    'FishBase records territorial males staying close to rocks; Seriously Fish describes the species as somewhat peaceful for a mbuna. No fixed aquarium group size is inferred.',
  ], 'medium'),
  supported('territoriality', { traits: ['territorial_males', 'rock_associated_territory'] }, [
    chindongoSocolofiFishBase.id,
  ]),
  supported('predation', { targets: [] }, [chindongoSocolofiSeriouslyFish.id], [
    'Seriously Fish describes this mbuna as not especially aggressive and provides reviewed community-tankmate guidance; no fish-prey scope is established, while male territoriality remains modeled separately.',
  ], 'medium'),
  unknown('breeding_behavior', 'FishBase records female mouthbrooding, but the reviewed sources do not establish a general breeding-defense compatibility rule suitable for product enforcement.'),
];

export const nextWaveFreshwater01VerifiedSourceIds = new Set([
  chindongoSocolofiFishBase.id,
  chindongoSocolofiSeriouslyFish.id,
]);
