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

Current combined-branch confirmation dialog locks uncertain/post-state-unavailable attempts until canonical reconciliation succeeds. Overlay/Escape/close requests are ignored, failed reconciliation remains sync-only, successful reconciliation enters explicit reconciled state, and only then may the dialog close. Full rerun `31962635712` is green.

## Canonical display + compatibility mirror boundary

`ApiAquaGuideRepository.getAquariums()` fetches canonical `/aquariums` but does not persist the list into Care's local mirror. Care therefore needs a direct canonical aquarium override plus best-effort compatibility-mirror persistence. Canonical data becomes visible first; local mirror failure must never reclassify a confirmed relocation/read as failed. This protects REL-044/049.

## Care JSX wiring attempt — safety chain green, hydration test harness stale

One-shot run `31962863527` intentionally proved the Care wiring verifier red before patch, then applied the exact-anchor JSX wiring in the runner.

After patch, all new relocation safety gates passed:

- Care wiring static contract ✅
- canonical view/mirror fallback regression ✅
- Care attempt controller ✅
- REL-048 confirmation lifecycle ✅
- #65 confirmation entrypoint ✅
- #63 fresh execution policy ✅
- mutation uncertainty ✅

The run then stopped at the pre-existing `scripts/test-care-aquarium-hydration.ts` static assertion.

Root cause is now confirmed as **TEST-003 test-structure coupling, not a hydration/product regression**. The old test required this exact adjacency:

`const [appState, setAppState] = useState(loadAppStateFromStorage);` immediately followed by `useEffect(() => subscribeToAppState(...))`.

The new Care wiring inserts only:

`const [canonicalAquariums, setCanonicalAquariums] = useState<Aquarium[] | null>(null);`

between those statements. The `subscribeToAppState` hydration subscription remains present and unchanged; the new canonical override is required so a verified post-relocation canonical list can temporarily outrank a stale local mirror.

The hydration regression is being changed from source-line adjacency to capability assertions:

- `appState` still initializes from `loadAppStateFromStorage`;
- `subscribeToAppState` still refreshes `appState`;
- StepDiagnosis uses `canonicalAquariums ?? appState.aquariums`;
- no one-time `useMemo(loadAppStateFromStorage)` regression returns.

No relocation or hydration product rule is being relaxed.

## Intended Care wiring already verified in the runner

- eligible #65 destination opens one controller attempt;
- Care page never calls `repository.relocateLivestock()` directly;
- controller uses `getCurrentAquaGuideRepository` only as its repository provider;
- `executed` applies `result.postAquariums` before returning success to the dialog;
- reconciliation reads through the controller and applies that canonical list;
- direct canonical override is shown before compatibility-mirror persistence;
- mirror persistence failure is isolated and cannot become relocation failure.

Because the one-shot run stopped before TypeScript/build/commit, these JSX changes are **not yet saved on the branch**. The workflow will be rerun after TEST-003 is corrected; only a full green run may self-delete the one-shot tooling and commit the Care wiring.

## Next step

1. update the Care hydration regression to capability-based assertions;
2. rerun the guarded one-shot Care wiring from the pre-wiring branch state;
3. require hydration + severe-risk + app/API TypeScript + build to pass;
4. only then persist the verified Care wiring and self-delete write tooling;
5. update handoff/badcase again before browser Golden Path work.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale destination card as mutation authorization;
- no direct Care UI → repository relocation;
- no local mirror presented as fresh canonical execution state;
- no partial/multi-batch move described as whole conflict resolution;
- no `conditional` override;
- no blind retry after uncertain mutation outcome.
