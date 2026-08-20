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

## Vercel deployment-frequency policy — VERIFIED FIX

### Problem

Git-integrated Vercel Preview was being requested for nearly every push on active `agent/*` development branches. This branch intentionally contains many test, workflow, handoff, badcase and intermediate repair commits, so free-plan build-rate limits were hit even when the application itself built successfully in GitHub Actions.

### Disproved first attempt

Commit `10aa2501163e976a74543e3dd3a8f00c10f9bbc4` added an `ignoreCommand` with a `[vercel-preview]` checkpoint marker and deploy-relevant diff filtering.

That layer is useful **after a Vercel deployment has already been admitted**, but it is too late to solve Vercel's build-rate admission limit. A later documentation-only commit (`ba559c3b446a12cba65b418dfed7cc35aa816267`) still received a Vercel `build-rate-limit` failure before the ignored-build command could protect it.

Therefore `ignoreCommand` must not be treated as the primary frequency control.

### Final trigger-level fix

Commit:

- `d86330eaabf888c0abd1618312ba8deb67dc4c4b` — `Disable Vercel auto deploys on agent branches`

`vercel.json` now contains:

- `git.deploymentEnabled["agent/*"] = false`;
- `git.deploymentEnabled["preview/*"] = true`;
- the existing `ignoreCommand` remains as a secondary filter for explicitly allowed preview branches.

This moves the decision to the **Git deployment trigger layer**, before a Preview build is created or placed into Vercel's build queue.

Validation on `d86330ea...`:

- GitHub returned **no Vercel status context** for the commit;
- the immediately preceding doc-only commit still showed a Vercel build-rate-limit failure;
- therefore the active `agent/result-ux-v1` branch is no longer creating automatic Vercel Preview attempts on every push.

### Operating model going forward

**Development / CI**

- keep working on `agent/*` branches;
- GitHub Actions remains the iterative validation system;
- no automatic Vercel Preview is created from these branches.

**Hosted Preview checkpoint**

- use a deliberately created `preview/*` branch only when a hosted visual checkpoint is actually needed;
- the secondary `ignoreCommand` requires `[vercel-preview]` in the triggering commit and confirms deploy-relevant changes exist since Vercel's last successful deployment;
- no dedicated preview branch has been created in this handoff.

**Production**

- production/main remains outside the `agent/*` disable rule;
- production does not require `[vercel-preview]`;
- the secondary ignore script fails open if comparison history is unavailable rather than suppressing an intentional production release.

### Why this is safer

Vercel is no longer being used as a per-commit CI runner. Intermediate code and documentation changes are validated by GitHub Actions, and hosted Preview capacity is reserved for deliberate visual checkpoints.

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
- Historical Vercel quota failures are infrastructure state, not application build failures.
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
4. Keep iterative commits on `agent/*`; do not expect or require Vercel Preview there.
5. Create/use a `preview/*` checkpoint only when a hosted visual review is needed.
6. Keep #105 Draft; do not merge or production-deploy from this handoff alone.

## Confidence snapshot

- Result UX shared contract: **verified**
- Diagnosis migration: **verified**
- Compatibility migration: **verified**
- Knowledge migration: **verified**
- Procedure fail-before: **verified**
- Procedure migration: **pending**
- Vercel `agent/*` trigger-level deployment suppression: **verified**
- Vercel `ignoreCommand`: **secondary filter only**
- Plant structured + legacy edit persistence: **verified**
- Species Detail migration: **not started**
- Identification migration: **not started**
- AI Assistant migration: **not started**
- #105 merge readiness: **not yet declared**
