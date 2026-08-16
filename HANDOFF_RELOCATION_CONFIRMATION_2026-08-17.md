# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living record. PR #62/#63/#64/#65 remain Draft/unmerged. Green branches/CI are not main or production.

## Current safe chain

`formal intervention → #65 entrypoint → #64 confirmation dialog → Care attempt controller → #63 fresh execution policy → #62 atomic receipt → fresh canonical reload/recompute → Care canonical display/mirror refresh`

## Verified foundations

- #62 atomic verified single-batch relocation, receipt-only result.
- #63 fresh source/destination recomputation; only `compatible_by_current_evidence` mutates; unknown/post-state-unavailable reconcile first.
- #64 request-bound confirmation, no repository import/blind retry.
- #65 opener only for lossless one-record + one-positive-batch whole-subject mapping; no cached authorization.
- #65 isolated full-chain run `31961532732` green.
- disposable #62 + #65 audit `31961690289` green, no new conflicts/no merge commit.
- canonical combined implementation bootstrap `31962121116` green; no product PR/main merge.
- Care attempt controller run `31962344545` green.
- reconciliation lifecycle run `31962635712` green.

## Care executable wiring — PERSISTED ON WORKING BRANCH

Working branch:

`agent/canonical-care-relocation-wiring`

Current persisted head:

`9403663c371b8cfa824c92d843a1f57d9b6cbf3e`

Commit:

`Wire canonical relocation confirmation into Care decision surface`

This is a normal working-branch commit produced only after the full one-shot gate passed. It is **not** a PR merge and main was not changed.

### Persisted Care flow

`StepDiagnosisPanel`
→ `InterventionComparisonPanel`
→ eligible #65 destination emits one launch candidate
→ opener creates one Care relocation controller / operationId
→ `RelocationConfirmationDialog`
→ controller injects repository-backed `getAquariums` + relocation callback into #63
→ #63 fresh-revalidates source/destination
→ #62 returns atomic mutation receipt
→ #63 canonical post-read/recompute
→ Care applies canonical aquarium state before mirror persistence
→ compatibility mirror converges best-effort

### Persisted safety semantics

- Care page has no direct `.relocateLivestock()` call.
- one opener event creates one operationId; render does not create IDs.
- one successfully resolved repository instance owns pre-load → mutation → post-load → reconcile for the attempt.
- `execute()` is promise-cached; double click cannot send a second relocation.
- fresh destination degradation blocks before mutation.
- `mutation_state_unknown` preserves the same attempt/operationId and reconciliation is read-only.
- uncertain/post-state-unavailable dialog cannot be dismissed until canonical reconciliation succeeds.
- successful reconciliation enters explicit reconciled state before Close is allowed.
- executed `postAquariums` becomes the current Care-visible truth before success returns to the dialog.
- reconciliation canonical list likewise refreshes the Care-visible decision state.
- local compatibility mirror persistence is secondary; mirror failure does not reclassify canonical success.
- strict `mirrorPersisted: true | false` discriminated result remains intact; no `any`/optional-error weakening.

## Final one-shot wiring run — FULL GREEN

Run `31963163536` completed **success**.

It intentionally proved the old Care page failed the new wiring verifier before applying the patch, then passed every gate after the exact-anchor patch:

- pre-patch Care wiring verifier red as expected ✅
- exact-anchor Care patch applied ✅
- Care relocation wiring static contract ✅
- canonical view / mirror fallback regression ✅
- Care relocation attempt controller ✅
- confirmation reconciliation lifecycle ✅
- #65 confirmation entrypoint ✅
- #63 fresh execution policy ✅
- mutation-outcome uncertainty ✅
- Care hydration regression ✅
- reviewed severe-risk regression ✅
- App TypeScript ✅
- API TypeScript ✅
- production build ✅
- one-shot workflow / patch tooling removed ✅
- verified Care wiring committed and pushed ✅

The one-shot write tooling self-deleted after green and is not part of the persisted working tree.

## TEST-003 — resolved

The old Care hydration test incorrectly coupled correctness to source-line adjacency. It was replaced with capability assertions proving:

- mirror state still initializes reactively;
- `subscribeToAppState` still refreshes it;
- canonical post-action aquarium override can temporarily outrank the mirror;
- there is no return to one-time `useMemo(loadAppStateFromStorage)` hydration.

Run `31963163536` confirms the corrected hydration contract is green.

## TYPE-001 — resolved without type weakening

The mirror helper retains its strict union:

- `mirrorPersisted: true` → `mirrorState`
- `mirrorPersisted: false` → `errorMessage`

Care now uses explicit `applied.mirrorPersisted === false` discrimination. App/API TypeScript and production build are green. No `any`, optional error field, generic boolean, or thrown mirror failure was introduced.

## What this does NOT prove yet

The Care relocation flow is now executable **on the working branch**, but it has not completed browser or hosted/live acceptance.

Not yet proven:

1. actual user navigation reaches the eligible relocation CTA in a real rendered Care flow;
2. dialog displays the correct four facts visually;
3. a browser double-click/rapid interaction cannot bypass React/controller guards;
4. fresh-blocked UI visibly says no move occurred;
5. success immediately redraws the source/destination decision surface without page reload;
6. uncertainty dialog is truly non-dismissible by Escape / overlay in the rendered Radix dialog;
7. reconciliation visually unlocks only after canonical sync;
8. hosted Supabase/Auth/API path performs the same flow end-to-end on real account data;
9. a two-session/device change between card render and confirm is caught in the hosted path.

Therefore this branch must **not** be described as production-ready yet.

## Next step — browser Golden Path

Build/run browser acceptance against this persisted branch before opening/advancing any final integration PR.

Required browser cases:

### GP-REL-01 — eligible opener → confirmation
- rendered formal intervention has an eligible destination;
- click `进入迁移确认`;
- confirmation shows source tank, destination tank, species, exact quantity;
- no mutation occurs merely by opening confirmation.

### GP-REL-02 — confirm success
- click `重新检查并确认迁移` once / rapid-double-click variant;
- one mutation only;
- success state renders;
- source and destination Care decision state updates from canonical post-state without page reload.

### GP-REL-03 — stale destination blocks
- destination becomes unsafe after the card was shown but before confirm;
- fresh policy returns blocked;
- UI states `条件已变化，本次没有执行迁移`;
- mutation count remains zero.

### GP-REL-04 — ambiguous mutation outcome / reconcile
- mutation transport becomes unknown;
- dialog cannot close by Escape/overlay;
- only canonical sync is available;
- sync sends no second relocation;
- successful reconciliation renders synced state, then allows Close.

### GP-REL-05 — source-scope fail-closed
- multi-record / multi-batch formal subject never exposes a direct executable confirmation opener;
- deterministic limitation remains visible.

After deterministic browser harness passes, run separate hosted/Auth acceptance. Local/browser harness success does not substitute for real Supabase/API acceptance.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale destination card as mutation authorization;
- no direct Care UI → repository relocation;
- no local mirror presented as fresh canonical execution state;
- no partial/multi-batch move described as whole conflict resolution;
- no `conditional` override;
- no blind retry after uncertain mutation outcome;
- no browser-harness success described as hosted production acceptance.
