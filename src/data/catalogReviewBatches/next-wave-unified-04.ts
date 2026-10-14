import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-11T23:55:00+09:00';
const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  sourceType: CatalogEvidenceSource['sourceType'] = 'professional_association',
): CatalogEvidenceSource => ({ id, title, publisher, url, sourceType, reviewStatus: 'reviewed' });

export const nextWaveUnified04Sources = {
  scleropagesBaseFishBase: source('batch19-fishbase-scleropages-formosus', 'Scleropages formosus species review', 'FishBase', 'https://www.fishbase.se/summary/Scleropages-formosus'),
  scleropagesBaseSeriouslyFish: source('seriouslyfish-scleropages-formosus', 'Scleropages formosus (Asian Arowana)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/scleropages-formosus', 'curated_husbandry'),
  scleropagesGreen: source('batch19-fishbase-scleropages-formosus-green', 'Scleropages formosus Green variant review', 'FishBase', 'https://www.fishbase.se/Summary/Scleropages-formosus'),
  scleropagesRed: source('batch19-fishbase-scleropages-formosus-red', 'Scleropages formosus Red variant review', 'FishBase', 'https://www.fishbase.se/summary/6357'),

  ramBaseSeriouslyFish: source('seriouslyfish-mikrogeophagus-ramirezi', 'Mikrogeophagus ramirezi (Ram)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/mikrogeophagus-ramirezi', 'curated_husbandry'),
  ramBaseFishBase: source('fishbase-mikrogeophagus-ramirezi', 'Mikrogeophagus ramirezi species summary', 'FishBase', 'https://www.fishbase.se/summary/12305', 'curated_husbandry'),
  ramPlatinum: source('batch10-fishbase-mikrogeophagus-ramirezi-platinum', 'Mikrogeophagus ramirezi Platinum variant review', 'FishBase', 'https://www.fishbase.se/summary/mikrogeophagus-ramirezi.html'),
  ramBlue: source('batch10-fishbase-mikrogeophagus-ramirezi-blue', 'Mikrogeophagus ramirezi Blue variant review', 'FishBase', 'https://www.fishbase.se/summary/mikrogeophagus-ramirezi.html'),

  blackTetraSeriouslyFish: source('seriouslyfish-gymnocorymbus-ternetzi', 'Gymnocorymbus ternetzi (Black Widow Tetra)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi', 'curated_husbandry'),
  blackTetraFishBase: source('fishbase-gymnocorymbus-ternetzi', 'Gymnocorymbus ternetzi (Black tetra) species summary', 'FishBase', 'https://www.fishbase.se/summary/Gymnocorymbus-ternetzi', 'curated_husbandry'),
  blackTetraColor: source('batch21-fishbase-gymnocorymbus-ternetzi-color-morph', 'Gymnocorymbus ternetzi Color morph variant review', 'FishBase', 'https://www.fishbase.se/summary/Gymnocorymbus-ternetzi'),

  amphiprionFishBase: source('batch17-fishbase-amphiprion-ocellaris', 'Amphiprion ocellaris species review', 'FishBase', 'https://www.fishbase.se/summary/amphiprion-ocellaris.html'),
  pteroisFishBase: source('batch26-fishbase-pterois-volitans', 'Pterois volitans species review', 'FishBase', 'https://www.fishbase.se/summary/Pterois-volitans.html'),

  carpVar: source('batch09-fishbase-cyprinus-carpio-var', 'Cyprinus carpio var. catalog taxon review', 'FishBase', 'https://www.fishbase.se/summary/Cyprinus-carpio.html'),
  carpLongfin: source('batch09-fishbase-cyprinus-carpio-longfin', 'Cyprinus carpio var. Longfin catalog variant review', 'FishBase', 'https://www.fishbase.se/summary/Cyprinus-carpio.html'),

  trichopodusPlatinum: source('batch21-fishbase-trichopodus-trichopterus-platinum', 'Trichopodus trichopterus Platinum variant review', 'FishBase', 'https://www.fishbase.se/summary/Trichopodus-trichopterus'),
  trichopodusSeriouslyFish: source('seriouslyfish-trichopodus-trichopterus', 'Trichopodus trichopterus (Three-spot Gourami)', 'Seriously Fish', 'https://www.seriouslyfish.com/species/trichopodus-trichopterus', 'curated_husbandry'),
} satisfies Record<string, CatalogEvidenceSource>;

export const nextWaveUnified04ProfileIds = [
  'sp_0116','sp_0452','sp_0453','sp_0069','sp_0070',
  'sp_0104','sp_0146','sp_0151','sp_0156','sp_0157',
] as const;

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
  citationIds: string[],
): CatalogFieldReview => ({
  speciesId, field, proposedValue: null, status: 'reviewed', resolution: 'unknown',
  confidence: 'unknown', citationIds, conflictNotes: [note], reviewedAt,
});

const S = nextWaveUnified04Sources;
const reviews: CatalogFieldReview[] = [];

