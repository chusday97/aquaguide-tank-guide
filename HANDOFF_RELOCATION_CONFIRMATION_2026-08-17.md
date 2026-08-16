# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living record. PR #62/#63/#64/#65 remain Draft/unmerged. Green branches/CI are not main or production.

## Current safe chain

`formal intervention → #65 confirmation entrypoint → #64 confirmation dialog → #63 fresh execution policy → #62 atomic receipt → fresh canonical reload/recompute`

## Completed foundations

- #62: atomic verified single-batch relocation; receipt-only result.
- #63: fresh source/destination recomputation; only `compatible_by_current_evidence` can mutate; unknown/post-state-unavailable require reconciliation.
- #64: confirmation state/dialog; request-bound facts; no blind retry or repository import.
- #65: opener only when the whole formal species option maps losslessly to exactly one factual record + one positive explicit batch with identical quantity; candidate contains no cached authorization.
- #65 full-chain CI `31961532732`: green.
- Disposable #62 + #65-stack audit `31961690289`: green; only the two known semantic conflicts; no merge commit.

## New canonical implementation baseline

The first investigation branch cut from #65 exposed REL-046: its Care state is a page/local snapshot and #65 does not contain #62's mutation repository contract. It must not become the executable branch.

A new implementation branch was therefore created from latest #62:

`agent/canonical-care-relocation-wiring`

The full #65 stack was brought in via guarded **squash integration**, not by merging a product PR. Workflow run `31962121116` passed before saving the tree:

- atomic receipt boundary ✅
- fresh execution policy ✅
- mutation uncertainty ✅
- confirmation surface ✅
- confirmation entrypoint source/UI ✅
- unresolved livestock ✅
- Care hydration regression ✅
- app TypeScript ✅
- API TypeScript ✅
- production build ✅

The one-shot bootstrap workflow self-deleted. Saved combined-tree head: `8ccc6a33fe2788e4c06cf633b7229908ad5b1e07`.

No PR was merged, no PR was marked Ready, and main was not changed.

## Fresh canonical execution rule

Care/local React state is never the authorization source. The combined repository interface provides:

`getAquariums(): Promise<Aquarium[]>`

and

`relocateLivestock(input): Promise<{ committed: true; replayed?: boolean }>`.

The execution controller must resolve the current repository **once when the user confirms the attempt**. That same repository instance must be used for:

`repository.getAquariums() pre-load → #63 revalidation → repository.relocateLivestock() callback → repository.getAquariums() post-load`.

Do not resolve repository mode separately for pre-load/mutation/post-load; otherwise an auth/mode change could split one attempt across different truth sources.

## Operation-attempt contract to implement before JSX

A confirmation attempt owns exactly one operation identity and exactly one launch candidate:

- create operationId only when opening a new confirmation attempt, never during render;
- rerenders keep the same operationId;
- one attempt = one `{source aquarium, source record, source batch, destination, quantity}` intent;
- uncertain/post-state-unavailable reconciliation sends no second mutation;
- idle unused cancel may discard the attempt;
- completed/uncertain terminal attempt cannot be repurposed for another move;
- a new move creates a new attempt and operationId.

## Next implementation order

1. add a pure Care relocation attempt model/controller;
2. add repository-backed execution adapter that injects `getAquariums` + `relocateLivestock` only under #63;
3. regression-test operationId stability, repository resolution count, pre/post canonical load and no-mutation reconcile;
4. only after those tests pass, wire `StepDiagnosisPanel → InterventionComparisonPanel → RelocationConfirmationDialog`;
5. refresh Care decision state from canonical result after success/reconciliation;
6. then add browser Golden Path.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale destination card as mutation authorization;
- no direct Care JSX/page handler → `repository.relocateLivestock()`;
- no local mirror presented as fresh canonical execution state;
- no arbitrary first record/batch selection;
- no partial move described as whole-conflict resolution;
- no `conditional` override;
- no blind retry after uncertain mutation outcome.
