import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-20T23:20:00+08:00';

export const compatibilityPredationRiskDiscoveryWave32Sources = {
  erpetoichthysCalabaricusAdw: {
    id: 'adw-erpetoichthys-calabaricus-predation-wave32',
    title: 'Erpetoichthys calabaricus account',
    publisher: 'Animal Diversity Web, University of Michigan',
    url: 'https://animaldiversity.org/accounts/Erpetoichthys_calabaricus/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  kryptopterusVitreolusSeriouslyFish: {
    id: 'seriouslyfish-kryptopterus-vitreolus-predation-wave32',
    title: 'Kryptopterus vitreolus (Glass Catfish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/kryptopterus-vitreolus',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const reedfishAdw = compatibilityPredationRiskDiscoveryWave32Sources.erpetoichthysCalabaricusAdw.id;
const glassCatfishSf = compatibilityPredationRiskDiscoveryWave32Sources.kryptopterusVitreolusSeriouslyFish.id;

export const compatibilityPredationRiskDiscoveryWave32FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0106',
    field: 'predation',
    proposedValue: { targets: ['small_fish'] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [reedfishAdw],
    conflictNotes: [
      'Animal Diversity Web exact-taxon Erpetoichthys calabaricus account states that the species feeds mainly on small crustaceans, insects, and small fish and describes electroreceptive detection of cues from small fish during prey capture.',
      'Authority is deliberately scoped to small_fish. It is not widened to all fish, same-size fish, conspecifics, eggs, or fry because those broader prey scopes are not directly established by this source.',
      'FishBase reports worms, crustaceans and insects in the recorded diet, while Seriously Fish separately warns against tankmates that can fit in the reedfish mouth. These sources are consistent with a size-bounded predation risk and do not justify a broader fish_unspecified_size target.',
    ],
    reviewedAt,
  },
  {
    speciesId: 'sp_0458',
    field: 'predation',
    proposedValue: { targets: ['fish_fry'] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [glassCatfishSf],
    conflictNotes: [
      'Seriously Fish exact-taxon Kryptopterus vitreolus husbandry guidance states that this otherwise peaceful species may predate on eggs or fry.',
      'The current Compatibility prey vocabulary has no standalone fish-egg target. Authority is therefore scoped only to fish_fry and is not widened to ordinary small juvenile/adult fish.',
      'The wording is probabilistic ("may predate"), so confidence is medium even though the prey stage is explicit.',
    ],
    reviewedAt,
  },
];

export const compatibilityPredationRiskDiscoveryWave32VerifiedSourceIds = Object.values(
  compatibilityPredationRiskDiscoveryWave32Sources,
).map(item => item.id);

export const compatibilityPredationRiskDiscoveryWave32ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [];

export const compatibilityPredationRiskDiscoveryWave32AuthorityPatch = {
  patchId: 'predation-risk-discovery-wave32-20261020',
  speciesIds: ['sp_0106', 'sp_0458'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/predation-risk-discovery-wave32-20261020.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 2,
} as const;
