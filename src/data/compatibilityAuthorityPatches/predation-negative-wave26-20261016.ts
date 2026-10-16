import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-16T19:00:00+08:00';
const sourceId = 'seriouslyfish-xiphophorus-maculatus';

/**
 * Wave26 closes only the Xiphophorus maculatus predation gap from an explicit
 * exact-taxon statement that adult fish do not eat their young. It does not
 * infer no-predation authority from the page's peaceful/community labels.
 */
export const compatibilityPredationNegativeWave26Sources = {
  xiphophorusMaculatusSeriouslyFish: {
    id: sourceId,
    title: 'Xiphophorus maculatus (Platy)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/xiphophorus-maculatus',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

export const compatibilityPredationNegativeWave26FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0011',
    field: 'predation',
    proposedValue: { targets: [] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [sourceId],
    conflictNotes: [
      'Seriously Fish exact-taxon Xiphophorus maculatus reproduction guidance explicitly states that adult fish will not eat their young. This is direct negative fry-predation evidence; the empty prey target set is not inferred from peaceful/community suitability or general diet wording.',
      'The claim is intentionally bounded to reviewed fish/fry predation authority. It does not assert absence of harassment, competition, or all possible invertebrate feeding interactions.',
    ],
    reviewedAt,
  },
];

/** The source already exists in reviewed Species Knowledge; Wave26 verifies its content for this new field use. */
export const compatibilityPredationNegativeWave26VerifiedSourceIds = Object.values(compatibilityPredationNegativeWave26Sources).map(item => item.id);

export const compatibilityPredationNegativeWave26ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0011',
    replacePredationTargets: [],
    addCitationIds: [sourceId],
    addRequiredFacts: ['tank_size', 'territoriality', 'predation'],
  },
] as const;

export const compatibilityPredationNegativeWave26AuthorityPatch = {
  patchId: 'predation-negative-wave26-20261016',
  speciesIds: ['sp_0011'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/predation-negative-wave26-20261016.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 1,
  newEvidenceSourceCount: 0,
} as const;
