# Task Queue

Updated: 2026-08-28

## Completed
- [x] Create isolated `apps/admin-content` companion app with Auth + admin role + RLS.
- [x] Project 486 catalog rows into 276 Base Species groups and Variant members.
- [x] Add Base Species inheritance + Variant Override (`f27ed43`).
- [x] Add zh-CN → English suggestion workflow and data review (`465024a`).
- [x] Add route/canonical/hreflang/index contract and page preview (`43eec47`).
- [x] Add static generator + runtime SEO tests + revision/rollback (`cd363b4`).
- [x] Add staging/Production deny-list guards and schema readiness probe (`d19fb13`, `70e539f`).
- [x] Adopt A+B and prove the shared ephemeral Supabase gate locally and on GitHub Actions.
- [x] GitHub Actions run `33147127271` PASS end-to-end on clean Ubuntu 24.04 (`ef2f6ae`).

## Now — product completion
- [ ] Add a publish-readiness checklist/state machine for Base + Variant + locale. Do not map “ready” directly to Production publish.
- [ ] Make Data Review actionable: record explicit human decisions for 5 category-conflict groups and 28 suspected duplicate records; no automatic source edits.
- [ ] Block independent Index/Preview Publish until required review decisions exist.
- [ ] Add controlled Preview Publish to an explicit non-production output and reuse the existing static generator + A+B gate.
- [ ] Re-check Vercel Admin Preview after the Hobby daily deployment quota resets.

## Next
- [ ] Configure server-only Admin AI provider secret and validate 1–2 real Chinese → English suggestions; keep human approval and Draft-only writes.
- [ ] Review public deployment integration only after Preview Publish is reproducible.
- [ ] Decide whether/when to apply migrations 001–006 to Production AquaGuide Supabase; this requires explicit approval.

## Later
- [ ] Add a paid persistent Supabase development branch only if long-lived remote staging becomes operationally useful.
- [ ] Add Search Console integration only after public route/index contracts are stable in production.
