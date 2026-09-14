# Aqua UI Redesign Status

## Branch
- Worktree: `/Users/chuchu/aquaguide-ui-redesign`
- Branch: `ui/redesign-20260914`
- Current baseline includes latest `main` through `93549ddf`.
- Product/domain behavior remains frozen by `.ai/UI_REDESIGN_BOUNDARY.md`.

## Care interaction completed
- Replaced the old aquarium-hotspot Care explorer with an ecological-layer navigator.
- Layers: water surface, water body, livestock, plants/light, substrate, filtration.
- Selecting a layer opens a carousel of existing runtime Care topics.
- Carousel supports previous/next, position dots, and mobile swipe.
- `Open guide` reuses the existing `onOpenTopic()` path; no second Care decision engine was added.
- Guide images reuse `getCareVisualSources()` and current responsive Care assets.
- Runtime Chinese/English urgency values normalize to Priority / Review soon / Routine presentation.
## Validation on merged UI head
- `npm run lint` ✅
- `npm run test:care-guidance` ✅ (8 issue-specific contracts)
- `npm run test:care-categories` ✅
- `npm run test:care-first-screen` ✅
- `npm run test:care-card-action-ui` ✅
- `npm run test:care-guide-types` ✅
- `npm run test:golden-path-contract` ✅ (5 journeys, no partial coverage)
- `npm run test:local-file-admin` ✅
- `npm run build` ✅
- Desktop 1280/1440 and mobile 375 browser checks: no horizontal overflow.

## Known pre-existing test drift
- `test:mobile-care-ui` waits for a visible Aquarium `养护计划` label that is hidden on current main as well.
- `test:care-categories-ui` waits for visible `新鱼入缸` inside a collapsed/hidden browse category on current main as well.
- These failures reproduce on `main` and were not changed as part of the Care ecological-layer UI task.

## Next UI step
Use this Care interaction as a candidate pattern while continuing the broader Aqua UI system alignment. Do not merge this branch into `main` or deploy Production without a separate review decision.

## Aquarium interaction completed
- Promoted the selected B+A direction into the real Aquarium route: Today Action first, aquarium remains the dominant visual, management is secondary.
- Kept `Aquarium.tsx` domain behavior unchanged; V5 is implemented through `src/styles/aquarium-stage-layout-v5.css` plus regression-contract updates.
- Desktop ≥1200px uses aquarium + management side-by-side; 768-1199px and mobile stack vertically so the tank keeps useful width.
- The canonical Today Action handle is visually promoted without changing task truth or disclosure behavior.
- Completed water-change action keeps its semantic green emphasis; the earlier white-on-white regression is fixed.
- Removed the duplicate giant Today Action headline from inside the water scene.
- Rendered evidence checked at 1440, 1024 and 390 widths with no horizontal overflow.

## Aquarium validation on latest merged UI head
- `test:compatibility`, `test:compatibility-service`, `test:compatibility-presentation`, `test:compatibility-launch-cohort` ✅
- `test:compatibility-beginner-actions-ui` ✅
- `test:golden-path-contract` ✅
- GP-001 / GP-002 / GP-003 / GP-004 browser journeys ✅
- `test:mobile-aquarium-priorities` ✅
- `test:aquarium-stage-layout` ✅
- `test:task-actions-ui` ✅ twice against the active V5 preview after fixing the preview-env test contract
- `npm run lint` ✅
- `npm run build` ✅

## Current release boundary
- UI redesign remains Draft PR #150 only.
- Do not merge to `main`, deploy Production, or apply DB migrations without a separate review decision.

## Species Detail + Compatibility convergence
- Added `src/styles/species-compat-layout-v1.css` as a View Layer only convergence pass.
- Species Detail keeps the existing rail/sheet behavior but removes the multi-color patchwork feel: neutral hero, calmer feeding/environment surfaces, unified evidence cards, stronger verdict hierarchy.
- Compatibility expands from the old 640px decision drawer into a task workspace: ≥1200px uses tank/context on the left and selection/result on the right; 768–1199px and mobile stack safely.
- No `SpeciesDetailDialog.tsx`, Compatibility domain/service, stocking, or persistence behavior changed.
- Rendered evidence checked at 1440 desktop and 390 mobile; no horizontal overflow.
- `test:species-detail-ui`, `test:responsive-detail-surface`, `test:compatibility-beginner-actions-ui`, GP-002, `npm run lint`, and full `npm run build` all pass.
- Local preview remains `http://127.0.0.1:4333/` for Aquarium, Care, Species Detail and Compatibility review.
