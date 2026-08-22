# AI Boundary Rules

Status: `ACCEPTED`

## AQ-AI-001 — Deterministic rules remain authoritative

AI must not override deterministic safety, compatibility, current-state or persistence rules.

If model output conflicts with deterministic logic, the deterministic result wins.

## AQ-AI-002 — AI may interpret observations, not own the final state

AI may transform free text into structured candidate observations, for example:

- `persistentChasing = true`
- `injury = false`
- `appetiteReduced = true`

The final `stable / watch / intervene / urgent / unknown` state must still be produced by deterministic domain logic.

## AQ-AI-003 — AI cannot downgrade deterministic priority

A model-generated priority must never lower the minimum priority required by deterministic risk.

AI may add explanation or make a higher-priority recommendation only when the product contract explicitly permits it and the result remains within deterministic safety boundaries.

## AQ-AI-004 — Missing or invalid AI output must fail safely

Timeouts, invalid JSON, empty candidate selections and provider failures must not erase deterministic candidates, blocking facts, or required user actions.

Fallback behavior should preserve the deterministic result and expose a stable user-facing state rather than inventing an answer.

## AQ-AI-005 — Raw AI text is not product truth

Model output, external evidence and generated hypotheses are inputs to the product. They do not become an accepted product rule merely because the model produced them or an external source appears to support them.
