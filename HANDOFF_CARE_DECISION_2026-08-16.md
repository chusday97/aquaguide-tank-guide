# AquaGuide Care Decision Handoff — 2026-08-16

> Latest continuation snapshot after the read-only decision path reached browser-level canonical acceptance. All product PRs remain Draft/unmerged. This is not a production rollout statement.

## Read path is now closed end-to-end

The following path is now implemented, unit/contract tested, merged-tree tested, production-built, and browser-reachable:

`repository-hydrated Care state → Quick Diagnosis → reviewed behavior conflict → explicit A→B / A↔B evidence → read-only intervention comparison → reactive other-tank destination verdict`

No livestock mutation is exposed.

## Water/catalog correctness corrections completed before UI integration

### PR #57 — ambiguous marine text

Root cause: the marine-text classifier contained the bare token `蝶鱼`. `Pseudogastromyzon fangi` / 方氏拟腹吸鳅 has the common name “蝴蝶鱼”, so the substring incorrectly produced saltwater certainty.

Fix:
- remove ambiguous bare `蝶鱼` text trigger;
- add explicit high-confidence freshwater evidence for `Pseudogastromyzon fangi`;
- protect true marine butterflyfish through explicit marine category/taxon evidence.

### PR #58 — stale marine categories

Corrected historical `category='海水鱼'` on:
- `sp_0057` `Altolamprologus calvus`;
- `sp_0058` `Neolamprologus multifasciatus`;
- `sp_0266` `Altolamprologus calvus var. Gold`.

Added high-confidence freshwater evidence for the base taxa and a general invariant: a catalog entity with explicit reviewed freshwater evidence may not continue to display as `海水鱼`.

Lionfish regression was also hardened to use fixed audited Small marine control `sp_0297` instead of dynamically selecting the first record that appears marine.

## PR #59 — Care conflict decision surface

Quick Diagnosis keeps the existing `buildStepDiagnosisResult()` as the primary symptom/water-quality result.

For behavior-relevant issues, the Care result now additionally consumes:
- `buildTankDecisionSupport()`;
- `buildQuickDiagnosisConflictAugmentation()`;
- existing read-only `InterventionComparisonPanel`.

User can see:
- exact A→B / A↔B conflict;
- first reviewed cause/evidence;
- decision-support next step;
- action boundary/limitations;
- partial-community warning when unresolved livestock exists;
- a read-only comparison CTA only when counterfactual evidence supports it.

No remove/delete/relocate mutation exists in this block.

## PR #60 — reactive relocation destinations

After canonical merged-tree verification proved Care subscribes to PR #34 repository-hydrated app state, the decision surface began supplying:

`allAquariums: aquariums`

with memo dependencies on both `targetAquarium` and the reactive aquarium list.

Every other tank is re-evaluated through the existing destination evaluator and can return:
- `compatible_by_current_evidence`;
- conditional;
- `insufficient_data`;
- `not_recommended`.

Unresolved residents in the target tank still fail closed.

## PR #61 — real browser Golden Path

Standalone built-preview Playwright acceptance now passes:
1. open Care topic;
2. click real `开始快速检查` CTA;
3. choose `追咬打架`;
4. answer both required questions;
5. click `查看处理建议`;
6. see base diagnosis;
7. see explicit conflict augmentation with directional relationship;
8. open read-only intervention comparison;
9. see explicit blocker edges and recomputed choices;
10. see `备用观察缸` with an explicit fail-closed destination verdict;
11. confirm no executable remove/move/delete buttons;
12. confirm no horizontal overflow.

The first two browser runs correctly failed due test assumptions, not product behavior:
- assumed CTA wording did not match the real product text;
- answer locator depended on DOM wrapper depth.

The test was hardened without changing the product gate. Third standalone run passed.

## Canonical merged-tree browser acceptance

The same browser Golden Path was then run against the disposable integration tree containing the #34/#38 canonical repository stack plus #61.

Before browser execution, the same temporary tree passed:
- canonical water-change + future-date contracts;
- unresolved livestock + livestock recording;
- water ambiguity + legacy category + taxonomy;
- #34 Care repository-hydration contract;
- #34 Care unknown-facts contract;
- Care decision + destination contracts;
- Tank Decision Context + Decision Support;
- Destination Evaluator;
- Quick Diagnosis augmentation;
- read-only Intervention UI;
- contextual evidence;
- corrected lionfish evidence;
- 4-fixture Reviewed Severe-Risk suite;
- whole-tree TypeScript;
- production build.

Then Chromium was installed, the merged-tree production preview was started, and the complete Care browser Golden Path passed again.

Final check verified the integration working tree still had `.git/MERGE_HEAD` and `HEAD` had not changed. No merge commit was created or pushed.

## Current maturity boundary

Proven now:
- read-only decision architecture works;
- Care UI is user-reachable;
- destination evaluation reacts to canonical aquarium state in the merged tree;
- unresolved identity remains fail-closed;
- no mutation is exposed.

Not proven / not complete:
- production deployment;
- real Magic Link + Device A/B rollout gate (#35);
- real livestock relocation mutation;
- catalog-wide compatibility accuracy;
- full reviewed behavior coverage.

## Next engineering boundary: atomic relocation mutation contract

Do **not** add a “确认移出 / Move now” UI button yet.

First define and test a repository/API/database mutation with these invariants:
1. source and destination aquarium IDs must differ;
2. authenticated user must own both tanks;
3. source livestock record must exist in source tank;
4. moved quantity must be positive and <= current quantity;
5. destination compatibility must be revalidated against the latest canonical destination state before mutation;
6. source/destination version checks prevent a stale compatibility decision from racing with another edit;
7. source decrement/removal and destination add/merge occur in one database transaction;
8. verified identity remains verified; unresolved identity is never fabricated into a catalog species;
9. operation is idempotent under one operation ID;
10. replay returns the same result without double-decrement/double-add;
11. any failure rolls back both sides;
12. local mirror updates only after repository success.

Only after this backend contract is independently green should an executable relocation button be considered.
