# AquaGuide Context Routing

Status: `ACCEPTED`

This file defines where durable project information belongs. The repository, not chat history, is the long-term context source.

## Canonical routing

| Information type | Canonical destination |
|---|---|
| Product positioning / cross-domain principles | `docs/product/PRODUCT_PRINCIPLES.md` |
| User journeys / task paths | `docs/product/USER_JOURNEYS.md` |
| Tank current-state rules | `docs/rules/TANK_STATE.md` |
| Compatibility / planning rules | `docs/rules/COMPATIBILITY.md` |
| Space / territory / bioload rules | `docs/rules/SPACE.md` |
| Water-change decision rules | `docs/rules/WATER_CHANGE.md` |
| Diagnosis / observation rules | `docs/rules/DIAGNOSIS.md` |
| AI authority and interpretation boundary | `docs/rules/AI_BOUNDARY.md` |
| Proposed or accepted decision rationale | `docs/decisions/DECISION_LOG.md` |
| Architecture / API / persistence / data ownership | `CONTRACT.md` and relevant architecture docs |
| Product badcases | `docs/cases/BADCASES.md` |
| Acceptance cases | `docs/cases/ACCEPTANCE_CASES.md` |
| Current implementation / release state | `HANDOFF_LATEST.md` |
| Implementation history | `PROGRESS_LATEST.md` |
| Production-readiness state, when present | `PRODUCTION_READINESS_LATEST.md` |
| Evidence gaps / source review | `.project-journal/EVIDENCE_GAPS.md` and the evidence system |
| Temporary discussion / examples / brainstorming | do not persist |

## Source-of-truth priority

Use this order when information conflicts:

1. accepted `docs/rules/*`
2. `docs/product/*`
3. accepted entries in `docs/decisions/DECISION_LOG.md`
4. `docs/cases/ACCEPTANCE_CASES.md`
5. `CONTRACT.md` / architecture docs
6. current implementation
7. `HANDOFF_LATEST.md`
8. `PROGRESS_LATEST.md` / changelog
9. legacy documents, old conversations, comments and prompts

Existing code proves what the product currently does; it does not automatically prove what the product should do.

## Legacy document migration

The repository already contains large historical files such as `HANDOFF.md`, `PROGRESS.md`, date-stamped handoffs, `BADCASE_LATEST.md`, `40-DOCS/*`, and evaluation artifacts.

Do not bulk-copy their contents into the new canonical structure. That would create duplicate sources of truth.

Migration is touch-based:

1. when an old product rule becomes relevant, move its full definition into the matching `docs/rules/*` file;
2. when an old badcase is investigated or updated, move/update it in `docs/cases/BADCASES.md` and leave only a short pointer in the legacy location when practical;
3. when an old accepted product decision is still active, record it in the correct product/rule document and reference its stable ID elsewhere;
4. do not migrate obsolete discussion merely because it exists in history.

Until a legacy item is migrated, it is evidence/history only and has lower priority than accepted canonical docs.

## One fact, one canonical home

- Rules contain the full product definition.
- Acceptance cases contain GIVEN / WHEN / THEN / MUST NOT examples that prove the rule.
- Code and tests reference Rule/Case IDs when practical.
- `HANDOFF_LATEST.md` says what is implemented now and what is next.
- `PROGRESS_LATEST.md` records implementation history.
- Other documents should link or cite the stable ID instead of repeating the full fact.

## Task startup sequence

For each substantive task:

1. read `AGENTS.md`;
2. read this routing file;
3. read the relevant product principle / user journey;
4. read only the relevant rule files;
5. read related acceptance cases and badcases;
6. read `CONTRACT.md` only if architecture, API, auth, persistence, data ownership or deployment is affected;
7. read `HANDOFF_LATEST.md` for current state;
8. inspect implementation;
9. execute the task;
10. perform Context Sync before finishing.

## Context Sync decision test

Persist information when a future AI that did not participate in the current conversation would likely implement the product incorrectly without it.

Do not persist temporary explanation, brainstorming, rejected approaches, generic examples, or model speculation.
