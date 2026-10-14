import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-11T08:35:00Z';

const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  sourceType: CatalogEvidenceSource['sourceType'] = 'curated_husbandry',
): CatalogEvidenceSource => ({ id, title, publisher, url, sourceType, reviewStatus: 'reviewed' });

export const tachysurusFishBase = source(
  'batch18-fishbase-tachysurus-fulvidraco',
  'Tachysurus fulvidraco species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Tachysurus-fulvidraco.html',
);
export const tachysurusFws = source(
  'fws-tachysurus-fulvidraco-erss',
  'Ecological Risk Screening Summary: Yellow Catfish (Tachysurus fulvidraco)',
  'U.S. Fish and Wildlife Service',
  'https://www.fws.gov/sites/default/files/documents/Ecological-Risk-Screening-Summary-Yellow-Catfish.pdf',
  'government',
);
export const mastacembelusFishBase = source(
  'batch19-fishbase-mastacembelus-armatus',
  'Mastacembelus armatus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Mastacembelus-armatus.html',
);
export const mastacembelusSeriouslyFish = source(
  'seriouslyfish-mastacembelus-armatus',
  'Mastacembelus armatus (Tyre-Track Eel)',
  'Seriously Fish',
  'https://www.seriouslyfish.com/species/mastacembelus-armatus',
);
export const channaBarcaFishBase = source(
  'batch19-fishbase-channa-barca',
  'Channa barca species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Channa-barca.html',
);
export const channaBarcaSeriouslyFish = source(
  'seriouslyfish-channa-barca',
  'Channa barca',
  'Seriously Fish',
  'https://www.seriouslyfish.com/species/channa-barca',
);
export const acrossocheilusFishBase = source(
  'batch08-fishbase-acrossocheilus-fasciatus',
  'Acrossocheilus fasciatus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Acrossocheilus-fasciatus.html',
);
export const acrossocheilusBehaviorStudy = source(
  'doi-acrossocheilus-fasciatus-behavior-2024',
  'Behavioural differences between farmed and wild Acrossocheilus fasciatus',
  'Applied Animal Behaviour Science',
  'https://doi.org/10.1016/j.applanim.2024.106460',
  'peer_reviewed',
);
export const jewelCichlidFishBase = source(
  'batch09-fishbase-hemichromis-bimaculatus',
  'Rubricatochromis bimaculatus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Rubricatochromis-bimaculatus.html',
);
export const herosFishBase = source(
  'batch09-fishbase-heros-severus',
  'Heros severus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Heros-severus.html',
);
export const herosFishipedia = source(
  'fishipedia-heros-severus',
  'Heros severus fish sheet',
  'Fishipedia',
  'https://www.fishi-pedia.com/fishes/heros-severus',
);
export const calvusFishBase = source(
  'batch09-fishbase-altolamprologus-calvus',
  'Altolamprologus calvus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Altolamprologus-calvus.html',
);
export const calvusFishipedia = source(
  'fishipedia-altolamprologus-calvus',
  'Altolamprologus calvus fish sheet',
  'Fishipedia',
  'https://www.fishipedia.fr/fr/poissons/altolamprologus-calvus',
);
export const multifasciatusFishBase = source(
  'batch09-fishbase-neolamprologus-multifasciatus',
  'Neolamprologus multifasciatus species summary',
  'FishBase',
  'https://www.fishbase.se/summary/Neolamprologus-multifasciatus.html',
);
export const multifasciatusFishipedia = source(
  'fishipedia-neolamprologus-multifasciatus',
  'Neolamprologus multifasciatus fish sheet',
  'Fishipedia',
  'https://www.fishi-pedia.com/fishes/neolamprologus-multifasciatus',
);

const sourceIdsBySpecies: Record<string, string[]> = {
  sp_0047: [tachysurusFishBase.id, tachysurusFws.id],
  sp_0048: [mastacembelusFishBase.id, mastacembelusSeriouslyFish.id],
  sp_0050: [channaBarcaFishBase.id, channaBarcaSeriouslyFish.id],
  sp_0051: [acrossocheilusFishBase.id, acrossocheilusBehaviorStudy.id],
  sp_0054: [jewelCichlidFishBase.id],
  sp_0056: [herosFishBase.id, herosFishipedia.id],
  sp_0057: [calvusFishBase.id, calvusFishipedia.id],
  sp_0058: [multifasciatusFishBase.id, multifasciatusFishipedia.id],
};

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[] = [],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId, field, proposedValue, status: 'reviewed', resolution: 'supported',
  confidence, citationIds, conflictNotes, reviewedAt,
});

