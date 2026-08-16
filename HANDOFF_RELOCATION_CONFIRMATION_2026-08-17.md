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
- Care attempt controller run `31962344545` green.
- reconciliation lifecycle run `31962635712` green.

## Canonical display + compatibility mirror boundary

`ApiAquaGuideRepository.getAquariums()` fetches canonical `/aquariums` but does not persist the list into Care's local mirror. Care therefore needs a direct canonical aquarium override plus best-effort compatibility-mirror persistence. Canonical data becomes visible first; local mirror failure must never reclassify a confirmed relocation/read as failed. This protects REL-044/049.

## Care JSX wiring one-shot history

### Run `31962863527`

The exact-anchor Care patch applied in the runner and all new relocation gates passed through mutation uncertainty. The run stopped at the pre-existing Care hydration static test because that test incorrectly required `useState(loadAppStateFromStorage)` and `subscribeToAppState` to be adjacent. This was recorded as TEST-003; product hydration remained intact.

### Run `31963027394`

TEST-003 was corrected to capability assertions. The rerun proved:

- pre-patch wiring verifier intentionally red ✅
- exact-anchor Care patch applied ✅
- Care wiring static contract ✅
- canonical view/mirror fallback ✅
- Care attempt controller ✅
- confirmation lifecycle ✅
- #65 entrypoint ✅
- #63 fresh policy ✅
- mutation uncertainty ✅
- corrected Care hydration ✅
- severe-risk ✅

The next failure is now a **real TypeScript integration issue**, not a product-rule failure:

`src/pages/CareEncyclopedia.tsx(...): Property 'errorMessage' does not exist on type 'CareCanonicalAquariumApplyResult'`.

`applyCareCanonicalAquariums()` intentionally returns a strict discriminated union:

- `{ mirrorPersisted: true, mirrorState, ... }`
- `{ mirrorPersisted: false, errorMessage, ... }`

The page patch used truthiness narrowing:

`if (applied.mirrorPersisted) { ... } else { console.warn(applied.errorMessage) }`

Under the current TypeScript configuration, that `else` was not accepted as a sufficiently explicit false discriminant.

The fix will preserve the strict union and use explicit discrimination (`applied.mirrorPersisted === false`) rather than weakening the type, making `errorMessage` optional, or introducing `any`.

Because the run stopped at TypeScript, JSX wiring still has **not** been committed/pushed. API TypeScript/build/self-delete/commit did not run.

## Care execution architecture already verified before TypeScript stop

- one opener event creates one controller/operationId;
- no Care direct `relocateLivestock()` call;
- one repository session owns pre-load/mutation/post-load/reconcile;
- fresh target degradation blocks with zero writes;
- executed result applies canonical `postAquariums` before dialog success returns;
- reconciliation is canonical read-only recovery;
- canonical visible state is applied before compatibility-mirror persistence;
- mirror write failure is isolated from mutation/canonical-read status;
- uncertain dialog remains locked until successful canonical reconciliation.

## Next step

1. update the exact-anchor Care patch to use explicit boolean-literal discrimination for `mirrorPersisted`;
2. rerun the same guarded one-shot from the still-unpersisted pre-wiring branch state;
3. require app/API TypeScript + production build green;
4. only full green may self-delete the one-shot patch tooling and persist the Care wiring;
5. update handoff/badcase immediately with that result, then proceed to browser Golden Path.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale destination card as mutation authorization;
- no direct Care UI → repository relocation;
- no local mirror presented as fresh canonical execution state;
- no weakening discriminated result types merely to satisfy compilation;
- no partial/multi-batch move described as whole conflict resolution;
- no `conditional` override;
- no blind retry after uncertain mutation outcome.
