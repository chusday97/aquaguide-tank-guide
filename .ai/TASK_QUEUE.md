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

## 2026-09-08 — Species SEO Admin visual hierarchy acceptance
- [x] Establish UI Foundation tokens for readable Button / Typography / Input / spacing hierarchy.
- [x] Remove repeated warning paint from section edge, field edge and input border; keep task-level warning once.
- [x] Remove duplicate Current Page eyebrow and primary-section status chip.
- [x] Make Preview inspector selection Graphite instead of Green.
- [x] Merge Preview readiness + selected-element context into one compact row; preserve exact path as tooltip/contract.
- [x] PASS desktop/mobile 0-overflow acceptance, Admin contract/build, full root build and diff hygiene.
- [ ] Continue operator visual acceptance only for concrete bad cases; do not add another persistent hierarchy layer.
- [ ] Writable Preview credentials and branch reconciliation remain separate parked tasks.

## 2026-09-08 19:13 +08:00 — Preview toggle semantics cleanup
- Functional checkpoint: `c2f52dc619c262289686be37afd286c983ad2430` (`fix(admin): clarify preview pick edit mode`).
- `点击内容编辑` was an instructional sentence rendered as a button. It is now the actual mode label `点选编辑` / `Pick to edit`.
- The control now exposes `aria-pressed`, action-specific `aria-label`, and guidance in `title`; instruction is help text, not button copy.
- Browser acceptance: 1440×900 + 390×844; toggle true→false→true, zero horizontal overflow; Preview clicks do not select editor fields while off and do select when on.
- Visible-button audit found no other same-class instruction-as-button badcase on the current CMS screen.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Correct local CMS Preview remains `http://127.0.0.1:3010/?demo=1`.

## 2026-09-08 19:26 +08:00 — CMS action hierarchy convergence
- Functional checkpoint: `dde46eef0b577b76fc89ed1c912dbde82a75613a` (`fix(admin): clarify action hierarchy`).
- Workflow queue CTA now tells the truth: `开始处理` → `查看待处理`; it only navigates/filters the queue and is styled as a neutral navigation action, not a Green primary mutation CTA. Edit fallback likewise reads `返回编辑区`.
- Interface language and Preview mode segmented controls expose explicit `aria-pressed`; active selection uses Graphite, not Green.
- Preview toggle is action-aware: closed=`效果预览`, open=`关闭预览`, with matching `aria-label`.
- `单独修改` is now a readable 12px underlined Text Action rather than a 21px Green micro-button; Preview add-supplement affordance is raised to 11px/30px.
- Current workflow stage, current review step and selected Species use Graphite. Browser color scan at 1440/390 leaves Green on the current screen only for the real primary `提交审核 →` action; zero horizontal overflow.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Correct local CMS Preview: `http://127.0.0.1:3010/?demo=1`.

## 2026-09-08 19:31 +08:00 — Page Review hierarchy dedupe
- Functional checkpoint: `2182bb106a9e76a051cc5fb18ed5dbd1e77315dd` (`fix(admin): dedupe review status hierarchy`).
- Page Review meta no longer repeats the active review stage. Left meta now carries only distinct information: scope + health + publish status (`当前页面审核 / 需修复 / 草稿`); the 1→2→3 stepper remains the single source for `编辑中 / 待审核 / 已批准预览`.
- 1440×900 and 390×844 browser acceptance keep zero horizontal overflow.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. No Production/main/live DB/index changes.

