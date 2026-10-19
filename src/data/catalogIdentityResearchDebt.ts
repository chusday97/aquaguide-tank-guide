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

  sp_0211: {
    speciesId: 'sp_0211',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Thorichthys meeki var.',
      '大点火口',
      'Large Spot Firemouth',
      'Spotted Firemouth Cichlid',
    ],
    nonQualifyingReferences: [
      {
        label: 'FishBase — Thorichthys meeki',
        url: 'https://www.fishbase.se/Fieldguide/FieldGuideSummary.php?c_code=630&genusname=Thorichthys&speciesname=meeki',
        reason: 'This establishes ordinary Thorichthys meeki / Firemouth Cichlid, but does not identify the catalog object 大点火口 or a stable Large Spot lineage.',
      },
      {
        label: 'AMAZONAS Magazine — Albino Firemouths',
        url: 'https://www.amazonasmagazine.com/2022/11/16/surprise-encounter-albino-firemouths-at-adg/',
        reason: 'This documents a specific albino Thorichthys meeki strain and shows that named Firemouth strains can be lineage-specific, but it provides no mapping for 大点火口.',
      },
    ],
    blockingReason: 'No reviewed exact-object source currently ties 大点火口 / Large Spot Firemouth to Thorichthys meeki or another exact Thorichthys lineage. The blank-var parent remains only a legacy catalog hypothesis.',
    reopenRequirement: 'Provide a breeder/importer/catalog or taxonomic source that explicitly names 大点火口 (or a demonstrably equivalent trade label) and identifies its exact taxon/lineage.',
  },

  sp_0265: {
    speciesId: 'sp_0265',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Nimbochromis livingstonii var.',
      '血中红慈鲷',
      'Blood Red Livingstonii',
      'Red Livingstonii Cichlid',
    ],
    nonQualifyingReferences: [
      {
        label: 'FishBase — Nimbochromis livingstonii',
        url: 'https://fishbase.se/summary/2274',
        reason: 'FishBase establishes ordinary Nimbochromis livingstonii and its natural colour/behaviour, but does not document a Blood Red / 血中红 ornamental lineage.',
      },
    ],
    blockingReason: 'The base Nimbochromis livingstonii taxon is well supported, but no reviewed exact-object source currently establishes 血中红慈鲷 as a stable N. livingstonii variant rather than a mislabeled or unrelated Malawi trade fish.',
    reopenRequirement: 'Provide a professional Malawi-cichlid breeder/importer/catalog source that explicitly names the Blood Red / 血中红 object and identifies its exact taxon or provenance line.',
  },

  sp_0205: {
    speciesId: 'sp_0205',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Hyphessobrycon herbertaxelrodi var.',
      '紫艳红莲灯',
      'Purple Black Neon Tetra',
      'Purple Red Black Neon Tetra',
    ],
    nonQualifyingReferences: [
      {
        label: 'Sunbeam Aquarium — Black Neon Tetra',
        url: 'https://sunbeamaquarium.com/fresh-marine-fish-crustaceans-coral-plants/fresh-water-fish/fresh-water-fish-tetra/',
        reason: 'The professional stock list identifies ordinary Black Neon Tetra as Hyphessobrycon herbertaxelrodi, but does not contain 紫艳红莲灯 or an equivalent Purple ornamental line.',
      },
      {
        label: 'US20240138383A1 ornamental-fish list',
        url: 'https://patents.google.com/patent/US20240138383A1/en',
        reason: 'The patent list contains ordinary/adjacent Black Neon trade labels but does not establish 紫艳红莲灯 as a Hyphessobrycon herbertaxelrodi lineage.',
      },
    ],
    blockingReason: 'Reviewed sources support the Black Neon base taxon, but no qualifying exact-object source maps 紫艳红莲灯 to Hyphessobrycon herbertaxelrodi or another exact lineage.',
    reopenRequirement: 'Provide a professional breeder/importer/export-list source that uses 紫艳红莲灯 (or a demonstrably equivalent English trade name) and explicitly identifies its taxon/lineage.',
  },

  sp_0360: {
    speciesId: 'sp_0360',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Hyphessobrycon herbertaxelrodi var.',
      '白金黑霓虹灯',
      '白金黑莲灯',
      'Platinum Black Neon Tetra',
    ],
    nonQualifyingReferences: [
      {
        label: '泡泡水族 — 白金黑莲灯·白金骇客',
        url: 'https://www.paopaosz.com/topic/M2FrOW5wMjk%3D?type=host',
        reason: 'This community article explicitly associates 白金黑莲灯 with Hyphessobrycon herbertaxelrodi, but it also presents competing explanations for the platinum phenotype and is not sufficient professional or taxonomic lineage authority for promotion.',
      },
      {
        label: 'Sunbeam Aquarium — Black Neon Tetra',
        url: 'https://sunbeamaquarium.com/fresh-marine-fish-crustaceans-coral-plants/fresh-water-fish/fresh-water-fish-tetra/',
        reason: 'The professional stock list corroborates the ordinary Black Neon base taxon only; it does not list a Platinum Black Neon line.',
      },
    ],
    blockingReason: 'An exact community-level 白金黑莲灯 reference exists, but no qualifying breeder/importer or taxonomic source establishes whether this is a stable Hyphessobrycon herbertaxelrodi strain, a non-heritable platinum phenotype, or another trade object.',
    reopenRequirement: 'Provide a professional breeder/importer or peer-reviewed source that explicitly identifies Platinum/白金 Black Neon and states the exact taxon/provenance; if the platinum appearance is only a phenotype, do not model it as an inheritable strain.',
  },

};

export const getCatalogIdentityResearchDebt = (speciesId: string) => (
  catalogIdentityResearchDebtReviews[speciesId]
);
