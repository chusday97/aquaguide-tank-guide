# AquaGuide Decision Log

Use this file for proposed decisions and accepted decision rationale that should not live as the full product rule itself.

Decision statuses: `PROPOSED`, `ACCEPTED`, `DEPRECATED`.

---

## AQ-CTX-001 — Adopt repository-based Context Sync

**Status:** `ACCEPTED`  
**Date:** 2026-08-23  
**Scope:** project collaboration / long-term AI context

### Decision

AquaGuide uses the repository as its persistent project context. Chat history, model memory, old prompts, old Handoff text and current code are not sufficient sources of product truth.

After every substantive product discussion, investigation, implementation or regression task, the active agent must classify newly created durable information and route it to the canonical document defined in `docs/CONTEXT_ROUTING.md`.

### Consequences

- accepted product behavior belongs in `docs/product/*` or `docs/rules/*`;
- proposed ideas remain `PROPOSED` until explicitly confirmed;
- architecture/data/API decisions belong in `CONTRACT.md` or architecture docs;
- product failures belong in `docs/cases/BADCASES.md`;
- expected behavior examples belong in `docs/cases/ACCEPTANCE_CASES.md`;
- `HANDOFF_LATEST.md` is current implementation/release state only;
- `PROGRESS_LATEST.md` is implementation history only;
- durable evidence remains separate from product decisions;
- the agent performs Context Sync automatically when repository write access is available.

### Migration rule

Do not bulk-duplicate legacy Handoff, Progress or Badcase text. Migrate a fact when it is touched, and keep one canonical full definition.

### Supersedes

The previous informal workflow in which the user had to repeatedly request “update Handoff / Badcase / Progress” and those files accumulated product logic alongside implementation status.
