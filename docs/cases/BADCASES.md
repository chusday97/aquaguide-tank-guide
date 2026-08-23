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
