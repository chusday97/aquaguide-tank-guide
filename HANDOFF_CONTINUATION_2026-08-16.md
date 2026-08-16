# AquaGuide Handoff Continuation — 2026-08-16

> Current continuation snapshot. This supplements the earlier 2026-08-16 execution log. Draft/green CI is not main/production. No PR in this stack has been merged by this execution.

## Current product direction

AquaGuide is implementing a truthful decision-support chain rather than a generic compatibility score:

`repository-hydrated tank facts → catalog grounding → compatibility evidence → conflict graph → counterfactual intervention → action options → keeper choice → destination evaluation`

The system must preserve these boundaries:

- unknown identity/data stays unknown;
- `undefined` is not rewritten as “none”;
- formal recommendations stay catalog-grounded;
- severe behavior conflicts are explicit A→B / A↔B relationships;
- relocation is only claimed to resolve a blocker after the remaining community is recomputed;
- a strongest single-change scenario is an optimization result, not a command;
- user preference decides keep-A vs keep-B when multiple factual options exist;
- another owned tank is not automatically a safe relocation destination;
- unresolved source residents make whole-community intervention incomplete.

## Phase 0 / canonical state

### PR #34

Observation reachability code blocker is closed:

`Aquarium home → Record Observation → normal/abnormal → repository-first canonical event → Timeline`

PR remains Draft/unmerged.

### PR #35

Auth code-level gates are green and two-device harness includes observation, but real deployed Magic Link/two-device acceptance remains externally blocked by fresh deployment/Auth redirect availability. Do not claim production auth.

### PR #38

Unresolved existing livestock is implemented as factual state without synthetic canonical identity:

- `identity_status=unresolved`;
- `species_id=NULL`;
- `species_catalog_key=NULL`;
- original `raw_name` retained;
- local/cloud compatibility mirror uses `fishId='unresolved:<record-id>'`;
- planned additions remain catalog-grounded;
- unresolved current livestock makes future compatibility fail closed.

Supabase migration `20260816103423_unresolved_existing_livestock` is applied. Live schema/function grants and authenticated ownership/idempotency/cross-user isolation were verified in a rollback transaction. Remaining gate is deployed-browser/cloud-hydrate acceptance.

The real API/repository hydrate path has now also been audited against the recommendation stack:

- API reads `aquarium_species(*)`, including `identity_status/raw_name`;
- API repository converts unresolved rows into `fishId='unresolved:<DB record id>'` and preserves identity metadata;
- the recommendation stack can detect this mirror key as unresolved without importing #38's not-yet-merged type additions.

## Replacement recommendation chain

### PR #40 — Replacement Recommendation MVP — green

Pure deterministic engine for a candidate not yet added to the tank:

`rejected candidate → intent → same-role candidate pool → per-candidate compatibility recomputation → recommended / conditional / needs-confirmation / zero-safe-alternative`

Important behavior:

- no unrelated Top-N filler;
- zero safe same-intent alternatives is valid;
- reviewed schooling candidates default to reviewed minimum group size when no explicit quantity is provided;
- unresolved current context prevents formal promotion;
- missing behavior evidence prevents high-confidence promotion in stocked tanks.

### PR #41 — Risk & Alternatives UI — green

The species-detail CTA `查看风险与替代方案 / View risk & alternatives` no longer routes to the calculator while pretending alternatives already exist.

For `unsuitable/conflictRisk` it opens a real result panel with:

- primary blocker evidence + basis/confidence;
- better-fit candidates;
- conditional candidates;
- needs-confirmation candidates;
- explicit no-safe-same-intent-alternative state.

Candidate CTA is intentionally `查看候选详情 / View candidate details`, not `模拟加入`, because the current calculator API does not preserve the engine's evaluation quantity.

## Whole-community conflict/intervention chain

### PR #42 — Community Conflict Graph — green

Converts pairwise compatibility into explicit graph edges:

- source/target species;
- one-way vs mutual direction;
- relation: predation/aggression/fin-nipping/territorial/environment/group-size/evidence;
- blocker/warning/missing-evidence outcome;
- severity;
- fixability;
- evidence metadata and citations.

Reviewed predator → small fish becomes directional. Missing reviewed behavior becomes an evidence gap, not an assumed safe relationship.

### PR #43 — Tank Intervention Simulator — green

For every existing species group:

`simulateWithout(species) → rebuild whole conflict graph → compare before/after`

Outputs exact blocker/warning/evidence-gap deltas plus resolved/remaining edge IDs.

`minimumChangeCandidateSpeciesIds` has a narrow meaning: among one-species relocation scenarios, surface every option that removes the largest number of current blocker edges. Ties remain ties. Warning-only communities do not receive blocker-removal candidates.

### PR #44 — Conflict Action Engine — green

Maps graph fixability to truthful action families:

- `relocate_species` only from counterfactually recomputed scenarios;
- `adjust_environment` for environment conditions;
- `adjust_quantity` for group-size/quantity conditions;
- `collect_more_data` for evidence gaps;
- `monitor` for observation-only conditions.

Relocation uses `evidenceMode='counterfactual_recomputed'`. Rule-mapped actions cannot pretend to have simulated a resolution.

