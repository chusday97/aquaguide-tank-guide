# AquaGuide Progress — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)

## Current phase

The project has completed **Result UX consumer migration** and is entering **integration / production-readiness closure**.

PR #105 remains **Draft / open / mergeable / not merged**. No production deployment is claimed.

## Verified Result UX consumers

- [x] Diagnosis
- [x] Compatibility
- [x] Knowledge
- [x] Procedure
- [x] Species Detail
- [x] Identification
- [x] Live AI Tank Copilot

## Authoritative clean seven-consumer baseline

Head `4a4388f41ffafa902bf6f9bc25e2d2130cd09498`:

- Result UX V1 / run `32359908856` — **PASS**
  - static contract;
  - Tank Copilot deterministic boundary contract;
  - TypeScript;
  - production build;
  - Diagnosis;
  - Compatibility;
  - Knowledge;
  - Procedure;
  - Species Detail + parent-context;
  - Identification uncertainty + explicit confirmation;
  - Tank Copilot live-entry + AI-authority regression;
  - evidence artifact upload.
- Plant Roster Edit Fix / run `32359908896` — **PASS**, including plant quantity/edit and Navigation Context regression.
- Compatibility Stage Risk V1 / run `32359909061` — **PASS**, including same-species adult-control → fry-treatment regression.

All three final gates are green on the same read-only head.

## Species Detail — DONE

- fail-before run `32346056247`;
- migration `0e7f1dd1e2b8850d473d97f166579f5803889ccd`;
- permanent contract `d4e325ad05206f3850ce1845f27ea2e09c32f975`;
- exact originating roster, focus and scroll return remain protected by PUI-BC-052.

## Identification — DONE

- fail-before commit `7d57057b65ba712fd68fe095e9815a3b0723fc39` / run `32348162424`;
- migration `95538f6cc23afc6e9dc6d3156c489647ca3cb45d`;
- stable species-bound confirmed-state contract `4f2fa3fa9aa41889b124b1c8097e4fe106c8ea26`;
- health triage remains a separate explicit action;
- no AI candidate is confirmed before the user chooses it.

## Compatibility life-stage false-negative closure — DONE

- five-stage lifecycle contract: unknown / fry / juvenile / subadult / adult;
- retry paths preserve stage;
- adult + adult same-species control remains allowed when no reviewed risk blocks it;
- changing only candidate stage to fry triggers the reviewed blocking risk;
- blocked fry plan cannot expose normal safe-record CTA;
- high-risk override remains explicit and does not mutate tank state before confirmation.

Final same-head run: `32359909061` — **PASS**.

## Live AI Tank Copilot — DONE

### Fail-before

Commit `2fbdfcb373a9e32ebe274c090c9fdbf8397a6354` added the live Copilot browser contract.

Result UX run `32358918838` isolated a real product failure after every prior Result UX consumer passed: clicking the visible `AI 建缸助手` entry did not open the existing Copilot dialog.

Root cause: `openTankBuildCopilot()` dispatched `aquaguide:feature-preview` instead of setting the live dialog open state.

### Product / permanent closure

- `582e9e341b0231ae30c6d37fa6536ef0d0498de7` — live entry + decision-first AI-boundary migration;
- `e33bf81e205e85ec7f4ba59dfd3381f859b0d94c` — temporary migration removed, read-only workflow restored;
- `4a4388f41ffafa902bf6f9bc25e2d2130cd09498` — closed-disclosure evaluator correction;
- final run `32359908856` — **PASS**.

Closure checks:

- [x] live Aquarium Copilot entry opens the real dialog;
- [x] generated result uses shared `DecisionResultSurface`;
- [x] one local-rule-owned primary action is visually first;
- [x] no more than two follow-up actions can be promoted;
- [x] model interpretation / plan summary starts behind disclosure;
- [x] model-originated source is `candidate`, never Verified;
- [x] explicit AI-vs-local-rule authority boundary is visible;
- [x] deterministic candidate/action sanitization remains unchanged;
- [x] old unrouted `AIAssistant.tsx` was not resurrected.

The two intermediate post-migration reds were evaluator reads of closed `<details>` content, not product regressions. They are not recorded as product badcases.

## Product badcase added

- [x] **PUI-BC-054** — advertised live AI Tank Copilot entry existed but was wired only to feature-preview and therefore could not open the real Copilot dialog. Fixed and browser-regression protected.

## Vercel deployment-frequency policy

- [x] `git.deploymentEnabled: false` in `vercel.json`;
- [x] GitHub Actions remains the iterative validation layer;
- [x] hosted Preview / Production remain explicit milestone actions;
- [x] no Vercel deploy was triggered during Result UX closure.

## Engineering debt / non-blockers

- npm audit: 18 vulnerabilities (2 low, 6 moderate, 10 high);
- mixed dynamic/static Vite import warnings remain;
- large entry chunks remain;
- #105 still depends on #104 and must rerun combined gates after any retarget/rebase.

## Merge-readiness judgment

**All seven Result UX consumers are now verified. Result UX itself is no longer the blocker. PR #105 remains Draft because upstream/integration/production-readiness has not yet been closed.**

Remaining blockers:

1. inspect #104 disposition and integration branch relationship;
2. compare #105 against the intended integration target for conflicts/stale duplication;
3. inspect open review threads and required checks;
4. separate production blockers from non-blocking dependency/bundle debt;
5. make an explicit merge/deployment decision only after those checks.

## Next execution order

1. Audit #104 and current integration/RC target.
2. Compare branches and changed files.
3. Inspect review/check state.
4. Resolve only evidenced integration blockers.
5. Rerun combined permanent gates on the final integration candidate.
6. Keep #105 Draft until merge readiness is actually proven.
