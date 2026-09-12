# Handoff Latest

Updated: 2026-09-11
Branch: `product-recovery-20260911`
Base: current recovery line from `main`

## Current checkpoint
- Compatibility rule authority advanced to `compatibility-domain-v4-target-vulnerability`.
- Added structured `finNipVulnerability` and `swimmingPace` alongside existing `finNippingRisk`.
- Generic reviewed fin-nipper + reviewed vulnerable target now raises `fin_nipping_target_vulnerability` as caution.
- Species Fit prefers reviewed vulnerability/fin-nipping facts over fish-name regex when reviewed knowledge exists.
- Guppy is the first reviewed vulnerable target; its social authority records high fin-nip vulnerability.
- Added a reviewed tiger-barb × guppy pair override as `not_recommended`; sufficient tiger-barb group size does not erase the long-fin fin-nipping conflict.
- Beginner Action has a dedicated vulnerability caution and recognizes reviewed pair blocks as explicit `不建议混养`.

## Verified
- Compatibility evidence coverage: PASS; reviewed pair-rule floor is now 5.
- Domain compatibility: PASS, including generic target-vulnerability caution.
- Legacy compatibility facade: PASS, including tiger-barb × guppy reviewed block.
- Visual result actions: PASS.
- TypeScript lint: PASS.
- Production build: PASS.
- Compatibility beginner-action browser E2E: PASS, including tiger-barb × guppy reviewed block.
- GP001, GP002, GP003, GP004: PASS.

## Next task
Expand target vulnerability only where reviewed husbandry evidence supports it, then continue the next high-frequency Species Knowledge V2 cohort. Keep pair rules as overrides and do not infer vulnerability from names.

## Latest checkpoint — base-species authority inheritance
- Added runtime lookup helpers that prefer exact species/variant review, then fall back to an explicit base-species scientific-name authority.
- Kept direct review audit APIs unchanged so inherited variants do not count as independently reviewed species.
- Betta ornamental variants now inherit the reviewed `Betta splendens` baseline instead of falling back to stale catalog-only behavior.
- Added direct reviewed `Pterophyllum scalare` knowledge/profile; tiger barb × angelfish now surfaces structured fin-nipping target vulnerability without a stale single-housing or fake predation block.
- Runtime Compatibility, Species Fit, compatibility presentation, and housing labels use inheritance-aware authority consistently.
- Verified: Species Knowledge PASS, Compatibility PASS, Domain PASS, TypeScript PASS, production build PASS, Compatibility beginner-action E2E PASS, GP001–GP004 PASS.

## Latest checkpoint — capacity heuristic cleanup
- Removed the remaining legacy 1.35× Aggressive/Territorial multiplier from bioload estimation.
- Removed `loadMultiplier` from the Domain species contract because behavior must not act as a waste-production proxy.
- Retired Species Fit `density_high`, which treated raw animal count as comparable regardless of adult size/species needs.
- Added regressions proving temperament cannot change load screening for the same species/size/quantity and raw count alone cannot produce `density_high`.
- Verified: Domain PASS, Compatibility PASS, TypeScript PASS, production build PASS, Compatibility beginner-action E2E PASS, GP001–GP004 PASS.

## Latest checkpoint — bottom-zone ecology
- Added reviewed Species V2 profiles for 咖啡鼠 (`sp_0014`) and 熊猫鼠 (`sp_0443`).
- Corrected catalog scientific name `Corydoras pandas` → `Corydoras panda`.
- Added `swimmingZone` to Domain species facts and wired reviewed social/space knowledge into compatibility.
- Added informational `shared_bottom_zone_context`; two bottom dwellers no longer disappear into generic compatibility, but the shared zone does not itself raise caution.
- Evidence coverage remains fail-closed: 132 priority directions, 12 reviewed recordable directions, 98 insufficient, 22 not recommended, 12 caution.
- Verified: Species Knowledge PASS, Domain PASS, Compatibility PASS, evidence coverage PASS, TypeScript PASS, production build PASS, Compatibility beginner-action E2E PASS, GP001–GP004 PASS.

