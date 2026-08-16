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

**Failure:** `TankDecisionContext` resolves two factual records to the same canonical species and produces one formal option such as `A ×5`; UI constructs a request with the first source record.

**Risk:** user sees a whole-species counterfactual, but mutation targets only one factual record and can leave the blocker intact.

**Required:** direct confirmation only when the formal subject maps to exactly one factual source record.

**Current fix:** `buildRelocationConfirmationEntrypoint()` requires `sourceRecordIds.length === 1`; multi-record regression passed in CI run `31961302689`.

## REL-035 — Formal whole-subject quantity spans multiple batches, opener picks the first batch

**Failure:** one source record has total 5 stored as batch A=3 + batch B=2; UI submits the first batch.

**Risk:** a partial move is presented as the whole formal intervention.

**Required:** never use `batches[0]`; direct confirmation requires exactly one positive source batch representing the entire formal option.

**Current fix:** entrypoint requires exactly one positive batch and panel explicitly explains the multi-batch limitation. Regression passed in CI run `31961302689`.

## REL-036 — Destination card status is copied into candidate as execution authorization

**Failure:** entrypoint emits `{ isSafe: true }`, `{ allowed: true }`, cached verdict, or expected compatibility and a later layer treats it as permission to mutate.

**Risk:** destination can change between render and actual execution.

**Required:** current `compatible_by_current_evidence` may only decide whether an opener is displayed. Launch candidate contains identifiers/facts, not authorization. PR #63 re-evaluates again before mutation.

**Current fix:** candidate has no `operationId`, safety boolean or cached verdict. Pure entrypoint regression checks serialized candidate. UI static contract also guards this boundary.

## REL-037 — Record quantity, batch quantity and formal option quantity disagree

**Failure:** factual record, selected batch and formal option disagree but opener still proceeds.

**Required:** fail closed unless factual record quantity and selected batch quantity both equal the formal whole-subject quantity.

**Current fix:** separate record-quantity and batch-quantity guards; both regressions passed in CI run `31961302689`.

## REL-038 — Source record has no explicit batches but opener fabricates a batch identity

**Failure:** legacy factual record has quantity but no `batches`; UI invents a batch identity.

**Required:** no explicit factual batch = no direct confirmation entry under #62 v1.

**Current fix:** `source_batch_missing`; regression passed in CI run `31961302689`.

## REL-039 — Multiple positive batches exist but one matching batch is accepted despite contradictory storage

**Failure:** eligibility searches only for a matching batch and ignores additional positive batches.

**Required:** exactly one positive source batch, not merely one matching batch.

**Current fix:** `positiveBatches.length === 1` is mandatory before quantity matching; regression passed in CI run `31961302689`.

## TEST-001 — Static UI contract mis-parses optional callback syntax

**Observed in first entrypoint CI run:** source-scope regression passed, UI static contract failed because the regex expected:

`onOpenRelocationConfirmation?(candidate)`

while valid TypeScript/JavaScript optional-call syntax is:

`onOpenRelocationConfirmation?.(candidate)`

**Classification:** test-harness false failure, not product-policy failure.

**Fix:** static regex corrected to `?.(`. No product gate was relaxed.

## Entry-point exit gate

Before this layer can be described as safe:

- exact single-record + single-batch eligible case passes;
- multiple source records fail closed;
- multiple positive batches fail closed;
- no explicit batch fails closed;
- quantity mismatch fails closed;
- unresolved/non-grounded subject fails closed;
- only current `compatible_by_current_evidence` destination cards expose the opener;
- conditional / insufficient-data / not-recommended cards never expose it;
- opener payload contains no cached authorization boolean/verdict;
- `InterventionComparisonPanel` imports no repository/API/Supabase code;
- clicking the entry calls only the provided confirmation-opener callback;
- no mutation is executed by this PR;
- full confirmation/policy/decision/type/build gates pass after the static-contract fix;
- handoff/badcase remain updated as new failures are found.
