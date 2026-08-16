# AquaGuide Relocation Execution Badcases — 2026-08-17

> Regression-oriented continuation after PR #63. These are the failure modes that must stay closed before any executable relocation control reaches the Care UI.

## REL-009 — Stale destination card authorizes mutation

**Failure:** the UI showed a destination as compatible earlier, tank facts changed, and the old card status is reused as authorization.

**Required:** execution begins with a fresh canonical aquarium load and rebuilds destination evaluation. No cached verdict field exists in the execution request.

**Current gate:** PR #63 `executeFreshRelocation()`.

## REL-010 — Conditional / insufficient / blocked destination is executable

**Failure:** `conditional`, `insufficient_data`, or `not_recommended` receives the same enabled move action as a currently compatible destination.

**Required MVP:** only `compatible_by_current_evidence` may reach the relocation mutation callback.

**Current gate:** PR #63 fresh destination classification.

## REL-011 — UI keeps pre-mutation tank decisions

**Failure:** relocation succeeds but source/destination conflict state remains the pre-mutation result.

**Required:** after mutation success, reload canonical aquarium state and recompute Tank Decision Support for both source and destination.

**Current gate:** PR #63 post-mutation reload/recompute.

## REL-013 — Source community changed after the intervention panel opened

**Failure:** an unresolved resident appears in the source tank after the read-only decision was shown, but an old formal intervention is still executable.

**Required:** fresh source decision must still have `formalInterventionAllowed=true` immediately before mutation.

**Current gate:** PR #63 source revalidation.

## REL-014 — Conflict disappeared but old CTA still moves livestock

**Failure:** another change already removed the blocker, but the user can still execute the old relocation option.

**Required:** requested species must still exist in the fresh formal relocation options.

**Current gate:** `source_subject_no_longer_formal_relocation_option`.

## REL-015 — Quantity changed after the UI was shown

**Failure:** read-only intervention said “relocate all 5”, current factual quantity is now 6, but an old request still moves 5 and claims the blocker was resolved.

**Required:** execution quantity must equal the freshly recomputed whole-subject formal option quantity.

**Current gate:** `requested_quantity_not_fresh_formal_option`.

## REL-016 — Whole-subject intervention spans multiple batches

**Failure:** the decision model proves blocker reduction only after moving the complete species population, but storage has batch 1 = 3 and batch 2 = 2. PR #62 moves one batch; the UI moves only 3 and reports the conflict as solved.

**Required:** keep the action non-executable until either:
1. an atomic multi-batch relocation mutation exists; or
2. partial relocation is modeled as a separate intervention and its post-action graph proves the remaining state.

**Current gate:** PR #63 rejects a requested single-batch quantity that cannot satisfy the fresh whole-subject option.

## REL-017 — Mutation committed but canonical reload fails

**Failure:** the database move committed, the post-write read fails, and the product reports “迁移失败” or blindly retries the mutation.

**Required:** represent this as `executed_post_state_unavailable`. Do not claim rollback. Do not offer a blind immediate retry with a new operation ID.

**Current gate:** PR #63 explicit post-commit uncertainty result.

## REL-018 — UI bypasses execution policy and calls repository directly

**Failure:** a Care component imports/calls `repository.relocateLivestock()` directly, bypassing fresh source/destination revalidation.

**Required:** future UI may call only the execution-policy boundary (or an injected callback that is proven to delegate to it). Static UI contract must reject direct repository relocation calls.

**Status:** next confirmation-surface gate.

## REL-019 — Cached verdict is added back to the mutation interface

**Failure:** future code adds `oldVerdict`, `expectedCompatibility`, `isSafe`, or similar UI-derived fields and treats them as execution authority.

**Required:** execution authority is recomputed from fresh canonical state. Cached display state may be shown for comparison only, never accepted as mutation permission.

**Current gate:** PR #63 request contract has no cached-verdict field. Future static contract must preserve this.

## REL-020 — Confirmation omits the factual move scope

**Failure:** confirmation says only “确认迁移” without restating source tank, destination tank, species, and quantity, so the user cannot verify what will change.

**Required:** confirmation surface must explicitly display all four facts before the execution callback is enabled.

**Status:** next confirmation-surface gate.

## REL-021 — Fresh revalidation blocks but UI still shows success

**Failure:** user presses confirm, fresh evaluation changes to blocked/unknown, policy returns `blocked`, but the component proceeds with optimistic success state.

**Required:** blocked execution must render the fresh reason/verdict and perform zero success transition.

**Status:** next confirmation-surface gate.

## REL-022 — Committed-but-unavailable state offers blind retry

**Failure:** `executed_post_state_unavailable` is rendered as a normal error with a “重试迁移” button, risking a second move under a new operation ID.

**Required:** switch to a synchronization/reload recovery state. The primary action is refresh/reconcile state, not re-execute mutation.

**Status:** next confirmation-surface gate.

## Exit gate before real Care relocation execution

All of the following must remain true:

- PR #62 atomic relocation contract + live rollback acceptance green;
- PR #63 fresh execution policy green;
- disposable #62 + #63 integration audit green with no new merge conflicts;
- repository → policy adapter compiles;
- confirmation surface never calls repository relocation directly;
- confirmation restates source/destination/species/quantity;
- blocked fresh revalidation performs no success transition;
- `executed_post_state_unavailable` has reconciliation semantics and no blind mutation retry;
- multi-batch whole-subject intervention remains non-executable until its own atomic/partial-intervention contract exists.
