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

## Vercel preview-frequency optimization

### Root cause

The project was using Git-integrated Vercel Preview like a per-commit CI runner. Active `agent/*` branches generate many intermediate code, test, workflow and documentation pushes, so Vercel's free-plan build-admission limit was reached before a useful hosted Preview could be produced.

### Phase 1 — secondary filter only

- [x] commit `10aa2501163e976a74543e3dd3a8f00c10f9bbc4` added `ignoreCommand` and `scripts/vercel-ignore-build.sh`.
- [x] non-production allowed branches require `[vercel-preview]` in the triggering commit.
- [x] the script compares against `VERCEL_GIT_PREVIOUS_SHA` and checks deploy-relevant paths.
- [x] production fails open when comparison history is unavailable.

But:

- [x] live validation disproved `ignoreCommand` as the primary rate-limit solution;
- [x] documentation-only commit `ba559c3b446a12cba65b418dfed7cc35aa816267` still received Vercel `build-rate-limit` failure because admission happened before the ignored-build command could run.

### Phase 2 — trigger-level fix

- [x] commit `d86330eaabf888c0abd1618312ba8deb67dc4c4b` updated `vercel.json`;
- [x] `git.deploymentEnabled["agent/*"] = false`;
- [x] `git.deploymentEnabled["preview/*"] = true`;
- [x] `ignoreCommand` remains only as a second gate on explicitly allowed preview branches;
- [x] validation on `d86330ea...` returned **no Vercel status context**, unlike the immediately preceding rate-limited commit, proving that the active agent branch no longer created an automatic Vercel deployment attempt.

### New operating policy

- iterative development + browser contracts → GitHub Actions on `agent/*`;
- automatic Vercel deployment → disabled on `agent/*`;
- hosted visual checkpoint → deliberately use `preview/*`, with `[vercel-preview]` and deploy-relevant accumulated changes;
- production/main → remains enabled and does not require the preview marker.

No dedicated `preview/*` branch has been created yet.

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
- [x] `HANDOFF_LATEST.md` includes Procedure fail-before and the corrected Vercel trigger-level policy.
- [x] `PROGRESS_LATEST.md` includes the corrected Vercel deployment policy.

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
- Historical Vercel quota failures are infrastructure state, not application build failures.
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
4. Keep iterative commits on `agent/*` without Vercel Preview attempts.
5. Use a dedicated `preview/*` checkpoint only when hosted visual review is needed.
6. Leave Species Detail until its navigation-return regressions are explicitly included.
7. Keep PR #105 Draft; do not merge or production-deploy in this phase.

## Non-claims

- PR #105 is not merged.
- No production deploy is claimed.
- Procedure is not yet migrated.
- `ignoreCommand` alone is not claimed to solve Vercel build-rate admission.
- Browser evidence is deterministic PR evidence, not production telemetry.
