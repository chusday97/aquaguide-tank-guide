# AquaGuide — Latest Handoff

**Updated:** 2026-08-24
**Repository:** `chusday97/aquaguide-tank-guide`
**RC1 runtime baseline:** `integration/aquaguide-rc1` runtime head `cf63e7f82da0d26cbb94acb4680a20ee848c8ab8`
**Active branch:** `agent/mobile-encyclopedia-context-sync-v1` — docs-only #124 landing sync
**Phase:** `post-P0 UI/UX refinement / mobile Encyclopedia search landed`
**Release boundary:** no RC1→`main` merge and no production deployment without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State, and Water Change maintenance are separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload, and maintenance lateness cannot directly manufacture current danger.

## Repository Acceptance

- P0 decision-layer stack #113→#120 is landed in RC1.
- Interactive Atlas refreshed re-entry #122 is landed; old #112 is closed superseded and was never merged.
- Mobile Encyclopedia search hierarchy repair #124 is landed in RC1.
- Current runtime head `cf63e7f` passed **15/15** exact-head GitHub checks.
- P0 gates PASS: Compatibility `32656473719`, Tank State `32656473746`, Tank Evidence `32656473727`, Existing Tank `32656474634`, Water Change `32656473724`, Whole-Tank `32656473735`.
- Release/UI matrix PASS: RC1 Release `32656473713`, Product Golden `32656473751`, UI Interaction `32656473716`, UI UX System `32656473765`, UI UX Visual QA `32656473797`, UI UX Golden V3 `32656473758`, UI V2 Aquarium `32656473810`, Navigation `32656473748`, Bundle Audit `32656473715`.

## UI/UX Status

- `AQ-BC-ATLAS-001` remains regression-verified: Atlas random 3D co-display is visual-only, species tank-size/water-change values are references, Compatibility is explicit secondary intent, and the mobile detail close control is viewport-safe.
- `AQ-BC-ATLAS-002` is regression-verified via #124: on mobile, species Search is now a first-class top-toolbar action; it scrolls to and focuses the existing canonical SearchAutocomplete instead of creating duplicate search state.
- Wishlist remains reachable through persistent Collection / 水族册 navigation and no longer competes with the core “find a species” action in the mobile Atlas toolbar.
- Desktop Interactive Atlas presentation remains unchanged.
- Care and Search first-fold visual baselines are currently comparatively clear; no broad redesign is justified without new browser evidence.

## Known Bounded Gaps

- Reviewed species-specific equipment requirements and hard physical-space constraints remain incomplete; missing evidence stays explicit `unknown`.
- Legacy `healthScore / tankHealthStatus / riskReminders` dead code is non-authoritative and can be removed later.
- Production acceptance remains separate from repository acceptance: live-provider usefulness, production env/secrets, deployed smoke, and production golden paths are still required before release.
- Parallel `agent/p0-water-change-engine-v1` remains historical/unreviewed; its AQ-WATER-005/006 additions are not accepted Product Truth.

## Next Execution Order

1. Audit Aquarium first-fold competition on current RC1, specifically return-context affordance + onboarding strip + Today Action for already-configured returning users.
2. Distinguish legitimate one-time onboarding from persistent task competition using real 390/1600 browser fixtures before changing layout.
3. Continue cross-route Encyclopedia/Care/Collection/Search/Identify IA review only where browser/visual evidence shows real friction.
4. Keep all UI work consuming the landed Planning Compatibility / Current Tank State / Water Change authorities; do not recreate page-level heuristics.
5. Do not merge RC1 to `main` and do not deploy production without separate explicit authorization.
