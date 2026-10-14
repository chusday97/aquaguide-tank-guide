import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CompatibilityRequiredFact } from '../../../packages/domain-rules/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-14T13:35:00+08:00';

const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  sourceType: CatalogEvidenceSource['sourceType'],
): CatalogEvidenceSource => ({
  id,
  title,
  publisher,
  url,
  sourceType,
  reviewStatus: 'reviewed',
});

export const compatibilityFastLanePatchSources = {
  discusFishBase: source(
    'fishbase-symphysodon-aequifasciatus',
    'Symphysodon aequifasciatus species summary',
    'FishBase',
    'https://www.fishbase.se/summary/11185',
    'curated_husbandry',
  ),
  oscarFishBase: source(
    'batch03-fishbase-astronotus-ocellatus',
    'Astronotus ocellatus species summary',
    'FishBase',
    'https://www.fishbase.se/summary/Astronotus-ocellatus.html',
    'curated_husbandry',
  ),
  oscarAnimalDiversity: source(
    'animaldiversity-astronotus-ocellatus-behavior',
    'Astronotus ocellatus behavior and reproduction',
    'Animal Diversity Web, University of Michigan',
    'https://animaldiversity.org/accounts/Astronotus_ocellatus/',
    'university',
  ),
  channaStewartiiCifa: source(
    'icar-cifa-channa-stewartii-live-fish',
    'ICAR-CIFA Annual Report 2019: stock development of indigenous ornamental Channa species',
    'ICAR-Central Institute of Freshwater Aquaculture',
    'https://cifa.nic.in/sites/default/files/Report_2019.pdf',
    'government',
  ),
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[] = [],
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'high',
  citationIds,
  conflictNotes,
  reviewedAt,
});

/**
 * Additive field authority for already-released species.
 * Historical release batches remain immutable; later patch reviews supersede
 * older field records only when the patch sources are content-verified.
 */
export const compatibilityFastLanePatchFieldReviews: CatalogFieldReview[] = [
  supported('sp_0447', 'water', 'freshwater', [compatibilityFastLanePatchSources.discusFishBase.id]),
  supported('sp_0447', 'temperature', { min: 26, max: 30 }, [compatibilityFastLanePatchSources.discusFishBase.id]),
  supported('sp_0447', 'ph', { min: 4.5, max: 7 }, [compatibilityFastLanePatchSources.discusFishBase.id]),
  supported('sp_0447', 'adult_size', { min: 13, max: 15 }, [compatibilityFastLanePatchSources.discusFishBase.id]),
  supported(
    'sp_0447',
    'territoriality',
    { traits: ['breeding_territoriality'] },
    [compatibilityFastLanePatchSources.discusFishBase.id],
    ['FishBase describes this species as normally schooling but territorial during breeding; permanent non-breeding territoriality is not inferred.'],
  ),
  supported(
    'sp_0451',
    'territoriality',
    { traits: ['territorial', 'territory_defense'] },
    [compatibilityFastLanePatchSources.oscarAnimalDiversity.id],
    ['Animal Diversity Web documents territory defense and territorial disputes; this patch does not widen the existing small-fish predation scope.'],
  ),
  supported(
    'sp_0197',
    'predation',
    { targets: [] },
    [compatibilityFastLanePatchSources.channaStewartiiCifa.id],
    ['ICAR-CIFA captive broodstock observations report that small live fishes in the tank were ignored rather than preyed upon; intraspecific aggression remains modeled separately.'],
  ),
];

export const compatibilityFastLanePatchVerifiedSourceIds = Object.values(compatibilityFastLanePatchSources).map(item => item.id);

export type CompatibilityProfileAuthorityPatch = {
  speciesId: string;
  addBehaviorTraits?: string[];
  replacePredationTargets?: string[];
  addCitationIds: string[];
  addRequiredFacts: CompatibilityRequiredFact[];
};

export const compatibilityFastLaneProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0197',
    replacePredationTargets: [],
    addCitationIds: [compatibilityFastLanePatchSources.channaStewartiiCifa.id],
    addRequiredFacts: ['predation'],
  },
  {
    speciesId: 'sp_0447',
    addBehaviorTraits: ['breeding_territoriality'],
    addCitationIds: [compatibilityFastLanePatchSources.discusFishBase.id],
    addRequiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
  {
    speciesId: 'sp_0451',
    addBehaviorTraits: ['territorial', 'territory_defense'],
    addCitationIds: [
      compatibilityFastLanePatchSources.oscarFishBase.id,
      compatibilityFastLanePatchSources.oscarAnimalDiversity.id,
    ],
    addRequiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
] as const;

export const compatibilityFastLaneAuthorityPatch = {
  patchId: 'fast-lane-evidence-20261014',
  speciesIds: ['sp_0197', 'sp_0447', 'sp_0451'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/fast-lane-20261014.ts',
  migrationOwner: 'supabase/migrations/20261014133500_compatibility_fast_lane_authority_patch.sql',
} as const;