// Explicit same-taxon / ornamental-variant bridges. The variant source establishes
// identity; husbandry/behavior comes only from the already reviewed base taxon.
for (const [speciesId, scientificName, variantKey, variantSource] of [
  ['sp_0116','Scleropages formosus','green',S.scleropagesGreen],
  ['sp_0104','Scleropages formosus var. Red','red',S.scleropagesRed],
] as const) {
  const ids=[variantSource.id,S.scleropagesBaseFishBase.id,S.scleropagesBaseSeriouslyFish.id];
  reviews.push(
    supported(speciesId,'identity',{ scientificName, baseSpeciesKey:'Scleropages formosus', variantKey },[variantSource.id],['Reviewed variant identity explicitly bridges to the reviewed Scleropages formosus authority.']),
    supported(speciesId,'water','freshwater',ids),
    supported(speciesId,'temperature',{min:22,max:28},ids),
    supported(speciesId,'ph',{min:5,max:8},ids),
    supported(speciesId,'adult_size',{min:null,max:90},ids),
    supported(speciesId,'tank_size',{liters:null,lengthCm:200},ids,['The reviewed base-taxon husbandry source explicitly requires a tank at least 2 m long; the reviewed variant bridge permits reusing that same-species requirement without inventing liters.']),
    supported(speciesId,'social_behavior',{mode:'variable',minimumGroupSize:null},ids,['Reuses reviewed base-taxon social authority.']),
    unknown(speciesId,'territoriality','No separate variant territoriality rule is established.',ids),
    supported(speciesId,'predation',{targets:['small_fish']},ids,['Reuses reviewed base-taxon predation boundary.']),
    unknown(speciesId,'breeding_behavior','No variant-specific breeding rule is promoted.',ids),
  );
}

for (const [speciesId, scientificName, variantKey, variantSource] of [
  ['sp_0146','Mikrogeophagus ramirezi var. Platinum','platinum',S.ramPlatinum],
  ['sp_0157','Mikrogeophagus ramirezi var. Blue','blue',S.ramBlue],
] as const) {
  const ids=[variantSource.id,S.ramBaseSeriouslyFish.id,S.ramBaseFishBase.id];
  reviews.push(
    supported(speciesId,'identity',{scientificName,baseSpeciesKey:'Mikrogeophagus ramirezi',variantKey},[variantSource.id],['Color morph does not create a separate husbandry taxon.']),
    supported(speciesId,'water','freshwater',ids),
    supported(speciesId,'temperature',{min:27,max:30},ids),
    supported(speciesId,'ph',{min:4,max:7},ids),
    supported(speciesId,'adult_size',{min:null,max:4.2},ids),
    supported(speciesId,'tank_size',{liters:54,lengthCm:60},ids),
    supported(speciesId,'social_behavior',{mode:'pair',minimumGroupSize:null},ids),
    unknown(speciesId,'territoriality','Routine territoriality remains low; breeding defense is represented separately.',ids),
    unknown(speciesId,'predation','No fish-predation rule is supported.',ids),
    supported(speciesId,'breeding_behavior',{traits:['breeding_defense','pair_parental_care']},ids),
  );
}

{
  const ids=[S.blackTetraColor.id,S.blackTetraSeriouslyFish.id,S.blackTetraFishBase.id];
  reviews.push(
    supported('sp_0151','identity',{scientificName:'Gymnocorymbus ternetzi var. Color morph',baseSpeciesKey:'Gymnocorymbus ternetzi',variantKey:'color_morph'},[S.blackTetraColor.id],['Commercial color morph explicitly bridges to reviewed Gymnocorymbus ternetzi authority.']),
    supported('sp_0151','water','freshwater',ids),
    supported('sp_0151','temperature',{min:20,max:26},ids),
    supported('sp_0151','ph',{min:6,max:7},ids),
    supported('sp_0151','adult_size',{min:null,max:7.5},ids),
    supported('sp_0151','tank_size',{liters:68,lengthCm:75},ids),
    supported('sp_0151','social_behavior',{mode:'school',minimumGroupSize:12},ids),
    unknown('sp_0151','territoriality','No territoriality rule is established for the color morph.',ids),
    unknown('sp_0151','predation','No fish-predation rule is supported.',ids),
    unknown('sp_0151','breeding_behavior','No variant-specific breeding rule is promoted.',ids),
  );
}

reviews.push(
  supported('sp_0452','identity',{scientificName:'Amphiprion ocellaris',baseSpeciesKey:'Amphiprion ocellaris',variantKey:null},[S.amphiprionFishBase.id]),
  supported('sp_0452','water','saltwater',[S.amphiprionFishBase.id]),
  unknown('sp_0452','temperature','No aquarium temperature range is promoted from the current source.',[S.amphiprionFishBase.id]),
  unknown('sp_0452','ph','No aquarium pH range is promoted from the current source.',[S.amphiprionFishBase.id]),
  supported('sp_0452','adult_size',{min:null,max:11},[S.amphiprionFishBase.id]),
  unknown('sp_0452','tank_size','No reviewed minimum tank size is promoted in this wave.',[S.amphiprionFishBase.id]),
  supported('sp_0452','social_behavior',{mode:'pair',minimumGroupSize:null},[S.amphiprionFishBase.id],['FishBase records a distinct monogamous pair.']),
  unknown('sp_0452','territoriality','No generic territoriality severity is promoted from this source.',[S.amphiprionFishBase.id]),
  unknown('sp_0452','predation','No fish-predation rule is supported.',[S.amphiprionFishBase.id]),
  supported('sp_0452','breeding_behavior',{traits:['monogamous_pair','male_egg_guarding','anemone_association']},[S.amphiprionFishBase.id]),
);

