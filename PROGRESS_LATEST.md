# AquaGuide Progress — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)

## Current phase

The project is in **result-system convergence + regression closure**, not page-by-page cosmetic repair.

PR #105 remains **Draft / open / mergeable / not merged**. No production deployment is claimed.

## Result UX shared system

- [x] `DecisionResultSurface` provides one primary verdict/action, maximum two follow-up actions, bounded summary, guardrails, avoid list and progressive disclosure.
- [x] Care evidence status remains action-scoped; candidate references stay fail-closed.
- [x] Compatibility reviewed status still requires both reviewed deterministic rule and reviewed citation.
- [x] Static Result UX contract exists.
- [x] Permanent `.github/workflows/result-ux-v1.yml` browser gate exists.

## Migrated consumers

### Diagnosis — verified

- [x] Shared decision surface.
- [x] Primary action before causal explanation.
- [x] Bounded follow-up actions.
- [x] Watch / escalation boundaries retained.
- [x] Existing diagnosis context preserved.
- [x] Browser regression PASS.

### Compatibility — verified

- [x] Shared decision surface.
- [x] Verdict first.
- [x] Deterministic blocking / safety rules remain authoritative.
- [x] Candidate evidence remains fail-closed.
- [x] Browser regression PASS.

### Knowledge — verified

Fail-before first:

- Result UX V1 / run `32340512920` — **FAIL only at Knowledge**.
- Static contract, TypeScript, build, Diagnosis and Compatibility all passed.
- The old Knowledge page did not expose the shared `care-knowledge-decision` surface.

Migration:

- [x] Knowledge uses `DecisionResultSurface`.
- [x] Key takeaway / first action precedes long explanation.
- [x] Primary CTA remains on the first decision surface.
- [x] Shared follow-up actions capped at two.
- [x] Long detailed explanation is collapsed by default.
- [x] Knowledge Care evidence keeps the original `immediate` kind and action index.
- [x] One-off self-modifying migration/fix workflows were removed after use.
- [x] Browser regression PASS.

Authoritative three-consumer baseline:

- verified code head `ec55754dbbacf038d7b5e48d1a663f9e1a8cea18`;
- Result UX V1 / run `32341238477` — **PASS**:
  - Result UX contract;
  - TypeScript;
  - production build;
  - Diagnosis browser regression;
  - Compatibility browser regression;
  - Knowledge browser regression;
  - evidence artifact upload.

## Plant roster / legacy plant closure

- [x] Product save state proved correct immediately after edit.
- [x] Reload false failure traced to Playwright fixture re-seeding original localStorage.
- [x] Fixture now seeds once per browser context.
- [x] Structured + legacy plant edit/reload browser path PASS.
- [x] Disproven local-aquarium load-race automation removed.
- [x] Evaluator defect recorded as PUI-BC-053 in `BADCASE_LATEST.md`.

Authoritative plant evidence:

- Plant Roster Edit Fix / run `32338616480` — **PASS**.

## Upstream #104 contracts retained

The branch still inherits and must preserve:

- PUI-BC-050 Compatibility risk-review/navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → parent roster return;
- responsive/system/visual/golden contracts established in #104.

## Documentation / governance

- [x] `BADCASE_LATEST.md` includes evaluator PUI-BC-053.
- [x] PR #105 body matches Diagnosis + Compatibility + Knowledge implementation status.
- [x] `RESULT_UX_V1.md` matches the three-consumer verified boundary.
- [x] `PROGRESS_LATEST.md` matches active #105 state.
- [ ] `HANDOFF_LATEST.md` still needs the Knowledge verified baseline in this documentation pass.
- [ ] Do not append PUI-BC-053 to the canonical product badcase JSONL until evaluator-vs-product registry scope is explicitly checked.

## Remaining Result UX consumers

- [ ] Procedure
- [ ] Species Detail
- [ ] Identification
- [ ] AI Assistant

Rule: **one consumer at a time; fail-before contract first; product migration second; browser proof third.**

## Current engineering debt / non-blockers

- Large entry bundle remains; Result UX does not claim bundle-size reduction.
- Vite mixed dynamic/static import warnings remain.
- Existing npm audit debt remains outside this Result UX slice.
- Vercel free-plan preview quota can fail externally; do not classify that as an application build failure.
- Thin wrapper/Base structures inherited from #104 remain deliberate risk-containment debt.

## Merge-readiness judgment

**Diagnosis + Compatibility + Knowledge are verified, but PR #105 is still not declared merge-ready.**

Reasons to keep Draft:

1. #105 still depends on #104 as its base and final upstream branch disposition is unresolved.
2. Procedure / Species Detail / Identification / AI Assistant remain explicitly unmigrated.
3. Any retarget/rebase requires permanent gates to be rerun.
4. Species Detail migration must not regress the nested Aquarium roster return contract.

## Next execution order

1. Update `HANDOFF_LATEST.md` with the three-consumer verified baseline.
2. Inspect Procedure against the existing Knowledge/Care evidence and CTA model.
3. If Procedure can reuse the same hierarchy without changing domain truth logic, add its fail-before browser contract.
4. Migrate Procedure only after that fail-before is proven.
5. Leave Species Detail until its navigation-return regressions are explicitly included in the migration acceptance.
6. Keep PR #105 Draft; do not merge or production-deploy in this phase.

## Non-claims

- PR #105 is not merged.
- No production deploy is claimed.
- Three green consumer regressions do not imply every AquaGuide result surface follows Result UX V1.
- Browser evidence is deterministic PR evidence, not production telemetry.
