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

export const compatibilityNumericWave2Sources = {
  abbottinaRivularis: source(
    'seriouslyfish-abbottina-rivularis-numeric-husbandry',
    'Abbottina rivularis (Chinese False Gudgeon)',
    'https://www.seriouslyfish.com/species/abbottina-rivularis',
  ),
  acheilognathusMacropterus: source(
    'seriouslyfish-acheilognathus-macropterus-numeric-husbandry',
    'Acheilognathus macropterus (Giant Chinese Bitterling)',
    'https://www.seriouslyfish.com/species/acheilognathus-macropterus',
  ),
  beaufortiaKweichowensis: source(
    'seriouslyfish-beaufortia-kweichowensis-numeric-husbandry',
    'Beaufortia kweichowensis (Butterfly Loach)',
    'https://www.seriouslyfish.com/species/beaufortia-kweichowensis/',
  ),
  epiplatysAnnulatus: source(
    'seriouslyfish-epiplatys-annulatus-numeric-husbandry',
    'Epiplatys annulatus (Clown Killifish)',
    'https://www.seriouslyfish.com/species/epiplatys-annulatus',
  ),
  hyphessobryconHerbertaxelrodi: source(
    'seriouslyfish-hyphessobrycon-herbertaxelrodi-numeric-husbandry',
    'Hyphessobrycon herbertaxelrodi (Black Neon Tetra)',
    'https://www.seriouslyfish.com/species/hyphessobrycon-herbertaxelrodi',
  ),
  hyphessobryconMegalopterus: source(
    'seriouslyfish-hyphessobrycon-megalopterus-numeric-husbandry',
    'Megalamphodus megalopterus (Black Phantom Tetra)',
    'https://www.seriouslyfish.com/species/megalamphodus-megalopterus',
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

const aRivularis = compatibilityNumericWave2Sources.abbottinaRivularis.id;
const aMacropterus = compatibilityNumericWave2Sources.acheilognathusMacropterus.id;
const bKweichowensis = compatibilityNumericWave2Sources.beaufortiaKweichowensis.id;
const eAnnulatus = compatibilityNumericWave2Sources.epiplatysAnnulatus.id;
const hHerbertaxelrodi = compatibilityNumericWave2Sources.hyphessobryconHerbertaxelrodi.id;
const hMegalopterus = compatibilityNumericWave2Sources.hyphessobryconMegalopterus.id;

export const compatibilityNumericWave2FieldReviews: CatalogFieldReview[] = [
  supported('sp_0041', 'temperature', { min: 16, max: 24 }, aRivularis,
    'Seriously Fish gives 16–24 °C for exact Abbottina rivularis.'),
  supported('sp_0041', 'ph', { min: 6, max: 8 }, aRivularis,
    'Seriously Fish gives pH 6.0–8.0 for exact Abbottina rivularis.'),
  supported('sp_0041', 'adult_size', { min: null, max: 15 }, aRivularis,
    'Seriously Fish lists a maximum standard length of 150 mm for exact Abbottina rivularis.'),
  supported('sp_0041', 'tank_size', { liters: 304, lengthCm: 150 }, aRivularis,
    'Seriously Fish recommends a 150 × 45 cm minimum base and reports an approximately 304 L aquarium volume for exact Abbottina rivularis.'),

  supported('sp_0037', 'temperature', { min: 14, max: 22 }, aMacropterus,
    'Seriously Fish gives 14–22 °C for exact Acheilognathus macropterus.'),
  supported('sp_0037', 'ph', { min: 6, max: 8 }, aMacropterus,
    'Seriously Fish gives pH 6.0–8.0 for exact Acheilognathus macropterus.'),
  supported('sp_0037', 'adult_size', { min: null, max: 27.5 }, aMacropterus,
    'Seriously Fish lists a maximum standard length of 275 mm. Its prose says typical adults are smaller, so the larger explicit maximum is retained conservatively.'),
  supported('sp_0037', 'tank_size', { liters: 648, lengthCm: 180 }, aMacropterus,
    'Seriously Fish lists a 180 × 60 cm aquarium base and an approximately 648 L aquarium volume for exact Acheilognathus macropterus.'),

  supported('sp_0128', 'temperature', { min: 16, max: 24 }, bKweichowensis,
    'Seriously Fish gives 16–24 °C for exact Beaufortia kweichowensis.'),
  supported('sp_0128', 'ph', { min: 6.5, max: 8 }, bKweichowensis,
    'Seriously Fish gives pH 6.5–8.0 for exact Beaufortia kweichowensis.'),
  supported('sp_0128', 'adult_size', { min: null, max: 7.5 }, bKweichowensis,
    'Seriously Fish lists a maximum standard length of 75 mm for exact Beaufortia kweichowensis.'),
  supported('sp_0128', 'tank_size', { liters: 54, lengthCm: 60 }, bKweichowensis,
    'Seriously Fish lists a 60 × 30 cm aquarium base and an approximately 54 L aquarium volume for exact Beaufortia kweichowensis.'),

  supported('sp_0113', 'temperature', { min: 20, max: 26 }, eAnnulatus,
    'Seriously Fish gives 20–26 °C for exact Epiplatys annulatus.'),
  supported('sp_0113', 'ph', { min: 4, max: 7 }, eAnnulatus,
    'Seriously Fish gives pH 4.0–7.0 for exact Epiplatys annulatus.'),
  supported('sp_0113', 'adult_size', { min: null, max: 3.5 }, eAnnulatus,
    'Seriously Fish lists a maximum standard length of 35 mm for exact Epiplatys annulatus.'),
  supported('sp_0113', 'tank_size', { liters: 41, lengthCm: 45 }, eAnnulatus,
    'Seriously Fish recommends a 45 × 30 cm minimum base and reports an approximately 41 L aquarium volume for exact Epiplatys annulatus.'),

  supported('sp_0470', 'temperature', { min: 20, max: 28 }, hHerbertaxelrodi,
    'Seriously Fish gives 20–28 °C for exact Hyphessobrycon herbertaxelrodi.'),
  supported('sp_0470', 'ph', { min: 5, max: 7.5 }, hHerbertaxelrodi,
    'Seriously Fish gives pH 5.0–7.5 for exact Hyphessobrycon herbertaxelrodi.'),
  supported('sp_0470', 'adult_size', { min: null, max: 3.5 }, hHerbertaxelrodi,
    'Seriously Fish lists a maximum standard length of 35 mm for exact Hyphessobrycon herbertaxelrodi.'),
  supported('sp_0470', 'tank_size', { liters: 72, lengthCm: 80 }, hHerbertaxelrodi,
    'Seriously Fish lists an 80 × 30 cm aquarium base and an approximately 72 L aquarium volume for exact Hyphessobrycon herbertaxelrodi.'),

  supported('sp_0467', 'temperature', { min: 20, max: 28 }, hMegalopterus,
    'Seriously Fish gives 20–28 °C for Megalamphodus megalopterus, the current taxonomic name for the catalog taxon Hyphessobrycon megalopterus.'),
  supported('sp_0467', 'ph', { min: 5, max: 7 }, hMegalopterus,
    'Seriously Fish gives pH 5.0–7.0 for Megalamphodus megalopterus (formerly Hyphessobrycon megalopterus).'),
  supported('sp_0467', 'adult_size', { min: null, max: 3.6 }, hMegalopterus,
    'Seriously Fish lists a maximum standard length of 36 mm for Megalamphodus megalopterus (formerly Hyphessobrycon megalopterus).'),
  supported('sp_0467', 'tank_size', { liters: 72, lengthCm: 80 }, hMegalopterus,
    'Seriously Fish lists an 80 × 30 cm aquarium base and an approximately 72 L aquarium volume for Megalamphodus megalopterus (formerly Hyphessobrycon megalopterus).'),
];

export const compatibilityNumericWave2VerifiedSourceIds = Object.values(
  compatibilityNumericWave2Sources,
).map(item => item.id);

export const compatibilityNumericWave2ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [] as const;

export const compatibilityNumericWave2AuthorityPatch = {
  patchId: 'numeric-evidence-wave2-20261015',
  speciesIds: ['sp_0041', 'sp_0037', 'sp_0128', 'sp_0113', 'sp_0470', 'sp_0467'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave2-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
