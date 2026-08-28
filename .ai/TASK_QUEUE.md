# Task Queue

Updated: 2026-08-28

## Completed
- [x] Create isolated `apps/admin-content` companion app with Auth + admin role + RLS.
- [x] Project 486 catalog rows into 276 Base Species groups and Variant members.
- [x] Add Base Species inheritance + Variant Override (`f27ed43`).
- [x] Add data review queue for 5 category conflicts and 28 suspected duplicate records.
- [x] Add zh-CN → English suggestion workflow with separate locale Drafts (`465024a`).
- [x] Define deterministic route/canonical/hreflang contract and Index/Canonical/Noindex strategy (`43eec47`).
- [x] Add static Species generator + runtime SEO/sitemap tests + Base/Variant revision/rollback (`cd363b4`).
- [x] Push `cd363b4` to `origin/feature/admin-content-v0`; `main` remains untouched.
- [x] Add staging-only snapshot export and end-to-end publishing verifier with Production DB/site deny-lists.
- [x] Remove generator fallback to Production canonical host; non-production generation now requires an explicit non-production `siteUrl`.
- [x] Confirm AquaGuide Supabase currently has no existing development branch.

## Next
- [ ] Re-check `admin-content` Vercel Preview after Hobby daily deployment quota resets; current manual Preview attempt is blocked by the 100-deploy/day limit.
- [ ] Provision or identify a dedicated AquaGuide staging Supabase only with explicit cost/environment approval.
- [ ] Apply migrations 001–006 in staging and prepare at least one reviewed bilingual self-canonical Index pair.
- [ ] Run `verify:staging-publish` against staging DB + staging public host; keep Published disabled until it passes.
- [ ] Resolve duplicate/cross-category source-data review before enabling affected records for independent Index.

## Later
- [ ] Connect approved Published Species pages to the public AquaGuide deployment only after explicit approval.
- [ ] Add Search Console integration only after route/index contracts are stable in production.
