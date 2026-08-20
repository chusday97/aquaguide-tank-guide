# AquaGuide Progress — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)

## Current phase

The project has moved beyond page-by-page UI repair into **result-system convergence + regression closure**.

The active objective is to make result-heavy surfaces answer the user’s decision first, while preserving deterministic product logic, navigation context, and fail-closed evidence semantics.

PR #105 remains **Draft / open / mergeable / not merged**. No production deployment is claimed here.

## Result UX V1

### Shared system

- [x] Added `src/components/result/DecisionResultSurface.tsx`.
- [x] Added shared result adapters in `src/modules/result/resultAdapters.ts`.
- [x] Enforced one primary verdict/action, maximum two follow-up actions, guardrails, avoid list, and progressive disclosure.
- [x] Preserved action-scoped evidence semantics: reviewed evidence can be marked verified; candidate evidence remains explicitly unverified.
- [x] Added static Result UX contract test.
- [x] Added permanent `.github/workflows/result-ux-v1.yml` browser gate.

### Diagnosis

- [x] Migrated Diagnosis consumer to `DecisionResultSurface`.
- [x] Primary action appears before causal explanation.
- [x] Follow-up action count remains bounded.
- [x] Watch / escalation boundaries remain visible.
- [x] Existing diagnosis context is preserved.
- [x] Browser regression PASS.

### Compatibility

- [x] Migrated Compatibility consumer to `DecisionResultSurface`.
- [x] Compatibility verdict is surfaced first.
- [x] Deterministic blocking / safety rules remain authoritative.
- [x] Primary recommendation appears before detailed reasoning.
- [x] Candidate evidence remains fail-closed.
- [x] Browser regression PASS.

### Authoritative Result UX evidence

Verified code head: `34ed3ea9025511a2419f0dd93ed6559bb276d8bb`.

- Result UX V1 / run `32338616508` — **PASS**
  - Result UX contract — PASS
  - Type check — PASS
  - Production build — PASS
  - Diagnosis decision-first regression — PASS
  - Compatibility decision-first regression — PASS

The PR head may advance through docs-only commits; `34ed3ea...` remains the latest explicitly browser-verified code baseline unless a newer code-bearing head is validated.

## Plant roster / legacy plant closure

- [x] Reproduced legacy `plants[]` quantity-edit regression path.
- [x] Added diagnostics before changing persistence logic.
- [x] Proved the product save path already persisted `record.quantity = 2`, batch quantity `2`, and visible roster text `共 2株` immediately after save.
- [x] Isolated reload failure to the Playwright fixture, not product state.
- [x] Corrected fixture seeding so localStorage is initialized only once per browser context.
- [x] Verified edit + reload persistence for legacy plant data.
- [x] Removed the disproven local-aquarium load-race self-modifying workflow/script.

Authoritative evidence:

- Plant Roster Edit Fix / run `32338616480` — **PASS**
  - Plant livestock contract — PASS
  - Type check — PASS
  - Production build — PASS
  - Plant quantity/edit browser regression — PASS
  - Existing navigation-context regression — PASS

## Upstream #104 closure retained

The Result UX branch still inherits the completed UI/UX-system work from #104, including:

- PUI-BC-050 Compatibility risk-review/navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → parent roster return;
- permanent Navigation Context browser regression;
- responsive/system/visual/golden/bundle audit evidence.

Do not weaken these contracts while migrating additional Result UX consumers.

## Documentation / governance

- [x] Updated `HANDOFF_LATEST.md` to Result UX V1 current state.
- [x] Updated PR #105 body so it no longer falsely claims Diagnosis / Compatibility are unmigrated.
- [x] Updated `RESULT_UX_V1.md` current rollout boundary.
- [x] Update `PROGRESS_LATEST.md` to the active #105 branch and current evidence.
- [ ] Add the plant fixture false-negative as the next evaluator badcase in `BADCASE_LATEST.md`.
- [ ] Decide whether evaluator-only badcase should also enter the canonical product badcase JSONL; do not append it automatically without checking registry semantics.

## Remaining Result UX consumers

Not yet declared migrated:

- [ ] Knowledge / Procedure
- [ ] Species Detail
- [ ] Identification
- [ ] AI Assistant

Rule for continuation: **one consumer at a time**. Add or extend its contract/browser regression before claiming migration complete.

## Current engineering debt / non-blockers

- Large entry bundle remains; Result UX V1 does not claim bundle-size reduction.
- Vite still reports mixed dynamic/static import warnings around existing data dependencies.
- Existing npm audit debt remains outside this Result UX slice.
- Vercel free-plan preview quota has previously blocked previews; that is external infrastructure state, not equivalent to a product build failure.
- Thin wrapper/Base structures inherited from #104 remain deliberate risk-containment debt and should not be recombined inside this already-large PR without regression protection.

## Merge-readiness classification

### Current judgment

**The first Result UX migration slice is browser verified, but PR #105 is not yet declared merge-ready.**

Reasons to keep Draft:

1. #105 still depends on #104 as its base; final upstream branch disposition is not yet settled.
2. Remaining Result UX consumers are intentionally out of scope for the first verified slice and should not be silently implied complete.
3. Any retarget/rebase must rerun permanent gates before readiness is reassessed.

## Next execution order

1. Record the evaluator fixture false-negative in `BADCASE_LATEST.md`.
2. Inspect Knowledge / Procedure and Species Detail implementation coupling.
3. Choose the safer third Result UX consumer based on deterministic logic, existing evidence model, and navigation-regression risk.
4. Add that consumer’s contract/browser test first.
5. Migrate only that consumer.
6. Rerun Result UX + relevant upstream navigation/system gates.
7. Update handoff/progress/badcase again before any Ready-for-Review decision.

## Non-claims

- PR #105 is not merged.
- No production deploy is claimed.
- A green Result UX workflow for Diagnosis + Compatibility does not imply every result surface follows Result UX V1.
- The corrected plant test proves the covered browser persistence path, not production telemetry.
