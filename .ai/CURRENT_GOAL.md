# Current Goal

Updated: 2026-09-04
Canonical repo: `chusday97/aquaguide-tank-guide`
Branch: `feature/admin-content-v0`
Latest functional checkpoint: `adbc694 fix(admin-content): mirror staging bilingual gate`

## Runtime authority
- Species SEO Draft/review/revision authority: private `chusday97/aquaguide-seo-content`, branch `seo-admin-drafts`.
- Public AquaGuide repo receives code plus an explicit sanitized Staging snapshot only.
- Product/catalog source data stays read-only in AquaGuide.
- Supabase Species SEO paths are historical/compatibility only; do not restore them as runtime or staging authority.
- Canonical hosted Admin acceptance surface is AquaGuide Preview `/admin/seo/`; standalone `admin-content` Preview is not the real writable surface.

## Current milestone
Complete the first real 14-Species bilingual operating cycle:
`CSV preflight + field diff → Draft import → import-scoped batch review → one batch Staging Publish → hosted EN/ZH verification`.

## Stable completed baseline
- Blank operational CSV template with field guidance, accepted formats, 20 blank rows and 3 non-importing examples.
- Atomic page Draft + missing Base-template import with no partial writes.
- Source-identity fail-closed gate for incomplete scientific names.
- Duplicate review uses one evidence view for single and bulk entry points.
- Import has a persistent preflight report and fail-closed Create Draft action.
- Bulk editorial review defaults to the most recent import batch, not the full historical Draft pool.
- Recent import scope is cached locally and recoverable from private `bulk_import` Activity metadata after refresh/browser changes.
- `全部可执行内容` is an explicit opt-in scope; it is never the default after import.
- The recent import batch can be published to Staging in one explicit action rather than one Species at a time.
- Batch Staging mirrors backend release rules: max 20 Species including Canonical dependencies; zh-CN/en page Drafts and zh-CN/en Base Drafts must all be Approved, reviewed and hygiene-clean.

## P0 next actions
1. Authenticated AquaGuide Preview: upload corrected batch-01 zh-CN CSV, review preflight + field Diff, then create Drafts.
2. Repeat for the English CSV.
3. In `批量内容审核`, keep scope on `最近导入批次`; batch submit and approve the intended 14 Species + required Base rows.
4. When the batch Staging card reports every selected Species bilingual-approved, perform one explicit Staging Publish.
5. Verify 28 hosted bilingual pages: title/meta/H1, localized name, source facts, canonical/hreflang, robots, CTA, internal-copy hygiene and deployment-level noindex.

## Branch convergence risk
- Live `main`: `64fa58a16a723b74621ac1db513adb1efb47e282` at the latest dedicated convergence audit.
- Common base at that audit: `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- The audit found 269 main-only commits, 95 feature-only commits, 11 overlapping changed files, 7 changed-in-both files and 13 simulated conflict hunks.
- Do not blindly merge/rebase. Use a dedicated reconciliation pass after current Admin operational acceptance.

## Verification
- GitHub Admin Content CI run `33786995600` for `adbc694` completed SUCCESS: contract/generator, Repo gates, production build, root AquaGuide Species SEO integration, catalog parity and diff hygiene.
- Local interactive browser validation for this latest scope/Staging change was not run in this round because the authorized Remote Desktop device disconnected; do not claim a human hosted Admin write occurred.

## Safety boundary
- Production remains locked.
- Do not merge `main` without explicit authorization and a dedicated convergence audit.
- Do not bypass Admin authentication for human editorial/review decisions.
- Do not write private Draft content directly to the public AquaGuide repo.
