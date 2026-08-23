# AquaGuide Product Badcases

This is the canonical product badcase ledger for newly created or newly touched product failures.

Badcase statuses: `OPEN`, `INVESTIGATING`, `FIXED`, `REGRESSION_VERIFIED`, `WONT_FIX`.

Historical entries in `BADCASE_LATEST.md`, evaluation fixtures and older Handoff/Progress files are not bulk-copied here. Migrate an old badcase when it is touched, then keep this file as the full canonical definition.

---

## AQ-BC-SPACE-001 — Recommended tank size becomes a current removal instruction

**Status:** `OPEN`
**Related Rules:** `AQ-SPACE-001`, `AQ-STATE-001`, `AQ-STATE-005`
**Observed behavior:** Current Aquarium logic can treat the gap between effective tank volume and a species' recommended minimum as a current “space pressure” problem and immediately recommend reducing/removing livestock or upgrading the tank.
**Expected behavior:** For an existing aquarium, a general recommendation gap remains prior/space evidence unless a hard physical constraint or observed current problem supports intervention.
**Root cause:** Planning/recommendation heuristics are consumed directly by the existing-tank risk/Today Action layer.
**Regression:** Domain acceptance now exists in `test:p0-tank-state` and returns stable for a normal observed tank with a generic space prior. Aquarium wiring is still pending, so this badcase remains OPEN.

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

**Status:** `OPEN`
**Related Rules:** `AQ-MIX-003`, `AQ-DIAG-001`, `AQ-STATE-001`
**Observed behavior:** Current Aquarium risk logic can classify `Aggressive + Peaceful` stocked species as a danger and recommend removal/separation without first requiring observed chasing, injury, feeding exclusion or reviewed predation evidence.
**Expected behavior:** The metadata creates an aggression/territory prior and observation target. Current conflict/intervention requires observed evidence or a true deterministic hard constraint.
**Root cause:** Existing-tank `getTankRiskItems()` mixes planning priors with current-state diagnosis.
**Regression:** Domain acceptance now exists in `test:p0-tank-state`: static aggression prior alone is watch, and recent normal evidence can be stable. Aquarium wiring is still pending, so this badcase remains OPEN.

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

**Status:** `OPEN`
**Related Rules:** `AQ-STATE-001`, `AQ-STATE-005`, `AQ-MIX-009`
**Observed behavior:** Aquarium currently finds a static `danger` risk and directly creates a high-priority `compatibility_review` Today Action before a Current Tank State evaluation exists.
**Expected behavior:** Compatibility output is Prior Risk for stocked livestock. Today Action is derived only after combining prior, tank context, observed evidence, time/history and hard constraints.
**Root cause:** Existing `blockingCompatibilityRisk` bypasses the missing Tank State authority.
**Regression:** Fail-before commit `72ae99e` proves the bypass. Domain candidate `agent/p0-tank-state-engine-v1` adds Current Tank State semantics; Aquarium wiring is still pending, so this badcase remains OPEN.
