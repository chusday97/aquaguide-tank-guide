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
- [x] Care SEO Index / Production release decision.
  - [x] Hosted Staging prerequisite is satisfied.
  - [x] Fail-closed release readiness gate binds the exact Staging snapshot hash to hosted acceptance evidence; Staging builder rejects `index` even if the snapshot is hand-edited.
  - [x] Persist non-secret hosted acceptance evidence without triggering a Vercel runtime deployment.
  - [x] Explicit human decision recorded as `hold_noindex`; exact accepted snapshot/deployment are bound and Production/index remain locked.
- [x] AI-assisted source extraction, conflict detection, impact explanation and Draft generation from approved facts.
  - [x] Published-Care-only source binding with exact source-version rejection and legacy-source refusal.
  - [x] AI output is schema-gated to SEO-only fields with forced `noindex`; protected Care rewrites and auto-save/review/publish are rejected.
  - [x] Admin UI exposes source extraction, conflicts, impact explanation, review warnings and local-only Draft application.
  - [x] Contract + 1280/390 browser acceptance prove AI generation/application creates no Editorial write until explicit Save Draft.

## Active override — Species SEO Admin usability / acceptance
- [x] Remove duplicated first-screen bulk review / content review / template import controls from the topbar; keep those capabilities in secondary tools.
- [x] Add one queue-driven `当前下一步` primary action: data review → editorial review → Preview-ready → editing fallback.
- [x] Verify 1440px / 390px layout, zero horizontal overflow, CTA queue routing and read-only no-write behavior.
- [x] Add safe `?demo=1` read-only entry only for localhost / `*.pages.dev`; save/review/publish remain disabled.
- [x] Verify exact-SHA + stable-branch Cloudflare `/admin/seo/?demo=1`; use the stable feature URL as the canonical UI acceptance entry.
- [x] Make stateful interaction feedback unmistakable without breaking layout: workflow `attention` is separate from operator `selected`; scope/locale/filter controls use persistent selected styling; normal Species selection uses the existing 16×16 square radio only, while that slot becomes a checkbox only in batch mode. No extra row-level ✓ badge.
- [x] Rebuild information hierarchy around a visible 4-stage workflow: Data Review → Content Edit → Human Review → Staging.
- [x] Separate current-page key actions from detailed editing; collapse batch/history/translation/diagnostic tools under `更多工具`.
- [x] Verify all 4 stages are simultaneously visible at 390px in a 2×2 layout; 1440/390 browser checks have zero page overflow.
- [x] Visually separate `当前物种页面` from `基础模板`: explicit scope context card, different accent/background, and clear copy explaining page-only vs shared-template impact.
- [x] In read-only Demo, suppress false `Schema 未应用` error language; show only `只读演示 · 不会写入`.
- [x] Enforce a strict three-color CMS system: Graphite / White / one Green accent; all semantic states and all six advanced tools are hue-neutral outside the Green interaction accent.
- [x] Establish an explicit typography hierarchy (page → section → action → field label → body → meta) and verify desktop/mobile computed sizes.
- [x] Runtime-scan 1440/390 initial + all advanced-tool states: zero extra saturated hues and zero horizontal overflow.
- [x] Remove the ambiguous `页 / 模` glyph badge; keep scope identity in plain language (`当前物种页面` / `基础模板`).
- [x] Make Preview explicit-on-demand: visible `效果预览` control in the editor bar, Preview hidden by default, overlay drawer on open, zero page overflow.
- [x] Extract current-page review status/actions from editor content into a standalone Page Review Status Bar; keep 3-step progress continuously visible on desktop and compact progress visible in mobile editor chrome.
- [ ] User visual/operator acceptance of the new hierarchy on the hosted read-only SEO Admin demo; collect screenshots/feedback.
- [ ] Restore a writable `admin-content` Preview only through a safe server-side credential binding/transfer. Do not expose or manually shuttle `ADMIN_REPO_*` / `ADMIN_GITHUB_*` secrets; current independent project lacks those write credentials.

## Parked — dedicated branch reconciliation (not current user scope)
The isolated reconciliation candidate exists on Draft PR #144. Do not continue/merge it while the user is asking to work on SEO Admin.

## Next — dedicated branch reconciliation (no merge yet)
- [ ] Re-read live `main` / feature refs and run an isolated merge-tree/reconciliation audit against the current accepted feature baseline.
- [ ] Classify overlap/conflicts by authority and preserve all completed Product/Care, Compatibility, Publish Center, Species SEO and Care SEO invariants.
- [ ] Validate a reconciliation candidate before any explicit decision to merge `main`; do not change Production/index as part of reconciliation.

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

- [x] Replace Workspace Focus dual-mode behavior with one permanent compact workflow/status strip; remove `展开流程 / 专注编辑` and all interaction-driven workflow height changes.
- [x] Upgrade the compact strip into dedicated Progress Navigation: current stage / 4, four clickable stage buttons, complete/current/upcoming states, separate operator filter selection, current-action CTA, and a clear visual divider from the editor canvas.
- [x] Initial neutralization checkpoint used a blue accent; superseded by the current Graphite / White / one Green accent system.
- [x] Verify fixed-chrome reduction: 1440/1366 workspace gains 196px vertical space; 390 workspace gains 312px and mobile editor sticky bar drops from ~140px to 46px, with zero horizontal overflow.
