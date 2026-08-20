# AquaGuide Handoff — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)  
**Latest clean four-consumer baseline:** `bcf2f24911b7516d08dc077a86fcec05b0333c10`

## Current state

PR #105 remains **open, mergeable and Draft**. It is not merged and no production deployment is claimed.

Browser-verified Result UX consumers:

1. Diagnosis — DONE
2. Compatibility — DONE
3. Knowledge — DONE
4. Procedure — DONE

Authoritative clean verification on `bcf2f24911b7516d08dc077a86fcec05b0333c10`:

- Result UX V1 / run `32345353470` — **PASS**
  - static Result UX contract — PASS;
  - TypeScript — PASS;
  - production build — PASS;
  - Diagnosis browser regression — PASS;
  - Compatibility browser regression — PASS;
  - Knowledge browser regression — PASS;
  - Procedure browser regression — PASS;
  - evidence artifact upload — PASS.
- Plant Roster Edit Fix / run `32345353485` — **PASS**
  - plant contract — PASS;
  - TypeScript / production build — PASS;
  - plant quantity + edit browser regression — PASS;
  - existing Navigation Context regression — PASS.

## Procedure closure

Fail-before was established before product migration:

- Result UX V1 / run `32341637554` — expected FAIL only at Procedure because the old surface had no `care-procedure-decision`.

Product migration:

- `49fd00385126fd4adef3d533ac87d302a3df9943` — `Migrate Procedure to decision-first Result UX`.

Current Procedure contract:

- first concrete step is the shared decision hero;
- at most two next steps follow;
- first-step and follow-up evidence retain original immediate-action indexes;
- post-operation observation is exposed as watch guidance;
- reminders become bounded avoid guidance;
- the old duplicate `Follow Steps Sequentially / 现在按顺序做` first-screen block is removed;
- completion actions such as `去记录本次换水 / Record Water Change in Tank` stay after the operation and are not promoted ahead of it;
- detailed description remains collapsed behind `secondary_evidence`.

Permanent cleanup is complete:

- Procedure assertions are locked into `scripts/test-result-ux-contract.mjs`;
- `.github/workflows/result-ux-v1.yml` is back to `contents: read`;
- temporary Procedure migration automation is removed;
- the clean read-only run `32345353470` passed.

## Shared Result UX contract

`src/components/result/DecisionResultSurface.tsx` provides:

- one verdict / primary action / first operational step;
- maximum two follow-up actions;
- compact watch / escalation guardrails;
- compact avoid list;
- bounded hero explanation;
- reasoning and sources behind progressive disclosure;
- reviewed vs candidate evidence state.

Evidence remains fail-closed and action-scoped. A publisher/source name alone never upgrades a recommendation to Verified.

## Vercel deployment policy

`vercel.json` has `git.deploymentEnabled: false`.

This is intentional: documentation, tests, intermediate code commits and normal development pushes must not consume Vercel Preview/build quota. GitHub Actions is the iterative validation layer. Hosted Preview and Production are explicit milestone actions only.

Do not re-enable per-commit Vercel Git deployment during active repair work.

## Plant / navigation closure retained

The previous `1株 → edit → 2株 → reload` failure was an evaluator fixture defect, not product persistence. PUI-BC-053 remains recorded in `BADCASE_LATEST.md`.

Inherited #104 contracts that must remain intact:

- PUI-BC-050 Compatibility risk-review/navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → immediate-parent roster return, including relevant scroll/focus context.

## Remaining Result UX boundary

Not yet migrated:

- Species Detail;
- Identification;
- AI Assistant.

Continuation rule:

**one consumer → fail-before contract → product migration → browser proof → permanent contract → documentation update.**

Species Detail is the highest remaining navigation risk. Before product changes, its Result UX fail-before must explicitly protect PUI-BC-052 rather than treating Species Detail as an isolated dialog.

## Engineering debt / non-blockers

- large Vite entry bundle remains;
- mixed dynamic/static import warnings remain;
- npm audit dependency debt remains outside this Result UX slice;
- thin wrapper/Base structures inherited from #104 remain deliberate risk-containment debt.

## Next owner action

1. Inspect Species Detail and its parent-roster return path.
2. Add Species Detail fail-before Result UX + Navigation Context acceptance before modifying product UI.
3. Migrate Species Detail only after the fail-before is proven.
4. Then handle Identification and AI Assistant one at a time.
5. Keep #105 Draft; do not merge or production-deploy yet.
