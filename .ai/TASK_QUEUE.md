# Task Queue

Updated: 2026-09-04
Canonical continuation: read `.ai/HANDOFF_LATEST.md` first.
Architecture contract: `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`.

## P0 — Product/Care authority convergence
- [x] Inventory every frontend consumer of `fishData.ts` / `careTopicsData.ts` and classify runtime vs build-time use. See `PUBLISHED_CONTENT_AUTHORITY.md`.
- [x] Define one published Product/Care read contract for Species and Care content. See `PUBLISHED_CONTENT_AUTHORITY.md`.
- [x] Decide explicit role of static datasets: seed/audit fixture/offline fallback only — never a competing live authority.
- [x] Implement Draft/save isolation from the last Published Product/Care version using immutable publication snapshots; Production migration remains intentionally unapplied.
- [x] Route Encyclopedia Product Data to the published authority, with static seed only as explicit API fallback.
- [x] Route Care Encyclopedia plus Aquarium/Identify diagnosis Care Knowledge to the published authority, with static seed only as explicit API fallback.
- [ ] Prove one Admin Product edit reaches the intended frontend Preview.
- [ ] Prove one Admin Care edit reaches the intended frontend Preview.
- [ ] Verify those edits do not mutate user aquarium state or bypass compatibility rule authority.
- [ ] Correct any Admin copy that claims immediate live visibility before the consumer path is truly published.

## P0 — Existing SEO operational acceptance
- [ ] Authenticated import corrected batch-01 zh-CN → preflight/Diff → Draft batch.
- [ ] Authenticated import corrected batch-01 en → preflight/Diff → Draft batch.
- [ ] Batch-scoped submit/approve intended Species + Base rows.
- [ ] One explicit bilingual Staging Publish when readiness is fully green.
- [ ] Verify 28 hosted EN/ZH pages: metadata, H1, facts, canonical/hreflang, robots, CTA, hygiene.
- [ ] Keep Production locked.
## P1 — Change Impact Preview
- [ ] Classify fields as display-only, decision-critical Product Data, Care workflow, Compatibility rule or SEO-only.
- [ ] Show affected consumers before release: Encyclopedia, Aquarium, Compatibility, Care and SEO.
- [ ] Add before/after Preview for decision-critical edits.
- [ ] Add regression checks for compatibility-result changes caused by Product Data edits.

## P1 — Compatibility Admin
- [ ] Operator UI for Species behavior profiles.
- [ ] Pair Rule management with Evidence, Confidence and Review Status.
- [ ] Version Compatibility rules.
- [ ] Require regression/impact test before rule publish.
- [ ] Preserve human review; do not allow opaque AI auto-publish.

## P2 — Operations maturity
- [ ] Unified Publish Center for Diff → Impact → Preview → Review → Staging → Production.
- [ ] Stronger roles/permissions and release audit history.
- [ ] Care SEO as a downstream projection of approved Care Knowledge.
- [ ] AI-assisted source extraction, conflict detection, impact explanation and Draft generation from approved facts.

## Stable completed baseline — do not reimplement
- [x] Product/Care Admin route exists at `/admin/product-content`.
- [x] Species SEO Admin authority exists at `/admin/seo/`.
- [x] SEO private Repo Draft/review/revision authority.
- [x] Atomic bulk import + missing Base creation.
- [x] Blank operational CSV template + preflight + field Diff.
- [x] Source-identity fail-closed gate.
- [x] Evidence-based duplicate comparison shared by single/bulk review.
- [x] Durable import batches + server-side review/publish scope checks.
- [x] Bilingual Staging readiness + Canonical dependencies + noindex Preview safety.
