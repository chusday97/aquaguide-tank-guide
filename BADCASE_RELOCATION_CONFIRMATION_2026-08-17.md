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

**Failure**

`TankDecisionContext` resolves two factual records to the same canonical species and produces one formal option such as `A ×5`. Entry UI constructs a request with `sourceRecordIds[0]`.

**Risk**

The user sees a whole-species counterfactual, but the mutation targets only one factual record. Remaining animals can preserve the conflict while UI implies the full intervention was selected.

**Required**

Direct confirmation entry is allowed only when the formal subject maps to exactly one factual source record under the current single-record mutation contract. Multi-record subjects must show an explicit unavailable boundary.

**Status**

New entrypoint regression required.

## REL-035 — Formal whole-subject quantity spans multiple batches, opener picks the first batch

**Failure**

One factual source record has total quantity 5, stored as batch A=3 and batch B=2. Entry UI submits batch A because it is first.

**Risk**

Only part of the formal subject moves, but the decision card described a whole-subject intervention and its blocker reduction no longer holds.

**Required**

Do not use `batches[0]`. Direct confirmation requires one explicit batch whose quantity equals the full formal option quantity and the factual record quantity. Otherwise show “当前需要多批次处理，暂不能直接执行”.

**Status**

Known architectural boundary from PR #63; now must be enforced before the confirmation opener is displayed.

## REL-036 — Destination card status is copied into candidate as execution authorization

**Failure**

The entrypoint emits `{ isSafe: true }`, `{ allowed: true }`, `expectedCompatibility`, or cached verdict data and a later layer treats it as permission to mutate.

**Risk**

A destination can change between panel render and confirmation click/execution.

**Required**

The opener may use current `compatible_by_current_evidence` only to decide whether the confirmation entry is worth showing. The launch candidate carries identifiers/facts, not an authorization boolean. PR #63 must recompute the destination again immediately before mutation.

**Status**

Static contract required.

## REL-037 — Record quantity, batch quantity and formal option quantity disagree

**Failure**

A legacy/inconsistent local record says quantity 5, selected batch says 6, formal option says 5; entrypoint still opens confirmation because one number happens to satisfy a loose comparison.

**Risk**

Confirmation scope is not a truthful representation of canonical/factual storage.

**Required**

Fail closed unless `record.quantity === formalOption.quantity === selectedBatch.quantity` for the direct single-batch path.

**Status**

Regression required.

## REL-038 — Source record has no explicit batches but opener fabricates a batch identity

**Failure**

Legacy factual record has a quantity but no `batches`; UI synthesizes an ID or submits the record ID as batch ID.

**Risk**

Mutation contract no longer addresses a canonical source batch and may fail or target an invented object.

**Required**

No explicit canonical batch = no direct confirmation entry under #62 v1. Keep the plan visible but explain that execution is unavailable until factual batch state is normalized.

**Status**

Regression required.

## REL-039 — Multiple positive batches exist but one batch accidentally equals formal total because storage is inconsistent

**Failure**

Entry eligibility only searches for `batch.quantity === option.quantity` and ignores other positive batches.

**Risk**

The opener accepts internally contradictory storage and may leave undisclosed livestock behind.

**Required**

For the direct path require exactly one positive source batch, not merely one matching batch. Also require factual record quantity equality.

**Status**

Regression required.

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
- handoff/badcase remain updated as new failures are found.
