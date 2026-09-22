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
- Reviewed compatibility profiles: 34
- Reviewed pair rules: 5
- Reviewed stage-risk profiles: 1
- Launch-cohort species: 30
- Current insufficient pair gaps: 19
- Evidence-research-only pair gaps: 0
- Boundary-blocked pair gaps: 19

| Field | Applicable | Reviewed supported | Reviewed unknown | Supported coverage |
| --- | ---: | ---: | ---: | ---: |
| feeding | 411 | 1 | 410 | 0.2% |
| environment | 475 | 38 | 437 | 8.0% |
| space | 475 | 39 | 436 | 8.2% |
| social | 411 | 37 | 374 | 9.0% |
| care | 475 | 1 | 474 | 0.2% |

## Highest-priority species gaps

1. 白金雷龙 (sp_0224) — environment, space, social, compatibility_profile — variant_authority_review [variant_authority_not_promotable] — unlocks 19 insufficient pairs — score 66
2. 水晶虾 (sp_0002) — environment, space, social — identity_review [catalog_identity_unresolved] — unlocks 1 insufficient pairs — score 25
3. 迷你鹦鹉鱼 (sp_0021) — environment, space, social — identity_review [catalog_identity_unresolved] — unlocks 1 insufficient pairs — score 25
4. 斑马螺 (sp_0428) — environment, space, social — identity_review [catalog_identity_unresolved] — unlocks 1 insufficient pairs — score 25
5. 糖果KOI斗鱼 (sp_0258) — environment, space, social — identity_review [catalog_identity_unresolved] — unlocks 0 insufficient pairs — score 23

## Highest-priority pair gaps

1. 极火虾 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
2. 水晶虾 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [catalog_identity_unresolved, variant_authority_not_promotable] — score 29
3. 黑裙鱼 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [catalog_identity_unresolved, variant_authority_not_promotable] — score 29
4. 月光鱼 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
5. 樱桃灯 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
6. 小精灵 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
7. 迷你鹦鹉鱼 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [catalog_identity_unresolved, variant_authority_not_promotable] — score 29
8. 白金雷龙 × 斑马螺 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [catalog_identity_unresolved, variant_authority_not_promotable] — score 29
9. 白金雷龙 × 红绿灯 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
10. 白金雷龙 × 白云金丝 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
11. 白金雷龙 × 斑马鱼 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
12. 白金雷龙 × 孔雀鱼 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
13. 白金雷龙 × 玛丽鱼 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
14. 白金雷龙 × 红剑鱼 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
15. 白金雷龙 × 虎皮鱼 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
16. 白金雷龙 × 熊猫鼠 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
17. 白金雷龙 × 地图鱼 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
18. 白金雷龙 × 黑壳虾 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
19. 白金雷龙 × 金三角灯 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29

## Research workflow

1. Take the highest-ranked gap.
2. If resolution_mode is evidence_research, research only the missing compatibility-critical field or pair relationship.
3. If a boundary code is present, resolve the representation, variant-authority, or catalog-identity boundary before repeating ordinary evidence search.
4. Add reviewed authority with citations only when reliable evidence exists.
5. Keep reviewed_unknown when reliable evidence does not exist.
6. Regenerate this report and add regression coverage.
7. Run npm run test:backend-release-gate.
