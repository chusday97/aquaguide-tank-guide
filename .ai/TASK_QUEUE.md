# Task Queue

Updated: 2026-08-28

## Completed
- [x] Isolated Admin app with Auth/admin role/RLS.
- [x] 486 catalog rows → 276 Base Species groups; Variant inheritance and batch Drafts.
- [x] Bilingual zh-CN/en authoring + AI suggestion-only translation.
- [x] Route/canonical/hreflang/index contract + static Species generator + sitemap tests.
- [x] Revision history + rollback-to-Draft.
- [x] A+B stable validation gate with pinned GitHub Actions ephemeral Supabase.
- [x] Add Editorial Review State: `editing → ready_for_review → approved`.
- [x] Add persisted Data Review decisions for category conflicts and duplicate sets.
- [x] Add explicit Publish Readiness panel and single-member Base editor support.
- [x] Make content edits invalidate approval automatically; rollback resets to `editing`.
- [x] Make Generator require Approved Base + Variant and consume safe review-resolution RPC output.
- [x] Verify migrations 001–007, RLS, approval invalidation, rollback and DB→EN/ZH pages in B layer.

## Next
- [ ] Commit/push this milestone and require GitHub A-layer run to PASS with migration 007.
- [ ] Build controlled Preview Publish command/output using only Publish-ready reviewed content.
- [ ] Add review-queue overview counts: pending / resolved / source-fix-required.
- [ ] Add audit/history view for Data Review decision changes if operationally needed.
- [ ] Re-check Vercel Admin Preview after deployment quota resets.

## Later
- [ ] Real AI translation smoke test on 1–2 Species with server-only provider key.
- [ ] Explicit Production public-deploy integration review before unlocking Published.
