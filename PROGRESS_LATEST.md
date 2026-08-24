# AquaGuide — Latest Progress

**Updated:** 2026-08-24
**Branch:** `agent/mobile-encyclopedia-context-sync-v1`
**PR:** #124 `Surface mobile Encyclopedia search` — merged to RC1
**Base:** `integration/aquaguide-rc1`
**Current RC1 runtime head:** `cf63e7f82da0d26cbb94acb4680a20ee848c8ab8`

## Current phase

**Post-P0 UI/UX refinement is active. #124 mobile Encyclopedia search hierarchy is landed and exact RC1 acceptance is 15/15 PASS.**

P0 decision authorities remain landed and unchanged. RC1→`main` and production deployment remain separately blocked pending explicit authorization.


## Stack convergence

- [x] #104 merged to RC1 via `2f07075e447778ea37229ca07ef485d8c0686d9c`.
- [x] #105 reconciled against the merged #104 ancestry.
- [x] #105 merged to RC1 via `e5a9dd1ccc18a296075521fdd01b0407341af617`.
- [x] RC1 branch verified identical to #105 merge commit after merge.
- [ ] #107 merged to RC1 — **not authorized / not done**.
- [ ] RC1→main acceptance re-proven after #107 — blocked until the previous item is explicitly authorized.

## Post-merge fail-before evidence

The real RC1→main synthetic checks surfaced three failures after #105 merged:

| Gate | Result | Run | Classification |
|---|---|---:|---|
| RC1 Release Acceptance | FAIL | 32575093543 | evaluator drift |
| UI Interaction Repair V1 | FAIL | 32575093548 | evaluator drift |
| Product Golden Path | FAIL | 32575093550 | evaluator drift |

Root causes were stale assumptions about:

- canonical API app variable/mount ownership;
- Species Detail and Encyclopedia wrapper/Base file ownership;
- removed legacy Compatibility verdict DOM markers;
- one-click Species Detail → calculator behavior instead of the current two-stage evidence → calculator intent.

No product-code rollback or threshold relaxation was used.

## #107 evaluator repair

Final functional repair scope is limited to four evaluator/test files:

- [x] `scripts/test-production-cloud-runtime-contract.mjs`
- [x] `scripts/test-ui-interaction-repair-v1.mjs`
- [x] `scripts/verify-ui-interaction-repair-v1.mjs`
- [x] `scripts/verify-golden-path-species-to-stocking.mjs`

No product runtime/CSS/persistence/rule/security/deployment code is part of the repair.

## Executable diagnostic proof

Temporary PR-only diagnostic run `32575689962` — **PASS**:

- [x] production cloud runtime source contract
- [x] production cloud runtime smoke
- [x] UI interaction source contract
- [x] TypeScript
- [x] production build
- [x] UI interaction browser regression
- [x] GP-002 continuous browser path

The temporary workflow was deleted after validation and is not part of the final PR diff.

## Permanent gate matrix on verified repair head

Verified repair head before documentation refresh: `13ef3b4c2fd3c7df9fb43127da4dcf153e1bfc7a`.

| Gate | Result | Run |
|---|---|---:|
| Production Security Boundary V1 | PASS | 32575784071 |
| Dependency Release Baseline V1 | PASS | 32575784098 |
| Compatibility Stage Risk V1 | PASS | 32575784108 |
| Plant Roster Edit Fix | PASS | 32575784097 |
| Result UX V1 | PASS | 32575784082 |

## EVAL-BC-002 — post-#105 evaluator drift

- [x] Captured real post-merge failures instead of assuming #105 merge was release-clean.
- [x] Kept source-contract assertions but migrated them to current owners.
- [x] Replaced removed Compatibility DOM marker checks with current `DecisionResultSurface` semantics.
- [x] Preserved result-first ordering, Unknown != Safe, inline AI explanation and exact navigation-context rules.
- [x] Updated GP-002 to the current deliberate two-stage compatibility intent.
- [x] Proved browser behavior after the migration.
- [x] Removed temporary diagnostic workflow.
- [ ] Merge #107 — requires separate explicit authorization.
- [ ] Re-run actual RC1→main acceptance after merge.

## AI usefulness baseline

PUI-BC-059 remains closed for encoded repository-level failure modes:

- [x] schema-valid is not treated as sufficient;
- [x] deterministic safety remains authoritative;
- [x] missing blocking tank facts outrank subjective preference chatter;
- [x] model empty selection cannot erase deterministic safe/adjustable candidates;
- [x] unnecessary `restart_goal` is rejected when executable candidates exist;
- [x] prompt requires concrete candidate/quantity planning.

