import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-18T01:08:00+08:00';

export const identityCorrectionsPhase2_01Sources = {
  calvusGoldFranceCichlid: {
    id: 'france-cichlid-altolamprologus-calvus-gold-phase2-01',
    title: 'Altolamprologus calvus — local Gold variety from Nkamba Bay',
    publisher: 'Association France Cichlid',
    url: 'https://www.francecichlid.com/altolamprologus/',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  calvusGoldDestinTanganyika: {
    id: 'destin-tanganyika-altolamprologus-calvus-gold-phase2-01',
    title: 'Altolamprologus calvus colour varieties: Black, Gold and White',
    publisher: 'Destination Tanganyika',
    url: 'https://www.destin-tanganyika.com/speciation/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  albinoArowanaKoNelayan: {
    id: 'konelayan-sabah-scleropages-formosus-albino-silver-phase2-01',
    title: 'Ko-Nelayan Ornamental Fish Centre: Scleropages formosus Malaysian Gold & Albino Silver',
    publisher: 'Ko-Nelayan Sabah',
    url: 'https://konelayan.sabah.gov.my/3.%20program-inisiatif-tab/pihs-en.html',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
  goldenHeadSunbeam: {
    id: 'sunbeam-scleropages-formosus-golden-head-phase2-01',
    title: 'Golden Head Arowana — Scleropages formosus',
    publisher: 'Sunbeam Aquarium Singapore',
    url: 'https://sunbeamaquarium.com/fresh-marine-fish-crustaceans-coral-plants/fresh-water-fish/fresh-water-fish-arawana/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  scleropagesColorGenomics: {
    id: 'ijms-scleropages-formosus-color-variants-phase2-01',
    title: 'Cytotaxonomy and genomic relationships among color variants of Scleropages formosus',
    publisher: 'International Journal of Molecular Sciences',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37240350/',
    sourceType: 'peer_reviewed',
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

const calvusIdentitySources = [
  identityCorrectionsPhase2_01Sources.calvusGoldFranceCichlid.id,
  identityCorrectionsPhase2_01Sources.calvusGoldDestinTanganyika.id,
];

const calvusFishBase = 'batch09-fishbase-altolamprologus-calvus';
const calvusFishipedia = 'fishipedia-altolamprologus-calvus';

const goldCalvusReviews: CatalogFieldReview[] = [
  supported('sp_0266', 'identity', {
    scientificName: 'Altolamprologus calvus var. Gold',
    baseSpeciesKey: 'Altolamprologus calvus',
    variantKey: 'Gold / Nkamba Bay',
  }, calvusIdentitySources, [
    'Two independent specialist cichlid sources identify Gold from Nkamba Bay as a local colour/geographic variety of Altolamprologus calvus.',
    'The identity bridge is limited to taxon/variant resolution; Compatibility facts continue to come from the already-reviewed A. calvus base authority.',
  ]),
  supported('sp_0266', 'water', 'freshwater', [...calvusIdentitySources, calvusFishBase], ['Inherited from reviewed A. calvus base authority after exact Gold/Nkamba Bay identity resolution.']),
  supported('sp_0266', 'temperature', { min: 23, max: 25 }, [...calvusIdentitySources, calvusFishBase], ['Inherited from reviewed A. calvus base authority.']),
  supported('sp_0266', 'ph', { min: 8, max: 9 }, [...calvusIdentitySources, calvusFishBase], ['Inherited from reviewed A. calvus base authority.']),
  supported('sp_0266', 'adult_size', { min: null, max: 13.5 }, [...calvusIdentitySources, calvusFishBase], ['Inherited from reviewed A. calvus base authority.']),
  supported('sp_0266', 'tank_size', { liters: 250, lengthCm: null }, [...calvusIdentitySources, calvusFishipedia], ['Inherited from reviewed A. calvus base authority.'], 'medium'),
  supported('sp_0266', 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [...calvusIdentitySources, calvusFishipedia], ['Inherited from reviewed A. calvus base authority.'], 'medium'),
  supported('sp_0266', 'territoriality', { traits: ['territorial', 'intraspecific_aggression'] }, [...calvusIdentitySources, calvusFishipedia], ['Inherited from reviewed A. calvus base authority.'], 'medium'),
  supported('sp_0266', 'predation', { targets: [] }, [...calvusIdentitySources, calvusFishipedia], [
    'Preserves the current reviewed generic Compatibility predation field for A. calvus; the identity sources are not used to broaden consequential prey-target claims in this migration.',
  ], 'medium'),
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

const arowanaBridge = (
  speciesId: string,
  scientificName: string,
  variantKey: string,
  identitySourceIds: string[],
): CatalogFieldReview[] => [
  supported(speciesId, 'identity', {
    scientificName,
    baseSpeciesKey: 'Scleropages formosus',
    variantKey,
  }, identitySourceIds, [
    'Object-level trade/farm evidence explicitly identifies this named Arowana form as Scleropages formosus.',
    'Identity evidence is separated from biology authority; all Compatibility fields remain inherited from the already-reviewed S. formosus base authority.',
  ]),
  supported(speciesId, 'water', 'freshwater', [...identitySourceIds, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported(speciesId, 'temperature', { min: 22, max: 28 }, [...identitySourceIds, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported(speciesId, 'ph', { min: 5, max: 8 }, [...identitySourceIds, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported(speciesId, 'adult_size', { min: null, max: 90 }, [...identitySourceIds, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported(speciesId, 'tank_size', { liters: null, lengthCm: 200 }, [...identitySourceIds, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported(speciesId, 'social_behavior', { mode: 'variable', minimumGroupSize: null }, [...identitySourceIds, ...arowanaBaseSources], ['Inherited from reviewed S. formosus base authority.']),
  supported(speciesId, 'territoriality', { traits: ['territorial'] }, [...identitySourceIds, ...arowanaTerritorialitySources], ['Inherited from reviewed S. formosus territoriality authority.']),
  supported(speciesId, 'predation', { targets: ['small_fish'] }, [...identitySourceIds, ...arowanaBaseSources], ['Inherited from reviewed S. formosus predation authority.']),
];

export const identityCorrectionsPhase2_01FieldReviews: CatalogFieldReview[] = [
  ...goldCalvusReviews,
  ...arowanaBridge(
    'sp_0242',
    'Scleropages formosus var. Albino',
    'Albino / Albino Silver',
    [identityCorrectionsPhase2_01Sources.albinoArowanaKoNelayan.id],
  ),
  ...arowanaBridge(
    'sp_0408',
    'Scleropages formosus var. Gold Head',
    'Golden Head / Golden Crossback phenotype',
    [
      identityCorrectionsPhase2_01Sources.goldenHeadSunbeam.id,
      identityCorrectionsPhase2_01Sources.scleropagesColorGenomics.id,
    ],
  ),
];

export const identityCorrectionsPhase2_01VerifiedSourceIds = Object.values(identityCorrectionsPhase2_01Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0266', 'sp_0242', 'sp_0408']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0266: 'sp_0057',
  sp_0242: 'sp_0116',
  sp_0408: 'sp_0116',
} as const;
