# Task Queue

Updated: 2026-09-05
Canonical continuation: read `.ai/HANDOFF_LATEST.md` first.
Architecture contract: `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`.

## P0 — Product/Care authority convergence
- [x] Inventory every frontend consumer of `fishData.ts` / `careTopicsData.ts` and classify runtime vs build-time use. See `PUBLISHED_CONTENT_AUTHORITY.md`.
- [x] Define one published Product/Care read contract for Species and Care content. See `PUBLISHED_CONTENT_AUTHORITY.md`.
- [x] Decide explicit role of static datasets: seed/audit fixture/offline fallback only — never a competing live authority.
- [x] Implement Draft/save isolation from the last Published Product/Care version using immutable publication snapshots; Production migration remains intentionally unapplied.
- [x] Route Encyclopedia Product Data to the published authority, with static seed only as explicit API fallback.
- [x] Route Care Encyclopedia plus Aquarium/Identify diagnosis Care Knowledge to the published authority, with static seed only as explicit API fallback.
- [x] Prove one Admin Product edit reaches the intended frontend Preview: Save remains private; Publish advances Encyclopedia runtime.
- [x] Prove one Admin Care edit reaches the intended frontend Preview: Save remains private; Publish advances Care runtime.
- [x] Verify Product/Care publish does not mutate `aquarium_app_state_v1` and Product runtime hydration does not mutate Compatibility/static authority inputs.
- [x] Correct Admin publish copy to describe only connected Product/Care consumers and preserve Compatibility authority boundaries.

## P0 — Existing SEO operational acceptance
- [x] Authenticated import corrected batch-01 zh-CN → preflight/Diff → Draft batch.
- [x] Authenticated import corrected batch-01 en → preflight/Diff → Draft batch.
- [x] Batch-scoped submit/approve intended Species + Base rows.
- [x] One explicit bilingual Staging Publish when readiness is fully green.
- [x] Verify 28 hosted EN/ZH pages: metadata, H1, facts, canonical/hreflang, robots, CTA, hygiene.
- [x] Keep Production locked.
## CI operating policy — completed
- [x] Every normal push/PR runs lightweight checks only: contracts, lint/typecheck, builds and diff/generated-data hygiene.
- [x] Golden / Visual / evaluation-history / browser-heavy suites run only on manual dispatch, merge queue, or PR labels `run-heavy-ci` / `merge-ready`.
- [x] Preserve existing required-check workflow/job identities for compatibility with branch rules.

## P1 — Change Impact Preview
- [x] Classify fields as display-only, decision-critical Product Data, Care workflow, Compatibility rule or SEO-only.
- [x] Show affected consumers before release: Encyclopedia, Aquarium, Compatibility, Care and SEO; distinguish direct update vs independent-authority review.
- [x] Add before/after Preview for decision-critical edits.
- [x] Add regression checks for compatibility-result changes caused by Product Data edits.

## P1 — Compatibility Admin
- [x] Operator UI for Species behavior profiles with reviewed-baseline audit plus isolated Draft revision create/edit/submit-review.
- [x] Pair Rule management with reviewed Evidence snapshots, Confidence and Review Status using isolated Draft revision create/edit/submit-review.
- [x] Add server-computed Draft-vs-reviewed structural Impact Check plus explicit human Approve/Reject; approval does not publish.
- [x] Converge reviewed Compatibility publish authority with the runtime read path; exact 7/4 DB authority activates atomically with static reviewed fallback.
- [x] Version Compatibility rules through the final reviewed publish transition using transactional Profile/Pair RPCs.
- [x] Require structural impact + real server engine regression + canonical Evidence resolution before human approval/publish, with freshness invalidation.
- [x] Preserve explicit human review; no opaque AI auto-publish.

## P2 — Operations maturity
- [x] Unified Publish Center / release history & audit V1.
  - [x] Architecture inventory: Product/Care + Compatibility remain Business API/Supabase authorities; SEO remains independent Repo Admin / `admin-store.json` authority.
  - [x] Define one read-only `ReleaseEvent` contract across Product/Care publications, Compatibility revisions/publishes and SEO revisions/activity/import/staging history.
  - [x] Add read-only aggregation services/API without copying or moving any subsystem write authority.
  - [x] Add `/admin/publish-center` timeline/readiness UI with source/auth availability clearly shown.
  - [x] Add read-only release detail/readiness drill-down and explicitly surface Product/Care current-only history coverage.
  - [x] Add per-authority capability matrix for Diff → Impact → Preview → Review → Staging → Production, distinguishing available / partial / locked / not applicable.
  - [x] Add read-only cross-authority coordination context by explicit catalog/pair/batch keys, with authority jump links; do not infer dependency or auto-publish.
  - [x] Close Publish Center V1 as a coordination/read model only; any future cross-domain write orchestration requires a separate product decision.
- [x] Stronger roles/permissions boundary visibility and release audit history V1.
  - [x] Expose current Business `admin` vs SEO `repo-admin` permission boundary without merging auth systems.
  - [x] Add append-only Product/Care publication audit history in code with actor/version/publish/archive events; migration remains unapplied and route falls back to current-only.
  - [x] Decision: defer editor/reviewer/publisher role split until a real multi-operator requirement exists; do not expand RLS surface speculatively.
- [x] Care SEO downstream projection foundation from approved Care Knowledge.
  - [x] Projection reads only the last Published Care snapshot/version; Draft Care never becomes SEO source.
  - [x] SEO-editable projection fields are isolated from protected Care facts/evidence.
  - [x] Deterministic bilingual routes: EN `/care/<catalogKey>.html`, zh-CN `/zh/care/<catalogKey>.html`, `x-default` → EN; SPA fallback stays `noindex,follow`.
  - [x] Fail-closed static Staging artifact builder requires bilingual pairing, equal Care source version, approved editorial and non-Production destination; no explicit snapshot means normal builds skip generation.
- [x] Care SEO Editorial Draft/Review + Staging acceptance.
  - [x] Persist downstream SEO Draft/review state without duplicating Care Knowledge authority.
  - [x] Produce an explicit sanitized Staging snapshot/handoff from approved Care SEO rows.
  - [x] Hosted bilingual acceptance for title/meta/H1/canonical/hreflang/robots/source-version before any index unlock.
  - [x] Prove the no-cost acceptance path with ephemeral local Supabase; paid persistent Staging is optional, not required.
  - [x] Keep Production locked unless separately authorized.
- [ ] Care SEO Index / Production release decision.
  - [x] Hosted Staging prerequisite is satisfied.
  - [ ] Keep `noindex` and Production locked until the user explicitly chooses a release action.
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
