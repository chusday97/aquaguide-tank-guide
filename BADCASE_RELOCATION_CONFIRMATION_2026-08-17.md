# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Living regression record for the relocation path. PR #65's entrypoint layer is green in isolated and disposable canonical integration gates, but Care-page repository wiring is still a separate unimplemented risk boundary.

## Existing protected badcases

- REL-023 — RPC commits but post-write read fails: return mutation receipt; do not disguise committed write as mutation failure.
- REL-024 — mutation transport rejects after write boundary: `mutation_state_unknown`, preserve operation ID, reconcile first.
- REL-025 — display-only quantity differs from request quantity: display actual request quantity only.
- REL-026 — confirmation component imports repository/API/Supabase directly: prohibited by static contract.
- REL-027 — fresh policy blocks but UI reports success: blocked is distinct terminal outcome.
- REL-028 — uncertain outcome exposes retry relocation: reconciliation only, no blind retry.
- REL-029 — completed confirmation can fire again: completed is terminal.
- REL-030 — blocked result retries stale proposal: return to a newly evaluated proposal instead.
- REL-031 — labels and submitted IDs belong to different requests: IDs are request-bound; names are labels only.
- REL-032 — unexpected thrown callback error assumed definitely pre-write: reconcile conservatively.
- REL-033 — isolated confirmation passes but canonical mutation stack drifts: disposable canonical integration audit required.

## PR #65 protected badcases

### REL-034 — formal species option aggregates multiple source records
**Fix:** direct confirmation requires exactly one factual source record. Green in `31961532732` and canonical audit `31961690289`.

### REL-035 — whole subject spans multiple batches
**Fix:** exactly one positive explicit batch must represent the whole formal quantity; no `batches[0]` shortcut. Green in both gates.

### REL-036 — current destination card becomes cached mutation authorization
**Fix:** card status controls opener visibility only; candidate has no safety boolean/cached verdict/operationId. PR #63 still re-evaluates immediately before mutation. Green in both gates.

### REL-037 — resolved / record / batch / formal quantities disagree
**Fix:** quantities must agree for direct single-batch execution. Green in both gates.

### REL-038 — no explicit batch but UI invents one
**Fix:** no explicit positive batch = no direct confirmation entry. Green in both gates.

### REL-039 — contradictory multiple positive batches but one matching batch is selected
**Fix:** exactly one positive batch is mandatory before matching quantity. Green in both gates.

## Test infrastructure badcases

### TEST-001 — static regex mis-parses optional callback syntax
Test-only fix; no product rule relaxed.

### TEST-002 — stacked workflow guesses a non-existent parent verifier filename
Workflow now reuses PR #64's canonical `verify-relocation-confirmation-surface.mjs`. Confirmed green in `31961532732` and `31961690289`.

## Canonical integration result

Disposable audit `31961690289` is **GREEN**:

- no new merge conflicts beyond the two known canonical/decision files;
- atomic local/SQL/wiring/receipt tests passed;
- fresh policy + mutation uncertainty passed;
- confirmation + entrypoint contracts passed;
- unresolved/Care hydration/severe-risk passed;
- real repository → policy TypeScript adapter passed;
- API TypeScript + production build passed;
- no merge commit created.

REL-033 is therefore satisfied for PR #65's scope.

## New next-layer badcases to protect before Care wiring

### REL-040 — operationId regenerated on every render
**Failure:** launch candidate enters Care; component creates `createIdempotencyKey()` during render or every state recomputation.

**Risk:** the same user confirmation can produce multiple operation identities; an uncertain first request followed by rerender/retry can move livestock twice.

**Required:** create one operationId when a new confirmation attempt is opened; keep it stable for that attempt until terminal resolution/reconciliation.

**Status:** regression required before repository-backed wiring.

### REL-041 — uncertain attempt gets a new operationId when user presses sync/reconcile
**Failure:** `mutation_state_unknown` or post-state-unavailable path rebuilds request with a new operation ID.

**Risk:** reconciliation turns into a second mutation identity rather than state recovery.

**Required:** reconciliation performs canonical reload only and preserves the original operation identity for diagnostic/idempotency context; no new relocation mutation is sent automatically.

**Status:** regression required.

### REL-042 — Care page calls `repository.relocateLivestock()` directly
**Failure:** page handler bypasses PR #63 and uses the launch candidate as a write command.

**Risk:** cached card status becomes practical authorization despite architecture contracts.

**Required:** page may inject a callback into `executeFreshRelocation`; direct page-level relocation call is prohibited by static contract.

**Status:** regression/static contract required.

### REL-043 — PR #63 fresh load uses current page state instead of repository-backed canonical hydration
**Failure:** `loadAquariums` returns React state/local mirror captured when the panel opened.

**Risk:** fresh revalidation is only nominal; source/destination changes made on another device/session are missed.

**Required:** execution integration's `loadAquariums` must call the repository's canonical aquarium loader at execution and post-execution time.

**Status:** integration regression required.

### REL-044 — successful relocation does not refresh Care decision state
**Failure:** #63 returns `executed`, but Care continues displaying the pre-move decision/result until navigation/reload.

**Risk:** UI immediately shows stale conflicts/options after a confirmed write.

**Required:** completed result must replace/rebuild Care aquarium/decision state from `postAquariums` / recomputed decisions, or trigger the canonical page hydration path before another action.

**Status:** browser/integration regression required.

### REL-045 — idle cancel and terminal attempt lifecycle are conflated
**Failure:** cancelling before execution permanently consumes an operation identity, or a completed/uncertain request object is reused for a different move.

**Required:** attempt identity belongs to one `{source record, batch, destination, quantity}` confirmation intent. Idle cancel may discard it. New move = new attempt identity. Completed/uncertain attempt must never be repurposed.

**Status:** state regression required.

## Next-layer exit gate

Before Care wiring can be described as safe:

- stable operationId lifecycle is tested;
- no operationId creation during render;
- uncertain/reconcile path sends no second mutation;
- Care has no direct `relocateLivestock()` call;
- fresh `loadAquariums` is repository-backed;
- repository callback is only reachable inside `executeFreshRelocation`;
- successful write refreshes Care decision state;
- blocked fresh result never writes;
- cancellation/new-intent lifecycle cannot reuse terminal attempt IDs;
- browser Golden Path covers open confirmation → confirm → fresh block/success/reconcile states;
- handoff/badcase are updated as failures are discovered.
