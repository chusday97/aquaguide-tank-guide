# AquaGuide Environment Decision Engine V1 Handoff

Date: 2026-08-18
Branch: `agent/environment-decision-v1`
Base: `main@ed0cf38025652db901ee81aa697ca55b1c1584b6`
Draft PR: #96 `Add Environment Decision Engine V1`
Status: engine + reviewed-profile gate + plant-detail fail-closed boundary implemented; Draft / unmerged

## Goal
Build a deterministic environment decision layer for AquaGuide so environment, plant, habitat and equipment guidance comes from structured reviewed facts instead of scattered prose, regex heuristics or generic animal templates.

The product rule is now explicit:

`source evidence -> structured claim -> review gate -> deterministic decision -> UI explanation`

Missing evidence remains missing. It must not be converted into a confident husbandry claim by an LLM, a regex, a fallback template or a UI placeholder.

## What is implemented

### 1. Deterministic Environment Decision Engine
`src/modules/environment/`
- `environment.types.ts`
- `buildTankContext.ts`
- `environmentDecisionEngine.ts`
- `environmentProfileRegistry.ts`

The engine separates:
- environment fit;
- plant match;
- equipment requirements.

Core decisions include:
- water type / temperature / pH / tank size checks;
- trait-based plant interaction for digging, uprooting and plant-eating risk;
- habitat benefits such as cover / shelter;
- heating requirement from actual low-temperature evidence;
- oxygenation support from oxygen demand + temperature + stocking load + surface agitation.

Important boundaries:
- target temperature alone does not prove heater requirement or non-requirement;
- high oxygen demand does not mean an air pump is uniquely required;
- surface agitation and air pump remain separate concepts;
- missing observations return `unknown` rather than inferred safety.

### 2. Engine regressions
`scripts/test-environment-decision-engine.ts`

Eight deterministic cases cover:
1. measured minimum below species range -> heating `required`;
2. target temperature without low-temperature evidence -> heating `unknown`;
3. high oxygen demand + warm water + high load + weak agitation -> oxygenation `recommended`;
4. high oxygen demand with missing support observations -> oxygenation `unknown`;
5. high uprooting risk + rooted plant -> `caution`;
6. tough epiphyte is not blocked solely by uprooting and cover benefit remains visible;
7. high plant-eating risk + delicate plant -> `not_recommended`;
8. environment / plant / equipment outputs stay separate end to end.

Synthetic fixtures prove rule behavior only. They are not catalog husbandry facts.

## Reviewed knowledge layer

### Evidence registry
`src/data/environmentEvidence.ts`

Sources are registered before they can support reviewed facts. Current source classes include:
- database;
- expert husbandry;
- primary (available in the type contract for future use).

### Species profiles
`src/data/speciesEnvironmentProfiles.ts`

Current reviewed livestock cohort:
1. `sp_0045` — *Sewellia lineolata*
   - freshwater;
   - high oxygen demand;
   - high flow preference;
   - rock / gravel habitat association.
2. `sp_0431` — *Paracheirodon innesi*
   - freshwater;
   - reviewed temperature window 20–26°C;
   - minimum tank length 60 cm;
   - pH intentionally omitted because reviewed sources do not use the same upper bound.

### Plant profiles
`src/data/plantEnvironmentProfiles.ts`

Current reviewed plant cohort:
1. `sp_0081` — *Microsorum pteropus*
   - low light;
   - CO₂ optional;
   - epiphyte;
   - does not rely on substrate;
   - tough leaves;
   - cover / fry-shelter value.
2. `sp_0071` — *Micranthemum callitrichoides* / dwarf baby tears
   - high light;
   - CO₂ recommended;
   - rooted carpeting growth;
   - exact substrate material intentionally omitted because the reviewed sources do not justify a single precise material claim.
3. `sp_0075` — *Anubias barteri* var. *nana*
   - low light;
   - CO₂ optional;
   - epiphyte;
   - does not rely on substrate;
   - tough leaves.

Current reviewed coverage: **5 profiles total = 2 livestock + 3 plants**.

This is a pilot cohort, not broad catalog completeness.

## Trait-level provenance gate

`EvidenceMeta` now includes `claimRefs`:

```ts
claimRefs?: Record<string, string[]>;
```

A reviewed profile is rejected if:
- it has fewer than two profile-level sources;
- confidence is `low` or `unknown`;
- a source id is not registered;
- an explicit trait has no claim-level evidence;
- a claim cites a source not declared by the profile;
- claim evidence exists for a trait the profile does not actually expose;
- a `high` confidence trait has only one evidence source;
- temperature / pH ranges are invalid;
- a reviewed plant still has unknown planting type.

This prevents the weaker pattern of “this card has two URLs, therefore every field is reviewed.” Each explicit field must trace back to exact evidence.

## Real plant-catalog problem discovered

The environment work exposed a broader legacy modeling problem in `fishData.ts`.

System audit from Environment Decision V1 #95 / run `32139824913` found:
- **65** records classified as aquatic plants by `isAquaticPlantSpecies()`;
- **65 / 65** still carry a raw animal-shaped `feedingProfile`;
- **30 / 65** have a raw category that does not identify them as plant / aquatic plant.

Example: `sp_0081` (*Microsorum pteropus*) was correctly recognizable as a plant by taxonomy/name logic but the legacy catalog still carried fish-style classification / feeding fallback data.

This is not a one-record typo. It is systemic legacy schema debt.

### Debt budget
`scripts/test-plant-catalog-care-boundary.ts` now enforces:
- raw category anomalies may not increase above 30;
- raw animal feeding-profile anomalies on plants may not increase above 65.

