# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Living regression record for the relocation path. Existing REL-023…REL-033 remain active; new entrypoint badcases are appended below.

## Existing protected badcases

- REL-023 — RPC commits but post-write read fails: return mutation receipt; do not disguise committed write as mutation failure.
- REL-024 — mutation transport rejects after write boundary: `mutation_state_unknown`, preserve operation ID, reconcile first.
- REL-025 — display-only quantity differs from request quantity: display actual request quantity only.
- REL-026 — confirmation component imports repository/API/Supabase directly: prohibited by static contract.
- REL-027 — fresh policy blocks but UI reports success: blocked is a distinct terminal outcome.
- REL-028 — uncertain outcome exposes retry relocation: reconciliation only, no blind retry.
- REL-029 — completed confirmation can fire again: completed is terminal.
- REL-030 — blocked result retries stale proposal: return to newly evaluated proposal instead.
- REL-031 — labels and submitted IDs belong to different requests: IDs are request-bound; names are labels only.
- REL-032 — unexpected thrown callback error assumed definitely pre-write: treat conservatively as reconciliation-required.
- REL-033 — isolated confirmation passes but canonical mutation stack drifts: disposable canonical integration audit required.

## REL-034 — Formal species option aggregates multiple source records, opener picks the first record

**Risk:** whole-species counterfactual is incorrectly collapsed onto one factual record.

**Fix:** direct confirmation requires `sourceRecordIds.length === 1`.

**Regression:** green in effective full-chain run `31961532732`.

## REL-035 — Formal whole-subject quantity spans multiple batches, opener picks the first batch

**Risk:** partial move is presented as whole formal intervention.

**Fix:** direct confirmation requires exactly one positive source batch; multi-batch cards expose an explicit unavailable reason.

**Regression:** green in run `31961532732`.

## REL-036 — Destination card status is copied into candidate as execution authorization

**Risk:** stale rendered destination status becomes permission to mutate.

**Fix:** current `compatible_by_current_evidence` controls opener visibility only. Candidate contains identifiers/facts/quantity, no `operationId`, cached verdict, `isSafe`, `allowed`, or expected compatibility. PR #63 remains the only pre-mutation fresh gate.

**Regression/static contract:** green in run `31961532732`.

## REL-037 — Record quantity, batch quantity and formal option quantity disagree

**Risk:** confirmation scope is not a truthful representation of factual storage.

**Fix:** resolved quantity, record quantity, batch quantity and formal option quantity must agree for the direct path.

**Regression:** green in run `31961532732`.

## REL-038 — Source record has no explicit batches but opener fabricates a batch identity

**Risk:** mutation targets an invented/non-canonical batch.

**Fix:** no explicit positive batch = `source_batch_missing`; no direct confirmation.

**Regression:** green in run `31961532732`.

## REL-039 — Multiple positive batches exist but one matching batch is accepted despite contradictory storage

**Risk:** undisclosed livestock remains after a supposedly whole-subject move.

**Fix:** exactly one positive batch is mandatory before quantity matching.

**Regression:** green in run `31961532732`.

## TEST-001 — Static UI contract mis-parses optional callback syntax

**Observed:** regex expected `onOpenRelocationConfirmation?(candidate)` instead of valid optional-call syntax `onOpenRelocationConfirmation?.(candidate)`.

**Classification:** test-harness false failure.

**Fix:** regex corrected; product gate unchanged.

## TEST-002 — Entrypoint workflow references a non-existent inherited confirmation test

**Observed:** `MODULE_NOT_FOUND: scripts/test-relocation-confirmation-ui-contract.mjs` after entrypoint source/UI and confirmation-state gates had already passed.

**Classification:** CI configuration failure; no confirmation-dialog assertion ran.

**Fix:** downstream workflow now reuses PR #64's canonical `scripts/verify-relocation-confirmation-surface.mjs`.

**Verification:** canonical confirmation verifier passed in run `31961532732`.

## Entry-point exit gate — GREEN on branch

Effective full-chain run `31961532732` passed:

- exact single-record + single-batch eligible path;
- multiple source records fail closed;
- multiple positive batches fail closed;
- no explicit batch fails closed;
- record/batch/formal quantity mismatch fails closed;
- unresolved source disables formal entry;
- invented destination fails closed;
- non-compatible destination fails closed;
- candidate contains no cached authorization;
- panel imports no repository/API/Supabase code;
- click path only emits confirmation candidate;
- PR #64 confirmation state/surface contracts;
- PR #63 fresh policy + mutation uncertainty;
- Tank Decision Support + Destination Evaluator + severe-risk;
- TypeScript;
- production build.

This only clears the **entrypoint layer**. It does not clear Care-page repository wiring or production rollout. A disposable canonical integration audit is still required before the next layer.