## 2026-09-08 19:40 +08:00 — CMS workflow hierarchy simplification
- Functional checkpoint: `58f6af61af891b16387f03845ed527fedf6f34ea` (`fix(admin): simplify workflow hierarchy`).
- Removed the duplicate global `workflow-current-action` layer; the four Publish Flow stages are now the single queue navigation authority. Current priority stage derives directly from real Data Review / editorial review / Preview-ready counts.
- `发布流程` is now only a section label; the redundant `1/4` indicator is removed. Zero-value global stage badges are suppressed while non-zero actionable counts remain.
- Mobile global workflow height reduced from 88px before convergence / 43px after this round; editor begins at y=368 instead of the earlier y=413 baseline. Desktop/mobile remain zero-overflow.
- Sidebar quick filters with zero work (`待审核 0`, `预览 0`) are real Disabled controls; actionable `数据问题 33` remains interactive.
- Page Review severity now treats ordinary incomplete/blocked authoring as Warning (`待处理`), matching `2 项待填写`; Error (`需修复`) is reserved for hygiene/indexing-policy invalidity.
- PASS: Admin Content contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Correct local CMS Preview: `http://127.0.0.1:3010/?demo=1`.
- Fresh remote read before docs sync: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature `83d7e982dfaf15a8f0c77ae6ef525fa3f0162871`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence at functional checkpoint **275 main-only / 210 feature-only**.
## 2026-09-08 21:09 +08:00 — Species navigation hierarchy convergence
- Functional checkpoint: `71b2e7a8c188688d8f7c3d81a688c2e643750fbe` (`fix(admin): prioritize mobile species selection`).
- Mobile Species navigation now defaults to a 58px current-selection row (`当前选择 / 更换物种`) instead of spending the first 180px on search/filter chrome. Editor begins at y=200 versus y=368 before this round.
- `更换物种` expands an inline selector to 520px max with a 299px scrollable Species list; selecting a Species automatically collapses back to 58px and updates the current selection. No new persistent hierarchy layer was added.
- Empty sidebar workflow queues are not rendered. Current demo shows only actionable `基础种 276` and `数据问题 33`; review/Preview shortcuts appear only when count > 0.
- Sidebar hierarchy is explicit: scientific-name group labels are 12px/600 muted structure; Species rows remain 13px, and only the selected Species rises to 700. Duplicate variant metadata such as `迷你鹦鹉鱼 / 迷你鹦鹉鱼` now falls back to `使用模板`.
- Removed superseded Foundation rules for 220px/180px mobile sidebar and disabled empty-queue styling instead of stacking more overrides.
- Browser acceptance: desktop 1440×900 and mobile 390×844 both zero-overflow/no page errors; mobile closed=58px, expanded list=299px, selection auto-collapse PASS.
- PASS: Admin Content contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Correct local CMS Preview: `http://127.0.0.1:3010/?demo=1`.
- Fresh remote read before docs sync: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature `543cc4c556890846737e4c5e3a522f4025f94a28`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence at functional checkpoint **275 main-only / 212 feature-only**.
## 2026-09-08 21:14 +08:00 — Dirty-state Species navigation safety
- Functional checkpoint: `d0f03ff2abfc3d37abafa6308ca96c071f38235e` (`fix(admin): preserve dirty species navigation`).
- Mobile Species selector auto-collapse now depends on the real `runEditorNavigation()` result. If the operator cancels the unsaved-change confirmation, the selector stays open, the current Species remains unchanged, and dirty edits remain protected.
- `onSelect` / `onSelectBase` now return the navigation result instead of swallowing it; Sidebar closes only when that result is not `false`.
- Contract guards protect this return-value chain so future UI simplification cannot bypass the existing dirty-state boundary.
- PASS: Admin Content contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Fresh remote read before docs sync: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature `ccf2feac122f288fd0de17665bb9ac3b034032ce`, divergence at functional checkpoint **275 main-only / 214 feature-only**.

## 2026-09-08 22:01 +08:00 — Secondary editor hierarchy acceptance
- [x] Merge Search Appearance + Advanced SEO into one stateful `更多 SEO 设置` disclosure.
- [x] Auto-open secondary SEO for real blockers and Preview Meta/H1 targets while preserving manual open state across rerenders.
- [x] Move inherited Base intro reference into the current page helper as `查看模板内容`; remove standalone template-content row.
- [x] Flatten `辅助工具`, localize readiness enum labels, and hide zero-count bulk editorial review entry.
- [x] PASS desktop/mobile zero-overflow acceptance, Admin contract/build, full root build and diff hygiene.
- [ ] Continue operator visual acceptance only for concrete bad cases; no new persistent hierarchy layer.
- [ ] Writable Preview credentials and branch reconciliation remain separate parked tasks.

## 2026-09-08 22:50 +08:00 — Workflow next-action / human-decision convergence
- Functional checkpoint: `818b049a0df75b72ab72621e459d5161deeb70b9` (`fix(admin): clarify workflow next actions`).
- Global 1→4 Publish Flow is now a **next-action navigator**, not a numbered decoration. It shows `当前下一步`, the real queue reason/count, and stage-specific click guidance; detached numeric badges are removed.
- Current demo: `复核 33 个数据问题`; Data Review says `33 项需人工确认 · 继续复核 →`; Content Editing says `458 页待完成 · 查看队列 →`; later stages explain their entry condition when empty.
- New visual semantic rule: **Amber = explicit human judgment / second confirmation only**. Data Review queue/filter, group `处理数据`, selected decision choice and final `确认并保存` share Amber. Graphite remains navigation/selection; Green remains publish advancement/success.
- Preview inspector is now optional `定位字段 / Locate field`, defaults OFF, and changes to `退出定位` only while active. OFF clicks do not move editor selection; ON clicks locate the mapped editor field.
- Browser acceptance: desktop workflow ~72px, mobile ~94px with only the current-stage helper expanded; 1440×900 and 390×844 horizontal overflow = 0. Data Review → group action → decision → confirm chain uses one Amber grammar.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build and `git diff --check`. No Production/main/live-DB/index/Care release change.
- Fresh refs at functional checkpoint: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`; remote feature before push `3894442d3a2a6917e22123ce9542e7392055f543`; merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`; divergence **275 main-only / 218 feature-only**.
- Correct local CMS Preview remains `http://127.0.0.1:3010/?demo=1`.

## 2026-09-08 — Data Review operator acceptance
- [x] Put evidence before the human decision.
- [x] Show category-conflict facts, uncertainty boundary and concise category comparison.
- [x] Make conclusion choices radio selections; keep one final confirmation action.
- [x] Preview the exact result before confirmation, including SEO blocking / Canonical consequences.
- [x] Reduce duplicate candidate Preview/keep controls to text action + radio selection.
- [x] PASS 1440/390 browser acceptance, Admin contract/repo gates, root build and diff hygiene.
- [ ] Continue only with newly observed operator badcases.
