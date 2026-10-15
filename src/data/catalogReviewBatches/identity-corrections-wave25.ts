import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-15T19:20:00+08:00';

export const identityCorrectionsWave25Sources = {
  fireRedAquariumGlaser: {
    id: 'aquarium-glaser-apistogramma-agassizii-fire-red-wave25',
    title: 'Apistogramma agassizii FIRE-RED',
    publisher: 'Aquarium Glaser GmbH',
    url: 'https://www.aquariumglaser.de/en/25-perchlike-fishes/25d-perchlike-fishes-4-south-american-dwarf-cichlids/apistogramma_agassizii_fire_red_en/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  fireRedAquariumCoop: {
    id: 'aquarium-coop-apistogramma-fire-red-wave25',
    title: 'Care Guide for Apistogramma Dwarf Cichlids — Housing, Breeding, & More',
    publisher: 'Aquarium Co-Op',
    url: 'https://www.aquariumcoop.com/blogs/aquarium/apistogramma-dwarf-cichlid',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  baseSeriouslyFish: {
    id: 'wave25-seriouslyfish-apistogramma-agassizii-husbandry',
    title: "Apistogramma agassizii (Agassizi's Dwarf Cichlid)",
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/apistogramma-agassizii/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  baseFishBase: {
    id: 'wave25-fishbase-apistogramma-agassizii-husbandry',
    title: "Apistogramma agassizii (Agassiz's dwarf cichlid) species summary",
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/Fieldguide/FieldGuideSummary.php?c_code=076&genusname=Apistogramma&speciesname=agassizii',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identitySources = [
  identityCorrectionsWave25Sources.fireRedAquariumGlaser.id,
  identityCorrectionsWave25Sources.fireRedAquariumCoop.id,
];
const baseSources = [
  identityCorrectionsWave25Sources.baseSeriouslyFish.id,
  identityCorrectionsWave25Sources.baseFishBase.id,
];

const supported = (
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'medium',
): CatalogFieldReview => ({
  speciesId: 'sp_0221',
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsWave25FieldReviews: CatalogFieldReview[] = [
  supported(
    'identity',
    {
      scientificName: 'Apistogramma agassizii var. Fire Red',
      baseSpeciesKey: 'Apistogramma agassizii',
      variantKey: 'Fire Red',
    },
    identitySources,
    [
      'Aquarium Glaser identifies Fire Red as a captive-bred/artificial sport of Apistogramma agassizii and attributes its colour to selective breeding.',
      'Aquarium Co-Op independently lists Fire Red among the colour variants of Apistogramma agassizii.',
      'The legacy Chinese catalog label and description additionally claimed a distinct long-fin identity, but the reviewed sources support Fire Red coloration rather than a separate long-fin lineage. Wave25 therefore corrects the user-facing catalog label/description instead of preserving an unsupported compound identity.',
    ],
  ),
  supported('water', 'freshwater', [...identitySources, ...baseSources], [
    'The reviewed Fire Red identity bridge reuses established Apistogramma agassizii freshwater authority.',
  ]),
  supported('temperature', { min: 22, max: 29 }, [...identitySources, ...baseSources], [
    'The reviewed Fire Red identity bridge reuses the established A. agassizii long-term husbandry temperature authority.',
  ]),
  supported('ph', { min: 5, max: 7 }, [...identitySources, ...baseSources], [
    'The reviewed Fire Red identity bridge reuses the established A. agassizii general-husbandry pH authority rather than extreme locality-specific breeding water.',
  ]),
  supported('adult_size', { min: null, max: 7.5 }, [...identitySources, ...baseSources], [
    'The reviewed Fire Red identity bridge reuses the established A. agassizii adult-size authority; no unsupported long-fin size multiplier is introduced.',
  ]),
  supported('tank_size', { liters: 54, lengthCm: 60 }, [...identitySources, ...baseSources], [
    'The reviewed Fire Red identity bridge reuses the established same-species minimum pair footprint and volume.',
  ]),
  supported('social_behavior', { mode: 'variable', minimumGroupSize: null }, [...identitySources, ...baseSources], [
    'Base Species Knowledge records harem/social structure, but the Catalog enum has no harem mode; Wave25 stores conservative variable mode without inventing a numeric group minimum.',
  ]),
  supported('territoriality', { traits: ['breeding_defense'] }, [...identitySources, ...baseSources], [
    'The reviewed Fire Red identity bridge preserves the established breeding-defense boundary and does not convert it into blanket aggression toward all tankmates.',
  ]),
  supported('predation', { targets: [] }, [...identitySources, ...baseSources], [
    'The reviewed Fire Red identity bridge preserves the established no-fish-predation target authority.',
  ]),
];

export const identityCorrectionsWave25VerifiedSourceIds = Object.values(identityCorrectionsWave25Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0221']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0221: 'sp_0017',
} as const;
