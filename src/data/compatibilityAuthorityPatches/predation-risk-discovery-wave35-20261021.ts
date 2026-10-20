import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';
import { compatibilityNumericWave3Sources } from './numeric-wave3-20261015';

const reviewedAt = '2026-10-21T00:22:00+08:00';
const sphaerichthysOsphromenoidesSource = compatibilityNumericWave3Sources.sphaerichthysOsphromenoides.id;

export const compatibilityPredationRiskDiscoveryWave35Sources = {
  hyphessobryconMegalopterusAquaticCommunity: {
    id: 'aquaticcommunity-hyphessobrycon-megalopterus-fry-predation-wave35',
    title: 'Black phantom tetra - Hyphessobrycon megalopterus',
    publisher: 'Aquatic Community',
    url: 'https://www.aquaticcommunity.com/tetrafish/blackphantomtetra.php',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  hyphessobryconHerbertaxelrodiAquariumIndustries: {
    id: 'aquariumindustries-hyphessobrycon-herbertaxelrodi-fry-predation-wave35',
    title: 'Black Neon Tetra',
    publisher: 'Aquarium Industries',
    url: 'https://www.aquariumindustries.com.au/product/black-neon-tetra/',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  pterapogonKauderniNoaaProduction: {
    id: 'noaa-pterapogon-kauderni-guppy-fry-predation-wave35',
    title: 'Production of the Banggai Cardinalfish, Pterapogon kauderni, in Hawai‘i',
    publisher: 'NOAA Central Library Repository',
    url: 'https://repository.library.noaa.gov/view/noaa/41164/noaa_41164_DS1.pdf',
    sourceType: 'government',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const hMegalopterus = compatibilityPredationRiskDiscoveryWave35Sources.hyphessobryconMegalopterusAquaticCommunity.id;
const hHerbertaxelrodi = compatibilityPredationRiskDiscoveryWave35Sources.hyphessobryconHerbertaxelrodiAquariumIndustries.id;
const pKauderni = compatibilityPredationRiskDiscoveryWave35Sources.pterapogonKauderniNoaaProduction.id;

const fryPredation = (
  speciesId: string,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'medium',
): CatalogFieldReview => ({
  speciesId,
  field: 'predation',
  proposedValue: { targets: ['fish_fry'] },
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const compatibilityPredationRiskDiscoveryWave35FieldReviews: CatalogFieldReview[] = [
  fryPredation(
    'sp_0467',
    [hMegalopterus],
    [
      'Aquatic Community exact-taxon Hyphessobrycon megalopterus breeding guidance explicitly states that adults will eat eggs and fry if given the opportunity.',
      'Authority is scoped only to fish_fry because the current Compatibility prey vocabulary has no fish-egg target and the evidence does not establish predation on ordinary juvenile or adult small fish.',
    ],
  ),
  fryPredation(
    'sp_0470',
    [hHerbertaxelrodi],
    [
      'Aquarium Industries exact-taxon Hyphessobrycon herbertaxelrodi breeding guidance explicitly instructs removal of parents because adults will eat eggs and fry.',
      'The reviewed target is limited to fish_fry and does not inherit to unresolved commercial variants or widen to ordinary adult small-fish predation.',
    ],
  ),
  fryPredation(
    'sp_0025',
    [pKauderni],
    [
      'A NOAA-hosted Pterapogon kauderni production reference explicitly reports Banggai broodstock and large juveniles being fed guppy fry and states that a large adult consumes about ten fry per day.',
      'This is direct heterospecific fish-fry predation evidence. Authority is intentionally limited to fish_fry and is not widened from 5-12 mm feeder fry to ordinary adult small fish.',
    ],
    'high',
  ),
  fryPredation(
    'sp_0060',
    [sphaerichthysOsphromenoidesSource],
    [
      'Seriously Fish exact-taxon Sphaerichthys osphromenoides breeding guidance recommends separating the brooding female or removing released fry to minimise the chances of fry predation.',
      'The statement establishes a non-zero fry-predation risk but does not support predation on ordinary juvenile or adult small fish, so authority remains restricted to fish_fry.',
    ],
    'high',
  ),
  fryPredation(
    'sp_0136',
    [sphaerichthysOsphromenoidesSource],
    [
      'The duplicate catalog object resolves to the same exact taxon Sphaerichthys osphromenoides and reuses the same reviewed Seriously Fish breeding evidence that warns of fry predation after release.',
      'Authority remains field-scoped to fish_fry only; no additional taxon or variant inheritance is introduced.',
    ],
    'high',
  ),
];

export const compatibilityPredationRiskDiscoveryWave35VerifiedSourceIds = [
  hMegalopterus,
  hHerbertaxelrodi,
  pKauderni,
  sphaerichthysOsphromenoidesSource,
] as const;

export const compatibilityPredationRiskDiscoveryWave35ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [];

export const compatibilityPredationRiskDiscoveryWave35AuthorityPatch = {
  patchId: 'predation-risk-discovery-wave35-20261021',
  speciesIds: ['sp_0467', 'sp_0470', 'sp_0025', 'sp_0060', 'sp_0136'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/predation-risk-discovery-wave35-20261021.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
  exactTaxonOnly: true,
  promotedFieldCount: 5,
  newEvidenceSourceCount: 3,
  reusesReviewedSourceIds: [sphaerichthysOsphromenoidesSource],
} as const;
