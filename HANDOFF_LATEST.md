# AquaGuide — Latest Handoff

**Updated:** 2026-08-24
**Repository:** `chusday97/aquaguide-tank-guide`
**RC1 branch head before this Context Sync:** `895f2f3959dc42b653fbb4f33cc25044e5785da3`
**RC1 runtime baseline:** `integration/aquaguide-rc1` runtime/product head `9474f2688bab68ee51f3cd043464251c932a8fc4` (#137); #138 is docs/test-only contract alignment.
**Active branch:** `docs/context-sync-production-runtime-v1` — docs-only Production Acceptance runtime sync
**Phase:** `Production Acceptance / Vercel Business API runtime repaired / remaining live-provider + production environment acceptance`
**Release boundary:** no RC1→`main` merge and no production deployment without separate explicit authorization.

## Current Product Truth

Planning Compatibility, Existing Tank Current State, and Water Change maintenance remain separate authorities.

`Planning: hard constraints + pair relationships + whole-tank feasibility + evidence completeness -> compatible / caution / not_recommended / insufficient_data`

`Existing Tank: Prior Risk + Tank Context + structured Observed Evidence + Time/History + Hard Constraints -> stable / watch / intervene / urgent / unknown`

`Water Change: maintenance baseline + completed history + current evidence -> maintenance recommendation; calendar overdue alone != current urgent state`

Static temperament, generic tank-size guidance, pairwise planning verdicts, heuristic bioload, and maintenance lateness cannot directly manufacture current danger.

## Repository Acceptance

- P0 decision-layer stack #113→#120 is landed in RC1.
- Post-P0 landings include #122 Interactive Atlas, #124 mobile Encyclopedia Search, #126 shell-header scope, #128 Encyclopedia toolbar ownership, #130 Species Detail authority presentation, #132 Result UX head integrity, #134 Recommendation prefilter authority, and #135 Recommendation severity alignment.
- Production Acceptance runtime repair #137 is landed: Vercel Business API relative ESM imports now use explicit `.js` specifiers; the real Preview catch-all API path no longer fails with `ERR_MODULE_NOT_FOUND`.
- #138 is landed as docs/test-only contract alignment so RC1 Release Acceptance expects the deployed-safe `.js` adapter instead of the stale extensionless import.
- Exact RC1 head `895f2f3` passed **16/16** GitHub checks after #138.
- P0 gates PASS: Compatibility `32733430204`, Tank State `32733430542`, Tank Evidence `32733430259`, Existing Tank `32733430267`, Water Change `32733430388`, Whole-Tank `32733430292`.
- Release/UI PASS: RC1 Release `32733430310`, Product Golden `32733430156`, UI Interaction `32733430390`, UI UX System `32733430317`, UI UX Visual QA `32733430250`, UI UX Golden V3 `32733430279`, UI V2 Aquarium `32733430289`, Navigation `32733430252`, Bundle Audit `32733430313`.
- Result UX candidate-head gate PASS: `32733430395`.

## Production Acceptance Evidence

- Pre-fix RC1 `b94b3c84` reproduced a real Vercel runtime failure: `/api/v1/business-health` returned `500 FUNCTION_INVOCATION_FAILED`, and unknown `/api/v1/*` paths also returned 500.
- Runtime logs identified `ERR_MODULE_NOT_FOUND` for `/var/task/apps/api/src/app` imported from the Vercel catch-all adapter.
- #137 changed only server-side relative module specifiers in the Vercel Business API dependency graph to explicit `.js` ESM specifiers and added a permanent Vercel Business API ESM contract.
- Candidate deployment `dpl_9zyoNx2PLdtD95z9aari6hMyGeec` reached READY. Authenticated smoke passed: `/` -> 200 HTML; `/api/v1/health` -> 200 JSON with AI configured; `/api/v1/business-health` -> 200 JSON; unknown API route -> 404 JSON `NOT_FOUND`.
- Preview `databaseConfigured=false` / `shareReportsConfigured=false` is expected because those variables are Production-only. This proves the catch-all runtime is healthy, not that Production data/share configuration is complete.
- Production Security now validates the actual PR head rather than a fixed legacy branch.

## UI / Authority / CI Status

- `AQ-BC-ATLAS-001`, `AQ-BC-ATLAS-002`, `AQ-BC-UI-HEADER-001`, `AQ-BC-UI-TOOLBAR-001`, and `AQ-BC-UI-AUTH-001` remain regression-verified on RC1.
- `AQ-BC-CI-001` remains regression-verified via #132: Result UX checks out `${{ github.event.pull_request.head.sha }}` and verifies the runtime SHA.
- Species Detail verdict/watch/avoid/evidence remain owned by canonical `TankCompatibilityResult`; local setup metrics remain reference-only context.
- `AQ-BC-REC-001` remains regression-verified via #134: static `housingMode = 建议单养` cannot suppress a non-blocked candidate before canonical Compatibility.
- `AQ-BC-REC-002` remains regression-verified via #135: heuristic load thresholds and reviewed min-group gaps remain warning/adjustment context and cannot override a canonical non-blocked result to `blocked` or clear the adjustable candidate pool.
- No currently reproduced Recommendation hard-block bypass remains in the audited live path; further Recommendation changes require a new executable canonical-vs-consumer contradiction.

## Known Bounded Gaps

- Reviewed species-specific equipment requirements and hard physical-space constraints remain incomplete; missing evidence stays explicit `unknown`.
- Legacy `healthScore / tankHealthStatus / riskReminders` and definition-only Encyclopedia fit helpers are non-authoritative dead code; cleanup is optional and not a release blocker.
- Production acceptance is **partially proven, not complete**: the Vercel catch-all runtime is now healthy, but representative live-provider Tank Copilot usefulness, Production env/secrets, Production-only database/share configuration, deployed RC1 smoke on the final environment, and production golden paths remain required.
- Parallel `agent/p0-water-change-engine-v1` remains historical/unreviewed; its AQ-WATER-005/006 additions are not accepted Product Truth.

## Next Execution Order

1. Do not restart broad authority/UI refactoring unless a new reproducible canonical-vs-consumer contradiction appears.
2. Finish representative live-provider Tank Copilot usefulness evaluation: generic-answer rate, candidate-drop rate, hallucinated-preference rate, contradiction handling, invalid JSON recovery, timeout/network fallback.
3. Verify Production environment/secrets, including Production-only database/share configuration, without treating Preview-only missing vars as a product failure.
4. Run deployed final-RC1 smoke and production golden paths after deployment is explicitly authorized.
5. Keep 390 / 900 / 1600 geometry, full responsive-route scan, Product Golden, candidate-head Result UX, Recommendation authority regression, Vercel Business API ESM contract, and exact-head Production Security as the release acceptance floor.
6. Keep Planning Compatibility / Current Tank State / Water Change as separate authorities; static metadata remains reference context, not a competing verdict.
7. Do not merge RC1 to `main` and do not deploy production without separate explicit authorization.
