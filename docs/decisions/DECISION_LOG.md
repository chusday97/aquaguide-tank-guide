# AquaGuide Decision Log

Use this file for proposed decisions and accepted decision rationale that should not live as the full product rule itself.

Decision statuses: `PROPOSED`, `ACCEPTED`, `DEPRECATED`.

---

## AQ-UI-001 — Approved interactive visual baseline converges into RC without changing product authority

**Status:** `ACCEPTED`  
**Date:** 2026-08-25  
**Scope:** RC visual convergence

The user-approved visual reference is `baseline/visual-approved-2026-08-25` (`37a8d4d1`). Its interactive scene language may be reused in RC, but recommendation, compatibility, persistence and API behavior remain owned by `integration/aquaguide-rc1`.

The RC convergence branch is the only integration target. `main` remains release-only and must not receive this work without separate authorization.

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

---

## AQ-SEQ-001 — Complete P0 decision truth before expanding UI or isolated badcase patches

**Status:** `ACCEPTED`  
**Date:** 2026-08-23  
**Scope:** implementation sequencing

### Decision

AquaGuide enters P0 Product Truth / decision-layer consolidation before continuing additional UI expansion or isolated capacity/species-detail patches.

During P0:

- pause further expansion of PR #112 Interactive Atlas UI;
- pause one-off capacity fixes that do not establish the shared domain model;
- pause species-detail-only fixes that depend on the same unresolved compatibility/space semantics;
- preserve existing UI surfaces unless a minimal semantic correction is required;
- prioritize canonical product rules, Tank State, Compatibility Prior, and Space/Territory/Bioload separation.

### Rationale

The current repository contains multiple overlapping sources of compatibility, capacity and current-risk conclusions. Continuing to patch individual screens before establishing one authoritative model increases evaluator drift, duplicated heuristics and contradictory user outcomes.

### Exit condition

P0 is complete only when the canonical rules are reflected in domain-level implementation and acceptance/regression coverage strongly enough that UI surfaces can consume one authoritative result instead of re-implementing product logic locally.

### Exit outcome

**Satisfied:** 2026-08-23. The complete #113–#120 P0 stack was landed into `integration/aquaguide-rc1` and the final implementation head passed all six P0 permanent gates plus the nine-workflow RC1 release matrix.

The P0 UI freeze is therefore lifted for **re-entry review**. PR #112 may be revisited only after its stale diff is audited against the landed Planning Compatibility / Current Tank State / Water Change authority boundaries; it must not be merged as-is or allowed to reintroduce page-level heuristics.
