import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../../packages/contracts/src';
import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';
import type { CompatibilityRequiredFact, StockingGuidance } from '../../packages/domain-rules/src';
import type { CompatibilityLifeStage, Fish } from '../types';
import { getBaseSpeciesScientificName } from '../modules/species/speciesTaxonomy';
import { lutjanusKasmiraFishBase, zebrasomaFlavescensFishBase, paracanthurusHepatusFishBase } from './catalogReviewBatches/next-wave-marine-01';
import { chindongoSocolofiFishBase, chindongoSocolofiSeriouslyFish } from './catalogReviewBatches/next-wave-freshwater-01';
import { opsariichthysBidensFishBase, opsariichthysBidensDietStudy, opsariichthysBidensEnrichmentStudy } from './catalogReviewBatches/next-wave-freshwater-02';
import { pseudorasboraParvaFishBase, pseudorasboraParvaSpawningCompetitionStudy, pseudorasboraParvaShoalingStudy } from './catalogReviewBatches/next-wave-freshwater-03';
import {
  mastacembelusFishBase, mastacembelusSeriouslyFish,
  channaBarcaFishBase, channaBarcaSeriouslyFish,
  acrossocheilusFishBase, acrossocheilusBehaviorStudy,
  jewelCichlidFishBase,
  herosFishBase, herosFishipedia,
  calvusFishBase, calvusFishipedia,
  multifasciatusFishBase, multifasciatusFishipedia,
} from './catalogReviewBatches/next-wave-freshwater-04';

import { nextWaveUnified02Sources } from './catalogReviewBatches/next-wave-unified-02';
import { nextWaveUnified03DirectSubjects, nextWaveUnified03RequiredFacts } from './catalogReviewBatches/next-wave-unified-03';
import { nextWaveUnified04Sources } from './catalogReviewBatches/next-wave-unified-04';
import { nextWaveUnified05Sources } from './catalogReviewBatches/next-wave-unified-05';
import { nextWaveUnified06Sources } from './catalogReviewBatches/next-wave-unified-06';
import { nextWaveUnified16Sources } from './catalogReviewBatches/next-wave-unified-16';
import { identityCorrectionsWave21Sources } from './catalogReviewBatches/identity-corrections-wave21';
import { identityCorrectionsWave22Sources } from './catalogReviewBatches/identity-corrections-wave22';
import { identityCorrectionsWave23Sources } from './catalogReviewBatches/identity-corrections-wave23';
import { identityCorrectionsWave24Sources } from './catalogReviewBatches/identity-corrections-wave24';
import { identityCorrectionsWave25Sources } from './catalogReviewBatches/identity-corrections-wave25';
import { identityCorrectionsWave26Sources } from './catalogReviewBatches/identity-corrections-wave26';
import { identityCorrectionsWave27Sources } from './catalogReviewBatches/identity-corrections-wave27';
import { identityCorrectionsWave28Sources } from './catalogReviewBatches/identity-corrections-wave28';
import { identityCorrectionsWave29Sources } from './catalogReviewBatches/identity-corrections-wave29';
import { identityCorrectionsPhase2_01Sources } from './catalogReviewBatches/identity-corrections-phase2-01';
import { identityCorrectionsPhase2_02Sources } from './catalogReviewBatches/identity-corrections-phase2-02';
import { identityCorrectionsPhase2_03Sources } from './catalogReviewBatches/identity-corrections-phase2-03';
import { catalogCorrectionPhase2_04Sources } from './catalogReviewBatches/catalog-correction-phase2-04';
import { behaviorEvidencePhase2_05Sources } from './catalogReviewBatches/behavior-evidence-phase2-05';
import { compatibilityAuthorityPatchSources, compatibilityProfileAuthorityPatches } from './compatibilityAuthorityPatches';
import { catalogCanonicalIdentities, type CatalogCanonicalIdentity } from './catalogCanonicalIdentity';
import { getCatalogIdentityBoundary } from './catalogIdentityBoundaries';

export type ReviewedCompatibilityProfile = {
  speciesId: string;
  waterType?: 'freshwater' | 'saltwater' | 'brackish';
  waterTypes?: Array<'freshwater' | 'saltwater' | 'brackish'>;
  behaviorTraits: string[];
  minimumGroupSize?: number;
  predationTargets: string[];
  confidence: CompatibilityEvidenceDto['confidence'];
  reviewStatus: CompatibilityEvidenceDto['reviewStatus'];
  citations: EvidenceSourceDto[];
  requiredFacts?: CompatibilityRequiredFact[];
  stockingGuidance?: StockingGuidance;
};

export type ReviewedPairRule = CompatibilityEvidenceDto & {
  speciesIds: [string, string];
  verdict: 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';
  riskType: string;
  reason: string;
  mitigation: string[];
};

export type ReviewedStageRiskProfile = CompatibilityEvidenceDto & {
  speciesId: string;
  youngerStages: CompatibilityLifeStage[];
  olderStages: CompatibilityLifeStage[];
  verdict: 'caution' | 'not_recommended';
  riskType: 'conspecific_fry_predation';
  reason: string;
  mitigation: string[];
};


