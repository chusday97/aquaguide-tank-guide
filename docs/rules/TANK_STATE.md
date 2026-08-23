# Tank State Rules

Status: `ACCEPTED`

## AQ-STATE-001 — Prior risk is not current tank state

Species traits, compatibility rules, recommended space and other theoretical knowledge create prior risk. They do not by themselves prove that the user's existing aquarium is currently unstable.

Current tank state must combine:

`Prior Risk + Tank Context + Observed Evidence + Time`

before producing a Today Action.

## AQ-STATE-002 — Canonical current-state vocabulary

The current-state layer uses these semantic states:

- `stable` — no current evidence requires intervention;
- `watch` — a meaningful risk or weak abnormal signal exists and should be observed;
- `intervene` — current evidence supports a concrete adjustment or care action;
- `urgent` — current evidence or a hard constraint requires immediate priority handling;
- `unknown` — required information is missing and the product cannot make a reliable current-state claim.

These states are for an existing aquarium. They are not replacements for the planning compatibility statuses.

## AQ-STATE-003 — Observations change confidence, not historical truth

A normal observation can increase confidence that the aquarium is currently stable. Repeated abnormal observations can escalate current state.

Elapsed cohabitation time alone does not prove continuous stability. “Two species lived together for 180 days” is not equivalent to “180 days of normal observations”.

## AQ-STATE-004 — Hard constraints retain authority

Observed calm behavior must not erase a deterministic hard constraint such as an impossible water-type condition or another explicitly defined non-negotiable safety boundary.

The current-state engine may therefore escalate without waiting for repeated observations when the relevant rule is a true hard constraint.

## AQ-STATE-005 — Today Action consumes current state

The first action on an existing aquarium should be derived from current state plus real maintenance/observation context.

A static prior warning must not automatically become the first Today Action when the aquarium has no current evidence requiring intervention.

## AQ-STATE-006 — Weak signals watch; repeated/correlated abnormalities intervene

A single weak behavioral or maintenance-related abnormal signal normally creates `watch`, not an automatic removal or emergency instruction.

Repeated abnormal observations within a recent window, or correlated signals that support the same current problem (for example persistent chasing plus hiding/feeding exclusion), may escalate to `intervene`.

Current injury is intervention evidence even without repetition.

## AQ-STATE-007 — Immediate physiological danger can be urgent

Observed signals such as respiratory distress, severe injury or multiple recent deaths may produce `urgent` without waiting for repeated observations. This authority comes from current observed evidence, not species temperament metadata.

## AQ-STATE-008 — Missing recent observation is not hidden stability

If no recent observation is available, elapsed cohabitation time alone must not produce `stable`.

- meaningful prior risk + no recent observation -> normally `watch` with a request to observe;
- no meaningful prior and no recent observation -> `unknown` / complete the current check;
- recent normal observations may support `stable` when no hard constraint or current abnormal evidence is present.
