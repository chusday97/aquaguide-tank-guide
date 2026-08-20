# AquaGuide Handoff — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)  
**Latest clean seven-consumer baseline:** `4a4388f41ffafa902bf6f9bc25e2d2130cd09498`

## Current state

PR #105 remains **open, mergeable and Draft**. It is not merged and no production deployment is claimed.

Browser-verified Result UX consumers:

1. Diagnosis — DONE
2. Compatibility — DONE
3. Knowledge — DONE
4. Procedure — DONE
5. Species Detail — DONE
6. Identification — DONE
7. Live AI Tank Copilot — DONE

Authoritative clean verification on `4a4388f41ffafa902bf6f9bc25e2d2130cd09498`:

- Result UX V1 / run `32359908856` — **PASS**
  - static Result UX contract;
  - Tank Copilot deterministic boundary contract;
  - TypeScript;
  - production build;
  - Diagnosis browser regression;
  - Compatibility browser regression;
  - Knowledge browser regression;
  - Procedure browser regression;
  - Species Detail + exact parent-context browser regression;
  - Identification uncertainty + explicit-confirmation browser regression;
  - Tank Copilot live-entry + AI-authority browser regression;
  - evidence artifact upload.
- Plant Roster Edit Fix / run `32359908896` — **PASS**, including plant quantity/edit and Navigation Context regression.
- Compatibility Stage Risk V1 / run `32359909061` — **PASS**, including adult-control → fry-treatment browser regression.

All three authoritative gates passed on the same read-only head.

## Tank Copilot closure

The final live AI consumer is the **AI Tank Copilot embedded in `src/pages/Aquarium.tsx`**. `src/pages/AIAssistant.tsx` remains legacy/unrouted code and was not resurrected.

### Product defect found by fail-before

Result UX run `32358918838` proved a real reachability regression: the visible `AI 建缸助手` quick action called `openTankBuildCopilot()`, but that function only dispatched `aquaguide:feature-preview` and never opened the existing Copilot dialog.

This is recorded as **PUI-BC-054** in `BADCASE_LATEST.md`.

### Product migration

Commit `582e9e341b0231ae30c6d37fa6536ef0d0498de7`:

- connects the live quick action to `setIsTankCopilotOpen(true)`;
- uses shared `DecisionResultSurface` for the generated plan;
- makes the locally controlled next action the first-screen hero;
- exposes exactly one stable primary action through `data-tank-copilot-primary-action`;
- moves model `goalUnderstanding` / `planSummary` behind progressive disclosure;
- labels model-originated supporting context as `candidate`, never Verified;
- exposes `data-tank-copilot-ai-boundary` stating that compatibility, risk level and whether an addition is allowed remain governed by local product rules;
- preserves existing `sanitizeTankCopilotResponse`, candidate-pool filtering, action allowlist and local fallback behavior.

### Permanent closure

- `e33bf81e205e85ec7f4ba59dfd3381f859b0d94c` — removed temporary migration automation and restored Result UX workflow to `contents: read`.
- `4a4388f41ffafa902bf6f9bc25e2d2130cd09498` — evaluator-only correction so closed `<details>` content is read from DOM text while remaining required to start closed.
- Result UX run `32359908856` — clean seven-consumer **PASS**.

The two intermediate post-migration reds were evaluator assumptions around hidden disclosure text, not product failures. Product assertions for live entry, AI authority boundary, candidate source status and primary action had already passed before those later evaluator assertions.

## Shared Result UX contract

`src/components/result/DecisionResultSurface.tsx` provides:

- one verdict / primary action / first operational step;
- maximum two follow-up actions;
- compact watch / escalation guardrails;
- compact avoid list;
- bounded hero explanation;
- reasoning and sources behind progressive disclosure;
- reviewed vs candidate evidence state.

Evidence remains fail-closed and action-scoped. A publisher/source name or model output alone never upgrades a recommendation to Verified.

## Inherited contracts that remain intact

- PUI-BC-050 Compatibility risk-review/navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → exact parent roster return, including focus/scroll context;
- PUI-BC-053 evaluator fixture re-seeding closure;
- same-species lifecycle stage-risk contract, including adult-control → fry-treatment regression.

## Vercel deployment policy

`vercel.json` has `git.deploymentEnabled: false`.

GitHub Actions is the iterative validation layer. Hosted Preview and Production remain explicit milestone actions only. No Vercel deployment was triggered by this closure.

## Engineering debt / non-blockers

- npm audit currently reports 18 vulnerabilities (2 low, 6 moderate, 10 high); do not blindly run `npm audit fix`;
- mixed dynamic/static Vite imports for `fishData` and `careTopicsData` remain;
- large chunks remain (`react-three-fiber` ~889 KB; main index ~2.12 MB / gzip ~475 KB);
- #105 still depends on #104, so any retarget/rebase requires combined permanent gates to rerun.

## Next owner action

Result UX consumer migration is complete. The next phase is **upstream / integration / production-readiness closure**:

1. inspect #104 and current integration/RC branch relationships before retargeting or merging anything;
2. compare #105 against its base for conflicts, stale duplicated work and deployment-sensitive files;
3. verify final required checks and review threads;
4. audit production blockers separately from non-blocking bundle/dependency debt;
5. keep #105 Draft and do not merge or production-deploy until that integration audit is complete.
