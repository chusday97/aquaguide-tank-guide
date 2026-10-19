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


  sp_0158: {
    speciesId: 'sp_0158',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Xiphophorus hellerii var.',
      '红苹果剑尾',
      'Red Apple Swordtail',
      'Apple Red Swordtail',
    ],
    nonQualifyingReferences: [
      {
        label: '鱼大全 — 红苹果剑尾鱼',
        url: 'https://www.yudaquan.com/a/k-5b744bc1df',
        reason: 'This consumer-care page calls 红苹果剑尾 a selected Xiphophorus hellerii variety, but it supplies no breeder/importer lineage provenance and cannot resolve the conflicting reviewed hybrid evidence.',
      },
      {
        label: 'phase2-15-usgs-red-swordtail-hybrid',
        reason: 'USGS documents a red swordtail hybrid lineage involving Xiphophorus hellerii × Xiphophorus maculatus, so a generic red/apple trade label cannot be promoted to pure X. hellerii without exact provenance.',
      },
    ],
    blockingReason: 'The full 红苹果剑尾 / Red Apple Swordtail object still has conflicting plausible lineage interpretations: a pure Xiphophorus hellerii ornamental line versus a documented red swordtail hybrid lineage. No reviewed exact breeder/importer source uniquely maps this catalog object.',
    reopenRequirement: 'Provide breeder/importer provenance for the exact Red Apple / 红苹果 line, including explicit parent taxon or hybrid lineage; do not resolve from red colour, swordtail morphology, or the blank-var parent alone.',
  },

  sp_0210: {
    speciesId: 'sp_0210',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Pangio kuhlii var.',
      '黄金眼镜蛇蛇鱼',
      'Golden Kuhli',
      'Golden Kuhli Loach',
      'Kuhli Golden',
    ],
    nonQualifyingReferences: [
      {
        label: 'INCOPESCA aquarium-species list — Kuhli golden',
        url: 'https://incopesca.go.cr/acuicultura/acuariofilia/AJDIP-164-2021_Se_aprueba_lista_final_de_especies_de_interes_pesquero_y_acuicola_de_especies_de_interes_para_la_Acuariofilia_CR.pdf',
        reason: 'The government list maps “Kuhli golden” to Pangio anguillaris, which conflicts with the legacy catalog parent rather than proving this exact catalog object.',
      },
      {
        label: 'Quality Marine — Golden Kuhli Loach',
        url: 'https://www.qualitymarine.com/aquatropic/fish/loaches/pangio/kuhli-golden-43033/',
        reason: 'This professional supplier labels Golden Kuhli Loach as Pangio kuhlii, conflicting with other trade identifications.',
      },
      {
        label: 'Whitley Aquatics — Golden Kuhli Loach',
        url: 'https://www.whitlynaquatics.com/products/golden-kuhli-loach-pangio-kuhlii',
        reason: 'This retailer presents the same trade name as Pangio doriae, adding another incompatible trade identification rather than resolving lineage.',
      },
      {
        label: 'Judy’s Planted Tanks — Golden Kuhli Loach',
        url: 'https://judysplantedtanks.co.za/product/golden-kuhli-loach-pangio-semicincta/',
        reason: 'This retailer identifies Golden Kuhli Loach as Pangio semicincta, confirming that the trade label is not taxonomically stable.',
      },
    ],
    blockingReason: 'Golden Kuhli is taxonomically unstable in aquarium commerce: reviewed sources variously associate the label with P. anguillaris, P. kuhlii, P. doriae and P. semicincta. The catalog object therefore cannot be promoted from any single parent hint.',
    reopenRequirement: 'Provide provenance for the exact catalog stock line (exporter/importer or specimen-backed identification) that selects one Pangio taxon; generic Golden Kuhli pages are insufficient.',
  },

  sp_0142: {
    speciesId: 'sp_0142',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Poecilia sphenops var.',
      '球鱼 (玛丽变种)',
      'Balloon Molly',
      'Balloon Molly hybrid',
      'Poecilia sphenops Balloon',
    ],
    nonQualifyingReferences: [
      {
        label: 'Aquarium Glaser — molly trade complex review',
        reason: 'The reviewed source explains that common molly trade stocks can involve several Poecilia species and repeated crossings, so the legacy P. sphenops attribution is not exact lineage proof.',
      },
      {
        label: 'Ruinemans Group — Balloon Molly',
        url: 'https://www.ruinemansgroup.com/aquarium-fish/livebearer/balloon-molly',
        reason: 'The professional wholesaler describes Balloon Molly as a hybrid breeding variety of the molly (Poecilia sphenops), but does not provide lineage provenance sufficient to distinguish pure-species from multi-species domestic stock.',
      },
      {
        label: 'Jurnal Perikanan Terapan — Sunkist Balloon Molly breeding study',
        url: 'https://jurnal.polinela.ac.id/PERANAN/article/view/4048',
        reason: 'This study labels one Sunkist Balloon Molly breeding stock as Poecilia sphenops; it establishes that some balloon lines are maintained under that taxon but does not establish the ancestry of the generic catalog Balloon Molly object.',
      },
    ],
    blockingReason: 'Balloon Molly is a morphology-changing domestic trade form whose ancestry is not stable across sources. Some stocks are maintained as Poecilia sphenops while broader trade authority documents hybrid/multi-species molly ancestry. Generic Balloon Molly cannot be assigned one parent taxon safely.',
    reopenRequirement: 'Provide exact breeder/importer lineage provenance for the catalog Balloon Molly stock and then perform field-scoped morphology inheritance review; never grant full base-profile inheritance from the Balloon label alone.',
  },

  sp_0296: {
    speciesId: 'sp_0296',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Lutjanus kasmira var.',
      '红利鱼 (改良)',
      '红利鱼 改良',
      'Improved Lutjanus kasmira',
      'Improved Bluestripe Snapper',
    ],
    nonQualifyingReferences: [
      {
        label: 'batch23-fishbase-lutjanus-kasmira-var',
        reason: 'The stored authority establishes the base Lutjanus kasmira taxon only; no reviewed source identifies 红利鱼 (改良) as a breeder strain or even demonstrates that 改良 is a stable object label.',
      },
    ],
    blockingReason: '“改良” is a generic merchandising modifier and no reviewed exact-object source identifies a stable 红利鱼 strain, lineage, or catalog correction tied to Lutjanus kasmira.',
    reopenRequirement: 'Provide an exporter/importer/breeder catalog that names the exact 红利鱼 改良 line and its taxon, or explicitly correct the catalog object to an ordinary base taxon if 改良 is only merchandising text.',
  },

  sp_0365: {
    speciesId: 'sp_0365',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Lutjanus kasmira var.',
      '红利鱼 (长鳍型)',
      '长鳍红利鱼',
      'Longfin Lutjanus kasmira',
      'Longfin Bluestripe Snapper',
    ],
    nonQualifyingReferences: [
      {
        label: 'batch24-fishbase-lutjanus-kasmira-longfin',
        reason: 'The stored FishBase authority establishes ordinary Lutjanus kasmira but does not document a Longfin ornamental lineage or morphology-breeding program.',
      },
    ],
    blockingReason: 'No reviewed breeder/importer or scientific source currently establishes a Longfin 红利鱼 / Lutjanus kasmira lineage. Because long-fin morphology can change swimming ability and vulnerability, parent-species inheritance is unsafe.',
    reopenRequirement: 'Provide exact provenance for a Longfin Lutjanus/红利鱼 breeding line, then run field-scoped morphology inheritance review before any Compatibility authority is reused.',
  },

  sp_0366: {
    speciesId: 'sp_0366',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Synchiropus splendidus var.',
      '五彩青蛙 (改良型)',
      '五彩青蛙 改良',
      'Improved Mandarin Fish',
      'Improved Synchiropus splendidus',
    ],
    nonQualifyingReferences: [
      {
        label: '台湾水产试验所 — 花斑连鳍䲗种鱼培育研究',
        url: 'https://www.tfrin.gov.tw/theme_data.php?id=1269&sub_theme=special_message&theme=book_data',
        reason: 'The government research source establishes ordinary Synchiropus splendidus / 五彩青蛙 and captive breeding, but it does not describe a distinct “改良型” strain.',
      },
      {
        label: '水族名录 — 五彩青蛙 Synchiropus splendidus',
        url: 'https://www.aquaml.com/s/Synchiropus_splendidus.html',
        reason: 'This aquarium catalog corroborates the ordinary Chinese trade name and taxon only; no separate improved lineage is identified.',
      },
    ],
    blockingReason: 'Reviewed sources support ordinary 五彩青蛙 = Synchiropus splendidus, but “改良型” is not established as a stable strain or lineage and therefore cannot be used as an inheritance identity key.',
    reopenRequirement: 'Provide a breeder/importer line name with explicit Synchiropus splendidus provenance, or correct the catalog record to the ordinary base taxon if 改良型 has no distinct lineage meaning.',
  },

  sp_0358: {
    speciesId: 'sp_0358',
    reviewedAt: '2026-10-19',
    status: 'exact_object_evidence_not_found',
    searchedObjectLabels: [
      'Prionobrama filigera var.',
      '红尾玻璃灯 (改良)',
      '红尾玻璃灯 改良',
      'Improved Glass Bloodfin Tetra',
      'Improved Prionobrama filigera',
    ],
    nonQualifyingReferences: [
      {
        label: '养鱼帮 — Rio Negro biotope stock list',
        url: 'https://www.yangyubang.com/?p=4746',
        reason: 'This aquarium reference maps ordinary 红尾玻璃灯 to Prionobrama filigera, but it does not identify any distinct 改良 strain.',
      },
      {
        label: 'batch07-fishbase-prionobrama-filigera',
        reason: 'The stored base-species authority establishes Prionobrama filigera only and provides no object-level evidence for a separate improved lineage.',
      },
    ],
    blockingReason: 'Ordinary 红尾玻璃灯 is supported as Prionobrama filigera, but the catalog “改良” modifier has no reviewed breeder/lineage identity and cannot justify a separate variant object or inheritance bridge.',
    reopenRequirement: 'Provide a professional breeder/importer source for an actual improved Red-tail Glass Tetra line, or explicitly collapse/correct the catalog object to the ordinary base taxon.',
  },

};

export const getCatalogIdentityResearchDebt = (speciesId: string) => (
  catalogIdentityResearchDebtReviews[speciesId]
);
