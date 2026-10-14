import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CompatibilityRequiredFact } from '../../../packages/domain-rules/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-11T23:25:00+09:00';

const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  sourceType: CatalogEvidenceSource['sourceType'] = 'curated_husbandry',
): CatalogEvidenceSource => ({
  id, title, publisher, url, sourceType, reviewStatus: 'reviewed',
});

export const nextWaveUnified03Sources = {
  scleropagesFishBase: source('batch19-fishbase-scleropages-formosus', 'Scleropages formosus species review', 'FishBase', 'https://www.fishbase.se/summary/Scleropages-formosus', 'professional_association'),
  scleropagesSeriouslyFish: source('seriouslyfish-scleropages-formosus', 'Scleropages formosus (Asian Arowana)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/scleropages-formosus'),

  osteoglossumBicirrhosumFishBase: source('batch20-fishbase-osteoglossum-bicirrhosum', 'Osteoglossum bicirrhosum species review', 'FishBase', 'https://www.fishbase.se/summary/Osteoglossum-bicirrhosum', 'professional_association'),
  osteoglossumBicirrhosumSeriouslyFish: source('seriouslyfish-osteoglossum-bicirrhosum', 'Osteoglossum bicirrhosum (Silver Arowana)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/osteoglossum-bicirrhosum'),

  osteoglossumFerreiraiFishBase: source('batch20-fishbase-osteoglossum-ferreirai', 'Osteoglossum ferreirai species review', 'FishBase', 'https://www.fishbase.se/summary/Osteoglossum-ferreirai', 'professional_association'),
  osteoglossumFerreiraiAtlas: source('aquaristatlas-osteoglossum-ferreirai', 'Black Arowana (Osteoglossum ferreirai) Care Guide', 'Aquarist Atlas', 'https://www.aquaristatlas.com/bonytongues/osteoglossum-ferreirai/'),

  peckoltiaFishBase: source('batch09-fishbase-peckoltia-compta', 'Peckoltia compta species review', 'FishBase', 'https://www.fishbase.se/summary/Peckoltia-compta', 'professional_association'),
  peckoltiaAtlas: source('aquaristatlas-peckoltia-compta', 'Leopard Frog Pleco (Peckoltia compta) Care Guide', 'Aquarist Atlas', 'https://www.aquaristatlas.com/plecos/peckoltia-compta/'),

  panaqueFishBase: source('batch09-fishbase-panaque-nigrolineatus', 'Panaque nigrolineatus species review', 'FishBase', 'https://www.fishbase.se/summary/Panaque-nigrolineatus', 'professional_association'),
  panaqueAtlas: source('aquaristatlas-panaque-nigrolineatus', 'Royal Pleco (Panaque nigrolineatus) Care Guide', 'Aquarist Atlas', 'https://www.aquaristatlas.com/plecos/panaque-nigrolineatus/'),

  pterygoplichthysFishBase: source('batch10-fishbase-pterygoplichthys-gibbiceps', 'Pterygoplichthys gibbiceps species review', 'FishBase', 'https://www.fishbase.se/summary/Pterygoplichthys-gibbiceps', 'professional_association'),
  pterygoplichthysAtlas: source('aquaristatlas-pterygoplichthys-gibbiceps', 'Sailfin Pleco (Pterygoplichthys gibbiceps) Care Guide', 'Aquarist Atlas', 'https://www.aquaristatlas.com/plecos/pterygoplichthys-gibbiceps/'),

  hypancistrusFishBase: source('batch10-fishbase-hypancistrus-inspector', 'Hypancistrus inspector species review', 'FishBase', 'https://www.fishbase.se/summary/Hypancistrus-inspector', 'professional_association'),
  hypancistrusSeriouslyFish: source('seriouslyfish-hypancistrus-inspector', 'Hypancistrus inspector (Snowball Pleco)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/hypancistrus-inspector'),

  zaccoFishBase: source('batch10-fishbase-zacco-platypus', 'Zacco platypus species review', 'FishBase', 'https://www.fishbase.se/summary/Zacco-platypus', 'professional_association'),
  zaccoSociabilityStudy: source('journal-ethology-zacco-platypus-sociability', 'Effects of habitat conditions on the boldness and sociability of wild-caught fish (Zacco platypus) along a river', 'Journal of Ethology', 'https://link.springer.com/article/10.1007/s10164-021-00715-0', 'peer_reviewed'),

  serrasalmusFishBase: source('batch20-fishbase-serrasalmus-rhombeus', 'Serrasalmus rhombeus species review', 'FishBase', 'https://www.fishbase.se/summary/Serrasalmus-rhombeus', 'professional_association'),
  serrasalmusSeriouslyFish: source('seriouslyfish-serrasalmus-rhombeus', 'Serrasalmus rhombeus (Black Piranha)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/serrasalmus-rhombeus'),

  xanthichthysFishBase: source('batch21-fishbase-xanthichthys-mento', 'Xanthichthys mento species review', 'FishBase', 'https://www.fishbase.se/summary/Xanthichthys-mento', 'professional_association'),
  xanthichthysReefs: source('reefs-xanthichthys-mento', 'Aquarium Fish: The Crosshatch Triggerfish, Xanthichthys mento', 'Reefs.com', 'https://reefs.com/magazine/aquarium-fish-the-crosshatch-triggerfish-xanthichthys-mento/'),

  centropygeFishBase: source('batch21-fishbase-centropyge-heraldi', 'Centropyge heraldi species review', 'FishBase', 'https://www.fishbase.se/summary/Centropyge-heraldi', 'professional_association'),
  centropygeReeflings: source('reeflings-centropyge-heraldi', 'Centropyge heraldi species guide', 'Reeflings', 'https://reeflings.com/species/centropyge-heraldi'),

  pomacanthusFishBase: source('batch21-fishbase-pomacanthus-annularis', 'Pomacanthus annularis species review', 'FishBase', 'https://www.fishbase.se/summary/Pomacanthus-annularis', 'professional_association'),
  pomacanthusReefapp: source('reefapp-pomacanthus-annularis', 'Pomacanthus annularis', 'Reef App', 'https://reefapp.net/en/encyclopedia/pomacanthus-annularis'),

  chrysipteraFishBase: source('batch11-fishbase-chrysiptera-cyanea', 'Chrysiptera cyanea species review', 'FishBase', 'https://www.fishbase.se/summary/Chrysiptera-cyanea', 'professional_association'),
  chrysipteraAtlarium: source('atlarium-chrysiptera-cyanea', 'Chrysiptera cyanea species guide', 'Atlarium', 'https://atlarium.bio/en/catalog/fish/chrysiptera-cyanea'),

  channaStewartiiFishBase: source('batch21-fishbase-channa-stewartii', 'Channa stewartii species review', 'FishBase', 'https://www.fishbase.se/summary/Channa-stewartii', 'professional_association'),
  channaStewartiiSeriouslyFish: source('seriouslyfish-channa-stewartii', 'Channa genus review: Channa stewartii subsection', 'Seriously Fish', 'https://www.seriouslyfish.com/genus/channa'),

  channaDiplogrammaFishBase: source('batch21-fishbase-channa-diplogramma', 'Channa diplogramma species review', 'FishBase', 'https://www.fishbase.se/summary/Channa-diplogramma', 'professional_association'),
  channaDiplogrammaSeriouslyFish: source('seriouslyfish-channa-diplogramma', 'Channa diplogramma', 'Seriously Fish', 'https://www.seriouslyfish.com/species/channa-diplogramma'),

  badisFishBase: source('batch21-fishbase-badis-badis', 'Badis badis species review', 'FishBase', 'https://www.fishbase.se/summary/Badis-badis', 'professional_association'),
  badisSeriouslyFish: source('seriouslyfish-badis-badis', 'Badis badis (Blue Perch)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/badis-badis'),

  darioFishBase: source('batch22-fishbase-dario-dario', 'Dario dario species review', 'FishBase', 'https://www.fishbase.se/summary/Dario-dario', 'professional_association'),
  darioSeriouslyFish: source('seriouslyfish-dario-dario', 'Dario dario (Scarlet Badis)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/dario-dario'),

  scobinancistrusFishBase: source('batch11-fishbase-scobinancistrus-aureatus', 'Scobinancistrus aureatus species review', 'FishBase', 'https://www.fishbase.se/summary/Scobinancistrus-aureatus', 'professional_association'),
  scobinancistrusAtlarium: source('atlarium-scobinancistrus-aureatus', 'Scobinancistrus aureatus species guide', 'Atlarium', 'https://atlarium.bio/en/catalog/fish/scobinancistrus-aureatus'),

  erythrostigmaFishBase: source('batch12-fishbase-hyphessobrycon-erythrostigma', 'Hyphessobrycon erythrostigma species review', 'FishBase', 'https://www.fishbase.se/summary/Hyphessobrycon-erythrostigma', 'professional_association'),
  erythrostigmaSeriouslyFish: source('seriouslyfish-megalamphodus-erythrostigma', 'Megalamphodus erythrostigma (Bleeding Heart Tetra)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/megalamphodus-erythrostigma'),

  gyrinocheilusFishBase: source('batch25-fishbase-gyrinocheilus-aymonieri', 'Gyrinocheilus aymonieri species review', 'FishBase', 'https://www.fishbase.se/summary/Gyrinocheilus-aymonieri', 'professional_association'),
  gyrinocheilusSeriouslyFish: source('seriouslyfish-gyrinocheilus-aymonieri', 'Gyrinocheilus aymonieri (Chinese Algae Eater)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/gyrinocheilus-aymonieri'),

  labidochromisFishBase: source('batch17-fishbase-labidochromis-caeruleus', 'Labidochromis caeruleus species review', 'FishBase', 'https://www.fishbase.se/summary/Labidochromis-caeruleus', 'professional_association'),
  labidochromisSeriouslyFish: source('seriouslyfish-labidochromis-caeruleus', 'Labidochromis caeruleus', 'Seriously Fish', 'https://www.seriouslyfish.com/species/labidochromis-caeruleus'),

  andinoacaraFishBase: source('batch17-fishbase-andinoacara-pulcher', 'Andinoacara pulcher species review', 'FishBase', 'https://www.fishbase.se/summary/Andinoacara-pulcher', 'professional_association'),
  andinoacaraSeriouslyFish: source('seriouslyfish-andinoacara-pulcher', 'Andinoacara pulcher (Blue Acara)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/andinoacara-pulcher'),
} satisfies Record<string, CatalogEvidenceSource>;

