# Compatibility Identity Migration Audit

> Species-level migration planning only. This is not a pair precompute table and does not create Compatibility authority.

- Active identity boundaries: **93**
- Fish-domain identity boundaries: **91**
- Current unresolved-identity fish pairs: **16735**
- One-boundary pairs: **13080**
- Two-boundary pairs: **3655**
- Auto-migratable active boundaries: **0**

## Migration buckets

- variant_object_evidence_required: 59
- catalog_structure_correction_required: 11
- parent_taxon_resolution_required: 11
- trade_name_disambiguation_required: 7
- commercial_hybrid_hold: 3
- accepted_alias_trade_disambiguation_required: 1
- taxonomic_research_candidate: 1

## Migration paths

- base_authority_or_parent_resolution: 54 objects / 8127 sole-boundary pairs
- catalog_structure_correction: 11 objects / 1690 sole-boundary pairs
- partial_inheritance_review: 10 objects / 1134 sole-boundary pairs
- trade_name_disambiguation: 8 objects / 857 sole-boundary pairs
- identity_only_after_exact_evidence: 5 objects / 625 sole-boundary pairs
- hybrid_object_specific_hold: 3 objects / 485 sole-boundary pairs
- exact_variant_label_disambiguation: 1 objects / 162 sole-boundary pairs
- taxonomic_review: 1 objects / 0 sole-boundary pairs

## Catalog structure subtypes

- named_trade_label_requires_lineage: 4
- conflicting_candidate_lineages: 3
- generic_improvement_modifier_requires_lineage: 3
- morphology_modifier_requires_lineage: 1

- Identity-only after exact evidence: **5**
- Partial inheritance review: **10**
- Reviewed research-debt holds: **15**
- Source-controlled terminal identity holds: **93**

## Reviewed evidence-debt holds

| Catalog object | Research status | Blocking reason | Reopen requirement |
| --- | --- | --- | --- |
| sp_0158 红苹果剑尾 | exact_object_evidence_not_found | The full 红苹果剑尾 / Red Apple Swordtail object still has conflicting plausible lineage interpretations: a pure Xiphophorus hellerii ornamental line versus a documented red swordtail hybrid lineage. No reviewed exact breeder/importer source uniquely maps this catalog object. | Provide breeder/importer provenance for the exact Red Apple / 红苹果 line, including explicit parent taxon or hybrid lineage; do not resolve from red colour, swordtail morphology, or the blank-var parent alone. |
| sp_0175 血钻神仙 | catalog_label_disambiguation_required | The catalog scientific variant label "Red" is broader than the Chinese object label 血钻 and does not uniquely identify Red Devil, Super Red, Red Diamond, Blood Diamond, koi-derived red, or another red ornamental lineage. | First establish the exact trade/lineage label represented by 血钻神仙, then provide an object-level professional source that ties that exact line to Pterophyllum scalare. |
| sp_0210 黄金眼镜蛇蛇鱼 | exact_object_evidence_not_found | Golden Kuhli is taxonomically unstable in aquarium commerce: reviewed sources variously associate the label with P. anguillaris, P. kuhlii, P. doriae and P. semicincta. The catalog object therefore cannot be promoted from any single parent hint. | Provide provenance for the exact catalog stock line (exporter/importer or specimen-backed identification) that selects one Pangio taxon; generic Golden Kuhli pages are insufficient. |
| sp_0211 大点火口 | exact_object_evidence_not_found | No reviewed exact-object source currently ties 大点火口 / Large Spot Firemouth to Thorichthys meeki or another exact Thorichthys lineage. The blank-var parent remains only a legacy catalog hypothesis. | Provide a breeder/importer/catalog or taxonomic source that explicitly names 大点火口 (or a demonstrably equivalent trade label) and identifies its exact taxon/lineage. |
| sp_0265 血中红慈鲷 | exact_object_evidence_not_found | The base Nimbochromis livingstonii taxon is well supported, but no reviewed exact-object source currently establishes 血中红慈鲷 as a stable N. livingstonii variant rather than a mislabeled or unrelated Malawi trade fish. | Provide a professional Malawi-cichlid breeder/importer/catalog source that explicitly names the Blood Red / 血中红 object and identifies its exact taxon or provenance line. |
| sp_0271 白子红宝石 | exact_object_evidence_not_found | The reviewed base-species record does not prove that the aquarium-trade Albino / 白子红宝石 object is specifically Hemichromis bimaculatus rather than another Hemichromis trade lineage. | Provide an exact-object professional/breeder/importer page that names the Albino or Albino Red Jewel object and explicitly identifies it as Hemichromis bimaculatus. |
| sp_0296 红利鱼 (改良) | exact_object_evidence_not_found | “改良” is a generic merchandising modifier and no reviewed exact-object source identifies a stable 红利鱼 strain, lineage, or catalog correction tied to Lutjanus kasmira. | Provide an exporter/importer/breeder catalog that names the exact 红利鱼 改良 line and its taxon, or explicitly correct the catalog object to an ordinary base taxon if 改良 is only merchandising text. |
| sp_0365 红利鱼 (长鳍型) | exact_object_evidence_not_found | No reviewed breeder/importer or scientific source currently establishes a Longfin 红利鱼 / Lutjanus kasmira lineage. Because long-fin morphology can change swimming ability and vulnerability, parent-species inheritance is unsafe. | Provide exact provenance for a Longfin Lutjanus/红利鱼 breeding line, then run field-scoped morphology inheritance review before any Compatibility authority is reused. |
| sp_0366 五彩青蛙 (改良型) | exact_object_evidence_not_found | Reviewed sources support ordinary 五彩青蛙 = Synchiropus splendidus, but “改良型” is not established as a stable strain or lineage and therefore cannot be used as an inheritance identity key. | Provide a breeder/importer line name with explicit Synchiropus splendidus provenance, or correct the catalog record to the ordinary base taxon if 改良型 has no distinct lineage meaning. |
| sp_0376 黄金斑马异型 (L134改良版) | exact_object_evidence_not_found | Multiple professional retailers corroborate ordinary L134 = Peckoltia compta, but this does not prove that the catalog Super Gold object is the same lineage or that Super Gold is only a color form. | Provide a professional breeder/importer/catalog page that explicitly labels L134 Super Gold / Peckoltia compta Super Gold and ties that exact ornamental line to Peckoltia compta. |
| sp_0399 白金蓝魔鬼 (海水) | exact_object_evidence_not_found | The base species Chrysiptera cyanea is well supported, but no reviewed exact-object source currently establishes Platinum / 白金蓝魔鬼 as a Chrysiptera cyanea ornamental form. | Provide an exact professional marine-fish supplier/breeder/catalog source that names Platinum Blue Devil (or equivalent exact object) and explicitly identifies Chrysiptera cyanea. |
| sp_0142 球鱼 (玛丽变种) | exact_object_evidence_not_found | Balloon Molly is a morphology-changing domestic trade form whose ancestry is not stable across sources. Some stocks are maintained as Poecilia sphenops while broader trade authority documents hybrid/multi-species molly ancestry. Generic Balloon Molly cannot be assigned one parent taxon safely. | Provide exact breeder/importer lineage provenance for the catalog Balloon Molly stock and then perform field-scoped morphology inheritance review; never grant full base-profile inheritance from the Balloon label alone. |
| sp_0205 紫艳红莲灯 | exact_object_evidence_not_found | Reviewed sources support the Black Neon base taxon, but no qualifying exact-object source maps 紫艳红莲灯 to Hyphessobrycon herbertaxelrodi or another exact lineage. | Provide a professional breeder/importer/export-list source that uses 紫艳红莲灯 (or a demonstrably equivalent English trade name) and explicitly identifies its taxon/lineage. |
| sp_0358 红尾玻璃灯 (改良) | exact_object_evidence_not_found | Ordinary 红尾玻璃灯 is supported as Prionobrama filigera, but the catalog “改良” modifier has no reviewed breeder/lineage identity and cannot justify a separate variant object or inheritance bridge. | Provide a professional breeder/importer source for an actual improved Red-tail Glass Tetra line, or explicitly collapse/correct the catalog object to the ordinary base taxon. |
| sp_0360 白金黑霓虹灯 | exact_object_evidence_not_found | An exact community-level 白金黑莲灯 reference exists, but no qualifying breeder/importer or taxonomic source establishes whether this is a stable Hyphessobrycon herbertaxelrodi strain, a non-heritable platinum phenotype, or another trade object. | Provide a professional breeder/importer or peer-reviewed source that explicitly identifies Platinum/白金 Black Neon and states the exact taxon/provenance; if the platinum appearance is only a phenotype, do not model it as an inheritable strain. |

