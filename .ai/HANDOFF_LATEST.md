# Handoff Latest
## Harlequin reviewed-authority checkpoint — 2026-09-12
- Current recovery branch: `product-recovery-20260911`; pre-checkpoint HEAD `2bc2ed70f801`, fully aligned with current main before this data expansion.
- Added reviewed `Trigonostigma heteromorpha` (`sp_0468`) knowledge/profile authority from Seriously Fish + FishBase; no variant inheritance was introduced.
- Canonical priority coverage is now 13 taxa / 156 ordered directions: 130 caution, 24 not_recommended, 2 compatible.
- Git/Admin Compatibility baseline is 15 Profiles / 5 Pair Rules; new additive migration: `202609120002_compatibility_harlequin_baseline.sql`.
- Do not apply the migration to Staging/Production as part of this checkpoint.
- Full product/runtime/admin validation is green through build, Species Detail, Compatibility Beginner Action and GP001–GP004.
- Next: commit/push this checkpoint, verify PR #149 current-head CI, then select the next distinct canonical taxon only if reviewed evidence is strong enough.

## Main release context absorbed — 2026-09-12
- After the first recovery merge commit `45940c85`, remote main advanced by two commits: `5fa915d3` (Vercel Business API ESM bundle) and `162bbc1f` (Production release closeout docs).
- The recovery branch must retain main's `build:business-api`/esbuild packaging and router changes. The active Product Recovery authority remains V6 + Species Knowledge V2 + 14/5 reviewed Compatibility; no Staging/Production migration or index unlock is implied.
- Revalidate root build, API typecheck, runtime authority, Browser Compatibility/Species Detail and GP001–GP004 after the second controlled merge; only then push and re-read PR #149 mergeability/CI.

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

## Latest checkpoint — controlled main convergence (2026-09-12)
- Recovery HEAD before merge: `be6b3ee14134`; merged current main `cc1d4b0bcacc160d71f200784cc0f4874d5cfa8b` with semantic conflict resolution.
- Preserved main's Git/DB runtime authority and Admin publication infrastructure while retaining Product Recovery V6, Species Knowledge V2, reviewed environment/space/social facts, and base-species inheritance.
- Runtime Profile exact-ID authority wins for Admin-managed fields; Pair Rule and Stage Risk runtime removals remain effective. Static reviewed `waterType` fills the one field not yet present in the runtime Profile DTO.
- Canonical Admin/Git baseline now matches Product authority at 14 Profiles / 5 Pair Rules; guards require exact canonical keys and reviewed status.
- Added `supabase/migrations/202609120001_compatibility_recovery_baseline.sql` as an additive recovery-baseline migration; SQL parses successfully and has not been applied to Staging/Production in this recovery flow.
- Verified after convergence: TypeScript, API typecheck, full build, Domain/Compatibility/Species Knowledge/Visual/evidence coverage, runtime authority, Git runtime, Compatibility Admin/regression, Local File Admin + browser E2E, published-content isolation, staging seed safety, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004 all PASS.
- Pending only Git closeout: stage resolved merge, diff audit, merge commit/push, divergence verification, PR #149 current-head CI.

## Latest checkpoint — second main convergence / Vercel bundle alignment (2026-09-12)
- Remote main advanced after the first convergence; the recovery line now absorbs `5fa915d3` (`fix(api): bundle vercel business runtime`) and `162bbc1f` (Production release closeout) through a second controlled merge.
- `package.json` keeps Product Recovery browser/runtime tests and main's `build:business-api`; esbuild remains the Vercel Business API bundling dependency.
- A merged regression exposed that reviewed guppy adult→fry `conspecific_fry_predation` was being dropped by canonical result adaptation. The adapter now preserves this reviewed life-stage hard block narrowly; coarse legacy blocks remain subordinate to Domain V6.
- Validation PASS: TypeScript, API typecheck, Compatibility engine, Compatibility regression gate, runtime/Git authority, Published Content isolation, Admin Content and Business API contracts, full build (including 1.57 MB Business API bundle), Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.
- Merge is ready for Git closeout. After push, force-refresh real `origin/main`; PR #149 must report current-head alignment before merge/promotion.

## Latest main follow-up absorbed — Local File temp cleanup
- Main commits `0b662155` and `e871aee0` are included in the recovery line.
- Local Admin failed atomic writes clean temporary files; existing canonical Local File integrity and runtime publication gates remain unchanged.
