# AquaGuide Handoff — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)

## Current state

PR #105 remains **open, mergeable and Draft**. It is not merged and no production deployment is claimed.

Result UX V1 now has four migrated consumers:

1. Diagnosis;
2. Compatibility;
3. Knowledge;
4. Procedure.

Procedure product migration is complete and passed its migration-run browser regression. A final clean pure-verification Result UX run on the post-cleanup head is the remaining closure check before treating the four-consumer baseline as authoritative.

## Shared Result UX contract

`src/components/result/DecisionResultSurface.tsx` establishes:

- one primary result / verdict or first operational step;
- maximum two follow-up actions;
- compact watch / escalation guardrails;
- compact avoid list;
- bounded hero explanation;
- reasoning and sources behind progressive disclosure;
- reviewed vs candidate evidence state.

Evidence remains fail-closed and action-scoped. A publisher/source name by itself never upgrades a recommendation to Verified.

## Consumer status

### Diagnosis — browser verified

- primary action appears before causal explanation;
- follow-up actions stay bounded;
- watch/escalation boundaries remain available;
- existing diagnosis context remains intact.

### Compatibility — browser verified

- verdict appears first;
- deterministic blocking/safety rules remain authoritative;
- AI presentation does not override deterministic rules;
- candidate source state remains fail-closed.

### Knowledge — browser verified

- shared `DecisionResultSurface`;
- key takeaway / first action precedes the long explanation;
- primary CTA remains first-screen;
- shared follow-up actions capped at two;
- detailed explanation collapsed by default;
- Care evidence preserves original `immediate` kind and action index.

Knowledge fail-before: Result UX V1 / run `32340512920` — expected FAIL only at Knowledge.

Prior three-consumer verified baseline:

- head `ec55754dbbacf038d7b5e48d1a663f9e1a8cea18`;
- Result UX V1 / run `32341238477` — PASS.

### Procedure — migrated, migration browser proof PASS

Procedure fail-before:

- Result UX V1 / run `32341637554` — expected FAIL only because the old Procedure implementation had no `care-procedure-decision` surface.

Product migration:

- commit `49fd00385126fd4adef3d533ac87d302a3df9943` — `Migrate Procedure to decision-first Result UX`.

Current behavior:

- first concrete procedure step is the decision hero;
- next two procedure steps are bounded follow-ups;
- action evidence keeps original immediate-action indexes;
- post-operation observation is exposed as the watch item;
- procedure reminders become compact avoid guidance;
- duplicate `Follow Steps Sequentially / 现在按顺序做` first-screen block is removed;
- completion actions such as `去记录本次换水 / Record Water Change in Tank` remain after the operation, not ahead of it;
- detailed description remains collapsed behind `secondary_evidence`.

Migration validation:

- Result UX V1 / run `32344881783` — TypeScript PASS, production build PASS, Diagnosis PASS, Compatibility PASS, Knowledge PASS, Procedure PASS.

Permanent Procedure-specific static assertions are being locked into `scripts/test-result-ux-contract.mjs`; temporary write-enabled migration automation is removed in the cleanup commit. Require one clean read-only CI run after that cleanup before declaring Procedure fully closed.

## Vercel deployment-frequency policy

Git-triggered Vercel deployment is globally disabled:

- `vercel.json` → `git.deploymentEnabled: false`.

This is intentional. Documentation, tests, intermediate code commits and normal development pushes must not consume Vercel Preview/build admission quota. GitHub Actions is the iterative validation layer. Vercel Preview and Production should be explicit milestone actions only.

Do not re-enable per-commit Vercel Git deployment while this development model is active.

## Plant roster / legacy plant closure retained

The prior `1株 → edit → 2株 → reload` failure was an evaluator fixture defect, not a product persistence defect. The Playwright fixture had re-seeded original localStorage on reload.

- Plant Roster Edit Fix / run `32338616480` — PASS.
- Evaluator defect is recorded as PUI-BC-053 in `BADCASE_LATEST.md`.

Do not reopen the disproven local-aquarium load-race hypothesis without new independent product evidence.

## Upstream #104 relationship

#105 still targets `agent/uiux-system-refactor-v1` (#104).

Inherited contracts that must remain intact include:

- PUI-BC-050 Compatibility risk-review/navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → immediate-parent roster return.

## Remaining Result UX boundary

Not yet migrated:

- Species Detail;
- Identification;
- AI Assistant.

Continuation rule:

**one consumer → fail-before contract → product migration → browser proof → permanent contract → documentation update.**

Species Detail is the highest remaining navigation risk. It must not be migrated by flattening or breaking PUI-BC-052; its parent-roster return, scroll/focus context and nested navigation need explicit acceptance before product changes.

## Current engineering debt / non-blockers

- Vite still reports large-chunk and mixed dynamic/static-import warnings.
- Existing npm dependency vulnerability debt remains outside Result UX scope.
- Thin wrapper/Base structures inherited from #104 remain deliberate risk-containment debt.

## Merge-readiness judgment

PR #105 remains Draft because:

1. final clean four-consumer Result UX verification is still required after cleanup;
2. Species Detail / Identification / AI Assistant remain unmigrated;
3. #105 still depends on #104 and any retarget/rebase requires combined gates to rerun;
4. Species Detail must preserve nested navigation guarantees.

## Next owner action

1. Finish the clean read-only Result UX verification after Procedure cleanup.
2. Record the final four-consumer head/run in this handoff, progress and PR body.
3. Then inspect Species Detail navigation contracts before introducing its fail-before Result UX test.
4. Keep Vercel auto-deploy disabled and use explicit hosted Preview only at a deliberate visual checkpoint.
5. Keep #105 Draft; do not merge or production-deploy from this handoff alone.
