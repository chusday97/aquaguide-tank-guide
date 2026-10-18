export type CatalogIdentityResearchDebtStatus =
  | 'catalog_label_disambiguation_required'
  | 'exact_object_evidence_not_found';

export type CatalogIdentityResearchDebtReview = {
  speciesId: string;
  reviewedAt: string;
  status: CatalogIdentityResearchDebtStatus;
  searchedObjectLabels: string[];
  nonQualifyingReferences: Array<{
    label: string;
    url?: string;
    reason: string;
  }>;
  blockingReason: string;
  reopenRequirement: string;
  migrationPathOverride?: 'exact_variant_label_disambiguation';
};

/**
 * Reviewed research debt is intentionally not Compatibility authority.
 *
 * These records preserve why a high-impact identity hold did not graduate after
 * an external evidence pass. They prevent future work from repeatedly treating
 * base-species pages or adjacent ornamental trade lines as exact-object proof.
 */
export const catalogIdentityResearchDebtReviews: Record<string, CatalogIdentityResearchDebtReview> = {
  sp_0175: {
    speciesId: 'sp_0175',
    reviewedAt: '2026-10-18',
    status: 'catalog_label_disambiguation_required',
    searchedObjectLabels: [
      'Pterophyllum scalare var. Red',
      '血钻神仙',
      'Red Diamond Angelfish',
      'Blood Diamond Angelfish',
      'Blood Red Angelfish',
    ],
    nonQualifyingReferences: [
      {
        label: 'Wave28 Red Devil / Super Red identity sources',
        reason: 'Wave28 explicitly limits those sources to sp_0388 Super Red / Red Devil and forbids generalizing them to the broader sp_0175 Red object.',
      },
      {
        label: 'Pterophyllum scalare base-species authority',
        reason: 'Base-species authority establishes Pterophyllum scalare biology, not which ornamental lineage the catalog label Red / 血钻 denotes.',
      },
    ],
    blockingReason: 'The catalog scientific variant label "Red" is broader than the Chinese object label 血钻 and does not uniquely identify Red Devil, Super Red, Red Diamond, Blood Diamond, koi-derived red, or another red ornamental lineage.',
    reopenRequirement: 'First establish the exact trade/lineage label represented by 血钻神仙, then provide an object-level professional source that ties that exact line to Pterophyllum scalare.',
    migrationPathOverride: 'exact_variant_label_disambiguation',
  },

  sp_0271: {
    speciesId: 'sp_0271',
    reviewedAt: '2026-10-18',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Hemichromis bimaculatus var. Albino',
      '白子红宝石',
      'Albino Jewel Cichlid',
      'Albino Red Jewel Cichlid',
    ],
    nonQualifyingReferences: [
      {
        label: 'batch14-fishbase-hemichromis-bimaculatus-albino',
        reason: 'The stored URL is the Hemichromis bimaculatus species summary; the prior review already concluded it does not establish the exact Albino aquarium object.',
      },
    ],
    blockingReason: 'The reviewed base-species record does not prove that the aquarium-trade Albino / 白子红宝石 object is specifically Hemichromis bimaculatus rather than another Hemichromis trade lineage.',
    reopenRequirement: 'Provide an exact-object professional/breeder/importer page that names the Albino or Albino Red Jewel object and explicitly identifies it as Hemichromis bimaculatus.',
  },

  sp_0376: {
    speciesId: 'sp_0376',
    reviewedAt: '2026-10-18',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Peckoltia compta var. Super Gold',
      'L134 Super Gold',
      'Super Gold L134',
      '黄金斑马异型 (L134改良版)',
    ],
    nonQualifyingReferences: [
      {
        label: "Dan's Fish — L134 Leopard Frog Pleco",
        url: 'https://dansfish.com/products/l134-leopard-frog-pleco',
        reason: 'The product identifies ordinary L134 Leopard Frog Pleco as Peckoltia compta, but does not identify a Super Gold lineage.',
      },
      {
        label: 'Aqua Huna — L134 Leopard Frog Pleco',
        url: 'https://aquahuna.com/products/l134-leopard-frog-pleco',
        reason: 'The product explicitly states Peckoltia compta for ordinary L134, but does not establish the Super Gold ornamental object.',
      },
      {
        label: 'batch16-fishbase-peckoltia-compta-super-gold',
        reason: 'The stored URL is the Peckoltia compta species summary and was already reviewed as insufficient for object-level Super Gold authority.',
      },
    ],
    blockingReason: 'Multiple professional retailers corroborate ordinary L134 = Peckoltia compta, but this does not prove that the catalog Super Gold object is the same lineage or that Super Gold is only a color form.',
    reopenRequirement: 'Provide a professional breeder/importer/catalog page that explicitly labels L134 Super Gold / Peckoltia compta Super Gold and ties that exact ornamental line to Peckoltia compta.',
  },

  sp_0399: {
    speciesId: 'sp_0399',
    reviewedAt: '2026-10-18',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Chrysiptera cyanea var. Platinum',
      '白金蓝魔鬼',
      'Platinum Blue Devil',
      'Platinum Blue Devil Damselfish',
    ],
    nonQualifyingReferences: [
      {
        label: 'batch16-fishbase-chrysiptera-cyanea-platinum',
        reason: 'The stored URL is the Chrysiptera cyanea species summary and does not establish a Platinum ornamental lineage.',
      },
      {
        label: 'Reviewed Chrysiptera cyanea base-species sources',
        reason: 'FishBase / Atlarium / Fishipedia authority supports the base taxon only; none reviewed in this pass tied an exact Platinum object to it.',
      },
    ],
    blockingReason: 'The base species Chrysiptera cyanea is well supported, but no reviewed exact-object source currently establishes Platinum / 白金蓝魔鬼 as a Chrysiptera cyanea ornamental form.',
    reopenRequirement: 'Provide an exact professional marine-fish supplier/breeder/catalog source that names Platinum Blue Devil (or equivalent exact object) and explicitly identifies Chrysiptera cyanea.',
  },
};

export const getCatalogIdentityResearchDebt = (speciesId: string) => (
  catalogIdentityResearchDebtReviews[speciesId]
);
