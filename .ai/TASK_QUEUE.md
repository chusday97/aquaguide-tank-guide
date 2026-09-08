# Task Queue

Updated: 2026-09-08
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

## Previous override — Species SEO Admin usability / acceptance
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
- [x] Move current-page review status/actions into a top-level Page Review Status Bar directly below Publish Progress; remove the duplicate mobile editor-toolbar review indicator.
- [x] Correct task-first field prompt alignment: page-specific questions are left-aligned directly above guidance/input at 1440/390; legacy global label styling cannot push prompts to the far right. Exact-SHA hosted acceptance preserves Preview split/overlay, review placement and zero overflow.
- [x] Collapse persistent operator chrome after overall-UI feedback: remove the standalone Demo banner, turn the four workflow cards into one linear Progress Navigation, keep Page Review neutral with a slim semantic edge, remove the duplicate editor locale switch/catalog summary, and put sidebar search first. Exact-SHA 1440/390 acceptance preserves Preview/review behavior and zero overflow.
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
- [x] Make `效果预览` a simultaneous resizable editor/Preview split on desktop, with narrow-screen overlay fallback and no inspector-driven auto-close.
- [x] Unify interface + content locale switching; remove visible mixed Draft/Preview/Species/Base/Staging state copy from Chinese core chrome and Chinese leakage from English core chrome.

## 2026-09-06 Admin UX state-system closure
- [x] Remove sticky Current Page Review overlap with the editor; keep review as a separate in-flow control surface.
- [x] Add red/yellow/green semantic health to review, editor sections, fields, readiness and blocker surfaces.
- [x] Add explicit Default / Hover / Active / Selected / Loading / Disabled / Success / Error / Empty component-state contracts.
- [x] Keep Preview split-view compatible and mobile overflow-free.
- [x] Lock the new behavior in `verify-contract.mjs` and pass full Admin/root build regression.

## 2026-09-06 top review placement
- [x] Portal Variant/Base review progress and actions into the top control stack above the Workspace.
- [x] Keep review progress synchronized when switching Current Species Page ↔ Base Template.
- [x] Preserve split Preview, semantic red/yellow/green states, and 0-overflow mobile/desktop layout.

## 2026-09-06 Data Review action hierarchy
- [x] Widen the single Data Review workspace instead of squeezing comparison evidence into the default narrow drawer.
- [x] Put conclusion choices + one primary `确认并保存` action before evidence content.
- [x] Keep the decision command sticky on desktop while long evidence scrolls; keep mobile non-overlapping.
- [x] Demote evidence to a labeled read-only section and notes to an optional collapsed disclosure.
- [x] Add contract coverage for action-first ordering / wide drawer / primary action visibility.

## 2026-09-06 — clean editor canvas rule
- Content editing is a neutral writing surface, not a status dashboard. Variant/Base editor backgrounds stay white/transparent.
- Success may appear only as a small green status dot/label at section level; healthy fields must not receive green fills or green card backgrounds.
- Warning/Error remain visible through a slim semantic edge, input border and compact status label; they must not tint the whole section or field.
- Removed the permanent red/yellow/green legend above forms. Health is shown contextually where it matters.
- Editor typography is deliberate and stable: page 24px, content heading 18px, section 15px, field/input 12–13px, helper/meta 10–11px. Legacy 9/9.5/10.5px editor copy is retired.

## 2026-09-06 — task-first content editor
- User screenshot showed the current-page editor still behaved like a field catalog: duplicated page identity, generic SEO headings, a separate Content Source card, inherited Meta/H1 rows presented like required inputs, and repeated read-only copy.
- Accepted editor hierarchy is now **one current-page identity → actual page-specific tasks → inherited search appearance (collapsed) → advanced SEO (collapsed)**.
- Current-page scope explanation card is removed; the toolbar already carries Current Page/Base scope. Base keeps only a compact impact notice because edits can affect multiple pages.
- Page-specific fields use task questions and guidance instead of CMS jargon. Inherited Meta title/description/H1 are grouped under `搜索展示`, default-collapsed when healthy, with Base Template / This Page source and `单独修改 / 改用模板` preserved inside the disclosure.
- The separate `内容来源` manager, duplicate `页面内容与 SEO 字段`, `SPECIES SEO · locale`, redundant workspace label, and editor-level read-only notice are retired.
- Contract protects task-first ordering and forbids those regressions. Production/main/live DB remain untouched.
## 2026-09-06 — Preview-linked editor alignment
- User reported that current-page fields and Preview were structurally misaligned, so visible page content could not be edited directly.
- Preview/editor ownership is now explicit: `sharedIntro` belongs to Base, `variantIntro` belongs to Current Page, and both map to their own editor target instead of sharing one ambiguous `intro` element.
- Preview H1 / Meta selection no longer forces inherited content into Base. From Current Page it opens the collapsed Search Appearance section, highlights the exact field, and exposes `Base template / Edit this page`.
- Preview intro is split into separate inspectable Base and current-page regions; inspect mode exposes an `Add page-specific content` target when the current-page addition is empty.
- Switching Current Page ↔ Base no longer resets Preview. Preview always composes the latest Base layer and current-page layer into one final-page snapshot.
- Runtime proof: H1 override updates Preview immediately; current-page intro updates only the current-page Preview region; Base intro updates only the Base region; both remain visible across scope switches; Preview clicks route back to the correct owner editor.
- Contract, repo backend/API/dual-repo gates, full root build and `git diff --check` pass locally. Production/main/live DB remain untouched.
## 2026-09-06 — explicit submit-review handoff
- User reported that the editor did not make the path to the next review stage obvious. Root cause: after any edit, the top review CTA was replaced by a generic Save action, so `Submit for review` disappeared exactly when the operator needed it.
- Editing state now always keeps review progression visible. Clean state shows `提交审核 →`; dirty state shows secondary `仅保存草稿` plus primary `保存并提交审核 →`.
- Dirty save-and-submit persists the content/template changes and `ready_for_review` in one write; clean submit keeps the existing metadata-only review transition. Current Page and Base Template share the same rule.
- Desktop top review bar stays compact at ~61px: `下一步：进入待审核 · 2/3` sits inline with the 148px primary CTA. Mobile stays 60px with a 112px `提交审核 →` CTA and zero horizontal overflow.
- Contract now protects visible submit-review continuity and the atomic dirty save-and-submit path. Admin contract, repo backend/API/dual-repo gates and full root build pass locally. Production/main/live DB remain untouched.

