# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living continuation record for PR #62 mutation receipt, PR #63 fresh execution policy, PR #64 confirmation surface, and the confirmation-entrypoint layer. Draft/green CI is not main/production. No product PR is merged or Ready.

## Current safe chain

`read-only intervention → eligible confirmation entrypoint → confirmation facts → fresh canonical load → fresh source decision → fresh destination verdict → atomic relocation receipt → fresh canonical reload/recompute → confirmation outcome`

Current product boundary remains deliberate: the Care page still does **not** have a repository-backed executable relocation path.

## Stable foundations carried forward

- PR #62 returns mutation receipt only: `{ committed: true, replayed?: boolean }`; post-write canonical refresh is separate.
- PR #63 never trusts a cached UI verdict. It fresh-loads source/destination facts, rebuilds the source formal intervention, requires an exact whole-subject quantity, freshly re-evaluates the destination, and only allows `compatible_by_current_evidence` to reach mutation.
- PR #63 distinguishes `mutation_state_unknown` from `executed_post_state_unavailable`; both require reconciliation before another mutation attempt.
- PR #64 confirmation UI binds displayed source/destination IDs and quantity to the actual execution request and has no direct repository/API/Supabase dependency.
- PR #64 has no blind relocation retry state.
- Latest disposable #62 + #63 + #64 canonical audit is green and created no merge commit.

## Live progress — confirmation entrypoint

Branch: `agent/relocation-confirmation-entrypoint`, stacked on PR #64.

### Source-scope finding

The formal intervention model is canonical-species-level, while #62 mutation is source-record + source-batch-level. `TankDecisionContext.resolvedLivestock` may aggregate multiple factual records into one canonical species, so a formal card like `A ×5 leaves the tank` is not by itself sufficient to construct an atomic mutation request.

Entrypoint invariants now enforced:

1. formal intervention and exact formal option must still exist in the supplied result;
2. current `compatible_by_current_evidence` controls only whether confirmation is worth opening — it is not mutation authorization;
3. the formal subject must map to exactly one factual source record;
4. that record must have exactly one positive explicit batch;
5. resolved quantity, record quantity, batch quantity and formal option quantity must agree;
6. multi-record / multi-batch whole-subject cases stay unavailable and show an explicit limitation;
7. no arbitrary first-record / first-batch selection;
8. launch candidate contains no `operationId`, cached verdict, `isSafe`, `allowed`, or other execution authorization.

### Implemented

- `src/lib/relocationConfirmationEntrypoint.ts`: pure fail-closed entrypoint builder.
- `scripts/test-relocation-confirmation-entrypoint.ts`: exact eligible path plus multi-record, multi-batch, missing-batch, stale quantity, batch mismatch, non-compatible destination, invented destination and unresolved-source regressions.
- `InterventionComparisonPanel`: optional `sourceAquarium` + `onOpenRelocationConfirmation(candidate)`.
- only eligible target cards can expose `进入迁移确认`.
- compatible destination + non-executable source scope shows the deterministic reason instead of silently hiding the limitation.
- the panel remains repository/API/Supabase-free and only emits a launch candidate.
- `scripts/test-relocation-confirmation-entrypoint-ui.mjs` protects the mutation-free / no-cached-authorization boundary.
- permanent entrypoint workflow reuses PR #64's canonical confirmation verifier rather than duplicating it.

### CI history

#### Run `31961302689`

- source-scope regression: **passed**;
- new UI static contract false-failed because its regex misparsed valid optional-call syntax `onOpenRelocationConfirmation?.(...)`.
- classification: test-harness assertion error; no product gate was relaxed.

#### Run `31961390757`

- source-scope: **passed**;
- entrypoint UI static contract: **passed**;
- confirmation state: **passed**;
- workflow then failed with `MODULE_NOT_FOUND` because it guessed a non-existent inherited test filename.
- classification: CI configuration error; no dialog assertion had run.
- corrected to PR #64's canonical `scripts/verify-relocation-confirmation-surface.mjs`.

#### Effective full-chain run `31961532732`

All substantive gates passed:

- confirmation entrypoint source-scope regression ✅
- confirmation entrypoint UI static contract ✅
- PR #64 confirmation state ✅
- PR #64 confirmation surface verifier ✅
- PR #63 fresh execution policy ✅
- mutation-outcome uncertainty regression ✅
- Tank Decision Support ✅
- Relocation Destination Evaluator ✅
- Reviewed Severe-Risk regression ✅
- TypeScript ✅
- production build ✅

No business rule was loosened to obtain green.

## Architecture for this PR

`InterventionComparisonPanel → onOpenRelocationConfirmation(candidate)`

The candidate is a **confirmation launch candidate**, not a relocation command. This layer creates no operation ID and executes no repository mutation.

A later Care integration may create one operation identity for a confirmation attempt and inject PR #63 `executeFreshRelocation`; that repository-backed integration remains intentionally separate.

## Still intentionally blocked

- multi-record whole-subject relocation;
- multi-batch whole-subject relocation;
- unresolved source livestock;
- conditional / insufficient-data / not-recommended destinations;
- direct UI → repository mutation;
- stale destination card used as execution authorization;
- automatic keeper choice;
- blind retry after uncertain mutation outcome.

## Next safe step

1. open this layer as a Draft PR stacked on #64;
2. run a disposable canonical audit combining latest #62 mutation stack with the full entrypoint stack;
3. confirm no new merge conflicts beyond the already-known canonical/decision conflict set;
4. rerun receipt, fresh policy, uncertainty, confirmation, entrypoint, canonical hydration, repository adapter, TypeScript and build in the disposable tree;
5. only after that design a separate Care-page integration for operationId + injected `executeFreshRelocation`.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale verdict as authorization;
- no direct UI → repository relocation call in this PR;
- no arbitrary first-record / first-batch selection;
- no partial batch move described as whole-conflict resolution;
- no second display-only quantity source;
- no `conditional` override;
- no Draft/CI result described as production rollout.
