# AquaGuide Progress — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)

## Current phase

The project is in **result-system convergence + regression closure**.

PR #105 remains **Draft / open / not merged**. No production deployment is claimed.

## Result UX shared system

- [x] `DecisionResultSurface` provides one primary verdict/action, maximum two follow-up actions, bounded summary, guardrails, avoid list and progressive disclosure.
- [x] Care evidence status remains action-scoped; candidate references stay fail-closed.
- [x] Compatibility reviewed status still requires reviewed deterministic rule + reviewed citation.
- [x] Static Result UX contract exists.
- [x] Permanent `.github/workflows/result-ux-v1.yml` browser gate exists.

## Migrated consumers

### Diagnosis — verified

- [x] Shared decision surface.
- [x] Primary action before causal explanation.
- [x] Bounded follow-up actions.
- [x] Watch / escalation boundaries retained.
- [x] Browser regression PASS.

### Compatibility — verified

- [x] Shared decision surface.
- [x] Verdict first.
- [x] Deterministic blocking / safety remains authoritative.
- [x] Candidate evidence remains fail-closed.
- [x] Browser regression PASS.

### Knowledge — verified

- [x] Fail-before proven by run `32340512920`.
- [x] Shared `DecisionResultSurface`.
- [x] Key takeaway / first action precedes long explanation.
- [x] Primary CTA remains first-screen.
- [x] Shared follow-up actions capped at two.
- [x] Long detailed explanation collapsed by default.
- [x] Care evidence retains original `immediate` kind + action index.
- [x] Browser regression PASS.

Authoritative three-consumer baseline:

- code head `ec55754dbbacf038d7b5e48d1a663f9e1a8cea18`;
- Result UX V1 / run `32341238477` — **PASS**.

## Procedure — active

- [x] Added Procedure browser contract before product migration.
- [x] Added Procedure step to permanent Result UX workflow.
- [x] Fail-before proven by Result UX V1 / run `32341637554`.
- [x] In that run, contract / TypeScript / build / Diagnosis / Compatibility / Knowledge all passed.
- [x] Procedure alone failed because the old implementation has no `care-procedure-decision` shared surface.
- [ ] Migrate first procedure step into Result UX hierarchy.
- [ ] Preserve completion CTA semantics; do not move `去记录本次换水` / completion actions ahead of the procedure itself.
- [ ] Rerun four-consumer browser gate after migration.

## Vercel preview frequency optimization

Problem: Git integration was attempting a Preview on nearly every push, including docs, workflows, tests and intermediate repair commits. This caused free-plan build-rate-limit failures unrelated to application build correctness.

Implemented:

- [x] commit `10aa2501163e976a74543e3dd3a8f00c10f9bbc4` — `Throttle Vercel preview deployments`;
- [x] `vercel.json` now calls `bash scripts/vercel-ignore-build.sh` through `ignoreCommand`;
- [x] non-production Preview branches require explicit `[vercel-preview]` in the triggering commit message;
- [x] gate compares against `VERCEL_GIT_PREVIOUS_SHA` so accumulated deployable changes since the last successful deployment are not lost;
- [x] docs / handoff / badcase / workflows / evaluation / browser-test-only changes are skipped by default;
- [x] deploy-relevant paths include runtime code, public assets, API/workspaces, package manifests/locks and build/deploy config;
- [x] production/main does not require `[vercel-preview]` and fails open if comparison history is unavailable.

Operating policy:

- iterative validation → GitHub Actions;
- hosted Preview → only at a browser-green milestone using `[vercel-preview]`;
- production → normal production rule, independent of the preview marker.

The policy commit itself had no preview marker and its GitHub Vercel status returned success rather than the prior build-rate-limit failure state.

## Plant roster / legacy plant closure

- [x] Product save state proved correct immediately after edit.
- [x] Reload false failure traced to Playwright fixture re-seeding original localStorage.
- [x] Fixture now seeds once per browser context.
- [x] Structured + legacy plant edit/reload browser path PASS.
- [x] Evaluator defect recorded as PUI-BC-053 in `BADCASE_LATEST.md`.

Plant evidence: run `32338616480` — **PASS**.

## Upstream #104 contracts retained

Must preserve:

- PUI-BC-050 Compatibility risk-review/navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → parent roster return;
- responsive/system/visual/golden contracts established in #104.

## Documentation / governance

- [x] `BADCASE_LATEST.md` includes evaluator PUI-BC-053.
- [x] PR #105 body matches the three verified consumers.
- [x] `RESULT_UX_V1.md` matches the three-consumer verified boundary.
- [x] `HANDOFF_LATEST.md` includes Knowledge, Procedure fail-before and Vercel preview policy.
- [x] `PROGRESS_LATEST.md` includes Vercel deployment throttling.

## Remaining Result UX consumers

- [ ] Procedure — migration pending; fail-before complete.
- [ ] Species Detail.
- [ ] Identification.
- [ ] AI Assistant.

Rule: **one consumer at a time; fail-before first; product migration second; browser proof third.**

## Current engineering debt / non-blockers

- Large entry bundle remains.
- Vite mixed dynamic/static import warnings remain.
- Existing npm audit debt remains outside this Result UX slice.
- Vercel quota failures are infrastructure state, not application build failures.
- Thin wrapper/Base structures inherited from #104 remain deliberate risk-containment debt.

## Merge-readiness judgment

**Diagnosis + Compatibility + Knowledge are verified, but PR #105 remains Draft.**

Reasons:

1. #105 still depends on #104 as its base.
2. Procedure migration is incomplete.
3. Species Detail / Identification / AI Assistant remain unmigrated.
4. Any retarget/rebase requires permanent gates to rerun.

## Next execution order

1. Migrate Procedure from the already-proven fail-before state.
2. Keep post-task completion controls after the actual Procedure steps.
3. Run the four-consumer Result UX gate.
4. Create a Vercel hosted Preview only when a milestone is green, using `[vercel-preview]`.
5. Leave Species Detail until its navigation-return regressions are explicitly included.
6. Keep PR #105 Draft; do not merge or production-deploy in this phase.

## Non-claims

- PR #105 is not merged.
- No production deploy is claimed.
- Procedure is not yet migrated.
- Green GitHub browser evidence is deterministic PR evidence, not production telemetry.
