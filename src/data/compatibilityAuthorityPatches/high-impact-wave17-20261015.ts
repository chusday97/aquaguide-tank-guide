import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T18:10:00+09:00';

export const compatibilityHighImpactWave17Sources = {
  koiPetMd: {
    id: 'petmd-koi-husbandry-wave17',
    title: 'Koi Fish Care Sheet',
    publisher: 'PetMD',
    url: 'https://www.petmd.com/fish/koi-fish-care-sheet',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  commonCarpFishipedia: {
    id: 'fishipedia-cyprinus-carpio-wave17',
    title: 'Common carp • Cyprinus carpio • Fish sheet',
    publisher: 'Fishipedia',
    url: 'https://www.fishi-pedia.com/fishes/cyprinus-carpio',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  commonCarpPiscivory: {
    id: 'plos-cyprinus-carpio-small-fish-predation-wave17',
    title: 'Who Is Who: An Anomalous Predator-Prey Role Exchange between Cyprinids and Perch',
    publisher: 'PLOS ONE',
    url: 'https://doi.org/10.1371/journal.pone.0156430',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const petMd = compatibilityHighImpactWave17Sources.koiPetMd.id;
const fishipedia = compatibilityHighImpactWave17Sources.commonCarpFishipedia.id;
const piscivory = compatibilityHighImpactWave17Sources.commonCarpPiscivory.id;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  conflictNotes: string[],
  confidence: CatalogFieldReview['confidence'] = 'high',
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

const variantBridgeIds: Record<'sp_0069' | 'sp_0070', string[]> = {
  sp_0069: ['batch09-fishbase-cyprinus-carpio-var', petMd],
  sp_0070: ['batch09-fishbase-cyprinus-carpio-longfin', petMd],
};

export const compatibilityHighImpactWave17FieldReviews: CatalogFieldReview[] = [];

for (const speciesId of ['sp_0069', 'sp_0070'] as const) {
  const bridge = variantBridgeIds[speciesId];

  compatibilityHighImpactWave17FieldReviews.push(
    supported(
      speciesId,
      'temperature',
      { min: 17.8, max: 23.9 },
      bridge,
      [
        'PetMD veterinary husbandry guidance explicitly covers Kohaku and Butterfly koi in the same koi care sheet and gives a preferred long-term water temperature of 64–75°F (17.8–23.9°C).',
        'This deliberately replaces the prior unresolved state with a husbandry range rather than the much wider natural survival envelope reported for wild Cyprinus carpio.',
      ],
    ),
    supported(
      speciesId,
      'ph',
      { min: 7, max: 8.6 },
      bridge,
      [
        'PetMD explicitly covers Kohaku and Butterfly koi and gives pH 7.0–8.6 for koi husbandry.',
      ],
    ),
    supported(
      speciesId,
      'adult_size',
      { min: null, max: 91.4 },
      bridge,
      [
        'PetMD explicitly includes Kohaku and Butterfly koi and reports adult koi reaching up to 3 ft; 3 ft is converted to 91.4 cm.',
        'This value is used as a husbandry planning ceiling for the reviewed ornamental forms rather than importing the larger wild-species maximum from FishBase.',
      ],
    ),
    supported(
      speciesId,
      'territoriality',
      { traits: [] },
      [...bridge, fishipedia],
      [
        'Fishipedia explicitly marks exact Cyprinus carpio as territorial: No and describes group living. The already-reviewed catalog variant identity plus PetMD koi-form coverage supplies the required ornamental-form bridge.',
        'Peaceful/social wording is not used by itself to infer non-territoriality; the explicit Fishipedia territoriality field is the behavior authority.',
      ],
      'medium',
    ),
    supported(
      speciesId,
      'predation',
      { targets: ['small_fish'] },
      [...bridge, piscivory],
      [
        'A peer-reviewed field diet study documents Cyprinus carpio consuming young-of-the-year perch measuring 37–52 mm under an unusual food-deficit event. This is direct fish-prey evidence.',
        'Authority is scoped to small_fish only. The study describes piscivory as extremely rare and environmentally forced, so this patch does not characterize koi as routine piscivores or widen the target to ordinary same-size tankmates.',
        'The existing reviewed variant identity plus PetMD coverage of Kohaku and Butterfly koi supplies the ornamental-form bridge; no automatic base-species inheritance is used.',
      ],
      'medium',
    ),
  );
}

export const compatibilityHighImpactWave17VerifiedSourceIds = Object.values(
  compatibilityHighImpactWave17Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityHighImpactWave17ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0069',
    replacePredationTargets: ['small_fish'],
    addCitationIds: [petMd, fishipedia, piscivory],
    addRequiredFacts: [...allCoreFacts],
  },
  {
    speciesId: 'sp_0070',
    replacePredationTargets: ['small_fish'],
    addCitationIds: [petMd, fishipedia, piscivory],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityHighImpactWave17AuthorityPatch = {
  patchId: 'high-impact-evidence-wave17-20261015',
  speciesIds: ['sp_0069', 'sp_0070'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/high-impact-wave17-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