Still open before production:

- [ ] representative live-provider cohort;
- [ ] generic-answer rate;
- [ ] candidate-drop rate;
- [ ] hallucinated-preference rate;
- [ ] contradiction handling;
- [ ] invalid JSON recovery;
- [ ] timeout/network fallback behavior.

## Dependency-security baseline

- production audit: **0 findings**;
- full developer/build graph: **12 dev-only findings** = 7 high / 2 moderate / 3 low;
- permanent production dependency gate remains read-only and green.

## Product baseline carried forward

- [x] deterministic compatibility / stage-risk authority boundary;
- [x] plant roster edit;
- [x] decision-first Result UX;
- [x] share-report server-secret boundary;
- [x] Care wide-desktop layout recovery;
- [x] narrow-desktop Aquarium `Today → Context → Manage` hierarchy;
- [x] phone task-first hierarchy preserved;
- [x] identification uncertainty / explicit confirmation;
- [x] Species Detail browsing separated from compatibility selection;
- [x] exact return context across cross-route tasks;
- [x] Tank Copilot authority + usefulness guards.

## Next sequence

1. Make #107 review-ready after final diff/gate confirmation.
2. Await explicit #107 merge authorization.
3. If authorized, merge #107 to RC1 with expected-head protection.
4. Validate the actual RC1→main Release Acceptance / UI Interaction / Product Golden / permanent gates on final ancestry.
5. Run live AI usefulness evaluation.
6. Production env/secrets + post-deploy golden paths only after deployment authorization.
7. Legacy `server/index.mjs` Phase 2 consumer inventory/migration.
8. Knowledge Engine after the release foundation is reproducible.

## Guardrails

- A merged PR is not automatically a release-ready RC.
- Source-contract failures must be classified before modifying product code.
- Browser evidence outranks assumptions from file layout.
- Do not delete assertions merely because architecture moved; migrate them to the real owner.
- Do not weaken visual or browser thresholds to make CI green.
- Preview/build success is not production proof.
- AI cannot override deterministic safety rules.
- Do not merge #107, merge RC1 to `main`, or deploy production without explicit authorization.

## 2026-08-23 — P0 Compatibility decision-layer refactor

- P0-2 Contract Alignment: Planning Compatibility and Current Tank State separated in `CONTRACT.md` (`4d4a238`).
- Fail-before proof `9ed2d76`: 0/4 Product Truth checks passed on the legacy model.
- Candidate P0 engine extracts temperament-independent bioload screening to `packages/domain-rules`.
- `CompatibilityDecision` now carries explicit `wholeTankFeasibility`; 3 × 7 quantity regression proves full-tank aggregation occurs once outside pair loops.
- Generic free-text tank-size guidance is planning pressure, not an implicit hard block.
- Species-fit predation now requires reviewed pair/profile evidence rather than `Large`/`Aggressive` proxy inference.
- Stale addition-intent and visual-result fixtures were migrated without changing UI.
- Targeted compatibility/species-fit/addition/livestock/visual/type/build validation is green locally.

## 2026-08-23 — P0 Tank State Engine V1

- #114 P0 Compatibility dedicated workflow PASS: `32620810633`.
- fail-before commit `72ae99e` reproduced 0/3 Existing Tank authority failures: static aggression -> danger/removal, generic tank-size guidance -> upgrade/move instruction, static compatibility danger -> high-priority Today Action.
- added deterministic `packages/domain-rules/src/tank-state.ts`.
- canonical states: `stable / watch / intervene / urgent / unknown`.
- recent normal evidence can keep a prior-risk tank stable; weak single abnormality watches; repeated/correlated abnormality intervenes; urgent physiological evidence and true hard constraints retain immediate authority.
- cohabitation duration alone never proves stability.
- `test:p0-tank-state` passes 11/11 together with P0 Compatibility, Compatibility, Daily Check, Species Diagnosis and TypeScript.
- Aquarium UI is intentionally not rewired in this candidate; `AQ-BC-MIX-001`, `AQ-BC-SPACE-001`, `AQ-BC-STATE-001` remain OPEN until the Existing Tank wiring PR.

## 2026-08-23 — P0 Tank Evidence Adapter V1

