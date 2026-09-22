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
- Reviewed pair rules: 17
- Reviewed stage-risk profiles: 1
- Launch-cohort species: 30
- Current insufficient pair gaps: 7
- Evidence-research-only pair gaps: 0
- Boundary-blocked pair gaps: 7

| Field | Applicable | Reviewed supported | Reviewed unknown | Supported coverage |
| --- | ---: | ---: | ---: | ---: |
| feeding | 411 | 1 | 410 | 0.2% |
| environment | 475 | 40 | 435 | 8.4% |
| space | 475 | 42 | 433 | 8.8% |
| social | 411 | 37 | 374 | 9.0% |
| care | 475 | 1 | 474 | 0.2% |

## Highest-priority species gaps

1. 白金雷龙 (sp_0224) — social, compatibility_profile — variant_authority_review [variant_authority_not_promotable] — unlocks 7 insufficient pairs — score 34
2. 水晶虾 (sp_0002) — environment, space, social — identity_review [trade_name_taxon_ambiguous] — unlocks 1 insufficient pairs — score 25
3. 斑马螺 (sp_0428) — environment, space, social — identity_review [accepted_taxon_alias_trade_ambiguous] — unlocks 1 insufficient pairs — score 25
4. 迷你鹦鹉鱼 (sp_0021) — environment, social — identity_review [commercial_hybrid_identity_unresolved] — unlocks 1 insufficient pairs — score 21
5. 糖果KOI斗鱼 (sp_0258) — social — evidence_ceiling [variant_social_not_established] — unlocks 0 insufficient pairs — score 15

## Highest-priority pair gaps

1. 极火虾 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
2. 水晶虾 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [trade_name_taxon_ambiguous, variant_authority_not_promotable] — score 29
3. 迷你鹦鹉鱼 × 白金雷龙 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [commercial_hybrid_identity_unresolved, variant_authority_not_promotable] — score 29
4. 白金雷龙 × 斑马螺 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [accepted_taxon_alias_trade_ambiguous, variant_authority_not_promotable] — score 29
5. 白金雷龙 × 红剑鱼 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
6. 白金雷龙 × 地图鱼 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29
7. 白金雷龙 × 黑壳虾 — missing: behavior_evidence_unreviewed, species_evidence_unreviewed — boundary_blocked [variant_authority_not_promotable] — score 29

## Research workflow

1. Take the highest-ranked gap.
2. If resolution_mode is evidence_research, research only the missing compatibility-critical field or pair relationship.
3. If a boundary code is present, resolve the representation, variant-authority, or catalog-identity boundary before repeating ordinary evidence search.
4. Add reviewed authority with citations only when reliable evidence exists.
5. Keep reviewed_unknown when reliable evidence does not exist.
6. Regenerate this report and add regression coverage.
7. Run npm run test:backend-release-gate.
