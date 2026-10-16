import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-16T13:56:00+08:00';

/**
 * Wave24 records direct exact-taxon piscivory without inventing a prey-size
 * threshold. `fish_unspecified_size` is intentionally a caution-only scope in
 * Domain: it confirms fish prey while preserving uncertainty about which sizes
 * are at risk. It must not be widened to `small_fish` or conspecific predation.
 */
export const compatibilityPredationWave24Sources = {
  pomacanthusAnnularisAdw: {
    id: 'adw-pomacanthus-annularis-predation-wave24',
    title: 'Pomacanthus annularis account',
    publisher: 'Animal Diversity Web, University of Michigan',
    url: 'https://animaldiversity.org/accounts/Pomacanthus_annularis',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const adw = compatibilityPredationWave24Sources.pomacanthusAnnularisAdw.id;

export const compatibilityPredationWave24FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0185',
    field: 'predation',
    proposedValue: { targets: ['fish_unspecified_size'] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [adw],
    conflictNotes: [
      'The cached verified exact-taxon Animal Diversity Web account states that Pomacanthus annularis eats nektonic fishes and classifies it as piscivorous.',
      'The source does not define prey-fish size. Authority therefore records fish_unspecified_size only; it is not widened to small_fish, fish_fry, same-size fish, or conspecific predation.',
      'Verified cached source snapshot SHA-256: 02c71aba4a34e748d9904d12bcabd9264d1743b8898f10bc6ee4b0cbb9482606.',
    ],
    reviewedAt,
  },
];

export const compatibilityPredationWave24VerifiedSourceIds = Object.values(
  compatibilityPredationWave24Sources,
).map(item => item.id);

export const compatibilityPredationWave24ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0185',
    replacePredationTargets: ['fish_unspecified_size'],
    addCitationIds: [adw],
    addRequiredFacts: ['predation'],
  },
] as const;

export const compatibilityPredationWave24AuthorityPatch = {
  patchId: 'predation-evidence-wave24-20261016',
  speciesIds: ['sp_0185'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/predation-wave24-20261016.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 1,
} as const;