const unknown = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  note: string,
  citationIds = sourceIdsBySpecies[speciesId],
): CatalogFieldReview => ({
  speciesId, field, proposedValue: null, status: 'reviewed', resolution: 'unknown',
  confidence: 'unknown', citationIds, conflictNotes: [note], reviewedAt,
});

const identity = (speciesId: string, scientificName: string, sourceId: string) => supported(
  speciesId,
  'identity',
  { scientificName, baseSpeciesKey: scientificName, variantKey: null },
  [sourceId],
);

export const nextWaveFreshwater04FieldReviews: CatalogFieldReview[] = [
  identity('sp_0047', 'Tachysurus fulvidraco', tachysurusFishBase.id),
  supported('sp_0047', 'water', 'freshwater', [tachysurusFishBase.id, tachysurusFws.id]),
  supported('sp_0047', 'temperature', { min: 16, max: 25 }, [tachysurusFishBase.id, tachysurusFws.id], [
    'USFWS explicitly reproduces 16–25°C as the assumed recommended aquarium temperature; this is used as a reviewed planning range.',
  ], 'medium'),
  unknown('sp_0047', 'ph', 'Reviewed sources do not establish a stable aquarium pH range.'),
  supported('sp_0047', 'adult_size', { min: null, max: 34.5 }, [tachysurusFishBase.id, tachysurusFws.id]),
  unknown('sp_0047', 'tank_size', 'No reviewed source in this wave establishes a defensible household minimum tank footprint or volume.'),
  unknown('sp_0047', 'social_behavior', 'Reviewed sources do not establish a stable community or conspecific social mode for household aquaria.'),
  unknown('sp_0047', 'territoriality', 'Male nest guarding is breeding-context behavior and is not promoted to permanent territoriality.'),
  unknown('sp_0047', 'predation', 'FishBase records occasional fish consumption but does not define a prey-size threshold that can be mapped safely to the coarse Small/Medium/Large catalog classes.'),
  supported('sp_0047', 'breeding_behavior', { traits: ['male_egg_larva_guarding', 'nest_defense'] }, [tachysurusFishBase.id]),

  identity('sp_0048', 'Mastacembelus armatus', mastacembelusFishBase.id),
  supported('sp_0048', 'water', 'freshwater', [mastacembelusFishBase.id, mastacembelusSeriouslyFish.id], [
    'FishBase records freshwater and brackish occurrence; the scalar Catalog value remains freshwater while Species Knowledge preserves both water types.',
  ], 'medium'),
  supported('sp_0048', 'temperature', { min: 24, max: 28 }, [mastacembelusSeriouslyFish.id]),
  supported('sp_0048', 'ph', { min: 6.0, max: 7.0 }, [mastacembelusSeriouslyFish.id]),
  supported('sp_0048', 'adult_size', { min: null, max: 91 }, [mastacembelusSeriouslyFish.id]),
  supported('sp_0048', 'tank_size', { liters: 432, lengthCm: 120 }, [mastacembelusSeriouslyFish.id]),
  supported('sp_0048', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [mastacembelusSeriouslyFish.id], [
    'Generally peaceful with other species but can be aggressive to conspecifics; no universal group minimum is promoted.',
  ], 'medium'),
  supported('sp_0048', 'territoriality', { traits: ['intraspecific_aggression'] }, [mastacembelusSeriouslyFish.id], [], 'medium'),
  supported('sp_0048', 'predation', { targets: ['small_fish'] }, [mastacembelusSeriouslyFish.id], [
    'Seriously Fish states that it eats live fish in the wild and tankmates should be too large to be considered prey; the generic target is intentionally limited to Small fish.',
  ], 'medium'),
  unknown('sp_0048', 'breeding_behavior', 'Reviewed sources in this wave do not establish a breeding-context compatibility rule.'),

  identity('sp_0050', 'Channa barca', channaBarcaFishBase.id),
  supported('sp_0050', 'water', 'freshwater', [channaBarcaFishBase.id, channaBarcaSeriouslyFish.id]),
  supported('sp_0050', 'temperature', { min: 10, max: 28 }, [channaBarcaSeriouslyFish.id]),
  supported('sp_0050', 'ph', { min: 6.0, max: 8.0 }, [channaBarcaSeriouslyFish.id]),
  supported('sp_0050', 'adult_size', { min: null, max: 105 }, [channaBarcaFishBase.id], [
    'FishBase maximum total length is retained as the biological ceiling; Seriously Fish reports approximately 900 mm standard length.',
  ]),
  supported('sp_0050', 'tank_size', { liters: null, lengthCm: 200 }, [channaBarcaSeriouslyFish.id], [
    'The current Seriously Fish profile explicitly rates Channa barca as needing a tank at least 2 m long. The aquarium-size section remains qualitative, so only the 200 cm minimum length is promoted and no volume is inferred.',
  ], 'medium'),
  supported('sp_0050', 'social_behavior', { mode: 'pair', minimumGroupSize: null }, [channaBarcaSeriouslyFish.id], [
    'The same source says species-specific aquarium and notes that even established pairs can become violent; pair is a social form, not a safety guarantee.',
  ], 'medium'),
  supported('sp_0050', 'territoriality', { traits: ['intraspecific_aggression', 'species_tank_required'] }, [channaBarcaSeriouslyFish.id]),
  supported('sp_0050', 'predation', { targets: ['small_fish'] }, [channaBarcaSeriouslyFish.id], [
    'Seriously Fish describes an obligate predator likely feeding on smaller fishes and insects in nature.',
  ]),
  unknown('sp_0050', 'breeding_behavior', 'Reproduction is reported as unrecorded; probable mouthbrooding is not promoted as a compatibility rule.'),

  identity('sp_0051', 'Acrossocheilus fasciatus', acrossocheilusFishBase.id),
  supported('sp_0051', 'water', 'freshwater', [acrossocheilusFishBase.id]),
  unknown('sp_0051', 'temperature', 'Reviewed sources establish temperate ecology and experimental thermal treatments, but not a household aquarium target range.'),
  unknown('sp_0051', 'ph', 'Reviewed sources do not establish a household aquarium pH range.'),
  supported('sp_0051', 'adult_size', { min: null, max: 19.2 }, [acrossocheilusFishBase.id]),
  unknown('sp_0051', 'tank_size', 'Reviewed sources do not establish a household minimum tank size.'),
  supported('sp_0051', 'social_behavior', { mode: 'group', minimumGroupSize: null }, [acrossocheilusBehaviorStudy.id], [
    'Peer-reviewed work documents shoal cohesion and synchronization but does not establish a minimum aquarium group count.',
  ], 'medium'),
  unknown('sp_0051', 'territoriality', 'Reviewed behavior evidence does not establish a stable aquarium territoriality rule.'),
  unknown('sp_0051', 'predation', 'Reviewed sources do not establish a compatibility-relevant fish predation target.'),
  unknown('sp_0051', 'breeding_behavior', 'Reviewed sources do not establish a breeding-context compatibility rule.'),

  identity('sp_0054', 'Rubricatochromis bimaculatus', jewelCichlidFishBase.id),
  supported('sp_0054', 'water', 'freshwater', [jewelCichlidFishBase.id], [
    'FishBase also records brackish occurrence; Species Knowledge preserves the multi-water evidence.',
  ], 'medium'),
  supported('sp_0054', 'temperature', { min: 21, max: 23 }, [jewelCichlidFishBase.id]),
  supported('sp_0054', 'ph', { min: 6.5, max: 7.5 }, [jewelCichlidFishBase.id]),
  supported('sp_0054', 'adult_size', { min: null, max: 13.6 }, [jewelCichlidFishBase.id]),
  supported('sp_0054', 'tank_size', { liters: null, lengthCm: 100 }, [jewelCichlidFishBase.id]),
  supported('sp_0054', 'social_behavior', { mode: 'pair', minimumGroupSize: null }, [jewelCichlidFishBase.id]),
  supported('sp_0054', 'territoriality', { traits: ['territorial', 'aggressive'] }, [jewelCichlidFishBase.id]),
  unknown('sp_0054', 'predation', 'Reviewed sources in this wave do not justify a generic fish-predation target.'),
  unknown('sp_0054', 'breeding_behavior', 'This wave does not promote a breeding-defense rule without a separate reviewed behavior source.'),

  identity('sp_0056', 'Heros severus', herosFishBase.id),
  supported('sp_0056', 'water', 'freshwater', [herosFishBase.id], [
    'FishBase also records brackish occurrence; Species Knowledge preserves the multi-water evidence.',
  ], 'medium'),
  supported('sp_0056', 'temperature', { min: 23, max: 29 }, [herosFishBase.id, herosFishipedia.id]),
  supported('sp_0056', 'ph', { min: 5.0, max: 6.5 }, [herosFishBase.id, herosFishipedia.id]),
  supported('sp_0056', 'adult_size', { min: null, max: 20 }, [herosFishBase.id, herosFishipedia.id]),
  supported('sp_0056', 'tank_size', { liters: 450, lengthCm: null }, [herosFishipedia.id], [], 'medium'),
  supported('sp_0056', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [herosFishipedia.id], [
    'Fishipedia describes pair/group sociality and community compatibility with peaceful tankmates; no universal minimum group count is enforced.',
  ], 'medium'),
  supported('sp_0056', 'territoriality', { traits: ['territorial', 'intraspecific_aggression'] }, [herosFishipedia.id], [], 'medium'),
  unknown('sp_0056', 'predation', 'Omnivory with carnivorous tendency is not converted into a generic small-fish predation rule.'),
  supported('sp_0056', 'breeding_behavior', { traits: ['biparental_egg_defense', 'breeding_defense'] }, [herosFishBase.id, herosFishipedia.id]),

  identity('sp_0057', 'Altolamprologus calvus', calvusFishBase.id),
  supported('sp_0057', 'water', 'freshwater', [calvusFishBase.id]),
  supported('sp_0057', 'temperature', { min: 23, max: 25 }, [calvusFishBase.id]),
  supported('sp_0057', 'ph', { min: 8.0, max: 9.0 }, [calvusFishBase.id]),
  supported('sp_0057', 'adult_size', { min: null, max: 13.5 }, [calvusFishBase.id]),
  supported('sp_0057', 'tank_size', { liters: 250, lengthCm: null }, [calvusFishipedia.id], [
    'Fishipedia explicitly gives a 250 L minimum for community aquarium maintenance; no smaller inferred footprint is added.',
  ], 'medium'),
  supported('sp_0057', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [calvusFishipedia.id], [
    'Fishipedia describes pair-or-solitary sociality and a calm baseline temperament.',
  ], 'medium'),
  supported('sp_0057', 'territoriality', { traits: ['territorial', 'intraspecific_aggression'] }, [calvusFishipedia.id], [
    'Territoriality is relatively mild overall but males defend space, particularly toward same-sex conspecifics.',
  ], 'medium'),
  supported('sp_0057', 'predation', { targets: [] }, [calvusFishipedia.id], [
    'Fishipedia describes the species as a specialist predator of small aquatic invertebrates and gives fish-community guidance; no generic fish-predation target is promoted.',
  ], 'medium'),
  supported('sp_0057', 'breeding_behavior', { traits: ['female_egg_guarding', 'breeding_defense'] }, [calvusFishBase.id]),

  identity('sp_0058', 'Neolamprologus multifasciatus', multifasciatusFishBase.id),
  supported('sp_0058', 'water', 'freshwater', [multifasciatusFishBase.id]),
  supported('sp_0058', 'temperature', { min: 24, max: 28 }, [multifasciatusFishipedia.id], [
    'FishBase gives 24–26°C ecology; Fishipedia husbandry expands the reviewed aquarium range to 24–28°C.',
  ], 'medium'),
  supported('sp_0058', 'ph', { min: 7.8, max: 9.5 }, [multifasciatusFishipedia.id], [], 'medium'),
  supported('sp_0058', 'adult_size', { min: null, max: 4.0 }, [multifasciatusFishBase.id]),
  supported('sp_0058', 'tank_size', { liters: 100, lengthCm: null }, [multifasciatusFishipedia.id], [], 'medium'),
  supported('sp_0058', 'social_behavior', { mode: 'colony', minimumGroupSize: 5 }, [multifasciatusFishBase.id, multifasciatusFishipedia.id], [
    'FishBase directly describes large aggregations with pairs in very small territories; Fishipedia recommends a minimum population of five.',
  ], 'medium'),
  supported('sp_0058', 'territoriality', { traits: ['small_territory', 'colony_territoriality'] }, [multifasciatusFishBase.id, multifasciatusFishipedia.id], [], 'medium'),
  unknown('sp_0058', 'predation', 'Reviewed sources describe plankton feeding and do not establish a fish-predation compatibility target.'),
  unknown('sp_0058', 'breeding_behavior', 'Reviewed sources in this wave do not add a separate breeding-defense rule.'),
];

export const nextWaveFreshwater04VerifiedSourceIds = new Set(
  Object.values(sourceIdsBySpecies).flat(),
);
