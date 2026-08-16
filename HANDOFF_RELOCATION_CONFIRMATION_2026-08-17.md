# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Continuation snapshot after PR #62 receipt correction, PR #63 mutation-uncertainty hardening, PR #64 confirmation surface, and the disposable canonical confirmation integration audit. Draft/green CI is not main/production. No product PR was merged or marked Ready.

## Current conclusion

The safe relocation chain is now validated through the confirmation layer:

`read-only intervention → confirmation facts → fresh canonical load → fresh source decision → fresh destination verdict → atomic relocation mutation receipt → fresh canonical reload/recompute → confirmation outcome`

The Care page still has **no executable relocation button** in this stack. PR #64 is an isolated confirmation contract only.

## P0 corrected in PR #62: committed write must not be disguised as write failure

The first PR #62 API implementation called the atomic Supabase RPC and then immediately read source + destination aquariums before returning.

That created a dangerous ambiguity:

1. RPC commits relocation successfully;
2. post-RPC aquarium read fails;
3. API throws an error;
4. caller may interpret the error as “nothing moved” and submit another operation.

This is not safe for any state-changing product action.

### Corrected boundary

PR #62 now returns only a mutation receipt after RPC success:

`{ committed: true, replayed?: boolean }`

The API no longer performs source/destination snapshot reads inside the relocation response path.

The repository no longer returns/caches post-write aquarium snapshots from `relocateLivestock()`.

Canonical refresh is a separate PR #63 responsibility after the mutation acknowledgement.

### Verification

A new receipt-boundary regression was added and intentionally proven fail-before-fix on the old implementation.

Guarded exact-anchor write tooling patched the existing large API/repository files only after verification, then self-deleted.

Permanent PR #62 read-only CI now covers the receipt boundary in addition to the existing local/SQL/wiring/unresolved/type/build gates.

## PR #63 hardening: mutation callback rejection is outcome-unknown

A rejected mutation promise cannot prove database rollback.

Examples:

- request reached server but client connection dropped;
- RPC committed but HTTP response was lost;
- proxy/network failed after the write boundary.

PR #63 now returns:

`mutation_state_unknown`

with the same `operationId` when the mutation callback rejects.

Required behavior:

- do not say “迁移失败，未执行”;
- do not create a fresh operation ID and retry blindly;
- first reconcile canonical aquarium state;
- preserve the original operation identity for idempotent reconciliation.

The existing `executed_post_state_unavailable` remains distinct: in that case the mutation callback returned a receipt, but the subsequent canonical reload/recompute failed.

Both states mean the UI must synchronize before another relocation action.

## PR #64 — Relocation confirmation surface

Draft PR #64 is stacked on PR #63.

New files:

- `src/lib/relocationConfirmationState.ts`;
- `src/components/compatibility/RelocationConfirmationDialog.tsx`;
- confirmation state/static UI regressions;
- permanent read-only confirmation CI.

### Confirmation facts

Before execution the dialog explicitly displays:

- source aquarium;
- destination aquarium;
- livestock/species label;
- quantity.

The displayed quantity comes directly from `RelocationExecutionRequest.quantity`, which is the same value passed to the execution policy.

There is no independent `facts.quantity`, preventing a display/execute mismatch such as “show 5, submit 6”.

Source/destination IDs are also read from the request; names are display labels only.

### Execution boundary

The component accepts only:

`executeFreshRelocation(request) -> Promise<RelocationExecutionResult>`

The component does not import/call:

- `AquaGuideRepository`;
- `relocateLivestock()`;
- `apiRequest`;
- Supabase.

Therefore a future UI wiring cannot satisfy this component by passing the raw repository mutation method; it needs the PR #63 fresh execution-policy boundary.

### User-visible states

#### Idle/checking
Primary action:

`重新检查并确认迁移`

Copy states that the earlier destination card is not authorization and both tanks are reloaded/recomputed before mutation.

#### Blocked
Shows:

