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

export const compatibilityNumericWave1Sources = {
  poropanchaxNormani: source(
    'fishipedia-poropanchax-normani-numeric-husbandry',
    'Poropanchax normani • Killi • Fiche poissons',
    'https://www.fishipedia.fr/fr/poissons/poropanchax-normani',
  ),
  hyphessobryconAmapaensis: source(
    'fishipedia-hyphessobrycon-amapaensis-numeric-husbandry',
    "Tétra d'Amapá • Hyphessobrycon amapaensis • Fiche poissons",
    'https://www.fishipedia.fr/fr/poissons/hyphessobrycon-amapaensis',
  ),
  hemigrammusRodwayi: source(
    'fishipedia-hemigrammus-rodwayi-numeric-husbandry',
    'Tétra doré • Hemigrammus rodwayi • Fiche poissons',
    'https://www.fishipedia.fr/fr/poissons/hemigrammus-rodwayi',
  ),
  iriatherinaWerneri: source(
    'fishipedia-iriatherina-werneri-numeric-husbandry',
    'Poisson arc-en-ciel • Iriatherina werneri • Fiche poissons',
    'https://www.fishipedia.fr/fr/poissons/iriatherina-werneri',
  ),
  kryptopterusVitreolus: source(
    'fishipedia-kryptopterus-vitreolus-numeric-husbandry',
    'Silure de verre • Kryptopterus vitreolus • Fiche poissons',
    'https://www.fishipedia.fr/fr/poissons/kryptopterus-vitreolus',
  ),
  nannostomusBeckfordi: source(
    'fishipedia-nannostomus-beckfordi-numeric-husbandry',
    'Poisson-crayon • Nannostomus beckfordi • Fiche poissons',
    'https://www.fishipedia.fr/fr/poissons/nannostomus-beckfordi',
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

const pNormani = compatibilityNumericWave1Sources.poropanchaxNormani.id;
const hAmapaensis = compatibilityNumericWave1Sources.hyphessobryconAmapaensis.id;
const hRodwayi = compatibilityNumericWave1Sources.hemigrammusRodwayi.id;
const iWerneri = compatibilityNumericWave1Sources.iriatherinaWerneri.id;
const kVitreolus = compatibilityNumericWave1Sources.kryptopterusVitreolus.id;
const nBeckfordi = compatibilityNumericWave1Sources.nannostomusBeckfordi.id;

export const compatibilityNumericWave1FieldReviews: CatalogFieldReview[] = [
  supported('sp_0112', 'tank_size', { liters: 50, lengthCm: null }, pNormani,
    'Fishipedia’s exact Poropanchax normani maintenance table gives a 50 L minimum volume. No tank-length minimum is inferred.'),

  supported('sp_0115', 'temperature', { min: 24, max: 27 }, hAmapaensis,
    'Fishipedia gives 24–27 °C in both the natural-habitat and aquarium-maintenance sections for exact Hyphessobrycon amapaensis.'),
  supported('sp_0115', 'ph', { min: 5.3, max: 6.5 }, hAmapaensis,
    'Fishipedia gives pH 5.3–6.5 for exact Hyphessobrycon amapaensis.'),
  supported('sp_0115', 'tank_size', { liters: 50, lengthCm: null }, hAmapaensis,
    'Fishipedia’s exact species maintenance table gives a 50 L minimum aquarium volume; no tank-length minimum is inferred.'),

  supported('sp_0362', 'temperature', { min: 24, max: 28 }, hRodwayi,
    'Fishipedia gives 24–28 °C in the exact Hemigrammus rodwayi habitat and aquarium-maintenance sections.'),
  supported('sp_0362', 'ph', { min: 6, max: 6.5 }, hRodwayi,
    'Fishipedia gives pH 6.0–6.5 for exact Hemigrammus rodwayi.'),
  supported('sp_0362', 'adult_size', { min: null, max: 5 }, hRodwayi,
    'Fishipedia’s structured morphology table lists a 5 cm maximum for exact Hemigrammus rodwayi; a nearby prose sentence says about 4 cm, so 5 cm is retained conservatively.'),
  supported('sp_0362', 'tank_size', { liters: 80, lengthCm: null }, hRodwayi,
    'Fishipedia’s exact species maintenance table gives an 80 L minimum aquarium volume; no tank-length minimum is inferred.'),

  supported('sp_0134', 'water', 'freshwater', iWerneri,
    'Fishipedia explicitly describes exact Iriatherina werneri as a freshwater fish.'),
  supported('sp_0134', 'temperature', { min: 26, max: 30 }, iWerneri,
    'Fishipedia gives 26–30 °C for exact Iriatherina werneri.'),
  supported('sp_0134', 'ph', { min: 5.5, max: 7.5 }, iWerneri,
    'Fishipedia gives pH 5.5–7.5 for exact Iriatherina werneri.'),
  supported('sp_0134', 'adult_size', { min: null, max: 5 }, iWerneri,
    'Fishipedia’s exact species morphology table lists a 5 cm maximum length.'),
  supported('sp_0134', 'tank_size', { liters: 60, lengthCm: null }, iWerneri,
    'Fishipedia’s exact species maintenance table gives a 60 L minimum aquarium volume; no tank-length minimum is inferred.'),

  supported('sp_0458', 'water', 'freshwater', kVitreolus,
    'Fishipedia explicitly describes exact Kryptopterus vitreolus as a freshwater fish.'),
  supported('sp_0458', 'temperature', { min: 24, max: 28 }, kVitreolus,
    'Fishipedia gives 24–28 °C for exact Kryptopterus vitreolus.'),
  supported('sp_0458', 'ph', { min: 6.8, max: 7.2 }, kVitreolus,
    'Fishipedia’s aquarium-maintenance range is pH 6.8–7.2, which is narrower than its natural-habitat range and is used conservatively for husbandry compatibility.'),
  supported('sp_0458', 'adult_size', { min: null, max: 14 }, kVitreolus,
    'Fishipedia’s exact species morphology table lists a 14 cm maximum length.'),
  supported('sp_0458', 'tank_size', { liters: 250, lengthCm: null }, kVitreolus,
    'Fishipedia’s exact species maintenance table gives a 250 L minimum aquarium volume; no tank-length minimum is inferred.'),

  supported('sp_0473', 'temperature', { min: 24, max: 26 }, nBeckfordi,
    'Fishipedia gives 24–26 °C for exact Nannostomus beckfordi.'),
  supported('sp_0473', 'ph', { min: 6, max: 6.8 }, nBeckfordi,
    'Fishipedia’s aquarium-maintenance range is pH 6.0–6.8; this narrower husbandry range is used instead of the broader natural-habitat range.'),
  supported('sp_0473', 'adult_size', { min: null, max: 5 }, nBeckfordi,
    'Fishipedia’s exact species morphology table lists a 5 cm maximum length.'),
  supported('sp_0473', 'tank_size', { liters: 80, lengthCm: null }, nBeckfordi,
    'Fishipedia’s exact species maintenance table gives an 80 L minimum aquarium volume; no tank-length minimum is inferred.'),
];

export const compatibilityNumericWave1VerifiedSourceIds = Object.values(
  compatibilityNumericWave1Sources,
).map(item => item.id);

export const compatibilityNumericWave1ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [] as const;

export const compatibilityNumericWave1AuthorityPatch = {
  patchId: 'numeric-evidence-wave1-20261015',
  speciesIds: ['sp_0112', 'sp_0115', 'sp_0362', 'sp_0134', 'sp_0458', 'sp_0473'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave1-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
