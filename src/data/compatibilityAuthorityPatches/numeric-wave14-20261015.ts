import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T15:11:00+08:00';

export const compatibilityNumericWave14Sources = {
  lutjanusKasmiraFishipedia: {
    id: 'fishipedia-lutjanus-kasmira-wave14',
    title: 'Vivaneau à raies bleues • Lutjanus kasmira • Fiche poissons',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/lutjanus-kasmira',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  lutjanusKasmiraLiveAquaria: {
    id: 'liveaquaria-lutjanus-kasmira-wave14',
    title: 'Bluestripe Snapper • Lutjanus kasmira',
    publisher: 'LiveAquaria',
    url: 'https://www.liveaquaria.com/products/bluestripe-snapper',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  citationIds: string[],
  note: string,
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds,
  conflictNotes: [note],
  reviewedAt,
});

const fishipedia = compatibilityNumericWave14Sources.lutjanusKasmiraFishipedia.id;
const liveAquaria = compatibilityNumericWave14Sources.lutjanusKasmiraLiveAquaria.id;

export const compatibilityNumericWave14FieldReviews: CatalogFieldReview[] = [
  supported('sp_0022', 'temperature', { min: 22.2, max: 25.6 }, [liveAquaria],
    'LiveAquaria gives 72–78 °F aquarium water conditions for exact Lutjanus kasmira; converted deterministically to 22.2–25.6 °C. The broader Fishipedia natural-habitat range is not substituted for a long-term aquarium range.'),
  supported('sp_0022', 'ph', { min: 8.1, max: 8.4 }, [liveAquaria],
    'LiveAquaria gives pH 8.1–8.4 aquarium water conditions for exact Lutjanus kasmira.'),
  supported('sp_0022', 'tank_size', { liters: 1136, lengthCm: null }, [liveAquaria],
    'LiveAquaria explicitly gives a 300 US gallon minimum aquarium for exact Lutjanus kasmira; 300 US gal is approximately 1135.6 L and is rounded conservatively to 1136 L. No tank-length minimum is inferred.'),
  supported('sp_0022', 'territoriality', { traits: [] }, [fishipedia],
    'Fishipedia explicitly marks exact Lutjanus kasmira as non-territorial. Its separate note about possible interspecific aggression is not converted into territoriality.'),
  supported('sp_0022', 'predation', { targets: ['small_fish'] }, [fishipedia],
    'Fishipedia explicitly describes exact Lutjanus kasmira as an ambush predator that attacks smaller animals within reach. The promoted fish-prey scope is limited to small_fish and does not attempt to encode every invertebrate prey class.'),
];

export const compatibilityNumericWave14VerifiedSourceIds = Object.values(
  compatibilityNumericWave14Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityNumericWave14ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0022',
    replacePredationTargets: ['small_fish'],
    addCitationIds: [fishipedia, liveAquaria],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityNumericWave14AuthorityPatch = {
  patchId: 'numeric-evidence-wave14-20261015',
  speciesIds: ['sp_0022'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave14-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