Legacy debt may stay temporarily or shrink, but new catalog work cannot make it worse.

## Plant care fail-closed boundary

### Presentation layer
`src/modules/knowledge/speciesCarePresentation.ts`

Plants no longer consume animal feeding fallbacks.

For a plant:
- audit-clean reviewed profile -> `verified` structured plant care;
- no reviewed profile -> `pending`;
- `feedingItems` is always empty;
- no animal feeding template is used to fill missing plant knowledge.

For reviewed plants the UI can show structured fields such as:
- light;
- CO₂;
- planting mode;
- substrate relation;
- leaf durability.

For unreviewed plants the product says the plant data is pending review instead of inventing care instructions.

### Species detail UI
`src/components/SpeciesDetailDialog.tsx`

The previous component contained several fish-only bypasses. Those are now closed.

Plants no longer:
- read `fish.feedingProfile` directly;
- show the animal `Feeding at a glance` surface;
- show the legacy fish environment summary;
- show the fish-fit verdict;
- show the fish-fit “Why?” accordion;
- show pair compatibility;
- show sex-identification content;
- show death / exit recording;
- expose livestock add / compatibility actions.

Plant primary action is now `查看植物养护 / View plant care` and returns to the reviewed plant-care surface.

More importantly, the plant path now **bypasses animal-only evaluators instead of only hiding their results**:
- `getSexIdentificationGuide()` is not called for plants;
- pair `evaluateCompatibilityDecision()` is not called for plants;
- compatibility visual model is not built for plants;
- `getSpeciesFitAssessment()` is not called for plants.

Plants can render the detail view with `selectedFit = null`; there is no fake neutral livestock-fit object created solely to satisfy the component shell.

### Permanent boundary regressions
- `scripts/test-species-detail-care-boundary.mjs`
- `scripts/test-plant-catalog-care-boundary.ts`

These enforce both source-consumption boundaries and UI/evaluator boundaries.

## Valid fail-before history

### Environment rule fixture
Environment Decision V1 #4 / run `32124295758` failed case 8 because the test expected heating `not_needed` when measured minimum was only 1°C above the species lower bound. The engine intentionally treats that margin as `recommended`.

This was a **test-fixture problem**, not a product bug. The rule was preserved and the fixture was corrected to test output separation.

### Plant legacy data / UI leaks
Later red-first regressions exposed actual product problems:
- reviewed plant record resolving to fish-shaped legacy catalog data;
- plant detail reading animal feeding fallback directly;
- plant detail showing legacy fish environment summary;
- plant detail exposing fish-fit / compatibility / sex / death surfaces;
- animal-only evaluators still running internally after the UI was hidden.

Those were valid Badcases and were fixed at the consumption boundary rather than by pretending the raw catalog was already clean.

## Verification history

### Formal green environment audit before final fit-engine bypass
Environment Decision V1 #95 / run `32139824913`: **SUCCESS**
- typecheck PASS;
- build PASS;
- 8 environment decision regressions PASS;
- profile evidence regression PASS;
- Species detail care boundary PASS;
- plant catalog care boundary PASS.

This run produced the 65 / 65 feeding-profile and 30 / 65 category anomaly audit above.

### One-shot verified code patches
Several temporary write-enabled workflows were used only to patch the large `SpeciesDetailDialog.tsx` safely. Each required typecheck/build (and, where applicable, boundary regression) before committing, then deleted itself.

The latest plant fit-engine bypass workflow / run `32140997735`: **SUCCESS**
- patch applied PASS;
- care boundary regression PASS;
- typecheck PASS;
- build PASS;
- commit / self-delete PASS.

Permanent Environment CI is read-only (`contents: read`). Temporary patch workflows are not part of the intended final repository state.

### Current-head CI note
The bot-generated patch commit triggered follow-up PR workflows that GitHub marked `action_required` with zero jobs. That state means the follow-up workflows did not execute; it is not evidence of a product/test failure.

This HANDOFF commit is authored through the normal GitHub connector specifically so the permanent Environment Decision and Product Golden Path workflows can re-run on a normal head. Use the latest workflow status after this commit as the final source of truth.

## Production boundary

### Allowed now
- deterministic Environment Decision Engine as an isolated module;
- reviewed profile registry;
- trait-level provenance auditing;
- reviewed plant care presentation for the small pilot cohort;
- fail-closed plant details for uncovered plant knowledge.

### Not allowed yet
- claiming broad species/environment completeness;
- bulk migration of every catalog record;
- using prose / regex to recreate missing structured traits;
- showing plant-to-tank fit verdicts before a reviewed plant-to-tank adapter exists;
- treating `sourceRefs[]` alone as proof for every trait;
- letting LLM output become source-of-truth husbandry data.

### Legacy animal fit migration
`speciesFitEngine` remains the existing livestock production path outside this reviewed pilot boundary. The new environment engine should only replace legacy behavior for species with audit-clean reviewed profiles and after adapter equivalence / UX checks.

## Next work
1. Re-run permanent Environment Decision + Product Golden Path on the connector-authored head and keep #96 Draft.
2. Expand the reviewed pilot cohort with source-backed common livestock and plants.
3. Add a reviewed-only production adapter; uncovered species remain fail-closed / legacy.
4. Gradually normalize the 65 legacy plant records so the raw catalog debt budgets decrease.
5. Keep plant-to-tank verdicts hidden until the plant adapter is backed by reviewed plant traits and explicit tank-context inputs.

## Merge rule
Draft PR #96 remains **open and unmerged**. Do not merge without explicit user authorization.