export type NextWaveUnified03Subject = {
  speciesId: string;
  scientificName: string;
  waterType: 'freshwater' | 'saltwater';
  sources: CatalogEvidenceSource[];
  temperature?: { min: number; max: number };
  ph?: { min: number; max: number };
  adultSizeMaxCm?: number;
  tankLengthCm?: number;
  tankLiters?: number;
  socialMode?: 'solitary' | 'pair' | 'group' | 'variable';
  minimumGroupSize?: number;
  socialNote?: string;
  territorialityTraits?: string[];
  predationTargets?: string[];
  behaviorTraits: string[];
  confidence: 'high' | 'medium';
};

const S = nextWaveUnified03Sources;

export const nextWaveUnified03DirectSubjects: NextWaveUnified03Subject[] = [
  { speciesId: 'sp_0103', scientificName: 'Scleropages formosus', waterType: 'freshwater', sources: [S.scleropagesFishBase, S.scleropagesSeriouslyFish], temperature: { min: 22, max: 28 }, ph: { min: 5, max: 8 }, adultSizeMaxCm: 90, tankLengthCm: 200, socialMode: 'variable', socialNote: 'Best planned alone or only with carefully selected very large tankmates; smaller fish and invertebrates are prey.', predationTargets: ['small_fish'], behaviorTraits: ['predatory', 'very_large_space_requirement', 'jumper'], confidence: 'high' },
  { speciesId: 'sp_0117', scientificName: 'Osteoglossum bicirrhosum', waterType: 'freshwater', sources: [S.osteoglossumBicirrhosumFishBase, S.osteoglossumBicirrhosumSeriouslyFish], temperature: { min: 20, max: 30 }, ph: { min: 5, max: 7.5 }, adultSizeMaxCm: 80, tankLengthCm: 200, socialMode: 'variable', socialNote: 'Can be maintained alone or with carefully chosen large tankmates; cramped conspecifics can become aggressive.', territorialityTraits: ['conspecific_aggression_if_cramped'], predationTargets: ['small_fish'], behaviorTraits: ['predatory', 'very_large_space_requirement', 'variable_social'], confidence: 'high' },
  { speciesId: 'sp_0118', scientificName: 'Osteoglossum ferreirai', waterType: 'freshwater', sources: [S.osteoglossumFerreiraiFishBase, S.osteoglossumFerreiraiAtlas], temperature: { min: 24, max: 30 }, ph: { min: 5, max: 7 }, adultSizeMaxCm: 90, socialMode: 'variable', socialNote: 'A very large surface predator; robust similarly large non-aggressive companions may work, while mouth-sized fish are unsafe.', predationTargets: ['small_fish'], behaviorTraits: ['predatory', 'very_large_space_requirement', 'surface_predator'], confidence: 'medium' },

  { speciesId: 'sp_0121', scientificName: 'Peckoltia compta', waterType: 'freshwater', sources: [S.peckoltiaFishBase, S.peckoltiaAtlas], temperature: { min: 25, max: 29 }, ph: { min: 6, max: 7.2 }, adultSizeMaxCm: 10.9, tankLiters: 100, socialMode: 'variable', socialNote: 'Generally mild toward dissimilar fish; males can defend caves against conspecifics or competing plecos.', territorialityTraits: ['cave_territoriality', 'conspecific_male_aggression'], predationTargets: [], behaviorTraits: ['bottom_dwelling', 'cave_territoriality', 'peaceful_to_dissimilar_fish'], confidence: 'medium' },
  { speciesId: 'sp_0122', scientificName: 'Panaque nigrolineatus', waterType: 'freshwater', sources: [S.panaqueFishBase, S.panaqueAtlas], temperature: { min: 22, max: 30 }, ph: { min: 6.5, max: 7.5 }, adultSizeMaxCm: 43, tankLiters: 700, socialMode: 'variable', socialNote: 'Usually peaceful to non-competing fish but can defend wood and bottom resources against conspecific or similar plecos.', territorialityTraits: ['resource_territoriality', 'similar_bottom_dweller_aggression'], predationTargets: [], behaviorTraits: ['bottom_dwelling', 'very_large_space_requirement', 'resource_territoriality'], confidence: 'medium' },
  { speciesId: 'sp_0123', scientificName: 'Pterygoplichthys gibbiceps', waterType: 'freshwater', sources: [S.pterygoplichthysFishBase, S.pterygoplichthysAtlas], temperature: { min: 23, max: 27 }, ph: { min: 6, max: 8 }, adultSizeMaxCm: 50, tankLiters: 454, socialMode: 'variable', socialNote: 'Peaceful toward many other species; disputes are concentrated around territory with other large plecos.', territorialityTraits: ['pleco_territorial_disputes'], predationTargets: [], behaviorTraits: ['bottom_dwelling', 'very_large_space_requirement', 'peaceful_to_dissimilar_fish'], confidence: 'medium' },
  { speciesId: 'sp_0125', scientificName: 'Hypancistrus inspector', waterType: 'freshwater', sources: [S.hypancistrusFishBase, S.hypancistrusSeriouslyFish], temperature: { min: 22, max: 30 }, ph: { min: 5, max: 7.5 }, adultSizeMaxCm: 16, tankLengthCm: 120, socialMode: 'variable', socialNote: 'A peaceful community option with appropriate tankmates; avoid other Hypancistrus where hybridisation is a concern.', behaviorTraits: ['bottom_dwelling', 'peaceful', 'hybridisation_risk_with_hypancistrus'], confidence: 'high' },
  { speciesId: 'sp_0129', scientificName: 'Zacco platypus', waterType: 'freshwater', sources: [S.zaccoFishBase, S.zaccoSociabilityStudy], temperature: { min: 10, max: 22 }, adultSizeMaxCm: 22.5, socialMode: 'group', socialNote: 'Peer-reviewed behavioral work describes high sociability as a group-living species; no aquarium group minimum is inferred.', predationTargets: ['small_fish'], behaviorTraits: ['group_living', 'cool_flowing_water', 'predatory'], confidence: 'high' },

  { speciesId: 'sp_0140', scientificName: 'Serrasalmus rhombeus', waterType: 'freshwater', sources: [S.serrasalmusFishBase, S.serrasalmusSeriouslyFish], temperature: { min: 22.2, max: 27.8 }, ph: { min: 4.5, max: 7.5 }, adultSizeMaxCm: 45, tankLengthCm: 210, socialMode: 'solitary', socialNote: 'Reviewed husbandry authority recommends keeping the species alone; conspecifics can fight until a single fish remains.', territorialityTraits: ['species_tank_required', 'severe_conspecific_aggression'], predationTargets: ['small_fish'], behaviorTraits: ['solitary', 'species_tank_required', 'severe_conspecific_aggression', 'predatory'], confidence: 'high' },

  { speciesId: 'sp_0183', scientificName: 'Xanthichthys mento', waterType: 'saltwater', sources: [S.xanthichthysFishBase, S.xanthichthysReefs], adultSizeMaxCm: 30, socialMode: 'variable', socialNote: 'Often relatively mellow and may be kept singly, as a pair, or in compatible groups; avoid housing two males except at exceptional scale.', predationTargets: ['small_fish'], behaviorTraits: ['relatively_mellow', 'variable_social', 'open_water'], confidence: 'medium' },
  { speciesId: 'sp_0184', scientificName: 'Centropyge heraldi', waterType: 'saltwater', sources: [S.centropygeFishBase, S.centropygeReeflings], temperature: { min: 24, max: 28 }, ph: { min: 8.1, max: 8.4 }, adultSizeMaxCm: 10, tankLiters: 200, socialMode: 'solitary', socialNote: 'Single-specimen housing is the safest baseline; territorial aggression is concentrated toward dwarf angelfish and similar fish.', territorialityTraits: ['similar_fish_territoriality', 'dwarf_angelfish_aggression'], predationTargets: [], behaviorTraits: ['semi_aggressive', 'territorial_to_similar_fish'], confidence: 'medium' },
  { speciesId: 'sp_0185', scientificName: 'Pomacanthus annularis', waterType: 'saltwater', sources: [S.pomacanthusFishBase, S.pomacanthusReefapp], adultSizeMaxCm: 45, tankLiters: 800, socialMode: 'variable', socialNote: 'Large marine angelfish with substantial aggression risk; established pairs can coexist but generic community assumptions are unsafe.', territorialityTraits: ['interspecific_aggression', 'large_angelfish_territoriality'], behaviorTraits: ['aggressive', 'very_large_space_requirement', 'not_reef_safe'], confidence: 'medium' },
  { speciesId: 'sp_0187', scientificName: 'Chrysiptera cyanea', waterType: 'saltwater', sources: [S.chrysipteraFishBase, S.chrysipteraAtlarium], socialMode: 'variable', socialNote: 'Strongly territorial for its size; robust active tankmates are safer than shy or delicate fish.', territorialityTraits: ['high_territoriality', 'aggression_to_shy_or_smaller_fish'], behaviorTraits: ['territorial', 'aggressive_for_size'], confidence: 'medium' },

  { speciesId: 'sp_0197', scientificName: 'Channa stewartii', waterType: 'freshwater', sources: [S.channaStewartiiFishBase, S.channaStewartiiSeriouslyFish], temperature: { min: 16, max: 25 }, ph: { min: 6, max: 8 }, adultSizeMaxCm: 29.7, tankLengthCm: 120, socialMode: 'variable', socialNote: 'Conspecific aggression is a material risk; no generic small-fish predation rule is inferred in this wave.', territorialityTraits: ['intraspecific_aggression'], behaviorTraits: ['intraspecific_aggression', 'snakehead'], confidence: 'medium' },
  { speciesId: 'sp_0198', scientificName: 'Channa diplogramma', waterType: 'freshwater', sources: [S.channaDiplogrammaFishBase, S.channaDiplogrammaSeriouslyFish], temperature: { min: 22, max: 32 }, ph: { min: 6, max: 8 }, adultSizeMaxCm: 48, socialMode: 'solitary', socialNote: 'A species-specific aquarium is the safe baseline; adults become aggressive after maturity and smaller fish are prey.', territorialityTraits: ['species_tank_required', 'adult_conspecific_aggression'], predationTargets: ['small_fish'], behaviorTraits: ['species_tank_required', 'predatory', 'adult_conspecific_aggression', 'very_large_space_requirement'], confidence: 'high' },
  { speciesId: 'sp_0199', scientificName: 'Badis badis', waterType: 'freshwater', sources: [S.badisFishBase, S.badisSeriouslyFish], temperature: { min: 15, max: 25 }, ph: { min: 6, max: 7.5 }, adultSizeMaxCm: 6, tankLengthCm: 80, socialMode: 'variable', socialNote: 'Slow and easily outcompeted; rival males can be aggressive and require distinct territories.', territorialityTraits: ['rival_male_aggression'], behaviorTraits: ['slow_feeder', 'rival_male_aggression', 'vulnerable_to_aggressive_tankmates'], confidence: 'high' },
  { speciesId: 'sp_0200', scientificName: 'Dario dario', waterType: 'freshwater', sources: [S.darioFishBase, S.darioSeriouslyFish], temperature: { min: 18, max: 26 }, ph: { min: 6.5, max: 8.5 }, adultSizeMaxCm: 2, tankLengthCm: 45, socialMode: 'variable', socialNote: 'Small, slow and easily intimidated; rival males are very aggressive in confined space, while larger groups need separated territories.', territorialityTraits: ['rival_male_aggression'], predationTargets: [], behaviorTraits: ['slow_feeder', 'rival_male_aggression', 'vulnerable_to_aggressive_tankmates'], confidence: 'high' },
  { speciesId: 'sp_0202', scientificName: 'Scobinancistrus aureatus', waterType: 'freshwater', sources: [S.scobinancistrusFishBase, S.scobinancistrusAtlarium], temperature: { min: 26, max: 30 }, ph: { min: 6, max: 7.5 }, adultSizeMaxCm: 30, tankLengthCm: 150, tankLiters: 500, socialMode: 'solitary', socialNote: 'Water-column fish are not the main conflict; cave and bottom territory conflicts with conspecific or similar carnivorous plecos can be severe.', territorialityTraits: ['severe_cave_territoriality', 'bottom_dweller_aggression'], behaviorTraits: ['bottom_dwelling', 'severe_cave_territoriality', 'very_large_space_requirement'], confidence: 'medium' },
  { speciesId: 'sp_0218', scientificName: 'Hyphessobrycon erythrostigma', waterType: 'freshwater', sources: [S.erythrostigmaFishBase, S.erythrostigmaSeriouslyFish], temperature: { min: 21, max: 28 }, ph: { min: 4, max: 7.5 }, adultSizeMaxCm: 6, tankLengthCm: 90, socialMode: 'group', minimumGroupSize: 8, socialNote: 'The exact-taxon husbandry source recommends a mixed-sex group of at least 8–10; the enforced minimum uses the lower reviewed bound.', territorialityTraits: ['adult_male_territoriality'], predationTargets: [], behaviorTraits: ['group_living', 'peaceful', 'adult_male_territoriality'], confidence: 'high' },
  { speciesId: 'sp_0441', scientificName: 'Gyrinocheilus aymonieri', waterType: 'freshwater', sources: [S.gyrinocheilusFishBase, S.gyrinocheilusSeriouslyFish], temperature: { min: 22, max: 26 }, ph: { min: 6, max: 8 }, adultSizeMaxCm: 28, tankLengthCm: 150, socialMode: 'variable', socialNote: 'Territoriality increases with age; similar-looking and bottom-dwelling fishes face the highest aggression and mucus-grazing risk.', territorialityTraits: ['age_increasing_territoriality', 'similar_fish_aggression', 'bottom_dweller_aggression'], predationTargets: [], behaviorTraits: ['territorial', 'age_increasing_aggression', 'mucus_grazing_risk'], confidence: 'high' },
  { speciesId: 'sp_0449', scientificName: 'Labidochromis caeruleus', waterType: 'freshwater', sources: [S.labidochromisFishBase, S.labidochromisSeriouslyFish], temperature: { min: 24, max: 28 }, ph: { min: 7.7, max: 8.6 }, adultSizeMaxCm: 10, tankLengthCm: 90, socialMode: 'variable', socialNote: 'Relatively peaceful for an mbuna, but Rift Lake hard alkaline water and hybridisation risk with other Labidochromis remain important constraints.', territorialityTraits: ['breeding_territoriality'], behaviorTraits: ['relatively_peaceful_mbuna', 'hard_alkaline_water', 'hybridisation_risk_with_labidochromis', 'breeding_territoriality'], confidence: 'high' },
  { speciesId: 'sp_0450', scientificName: 'Andinoacara pulcher', waterType: 'freshwater', sources: [S.andinoacaraFishBase, S.andinoacaraSeriouslyFish], temperature: { min: 22, max: 28 }, ph: { min: 6.5, max: 8 }, adultSizeMaxCm: 15, tankLengthCm: 120, socialMode: 'pair', socialNote: 'Pair-oriented and relatively peaceful for its size; males defend the spawning site during parental care.', territorialityTraits: ['breeding_territoriality'], predationTargets: ['small_fish'], behaviorTraits: ['pair_living', 'breeding_territoriality', 'relatively_peaceful_cichlid'], confidence: 'high' },
];

