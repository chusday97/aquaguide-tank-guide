# AquaGuide Progress — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)

## Current phase

The project is in **result-system convergence + regression closure**.

PR #105 remains **Draft / open / mergeable / not merged**. No production deployment is claimed.

## Result UX shared system

- [x] `DecisionResultSurface` provides one primary verdict/action or operational first step.
- [x] Follow-up actions are bounded to two.
- [x] Watch/escalation and avoid guidance stay compact.
- [x] Evidence status remains action-scoped and fail-closed.
- [x] Long reasoning and sources use progressive disclosure.
- [x] Permanent browser gate exists.

## Migrated consumers

### Diagnosis — verified

- [x] Shared decision surface.
- [x] Primary action before causal explanation.
- [x] Bounded follow-ups.
- [x] Watch / escalation retained.
- [x] Browser regression PASS.

### Compatibility — verified

- [x] Shared decision surface.
- [x] Verdict first.
- [x] Deterministic blocking/safety remains authoritative.
- [x] Candidate evidence stays fail-closed.
- [x] Browser regression PASS.

### Knowledge — verified

- [x] Shared decision surface.
- [x] Key takeaway / first action before long explanation.
- [x] Primary CTA remains first-screen.
- [x] Follow-ups capped at two.
- [x] Detailed explanation collapsed by default.
- [x] Action evidence preserves original Care `immediate` kind/index.
- [x] Browser regression PASS.

Fail-before: Result UX V1 / run `32340512920` — expected FAIL only at Knowledge.

Prior three-consumer baseline:

- head `ec55754dbbacf038d7b5e48d1a663f9e1a8cea18`;
- run `32341238477` — PASS.

### Procedure — migrated; clean closure verification pending

Fail-before:

- Result UX V1 / run `32341637554` — expected FAIL only at Procedure.

Product migration:

- commit `49fd00385126fd4adef3d533ac87d302a3df9943` — first operational step moved into shared Result UX.

Behavior now:

- [x] first step is the decision hero;
- [x] next two steps are bounded follow-ups;
- [x] immediate action evidence indexes preserved;
- [x] post-operation observation becomes watch guidance;
- [x] reminders become compact avoid guidance;
- [x] duplicate legacy first-three-step card removed;
- [x] `去记录本次换水 / Record Water Change in Tank` remains a post-operation action;
- [x] detailed description remains collapsed;
- [x] migration-run browser regression PASS.

Migration validation:

- Result UX V1 / run `32344881783` — TypeScript PASS, production build PASS, Diagnosis PASS, Compatibility PASS, Knowledge PASS, Procedure PASS.

Permanent cleanup:

- Procedure-specific assertions are added to `scripts/test-result-ux-contract.mjs`;
- the Result UX workflow is returned to `contents: read`;
- temporary Procedure migration automation is removed;
- one final clean pure-verification run is required before marking Procedure fully closed.

## Vercel deployment-frequency policy

- [x] `vercel.json` has `git.deploymentEnabled: false`.
- [x] Git commits no longer auto-create Vercel deployments.
- [x] Documentation/test/intermediate code commits use GitHub Actions only.
- [x] Hosted Preview and Production are explicit milestone actions.

Do not re-enable per-commit Vercel Git deployment during active repair work.

## Plant roster / legacy plant closure

- [x] Product save state verified.
- [x] Reload false failure traced to Playwright fixture re-seeding.
- [x] Structured + legacy plant edit/reload path PASS.
- [x] Navigation context regression PASS.
- [x] PUI-BC-053 recorded as evaluator defect.

Authoritative historical plant run: `32338616480` — PASS.

## Upstream #104 contracts retained

Must preserve:

- PUI-BC-050 Compatibility navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → immediate-parent roster return;
- responsive / visual / golden-path contracts established in #104.

## Remaining Result UX consumers

- [ ] Species Detail
- [ ] Identification
- [ ] AI Assistant

Rule: **one consumer at a time; fail-before first; product migration second; browser proof third; permanent contract fourth.**

Species Detail is the next high-risk surface only after Procedure clean closure. Before changing it, add explicit acceptance for parent-roster return, scroll/focus restoration and nested navigation semantics.

## Current engineering debt / non-blockers

- Large entry bundle remains.
- Vite mixed dynamic/static import warnings remain.
- Existing npm audit debt remains outside this Result UX slice.
- Thin wrapper/Base structures inherited from #104 remain deliberate risk-containment debt.

## Merge-readiness judgment

PR #105 is still not merge-ready because:

1. clean four-consumer verification is pending after Procedure cleanup;
2. Species Detail / Identification / AI Assistant remain unmigrated;
3. any #104 retarget/rebase requires permanent gates to rerun;
4. Species Detail must not regress nested roster-return behavior.

## Next execution order

1. Run and record the clean read-only four-consumer Result UX gate.
2. Synchronize PR #105 body / handoff with the authoritative final head and run.
3. Inspect Species Detail + PUI-BC-052 and add fail-before acceptance before product edits.
4. Keep Vercel automatic Git deployments disabled.
5. Keep PR #105 Draft; do not merge or production-deploy yet.
