# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

The A+B infrastructure gate is complete. The Admin now moves from infrastructure work to a safe editorial release workflow.

## Current milestone

Build a visible publish-readiness and data-review workflow without touching `main` or Production Supabase:

`Draft → editorial checks → source-data review → publish-readiness → Preview Publish → A+B verification`

## Priority order

1. Add a publish-readiness state/checklist that explains exactly why a Base/Variant/locale is not publishable.
2. Turn the 5 category conflicts and 28 suspected duplicate records into an actionable review workflow with explicit human decisions; never auto-edit `fishData.ts`.
3. Add a non-production Preview Publish path that materializes approved bilingual pages into an explicit temporary output and runs the existing generator/canonical/hreflang/sitemap gate.
4. Validate one or two real zh-CN → English AI suggestions after a server-side provider secret is configured; AI remains suggestion-only.

## Stability rules

- B = Mac local Supabase for fast iteration; A = pinned GitHub Actions ephemeral Supabase for reproducible validation.
- The shared `test:supabase-gate` remains mandatory for database/public-page changes.
- GitHub CI remains validation-only: no Production credentials, writes, deploys or automatic commits.
- Published must not become an automatic Production action. Any future unlock first means “eligible for controlled Preview Publish”, not “go live”.
- Production Supabase and `main` remain untouched until explicit approval.
- Paid persistent Supabase staging is optional, not a prerequisite.
