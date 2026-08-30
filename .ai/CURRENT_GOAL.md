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
