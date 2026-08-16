# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living record. PR #62/#63/#64/#65 remain Draft/unmerged. Green branches/CI are not main or production.

## Current safe chain

`formal intervention → #65 entrypoint → #64 confirmation dialog → Care attempt controller → #63 fresh execution policy → #62 atomic receipt → fresh canonical reload/recompute → Care canonical display/mirror refresh`

## Verified foundations

- #62 atomic verified single-batch relocation, receipt-only result.
- #63 fresh source/destination recomputation; only `compatible_by_current_evidence` mutates; unknown/post-state-unavailable reconcile first.
- #64 request-bound confirmation, no repository import/blind retry.
- #65 opener only for lossless one-record + one-positive-batch whole-subject mapping; no cached authorization.
- #65 run `31961532732` green.
- disposable #62 + #65 audit `31961690289` green, no new conflicts/no merge commit.
- canonical combined implementation bootstrap `31962121116` green; no product PR/main merge.

## Care attempt controller — green

`care-relocation-confirmation.controller.ts` owns one attempt / one operationId / one repository session.

- operationId created once from the opener event, never render;
- request/facts fixed for the attempt;
- one successfully resolved repository instance owns pre-load → mutation → post-load → reconcile;
- `execute()` caches one Promise, so double clicks cannot create another write;
- pre/post fresh loads use repository `getAquariums()`;
- repository mutation is reachable only through #63's injected callback;
- reconcile is canonical read-only recovery.

Permanent controller run `31962344545` is fully green, including controller regressions, fresh policy, uncertainty, confirmation, entrypoint, app/API TypeScript and build.

## REL-048 confirmation lifecycle — fixed and green

Current combined-branch confirmation dialog now locks uncertain/post-state-unavailable attempts until canonical reconciliation succeeds:

- overlay/Escape/dialog close requests are ignored while reconciliation is required;
- failed reconciliation stays on the same attempt and offers sync retry only;
- successful `onReconcile()` enters explicit `data-relocation-reconciled` state;
- only then may the user close the dialog;
- a different operationId/open lifecycle resets reconciliation state.

Verifier was extended to protect these rules. Full controller/confirmation/type/build rerun `31962635712` is green.

## Canonical display + compatibility mirror boundary

Confirmed: `ApiAquaGuideRepository.getAquariums()` fetches canonical `/aquariums` and updates repository version caches but does not persist the aquarium list into Care's local app-state mirror.

Therefore page wiring must not wait for `subscribeToAppState()` to become correct by accident.

Care wiring strategy:

1. maintain a direct canonical aquarium override for the current StepDiagnosis surface;
2. on `executed`, set that override from `result.postAquariums` before returning the execution result to the dialog;
3. on successful reconciliation, set it from `await controller.reconcile()`;
4. only after canonical read success, best-effort call `patchLocalAppState({ aquariums: canonicalList, currentAquariumId })` so compatibility mirror / other pages converge;
5. if mirror persistence succeeds, update current appState and release the temporary canonical override;
6. if mirror persistence fails, keep the canonical override for the current Care surface and do not reclassify the relocation/canonical read as failed.

This protects REL-044 and REL-049.

## Next implementation step — now authorized

Wire `StepDiagnosisPanel` on the combined canonical branch:

- pass `sourceAquarium={targetAquarium}` and `onOpenRelocationConfirmation` into `InterventionComparisonPanel`;
- opener event creates exactly one Care relocation controller and closes the comparison panel;
- render `RelocationConfirmationDialog` from `controller.attempt.request/facts`;
- execution wrapper applies canonical `postAquariums` on `executed`;
- reconcile wrapper applies canonical list from controller;
- no Care JSX call to `repository.relocateLivestock()`;
- reset/topic/aquarium changes may discard only an idle/unexecuted attempt; reconciliation-required dialog itself is non-dismissible until canonical sync.

After JSX wiring: add static page contract + integration regression, then browser Golden Path.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale destination card as mutation authorization;
- no direct Care UI → repository relocation;
- no local mirror presented as fresh canonical execution state;
- no partial/multi-batch move described as whole conflict resolution;
- no `conditional` override;
- no blind retry after uncertain mutation outcome.
