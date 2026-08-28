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
- [ ] Push the A+B CI workflow and confirm the first GitHub Actions run passes on a clean Ubuntu 24.04 runner.
- [ ] Keep Published locked until the GitHub CI gate is proven green and the final public-deploy integration is reviewed.
- [ ] Re-check Vercel Preview after the Hobby daily deployment quota resets.
- [ ] Resolve duplicate/cross-category source-data review before affected records can use independent Index.

## Later
- [ ] Add an optional paid Supabase development branch only if persistent remote staging becomes operationally useful.
- [ ] Connect approved Published Species pages to the public AquaGuide deployment only after explicit approval.
- [ ] Add Search Console integration only after route/index contracts are stable in production.
