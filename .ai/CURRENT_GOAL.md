# Current Goal

Updated: 2026-08-30
Branch: `feature/admin-content-v0`

Converge AquaGuide Species SEO Admin from an engineering-oriented panel into a stable editorial workspace while preserving the proven database, review and publishing safety contracts.

## Current milestone

`AI Studio visual source → extract layout/interaction only → reconnect real AquaGuide Admin logic → B local gate → A GitHub gate`

The persistent product model is now:
- Left: choose Category → Base Species → Variant and workflow queue.
- Center: edit Base shared content or the current Variant/locale.
- Right: live AquaGuide frontend preview; center edits update it immediately.

## Verified baseline
- A+B remains the stability model: Mac local Supabase for fast iteration plus pinned GitHub Actions ephemeral Supabase for clean-machine gating.
- Queue-level Workflow Overview is committed as `374db2f` and real Chrome verifies 33 pending review issues → 32 affected Base groups → clear restores 276 groups.
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
