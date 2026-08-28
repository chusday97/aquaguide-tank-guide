# Task Queue

Updated: 2026-08-28

## Completed
- [x] Create isolated `apps/admin-content` companion app with Auth + admin role + RLS.
- [x] Project 486 catalog rows into 276 Base Species groups and Variant members.
- [x] Add Base Species inheritance + Variant Override (`f27ed43`).
- [x] Add data review queue for 5 category conflicts and 28 suspected duplicate records.
- [x] Add zh-CN → English suggestion workflow with separate locale Drafts (`465024a`).
- [x] Define deterministic Species public-route/canonical/hreflang contract.
- [x] Add Index / Canonical-to-sibling / Noindex strategy, defaulting to Noindex.
- [x] Add live HTML public Species-page effect preview inside Admin.
- [x] Verify migration 004 and RLS in a fresh isolated local Supabase.

## Next
- [ ] Commit/push the route + index + public-page-preview milestone.
- [ ] Build a non-production Species static-page generator from Published SEO records.
- [ ] Add runtime tests for title/meta/canonical/hreflang/robots and sitemap output.
- [ ] Add version history / rollback before allowing Published SEO updates.
- [ ] Resolve duplicate/cross-category source-data review before enabling independent Index.

## Later
- [ ] Validate the final publishing pipeline in staging Supabase.
- [ ] Connect approved Published Species pages to the public AquaGuide deployment.
- [ ] Add Search Console integration only after route/index contracts are stable.
