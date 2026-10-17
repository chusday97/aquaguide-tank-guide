import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-18T02:30:00+08:00';

export const identityCorrectionsPhase2_03Sources = {
  darioGoldLiveAquaria: {
    id: 'liveaquaria-dario-dario-gold-red-phase2-03',
    title: 'Scarlet Gem Badis (Dario dario) — color: Gold and Red',
    publisher: 'LiveAquaria',
    url: 'https://www.liveaquaria.com/products/scarlet-gem-badis',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  darioGoldBayBridge: {
    id: 'baybridge-dario-dario-gold-red-phase2-03',
    title: 'Scarlet Gem Badis — Dario dario, Color Form: Gold, Red',
    publisher: 'Bay Bridge Aquarium',
    url: 'https://www.baybridgeaquarium.com/products/scarlet-gem-badis',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

/**
 * Phase2-03 intentionally contains identity authority only.
 *
 * Once a catalog color-form is reviewed as the same canonical species,
 * Compatibility core facts must flow through the canonical inheritance
 * allowlist from the reviewed base species. Duplicating eight field-review
 * records here would create a second source of truth.
 */
export const identityCorrectionsPhase2_03FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0234',
    field: 'identity',
    proposedValue: {
      scientificName: 'Dario dario var. Gold',
      baseSpeciesKey: 'Dario dario',
      variantKey: 'Gold color form / catalog trade label',
    },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: [
      identityCorrectionsPhase2_03Sources.darioGoldLiveAquaria.id,
      identityCorrectionsPhase2_03Sources.darioGoldBayBridge.id,
    ],
    conflictNotes: [
      'Two independent aquarium sources identify the livestock as Dario dario and explicitly list Gold together with Red as its color form/color attributes.',
      'The catalog “var. Gold” label is treated as a trade/color-form label, not a separate taxon. This review resolves only canonical identity.',
      'No husbandry, behavior, territoriality, predation, or space claim is copied from these identity sources; those facts must inherit from the reviewed Dario dario base authority through the canonical allowlist.',
    ],
    reviewedAt,
  },
];

export const identityCorrectionsPhase2_03VerifiedSourceIds = Object.values(identityCorrectionsPhase2_03Sources).map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0234']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0234: 'sp_0200',
} as const;