Initial functional tests passed and one TypeScript-only test assertion was corrected because it compared a union that already excluded `relocate_species`; product code did not change. Clean CI is green.

### PR #45 — Keeper Choice Comparison — green

Adds a presentation contract with `decisionMode='user_choice_required'`.

Comparison outcomes:

- `no_blocking_conflict`;
- `unique_strongest_single_change`;
- `multiple_equal_single_change_options`;
- `blocking_conflict_without_verified_single_change`.

Each relocation choice includes species/quantity, blocker resolution count, remaining blockers, total conflict deltas and counterfactual evidence mode.

A unique strongest result means only “best among simulated one-species relocation scenarios”; it does not encode keeper preference, animal value, rehoming difficulty or destination safety.

### PR #46 — Relocation Destination Evaluator — green

Every owned destination tank must be re-evaluated through the compatibility engine before it can be surfaced as a relocation option.

Destination statuses:

- `compatible_by_current_evidence`;
- `conditional`;
- `insufficient_data`;
- `not_recommended`.

No destination status is named “safe” or “guaranteed”.

If a destination contains unresolved residents, a known blocker still wins; otherwise the target fails closed to `insufficient_data`.

### PR #47 — Tank Decision Context — green

Creates one shared aquarium-fact resolution boundary so replacement/destination/future diagnosis do not each parse `Aquarium.fishes` differently.

Resolution order:

1. historical species alias → canonical ID using #29 alias map;
2. strict explicit-ID grounding using #36 resolver;
3. plant/hardscape separated from animal livestock context;
4. duplicate/alias animal records aggregate by canonical species;
5. remaining catalog misses stay explicit unresolved reality.

Outputs:

- canonical resolved livestock + quantity;
- source record/species IDs for auditability;
- unresolved IDs;
- non-livestock IDs;
- alias mappings.

Replacement Engine now consumes this context. Destination Evaluation uses a dedicated adapter built from the same context.

### PR #48 — Tank Decision Support Orchestrator — clean rerun in progress

Adds the cross-layer orchestration boundary:

`Tank Decision Context → known-subset Action Plan → Keeper Choice → optional Destination Evaluation`

New certainty states:

- `complete_known_community`;
- `partial_known_community`.

When source tank contains unresolved residents:

- known-subset Conflict/Action results may still be computed for transparency;
- `formalInterventionAllowed=false`;
- `formalInterventionBlockReason='unresolved_current_livestock'`;
- `formalChoiceComparison=null`;
- relocation destinations are not promoted from the incomplete source-community result.

Destination-list semantics also preserve truth:

- `allAquariums === undefined` means destination set was not supplied;
- explicit `[]` means supplied set is empty.

The first #48 test run exposed an over-strong test assumption that an empty target tank must be compatible. The evaluator was not weakened; the test was corrected to require that the target is actually evaluated and that the real verdict is preserved.

The second run passed all four business regression layers but TypeScript correctly rejected direct use of #38-only `identityStatus/rawName` fields on the recommendation stack's current `AquariumFish` type. The test was corrected to use the real stable cross-stack mirror key `fishId='unresolved:<id>'`, avoiding an undeclared compile-time dependency between two unmerged Draft stacks. Third clean rerun is in progress.

## Current dependency graph

```text
main
├─ #29 catalog/taxonomy/water certainty
│  ├─ #30 collision evidence
│  ├─ #31 life-type fit
│  ├─ #33 life-type detail semantics
│  ├─ #36 catalog grounding
│  │  └─ #40 replacement engine
│  │     ├─ #41 real alternatives UI
│  │     └─ #42 community conflict graph
│  │        └─ #43 intervention simulator
│  │           └─ #44 action engine
│  │              └─ #45 keeper-choice comparison
│  │                 └─ #46 destination evaluator
│  │                    └─ #47 tank decision context
│  │                       └─ #48 decision-support orchestrator
│  └─ #37 explanation semantics
│
└─ #34 canonical repository/state
   ├─ #35 auth + two-device harness
   └─ #38 unresolved existing livestock
```

Closed duplicate: #39.

## Next execution boundaries

1. Require #48 clean rerun.
2. Build a read-only Intervention Comparison component that consumes `TankDecisionSupportResult`; it must not read localStorage or call remove/delete mutations itself.
3. Wire that component only after a deliberate canonical repository integration point is chosen; do not make old page-local state authoritative again.
4. Connect Care Diagnosis to Conflict Graph / decision support so aggression/predation diagnosis can name exact source/target and next action.
5. Migrate #37 explanation semantics into user-facing load/capacity UI.
6. Expand reviewed behavior evidence and severe-risk evaluation coverage before making catalog-wide safety claims.

## Non-negotiable constraints

- no merge/Ready transition without explicit user instruction;
- no synthetic canonical IDs;
- no fake safe/compatible language from missing behavior evidence;
- no fake Top N alternatives;
- no “hide more / add filter” mitigation for a counterfactually relocation-class predation blocker;
- no automatic keep-A/keep-B decision;
- no destination-safe claim without evaluating the destination tank;
- no full-community intervention when source residents remain unresolved;
- no Draft/CI state described as production.
