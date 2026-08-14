# Life-type detail semantics

## Problem

The historical `Fish` schema is shared by animals, aquatic plants, and hardscape. Even after `speciesFitEngine` became life-type aware, the species-detail UI still contained a second local evaluator and livestock-only labels. A plant could therefore display fish-style tank-volume, compatibility, feeding, sex-identification, or memorial semantics.

## Boundary

- `fish`, `invertebrate`, `reptile`, and `coral` keep the existing species-detail implementation in this phase.
- `plant` and `hardscape` route to a non-livestock detail surface.
- The non-livestock surface consumes `evaluateSpeciesForAquarium()` rather than implementing another compatibility/stocking evaluator.
- Plant detail uses care semantics: inputs, routine, application, avoid, growing conditions.
- Hardscape detail uses placement/material semantics and explicitly states that it is not livestock.
- Plant/hardscape detail does not expose minimum livestock tank volume, housing mode, compatibility calculator, sex identification, or memorial/death controls.

## Regression contract

`scripts/test-life-type-detail-semantics.ts` must remain in Product Golden Path. It checks routing, forbidden livestock semantics in the non-livestock surface, and adversarial plant/hardscape fixtures carrying dirty fish-style fields.

This phase does not rewrite the shared catalog schema. Schema migration and field cleanup remain a later task after all user-visible consumers are life-type aware.
