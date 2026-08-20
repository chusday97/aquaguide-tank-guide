# AquaGuide Handoff — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)  
**Latest browser-verified code head:** `34ed3ea9025511a2419f0dd93ed6559bb276d8bb`

## Current state

The active work has moved from #104 UI/UX-system closure to #105 Result UX V1.

PR #105 is still **open, mergeable and Draft**. It is **not merged** and no production deployment is claimed in this handoff.

The important status change since the previous handoff is that Diagnosis and Compatibility are no longer only foundation targets: both consumers are now connected to the shared decision-first result system and have browser-regression evidence.

The plant roster red CI investigated during this branch is also closed: the product persistence path was correct; the final failure was caused by the browser fixture reseeding legacy data on every reload. The evaluator now seeds each browser context only once, so reload verifies real persistence instead of overwriting the saved state.

## Result UX V1 — implemented

### Shared result system

- `src/components/result/DecisionResultSurface.tsx`
  - one primary verdict / result at the top;
  - one primary action;
  - maximum two follow-up actions;
  - watch-next and escalation guardrails;
  - compact avoid list;
  - reasoning and source detail behind progressive disclosure;
  - reviewed vs candidate evidence status remains visible.
- `src/modules/result/resultAdapters.ts`
  - Diagnosis and Compatibility adapters;
  - deterministic tone / severity mapping;
  - explicit escalation boundaries;
  - action-level Care evidence mapping;
  - deterministic Compatibility citation mapping.

### Diagnosis consumer

Diagnosis now uses the shared decision-first result surface rather than presenting all explanation blocks at equal priority.

Acceptance verified in browser:

- verdict is visible before causal explanation;
- primary action is visible in the first decision surface;
- follow-up actions remain bounded;
- watch/escalation information remains available;
- existing diagnosis context is preserved.

### Compatibility consumer

Compatibility now uses the same result hierarchy while retaining deterministic safety semantics.

Acceptance verified in browser:

- compatibility verdict is surfaced first;
- deterministic blocking/safety rules remain authoritative;
- primary recommendation is visible before detailed reasoning;
- source/review status remains fail-closed;
- AI presentation does not override deterministic Compatibility rules.

## Result UX permanent regression gate

A permanent workflow now exists at:

- `.github/workflows/result-ux-v1.yml`

It runs:

1. Result UX static contract;
2. TypeScript check;
3. production build;
4. Diagnosis decision-first Playwright regression;
5. Compatibility decision-first Playwright regression;
6. browser-evidence artifact upload.

Latest verified run on `34ed3ea9025511a2419f0dd93ed6559bb276d8bb`:

- **Result UX V1 / run `32338616508` — PASS**
  - Result UX contract — PASS
  - Type check — PASS
  - Production build — PASS
  - Diagnosis decision-first regression — PASS
  - Compatibility decision-first regression — PASS

This means Diagnosis + Compatibility migration is now a browser-verified implementation, not a documentation-only claim.

## Plant roster / legacy plant regression closure

### Symptom

The legacy `plants[]`-only browser case repeatedly failed around:

`1株 → edit → 2株 → reload`

Initial CI appearance suggested a possible persistence or React state-sync bug.

### Evidence gathered

Before changing product persistence logic, diagnostics proved that immediately after save:

- `record.quantity = 2`;
- first batch quantity = `2`;
- `plants[]` mirror still contains the plant species;
- roster text snapshot already reads `共 2株`.

Therefore the save path itself was working.

### Root cause

`seedState()` used `context.addInitScript()` with unconditional:

- `localStorage.clear()`;
- original fixture write.

Playwright runs that init script on every navigation/reload. The regression test therefore saved `2株`, then `reload()` executed the fixture again and restored the original `1株` state. The evaluator was destroying the state it was supposed to verify.

This was a **test-fixture defect, not a product persistence defect**.

### Final fix

Commit:

- `34ed3ea9025511a2419f0dd93ed6559bb276d8bb`

The fixture now marks the browser context as seeded in `sessionStorage` and initializes localStorage only once per context. A reload therefore tests the saved product state instead of re-injecting the original fixture.

Latest verified run:

- **Plant Roster Edit Fix / run `32338616480` — PASS**
  - Plant livestock contract — PASS
  - Type check — PASS
  - Production build — PASS
  - Plant quantity/edit browser regression — PASS
  - Existing navigation-context regression — PASS

The regression now proves both structured plant records and legacy `plants[]` migration survive edit + reload with plant-specific quantity units.

## Discarded hypothesis / cleanup

A temporary hypothesis proposed a local-aquarium load race as the cause of the plant failure. CI evidence disproved it.

The temporary self-modifying workflow and automation script were removed before they could write an unnecessary product-state patch:

- removed `.github/workflows/local-aquarium-load-race-fix.yml`;
- removed `scripts/automation/fix-local-aquarium-load-race.mjs`.

Do **not** revive that race-condition patch unless new independent evidence demonstrates an actual product race.

## Upstream #104 relationship

#105 still targets `agent/uiux-system-refactor-v1` (#104). The Result UX work assumes #104's UI/UX system and navigation contracts.

Do not merge #105 independently into an incompatible base. After #104's final branch disposition is decided, retarget/rebase #105 deliberately and rerun the permanent gates.

## Known documentation mismatch

The current PR #105 body still contains an outdated statement saying Diagnosis and Compatibility have not yet been migrated. That statement is no longer true.

The source of truth after this handoff is:

- Diagnosis migrated — browser verified;
- Compatibility migrated — browser verified;
- Result UX permanent workflow — green;
- plant legacy regression — green after fixture correction.

Update the PR body before moving #105 to Ready for Review.

## Current non-blockers / debt

- Vite still reports large-chunk and mixed dynamic/static-import warnings; no bundle-size reduction is claimed here.
- Existing dependency vulnerability debt is outside the Result UX migration scope.
- Species Detail, Identify, Knowledge and AI Assistant have **not** been declared migrated to Result UX V1 in this handoff.
- Evidence remains action-scoped: a publisher/source name alone does not imply every recommendation is reviewed.

## Next owner action

1. Update PR #105 body so it no longer says Diagnosis / Compatibility are unmigrated.
2. Keep #105 Draft until the upstream #104 branch/base disposition is settled and the combined branch relationship is reviewed.
3. If the next Result UX migration continues, take **one consumer at a time** (Species Detail / Identify / Knowledge / AI Assistant), add its browser contract first, then migrate it.
4. Do not reopen the legacy plant persistence issue unless a new reproduction fails with a fixture that does not reseed storage.
5. Do not merge or production-deploy solely from this handoff update.

## Latest confidence snapshot

- Result UX shared contract: **verified**
- Diagnosis migration: **verified**
- Compatibility migration: **verified**
- plant structured edit persistence: **verified**
- legacy `plants[]` → structured plant edit + reload persistence: **verified**
- #105 merge readiness: **not yet declared**; PR remains Draft and its body is stale
