import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-12T01:20:00+09:00';
const source = (id: string, title: string, publisher: string, url: string, sourceType: CatalogEvidenceSource['sourceType']): CatalogEvidenceSource => ({ id, title, publisher, url, sourceType, reviewStatus: 'reviewed' });

export const nextWaveUnified05Sources = {
  salminusFishBase: source('wave05-fishbase-salminus-brasiliensis', 'Salminus brasiliensis species summary', 'FishBase', 'https://www.fishbase.se/summary/Salminus-brasiliensis', 'professional_association'),
  salminusSeriouslyFish: source('wave05-seriouslyfish-salminus-brasiliensis', 'Salminus brasiliensis (Dorado)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/salminus-brasiliensis', 'curated_husbandry'),
  tetraAlbinoWhite: source('wave05-cbd-gymnocorymbus-albino-white', 'Gymnocorymbus ternetzi organism record including albino/white variant', 'Biosafety Clearing-House / Convention on Biological Diversity', 'https://bch.cbd.int/en/database/ORGA%7D/BCH-ORGA-SCBD-281063-2', 'government'),
  pelvicachromis: source('wave05-seriouslyfish-pelvicachromis-pulcher', 'Pelvicachromis pulcher (Kribensis)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/pelvicachromis-pulcher', 'curated_husbandry'),
} satisfies Record<string, CatalogEvidenceSource>;

export const nextWaveUnified05ProfileIds = ['sp_0173', 'sp_0174', 'sp_0207', 'sp_0214'] as const;

const supported = (speciesId: string, field: CatalogFieldReview['field'], proposedValue: unknown, citationIds: string[], conflictNotes: string[] = [], confidence: CatalogFieldReview['confidence'] = 'high'): CatalogFieldReview => ({ speciesId, field, proposedValue, status: 'reviewed', resolution: 'supported', confidence, citationIds, conflictNotes, reviewedAt });
const unknown = (speciesId: string, field: CatalogFieldReview['field'], note: string, citationIds: string[]): CatalogFieldReview => ({ speciesId, field, proposedValue: null, status: 'reviewed', resolution: 'unknown', confidence: 'unknown', citationIds, conflictNotes: [note], reviewedAt });

const S = nextWaveUnified05Sources;
const reviews: CatalogFieldReview[] = [];

reviews.push(
  supported('sp_0173', 'identity', { scientificName: 'Salminus brasiliensis', baseSpeciesKey: null, variantKey: null }, [S.salminusFishBase.id], ['“Dorado/黄金河虎” is a common-name/color description for the accepted species, not evidence of a separate ornamental morph.']),
  supported('sp_0173', 'water', 'freshwater', [S.salminusFishBase.id]),
  unknown('sp_0173', 'temperature', 'No reviewed captive long-term temperature range is promoted.', [S.salminusFishBase.id, S.salminusSeriouslyFish.id]),
  unknown('sp_0173', 'ph', 'No reviewed captive long-term pH range is promoted.', [S.salminusFishBase.id, S.salminusSeriouslyFish.id]),
  supported('sp_0173', 'adult_size', { min: null, max: 100 }, [S.salminusFishBase.id]),
  unknown('sp_0173', 'tank_size', 'The species is unsuitable for ordinary home aquaria; no numeric minimum is invented.', [S.salminusSeriouslyFish.id]),
  supported('sp_0173', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [S.salminusSeriouslyFish.id]),
  unknown('sp_0173', 'territoriality', 'No reviewed territoriality score is promoted.', [S.salminusFishBase.id, S.salminusSeriouslyFish.id]),
  supported('sp_0173', 'predation', { targets: ['small_fish'] }, [S.salminusFishBase.id, S.salminusSeriouslyFish.id]),
  unknown('sp_0173', 'breeding_behavior', 'Migratory spawning biology is not converted into an aquarium Compatibility rule.', [S.salminusFishBase.id]),
);

const tetraSources = [S.tetraAlbinoWhite.id, 'seriouslyfish-gymnocorymbus-ternetzi', 'fishbase-gymnocorymbus-ternetzi'];
for (const [speciesId, scientificName, variantKey] of [
  ['sp_0174', 'Gymnocorymbus ternetzi var. Albino', 'albino'],
  ['sp_0207', 'Gymnocorymbus ternetzi var. White', 'white'],
] as const) {
  reviews.push(
    supported(speciesId, 'identity', { scientificName, baseSpeciesKey: 'Gymnocorymbus ternetzi', variantKey }, [S.tetraAlbinoWhite.id], ['The reviewed government record explicitly names the albino/white domesticated variant.']),
    supported(speciesId, 'water', 'freshwater', tetraSources),
    supported(speciesId, 'temperature', { min: 20, max: 26 }, tetraSources),
    supported(speciesId, 'ph', { min: 6, max: 7 }, tetraSources),
    supported(speciesId, 'adult_size', { min: null, max: 7.5 }, tetraSources),
    supported(speciesId, 'tank_size', { liters: 68, lengthCm: 75 }, tetraSources),
    supported(speciesId, 'social_behavior', { mode: 'school', minimumGroupSize: 12 }, tetraSources),
    unknown(speciesId, 'territoriality', 'No generic territoriality score is promoted.', tetraSources),
    unknown(speciesId, 'predation', 'No fish-predation rule is supported.', tetraSources),
    unknown(speciesId, 'breeding_behavior', 'No compatibility-specific breeding rule is promoted.', tetraSources),
  );
}

reviews.push(
  supported('sp_0214', 'identity', { scientificName: 'Pelvicachromis pulcher var. Albino', baseSpeciesKey: 'Pelvicachromis pulcher', variantKey: 'albino' }, [S.pelvicachromis.id], ['Seriously Fish explicitly records the aquarium sport albino form.']),
  supported('sp_0214', 'water', 'freshwater', [S.pelvicachromis.id]),
  supported('sp_0214', 'temperature', { min: 24, max: 27 }, [S.pelvicachromis.id]),
  supported('sp_0214', 'ph', { min: 5, max: 7.5 }, [S.pelvicachromis.id]),
  supported('sp_0214', 'adult_size', { min: null, max: 10 }, [S.pelvicachromis.id]),
  supported('sp_0214', 'tank_size', { liters: 71, lengthCm: 60 }, [S.pelvicachromis.id]),
  supported('sp_0214', 'social_behavior', { mode: 'pair', minimumGroupSize: null }, [S.pelvicachromis.id]),
  supported('sp_0214', 'territoriality', { traits: ['male_breeding_territory_defense'] }, [S.pelvicachromis.id]),
  unknown('sp_0214', 'predation', 'No fish-predation rule is supported.', [S.pelvicachromis.id]),
  supported('sp_0214', 'breeding_behavior', { traits: ['pair_parental_care', 'male_breeding_territory_defense'] }, [S.pelvicachromis.id]),
);

export const nextWaveUnified05FieldReviews = reviews;
export const nextWaveUnified05VerifiedSourceIds = new Set(Object.values(nextWaveUnified05Sources).map(item => item.id));
