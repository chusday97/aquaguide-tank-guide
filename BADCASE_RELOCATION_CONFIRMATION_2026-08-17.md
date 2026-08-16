# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Living regression record. PR #62/#63/#64/#65 stay Draft/unmerged. Executable Care wiring is now being built only on the verified combined canonical working branch.

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
- REL-034…REL-039 — multi-record/multi-batch/missing-batch/quantity/cached-verdict entrypoint protections remain green.

## Care executable-layer badcases

### REL-040 — operationId regenerated during render
Create operationId only when opening a new confirmation attempt; rerenders keep it stable.

### REL-041 — reconciliation sends a second mutation/new operationId
Reconciliation is canonical read/recovery only. Preserve the original attempt identity; do not auto-relocate again.

### REL-042 — Care JSX/page handler calls `repository.relocateLivestock()` directly
Repository mutation is allowed only inside the callback injected into `executeFreshRelocation`.

### REL-043 — “fresh” loader returns React/local mirror state
Pre-write and post-write #63 loads must call repository `getAquariums()`.

### REL-044 — success leaves Care decision state stale
Completed/reconciled canonical aquarium state must refresh the visible Care decision surface.

### REL-045 — idle cancel and terminal attempt lifecycle are conflated
One attempt identity is bound to one move intent. Idle unused cancel may discard it; completed/uncertain attempts cannot be repurposed.

### REL-046 — final Care wiring is implemented on the PR #65-only branch

**Observed:** PR #65-side Care uses local/page aquarium state and does not contain #62's relocation repository contract. PR #62 has repository mutation/read methods but is a separate stack.

**Fix:** executable work moved to `agent/canonical-care-relocation-wiring`, created from latest #62 and populated with full #65 stack using guarded squash integration.

Bootstrap run `31962121116` passed receipt, fresh policy, uncertainty, confirmation, entrypoint, unresolved, Care hydration, app/API TypeScript and production build before saving combined head `8ccc6a33fe2788e4c06cf633b7229908ad5b1e07`. One-shot workflow self-deleted. No product PR/main merge occurred.

**Status:** architecture guard satisfied for implementation baseline.

### REL-047 — repository mode/source changes inside one confirmation execution

**Failure:** controller calls `getCurrentAquaGuideRepository()` separately for pre-load, mutation, and post-load. Login/repository mode changes between those calls, so one attempt reads from cloud, mutates through another mode, or post-reads local state.

**Risk:** the attempt no longer has one coherent source of truth even though each individual call looks canonical.

**Required:** resolve current repository exactly once when confirm execution begins. Use that same repository instance for:

`getAquariums pre-load → relocate callback → getAquariums post-load`.

A future new confirmation attempt may resolve repository mode again.

**Status:** controller regression required before Care JSX wiring.

## Test infrastructure badcases

- TEST-001 — optional-call regex false failure; fixed test only.
- TEST-002 — guessed parent verifier filename; fixed by reusing PR #64 canonical verifier.

## Current verified baseline

- #65 isolated effective run `31961532732`: green.
- disposable #62 + #65 audit `31961690289`: green, no new conflicts/no merge commit.
- saved canonical implementation bootstrap `31962121116`: green, one-shot workflow deleted.

## Care executable-layer exit gate

Before Care wiring is safe:

- stable operationId lifecycle tested;
- no operationId creation during render;
- one repository resolution per execution attempt;
- same repository instance handles pre-load/mutation/post-load;
- uncertain/reconcile sends no second mutation;
- no Care page direct `relocateLivestock()` call;
- fresh loads use repository `getAquariums()`;
- success/reconcile refreshes Care decision state;
- blocked fresh result never writes;
- terminal attempt IDs cannot be reused for a different move;
- browser Golden Path later covers open → confirm → fresh block/success/reconcile;
- handoff/badcase remain updated as failures are found.