## Latest checkpoint — Species Detail reviewed knowledge presentation
- Added a reviewed `Adult size & space / 成体与空间` disclosure using Species V2 authority.
- Social/group disclosure now includes reviewed recommended-group guidance and localized swimming-zone labels.
- Browser contract updated for the reviewed neon-tetra group-size rule: a default quantity of 1 is caution and exposes the risk action rather than direct stocking.
- Removed the duplicate calculator CTA from the unavailable compatibility disclosure.
- Verified: Species Knowledge PASS, TypeScript PASS, production build PASS, Species Detail E2E PASS, Compatibility E2E PASS, GP001–GP004 PASS.

## Latest checkpoint — Species Detail reviewed-knowledge presentation
- Added a reviewed `Adult size & space` disclosure without redesigning the Species Detail hierarchy.
- Shows adult size, planning volume, tank length, swimming zone, activity level, notes, and traceable sources only when reviewed knowledge exists.
- Social/group disclosure now shows recommended group ranges and localized swimming-zone labels.
- Removed duplicate Compatibility Calculator CTA from the unavailable compatibility state.
- Species Detail browser contract now respects reviewed group-size authority: one neon tetra is caution, so the footer action is `View current tank risks`, not direct add.
- Verified: TypeScript PASS, Species Knowledge PASS, production build PASS, Species Detail E2E PASS, Compatibility beginner-action E2E PASS, GP001–GP004 PASS.

### P1 — Reviewed housing authority convergence
- Unified Species Detail, Compatibility Calculator, Encyclopedia, and Aquarium surfaces on one reviewed housing authority.
- Authority order: exact reviewed species -> inherited base-species authority -> legacy catalog fallback.
- Social structure and community-tank risk are represented separately: e.g. tiger barb is `Group 8+` while community status remains caution because reviewed fin-nipping/aggression evidence still applies.
- Removed remaining user-facing direct reads of stale `fish.housingMode` from Encyclopedia and Aquarium decision surfaces.
- Removed Aquarium-only aggression/territoriality multiplier from coarse bioload calculation.

#### Validation
- Species Knowledge: PASS.
- Compatibility: PASS.
- Compatibility evidence coverage: PASS (132 directions; recordable 12; reviewed pair rules 5).
- TypeScript: PASS.
- Production build: PASS.
- Species Detail browser E2E: PASS.
- Compatibility beginner-action browser E2E: PASS.
- GP001 / GP002 / GP003 / GP004: PASS.

### P1 — V5 predation vulnerability + common invertebrates
- Added reviewed base-species authority for `Neocaridina davidi`, `Caridina cantonensis`, and `Neritina natalensis`; exact-ID audit remains distinct from inherited runtime authority.
- Domain V5 separates active predator risk from prey vulnerability and adds `lifeType` so shrimp-vulnerability caution applies to fish/shrimp, not shrimp/shrimp.
- Beginner Action for reviewed fish + vulnerable shrimp is `先确认鱼不会把虾当食物`; explicit reviewed predators retain the stronger hard block.
- Coverage audit now requires every recordable fish/high-vulnerability-invertebrate direction to expose either prey-vulnerability caution or a stronger predation block.
- Priority raw catalogue matrix: 132 directions; recordable=110 (108 caution, 2 compatible), not_recommended=22. This raw metric contains duplicate catalogue taxa and must not be described as overall safety/coverage.
- Verified: Domain PASS, Compatibility PASS, Species Knowledge PASS, Visual Actions PASS, evidence coverage PASS, TypeScript PASS, production build PASS, Compatibility beginner-action browser E2E PASS, Species Detail E2E PASS, GP001–GP004 PASS.

### P1 — Canonical priority coverage metric
- Centralized base-species scientific-name parsing in `speciesTaxonomy.ts`; compatibility evidence inheritance and Species Knowledge inheritance use the same helper.
- Coverage now de-duplicates morphs/duplicate catalog IDs into canonical biological taxa.
- Priority matrix truth: raw catalogue 132 directions / 110 recordable, but canonical biological matrix 56 directions / 42 recordable; all canonical recordable results are caution and 14 are not recommended.
- The two raw `compatible` results were duplicate Neritina IDs representing the same taxon and are intentionally excluded from canonical progress.
- Regression requires duplicate records for one taxon to agree on verdict.