- #115 Tank State candidate gates PASS: Tank State `32621472344`, Compatibility `32621472315`.
- added `tank-state-evidence.service.ts` to translate existing persisted facts into Tank State inputs.
- explicit Daily Check / diagnosis answers map to normal, chasing, hiding, appetite, injury, respiratory, death and water-condition observations.
- Planning Compatibility output becomes Prior Risk; only narrow deterministic freshwater/marine rule codes become immediate hard constraints in v1.
- current combination age starts at the latest entry of the currently stocked combination, not the first animal ever added.
- prose/AI/result-summary keywords are not promoted into authoritative observation codes.
- regression includes the concrete 40cm + 2 mini-parrot case: space guidance remains prior and recent normal reality yields current `stable`, not immediate intervention.
- Aquarium UI/Today Action wiring remains intentionally pending for the next stacked PR.

## 2026-08-23 — P0 Existing Tank Authority Wiring V1

- #116 stacked gates confirmed PASS before wiring: Evidence `32621938239`, Compatibility `32621938236`, Tank State `32621938229`.
- Replaced Aquarium page-level static `Aggressive/Large/tankSize/heuristic bioload` current-risk authority with `deriveCurrentTankState()` + presentation adapter.
- Removed `blockingCompatibilityRisk -> Today Action` bypass; Current Tank State now owns current risk and Today Action semantics.
- Normal patrol no longer upgrades to medium from inherited `riskCount`; explicit structured answers remain the observation authority.
- Added permanent source contract plus browser regression for Existing Tank authority.
- Browser PASS 3/3: 40cm + 2 mini-parrots normal -> routine; reviewed tiger-barb + mini-parrot prior normal -> routine; freshwater/marine hard constraint -> high-priority current review.
- Existing GP-003 returning Daily Check and GP-004 abnormal-care browser paths PASS after wiring.
- `AQ-BC-SPACE-001`, `AQ-BC-MIX-001`, `AQ-BC-STATE-001` upgraded to regression-verified on this candidate.
- Pre-existing `test:compatibility-evidence-coverage` provenance drift reproduced on #116 baseline and logged as `AQ-BC-EVAL-002`; intentionally not mixed into this fix.

## 2026-08-23 — P0 Water Change Engine V1

- fail-before commit `1afcd15` reproduces 0/3 gaps on #117 head: shortest species cycle as page authority, calendar overdue -> high priority, and no distinct recommendation engine.
- #117 Existing Tank Authority permanent gates confirmed PASS before this layer: Existing Tank `32623274776`, Evidence `32623274708`, Tank State `32623274730`, Compatibility `32623274742`.
- Added deterministic `packages/domain-rules/src/water-change.ts` plus Aquarium adapter `water-change-decision.service.ts`.
- Completed-water-change history and derived recommendation are now separate; future dates are ignored as completed history by the decision engine.
- Stocked-species `waterChangeCycle` remains a maintenance baseline; Aquarium no longer owns a fallback `shortestCycle -> overdue -> high priority` decision chain.
- Removed overdue-days health-score deduction so maintenance lateness is not silently presented as current biological danger.
- Baseline overdue without abnormal evidence produces a medium maintenance task and explicitly does not imply urgent Current Tank State.
- Current water/physiological signals remain evidence inputs, while Existing Tank Current State keeps higher authority in the Today Action ordering.
- `test:p0-water-change` PASS 8/8; authority source contract PASS; Existing Tank/Tank Evidence/Tank State/Compatibility/Daily Check/Core Flow/Visual Results remain green.
- TypeScript and production build PASS.
- Browser regression PASS at 390/900/1600px; Existing Tank browser 3/3, GP-003 and GP-004 remain PASS.
- `AQ-BC-WATER-001` migrated into the canonical badcase ledger as REGRESSION_VERIFIED on this candidate.
- Draft stacked PR #118 `Route Water Change through deterministic authority V1` opened against #117 head.
- Final PR branch is `agent/p0-water-change-authority-v1`; the parallel `agent/p0-water-change-engine-v1` remains unreviewed and is not used as Product Truth.
- Unconfirmed AQ-WATER-005/006 from that parallel branch were intentionally excluded from #118 in accordance with Context Sync acceptance rules.
- #118 final-head permanent gates PASS: Water Change `32638235738`, Existing Tank `32638235771`, Evidence `32638235730`, Tank State `32638235711`, Compatibility `32638235721`.
- #118 remains Draft/unmerged; next P0 implementation target is the remaining Whole-Tank Feasibility dimensions.

## 2026-08-23 — P0 Whole-Tank Feasibility V2

