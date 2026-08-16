# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living continuation record for PR #62 mutation receipt, PR #63 fresh execution policy, PR #64 confirmation surface, and PR #65 confirmation entrypoint. Draft/green CI is not main/production. No product PR is merged or Ready.

## Current safe chain

`read-only intervention → eligible confirmation entrypoint → confirmation facts → fresh canonical load → fresh source decision → fresh destination verdict → atomic relocation receipt → fresh canonical reload/recompute → confirmation outcome`

Current product boundary remains deliberate: the Care page still does **not** have a repository-backed executable relocation path.

## Stable foundations

- PR #62 returns receipt only: `{ committed: true, replayed?: boolean }`; canonical refresh is separate.
- PR #63 never trusts cached UI verdicts and truthfully distinguishes `mutation_state_unknown` from `executed_post_state_unavailable`.
- PR #64 confirmation UI binds displayed IDs/quantity to the actual request, exposes no blind retry, and has no direct repository/API/Supabase dependency.
- PR #65 converts a formal species-level option into a confirmation launch candidate only when it maps losslessly to one factual source record + one explicit positive batch representing the full formal quantity.

## PR #65 — confirmation entrypoint

Draft PR: **#65 `Gate relocation confirmation entrypoint on factual source scope`**

Branch: `agent/relocation-confirmation-entrypoint`, base `agent/relocation-confirmation-surface` (#64).

Entrypoint invariants:

1. formal intervention + exact option must exist;
2. current `compatible_by_current_evidence` controls opener visibility only, never mutation authorization;
3. exactly one factual source record;
4. exactly one positive explicit batch;
5. resolved, record, batch and formal quantities agree;
6. multi-record / multi-batch / missing-batch / quantity-drift cases remain unavailable and explain why;
7. no arbitrary first-record / first-batch selection;
8. launch candidate has no `operationId`, cached verdict, `isSafe`, `allowed`, or expected compatibility.

Implemented:

- pure `relocationConfirmationEntrypoint` builder;
- source-scope regression suite;
- mutation-free UI static contract;
- optional `sourceAquarium` + `onOpenRelocationConfirmation(candidate)` on `InterventionComparisonPanel`;
- eligible cards expose `进入迁移确认`; click only emits the launch candidate;
- compatible-but-non-executable source scope shows a deterministic limitation;
- no repository/API/Supabase import or mutation in PR #65.

## PR #65 CI

Effective full-chain run `31961532732` passed:

- confirmation entrypoint source scope ✅
- entrypoint UI static contract ✅
- PR #64 confirmation state/surface ✅
- PR #63 fresh policy + mutation uncertainty ✅
- Tank Decision Support + Destination Evaluator + severe-risk ✅
- TypeScript ✅
- production build ✅

Two earlier red runs were test/CI harness mistakes only: optional-call regex parsing and a guessed non-existent inherited verifier filename. No business rule was loosened.

## Disposable canonical audit — GREEN

Workflow: `Canonical Relocation Entrypoint Integration Audit`
Run: `31961690289`
Audit branch: `integration/canonical-decision-support-audit`

Latest #62 mutation stack + full #65 stack were combined only in the runner using `git merge --no-commit --no-ff`.

Merge gate: **passed**. No new conflicts appeared; conflict set remained only the two previously known canonical/decision files:

- `.github/workflows/product-golden-path.yml`
- `src/services/aquarium/water-change.service.ts`

All disposable-tree gates passed:

- atomic relocation local regression ✅
- atomic relocation SQL/security contract ✅
- repository/API relocation wiring ✅
- mutation receipt boundary ✅
- fresh relocation execution policy ✅
- ambiguous mutation outcome ✅
- confirmation state + confirmation surface ✅
- confirmation entrypoint source scope + UI contract ✅
- Tank Decision Support + Destination Evaluator ✅
- unresolved livestock + Care hydration + severe-risk ✅
- real canonical repository → fresh policy TypeScript adapter ✅
- API TypeScript ✅
- production build ✅
- final assertion that no merge commit was created ✅

This clears PR #65's integration exit gate. It does **not** mean the stack is merged/live.

## Still intentionally blocked

- multi-record whole-subject relocation;
- multi-batch whole-subject relocation;
- unresolved source livestock;
- conditional / insufficient-data / not-recommended destinations;
- stale destination card used as execution authorization;
- automatic keeper choice;
- blind retry after uncertain mutation outcome;
- direct Care UI → `repository.relocateLivestock()`.

## Next layer now authorized to design

Create a separate Care-page confirmation wiring stack with this responsibility only:

`#65 launch candidate → one confirmation attempt identity → #64 RelocationConfirmationDialog → injected #63 executeFreshRelocation`

Requirements for that layer:

1. one `operationId` is created per **confirmation attempt**, not per render;
2. rerendering the dialog must not silently create a new operation identity;
3. uncertain/reconciliation states preserve the same operation identity;
4. a closed/cancelled idle attempt may be discarded; a completed or uncertain attempt must not be reused for a new move;
5. Care page must not call `repository.relocateLivestock()` directly;
6. repository mutation is reachable only inside the injected callback supplied to `executeFreshRelocation`;
7. canonical reload used by #63 must come from repository-backed state, not current page/local mirror assumptions;
8. success/reconciliation must refresh the page decision state from canonical repository data.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale verdict as authorization;
- no direct UI → repository mutation;
- no arbitrary first-record / first-batch selection;
- no partial batch move described as whole-conflict resolution;
- no second display-only quantity source;
- no `conditional` override;
- no Draft/CI result described as production rollout.
