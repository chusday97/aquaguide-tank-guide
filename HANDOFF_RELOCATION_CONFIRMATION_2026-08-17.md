# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living continuation record for PR #62 mutation receipt, PR #63 fresh execution policy, PR #64 confirmation surface, and PR #65 confirmation entrypoint. Draft/green CI is not main/production. No product PR is merged or Ready.

## Current safe chain

`read-only intervention → eligible confirmation entrypoint → confirmation facts → fresh canonical load → fresh source decision → fresh destination verdict → atomic relocation receipt → fresh canonical reload/recompute → confirmation outcome`

Current product boundary remains deliberate: the Care page still does **not** have a repository-backed executable relocation path.

## Stable foundations carried forward

- PR #62 returns mutation receipt only: `{ committed: true, replayed?: boolean }`; post-write canonical refresh is separate.
- PR #63 never trusts a cached UI verdict and distinguishes `mutation_state_unknown` from `executed_post_state_unavailable`.
- PR #64 confirmation UI binds displayed IDs/quantity to the actual request and has no direct repository/API/Supabase dependency or blind retry.
- Previous disposable #62 + #63 + #64 canonical audit is green and created no merge commit.

## PR #65 — confirmation entrypoint

Draft PR: **#65 `Gate relocation confirmation entrypoint on factual source scope`**

Branch: `agent/relocation-confirmation-entrypoint`, base `agent/relocation-confirmation-surface` (#64).

The intervention model is canonical-species-level while #62 mutation is factual-record + factual-batch-level. PR #65 therefore fails closed unless a formal whole-subject option maps losslessly to exactly one factual source record and exactly one positive explicit batch with the same quantity.

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

- `src/lib/relocationConfirmationEntrypoint.ts` pure fail-closed builder;
- source-scope regression suite;
- mutation-free UI static contract;
- optional `sourceAquarium` + `onOpenRelocationConfirmation(candidate)` on `InterventionComparisonPanel`;
- eligible cards expose `进入迁移确认`; click only emits the launch candidate;
- compatible-but-non-executable source scope shows a deterministic limitation;
- no repository/API/Supabase import or mutation in this PR.

## CI history

- `31961302689`: source-scope passed; new UI static regex false-failed optional-call syntax. Test-only fix.
- `31961390757`: source/UI/state passed; stacked workflow referenced a non-existent inherited test file. CI-config-only fix.
- `31961532732`: effective full-chain gate passed source-scope, entrypoint UI, #64 state/surface, #63 fresh policy + mutation uncertainty, Tank Decision Support, Destination Evaluator, severe-risk, TypeScript and production build. No business rule was loosened.

## Disposable canonical audit — in progress

Audit workflow: `Canonical Relocation Entrypoint Integration Audit`
Run: `31961690289`
Audit branch: `integration/canonical-decision-support-audit`

It checks latest #62 mutation stack + full #65 stack only in the runner using `git merge --no-commit --no-ff`.

Expected conflict set remains exactly:

- `.github/workflows/product-golden-path.yml`
- `src/services/aquarium/water-change.service.ts`

Any additional conflict fails the audit instead of being guessed away.

The disposable tree will rerun:

- atomic relocation local / SQL / repository wiring / receipt boundary;
- fresh execution policy + ambiguous mutation outcome;
- confirmation state/surface;
- confirmation entrypoint source/UI;
- decision support + destination evaluator;
- unresolved livestock + Care hydration + severe-risk;
- real repository → policy TypeScript adapter;
- API TypeScript + production build;
- final assertion that no merge commit was created.

## Still intentionally blocked

- multi-record whole-subject relocation;
- multi-batch whole-subject relocation;
- unresolved source livestock;
- conditional / insufficient-data / not-recommended destinations;
- direct UI → repository mutation;
- stale destination card used as execution authorization;
- automatic keeper choice;
- blind retry after uncertain mutation outcome.

## Next safe step after audit

Only if the disposable canonical audit is green: design a **separate** Care-page integration that creates one operation ID per confirmation attempt and injects PR #63 `executeFreshRelocation`. That future layer still must not let the page call `repository.relocateLivestock()` directly.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale verdict as authorization;
- no direct UI → repository relocation call in PR #65;
- no arbitrary first-record / first-batch selection;
- no partial batch move described as whole-conflict resolution;
- no second display-only quantity source;
- no `conditional` override;
- no Draft/CI result described as production rollout.
