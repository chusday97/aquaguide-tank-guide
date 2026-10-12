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
- Reviewed compatibility profiles: 100
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
| environment | 475 | 107 | 368 | 22.5% |
| space | 475 | 108 | 367 | 22.7% |
| social | 411 | 102 | 309 | 24.8% |
| care | 475 | 26 | 449 | 5.5% |

## Highest-priority species gaps

No launch-cohort species requires another ordinary research pass.

## Highest-priority pair gaps

No launch-cohort pair requires another ordinary research pass; remaining insufficient pairs are terminal reviewed holds until materially new evidence appears.

## Next-wave species research queue

1. 红草鱼 (sp_0162) — environment, space, social, compatibility_profile — score 25
2. 兔螺 (sp_0034) — environment, space, social, compatibility_profile — score 24
3. 豹点螺 (sp_0036) — environment, space, social, compatibility_profile — score 24
4. 黑金刚米虾 (sp_0164) — environment, space, social — score 24
5. 黄金背米虾 (sp_0165) — environment, space, social — score 24
6. 极火米虾 (高等级) (sp_0166) — environment, space, social — score 24
7. 黑金刚米虾 (极品) (sp_0238) — environment, space, social — score 24
8. 血腥玛丽米虾 (sp_0239) — environment, space, social — score 24
9. 红眼金苹果螺 (sp_0249) — environment, space, social, compatibility_profile — score 24
10. 蓝珍珠神秘螺 (sp_0250) — environment, space, social, compatibility_profile — score 24
11. 紫晶神秘螺 (sp_0251) — environment, space, social, compatibility_profile — score 24
12. 黄金米虾 (极品) (sp_0274) — environment, space, social — score 24
13. 血丝米虾 (sp_0275) — environment, space, social — score 24
14. 蓝钻米虾 (sp_0276) — environment, space, social — score 24
15. 红白水晶虾 (S级) (sp_0277) — environment, space, social — score 24
16. 黑金刚水晶虾 (sp_0278) — environment, space, social — score 24
17. 黄金背蓝丝绒虾 (sp_0279) — environment, space, social — score 24
18. 黄金背蓝钻虾 (sp_0342) — environment, space, social — score 24
19. 蓝珍珠米虾 (sp_0396) — environment, space, social — score 24
20. 红白水晶虾 (SSS级) (sp_0397) — environment, space, social — score 24
21. 黑金刚水晶虾 (多纹) (sp_0398) — environment, space, social — score 24
22. 皮革珊瑚 (sp_0320) — environment, space, social, compatibility_profile — score 23
23. 红菇珊瑚 (sp_0324) — environment, space, social, compatibility_profile — score 23
24. 管虫 (五彩) (sp_0327) — environment, space, social, compatibility_profile — score 23
25. 鹿角珊瑚 (SPS) (sp_0329) — environment, space, social, compatibility_profile — score 23

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
