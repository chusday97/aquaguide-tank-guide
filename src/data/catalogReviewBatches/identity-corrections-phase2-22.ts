import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-22T00:35:00+09:00';

export const identityCorrectionsPhase2_22Sources = {
  goldfishDomesticationPnas: {
    id: 'phase2-22-pnas-goldfish-domestication',
    title: 'The evolutionary origin and domestication history of goldfish (Carassius auratus)',
    publisher: 'Proceedings of the National Academy of Sciences',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7703540/',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  goldfishMonophylyBreeds: {
    id: 'phase2-22-aquaculture-goldfish-monophyly-breeds',
    title: 'Many branches, one root: First evidence for a monophyly of the morphologically highly diverse goldfish (Carassius auratus)',
    publisher: 'Aquaculture',
    url: 'https://www.sciencedirect.com/science/article/pii/S0044848610000918',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  blackMoorAquaculture: {
    id: 'phase2-22-aquaculture-black-moor-variant',
    title: 'Comparative study on the gamete quality, artificial propagation and larval development of common goldfish, shubunkin, black moor, and oranda variants of goldfish (Carassius auratus)',
    publisher: 'Aquaculture',
    url: 'https://www.sciencedirect.com/science/article/pii/S0044848623012760',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  dalianTigerheadButterfly: {
    id: 'phase2-22-dalian-red-white-tigerhead-butterfly',
    title: 'Comparison of pigmentation and morphology in goldfish with tiger-type head or butterfly-type tail and their hybrids',
    publisher: 'Journal of Dalian Ocean University',
    url: 'https://xuebao.dlou.edu.cn/article/2011/2095-1388/201103004.html',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const identityReview = (
  speciesId: string,
  variantKey: string,
  citationIds: string[],
  conflictNotes: string[],
): CatalogFieldReview => ({
  speciesId,
  field: 'identity',
  proposedValue: {
    scientificName: 'Carassius auratus',
    baseSpeciesKey: 'Carassius auratus',
    variantKey,
  },
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const identityCorrectionsPhase2_22FieldReviews: CatalogFieldReview[] = [
  identityReview(
    'sp_0063',
    'Ranchu',
    [identityCorrectionsPhase2_22Sources.goldfishDomesticationPnas.id],
    [
      'The PNAS goldfish domestication study treats Chinese Ranchu as a genetically resolved subgroup within domesticated goldfish (Carassius auratus), providing direct reviewed support for the catalog Ranchu identity.',
      'This resolves identity only. Ranchu is morphology-changing, so no Compatibility husbandry, size, space, behavior, territoriality or predation fact is inherited automatically.',
    ],
  ),
  identityReview(
    'sp_0149',
    'Panda',
    [identityCorrectionsPhase2_22Sources.goldfishMonophylyBreeds.id],
    [
      'The Aquaculture phylogeny explicitly includes Panda among common goldfish breeds sampled inside the Carassius auratus goldfish lineage, supporting the catalog Panda identity as a selectively bred goldfish form.',
      'The evidence does not establish that Panda coloration alone leaves every Compatibility field unchanged. Identity is resolved while all field inheritance remains blocked pending field-specific review.',
    ],
  ),
  identityReview(
    'sp_0180',
    'Telescope',
    [identityCorrectionsPhase2_22Sources.goldfishDomesticationPnas.id],
    [
      'The PNAS population-genomics study resolves Telescope-eye fish as a distinct subgroup within domesticated goldfish (Carassius auratus), supporting the catalog Telescope identity.',
      'Telescope eye/body morphology is biologically relevant to care and space assumptions, so identity resolution grants no automatic Compatibility field inheritance.',
    ],
  ),
  identityReview(
    'sp_0348',
    'Tigerhead',
    [identityCorrectionsPhase2_22Sources.dalianTigerheadButterfly.id],
    [
      'The peer-reviewed Dalian Ocean University study explicitly uses red-white tiger-head goldfish as Carassius auratus var. broodstock, directly supporting the exact red-white Tigerhead catalog identity.',
      'The head/body phenotype is morphology-changing. This review establishes taxon/variant identity only and intentionally leaves every Compatibility field blocked.',
    ],
  ),
  identityReview(
    'sp_0351',
    'Butterfly Tail',
    [identityCorrectionsPhase2_22Sources.dalianTigerheadButterfly.id],
    [
      'The peer-reviewed Dalian Ocean University study explicitly uses red-white butterfly-tail goldfish as Carassius auratus var. broodstock, directly supporting the exact red-white Butterfly Tail catalog identity.',
      'The fin phenotype is morphology-changing. This review establishes taxon/variant identity only and does not reuse the separate sp_0065 field evidence or grant any field automatically.',
    ],
  ),
  identityReview(
    'sp_0386',
    'Black Moor',
    [identityCorrectionsPhase2_22Sources.blackMoorAquaculture.id],
    [
      'The 2024 Aquaculture study explicitly describes black moor as one of the compared variants of goldfish (Carassius auratus), supporting the catalog Black Moor identity.',
      'Black Moor has morphology-sensitive eye/body traits. Identity is resolved while all Compatibility fields remain exact-object or separately reviewed field-policy requirements.',
    ],
  ),
];

export const identityCorrectionsPhase2_22VerifiedSourceIds = Object.values(identityCorrectionsPhase2_22Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set([
  'sp_0063',
  'sp_0149',
  'sp_0180',
  'sp_0348',
  'sp_0351',
  'sp_0386',
]);

// These morphology/trade forms use the reviewed field-scoped policy registry.
// No full-inheritance explicit base override is allowed.
export const catalogIdentityCorrectionBaseSpeciesIds = {} as const;
