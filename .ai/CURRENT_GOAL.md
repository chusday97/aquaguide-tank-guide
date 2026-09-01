# Current Goal

> **READ FIRST (2026-09-02): `.ai/HANDOFF_LATEST.md` is the canonical current-state handoff. Older sections below are historical unless the latest handoff explicitly retains them.**


Updated: 2026-09-02
Branch: `feature/admin-content-v0`

Operate AquaGuide Species SEO Admin as a low-maintenance dual-repository GitHub-backed editorial publishing system. Preserve the existing review/readiness/static-generation contracts while removing Supabase as a runtime or staging dependency for Species SEO.

## Current milestone

`GitHub Repo Draft Store → review/readiness → explicit Staging Snapshot → AquaGuide static Species HTML`

The persistent product model is now:
- Left: choose Category → Base Species → Variant and workflow queue.
- Center: edit Base shared content or the current Variant/locale.
- Right: live AquaGuide frontend preview; center edits update it immediately.

## Verified baseline
- Current runtime authority is GitHub Repo-backed content, not Supabase. The main CI gate validates Repo content/API behavior without starting Supabase. Legacy Supabase migrations/tests remain compatibility evidence only.
- Three-pane workspace + global UI language is committed as `539baf4`; GitHub Actions run `33323234484` passed contract, migration 001–007 ephemeral Supabase gate, build, catalog parity and diff hygiene.
- Queue-level Workflow Overview remains verified: 33 pending review issues → 32 affected Base groups → clear restores 276 groups.
- Controlled Preview Publish remains Approved-Draft-only, forced noindex, and separate from Production Published.
- `aqua-fronted-cms` is an external visual/reference source only. Its mock state, fake preview URLs, delete logic and client-side readiness decisions are not business authority.

## Current UI convergence evidence
- Desktop 1600px layout measures 270px Species navigation / 870px editor / 460px live preview.
- Editing Variant H1 updates the right live page immediately without saving.
- Clicking a Base Species parent switches the center to Base shared-content authoring.
- Right preview supports Page / Google / Mobile and renders existing Product Truth as read-only facts.
- Live Preview loads image, temperature, pH, tank size, difficulty and description from the existing catalog projection on demand; Species Group JSON stays focused on hierarchy/review metadata.

## Safety boundary
- Production Supabase and public `main` remain untouched.
- Production Published remains locked.
- SEO Admin secrets stay server-side; browser code never receives GitHub tokens, Admin passwords or session secrets.
- AI Studio code is never merged wholesale; UI components must preserve revision, Data Review, Publish Readiness and generator logic.
- Product Truth remains read-only from the Content Admin.

## 2026-08-31 — UI integration + global interface language
- `aqua-fronted-cms` is a visual source only; AquaGuide Admin business logic remains authoritative in this branch.
- The workspace uses the stable three-pane model: Species navigation → content editing → live frontend preview.
- `appLocale` controls Admin interface language; `contentLocale` independently controls the editorial locale being edited and previewed.
- Product Truth for the right preview is lazy-loaded from the existing catalog projection instead of duplicated into Species Group data.

## 2026-08-31 — Next interaction milestone
- Top workflow states use semantic colors: Data Review = amber, Awaiting Review = blue, Preview-ready = green.
- P0 is a bidirectional Editor ↔ Preview Inspector. Editing/focusing a field must highlight and scroll to its frontend element; clicking an inspectable preview element must select it and locate the corresponding center editor field.
- The first mapped fields are localized name, H1, intro, image alt, SEO title and meta description.
- Product Truth elements such as temperature, pH, tank size, difficulty and scientific name may be inspectable but remain read-only in Content Admin.
- Inspector mapping must be explicit/stable; do not turn the frontend preview into arbitrary DOM editing.
## 2026-08-31 — Bidirectional Preview Inspector
- The next interaction model is now implemented for the first core set: center editor ↔ right live preview share one stable element selection.
- Core editable mappings: localized name, H1, intro, image alt, SEO title and meta description.
- Preview Product Truth facts remain inspectable but read-only; selecting temperature/pH/tank/difficulty never creates a fake edit path.
- Selection explains element name, source (Custom / Inherited from Base / Product Truth) and edit path (Current page / Base Species / Product Truth).
- Base-aware routing prevents misleading edits: inherited fields can stay in Base authoring, while Variant-only/custom fields route to Current page.
## 2026-08-31 — Calm inheritance editing
- Variant Meta Title / Meta Description / H1 no longer render as empty inputs when they inherit.
- Inherited state shows the effective Base value and source; an explicit Override action reveals the input.
- Custom state exposes `Use Base value`, which clears the Variant override and returns to resolver-based inheritance rather than copying Base text.

