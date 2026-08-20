# AquaGuide Canonical + Decision Stack Integration Audit — 2026-08-16

> This document records a **read-only / no-commit integration audit**. It proves integration feasibility at the tested heads; it does not mean any PR was merged to main.

## 1. Current audited heads

### Canonical reality stack

PR #38 head audited:

`fef455a99865c64a5617f259eb601392914f74ee`

Provides:
- repository/API canonical aquarium facts;
- unresolved existing livestock persistence;
- `fishId='unresolved:<record-id>'` mirror contract;
- atomic livestock and water-change persistence;
- canonical care-event hydration.

### Decision / diagnosis / evidence stack

Latest audited source is PR #53 head:

`6f0da7b8e3d211a72a845b7f6ddd36783fdb06f8`

This supersedes the earlier #52 audit source and includes:

`catalog grounding → replacement → conflict graph → intervention → actions → keeper choice → destination evaluation → tank decision context/orchestrator → read-only intervention UI → diagnosis conflict evidence → Quick Diagnosis augmentation → reviewed severe-risk regression → contextual behavior evidence`

The evidence layer now also includes:
- deterministic reviewed Oscar / `Astronotus ocellatus` predation evidence;
- contextual-only reviewed Betta splendens aggression/territory evidence;
- contextual-only reviewed Pterophyllum scalare breeding/territory evidence;
- severe-risk fixture expansion from 3 to 4 reviewed severe cases.

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
git merge --no-commit --no-ff origin/agent/compatibility-evidence-contextual-expansion
```

The workflow never commits or pushes the merged tree.

The final gate explicitly verifies:

- `.git/MERGE_HEAD` still exists;
- `git rev-parse HEAD` is unchanged from the pre-merge audit branch head.

Therefore the audit cannot silently create a branch merge.

## 3. Actual merge conflicts

Both the earlier #52 audit and the latest #53 audit found exactly two conflicts:

```text
.github/workflows/product-golden-path.yml
src/services/aquarium/water-change.service.ts
```

No conflict occurred in other suspected shared files such as:

- `package.json`;
- `src/lib/tankCompatibilityEngine.ts`.

Git merged those automatically.

The current audit workflow refuses to proceed if the observed conflict set differs from these two files.

## 4. Product Golden Path conflict

This is a CI orchestration conflict, not runtime product logic.

For the disposable merged-tree audit only:

- keep the canonical-stack Product Golden Path file;
- execute decision/diagnosis/evidence gates explicitly as audit steps.

A future real integration should create a **union Product Golden Path**, not permanently choose one side.

The union should retain canonical repository/phase-0 gates and add the decision/evidence gates that matter after convergence.

## 5. Water-change runtime conflict

This remains the only runtime code conflict.

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

It is not currently committed into #38, #53, or main.

## 6. Latest merged-tree validation result

Latest successful audit run:

`31947796452`

After resolving only the two audited conflicts inside the disposable runner, the same temporary merged tree passed:

### Canonical / repository

- `scripts/test-water-change-repository-boundary.ts` ✅
- `scripts/test-water-change-history.ts` ✅
- `scripts/test-unresolved-existing-livestock.ts` ✅
- `scripts/test-livestock-recording.ts` ✅

### Decision / diagnosis / evidence

- `scripts/test-tank-decision-context.ts` ✅
- `scripts/test-tank-decision-support-orchestrator.ts` ✅
- `scripts/test-quick-diagnosis-conflict-augmentation.ts` ✅
- `scripts/test-contextual-compatibility-evidence.ts` ✅
- `scripts/test-reviewed-severe-risk-regression.ts` ✅

The reviewed severe-risk suite now contains **4** currently reviewed severe fixtures and still reports **0 cross-layer severe false negatives** for that reviewed set.

### Whole-tree

- TypeScript / `npm run lint` ✅
- production build / `npm run build` ✅

### No-persistence proof

- audit branch HEAD unchanged ✅
- merge remained uncommitted in runner ✅
- no merge push step exists ✅

## 7. What this proves

At the latest audited heads:

1. canonical/unresolved data contracts and the latest decision/diagnosis/evidence contracts can coexist;
2. unresolved cloud mirror shape remains consumable by the strict Tank Decision Context;
3. behavior/intervention/diagnosis/evidence changes do not break #38 livestock persistence tests;
4. #38 canonical water-change semantics can coexist with future-date normalization;
5. contextual Betta/angelfish evidence can remain non-escalating in the same merged tree;
6. new Oscar predation evidence propagates through the severe-risk regression without introducing new stack conflicts;
7. whole-tree TypeScript and production build are compatible after the audited conflict resolution.

## 8. What this does NOT prove

It does not mean:

- #38 or #53 is merged;
- main contains the new decision chain;
- Product Golden Path has already been permanently unified;
- Care/Aquarium pages already consume Tank Decision Support;
- #35 Auth real-device rollout is complete;
- #38 unresolved cloud/browser rollout is complete;
- behavior evidence coverage is catalog-wide;
- the 4 reviewed severe fixtures constitute a global compatibility-accuracy benchmark.

## 9. Formal convergence recipe — requires explicit merge authorization

When a real integration branch is intentionally created, use this order:

1. start from the current canonical/repository baseline (#38 lineage);
2. integrate the current decision/diagnosis/evidence lineage (#53 or its successor);
3. resolve `water-change.service.ts` using the audited semantic union rather than choosing ours/theirs;
4. create a union Product Golden Path preserving both canonical and decision/evidence gates;
5. run the same merged-tree regression set from this audit;
6. additionally run the permanent Product Golden Path and unresolved browser contracts;
7. keep the integration branch separate from main until review;
8. only after convergence, wire Care/Aquarium pages to repository-hydrated `TankDecisionSupportResult`;
9. keep Intervention Comparison read-only until a separate mutation design is reviewed.

## 10. Next non-merge priority

The largest remaining correctness gap is **reviewed behavior evidence coverage**, not another decision layer.

PR #55 adds a research-only evidence priority audit. Its catalog signals are allowed to prioritize manual research only; they must never become runtime blockers or recommendations by themselves.

The evidence workflow should remain:

```text
catalog signal → research priority only
→ primary/authoritative evidence review
→ deterministic vs contextual evidence classification
→ regression expansion only when evidence is genuinely reviewed
```