`条件已变化，本次没有执行迁移`

and a fresh block reason.

No success transition occurs.

#### Completed
Shows that relocation completed and both tanks were recalculated.

#### Reconciliation required
Both:

- `mutation_state_unknown`;
- `executed_post_state_unavailable`

show synchronization recovery rather than mutation retry.

Primary recovery action:

`重新同步鱼缸状态`

There is no `重试迁移 / Retry relocation` control.

Unexpected thrown errors are also handled conservatively as reconciliation-required because the component cannot prove which side of the write boundary failed.

## Blind retry invariant

`relocationOutcomeAllowsBlindMutationRetry()` returns false for all terminal confirmation outcomes.

Reason:

- blocked → requires a newly evaluated proposal, not replaying the old confirmation;
- completed → action is already done;
- uncertain → reconcile canonical state first.

## PR #64 CI

Permanent confirmation CI is green:

- confirmation-state regression;
- confirmation UI static contract;
- fresh relocation execution policy regression;
- ambiguous mutation-outcome regression;
- TypeScript;
- production build.

PR-triggered inherited Care/decision gates checked at the same head are also green where completed; the read-only Care browser gate remained a separate inherited check.

## Canonical confirmation integration audit

Disposable workflow:

`.github/workflows/canonical-relocation-confirmation-integration-audit.yml`

Runner base:

PR #62 latest canonical relocation head.

Runner merge:

PR #64 confirmation head, which includes PR #63 decision-policy stack.

Observed conflict set remained exactly the two previously known canonical/decision files:

1. `.github/workflows/product-golden-path.yml`;
2. `src/services/aquarium/water-change.service.ts`.

No new relocation receipt, execution-policy, confirmation, repository, API or type conflict appeared.

### Joint gates — all green

- atomic mutation receipt boundary;
- fresh relocation execution policy;
- ambiguous mutation outcome;
- confirmation state;
- confirmation UI static contract;
- canonical unresolved livestock;
- canonical Care hydration;
- Reviewed Severe-Risk regression;
- canonical repository → fresh policy callback TypeScript adapter;
- API TypeScript;
- production build;
- no-merge-commit assertion.

No merge commit or push was created by the audit.

## Still intentionally blocked

### No Care-page execute CTA yet

PR #64 does not add a user-reachable relocation button.

### Multi-batch whole-subject relocation

Current formal intervention may mean “move all 5 of species A”, while factual storage may be batch 1 = 3, batch 2 = 2.

PR #62 moves one explicit batch; PR #63 therefore blocks this case rather than moving only 3 and claiming the whole conflict was resolved.

### No conditional override

Only fresh `compatible_by_current_evidence` may execute.

### No automatic keeper choice

The system still does not decide which animal the keeper must give up.

## Next safe execution boundary

The next PR should **only wire the confirmation opener**, not introduce a new mutation path:

1. in `InterventionComparisonPanel`, show an execute/confirm entry only for a formal relocation option whose current destination card is `compatible_by_current_evidence`;
2. derive source record + exact executable batch from canonical decision context rather than display text;
3. generate/preserve one operation ID for the confirmation attempt;
4. open `RelocationConfirmationDialog` with request-bound source/destination/species/quantity facts;
5. execution callback must be PR #63 `executeFreshRelocation`, never repository relocation directly;
6. blocked result keeps the user in the decision surface with the fresh reason;
7. uncertain result goes to synchronization recovery and has no blind retry;
8. multi-batch whole-subject cases display why execution is unavailable rather than hiding the boundary.

Only after this open-confirmation wiring has static + browser acceptance should a canonical Care integration inject the real repository-backed callback.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale destination card as authorization;
- no direct UI → repository relocation call;
- no API post-write read failure rewritten as mutation failure;
- no blind retry after mutation transport ambiguity;
- no second display-only quantity source;
- no partial batch move described as whole-conflict resolution;
- no `conditional`/`insufficient_data` override;
- no Draft/CI result described as production rollout.
