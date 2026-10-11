import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-11T10:05:00+08:00';

type Subject = {
  speciesId: string;
  commonName: string;
  scientificName: string;
  source: CatalogEvidenceSource;
  adultSizeMaxCm: number;
  socialMode: 'group' | 'variable';
  socialNote: string;
};

export const lutjanusKasmiraFishBase: CatalogEvidenceSource = {
  id: 'fishbase-lutjanus-kasmira',
  title: 'Lutjanus kasmira species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Lutjanus-kasmira',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

export const zebrasomaFlavescensFishBase: CatalogEvidenceSource = {
  id: 'fishbase-zebrasoma-flavescens',
  title: 'Zebrasoma flavescens species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/6018',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

export const paracanthurusHepatusFishBase: CatalogEvidenceSource = {
  id: 'fishbase-paracanthurus-hepatus',
  title: 'Paracanthurus hepatus species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Paracanthurus-hepatus.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const subjects: Subject[] = [
  {
    speciesId: 'sp_0022',
    commonName: '红利',
    scientificName: 'Lutjanus kasmira',
    source: lutjanusKasmiraFishBase,
    adultSizeMaxCm: 40,
    socialMode: 'group',
    socialNote: 'FishBase records adults as frequently occurring in large aggregations around coral formations, caves or wrecks. No universal aquarium minimum group size is inferred.',
  },
  {
    speciesId: 'sp_0023',
    commonName: '黄倒吊',
    scientificName: 'Zebrasoma flavescens',
    source: zebrasomaFlavescensFishBase,
    adultSizeMaxCm: 20,
    socialMode: 'variable',
    socialNote: 'FishBase records adults occurring singly or in loose groups. This supports variable social organization, not a fixed aquarium group minimum.',
  },
  {
    speciesId: 'sp_0024',
    commonName: '蓝倒吊',
    scientificName: 'Paracanthurus hepatus',
    source: paracanthurusHepatusFishBase,
    adultSizeMaxCm: 31,
    socialMode: 'group',
    socialNote: 'FishBase records loose aggregations and juvenile/subadult groups near coral heads. No universal aquarium minimum group size is inferred.',
  },
];

const supported = (
  subject: Subject,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  conflictNotes: string[] = [],
): CatalogFieldReview => ({
  speciesId: subject.speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds: [subject.source.id],
  conflictNotes,
  reviewedAt,
});

const unknown = (
  subject: Subject,
  field: CatalogFieldReview['field'],
  conflictNote: string,
): CatalogFieldReview => ({
  speciesId: subject.speciesId,
  field,
  proposedValue: null,
  status: 'reviewed',
  resolution: 'unknown',
  confidence: 'unknown',
  citationIds: [subject.source.id],
  conflictNotes: [conflictNote],
  reviewedAt,
});

export const nextWaveMarine01FieldReviews: CatalogFieldReview[] = subjects.flatMap(subject => [
  supported(subject, 'identity', {
    scientificName: subject.scientificName,
    baseSpeciesKey: subject.scientificName,
    variantKey: null,
  }),
  supported(subject, 'water', 'saltwater'),
  unknown(subject, 'temperature', 'The reviewed FishBase species summary does not provide an aquarium husbandry temperature range suitable for direct product enforcement.'),
  unknown(subject, 'ph', 'The reviewed FishBase species summary does not provide an aquarium husbandry pH range suitable for direct product enforcement.'),
  supported(subject, 'adult_size', { min: null, max: subject.adultSizeMaxCm }),
  unknown(subject, 'tank_size', 'Wild maximum body length and reef habitat do not establish a reviewed minimum aquarium volume or tank length.'),
  supported(subject, 'social_behavior', { mode: subject.socialMode, minimumGroupSize: null }, [subject.socialNote]),
  unknown(subject, 'territoriality', 'The reviewed source does not establish a general aquarium territoriality rule that can be safely promoted into compatibility decisions.'),
  unknown(subject, 'predation', 'Diet or trophic ecology alone is not promoted into an aquarium prey-size or tankmate predation rule without direct compatibility evidence.'),
  unknown(subject, 'breeding_behavior', 'The reviewed source does not establish a general breeding-defense rule suitable for aquarium compatibility decisions.'),
]);

export const nextWaveMarine01VerifiedSourceIds = new Set(subjects.map(subject => subject.source.id));
