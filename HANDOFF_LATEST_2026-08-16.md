# AquaGuide Latest Handoff — 2026-08-16

> Latest execution snapshot. This supplements the earlier dated handoff files. Draft/green CI is not main/production. No product PR has been merged or marked Ready by this execution.

## Current conclusion

The decision-support architecture is now sufficiently complete to stop expanding feature layers. Current priority is **data/evidence correctness and stack convergence**, then repository-backed Care/Aquarium page integration.

Current logical chain:

`canonical aquarium facts → catalog grounding → reviewed compatibility evidence → conflict graph → counterfactual intervention → action plan → keeper-choice comparison → destination evaluation → diagnosis augmentation`

## Canonical / account stack

- PR #34 canonical repository/state: Draft/unmerged. Observation reachability is fixed and canonical observation persistence remains repository-first.
- PR #35 Magic Link/auth: code-level gates green; real deployed Magic Link + two-device browser acceptance is still an external rollout gate.
- PR #38 unresolved existing livestock: Draft/unmerged. Unknown real livestock is stored without invented catalog identity and future decisions fail closed. Supabase migration/RLS/idempotency acceptance has been exercised; deployed-browser cross-device unresolved hydrate remains a rollout gate.

## Decision / diagnosis stack

The following layers have targeted green CI at their checked heads:

- #40 replacement recommendation;
- #41 real risk/alternatives UI;
- #42 whole-community conflict graph;
- #43 counterfactual intervention simulator;
- #44 action engine;
- #45 keeper-choice comparison;
- #46 destination evaluator;
- #47 Tank Decision Context;
- #48 Tank Decision Support orchestrator;
- #49 read-only Intervention Comparison UI;
- #50 diagnosis conflict evidence;
- #51 reviewed severe-risk regression;
- #52 Quick Diagnosis conflict augmentation;
- #53 deterministic vs contextual reviewed evidence split.

## Reviewed evidence correction — PR #56

PR #56 is now corrected and green at its latest checked head.

### Canonical identity correction

The earlier draft incorrectly bound lionfish evidence to `sp_0130`.

That was false:

- `sp_0130` is a legacy alias that resolves to `sp_0038`;
- canonical `sp_0038` is `Opsariichthys bidens` / 马口鱼;
- actual catalog `Pterois volitans` / 长鼻狮子鱼 is `sp_0453`.

Reviewed lionfish evidence is now owned by `sp_0453`, and regression explicitly prevents `sp_0130` from receiving that profile.

### Evidence scope

Lionfish adds only the reviewed claims directly supported by the cited evidence:

- `predatory`;
- `predationTargets=['small_fish']`;
- medium confidence;
- peer-reviewed PLOS ONE provenance.

No unrelated territorial/aggression trait was added.

### Fixture correction

The earlier draft also incorrectly treated `Amphiprion ocellaris` as Small; the catalog records it as Medium.

The lionfish regression was hardened so its target must be:

- explicit catalog `category='海水鱼'`;
- animal life type `fish`;
- water service result `saltwater`;
- `size='Small'`.

The current catalog provides a real Small marine target under this stricter gate.

### Evaluation boundary

The cross-layer Reviewed Severe-Risk suite remains **4 real catalog severe fixtures**, not 5. It still reports 0 cross-layer severe false negatives for those four currently reviewed severe fixtures. Lionfish has a dedicated rule-level reviewed regression but is not used to inflate the cross-layer fixture count.

### Cleanup / CI

All one-shot write-enabled lionfish patch tooling self-deleted after verified execution. Final PR diff contains only permanent read-only CI, evidence/test files and the central getter integration.

Latest checked #56 head passed:

- Lionfish Reviewed Evidence;
- Lionfish Clean State;
- Recommendation Grounding Contract;
- Contextual Evidence Expansion;
- Tank Intervention Simulator;
- Conflict Action Engine;
- Reviewed Severe Risk Regression.

## Latest canonical + decision/evidence integration audit

Read-only branch: `integration/canonical-decision-support-audit`.

The latest audit merges the canonical/unresolved tree with the corrected #56 decision/evidence head **only inside a disposable runner** using `git merge --no-commit --no-ff`.

Observed conflict set remains exactly the two previously known files:

1. `.github/workflows/product-golden-path.yml`;
2. `src/services/aquarium/water-change.service.ts`.

The runner-only resolution preserves the previously audited semantic union for water-change state and executes decision gates explicitly.

The temporary merged tree passed:

- canonical water-change repository boundary;
- future-date water-change regression;
- unresolved livestock contract;
- livestock recording regression;
- Tank Decision Context;
- Tank Decision Support orchestration;
- Quick Diagnosis conflict augmentation;
- contextual behavior evidence;
- corrected canonical lionfish reviewed predation;
- 4-fixture Reviewed Severe-Risk regression;
- whole-tree TypeScript;
- production build;
- final no-merge-commit check.

No merge commit was created or pushed.

## Newly discovered P0 data bug

During the lionfish fixture audit, `getSpeciesWaterType()` allowed `Pseudogastromyzon fangi` / 方氏拟腹吸鳅 to satisfy a saltwater target search even though this is not a valid marine control fixture.

The lionfish test has been hardened with an explicit marine-category gate so the regression cannot exploit this bug.

This water-type misclassification is now the next P0 engineering issue because incorrect habitat classification can contaminate compatibility/recommendation results across the product.

## Next execution order

1. Root-cause and fix the `Pseudogastromyzon fangi` water-type misclassification; add a species-water regression rather than only patching the lionfish test.
2. Re-run recommendation/compatibility/integration gates to prove no new water-type regressions.
3. Then begin deliberate canonical page integration: repository-hydrated Care/Aquarium state → #48 Decision Support → #52 diagnosis augmentation / #49 read-only intervention UI.
4. Keep mutation actions disabled until the read-only decision path is user-visible and validated.
5. Keep #35 real Magic Link/two-device rollout as a separate external deployment gate.

## Non-negotiable constraints

- no merge or Ready transition without explicit user instruction;
- no reviewed evidence bound by guessed/legacy ID;
- no regression test may rewrite catalog facts just to trigger a rule;
- no water-type fallback may silently turn an uncertain/freshwater species into marine/freshwater certainty;
- no catalog-wide safety/accuracy claim from sparse reviewed evidence;
- no Draft/CI result described as production rollout.
