import type { CatalogEvidenceSource } from '../../../packages/contracts/src';
import type { CatalogFieldReview } from '../catalogFieldReviews';

const reviewedAt = '2026-10-18T18:30:00+08:00';

export const identityCorrectionsPhase2_06Sources = {
  albinoPandaAquaGroup: {
    id: 'aquagroup-hoplisoma-panda-albino-phase2-06',
    title: 'Albino Panda Cory - Hoplisoma panda',
    publisher: 'Aqua Group',
    url: 'https://aquagroup.co.uk/products/albino-panda-cory-hoplisoma-panda',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  albinoPandaNicksAquarium: {
    id: 'nicks-aquarium-hoplisoma-panda-albino-phase2-06',
    title: 'Albino Panda Corydoras | Hoplisoma panda',
    publisher: "Nick's Aquarium Oceanarium Terrarium",
    url: 'https://nicksaquariumoceanariumterrarium.com.au/products/albino-panda-corydoras-hoplisoma-panda',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  albinoPandaMaidenhead: {
    id: 'maidenhead-hoplisoma-panda-albino-phase2-06',
    title: "What's in store - April 2025 — albino Panda cory (Hoplisoma panda)",
    publisher: 'Maidenhead Aquatics',
    url: 'https://www.fishkeeper.co.uk/stories/Whats-in-store-April-2025',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
} satisfies Record<string, CatalogEvidenceSource>;

/**
 * Phase2-06 resolves identity only.
 *
 * Modern Corydoradinae taxonomy places Panda Cory in Hoplisoma panda. The
 * catalog still uses the familiar older combination Corydoras panda. The
 * reviewed sources explicitly connect those names and identify Albino Panda
 * Cory as a captive/selectively bred albino colour form of the Panda Cory.
 *
 * No vendor husbandry numbers are promoted here. Compatibility facts continue
 * to inherit only from the already-reviewed catalog base sp_0443 through the
 * canonical allowlist.
 */
export const identityCorrectionsPhase2_06FieldReviews: CatalogFieldReview[] = [
  {
    speciesId: 'sp_0231',
    field: 'identity',
    proposedValue: {
      scientificName: 'Corydoras panda var. Albino',
      baseSpeciesKey: 'Corydoras panda',
      variantKey: 'Albino / Hoplisoma panda albino strain',
    },
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'high',
    citationIds: [
      identityCorrectionsPhase2_06Sources.albinoPandaAquaGroup.id,
      identityCorrectionsPhase2_06Sources.albinoPandaNicksAquarium.id,
      identityCorrectionsPhase2_06Sources.albinoPandaMaidenhead.id,
    ],
    conflictNotes: [
      'Aqua Group explicitly describes Albino Panda Cory as a pale selectively bred colour form / captive-bred albino variety of Panda Cory and notes that modern references use Hoplisoma while aquarists also know the species as Corydoras panda.',
      "Nick's Aquarium independently identifies the exact object as Hoplisoma panda (formerly Corydoras panda) — albino strain.",
      'Maidenhead Aquatics independently identifies selectively bred albino Panda cory as Hoplisoma panda.',
      'Hoplisoma panda versus Corydoras panda is treated here as a nomenclatural update for the same species, not as a second candidate taxon. This review does not rewrite the catalog-wide scientific name.',
      'These sources establish exact catalog-object identity only. Their care values are not imported; Compatibility husbandry and behavior remain inherited from reviewed sp_0443 authority.',
    ],
    reviewedAt,
  },
];

export const identityCorrectionsPhase2_06VerifiedSourceIds = Object.values(identityCorrectionsPhase2_06Sources)
  .map(source => source.id);

export const resolvedCatalogIdentityCorrectionSpeciesIds = new Set(['sp_0231']);

export const catalogIdentityCorrectionBaseSpeciesIds = {
  sp_0231: 'sp_0443',
} as const;
