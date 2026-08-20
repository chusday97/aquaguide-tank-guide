# AquaGuide Progress — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)

## Current phase

The project is in **Result UX final-consumer closure**.

PR #105 remains **Draft / open / mergeable / not merged**. No production deployment is claimed.

## Verified Result UX consumers

- [x] Diagnosis
- [x] Compatibility
- [x] Knowledge
- [x] Procedure
- [x] Species Detail
- [x] Identification
- [ ] Live AI Tank Copilot

Authoritative clean six-consumer baseline:

- head `6d311ed18fde2241a9aa27400809634155921fa6`;
- Result UX V1 / run `32357720875` — **PASS**:
  - static contract;
  - TypeScript;
  - production build;
  - Diagnosis browser regression;
  - Compatibility browser regression;
  - Knowledge browser regression;
  - Procedure browser regression;
  - Species Detail + parent-context browser regression;
  - Identification uncertainty + explicit-confirmation browser regression;
  - evidence artifact upload.

Same-head safety baselines:

- Plant Roster Edit Fix / run `32357720873` — **PASS**, including plant quantity/edit and existing Navigation Context regression.
- Compatibility Stage Risk V1 / run `32357720857` — **PASS**, including same-species adult-control → fry-treatment browser regression.

## Species Detail — DONE

Fail-before:

- Result UX run `32346056247` — expected FAIL only because the old surface lacked `species-detail-decision`.

Product / permanent closure:

- `0e7f1dd1e2b8850d473d97f166579f5803889ccd` — decision-first migration;
- `d4e325ad05206f3850ce1845f27ea2e09c32f975` — permanent contract and cleanup;
- clean run `32347457450` — Result UX PASS;
- Plant run `32347457511` — Plant + Navigation Context PASS.

Closure checks:

- [x] tank-fit result is first-screen decision;
- [x] one stable primary CTA;
- [x] owned tank record action preserved;
- [x] evidence collapsed;
- [x] exact originating roster reopens;
- [x] focus returns to originating opener;
- [x] workspace scroll restoration remains within 96px tolerance.

## Identification — DONE

Fail-before:

- commit `7d57057b65ba712fd68fe095e9815a3b0723fc39` added Identification browser acceptance;
- Result UX run `32348162424` — expected FAIL at missing `identify-decision` only.

Product / permanent closure:

- `95538f6cc23afc6e9dc6d3156c489647ca3cb45d` — shared decision-first candidate review;
- `fd4a9de553a43d09d560115867c3636cc9e2be38` — permanent uncertainty/static contract;
- `4f2fa3fa9aa41889b124b1c8097e4fe106c8ea26` — stable species-bound confirmed-state contract;
- `6d311ed18fde2241a9aa27400809634155921fa6` — read-only cleanup.

Final closure checks:

- [x] AI candidates are explicitly framed as needing user confirmation;
- [x] ambiguous recognition preserves multiple choices;
- [x] no candidate is confirmed before explicit click;
- [x] confirmation resolves through `confirmFish`;
- [x] confirmed UI binds to the selected species via `data-identify-confirmed`;
- [x] identification and health triage remain separate stages;
- [x] health triage does not auto-start;
- [x] final six-consumer clean Result UX baseline PASS.

The intermediate wait-for failure on `物种已确认` was an evaluator literal mismatch; product rendered `已确认物种`. The permanent test now verifies semantic confirmed state instead of translated copy.

## Compatibility life-stage false-negative closure — DONE

Same-species compatibility now carries lifecycle stage through all relevant add-species paths.

- existing and planned additions capture the five-stage contract: unknown / fry / juvenile / subadult / adult;
- retry paths preserve stage;
- build-template imports use explicit unknown stage;
- same-species adult + adult is not blocked merely because IDs match;
- changing only the candidate to fry triggers the reviewed blocking risk;
- a blocked fry plan cannot expose the normal safe-record CTA;
- high-risk override remains separate and does not mutate tank state before explicit confirmation.

Authoritative clean run: Compatibility Stage Risk V1 / `32357720857` — **PASS**.

## Final AI consumer — ACTIVE

The authoritative live AI surface is the **AI Tank Copilot embedded in `src/pages/Aquarium.tsx`**.

Important architecture finding:

- `src/pages/AIAssistant.tsx` exists but is not routed by `App.tsx` and has no `taskRoutes` entry;
- README defines the implemented module as **AI Tank Copilot**;
- therefore Result UX V1 will migrate/test the live Aquarium Copilot rather than resurrecting legacy dead UI.

Existing safety contracts that must remain untouched:

- deterministic recommendation data defines the candidate pool;
- `sanitizeTankCopilotResponse` removes model-selected candidates outside that pool;
- only locally allowed missing-information questions survive;
- executable Copilot actions are allowlisted and their labels are local-fixed;
- Copilot actions are bounded;
- model failure falls back to local output.

Result UX acceptance to establish before product changes:

- [ ] live Copilot entry is reachable from Aquarium;
- [ ] one direct answer/action-first surface is visually primary;
- [ ] no more than two follow-up actions are promoted;
- [ ] long goal interpretation / explanation is secondary disclosure;
- [ ] the UI visibly labels model content as AI assistance, not deterministic truth;
- [ ] no model-originated text is rendered as Verified or as a compatibility/risk verdict;
- [ ] deterministic candidate/action sanitization remains unchanged.

## Vercel deployment-frequency policy

- [x] `git.deploymentEnabled: false` in `vercel.json`;
- [x] GitHub Actions is the iterative validation layer;
- [x] hosted Preview / Production are explicit milestone actions.

## Engineering debt / non-blockers

- npm audit: 18 vulnerabilities (2 low, 6 moderate, 10 high);
- mixed dynamic/static Vite import warnings remain;
- large entry chunks remain;
- #105 still depends on #104 and must rerun combined gates after any retarget/rebase.

## Merge-readiness judgment

**Six Result UX consumers are verified. The live AI Tank Copilot is the final Result UX blocker. PR #105 remains Draft.**

Remaining blockers:

1. live Copilot fail-before and migration;
2. final combined clean gates after Copilot;
3. upstream #104 disposition / integration gate;
4. production-readiness review and explicit deployment decision.

## Next execution order

1. Add live Copilot fail-before browser acceptance.
2. Prove the old Copilot surface fails only the intended Result UX hierarchy/authority contract.
3. Migrate Copilot without weakening deterministic sanitization.
4. Lock permanent static + browser contract and restore read-only validation.
5. Run final combined gates, then update merge/deployment readiness.
