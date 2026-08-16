# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living continuation record for PR #62 mutation receipt, PR #63 fresh execution policy, PR #64 confirmation surface, and the next confirmation-entrypoint layer. Draft/green CI is not main/production. No product PR is merged or Ready.

## Current safe chain

`read-only intervention → eligible confirmation entrypoint → confirmation facts → fresh canonical load → fresh source decision → fresh destination verdict → atomic relocation receipt → fresh canonical reload/recompute → confirmation outcome`

Current product boundary remains deliberate: the Care page does not yet have a repository-backed executable relocation path.

## Stable foundations carried forward

- PR #62 returns mutation receipt only: `{ committed: true, replayed?: boolean }`; post-write canonical refresh is separate.
- PR #63 never trusts a cached UI verdict. It fresh-loads source/destination facts, rebuilds the source formal intervention, requires an exact whole-subject quantity, freshly re-evaluates the destination, and only allows `compatible_by_current_evidence` to reach mutation.
- PR #63 distinguishes `mutation_state_unknown` from `executed_post_state_unavailable`; both require reconciliation before another mutation attempt.
- PR #64 confirmation UI binds displayed source/destination IDs and quantity to the actual execution request and has no direct repository/API/Supabase dependency.
- PR #64 has no blind relocation retry state.
- Latest disposable #62 + #63 + #64 canonical audit is green and created no merge commit.

## Live progress — confirmation entrypoint

Branch: `agent/relocation-confirmation-entrypoint`, stacked on PR #64.

### 2026-08-17 — first source-scope audit

The formal intervention model is species-level, while the atomic mutation contract is source-record + source-batch-level.

`TankDecisionContext.resolvedLivestock` can aggregate multiple factual source records into one canonical species:

- `quantity` is summed across records;
- `sourceRecordIds` can contain more than one record;
- aliases can resolve multiple source species IDs into one canonical species.

Therefore a card such as “if species A ×5 leaves the tank” is **not enough information to construct a mutation request**.

New entrypoint invariant:

1. the subject must still be a formal relocation option in the supplied decision result;
2. the chosen destination card must currently be `compatible_by_current_evidence` only to expose the confirmation opener — this card is still not mutation authorization;
3. the formal subject must map to exactly one factual source record;
4. that source record must have an explicit batch that alone represents the whole formal subject quantity;
5. the record quantity, selected batch quantity, and formal option quantity must agree;
6. if the subject spans multiple source records or multiple positive batches, direct confirmation stays unavailable and the UI must explain the current single-batch boundary;
7. the opener must not pick `sourceRecordIds[0]` or `batches[0]` arbitrarily;
8. the opener must not pass cached compatibility as `isSafe`, `allowed`, or another authorization field.

### Architecture for this PR

The panel will emit a **confirmation launch candidate**, not a mutation authorization. Candidate facts may contain source/destination/record/batch/quantity identifiers plus display labels, but no cached safety boolean and no mutation call.

`InterventionComparisonPanel → onOpenRelocationConfirmation(candidate)`

The panel itself remains repository/API/Supabase-free. A later Care integration may turn that candidate into one confirmation attempt / operation ID and inject PR #63 `executeFreshRelocation`; that repository-backed integration is not introduced here.

## Still intentionally blocked

- multi-record whole-subject relocation;
- multi-batch whole-subject relocation;
- unresolved source livestock;
- conditional / insufficient-data / not-recommended destinations;
- direct UI → repository mutation;
- stale destination card used as execution authorization;
- automatic keeper choice;
- blind retry after any uncertain mutation outcome.

## Immediate next implementation steps

1. add a pure confirmation-entrypoint eligibility builder using `TankDecisionSupportResult + source Aquarium`;
2. regression-test exact single-record/single-batch success and all fail-closed ambiguity cases;
3. wire eligible destination CTA into `InterventionComparisonPanel` through an optional opener callback only;
4. show a deterministic unavailable reason for multi-record / multi-batch cases instead of silently hiding the limitation;
5. keep static contract forbidding repository/API/Supabase imports and cached-verdict authorization fields;
6. run TypeScript/build and inherited decision regressions;
7. open a Draft PR stacked on #64 only after those gates are green;
8. run a disposable canonical audit before any Care-page repository-backed execution wiring.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale verdict as authorization;
- no direct UI → repository relocation call in the entrypoint PR;
- no arbitrary first-record / first-batch selection;
- no partial batch move described as whole-conflict resolution;
- no second display-only quantity source;
- no `conditional` override;
- no Draft/CI result described as production rollout.
