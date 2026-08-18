# AquaGuide Environment Decision Engine V1 Handoff

Date: 2026-08-18
Branch: `agent/environment-decision-v1`
Base: `main@ed0cf38025652db901ee81aa697ca55b1c1584b6`
Status: in progress

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
V1 separates engine correctness from husbandry knowledge coverage. Tests may use synthetic profiles to prove rule behavior, but synthetic fixtures are not catalog facts. Production profiles must carry confidence/review metadata before they are treated as reviewed knowledge.

## Current known problem being replaced
`src/lib/speciesFitEngine.ts` currently mixes deterministic environment checks with coarse equipment heuristics. In particular, heater need is approximated from species minimum temperature, while oxygen guidance can depend on keywords in free text. This iteration establishes a replacement contract before production call sites are migrated.

## Progress
- [x] Isolated branch created from main.
- [x] Scope and evidence boundary recorded before implementation.
- [ ] Profile schema implemented.
- [ ] TankContext builder implemented.
- [ ] Environment decision engine implemented.
- [ ] Plant matching implemented.
- [ ] Heating / oxygenation derivation implemented.
- [ ] Regression tests added and run.
- [ ] CI gate added and green.
- [ ] Production migration decision recorded.

## Next decision after V1
Choose a small reviewed pilot cohort (roughly 10-20 common livestock + 10-15 plants) and add evidence-backed profiles. Only after that should `speciesFitEngine` migrate heater/oxygen/plant guidance to the new engine.
