import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-14T15:35:00+08:00';

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

export const compatibilityFastLaneWave4Sources = {
  ornateBichirAquaticArts: source(
    'aquaticarts-polypterus-ornatipinnis-conspecific-territoriality',
    'Ornate Bichir (Polypterus ornatipinnis), Tank-Bred',
    'Aquatic Arts',
    'https://aquaticarts.com/products/ornate-bichir',
    'curated_husbandry',
  ),
  ornateBichirWetWebMedia: source(
    'wetwebmedia-polypterus-ornatipinnis-territoriality',
    'Bichirs compatibility FAQ: Polypterus ornatipinnis territoriality',
    'WetWebMedia',
    'https://www.wetwebmedia.com/FWSubWebIndex/polypcompfaqs.htm',
    'curated_husbandry',
  ),
  harlequinHydroHabitats: source(
    'hydrohabitats-trigonostigma-heteromorpha-nonterritorial',
    'Harlequin Rasbora care guide',
    'Hydro Habitats',
    'https://www.hydrohabitats.com/guides/freshwater-fish-harlequin-rasbora',
    'curated_husbandry',
  ),
  channaDiplogrammaBAqua: source(
    'baqua-channa-diplogramma-tank-minimum',
    'Channa diplogramma husbandry profile',
    'B-Aqua',
    'https://www.b-aqua.com/pages/fiche.aspx?id=980&media=print',
    'curated_husbandry',
  ),
  channaDiplogrammaFishipedia: source(
    'fishipedia-channa-diplogramma-tank-minimum',
    'Channa diplogramma fish sheet',
    'Fishi-pedia',
    'https://www.fishi-pedia.com/fishes/channa-diplogramma',
    'curated_husbandry',
  ),
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'medium',
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes,
  reviewedAt,
});

const unknown = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  citationIds: string[],
  conflictNotes: string[],
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue: null,
  status: 'reviewed',
  resolution: 'unknown',
  confidence: 'unknown',
  citationIds,
  conflictNotes,
  reviewedAt,
});

export const compatibilityFastLaneWave4FieldReviews: CatalogFieldReview[] = [
  supported(
    'sp_0105',
    'territoriality',
    { traits: ['conspecific_territoriality'] },
    [
      compatibilityFastLaneWave4Sources.ornateBichirAquaticArts.id,
      compatibilityFastLaneWave4Sources.ornateBichirWetWebMedia.id,
    ],
    [
      'Aquatic Arts states that adult Ornate Bichirs can sometimes be territorial with one another while generally ignoring other tankmates.',
      'WetWebMedia independently describes Polypterus territorial conflict as an intraspecific/space-limited issue. The authority is therefore scoped to conspecific territoriality and must not be promoted to generic interspecific territorial pressure.',
    ],
  ),
  supported(
    'sp_0468',
    'territoriality',
    { traits: [] },
    [
      compatibilityFastLaneWave4Sources.harlequinHydroHabitats.id,
      'batch-02-fishbase-trigonostigma-heteromorpha',
    ],
    [
      'Hydro Habitats explicitly marks Trigonostigma heteromorpha as non-territorial. FishBase independently records schooling/group occurrence and aquarium group keeping, which is consistent with the neutral territoriality authority but is not used alone to infer it.',
    ],
  ),
  unknown(
    'sp_0198',
    'tank_size',
    [
      'seriouslyfish-channa-diplogramma',
      compatibilityFastLaneWave4Sources.channaDiplogrammaBAqua.id,
      compatibilityFastLaneWave4Sources.channaDiplogrammaFishipedia.id,
    ],
    [
      'Seriously Fish records the aquarium base as not recorded and limits the species qualitatively to public installations or the very largest private aquaria.',
      'B-Aqua gives 500 L minimum while Fishi-pedia gives 3000 L minimum. The six-fold conflict is too large to collapse into one reviewed numeric minimum without a higher-authority exact-taxon husbandry source.',
      'Do not infer a numeric minimum from adult size and do not select the more conservative value merely to eliminate an unknown.',
    ],
  ),
];

export const compatibilityFastLaneWave4VerifiedSourceIds = Object.values(compatibilityFastLaneWave4Sources).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityFastLaneWave4ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0105',
    addBehaviorTraits: ['conspecific_territoriality'],
    addCitationIds: [
      compatibilityFastLaneWave4Sources.ornateBichirAquaticArts.id,
      compatibilityFastLaneWave4Sources.ornateBichirWetWebMedia.id,
    ],
    addRequiredFacts: [...allCoreFacts],
  },
  {
    speciesId: 'sp_0468',
    addCitationIds: [compatibilityFastLaneWave4Sources.harlequinHydroHabitats.id],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityFastLaneWave4AuthorityPatch = {
  patchId: 'fast-lane-evidence-wave4-20261014',
  speciesIds: ['sp_0105', 'sp_0468', 'sp_0198'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/fast-lane-wave4-20261014.ts',
  migrationOwner: 'supabase/migrations/20261014163500_compatibility_fast_lane_wave4_authority_patch.sql',
} as const;
