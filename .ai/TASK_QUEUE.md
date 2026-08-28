# Task Queue

Updated: 2026-08-28

## Completed
- [x] Create isolated `apps/admin-content` companion app with Auth + admin role + RLS.
- [x] Project 486 catalog rows into 276 Base Species groups and Variant members.
- [x] Add Base Species inheritance + Variant Override (`f27ed43`).
- [x] Add zh-CN → English suggestion workflow and data review (`465024a`).
- [x] Add route/canonical/hreflang/index contract and page preview (`43eec47`).
- [x] Add static generator + runtime SEO tests + revision/rollback (`cd363b4`).
- [x] Add staging publication guards and schema readiness probe (`d19fb13`, `70e539f`).
- [x] Adopt A+B: local Supabase for development + pinned GitHub Actions ephemeral Supabase for release validation.
- [x] Build one shared `test:supabase-gate` covering migrations 001–006, RLS, rollback and DB→EN/ZH static generation.
- [x] Verify the shared gate locally on macOS with Node 24.14.0 / Supabase CLI 2.115.0.

## Next
- [x] Push the pinned A+B workflow (`2d85a4e`); first clean GitHub run reached the fixed toolchain but exposed an Admin workspace lockfile mismatch.
- [x] Push the corrected lockfile / `npm ci --no-audit --no-fund` fix (`ef2f6ae`) and verify GitHub Actions run `33147127271` PASS end-to-end.
- [ ] Keep Published locked until the final public-deploy integration is reviewed; the A+B database/SEO gate itself is now green.
- [ ] Re-check Vercel Preview after the Hobby daily deployment quota resets.
- [ ] Resolve duplicate/cross-category source-data review before affected records can use independent Index.

## Later
- [ ] Add an optional paid Supabase development branch only if persistent remote staging becomes operationally useful.
- [ ] Connect approved Published Species pages to the public AquaGuide deployment only after explicit approval.
- [ ] Add Search Console integration only after route/index contracts are stable in production.
