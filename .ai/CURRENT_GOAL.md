# Current Goal

Updated: 2026-08-31
Branch: `feature/admin-content-v0`

Converge AquaGuide Species SEO Admin from an engineering-oriented panel into a stable editorial workspace while preserving the proven database, review and publishing safety contracts.

## Current milestone

`stable three-pane editorial workspace → semantic workflow states → bidirectional editor/preview Inspector`

The persistent product model is now:
- Left: choose Category → Base Species → Variant and workflow queue.
- Center: edit Base shared content or the current Variant/locale.
- Right: live AquaGuide frontend preview; center edits update it immediately.

## Verified baseline
- A+B remains the stability model: Mac local Supabase for fast iteration plus pinned GitHub Actions ephemeral Supabase for clean-machine gating.
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
- AI Studio code is never merged wholesale; UI components must reconnect to existing RLS, revision, Data Review, Publish Readiness and generator logic.
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
- Current local-only work: harden Product Truth lazy loading so loading state never renders fake `—` facts and stale facts from a previous Species cannot flash on a newly selected Species. This work is not yet committed.
- After that correctness pass, stop expanding CMS surface area. Build the smallest staging publication slice: Approved/Publish-ready content → explicit Published snapshot → static Species generator → staging frontend artifact.
- Validate the generated HTML itself: title, meta description, H1, canonical, robots, hreflang, image alt, static body copy and sitemap membership. Production publish remains locked until that vertical slice is reviewed.
- SEO page purpose is acquisition into AquaGuide, not a detached blog: each Species page should eventually hand users into compatibility/recommendation/product flows with the selected `catalog_key`.

## 2026-09-01 — AquaGuide frontend SEO integration is now the primary goal
- Required read: `.ai/AQUA_SEO_ADMIN_INTEGRATION.md`.
- Success is no longer defined by Admin UI completion. Reviewed Species SEO must enter the real AquaGuide frontend build artifact and be verifiable from staging HTML source.
- Resolve the duplicate-admin authority (`src/pages/AdminContent.tsx` vs `apps/admin-content`) before Production integration.
- Product Truth loading correctness is closed locally. Before the staging vertical slice, resolve the duplicate Species Admin authority so AquaGuide has one SEO editing source of truth.

