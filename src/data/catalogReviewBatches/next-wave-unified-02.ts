import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import {
  opsariichthysBidensDietStudy,
  opsariichthysBidensEnrichmentStudy,
  opsariichthysBidensFishBase,
} from './next-wave-freshwater-02';
import {
  mastacembelusFishBase,
  mastacembelusSeriouslyFish,
} from './next-wave-freshwater-04';

const reviewedAt = '2026-10-11T20:45:00+08:00';

export const nextWaveUnified02Sources = {
  macropodusFishBase: {
    id: 'batch19-fishbase-macropodus-opercularis',
    title: 'Macropodus opercularis species review',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Macropodus-opercularis',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  macropodusSeriouslyFish: {
    id: 'seriouslyfish-macropodus-opercularis',
    title: 'Macropodus opercularis (Paradise Fish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/macropodus-opercularis',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  moenkhausiaFishBase: {
    id: 'batch09-fishbase-moenkhausia-sanctaefilomenae',
    title: 'Moenkhausia sanctaefilomenae species review',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Moenkhausia-sanctaefilomenae',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  moenkhausiaSeriouslyFish: {
    id: 'seriouslyfish-moenkhausia-sanctaefilomenae',
    title: 'Moenkhausia sanctaefilomenae (Red-eye Tetra)',
    publisher: 'Seriously Fish',
    url: 'https://seriouslyfish.com/species/moenkhausia-sanctaefilomenae',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  polypterusFishBase: {
    id: 'batch19-fishbase-polypterus-ornatipinnis',
    title: 'Polypterus ornatipinnis species review',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Polypterus-ornatipinnis.html',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  polypterusSeriouslyFish: {
    id: 'seriouslyfish-polypterus-ornatapinnis',
    title: 'Polypterus ornatapinnis (Ornate Bichir)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/polypterus-ornatapinnis',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  channaBleheriFishBase: {
    id: 'batch19-fishbase-channa-bleheri',
    title: 'Channa bleheri species review',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Channa-bleheri.html',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  channaBleheriSeriouslyFish: {
    id: 'seriouslyfish-channa-bleheri',
    title: 'Channa bleheri (Rainbow snakehead)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/channa-bleheri',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  channaAurantimaculataFishBase: {
    id: 'batch19-fishbase-channa-aurantimaculata',
    title: 'Channa aurantimaculata species review',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Channa-aurantimaculata.html',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  channaAurantimaculataSeriouslyFish: {
    id: 'seriouslyfish-channa-aurantimaculata',
    title: 'Channa aurantimaculata (Orange-spotted Snakehead)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/channa-aurantimaculata',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  pantodonFishBase: {
    id: 'batch20-fishbase-pantodon-buchholzi',
    title: 'Pantodon buchholzi species review',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Pantodon-buchholzi',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  pantodonSeriouslyFish: {
    id: 'seriouslyfish-pantodon-buchholzi',
    title: 'Pantodon buchholzi (African Butterfly Fish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/pantodon-buchholzi',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  leporinusFishBase: {
    id: 'batch20-fishbase-leporinus-fasciatus',
    title: 'Leporinus fasciatus species review',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Leporinus-fasciatus',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  leporinusSeriouslyFish: {
    id: 'seriouslyfish-leporinus-fasciatus',
    title: 'Leporinus fasciatus (Banded Leporinus)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/leporinus-fasciatus',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  piaractusFishBase: {
    id: 'batch20-fishbase-piaractus-brachypomus',
    title: 'Piaractus brachypomus species review',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Piaractus-brachypomus',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  piaractusSeriouslyFish: {
    id: 'seriouslyfish-piaractus-brachypomus',
    title: 'Piaractus brachypomus (Red-bellied Pacu)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/piaractus-brachypomus',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  gnathonemusFishBase: {
    id: 'batch21-fishbase-gnathonemus-petersii',
    title: 'Gnathonemus petersii species review',
    publisher: 'FishBase',
    url: 'https://www.fishbase.se/summary/Gnathonemus-petersii',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  gnathonemusSeriouslyFish: {
    id: 'seriouslyfish-gnathonemus-petersii',
    title: 'Gnathonemus petersii (Elephantnose Fish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/gnathonemus-petersii',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  botiaSeriouslyFish: {
    id: 'seriouslyfish-botia-almorhae-trade-boundary',
    title: 'Botia almorhae (Yoyo Loach) trade identity note',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/botia-almorhae',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

type DirectSubject = {
  speciesId: string;
  scientificName: string;
  fishBase: CatalogEvidenceSource;
  husbandry: CatalogEvidenceSource;
  temperature: { min: number; max: number };
  ph: { min: number; max: number };
  adultSizeMaxCm: number;
  tankLengthCm: number;
  tankLiters?: number;
  socialMode: 'pair' | 'group' | 'variable';
  socialNote: string;
  territorialityTraits?: string[];
  predationTargets?: string[];
};

const directSubjects: DirectSubject[] = [
  {
    speciesId: 'sp_0059', scientificName: 'Macropodus opercularis',
    fishBase: nextWaveUnified02Sources.macropodusFishBase,
    husbandry: nextWaveUnified02Sources.macropodusSeriouslyFish,
    temperature: { min: 10, max: 22 }, ph: { min: 6, max: 8 }, adultSizeMaxCm: 8, tankLengthCm: 80,
    socialMode: 'pair',
    socialNote: 'Pair-oriented housing is supported, with male territorial aggression especially around breeding.',
    territorialityTraits: ['territorial_males', 'breeding_aggression'],
  },
  {
    speciesId: 'sp_0062', scientificName: 'Moenkhausia sanctaefilomenae',
    fishBase: nextWaveUnified02Sources.moenkhausiaFishBase,
    husbandry: nextWaveUnified02Sources.moenkhausiaSeriouslyFish,
    temperature: { min: 22, max: 26 }, ph: { min: 6, max: 8 }, adultSizeMaxCm: 7, tankLengthCm: 90, tankLiters: 103,
    socialMode: 'group',
    socialNote: 'The species is a shoaling fish. No universal numeric minimum group size is inferred.',
  },
  {
    speciesId: 'sp_0105', scientificName: 'Polypterus ornatipinnis',
    fishBase: nextWaveUnified02Sources.polypterusFishBase,
    husbandry: nextWaveUnified02Sources.polypterusSeriouslyFish,
    temperature: { min: 25, max: 28 }, ph: { min: 6, max: 8 }, adultSizeMaxCm: 60, tankLengthCm: 180, tankLiters: 648,
    socialMode: 'variable',
    socialNote: 'Relatively peaceful with suitably large tankmates but unsafe with tankmates small enough to swallow.',
    predationTargets: ['small_fish'],
  },
  {
    speciesId: 'sp_0108', scientificName: 'Channa bleheri',
    fishBase: nextWaveUnified02Sources.channaBleheriFishBase,
    husbandry: nextWaveUnified02Sources.channaBleheriSeriouslyFish,
    temperature: { min: 14, max: 28 }, ph: { min: 6, max: 8 }, adultSizeMaxCm: 17, tankLengthCm: 120, tankLiters: 108,
    socialMode: 'pair',
    socialNote: 'Formed pairs are usually peaceful to one another but adults become hostile to other conspecifics.',
    territorialityTraits: ['adult_conspecific_aggression'],
    predationTargets: ['small_fish'],
  },
  {
    speciesId: 'sp_0109', scientificName: 'Channa aurantimaculata',
    fishBase: nextWaveUnified02Sources.channaAurantimaculataFishBase,
    husbandry: nextWaveUnified02Sources.channaAurantimaculataSeriouslyFish,
    temperature: { min: 10, max: 28 }, ph: { min: 6, max: 8 }, adultSizeMaxCm: 40, tankLengthCm: 150, tankLiters: 540,
    socialMode: 'variable',
    socialNote: 'A species-specific aquarium is recommended; sudden violence can occur even in long-maintained pairs or groups.',
    territorialityTraits: ['species_tank_required', 'intraspecific_aggression'],
    predationTargets: ['small_fish'],
  },
  {
    speciesId: 'sp_0119', scientificName: 'Pantodon buchholzi',
    fishBase: nextWaveUnified02Sources.pantodonFishBase,
    husbandry: nextWaveUnified02Sources.pantodonSeriouslyFish,
    temperature: { min: 23, max: 30 }, ph: { min: 6, max: 7.5 }, adultSizeMaxCm: 12, tankLengthCm: 90, tankLiters: 81,
    socialMode: 'variable',
    socialNote: 'Generally peaceful but may show conspecific or surface-zone aggression; roomy groups are possible without implying a fixed minimum.',
    territorialityTraits: ['surface_zone_aggression', 'conspecific_aggression'],
    predationTargets: ['small_fish'],
  },
  {
    speciesId: 'sp_0138', scientificName: 'Leporinus fasciatus',
    fishBase: nextWaveUnified02Sources.leporinusFishBase,
    husbandry: nextWaveUnified02Sources.leporinusSeriouslyFish,
    temperature: { min: 20, max: 28 }, ph: { min: 5, max: 7.5 }, adultSizeMaxCm: 27, tankLengthCm: 210, tankLiters: 756,
    socialMode: 'variable',
    socialNote: 'Either a single specimen or a large group can work in sufficiently large aquaria; small conspecific groups can be quarrelsome.',
    territorialityTraits: ['conspecific_quarrelsome'],
    predationTargets: ['small_fish'],
  },
  {
    speciesId: 'sp_0139', scientificName: 'Piaractus brachypomus',
    fishBase: nextWaveUnified02Sources.piaractusFishBase,
    husbandry: nextWaveUnified02Sources.piaractusSeriouslyFish,
    temperature: { min: 23, max: 28 }, ph: { min: 4.8, max: 7.5 }, adultSizeMaxCm: 88, tankLengthCm: 300, tankLiters: 2430,
    socialMode: 'group',
    socialNote: 'The species is peaceful and group-living. No numeric minimum group count is promoted.',
  },
  {
    speciesId: 'sp_0181', scientificName: 'Gnathonemus petersii',
    fishBase: nextWaveUnified02Sources.gnathonemusFishBase,
    husbandry: nextWaveUnified02Sources.gnathonemusSeriouslyFish,
    temperature: { min: 23, max: 28 }, ph: { min: 6, max: 7.5 }, adultSizeMaxCm: 22.5, tankLengthCm: 120, tankLiters: 243,
    socialMode: 'group',
    socialNote: 'The species is peaceful and group-living; larger quarters are needed for a substantial group.',
  },
];

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[] = [],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId, field, proposedValue, status: 'reviewed', resolution: 'supported', confidence,
  citationIds, conflictNotes, reviewedAt,
});

const unknown = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  note: string,
  citationIds: string[],
): CatalogFieldReview => ({
  speciesId, field, proposedValue: null, status: 'reviewed', resolution: 'unknown', confidence: 'unknown',
  citationIds, conflictNotes: [note], reviewedAt,
});

const directReviews = directSubjects.flatMap(subject => {
  const sourceIds = [subject.fishBase.id, subject.husbandry.id];
  return [
    supported(subject.speciesId, 'identity', {
      scientificName: subject.scientificName,
      baseSpeciesKey: subject.scientificName,
      variantKey: null,
    }, [subject.fishBase.id]),
    supported(subject.speciesId, 'water', 'freshwater', sourceIds),
    supported(subject.speciesId, 'temperature', subject.temperature, [subject.husbandry.id]),
    supported(subject.speciesId, 'ph', subject.ph, [subject.husbandry.id]),
    supported(subject.speciesId, 'adult_size', { min: null, max: subject.adultSizeMaxCm }, sourceIds),
    supported(subject.speciesId, 'tank_size', { liters: subject.tankLiters ?? null, lengthCm: subject.tankLengthCm }, [subject.husbandry.id]),
    supported(subject.speciesId, 'social_behavior', { mode: subject.socialMode, minimumGroupSize: null }, [subject.husbandry.id], [subject.socialNote], 'medium'),
    subject.territorialityTraits?.length
      ? supported(subject.speciesId, 'territoriality', { traits: subject.territorialityTraits }, [subject.husbandry.id], [], 'medium')
      : unknown(subject.speciesId, 'territoriality', 'The reviewed sources do not establish a stable territoriality rule that should affect compatibility decisions.', sourceIds),
    subject.predationTargets?.length
      ? supported(subject.speciesId, 'predation', { targets: subject.predationTargets }, [subject.husbandry.id], [], 'medium')
      : unknown(subject.speciesId, 'predation', 'The reviewed sources do not establish a compatibility-relevant fish predation target.', sourceIds),
    unknown(subject.speciesId, 'breeding_behavior', 'The reviewed sources are not used to enforce a separate breeding-context compatibility rule in this wave.', sourceIds),
  ];
});

const bridgeReviews: CatalogFieldReview[] = [
  supported('sp_0130', 'identity', { scientificName: 'Opsariichthys bidens', baseSpeciesKey: 'Opsariichthys bidens', variantKey: null }, [opsariichthysBidensFishBase.id]),
  supported('sp_0130', 'water', 'freshwater', [opsariichthysBidensFishBase.id]),
  unknown('sp_0130', 'temperature', 'Exact-taxon bridge retains the reviewed household setpoint ceiling from sp_0038.', [opsariichthysBidensFishBase.id]),
  unknown('sp_0130', 'ph', 'Exact-taxon bridge retains the reviewed household pH ceiling from sp_0038.', [opsariichthysBidensFishBase.id]),
  supported('sp_0130', 'adult_size', { min: null, max: 26.1 }, [opsariichthysBidensFishBase.id]),
  unknown('sp_0130', 'tank_size', 'Exact-taxon bridge retains the reviewed minimum-tank ceiling from sp_0038.', [opsariichthysBidensFishBase.id]),
  supported('sp_0130', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [opsariichthysBidensEnrichmentStudy.id], ['Exact scientific-name match reuses the reviewed Opsariichthys bidens social authority.'], 'medium'),
  unknown('sp_0130', 'territoriality', 'Exact-taxon bridge does not convert dominance/aggression observations into a quantified territory rule.', [opsariichthysBidensEnrichmentStudy.id]),
  supported('sp_0130', 'predation', { targets: ['small_fish'] }, [opsariichthysBidensDietStudy.id], ['Exact scientific-name match reuses the reviewed adult predation boundary.'], 'medium'),
  unknown('sp_0130', 'breeding_behavior', 'Exact-taxon bridge retains the reviewed breeding-context ceiling from sp_0038.', [opsariichthysBidensFishBase.id]),

  supported('sp_0131', 'identity', { scientificName: 'Mastacembelus armatus', baseSpeciesKey: 'Mastacembelus armatus', variantKey: null }, [mastacembelusFishBase.id]),
  supported('sp_0131', 'water', 'freshwater', [mastacembelusFishBase.id, mastacembelusSeriouslyFish.id], ['Exact scientific-name match reuses the reviewed freshwater/brackish authority; scalar Catalog water remains freshwater.'], 'medium'),
  supported('sp_0131', 'temperature', { min: 24, max: 28 }, [mastacembelusSeriouslyFish.id]),
  supported('sp_0131', 'ph', { min: 6, max: 7 }, [mastacembelusSeriouslyFish.id]),
  supported('sp_0131', 'adult_size', { min: null, max: 91 }, [mastacembelusSeriouslyFish.id]),
  supported('sp_0131', 'tank_size', { liters: 432, lengthCm: 120 }, [mastacembelusSeriouslyFish.id]),
  supported('sp_0131', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [mastacembelusSeriouslyFish.id], ['Exact scientific-name match reuses the reviewed Mastacembelus armatus social authority.'], 'medium'),
  supported('sp_0131', 'territoriality', { traits: ['intraspecific_aggression'] }, [mastacembelusSeriouslyFish.id], [], 'medium'),
  supported('sp_0131', 'predation', { targets: ['small_fish'] }, [mastacembelusSeriouslyFish.id], [], 'medium'),
  unknown('sp_0131', 'breeding_behavior', 'Exact-taxon bridge retains the reviewed breeding-context ceiling from sp_0048.', [mastacembelusSeriouslyFish.id]),
];

export const nextWaveUnified02FieldReviews: CatalogFieldReview[] = [
  ...directReviews,
  ...bridgeReviews,
];

export const nextWaveUnified02VerifiedSourceIds = new Set([
  ...Object.values(nextWaveUnified02Sources).map(source => source.id),
  opsariichthysBidensFishBase.id,
  opsariichthysBidensDietStudy.id,
  opsariichthysBidensEnrichmentStudy.id,
  mastacembelusFishBase.id,
  mastacembelusSeriouslyFish.id,
]);

export const nextWaveUnified02DirectSubjects = directSubjects;
