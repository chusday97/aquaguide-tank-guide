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
- Reviewed compatibility profiles: 32
- Reviewed pair rules: 5
- Reviewed stage-risk profiles: 1
- Launch-cohort species: 30

| Field | Applicable | Reviewed supported | Reviewed unknown | Supported coverage |
| --- | ---: | ---: | ---: | ---: |
| feeding | 411 | 1 | 410 | 0.2% |
| environment | 475 | 26 | 449 | 5.5% |
| space | 475 | 36 | 439 | 7.6% |
| social | 411 | 33 | 378 | 8.0% |
| care | 475 | 1 | 474 | 0.2% |

## Highest-priority species gaps

1. 金波子 (sp_0016) — compatibility_profile — unlocks 24 insufficient pairs — score 56
2. 高体鳑鲏 (sp_0475) — social, compatibility_profile — unlocks 23 insufficient pairs — score 60
3. 白金雷龙 (sp_0224) — environment, space, social, compatibility_profile — unlocks 19 insufficient pairs — score 66
4. 极火虾 (sp_0001) — environment, space, social — unlocks 3 insufficient pairs — score 29
5. 水晶虾 (sp_0002) — environment, space, social — unlocks 3 insufficient pairs — score 29
6. 迷你鹦鹉鱼 (sp_0021) — environment, space, social — unlocks 3 insufficient pairs — score 29
7. 斑马螺 (sp_0428) — environment, space, social — unlocks 3 insufficient pairs — score 29
8. 黑壳虾 (sp_0459) — environment, space, social — unlocks 3 insufficient pairs — score 29
9. 红绿灯 (sp_0431) — environment — unlocks 3 insufficient pairs — score 21
10. 斑马鱼 (sp_0435) — environment — unlocks 3 insufficient pairs — score 21
11. 孔雀鱼 (sp_0436) — environment — unlocks 3 insufficient pairs — score 21
12. 虎皮鱼 (sp_0439) — environment — unlocks 3 insufficient pairs — score 21
13. 熊猫鼠 (sp_0443) — environment — unlocks 3 insufficient pairs — score 21
14. 宝莲灯 (sp_0432) — environment — unlocks 2 insufficient pairs — score 19
15. 白云金丝 (sp_0434) — environment — unlocks 2 insufficient pairs — score 19
16. 天使鱼（神仙鱼） (sp_0446) — environment — unlocks 2 insufficient pairs — score 19
17. 咖啡鼠 (sp_0014) — environment — unlocks 1 insufficient pairs — score 17
18. 珍珠赤雷龙 (sp_0049) — environment, space, social — unlocks 0 insufficient pairs — score 23
19. 糖果KOI斗鱼 (sp_0258) — environment, space, social — unlocks 0 insufficient pairs — score 23

## Highest-priority pair gaps

1. 极火虾 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
2. 水晶虾 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
3. 黑裙鱼 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
4. 月光鱼 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
5. 樱桃灯 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
6. 小精灵 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
7. 金波子 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
8. 迷你鹦鹉鱼 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
9. 斑马螺 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
10. 红绿灯 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
11. 宝莲灯 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
12. 红鼻剪刀 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
13. 白云金丝 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
14. 斑马鱼 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
15. 孔雀鱼 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
16. 玛丽鱼 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
17. 红剑鱼 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
18. 虎皮鱼 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
19. 熊猫鼠 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30
20. 珍珠马甲 × 高体鳑鲏 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed, water_type_unknown — score 30

## Research workflow

1. Take the highest-ranked gap.
2. Research only the missing compatibility-critical field or pair relationship.
3. Add reviewed authority with citations only when reliable evidence exists.
4. Keep reviewed_unknown when reliable evidence does not exist.
5. Regenerate this report and add regression coverage.
6. Run npm run test:backend-release-gate.
