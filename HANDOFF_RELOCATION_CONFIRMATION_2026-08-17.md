# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living continuation record for PR #62 mutation receipt, PR #63 fresh execution policy, PR #64 confirmation surface, PR #65 confirmation entrypoint, and the Care wiring investigation. Draft/green CI is not main/production. No product PR is merged or Ready.

## Current safe chain

`read-only intervention → eligible confirmation entrypoint → confirmation facts → fresh canonical load → fresh source decision → fresh destination verdict → atomic relocation receipt → fresh canonical reload/recompute → confirmation outcome`

The Care page still does **not** have a repository-backed executable relocation path.

## Stable foundations

- PR #62: atomic verified single-batch relocation; receipt-only mutation result.
- PR #63: fresh source/destination revalidation; `mutation_state_unknown` and `executed_post_state_unavailable` remain truthful non-retry states.
- PR #64: confirmation dialog/state machine; no direct repository/API/Supabase dependency.
- PR #65: confirmation opener only when the formal whole-subject option maps losslessly to one factual record + one explicit positive batch; no cached verdict becomes mutation authorization.
- PR #65 isolated full-chain CI `31961532732` is green.
- Disposable latest #62 + #65-stack canonical audit `31961690289` is green, with no new conflict beyond the two known canonical/decision files and no merge commit.

## Care wiring investigation — new structural finding

A branch `agent/care-relocation-confirmation-wiring` was initially cut from PR #65 to inspect the next layer. **Do not implement repository-backed relocation directly on this branch.**

Reason: the UI/decision stack and canonical mutation/repository stack are still separate PR stacks.

### What the code actually shows

On the PR #65-side Care code, `StepDiagnosisPanel` still initializes:

`const appState = useMemo(() => loadAppStateFromStorage(), [])`

so its aquarium set is a page/local snapshot.

On the PR #62-side Care code this was improved to a subscribed local mirror:

`const [appState, setAppState] = useState(loadAppStateFromStorage)` + `subscribeToAppState(...)`

but that is still **not** execution-time `repository.getAquariums()`.

Therefore neither page snapshot nor local mirror alone satisfies PR #63's fresh canonical loader requirement.

At the same time, PR #62's repository interface exposes the canonical read needed for the real execution path:

`getAquariums(): Promise<Aquarium[]>`

and #62 owns the relocation mutation contract that PR #65's branch does not contain.

### Consequence

The next executable layer must be built on an intentional **combined canonical working tree**, not by hard-wiring repository mutation into the PR #65-only Care file.

Safe working shape:

`latest #62 canonical mutation/repository base + full #65 confirmation-entrypoint stack → Care relocation controller/wiring`

The previous disposable audit already proves those stacks can coexist with only the two known semantic conflict resolutions. For implementation, create a separate integration work branch from #62 and bring in #65 deliberately; do not merge any product PR into main.

## Required Care execution architecture

The future Care layer remains:

`#65 candidate → one stable confirmation-attempt operationId → #64 dialog → #63 executeFreshRelocation`

with execution dependencies:

- `loadAquariums: () => repository.getAquariums()` at pre-write and post-write time;
- `relocate` reachable only inside the callback injected into `executeFreshRelocation`;
- page/React/localStorage state never used as the fresh authorization source;
- successful/reconciled canonical reads refresh the Care decision surface.

## Operation identity requirements

1. generate operationId on opening a new confirmation attempt, never during render;
2. keep it stable through that attempt;
3. reconciliation sends no second mutation and does not generate a new operationId;
4. idle cancel may discard an unused attempt;
5. completed/uncertain terminal attempts cannot be repurposed for a different move.

## Immediate next step

1. stop code changes on the PR #65-only Care wiring branch after this investigation record;
2. create a dedicated canonical implementation branch from latest #62;
3. combine the full #65 stack into that branch using the already-audited conflict set; no main/PR merge;
4. add a small relocation execution adapter/controller that explicitly uses repository `getAquariums()` and injects repository relocation only under #63;
5. add attempt-lifecycle regressions before changing Care JSX;
6. then wire `StepDiagnosisPanel → InterventionComparisonPanel → RelocationConfirmationDialog` against that controller;
7. keep handoff/badcase updated before every newly discovered boundary is fixed.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale verdict as authorization;
- no direct Care UI → repository relocation;
- no local mirror presented as fresh canonical execution state;
- no arbitrary first-record / first-batch selection;
- no partial batch move described as whole-conflict resolution;
- no second display-only quantity source;
- no `conditional` override;
- no Draft/CI result described as production rollout.
