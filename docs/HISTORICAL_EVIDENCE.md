# AquaGuide Historical Evidence Registry

**Status:** Active registry of historical material
**Updated:** 2026-10-17

These files are retained because they contain useful test evidence, decisions, commit references, or rejected approaches. They are not current product, UI, deployment, or delivery authority. Start from the [当前文档入口](./README.md), then read [当前产品状态](./01-definition/CURRENT_PRODUCT_STATUS.md) and the [产品卡点与路线图](./04-planning/PRODUCT_GAPS_AND_ROADMAP.md).

| Material | Historical role | Current replacement |
| --- | --- | --- |
| `PROGRESS.md` | Long-term implementation ledger | `docs/01-definition/CURRENT_PRODUCT_STATUS.md` + `docs/04-planning/PRODUCT_GAPS_AND_ROADMAP.md` |
| `HANDOFF.md` | Multi-stage historical handoff | `docs/README.md` + current code/tests |
| `docs/PROJECT_TRUTH.md` | 2026-08 reading map, branch/PR/deployment snapshot | `docs/README.md` |
| `docs/03-development/DEPLOYMENT_STATE.md` | 2026-08 release and migration evidence | Git refs + release gates + live Vercel/Supabase checks |
| `ALIGNMENT_AUDIT_LATEST.md` | 2026-08-21 source audit and regression discovery record | `docs/02-design/VISUAL_BASELINE.md` + current tests |
| `docs/04-planning/CLOUD_SYNC_EVALUATION.md` | Earlier cloud-sync planning proposal | `CONTRACT.md` + current Repository/API implementation |
| `docs/aquaguide_functional_analysis.md`, `docs/interaction_review.md`, `docs/UX_NAVIGATION_AUDIT.md` | Stage audits and issue discovery | Product Truth and Visual Baseline |
| Old PRs and branches | Commit-level historical evidence | `.ai/OPEN_PR_REGISTRY.md` and `.ai/RC_MIGRATION_LEDGER.md` |

## Rules for using historical material

- A claim becomes current only after it agrees with the relevant canonical home and current source/test evidence.
- Never copy historical UI geometry or global CSS into the current branch without a reviewed regression case.
- Never use a historical deployment success as proof of current branch/environment parity.
- Do not delete this material during consolidation. Mark supersession and retain links to its evidence.
