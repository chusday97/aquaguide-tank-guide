import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-16T16:25:00+08:00';
const seriouslyFishSourceId = 'seriouslyfish-thayeria-boehlkei-numeric-husbandry';

export const compatibilityEnvironmentDirectWave28Sources = {
  thayeriaBoehlkeiFishipedia: {
    id: 'fishipedia-thayeria-boehlkei-environment-wave28',
    title: 'Thayeria boehlkei freshwater environment and husbandry profile',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/thayeria-boehlkei',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const fishipediaSourceId = compatibilityEnvironmentDirectWave28Sources.thayeriaBoehlkeiFishipedia.id;

export const compatibilityEnvironmentDirectWave28FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0472',
    field: 'water',
    proposedValue: 'freshwater',
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [fishipediaSourceId],
    conflictNotes: [
      'Fishipedia exact-taxon Thayeria boehlkei introduction explicitly states that the species lives in freshwater (“poisson vivant en eau douce”). Snapshot SHA-256: c30eec8f5448a6f53d1d8ae12f29d72a8d1cc47c538dfcf98d6f22b567352ad0.',
    ],
    reviewedAt,
  },
  {
    speciesId: 'sp_0472',
    field: 'ph',
    proposedValue: { min: 6, max: 8 },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [seriouslyFishSourceId, fishipediaSourceId],
    conflictNotes: [
      'Seriously Fish gives pH 5.5–8.0 for exact Thayeria boehlkei (snapshot SHA-256 569d18d642e873b22a6277e95ca4f52b6519806f9cc0af260f7ba12e7ca83ca8). Fishipedia independently gives habitat pH 6–8 for the exact taxon (snapshot SHA-256 c30eec8f5448a6f53d1d8ae12f29d72a8d1cc47c538dfcf98d6f22b567352ad0). The conservative direct-source overlap is therefore pH 6–8; no midpoint or extrapolation is invented.',
    ],
    reviewedAt,
  },
];

export const compatibilityEnvironmentDirectWave28VerifiedSourceIds = Object.values(
  compatibilityEnvironmentDirectWave28Sources,
).map(item => item.id);

export const compatibilityEnvironmentDirectWave28ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [] as const;

export const compatibilityEnvironmentDirectWave28AuthorityPatch = {
  patchId: 'environment-direct-wave28-20261016',
  speciesIds: ['sp_0472'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/environment-direct-wave28-20261016.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 2,
  reusedEvidenceSourceCount: 1,
  newEvidenceSourceCount: 1,
} as const;