- fail-before commit `0fe6e4e` reproduces 0/3 gaps on #118 head: no Whole-Tank reviewed group calculation, no separate physical-space dimension, and no explicit equipment-sufficiency evidence boundary.
- implementation commit `e67bc9e` expands Whole-Tank Feasibility into group / physical-space / equipment / bioload dimensions with separate passed/warning/missing rule sets.
- reviewed `minimumGroupSize` is authoritative; the Red Neon Tetra 5-vs-legacy-6 contradiction was reproduced and removed.
- generic `tankSize` remains planning pressure only; it is not promoted into a hard physical constraint.
- configured equipment is not treated as proof of sufficiency when species-specific reviewed equipment requirements are absent.
- Recommendation no longer reintroduces temperament-based bioload inflation or keyword group-size thresholds.
- Existing Tank adapter consumes Whole-Tank warning rules only; pass/missing rules cannot manufacture medium priors.
- permanent regression `test:p0-whole-tank-feasibility` passes 7/7.
- full local P0/Compatibility/Species Fit/Addition/Livestock/Tank Evidence/Tank State/Existing Tank/Water Change/Core Flow/Visual/Golden Path/type/build/diff-check suite remains green.
- Draft stacked PR #119 opened against #118. No merge or deployment performed.
- reviewed knowledge coverage for equipment requirements and hard physical-space constraints remains incomplete; this is now represented as explicit unknown, not silently guessed.
- #119 final-head permanent gates PASS: Whole-Tank `32640537915`, Compatibility `32640537970`, Evidence `32640537930`, Tank State `32640537933`, Existing Tank `32640537926`, Water Change `32640537939`.
- #119 remains Draft/unmerged; next P0 target is `AQ-BC-EVAL-002` compatibility evidence provenance drift.
## 2026-08-23 — P0 Compatibility Evidence Provenance V1

- #119 head `79b06c7` reproduces `AQ-BC-EVAL-002`: direct reviewed predator–prey rule is found first as lossy `tank_condition` instead of `pair_rule`.
- root cause: `speciesFitEngine` emitted a `pair_rule_*` fit item for standalone UX, then `tankCompatibilityEngine` generically converted that item before adding the evidence-aware reviewed pair rule again.
- fix keeps standalone Species Fit behavior but prevents Tank Compatibility from importing lossy `pair_rule_*` duplicates.
- direct Oscar–zebrafish and Channa–Rhodeus rules now appear exactly once with `basis = pair_rule`, reviewed status and retained citations.
- `test:compatibility-evidence-coverage` now permanently asserts uniqueness + provenance and passes across 132 priority directions.
- P0 Compatibility workflow now runs the evidence-coverage test.
- full local Whole-Tank / Compatibility / Species Fit / Addition / Livestock / Tank Evidence / Tank State / Existing Tank / Water Change / Core Flow / Visual / Golden Path / type / build / diff-check suite remains green.
- Draft stacked PR #120 opened against #119. No verdict threshold, UI, RC1/main branch or production state changed.
- #120 final-head permanent gates PASS: Compatibility `32640983537`, Whole-Tank `32640983542`, Tank State `32640983524`.
- `AQ-BC-EVAL-002` is regression-verified; next step is full-stack P0 acceptance / Product Golden browser revalidation.
- Full Product Golden local revalidation PASS on #120 stack: all contract/persistence checks plus Care/Search/Identify and GP-001/002/003/004/005 browser paths.
- No known P0 gate is red; remaining exit review is legacy health-score/support-surface authority only.
- Legacy authority exit review PASS: `conflicts` is Current-Tank-State-derived; legacy health score / risk reminder variables are unconsumed and diagnosis ignores their snapshot fields.
- P0 decision-layer exit criteria are green on the current unmerged stack. Next action is landing-order audit only; no merge authorization has been given.

## 2026-08-23 — P0 Stacked Landing Audit

- Explicit remote refs were materialized for RC1 and #113-#120; Git ancestry was checked locally with `git merge-base --is-ancestor`.
- Strict linear ancestry PASS for every edge: RC1→113→114→115→116→117→118→119→120; every merge-base equals the previous layer head.
- Dry-run incremental diff fingerprints recorded: #113 18 commits/15 files/+1016-123; #114 2/16/+423-140; #115 2/10/+541-11; #116 1/8/+493-9; #117 1/14/+512-252; #118 5/12/+626-75; #119 4/11/+562-67; #120 5/6/+53-25.
- Repository settings confirm normal merge commits are allowed. Stacked landing must use merge commits only; squash/rebase would break ancestry and can reintroduce already-landed commits into later PR diffs.
- Safe procedure: merge #113 to RC1, then retarget only the next PR to RC1, verify its incremental diff + mergeability + gates, merge with expected-head protection, and repeat through #120. Never rebase/update the stacked head branches during landing.
- After #120, the exact new RC1 must re-run all P0 gates and the existing RC1→main release/Product Golden matrix before any main/deploy decision.
- No PR base was changed and no merge/deployment was performed during this audit. Landing remains unauthorized pending explicit user approval.

