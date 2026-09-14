# Aqua UI Redesign Status

## Branch
- Worktree: `/Users/chuchu/aquaguide-ui-redesign`
- Branch: `ui/redesign-20260914`
- Current baseline includes latest local `main` through `7f9cb51d`.
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
