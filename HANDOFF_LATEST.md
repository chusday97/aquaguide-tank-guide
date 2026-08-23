# AquaGuide — Latest Handoff

**Updated:** 2026-08-23
**Repository:** `chusday97/aquaguide-tank-guide`
**Current RC1:** `integration/aquaguide-rc1` @ `5e605fb7a68001ecd80096ef42f063909cf5aa03`
**Product Truth / Context Sync:** #113 `agent/context-sync-protocol-v1`
**P0 stack:** #114 Compatibility V2 → #115 Tank State V1 → #116 Tank Evidence Adapter V1 → #117 Existing Tank Authority Wiring V1 → #118 Water Change Authority V1
**Active branch:** `agent/p0-water-change-authority-v1`
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
- Water Change candidate removes Aquarium page-level `shortestCycle -> overdue -> high-priority/current-risk` authority and routes schedule semantics through a deterministic engine.
- Overdue-days health-score deduction is removed; maintenance lateness stays maintenance unless current evidence independently supports escalation.

## Current Regression Proof

Water Change local/browser validation PASS:

1. baseline overdue + normal patrol → medium maintenance action; explicitly not current urgent state.
2. Water Change Engine domain cases → 8/8 PASS, including no-history, no-baseline, due, overdue, future-history and current-water-signal cases.
3. responsive browser regression → 390 / 900 / 1600px PASS with no horizontal overflow.
4. Existing Tank browser regression remains 3/3 PASS.
5. GP-003 returning Daily Check and GP-004 abnormal care remain PASS.

## Badcase Status

- `AQ-BC-BIOLOAD-001` — REGRESSION_VERIFIED.
- `AQ-BC-SPACE-002` — REGRESSION_VERIFIED.
- `AQ-BC-MIX-002` — REGRESSION_VERIFIED.
- `AQ-BC-SPACE-001` — REGRESSION_VERIFIED on #117.
- `AQ-BC-MIX-001` — REGRESSION_VERIFIED on #117.
- `AQ-BC-STATE-001` — REGRESSION_VERIFIED on #117.
- `AQ-BC-WATER-001` — REGRESSION_VERIFIED on current Water Change candidate.
- `AQ-BC-EVAL-002` — OPEN; pre-existing Compatibility evidence provenance drift.

## Still Open in P0

- #118 Water Change Authority V1 is open as Draft on `agent/p0-water-change-authority-v1`; permanent GitHub gates are pending on the final documentation head.
- Whole-Tank Feasibility v1 still needs group-size, equipment-capacity and reviewed physical-space dimensions.
- Existing health-score legacy surfaces remain non-authoritative support UI and should be reduced after Today Action/Current State/Water Change authority is stable.
- P0 stack remains Draft/unmerged; RC1 is unchanged.
- #112 Interactive Atlas remains frozen until P0 exit criteria pass.

## Next Execution Order

1. Validate #118 Water Change Authority V1 permanent GitHub gates.
2. If green, finish remaining Whole-Tank Feasibility dimensions.
3. Re-run P0 acceptance + Product Golden/GP-003/GP-004 on the full stack.
4. Only after P0 exit criteria are green, decide how to land the stacked PRs and then resume #112 UI work.

## Branch note

- Parallel `agent/p0-water-change-engine-v1` is an unreviewed earlier candidate and is not the active PR branch.
- Its `AQ-WATER-005/006` additions were never explicitly confirmed by the user and are intentionally absent from #118; do not treat them as accepted Product Truth.
