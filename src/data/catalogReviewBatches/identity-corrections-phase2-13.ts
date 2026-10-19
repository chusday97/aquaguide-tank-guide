import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-19T15:07:00+08:00';

export const identityCorrectionsPhase2_13Sources = {
  seriouslyFishGoldenCobra: {
    id: 'phase2-13-seriouslyfish-channa-aurantimaculata-golden-cobra',
    title: 'Channa aurantimaculata — Golden cobra snakehead trade name',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/channa-aurantimaculata',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  practicalFishkeepingGoldenCobra: {
    id: 'phase2-13-practical-fishkeeping-golden-cobra',
    title: 'Quick guide to snakeheads — Golden cobra snakehead',
    publisher: 'Practical Fishkeeping',
    url: 'https://www.practicalfishkeeping.co.uk/features/quick-guide-to-snakeheads/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  ufcGuppyGrassLines: {
    id: 'phase2-13-ufc-guppy-grass-lines',
    title: 'Freshwater ornamental guppy pure-line production list',
    publisher: 'Universidade Federal do Ceará',
    url: 'https://repositorio.ufc.br/bitstream/riufc/48036/3/2018_tcc_csmf.pdf',
    sourceType: 'university',
    reviewStatus: 'reviewed',
  },
  gfiRedGrassGuppy: {
    id: 'phase2-13-gfi-red-grass-guppy',
    title: 'Exploratory behaviour of different guppy breeds (Poecilia reticulata)',
    publisher: 'Gesellschaft für Ichthyologie',
    url: 'https://www.ichthyologie.de/wp-content/uploads/2025/11/Tagungsheft-2013-GfI-Tagung-Bonn.pdf',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
  masBlueGrassGuppy: {
    id: 'phase2-13-mas-blue-grass-guppy',
    title: 'BAP Report — Poecilia reticulata Blue Grass Metal Head Guppy',
    publisher: 'Missouri Aquarium Society',
    url: 'https://missouriaquariumsociety.com/TheDarter/Darter/2005/Darter%202005%2011.pdf',
    sourceType: 'professional_association',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identityReview = (
  speciesId: string,
  scientificName: string,
  variantKey: string | null,
  citationIds: string[],
  conflictNotes: string[],
): CatalogFieldReview => ({
  speciesId,
  field: 'identity',
  proposedValue: {
    scientificName,
    baseSpeciesKey: scientificName,
    variantKey,
  },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsPhase2_13FieldReviews: CatalogFieldReview[] = [
  identityReview(
    'sp_0216',
    'Channa aurantimaculata',
    null,
    [
      identityCorrectionsPhase2_13Sources.seriouslyFishGoldenCobra.id,
      identityCorrectionsPhase2_13Sources.practicalFishkeepingGoldenCobra.id,
    ],
    [
      'Seriously Fish states that Channa aurantimaculata is also traded as Golden Cobra Snakehead, and Practical Fishkeeping independently maps Golden cobra snakehead directly to Channa aurantimaculata.',
      'The catalog label 黄金雷龙 is therefore resolved as a same-taxon trade/common-name alias, not as evidence for an ornamental Gold variant. The legacy blank “var.” suffix is removed rather than converted into a fabricated variantKey.',
    ],
  ),
  identityReview(
    'sp_0143',
    'Poecilia reticulata',
    'Red Grass',
    [
      identityCorrectionsPhase2_13Sources.ufcGuppyGrassLines.id,
      identityCorrectionsPhase2_13Sources.gfiRedGrassGuppy.id,
    ],
    [
      'Universidade Federal do Ceará lists Guppy red grass under Poecilia reticulata, while Gesellschaft für Ichthyologie discusses Red Grass among Poecilia reticulata guppy breeds.',
      'This closes strain identity only. Reviewed guppy-breed research itself documents breed-level behavioural differences, so no Compatibility field is inherited automatically from generic Poecilia reticulata in this batch.',
    ],
  ),
  identityReview(
    'sp_0144',
    'Poecilia reticulata',
    'Blue Grass',
    [
      identityCorrectionsPhase2_13Sources.ufcGuppyGrassLines.id,
      identityCorrectionsPhase2_13Sources.masBlueGrassGuppy.id,
    ],
    [
      'Universidade Federal do Ceará lists Guppy blue grass under Poecilia reticulata, and Missouri Aquarium Society independently records a Poecilia reticulata Blue Grass guppy breeding line.',
      'This closes strain identity only. No aquarium husbandry, space, social, territoriality or predation fact is inherited merely from the formal taxon.',
    ],
  ),
];

export const identityCorrectionsPhase2_13VerifiedSourceIds = Object.values(identityCorrectionsPhase2_13Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  'sp_0143',
  'sp_0144',
  'sp_0216',
]);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0216: 'sp_0109',
} as const;
