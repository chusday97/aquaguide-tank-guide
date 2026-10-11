# Compatibility Knowledge Coverage

## Interpretation

- Completion and evidence coverage are different.
- reviewed_unknown is a valid reviewed terminal state, but it is not counted as reviewed_supported.
- Compatibility research prioritizes environment, space, social/behavior, compatibility profiles, and pair evidence.
- Feeding and care remain useful knowledge fields but do not outrank compatibility-critical gaps.
- Priority currently uses the launch-cohort/commonness proxy. It does not claim real user-query telemetry.

## Coverage snapshot

- Catalog objects: 486
- Compatibility-eligible species: 411
- Reviewed compatibility profiles: 95
- Reviewed pair rules: 21
- Reviewed stage-risk profiles: 1
- Launch-cohort species: 30
- Current insufficient pair gaps: 3
- Evidence-research-only pair gaps: 0
- Evidence-ceiling pair gaps: 3
- Boundary-blocked pair gaps: 0
- Research-actionable species: 0
- Terminal reviewed-unknown species holds: 5
- Research-actionable pairs: 0
- Terminal reviewed-unknown pair holds: 3
- Next-wave research candidates: 25

| Field | Applicable | Reviewed supported | Reviewed unknown | Supported coverage |
| --- | ---: | ---: | ---: | ---: |
| feeding | 411 | 26 | 385 | 6.3% |
| environment | 475 | 102 | 373 | 21.5% |
| space | 475 | 103 | 372 | 21.7% |
| social | 411 | 97 | 314 | 23.6% |
| care | 475 | 26 | 449 | 5.5% |

## Highest-priority species gaps

No launch-cohort species requires another ordinary research pass.

## Highest-priority pair gaps

No launch-cohort pair requires another ordinary research pass; remaining insufficient pairs are terminal reviewed holds until materially new evidence appears.

## Next-wave species research queue

1. 红苹果剑尾 (sp_0158) — environment, space, social, compatibility_profile — score 30
2. 鸿运当头锦鲤 (sp_0163) — environment, space, social, compatibility_profile — score 30
3. 黄金河虎 (sp_0173) — environment, space, social, compatibility_profile — score 30
4. 红眼白子红裙 (sp_0174) — environment, space, social, compatibility_profile — score 30
5. 血钻神仙 (sp_0175) — environment, space, social, compatibility_profile — score 30
6. 黑白大理石神仙 (sp_0176) — environment, space, social, compatibility_profile — score 30
7. 红眼蓝钻神仙 (sp_0177) — environment, space, social, compatibility_profile — score 30
8. 熊猫神仙 (sp_0178) — environment, space, social, compatibility_profile — score 30
9. 球形曼龙 (蓝/金) (sp_0179) — environment, space, social, compatibility_profile — score 30
10. 蓝眼异型 (L191) (sp_0182) — environment, space, social, compatibility_profile — score 30
11. 黑白双星异型 (L240) (sp_0201) — environment, space, social, compatibility_profile — score 30
12. 白金黑裙 (sp_0207) — environment, space, social, compatibility_profile — score 30
13. 球形红十字 (sp_0208) — environment, space, social, compatibility_profile — score 30
14. 白金西非凤凰 (sp_0214) — environment, space, social, compatibility_profile — score 30
15. 黄金雷龙 (sp_0216) — environment, space, social, compatibility_profile — score 30
16. 白金黑地魔 (sp_0217) — environment, space, social, compatibility_profile — score 30
17. 球形金波子 (sp_0219) — environment, space, social, compatibility_profile — score 30
18. 白金波子 (球形) (sp_0220) — environment, space, social, compatibility_profile — score 30
19. 长鳍阿卡西短鲷 (sp_0221) — environment, space, social, compatibility_profile — score 30
20. 长鳍红裙鱼 (sp_0227) — environment, space, social, compatibility_profile — score 30
21. 球形红裙鱼 (sp_0228) — environment, space, social, compatibility_profile — score 30
22. 白化金苔鼠 (sp_0229) — environment, space, social, compatibility_profile — score 30
23. 黄金变色龙 (改良) (sp_0234) — environment, space, social, compatibility_profile — score 30
24. 白金黑帝王灯 (sp_0235) — environment, space, social, compatibility_profile — score 30
25. 红眼白子红剑 (sp_0236) — environment, space, social, compatibility_profile — score 30

## Terminal reviewed-unknown holds

1. 白金雷龙 (sp_0224) — variant_authority_review — Base-species evidence exists, but current reviewed policy forbids automatic promotion to this ornamental variant; require direct variant evidence or an explicit reviewed bridge.
2. 水晶虾 (sp_0002) — identity_review — “水晶虾/Crystal”是贸易层名称。2014 年分类修订描述了 Caridina logemanni，且现代数据库接受该种，但当前 catalog object 没有批次级来源证明所有“水晶虾”均对应同一 taxon，因此不把贸易名强制映射到单一物种。
3. 斑马螺 (sp_0428) — identity_review — Neritina natalensis 的接受名可确认到 Vittina natalensis；但“斑马螺/zebra nerite”贸易名可用于多个 nerite taxon。接受学名修订不能自动证明用户所指贸易个体就是 V. natalensis。
4. 迷你鹦鹉鱼 (sp_0021) — identity_review — “迷你鹦鹉鱼”是商业品系名。2026 年同行评审研究将 platinum/sapphire mini parrot cichlid 作为人工杂交观赏品系，并明确指出尚无系统分类研究确认其有效属种归属；因此当前只能保留 commercial-lineage 级身份，继续禁止把 Amatitlania nigrofasciata 基础种全部字段自动提升为该商业品系 authority。
5. 糖果KOI斗鱼 (sp_0258) — evidence_ceiling — Koi/candy is a reviewed mosaic commercial phenotype of domesticated Betta splendens, but published aggression work shows substantial individual/strain variation and does not establish a Koi-specific stable social mode. Keep social authority fail-closed instead of promoting the base-species profile by color-name alone.
P1. 水晶虾 × 白金雷龙 — evidence_ceiling — Channa argus has reviewed crustacean-predation evidence, but the catalog trade object “水晶虾/Crystal Shrimp” is not securely mapped to one taxon and lacks object-level reviewed size/behavior authority. Do not promote a hard pair verdict from base-species or generic shrimp assumptions.
P2. 白金雷龙 × 斑马螺 — evidence_ceiling — Reviewed Channa argus sources support strong piscivory and some crustacean prey, but do not establish gastropod/snail predation. Zebra-nerite trade identity is also taxonomically ambiguous. Crustacean evidence must not be extrapolated to gastropods.
P3. 白金雷龙 × 地图鱼 — evidence_ceiling — USGS records adult Channa argus taking fish up to roughly one-third of its body length. Platinum snakehead reviewed maximum is about 100 cm, while Oscar reviewed maximum is about 45.7 cm, outside that supported prey-size window. No direct Channa argus × Astronotus ocellatus pair authority is reviewed, so neither safety nor predation risk is promoted.

## Research workflow

1. Take the highest-ranked gap.
2. If resolution_mode is evidence_research, research only the missing compatibility-critical field or pair relationship.
3. If resolution_mode is evidence_ceiling, do not repeat ordinary evidence search until materially new evidence or identity authority appears.
4. If a boundary code is present without an evidence ceiling, resolve the representation, variant-authority, or catalog-identity boundary before repeating ordinary evidence search.
5. Add reviewed authority with citations only when reliable evidence exists.
6. Keep reviewed_unknown when reliable evidence does not exist.
7. Regenerate this report and add regression coverage.
8. Run npm run test:backend-release-gate.
