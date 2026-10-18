# Compatibility Identity Migration Audit

> Species-level migration planning only. This is not a pair precompute table and does not create Compatibility authority.

- Active identity boundaries: **107**
- Fish-domain identity boundaries: **105**
- Current unresolved-identity fish pairs: **18188**
- One-boundary pairs: **13532**
- Two-boundary pairs: **4656**
- Auto-migratable active boundaries: **0**

## Migration buckets

- variant_object_evidence_required: 89
- parent_taxon_resolution_required: 11
- commercial_hybrid_hold: 3
- trade_name_disambiguation_required: 2
- accepted_alias_trade_disambiguation_required: 1
- taxonomic_research_candidate: 1

## Highest-impact catalog identity debt

| Catalog object | Boundary | Required resolution | Identity-unknown pairs | Sole-boundary pairs |
| --- | --- | --- | ---: | ---: |
| sp_0055 金刚鹦鹉鱼 | commercial_hybrid_identity_unresolved | commercial_hybrid_hold | 245 | 149 |
| sp_0065 蝶尾金鱼 | catalog_scientific_name_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0066 鹤顶红金鱼 | catalog_scientific_name_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0067 珠鳞金鱼 | catalog_scientific_name_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0068 水泡金鱼 | catalog_scientific_name_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0124 蓝眼胡子 | catalog_parent_taxon_unresolved | parent_taxon_resolution_required | 245 | 149 |
| sp_0127 巴基斯坦鼠 | trade_name_taxon_ambiguous | trade_name_disambiguation_required | 245 | 149 |
| sp_0158 红苹果剑尾 | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0159 黄金胡子 (异型变种) | catalog_parent_taxon_unresolved | parent_taxon_resolution_required | 245 | 149 |
| sp_0160 大帆白金胡子 | catalog_parent_taxon_unresolved | parent_taxon_resolution_required | 245 | 149 |
| sp_0162 红草鱼 | catalog_scientific_name_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0163 鸿运当头锦鲤 | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0175 血钻神仙 | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0179 球形曼龙 (蓝/金) | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0182 蓝眼异型 (L191) | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0201 黑白双星异型 (L240) | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0210 黄金眼镜蛇蛇鱼 | catalog_scientific_name_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0211 大点火口 | catalog_scientific_name_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0217 白金黑地魔 | catalog_parent_taxon_unresolved | parent_taxon_resolution_required | 245 | 149 |
| sp_0230 大帆黄金胡子 | catalog_parent_taxon_unresolved | parent_taxon_resolution_required | 245 | 149 |
| sp_0241 大理石神仙 (球形) | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0243 球形血鹦鹉 | commercial_hybrid_identity_unresolved | commercial_hybrid_hold | 245 | 149 |
| sp_0247 蓝钻神仙 (球形) | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0248 黄金战舰 | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0263 雪中红慈鲷 | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0264 白金阿里慈鲷 | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0265 血中红慈鲷 | catalog_scientific_name_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0268 球形蓝曼龙 | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0269 球形金曼龙 | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |
| sp_0270 白子红眼关刀 | catalog_variant_identity_unresolved | variant_object_evidence_required | 245 | 149 |

Pair impact is diagnostic prioritization only. A row remains fail-closed until its identity review graduates through the canonical identity/onboarding gate.
