# AquaGuide — Latest Progress

**Updated:** 2026-08-24
**Base:** `integration/aquaguide-rc1`
**RC1 branch head before this Context Sync:** `895f2f3959dc42b653fbb4f33cc25044e5785da3`
**Runtime/product head:** `9474f2688bab68ee51f3cd043464251c932a8fc4` (#137)
**Current phase:** Production Acceptance

This file is intentionally a concise current-state progress log. Detailed historical implementation evidence remains available in Git history, dated Handoffs, PRs and permanent regression workflows; do not infer current product truth from an older milestone entry.

## 1. P0 decision authority — landed

The P0 stack #113→#120 is merged into RC1 and establishes the current decision model:

- Planning Compatibility is planning/prior authority, not current-tank diagnosis.
- Current Tank State owns existing-tank current risk and Today Action.
- Water Change history/baseline is a separate maintenance authority; calendar overdue alone is not current danger.
- Pair relationships and Whole-Tank Feasibility are separate.
- Generic tank-size guidance, heuristic bioload, static temperament and maintenance lateness cannot manufacture hard/current danger.
- Missing reviewed physical-space/equipment evidence remains explicit unknown rather than guessed.
- Direct reviewed pair evidence retains canonical `pair_rule` provenance and citations.

Key landings: #114 Compatibility Engine V2; #115 Current Tank State V1; #116 Tank Evidence Adapter V1; #117 Existing Tank Authority V1; #118 Water Change Authority V1; #119 Whole-Tank Feasibility V2; #120 Compatibility Evidence Provenance V1; #121 P0 Context Sync.

## 2. Post-P0 UI / authority convergence — landed

- #122 Interactive Atlas re-entry: visual exploration only; co-display != compatibility recommendation.
- #124 Mobile Encyclopedia Search: core species search is first-class on mobile.
- #126 Mobile shell header scope: shell CSS no longer captures arbitrary page headers.
- #128 Encyclopedia toolbar ownership: one visible/focusable mobile top toolbar.
- #130 Species Detail authority: verdict/watch/avoid/evidence share canonical Compatibility authority.
- #132 Result UX head integrity: candidate-head checkout + SHA verification.
- #134 Recommendation prefilter authority: static `housingMode` cannot suppress a non-blocked candidate before Compatibility.
- #135 Recommendation severity authority: heuristic load/min-group warnings cannot manufacture `blocked` or erase adjustable candidates.
- #136 Recommendation authority Context Sync.

No currently reproduced Recommendation hard-block bypass remains. Further broad authority/UI refactoring requires a new executable canonical-vs-consumer contradiction.

## 3. Production Acceptance — real runtime issue reproduced and repaired

Production Acceptance smoke on RC1 `b94b3c84b4717d6841c261239902f6d8e6bb138f` reproduced a real Vercel serverless failure:

- `/` -> 200 HTML
- `/api/v1/health` -> 200 JSON
- `/api/v1/business-health` -> 500 `FUNCTION_INVOCATION_FAILED`
- unknown `/api/v1/*` -> 500 rather than JSON 404

Vercel runtime logs identified `ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/apps/api/src/app' imported from /var/task/api/v1/[...path].js`.

### #137 — Vercel Business API ESM runtime repair

#137 changes only the server-side relative module specifiers in the Vercel Business API dependency graph to explicit `.js` ESM specifiers. It adds a permanent Vercel Business API ESM contract, wires it into Production Security + RC1 Release, and makes Production Security validate the actual PR head rather than a fixed legacy branch. Product Truth, Compatibility, UI, persistence semantics and API route behavior are unchanged.

Candidate deployment `dpl_9zyoNx2PLdtD95z9aari6hMyGeec` reached READY. Authenticated smoke passed:

- `/` -> 200 `text/html`
- `/api/v1/health` -> 200 JSON, AI `configured=true`
- `/api/v1/business-health` -> 200 JSON
- unknown `/api/v1/definitely-not-a-route` -> 404 JSON `NOT_FOUND`

Preview `databaseConfigured=false` / `shareReportsConfigured=false` is expected because those variables are Production-only. This is not evidence of a catch-all runtime failure.

#137 merged into RC1 as `9474f2688bab68ee51f3cd043464251c932a8fc4`.

### #138 — release-contract alignment

After #137, the runtime/Preview was healthy but RC1 Release Acceptance still contained one stale source expectation for the old extensionless import. #138 updates only that docs/test contract to expect the deployed-safe `.js` adapter. No runtime or Product Truth behavior changes.

#138 merged into RC1 as `895f2f3959dc42b653fbb4f33cc25044e5785da3`.

## 4. Exact RC1 acceptance after #138 — 16/16 PASS

Exact merged head `895f2f3959dc42b653fbb4f33cc25044e5785da3` passed all 16 current checks.

P0 permanent gates: Compatibility `32733430204`; Tank State `32733430542`; Tank Evidence `32733430259`; Existing Tank `32733430267`; Water Change `32733430388`; Whole-Tank `32733430292`.

Release / UI / CI matrix: RC1 Release Acceptance `32733430310`; Product Golden Path `32733430156`; UI Interaction Repair V1 `32733430390`; UI UX System Refactor V1 `32733430317`; UI UX Visual QA V2 `32733430250`; UI UX Golden V3 `32733430279`; UI V2 Aquarium `32733430289`; Navigation Context V1 `32733430252`; Bundle Audit V1 `32733430313`; Result UX V1 `32733430395`.

Repository acceptance is therefore green on the exact post-#138 RC1 ancestry.

## 5. What is still NOT proven

Repository acceptance is not the same as production acceptance. Remaining release evidence:

- representative live-provider Tank Copilot usefulness cohort;
- generic-answer rate;
- candidate-drop rate;
- hallucinated-preference rate;
- contradiction handling;
- invalid JSON recovery;
- timeout/network fallback behavior;
- Production env/secrets verification;
- Production-only database/share configuration;
- deployed final-RC1 smoke in the final production environment;
- production golden paths.

Reviewed species-specific equipment requirements and hard physical-space constraints also remain incomplete; those are bounded knowledge gaps and stay explicit `unknown`, not release-blocking fabricated rules.

## 6. Next execution sequence

1. Run the representative live-provider Tank Copilot usefulness evaluation against the current RC1 decision boundary.
2. Verify Production environment/secrets and distinguish missing Production-only configuration from Preview behavior.
3. Only after explicit deployment authorization, run deployed final-RC1 smoke and production golden paths.
4. Keep the existing 390 / 900 / 1600 geometry, full responsive-route scan, Product Golden, candidate-head Result UX, Recommendation authority, Vercel Business API ESM, and exact-head Production Security contracts as the release floor.
5. Do not restart broad UI/authority refactoring without a new reproduced contradiction.
6. Do not merge RC1 to `main` and do not deploy production without separate explicit authorization.
