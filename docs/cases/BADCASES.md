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

**Status:** `REGRESSION_VERIFIED` on `agent/p0-compatibility-engine-v2`
**Related Rules:** `AQ-MIX-006`, `AQ-MIX-008`, `AQ-SPACE-002`
**Observed behavior:** `evaluateCompatibilityDecision()` evaluated every pair and used the worst pair as the aggregate result; a 3-species plan could therefore inspect only pair-level quantities and never evaluate the complete planned stocking once.
**Expected behavior:** Pair relationships and whole-tank feasibility are separate calculations; full planned quantities are aggregated exactly once for whole-tank screening.
**Root cause:** The aggregate decision was built exclusively from `pairResults`.
**Regression:** `wholeTankFeasibility.totalQuantity` and `whole_tank_bioload_screen_*` are verified by `scripts/test-p0-compatibility-product-truth.ts` using 3 × 7 small fish.

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

**Status:** `REGRESSION_VERIFIED` on `agent/p0-water-change-engine-v1`
**Related Rules:** `AQ-WATER-001`, `AQ-WATER-002`, `AQ-WATER-004`
**Observed behavior:** Aquarium directly derived `isChangeOverdue` from the shortest stocked-species `waterChangeCycle`, deducted health score by overdue days, and created a `high`-priority Water Change Today Action even when the current structured patrol was normal.
**Expected behavior:** Water-change history remains factual history; species cycle is a maintenance baseline only. Calendar overdue may surface a maintenance recommendation, but without current abnormal evidence it must not classify the aquarium as urgent/currently unsafe.
**Root cause:** Page-level schedule arithmetic owned Today Action and health semantics instead of a dedicated Water Change decision layer that combines baseline, real history and current evidence.
**Regression:** `test:p0-water-change` verifies the domain boundary and `test:p0-water-change-ui` proves an overdue baseline + normal patrol renders a maintenance action, explicitly says overdue alone is not urgent, and remains responsive at 390/900/1600px.

---

## AQ-BC-EVAL-002 — Compatibility evidence provenance coverage is red on the upstream baseline

**Status:** `OPEN`
**Related Rules:** compatibility evidence provenance / evaluator integrity
**Observed behavior:** `test:compatibility-evidence-coverage` expects direct predator-prey evidence provenance `pair_rule`, while #116 baseline and the current stack return `tank_condition`.
**Expected behavior:** The evidence model and evaluator must agree on the canonical provenance for reviewed predator-prey evidence without weakening the actual predation block.
**Root cause:** Pre-existing upstream evaluator/model drift; reproduced unchanged on #116 head `249d5b6`.
**Regression:** Baseline reproduction is documented; intentionally not repaired inside Existing Tank Authority wiring because this PR does not change Compatibility provenance.
