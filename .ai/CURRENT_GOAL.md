# Current Goal

Updated: 2026-09-04
Canonical repo: `chusday97/aquaguide-tank-guide`
Branch: `feature/admin-content-v0`
Latest functional checkpoint: `8c9ceeb fix(admin-content): add import preflight gate`

## Runtime authority
- Species SEO Draft/review/revision authority: private `chusday97/aquaguide-seo-content`, branch `seo-admin-drafts`.
- Public AquaGuide repo receives code plus an explicit sanitized Staging snapshot only.
- Product/catalog source data stays read-only in AquaGuide.
- Supabase Species SEO paths are historical/compatibility only; do not restore them as runtime or staging authority.
- Canonical hosted Admin acceptance surface is AquaGuide Preview `/admin/seo/`; standalone `admin-content` Preview is not the real writable surface.

## Current milestone
Complete the first real 14-Species bilingual operating cycle:
`CSV preflight + field diff → Draft import → batch editorial review → explicit Staging Publish → hosted EN/ZH verification`.

## Stable completed baseline
- Blank operational CSV template with field guidance, accepted formats, 20 blank rows and 3 non-importing examples.
- Atomic page Draft + missing Base-template import with no partial writes.
- Source-identity fail-closed gate for incomplete scientific names.
- Duplicate review converged to one shared evidence view for single and bulk entry points.
- Duplicate evidence includes image, identity, source facts, bilingual SEO completeness/state, SEO last-edited time, explainable recommendation and EN/ZH Preview.
- Import now has an explicit preflight report: all row-level errors are visible; Draft creation is disabled until validation + actual-diff + writable-store gates pass.

## P0 next actions
1. Authenticated AquaGuide Preview: upload corrected batch-01 zh-CN CSV, review preflight + field Diff, then create Drafts.
2. Repeat for the English CSV.
3. Batch submit + approve the intended 14 Species and required Base rows.
4. Perform one explicit Staging Publish for the 14-Species allowlist.
5. Verify 28 hosted bilingual pages: title/meta/H1, localized name, source facts, canonical/hreflang, robots, CTA, internal-copy hygiene and deployment-level noindex.

## Branch convergence risk
- Live `main`: `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Current feature branch before docs sync: `8c9ceeb0d58ed2abb8b170d072ee12b0dd1c38fa`.
- Common base: `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Divergence: live main has 269 unique commits; feature branch has 95 unique commits.
- 11 files changed on both sides; merge-tree reports 7 changed-in-both files and 13 conflict hunks.
- Do not blindly merge/rebase. Use a dedicated reconciliation pass after current Admin operational acceptance.

## Safety boundary
- Production remains locked.
- Do not merge `main` without explicit authorization and a dedicated convergence audit.
- Do not bypass Admin authentication for human editorial/review decisions.
- Do not write private Draft content directly to the public AquaGuide repo.
