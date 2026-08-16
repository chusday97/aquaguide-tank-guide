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

**Risk:** #63 may return correct `postAquariums` while `StepDiagnosisPanel` continues rendering the pre-move local mirror and therefore stale conflicts/options.

**Required page fix:**
- on `executed`, immediately set the Care-visible aquarium set from `result.postAquariums`;
- on reconciliation, set it from `await controller.reconcile()`;
- canonical post-action state must take precedence over the local mirror for the current Care decision surface.

**Status:** confirmed P0 page-wiring requirement; regression/static/browser coverage still required.

### REL-045 — idle cancel and terminal attempt lifecycle are conflated
One attempt identity is bound to one move intent. Idle unused cancel may discard it; completed/uncertain attempts cannot be repurposed. Dialog close/reconciliation semantics still need inspection before JSX wiring.

### REL-046 — final Care wiring is implemented on the PR #65-only branch
**Fix complete:** executable work moved to `agent/canonical-care-relocation-wiring`, created from latest #62 and populated with full #65 stack using guarded squash integration. Bootstrap `31962121116` is green; one-shot workflow self-deleted. No product PR/main merge occurred.

### REL-047 — repository mode/source changes inside one confirmation execution

**Fix implemented in controller:** repository resolution is cached per attempt. Same repository instance owns pre-load → mutation → post-load → reconciliation. Controller regression proves repository resolver count is 1 for a resolved attempt.

If repository resolution itself fails before any repository exists, no mutation is possible through it; the cache is cleared so a later recovery read may resolve again.

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

Controller regression additionally proves:
- double execute returns the same Promise / one mutation;
- success performs exactly pre + post canonical reads;
- fresh destination invalidation performs zero writes;
- unknown mutation outcome cannot write again during reconcile or repeated execute;
- one repository session is preserved through attempt recovery.

## Test infrastructure badcases

- TEST-001 — optional-call regex false failure; fixed test only.
- TEST-002 — guessed parent verifier filename; fixed by reusing PR #64 canonical verifier.

## Current verified baseline

- #65 isolated run `31961532732`: green.
- disposable #62 + #65 audit `31961690289`: green, no new conflicts/no merge commit.
- saved canonical bootstrap `31962121116`: green, one-shot workflow deleted.
- Care controller run `31962344545`: green.

## Remaining Care executable-layer exit gate

- inspect/fix terminal dialog close lifecycle before page wiring;
- no Care page direct `relocateLivestock()` call;
- success/reconcile refreshes Care visible decision state from canonical data;
- blocked fresh result never writes (controller covered; page flow still needs integration coverage);
- terminal attempt cannot be discarded/reopened as a fresh operation without required reconciliation;
- browser Golden Path covers open → confirm → fresh block/success/reconcile;
- handoff/badcase remain updated as failures are found.
