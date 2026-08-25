# AquaGuide Historical Evidence Registry

**Status:** Active registry of historical material  
**Updated:** 2026-08-25

These files are retained because they contain useful test evidence, decisions, commit references, or rejected approaches. They are not current product, UI, deployment, or delivery authority. Start from [Project Truth](./PROJECT_TRUTH.md) instead.

| Material | Historical role | Current replacement |
| --- | --- | --- |
| `PROGRESS.md` | Long-term implementation ledger | `.ai/PROJECT_STATE.json`, `.ai/TASK_QUEUE.md`, `docs/PROJECT_TRUTH.md` |
| `HANDOFF.md` | Multi-stage historical handoff | `HANDOFF_LATEST.md` plus Project Truth |
| `ALIGNMENT_AUDIT_LATEST.md` | 2026-08-21 source audit and regression discovery record | `UI_REGRESSION_CONTRACT.md` and `docs/02-design/VISUAL_BASELINE.md` |
| `docs/01-definition/CURRENT_PRODUCT_STATUS.md` | 2026-08-01 product snapshot | `docs/01-definition/PRODUCT_TRUTH.md` |
| `docs/04-planning/CLOUD_SYNC_EVALUATION.md` | Earlier cloud-sync planning proposal | `CONTRACT.md` and `docs/03-development/DEPLOYMENT_STATE.md` |
| `docs/aquaguide_functional_analysis.md`, `docs/interaction_review.md`, `docs/UX_NAVIGATION_AUDIT.md` | Stage audits and issue discovery | Product Truth and Visual Baseline |
| Old PRs and branches | Commit-level historical evidence | `.ai/OPEN_PR_REGISTRY.md` and `.ai/RC_MIGRATION_LEDGER.md` |

## Rules for using historical material

- A claim becomes current only after it agrees with the relevant canonical home and current source/test evidence.
- Never copy historical UI geometry or global CSS into the current branch without a reviewed regression case.
- Never use a historical deployment success as proof of current branch/environment parity.
- Do not delete this material during consolidation. Mark supersession and retain links to its evidence.
