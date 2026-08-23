# Compatibility Rules

Status: `ACCEPTED`

Compatibility is a **planning / prior-risk engine**, not the authoritative diagnosis of an aquarium that already exists in the real world.

The user-facing planning outcomes remain:

- `compatible`
- `caution`
- `not_recommended`
- `insufficient_data`

These statuses answer: **“Should I plan to add this species / combination?”**

They do not answer: **“Is my existing aquarium currently failing?”**

---

## AQ-MIX-001 — Planning compatibility and current tank state are different layers

Compatibility rules primarily describe whether a future combination is suitable to plan or add.

An existing aquarium must not reuse the planning outcome as a direct claim about current real-world conflict. Existing-tank decisions are handled by `docs/rules/TANK_STATE.md`.

A combination may therefore legitimately have both of these statements at the same time:

- planning prior: `caution` because territorial pressure is plausible;
- current tank state: `stable` because the actual aquarium has no observed persistent chasing, injury, hiding pressure or feeding exclusion.

The prior remains visible as something to watch; it does not become a current red alert by itself.

## AQ-MIX-002 — Existing reality is always recordable

When the user records livestock that is already physically present, AquaGuide saves the fact first even if the compatibility assessment is cautionary, unknown or not recommended.

The product may surface warning, unknowns and follow-up after the fact is saved. It must not block factual recording with a future-planning rule.

Future planned additions remain safety-gated according to the planning status.

## AQ-MIX-003 — Aggression is not predation

A species marked `Aggressive`, `Territorial` or otherwise behaviorally difficult must not automatically be treated as predatory.

Predation conclusions require a reviewed species trait, reviewed pair rule, explicit physical evidence or another deterministic rule that actually establishes predation risk.

Likewise, `Large` is not automatically equivalent to `predator`.

## AQ-MIX-004 — Unreviewed evidence cannot be promoted to safe

If a conclusion depends on missing or unreviewed evidence, the product must preserve uncertainty rather than treating the absence of a recorded risk as proof of compatibility.

Where the missing evidence materially affects the planning decision, use `insufficient_data` rather than silently upgrading to `compatible`.

## AQ-MIX-005 — Compatibility dimensions remain separable

The engine must preserve distinct dimensions rather than hiding them in one score:

- water type;
- temperature;
- pH;
- predation;
- aggression;
- territory;
- group requirement;
- physical space;
- equipment dependency;
- bioload pressure;
- evidence completeness.

One dimension must not be used as a hidden proxy for another. Space, territory and bioload follow `AQ-SPACE-*` rules.

## AQ-MIX-006 — Pair relationships and whole-tank feasibility are different calculations

Pair compatibility answers questions that are inherently relational, such as:

- can A prey on B;
- is A likely to chase or injure B;
- do A and B have reviewed pair-specific incompatibility evidence;
- do their environmental requirements materially conflict.

Whole-tank feasibility answers questions that cannot be calculated correctly from one pair at a time, such as:

- total quantity / group requirements;
- overall physical-space pressure;
- total bioload pressure;
- equipment sufficiency;
- whether all selected species share a viable environmental window.

The final planning decision may combine pair results and whole-tank feasibility, but the engine must retain both sources separately.

**MUST NOT:** compute whole-tank bioload by evaluating every pair separately and taking the worst pair or summing duplicated pair loads.

**MUST NOT:** treat “every pair passed” as proof that the complete tank plan is feasible.

## AQ-MIX-007 — Hard constraints are narrower than ordinary risk priors

Only explicitly defined non-negotiable constraints may directly block a plan without relying on softer prior scoring.

Examples include an impossible freshwater/saltwater mismatch or another reviewed constraint that cannot be satisfied in one aquarium.

Ordinary recommendations such as general tank-size guidance, temperament labels or heuristic bioload pressure are not automatically hard constraints.

Hard constraints must be identifiable by rule ID and evidence basis; they must not be created implicitly by threshold stacking.

## AQ-MIX-008 — Planning decision pipeline

The canonical planning flow is:

```text
Selected species / quantities
        +
Tank context
        +
Reviewed species / pair evidence
        +
Known unknowns
        ↓
1. Hard constraints
2. Pair relationship assessment
3. Whole-tank feasibility assessment
4. Evidence-completeness assessment
        ↓
Planning outcome
compatible / caution / not_recommended / insufficient_data
```

The outcome is an orchestration result. The individual reasons remain visible and inspectable; the product must not replace them with a single opaque numeric compatibility score.

## AQ-MIX-009 — Existing-tank compatibility becomes prior input to Tank State

For livestock already present in the user's aquarium, compatibility evaluation produces **Prior Risk**, not the final current-state verdict.

Canonical flow:

```text
Compatibility Prior
        +
Tank Context
        +
Observed Evidence
        +
Time / History
        ↓
Tank State Engine
        ↓
stable / watch / intervene / urgent / unknown
```

A true hard constraint retains authority according to `AQ-STATE-004`. Ordinary theoretical risk does not bypass the Tank State layer.

## AQ-MIX-010 — No compatibility redesign during P0

During the P0 decision-layer refactor, preserve the current user-facing compatibility task and result surfaces unless a minimal semantic change is necessary to stop them from stating a false conclusion.

P0 work should change the authoritative decision source, not expand the UI.

Interactive Atlas expansion, species-detail redesign and isolated UI polish remain paused until the canonical decision model is established.