## 2026-08-23 — P0 Stack Landing Completed

- User explicitly authorized landing of the audited P0 stack into `integration/aquaguide-rc1`; `main` and production deployment remained out of scope.
- All layers were landed with **normal merge commits only**, expected-head protection, and one-at-a-time retargeting to RC1.
- Merge sequence/result: #113 → `17fc3ceb`; #114 → `f126a823`; #115 → `47f3318a`; #116 → `400b111e`; #117 → `d1777894`; #118 → `e056ac9c`; #119 → `d09abd48`; #120 → `adf44c08`.
- Every retargeted PR kept its audited incremental diff fingerprint; no stacked head branch was rebased or squash-merged.
- Intermediate #114–#119 RC1 heads consistently had only the already-tracked `AQ-BC-EVAL-002` failure in Product Golden/UI Interaction; all other triggered P0/release checks remained green.
- #120 closed the evidence-provenance duplicate; on final implementation head `adf44c082a833d51bf1ffa10ff41cb0d123aaea1`, Product Golden and UI Interaction returned to PASS.
- Final P0 permanent gates PASS: Compatibility `32644603008`, Tank State `32644603012`, Tank Evidence `32644603024`, Existing Tank `32644603056`, Water Change `32644602993`, Whole-Tank `32644603019`.
- Final RC1 release matrix PASS: RC1 Release Acceptance `32644602987`, Product Golden `32644603004`, UI Interaction `32644602969`, UI UX System `32644603040`, UI UX Visual QA `32644602976`, UI UX Golden V3 `32644603010`, UI V2 Aquarium `32644602991`, Navigation `32644602981`, Bundle Audit `32644602972`.
- Final implementation-head result: **15/15 PASS**. P0 decision-layer landing is complete; no RC1→main merge or production deployment was performed.
- Next phase is #112 Interactive Atlas re-entry review against the landed decision layer; the old UI branch must not be merged as-is.

## 2026-08-24 — Interactive Atlas post-P0 re-entry

- P0/Context Sync RC1 is `d426cb6`; exact-head repository acceptance remains 15/15 PASS.
- Old Draft PR #112 was audited as stale against the pre-P0 RC1 and is not safe to merge as-is.
- Fresh branch `agent/interactive-atlas-reentry-v1` was created from final RC1; old #112 UI intent was replayed as commit `cd0d5fe`, then hardened in `3f66036`.
- Draft PR #122 opened against `integration/aquaguide-rc1`; initial head `3f6603616a0c8d3adbdea6fb8e8d2a0bc058ec87`, 2 commits / 5 files.
- Re-entry separates the random 3D discovery scene from Compatibility truth, relabels species space/water-change values as references, and keeps Compatibility behind explicit user intent.
- Multi-variant discovery anchor is deterministic and scene selection avoids duplicate species groups.
- Mobile close control was moved to a `document.body` portal after real browser debugging showed global `html/body` overflow prevented nested sticky positioning from reliably clearing the fixed mobile navigation.
- Atlas authority contract PASS; Product Evaluation (19/114/53), Golden Path contract (5 journeys), P0 Compatibility 5/5, Tank State 11/11, Water Change 8/8, TypeScript, production build and diff-check PASS.
- Responsive browser regression PASS at 390/900/1600 with no horizontal overflow and exact discovery-scene restoration; final screenshots were manually reviewed.
- `AQ-BC-ATLAS-001` added as regression-verified. Next step is GitHub gates on #122; no RC1/main merge or production deployment performed.

## 2026-08-24 — Interactive Atlas landing completed

