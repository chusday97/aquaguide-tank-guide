import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

export const compatibilityNumericWave13Sources = {
  pseudorasboraParvaDietStudy: {
    id: 'wiley-pseudorasbora-parva-fry-predation-wave13',
    title: 'Population structure and dietary plasticity of four invasive populations of the topmouth gudgeon Pseudorasbora parva',
    publisher: 'International Review of Hydrobiology',
    url: 'https://doi.org/10.1002/iroh.202302142',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const sourceId = compatibilityNumericWave13Sources.pseudorasboraParvaDietStudy.id;

export const compatibilityNumericWave13FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0042',
    field: 'predation',
    proposedValue: { targets: ['fish_fry'] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [sourceId],
    conflictNotes: [
      'The peer-reviewed exact-species diet study detected fish eggs and fry in Pseudorasbora parva digestive tracts and cites prior records of predation on native fish eggs and larvae in Germany and China.',
      'The study characterizes these vertebrate prey as opportunistic/marginal in the sampled populations, so authority is deliberately scoped to fish fry. It is not widened to juvenile or adult small fish.',
      'Fish eggs are also documented prey, but the current compatibility life-stage model has no standalone egg entity; no synthetic egg target is invented.',
    ],
    reviewedAt,
  },
];

export const compatibilityNumericWave13VerifiedSourceIds = Object.values(
  compatibilityNumericWave13Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityNumericWave13ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0042',
    replacePredationTargets: ['fish_fry'],
    addCitationIds: [sourceId],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityNumericWave13AuthorityPatch = {
  patchId: 'numeric-evidence-wave13-20261015',
  speciesIds: ['sp_0042'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave13-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
