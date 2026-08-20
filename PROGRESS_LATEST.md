# AquaGuide Progress — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)

## Current phase

The project is in **Result UX convergence + final consumer closure**.

PR #105 remains **Draft / open / mergeable / not merged**. No production deployment is claimed.

## Verified Result UX consumers

- [x] Diagnosis
- [x] Compatibility
- [x] Knowledge
- [x] Procedure

Authoritative clean four-consumer baseline:

- head `bcf2f24911b7516d08dc077a86fcec05b0333c10`;
- Result UX V1 / run `32345353470` — **PASS**:
  - static contract;
  - TypeScript;
  - production build;
  - Diagnosis browser regression;
  - Compatibility browser regression;
  - Knowledge browser regression;
  - Procedure browser regression;
  - evidence artifact upload.

Same-head legacy safety check:

- Plant Roster Edit Fix / run `32345353485` — **PASS**:
  - plant contract;
  - TypeScript / production build;
  - plant quantity + edit browser regression;
  - existing Navigation Context regression.

## Procedure — DONE

Fail-before:

- run `32341637554` — expected FAIL only at Procedure.

Product migration:

- `49fd00385126fd4adef3d533ac87d302a3df9943` — first operational step moved into shared Result UX.

Closure checks:

- [x] first step is decision hero;
- [x] next steps capped at two;
- [x] immediate evidence indexes preserved;
- [x] observation exposed as watch guidance;
- [x] reminders exposed as bounded avoid guidance;
- [x] duplicate legacy first-three-step block removed;
- [x] completion/record CTA remains after operation;
- [x] detailed description remains collapsed;
- [x] permanent Procedure static assertions added;
- [x] temporary write-enabled migration workflow removed;
- [x] Result UX workflow restored to `contents: read`;
- [x] clean browser regression PASS.

## Species Detail — ACTIVE

Fail-before is now established before product UI changes:

- commit `a242a13e0c0183bfbbdb33828cb6a81a14f325f1` adds `verify-result-ux-species-detail.mjs` and the permanent Result UX gate step;
- Result UX V1 / run `32346056247` — **expected FAIL only at Species Detail**;
- static contract, TypeScript, production build, Diagnosis, Compatibility, Knowledge and Procedure all passed;
- failure was the expected absence of `[data-testid="species-detail-decision"]` in the old Species Detail implementation.

The new Species Detail browser contract is intentionally coupled to PUI-BC-052. After a shared decision surface exists, the same test must also prove:

- Aquarium-owned detail retains `data-species-detail-edit-tank-record`;
- Result UX evidence starts collapsed;
- decision surface begins in the initial desktop dialog viewport;
- closing the child detail reopens the exact originating livestock roster;
- focus returns to the `stock-1` profile opener;
- Aquarium workspace scroll returns within the existing 96px tolerance.

Product migration may proceed only without weakening these parent-context assertions.

## Existing closures retained

### Plant / navigation

- [x] Product save state is correct.
- [x] Reload false failure was evaluator fixture re-seeding, recorded as PUI-BC-053.
- [x] Plant quantity/edit browser path remains green.
- [x] Navigation Context regression remains green.

### Result UX evidence semantics

- [x] Care evidence remains action-scoped.
- [x] Candidate references stay fail-closed.
- [x] Compatibility Verified requires reviewed rule + reviewed reference.
- [x] Knowledge and Procedure retain original action evidence identity/indexes.

## Vercel deployment-frequency policy

- [x] `git.deploymentEnabled: false` in `vercel.json`.
- [x] Documentation commits do not automatically create Vercel deployments.
- [x] Test / workflow / intermediate code commits do not automatically create Vercel deployments.
- [x] GitHub Actions is the iterative validation layer.
- [x] Hosted Preview / Production are explicit milestone actions.

## Remaining Result UX consumers

- [ ] Species Detail — fail-before established; migration active
- [ ] Identification
- [ ] AI Assistant

Remaining sequence:

1. migrate Species Detail without breaking immediate-parent roster return, focus or scroll context;
2. lock Species Detail into static + browser regression after migration;
3. Identification — preserve uncertainty/confidence semantics;
4. AI Assistant — direct answer/action first without presenting model output as deterministic truth;
5. final integration / retarget-rebase gate after remaining consumers are complete.

## Current engineering debt / non-blockers

- large entry bundle remains;
- mixed dynamic/static Vite import warnings remain;
- npm audit dependency debt remains outside this Result UX slice;
- #105 still depends on #104 and must rerun combined gates after any retarget/rebase.

## Merge-readiness judgment

**Four Result UX consumers are verified; Species Detail has a clean fail-before; PR #105 remains Draft.**

Remaining blockers to this repair slice:

1. Species Detail migration is not yet verified;
2. Identification is not migrated;
3. AI Assistant is not migrated;
4. upstream #104 branch disposition / final integration gate remains pending.

## Next execution order

1. Run the guarded Species Detail product migration against the proven fail-before.
2. Require Result UX + PUI-BC-052 browser checks to pass together.
3. Restore the Result UX workflow to read-only verification and add permanent Species Detail static assertions.
4. Continue Identification and AI Assistant one at a time.
5. Do not merge or production-deploy yet.