## 2026-08-31 — Secondary tool drawers
- Data Review, Publish Readiness, Translation, Batch SEO, Revision History and Workflow no longer expand inline below the editor.
- `EditorToolDrawer` overlays only CSS Grid column 2 (the editor); the live Preview remains fixed in column 3 and stays interactive.
- Drawer dismissal is explicit: close button, Escape or editor-cell backdrop. Clicking an editable Preview element also closes the drawer and returns to the mapped editor field; read-only Product Truth inspection may keep the drawer open.
- Species SEO lifecycle UI now exposes Draft / Published only; Published remains disabled. The legacy shared `content_status` enum is not modified for unrelated tables.

## 2026-08-31 — Generator-aligned live Preview
- Page Preview now mirrors the static Species generator structure: Header → Breadcrumb → Hero (image/H1/scientific name/intro) → four catalog facts → Product Truth note.
- Publication-facing labels and English tank-size localization live in `speciesPagePresentation.js`, shared by `LiveFrontendPreview` and `generate-public-species.mjs`.
- Admin-only fake sections (`Overview & Care` / `Care essentials`) were removed because the generator never emitted them.
- Three-column layout now stops below 1180px before the Preview can be clipped. Narrow layouts keep Preview through an explicit overlay trigger; editor selection opens it and Preview selection returns to the editor.

## 2026-08-31 — Calm primary editor
- The primary Variant authoring path now keeps only high-frequency SEO/content fields visible; keyword/index/canonical/URL settings are Advanced SEO.
- Lifecycle + editorial review is represented once as `Draft · Editing/编辑中`, not repeated as multiple pills.
- Base shared intro context is available on demand instead of occupying permanent vertical space in Variant authoring.
- Preview Inspector routing is authority-aware only when selection starts from Preview: inherited content opens Base, Variant-owned content opens Current page, Product Truth remains read-only. Editor-origin selection only highlights Preview and does not unexpectedly switch scope.

## 2026-08-31 — Primary editor density pass
- Primary Variant authoring now defaults to only SEO title/description/H1 plus Intro and Image Alt.
- Header status is one calm `Draft · review state` line instead of repeated catalog/SEO/inheritance pills.
- Focus Keyword, index strategy, canonical target and public route evidence live under a default-collapsed Advanced SEO disclosure; blockers may force it open.
- Variant Intro defaults to four rows and remains vertically resizable.
- 1440×900 Chromium evidence: default editor panel height reduced from ~1333px to ~936px while Inspector remains bidirectional.

## 2026-08-31 — Three-pane visual hierarchy convergence
- Navigation active state, editor Inspector selection and live Preview Inspector now share one selection token family.
- Product Truth Inspector selection uses a distinct read-only graphite tone so read-only facts cannot look editable.
- Active Variant navigation preserves lightweight parent Base context through the Base label + tree guide, while the Variant remains the only strong row selection.

## 2026-08-31 — Unsaved-change safety
- Variant and Base editors now expose explicit dirty state while live Preview continues to update before save.
- Dirty navigation is guarded across Species/Base scope/content locale/workflow/batch/sign-out; browser refresh/close uses `beforeunload`.
- Re-selecting the current Variant or active workflow filter is a no-op and must never clear dirty state.
- Save clears dirty state only after the local Supabase write succeeds; Production publishing remains locked.

