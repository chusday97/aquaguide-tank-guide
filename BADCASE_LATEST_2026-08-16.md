# AquaGuide Latest Badcases — 2026-08-16

> These are executable product/data correctness failures discovered during the latest continuation. Draft/green CI is not production rollout.

| Badcase | Status | Current guard / next action |
|---|---|---|
| `EVIDENCE-ID-001` reviewed evidence is bound to a guessed/legacy catalog ID | ✅ fixed in #56 | Lionfish evidence moved from incorrect `sp_0130` to canonical `sp_0453`; regression asserts `sp_0130 -> sp_0038` and forbids lionfish profile on the legacy ID |
| `EVIDENCE-FIXTURE-001` a test changes or assumes catalog facts merely to trigger a rule | ✅ fixed in #56 | `Amphiprion ocellaris` remains Medium; lionfish regression now requires a real explicit marine-category + saltwater + Small catalog target |
| `EVIDENCE-COUNT-001` adding one reviewed profile inflates the severe evaluation count without a valid full cross-layer fixture | ✅ corrected | Reviewed Severe-Risk suite remains 4 real catalog fixtures; lionfish has a dedicated reviewed rule regression and is not advertised as fixture #5 |
| `EVIDENCE-CONTEXT-001` context-dependent Betta/angelfish studies become unconditional blockers | ✅ guarded | #53 contextual evidence remains separate from deterministic profiles; #56 re-runs contextual non-escalation |
| `EVIDENCE-WRITE-001` temporary write-enabled patch workflow remains in the final PR | ✅ fixed | #56 one-shot patch/cleanup workflows and patch script self-deleted after verified execution; final diff contains only read-only CI + product/test files |
| `WATER-CLASS-001` a non-marine species can satisfy `getSpeciesWaterType(...) === 'saltwater'` and contaminate compatibility fixtures | 🔴 new P0 | Observed with `Pseudogastromyzon fangi` / 方氏拟腹吸鳅 during lionfish regression. Lionfish test now additionally requires explicit `category='海水鱼'`; root water-classification bug still needs a product fix + regression |
| `STACK-003` corrected lionfish evidence might break canonical/unresolved + decision stack convergence | ✅ latest read-only audit green | Disposable merged tree passed canonical water-change, unresolved livestock, decision context/orchestration, Quick Diagnosis, contextual evidence, lionfish evidence, 4-fixture severe-risk, TypeScript, build and no-merge-commit check |

## Evidence identity rule

Reviewed evidence must attach to the same canonical identity that the runtime catalog uses.

Required order:

`raw/historical ID → alias canonicalization → strict catalog grounding → reviewed evidence lookup`

A historical numeric-looking species key must never be trusted by memory or reused because it once appeared in an older dataset.

## Regression fixture rule

A regression fixture must preserve real catalog facts.

Forbidden examples:

- treating a Medium species as Small to activate predation logic;
- choosing a candidate only because a buggy water classifier says `saltwater`;
- using a synthetic species and later describing it as catalog coverage;
- increasing a benchmark case count without a complete real fixture.

For habitat-sensitive tests, the fixture should be cross-checked against explicit catalog/taxonomy facts in addition to the derived water classifier so the test does not validate one bug using another bug.

## Newly exposed water-classification risk

The successful lionfish cleanup run initially selected 方氏拟腹吸鳅 as a `Small + saltwater` target solely from derived life/water logic. That is not a credible marine fixture and exposed `WATER-CLASS-001`.

The evidence regression has been hardened so this cannot make #56 green again, but the underlying product classifier remains a P0 because the same misclassification can affect:

- water-type blockers;
- replacement candidate pools;
- destination evaluation;
- whole-community conflict graphs;
- recommendation filtering.

Next executable action: isolate `getSpeciesWaterType(Pseudogastromyzon fangi)`, identify the fallback causing saltwater certainty, fix at the species-water evidence/service boundary, then rerun recommendation + decision + canonical integration gates.
