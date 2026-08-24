# AquaGuide — Latest Handoff

**Updated:** 2026-08-24
**Repository:** `chusday97/aquaguide-tank-guide`
**RC1 runtime baseline:** `integration/aquaguide-rc1` runtime head `f018ac03c7c4395cc2e44d1e830ba55aab10466b`
**Active branch:** `docs/context-sync-species-detail-authority-v1` — docs-only #130 landing sync
**Phase:** `post-P0 UI/UX refinement / Species Detail authority presentation aligned`
**Release boundary:** no RC1→`main` merge and no production deployment without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State, and Water Change maintenance are separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload, and maintenance lateness cannot directly manufacture current danger.

## Repository Acceptance

- P0 decision-layer stack #113→#120 is landed in RC1.
- Post-P0 UI landings: #122 Interactive Atlas, #124 mobile Encyclopedia Search, #126 mobile shell-header scope, #128 mobile Encyclopedia toolbar ownership, #130 Species Detail authority presentation.
- Old Atlas #112 is closed superseded and was never merged.
- Current runtime head `f018ac03` passed **15/15** exact-head GitHub checks.
- P0 gates PASS: Compatibility `32706086142`, Tank State `32706086230`, Tank Evidence `32706086198`, Existing Tank `32706086263`, Water Change `32706086133`, Whole-Tank `32706086286`.
- Release/UI matrix PASS: RC1 Release `32706086170`, Product Golden `32706086145`, UI Interaction `32706086202`, UI UX System `32706086124`, UI UX Visual QA `32706086214`, UI UX Golden V3 `32706086221`, UI V2 Aquarium `32706086157`, Navigation `32706086200`, Bundle Audit `32706086250`.

## UI / Authority Status

- `AQ-BC-ATLAS-001`, `AQ-BC-ATLAS-002`, `AQ-BC-UI-HEADER-001`, and `AQ-BC-UI-TOOLBAR-001` remain regression-verified on RC1.
- `AQ-BC-UI-AUTH-001` is regression-verified via #130: Species Detail overall verdict, watch, avoid and evidence now share the canonical `TankCompatibilityResult` authority.
- A generic tank-size planning prior can remain a warning/evidence item but cannot render `暂时不要 / Avoid for now` unless canonical `blockingRules` contains a block.
- Temperature / tank size / filter / heater cards remain useful as settings context, but are explicitly `鱼缸条件参考` and no longer manufacture red/yellow current-risk semantics.
- Reviewed group-requirement evidence is preserved in Species Detail canonical evidence instead of being displaced by page heuristics.
- Aquarium configured-returning-user first fold remains task-first; Care, Search, Collection and current Encyclopedia top-level IA have no browser evidence justifying broad redesign.

## Known Bounded Gaps

- Reviewed species-specific equipment requirements and hard physical-space constraints remain incomplete; missing evidence stays explicit `unknown`.
- Legacy `healthScore / tankHealthStatus / riskReminders` dead code is non-authoritative and can be removed later.
- `Result UX V1` still checks out fixed branch `agent/result-ux-v1`; until repaired, treat it as compatibility signal only, not candidate-head proof. PR-head Species Detail authority coverage lives in UI UX System.
- Production acceptance remains separate from repository acceptance: live-provider usefulness, production env/secrets, deployed smoke, and production golden paths are still required before release.
- Parallel `agent/p0-water-change-engine-v1` remains historical/unreviewed; its AQ-WATER-005/006 additions are not accepted Product Truth.

## Next Execution Order

1. Repair `Result UX V1` workflow checkout so Result UX validations run against the actual PR/RC1 head; add a contract that prevents fixed legacy branch checkout from returning.
2. Continue evidence-driven cross-route UI/UX / authority audit only after CI head integrity is restored; do not redesign already-cleared surfaces without a reproducible badcase.
3. Keep 390 / 900 / 1600 geometry and full responsive-route scans as the acceptance floor for cross-route UI changes.
4. Keep all UI work consuming landed Planning Compatibility / Current Tank State / Water Change authorities; static metadata may be reference context but cannot create a competing verdict.
5. Do not merge RC1 to `main` and do not deploy production without separate explicit authorization.
