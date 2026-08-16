# AquaGuide Handoff Continuation — 2026-08-16

> Current continuation snapshot. This supplements the earlier 2026-08-16 execution log. Draft/green CI is not main/production. No PR in this stack has been merged by this execution.

## Current product direction

AquaGuide is now implementing a truthful decision-support chain rather than a generic compatibility score:

`canonical tank facts → compatibility evidence → conflict graph → counterfactual intervention → action options → keeper choice`

The system must preserve these boundaries:

- unknown identity/data stays unknown;
- formal recommendations stay catalog-grounded;
- severe behavior conflicts are explicit A→B / A↔B relationships;
- relocation is only claimed to resolve a blocker after the remaining community is recomputed;
- a strongest single-change scenario is an optimization result, not a command;
- user preference decides keep-A vs keep-B when multiple factual options exist.

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
- planned additions remain catalog-grounded;
- unresolved current livestock makes future compatibility fail closed.

Supabase migration `20260816103423_unresolved_existing_livestock` is applied. Live schema/function grants and authenticated ownership/idempotency/cross-user isolation were verified in a rollback transaction. Remaining gate is deployed-browser/cloud-hydrate acceptance.

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

Golden case:

- predator → neon HIGH
- predator → cardinal HIGH
- neon ↔ cardinal warning

Relocate predator resolves two blockers; relocating either tetra resolves only one. The engine may call predator the strongest single-change node, but cannot say the keeper must remove it.

### PR #44 — Conflict Action Engine — fix applied, CI rerun in progress

Maps graph fixability to truthful action families:

- `relocate_species` only from counterfactually recomputed scenarios;
- `adjust_environment` for environment conditions;
- `adjust_quantity` for group-size/quantity conditions;
- `collect_more_data` for evidence gaps;
- `monitor` for observation-only conditions.

Initial functional tests all passed. TypeScript failed only because a test compared a union type that explicitly excludes `relocate_species` against `relocate_species`. The redundant runtime comparison was replaced with evidence-mode assertions. Product code was not changed. Clean rerun is in progress at this snapshot.

### PR #45 — Keeper Choice Comparison — CI rerun in progress

Adds a presentation contract with `decisionMode='user_choice_required'`.

Comparison outcomes:

- `no_blocking_conflict`;
- `unique_strongest_single_change`;
- `multiple_equal_single_change_options`;
- `blocking_conflict_without_verified_single_change`.

Each relocation choice includes species/quantity, blocker resolution count, remaining blockers, total conflict deltas and counterfactual evidence mode.

A unique strongest result means only “best among simulated one-species relocation scenarios”; it does not encode keeper preference, animal value, rehoming difficulty or destination safety.

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
│  └─ #37 explanation semantics
│
└─ #34 canonical repository/state
   ├─ #35 auth + two-device harness
   └─ #38 unresolved existing livestock
```

Closed duplicate: #39.

## Next execution boundaries

1. Require clean reruns for #44 and #45.
2. Add a read-only intervention comparison UI; do not connect relocation cards directly to livestock deletion/removal mutations.
3. Before offering “move to another tank”, add destination-tank compatibility evaluation. If no existing tank is verified safe, say so explicitly.
4. Integrate unresolved factual state (#38 stack) with recommendation/intervention stack only through an intentional cross-stack integration step; do not silently ignore unresolved residents.
5. Connect Care Diagnosis to the Conflict Graph so aggression/predation diagnoses can name the exact source/target relationship.
6. Migrate #37 explanation semantics into user-facing load/capacity UI.

## Non-negotiable constraints

- no merge/Ready transition without explicit user instruction;
- no synthetic canonical IDs;
- no fake safe/compatible language from missing behavior evidence;
- no fake Top N alternatives;
- no “hide more / add filter” mitigation for a counterfactually relocation-class predation blocker;
- no automatic keep-A/keep-B decision;
- no destination-safe claim without evaluating the destination tank;
- no Draft/CI state described as production.
