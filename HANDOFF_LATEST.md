# AquaGuide — Latest Handoff

**Updated:** 2026-08-24
**Repository:** `chusday97/aquaguide-tank-guide`
**RC1 runtime baseline:** `integration/aquaguide-rc1` runtime head `c491effd9cd65bdde3ee860dd133a9cc716ed6af`
**Active branch:** `docs/context-sync-result-ux-head-integrity-v1` — docs-only #132 landing sync
**Phase:** `post-P0 UI/UX refinement / Result UX candidate-head integrity restored`
**Release boundary:** no RC1→`main` merge and no production deployment without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State, and Water Change maintenance remain separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload, and maintenance lateness cannot directly manufacture current danger.

## Repository Acceptance

- P0 decision-layer stack #113→#120 is landed in RC1.
- Post-P0 landings include #122 Interactive Atlas, #124 mobile Encyclopedia Search, #126 shell-header scope, #128 Encyclopedia toolbar ownership, #130 Species Detail authority presentation, and #132 Result UX head integrity.
- Current runtime head `c491effd` passed **16/16** exact-head GitHub checks: the previous 15-check baseline plus candidate-head Result UX.
- P0 gates PASS: Compatibility `32708929731`, Tank State `32708929674`, Tank Evidence `32708929745`, Existing Tank `32708929634`, Water Change `32708929852`, Whole-Tank `32708929726`.
- Release/UI PASS: RC1 Release `32708929579`, Product Golden `32708929733`, UI Interaction `32708929659`, UI UX System `32708929656`, UI UX Visual QA `32708929663`, UI UX Golden V3 `32708929608`, UI V2 Aquarium `32708929720`, Navigation `32708929775`, Bundle Audit `32708929669`.
- Result UX candidate-head gate PASS: `32708929859`.

## UI / Authority / CI Status

- `AQ-BC-ATLAS-001`, `AQ-BC-ATLAS-002`, `AQ-BC-UI-HEADER-001`, `AQ-BC-UI-TOOLBAR-001`, and `AQ-BC-UI-AUTH-001` remain regression-verified on RC1.
- `AQ-BC-CI-001` is regression-verified via #132: Result UX now checks out `${{ github.event.pull_request.head.sha }}` and fails if `git rev-parse HEAD` differs from that expected SHA.
- The first real candidate-head run exposed a stale Result UX evaluator that still required removed heuristic `verdictReasons`; the evaluator was corrected to assert canonical `canonicalDecisionEvidence` instead of restoring the old product behavior.
- Species Detail verdict/watch/avoid/evidence remain owned by canonical `TankCompatibilityResult`; local setup metrics remain reference-only context.
- Result UX now protects both RC1-bound and `main`-bound PRs, so repository acceptance includes its real candidate-head suite rather than treating it as a compatibility-only signal.

## Known Bounded Gaps

- Reviewed species-specific equipment requirements and hard physical-space constraints remain incomplete; missing evidence stays explicit `unknown`.
- Legacy `healthScore / tankHealthStatus / riskReminders` and definition-only Encyclopedia fit helpers are non-authoritative dead code; cleanup is optional and not a release blocker.
- Production acceptance remains separate from repository acceptance: live-provider usefulness, production env/secrets, deployed smoke, and production golden paths are still required before release.
- Parallel `agent/p0-water-change-engine-v1` remains historical/unreviewed; its AQ-WATER-005/006 additions are not accepted Product Truth.

## Next Execution Order

1. Continue evidence-driven cross-route UI/authority audit now that Result UX candidate-head integrity is trustworthy; require a reproducible browser/semantic badcase before changing already-cleared surfaces.
2. Prioritize live surfaces where presentation may combine canonical decisions with static metadata or local heuristics; distinguish live consumers from dead code before acting.
3. Keep 390 / 900 / 1600 geometry, full responsive-route scan, Product Golden, and candidate-head Result UX as the acceptance floor for relevant UI changes.
4. Keep all UI work consuming landed Planning Compatibility / Current Tank State / Water Change authorities; static metadata may be reference context but cannot create a competing verdict.
5. Do not merge RC1 to `main` and do not deploy production without separate explicit authorization.
