# AquaGuide — Latest Handoff

**Updated:** 2026-08-23
**Repository:** `chusday97/aquaguide-tank-guide`
**Current RC1:** `integration/aquaguide-rc1` @ `5e605fb7a68001ecd80096ef42f063909cf5aa03`
**Product Truth / Context Sync:** #113 `agent/context-sync-protocol-v1`
**P0 stack:** #114 Compatibility V2 → #115 Tank State V1 → #116 Tank Evidence Adapter V1 → #117 Existing Tank Authority Wiring V1 → #118 Water Change Authority V1 → #119 Whole-Tank Feasibility V2
**Active branch:** `agent/p0-whole-tank-feasibility-v2`
**Phase:** `P0 decision-layer consolidation`
**Release boundary:** no P0 stack merge to RC1, no RC1→main merge, and no production deploy without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State and Water Change maintenance are separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload and maintenance lateness cannot directly manufacture a current danger.

## Verified P0 Stack

- #114 Compatibility gates PASS.
- #115 Tank State gates PASS.
- #116 Evidence Adapter gates PASS.
- #117 Existing Tank Authority permanent gates PASS: Existing Tank `32623274776`, Evidence `32623274708`, Tank State `32623274730`, Compatibility `32623274742`.
- Fail-before commit `1afcd15` reproduces 0/3 Water Change authority gaps on #117 head.
- #118 permanent gates PASS on `c6f17e5`: Water Change `32638235738`, Existing Tank `32638235771`, Evidence `32638235730`, Tank State `32638235711`, Compatibility `32638235721`.
- Water Change candidate removes Aquarium page-level `shortestCycle -> overdue -> high-priority/current-risk` authority and routes schedule semantics through a deterministic engine.
- Overdue-days health-score deduction is removed; maintenance lateness stays maintenance unless current evidence independently supports escalation.
- Whole-Tank V2 fail-before commit `0fe6e4e` reproduces 0/3 missing-dimension gaps on #118 head.
- #119 Whole-Tank Feasibility V2 adds inspectable group / physical-space / equipment / bioload dimensions with separate passed/warning/missing semantics.
- Reviewed `minimumGroupSize` is authoritative; keyword group-size guesses and temperament-bioload inflation are removed from downstream consumers.
- Generic `tankSize` stays planning space guidance. Missing reviewed equipment or hard physical-space requirements remain explicit unknown rather than fabricated pass/block.

## Current Regression Proof

Latest local regression PASS:

1. Whole-Tank Feasibility V2 → 7/7 PASS.
2. reviewed group minimum 5 is not overwritten by legacy keyword 6.
3. generic physical-space guidance remains non-hard; equipment sufficiency stays unknown without reviewed requirements.
4. Whole-Tank pass/missing rules do not manufacture Current Tank medium priors.
5. P0 Compatibility 5/5, Compatibility, Species Fit, Addition Intent, Livestock Recording, Tank Evidence, Tank State 11/11, Existing Tank Authority and Water Change 8/8 remain PASS.
6. Core Flow v1/v2, Visual Results, Golden Path contract, TypeScript, production build and `git diff --check` PASS.
7. Existing Water Change responsive browser regression and GP-003/GP-004 remain proven on #118; no UI surface changed in #119.

## Badcase Status

- `AQ-BC-BIOLOAD-001` — REGRESSION_VERIFIED.
- `AQ-BC-SPACE-002` — REGRESSION_VERIFIED.
- `AQ-BC-MIX-002` — REGRESSION_VERIFIED on #119.
- `AQ-BC-GROUP-001` — REGRESSION_VERIFIED on #119.
- `AQ-BC-STATE-002` — REGRESSION_VERIFIED on #119.
- `AQ-BC-SPACE-001` — REGRESSION_VERIFIED on #117.
- `AQ-BC-MIX-001` — REGRESSION_VERIFIED on #117.
- `AQ-BC-STATE-001` — REGRESSION_VERIFIED on #117.
- `AQ-BC-WATER-001` — REGRESSION_VERIFIED on current Water Change candidate.
- `AQ-BC-EVAL-002` — OPEN; pre-existing Compatibility evidence provenance drift.

## Still Open in P0

- #118 Water Change Authority V1 is open as Draft and permanent gates are green; it remains unmerged.
- #119 Whole-Tank Feasibility V2 is open as Draft; local implementation/regression is green and permanent GitHub gates are pending.
- Reviewed knowledge coverage is still incomplete for species-specific equipment requirements and hard physical-space constraints; the engine now represents those gaps as explicit unknown rather than inventing thresholds.
- Existing health-score legacy surfaces remain non-authoritative support UI and should be reduced after Today Action/Current State/Water Change authority is stable.
- P0 stack remains Draft/unmerged; RC1 is unchanged.
- #112 Interactive Atlas remains frozen until P0 exit criteria pass.

## Next Execution Order

1. Validate #119 Whole-Tank Feasibility V2 permanent GitHub gates.
2. Resolve the still-open `AQ-BC-EVAL-002` Compatibility evidence-provenance drift.
3. Re-run P0 acceptance + Product Golden/GP-003/GP-004 on the full stack.
4. Only after P0 exit criteria are green, decide how to land the stacked PRs and then resume #112 UI work.

## Branch note

- Parallel `agent/p0-water-change-engine-v1` is an unreviewed earlier candidate and is not the active PR branch.
- Its `AQ-WATER-005/006` additions were never explicitly confirmed by the user and are intentionally absent from #118; do not treat them as accepted Product Truth.
