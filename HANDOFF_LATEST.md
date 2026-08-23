# AquaGuide — Latest Handoff

**Updated:** 2026-08-23
**Repository:** `chusday97/aquaguide-tank-guide`
**Current RC1:** `integration/aquaguide-rc1` @ `5e605fb7a68001ecd80096ef42f063909cf5aa03`
**Product Truth / Context Sync:** #113 `agent/context-sync-protocol-v1`
**P0 stack:** #114 Compatibility V2 → #115 Tank State V1 → #116 Tank Evidence Adapter V1 → #117 Existing Tank Authority Wiring V1 → #118 Water Change Authority V1 → #119 Whole-Tank Feasibility V2 → #120 Evidence Provenance V1
**Active branch:** `agent/p0-compatibility-evidence-provenance-v1`
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
- #119 permanent gates PASS on `0b72b9a`: Whole-Tank `32640537915`, Compatibility `32640537970`, Evidence `32640537930`, Tank State `32640537933`, Existing Tank `32640537926`, Water Change `32640537939`.
- Reviewed `minimumGroupSize` is authoritative; keyword group-size guesses and temperament-bioload inflation are removed from downstream consumers.
- Generic `tankSize` stays planning space guidance. Missing reviewed equipment or hard physical-space requirements remain explicit unknown rather than fabricated pass/block.
- #120 Compatibility Evidence Provenance V1 removes lossy duplicate `pair_rule_* -> tank_condition` conversion and keeps direct reviewed pair rules evidence-aware exactly once.
- `test:compatibility-evidence-coverage` now passes on 132 priority directions and is part of the permanent P0 Compatibility workflow.
- #120 permanent gates PASS on `f4c02d0`: Compatibility `32640983537`, Whole-Tank `32640983542`, Tank State `32640983524`.
- Full Product Golden workflow revalidation PASS on #120 stack: product evaluation (19 features / 114 states / 53 badcases), Golden Path contract, compatibility evidence/coverage audits, repository persistence contracts, lint/build, Care/Search/Identify browser regressions, and GP-001/002/003/004/005 continuous browser paths.
- Legacy authority exit review PASS: current `conflicts` comes only from `buildCurrentTankRiskItems(Current Tank State)`; `healthScore / tankHealthStatus / riskReminders` are unconsumed legacy code and diagnosis does not read `healthScore/riskCount`. They have no current decision authority.
- P0 decision-layer exit criteria are green on the current stack. Knowledge coverage remains intentionally limited/fail-closed and is not equivalent to broad husbandry completeness.

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
- `AQ-BC-EVAL-002` — REGRESSION_VERIFIED on #120; permanent gates PASS.

## Still Open in P0

- #118 Water Change Authority V1 is open as Draft and permanent gates are green; it remains unmerged.
- #119 Whole-Tank Feasibility V2 is open as Draft; all six permanent GitHub gates are green. It remains unmerged.
- #120 Compatibility Evidence Provenance V1 is open as Draft; local full regression and all triggered permanent gates are green. It remains unmerged.
- Reviewed knowledge coverage is still incomplete for species-specific equipment requirements and hard physical-space constraints; the engine now represents those gaps as explicit unknown rather than inventing thresholds.
- Legacy `healthScore / tankHealthStatus / riskReminders` code is non-authoritative and currently unconsumed; remove it in later cleanup, not as a P0 decision blocker.
- P0 stack remains Draft/unmerged; RC1 is unchanged.
- #112 Interactive Atlas remains frozen until P0 exit criteria pass.

## Stacked PR Landing Audit — READY, NOT AUTHORIZED

Git ancestry proof: `RC1 -> #113 -> #114 -> #115 -> #116 -> #117 -> #118 -> #119 -> #120` is strictly linear. Every `git merge-base --is-ancestor` check passes and each merge-base equals the previous layer head.

Landing rule: use **merge commit only**. Do not squash or rebase any layer; those methods would break stacked ancestry and can make already-landed commits reappear when the next PR is retargeted. Repository settings allow normal merge commits.

| PR | Expected head | Incremental baseline | Dry-run delta |
| --- | --- | --- | --- |
| #113 | `4d4a23896e47` | RC1 `5e605fb7a680` | 18 commits / 15 files / +1016 -123 |
| #114 | `53f3729b54bb` | #113 head | 2 / 16 / +423 -140 |
| #115 | `8249dfe6cc04` | #114 head | 2 / 10 / +541 -11 |
| #116 | `249d5b6d8d50` | #115 head | 1 / 8 / +493 -9 |
| #117 | `63334e0b00d9` | #116 head | 1 / 14 / +512 -252 |
| #118 | `0d7b04d8c3f3` | #117 head | 5 / 12 / +626 -75 |
| #119 | `79b06c72f246` | #118 head | 4 / 11 / +562 -67 |
| #120 | audited code/docs head `a44616e995d1`; re-read live head before merge | #119 head | pre-sync 5 / 6 / +53 -25; landing-audit docs add a docs-only delta |

Authorized landing procedure, one layer at a time:

1. Verify RC1 still starts at the expected pre-landing head and the target PR head still equals the table above.
2. For #113, merge to `integration/aquaguide-rc1` using a normal merge commit with expected-head protection.
3. Before each later PR (#114..#120), retarget its base to `integration/aquaguide-rc1`; do not update/rebase the PR branch.
4. After retarget, verify the PR diff matches the recorded incremental baseline/delta, mergeability is true, and all triggered permanent gates are green. Any unexpected extra files/commits stops landing.
5. Merge that PR using a normal merge commit and its expected-head SHA; then repeat for the next layer.
6. After #120 lands, treat the new RC1 as a new release candidate: re-run all P0 permanent gates plus the existing RC1->main release matrix / Product Golden workflows on the exact RC1 head. Do not merge RC1 to `main` or deploy as part of this procedure.

No landing step above is authorized yet.

## Next Execution Order

1. Landing audit is complete and ready; wait for explicit authorization before retargeting or merging #113-#120.
2. If authorized, land #113 -> #120 one layer at a time using the merge-commit-only procedure above.
3. Revalidate the exact landed RC1 with P0 permanent gates + the RC1->main release matrix before any main/deploy decision.
4. After an authorized landing and revalidation, resume #112 UI work.

## Branch note

- Parallel `agent/p0-water-change-engine-v1` is an unreviewed earlier candidate and is not the active PR branch.
- Its `AQ-WATER-005/006` additions were never explicitly confirmed by the user and are intentionally absent from #118; do not treat them as accepted Product Truth.
