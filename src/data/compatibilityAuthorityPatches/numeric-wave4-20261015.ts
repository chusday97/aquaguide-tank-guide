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

export const compatibilityNumericWave4Sources = {
  erpetoichthysCalabaricus: source(
    'seriouslyfish-erpetoichthys-calabaricus-numeric-husbandry',
    'Erpetoichthys calabaricus (Reedfish)',
    'https://www.seriouslyfish.com/species/erpetoichthys-calabaricus',
  ),
  semaprochilodusInsignis: source(
    'seriouslyfish-semaprochilodus-insignis-numeric-husbandry',
    'Semaprochilodus insignis (Flagtail Prochilodus)',
    'https://www.seriouslyfish.com/species/semaprochilodus-insignis',
  ),
  semaprochilodusTaeniurus: source(
    'seriouslyfish-semaprochilodus-taeniurus-numeric-husbandry',
    'Semaprochilodus taeniurus (Silver Prochilodus)',
    'https://www.seriouslyfish.com/species/semaprochilodus-taeniurus',
  ),
  thayeriaBoehlkei: source(
    'seriouslyfish-thayeria-boehlkei-numeric-husbandry',
    'Thayeria boehlkei (Blackline Penguin Fish)',
    'https://www.seriouslyfish.com/species/thayeria-boehlkei',
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

const eCalabaricus = compatibilityNumericWave4Sources.erpetoichthysCalabaricus.id;
const sInsignis = compatibilityNumericWave4Sources.semaprochilodusInsignis.id;
const sTaeniurus = compatibilityNumericWave4Sources.semaprochilodusTaeniurus.id;
const tBoehlkei = compatibilityNumericWave4Sources.thayeriaBoehlkei.id;

const insignisNumericReviews = (speciesId: string): CatalogFieldReview[] => [
  supported(speciesId, 'temperature', { min: 23, max: 29 }, sInsignis,
    'Seriously Fish gives 23–29 °C for exact Semaprochilodus insignis.'),
  supported(speciesId, 'ph', { min: 5.5, max: 7.2 }, sInsignis,
    'Seriously Fish gives pH 5.5–7.2 for exact Semaprochilodus insignis.'),
  supported(speciesId, 'adult_size', { min: null, max: 35 }, sInsignis,
    'Seriously Fish lists a maximum standard length of 350 mm for exact Semaprochilodus insignis.'),
  supported(speciesId, 'tank_size', { liters: 540, lengthCm: 150 }, sInsignis,
    'Seriously Fish lists a 150 × 60 cm aquarium base and an approximately 540 L aquarium volume for exact Semaprochilodus insignis.'),
];

export const compatibilityNumericWave4FieldReviews: CatalogFieldReview[] = [
  supported('sp_0106', 'temperature', { min: 23, max: 30 }, eCalabaricus,
    'Seriously Fish gives 23–30 °C for exact Erpetoichthys calabaricus.'),
  supported('sp_0106', 'ph', { min: 6, max: 7.5 }, eCalabaricus,
    'Seriously Fish gives pH 6.0–7.5 for exact Erpetoichthys calabaricus.'),
  supported('sp_0106', 'adult_size', { min: null, max: 90 }, eCalabaricus,
    'Seriously Fish lists a maximum standard length of 900 mm for exact Erpetoichthys calabaricus.'),
  supported('sp_0106', 'tank_size', { liters: 540, lengthCm: 150 }, eCalabaricus,
    'Seriously Fish lists a 150 × 60 cm aquarium base and an approximately 540 L aquarium volume for exact Erpetoichthys calabaricus.'),

  ...insignisNumericReviews('sp_0061'),
  ...insignisNumericReviews('sp_0137'),

  supported('sp_0107', 'temperature', { min: 23, max: 29 }, sTaeniurus,
    'Seriously Fish gives 23–29 °C for exact Semaprochilodus taeniurus.'),
  supported('sp_0107', 'ph', { min: 5.5, max: 7.5 }, sTaeniurus,
    'Seriously Fish gives pH 5.5–7.5 for exact Semaprochilodus taeniurus.'),
  supported('sp_0107', 'adult_size', { min: null, max: 30 }, sTaeniurus,
    'Seriously Fish lists a maximum standard length of 300 mm for exact Semaprochilodus taeniurus.'),
  supported('sp_0107', 'tank_size', { liters: 540, lengthCm: 150 }, sTaeniurus,
    'Seriously Fish lists a 150 × 60 cm aquarium base and an approximately 540 L aquarium volume for exact Semaprochilodus taeniurus.'),

  supported('sp_0472', 'temperature', { min: 22, max: 28 }, tBoehlkei,
    'Seriously Fish gives 22–28 °C for exact Thayeria boehlkei.'),
  supported('sp_0472', 'adult_size', { min: null, max: 3.6 }, tBoehlkei,
    'Seriously Fish lists a maximum standard length of 36 mm for exact Thayeria boehlkei.'),
  supported('sp_0472', 'tank_size', { liters: 68, lengthCm: 60 }, tBoehlkei,
    'Seriously Fish lists a 60 × 38 cm aquarium base and an approximately 68 L aquarium volume for exact Thayeria boehlkei.'),
];

export const compatibilityNumericWave4VerifiedSourceIds = Object.values(
  compatibilityNumericWave4Sources,
).map(item => item.id);

export const compatibilityNumericWave4ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [] as const;

export const compatibilityNumericWave4AuthorityPatch = {
  patchId: 'numeric-evidence-wave4-20261015',
  speciesIds: ['sp_0106', 'sp_0061', 'sp_0137', 'sp_0107', 'sp_0472'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave4-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
