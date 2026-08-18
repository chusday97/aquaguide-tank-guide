# AquaGuide Environment Decision Engine V1 Handoff

Date: 2026-08-18
Branch: `agent/environment-decision-v1`
Base: `main@ed0cf38025652db901ee81aa697ca55b1c1584b6`
Draft PR: #96 `Add Environment Decision Engine V1`
Status: implementation complete; verified before final handoff commit

## Goal
Build a deterministic environment decision layer for AquaGuide so plant, habitat and equipment guidance is derived from structured requirements instead of scattered text heuristics.

## Scope for this iteration
- Environment / habitat profile schema
- TankContext builder
- Environment fit evaluator
- Plant interaction / habitat-benefit evaluator
- Heating requirement derivation
- Oxygenation requirement derivation
- Deterministic regression tests
- CI gate

## Explicit non-goals
- No bulk conversion of all catalog species in this iteration.
- No claim that arbitrary fish + plant pairs are reviewed or proven compatible.
- No LLM-generated husbandry facts written into the source of truth.
- No removal of the existing compatibility evidence boundary.
- No UI redesign in this branch.

## Evidence boundary
V1 separates engine correctness from husbandry knowledge coverage. The regression suite uses synthetic profiles to prove rule behavior; those fixtures are not catalog facts and must not be promoted into reviewed husbandry data. Production profiles must carry confidence, review status and source references before they are treated as reviewed knowledge.

## Current known problem being replaced
`src/lib/speciesFitEngine.ts` currently mixes deterministic environment checks with coarse equipment heuristics. In particular, heater need is approximated from species minimum temperature, while oxygen guidance can depend on keywords in free text. V1 establishes the replacement contract before production call sites are migrated.

## Implemented contract
### Profile layer
`src/modules/environment/environment.types.ts`
- `SpeciesEnvironmentProfile`
- `PlantEnvironmentProfile`
- `TankContext`
- `EnvironmentFitResult`
- `PlantMatchResult`
- `EquipmentRequirement`
- explicit confidence/review metadata

### Tank context
`src/modules/environment/buildTankContext.ts`
- normalizes water type, effective volume, target temperature, observed min/max temperature, pH, substrate, plants, hardscape and equipment;
- keeps `surfaceAgitation` separate from `airPump`;
- only infers medium surface agitation for a small explicit set of filter cases; otherwise remains `unknown`.

### Decision engine
`src/modules/environment/environmentDecisionEngine.ts`
- environment fit: water type, temperature, pH and volume;
- plant match: shared environment window, uprooting/digging/plant-eating interactions, cover/shelter benefits;
- heating: requires measured/estimated low-temperature evidence before concluding `required`/`not_needed`, except when the configured target itself is already below the species minimum;
- oxygenation: combines structured oxygen demand, temperature, load and surface agitation; it recommends oxygenation support rather than equating the requirement with an air pump.

## Regression cases
`scripts/test-environment-decision-engine.ts`
1. measured minimum below species range -> heating `required`;
2. target temperature without low-temperature evidence -> heating `unknown`;
3. high oxygen demand + warm water + high load + weak surface agitation -> oxygenation `recommended`;
4. high oxygen demand without support/risk observations -> oxygenation `unknown`, not automatic air-pump requirement;
5. high uprooting risk + rooted plant -> `caution`;
6. same animal + tough epiphyte -> not blocked solely by uprooting and cover benefit remains visible;
7. high plant-eating risk + delicate plant -> `not_recommended`;
8. end-to-end decision keeps environment, plant and equipment outputs separate.

## Real fail-before / correction history
Environment Decision V1 run #4 / `32124295758` failed only in regression case 8 after typecheck and build had already passed. The fixture used `lowestObservedTemperature = 25` for a species with a 24°C lower bound, while the implemented rule intentionally treats a <=1°C margin as `recommended`. The test incorrectly expected `not_needed`.

The rule was **not** weakened. The end-to-end fixture was changed to 26°C so that case 8 tests output separation rather than the near-minimum heating threshold.

## Verified runs before final handoff commit
- Environment Decision V1 #6 / run `32124458740`: **SUCCESS**
  - typecheck PASS
  - build PASS
  - 8 deterministic environment regressions PASS
- Product Golden Path #689 / run `32124458805`: **SUCCESS**
  - Product evaluation contracts PASS
  - typecheck PASS
  - build PASS
  - Care card action regression PASS
  - GP-001 PASS
  - GP-002 PASS
  - GP-003 PASS
  - GP-004 PASS
  - GP-005 PASS

## Progress
- [x] Isolated branch created from main.
- [x] Scope and evidence boundary recorded before implementation.
- [x] Profile schema implemented.
- [x] TankContext builder implemented.
- [x] Environment decision engine implemented.
- [x] Plant matching implemented.
- [x] Heating / oxygenation derivation implemented.
- [x] Regression tests added.
- [x] Dedicated CI workflow added.
- [x] Typecheck/build/environment regression green on implementation head.
- [x] Product Golden Path green on implementation head.
- [x] Production migration decision recorded: do not wire into `speciesFitEngine` until a reviewed pilot profile cohort exists.

## Production migration decision
Do **not** replace the current production heater/oxygen/plant behavior in this PR. The new engine is deliberately introduced behind a clean module boundary first. Wiring it into user-facing recommendations before reviewed profile coverage exists would convert missing knowledge into silent behavior loss or false certainty.

The next production step is a small evidence-backed cohort (roughly 10-20 common livestock + 10-15 common plants). Once that cohort passes coverage and decision regressions, migrate only those reviewed profiles to the new engine and keep all other species fail-closed/legacy until coverage expands.

## Final-head note
This handoff update itself creates one documentation-only commit after the verified implementation head. Re-check the PR's latest-head workflows after this commit; do not treat this note as a substitute for CI status.

Draft PR #96 remains open and unmerged. Do not merge without explicit authorization.
