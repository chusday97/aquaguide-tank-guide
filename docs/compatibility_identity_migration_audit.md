# Compatibility Identity Migration Audit

> Species-level migration planning only. This is not a pair precompute table and does not create Compatibility authority.

- Active identity boundaries: **106**
- Fish-domain identity boundaries: **104**
- Current unresolved-identity fish pairs: **18285**
- One-boundary pairs: **13629**
- Two-boundary pairs: **4656**
- Auto-migratable active boundaries: **0**

## Migration buckets

- variant_object_evidence_required: 88
- parent_taxon_resolution_required: 11
- commercial_hybrid_hold: 3
- trade_name_disambiguation_required: 2
- accepted_alias_trade_disambiguation_required: 1
- taxonomic_research_candidate: 1

## Migration paths

- base_authority_or_parent_resolution: 56 objects / 7756 sole-boundary pairs
- exact_variant_label_disambiguation: 28 objects / 3624 sole-boundary pairs
- partial_inheritance_review: 10 objects / 1050 sole-boundary pairs
- identity_only_after_exact_evidence: 5 objects / 600 sole-boundary pairs
- hybrid_object_specific_hold: 3 objects / 449 sole-boundary pairs
- trade_name_disambiguation: 3 objects / 150 sole-boundary pairs
- taxonomic_review: 1 objects / 0 sole-boundary pairs

- Identity-only after exact evidence: **5**
- Partial inheritance review: **10**

## Highest-impact catalog identity debt

| Catalog object | Boundary | Migration path | Ready base | Morphology risk | Identity-unknown pairs | Sole-boundary pairs |
| --- | --- | --- | ---: | --- | ---: | ---: |
| sp_0055 金刚鹦鹉鱼 | commercial_hybrid_identity_unresolved | hybrid_object_specific_hold | 0 | no | 246 | 150 |
| sp_0065 蝶尾金鱼 | catalog_scientific_name_unresolved | exact_variant_label_disambiguation | 0 | yes | 246 | 150 |
| sp_0066 鹤顶红金鱼 | catalog_scientific_name_unresolved | exact_variant_label_disambiguation | 0 | yes | 246 | 150 |
| sp_0067 珠鳞金鱼 | catalog_scientific_name_unresolved | exact_variant_label_disambiguation | 0 | yes | 246 | 150 |
| sp_0068 水泡金鱼 | catalog_scientific_name_unresolved | exact_variant_label_disambiguation | 0 | yes | 246 | 150 |
| sp_0124 蓝眼胡子 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |
| sp_0127 巴基斯坦鼠 | trade_name_taxon_ambiguous | trade_name_disambiguation | 0 | no | 246 | 150 |
| sp_0158 红苹果剑尾 | catalog_variant_identity_unresolved | exact_variant_label_disambiguation | 1 | no | 246 | 150 |
| sp_0159 黄金胡子 (异型变种) | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |
| sp_0160 大帆白金胡子 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | yes | 246 | 150 |
| sp_0162 红草鱼 | catalog_scientific_name_unresolved | exact_variant_label_disambiguation | 0 | no | 246 | 150 |
| sp_0163 鸿运当头锦鲤 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |
| sp_0175 血钻神仙 | catalog_variant_identity_unresolved | identity_only_after_exact_evidence | 1 | no | 246 | 150 |
| sp_0179 球形曼龙 (蓝/金) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | yes | 246 | 150 |
| sp_0182 蓝眼异型 (L191) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |
| sp_0201 黑白双星异型 (L240) | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |
| sp_0210 黄金眼镜蛇蛇鱼 | catalog_scientific_name_unresolved | exact_variant_label_disambiguation | 0 | no | 246 | 150 |
| sp_0211 大点火口 | catalog_scientific_name_unresolved | exact_variant_label_disambiguation | 0 | no | 246 | 150 |
| sp_0217 白金黑地魔 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |
| sp_0230 大帆黄金胡子 | catalog_parent_taxon_unresolved | base_authority_or_parent_resolution | 0 | yes | 246 | 150 |
| sp_0241 大理石神仙 (球形) | catalog_variant_identity_unresolved | partial_inheritance_review | 1 | yes | 246 | 150 |
| sp_0243 球形血鹦鹉 | commercial_hybrid_identity_unresolved | hybrid_object_specific_hold | 0 | yes | 246 | 150 |
| sp_0247 蓝钻神仙 (球形) | catalog_variant_identity_unresolved | partial_inheritance_review | 1 | yes | 246 | 150 |
| sp_0248 黄金战舰 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |
| sp_0263 雪中红慈鲷 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |
| sp_0264 白金阿里慈鲷 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |
| sp_0265 血中红慈鲷 | catalog_scientific_name_unresolved | exact_variant_label_disambiguation | 0 | no | 246 | 150 |
| sp_0268 球形蓝曼龙 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | yes | 246 | 150 |
| sp_0269 球形金曼龙 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | yes | 246 | 150 |
| sp_0270 白子红眼关刀 | catalog_variant_identity_unresolved | base_authority_or_parent_resolution | 0 | no | 246 | 150 |

Pair impact is diagnostic prioritization only. A row remains fail-closed until its identity review graduates through the canonical identity/onboarding gate.
