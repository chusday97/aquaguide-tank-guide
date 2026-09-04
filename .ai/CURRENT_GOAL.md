# Current Goal

Updated: 2026-09-04
Canonical repo: `chusday97/aquaguide-tank-guide`
Branch: `feature/admin-content-v0`
Latest converged functional head: `f4805669 merge: converge import batch scope safeguards`

## Runtime authority
- Species SEO Draft/review/revision/import-batch authority: private `chusday97/aquaguide-seo-content`, branch `seo-admin-drafts`.
- Public AquaGuide repo receives code plus an explicit sanitized Staging snapshot only.
- Product/catalog source data remains read-only in AquaGuide.
- Supabase Species SEO paths are historical/compatibility only; do not restore them as runtime or staging authority.
- Canonical hosted Admin acceptance surface is AquaGuide Preview `/admin/seo/`.

## Current milestone
Complete the first real 14-Species bilingual operating cycle:
`CSV preflight + field Diff → locale-specific Draft batch import → batch-scoped editorial review → one batch Staging Publish → hosted EN/ZH verification`.

## Stable completed baseline
- Blank operational CSV template with field guide, format rules, 20 blank rows and 3 non-importing examples.
- Atomic page Draft + create-if-missing Base-template import.
- Source-identity fail-closed gate for incomplete scientific names.
- Evidence-based duplicate review shared by single and bulk entry points.
- Persistent CSV preflight report and fail-closed Create Draft action.
- Durable Repo `import_batches` authority with server-generated batch id, filename, locale, Species keys, Base-group keys, source and workflow status.
- Bulk review defaults to latest import scope; all historical eligible content is explicit opt-in only.
- Batch-bound review mutations are revalidated by the Repo backend; UI scope alone is never authority.
- Browser localStorage / Activity recovery is fallback for legacy sessions only; persisted Repo batch wins when present.
- Staging batch UI verifies zh-CN + en page Drafts and zh-CN + en Base Drafts are Approved/reviewed/hygiene-clean.
- Required Canonical dependencies are added to the Staging selection, and the server validates the exact batch + dependency allowlist.

## P0 next actions
1. Authenticated AquaGuide Preview: import corrected batch-01 zh-CN after preflight + field Diff.
2. Import corrected batch-01 English the same way. Each locale import gets its own durable batch record.
3. In `批量内容审核`, keep the safe latest-import scope and submit/approve the intended 14 pages + required Base rows for each locale.
4. Publish one approved batch to Staging only when the bilingual readiness card is fully green.
5. Verify the 28 hosted EN/ZH pages: title/meta/H1, localized name, source facts, canonical/hreflang, robots, CTA, internal-copy hygiene and deployment-level noindex.

## Branch convergence risk
- Live main: `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Feature: `f480566988c5a07e3e7306085856fead8158bec3`.
- Current divergence: main-only 269 / feature-only 105 commits.
- Do not blindly merge/rebase. Dedicated feature/main reconciliation remains after Admin operational acceptance.

## Safety boundary
- Production remains locked.
- Do not merge `main` without explicit authorization and dedicated reconciliation.
- Do not bypass authenticated Admin for human editorial/review decisions.
- Do not write private Draft content directly into the public AquaGuide repo.