## 2026-09-06 17:52 +08:00 — exact branch / progress sync
- Working branch: `feature/admin-content-v0` at `03919cb65d0a0d1f85860e83e5176dbfa8d075f4` before this docs-only checkpoint. Remote feature matches that SHA; worktree was clean before documentation sync.
- Live `main`: `64fa58a16a723b74621ac1db513adb1efb47e282`. Merge base: `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Exact divergence from live main: **269 main-only / 184 feature-only commits**. This is a two-way divergence, not a simple feature-ahead-of-main relationship.
- A read-only `git merge-tree` probe reports real conflicts across `.ai` state docs, `.gitignore`, `HANDOFF.md`, `PROGRESS.md`, `package.json`, `src/App.tsx`, compatibility files, `src/pages/CareEncyclopedia.tsx`, etc. Therefore do **not** blind merge/rebase this feature into main.
- Draft reconciliation PR #144 (`codex/reconcile-admin-content-v0-main-20260905` → `main`) remains OPEN / Draft / UNSTABLE and stays PARKED while Species SEO Admin operator acceptance continues.
- Latest functional SEO Admin checkpoint: `03919cb6 fix(admin): keep review handoff visible`. Review progression is now continuous: clean Editing shows `提交审核 →`; dirty Editing shows `仅保存草稿` + primary `保存并提交审核 →`; desktop also shows `下一步：进入待审核 · 2/3`. Current Page and Base share the same rule.
- Previous accepted checkpoints immediately beneath it: `798596af` Preview↔Editor 1:1 ownership/alignment; `2e741fac` task-first editor; `dbf29f35` clean neutral editor canvas; `2d0aa1a8` Data Review action-first workspace.
- Latest GitHub Admin Content CI run `34026353946`: `validate` PASS; heavy browser/SEO handoff gate correctly SKIPPED by low-cost policy. Cloudflare exact-SHA deployment for the functional checkpoint is successful; verified Preview: `https://7ff827d1.aquaguide-frontend.pages.dev/admin/seo/?demo=1`. Stable branch Preview remains `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1`.
- Production, live DB, `main`, Care SEO `hold_noindex`, and public indexing remain untouched.
- Active next work is still **Species SEO Admin operator acceptance / usability convergence**. Do not resume PR #144 reconciliation until the user explicitly returns to branch convergence.

## Active override — SEO Operations Health Layer V2 / acceptance
- [x] Evaluate Species Meta Title / Meta Description / H1 from effective Variant + Base inheritance, not raw Variant fields.
- [x] Add Species bilingual completeness and Canonical-to-sibling validation using real same-locale targets.
- [x] Add authenticated batch Care health read using immutable `content_publications` plus per-resource legacy fallback and latest Care SEO Editorial rows; no N+1 page requests.
- [x] Preserve Published Care truth while an editable source row returns to Draft.
- [x] Distinguish Care unpublished source, legacy-not-snapshot authority, source drift, missing bilingual pair, missing Meta/H1 and incomplete review.
- [x] Keep `/admin/seo-pages` read-only and route issues back to existing Species/Care authority editors.
- [x] Add truthful all-page health counts, clickable health filters and row-level issue labels.
- [x] PASS focused contracts, root/API TypeScript, diff hygiene and full root build.
- [x] Browser/operator acceptance: desktop/mobile health counts, priority/unknown filter toggles, operator issue copy, search/progressive inventory behavior, and authority deep-link contracts.
- [ ] User/hosted read-only visual acceptance of the completed Health queue; local Preview is `http://127.0.0.1:3003/admin/seo-pages`.
- [ ] Writable `admin-content` Preview remains a separate security task and must use safe server-side credential binding; do not expose or manually shuttle Repo Admin/GitHub secrets.
- [ ] Branch reconciliation remains parked until explicitly requested.

## Active override — 2026-09-08 18:20 +08:00 — Species SEO CMS UI Foundation
- [x] Add a dedicated late-loaded UI Foundation instead of continuing ad-hoc edits inside the 3389-line legacy stylesheet.
- [x] Normalize primary/secondary/ghost/compact control sizes and typography.
- [x] Normalize workflow, review handoff, locale, scope and Preview controls.
- [x] Reduce editor width/padding/textarea/disclosure density while increasing task-question readability.
- [x] Fix mobile workflow overflow and replace tiny review step labels with progressive disclosure.
- [x] Normalize secondary tool launchers, Bulk upload and Data Review confirm action.
- [x] Add contract guards for UI Foundation loading and critical tokens.
- [x] PASS Admin contract + Admin/root builds + diff hygiene + 1440/390 Preview acceptance.
- [ ] User/operator visual acceptance; repair only observed badcases before any legacy CSS cleanup.
