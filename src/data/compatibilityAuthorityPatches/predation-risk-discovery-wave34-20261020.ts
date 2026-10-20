import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';
import { compatibilityNumericWave2Sources } from './numeric-wave2-20261015';
import { compatibilityWaterDirectWave29Sources } from './water-direct-wave29-20261016';

const reviewedAt = '2026-10-20T23:58:00+08:00';

const epiplatysAnnulatusSource = compatibilityNumericWave2Sources.epiplatysAnnulatus.id;
const nannostomusBeckfordiSource = compatibilityWaterDirectWave29Sources.nannostomusBeckfordiSeriouslyFish.id;

export const compatibilityPredationRiskDiscoveryWave34Sources = {
  iriatherinaWerneriSeriouslyFish: {
    id: 'seriouslyfish-iriatherina-werneri-predation-wave34',
    title: 'Iriatherina werneri (Threadfin Rainbowfish)',
    publisher: 'Seriously Fish',
    url: 'https://www.seriouslyfish.com/species/iriatherina-werneri',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const iriatherinaWerneriSource = compatibilityPredationRiskDiscoveryWave34Sources.iriatherinaWerneriSeriouslyFish.id;

export const compatibilityPredationRiskDiscoveryWave34FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0113',
    field: 'predation',
    proposedValue: { targets: [] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [epiplatysAnnulatusSource],
    conflictNotes: [
      'Seriously Fish exact-taxon Epiplatys annulatus breeding guidance explicitly states that adults apparently do not predate their offspring. This is direct negative adult-to-fry evidence rather than an inference from the species being peaceful or from its invertebrate-focused diet.',
      'The same source separately states that older fry eat younger fry. That ontogenetic sibling interaction is deliberately not projected onto the adult species profile, so the reviewed adult predation target set remains empty.',
      'The claim is bounded to the current fish/fry prey vocabulary and does not assert absence of invertebrate predation or all forms of aggression.',
    ],
    reviewedAt,
  },
  {
    speciesId: 'sp_0473',
    field: 'predation',
    proposedValue: { targets: ['fish_fry'] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [nannostomusBeckfordiSource],
    conflictNotes: [
      'Seriously Fish exact-taxon Nannostomus beckfordi community guidance states that it does not often predate fry. The wording establishes a low-frequency but non-zero fry-predation risk, so authority must not be collapsed to an empty target set.',
      'The same page describes the natural diet as tiny invertebrates and zooplankton and recommends similarly sized peaceful tankmates. Authority is therefore restricted to fish_fry and is not widened to ordinary juvenile or adult small fish.',
    ],
    reviewedAt,
  },
  {
    speciesId: 'sp_0134',
    field: 'predation',
    proposedValue: { targets: ['fish_fry'] },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [iriatherinaWerneriSource],
    conflictNotes: [
      'Seriously Fish exact-taxon Iriatherina werneri reproduction guidance explicitly states that this egg-scattering species exhibits no parental care and will consume its own eggs and fry given the opportunity.',
      'The current Compatibility prey vocabulary has no standalone fish-egg target. Authority is therefore scoped only to fish_fry and is not widened to juvenile or adult small fish.',
    ],
    reviewedAt,
  },
];

export const compatibilityPredationRiskDiscoveryWave34VerifiedSourceIds = [
  epiplatysAnnulatusSource,
  nannostomusBeckfordiSource,
  iriatherinaWerneriSource,
] as const;

export const compatibilityPredationRiskDiscoveryWave34ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [];

export const compatibilityPredationRiskDiscoveryWave34AuthorityPatch = {
  patchId: 'predation-risk-discovery-wave34-20261020',
  speciesIds: ['sp_0113', 'sp_0473', 'sp_0134'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/predation-risk-discovery-wave34-20261020.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 3,
  newEvidenceSourceCount: 1,
} as const;
