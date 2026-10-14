import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-14T19:30:00+09:00';

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

export const compatibilityFastLaneWave3Sources = {
  hemichromisTaiwanFishDb: source(
    'sinica-fishdb-hemichromis-bimaculatus-diet',
    'Hemichromis bimaculatus species ecology and diet',
    'Taiwan Fish Database, Academia Sinica',
    'https://fishdb.sinica.edu.tw/taxon/395635-fishdb',
    'university',
  ),
  cherryBarbFischwissen: source(
    'fischwissen-puntius-titteya-territoriality',
    'Bitterlingsbarbe (Puntius titteya) species profile',
    'Fachstelle Fischwissen / SWILD',
    'https://fischwissen.ch/de/artenportraits/bitterlingsbarbe-puntius-titteya',
    'curated_husbandry',
  ),
  arowanaMyFish: source(
    'myfish-scleropages-formosus-territoriality',
    'Scleropages formosus – Asiatischer Arowana',
    'my-fish / WZF',
    'https://my-fish.org/my-fishothek/scleropages-formosus-asiatischer-gabelbart/',
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

export const compatibilityFastLaneWave3FieldReviews: CatalogFieldReview[] = [
  supported(
    'sp_0054',
    'predation',
    { targets: ['small_fish'] },
    [compatibilityFastLaneWave3Sources.hemichromisTaiwanFishDb.id],
    ['Taiwan Fish Database explicitly states that Hemichromis bimaculatus mainly feeds on small fish and large invertebrates; this is direct prey-scope evidence rather than a carnivore/diet-label inference.'],
  ),
  supported(
    'sp_0012',
    'territoriality',
    { traits: ['breeding_territoriality'] },
    [compatibilityFastLaneWave3Sources.cherryBarbFischwissen.id],
    ['Fachstelle Fischwissen explicitly states that the male defends a clearly delimited territory against other males during reproduction. The patch therefore records breeding-only territoriality and does not promote permanent generic territoriality.'],
  ),
  supported(
    'sp_0103',
    'territoriality',
    { traits: ['territorial'] },
    [compatibilityFastLaneWave3Sources.arowanaMyFish.id],
    ['my-fish explicitly describes Scleropages formosus as strongly territorial and solitary; only the territoriality field is promoted here.'],
  ),
  supported(
    'sp_0104',
    'territoriality',
    { traits: ['territorial'] },
    [compatibilityFastLaneWave3Sources.arowanaMyFish.id, 'batch19-fishbase-scleropages-formosus-red'],
    ['my-fish explicitly describes Scleropages formosus as strongly territorial and lists red forms as color variants of the species; the existing reviewed Red variant bridge binds this catalog object to the base-taxon behavior authority.'],
  ),
  supported(
    'sp_0116',
    'territoriality',
    { traits: ['territorial'] },
    [compatibilityFastLaneWave3Sources.arowanaMyFish.id, 'batch19-fishbase-scleropages-formosus-green'],
    ['my-fish explicitly describes Scleropages formosus as strongly territorial and lists the Green form within the species; the existing reviewed Green variant bridge binds this catalog object to the base-taxon behavior authority.'],
  ),
  supported(
    'sp_0283',
    'territoriality',
    { traits: ['territorial'] },
    [compatibilityFastLaneWave3Sources.arowanaMyFish.id, 'wave06-peer-reviewed-scleropages-formosus-super-red'],
    ['my-fish explicitly describes Scleropages formosus as strongly territorial and lists Super Red among its color forms; the existing peer-reviewed cytogenetic bridge independently identifies Super Red as a Scleropages formosus color phenotype.'],
  ),
];

export const compatibilityFastLaneWave3VerifiedSourceIds = Object.values(compatibilityFastLaneWave3Sources).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityFastLaneWave3ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0054',
    replacePredationTargets: ['small_fish'],
    addCitationIds: [compatibilityFastLaneWave3Sources.hemichromisTaiwanFishDb.id],
    addRequiredFacts: [...allCoreFacts],
  },
  {
    speciesId: 'sp_0012',
    addBehaviorTraits: ['breeding_territoriality'],
    addCitationIds: [compatibilityFastLaneWave3Sources.cherryBarbFischwissen.id],
    addRequiredFacts: [...allCoreFacts],
  },
  {
    speciesId: 'sp_0103',
    addBehaviorTraits: ['territorial'],
    addCitationIds: [compatibilityFastLaneWave3Sources.arowanaMyFish.id],
    addRequiredFacts: [...allCoreFacts],
  },
  {
    speciesId: 'sp_0104',
    addBehaviorTraits: ['territorial'],
    addCitationIds: [compatibilityFastLaneWave3Sources.arowanaMyFish.id],
    addRequiredFacts: [...allCoreFacts],
  },
  {
    speciesId: 'sp_0116',
    addBehaviorTraits: ['territorial'],
    addCitationIds: [compatibilityFastLaneWave3Sources.arowanaMyFish.id],
    addRequiredFacts: [...allCoreFacts],
  },
  {
    speciesId: 'sp_0283',
    addBehaviorTraits: ['territorial'],
    addCitationIds: [compatibilityFastLaneWave3Sources.arowanaMyFish.id],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityFastLaneWave3AuthorityPatch = {
  patchId: 'fast-lane-evidence-wave3-20261014',
  speciesIds: ['sp_0054', 'sp_0012', 'sp_0103', 'sp_0104', 'sp_0116', 'sp_0283'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/fast-lane-wave3-20261014.ts',
  migrationOwner: 'supabase/migrations/20261014152500_compatibility_fast_lane_wave3_authority_patch.sql',
} as const;
