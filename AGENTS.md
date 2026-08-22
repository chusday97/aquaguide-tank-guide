# AquaGuide Agent Instructions

This repository is the persistent source of truth for AquaGuide. Do not treat the current conversation, model memory, old prompts, legacy handoffs, or existing implementation as automatic product truth.

## Source-of-truth priority

When sources disagree, use this order:

1. accepted `docs/rules/*`
2. `docs/product/*`
3. accepted entries in `docs/decisions/DECISION_LOG.md`
4. `docs/cases/ACCEPTANCE_CASES.md`
5. `CONTRACT.md` and architecture docs
6. current implementation
7. `HANDOFF_LATEST.md`
8. `PROGRESS_LATEST.md` / historical changelogs
9. old conversations, comments and prompts

Existing code is evidence of current behavior, not automatically the intended requirement. Handoff and progress files describe state/history, not product specification.

## Before working

1. Read `docs/CONTEXT_ROUTING.md`.
2. Read `docs/product/PRODUCT_PRINCIPLES.md` and only the user journey relevant to the task.
3. Read only the domain rules relevant to the task.
4. Read related acceptance cases and badcases.
5. Read `CONTRACT.md` only when the task affects architecture, data ownership, APIs, persistence, auth or deployment boundaries.
6. Read `HANDOFF_LATEST.md` for current implementation/release state.
7. Inspect current code only after the canonical context above is understood.

Do not infer undefined product requirements from existing code, old Handoff entries, or historical conversations.

## Context Sync Protocol

After every substantive product discussion, investigation, implementation or regression task, perform Context Sync automatically. The user should not need to ask for Handoff, Progress, Badcase or rule updates separately.

Classify new durable information as one of:

- Accepted Product Decision
- Proposed / Unconfirmed Decision
- Architecture / Data Contract Decision
- Badcase / Product Failure
- Acceptance Case
- Implementation Progress
- Evidence / Domain Knowledge
- Temporary Conversation

Route durable information using `docs/CONTEXT_ROUTING.md` and update only the affected canonical documents.

Rules:

- Never promote `PROPOSED` to `ACCEPTED` without explicit user confirmation.
- Product behavior changes require an acceptance case and regression coverage.
- A real observed failure should update an existing Badcase when possible instead of creating a duplicate.
- Evidence may support a rule but does not become a product decision automatically.
- Keep one full fact in one canonical home; other documents should reference the Rule/Case/Decision ID instead of duplicating the definition.
- Keep `HANDOFF_LATEST.md` concise and limited to current implementation/release state plus next step.
- Keep `PROGRESS_LATEST.md` as implementation history, not a second product specification.
- If no durable context was created, do not modify documentation merely to produce activity.
- Do not create version-suffixed duplicates such as `RULE_FINAL_V2.md`, `HANDOFF_NEW.md`, or date-stamped Badcase files when an existing canonical file can be updated.

## Stable IDs and statuses

Important product rules should use stable IDs such as `AQ-MIX-001`, `AQ-SPACE-001`, `AQ-WATER-001`, `AQ-DIAG-001`, `AQ-AI-001`.

Decision status:

- `PROPOSED`
- `ACCEPTED`
- `DEPRECATED`

Badcase status:

- `OPEN`
- `INVESTIGATING`
- `FIXED`
- `REGRESSION_VERIFIED`
- `WONT_FIX`

Implementation status:

- `NOT_STARTED`
- `IN_PROGRESS`
- `BLOCKED`
- `DONE`

Code and tests should reference the relevant Rule/Case IDs when practical.

## Skills

- **aquaguide-ui-ux** — Use for any user-facing UI or UX change involving navigation, task paths, dialogs/drawers/sheets, result presentation, compatibility/risk visualization, species detail, onboarding/forms, responsive layout, or complaints that the interface is flat, modal-heavy, text-heavy, hard to scan, or loses context. Read `.agents/skills/aquaguide-ui-ux/SKILL.md` before editing those surfaces.

## UI change gate

For UI work, do not treat typecheck/build success as visual acceptance. Follow the skill's audit workflow, preserve route/task context, add stable regression coverage, validate 390/900/1600 responsive behavior, and manually inspect the resulting screenshots when the workflow provides them.

## Final response

When repository write access is available, perform Context Sync before finishing the task. End the user-visible update with exactly one concise sync line:

`Context synced: <files changed>`

or, when nothing durable changed:

`No durable context changes.`
