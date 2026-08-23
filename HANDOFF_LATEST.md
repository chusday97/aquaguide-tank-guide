# AquaGuide — Latest Handoff

**Updated:** 2026-08-24
**Repository:** `chusday97/aquaguide-tank-guide`
**RC1 runtime baseline:** `integration/aquaguide-rc1` includes Interactive Atlas merge `d3e9ee54f7d0820d2fa06ac25431a429eddc4bac`; this docs-only sync may advance the branch head without changing runtime. Exact runtime head passed 15/15 repository checks.
**P0 landing:** #113 Context Sync → #114 Compatibility V2 → #115 Tank State V1 → #116 Tank Evidence Adapter V1 → #117 Existing Tank Authority V1 → #118 Water Change Authority V1 → #119 Whole-Tank Feasibility V2 → #120 Evidence Provenance V1 — all merged to RC1 with normal merge commits.
**Active branch:** `agent/atlas-landing-context-sync-v1` — docs-only Atlas landing sync
**Phase:** `Interactive Atlas landed / post-P0 UI refinement`
**Release boundary:** no RC1→`main` merge and no production deployment without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State and Water Change maintenance are separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload and maintenance lateness cannot directly manufacture a current danger.

## P0 Exit Status

- P0 decision-layer exit criteria are green and the complete stack is landed in RC1.
- Interactive Atlas runtime head `d3e9ee5` passed **15/15** GitHub checks after #122 merged into RC1.
- P0 permanent gates PASS on `d3e9ee5`: Compatibility `32653084013`, Tank State `32653084081`, Tank Evidence `32653084020`, Existing Tank `32653084011`, Water Change `32653084097`, Whole-Tank `32653083976`.
- RC1 release matrix PASS on `d3e9ee5`: RC1 Release Acceptance `32653084047`, Product Golden `32653083913`, UI Interaction `32653084003`, UI UX System `32653084112`, UI UX Visual QA `32653084006`, UI UX Golden V3 `32653084133`, UI V2 Aquarium `32653084060`, Navigation `32653084051`, Bundle Audit `32653083984`.
- `AQ-BC-EVAL-002` caused the expected Product Golden/UI Interaction failure on intermediate #114–#119 landing heads; #120 fixed the provenance duplication and both workflows are green on the final implementation head.
- Full Product Golden coverage remains green: product evaluation, evidence/coverage audits, persistence contracts, lint/build, Care/Search/Identify regressions, and GP-001/002/003/004/005 browser paths.
- Legacy authority review remains green: current risk surfaces consume Current Tank State; legacy `healthScore / tankHealthStatus / riskReminders` are unconsumed and non-authoritative.

## Badcase Status

P0 badcases are regression-verified: `AQ-BC-BIOLOAD-001`, `AQ-BC-SPACE-001/002`, `AQ-BC-MIX-001/002`, `AQ-BC-GROUP-001`, `AQ-BC-STATE-001/002`, `AQ-BC-WATER-001`, and `AQ-BC-EVAL-002`. Atlas re-entry badcase `AQ-BC-ATLAS-001` is regression-verified on RC1 via #122.

## Known Bounded Gaps

- Reviewed species-specific equipment requirements and hard physical-space constraints remain incomplete; the engine represents missing evidence as explicit `unknown` rather than inventing thresholds.
- Legacy `healthScore / tankHealthStatus / riskReminders` dead code can be removed later; it is not a decision blocker.
- Production acceptance is still separate from repository acceptance: live-provider usefulness, production environment/secrets, deployed smoke and production golden-path verification remain release requirements.
- Parallel `agent/p0-water-change-engine-v1` remains an unreviewed historical candidate. Its `AQ-WATER-005/006` additions are not accepted Product Truth.

## Interactive Atlas Re-entry — LANDED

- Old PR #112 is closed as superseded and remains historical evidence only; it was never merged.
- Refreshed PR #122 was built from final post-P0 RC1, passed **12/12** PR workflows, and merged with a normal merge commit to runtime head `d3e9ee5`.
- #122 final PR workflow included Interactive Atlas Re-entry `32652829940` plus P0/UI/security/dependency regressions; all triggered workflows passed.
- Random 3D co-display is explicitly visual-only / not a compatibility recommendation.
- `tankSize` and `waterChangeCycle` render as species reference values, not current-tank conclusions or Today Action authority.
- Compatibility remains explicit secondary intent; opening species knowledge never auto-routes into a verdict.
- Responsive browser regression remains covered at 390 / 900 / 1600 with exact discovery-scene restoration and no horizontal overflow.
- Mobile close control uses a viewport-level portal so global overflow/sticky behavior cannot hide the exit affordance.
- After merge, exact RC1 `d3e9ee5` passed the full **15/15** P0 + release matrix; Atlas did not regress decision-layer ownership.

## Next Execution Order

1. Finish this docs-only Atlas landing Context Sync on RC1.
2. Start the next UI/UX audit from the current RC1, prioritizing user-path friction and visual hierarchy without recreating page-level decision heuristics.
3. Keep all new UI work consuming the landed Planning Compatibility / Current Tank State / Water Change authorities.
4. Do not merge RC1 to `main` and do not deploy production without separate explicit authorization.