export const nextWaveUnified03ProfileIds = nextWaveUnified03DirectSubjects.map(subject => subject.speciesId);

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

export const nextWaveUnified03RequiredFacts = (subject: NextWaveUnified03Subject): CompatibilityRequiredFact[] => {
  const facts: CompatibilityRequiredFact[] = ['water'];
  if (subject.temperature) facts.push('temperature');
  if (subject.ph) facts.push('ph');
  if (subject.adultSizeMaxCm != null) facts.push('adult_size');
  if (subject.tankLengthCm != null || subject.tankLiters != null) facts.push('tank_size');
  if (subject.socialMode) facts.push('social_behavior');
  if (subject.territorialityTraits?.length) facts.push('territoriality');
  if (subject.predationTargets !== undefined) facts.push('predation');
  return facts;
};

export const nextWaveUnified03FieldReviews: CatalogFieldReview[] = nextWaveUnified03DirectSubjects.flatMap(subject => {
  const sourceIds = subject.sources.map(item => item.id);
  const primarySourceIds = [subject.sources[subject.sources.length - 1].id];
  return [
    supported(subject.speciesId, 'identity', {
      scientificName: subject.scientificName,
      baseSpeciesKey: subject.scientificName,
      variantKey: null,
    }, [subject.sources[0].id]),
    supported(subject.speciesId, 'water', subject.waterType, sourceIds),
    subject.temperature
      ? supported(subject.speciesId, 'temperature', subject.temperature, sourceIds)
      : unknown(subject.speciesId, 'temperature', 'No reviewed temperature range is promoted in this unified wave.', sourceIds),
    subject.ph
      ? supported(subject.speciesId, 'ph', subject.ph, sourceIds)
      : unknown(subject.speciesId, 'ph', 'No reviewed pH range is promoted in this unified wave.', sourceIds),
    subject.adultSizeMaxCm != null
      ? supported(subject.speciesId, 'adult_size', { min: null, max: subject.adultSizeMaxCm }, sourceIds)
      : unknown(subject.speciesId, 'adult_size', 'No reviewed aquarium-relevant adult-size ceiling is promoted in this unified wave.', sourceIds),
    subject.tankLengthCm != null || subject.tankLiters != null
      ? supported(subject.speciesId, 'tank_size', { liters: subject.tankLiters ?? null, lengthCm: subject.tankLengthCm ?? null }, primarySourceIds)
      : unknown(subject.speciesId, 'tank_size', 'No single reviewed minimum aquarium dimension is promoted in this unified wave.', sourceIds),
    subject.socialMode
      ? supported(subject.speciesId, 'social_behavior', { mode: subject.socialMode, minimumGroupSize: subject.minimumGroupSize ?? null }, primarySourceIds, [subject.socialNote ?? 'No numeric group minimum is inferred.'], subject.confidence)
      : unknown(subject.speciesId, 'social_behavior', 'No stable social-mode rule is promoted in this unified wave.', sourceIds),
    subject.territorialityTraits?.length
      ? supported(subject.speciesId, 'territoriality', { traits: subject.territorialityTraits }, primarySourceIds, [], subject.confidence)
      : unknown(subject.speciesId, 'territoriality', 'The reviewed sources do not establish a compatibility-relevant territoriality rule for this wave.', sourceIds),
    subject.predationTargets !== undefined
      ? supported(subject.speciesId, 'predation', { targets: subject.predationTargets }, primarySourceIds, subject.predationTargets.length === 0 ? ['Reviewed diet/community evidence supports no fish-predation target; aggression or grazing risks remain modeled separately.'] : [], subject.confidence)
      : unknown(subject.speciesId, 'predation', 'The reviewed sources do not establish a fish-predation target that should be enforced by Compatibility.', sourceIds),
    unknown(subject.speciesId, 'breeding_behavior', 'No separate breeding-context rule is promoted unless represented by reviewed territoriality traits.', sourceIds),
  ];
});

export const nextWaveUnified03VerifiedSourceIds = new Set(
  nextWaveUnified03DirectSubjects.flatMap(subject => subject.sources.map(item => item.id)),
);
