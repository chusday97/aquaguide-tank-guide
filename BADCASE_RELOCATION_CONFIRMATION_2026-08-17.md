# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Living regression record. PR #62/#63/#64/#65 stay Draft/unmerged. Executable Care wiring is being built only on the verified combined canonical branch.

## Existing protected badcases

- REL-023 — committed RPC + failed post-read cannot look like mutation failure.
- REL-024 — rejected mutation transport may be post-write: preserve operationId and reconcile.
- REL-025 — displayed/submitted quantity share one source.
- REL-026 — confirmation UI cannot import repository/API/Supabase directly.
- REL-027 — fresh blocked result cannot become success UI.
- REL-028 — uncertain state has no blind relocation retry.
- REL-029 — completed confirmation cannot execute again.
- REL-030 — blocked stale proposal needs a new evaluation.
- REL-031 — request IDs authoritative; names display-only.
- REL-032 — unexpected callback error reconciles conservatively.
- REL-033 — isolated green requires canonical integration audit.
- REL-034…REL-039 — PR #65 multi-record/multi-batch/missing-batch/quantity/cached-verdict protections remain green.

## Care executable-layer badcases

### REL-040 — operationId regenerated during render
**Fix implemented in controller:** operationId is generated once at controller creation, intended only from the opener event. Controller regression proves generator call count stays 1 through execute/reconcile.

### REL-041 — reconciliation sends a second mutation/new operationId
**Fix implemented in controller:** `reconcile()` only calls the attempt repository's `getAquariums()`. Unknown-outcome regression proves mutation count stays 1 and operationId count stays 1 after reconciliation.

### REL-042 — Care JSX/page handler calls `repository.relocateLivestock()` directly
**Controller architecture:** relocation exists only inside the callback passed to `executeFreshRelocation`. JSX static protection is still required when page wiring is added.

### REL-043 — “fresh” loader returns React/local mirror state
**Fix implemented in controller:** `loadAquariums` calls the attempt repository's `getAquariums()` for both pre-write and post-write reads. Fresh target degradation regression proves a changed destination blocks before mutation.

### REL-044 — success leaves Care decision state stale

**Confirmed:** `ApiAquaGuideRepository.getAquariums()` fetches `/aquariums` and updates repository version caches through `rememberAquarium`, but it does **not** write the returned list into Care's `loadAppStateFromStorage()` mirror.

**Required page fix:**
- on `executed`, immediately use `result.postAquariums` for the Care-visible decision state;
- on reconciliation, immediately use `await controller.reconcile()`;
- after a canonical read succeeds, best-effort mirror that verified list through `patchLocalAppState` so the existing app-state subscription and other pages converge on the same facts.

### REL-045 — idle cancel and terminal attempt lifecycle are conflated
One attempt identity is bound to one move intent. Idle unused cancel may discard it; completed/uncertain attempts cannot be repurposed.

### REL-046 — final Care wiring is implemented on the PR #65-only branch
**Fix complete:** executable work moved to `agent/canonical-care-relocation-wiring`; guarded bootstrap `31962121116` is green and no product PR/main merge occurred.

### REL-047 — repository mode/source changes inside one confirmation execution
**Fix implemented in controller:** same successfully resolved repository instance owns pre-load → mutation → post-load → reconciliation. Controller regression proves resolver count 1 for a resolved attempt.

### REL-048 — reconciliation-required dialog can be dismissed before canonical sync

**Fix implemented, verification running:**
- uncertainty/post-state-unavailable sets a non-dismissible close lock;
- overlay/Escape/built-in close requests are ignored until canonical `onReconcile()` succeeds;
- failed reconciliation stays locked and exposes sync retry only;
- successful reconciliation enters explicit `data-relocation-reconciled` state and then allows Close;
- reconciliation-complete/error state resets for a different operationId/open lifecycle.

The canonical confirmation verifier now asserts the close lock and reconciled terminal state. Full controller/confirmation/type/build rerun is in progress.

### REL-049 — canonical refresh succeeds but compatibility-mirror persistence fails

**Failure:** #63 returns `executed` with correct `postAquariums`, or reconciliation returns a correct canonical list, then `patchLocalAppState()` throws because localStorage is unavailable/quota-failed. Parent lets that exception propagate into the dialog execution callback.

**Risk:** a confirmed canonical relocation is reclassified as an unexpected execution error/reconciliation state even though the database and canonical read are already known. Or the current Care page falls back to stale local mirror state.

**Required page behavior:**
1. set a direct React canonical aquarium override **before** attempting local mirror persistence;
2. best-effort `patchLocalAppState({ aquariums: canonicalList, currentAquariumId })` only after canonical read success;
3. if mirror persistence succeeds, update `appState`/subscription and the direct override can be released;
4. if mirror persistence fails, retain the canonical React override for the current Care surface and do **not** throw/reclassify the relocation result;
5. local mirror failure may be reported separately, but it is not a mutation/canonical-read failure.

**Status:** page-wiring regression required.

## Controller verification

Permanent run `31962344545` is fully GREEN:
- Care relocation confirmation controller ✅
- fresh execution policy ✅
- mutation uncertainty ✅
- confirmation surface ✅
- entrypoint source scope ✅
- app TypeScript ✅
- API TypeScript ✅
- production build ✅

Controller regression proves double-execute idempotence, pre/post canonical reads, zero-write fresh blocks, read-only reconciliation after unknown outcome, and one repository session per attempt.

## Test infrastructure badcases

- TEST-001 — optional-call regex false failure; fixed test only.
- TEST-002 — guessed parent verifier filename; fixed by reusing PR #64 canonical verifier.

## Current verified baseline

- #65 isolated run `31961532732`: green.
- disposable #62 + #65 audit `31961690289`: green.
- saved canonical bootstrap `31962121116`: green.
- Care controller run `31962344545`: green.

## Remaining Care executable-layer exit gate

- finish REL-048 rerun;
- no Care page direct `relocateLivestock()` call;
- success/reconcile refreshes Care visible decision state from canonical data;
- mirror persistence failure cannot reclassify canonical success;
- blocked fresh result never writes;
- terminal attempt cannot be discarded/reopened as a fresh operation without required reconciliation;
- browser Golden Path covers open → confirm → fresh block/success/reconcile;
- handoff/badcase remain updated as failures are found.