reviews.push(
  supported('sp_0453','identity',{scientificName:'Pterois volitans',baseSpeciesKey:'Pterois volitans',variantKey:null},[S.pteroisFishBase.id]),
  supported('sp_0453','water','saltwater',[S.pteroisFishBase.id]),
  unknown('sp_0453','temperature','No aquarium temperature range is promoted from the current source.',[S.pteroisFishBase.id]),
  unknown('sp_0453','ph','No aquarium pH range is promoted from the current source.',[S.pteroisFishBase.id]),
  supported('sp_0453','adult_size',{min:null,max:45.7},[S.pteroisFishBase.id]),
  unknown('sp_0453','tank_size','No reviewed minimum tank size is promoted in this wave.',[S.pteroisFishBase.id]),
  supported('sp_0453','social_behavior',{mode:'solitary',minimumGroupSize:null},[S.pteroisFishBase.id]),
  unknown('sp_0453','territoriality','Solitary behavior is not converted into an unsupported territoriality score.',[S.pteroisFishBase.id]),
  supported('sp_0453','predation',{targets:['small_fish']},[S.pteroisFishBase.id],['FishBase explicitly records hunting small fishes; shrimp/crab predation is not mapped into the current fish target enum.']),
  unknown('sp_0453','breeding_behavior','No breeding-context rule is promoted.',[S.pteroisFishBase.id]),
);

for (const [speciesId, scientificName, variantKey, variantSource] of [
  ['sp_0069','Cyprinus carpio var.','ornamental_variety',S.carpVar],
  ['sp_0070','Cyprinus carpio var. Longfin','longfin',S.carpLongfin],
] as const) {
  reviews.push(
    supported(speciesId,'identity',{scientificName,baseSpeciesKey:'Cyprinus carpio',variantKey},[variantSource.id],['FishBase explicitly records selectively bred varieties/races of Cyprinus carpio.']),
    supported(speciesId,'water','freshwater',[variantSource.id]),
    unknown(speciesId,'temperature','No single long-term ornamental temperature range is promoted in this wave.',[variantSource.id]),
    unknown(speciesId,'ph','No single ornamental pH range is promoted in this wave.',[variantSource.id]),
    unknown(speciesId,'adult_size','No ornamental-form adult-size ceiling is promoted in this wave.',[variantSource.id]),
    supported(speciesId,'tank_size',{liters:null,lengthCm:200},[variantSource.id],['FishBase states minimum aquarium size >200 cm and that this species is not recommended for home aquariums.']),
    supported(speciesId,'social_behavior',{mode:'group',minimumGroupSize:5},[variantSource.id],['FishBase aquarium guidance states groups of 5 or more.']),
    unknown(speciesId,'territoriality','No territoriality rule is promoted.',[variantSource.id]),
    unknown(speciesId,'predation','No fish-predation rule is promoted.',[variantSource.id]),
    unknown(speciesId,'breeding_behavior','No compatibility-specific breeding rule is promoted.',[variantSource.id]),
  );
}

{
  const ids=[S.trichopodusPlatinum.id,S.trichopodusSeriouslyFish.id];
  reviews.push(
    supported('sp_0156','identity',{scientificName:'Trichopodus trichopterus var. Platinum',baseSpeciesKey:'Trichopodus trichopterus',variantKey:'platinum'},ids,['Seriously Fish explicitly notes multiple selectively bred color forms of this species.']),
    supported('sp_0156','water','freshwater',ids),
    supported('sp_0156','temperature',{min:24,max:30},ids),
    supported('sp_0156','ph',{min:5.5,max:8.5},ids),
    supported('sp_0156','adult_size',{min:null,max:15},ids),
    supported('sp_0156','tank_size',{liters:81,lengthCm:90},ids),
    supported('sp_0156','social_behavior',{mode:'variable',minimumGroupSize:null},ids,['Individuals range from peaceful to spiteful as they mature.']),
    supported('sp_0156','territoriality',{traits:['male_territoriality','breeding_aggression']},[S.trichopodusSeriouslyFish.id]),
    unknown('sp_0156','predation','Dietary invertebrate feeding is not promoted as a fish-predation rule.',ids),
    supported('sp_0156','breeding_behavior',{traits:['male_breeding_aggression']},[S.trichopodusSeriouslyFish.id]),
  );
}

export const nextWaveUnified04FieldReviews = reviews;
export const nextWaveUnified04VerifiedSourceIds = new Set(Object.values(nextWaveUnified04Sources).map(item => item.id));
