# AquaGuide Product Badcases

This is the canonical product badcase ledger for newly created or newly touched product failures.

Badcase statuses: `OPEN`, `INVESTIGATING`, `FIXED`, `REGRESSION_VERIFIED`, `WONT_FIX`.

Historical entries in `BADCASE_LATEST.md`, evaluation fixtures and older Handoff/Progress files are not bulk-copied here. Migrate an old badcase when it is touched, then keep this file as the full canonical definition.

---

## AQ-BC-SPACE-001 — Recommended tank size becomes a current removal instruction

**Status:** `REGRESSION_VERIFIED` on `agent/p0-existing-tank-authority-wiring-v1`
**Related Rules:** `AQ-SPACE-001`, `AQ-STATE-001`, `AQ-STATE-005`
**Observed behavior:** Current Aquarium logic can treat the gap between effective tank volume and a species' recommended minimum as a current “space pressure” problem and immediately recommend reducing/removing livestock or upgrading the tank.
**Expected behavior:** For an existing aquarium, a general recommendation gap remains prior/space evidence unless a hard physical constraint or observed current problem supports intervention.
**Root cause:** Planning/recommendation heuristics are consumed directly by the existing-tank risk/Today Action layer.
**Regression:** Domain acceptance plus `test:p0-existing-tank-authority` and the browser gate verify 40cm + 2 mini-parrots + normal patrol stays `routine / 今天没有必须处理`; no space-upgrade/removal current warning is rendered.

---

## AQ-BC-BIOLOAD-001 — Temperament inflates bioload

**Status:** `REGRESSION_VERIFIED` on `agent/p0-compatibility-engine-v2`
**Related Rules:** `AQ-SPACE-002`, `AQ-SPACE-003`, `AQ-SPACE-004`
**Observed behavior:** Current compatibility code increases heuristic bioload when a species is `Aggressive` or `Territorial`, mixing behavioral pressure into biological load.
**Expected behavior:** Aggression/territory and bioload remain independent dimensions; temperament must not increase bioload through an arbitrary multiplier.
**Root cause:** `estimateBioload()` combines size and temperament into one heuristic score.
**Regression:** `scripts/test-p0-compatibility-product-truth.ts` proves Peaceful vs Aggressive no longer changes the bioload screening path; `test:compatibility` also passes.

---

## AQ-BC-MIX-001 — Static aggression metadata becomes active current conflict

**Status:** `REGRESSION_VERIFIED` on `agent/p0-existing-tank-authority-wiring-v1`
**Related Rules:** `AQ-MIX-003`, `AQ-DIAG-001`, `AQ-STATE-001`
**Observed behavior:** Current Aquarium risk logic can classify `Aggressive + Peaceful` stocked species as a danger and recommend removal/separation without first requiring observed chasing, injury, feeding exclusion or reviewed predation evidence.
**Expected behavior:** The metadata creates an aggression/territory prior and observation target. Current conflict/intervention requires observed evidence or a true deterministic hard constraint.
**Root cause:** Existing-tank `getTankRiskItems()` mixes planning priors with current-state diagnosis.
**Regression:** Domain acceptance plus browser regression verify reviewed tiger-barb + mini-parrot planning conflict remains prior context while a normal current patrol produces `routine`, not an automatic removal/current-conflict action.

---

## AQ-BC-EVAL-001 — Addition-intent source contract asserted a stale CTA string

**Status:** `REGRESSION_VERIFIED`
**Related Rules:** `AQ-MIX-002`, `AQ-PRINCIPLE-002`
**Observed behavior:** `test:addition-intents` required the literal string `已经实际入缸，确认记录`, but the unchanged RC1 baseline uses `确认风险后再记录` before acknowledgment and `已经实际入缸，记录下来` after/without the caution gate.
**Expected behavior:** The regression should protect the semantic contract—existing facts remain recordable and caution can require acknowledgment—not an obsolete exact CTA phrase.
**Root cause:** Source-string evaluator drift; the assertion was stricter than the actual accepted product behavior.
**Regression:** `scripts/test-addition-intents.ts` now asserts the two live semantic states and still rejects legacy planned-addition copy.

---

## AQ-BC-SPACE-002 — Generic tank-size guidance became a planning hard block

