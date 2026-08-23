# AquaGuide — Latest Handoff

**Updated:** 2026-08-23
**Repository:** `chusday97/aquaguide-tank-guide`
**Current RC1:** `integration/aquaguide-rc1` contains the complete P0 landing through implementation merge `adf44c082a833d51bf1ffa10ff41cb0d123aaea1`; later docs-only sync may advance the branch head without changing runtime.
**P0 landing:** #113 Context Sync → #114 Compatibility V2 → #115 Tank State V1 → #116 Tank Evidence Adapter V1 → #117 Existing Tank Authority V1 → #118 Water Change Authority V1 → #119 Whole-Tank Feasibility V2 → #120 Evidence Provenance V1 — all merged to RC1 with normal merge commits.
**Active branch:** `agent/p0-landing-context-sync-v1` (docs-only Context Sync)
**Phase:** `P0 landed / post-P0 UI re-entry review`
**Release boundary:** no RC1→`main` merge and no production deployment without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State and Water Change maintenance are separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload and maintenance lateness cannot directly manufacture a current danger.

## P0 Exit Status

- P0 decision-layer exit criteria are green and the complete stack is landed in RC1.
- Final implementation head `adf44c0` passed **15/15** GitHub checks.
- P0 permanent gates PASS: Compatibility `32644603008`, Tank State `32644603012`, Tank Evidence `32644603024`, Existing Tank `32644603056`, Water Change `32644602993`, Whole-Tank `32644603019`.
- RC1 release matrix PASS: RC1 Release Acceptance `32644602987`, Product Golden `32644603004`, UI Interaction `32644602969`, UI UX System `32644603040`, UI UX Visual QA `32644602976`, UI UX Golden V3 `32644603010`, UI V2 Aquarium `32644602991`, Navigation `32644602981`, Bundle Audit `32644602972`.
- `AQ-BC-EVAL-002` caused the expected Product Golden/UI Interaction failure on intermediate #114–#119 landing heads; #120 fixed the provenance duplication and both workflows are green on the final implementation head.
- Full Product Golden coverage remains green: product evaluation, evidence/coverage audits, persistence contracts, lint/build, Care/Search/Identify regressions, and GP-001/002/003/004/005 browser paths.
- Legacy authority review remains green: current risk surfaces consume Current Tank State; legacy `healthScore / tankHealthStatus / riskReminders` are unconsumed and non-authoritative.

## Badcase Status

P0 badcases are regression-verified: `AQ-BC-BIOLOAD-001`, `AQ-BC-SPACE-001/002`, `AQ-BC-MIX-001/002`, `AQ-BC-GROUP-001`, `AQ-BC-STATE-001/002`, `AQ-BC-WATER-001`, and `AQ-BC-EVAL-002`.

## Known Bounded Gaps

- Reviewed species-specific equipment requirements and hard physical-space constraints remain incomplete; the engine represents missing evidence as explicit `unknown` rather than inventing thresholds.
- Legacy `healthScore / tankHealthStatus / riskReminders` dead code can be removed later; it is not a decision blocker.
- Production acceptance is still separate from repository acceptance: live-provider usefulness, production environment/secrets, deployed smoke and production golden-path verification remain release requirements.
- Parallel `agent/p0-water-change-engine-v1` remains an unreviewed historical candidate. Its `AQ-WATER-005/006` additions are not accepted Product Truth.

## Next Execution Order

1. Finish this docs-only Context Sync on RC1.
2. Unfreeze #112 Interactive Atlas for **re-entry review only**: retarget/rebase its intent against the new RC1 decision layer and audit its diff before making new UI changes.
3. Do not merge the stale #112 branch as-is. Preserve the new Planning / Current Tank State / Water Change authority boundaries and run the AquaGuide UI/UX gate plus responsive/browser regressions on any refreshed candidate.
4. After #112 review, continue UI work only where it consumes the authoritative decision layer rather than recreating heuristics in page code.
5. Keep RC1→`main` and production deployment blocked until separately authorized release acceptance.
