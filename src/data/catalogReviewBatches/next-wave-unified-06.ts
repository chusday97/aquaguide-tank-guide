import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-12T12:10:00+08:00';
const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  sourceType: CatalogEvidenceSource['sourceType'],
): CatalogEvidenceSource => ({ id, title, publisher, url, sourceType, reviewStatus: 'reviewed' });

export const nextWaveUnified06Sources = {
  scleropagesSuperRedPeerReviewed: source(
    'wave06-peer-reviewed-scleropages-formosus-super-red',
    'Cytogenetics Meets Genomics: Cytotaxonomy and Genomic Relationships among Color Variants of the Asian Arowana Scleropages formosus',
    'International Journal of Molecular Sciences',
    'https://pubmed.ncbi.nlm.nih.gov/37240350/',
    'peer_reviewed',
  ),
} satisfies Record<string, CatalogEvidenceSource>;

export const nextWaveUnified06ProfileIds = ['sp_0283'] as const;

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

const S = nextWaveUnified06Sources;
const bridgeIds = [
  S.scleropagesSuperRedPeerReviewed.id,
  'batch19-fishbase-scleropages-formosus',
  'seriouslyfish-scleropages-formosus',
];

export const nextWaveUnified06FieldReviews: CatalogFieldReview[] = [
  supported(
    'sp_0283',
    'identity',
    { scientificName: 'Scleropages formosus var. Super Red', baseSpeciesKey: 'Scleropages formosus', variantKey: 'super_red' },
    [S.scleropagesSuperRedPeerReviewed.id],
    ['Peer-reviewed cytogenetic work explicitly identifies Super Red as the red phenotype of the naturally occurring Scleropages formosus color varieties.'],
  ),
  supported('sp_0283', 'water', 'freshwater', bridgeIds),
  supported('sp_0283', 'temperature', { min: 22, max: 28 }, bridgeIds),
  supported('sp_0283', 'ph', { min: 5, max: 8 }, bridgeIds),
  supported('sp_0283', 'adult_size', { min: null, max: 90 }, bridgeIds),
  unknown('sp_0283', 'tank_size', 'No new numeric tank minimum is invented for the Super Red phenotype.', bridgeIds),
  supported(
    'sp_0283',
    'social_behavior',
    { mode: 'variable', minimumGroupSize: null },
    bridgeIds,
    ['The phenotype identity is reviewed; social authority is inherited only from the already-reviewed Scleropages formosus base profile.'],
  ),
  unknown('sp_0283', 'territoriality', 'No phenotype-specific territoriality rule is established.', bridgeIds),
  supported(
    'sp_0283',
    'predation',
    { targets: ['small_fish'] },
    bridgeIds,
    ['The phenotype identity is reviewed; predation boundary is inherited only from the already-reviewed Scleropages formosus base profile.'],
  ),
  unknown('sp_0283', 'breeding_behavior', 'No phenotype-specific breeding rule is promoted.', bridgeIds),
];

export const nextWaveUnified06VerifiedSourceIds = new Set(
  Object.values(nextWaveUnified06Sources).map(item => item.id),
);