**Status:** `REGRESSION_VERIFIED` on `agent/p0-compatibility-engine-v2`
**Related Rules:** `AQ-SPACE-001`, `AQ-MIX-007`
**Observed behavior:** `speciesFitEngine` parsed a generic `tankSize` string and upgraded `< 80%` of that value to `volume_too_small` hard block, even though the data did not distinguish a reviewed physical constraint from a general husbandry recommendation.
**Expected behavior:** Generic tank-size guidance remains planning pressure unless a separate reviewed hard constraint explicitly authorizes blocking.
**Root cause:** A heuristic threshold was treated as a hard-constraint authority.
**Regression:** `scripts/test-p0-compatibility-product-truth.ts` and the migrated species-fit regression verify that the gap becomes `volume_guideline_gap*` warning rather than `volume_too_small` block.

---

## AQ-BC-MIX-002 — Pair aggregation omitted whole-tank feasibility

**Status:** `REGRESSION_VERIFIED` on `agent/p0-whole-tank-feasibility-v2`
**Related Rules:** `AQ-MIX-005`, `AQ-MIX-006`, `AQ-MIX-008`, `AQ-SPACE-002`
**Observed behavior:** `evaluateCompatibilityDecision()` originally evaluated every pair and used the worst pair as the aggregate result; the first Whole-Tank extraction added only total quantity + bioload, leaving group requirement, physical-space pressure and equipment sufficiency implicit or owned by older per-species heuristics.
**Expected behavior:** Pair relationships and Whole-Tank Feasibility are separate calculations; full planned quantities are aggregated exactly once and the group / physical-space / equipment / bioload dimensions stay inspectable rather than collapsing into one pair score.
**Root cause:** Whole-Tank V1 stopped at bioload screening while older consumers still held group and equipment/space heuristics.
**Regression:** `test:p0-whole-tank-feasibility` verifies reviewed group-size aggregation, generic space pressure as a non-hard planning prior, explicit equipment unknown, one-pass bioload, and separation of passed/warning/missing rules.

---

## AQ-BC-GROUP-001 — Keyword group-size heuristic overrides reviewed minimumGroupSize

**Status:** `REGRESSION_VERIFIED` on `agent/p0-whole-tank-feasibility-v2`
**Related Rules:** `AQ-MIX-004`, `AQ-MIX-005`, `AQ-MIX-006`
**Observed behavior:** `tankCompatibilityEngine` and Recommendation used name/description regexes to assign a default schooling minimum of 6. A reviewed Red Neon Tetra profile with `minimumGroupSize = 5` therefore passed the new Whole-Tank group check at 5 but was immediately downgraded again by the legacy “6 fish” heuristic.
**Expected behavior:** When a reviewed `minimumGroupSize` exists, it is the group requirement authority. Missing reviewed group evidence remains unknown/low-confidence; keyword text must not silently invent a competing threshold.
**Root cause:** Group requirement had multiple rule owners with different evidence quality.
**Regression:** `test:p0-whole-tank-feasibility` proves 5 × 红绿灯 satisfies reviewed minimumGroupSize 5 and no `schooling_quantity_low` rule is emitted; Recommendation now reads the reviewed profile instead of regex group-size guesses.

---

## AQ-BC-STATE-002 — Whole-Tank pass/missing rules become Current Tank medium priors

**Status:** `REGRESSION_VERIFIED` on `agent/p0-whole-tank-feasibility-v2`
**Related Rules:** `AQ-MIX-009`, `AQ-STATE-001`, `AQ-SPACE-002`
**Observed behavior:** `tank-state-evidence.service.ts` consumed every `wholeTankFeasibility.rules` entry as at least a medium Prior Risk, including `whole_tank_bioload_screen_low` pass evidence.
**Expected behavior:** Only Whole-Tank warning rules become planning priors for Existing Tank state. Passed evidence and low-confidence missing evidence must not manufacture a medium risk prior.
**Root cause:** Whole-Tank V1 exposed one undifferentiated `rules` array and the adapter had no semantic separation.
**Regression:** Whole-Tank V2 carries `passedRules / warningRules / missingData` per dimension; `test:p0-whole-tank-feasibility` proves low-bioload and group-pass rules do not enter Current Tank priors.

---

## AQ-BC-STATE-001 — Static compatibility danger bypasses Current Tank State in Today Action

