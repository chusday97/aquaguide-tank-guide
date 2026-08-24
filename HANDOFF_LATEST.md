# AquaGuide — Latest Handoff

**Updated:** 2026-08-24
**Repository:** `chusday97/aquaguide-tank-guide`
**RC1 runtime baseline:** `integration/aquaguide-rc1` runtime head `b69c3c3e3a34f846edf6b59b3007de2ef9f85ad5`
**Active branch:** `docs/context-sync-recommendation-authority-v2` — docs-only #134/#135 Recommendation authority sync
**Phase:** `RC1 convergence / Recommendation authority aligned / production acceptance next`
**Release boundary:** no RC1→`main` merge and no production deployment without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State, and Water Change maintenance remain separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload, and maintenance lateness cannot directly manufacture current danger.

## Repository Acceptance

- P0 decision-layer stack #113→#120 is landed in RC1.
- Post-P0 landings include #122 Interactive Atlas, #124 mobile Encyclopedia Search, #126 shell-header scope, #128 Encyclopedia toolbar ownership, #130 Species Detail authority presentation, #132 Result UX head integrity, #134 Recommendation prefilter authority, and #135 Recommendation severity alignment.
- Current runtime head `b69c3c3` passed **16/16** exact-head GitHub checks; Recommendation authority is permanently covered by P0 Compatibility.
- P0 gates PASS: Compatibility `32719324560`, Tank State `32719324505`, Tank Evidence `32719324495`, Existing Tank `32719324538`, Water Change `32719324544`, Whole-Tank `32719324512`.
- Release/UI PASS: RC1 Release `32719324574`, Product Golden `32719324491`, UI Interaction `32719324513`, UI UX System `32719324624`, UI UX Visual QA `32719324529`, UI UX Golden V3 `32719324585`, UI V2 Aquarium `32719324578`, Navigation `32719324461`, Bundle Audit `32719324479`.
- Result UX candidate-head gate PASS: `32719324489`.

## UI / Authority / CI Status

- `AQ-BC-ATLAS-001`, `AQ-BC-ATLAS-002`, `AQ-BC-UI-HEADER-001`, `AQ-BC-UI-TOOLBAR-001`, and `AQ-BC-UI-AUTH-001` remain regression-verified on RC1.
- `AQ-BC-CI-001` is regression-verified via #132: Result UX now checks out `${{ github.event.pull_request.head.sha }}` and fails if `git rev-parse HEAD` differs from that expected SHA.
- The first real candidate-head run exposed a stale Result UX evaluator that still required removed heuristic `verdictReasons`; the evaluator was corrected to assert canonical `canonicalDecisionEvidence` instead of restoring the old product behavior.
- Species Detail verdict/watch/avoid/evidence remain owned by canonical `TankCompatibilityResult`; local setup metrics remain reference-only context.
- Result UX now protects both RC1-bound and `main`-bound PRs, so repository acceptance includes its real candidate-head suite rather than treating it as a compatibility-only signal.
- `AQ-BC-REC-001` is regression-verified via #134: static `housingMode = 建议单养` no longer suppresses a non-blocked candidate before canonical Compatibility.
- `AQ-BC-REC-002` is regression-verified via #135: heuristic load thresholds and reviewed min-group gaps remain warning/adjustment context and cannot override a canonical non-blocked result to `blocked` or clear the adjustable candidate pool.
- No currently reproduced Recommendation hard-block bypass remains in the audited live path; further Recommendation changes require a new canonical-vs-consumer contradiction.

## Known Bounded Gaps

- Reviewed species-specific equipment requirements and hard physical-space constraints remain incomplete; missing evidence stays explicit `unknown`.
- Legacy `healthScore / tankHealthStatus / riskReminders` and definition-only Encyclopedia fit helpers are non-authoritative dead code; cleanup is optional and not a release blocker.
- Production acceptance remains separate from repository acceptance: live-provider usefulness, production env/secrets, deployed smoke, and production golden paths are still required before release.
- Parallel `agent/p0-water-change-engine-v1` remains historical/unreviewed; its AQ-WATER-005/006 additions are not accepted Product Truth.

## Next Execution Order

1. Stop broad authority/UI refactoring unless a new reproducible canonical-vs-consumer contradiction appears.
2. Move to Production Acceptance: representative live-provider Tank Copilot usefulness evaluation, production env/secrets verification, deployed RC1 smoke, and production golden paths.
3. Keep 390 / 900 / 1600 geometry, full responsive-route scan, Product Golden, candidate-head Result UX, and Recommendation authority regression as the acceptance floor for any release fix.
4. Keep Planning Compatibility / Current Tank State / Water Change as separate authorities; static metadata remains reference context, not a competing verdict.
5. Do not merge RC1 to `main` and do not deploy production without separate explicit authorization.
