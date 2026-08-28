# Task Queue

Updated: 2026-08-28

## Completed
- [x] Isolated Admin app with Auth/admin role/RLS.
- [x] 486 catalog rows → 276 Base Species groups; Variant inheritance and batch Drafts.
- [x] Bilingual zh-CN/en authoring + suggestion-only translation architecture.
- [x] Route/canonical/hreflang/index contract + static release generator + sitemap tests.
- [x] Revision history + rollback-to-Draft.
- [x] A+B stable validation gate with pinned GitHub Actions ephemeral Supabase.
- [x] Migration 007 Editorial Review State + persisted Data Review decisions + Publish Readiness.
- [x] Verify migration 007 locally and on GitHub Actions run `33149941551` end-to-end.
- [x] Add Controlled Preview Publish for Approved Draft content using the same static generator.
- [x] Force preview HTML to `noindex,nofollow`, block deployable output dirs, add `robots.txt Disallow /`, and omit release sitemap.
- [x] Add Admin `Publish-ready → Export Preview Snapshot` with reviewer/notes stripped.
- [x] Run real local static Preview at `http://localhost:4020/`; Chromium confirms EN page, preview banner and zero page errors.

## Next
- [ ] Add Data Review queue overview counts/filters: pending / resolved / source-fix-required.
- [ ] Add Publish Readiness overview counts: blocked / ready-for-review / publish-ready across locale.
- [ ] Re-check Vercel Admin Preview after Hobby deployment quota reset.
- [ ] Validate 1–2 live translation suggestions after server-only provider key is configured.
- [ ] Decide whether Data Review decision revision history is operationally necessary.

## Later
- [ ] Explicit Production migration/public-deploy integration review before unlocking Published.
- [ ] Search Console integration only after public Species routes are deliberately released.