- Final #122 candidate head `d2a6167ee49324b776c551476d717e8c8fccc7c5` included Context Sync and passed 12/12 triggered GitHub workflows; Interactive Atlas Re-entry run `32652829940` PASS.
- Final authority review against RC1 showed 8 changed files / +465 -13; no Aquarium decision owner, Compatibility engine, Tank State, Water Change, domain-rules or aquarium decision service files were modified.
- Old PR #112 was explicitly marked superseded and closed unmerged.
- #122 was marked Ready and merged to `integration/aquaguide-rc1` with a normal merge commit and expected-head protection; runtime RC1 head became `d3e9ee54f7d0820d2fa06ac25431a429eddc4bac`.
- Exact merged RC1 P0 gates PASS: Compatibility `32653084013`, Tank State `32653084081`, Tank Evidence `32653084020`, Existing Tank `32653084011`, Water Change `32653084097`, Whole-Tank `32653083976`.
- Exact merged RC1 release matrix PASS: RC1 Release Acceptance `32653084047`, Product Golden `32653083913`, UI Interaction `32653084003`, UI UX System `32653084112`, UI UX Visual QA `32653084006`, UI UX Golden V3 `32653084133`, UI V2 Aquarium `32653084060`, Navigation `32653084051`, Bundle Audit `32653083984`.
- Result: **15/15 PASS** on Atlas runtime head. `AQ-BC-ATLAS-001` is regression-verified on RC1. No RC1→main merge or production deployment performed.
- Next phase: continue UI/UX refinement from current RC1 while preserving the landed decision authorities.

## 2026-08-24 — Mobile Encyclopedia search hierarchy

- Final RC1 visual audit showed the 390px Encyclopedia core SearchAutocomplete below the 560px Interactive Atlas while Wishlist occupied a scarce fixed-toolbar shortcut.
- Fail-before commit `98e91b8` captured the missing first-class mobile Search action.
- #124 replaced the toolbar Wishlist shortcut with Search; the action scrolls to and focuses the existing canonical search input, with no duplicate search state.
- Wishlist remains available through persistent Collection / 水族册 navigation; desktop Atlas presentation and all decision authorities are unchanged.
- #124 final candidate `66a9ab406043436fd4b024a3e65e75dde690eb7d` passed 11/11 triggered PR workflows, including Atlas authority, mobile-entry contract, P0 boundaries, TypeScript/build, 390/900/1600 browser regression, Visual QA, Navigation and UI System.
- #124 merged to RC1 with a normal merge commit; runtime head became `cf63e7f82da0d26cbb94acb4680a20ee848c8ab8`.
- Exact merged RC1 result: **15/15 PASS**. P0: Compatibility `32656473719`, Tank State `32656473746`, Tank Evidence `32656473727`, Existing Tank `32656474634`, Water Change `32656473724`, Whole-Tank `32656473735`. Release/UI: RC1 Release `32656473713`, Product Golden `32656473751`, UI Interaction `32656473716`, UI UX System `32656473765`, UI UX Visual QA `32656473797`, UI UX Golden V3 `32656473758`, UI V2 Aquarium `32656473810`, Navigation `32656473748`, Bundle `32656473715`.
- `AQ-BC-ATLAS-002` is regression-verified on RC1. Next audit target is Aquarium first-fold competition for configured returning users.
- No RC1→main merge or production deployment was performed.

## 2026-08-24 — Mobile shell header scope / Identify 390px repair

- Global UI/UX audit found a reproducible 390px Identify defect: “返回物种图鉴” was forced into a 44×44 box, rendered vertically, and visually collided with the “拍照识别” heading.
- Browser geometry before fix: back action 44×44, `white-space: normal`, button y=16–60, title top y=68.
- Root cause was shared shell CSS, not Identify recognition logic: `.phone-shell-active header...` selectors matched arbitrary page `<header>` elements instead of only the persistent mobile utility header.
- Fail-before commit `de5bc96` added a source contract that fails on broad mobile-header selectors plus a permanent Identify geometry browser regression.
- Implementation commit `f09ece0` scopes all persistent mobile-header rules to `header[data-shell="mobile-header"]`; Identify back action becomes content-fit/non-shrinking.
- Local post-fix evidence: Identify back action 132×40, button bottom y=56, title top y=64; 390px screenshot manually reviewed; Identify 390/900/1600 regression PASS; full responsive route scan PASS (7 profiles × 17 routes); TypeScript/build and UI contracts PASS.
- #126 initial head exposed one expected Golden V3 mismatch only: `collection-phone-390` changed 3.3704% because the old reference preserved the same invalid shell chrome on the Collection page header; the other 7 golden cases passed.
- Golden migration used the failing GitHub Linux runner current screenshot, preserved the existing 0.3% tolerance, changed only `collection-phone-390.sig`, and added a small `referenceMigration` audit block. Signature self-check reported `diffPixels: 0` against the runner screenshot.
- Final #126 candidate `6a70e7eaa71f6b2d33a6bb64e848dbd685ad4cb2` passed **17/17** triggered PR workflows; Golden V3 recovered to PASS (`32695362070`).
- #126 merged to RC1 with a normal merge commit + expected-head protection; runtime RC1 became `80985ca27d7b21df4bc0062e7765a1d5e9a96756`.
- Exact merged RC1 result: **15/15 PASS**. P0: Compatibility `32695640422`, Tank State `32695640283`, Tank Evidence `32695640241`, Existing Tank `32695640353`, Water Change `32695640274`, Whole-Tank `32695640299`. Release/UI: RC1 Release `32695640335`, Product Golden `32695640359`, UI Interaction `32695640281`, UI UX System `32695640349`, UI UX Visual QA `32695640304`, UI UX Golden V3 `32695640360`, UI V2 Aquarium `32695640294`, Navigation `32695640362`, Bundle `32695640329`.
- `AQ-BC-UI-HEADER-001` is regression-verified on RC1. No RC1→main merge or production deployment was performed.
- Separate first-fold audit found no persistent Aquarium regression for configured returning users; Care/Search/Collection likewise have no current browser evidence supporting broad redesign. Continue UI work only from reproducible badcases.

