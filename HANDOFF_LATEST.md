# AquaGuide — Latest Handoff

**Updated:** 2026-08-24
**Repository:** `chusday97/aquaguide-tank-guide`
**Current RC1:** `integration/aquaguide-rc1` @ `d426cb6c4a65a080419091eed9100c209021e868` — P0 + landing Context Sync complete; exact-head 15/15 repository checks PASS.
**P0 landing:** #113 Context Sync → #114 Compatibility V2 → #115 Tank State V1 → #116 Tank Evidence Adapter V1 → #117 Existing Tank Authority V1 → #118 Water Change Authority V1 → #119 Whole-Tank Feasibility V2 → #120 Evidence Provenance V1 — all merged to RC1 with normal merge commits.
**Active branch:** `agent/interactive-atlas-reentry-v1` — Draft PR #122
**Phase:** `post-P0 UI re-entry / Interactive Atlas`
**Release boundary:** no RC1→`main` merge and no production deployment without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State and Water Change maintenance are separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload and maintenance lateness cannot directly manufacture a current danger.

## P0 Exit Status

- P0 decision-layer exit criteria are green and the complete stack is landed in RC1.
- Final RC1 head `d426cb6` passed **15/15** GitHub checks after the docs-only landing Context Sync; runtime implementation head `adf44c0` had already passed the same matrix before that sync.
- P0 permanent gates PASS on `d426cb6`: Compatibility `32645224544`, Tank State `32645224516`, Tank Evidence `32645224509`, Existing Tank `32645224501`, Water Change `32645224500`, Whole-Tank `32645224522`.
- RC1 release matrix PASS on `d426cb6`: RC1 Release Acceptance `32645224577`, Product Golden `32645224523`, UI Interaction `32645224507`, UI UX System `32645224601`, UI UX Visual QA `32645224564`, UI UX Golden V3 `32645224583`, UI V2 Aquarium `32645224540`, Navigation `32645224552`, Bundle Audit `32645224510`.
- `AQ-BC-EVAL-002` caused the expected Product Golden/UI Interaction failure on intermediate #114–#119 landing heads; #120 fixed the provenance duplication and both workflows are green on the final implementation head.
- Full Product Golden coverage remains green: product evaluation, evidence/coverage audits, persistence contracts, lint/build, Care/Search/Identify regressions, and GP-001/002/003/004/005 browser paths.
- Legacy authority review remains green: current risk surfaces consume Current Tank State; legacy `healthScore / tankHealthStatus / riskReminders` are unconsumed and non-authoritative.

## Badcase Status

P0 badcases are regression-verified: `AQ-BC-BIOLOAD-001`, `AQ-BC-SPACE-001/002`, `AQ-BC-MIX-001/002`, `AQ-BC-GROUP-001`, `AQ-BC-STATE-001/002`, `AQ-BC-WATER-001`, and `AQ-BC-EVAL-002`. Atlas re-entry badcase `AQ-BC-ATLAS-001` is regression-verified on #122.

## Known Bounded Gaps

- Reviewed species-specific equipment requirements and hard physical-space constraints remain incomplete; the engine represents missing evidence as explicit `unknown` rather than inventing thresholds.
- Legacy `healthScore / tankHealthStatus / riskReminders` dead code can be removed later; it is not a decision blocker.
- Production acceptance is still separate from repository acceptance: live-provider usefulness, production environment/secrets, deployed smoke and production golden-path verification remain release requirements.
- Parallel `agent/p0-water-change-engine-v1` remains an unreviewed historical candidate. Its `AQ-WATER-005/006` additions are not accepted Product Truth.

## Interactive Atlas Re-entry — #122

- Old PR #112 is stale against pre-P0 RC1 and is superseded by #122; do not merge #112 as-is.
- #122 starts from final RC1 `d426cb6` and preserves the original Atlas exploration intent without restoring page-level decision authority.
- Random 3D co-display is explicitly visual-only / not a compatibility recommendation.
- `tankSize` and `waterChangeCycle` are rendered as species reference values, not current-tank conclusions or Today Action authority.
- Compatibility remains explicit secondary intent; opening species knowledge never auto-routes into a verdict.
- Atlas authority contract PASS; Product Evaluation, Golden Path contract, P0 Compatibility/Tank State/Water Change, TypeScript and production build PASS.
- Responsive browser regression PASS at 390 / 900 / 1600: visual-only discovery → knowledge panel → variant preview/commit → close → exact scene restore, with no horizontal overflow.
- Mobile close control uses a viewport-level portal so global overflow/sticky behavior cannot hide the exit affordance.

## Next Execution Order

1. Wait for #122 GitHub gates on the final Context Sync head; any red gate blocks landing.
2. Keep old #112 closed/superseded and use #122 as the only active Atlas candidate.
3. If #122 is fully green, perform a final diff/authority review before any RC1 merge decision.
4. Do not merge RC1 to `main` and do not deploy production without separate explicit authorization.
