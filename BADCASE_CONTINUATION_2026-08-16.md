# AquaGuide Badcase Continuation — 2026-08-16

> Status here means executable guard / implementation state, not production rollout. Draft PRs remain unmerged.

| Badcase | Current status | Guard / PR | Current truth |
|---|---|---|---|
| `CATALOG-002` catalog-missing existing animal cannot be recorded | ✅ code + DB acceptance | #38 | Real existing livestock can be stored unresolved without synthetic canonical identity; deployed-browser hydrate still pending |
| `CATALOG-003` unresolved current livestock silently disappears from compatibility context | ✅ fail-closed contract | #38 | Future compatibility becomes insufficient-data instead of ignoring unknown residents |
| `REC-001` CTA promises alternatives but only opens calculator | ✅ fixed + read-only CI green | #41 | `View risk & alternatives` now opens a real alternatives result panel |
| `REC-002` replacement loses original user intent | ✅ MVP guard green | #40 | same life type/water/role/social mode/size/difficulty intent is preserved |
| `REC-003` predator tank keeps recommending another small schooling fish | ✅ golden case green | #40 | zero safe same-intent alternative is a valid result |
| `REC-004` missing behavior evidence presented as strong recommendation | 🟡 materially reduced | #40/#42 | stocked-tank replacement is demoted when behavior evidence is missing; catalog-wide behavior coverage remains sparse |
| `MIX-001` compatibility says “risk” without source/target | ✅ graph foundation green | #42 | explicit source→target or mutual edge, direction, relation, severity, evidence |
| `MIX-002` every blocker receives the same generic action | ✅ Action Engine green | #44 | relocation/environment/quantity/more-data/monitor are separated; relocation requires counterfactual evidence |
| `MIX-003` “remove A” does not recompute remaining community | ✅ simulator green | #43 | every single-species relocation rebuilds the whole conflict graph and compares before/after |
| `MIX-004` system arbitrarily picks A when keep-A and keep-B are equally effective | ✅ comparison contract green | #45 | equal blocker reduction remains an explicit tie with `decisionMode=user_choice_required` |
| `MIX-005` strongest single-change result is phrased as a command | 🟡 decision contract green, UI pending | #45 | `unique_strongest_single_change` means only best simulated one-species change, not keeper instruction |
| `MIX-006` “move to another tank” claims destination is safe without evaluation | ✅ destination evaluator green | #46 | each target tank is re-evaluated; output is compatible-by-current-evidence / conditional / insufficient / blocked, never “safe” |
| `MIX-007` source tank has unresolved residents but known-subset intervention is presented as full-community advice | 🟡 orchestrator implemented, clean rerun in progress | #47/#48 | #47 unifies alias→grounding→resolved/unresolved facts; #48 preserves known-subset graph but blocks formal intervention/destination when source residents remain unresolved |
| `DIAG-001` Care aggression/predation diagnosis stays generic | ⏳ not integrated | future Unified Tank Diagnosis | Care Diagnosis still does not consume Conflict Graph |
| `EXPLAIN-001` effective/load capacity looks like physical water volume | ✅ semantic contract, UI pending | #37 | physical water volume is separate from heuristic load pressure |
| `EXPLAIN-003` group-size advice lacks evidence level | 🟡 reviewed subset only | compatibility evidence + #40/#42 | reviewed minimum group sizes are used when present; catalog-wide evidence expansion still required |
| `EVAL-001` severe-risk false negatives not systematically measured | ⏳ partial golden cases only | #40/#42/#43 tests | deterministic cases exist, but no broad severe-risk false-negative evaluation suite yet |

## Current executable decision chain

```text
repository-hydrated Aquarium facts
→ #47 Tank Decision Context
→ #42 Conflict Graph
→ #43 simulateWithout(X)
→ #44 Action Engine
→ #45 Keeper Choice Comparison
→ #46 Destination Evaluation
→ #48 Tank Decision Support Orchestrator
```

A later UI must not skip layers. In particular:

- historical species aliases canonicalize before strict ID grounding;
- unresolved current residents stay explicit instead of disappearing;
- plant/hardscape facts do not enter animal behavior/bioload context;
- direct rule text cannot create a relocation claim;
- relocation must point to a counterfactually recomputed scenario;
- a scenario must show remaining blockers, not only resolved blockers;
- ties must remain ties;
- warning-only communities must not receive blocker-removal choices;
- destination suitability is a separate evaluation and is not implied by “relocate”;
- unresolved source residents make the graph a known-subset view only and block formal whole-tank intervention.

## Real #38 → decision-context mapping

PR #38's API/repository path has been checked against the new decision stack:

- API reads `aquarium_species(*)` including `identity_status` / `raw_name`;
- repository hydration maps unresolved records to `fishId='unresolved:<record-id>'`, preserves `identityStatus='unresolved'` and `rawName`;
- #47 strict explicit-ID grounding therefore classifies that hydrated record as unresolved without synthetic catalog identity or page-local inference.

The remaining #38 rollout gate is still deployed-browser/cross-device acceptance; code-level shape compatibility with the decision adapter is now established.

## Current evidence limitation

The reviewed behavior evidence set is still intentionally sparse. Therefore current graph/action/intervention correctness means **the system preserves and reasons correctly over available evidence**, not that catalog-wide compatibility accuracy is proven.

High-priority evidence/evaluation follow-up:

1. expand reviewed predator/aggression/fin-nipping/territorial profiles;
2. expand explicit pair rules;
3. add schooling/conspecific/sex-ratio/niche-layer evidence where supportable;
4. build a severe-risk golden suite with explicit false-negative target;
5. keep missing evidence as insufficient-data rather than heuristic-safe fallback.

## Current rollout boundary

- #40/#41/#42/#43/#44/#45/#46/#47: code CI green;
- #48: first orchestration test correctly exposed an over-strong test assumption that an empty target tank must be compatible; the test was corrected to require real destination evaluation while preserving the engine verdict, and clean rerun is in progress;
- no intervention UI mutation exists yet;
- no PR in this continuation is merged to main.
