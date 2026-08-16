# AquaGuide Canonical + Decision Stack Integration Audit — 2026-08-16

> This document records a **read-only / no-commit integration audit**. It proves integration feasibility at the tested heads; it does not mean any PR was merged to main.

## 1. Why this audit was needed

Two independently validated Draft stacks now need to converge before Care/Aquarium page wiring is safe:

### Canonical reality stack

PR #38 head audited: `fef455a99865c64a5617f259eb601392914f74ee`

Provides:
- repository/API canonical aquarium facts;
- unresolved existing livestock persistence;
- `fishId='unresolved:<record-id>'` mirror contract;
- atomic livestock and water-change persistence;
- canonical care-event hydration.

### Decision / diagnosis stack

PR #52 head audited: `9aafa1de02ac5b8ff998780c900e35756c4046ee`

Provides the current chain:

`catalog grounding → replacement → conflict graph → intervention → actions → keeper choice → destination evaluation → tank decision context/orchestrator → read-only intervention UI → diagnosis conflict evidence → Quick Diagnosis augmentation → severe-risk regression`

Before this audit, each stack was green independently, but that did not prove they could coexist in one working tree.

## 2. Audit method

Dedicated branch:

`integration/canonical-decision-support-audit`

The permanent branch itself remains based on #38 and contains only audit tooling/templates. The GitHub Actions job has:

```text
permissions:
  contents: read
```

Inside a disposable runner it executes:

```text
git merge --no-commit --no-ff origin/agent/quick-diagnosis-conflict-augmentation
```

The workflow never commits or pushes the merged tree.

The final gate explicitly verifies:

- `.git/MERGE_HEAD` still exists;
- `git rev-parse HEAD` is unchanged from the pre-merge audit branch head.

Therefore the audit cannot silently create a branch merge.

## 3. Actual merge conflicts

The first dry-run found exactly two conflicts:

```text
.github/workflows/product-golden-path.yml
src/services/aquarium/water-change.service.ts
```

No conflict occurred in other suspected shared files such as:

- `package.json`;
- `src/lib/tankCompatibilityEngine.ts`.

Git merged those automatically.

The second audit run refuses to proceed if the observed conflict set differs from these two files.

## 4. Product Golden Path conflict

This is a CI orchestration conflict, not runtime product logic.

For the disposable merged-tree audit only:

- keep the canonical-stack Product Golden Path file;
- execute decision/diagnosis gates explicitly as audit steps.

A future real integration should create a **union Product Golden Path**, not permanently choose one side.

The union should retain canonical repository/phase-0 gates and add the decision-stack gates that matter after convergence.

## 5. Water-change runtime conflict

This was the only runtime code conflict.

### Canonical stack behavior that must remain

- `WaterChangeEventLike` canonical event contract;
- `getWaterChangeHistoryFromEvents()`;
- `setWaterChangeDateRecorded()`;
- `hydrateAquariumWaterChangeHistory()`;
- latest canonical date mirrored to aquarium/livestock summaries.

### Decision/catalog stack behavior that must remain

- invalid date keys do not enter history;
- future dates do not enter history;
- deterministic injectable `now` for date tests;
- history normalization/deduplication before latest-date calculation.

### Audited semantic union

The integration-only template combines both:

```text
canonical care-event-derived history
+ invalid/future-date normalization
+ set/toggle/latest helpers using the same normalizer
+ event hydration using the normalized apply boundary
```

The template is stored only for audit/reference:

`.integration-audit/water-change.service.resolved.ts`

It is not currently committed into #38, #52, or main.

## 6. Merged-tree validation result

After resolving only the two audited conflicts inside the runner, the same temporary merged tree passed all of the following:

### Canonical / repository

- `scripts/test-water-change-repository-boundary.ts` ✅
- `scripts/test-water-change-history.ts` ✅
- `scripts/test-unresolved-existing-livestock.ts` ✅
- `scripts/test-livestock-recording.ts` ✅

### Decision / diagnosis

- `scripts/test-tank-decision-context.ts` ✅
- `scripts/test-tank-decision-support-orchestrator.ts` ✅
- `scripts/test-quick-diagnosis-conflict-augmentation.ts` ✅
- `scripts/test-reviewed-severe-risk-regression.ts` ✅

### Whole-tree

- TypeScript / `npm run lint` ✅
- production build / `npm run build` ✅

### No-persistence proof

- audit branch HEAD unchanged ✅
- merge remained uncommitted in runner ✅
- no merge push step exists ✅

## 7. What this proves

At the audited heads:

1. canonical/unresolved data contracts and decision/diagnosis contracts can coexist;
2. unresolved cloud mirror shape remains consumable by the strict Tank Decision Context;
3. the current behavior/intervention/diagnosis chain does not break #38 livestock persistence tests;
4. #38 canonical water-change semantics can coexist with future-date normalization;
5. whole-tree TypeScript and production build are compatible after the audited conflict resolution.

## 8. What this does NOT prove

It does not mean:

- #38 or #52 is merged;
- main contains the new decision chain;
- Product Golden Path has already been permanently unified;
- Care/Aquarium pages already consume Tank Decision Support;
- #35 Auth real-device rollout is complete;
- #38 unresolved cloud/browser rollout is complete;
- behavior evidence coverage is catalog-wide.

## 9. Formal convergence recipe — requires explicit merge authorization

When a real integration branch is intentionally created, use this order:

1. start from the current canonical/repository baseline (#38 lineage);
2. integrate the current decision/diagnosis lineage (#52 or its successor);
3. resolve `water-change.service.ts` using the audited semantic union rather than choosing ours/theirs;
4. create a union Product Golden Path preserving both canonical and decision gates;
5. run the same merged-tree regression set from this audit;
6. additionally run the permanent Product Golden Path and unresolved browser contracts;
7. keep the integration branch separate from main until review;
8. only after convergence, wire Care/Aquarium pages to repository-hydrated `TankDecisionSupportResult`;
9. keep Intervention Comparison read-only until a separate mutation design is reviewed.

## 10. Next non-merge priority

Because stack compatibility is now proven, the largest remaining correctness gap is no longer architecture wiring. It is **reviewed behavior evidence coverage**.

Current reviewed severe regression only contains the severe fixtures supported by the existing reviewed evidence set. Expand the evidence set first; expand the severe-risk suite only when that evidence is genuinely reviewed.
