# AquaGuide — Latest Handoff

**Updated:** 2026-08-24
**Repository:** `chusday97/aquaguide-tank-guide`
**RC1 runtime baseline:** `integration/aquaguide-rc1` runtime head `80985ca27d7b21df4bc0062e7765a1d5e9a96756`
**Active branch:** `agent/uiux-identify-header-context-sync-v1` — docs-only #126 landing sync
**Phase:** `post-P0 UI/UX refinement / mobile shell header scope repaired`
**Release boundary:** no RC1→`main` merge and no production deployment without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State, and Water Change maintenance are separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload, and maintenance lateness cannot directly manufacture current danger.

## Repository Acceptance

- P0 decision-layer stack #113→#120 is landed in RC1.
- Interactive Atlas #122, mobile Encyclopedia Search #124, and mobile shell-header scope repair #126 are landed in RC1.
- Old Atlas #112 is closed superseded and was never merged.
- Current runtime head `80985ca` passed **15/15** exact-head GitHub checks.
- P0 gates PASS: Compatibility `32695640422`, Tank State `32695640283`, Tank Evidence `32695640241`, Existing Tank `32695640353`, Water Change `32695640274`, Whole-Tank `32695640299`.
- Release/UI matrix PASS: RC1 Release `32695640335`, Product Golden `32695640359`, UI Interaction `32695640281`, UI UX System `32695640349`, UI UX Visual QA `32695640304`, UI UX Golden V3 `32695640360`, UI V2 Aquarium `32695640294`, Navigation `32695640362`, Bundle Audit `32695640329`.

## UI/UX Status

- `AQ-BC-ATLAS-001` and `AQ-BC-ATLAS-002` remain regression-verified on RC1.
- `AQ-BC-UI-HEADER-001` is regression-verified via #126: persistent mobile-shell header CSS is scoped to `header[data-shell="mobile-header"]`; arbitrary page headers no longer inherit 44×44 icon-button geometry or shell chrome.
- Identify 390px back action is content-fit (132×40 in regression evidence), single-line, and separated from the page title; 390/900/1600 regression is permanent in UI UX System.
- The Collection 390 golden reference was migrated only after runner artifact review proved the old baseline preserved the same shell-scope bug; tolerance stayed unchanged and the other seven golden cases were untouched.
- Aquarium configured-returning-user first fold is task-first with no persistent return-context/onboarding competition; Care, Search, and Collection currently have no browser evidence justifying broad IA redesign.

## Known Bounded Gaps

- Reviewed species-specific equipment requirements and hard physical-space constraints remain incomplete; missing evidence stays explicit `unknown`.
- Legacy `healthScore / tankHealthStatus / riskReminders` dead code is non-authoritative and can be removed later.
- Production acceptance remains separate from repository acceptance: live-provider usefulness, production env/secrets, deployed smoke, and production golden paths are still required before release.
- Parallel `agent/p0-water-change-engine-v1` remains historical/unreviewed; its AQ-WATER-005/006 additions are not accepted Product Truth.

## Next Execution Order

1. Continue evidence-driven cross-route UI/UX audit from current RC1; do not redesign Aquarium/Care/Search/Collection without a reproducible browser or interaction badcase.
2. Prioritize remaining real responsive/navigation defects, especially shared-shell selectors or duplicated task-entry semantics that can affect multiple routes.
3. Keep 390 / 900 / 1600 geometry and full responsive-route scans as the acceptance floor for cross-route UI changes.
4. Keep all UI work consuming the landed Planning Compatibility / Current Tank State / Water Change authorities; do not recreate page-level heuristics.
5. Do not merge RC1 to `main` and do not deploy production without separate explicit authorization.
