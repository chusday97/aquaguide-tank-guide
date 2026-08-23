# AquaGuide — Latest Handoff

**Updated:** 2026-08-23
**Repository:** `chusday97/aquaguide-tank-guide`
**Current RC1:** `integration/aquaguide-rc1` @ `5e605fb7a68001ecd80096ef42f063909cf5aa03`
**Product Truth / Context Sync:** #113 `agent/context-sync-protocol-v1`
**P0 stack:** #114 Compatibility V2 → #115 Tank State V1 → #116 Tank Evidence Adapter V1 → current Existing Tank Authority Wiring V1
**Active branch:** `agent/p0-existing-tank-authority-wiring-v1`
**Phase:** `P0 decision-layer consolidation`
**Release boundary:** no P0 stack merge to RC1, no RC1→main merge, and no production deploy without separate explicit authorization.

## Current Product Truth

Planning Compatibility and Existing Tank Current State are separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

Static temperament, generic tank-size guidance, pairwise planning verdicts and heuristic bioload cannot directly create a current danger or Today Action.

## Verified P0 Stack

- #114 dedicated Compatibility gate PASS: `32620810633`; later stacked reruns also PASS.
- #115 Tank State V1 gates PASS: Tank State `32621472344`, Compatibility `32621472315`.
- #116 Evidence Adapter gates PASS: Evidence `32621938239`, Compatibility `32621938236`, Tank State `32621938229`.
- Current wiring candidate replaces Aquarium page-level static current-risk authority with `deriveCurrentTankState()` plus a presentation adapter.
- Daily Check normal-patrol no longer inherits static `riskCount` as a medium diagnosis.
- AI/result-summary prose does not manufacture authoritative observation codes.

## Current User-Visible Regression Proof

Browser regression PASS 3/3 on the current wiring candidate:

1. `40×25×30cm + 2 × 迷你鹦鹉 + normal patrol` → `routine / 今天没有必须处理`; no space-upgrade, fake overload or removal warning.
2. reviewed `虎皮鱼 + 迷你鹦鹉` planning conflict + normal patrol → remains current routine; theoretical prior does not become active conflict.
3. freshwater + marine hard constraint + normal behavioral observation → remains current high-priority review.

Existing GP-003 returning Daily Check and GP-004 abnormal-care browser paths also PASS.

## Badcase Status

- `AQ-BC-BIOLOAD-001` — regression-verified on #114 stack.
- `AQ-BC-SPACE-002` — regression-verified on #114 stack.
- `AQ-BC-MIX-002` — regression-verified on #114 stack.
- `AQ-BC-SPACE-001` — regression-verified on current Existing Tank wiring candidate.
- `AQ-BC-MIX-001` — regression-verified on current Existing Tank wiring candidate.
- `AQ-BC-STATE-001` — regression-verified on current Existing Tank wiring candidate.
- `AQ-BC-EVAL-002` — OPEN; pre-existing Compatibility evidence provenance drift reproduced unchanged on #116 baseline.

## Still Open in P0

- Water Change still uses the existing schedule/shortest-cycle decision and has not yet been migrated to a dedicated Water Change Engine.
- Whole-Tank Feasibility v1 separates the layer and bioload screening; group-size, equipment-capacity and reviewed physical-space dimensions still need migration.
- Existing health-score legacy surfaces remain non-authoritative UI/support calculations and should be reduced after Today Action/Current State wiring is stable.
- P0 stack is still Draft/unmerged; RC1 is unchanged.
- #112 Interactive Atlas remains frozen until P0 exit criteria pass.

## Next Execution Order

1. Validate the current Existing Tank Authority PR on GitHub permanent gates.
2. Introduce Water Change Engine without changing layout.
3. Finish remaining Whole-Tank Feasibility dimensions.
4. Re-run P0 acceptance + Product Golden/GP-003/GP-004 on the full stack.
5. Only after P0 exit criteria are green, decide how to land the stacked PRs and then resume #112 UI work.
