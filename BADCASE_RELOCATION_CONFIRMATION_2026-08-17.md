# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Additional regression set discovered while moving from atomic relocation infrastructure to a user confirmation surface.

## REL-023 — RPC committed, post-write API read fails, caller thinks mutation failed

**Failure path**

1. atomic relocation RPC commits;
2. API immediately reads source/destination snapshots;
3. snapshot read fails;
4. API rejects;
5. caller treats rejection as “nothing moved” and may retry.

**Risk:** duplicate relocation / incorrect quantities.

**Required:** RPC success returns mutation receipt immediately. Post-write canonical refresh is a separate execution-policy concern.

**Current fix:** PR #62 receipt-only boundary:

`{ committed: true, replayed?: boolean }`

No post-RPC source/destination read in the relocation route.

## REL-024 — Mutation transport rejects after request crossed write boundary

**Failure:** `relocate()` promise rejects due to network/proxy/client disconnect and UI assumes rollback.

**Required:** return `mutation_state_unknown`, preserve the same operation ID, reconcile canonical state before any further relocation.

**Current fix:** PR #63.

## REL-025 — Confirmation has a second display-only quantity

**Failure:** dialog receives `facts.quantity=5` but execution request contains `quantity=6`; user confirms one scope while system submits another.

**Required:** display quantity directly from `RelocationExecutionRequest.quantity`. No independent confirmation quantity field.

**Current fix:** PR #64.

## REL-026 — Confirmation component imports repository mutation directly

**Failure:** `RelocationConfirmationDialog` calls `repository.relocateLivestock()` or API/Supabase itself and bypasses fresh revalidation.

**Required:** component callback type is:

`executeFreshRelocation(request) -> Promise<RelocationExecutionResult>`

Static contract rejects `AquaGuideRepository`, `relocateLivestock`, `apiRequest`, and `supabase` imports/calls.

**Current fix:** PR #64.

## REL-027 — Blocked fresh result still becomes optimistic success UI

**Failure:** destination/source changed; policy returns `blocked`; dialog closes or shows “迁移成功”.

**Required:** blocked has a separate state and explicit text:

`条件已变化，本次没有执行迁移`

No success transition.

**Current fix:** PR #64 confirmation state.

## REL-028 — Outcome-unknown state exposes “重试迁移”

**Failure:** user sees generic error and retries under a new operation ID before checking whether the first request committed.

**Required:** `mutation_state_unknown` and `executed_post_state_unavailable` expose only synchronization/reconciliation recovery. No blind mutation retry.

**Current fix:** static UI contract rejects `重试迁移 / Retry relocation` and exposes `重新同步鱼缸状态`.

## REL-029 — Completed confirmation allows same mutation to be fired again

**Failure:** success UI retains an enabled execute/retry action.

**Required:** completed is terminal. `relocationOutcomeAllowsBlindMutationRetry()` is false.

**Current fix:** PR #64 state helper/regression.

## REL-030 — Blocked confirmation blindly retries old proposal

**Failure:** a blocked result retains an immediate retry button using the same stale displayed proposal.

**Required:** blocked requires a newly evaluated proposal/decision surface. It is not an execution retry state.

**Current fix:** all terminal outcomes have blind retry disabled.

## REL-031 — Confirmation labels are correct but IDs come from another request

**Failure:** source/destination names are shown correctly, but submitted IDs are not tied to the displayed confirmation request.

**Required:** source/destination data attributes and execution payload come from the same `RelocationExecutionRequest`; names are labels only.

**Current fix:** PR #64 request-bound markers.

## REL-032 — Unexpected thrown UI callback error treated as definitely pre-write

**Failure:** confirmation wrapper catches an unexpected thrown error and displays “未迁移，可重试” even though it cannot know where the error happened.

**Required:** conservative reconciliation state unless the execution contract positively proves a blocked/no-write result.

**Current fix:** PR #64 unexpected callback errors go to synchronization recovery.

## REL-033 — Confirmation stack works alone but conflicts with canonical mutation stack

**Failure:** #64 passes TypeScript on #63, but integrating #62 receipt-only repository changes creates type/conflict drift.

**Required:** disposable canonical confirmation audit merges latest #64 onto latest #62 head, accepts only the two already-reviewed canonical conflicts, compiles repository→policy adapter, and runs receipt/policy/confirmation/canonical gates.

**Current status:** green, no merge commit pushed.

## Exit gate before user-reachable execution CTA

All must remain true:

- PR #62 receipt-only atomic mutation gate green;
- PR #63 fresh policy + mutation-unknown gate green;
- PR #64 confirmation state/UI gate green;
- canonical #62 + #64 disposable audit green;
- displayed quantity comes from actual request;
- confirmation component has no direct repository/API/Supabase dependency;
- blocked does not transition to success;
- uncertain outcomes expose sync/reconcile only;
- completed has no mutation retry;
- multi-batch whole-subject cases remain non-executable;
- next UI PR only opens confirmation from an eligible destination; it does not invent a second mutation path.