## 2026-08-24 — Mobile Encyclopedia top-toolbar ownership

- Cross-route browser audit found two simultaneous 390px top headers on `/encyclopedia`: the global shell occupied y=0–61 while the Atlas toolbar occupied y=0–64 at z-index 60.
- The Atlas toolbar visually covered the global shell, but global Search / Photo ID / Settings remained keyboard-focusable; Search and Photo ID appeared twice in the DOM and hidden Settings was the third Tab stop.
- Fail-before commit `c800ec6` added source and browser ownership contracts and reproduced both failures on final RC1.
- Implementation commit `a936323` makes `/encyclopedia` the owner of its mobile top toolbar: App suppresses the global utility header only for that route, while the Atlas toolbar exposes Browse / Compatibility + Search / Photo ID / Settings.
- Ordinary routes such as `/care` continue to render the global utility header.
- Local validation PASS: ownership source/browser contracts, mobile shell-header scope, Atlas authority, UI UX system contract, TypeScript, production build, Atlas 390/900/1600, and full responsive scan 7 profiles × 17 routes. At 390px the two mode buttons remain >=70px and no horizontal overflow is introduced.
- #128 final candidate `a93632388b2d37232a8b3af8c9bdce9b1955a21f` passed **17/17** triggered PR workflows, including UI UX System `32698572750`, Visual QA `32698572700`, Interactive Atlas `32698572781`, Golden V3 `32698572724`, Navigation `32698572745`, all P0 gates, Security/Dependency/Bundle, Result UX, Plant Roster and Stage Risk.
- #128 merged to RC1 with a normal merge commit + expected-head protection; runtime RC1 became `1bf6c015eb2a3addf986c0d742729dce95046ac0`.
- Exact merged RC1 result: **15/15 PASS**. P0: Compatibility `32698873159`, Tank State `32698873163`, Tank Evidence `32698873193`, Existing Tank `32698873212`, Water Change `32698873172`, Whole-Tank `32698873128`. Release/UI: RC1 Release `32698873151`, Product Golden `32698873170`, UI Interaction `32698873145`, UI UX System `32698873147`, UI UX Visual QA `32698873103`, UI UX Golden V3 `32698873162`, UI V2 Aquarium `32698873194`, Navigation `32698873218`, Bundle `32698873148`.
- `AQ-BC-UI-TOOLBAR-001` is regression-verified on RC1. No RC1→main merge or production deployment was performed.

## 2026-08-24 — Species Detail authority presentation alignment

