import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-20T23:30:00+09:00';

export const variantEvidencePhase2_17Sources = {
  redGrassGuppyAquaticArts: {
    id: 'aquaticarts-red-grass-guppy-variant-phase2-17',
    title: 'Red Grass Guppy (Poecilia reticulata "Red Grass") — exact-variant care guide',
    publisher: 'Aquatic Arts',
    url: 'https://aquaticarts.com/products/red-grass-guppy-poecilia-reticulata-bred-by-aquatic-arts',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  longfinNeonTankBud: {
    id: 'tankbud-longfin-neon-tetra-variant-phase2-17',
    title: 'Longfin neon tetra (Paracheirodon innesi) — exact-variety care profile',
    publisher: 'TankBud',
    url: 'https://tankbud.com/species/longfin-neon-tetra',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  longfinNeonFlipAquatics: {
    id: 'flipaquatics-longfin-neon-tetra-variant-phase2-17',
    title: 'Long Fin Neon Tetra (Paracheirodon innesi longfin) — tank parameters and behaviour',
    publisher: 'Flip Aquatics',
    url: 'https://flipaquatics.com/products/long-fin-neon-tetra',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  longfinWhiteCloudAquaticArts: {
    id: 'aquaticarts-longfin-white-cloud-variant-phase2-17',
    title: 'Longfin White Cloud Mountain Minnow (Tanichthys albonubes) — exact-variant care guide',
    publisher: 'Aquatic Arts',
    url: 'https://aquaticarts.com/products/longfin-white-cloud-mountain-minnow-tanichthys-albonubes-tank-bred',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  butterflyTailAppAquatic: {
    id: 'app-aquatic-butterfly-tail-goldfish-variant-phase2-17',
    title: 'Butterfly Tail Goldfish (Carassius auratus) — exact-variety care profile',
    publisher: 'App-aquatic',
    url: 'https://app-aquatic.com/species/butterfly-tail-goldfish/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

const redGrass = variantEvidencePhase2_17Sources.redGrassGuppyAquaticArts.id;
const longfinNeonTankBud = variantEvidencePhase2_17Sources.longfinNeonTankBud.id;
const longfinNeonFlip = variantEvidencePhase2_17Sources.longfinNeonFlipAquatics.id;
const longfinWhiteCloud = variantEvidencePhase2_17Sources.longfinWhiteCloudAquaticArts.id;
const butterflyTail = variantEvidencePhase2_17Sources.butterflyTailAppAquatic.id;

export const variantEvidencePhase2_17FieldReviews: CatalogFieldReview[] = [
  // sp_0143 — Red Grass Guppy. Exact-variant Aquatic Arts page supplies the
  // parameter/size/social facts; no territoriality or fish-predation claim is inferred.
  supported('sp_0143', 'water', 'freshwater', [redGrass], [
    'The exact Red Grass Guppy page identifies this captive-bred Poecilia reticulata variety in a freshwater aquarium context.',
  ]),
  supported('sp_0143', 'temperature', { min: 22, max: 28 }, [redGrass], [
    'The exact-variant care guide recommends 22–28°C.',
  ]),
  supported('sp_0143', 'ph', { min: 6.8, max: 7.8 }, [redGrass], [
    'The exact-variant care guide recommends pH 6.8–7.8.',
  ]),
  supported('sp_0143', 'adult_size', { min: 3.81, max: 5.08 }, [redGrass], [
    'The exact-variant care guide gives an adult size of 1.5–2 inches; values are converted to centimetres.',
  ]),
  supported('sp_0143', 'tank_size', { liters: 37.85, lengthCm: null }, [redGrass], [
    'The exact-variant care guide lists a 10 US gallon minimum tank; the volume is converted to litres.',
  ]),
  supported('sp_0143', 'social_behavior', { mode: 'group', minimumGroupSize: null }, [redGrass], [
    'The exact Red Grass Guppy guide describes the variety as peaceful and social and says it is best kept in groups; it does not specify a numeric minimum.',
  ]),

  // sp_0155 — Longfin Neon Tetra. TankBud provides complete exact-variety
  // environmental/size/tank values; Flip Aquatics independently corroborates the
  // exact longfin identity, schooling behaviour and a narrower parameter range.
  supported('sp_0155', 'water', 'freshwater', [longfinNeonTankBud], [
    'The exact Longfin Neon Tetra profile classifies the variety as a freshwater fish.',
  ]),
  supported('sp_0155', 'temperature', { min: 21, max: 25 }, [longfinNeonTankBud, longfinNeonFlip], [
    'TankBud gives 21–25°C for the exact longfin variety; Flip Aquatics independently gives 70–74°F for the same longfin form.',
  ]),
  supported('sp_0155', 'ph', { min: 5, max: 7.5 }, [longfinNeonTankBud, longfinNeonFlip], [
    'TankBud gives pH 5.0–7.5 for the exact longfin variety; Flip Aquatics independently publishes a narrower pH 7.2–7.5 operating range.',
  ]),
  supported('sp_0155', 'adult_size', { min: null, max: 3.8 }, [longfinNeonTankBud], [
    'The exact Longfin Neon Tetra profile gives an adult size of about 3.8 cm.',
  ]),
  supported('sp_0155', 'tank_size', { liters: 40, lengthCm: null }, [longfinNeonTankBud], [
    'The exact Longfin Neon Tetra profile lists a 40 L minimum aquarium.',
  ]),
  supported('sp_0155', 'social_behavior', { mode: 'group', minimumGroupSize: null }, [longfinNeonTankBud, longfinNeonFlip], [
    'Both exact longfin sources describe schooling/group-living behaviour; neither exact page establishes a numeric minimum that is required for this catalog object.',
  ]),

  // sp_0361 — Longfin White Cloud Mountain Minnow. Aquatic Arts is an
  // exact-variant, tank-bred care page and directly publishes all six fields below.
  supported('sp_0361', 'water', 'freshwater', [longfinWhiteCloud], [
    'The exact Longfin White Cloud product is listed as a freshwater minnow and the care page is for the tank-bred longfin variant.',
  ]),
  supported('sp_0361', 'temperature', { min: 18, max: 22 }, [longfinWhiteCloud], [
    'The exact-variant care guide recommends 18–22°C.',
  ]),
  supported('sp_0361', 'ph', { min: 6, max: 8 }, [longfinWhiteCloud], [
    'The exact-variant care guide recommends pH 6.0–8.0.',
  ]),
  supported('sp_0361', 'adult_size', { min: 3.81, max: 5.08 }, [longfinWhiteCloud], [
    'The exact-variant care guide gives approximately 1.5–2 inches adult size; values are converted to centimetres.',
  ]),
  supported('sp_0361', 'tank_size', { liters: 37.85, lengthCm: null }, [longfinWhiteCloud], [
    'The exact-variant care guide lists a 10 US gallon minimum aquarium; the volume is converted to litres.',
  ]),
  supported('sp_0361', 'social_behavior', { mode: 'group', minimumGroupSize: 6 }, [longfinWhiteCloud], [
    'The exact-variant guide explicitly recommends groups of six or more.',
  ]),

  // sp_0065 — Butterfly Tail Goldfish. The exact-variety page supports the
  // environmental/size/space fields but "Schooling: No" is intentionally not
  // translated into solitary/pair/variable social authority.
  supported('sp_0065', 'water', 'freshwater', [butterflyTail], [
    'The exact Butterfly Tail Goldfish profile is explicitly a freshwater aquarium care page.',
  ], 'medium'),
  supported('sp_0065', 'temperature', { min: 10, max: 22.22 }, [butterflyTail], [
    'The exact-variety profile gives 50–72°F; values are converted to approximately 10–22.2°C.',
  ], 'medium'),
  supported('sp_0065', 'ph', { min: 6, max: 8 }, [butterflyTail], [
    'The exact-variety profile recommends pH 6.0–8.0.',
  ], 'medium'),
  supported('sp_0065', 'adult_size', { min: null, max: 20 }, [butterflyTail], [
    'The exact Butterfly Tail profile gives a maximum adult size of 20 cm.',
  ], 'medium'),
  supported('sp_0065', 'tank_size', { liters: 150, lengthCm: null }, [butterflyTail], [
    'The exact Butterfly Tail profile lists a 150 L minimum aquarium.',
  ], 'medium'),
];

export const variantEvidencePhase2_17VerifiedSourceIds = Object.values(variantEvidencePhase2_17Sources)
  .map(source => source.id);

export const variantEvidencePhase2_17ProfileIds = ['sp_0065', 'sp_0143', 'sp_0155', 'sp_0361'] as const;
