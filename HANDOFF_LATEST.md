# AquaGuide — Latest Handoff

**Updated:** 2026-08-23
**Repository:** `chusday97/aquaguide-tank-guide`
**Current RC1:** `integration/aquaguide-rc1` @ `5e605fb7a68001ecd80096ef42f063909cf5aa03`
**Product-truth branch/PR:** `agent/context-sync-protocol-v1` / #113
**Active P0 implementation branch:** `agent/p0-tank-state-engine-v1`
**Phase:** `P0 decision-layer consolidation`
**Release boundary:** no RC1→main merge or production deploy without separate explicit authorization.

## Current status

- Context Sync canonical structure is established on #113.
- P0 Compatibility Product Truth is accepted under `AQ-MIX-*`, `AQ-SPACE-*`, `AQ-STATE-*`.
- P0-2 Contract Alignment landed on the #113 stack at commit `4d4a238`: Planning Compatibility and Current Tank State are separate authorities.
- Fail-before proof commit `9ed2d76` reproduced 4/4 shared model failures: temperament→bioload, Large→predator, generic tankSize→hard block, pair-only aggregate missing whole-tank quantity.
- #114 `agent/p0-compatibility-engine-v2` implements shared bioload screening plus explicit `wholeTankFeasibility`; dedicated workflow `32620810633` is PASS.
- Tank State fail-before commit `72ae99e` reproduces 0/3 Existing Tank authority failures.
- `agent/p0-tank-state-engine-v1` now adds deterministic `stable / watch / intervene / urgent / unknown` state semantics without changing Aquarium UI.
- #112 Interactive Atlas remains Draft/frozen until P0 exit criteria are met.

## Verified candidate behavior

- `AQ-SPACE-003`: temperament no longer changes bioload screening.
- `AQ-MIX-003`: Large/Aggressive metadata alone no longer proves predation; reviewed evidence remains authoritative.
- `AQ-MIX-007`: generic tank-size guidance no longer becomes an implicit hard block.
- `AQ-MIX-006`: pair relationships and whole-tank feasibility are separate; full quantity is aggregated once.
- heuristic bioload can raise planning caution but cannot hard-block by itself.
- existing reality recording remains save-first; planned additions remain four-state safety-gated.

## Validation

Candidate local validation passed:

- `test:p0-compatibility` — 5/5 PASS
- `test:compatibility` — PASS
- species-fit regression — PASS
- addition-intent contract — PASS after baseline evaluator drift migration
- livestock-recording contract — PASS
- visual-results regression — PASS with reviewed predator fixture
- TypeScript — PASS
- production build — PASS

## Still open in P0

- `AQ-BC-MIX-001`: Existing Aquarium still needs Tank State wiring so static prior cannot become current red conflict/Today Action.
- `AQ-BC-SPACE-001`: Existing Aquarium page still needs current-state semantics; generic planning guidance must not generate current removal/upgrade action by itself.
- Tank State domain evaluator is implemented in the current candidate and passes 11/11; Existing Aquarium evidence/wiring is still pending.
- Whole-tank feasibility v1 currently establishes the separate layer and bioload screening; group/equipment/space dimensions still need migration into that layer.

## Next execution order

1. Open/validate the Tank State Engine V1 stacked PR; do not merge without explicit authorization.
2. Build an Existing Tank evidence adapter from diagnosis/timeline facts into structured observations.
3. Route Existing Aquarium prior + observations + history through Tank State, replacing the direct `blockingCompatibilityRisk -> Today Action` authority.
4. Remove duplicate page heuristics only after Tank State browser/regression proof.
5. Introduce Water Change Engine and combine maintenance context with Tank State for Today Action priority.
6. Resume #112 only after P0 exit criteria pass.
