# AquaGuide Badcase Continuation — 2026-08-16

> Status here means executable guard / implementation state, not production rollout. Draft PRs remain unmerged.

| Badcase | Current status | Guard / PR | Current truth |
|---|---|---|---|
| `CATALOG-002` catalog-missing existing animal cannot be recorded | ✅ code + DB acceptance | #38 | Real existing livestock can be stored unresolved without synthetic canonical identity; deployed-browser hydrate still pending |
| `CATALOG-003` unresolved current livestock silently disappears from compatibility context | ✅ fail-closed contract | #38/#47/#48 | Unresolved current reality remains explicit and blocks complete formal intervention rather than disappearing |
| `REC-001` CTA promises alternatives but only opens calculator | ✅ fixed + read-only CI green | #41 | `View risk & alternatives` now opens a real alternatives result panel |
| `REC-002` replacement loses original user intent | ✅ MVP guard green | #40 | same life type/water/role/social mode/size/difficulty intent is preserved |
| `REC-003` predator tank keeps recommending another small schooling fish | ✅ golden case green | #40/#51 | zero safe same-intent alternative is valid; severe-risk regression prevents blocker washout |
| `REC-004` missing behavior evidence presented as strong recommendation | 🟡 materially reduced | #40/#42/#51 | stocked-tank replacement is demoted when behavior evidence is missing; catalog-wide reviewed behavior coverage remains sparse |
| `MIX-001` compatibility says “risk” without source/target | ✅ graph foundation green | #42 | explicit source→target or mutual edge, direction, relation, severity, evidence |
| `MIX-002` every blocker receives the same generic action | ✅ Action Engine green | #44 | relocation/environment/quantity/more-data/monitor are separated; relocation requires counterfactual evidence |
| `MIX-003` “remove A” does not recompute remaining community | ✅ simulator green | #43 | every single-species relocation rebuilds the whole conflict graph and compares before/after |
| `MIX-004` system arbitrarily picks A when keep-A and keep-B are equally effective | ✅ comparison contract green | #45 | equal blocker reduction remains an explicit tie with `decisionMode=user_choice_required` |
| `MIX-005` strongest single-change result is phrased as a command | ✅ read-only UI contract green | #45/#49 | strongest means only best simulated one-species change; UI explicitly says it is not a removal instruction |
| `MIX-006` “move to another tank” claims destination is safe without evaluation | ✅ destination evaluator + UI green | #46/#49 | each target tank is re-evaluated; UI says current-evidence compatible / conditional / insufficient / blocked, never “safe” |
| `MIX-007` source tank has unresolved residents but known-subset intervention is presented as full-community advice | ✅ executable fail-closed contract green | #47/#48/#49 | known-subset conflicts remain visible, but formal keep-A/keep-B and destination conclusions are disabled until source identity is complete |
| `DIAG-001` Care aggression/predation diagnosis stays generic | 🟡 evidence + augmentation layers green; page integration pending | #50/#52 | exact A→B/A↔B evidence and truthful action augmentation exist; `CareEncyclopedia.tsx` is intentionally not yet wired across unmerged stacks |
| `DIAG-002` predation blocker gets generic “add hiding places” advice | ✅ augmentation guard green | #52 | reviewed predation adds an explicit warning that hiding places are not proof the blocker is removed |
| `DIAG-003` behavior evidence hijacks unrelated water/oxygen diagnosis | ✅ scope guard green | #50/#52 | `gasping` remains not-applicable to behavior-conflict augmentation |
| `EXPLAIN-001` effective/load capacity looks like physical water volume | ✅ semantic contract, UI pending | #37 | physical water volume is separate from heuristic load pressure |
| `EXPLAIN-003` group-size advice lacks evidence level | 🟡 reviewed subset only | compatibility evidence + #40/#42 | reviewed minimum group sizes are used when present; catalog-wide evidence expansion still required |
| `EVAL-001` severe-risk false negatives not systematically measured | ✅ first reviewed-fixture regression gate green | #51 | 3 currently reviewed severe fixtures preserve 0 cross-layer severe false negatives; this is not a catalog-wide accuracy benchmark |
| `STACK-001` canonical/unresolved and decision/diagnosis Draft stacks may be incompatible | ✅ read-only integration audit green | integration audit branch | dry-run merge found exactly 2 known conflicts; audited runtime resolution + explicit gates passed all merged-tree tests, TypeScript and build without creating a merge commit |
| `STACK-002` water-change conflict loses either canonical event hydration or future-date guard | ✅ integration semantic-union regression green | integration audit branch | temporary merged tree preserved canonical event-derived history and future/invalid-date normalization; both #38 and decision-stack water-change tests passed |

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
→ #49 read-only Intervention Comparison UI
→ #50 Diagnosis Conflict Evidence
→ #52 Quick Diagnosis Conflict Augmentation
→ #51 Reviewed Severe-Risk cross-layer regression gate
```

A later page integration must not skip layers. In particular:

- historical species aliases canonicalize before strict ID grounding;
- unresolved current residents stay explicit instead of disappearing;
- plant/hardscape facts do not enter animal behavior/bioload context;
- direct rule text cannot create a relocation claim;
- relocation must point to a counterfactually recomputed scenario;
- a scenario must show remaining blockers, not only resolved blockers;
- ties must remain ties;
- warning-only communities must not receive blocker-removal choices;
- destination suitability is a separate evaluation and is not implied by “relocate”;
- unresolved source residents make the graph a known-subset view only and block formal whole-tank intervention;
- behavior conflict augmentation is additive to symptom/water diagnosis rather than replacing it.

## Real #38 → decision-context mapping

PR #38's API/repository path has been checked against the new decision stack:

- API reads `aquarium_species(*)` including `identity_status` / `raw_name`;
- repository hydration maps unresolved records to `fishId='unresolved:<record-id>'`, preserves `identityStatus='unresolved'` and `rawName`;
- #47 strict explicit-ID grounding therefore classifies that hydrated record as unresolved without synthetic catalog identity or page-local inference.

The remaining #38 rollout gate is still deployed-browser/cross-device acceptance; code-level shape compatibility with the decision adapter is established and was also exercised in the merged-tree integration audit.

## Canonical + decision stack integration audit

Read-only audit branch: `integration/canonical-decision-support-audit`.

Source heads audited:
- canonical/unresolved stack: PR #38 head `fef455a...`;
- decision/diagnosis stack: PR #52 head `9aafa1d...`.

Initial `git merge --no-commit` found exactly two conflicts:

1. `.github/workflows/product-golden-path.yml` — CI orchestration conflict;
2. `src/services/aquarium/water-change.service.ts` — runtime semantic conflict.

No conflict occurred in `package.json` or `tankCompatibilityEngine.ts`; Git resolved those automatically.

For the disposable audit runner only:
- Product Golden Path kept the canonical-stack workflow version, while decision gates were executed explicitly as separate audit steps;
- water-change runtime conflict used an audited semantic-union template preserving both canonical `care_events` hydration and future/invalid-date normalization.

The resolved temporary merged tree passed:

- canonical water-change repository boundary;
- future-date water-change regression;
- unresolved livestock contract;
- livestock recording regression;
- Tank Decision Context;
- Tank Decision Support orchestration;
- Quick Diagnosis conflict augmentation;
- Reviewed Severe-Risk regression;
- whole-tree TypeScript;
- production build.

The final audit step verified `.git/MERGE_HEAD` still existed and `HEAD` had not changed: **no merge commit was created or pushed**.

## Current evidence limitation

The reviewed behavior evidence set is still intentionally sparse. Current graph/action/intervention correctness means **the system preserves and reasons correctly over available evidence**, not that catalog-wide compatibility accuracy is proven.

High-priority evidence follow-up:

1. expand reviewed predator/aggression/fin-nipping/territorial profiles;
2. expand explicit pair rules;
3. add schooling/conspecific/sex-ratio/niche-layer evidence where supportable;
4. expand #51 severe-risk fixture set only when new behavior evidence is actually reviewed;
5. keep missing evidence as insufficient-data rather than heuristic-safe fallback.

## Current rollout boundary

- #40–#52 current decision/recommendation/diagnosis chain: code-level targeted CI green at the latest checked heads;
- canonical + decision read-only merged-tree audit: green;
- #49 read-only Intervention UI exists but is not wired into Aquarium/Care pages;
- #52 Quick Diagnosis augmentation exists but is not wired into `CareEncyclopedia.tsx`;
- #38 deployed-browser/cross-device acceptance and #35 real Magic Link acceptance remain external rollout gates;
- no PR in this continuation is merged to main.
