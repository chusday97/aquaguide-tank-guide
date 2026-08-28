# Task Queue

Updated: 2026-08-28

## Completed
- [x] Create isolated `apps/admin-content` companion app with Auth + admin role + RLS.
- [x] Project 486 catalog rows into 276 Base Species groups and Variant members.
- [x] Add Base Species inheritance + Variant Override (`f27ed43`).
- [x] Add data review queue for 5 category conflicts and 28 suspected duplicate records.
- [x] Add zh-CN → English suggestion workflow with separate locale Drafts (`465024a`).
- [x] Define deterministic route/canonical/hreflang contract and Index/Canonical/Noindex strategy (`43eec47`).
- [x] Add live public Species-page effect preview and verify migration 004/RLS locally.
- [x] Build fail-closed static Species HTML generator from explicit publication snapshots.
- [x] Add runtime tests for title/meta/H1/robots/canonical/hreflang and Species sitemap output.
- [x] Add Base + Variant revision history and rollback-to-Draft migration/UI.
- [x] Verify migration 005, revision RLS and Base/Variant rollback against fresh isolated local Supabase.

## Next
- [ ] Sync this generator/history milestone to GitHub and verify the new `admin-content` Vercel Preview.
- [ ] Validate migrations 001–005 plus snapshot export/generator against a dedicated staging Supabase environment.
- [ ] Keep Published disabled until staging publication validation passes end-to-end.
- [ ] Resolve duplicate/cross-category source-data review before enabling affected records for independent Index.

## Later
- [ ] Connect approved Published Species pages to the public AquaGuide deployment only after explicit approval.
- [ ] Add Search Console integration only after route/index contracts are stable in production.