**Status:** `REGRESSION_VERIFIED` on `agent/p0-existing-tank-authority-wiring-v1`
**Related Rules:** `AQ-STATE-001`, `AQ-STATE-005`, `AQ-MIX-009`
**Observed behavior:** Aquarium currently finds a static `danger` risk and directly creates a high-priority `compatibility_review` Today Action before a Current Tank State evaluation exists.
**Expected behavior:** Compatibility output is Prior Risk for stocked livestock. Today Action is derived only after combining prior, tank context, observed evidence, time/history and hard constraints.
**Root cause:** Existing `blockingCompatibilityRisk` bypasses the missing Tank State authority.
**Regression:** Fail-before commit `72ae99e` proves the bypass; source contract now forbids `blockingCompatibilityRisk`, and the 3-scenario browser regression proves Current Tank State owns Today Action while true water-type hard constraints remain urgent.

---

## AQ-BC-WATER-001 — Maintenance baseline overdue becomes current high-priority risk

**Status:** `REGRESSION_VERIFIED` on `agent/p0-water-change-authority-v1`
**Related Rules:** `AQ-WATER-001`, `AQ-WATER-002`, `AQ-WATER-004`
**Observed behavior:** Aquarium directly derived `isChangeOverdue` from the shortest stocked-species `waterChangeCycle`, deducted health score by overdue days, and created a `high`-priority Water Change Today Action even when the current structured patrol was normal.
**Expected behavior:** Water-change history remains factual history; species cycle is a maintenance baseline only. Calendar overdue may surface a maintenance recommendation, but without current abnormal evidence it must not classify the aquarium as urgent/currently unsafe.
**Root cause:** Page-level schedule arithmetic owned Today Action and health semantics instead of a dedicated Water Change decision layer that combines baseline, real history and current evidence.
**Regression:** Fail-before commit `1afcd15` reproduces 0/3 authority gaps; `test:p0-water-change` verifies the domain boundary and `test:p0-water-change-ui` proves an overdue baseline + normal patrol renders a maintenance action, explicitly says overdue alone is not urgent, and remains responsive at 390/900/1600px.

---

## AQ-BC-EVAL-002 — Direct reviewed pair evidence loses provenance through species-fit duplication

**Status:** `REGRESSION_VERIFIED` on `agent/p0-compatibility-evidence-provenance-v1`
**Related Rules:** compatibility evidence provenance / evaluator integrity
**Observed behavior:** `test:compatibility-evidence-coverage` expected direct predator-prey evidence provenance `pair_rule`, but the first matching `pair_rule_predation_threat` was a lossy duplicate marked `tank_condition` with empty citations.
**Expected behavior:** Direct reviewed pair evidence is emitted once by the evidence-aware Compatibility owner, retains `basis = pair_rule`, reviewed status, affected species and citations, and preserves the laboratory-to-husbandry limitation without changing the blocking verdict.
**Root cause:** `speciesFitEngine` surfaced a `pair_rule_*` fit item for standalone fit UX; `tankCompatibilityEngine` then re-imported that item through generic `convertFitItem()` as `tank_condition` before independently adding the canonical reviewed pair rule. The result contained two rules with the same code but different provenance quality.
**Regression:** #119 head `79b06c7` reproduces the failure. `test:compatibility-evidence-coverage` now requires exactly one evidence-aware direct pair rule for Oscar–zebrafish and Channa–Rhodeus, with `basis = pair_rule` and retained peer-reviewed citations. The P0 Compatibility permanent gate now runs this coverage test.

---

## AQ-BC-ATLAS-001 — Interactive Atlas visual scene leaks decision semantics and loses mobile exit affordance

**Status:** `REGRESSION_VERIFIED` on RC1 via merged PR #122
**Related Rules:** `AQ-SEQ-001`, Planning Compatibility / Current Tank State / Water Change authority separation
**Observed behavior:** The pre-P0 Atlas implementation reused a synthetic `Aquarium` to render six random species together, presented `tankSize` as “空间” and `waterChangeCycle` as “换水”, and relied on an in-panel sticky close control whose position could be captured by page overflow on mobile. The resulting UI could look like a compatibility recommendation or current-tank instruction, while the close affordance could sit under the global mobile navigation.
**Expected behavior:** The discovery aquarium is explicitly a visual exploration scene only. Co-display does not imply compatibility. Species tank-size and water-change values are labeled as references, Compatibility requires explicit user intent, and the knowledge panel must remain safely dismissible at responsive viewports.
**Root cause:** The original #112 UI intent predated the landed P0 authority model and reused the product `Aquarium` shape as a rendering adapter without a presentation-only semantic boundary; mobile dismissal also depended on sticky positioning inside a global overflow layout.
**Regression:** `scripts/test-interactive-atlas-authority-contract.mjs` protects visual-only/reference/explicit-intent semantics. `scripts/verify-interactive-atlas-detail-v2.mjs` verifies the full Atlas interaction at 390/900/1600px, including no horizontal overflow, a viewport-safe mobile close control, variant preview/commit, and exact restoration of the same discovery scene after close. #122 passed 12/12 triggered PR workflows; after merge, exact RC1 `d3e9ee5` passed the full 15/15 P0 + release matrix.