### P1 — Amatitlania partial Species Knowledge V2
- Gap audit found two Compatibility-reviewed species without Species Knowledge V2: `sp_0021` 迷你鹦鹉鱼 and `sp_0049` 珍珠赤雷龙.
- Prioritized `Amatitlania nigrofasciata` and reused the existing peer-reviewed territory/aggression evidence instead of inventing a second source layer.
- Added partial V2 social authority only: territoriality high, fin-nipping/aggressive-contact context medium, while sex remains explicit unknown and reproduction/space remain absent.
- Added base-species Compatibility + Knowledge inheritance for `Amatitlania nigrofasciata var.*`; direct audit counts are not inflated by ornamental variants.
- Canonical priority matrix now includes 迷你鹦鹉鱼: 9 taxa / 72 ordered directions, 56 caution + 16 not_recommended, 0 unconditional compatible.
- Verified: Species Knowledge, Compatibility, Domain, Visual Actions, canonical evidence coverage, TypeScript, production build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004 all PASS.
- Next: close `Channa asiatica` partial V2 only to the extent supported by its reviewed USFWS assessment; do not infer sex/reproduction/space facts beyond evidence.

### P1 — Channa partial knowledge convergence
- Closed the final Compatibility-reviewed → Species Knowledge V2 gap for `Channa asiatica`.
- Added only source-supported predator / solitary behavior; sex remains unknown and reproduction / space are intentionally absent.
- `Channa asiatica var. Albino` inherits reviewed base-species authority and still produces the hard `predation_risk` block against a small fish.
- Added an authority-gap regression: any catalog fish with reviewed Compatibility authority but no Species Knowledge V2 authority now fails the Species Knowledge test. Current gap count: 0.
- Verified: Species Knowledge, Compatibility, Domain, Visual Results, canonical evidence coverage, TypeScript, production build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004 all PASS.
- Next: choose the next new canonical high-frequency species from reviewed external evidence; do not add ornamental duplicates or fabricate missing fields.

### P1 — Reviewed environment authority + platy checkpoint
- Added optional Species Knowledge V2 environment authority and wired it into Domain compatibility before legacy catalog temperature/pH values.
- `Xiphophorus maculatus` now uses reviewed Seriously Fish + FishBase evidence for environment, sexing, livebearing reproduction, social behavior and planning space.
- Regression proves a 27°C tank is blocked for the reviewed 20–26°C platy range even though the old catalog string said 20–28°C.
- Added `territorial_pressure_context` so one-sided territorial pressure on a reviewed peaceful fish produces caution; this fixed a false compatible result for 迷你鹦鹉鱼 ↔ 月光鱼.
- Canonical priority coverage: 10 taxa / 90 directions = 70 caution, 18 not_recommended, 2 compatible; the compatible pair is platy ↔ nerite snail in both directions.
- Verified: Domain, Compatibility, Species Knowledge, Visual Actions, evidence coverage, TypeScript, production build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004 PASS.

### P1 — Molly reviewed authority + environment disclosure
- Added `Poecilia sphenops` (`sp_0437`) as a direct reviewed taxon using Seriously Fish husbandry evidence.
- Reviewed facts: 21–28°C, pH 7.0–8.5, 15–30 dGH, ~8 cm SL, 90 cm tank length / ~81 L planning volume, gonopodium sexing, livebearing, male pursuit and adult-fry predation context.
- Gestation timing remains intentionally unset because reviewed sources disagree.
- Species Detail now exposes a reviewed water-conditions disclosure; browser E2E verifies the molly values and source.
- Commercial `Poecilia sphenops var.*` records do not inherit this authority automatically due documented hybridisation with `P. latipinna`.
- Validation: Domain / Compatibility / Visual / Species Knowledge / evidence coverage / TypeScript / build / Species Detail E2E / Compatibility E2E / GP001–GP004 PASS.

### P1 — V6 space symmetry + standard swordtail
- Fixed a directionality bug: reviewed min tank volume/length is checked for existing species as well as the candidate, keeping planned-addition advice consistent when pair order changes.
- Added direct reviewed `Xiphophorus hellerii` (`sp_0438`) knowledge/compatibility authority from Seriously Fish + FishBase.
- Social authority records male dominance/intraspecific competition without mislabeling the species as universally territorial toward all community fish.
- No automatic inheritance for `X. hellerii var.*` commercial morphs because many ornamental swordtails have hybrid ancestry.
- Validation: Domain / Compatibility / Species Knowledge / Visual / evidence coverage / TypeScript / build / Species Detail E2E / Compatibility E2E / GP001–GP004 PASS.
