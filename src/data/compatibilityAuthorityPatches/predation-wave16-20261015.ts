import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T17:20:00+09:00';

export const compatibilityPredationWave16Sources = {
  corydorasHastatusHusbandryProtocol: {
    id: 'jaalas-corydoras-hastatus-fry-predation-wave16',
    title: 'Comprehensive Husbandry Protocol for Corydoras Catfish and Many Other Amazonian Species',
    publisher: 'Journal of the American Association for Laboratory Animal Science',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11467888/',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
  gymnocorymbusTernetziTfh: {
    id: 'tfh-gymnocorymbus-ternetzi-fry-predation-wave16',
    title: 'Gymnocorymbus ternetzi',
    publisher: 'Tropical Fish Hobbyist Magazine',
    url: 'https://www.tfhmagazine.com/articles/freshwater/gymnocorymbus-ternetzi',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const cHastatus = compatibilityPredationWave16Sources.corydorasHastatusHusbandryProtocol.id;
const gTernetzi = compatibilityPredationWave16Sources.gymnocorymbusTernetziTfh.id;

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

export const compatibilityPredationWave16FieldReviews: CatalogFieldReview[] = [
  fryPredation(
    'sp_0052',
    [cHastatus],
    [
      'A 2024 peer-reviewed Corydoras husbandry protocol explicitly names Corydoras hastatus and states that this smaller species appears less likely to consume its own eggs and fry than larger Corydoras, with only a small number of fry surviving when eggs remain with adults.',
      'This is direct exact-taxon evidence of a non-zero egg/fry consumption risk. Authority is therefore scoped only to fish_fry; it is not widened to juvenile or adult small fish.',
      'The current compatibility model has no standalone fish-egg target, so egg predation is not synthesized into a new prey class.',
    ],
    'high',
  ),
  fryPredation(
    'sp_0151',
    [gTernetzi],
    [
      'Tropical Fish Hobbyist identifies Gymnocorymbus ternetzi and explicitly lists white skirt, blueberry, strawberry, and mixed berry tetra names, providing a direct bridge from the catalog color-morph object to the reviewed base species.',
      'The same husbandry reference states that parents are voracious predators on eggs and fry. Authority is deliberately scoped to fish_fry and does not infer predation on ordinary adult tankmates.',
      'The reference also explains that berry colors are produced from white-skirt fish, so the color-morph bridge is explicit rather than inferred from a generic species template.',
    ],
    'medium',
  ),
];

export const compatibilityPredationWave16VerifiedSourceIds = Object.values(
  compatibilityPredationWave16Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityPredationWave16ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0052',
    replacePredationTargets: ['fish_fry'],
    addCitationIds: [cHastatus],
    addRequiredFacts: [...allCoreFacts],
  },
  {
    speciesId: 'sp_0151',
    replacePredationTargets: ['fish_fry'],
    addCitationIds: [gTernetzi],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityPredationWave16AuthorityPatch = {
  patchId: 'predation-evidence-wave16-20261015',
  speciesIds: ['sp_0052', 'sp_0151'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/predation-wave16-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