---

## AQ-BC-ATLAS-002 — Mobile Encyclopedia hides core species search behind discovery fold

**Status:** `REGRESSION_VERIFIED` on RC1 via merged PR #124
**Related Rules:** Post-P0 UI hierarchy; Interactive Atlas authority boundary
**Observed behavior:** On the 390px final-RC1 visual baseline, the 560px Interactive Atlas occupied almost the entire first fold while the canonical `SearchAutocomplete` sat below it. The fixed Atlas toolbar used its limited secondary shortcut for Wishlist, even though Wishlist already had persistent Collection / 水族册 navigation. The core “find a species” task therefore required extra scrolling while a secondary collection task stayed first-fold.
**Expected behavior:** Mobile Encyclopedia exposes a first-class Search action without duplicating search state. Tapping it moves directly to the existing canonical search toolbar and focuses its input. Atlas remains available as discovery, Wishlist remains reachable through Collection, and desktop Atlas layout is unchanged.
**Root cause:** The Atlas re-entry optimized immersive exploration and authority separation, but the mobile IA kept the pre-audit shortcut allocation; no regression asserted that the primary species-finding task remained immediately reachable when the Atlas occupied the first fold.
**Regression:** Fail-before commit `98e91b8` proves the mobile toolbar lacked a Search action. `scripts/test-mobile-encyclopedia-entry-contract.mjs` protects search ownership and prevents Wishlist from displacing it. `scripts/verify-interactive-atlas-detail-v2.mjs` verifies 390px Search scroll/focus plus the existing 390/900/1600 Atlas interaction chain. #124 candidate passed 11/11 triggered workflows; exact merged RC1 `cf63e7f` passed 15/15 P0 + release checks.

---

## AQ-BC-UI-HEADER-001 — Mobile shell CSS captures page-level text headers

**Status:** `REGRESSION_VERIFIED` on RC1 via merged PR #126
**Related Rules:** Post-P0 UI hierarchy / shell ownership; responsive interaction consistency
**Observed behavior:** At 390px on Identify, the page-level “返回物种图鉴” text action was forced into a 44×44 icon-button box, wrapped vertically, and visually crowded the “拍照识别” title. The same broad selector also applied mobile-shell chrome to other page `<header>` elements, including Collection.
**Expected behavior:** Persistent shell styles apply only to the actual mobile utility header. Page headers keep their own content-fit geometry; the Identify back action remains a readable single-line text action with a valid touch target and no title overlap.
**Root cause:** `ui-v2-shell.css` used `.phone-shell-active header...` selectors even though the true persistent header already exposed `data-shell="mobile-header"`. The selector therefore treated arbitrary nested page headers as shell UI.
**Regression:** Fail-before commit `de5bc96` captures the broad-selector bug. `scripts/test-mobile-shell-header-scope.mjs` forbids arbitrary page-header ownership, and `scripts/verify-identify-mobile-header.mjs` verifies Identify geometry at 390/900/1600. The fix scopes shell rules to `header[data-shell="mobile-header"]`. The 390px back action changed from 44×44 to 132×40 with button bottom y=56 before title top y=64. The Collection 390 golden reference was migrated from GitHub runner evidence without relaxing its 0.3% threshold; final #126 head passed 17/17 PR workflows and exact merged RC1 `80985ca` passed 15/15 P0 + release checks.

---

## AQ-BC-UI-TOOLBAR-001 — Mobile Encyclopedia keeps an obscured global toolbar in the tab order

