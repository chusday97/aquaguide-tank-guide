# AquaGuide Relocation Execution Handoff — 2026-08-17

> Continuation snapshot after PR #63 and the canonical relocation integration audit. Draft/green CI is not main/production. No product PR was merged or marked Ready.

## Current conclusion

AquaGuide now has both halves required before an executable relocation UI can exist:

1. **atomic canonical mutation** — PR #62;
2. **fresh decision-side execution policy** — PR #63.

The validated contract is now:

`fresh canonical load → fresh source intervention decision → fresh destination evaluation → compatible_by_current_evidence only → repository.relocateLivestock() → fresh canonical reload → recompute both tanks`

A verdict captured earlier by the UI is never mutation authorization.

## PR #63 — Fresh relocation execution policy

Draft PR #63 is stacked on PR #61's read-only Care/browser decision path.

New pure module:

`src/lib/relocationExecutionPolicy.ts`

The policy takes:

- a relocation request containing source tank/record/batch, destination, quantity and operation ID;
- the canonical catalog;
- `loadAquariums()`;
- an injected `relocate()` callback.

It deliberately does not import/copy the repository implementation from PR #62.

### Fresh pre-mutation gates

Before `relocate()` can run, the policy loads a fresh aquarium set and checks:

- quantity is a positive integer;
- source and destination are different and still exist;
- source factual record still exists;
- unresolved source identity is rejected;
- selected source batch still exists and contains the requested quantity;
- source species still grounds to a canonical catalog species;
- fresh `buildTankDecisionSupport()` still allows formal intervention;
- requested subject is still a fresh formal relocation option;
- requested quantity still matches the fresh whole-subject relocation option;
- requested destination is present in the freshly recomputed destination evaluation;
- destination status is exactly `compatible_by_current_evidence`.

The following are non-executable:

- `conditional`;
- `insufficient_data`;
- `not_recommended`;
- no current destination evaluation.

The public execution request contains no old/cached verdict field, so a UI card cannot pass its previous status as authorization.

## Important new product boundary: whole-subject vs single-batch

The decision/action stack currently models a relocation intervention as moving the **whole subject species** and then counterfactually recomputing the remaining community.

PR #62 v1 mutation moves **one explicit batch** atomically.

Therefore PR #63 intentionally blocks a move when the fresh formal whole-subject quantity cannot be satisfied by the selected batch.

Example:

- formal action: relocate all 5 fish of species A;
- factual storage: batch 1 = 3, batch 2 = 2;
- current PR #62 mutation can move only one batch per call.

The product must not move 3 and claim the whole-community blocker has been resolved.

Future choices:

1. add an atomic multi-batch relocation mutation; or
2. model partial relocation as a distinct intervention and prove the post-action graph after moving only part of the population.

Until then, this case stays blocked.

## Post-commit truthfulness

After an allowed mutation returns, the policy loads canonical state again and recomputes:

- source `TankDecisionSupport`;
- destination `TankDecisionSupport`.

If the mutation callback returned successfully but the subsequent reload fails, the policy returns:

`executed_post_state_unavailable`

It does not claim rollback/failure because the mutation may already be committed.

## PR #63 regression result

Permanent read-only `Relocation Execution Policy` CI is green.

Passed:

- fresh relocation execution policy regression;
- Tank Decision Support regression;
- Relocation Destination Evaluator regression;
- Reviewed Severe-Risk regression;
- whole-tree TypeScript;
- production build.

### First CI failure and correction

The initial green-path fixture assumed a real neon tetra in an otherwise empty configured destination must evaluate to `compatible_by_current_evidence`.

That assumption was too strong: a real species may still have additional husbandry/evidence confirmations.

The product gate was **not relaxed**.

The green path now uses the same deliberately simple synthetic freshwater control pattern used by the existing destination-evaluator regression, while the source conflict still uses a real reviewed predator profile. This isolates execution-policy semantics from unrelated species husbandry assumptions.

## Canonical mutation + decision-policy integration audit

Workflow:

`.github/workflows/canonical-relocation-execution-integration-audit.yml`

The runner checks out PR #62's canonical relocation head and merges PR #63's decision-policy head using `git merge --no-commit --no-ff`.

Observed merge-conflict set remained only the two already-known canonical/decision conflicts:

1. `.github/workflows/product-golden-path.yml`;
2. `src/services/aquarium/water-change.service.ts`.

No new repository, relocation, types or execution-policy conflict appeared.

The audit used the previously reviewed runner-only water-change semantic union and created no merge commit or push.

### Joint gates — all green

- canonical unresolved livestock contract;
- atomic relocation local regression;
- atomic relocation SQL/security contract;
- repository/API relocation wiring contract;
- fresh relocation execution policy;
- Tank Decision Support;
- Relocation Destination Evaluator;
- Reviewed Severe-Risk regression;
- canonical Care hydration contract;
- repository → policy compile adapter;
- API TypeScript;
- production build;
- final no-merge-commit assertion.

## Repository → policy adapter proof

The integration runner generated a temporary TypeScript-only adapter proving the real PR #62 interface is structurally compatible with PR #63:

`AquaGuideRepository.relocateLivestock(request) → Promise<RelocationMutationReceipt-compatible result>`

The repository returns additional source/destination canonical snapshots, which are a safe superset of the minimal execution receipt expected by the policy.

This means the eventual canonical integration does not need a second relocation mutation service.

## Current remaining boundary

Do **not** add a direct move button yet.

The next safe product step is a **confirmation/execution surface contract**, not more decision logic:

1. expose an executable CTA only for a currently `compatible_by_current_evidence` destination and only when the selected subject/batch satisfies PR #63;
2. confirmation screen must restate source, destination, species and quantity;
3. clicking confirm must call the fresh execution policy, not the repository directly;
4. if fresh revalidation changed, cancel execution and show the new verdict/reason;
5. on success, render the recomputed source/destination state;
6. if `executed_post_state_unavailable`, show “迁移可能已完成，正在重新同步状态” semantics rather than offering an immediate blind retry;
7. multi-batch whole-subject cases remain non-executable until a dedicated atomic contract exists.

## Non-negotiable constraints

- no PR merge or Ready transition without explicit instruction;
- UI never calls repository relocation directly;
- no cached verdict authorizes mutation;
- only `compatible_by_current_evidence` is executable in MVP;
- unresolved source/destination evidence remains fail-closed;
- no partial-batch move may be described as full conflict resolution;
- no automatic keeper choice;
- no “safe/guaranteed” wording;
- no Draft/CI result described as production rollout.