## Highest-impact catalog identity debt

| Catalog object | Boundary | Migration path | Ready base | Morphology risk | Identity-unknown pairs | Sole-boundary pairs |
| --- | --- | --- | ---: | --- | ---: | ---: |
| sp_0055 金刚鹦鹉鱼 | commercial_hybrid_identity_unresolved | hybrid_object_specific_hold | 0 | no | 247 | 162 |
| sp_0124 蓝眼胡子 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0127 巴基斯坦鼠 | trade_name_taxon_ambiguous | trade_name_disambiguation | 0 | no | 247 | 162 |
| sp_0158 红苹果剑尾 | catalog_scientific_name_unresolved | catalog_structure_correction | 1 | no | 247 | 162 |
| sp_0159 黄金胡子 (异型变种) | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0160 大帆白金胡子 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 162 |
| sp_0163 鸿运当头锦鲤 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0175 血钻神仙 | catalog_variant_identity_unresolved | exact_variant_label_disambiguation | 1 | no | 247 | 162 |
| sp_0179 球形曼龙 (蓝/金) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 162 |
| sp_0182 蓝眼异型 (L191) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0201 黑白双星异型 (L240) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0210 黄金眼镜蛇蛇鱼 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | no | 247 | 162 |
| sp_0211 大点火口 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | no | 247 | 162 |
| sp_0217 白金黑地魔 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0230 大帆黄金胡子 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 162 |
| sp_0241 大理石神仙 (球形) | catalog_variant_identity_unresolved | partial_inheritance_review | 1 | yes | 247 | 162 |
| sp_0243 球形血鹦鹉 | commercial_hybrid_identity_unresolved | hybrid_object_specific_hold | 0 | yes | 247 | 162 |
| sp_0247 蓝钻神仙 (球形) | catalog_variant_identity_unresolved | partial_inheritance_review | 1 | yes | 247 | 162 |
| sp_0248 黄金战舰 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0263 雪中红慈鲷 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0264 白金阿里慈鲷 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0265 血中红慈鲷 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | no | 247 | 162 |
| sp_0268 球形蓝曼龙 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 162 |
| sp_0269 球形金曼龙 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 162 |
| sp_0270 白子红眼关刀 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0271 白子红宝石 | catalog_variant_identity_unresolved | identity_only_after_exact_evidence | 1 | no | 247 | 162 |
| sp_0273 血钻短鲷 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |
| sp_0280 黄金胡子 (长鳍) | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 162 |
| sp_0281 白金胡子 (大帆) | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 162 |
| sp_0282 黄金达摩 (改良) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 162 |

Pair impact is diagnostic prioritization only. A row remains fail-closed until its identity review graduates through the canonical identity/onboarding gate.