**Status:** `REGRESSION_VERIFIED` on RC1 via merged PR #128
**Related Rules:** Post-P0 UI hierarchy / route-level toolbar ownership; responsive accessibility consistency
**Observed behavior:** At 390px, `/encyclopedia` rendered the global mobile shell header at y=0–61 and the Atlas toolbar at y=0–64 with z-index 60. The Atlas toolbar visually covered the shell, but the shell Search / Photo ID / Settings buttons stayed focusable. Search and Photo ID therefore existed twice, while invisible Settings remained the third keyboard Tab stop.
**Expected behavior:** A mobile route has one visible top-toolbar owner. Encyclopedia exposes Browse / Compatibility plus Search / Photo ID / Settings in its visible Atlas toolbar; no obscured global utility controls remain in the DOM or keyboard order. Other routes keep the normal global utility header.
**Root cause:** Interactive Atlas introduced a route-specific fixed toolbar, but `MobileAppShell` still rendered its global mobile header for `/encyclopedia`. Visual z-index hid the duplicate instead of transferring ownership.
**Regression:** Fail-before commit `c800ec6` captures the duplicate-toolbar source and browser failures. `scripts/test-mobile-encyclopedia-toolbar-ownership.mjs` protects route ownership, while `scripts/verify-mobile-encyclopedia-toolbar-ownership.mjs` verifies no hidden global header, five visible top actions, >=44px utility targets, readable 390px mode buttons, no horizontal overflow, and preservation of the normal global header on `/care`. Final #128 head passed 17/17 PR workflows; exact merged RC1 `1bf6c015` passed 15/15 P0 + release checks.

---

## AQ-BC-UI-AUTH-001 — Species Detail mixes canonical verdict with heuristic avoid/evidence

**Status:** `REGRESSION_VERIFIED` on RC1 via merged PR #130
**Related Rules:** `AQ-SPACE-001`, `AQ-MIX-004`, `AQ-MIX-005`, `AQ-MIX-007`; Compatibility evidence provenance / UI authority separation
**Observed behavior:** In a ~9L freshwater tank with candidate `sp_0431` 红绿灯, canonical Compatibility returned `caution`, `blockingRules=[]`, a generic 32L planning warning, and a reviewed `minimumGroupSize=5` warning. Species Detail correctly used the canonical caution summary, but its page-level FitDimensions separately promoted the generic volume gap to `danger`, rendered `暂时不要`, and omitted the reviewed group warning from the visible decision explanation.
**Expected behavior:** Species Detail verdict, watch, avoid and evidence must share the canonical `TankCompatibilityResult`. Generic tank-size guidance may remain warning/evidence but must not become an avoid/block unless canonical `blockingRules` contains a blocking rule. Local temperature/size/filter/heater metadata may remain visible only as reference/context.
**Root cause:** `getSpeciesFitAssessment()` used canonical Compatibility for overall status while separately building heuristic `FitDimension` statuses, then `DecisionResultSurface` consumed `displayFit.risks/items` for watch/avoid/evidence. The same result card therefore mixed two decision authorities with incompatible severity semantics.
**Regression:** Fail-before commit `c39e094` adds source and 390px browser regressions. `scripts/test-species-detail-authority-presentation.mjs` forbids heuristic watch/avoid/evidence ownership; `scripts/verify-species-detail-authority-presentation.mjs` reproduces the 9L + 红绿灯 case, requires no `data-result-ux-avoid` when canonical blocking rules are empty, and requires reviewed group evidence. #130 candidate `45e8e61` passed 10/10 triggered workflows; merged runtime RC1 `f018ac03` passed 15/15 exact P0 + release checks.

---

## AQ-BC-CI-001 — Result UX green run validates a fixed legacy branch instead of the candidate

**Status:** `REGRESSION_VERIFIED` on RC1 via merged PR #132
**Related Rules:** CI head integrity / evaluator integrity / candidate-head acceptance
**Observed behavior:** `Result UX V1` triggered for RC1-bound work but explicitly checked out `agent/result-ux-v1`. A green run could therefore validate stale code instead of the pull-request candidate. Once checkout was corrected, the first real candidate run immediately exposed a second hidden drift: `test-result-ux-contract.mjs` still required the removed Species Detail heuristic `verdictReasons` implementation from before #130.
**Expected behavior:** Result UX must validate the exact pull-request head, verify the checked-out SHA at runtime, and keep its evaluator aligned with current accepted authority boundaries. A stale evaluator must be fixed rather than restoring superseded product behavior.
**Root cause:** An experimental workflow branch was permanently hard-coded into `actions/checkout`, and the fixed checkout allowed its source-shape assertions to drift away from the actual RC1 implementation without failing candidate acceptance.
**Regression:** Fail-before commit `e11e78e` captures the fixed legacy checkout. #132 binds checkout to `${{ github.event.pull_request.head.sha }}`, adds an explicit `git rev-parse HEAD` equality check, and wires an independent head-integrity contract into UI UX System. The first real run on `261897d` correctly failed the stale `verdictReasons` assertion; evaluator-only commit `c4df38e` updates Result UX to require canonical `canonicalDecisionEvidence` from Compatibility rule buckets. Final #132 candidate passed 7/7 workflows, and merged RC1 `c491effd` passed the expanded 16/16 exact-head matrix including Result UX `32708929859`.

