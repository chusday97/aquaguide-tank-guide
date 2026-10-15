import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';
import type { CompatibilityProfileAuthorityPatch } from './fast-lane-20261014';

const reviewedAt = '2026-10-15T00:00:00+08:00';

export const compatibilityNumericWave7Sources = {
  osteoglossumFerreiraiFishipedia: {
    id: 'fishipedia-osteoglossum-ferreirai-wave7',
    title: 'Arowana noir • Osteoglossum ferreirai • Fiche poissons',
    publisher: 'Fishipedia',
    url: 'https://www.fishipedia.fr/fr/poissons/osteoglossum-ferreirai',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

const supported = (
  speciesId: string,
  field: CatalogFieldReview['field'],
  proposedValue: unknown,
  sourceId: string,
  note: string,
): CatalogFieldReview => ({
  speciesId,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds: [sourceId],
  conflictNotes: [note],
  reviewedAt,
});

const oFerreirai = compatibilityNumericWave7Sources.osteoglossumFerreiraiFishipedia.id;

export const compatibilityNumericWave7FieldReviews: CatalogFieldReview[] = [
  supported('sp_0118', 'tank_size', { liters: 4500, lengthCm: 500 }, oFerreirai,
    'Fishipedia explicitly recommends a minimum 4500 L aquarium with at least 500 cm of frontage for exact Osteoglossum ferreirai. This stricter direct minimum supersedes the smaller reviewed care-guide minimum for conservative compatibility decisions.'),
  supported('sp_0118', 'territoriality', { traits: [] }, oFerreirai,
    'Fishipedia explicitly marks exact Osteoglossum ferreirai as non-territorial (“territorialité: Non” / “non territorial à proprement parler”), while separately noting that space or food shortage can still trigger aggression. The territoriality field therefore remains non-territorial without erasing other aggression or predation constraints.'),
];

export const compatibilityNumericWave7VerifiedSourceIds = Object.values(
  compatibilityNumericWave7Sources,
).map(item => item.id);

const allCoreFacts = ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;

export const compatibilityNumericWave7ProfilePatches: readonly CompatibilityProfileAuthorityPatch[] = [
  {
    speciesId: 'sp_0118',
    addCitationIds: [oFerreirai],
    addRequiredFacts: [...allCoreFacts],
  },
] as const;

export const compatibilityNumericWave7AuthorityPatch = {
  patchId: 'numeric-evidence-wave7-20261015',
  speciesIds: ['sp_0118'],
  authorityOwner: 'src/data/compatibilityAuthorityPatches/numeric-wave7-20261015.ts',
  runtimeScope: 'source_controlled_only',
  writesProductionAuthority: false,
} as const;
