import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-18T02:05:00+08:00';

export const identityCorrectionsPhase2_02Sources = {
  peckoltiaComptaGoldAmazonasReview: {
    id: 'suedamerikafans-peckoltia-compta-gold-phase2-02',
    title: 'Hans-Georg Evers: Peckoltia compta “Gold” — Amazonas Jan/Feb 2016 review',
    publisher: 'Südamerikafans / Welsfans',
    url: 'https://www.suedamerikafans.de/es/amazonas-januarfebruar-2016-wels-presseschau/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  platinumArowanaFishCollection: {
    id: 'fishcollection-scleropages-formosus-platinum-phase2-02',
    title: 'Platinum Arowana — Scleropages formosus leucistic variant',
    publisher: 'The Fish Collection',
    url: 'https://www.thefishcollection.com/en/species/platinum-arowana',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'high',
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

const peckoltiaGoldIdentitySources = [
  identityCorrectionsPhase2_02Sources.peckoltiaComptaGoldAmazonasReview.id,
];
const peckoltiaBaseSources = [
  'batch09-fishbase-peckoltia-compta',
  'aquaristatlas-peckoltia-compta',
];

const goldPeckoltiaReviews: CatalogFieldReview[] = [
  supported('sp_0257', 'identity', {
    scientificName: 'Peckoltia compta var. Gold',
    baseSpeciesKey: 'Peckoltia compta',
    variantKey: 'Gold',
  }, peckoltiaGoldIdentitySources, [
    'Specialist catfish literature records Peckoltia compta “Gold” as a gold-colour offspring/form of P. compta (L134).',
    'This source is used only to resolve the catalog variant identity; Compatibility facts remain inherited from reviewed P. compta authority.',
  ]),
  supported('sp_0257', 'water', 'freshwater', [...peckoltiaGoldIdentitySources, ...peckoltiaBaseSources], ['Inherited from reviewed P. compta base authority after Gold identity resolution.']),
  supported('sp_0257', 'temperature', { min: 25, max: 29 }, [...peckoltiaGoldIdentitySources, ...peckoltiaBaseSources], ['Inherited from reviewed P. compta base authority.']),
  supported('sp_0257', 'ph', { min: 6, max: 7.2 }, [...peckoltiaGoldIdentitySources, ...peckoltiaBaseSources], ['Inherited from reviewed P. compta base authority.']),
  supported('sp_0257', 'adult_size', { min: null, max: 10.9 }, [...peckoltiaGoldIdentitySources, ...peckoltiaBaseSources], ['Inherited from reviewed P. compta base authority.']),
  supported('sp_0257', 'tank_size', { liters: 100, lengthCm: null }, [...peckoltiaGoldIdentitySources, 'aquaristatlas-peckoltia-compta'], ['Inherited from reviewed P. compta base authority.']),
  supported('sp_0257', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [...peckoltiaGoldIdentitySources, 'aquaristatlas-peckoltia-compta'], ['Inherited from reviewed P. compta base authority.'], 'medium'),
  supported('sp_0257', 'territoriality', { traits: ['cave_territoriality', 'conspecific_male_aggression'] }, [...peckoltiaGoldIdentitySources, 'aquaristatlas-peckoltia-compta'], ['Inherited from reviewed P. compta base authority.'], 'medium'),
  supported('sp_0257', 'predation', { targets: [] }, [...peckoltiaGoldIdentitySources, 'aquaristatlas-peckoltia-compta'], [
    'Preserves the reviewed generic predation field for P. compta; the Gold identity source is not used to broaden behavioral claims.',
  ], 'medium'),
];

const platinumArowanaIdentitySources = [
  identityCorrectionsPhase2_02Sources.platinumArowanaFishCollection.id,
  'ijms-scleropages-formosus-color-variants-phase2-01',
];
const arowanaBaseSources = [
  'batch19-fishbase-scleropages-formosus-green',
  'batch19-fishbase-scleropages-formosus',
  'seriouslyfish-scleropages-formosus',
];
const arowanaTerritorialitySources = [
  'myfish-scleropages-formosus-territoriality',
  'batch19-fishbase-scleropages-formosus-green',
];

const platinumArowanaReviews: CatalogFieldReview[] = [
  supported('sp_0284', 'identity', {
    scientificName: 'Scleropages formosus var. Silver Platinum',
    baseSpeciesKey: 'Scleropages formosus',
    variantKey: 'Platinum / Silver Platinum',
  }, platinumArowanaIdentitySources, [
    'Object-level specialist evidence identifies Platinum Arowana as a leucistic Scleropages formosus variant.',
    'Peer-reviewed S. formosus color-variant genomics supports color phenotypes remaining within the same species; Compatibility facts remain inherited from the reviewed base species.',
  ]),
  supported('sp_0284', 'water', 'freshwater', [...platinumArowanaIdentitySources, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported('sp_0284', 'temperature', { min: 22, max: 28 }, [...platinumArowanaIdentitySources, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported('sp_0284', 'ph', { min: 5, max: 8 }, [...platinumArowanaIdentitySources, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported('sp_0284', 'adult_size', { min: null, max: 90 }, [...platinumArowanaIdentitySources, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported('sp_0284', 'tank_size', { liters: null, lengthCm: 200 }, [...platinumArowanaIdentitySources, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported('sp_0284', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [...platinumArowanaIdentitySources, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported('sp_0284', 'territoriality', { traits: ['territorial'] }, [...platinumArowanaIdentitySources, ...arowanaTerritorialitySources], ['Inherited from reviewed S. formosus territoriality authority.']),
  supported('sp_0284', 'predation', { targets: ['small_fish'] }, [...platinumArowanaIdentitySources, ...arowanaBaseSources], ['Inherited from reviewed S. formosus predation authority.']),
];

export const identityCorrectionsPhase2_02FieldReviews: CatalogFieldReview[] = [
  ...goldPeckoltiaReviews,
  ...platinumArowanaReviews,
];

export const identityCorrectionsPhase2_02VerifiedSourceIds = Object.values(identityCorrectionsPhase2_02Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0257', 'sp_0284']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0257: 'sp_0121',
  sp_0284: 'sp_0116',
} as const;
