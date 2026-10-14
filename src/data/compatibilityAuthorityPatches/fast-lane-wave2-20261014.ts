import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-14T14:15:00+08:00';

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

export const compatibilityFastLaneWave2Sources = {
  piaractusAnimalDiversity: source(
    'animaldiversity-piaractus-brachypomus',
    'Piaractus brachypomus (Cachama) behavior and natural history',
    'Animal Diversity Web, University of Michigan',
    'https://animaldiversity.org/accounts/Piaractus_brachypomus/',
    'university',
  ),
  badisSeriouslyFish: source(
    'seriouslyfish-badis-badis',
    'Badis badis (Badis)',
    'Seriously Fish',
    'https://www.seriouslyfish.com/species/badis-badis',
    'curated_husbandry',
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

export const compatibilityFastLaneWave2FieldReviews: CatalogFieldReview[] = [
  supported(
    'sp_0139',
    'territoriality',
    { traits: ['territorial', 'age_increasing_territoriality'] },
    [compatibilityFastLaneWave2Sources.piaractusAnimalDiversity.id],
    ['Animal Diversity Web explicitly classifies the species as territorial and reports aquarium observations in which aggression and territoriality increase with age; juvenile shoaling is retained as a separate life-stage/social fact.'],
  ),
  supported(
    'sp_0199',
    'predation',
    { targets: ['very_small_fish'] },
    [compatibilityFastLaneWave2Sources.badisSeriouslyFish.id],
    ['Seriously Fish states that once fry become free-swimming the adults, including the parent male, may begin to regard them as food. The scope is deliberately limited to very_small_fish/fry and is not widened to the coarse small_fish class.'],
  ),
];

export const compatibilityFastLaneWave2VerifiedSourceIds = Object.values(compatibilityFastLaneWave2Sources).map(item => item.id);

export const compatibilityFastLaneWave2ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0139',
    addBehaviorTraits: ['territorial', 'age_increasing_territoriality'],
    replacePredationTargets: ['small_fish'],
    addCitationIds: [compatibilityFastLaneWave2Sources.piaractusAnimalDiversity.id],
    addRequiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
  {
    speciesId: 'sp_0199',
    replacePredationTargets: ['very_small_fish'],
    addCitationIds: [compatibilityFastLaneWave2Sources.badisSeriouslyFish.id],
    addRequiredFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'],
  },
] as const;

export const compatibilityFastLaneWave2AuthorityPatch = {
  patchId: 'fast-lane-evidence-wave2-20261014',
  speciesIds: ['sp_0139', 'sp_0199'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/fast-lane-wave2-20261014.ts',
  migrationOwner: 'supabase/migrations/20261014143000_compatibility_fast_lane_wave2_authority_patch.sql',
} as const;
