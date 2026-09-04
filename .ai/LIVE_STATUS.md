# Live Status

Updated: 2026-09-04
Canonical branch: `feature/admin-content-v0`
Latest converged functional head: `f4805669 merge: converge import batch scope safeguards`

## Current state
- Production remains locked; public `main` remains `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Species SEO runtime authority is Repo-backed, not Supabase-backed.
- Private Draft/review authority: `chusday97/aquaguide-seo-content / seo-admin-drafts`.
- Public Staging delivery: `chusday97/aquaguide-tank-guide / feature/admin-content-v0` via explicit sanitized snapshot only.
- Canonical hosted Admin path: AquaGuide Preview `/admin/seo/`; standalone `admin-content` Preview is not the writable operational surface.

## Latest verified product behavior
- CSV import: Download → Fill/mark → Preflight + Diff → Create Draft.
- Every successful CSV write now creates a durable server-side `import_batch` with batch id, filename, locale, Species allowlist, Base-group allowlist, source and status.
- Bulk editorial review defaults to the latest import scope; historical eligible Drafts require an explicit full-library opt-in.
- Persisted Repo batch scope outranks localStorage/Activity recovery. Browser/activity scope remains compatibility fallback only.
- Batch-bound review RPC rejects Species/Base resources outside the persisted batch.
- Batch Staging readiness mirrors bilingual backend gates and includes required Canonical dependencies while preserving the 20-Species cap.
- Batch-bound Staging API validates the exact persisted batch allowlist plus required Canonical dependencies before writing a snapshot.

## Validation
- Admin contract + public generator + Controlled Preview + Repo backend/API + dual-repo routing: PASS.
- Root AquaGuide build: PASS.
- SEO Species compatibility handoff: PASS.
- Admin authority UI regression: PASS.
- `git diff --check`: PASS.
- Converged implementation preserved the concurrent branch's bilingual Approved/clean Staging readiness and Canonical-dependency calculation, then added server-side durable batch authority and fail-closed scope checks.

## Branch state
- Feature remote head: `f480566988c5a07e3e7306085856fead8158bec3`.
- Live `main`: `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Current divergence: main-only 269 commits / feature-only 105 commits.
- Do not merge or rebase `main` during ordinary Admin work; dedicated reconciliation remains required after operational acceptance.
