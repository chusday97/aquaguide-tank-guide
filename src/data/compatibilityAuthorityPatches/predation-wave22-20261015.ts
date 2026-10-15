import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T22:55:00+08:00';

/**
 * Predation wave22 closes one one-field fast-lane gap with direct
 * exact-taxon evidence. General diet, peaceful temperament, or community
 * suitability alone are not accepted as negative fish-predation evidence.
 */
export const compatibilityPredationWave22Sources = {
  chrysipteraCyaneaFishBaseDiet: {
    id: 'fishbase-chrysiptera-cyanea-diet-wave22',
    title: 'Food and Feeding Habits Summary - Chrysiptera cyanea',
    publisher: 'FishBase',
    url: 'https://fishbase.se/TrophicEco/DietCompoSummary.php?dietcode=2494&genusname=Chrysiptera&speciesname=cyanea',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const cCyaneaDiet = compatibilityPredationWave22Sources.chrysipteraCyaneaFishBaseDiet.id;

export const compatibilityPredationWave22FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0187',
    field: 'predation',
    proposedValue: { targets: ['fish_fry'] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [cCyaneaDiet],
    conflictNotes: [
      'FishBase exact-taxon trophic data for Chrysiptera cyanea records fish eggs and fish larvae in juvenile/adult stomach contents.',
      'The reviewed authority is deliberately restricted to fish_fry. It is not widened to small juvenile or adult fish because the source does not support that broader prey scope.',
    ],
    reviewedAt,
  },
];

export const compatibilityPredationWave22VerifiedSourceIds = Object.values(
  compatibilityPredationWave22Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityPredationWave22ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0187',
    replacePredationTargets: ['fish_fry'],
    addCitationIds: [cCyaneaDiet],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityPredationWave22AuthorityPatch = {
  patchId: 'predation-evidence-wave22-20261015',
  speciesIds: ['sp_0187'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/predation-wave22-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
