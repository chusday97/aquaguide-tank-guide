# AquaGuide ↔ Species SEO Admin Integration Contract

## Purpose
The Species SEO Admin is only complete when reviewed SEO content is delivered into the real AquaGuide frontend build and can be verified from the final HTML source.

This file is a required cross-session handoff for any AquaGuide frontend, Admin, publishing, SEO, or deployment work.

## Current architecture finding
- AquaGuide frontend and `apps/admin-content` live in the same monorepo.
- The root AquaGuide build currently runs Vite only; Species SEO generator output is not yet merged into the deployed root `dist/`.
- The root SPA already exposes `/admin/content`, but that route currently loads legacy `src/pages/AdminContent.tsx`.
- The new three-pane Species SEO CMS lives in `apps/admin-content`.
- Two competing Species admin authorities must not survive the integration.

## Authority boundary
- `apps/admin-content` is the target single authority for Species Editorial SEO.
- Editorial SEO includes SEO Title, Meta Description, H1, Intro, Image Alt, localized English name, index strategy and canonical policy.
- AquaGuide catalog / `fishData.ts` remains Product Truth authority for scientific name, image asset, temperature, pH, tank size, difficulty, compatibility and recommendation logic.
- Content Admin must never silently mutate Product Truth.
## Required publication chain
AquaGuide Product Truth + approved Editorial SEO must converge through one deterministic build path:

`Admin → Save → Review → Published Snapshot → AquaGuide build → Species generator → root dist → staging/production`

The root deployment artifact must contain the generated SEO pages, not a separate orphaned Admin output directory.

Expected output includes:
- `/species/<scientific-slug>/<catalog-key>.html`
- `/zh/species/<scientific-slug>/<catalog-key>.html`
- `/sitemap-species.xml`
- final `<title>`, meta description, H1, canonical, hreflang and robots in static HTML.

## Product return path
Species SEO pages are acquisition surfaces, not isolated articles.
They must link back into existing AquaGuide product routes with the selected Species ID and an SEO source marker, including:
- compatibility: `/encyclopedia?mode=compatibility&species=<id>&source=seo-species`
- species browse/detail context: `/encyclopedia?mode=browse&species=<id>&source=seo-species`
- aquarium planning: `/aquarium?action=plan-species&species=<id>&source=seo-species`

Do not invent a parallel conversion flow if an existing AquaGuide route already owns the action.
## Delivery sequence
1. Product Truth Preview loading correctness is complete: loading/failure/missing are distinct, facts are key-scoped, and transient fetch failure is retryable.
2. Unify `/admin/content` and `apps/admin-content` so there is one clear Species SEO authority.
3. Integrate Species generation into the real AquaGuide build artifact.
4. Publish only 3–5 representative Species to staging first.
5. Verify final HTML source, reciprocal hreflang, canonical, robots and sitemap from real staging URLs.
6. Verify at least one SEO page can enter AquaGuide compatibility or aquarium planning with the correct Species ID.
7. Only after the vertical slice passes may Production publishing be considered.

## Staging acceptance test
A staging vertical slice is PASS only when an editor can change a Species H1 in the SEO Admin, save/review/publish it, rebuild AquaGuide, open the real staging Species URL, and see that exact H1 in the returned static HTML source.

The same page must also have correct Title, Meta Description, canonical, robots, hreflang and sitemap membership according to its index strategy.

## Safety constraints
- Do not bulk-open all 486 catalog records for indexing before the vertical slice passes.
- Controlled Preview remains Draft/Approved + forced `noindex,nofollow`; it is not Production publication.
- Production Supabase, Production Published actions and `main` remain untouched until explicitly approved.
- Do not treat Admin UI completion as SEO integration completion.

## Required startup instruction
Any future AquaGuide session working on frontend, SEO, Admin, publishing or deployment must read this file and `HANDOFF.md` before planning or modifying the integration.