## 2026-08-31 — Frontend SEO publication vertical slice
- Stable baseline: `2a737de` passed GitHub Admin Content CI Gate run `33370177087`; Product Truth, inheritance, review, generator and Preview contracts remain green.
- Product Truth lazy-loading correctness is closed. Root AquaGuide build integration is now implemented locally: an explicit non-production Published Snapshot can generate Species pages into the same `dist/` artifact after the web + SEO Admin builds; no snapshot safely skips publication.
- Stop expanding CMS surface area. The next milestone is the smallest real staging publication slice: Approved/Publish-ready content → explicit Published snapshot → root AquaGuide build → hosted staging Species URLs.
- Validate the generated HTML itself: title, meta description, H1, canonical, robots, hreflang, image alt, static body copy and sitemap membership. Production publish remains locked until that vertical slice is reviewed.
- SEO page purpose is acquisition into AquaGuide, not a detached blog: each Species page should eventually hand users into compatibility/recommendation/product flows with the selected `catalog_key`.

## 2026-09-01 — AquaGuide frontend SEO integration is now the primary goal
- Required read: `.ai/AQUA_SEO_ADMIN_INTEGRATION.md`.
- Success is no longer defined by Admin UI completion. Reviewed Species SEO must enter the real AquaGuide frontend build artifact and be verifiable from staging HTML source.
- Duplicate Admin authority is resolved at the UI/deployment boundary: `/admin/content` routes to an Admin Hub; legacy Product/Care editing moved to `/admin/product-content`; the three-pane Species SEO CMS is deployed under `/admin/seo/`.
- Product Truth loading correctness is closed locally. Before the staging vertical slice, resolve the duplicate Species Admin authority so AquaGuide has one SEO editing source of truth.

## 2026-09-01 — Hosted staging vertical slice
- `feature/admin-content-v0` Vercel Preview is the controlled hosted staging surface for the current milestone.
- Preview builds on this branch auto-consume only `apps/admin-content/fixtures/staging-publication-sample.json`; Production builds still require an explicit snapshot and otherwise skip Species generation.
- The staging fixture contains 3 real catalog keys × zh-CN/en = 6 static pages covering index, canonical-to-sibling and noindex strategies.
- Generated Species pages now include product-return CTAs into AquaGuide compatibility, browse/detail and aquarium planning using `species=<catalog_key>&source=seo-species`.
- Next acceptance: fetch the newly deployed Vercel Species HTML and sitemap, verify metadata/CTA source, then browser-check at least one CTA handoff.

## 2026-09-01 — SEO CTA runtime handoff
- Compatibility CTA semantics are now explicit: `mode=compatibility&species=<id>` preselects that Species as a planned compatibility candidate instead of merely opening the Atlas detail dialog.
- `scripts/verify-seo-species-handoff.mjs` starts an isolated Vite browser session and asserts `sp_0030` appears in the calculator with planned state and zero page errors.
- Hosted verification remains required after the next Vercel Preview deploy.

## 2026-09-01 — Hosted Supabase publication boundary v8
- Hosted publication export is now server-only: `STAGING_SUPABASE_SECRET_KEY` / legacy `service_role` is required; publishable/anon keys are refused.
- Migration 008 changes public Species SEO visibility to require both `status=published` and `review_state=approved` and removes anon/authenticated access to Data Review release resolutions.
- Release probe is now schema v8 and includes `server_export_ready`, covering explicit `service_role` Data API grants and RPC access boundaries.
- `npm run build:staging-from-db` is the direct future path from hosted staging Supabase → approved Published snapshot → AquaGuide root `dist/`.
- Fresh ephemeral Supabase 001–008 gate passes. The remaining blocker is infrastructure, not code: no dedicated AquaGuide hosted staging branch/project exists yet.
- Do not reuse the unrelated IceGlide staging project and do not provision a paid AquaGuide branch/project without explicit cost approval.

