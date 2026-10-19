# Compatibility Identity Migration Audit

> Species-level migration planning only. This is not a pair precompute table and does not create Compatibility authority.

- Active identity boundaries: **104**
- Fish-domain identity boundaries: **102**
- Current unresolved-identity fish pairs: **18079**
- One-boundary pairs: **13614**
- Two-boundary pairs: **4465**
- Auto-migratable active boundaries: **0**

## Migration buckets

- variant_object_evidence_required: 59
- catalog_structure_correction_required: 27
- parent_taxon_resolution_required: 11
- commercial_hybrid_hold: 3
- trade_name_disambiguation_required: 2
- accepted_alias_trade_disambiguation_required: 1
- taxonomic_research_candidate: 1

## Migration paths

- base_authority_or_parent_resolution: 54 objects / 7641 sole-boundary pairs
- catalog_structure_correction: 27 objects / 3549 sole-boundary pairs
- partial_inheritance_review: 10 objects / 1071 sole-boundary pairs
- identity_only_after_exact_evidence: 5 objects / 589 sole-boundary pairs
- hybrid_object_specific_hold: 3 objects / 458 sole-boundary pairs
- trade_name_disambiguation: 3 objects / 153 sole-boundary pairs
- exact_variant_label_disambiguation: 1 objects / 153 sole-boundary pairs
- taxonomic_review: 1 objects / 0 sole-boundary pairs

- Identity-only after exact evidence: **5**
- Partial inheritance review: **10**
- Reviewed research-debt holds: **4**
- Source-controlled terminal identity holds: **104**

## Reviewed evidence-debt holds

| Catalog object | Research status | Blocking reason | Reopen requirement |
| --- | --- | --- | --- |
| sp_0175 血钻神仙 | catalog_label_disambiguation_required | The catalog scientific variant label "Red" is broader than the Chinese object label 血钻 and does not uniquely identify Red Devil, Super Red, Red Diamond, Blood Diamond, koi-derived red, or another red ornamental lineage. | First establish the exact trade/lineage label represented by 血钻神仙, then provide an object-level professional source that ties that exact line to Pterophyllum scalare. |
| sp_0271 白子红宝石 | exact_object_evidence_not_found | The reviewed base-species record does not prove that the aquarium-trade Albino / 白子红宝石 object is specifically Hemichromis bimaculatus rather than another Hemichromis trade lineage. | Provide an exact-object professional/breeder/importer page that names the Albino or Albino Red Jewel object and explicitly identifies it as Hemichromis bimaculatus. |
| sp_0376 黄金斑马异型 (L134改良版) | exact_object_evidence_not_found | Multiple professional retailers corroborate ordinary L134 = Peckoltia compta, but this does not prove that the catalog Super Gold object is the same lineage or that Super Gold is only a color form. | Provide a professional breeder/importer/catalog page that explicitly labels L134 Super Gold / Peckoltia compta Super Gold and ties that exact ornamental line to Peckoltia compta. |
| sp_0399 白金蓝魔鬼 (海水) | exact_object_evidence_not_found | The base species Chrysiptera cyanea is well supported, but no reviewed exact-object source currently establishes Platinum / 白金蓝魔鬼 as a Chrysiptera cyanea ornamental form. | Provide an exact professional marine-fish supplier/breeder/catalog source that names Platinum Blue Devil (or equivalent exact object) and explicitly identifies Chrysiptera cyanea. |

## Highest-impact catalog identity debt

| Catalog object | Boundary | Migration path | Ready base | Morphology risk | Identity-unknown pairs | Sole-boundary pairs |
| --- | --- | --- | ---: | --- | ---: | ---: |
| sp_0055 金刚鹦鹉鱼 | commercial_hybrid_identity_unresolved | hybrid_object_specific_hold | 0 | no | 247 | 153 |
| sp_0065 蝶尾金鱼 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | yes | 247 | 153 |
| sp_0066 鹤顶红金鱼 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | yes | 247 | 153 |
| sp_0067 珠鳞金鱼 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | yes | 247 | 153 |
| sp_0068 水泡金鱼 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | yes | 247 | 153 |
| sp_0124 蓝眼胡子 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |
| sp_0127 巴基斯坦鼠 | trade_name_taxon_ambiguous | trade_name_disambiguation | 0 | no | 247 | 153 |
| sp_0158 红苹果剑尾 | catalog_variant_identity_unresolved | catalog_structure_correction | 1 | no | 247 | 153 |
| sp_0159 黄金胡子 (异型变种) | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |
| sp_0160 大帆白金胡子 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 153 |
| sp_0162 红草鱼 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | no | 247 | 153 |
| sp_0163 鸿运当头锦鲤 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |
| sp_0175 血钻神仙 | catalog_variant_identity_unresolved | exact_variant_label_disambiguation | 1 | no | 247 | 153 |
| sp_0179 球形曼龙 (蓝/金) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 153 |
| sp_0182 蓝眼异型 (L191) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |
| sp_0201 黑白双星异型 (L240) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |
| sp_0210 黄金眼镜蛇蛇鱼 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | no | 247 | 153 |
| sp_0211 大点火口 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | no | 247 | 153 |
| sp_0217 白金黑地魔 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |
| sp_0230 大帆黄金胡子 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 153 |
| sp_0241 大理石神仙 (球形) | catalog_variant_identity_unresolved | partial_inheritance_review | 1 | yes | 247 | 153 |
| sp_0243 球形血鹦鹉 | commercial_hybrid_identity_unresolved | hybrid_object_specific_hold | 0 | yes | 247 | 153 |
| sp_0247 蓝钻神仙 (球形) | catalog_variant_identity_unresolved | partial_inheritance_review | 1 | yes | 247 | 153 |
| sp_0248 黄金战舰 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |
| sp_0263 雪中红慈鲷 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |
| sp_0264 白金阿里慈鲷 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |
| sp_0265 血中红慈鲷 | catalog_scientific_name_unresolved | catalog_structure_correction | 0 | no | 247 | 153 |
| sp_0268 球形蓝曼龙 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 153 |
| sp_0269 球形金曼龙 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | yes | 247 | 153 |
| sp_0270 白子红眼关刀 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 247 | 153 |

Pair impact is diagnostic prioritization only. A row remains fail-closed until its identity review graduates through the canonical identity/onboarding gate.
