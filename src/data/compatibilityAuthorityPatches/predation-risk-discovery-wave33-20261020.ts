import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';
import { compatibilityNumericWave3Sources } from './numeric-wave3-20261015';

const reviewedAt = '2026-10-20T23:33:00+08:00';
const pseudomugilFurcatusSource = compatibilityNumericWave3Sources.pseudomugilFurcatus.id;

export const compatibilityPredationRiskDiscoveryWave33FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0135',
    field: 'predation',
    proposedValue: { targets: ['fish_fry'] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [pseudomugilFurcatusSource],
    conflictNotes: [
      'Seriously Fish exact-taxon Pseudomugil furcatus reproduction guidance states that this egg-scattering species provides no parental care and that adults will consume their own eggs and fry when given the opportunity.',
      'The current Compatibility prey vocabulary has no standalone fish-egg or conspecific-fry target. Authority is therefore restricted to the existing fish_fry life-stage risk and is not widened to juvenile or adult small fish.',
      'The source statement is explicit rather than inferred from body size, diet category, or generic community temperament, so this closes only the predation risk-discovery field while the independent social-behavior and territoriality evidence ceilings remain fail-closed.',
    ],
    reviewedAt,
  },
];

export const compatibilityPredationRiskDiscoveryWave33VerifiedSourceIds = [
  pseudomugilFurcatusSource,
] as const;

export const compatibilityPredationRiskDiscoveryWave33ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [];

export const compatibilityPredationRiskDiscoveryWave33AuthorityPatch = {
  patchId: 'predation-risk-discovery-wave33-20261020',
  speciesIds: ['sp_0135'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/predation-risk-discovery-wave33-20261020.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 1,
  reusesReviewedSourceIds: [pseudomugilFurcatusSource],
} as const;