## 2026-09-01 — Approved Draft staging release
- Hosted staging no longer depends on Production `Published`. `staging_release` accepts only explicitly allowlisted Draft rows whose editorial review is Approved and has `reviewed_at`.
- `STAGING_CATALOG_KEYS` is mandatory, deduplicated and capped at 20 Species; canonical dependencies must be explicitly included when needed.
- Production-style `release` remains Published-only and ignores Approved Drafts.
- Staging snapshots omit reviewer identity. Hosted acceptance must verify deployment-level `X-Robots-Tag: noindex`; page source keeps intended robots/canonical values for SEO inspection.

## 2026-09-01 — Authoritative no-Supabase runtime
- Species SEO runtime authority is now `GitHub Repo-backed content`, not Supabase.
- Normal Save writes versioned editorial JSON to dedicated branch `seo-admin-drafts`; `vercel.json` disables deployments for that branch, so editing does not trigger a deployment.
- Admin authentication is a server-side HttpOnly/SameSite session. `ADMIN_GITHUB_TOKEN`, Admin password/hash and session secret are server-only and never enter the Vite bundle.
- Repo writes force `Draft`; any content/indexing edit invalidates approval back to `Editing`; rollback creates a new Draft/Editing revision.
- Explicit `Publish current Species to Staging` creates a sanitized `content/species-seo/staging-snapshot.json` on the non-production staging code branch. Only this explicit action triggers one Vercel Preview rebuild.
- Root Preview build prefers that Repo staging snapshot when present, then generates static EN/ZH Species HTML + sitemap with `staging_release`. Production-style `release` remains Published-only and ignores Repo Drafts.
- Local Repo backend/API gates pass with `supabase_started=false`; root build and SEO→compatibility handoff also pass.
- Legacy Supabase migrations/exporter/tests are retained only as compatibility/history. Do not provision AquaGuide Supabase staging for Species SEO unless this architecture is explicitly reversed.

## 2026-09-01 — Authoritative dual-repository boundary
- **Private editorial authority:** `chusday97/aquaguide-seo-content` (PRIVATE), branch `seo-admin-drafts`, path `content/species-seo/admin-store.json`. Drafts, review state, revision snapshots and Data Review notes live only here.
- **Public staging delivery:** `chusday97/aquaguide-tank-guide`, branch `feature/admin-content-v0`, receives only the explicit sanitized `content/species-seo/staging-snapshot.json`.
- The earlier single-repository idea is superseded. Missing `ADMIN_GITHUB_CONTENT_REPO` now fails closed; Draft writes must never fall back to the public AquaGuide repository.
- The public AquaGuide repo no longer contains `admin-store.json` and its former public `seo-admin-drafts` branch has been removed.
- The private content repo has `main` and `seo-admin-drafts` seeded with an empty content store. It is not linked to AquaGuide Vercel, so normal Save cannot trigger AquaGuide CI/deployment.
- Primary automated gate `test:dual-repo-routing` proves Draft PUT → private content repo and Staging PUT → public AquaGuide repo.


## 2026-09-02 — Latest continuation pointer
- **Canonical cross-session handoff is now `.ai/HANDOFF_LATEST.md`. Read it first before changing Species SEO Admin.**
- Latest code HEAD at sync: `fae815f`; GitHub Admin Content CI #43 (`33532055685`) SUCCESS; Vercel Preview `dpl_EeFvNvuqySA6RVpHYsvjPCuCG8Jw` READY.
- Real hosted human path is proven through Chinese approval for `sp_0001`; zh-CN is Approved/version 6/index. English `sp_0001` remains Editing and still contains acceptance copy, so do not Staging Publish it yet.
- Data Review now reports 32 pending issues after the 极火虾 duplicate decision. `Pelvicachromis pulcher` (`sp_0214 / sp_0338`) remains an unresolved duplicate example.
- Duplicate labels are now actionable: `处理重复` opens the current group's review drawer with two decision buttons and a final `确认并保存`; no review-decision dropdown.
- Status and actions are permanently separated; review actions update only review state. Inheritance UI is centralized under `内容来源 / 管理基础模板`, not repeated `公共内容` explanations.
