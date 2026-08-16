# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Living regression record for the relocation path. PR #65's entrypoint layer is green, but the Care executable layer must now be built on an intentional canonical combined tree.

## Existing protected badcases

- REL-023 — committed RPC + failed post-read must not look like mutation failure.
- REL-024 — rejected mutation transport may be post-write: `mutation_state_unknown`, preserve operation identity, reconcile first.
- REL-025 — displayed quantity and submitted quantity must share one source.
- REL-026 — confirmation UI cannot import repository/API/Supabase directly.
- REL-027 — fresh policy blocked result cannot become success UI.
- REL-028 — uncertain state exposes reconciliation only, never blind relocation retry.
- REL-029 — completed confirmation cannot execute again.
- REL-030 — blocked stale proposal must be re-evaluated before a new attempt.
- REL-031 — request IDs are authoritative; names are display labels only.
- REL-032 — unexpected callback error is treated conservatively as reconciliation-required.
- REL-033 — isolated UI/policy green requires disposable canonical integration audit.
- REL-034…REL-039 — PR #65 source-record/batch/quantity/cached-verdict entrypoint protections remain green in `31961532732` and canonical audit `31961690289`.

## Next-layer badcases already identified

### REL-040 — operationId regenerated on every render
Create one operationId when a new confirmation attempt opens; stable for the attempt.

### REL-041 — reconciliation creates another mutation identity
Reconciliation is canonical read/recovery only; no automatic second relocation.

### REL-042 — Care page calls `repository.relocateLivestock()` directly
Page-level direct mutation bypass is forbidden; repository relocation may only be injected under `executeFreshRelocation`.

### REL-043 — “fresh” revalidation reads page/local state
`loadAquariums` for #63 must call canonical repository `getAquariums()` at execution and post-execution time.

### REL-044 — successful relocation leaves Care decision UI stale
Care must refresh canonical aquarium/decision state after execution or reconciliation.

### REL-045 — idle-cancel and terminal attempt lifecycle are conflated
Attempt identity is bound to one move intent; idle unused cancel may discard it, terminal attempts cannot be repurposed.

## REL-046 — executable Care wiring is implemented on the PR #65-only branch

**Observed architecture**

PR #65's branch contains the decision/confirmation UI stack but not PR #62's canonical relocation repository contract. Its `StepDiagnosisPanel` still initializes aquarium state from a one-time local storage snapshot.

PR #62's branch has the mutation/repository contract and improves Care to a subscribed local mirror, but that mirror is still not an execution-time canonical repository read.

The repository interface on #62 exposes the correct fresh read:

`getAquariums(): Promise<Aquarium[]>`

**Failure**

Implement the final Care handler directly on the PR #65-only branch and pass its local `aquariums`/`appState` into #63 as `loadAquariums`, or copy/imitate #62 mutation methods into the UI branch.

**Risk**

- “fresh revalidation” is only nominal and misses remote/session changes;
- repository/mutation logic is duplicated across branches;
- later merge can silently choose the wrong Care hydration semantics;
- UI may compile in isolation yet violate the canonical architecture that the disposable audit proved only in the combined tree.

**Required**

Build the executable Care layer on a dedicated combined working branch:

`latest #62 canonical mutation/repository base + full #65 confirmation-entrypoint stack`

This is an implementation branch only; it does not merge any product PR into main. Reuse the already-audited two-file conflict set and fail on any new conflict.

Within that combined tree:

- pre/post `loadAquariums` must call repository `getAquariums()`;
- repository relocation must only be reachable through #63's injected callback;
- current page/local mirror is display/cache state, never mutation authorization state.

**Status**

New P0 architecture guard. Recorded before executable Care code is written. The initial `agent/care-relocation-confirmation-wiring` branch is investigation-only and should not become the final executable stack.

## Test infrastructure badcases

- TEST-001 — optional-call regex false failure; fixed without product-rule relaxation.
- TEST-002 — stacked workflow guessed wrong parent verifier filename; fixed by reusing PR #64 canonical verifier.

## Canonical integration result for #65

Disposable audit `31961690289` is GREEN:

- no new conflicts beyond the two known canonical/decision files;
- atomic mutation/SQL/wiring/receipt passed;
- fresh policy + uncertainty passed;
- confirmation + entrypoint passed;
- unresolved/Care hydration/severe-risk passed;
- real repository→policy TypeScript adapter passed;
- API TypeScript + build passed;
- no merge commit created.

## Care executable-layer exit gate

Before the next layer can be called safe:

- implemented on the intentional combined canonical tree, not the PR #65-only branch;
- stable operationId lifecycle tested;
- no operationId generation during render;
- uncertain/reconcile path sends no second mutation;
- no page-level direct `relocateLivestock()` call;
- pre/post fresh load is repository `getAquariums()`;
- repository relocation is reachable only inside `executeFreshRelocation` dependency injection;
- success/reconcile refreshes Care canonical decision state;
- blocked fresh result never writes;
- cancel/new-intent lifecycle cannot reuse terminal attempt IDs;
- browser Golden Path later covers open → confirm → fresh block/success/reconcile;
- handoff/badcase are updated as each new failure is found.
