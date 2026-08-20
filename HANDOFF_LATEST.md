# AquaGuide Handoff — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)  
**Latest browser-verified Result UX code baseline:** `ec55754dbbacf038d7b5e48d1a663f9e1a8cea18`

## Current state

PR #105 is **open, mergeable and Draft**. It is **not merged** and no production deployment is claimed.

Browser-verified Result UX consumers:

1. Diagnosis;
2. Compatibility;
3. Knowledge.

Procedure now has a valid fail-before browser contract but is **not yet migrated**.

## Result UX verified baseline

Permanent workflow: `.github/workflows/result-ux-v1.yml`.

Result UX V1 / run `32341238477` — **PASS** on `ec55754dbbacf038d7b5e48d1a663f9e1a8cea18`:

- static Result UX contract — PASS;
- TypeScript — PASS;
- production build — PASS;
- Diagnosis browser regression — PASS;
- Compatibility browser regression — PASS;
- Knowledge browser regression — PASS.

Evidence remains fail-closed and action-scoped. A publisher/source name alone never upgrades a recommendation to Verified.

## Consumer status

### Diagnosis — verified

- shared `DecisionResultSurface`;
- primary action before causal explanation;
- bounded follow-up actions;
- watch / escalation boundaries retained.

### Compatibility — verified

- shared `DecisionResultSurface`;
- verdict first;
- deterministic blocking remains authoritative;
- AI presentation cannot override deterministic safety rules;
- candidate evidence remains fail-closed.

### Knowledge — verified

Fail-before:

- run `32340512920` failed only at Knowledge because the old page had no `care-knowledge-decision` surface.

Current behavior:

- shared decision surface;
- key takeaway / first action precedes long explanation;
- primary CTA remains first-screen;
- shared follow-up actions capped at two;
- long detailed explanation collapsed by default;
- Care evidence keeps the original `immediate` kind + action index.

### Procedure — fail-before established, migration pending

Procedure contract was added before changing the product UI.

Result UX V1 / run `32341637554`:

- Result UX contract — PASS;
- TypeScript — PASS;
- production build — PASS;
- Diagnosis — PASS;
- Compatibility — PASS;
- Knowledge — PASS;
- **Procedure — expected FAIL** because the old Procedure implementation does not yet expose `care-procedure-decision`.

Migration rule: the first procedure step can move into the shared decision surface, but completion actions such as `去记录本次换水` / `Mark operation done` must remain post-task actions and must not be promoted ahead of the actual procedure.

## Vercel preview deployment policy — NEW

Problem: Git-integrated Vercel Preview was starting on nearly every push. The branch contains many test, workflow, handoff, badcase and intermediate repair commits, so Vercel's free-plan build-rate limit could be exhausted even when the application build itself was healthy.

Fix landed in commit:

- `10aa2501163e976a74543e3dd3a8f00c10f9bbc4` — `Throttle Vercel preview deployments`

Configuration:

- `vercel.json` now uses `ignoreCommand: "bash scripts/vercel-ignore-build.sh"`;
- `scripts/vercel-ignore-build.sh` is the source of truth for the gate.

### Preview rule

For non-production branches, **a normal push does not create a Vercel Preview**.

A Preview is eligible only when the triggering commit message contains:

`[vercel-preview]`

Even then, the script compares the current commit against `VERCEL_GIT_PREVIOUS_SHA` (Vercel's last successful deployment SHA). It continues the build only if deploy-relevant inputs changed.

Deploy-relevant inputs include:

- `src/`, `public/`, `api/`, `apps/`, `packages/`;
- `index.html`;
- package manifests / lockfiles;
- Vite / TypeScript / PostCSS / Tailwind build config;
- `vercel.json`.

The following can continue to push and run GitHub CI without consuming a Preview build by default:

- handoff / progress / badcase docs;
- `.github/workflows/**`;
- evaluation artifacts;
- browser-test scripts and other non-runtime scripts.

### Production rule

Production/main does **not** require `[vercel-preview]`. If deploy-relevant files changed, production remains fail-open and deploys normally. If the comparison SHA is unavailable for an explicit checkpoint or production, the script also fails open rather than suppressing a required release.

### Operating rule going forward

Do not use Vercel Preview as a per-commit CI runner.

Use GitHub Actions for iterative validation. Add `[vercel-preview]` only to a **browser-green milestone/checkpoint commit** when a human-visible hosted Preview is actually needed.

The first commit carrying this policy had no `[vercel-preview]` marker and its GitHub Vercel status returned success instead of the prior build-rate-limit failure state.

## Plant roster / legacy plant closure retained

The prior `1株 → edit → 2株 → reload` failure was an evaluator-fixture defect, not a product persistence defect. The Playwright fixture had re-seeded original localStorage on reload.

- Plant Roster Edit Fix / run `32338616480` — PASS.
- Evaluator defect is recorded as PUI-BC-053 in `BADCASE_LATEST.md`.

Do not reopen the disproven local-aquarium load-race hypothesis without new independent product evidence.

## Upstream #104 relationship

#105 still targets `agent/uiux-system-refactor-v1` (#104).

Inherited contracts that must remain intact include:

- PUI-BC-050 Compatibility risk-review/navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → immediate-parent roster return.

Any future Species Detail Result UX migration must preserve PUI-BC-052.

## Remaining Result UX boundary

- Procedure — fail-before established, product migration pending;
- Species Detail — not started;
- Identification — not started;
- AI Assistant — not started.

Continuation rule:

**one consumer → fail-before contract → product migration → browser proof → documentation update.**

## Current engineering debt / non-blockers

- Vite large-chunk and mixed dynamic/static-import warnings remain.
- Existing npm dependency vulnerability debt remains outside Result UX scope.
- Vercel quota failures must not be classified as application build failures.
- Thin wrapper/Base structures inherited from #104 remain deliberate risk-containment debt.

## Merge-readiness judgment

**Diagnosis + Compatibility + Knowledge are verified, but PR #105 remains Draft and is not declared merge-ready.**

Reasons:

1. #105 still depends on #104 and final upstream branch disposition is unresolved;
2. Procedure migration is not complete;
3. Species Detail / Identification / AI Assistant remain unmigrated;
4. any retarget/rebase requires permanent gates to rerun.

## Next owner action

1. Continue Procedure from the proven fail-before state; do not recreate that investigation.
2. Preserve post-task Procedure CTA semantics while migrating the first-step hierarchy.
3. Run the permanent Result UX gate after the product migration.
4. Request a hosted Vercel Preview only at a green checkpoint by using `[vercel-preview]` on that checkpoint commit.
5. Keep #105 Draft; do not merge or production-deploy from this handoff alone.

## Confidence snapshot

- Result UX shared contract: **verified**
- Diagnosis migration: **verified**
- Compatibility migration: **verified**
- Knowledge migration: **verified**
- Procedure fail-before: **verified**
- Procedure migration: **pending**
- Vercel preview frequency gate: **implemented**
- Plant structured + legacy edit persistence: **verified**
- Species Detail migration: **not started**
- Identification migration: **not started**
- AI Assistant migration: **not started**
- #105 merge readiness: **not yet declared**
