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
  publisher: 'Seriously Fish',
  url,
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
});

export const compatibilityNumericWave3Sources = {
  pseudomugilFurcatus: source(
    'seriouslyfish-pseudomugil-furcatus-numeric-husbandry',
    'Pseudomugil furcatus (Forktail Blue-eye)',
    'https://www.seriouslyfish.com/species/pseudomugil-furcatus',
  ),
  sawbwaResplendens: source(
    'seriouslyfish-sawbwa-resplendens-numeric-husbandry',
    'Sawbwa resplendens (Asian Rummynose)',
    'https://www.seriouslyfish.com/species/sawbwa-resplendens',
  ),
  chandaRanga: source(
    'seriouslyfish-chanda-ranga-numeric-husbandry',
    'Chanda ranga (Indian Glass Fish; formerly Parambassis ranga)',
    'https://www.seriouslyfish.com/species/chanda-ranga',
  ),
  makunaimaPittieri: source(
    'seriouslyfish-makunaima-pittieri-numeric-husbandry',
    'Makunaima pittieri (Diamond Tetra; formerly Moenkhausia pittieri)',
    'https://www.seriouslyfish.com/species/makunaima-pittieri',
  ),
  sphaerichthysOsphromenoides: source(
    'seriouslyfish-sphaerichthys-osphromenoides-numeric-husbandry',
    'Sphaerichthys osphromenoides (Chocolate Gourami)',
    'https://www.seriouslyfish.com/species/sphaerichthys-osphromenoides',
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

const pFurcatus = compatibilityNumericWave3Sources.pseudomugilFurcatus.id;
const sResplendens = compatibilityNumericWave3Sources.sawbwaResplendens.id;
const cRanga = compatibilityNumericWave3Sources.chandaRanga.id;
const mPittieri = compatibilityNumericWave3Sources.makunaimaPittieri.id;
const sOsphromenoides = compatibilityNumericWave3Sources.sphaerichthysOsphromenoides.id;

const chocolateGouramiNumericReviews = (speciesId: string): CatalogFieldReview[] => [
  supported(speciesId, 'temperature', { min: 26, max: 31 }, sOsphromenoides,
    'Seriously Fish gives 26–31 °C for exact Sphaerichthys osphromenoides.'),
  supported(speciesId, 'ph', { min: 4, max: 6.5 }, sOsphromenoides,
    'Seriously Fish gives pH 4.0–6.5 for wild Sphaerichthys osphromenoides; this direct exact-taxon range is retained conservatively.'),
  supported(speciesId, 'adult_size', { min: null, max: 5 }, sOsphromenoides,
    'Seriously Fish lists a maximum standard length of 50 mm for exact Sphaerichthys osphromenoides.'),
  supported(speciesId, 'tank_size', { liters: 54, lengthCm: 60 }, sOsphromenoides,
    'Seriously Fish lists a 60 × 30 cm aquarium base and an approximately 54 L aquarium volume for exact Sphaerichthys osphromenoides.'),
];

export const compatibilityNumericWave3FieldReviews: CatalogFieldReview[] = [
  supported('sp_0135', 'temperature', { min: 24, max: 28 }, pFurcatus,
    'Seriously Fish gives 24–28 °C for exact Pseudomugil furcatus.'),
  supported('sp_0135', 'ph', { min: 7, max: 8 }, pFurcatus,
    'Seriously Fish gives pH 7.0–8.0 for exact Pseudomugil furcatus.'),
  supported('sp_0135', 'adult_size', { min: null, max: 6 }, pFurcatus,
    'Seriously Fish lists a maximum standard length of 60 mm for exact Pseudomugil furcatus.'),
  supported('sp_0135', 'tank_size', { liters: 54, lengthCm: 60 }, pFurcatus,
    'Seriously Fish lists a 60 × 30 cm aquarium base and an approximately 54 L aquarium volume for exact Pseudomugil furcatus.'),

  supported('sp_0111', 'temperature', { min: 18, max: 22 }, sResplendens,
    'Seriously Fish gives 18–22 °C for exact Sawbwa resplendens.'),
  supported('sp_0111', 'ph', { min: 6, max: 8 }, sResplendens,
    'Seriously Fish gives pH 6.0–8.0 for exact Sawbwa resplendens.'),
  supported('sp_0111', 'adult_size', { min: null, max: 3.5 }, sResplendens,
    'Seriously Fish lists a maximum standard length of 35 mm for exact Sawbwa resplendens.'),
  supported('sp_0111', 'tank_size', { liters: 54, lengthCm: 60 }, sResplendens,
    'Seriously Fish lists a 60 × 30 cm aquarium base and an approximately 54 L aquarium volume for exact Sawbwa resplendens.'),

  supported('sp_0132', 'water', 'freshwater', cRanga,
    'The exact Chanda ranga page, explicitly marked as formerly Parambassis ranga, states that the species is mostly found in freshwater and needs no added salt.'),
  supported('sp_0132', 'temperature', { min: 20, max: 30 }, cRanga,
    'Seriously Fish gives 20–30 °C for exact Chanda ranga, formerly Parambassis ranga.'),
  supported('sp_0132', 'ph', { min: 6.5, max: 8 }, cRanga,
    'Seriously Fish gives pH 6.5–8.0 for exact Chanda ranga, formerly Parambassis ranga.'),
  supported('sp_0132', 'adult_size', { min: null, max: 8 }, cRanga,
    'Seriously Fish lists a maximum standard length of 80 mm for exact Chanda ranga, formerly Parambassis ranga.'),
  supported('sp_0132', 'tank_size', { liters: 72, lengthCm: 80 }, cRanga,
    'Seriously Fish lists an 80 × 30 cm aquarium base and an approximately 72 L aquarium volume for exact Chanda ranga, formerly Parambassis ranga.'),

  supported('sp_0471', 'temperature', { min: 24, max: 28 }, mPittieri,
    'Seriously Fish gives 24–28 °C for exact Makunaima pittieri, explicitly marked as formerly Moenkhausia pittieri.'),
  supported('sp_0471', 'ph', { min: 5.5, max: 7 }, mPittieri,
    'Seriously Fish gives pH 5.5–7.0 for exact Makunaima pittieri, formerly Moenkhausia pittieri.'),
  supported('sp_0471', 'adult_size', { min: null, max: 6 }, mPittieri,
    'Seriously Fish lists a maximum standard length of 60 mm for exact Makunaima pittieri, formerly Moenkhausia pittieri.'),
  supported('sp_0471', 'tank_size', { liters: 68, lengthCm: 60 }, mPittieri,
    'Seriously Fish lists a 60 × 38 cm aquarium base and an approximately 68 L aquarium volume for exact Makunaima pittieri, formerly Moenkhausia pittieri.'),

  ...chocolateGouramiNumericReviews('sp_0060'),
  ...chocolateGouramiNumericReviews('sp_0136'),
];

export const compatibilityNumericWave3VerifiedSourceIds = Object.values(
  compatibilityNumericWave3Sources,
).map(item => item.id);

export const compatibilityNumericWave3ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [] as const;

export const compatibilityNumericWave3AuthorityPatch = {
  patchId: 'numeric-evidence-wave3-20261015',
  speciesIds: ['sp_0135', 'sp_0111', 'sp_0132', 'sp_0471', 'sp_0060', 'sp_0136'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave3-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