const neocaridinaHusbandrySource: EvidenceSourceDto = {
  id: 'aquariumhq-neocaridina-davidi',
  title: 'Cherry shrimp (Neocaridina davidi) care and compatibility',
  publisher: 'AquariumHQ',
  url: 'https://aquariumhq.app/invertebrates/cherry-shrimp',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const neocaridinaSocialStudy: EvidenceSourceDto = {
  id: 'neocaridina-social-environment-study',
  title: 'Effect of social environment on sexual differentiation in the highly gregarious red cherry shrimp (Neocaridina davidi)',
  publisher: 'Canadian Journal of Zoology',
  url: 'https://doi.org/10.1139/cjz-2018-0284',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const caridinaHusbandrySource: EvidenceSourceDto = {
  id: 'aquendium-caridina-cantonensis',
  title: 'Crystal Red Shrimp (Caridina cantonensis) care guide',
  publisher: 'Aquendium',
  url: 'https://aquendium.com/species/crystal-red-shrimp/',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const neriteHusbandrySource: EvidenceSourceDto = {
  id: 'aquariumhq-neritina-natalensis',
  title: 'Nerite snail (Neritina natalensis) care and compatibility',
  publisher: 'AquariumHQ',
  url: 'https://aquariumhq.app/invertebrates/nerite-snail',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const rummyNoseSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-petitella-rhodostoma',
  title: 'Hemigrammus rhodostomus / Petitella rhodostoma (Rummy-nose tetra)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/hemigrammus-rhodostomus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};
const rummyNoseFishBase: EvidenceSourceDto = {
  id: 'fishbase-petitella-rhodostoma',
  title: 'Petitella rhodostoma species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Hemigrammus-rhodostomus.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};
const otocinclusFishBase: EvidenceSourceDto = {
  id: 'fishbase-otocinclus-vittatus',
  title: 'Otocinclus vittatus species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Otocinclus-vittatus.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};
const otocinclusAquariumCoop: EvidenceSourceDto = {
  id: 'aquariumcoop-otocinclus-catfish',
  title: 'Care Guide for Otocinclus Catfish',
  publisher: 'Aquarium Co-Op',
  url: 'https://www.aquariumcoop.com/blogs/aquarium/otocinclus-catfish',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};
const otocinclusScotCat: EvidenceSourceDto = {
  id: 'scotcat-otocinclus-vittatus',
  title: 'Otocinclus vittatus Regan, 1904',
  publisher: 'ScotCat',
  url: 'https://www.scotcat.com/loricariidae/otocinclus_vittatus.htm',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const kissingGouramiFishBase: EvidenceSourceDto = {
  id: 'fishbase-helostoma-temminkii',
  title: 'Helostoma temminkii (Kissing gourami) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Helostoma-temminckii',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const kissingGouramiSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-helostoma-temminkii',
  title: 'Helostoma temminkii (Kissing Gourami)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/helostoma-temminkii',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const tigerBarbStudy: EvidenceSourceDto = {
  id: 'tiger-barb-group-size-study',
  title: 'The effect of group size on the behaviour and welfare of four fish species commonly kept in home aquaria',
  publisher: 'Applied Animal Behaviour Science',
  url: 'https://www.sciencedirect.com/science/article/pii/S0168159110001292',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const convictCichlidTerritoryStudy: EvidenceSourceDto = {
  id: 'convict-cichlid-territory-study',
  title: 'Sex Differences in How Territory Quality Affects Aggression in Convict Cichlids',
  publisher: 'Integrative and Comparative Biology',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8522484/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const smallSnakeheadAssessment: EvidenceSourceDto = {
  id: 'small-snakehead-fws-assessment',
  title: 'Ecological Risk Screening Summary: Small Snakehead (Channa asiatica)',
  publisher: 'U.S. Fish and Wildlife Service',
  url: 'https://www.fws.gov/sites/default/files/documents/Ecological-Risk-Screening-Summary-Small-Snakehead.pdf',
  sourceType: 'government',
  reviewStatus: 'reviewed',
};

const northernSnakeheadFwsAssessment: EvidenceSourceDto = {
  id: 'northern-snakehead-fws-erss-2024',
  title: 'Ecological Risk Screening Summary - Northern Snakehead (Channa argus) - High Risk',
  publisher: 'U.S. Fish and Wildlife Service',
  url: 'https://www.fws.gov/media/ecological-risk-screening-summary-northern-snakehead-channa-argus-high-risk',
  sourceType: 'government',
  reviewStatus: 'reviewed',
};

const northernSnakeheadDietStudy: EvidenceSourceDto = {
  id: 'northern-snakehead-usgs-diet-2012',
  title: 'Diet of non-native northern snakehead (Channa argus) compared to three co-occurring predators in the lower Potomac River, USA',
  publisher: 'U.S. Geological Survey / Ecology of Freshwater Fish',
  url: 'https://pubs.usgs.gov/publication/70168483',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const discusSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-symphysodon-aequifasciatus',
  title: 'Symphysodon aequifasciatus (Discus)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/symphysodon-aequifasciatus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const discusFishBase: EvidenceSourceDto = {
  id: 'fishbase-symphysodon-aequifasciatus',
  title: 'Symphysodon aequifasciatus species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/11185',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const ramireziSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-mikrogeophagus-ramirezi',
  title: 'Mikrogeophagus ramirezi (Ram)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/mikrogeophagus-ramirezi',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const ramireziFishBase: EvidenceSourceDto = {
  id: 'fishbase-mikrogeophagus-ramirezi',
  title: 'Mikrogeophagus ramirezi species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/12305',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const agassiziiSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-apistogramma-agassizii',
  title: "Apistogramma agassizii (Agassizi's Dwarf Cichlid)",
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/apistogramma-agassizii/',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const agassiziiFishBase: EvidenceSourceDto = {
  id: 'fishbase-apistogramma-agassizii',
  title: "Apistogramma agassizii (Agassiz's dwarf cichlid) species summary",
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/Fieldguide/FieldGuideSummary.php?c_code=076&genusname=Apistogramma&speciesname=agassizii',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const pearlGouramiSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-trichopodus-leerii',
  title: 'Trichopodus leerii (Pearl Gourami)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/trichopodus-leerii',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const pearlGouramiFishBase: EvidenceSourceDto = {
  id: 'fishbase-trichopodus-leerii',
  title: 'Trichopodus leerii (Pearl gourami) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Trichopodus-leerii.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const congoTetraSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-phenacogrammus-interruptus',
  title: 'Phenacogrammus interruptus (Congo Tetra)',
  publisher: 'Seriously Fish',
  url: 'https://seriouslyfish.com/species/phenacogrammus-interruptus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const congoTetraFishBase: EvidenceSourceDto = {
  id: 'fishbase-phenacogrammus-interruptus',
  title: 'Phenacogrammus interruptus (Congo tetra) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Phenacogrammus-interruptus.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const blackSkirtSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-gymnocorymbus-ternetzi',
  title: 'Gymnocorymbus ternetzi (Black Widow Tetra)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const blackSkirtFishBase: EvidenceSourceDto = {
  id: 'fishbase-gymnocorymbus-ternetzi',
  title: 'Gymnocorymbus ternetzi (Black tetra) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Gymnocorymbus-ternetzi',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const cherryBarbSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-puntius-titteya',
  title: 'Puntius titteya (Cherry Barb)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/puntius-titteya',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const cherryBarbFishBase: EvidenceSourceDto = {
  id: 'fishbase-puntius-titteya',
  title: 'Puntius titteya (Cherry barb) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Puntius_titteya.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const denisonBarbSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-sahyadria-denisonii',
  title: 'Sahyadria denisonii (Red-line Torpedo Barb)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/sahyadria-denisonii',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const denisonBarbFishBase: EvidenceSourceDto = {
  id: 'fishbase-sahyadria-denisonii',
  title: 'Dawkinsia denisonii (Denison barb) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Sahyadria-denisonii.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const emberTetraSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-hyphessobrycon-amandae',
  title: 'Hyphessobrycon amandae (Ember Tetra)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/hyphessobrycon-amandae',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const emberTetraFishBase: EvidenceSourceDto = {
  id: 'fishbase-hyphessobrycon-amandae',
  title: 'Hyphessobrycon amandae (Ember tetra) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Hyphessobrycon-amandae.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const harlequinSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-trigonostigma-heteromorpha',
  title: 'Trigonostigma heteromorpha (Harlequin)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/trigonostigma-heteromorpha',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const harlequinFishBase: EvidenceSourceDto = {
  id: 'fishbase-trigonostigma-heteromorpha',
  title: 'Trigonostigma heteromorpha (Harlequin rasbora) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Trigonostigma_heteromorpha.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const platySeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-xiphophorus-maculatus',
  title: 'Xiphophorus maculatus (Platy)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/xiphophorus-maculatus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const platyFishBase: EvidenceSourceDto = {
  id: 'fishbase-xiphophorus-maculatus',
  title: 'Xiphophorus maculatus (Southern platyfish) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Xiphophorus_maculatus.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const mollySeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-poecilia-sphenops',
  title: 'Poecilia sphenops (Short-finned Molly/Black Molly)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/poecilia-sphenops',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const swordtailSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-xiphophorus-hellerii',
  title: 'Xiphophorus hellerii (Green Swordtail)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/xiphophorus-hellerii',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const swordtailFishBase: EvidenceSourceDto = {
  id: 'fishbase-xiphophorus-hellerii',
  title: 'Xiphophorus hellerii (Green swordtail) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.org/Summary/Xiphophorus-hellerii',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const neonTetraFishBase: EvidenceSourceDto = {
  id: 'fishbase-paracheirodon-innesi',
  title: 'Paracheirodon innesi (Neon tetra) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.org/summary/Paracheirodon-innesi.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const cardinalTetraFishBase: EvidenceSourceDto = {
  id: 'fishbase-paracheirodon-axelrodi',
  title: 'Paracheirodon axelrodi (Cardinal tetra) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.org/summary/Paracheirodon-axelrodi.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const whiteCloudFishBase: EvidenceSourceDto = {
  id: 'fishbase-tanichthys-albonubes',
  title: 'Tanichthys albonubes (White cloud mountain minnow) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Tanichthys-albonubes.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const whiteCloudShoalingStudy: EvidenceSourceDto = {
  id: 'white-cloud-shoaling-study',
  title: 'Shoaling in White Cloud Mountain minnows, Tanichthys albonubes: effects of predation risk and prey hunger',
  publisher: 'Animal Behaviour',
  url: 'https://www.sciencedirect.com/science/article/pii/S0003347284712917',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};


const zebrafishSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-danio-rerio',
  title: "Brachydanio rerio (Zebra 'Danio')",
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/danio-rerio',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const guppyFishBase: EvidenceSourceDto = {
  id: 'fishbase-poecilia-reticulata',
  title: 'Poecilia reticulata (Guppy) species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Poecilia-reticulata.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const guppySeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-poecilia-reticulata',
  title: 'Poecilia reticulata (Guppy)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/poecilia-reticulata/',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const redRainbowfishSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-glossolepis-incisus',
  title: 'Glossolepis incisus (Red Rainbowfish)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/glossolepis-incisus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const redRainbowfishFishBase: EvidenceSourceDto = {
  id: 'fishbase-glossolepis-incisa',
  title: 'Glossolepis incisa species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/10477',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const clownLoachSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-chromobotia-macracanthus',
  title: 'Chromobotia macracanthus (Clown Loach)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/chromobotia-macracanthus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const clownLoachFishBase: EvidenceSourceDto = {
  id: 'fishbase-chromobotia-macracanthus',
  title: 'Chromobotia macracanthus species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/10897',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const hillstreamLoachSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-sewellia-lineolata',
  title: 'Sewellia lineolata (Tiger Hillstream Loach)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/sewellia-lineolata',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const pygmyCorySeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-corydoras-pygmaeus',
  title: 'Corydoras pygmaeus (Pygmy Cory)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/corydoras-pygmaeus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const pygmyCoryFishBase: EvidenceSourceDto = {
  id: 'fishbase-corydoras-pygmaeus',
  title: 'Gastrodermus pygmaeus species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/corydoras-pygmaeus.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const bronzeCorySeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-corydoras-aeneus',
  title: 'Corydoras aeneus (Bronze Cory)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/corydoras-aeneus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const pandaCoryFishBase: EvidenceSourceDto = {
  id: 'batch-02-fishbase-corydoras-panda',
  title: 'Corydoras panda species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Corydoras-panda.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const pandaCorySeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-corydoras-panda',
  title: 'Corydoras panda (Panda Cory)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/corydoras-panda',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const tigerBarbSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-puntigrus-tetrazona',
  title: 'Puntigrus tetrazona (Tiger Barb)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/puntigrus-tetrazona',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const bettaSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-betta-splendens',
  title: 'Betta splendens (Siamese Fighting Fish)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/betta-splendens',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const angelfishFishBase: EvidenceSourceDto = {
  id: 'batch-02-fishbase-pterophyllum-scalare',
  title: 'Pterophyllum scalare species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Pterophyllum-scalare.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const angelfishSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-pterophyllum-scalare',
  title: 'Pterophyllum scalare (Angelfish)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/pterophyllum-scalare',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const angelfishExtensionGuide: EvidenceSourceDto = {
  id: 'tamu-pterophyllum-scalare-reproduction',
  title: 'Reproduction of Angelfish (Pterophyllum scalare)',
  publisher: 'Texas A&M AgriLife Extension',
  url: 'https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/Reproduction-of-Angelfish-Pterphyllum-scalare.pdf',
  sourceType: 'government',
  reviewStatus: 'reviewed',
};

const guppyShoalingStudy: EvidenceSourceDto = {
  id: 'guppy-schooling-learning-study',
  title: 'Schooling and learning: early social environment predicts social learning ability in the guppy, Poecilia reticulata',
  publisher: 'Animal Behaviour',
  url: 'https://www.sciencedirect.com/science/article/abs/pii/S0003347208002364',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const guppyCannibalismRefugeStudy: EvidenceSourceDto = {
  id: 'guppy-cannibalism-refuge-study',
  title: 'Guppy populations differ in cannibalistic degree and adaptation to structural environments',
  publisher: 'Oecologia',
  url: 'https://pubmed.ncbi.nlm.nih.gov/21516310/',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const guppyFryYieldStudy: EvidenceSourceDto = {
  id: 'guppy-fry-yield-cannibalism-study',
  title: 'The effects of illumination and daily number of collections on fry yields in guppy breeding tanks',
  publisher: 'Aquacultural Engineering',
  url: 'https://www.sciencedirect.com/science/article/abs/pii/S0144860913000848',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const oscarZebrafishLivePredatorStudy: EvidenceSourceDto = {
  id: 'oscar-zebrafish-live-predator-study',
  title: 'Live Predators, Robots, and Computer-Animated Images Elicit Differential Avoidance Responses in Zebrafish',
  publisher: 'Zebrafish',
  url: 'https://journals.sagepub.com/doi/10.1089/zeb.2014.1041',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const oscarZebrafishDevelopmentStudy: EvidenceSourceDto = {
  id: 'oscar-zebrafish-development-predator-study',
  title: 'Modulation of Cortisol Responses to an Acute Stressor in Zebrafish Visually Exposed to Heterospecific Fish During Development',
  publisher: 'Zebrafish',
  url: 'https://journals.sagepub.com/doi/10.1089/zeb.2017.1509',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const oscarFishBaseEcology: EvidenceSourceDto = {
  id: 'fishbase-astronotus-ocellatus-ecology',
  title: 'Astronotus ocellatus ecology summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/Ecology/Astronotus_ocellatus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const oscarSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-astronotus-ocellatus',
  title: 'Astronotus ocellatus (Oscar)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/astronotus-ocellatus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const rhodeusFishBase: EvidenceSourceDto = {
  id: 'batch03-fishbase-rhodeus-ocellatus',
  title: 'Rhodeus ocellatus species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Rhodeus-ocellatus.html',
  sourceType: 'professional_association',
  reviewStatus: 'reviewed',
};

const rhodeusSchoolingStudy: EvidenceSourceDto = {
  id: 'jstage-rhodeus-ocellatus-schooling',
  title: 'Characteristics of Schooling Behavior by the Group Size of Rose Bitterling in the Experimental Water Tank',
  publisher: 'Nippon Suisan Gakkaishi / J-STAGE',
  url: 'https://doi.org/10.2331/suisan.51.1977',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const channaRhodeusInformationDynamicsStudy: EvidenceSourceDto = {
  id: 'channa-rhodeus-information-dynamics-study',
  title: 'Information Dynamics in the Interaction between a Prey and a Predator Fish',
  publisher: 'Entropy',
  url: 'https://doi.org/10.3390/e17107230',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const channaRhodeusPredationStressStudy: EvidenceSourceDto = {
  id: 'channa-rhodeus-predation-stress-study',
  title: 'Effects of predation stress and sex on growth, metabolism, personality traits, and reproductive investment in the rosy bitterling (Rhodeus ocellatus)',
  publisher: 'Comparative Biochemistry and Physiology Part A: Molecular & Integrative Physiology',
  url: 'https://doi.org/10.1016/j.cbpa.2026.111986',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const makeEmberTetraProfile = (speciesId: string): ReviewedCompatibilityProfile => ({
  speciesId,
  waterType: 'freshwater',
  behaviorTraits: ['shoaling', 'peaceful'],
  minimumGroupSize: 8,
  predationTargets: [],
  confidence: 'high',
  reviewStatus: 'reviewed',
  citations: [emberTetraSeriouslyFish, emberTetraFishBase],
  requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
});


const altumAngelfishFishBase: EvidenceSourceDto = {
  id: 'fishbase-pterophyllum-altum',
  title: 'Pterophyllum altum species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/pterophyllum-altum.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const altumAngelfishSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-pterophyllum-altum',
  title: 'Pterophyllum altum (Altum Angel)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/pterophyllum-altum',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const commonPlecoFishBase: EvidenceSourceDto = {
  id: 'fishbase-hypostomus-plecostomus',
  title: 'Hypostomus plecostomus species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.org/summary/3057',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const blackParadiseFishBase: EvidenceSourceDto = {
  id: 'fishbase-macropodus-spechti',
  title: 'Macropodus spechti species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.org/summary/Macropodus-spechti.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const blackParadiseSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-macropodus-spechti',
  title: 'Macropodus spechti (Black Paradise Fish)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/macropodus-spechti',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const roundtailParadiseFishBase: EvidenceSourceDto = {
  id: 'fishbase-macropodus-ocellatus',
  title: 'Macropodus ocellatus species summary',
  publisher: 'FishBase',
  url: 'https://www.fishbase.se/summary/Macropodus-ocellatus.html',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const roundtailParadiseSeriouslyFish: EvidenceSourceDto = {
  id: 'seriouslyfish-macropodus-ocellatus',
  title: 'Macropodus ocellatus (Roundtail Paradise Fish)',
  publisher: 'Seriously Fish',
  url: 'https://www.seriouslyfish.com/species/macropodus-ocellatus',
  sourceType: 'curated_husbandry',
  reviewStatus: 'reviewed',
};

const nextWaveUnified03Profiles = Object.fromEntries(
  nextWaveUnified03DirectSubjects.map(subject => [subject.speciesId, {
    speciesId: subject.speciesId,
    waterType: subject.waterType,
    behaviorTraits: subject.behaviorTraits,
    predationTargets: subject.predationTargets ?? [],
    confidence: subject.confidence,
    reviewStatus: 'reviewed',
    citations: subject.sources,
    requiredFacts: nextWaveUnified03RequiredFacts(subject),
  } satisfies ReviewedCompatibilityProfile]),
) as Record<string, ReviewedCompatibilityProfile>;

const profiles: Record<string, ReviewedCompatibilityProfile> = {
  ...nextWaveUnified03Profiles,
  sp_0112: {
    speciesId: 'sp_0112',
    waterType: 'freshwater',
    behaviorTraits: ['schooling', 'peaceful', 'non_territorial', 'upper_water'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [behaviorEvidencePhase2_05Sources.poropanchaxNormaniAquaristAtlas],
    requiredFacts: [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS],
  },
  sp_0115: {
    speciesId: 'sp_0115',
    waterType: 'freshwater',
    behaviorTraits: ['schooling', 'very_peaceful', 'non_territorial', 'community_fish'],
    minimumGroupSize: 8,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [behaviorEvidencePhase2_05Sources.hyphessobryconAmapaensisSeriouslyFish],
    requiredFacts: [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS],
  },
  sp_0120: {
    speciesId: 'sp_0120',
    waterType: 'freshwater',
    behaviorTraits: ['solitary', 'conspecific_territoriality', 'predatory', 'weakly_electric'],
    minimumGroupSize: 1,
    predationTargets: ['small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [
      catalogCorrectionPhase2_04Sources.fishBaseGymnotusCarapo,
      catalogCorrectionPhase2_04Sources.seriouslyFishGymnotusCarapo,
      catalogCorrectionPhase2_04Sources.taiwanFishDbGymnotusCarapo,
    ],
    requiredFacts: [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS],
  },
  sp_0019: {
    speciesId: 'sp_0019',
    waterType: 'freshwater',
    behaviorTraits: ['small_fish_predation'],
    predationTargets: ['very_small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [altumAngelfishFishBase, altumAngelfishSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'predation'],
  },
  sp_0026: {
    speciesId: 'sp_0026',
    waterType: 'freshwater',
    waterTypes: ['freshwater', 'brackish'],
    behaviorTraits: ['bottom_dwelling'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [commonPlecoFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size'],
  },
  sp_0042: {
    speciesId: 'sp_0042',
    waterType: 'freshwater',
    waterTypes: ['freshwater', 'brackish'],
    behaviorTraits: ['shoaling', 'breeding_defense'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [pseudorasboraParvaFishBase, pseudorasboraParvaSpawningCompetitionStudy, pseudorasboraParvaShoalingStudy],
    requiredFacts: ['water', 'adult_size', 'social_behavior', 'breeding_behavior'],
  },
  sp_0043: {
    speciesId: 'sp_0043',
    waterType: 'freshwater',
    behaviorTraits: ['breeding_defense', 'territorial'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [roundtailParadiseFishBase, roundtailParadiseSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'territoriality', 'breeding_behavior'],
  },

  sp_0044: {
    speciesId: 'sp_0044',
    waterType: 'freshwater',
    behaviorTraits: ['breeding_defense'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [blackParadiseFishBase, blackParadiseSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior'],
  },

  sp_0133: {
    speciesId: 'sp_0133',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'peaceful'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [redRainbowfishSeriouslyFish, redRainbowfishFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0126: {
    speciesId: 'sp_0126',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'bottom_dwelling', 'fin_nipping'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [clownLoachSeriouslyFish, clownLoachFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0447: {
    speciesId: 'sp_0447',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'breeding_defense'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [discusSeriouslyFish, discusFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior'],
  },
  sp_0448: {
    speciesId: 'sp_0448',
    waterType: 'freshwater',
    behaviorTraits: ['peaceful', 'breeding_defense'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [ramireziSeriouslyFish, ramireziFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior'],
  },
  sp_0016: {
    speciesId: 'sp_0016',
    waterType: 'freshwater',
    behaviorTraits: ['peaceful', 'breeding_defense'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [ramireziSeriouslyFish, ramireziFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior'],
  },
  sp_0017: {
    speciesId: 'sp_0017',
    waterType: 'freshwater',
    behaviorTraits: ['breeding_defense'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [agassiziiSeriouslyFish, agassiziiFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior'],
  },
  sp_0444: {
    speciesId: 'sp_0444',
    waterType: 'freshwater',
    behaviorTraits: ['peaceful', 'breeding_defense'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [pearlGouramiSeriouslyFish, pearlGouramiFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior'],
  },
  sp_0020: {
    speciesId: 'sp_0020',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'peaceful'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [congoTetraSeriouslyFish, congoTetraFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0440: {
    speciesId: 'sp_0440',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'peaceful'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [denisonBarbSeriouslyFish, denisonBarbFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0114: makeEmberTetraProfile('sp_0114'),
  sp_0469: makeEmberTetraProfile('sp_0469'),
  sp_0012: {
    speciesId: 'sp_0012',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'peaceful'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [cherryBarbSeriouslyFish, cherryBarbFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },

  sp_0010: {
    speciesId: 'sp_0010',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'peaceful', 'fin_nipping'],
    minimumGroupSize: 12,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [blackSkirtSeriouslyFish, blackSkirtFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0433: {
    speciesId: 'sp_0433',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'peaceful'],
    minimumGroupSize: 10,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [rummyNoseSeriouslyFish, rummyNoseFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0013: {
    speciesId: 'sp_0013',
    waterType: 'freshwater',
    behaviorTraits: ['peaceful', 'bottom_dwelling'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [otocinclusFishBase, otocinclusAquariumCoop, otocinclusScotCat],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0468: {
    speciesId: 'sp_0468',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'peaceful'],
    minimumGroupSize: 8,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [harlequinSeriouslyFish, harlequinFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0011: {
    speciesId: 'sp_0011',
    waterType: 'freshwater',
    behaviorTraits: ['peaceful'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [platySeriouslyFish, platyFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0437: {
    speciesId: 'sp_0437',
    waterType: 'freshwater',
    behaviorTraits: ['peaceful'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [mollySeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior'],
  },
  sp_0438: {
    speciesId: 'sp_0438',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'male_dominance'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [swordtailSeriouslyFish, swordtailFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'breeding_behavior'],
  },
  sp_0045: {
    speciesId: 'sp_0045',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'bottom_dwelling'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [hillstreamLoachSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'territoriality'],
  },
  sp_0048: {
    speciesId: 'sp_0048',
    waterType: 'freshwater',
    waterTypes: ['freshwater', 'brackish'],
    behaviorTraits: ['predatory', 'intraspecific_aggression', 'bottom_dwelling'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [mastacembelusFishBase, mastacembelusSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'predation'],
  },
  sp_0050: {
    speciesId: 'sp_0050',
    waterType: 'freshwater',
    behaviorTraits: ['predatory', 'species_tank_required', 'intraspecific_aggression'],
    predationTargets: ['small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [channaBarcaFishBase, channaBarcaSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'territoriality', 'predation'],
  },
  sp_0051: {
    speciesId: 'sp_0051',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [acrossocheilusFishBase, acrossocheilusBehaviorStudy],
    requiredFacts: ['water', 'adult_size', 'social_behavior'],
  },
  sp_0054: {
    speciesId: 'sp_0054',
    waterType: 'freshwater',
    waterTypes: ['freshwater', 'brackish'],
    behaviorTraits: ['territorial', 'interspecific_aggression'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [jewelCichlidFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality'],
  },
  sp_0056: {
    speciesId: 'sp_0056',
    waterType: 'freshwater',
    waterTypes: ['freshwater', 'brackish'],
    behaviorTraits: ['territorial', 'breeding_defense', 'intraspecific_aggression'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [herosFishBase, herosFishipedia],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation', 'breeding_behavior'],
  },
  sp_0057: {
    speciesId: 'sp_0057',
    waterType: 'freshwater',
    behaviorTraits: ['territorial', 'breeding_defense', 'intraspecific_aggression'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [calvusFishBase, calvusFishipedia],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior', 'territoriality', 'breeding_behavior'],
  },
  sp_0058: {
    speciesId: 'sp_0058',
    waterType: 'freshwater',
    behaviorTraits: ['territorial', 'group_living'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [multifasciatusFishBase, multifasciatusFishipedia],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality'],
  },
  sp_0053: {
    speciesId: 'sp_0053',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'peaceful'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [pygmyCorySeriouslyFish, pygmyCoryFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  sp_0059: {
    speciesId: 'sp_0059',
    waterType: 'freshwater',
    behaviorTraits: ['pair_living', 'territorial_males', 'breeding_aggression'],
    predationTargets: ['small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [nextWaveUnified02Sources.macropodusFishBase, nextWaveUnified02Sources.macropodusSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
  sp_0062: {
    speciesId: 'sp_0062',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'peaceful'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [nextWaveUnified02Sources.moenkhausiaFishBase, nextWaveUnified02Sources.moenkhausiaSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior'],
  },
  sp_0105: {
    speciesId: 'sp_0105',
    waterType: 'freshwater',
    behaviorTraits: ['predatory', 'large_fish_community'],
    predationTargets: ['small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [nextWaveUnified02Sources.polypterusFishBase, nextWaveUnified02Sources.polypterusSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'predation'],
  },
  sp_0108: {
    speciesId: 'sp_0108',
    waterType: 'freshwater',
    behaviorTraits: ['pair_living', 'adult_conspecific_aggression', 'predatory'],
    predationTargets: ['small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [nextWaveUnified02Sources.channaBleheriFishBase, nextWaveUnified02Sources.channaBleheriSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
  sp_0109: {
    speciesId: 'sp_0109',
    waterType: 'freshwater',
    behaviorTraits: ['predatory', 'species_tank_required', 'intraspecific_aggression'],
    predationTargets: ['small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [nextWaveUnified02Sources.channaAurantimaculataFishBase, nextWaveUnified02Sources.channaAurantimaculataSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
  sp_0119: {
    speciesId: 'sp_0119',
    waterType: 'freshwater',
    behaviorTraits: ['surface_dwelling', 'conspecific_aggression', 'surface_zone_aggression', 'predatory'],
    predationTargets: ['small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [nextWaveUnified02Sources.pantodonFishBase, nextWaveUnified02Sources.pantodonSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
  sp_0130: {
    speciesId: 'sp_0130',
    waterType: 'freshwater',
    behaviorTraits: ['predatory', 'interspecific_aggression', 'dominance_hierarchy'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [opsariichthysBidensFishBase, opsariichthysBidensDietStudy, opsariichthysBidensEnrichmentStudy],
    requiredFacts: ['water', 'adult_size', 'social_behavior', 'predation'],
  },
  sp_0131: {
    speciesId: 'sp_0131',
    waterType: 'freshwater',
    waterTypes: ['freshwater', 'brackish'],
    behaviorTraits: ['predatory', 'intraspecific_aggression', 'bottom_dwelling'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [mastacembelusFishBase, mastacembelusSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'predation'],
  },
  sp_0138: {
    speciesId: 'sp_0138',
    waterType: 'freshwater',
    behaviorTraits: ['conditional_group_living', 'conspecific_quarrelsome', 'predatory'],
    predationTargets: ['small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [nextWaveUnified02Sources.leporinusFishBase, nextWaveUnified02Sources.leporinusSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
  sp_0139: {
    speciesId: 'sp_0139',
    waterType: 'freshwater',
    behaviorTraits: ['group_living', 'peaceful', 'very_large_space_requirement'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [nextWaveUnified02Sources.piaractusFishBase, nextWaveUnified02Sources.piaractusSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior'],
  },
  sp_0181: {
    speciesId: 'sp_0181',
    waterType: 'freshwater',
    behaviorTraits: ['group_living', 'peaceful', 'water_quality_sensitive'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [nextWaveUnified02Sources.gnathonemusFishBase, nextWaveUnified02Sources.gnathonemusSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior'],
  },
  sp_0018: {
    speciesId: 'sp_0018',
    waterType: 'freshwater',
    behaviorTraits: ['territorial_males', 'rock_associated_territory', 'mbuna'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [chindongoSocolofiFishBase, chindongoSocolofiSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality'],
  },
  sp_0038: {
    speciesId: 'sp_0038',
    waterType: 'freshwater',
    behaviorTraits: ['predatory', 'interspecific_aggression', 'dominance_hierarchy'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [opsariichthysBidensFishBase, opsariichthysBidensDietStudy, opsariichthysBidensEnrichmentStudy],
    requiredFacts: ['water', 'adult_size', 'social_behavior', 'predation'],
  },
  sp_0022: {
    speciesId: 'sp_0022',
    waterType: 'saltwater',
    behaviorTraits: ['group_living'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [lutjanusKasmiraFishBase],
    requiredFacts: ['water', 'adult_size', 'social_behavior'],
  },
  sp_0023: {
    speciesId: 'sp_0023',
    waterType: 'saltwater',
    behaviorTraits: ['variable_social'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [zebrasomaFlavescensFishBase],
    requiredFacts: ['water', 'adult_size', 'social_behavior'],
  },
  sp_0024: {
    speciesId: 'sp_0024',
    waterType: 'saltwater',
    behaviorTraits: ['group_living'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [paracanthurusHepatusFishBase],
    requiredFacts: ['water', 'adult_size', 'social_behavior'],
  },
  sp_0014: {
    speciesId: 'sp_0014',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'bottom_dwelling'],
    minimumGroupSize: 4,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [bronzeCorySeriouslyFish],
    requiredFacts: ['water', 'temperature', 'adult_size', 'social_behavior'],
  },
  sp_0443: {
    speciesId: 'sp_0443',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'bottom_dwelling'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [pandaCoryFishBase, pandaCorySeriouslyFish],
    requiredFacts: ['water', 'temperature', 'adult_size', 'social_behavior'],
  },
  sp_0439: {
    speciesId: 'sp_0439',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling', 'interspecific_aggression', 'fin_nipping'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [tigerBarbStudy],
    requiredFacts: ['water', 'temperature', 'social_behavior', 'territoriality'],
  },
  sp_0021: {
    speciesId: 'sp_0021',
    waterType: 'freshwater',
    behaviorTraits: ['territorial', 'breeding_defense', 'chasing', 'biting'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [convictCichlidTerritoryStudy],
    requiredFacts: ['water', 'temperature', 'territoriality', 'breeding_behavior'],
  },
  sp_0015: {
    speciesId: 'sp_0015',
    waterType: 'freshwater',
    behaviorTraits: ['interspecific_aggression'],
    predationTargets: ['very_small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [kissingGouramiFishBase, kissingGouramiSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
  sp_0049: {
    speciesId: 'sp_0049',
    waterType: 'freshwater',
    behaviorTraits: ['predatory', 'solitary_required', 'territorial'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [smallSnakeheadAssessment],
    requiredFacts: ['water', 'temperature', 'adult_size', 'predation', 'territoriality'],
  },
  sp_0431: {
    speciesId: 'sp_0431',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [neonTetraFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'social_behavior'],
  },
  sp_0432: {
    speciesId: 'sp_0432',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [cardinalTetraFishBase],
    requiredFacts: ['water', 'temperature', 'ph', 'social_behavior'],
  },
  sp_0434: {
    speciesId: 'sp_0434',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [whiteCloudFishBase, whiteCloudShoalingStudy],
    requiredFacts: ['water', 'temperature', 'social_behavior'],
  },
  sp_0435: {
    speciesId: 'sp_0435',
    waterType: 'freshwater',
    behaviorTraits: ['shoaling'],
    minimumGroupSize: 8,
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [zebrafishSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'social_behavior', 'adult_size'],
  },
  sp_0436: {
    speciesId: 'sp_0436',
    waterType: 'freshwater',
    waterTypes: ['freshwater', 'brackish'],
    behaviorTraits: ['shoaling'],
    minimumGroupSize: 5,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [guppyFishBase, guppyShoalingStudy],
    requiredFacts: ['water', 'temperature', 'social_behavior', 'breeding_behavior'],
  },
  sp_0475: {
    speciesId: 'sp_0475',
    waterType: 'freshwater',
    waterTypes: ['freshwater', 'brackish'],
    behaviorTraits: ['schooling'],
    minimumGroupSize: 3,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [rhodeusFishBase, rhodeusSchoolingStudy],
    requiredFacts: ['water', 'temperature', 'adult_size', 'social_behavior'],
  },
  sp_0446: {
    speciesId: 'sp_0446',
    waterType: 'freshwater',
    behaviorTraits: ['territorial', 'small_fish_predation'],
    predationTargets: ['very_small_fish'],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [angelfishFishBase, angelfishSeriouslyFish, angelfishExtensionGuide],
    requiredFacts: ['water', 'temperature', 'adult_size', 'social_behavior', 'territoriality', 'predation'],
  },
  sp_0451: {
    speciesId: 'sp_0451',
    waterType: 'freshwater',
    behaviorTraits: ['predatory'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [oscarFishBaseEcology, oscarSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'adult_size', 'predation'],
  },
};

const GENERIC_FACT_SYNC_PROFILE_IDS = new Set([
  'sp_0017', 'sp_0020', 'sp_0045', 'sp_0048', 'sp_0053', 'sp_0114',
  'sp_0018', 'sp_0050', 'sp_0056', 'sp_0057', 'sp_0058', 'sp_0126', 'sp_0131', 'sp_0133',
  'sp_0181', 'sp_0440', 'sp_0443', 'sp_0446', 'sp_0448', 'sp_0469',
]);

for (const speciesId of GENERIC_FACT_SYNC_PROFILE_IDS) {
  const profile = profiles[speciesId];
  if (!profile) throw new Error(`Missing reviewed Compatibility profile for generic fact sync: ${speciesId}`);
  profile.requiredFacts = Array.from(new Set([...(profile.requiredFacts ?? []), ...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS]));
}

const wave04BridgeProfile = (
  speciesId: string,
  baseSpeciesId: string,
  variantCitation: EvidenceSourceDto,
): ReviewedCompatibilityProfile => {
  const base = profiles[baseSpeciesId];
  if (!base) throw new Error('Missing reviewed Compatibility bridge base: ' + baseSpeciesId);
  return {
    ...base,
    speciesId,
    behaviorTraits: [...base.behaviorTraits],
    predationTargets: [...base.predationTargets],
    citations: [variantCitation, ...base.citations],
    requiredFacts: base.requiredFacts ? [...base.requiredFacts] : undefined,
  };
};

export const buildCanonicalVariantCompatibilityProfile = (
  identity: Pick<CatalogCanonicalIdentity, 'catalogSpeciesId' | 'inheritancePolicy'>,
  base: ReviewedCompatibilityProfile,
  identityCitations: EvidenceSourceDto[],
): ReviewedCompatibilityProfile => {
  const inherited = new Set(identity.inheritancePolicy.inheritedFacts);
  const inheritBehaviorBundle = ['social_behavior', 'territoriality', 'predation']
    .every(field => inherited.has(field as CompatibilityRequiredFact));
  return {
    speciesId: identity.catalogSpeciesId,
    ...(inherited.has('water') && base.waterType ? { waterType: base.waterType } : {}),
    ...(inherited.has('water') && base.waterTypes ? { waterTypes: [...base.waterTypes] } : {}),
    behaviorTraits: inheritBehaviorBundle ? [...base.behaviorTraits] : [],
    ...(inherited.has('social_behavior') && base.minimumGroupSize != null
      ? { minimumGroupSize: base.minimumGroupSize }
      : {}),
    predationTargets: inherited.has('predation') ? [...base.predationTargets] : [],
    confidence: base.confidence,
    reviewStatus: base.reviewStatus,
    citations: [
      ...identityCitations,
      ...base.citations.filter(source => !identityCitations.some(identitySource => identitySource.id === source.id)),
    ],
    requiredFacts: base.requiredFacts?.filter(field => inherited.has(field)),
    ...(base.stockingGuidance && inherited.has('tank_size') && inherited.has('social_behavior')
      ? {
          stockingGuidance: {
            ...base.stockingGuidance,
            constraints: [...base.stockingGuidance.constraints],
            evidenceIds: [...base.stockingGuidance.evidenceIds],
          },
        }
      : {}),
  };
};

profiles.sp_0116 = wave04BridgeProfile('sp_0116', 'sp_0103', nextWaveUnified04Sources.scleropagesGreen);
profiles.sp_0104 = wave04BridgeProfile('sp_0104', 'sp_0103', nextWaveUnified04Sources.scleropagesRed);
profiles.sp_0146 = wave04BridgeProfile('sp_0146', 'sp_0448', nextWaveUnified04Sources.ramPlatinum);
profiles.sp_0157 = wave04BridgeProfile('sp_0157', 'sp_0448', nextWaveUnified04Sources.ramBlue);
profiles.sp_0151 = wave04BridgeProfile('sp_0151', 'sp_0010', nextWaveUnified04Sources.blackTetraColor);
profiles.sp_0452 = {
  speciesId: 'sp_0452',
  waterType: 'saltwater',
  behaviorTraits: ['pair_living', 'anemone_association', 'male_egg_guarding'],
  predationTargets: [],
  confidence: 'high',
  reviewStatus: 'reviewed',
  citations: [nextWaveUnified04Sources.amphiprionFishBase],
  requiredFacts: ['water', 'adult_size', 'social_behavior', 'breeding_behavior'],
};

profiles.sp_0453 = {
  speciesId: 'sp_0453',
  waterType: 'saltwater',
  behaviorTraits: ['solitary', 'predatory', 'venomous_spines'],
  predationTargets: ['small_fish'],
  confidence: 'high',
  reviewStatus: 'reviewed',
  citations: [nextWaveUnified04Sources.pteroisFishBase],
  requiredFacts: ['water', 'adult_size', 'social_behavior', 'predation'],
};

profiles.sp_0069 = {
  speciesId: 'sp_0069',
  waterType: 'freshwater',
  behaviorTraits: ['group_living', 'pond_scale', 'very_large_space_requirement'],
  minimumGroupSize: 5,
  predationTargets: [],
  confidence: 'high',
  reviewStatus: 'reviewed',
  citations: [nextWaveUnified04Sources.carpVar],
  requiredFacts: ['water', 'tank_size', 'social_behavior'],
};

profiles.sp_0070 = {
  speciesId: 'sp_0070',
  waterType: 'freshwater',
  behaviorTraits: ['group_living', 'pond_scale', 'very_large_space_requirement'],
  minimumGroupSize: 5,
  predationTargets: [],
  confidence: 'high',
  reviewStatus: 'reviewed',
  citations: [nextWaveUnified04Sources.carpLongfin],
  requiredFacts: ['water', 'tank_size', 'social_behavior'],
};

profiles.sp_0156 = {
  speciesId: 'sp_0156',
  waterType: 'freshwater',
  behaviorTraits: ['variable_temperament', 'male_territoriality', 'breeding_aggression'],
  predationTargets: [],
  confidence: 'high',
  reviewStatus: 'reviewed',
  citations: [nextWaveUnified04Sources.trichopodusPlatinum, nextWaveUnified04Sources.trichopodusSeriouslyFish],
  requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation', 'breeding_behavior'],
};


profiles.sp_0174 = wave04BridgeProfile('sp_0174', 'sp_0010', nextWaveUnified05Sources.tetraAlbinoWhite);
profiles.sp_0207 = wave04BridgeProfile('sp_0207', 'sp_0010', nextWaveUnified05Sources.tetraAlbinoWhite);
profiles.sp_0283 = wave04BridgeProfile('sp_0283', 'sp_0103', nextWaveUnified06Sources.scleropagesSuperRedPeerReviewed);
profiles.sp_0052 = {
  speciesId: 'sp_0052',
  waterType: 'freshwater',
  behaviorTraits: ['shoaling', 'bottom_dwelling'],
  predationTargets: [],
  confidence: 'medium',
  reviewStatus: 'reviewed',
  citations: [nextWaveUnified16Sources.corydorasHastatusFishBase],
  requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
};

profiles.sp_0173 = {
  speciesId: 'sp_0173',
  waterType: 'freshwater',
  behaviorTraits: ['predatory', 'very_large_open_water_predator', 'home_aquarium_unsuitable'],
  predationTargets: ['small_fish'],
  confidence: 'high',
  reviewStatus: 'reviewed',
  citations: [nextWaveUnified05Sources.salminusFishBase, nextWaveUnified05Sources.salminusSeriouslyFish],
  requiredFacts: ['water', 'adult_size', 'social_behavior', 'predation'],
};

profiles.sp_0214 = {
  speciesId: 'sp_0214',
  waterType: 'freshwater',
  behaviorTraits: ['pair_living', 'breeding_defense', 'pair_parental_care'],
  predationTargets: [],
  confidence: 'high',
  reviewStatus: 'reviewed',
  citations: [nextWaveUnified05Sources.pelvicachromis],
  requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation', 'breeding_behavior'],
};

const authorityPatchSourceById = new Map(
  Object.values(compatibilityAuthorityPatchSources).map(source => [source.id, source] as const),
);

for (const patch of compatibilityProfileAuthorityPatches) {
  const profile = profiles[patch.speciesId];
  if (!profile) throw new Error(`Missing reviewed Compatibility profile for authority patch: ${patch.speciesId}`);
  profile.behaviorTraits = Array.from(new Set([...profile.behaviorTraits, ...(patch.addBehaviorTraits ?? [])]));
  if (patch.replacePredationTargets) profile.predationTargets = [...patch.replacePredationTargets];
  const citations = [...profile.citations];
  for (const sourceId of patch.addCitationIds) {
    const source = authorityPatchSourceById.get(sourceId);
    if (!source) throw new Error(`Missing Compatibility authority patch source: ${sourceId}`);
    if (!citations.some(item => item.id === sourceId)) citations.push(source);
  }
  profile.citations = citations;
  profile.requiredFacts = Array.from(new Set([...(profile.requiredFacts ?? []), ...patch.addRequiredFacts]));
}

/**
 * Reviewed canonical-identity bridges are materialized only after all base
 * Profile authority patches have landed. Catalog variants therefore inherit
 * from one canonical identity registry instead of hand-authored Profile copies.
 * Field allowlists are enforced here; blocked fields never leak from the base.
 */
const canonicalIdentitySourceById = new Map(
  [
    ...Object.values(profiles).flatMap(profile => profile.citations),
    ...Object.values(identityCorrectionsWave21Sources),
    ...Object.values(identityCorrectionsWave22Sources),
    ...Object.values(identityCorrectionsWave23Sources),
    ...Object.values(identityCorrectionsWave24Sources),
    ...Object.values(identityCorrectionsWave25Sources),
    ...Object.values(identityCorrectionsWave26Sources),
    ...Object.values(identityCorrectionsWave27Sources),
    ...Object.values(identityCorrectionsWave28Sources),
    ...Object.values(identityCorrectionsWave29Sources),
    ...Object.values(identityCorrectionsPhase2_01Sources),
    ...Object.values(identityCorrectionsPhase2_02Sources),
    ...Object.values(identityCorrectionsPhase2_03Sources),
    ...Object.values(catalogCorrectionPhase2_04Sources),
    ...Object.values(behaviorEvidencePhase2_05Sources),
  ].map(source => [source.id, source] as const),
);

for (const identity of Object.values(catalogCanonicalIdentities)) {
  const base = profiles[identity.canonicalSpeciesId];
  if (!base) throw new Error('Missing canonical Compatibility base Profile: ' + identity.canonicalSpeciesId);
  const citations = identity.identityEvidenceSourceIds.map(sourceId => {
    const source = canonicalIdentitySourceById.get(sourceId);
    if (!source) throw new Error('Missing canonical identity evidence source: ' + sourceId);
    return source;
  });
  profiles[identity.catalogSpeciesId] = buildCanonicalVariantCompatibilityProfile(identity, base, citations);
}

const baseSpeciesProfiles: Record<string, ReviewedCompatibilityProfile> = {

  'Neocaridina davidi': {
    speciesId: 'base:Neocaridina davidi',
    waterType: 'freshwater',
    behaviorTraits: ['group_living', 'bottom_dwelling'],
    minimumGroupSize: 6,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [neocaridinaHusbandrySource, neocaridinaSocialStudy],
    requiredFacts: ['water', 'temperature', 'adult_size', 'social_behavior'],
  },
  'Caridina cantonensis': {
    speciesId: 'base:Caridina cantonensis',
    waterType: 'freshwater',
    behaviorTraits: ['group_living', 'bottom_dwelling'],
    minimumGroupSize: 10,
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [caridinaHusbandrySource],
    requiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'social_behavior'],
  },
  'Neritina natalensis': {
    speciesId: 'base:Neritina natalensis',
    waterType: 'freshwater',
    behaviorTraits: ['algae_grazer'],
    predationTargets: [],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [neriteHusbandrySource],
    requiredFacts: ['water', 'temperature', 'adult_size'],
  },
  'Amatitlania nigrofasciata': {
    speciesId: 'base:Amatitlania nigrofasciata',
    waterType: 'freshwater',
    behaviorTraits: ['territorial', 'breeding_defense', 'chasing', 'biting'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [convictCichlidTerritoryStudy],
    requiredFacts: ['water', 'temperature', 'territoriality', 'breeding_behavior'],
  },
  'Channa asiatica': {
    speciesId: 'base:Channa asiatica',
    waterType: 'freshwater',
    behaviorTraits: ['predatory', 'solitary_required', 'territorial'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [smallSnakeheadAssessment],
    requiredFacts: ['water', 'temperature', 'adult_size', 'predation', 'territoriality'],
  },
  'Betta splendens': {
    speciesId: 'base:Betta splendens',
    waterType: 'freshwater',
    behaviorTraits: ['territorial', 'solitary_required', 'long_fin_vulnerable'],
    predationTargets: [],
    confidence: 'high',
    reviewStatus: 'reviewed',
    citations: [bettaSeriouslyFish],
    requiredFacts: ['water', 'temperature', 'social_behavior', 'territoriality'],
  },
};

const stageRiskProfiles: Record<string, ReviewedStageRiskProfile> = {
  sp_0436: {
    speciesId: 'sp_0436',
    youngerStages: ['fry'],
    olderStages: ['adult'],
    verdict: 'not_recommended',
    riskType: 'conspecific_fry_predation',
    reason: '孔雀鱼成体捕食同种幼体在水族箱实验与繁育研究中均有记录，且捕食程度会受到幼体体型与躲避结构影响。当前不应把成鱼与新生鱼苗直接同缸视为已证明安全。',
    mitigation: ['鱼苗优先使用育苗隔离区或独立育苗缸。', '不要把水草躲避物当作能够消除同类吞食风险的保证。'],
    basis: 'species_trait',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0436'],
    citations: [guppyCannibalismRefugeStudy, guppyFryYieldStudy],
  },
};

const platinumSnakeheadSmallFishIds = [
  'sp_0431',
  'sp_0434',
  'sp_0436',
  'sp_0435',
  'sp_0439',
  'sp_0010',
  'sp_0011',
  'sp_0437',
  'sp_0012',
  'sp_0468',
  'sp_0443',
  'sp_0013',
] as const;

const platinumSnakeheadSmallFishPairRules: ReviewedPairRule[] = platinumSnakeheadSmallFishIds.map(speciesId => ({
  speciesIds: ['sp_0224', speciesId],
  verdict: 'not_recommended',
  riskType: 'predation_threat',
  reason: '白金雷龙 catalog object 已通过 reviewed identity 映射到 Channa argus 的 Platinum 品系。FWS 2024 将 Channa argus 明确描述为 piscivorous；USGS 2012 胃内容物研究中超过 97% 为鱼类。当前规则仅用于 catalog size=Small 的鱼类对象，属于“物种捕食生态 + 小型鱼体型”的规则推断，不外推到中大型鱼、虾或螺。',
  mitigation: ['不要把白金雷龙与该小型鱼作为长期同缸组合；优先物理分缸。', '不要把暂时体型接近、躲避物或短期未追逐理解为已消除捕食风险。'],
  basis: 'rule_inference',
  confidence: 'medium',
  reviewStatus: 'reviewed',
  affectedSpeciesIds: ['sp_0224', speciesId],
  citations: [northernSnakeheadFwsAssessment, northernSnakeheadDietStudy],
}));

const platinumSnakeheadAdditionalPredationPairRules: ReviewedPairRule[] = [
  {
    speciesIds: ['sp_0224', 'sp_0438'],
    verdict: 'not_recommended',
    riskType: 'predation_threat',
    reason: '白金雷龙对象已审核到 Channa argus Platinum，最大体长约 100 cm；红剑鱼 reviewed 最大体长约 14 cm。USGS 物种资料记录成体 Channa argus 可捕食达到自身约 33% 体长的鱼，因此 14 cm 红剑鱼明显落在已记录捕食尺寸窗口内。该结论是物种捕食生态 + reviewed 体型的规则推断。',
    mitigation: ['不要把白金雷龙与红剑鱼作为长期同缸组合；优先物理分缸。', '不要把幼体阶段暂时体型接近理解为成年后仍安全。'],
    basis: 'rule_inference',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0224', 'sp_0438'],
    citations: [northernSnakeheadFwsAssessment, northernSnakeheadDietStudy],
  },
  {
    speciesIds: ['sp_0224', 'sp_0021'],
    verdict: 'not_recommended',
    riskType: 'predation_threat',
    reason: '迷你鹦鹉鱼 catalog object 的商业品系 taxon 仍未完全解析，但对象级最大体长约 10 cm 已审核通过。USGS 记录成体 Channa argus 可捕食达到自身约 33% 体长的鱼；10 cm 级鱼明显落在白金雷龙 reviewed 最大约 100 cm 所对应的捕食尺寸窗口内。该结论只依赖“鱼类 + reviewed 对象级体型”，不把基础种行为自动提升为该商业品系。',
    mitigation: ['不要把白金雷龙与迷你鹦鹉鱼作为长期同缸组合；优先物理分缸。', '不要用商业品系身份尚未完全解析来反推捕食风险不存在。'],
    basis: 'rule_inference',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0224', 'sp_0021'],
    citations: [northernSnakeheadFwsAssessment, northernSnakeheadDietStudy],
  },
  ...(['sp_0459', 'sp_0001'] as const).map(speciesId => ({
    speciesIds: ['sp_0224', speciesId] as [string, string],
    verdict: 'not_recommended' as const,
    riskType: 'predation_threat',
    reason: '黑壳虾/极火虾对象均有 reviewed Neocaridina davidi 身份与约 4 cm 最大体长 authority。USGS Channa argus 物种资料记录成体猎物包括 crayfish，并指出成体剩余非鱼类食物中包含 crustaceans；风险评估也把 surface-dwelling crayfish and shrimp 列为可能受影响的甲壳类。对 4 cm 级淡水虾，存在足够的捕食威胁，不应作为长期同缸安全组合。',
    mitigation: ['不要把白金雷龙与该小型淡水虾作为长期同缸组合；优先物理分缸。', '不要把水草躲避物或短期未捕食理解为风险已消失。'],
    basis: 'rule_inference' as const,
    confidence: 'medium' as const,
    reviewStatus: 'reviewed' as const,
    affectedSpeciesIds: ['sp_0224', speciesId],
    citations: [northernSnakeheadFwsAssessment, northernSnakeheadDietStudy],
  })),
];

const pairRules: ReviewedPairRule[] = [
  ...platinumSnakeheadSmallFishPairRules,
  ...platinumSnakeheadAdditionalPredationPairRules,
  {
    speciesIds: ['sp_0439', 'sp_0436'],
    verdict: 'not_recommended',
    riskType: 'fin_nipping_long_fin_conflict',
    reason: '孔雀鱼资料明确建议不要与虎皮等追鳍鱼混养；虎皮鱼资料也明确指出其不适合作为长鳍或慢游鱼的同伴。该组合有直接的养护层配对建议，不应仅作为一般性 caution。',
    mitigation: ['优先不要长期混养；选择非追鳍同伴，或将两者分缸。', '不要把“虎皮数量够了”理解为已经消除对长鳍鱼的追鳍风险。'],
    basis: 'pair_rule',
    confidence: 'high',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0439', 'sp_0436'],
    citations: [guppySeriouslyFish, tigerBarbSeriouslyFish],
  },
  {
    speciesIds: ['sp_0021', 'sp_0439'],
    verdict: 'not_recommended',
    riskType: 'behavior_and_territory_conflict',
    reason: '虎皮鱼有追鳍与种间攻击倾向，迷你鹦鹉鱼会追逐、啃咬并在繁殖期强烈护域；两者同缸容易形成持续追逐和领地冲突。',
    mitigation: ['优先分缸饲养；不要把增加躲避物当作消除行为冲突的保证。'],
    basis: 'rule_inference',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0021', 'sp_0439'],
    citations: [tigerBarbStudy, convictCichlidTerritoryStudy],
  },
  {
    speciesIds: ['sp_0431', 'sp_0432'],
    verdict: 'caution',
    riskType: 'group_size_and_shared_water_window',
    reason: 'FishBase 将红绿灯与宝莲灯都记录为小型淡水群游/群养鱼；两者温度区间在约 23–26°C、pH 区间在约 5.0–6.0 有共同范围。当前没有直接配对实验，因此只作为有条件可尝试，而不是“已证明安全”。',
    mitigation: ['两种鱼都按群体饲养，不以单条长期混养作为目标。', '把温度和 pH 保持在两者共同区间，并避免快速波动。', '分批加入并持续观察摄食、追逐和应激表现。'],
    basis: 'rule_inference',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0431', 'sp_0432'],
    citations: [neonTetraFishBase, cardinalTetraFishBase],
  },
  {
    speciesIds: ['sp_0451', 'sp_0435'],
    verdict: 'not_recommended',
    riskType: 'predation_threat',
    reason: '多项斑马鱼 predator-response 实验明确把地图鱼 Astronotus ocellatus 作为 Danio rerio 的捕食者刺激；活体地图鱼可诱发稳定回避/恐惧反应，长期视觉暴露研究也将该组合定义为 predator–prey 模型。证据支持存在明确捕食威胁，但这些实验并不是家庭水族箱中的长期同缸吞食试验。',
    mitigation: ['不要把地图鱼与斑马鱼作为长期同缸组合；优先物理分缸。', '不要用增加躲避物或“先试试看”替代捕食风险隔离。'],
    basis: 'pair_rule',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0451', 'sp_0435'],
    citations: [oscarZebrafishLivePredatorStudy, oscarZebrafishDevelopmentStudy],
  },
  {
    speciesIds: ['sp_0224', 'sp_0475'],
    verdict: 'not_recommended',
    riskType: 'predation_threat',
    reason: '2015 年 predator–prey 实验直接使用高体鳑鲏 Rhodeus ocellatus 作为 prey、乌鳢 Channa argus 作为 predator，并记录到猎物倾向远离捕食者；2026 年研究进一步将乌鳢明确描述为高体鳑鲏的 natural predator，并以 20 天持续视觉/化学线索暴露研究非消耗性捕食压力。证据支持明确捕食威胁，但两项实验均采用物理隔离，不是家庭水族箱长期同缸吞食试验。',
    mitigation: ['不要把白金雷龙与高体鳑鲏作为长期同缸组合；优先物理分缸。', '不要用躲避物、体型暂时接近或短期未追逐来替代捕食风险隔离。'],
    basis: 'pair_rule',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: ['sp_0224', 'sp_0475'],
    citations: [channaRhodeusInformationDynamicsStudy, channaRhodeusPredationStressStudy],
  },
];

export const getReviewedCompatibilityProfile = (speciesId: string) => profiles[speciesId];

export const getReviewedCompatibilityProfileForFish = (fish: Pick<Fish, 'id' | 'scientificName'>) => {
  // Identity is the outer runtime gate. A direct reviewed Profile cannot make
  // an unresolved commercial/hybrid object biologically identified.
  if (getCatalogIdentityBoundary(fish.id)) return undefined;
  const direct = profiles[fish.id];
  if (direct) return direct;
  // Raw scientific-name morphology suffixes are not sufficient authority for
  // inheritance. Reviewed canonical variants are already materialized above.
  const baseScientificName = getBaseSpeciesScientificName(fish.scientificName);
  return baseScientificName ? baseSpeciesProfiles[baseScientificName] : undefined;
};

export const getReviewedStageRiskProfile = (speciesId: string) => stageRiskProfiles[speciesId];

export const getReviewedPairRule = (leftId: string, rightId: string) => pairRules.find(rule => (
  rule.speciesIds.includes(leftId) && rule.speciesIds.includes(rightId)
));

export const getCompatibilityEvidenceAudit = () => ({
  reviewedSpeciesIds: Object.keys(profiles),
  reviewedProfiles: Object.values(profiles),
  reviewedStageRiskSpeciesIds: Object.keys(stageRiskProfiles),
  reviewedStageRiskProfiles: Object.values(stageRiskProfiles),
  reviewedPairRules: pairRules,
});
