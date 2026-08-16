# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living record. PR #62/#63/#64/#65 remain Draft/unmerged. Green branches/CI are not main or production.

## Current safe chain

`formal intervention → #65 confirmation entrypoint → #64 confirmation dialog → Care attempt controller → #63 fresh execution policy → #62 atomic receipt → fresh canonical reload/recompute`

## Completed foundations

- #62: atomic verified single-batch relocation; receipt-only result.
- #63: fresh source/destination recomputation; only `compatible_by_current_evidence` can mutate; unknown/post-state-unavailable require reconciliation.
- #64: confirmation state/dialog; request-bound facts; no blind retry or repository import.
- #65: opener only when the whole formal species option maps losslessly to exactly one factual record + one positive explicit batch with identical quantity; candidate contains no cached authorization.
- #65 full-chain CI `31961532732`: green.
- Disposable #62 + #65-stack audit `31961690289`: green; only the two known semantic conflicts; no merge commit.

## Canonical implementation baseline

Executable work now lives only on `agent/canonical-care-relocation-wiring`, created from latest #62 and populated with the full #65 stack via guarded squash integration. Bootstrap run `31962121116` passed receipt, fresh policy, uncertainty, confirmation, entrypoint, unresolved, Care hydration, app/API TypeScript and production build before saving the combined tree. The one-shot workflow self-deleted. No product PR/main merge occurred.

## Care relocation attempt controller — implemented and green

Added `src/services/care/care-relocation-confirmation.controller.ts`.

One controller instance represents one confirmation attempt:

- operationId generated once when the opener event creates the controller, never during render;
- request/facts/intent are frozen for that attempt;
- repository mode is lazily resolved once and the same successful repository instance owns pre-load → mutation callback → post-load → later reconciliation reads;
- `execute()` caches its Promise, so double clicks/repeated callbacks cannot create a second mutation;
- pre/post fresh loads call repository `getAquariums()`;
- repository `relocateLivestock()` is only reachable inside the callback injected into #63 `executeFreshRelocation`;
- `reconcile()` is canonical read-only recovery and never mutates;
- repository resolution that fails before any repository exists may be retried for a later recovery read because no write could have occurred through an unresolved repository.

Controller regression suite verifies:

- stable single operationId;
- one repository resolution per successful attempt;
- exactly one mutation on success even when execute is called twice;
- exactly two canonical reads on success (pre/post);
- fresh destination degradation blocks with mutation count 0;
- `mutation_state_unknown` preserves operationId and reconcile adds only a read;
- repeated execute after unknown returns the same prior result and sends no second mutation;
- repository-resolution failure before a repository is obtained performs no mutation.

Permanent controller workflow run `31962344545` is fully green:

- Care controller regression ✅
- #63 fresh execution policy ✅
- mutation uncertainty ✅
- #64 confirmation surface ✅
- #65 entrypoint source scope ✅
- app TypeScript ✅
- API TypeScript ✅
- production build ✅

## New confirmed display-state boundary

`ApiAquaGuideRepository.getAquariums()` fetches `/aquariums` and maps/records repository version metadata, but it does **not** persist the returned list into `loadAppStateFromStorage()` / Care's local mirror subscription.

Therefore a successful #63 execution can have correct `postAquariums` while Care still renders the old local mirror and old conflict graph.

REL-044 is confirmed, not hypothetical.

The page wiring must update its visible aquarium set directly from canonical results:

- on `executed`: use `result.postAquariums` immediately for the Care decision surface;
- on reconciliation: use `await controller.reconcile()` canonical aquariums;
- do not wait for localStorage subscription to become accurate by accident;
- local mirror may remain a compatibility/cache source, but the just-confirmed canonical list must take precedence for the current Care decision surface.

## Next JSX wiring design

`StepDiagnosisPanel` will add a canonical display override plus one active relocation controller:

1. `displayAquariums = canonicalAquariums ?? appState.aquariums`;
2. opening an eligible #65 destination creates exactly one controller and closes/backs the comparison panel;
3. pass `sourceAquarium={targetAquarium}` + opener callback to `InterventionComparisonPanel`;
4. render #64 `RelocationConfirmationDialog` from `controller.attempt.request/facts`;
5. dialog execution wrapper awaits `controller.execute()`; on `executed`, set canonical display state from `result.postAquariums` before returning the result to the dialog;
6. reconcile wrapper awaits `controller.reconcile()` and sets canonical display state from that result;
7. reset/topic/aquarium changes must clear an unused idle attempt deliberately, but terminal/uncertain lifecycle must not silently mint a new operationId for the same move.

Before coding that JSX, confirm/adjust #64 dialog close semantics so reconciliation-required outcomes cannot be dismissed and then silently reopened as a new attempt without canonical reconciliation.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale destination card as mutation authorization;
- no direct Care JSX/page handler → `repository.relocateLivestock()`;
- no local mirror presented as fresh canonical execution state;
- no arbitrary first record/batch selection;
- no partial move described as whole-conflict resolution;
- no `conditional` override;
- no blind retry after uncertain mutation outcome.
