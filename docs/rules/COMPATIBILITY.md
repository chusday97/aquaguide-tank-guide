# Compatibility Rules

Status: `ACCEPTED`

## AQ-MIX-001 — Planning compatibility and current tank state are different layers

Compatibility rules primarily describe whether a future combination is suitable to plan or add. Their four planning outcomes remain:

- `compatible`
- `caution`
- `not_recommended`
- `insufficient_data`

An existing aquarium must not reuse the planning outcome as a direct claim about current real-world conflict. Existing-tank decisions are handled by Tank State rules.

## AQ-MIX-002 — Existing reality is always recordable

When the user records livestock that is already physically present, AquaGuide saves the fact first even if the compatibility assessment is cautionary, unknown or not recommended.

The product may surface warning, unknowns and follow-up after the fact is saved. It must not block factual recording with a future-planning rule.

Future planned additions remain safety-gated according to the planning status.

## AQ-MIX-003 — Aggression is not predation

A species marked `Aggressive`, `Territorial` or otherwise behaviorally difficult must not automatically be treated as predatory.

Predation conclusions require a reviewed species trait, reviewed pair rule, explicit physical evidence or another deterministic rule that actually establishes predation risk.

## AQ-MIX-004 — Unreviewed evidence cannot be promoted to safe

If a conclusion depends on missing or unreviewed evidence, the product must preserve uncertainty rather than treating the absence of a recorded risk as proof of compatibility.

Where the missing evidence materially affects the planning decision, use `insufficient_data` rather than silently upgrading to `compatible`.

## AQ-MIX-005 — Compatibility dimensions remain separable

The engine should preserve distinct dimensions such as water type, temperature, pH, predation, aggression, territory, group requirements, space, equipment and bioload.

One dimension must not be used as a hidden proxy for another. Space, territory and bioload follow `AQ-SPACE-*` rules.
