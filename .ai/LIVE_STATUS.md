# Live Status

Updated: 2026-09-04
Canonical branch: `feature/admin-content-v0`
Docs HEAD before this sync: `7fb19b28c7105fdfcd9f1f443ea42b82341e64da`
Latest converged functional baseline: `f4805669 merge: converge import batch scope safeguards`

## Product state
- AquaGuide product includes Species, Aquarium/Care, Compatibility and SEO acquisition flows.
- `/admin/product-content` currently exposes Product Data + Care editing/publish actions.
- `/admin/seo/` remains the Species SEO editorial/publishing subsystem.
- Compatibility runtime exists and uses reviewed evidence/rules, but no mature operator rule-management UI exists yet.

## Critical current gap
- Encyclopedia still consumes static `fishData.ts` directly.
- Care Encyclopedia still consumes generated `careTopicsData.ts` directly.
- Product/Care Admin writes a separate API-backed content path.
- Therefore Admin-published Product/Care data is not yet the single verified frontend authority.

## SEO subsystem state
- Repo-backed private Draft/review/revision/import-batch authority is stable.
- CSV preflight/Diff, duplicate evidence review, batch-bound review and bilingual Staging gates are implemented.
- Corrected 14-Species bilingual batch-01 has passed isolated dry-run but not the full authenticated hosted operating cycle.
- Production remains locked.
## Current next work
P0-A: converge Product/Care published source-of-truth and frontend consumers.
P0-B: finish hosted batch-01 SEO acceptance when authenticated human review is available.
P1: add impact Preview and then Compatibility Admin.

## Branch / deploy safety
- Live main: `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Feature remote before this docs sync: `7fb19b28c7105fdfcd9f1f443ea42b82341e64da`.
- Do not treat feature as merge-ready for main; dedicated reconciliation remains required.
- Production/main remain untouched by this documentation sync.

## Canonical read set
Use `HANDOFF_LATEST → AQUA_OPERATIONS_STUDIO_ARCHITECTURE → CURRENT_GOAL → TASK_QUEUE → LIVE_STATUS → BRANCH_STATUS` before new work.
