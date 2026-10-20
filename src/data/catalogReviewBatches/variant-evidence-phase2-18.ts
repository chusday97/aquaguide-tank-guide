import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-20T14:50:00+08:00';

export const variantEvidencePhase2_18Sources = {
  redcapFishkeeping: {
    id: 'fishkeeping-redcap-oranda-variant-phase2-18',
    title: 'Redcap Oranda (Carassius auratus) — exact-variety care sheet',
    publisher: 'Fishkeeping.co.uk',
    url: 'https://www.fishkeeping.co.uk/modules/caresheets/caresheet.php?caresheetID=74',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  redcapAquario: {
    id: 'aquario-redcap-oranda-variant-phase2-18',
    title: 'Redcap Oranda (Carassius auratus) — exact-variety care profile',
    publisher: 'Aquario',
    url: 'https://aquario.me/fish/redcap-oranda',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  pearlscaleTankBud: {
    id: 'tankbud-pearlscale-goldfish-variant-phase2-18',
    title: 'Pearlscale (Carassius auratus) — exact-variety care profile',
    publisher: 'TankBud',
    url: 'https://tankbud.com/species/pearlscale-goldfish',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  pearlscaleFishkeepingWorld: {
    id: 'fishkeepingworld-pearlscale-goldfish-variant-phase2-18',
    title: 'Pearlscale Goldfish — behaviour, territoriality and predation profile',
    publisher: 'Fishkeeping World',
    url: 'https://fishkeepingworld.com/pearlscale-goldfish/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  bubbleEyeTankBud: {
    id: 'tankbud-bubble-eye-goldfish-variant-phase2-18',
    title: 'Bubble eye (Carassius auratus) — exact-variety care profile',
    publisher: 'TankBud',
    url: 'https://tankbud.com/species/bubble-eye-goldfish',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  bubbleEyeGoldfishTank: {
    id: 'goldfishtank-bubble-eye-variant-phase2-18',
    title: 'Bubble Eye Goldfish tank mates — exact-variety predation boundary',
    publisher: 'The Goldfish Tank',
    url: 'https://thegoldfishtank.com/goldfish-care/tank-mates/best-bubble-eye-goldfish/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  grassGuppyTankBud: {
    id: 'tankbud-grass-guppy-blue-grass-phase2-18',
    title: 'Grass guppy (Poecilia reticulata) — care profile explicitly covering Blue Grass',
    publisher: 'TankBud',
    url: 'https://tankbud.com/species/grass-guppy',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  blueGrassShoalStem: {
    id: 'shoalstem-blue-grass-guppy-phase2-18',
    title: 'Blue Grass Guppy (Poecilia reticulata) — exact-strain behaviour and fry predation',
    publisher: 'Shoal & Stem',
    url: 'https://shoalandstem.com/species/blue-grass-guppy',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  butterflyTailGoldfishTank: {
    id: 'goldfishtank-butterfly-tail-variant-phase2-18',
    title: 'Butterfly Tail Goldfish tank mates — exact-variety social and predation profile',
    publisher: 'The Goldfish Tank',
    url: 'https://thegoldfishtank.com/goldfish-care/tank-mates/best-butterfly-tail-goldfish/',
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

const redcap = variantEvidencePhase2_18Sources.redcapFishkeeping.id;
const redcapPredation = variantEvidencePhase2_18Sources.redcapAquario.id;
const pearlscale = variantEvidencePhase2_18Sources.pearlscaleTankBud.id;
const pearlscaleBehavior = variantEvidencePhase2_18Sources.pearlscaleFishkeepingWorld.id;
const bubbleEye = variantEvidencePhase2_18Sources.bubbleEyeTankBud.id;
const bubbleEyePredation = variantEvidencePhase2_18Sources.bubbleEyeGoldfishTank.id;
const blueGrass = variantEvidencePhase2_18Sources.grassGuppyTankBud.id;
const blueGrassPredation = variantEvidencePhase2_18Sources.blueGrassShoalStem.id;
const butterflyTailBehavior = variantEvidencePhase2_18Sources.butterflyTailGoldfishTank.id;

export const variantEvidencePhase2_18FieldReviews: CatalogFieldReview[] = [
  // sp_0066 — Red Cap Oranda. Fishkeeping.co.uk is an exact Redcap Oranda
  // care sheet and supplies the six environmental/size/social facts. Aquario
  // independently supplies an explicit small-fish predation boundary.
  supported('sp_0066', 'water', 'freshwater', [redcap], [
    'The exact Redcap Oranda care sheet classifies the variety as a coldwater aquarium fish; this is freshwater husbandry, not a marine/brackish context.',
  ]),
  supported('sp_0066', 'temperature', { min: 20, max: 24 }, [redcap], [
    'The exact Redcap Oranda care sheet gives 20–24°C.',
  ]),
  supported('sp_0066', 'ph', { min: 6.5, max: 8.5 }, [redcap], [
    'The exact Redcap Oranda care sheet gives pH 6.5–8.5.',
  ]),
  supported('sp_0066', 'adult_size', { min: null, max: 20 }, [redcap], [
    'The exact Redcap Oranda care sheet gives a maximum size of 20 cm.',
  ]),
  supported('sp_0066', 'tank_size', { liters: 140, lengthCm: null }, [redcap], [
    'The exact Redcap Oranda care sheet gives a 140 L minimum tank volume.',
  ]),
  supported('sp_0066', 'social_behavior', { mode: 'group', minimumGroupSize: null }, [redcap], [
    'The exact Redcap Oranda sheet explicitly describes the variety as very sociable with similar tank mates; no numeric minimum is promoted.',
  ]),
  supported('sp_0066', 'predation', { targets: ['small_fish'] }, [redcapPredation], [
    'The exact Redcap Oranda profile explicitly flags small fish as at risk. This does not establish a territoriality rule.',
  ], 'medium'),

  // sp_0067 — Pearlscale. Exact Pearlscale sources jointly cover all eight
  // required Compatibility fields; territoriality is supported only because the
  // behaviour source explicitly states that Pearlscales are not territorial.
  supported('sp_0067', 'water', 'freshwater', [pearlscale], [
    'The exact Pearlscale profile classifies the variety as a freshwater fish.',
  ]),
  supported('sp_0067', 'temperature', { min: 18, max: 24 }, [pearlscale], [
    'The exact Pearlscale profile gives 18–24°C.',
  ]),
  supported('sp_0067', 'ph', { min: 6.5, max: 8 }, [pearlscale], [
    'The exact Pearlscale profile gives pH 6.5–8.0.',
  ]),
  supported('sp_0067', 'adult_size', { min: null, max: 18 }, [pearlscale], [
    'The exact Pearlscale profile gives an adult size of about 18 cm.',
  ]),
  supported('sp_0067', 'tank_size', { liters: 95, lengthCm: null }, [pearlscale], [
    'The exact Pearlscale profile gives a 95 L minimum tank.',
  ]),
  supported('sp_0067', 'social_behavior', { mode: 'group', minimumGroupSize: null }, [pearlscale, pearlscaleBehavior], [
    'Exact Pearlscale sources describe the fish as social and suitable with comparable fancy goldfish; no numeric group minimum is promoted.',
  ]),
  supported('sp_0067', 'territoriality', { traits: [] }, [pearlscaleBehavior], [
    'The exact Pearlscale behaviour profile explicitly states that the variety is not territorial; breeding-period male aggression remains a separate context and is not promoted to permanent territoriality.',
  ]),
  supported('sp_0067', 'predation', { targets: ['small_fish'] }, [pearlscaleBehavior], [
    'The exact Pearlscale profile explicitly states that Pearlscales will eat sufficiently small fish.',
  ]),

  // sp_0068 — Bubble Eye. Exact Bubble Eye sources support the six core
  // environment/size/social fields plus a very-small-fish predation boundary.
  // Calm/non-aggressive descriptions are intentionally not converted into a
  // territoriality claim.
  supported('sp_0068', 'water', 'freshwater', [bubbleEye], [
    'The exact Bubble Eye profile classifies the variety as a freshwater fish.',
  ]),
  supported('sp_0068', 'temperature', { min: 18, max: 23 }, [bubbleEye], [
    'The exact Bubble Eye profile gives 18–23°C.',
  ]),
  supported('sp_0068', 'ph', { min: 6.5, max: 8 }, [bubbleEye], [
    'The exact Bubble Eye profile gives pH 6.5–8.0.',
  ]),
  supported('sp_0068', 'adult_size', { min: null, max: 15 }, [bubbleEye], [
    'The exact Bubble Eye profile gives an adult size of about 15 cm.',
  ]),
  supported('sp_0068', 'tank_size', { liters: 75, lengthCm: null }, [bubbleEye], [
    'The exact Bubble Eye profile gives a 75 L minimum tank.',
  ]),
  supported('sp_0068', 'social_behavior', { mode: 'group', minimumGroupSize: null }, [bubbleEye], [
    'The exact Bubble Eye profile marks the variety as social; no numeric group minimum is promoted.',
  ]),
  supported('sp_0068', 'predation', { targets: ['very_small_fish'] }, [bubbleEyePredation], [
    'The exact Bubble Eye tank-mate guide warns that very tiny fish may be eaten; the predation scope is deliberately limited to very small fish.',
  ], 'medium'),

  // sp_0144 — Blue Grass Guppy. TankBud's Grass Guppy page explicitly names
  // Blue Grass and says the named grass colour forms use the same husbandry plan.
  // Shoal & Stem independently supplies a strain-level fry-predation boundary.
  supported('sp_0144', 'water', 'freshwater', [blueGrass], [
    'The Grass Guppy variety page explicitly includes Blue Grass within this Poecilia reticulata freshwater variety plan.',
  ]),
  supported('sp_0144', 'temperature', { min: 18, max: 28 }, [blueGrass], [
    'The Grass Guppy profile explicitly covering Blue Grass gives 18–28°C.',
  ]),
  supported('sp_0144', 'ph', { min: 6.8, max: 7.8 }, [blueGrass], [
    'The Grass Guppy profile explicitly covering Blue Grass gives pH 6.8–7.8.',
  ]),
  supported('sp_0144', 'adult_size', { min: null, max: 6 }, [blueGrass], [
    'The Grass Guppy profile explicitly covering Blue Grass gives an adult size of about 6 cm.',
  ]),
  supported('sp_0144', 'tank_size', { liters: 50, lengthCm: null }, [blueGrass], [
    'The Grass Guppy profile explicitly covering Blue Grass gives a 50 L minimum tank.',
  ]),
  supported('sp_0144', 'social_behavior', { mode: 'group', minimumGroupSize: null }, [blueGrass], [
    'The Grass Guppy profile explicitly covering Blue Grass marks the strain as social; no numeric minimum is promoted.',
  ]),
  supported('sp_0144', 'predation', { targets: ['very_small_fish'] }, [blueGrassPredation], [
    'The exact Blue Grass Guppy profile states that adults readily consume their own fry. This is promoted only as a very-small-fish predation boundary, not a general predatory-fish label.',
  ], 'medium'),

  // sp_0065 — Butterfly Tail. A second exact-variety source closes the two
  // remaining fields it directly supports. Territoriality stays unresolved.
  supported('sp_0065', 'social_behavior', { mode: 'group', minimumGroupSize: null }, [butterflyTailBehavior], [
    'The exact Butterfly Tail tank-mate guide describes the variety as gregarious and thriving in groups of similar goldfish; no numeric minimum is promoted.',
  ], 'medium'),
  supported('sp_0065', 'predation', { targets: ['very_small_fish'] }, [butterflyTailBehavior], [
    'The exact Butterfly Tail guide explicitly states that small shrimp and tiny fish may be eaten; the scope is limited to very small fish.',
  ], 'medium'),
];

export const variantEvidencePhase2_18VerifiedSourceIds = Object.values(variantEvidencePhase2_18Sources)
  .map(source => source.id);

export const variantEvidencePhase2_18ProfileIds = ['sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0144'] as const;
