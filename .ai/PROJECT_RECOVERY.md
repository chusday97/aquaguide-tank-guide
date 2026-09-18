# AquaGuide Project Recovery Protocol

## Recovery order
1. Check current git branch and commit.
2. Read .ai/PROJECT_STATE.json.
3. Read .ai/CURRENT_GOAL.md.
4. Read .ai/TASK_QUEUE.md.
5. Review MAIN_CONVERGENCE_LEDGER before merge decisions.

## Source of truth
GitHub state is the canonical project state.

## Rules
- Confirm branch status before changing code.
- Record product decisions in DECISION_LOG.md.
- Record implementation changes in EXECUTION_LOG.md.
- Do not overwrite stable UI decisions without checking UI_FREEZE.json.

## AI continuation
Restore context from .ai documents before planning or modifying the project.