---

## AQ-BC-REC-001 — Recommendation suppresses a non-blocked candidate before canonical Compatibility

**Status:** `REGRESSION_VERIFIED` on RC1 via merged PR #134
**Related Rules:** `AQ-MIX-004`, `AQ-MIX-005`, `AQ-MIX-007`; Recommendation / Compatibility authority separation
**Observed behavior:** In a 120L freshwater tank already containing `sp_0431` 红绿灯, candidate `sp_0016` 金波子 carried static `housingMode = 建议单养`. Canonical Compatibility returned `insufficient_data` with `blockingRules=[]`, warning-only `hard_species / single_housing`, and missing evidence. Ordinary Recommendation returned zero candidates and Smart Recommendation omitted the species from direct / adjustable / blocked entirely.
**Expected behavior:** Static housing metadata may contribute warning/context but must not silently remove a candidate before canonical Compatibility. A candidate with no canonical hard block remains representable; `caution / insufficient_data` may flow to the adjustable path.
**Root cause:** `isRecommendableSpecies()` and Smart Recommendation `basePool` each used `housingMode === 建议单养` as a pre-evaluation exclusion, escalating a planning warning into candidate suppression and removing it from Tank Copilot's local candidate pool.
**Regression:** `scripts/test-recommendation-authority.ts` reproduces the 120L + 红绿灯 + 金波子 case and requires both Recommendation paths to preserve the candidate when canonical `blockingRules=[]`. #134 removed only the two housing-mode prefilters. Candidate passed 16/16 triggered workflows; merged RC1 `dfa095f3` passed 16/16 exact-head checks.

---

## AQ-BC-REC-002 — Recommendation upgrades heuristic load / min-group warnings into hard blocks

**Status:** `REGRESSION_VERIFIED` on RC1 via merged PR #135
**Related Rules:** `AQ-SPACE-002`, `AQ-SPACE-003`, `AQ-SPACE-004`, `AQ-MIX-005`, `AQ-MIX-006`, `AQ-MIX-007`; Recommendation / Compatibility authority separation
**Observed behavior:** Three live Smart Recommendation cases contradicted canonical Compatibility: (1) near-limit heuristic load produced canonical `caution` with no blocking rules but Smart `blocked`; (2) a reviewed group-size gap produced canonical `insufficient_data` with no blocking rules but Smart `blocked`; (3) heuristic current load around 95% produced canonical `insufficient_data`, `blockingRules=[]`, while Smart both marked the candidate blocked and had a post-processing path that cleared direct/adjustable candidates.
**Expected behavior:** Heuristic load pressure and reviewed min-group gaps remain warning / adjustment information unless canonical Compatibility emits a hard blocking rule. Smart Recommendation must not manufacture `blocked`, erase adjustable candidates, or present a hard-stop summary from local load thresholds alone.
**Root cause:** `buildCandidate()` overwrote canonical classification with `status = blocked` when local `profile.load.loadRate >= nearLimit` or `minGroup > recommendedQuantity`; `recommendSmartForAquarium()` then independently used `loadBlocked` to clear direct/adjustable lists and emit a hard-stop summary.
**Regression:** Fail-before `7d6e85c` extends `scripts/test-recommendation-authority.ts` with near-limit, reviewed min-group, and 95% heuristic-load fixtures. Implementation `7a85b5c` preserves load/min-group risk text but removes their classification authority and the Smart post-filter hard stop. #135 candidate passed 11/11 workflows; exact merged RC1 `b69c3c3` passed 16/16 checks, including P0 Compatibility `32719324560` and Result UX `32719324489`.
