import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

export const compatibilityNumericWave11Sources = {
  xanthichthysMentoSaltcorner: {
    id: 'saltcorner-xanthichthys-mento-wave11',
    title: 'Xanthichthys mento • Redtail / Crosshatch Triggerfish',
    publisher: 'Saltcorner Aquarium Library',
    url: 'https://www.saltcorner.com/AquariumLibrary/browsespecies.php?CritterID=1765',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  xanthichthysMentoLiveAquaria: {
    id: 'liveaquaria-xanthichthys-mento-wave11',
    title: 'Crosshatch Triggerfish (Xanthichthys mento)',
    publisher: 'LiveAquaria',
    url: 'https://www.liveaquaria.com/products/crosshatch-triggerfish',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  xanthichthysMentoSpawningStudy: {
    id: 'kawase-2003-xanthichthys-mento-spawning-territory',
    title: 'Spawning Behavior and Biparental Egg Care of the Crosshatch Triggerfish, Xanthichthys mento (Balistidae)',
    publisher: 'Environmental Biology of Fishes',
    url: 'https://doi.org/10.1023/A:1023978722744',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  note: string,
  confidence: CatalogFieldReview['confidence'] = 'medium',
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence,
  citationIds,
  conflictNotes: [note],
  reviewedAt,
});

const saltcorner = compatibilityNumericWave11Sources.xanthichthysMentoSaltcorner.id;
const liveAquaria = compatibilityNumericWave11Sources.xanthichthysMentoLiveAquaria.id;
const spawningStudy = compatibilityNumericWave11Sources.xanthichthysMentoSpawningStudy.id;

export const compatibilityNumericWave11FieldReviews: CatalogFieldReview[] = [
  supported(
    'sp_0183',
    'temperature',
    { min: 22.2, max: 25.6 },
    [saltcorner, liveAquaria],
    'Saltcorner gives 22–27 °C and LiveAquaria gives 72–78 °F (22.2–25.6 °C) for exact Xanthichthys mento. The promoted long-term range is the conservative intersection.',
  ),
  supported(
    'sp_0183',
    'ph',
    { min: 8.1, max: 8.4 },
    [saltcorner, liveAquaria],
    'Saltcorner gives pH 7.9–8.5 and LiveAquaria gives pH 8.1–8.4 for exact Xanthichthys mento. The promoted range is the conservative intersection.',
  ),
  supported(
    'sp_0183',
    'tank_size',
    { liters: 681, lengthCm: null },
    [saltcorner, liveAquaria],
    'Saltcorner recommends 125 US gallons while LiveAquaria recommends 180 US gallons for exact Xanthichthys mento. The stricter 180-gallon minimum is promoted as approximately 681 L; no tank-length minimum is inferred.',
  ),
  supported(
    'sp_0183',
    'territoriality',
    { traits: ['breeding_territoriality'] },
    [spawningStudy],
    'Kawase (2003) directly documents that male Xanthichthys mento establish territories for spawning and parental egg care. FishBase summarizes the same scope as spawning/parental-care territory rather than feeding territory, so the authority is restricted to breeding territoriality.',
    'high',
  ),
];

export const compatibilityNumericWave11VerifiedSourceIds = Object.values(
  compatibilityNumericWave11Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityNumericWave11ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0183',
    addBehaviorTraits: ['breeding_territoriality', 'breeding_defense'],
    addCitationIds: [saltcorner, liveAquaria, spawningStudy],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityNumericWave11AuthorityPatch = {
  patchId: 'numeric-evidence-wave11-20261015',
  speciesIds: ['sp_0183'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave11-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
