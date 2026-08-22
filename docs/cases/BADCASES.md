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
**Regression:** `BC-SPACE-001` defined; executable regression not yet added.

---

## AQ-BC-BIOLOAD-001 — Temperament inflates bioload

**Status:** `OPEN`  
**Related Rules:** `AQ-SPACE-002`, `AQ-SPACE-003`, `AQ-SPACE-004`  
**Observed behavior:** Current compatibility code increases heuristic bioload when a species is `Aggressive` or `Territorial`, mixing behavioral pressure into biological load.  
**Expected behavior:** Aggression/territory and bioload remain independent dimensions; temperament must not increase bioload through an arbitrary multiplier.  
**Root cause:** `estimateBioload()` combines size and temperament into one heuristic score.  
**Regression:** Acceptance intent is covered by `AQ-SPACE-003`; executable regression not yet added.

---

## AQ-BC-MIX-001 — Static aggression metadata becomes active current conflict

**Status:** `OPEN`  
**Related Rules:** `AQ-MIX-003`, `AQ-DIAG-001`, `AQ-STATE-001`  
**Observed behavior:** Current Aquarium risk logic can classify `Aggressive + Peaceful` stocked species as a danger and recommend removal/separation without first requiring observed chasing, injury, feeding exclusion or reviewed predation evidence.  
**Expected behavior:** The metadata creates an aggression/territory prior and observation target. Current conflict/intervention requires observed evidence or a true deterministic hard constraint.  
**Root cause:** Existing-tank `getTankRiskItems()` mixes planning priors with current-state diagnosis.  
**Regression:** `BC-MIX-001` defined; executable regression not yet added.