- Semantic audit confirmed `getSpeciesReminder()` and `getSpeciesFitText()` in Encyclopedia are currently definition-only dead code, so they are not a live authority leak.
- Active `SpeciesDetailDialogBase` had a real provenance split: canonical `evaluateTankCompatibility()` owned the overall verdict/CTA, while page-level `FitDimension` heuristics owned Decision Result watch/avoid/evidence and the “为什么？” risk count.
- Repro case: ~9L freshwater tank + `sp_0431` 红绿灯. Canonical result was `caution`, `blockingRules=[]`; `volume_guideline_gap_high` explicitly stayed a planning prior, and reviewed `minimumGroupSize=5` emitted `group_requirement_gap`. Old UI nevertheless rendered `暂时不要` from a local `<65%` tank-size danger heuristic and omitted the group warning from the visible decision explanation.
- Fail-before commit `c39e094` added source + 390px browser regressions proving the split.
- Implementation commit `45e8e61` keeps overall verdict/CTA unchanged but makes Decision Result `watchFor / avoid / evidence` consume canonical `warningRules / blockingRules / missingData / passedRules` only.
- Page-level temperature / tank-size / filter / heater cards were downgraded to neutral `鱼缸条件参考 / Tank context reference`; they remain settings/navigation context but no longer present as current-risk red/yellow verdict evidence.
- Local PASS: new authority source/browser regressions, TypeScript, production build, Species Detail Result UX, Encyclopedia risk navigation, Layout Recovery V1, P0 Compatibility 5/5, full responsive scan 7 profiles × 17 routes, diff-check.
- Draft PR #130 opened from RC1 `00be6295`; final candidate `45e8e610d51e0071c8697ac5cccbb15fb36fe3be` passed 10/10 triggered workflows: Visual QA `32705103929`, Golden V3 `32705103715`, UI UX System `32705103871`, Interactive Atlas `32705103765`, Compatibility Stage Risk `32705103746`, Plant Roster `32705103694`, Bundle `32705103801`, Security `32705103698`, Dependency `32705103887`, Result UX `32705103851`.
- #130 landed to `integration/aquaguide-rc1` via normal merge commit + expected-head protection; runtime RC1 became `f018ac03c7c4395cc2e44d1e830ba55aab10466b`.
- Exact merged RC1 result: **15/15 PASS**. P0: Compatibility `32706086142`, Tank State `32706086230`, Tank Evidence `32706086198`, Existing Tank `32706086263`, Water Change `32706086133`, Whole-Tank `32706086286`. Release/UI: RC1 Release `32706086170`, Product Golden `32706086145`, UI Interaction `32706086202`, UI UX System `32706086124`, UI UX Visual QA `32706086214`, UI UX Golden V3 `32706086221`, UI V2 Aquarium `32706086157`, Navigation `32706086200`, Bundle `32706086250`.
- `AQ-BC-UI-AUTH-001` is regression-verified on RC1. No RC1→main merge or production deployment was performed.
- CI audit note: `Result UX V1` still explicitly checks out `agent/result-ux-v1`; its green result is therefore not candidate-head proof. The new Species Detail authority source/browser regressions are intentionally wired into UI UX System, which checks out the actual PR head. Next CI hygiene target is removing the fixed Result UX checkout.

## 2026-08-24 — Result UX candidate-head integrity

- Post-#130 CI audit confirmed `Result UX V1` was not candidate-head evidence: its workflow explicitly checked out fixed branch `agent/result-ux-v1`.
- Fail-before commit `e11e78e` added a permanent head-integrity source contract; it failed on the fixed checkout as expected.
- `35655d9` changed Result UX to target `main` and `integration/aquaguide-rc1` and to checkout `${{ github.event.pull_request.head.sha }}`; `261897d` added an explicit runtime `git rev-parse HEAD == expected PR head SHA` assertion.
- The first real candidate-head Result UX run `32707666515` proved the fix was meaningful: checkout verification passed, then the stale evaluator failed because it still required the pre-#130 heuristic `verdictReasons` Species Detail evidence path.
- No product rollback was made. Evaluator-only commit `c4df38e` replaced that obsolete assertion with canonical Species Detail checks for `canonicalDecisionEvidence.watch / avoid / evidence`, Compatibility `warningRules / blockingRules / missingData / passedRules`, removal of `verdictReasons`, and reference-only local fit metrics.
- Final #132 candidate `c4df38e7a0d46af019559e07329c771bfef93665` passed **7/7** triggered workflows. Result UX `32708569095` passed candidate checkout verification, static contracts, TypeScript/build, Diagnosis/Compatibility/Knowledge/Procedure/Species Detail/Layout/Identification/Tank Copilot browser regressions; UI UX System `32708568972` independently passed the head-integrity contract and full responsive scan.
- #132 merged to RC1 via normal merge + expected-head protection; runtime RC1 became `c491effd9cd65bdde3ee860dd133a9cc716ed6af`.
- Exact merged RC1 acceptance expanded from 15 to **16/16 PASS** because Result UX now correctly protects the `main`-bound RC1 PR. P0: Compatibility `32708929731`, Tank State `32708929674`, Tank Evidence `32708929745`, Existing Tank `32708929634`, Water Change `32708929852`, Whole-Tank `32708929726`. Release/UI: RC1 Release `32708929579`, Product Golden `32708929733`, UI Interaction `32708929659`, UI UX System `32708929656`, UI UX Visual QA `32708929663`, UI UX Golden V3 `32708929608`, UI V2 Aquarium `32708929720`, Navigation `32708929775`, Bundle `32708929669`. Result UX `32708929859`.
- `AQ-BC-CI-001` is regression-verified. No application runtime, Product Truth, RC1→main merge, or production deployment change was made by #132.
