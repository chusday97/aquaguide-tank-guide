# Handoff Latest

## Agassizii + V7 pH-edge checkpoint — 2026-09-13
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Apistogramma agassizii` (`sp_0017`); ornamental Fire Red variants remain unreviewed and do not inherit automatically.
- Canonical coverage is now 20 taxa / 380 directions: 340 caution, 38 not_recommended, 2 compatible.
- Domain Rules version is now `compatibility-domain-v7-ph-edge-overlap`; single-point reviewed pH overlap becomes caution rather than a false green light.
- Runtime/Admin baseline is 23 Profiles / 5 Pair Rules; Git runtime snapshot matches canonical static authority.
- New additive migration: `202609120009_compatibility_agassizii_baseline.sql`; not applied to Staging/Production.
- Corrected the still-unapplied Pearl-gourami `120008` migration's internal behavior-trait drift assertion and added contract coverage preventing future insert/assertion mismatches.
- Validation PASS: TypeScript, Domain, Species Knowledge, Compatibility, canonical coverage, Admin/Git/DB runtime, Staging preflight, Local File Admin, full build, Species Detail, Compatibility Beginner Action and GP001–GP004.

## Pearl gourami reviewed-authority checkpoint — 2026-09-13
- Added direct reviewed Species Knowledge V2 + Compatibility authority for `Trichopodus leerii` (`sp_0444`); ornamental variants remain unreviewed and do not inherit automatically.
- Canonical coverage is now 19 taxa / 342 directions: 304 caution, 36 not_recommended, 2 compatible.
- Runtime/Admin baseline is 22 Profiles / 5 Pair Rules; Git runtime snapshot matches canonical static authority.
- New additive migration: `202609120008_compatibility_pearl_gourami_baseline.sql`; not applied to Staging/Production.
- Breeding defense is explicitly contextual: normal community state has no territorial-pressure warning, while spawning/egg-guarding state raises `breeding_territory_active`.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical coverage, Admin/Git/DB runtime, Staging preflight, Local File Admin, full build, Species Detail, Compatibility Beginner Action and GP001–GP004.

## Congo tetra reviewed-authority checkpoint — 2026-09-13
- Added direct reviewed Species Knowledge V2 + Compatibility authority for `Phenacogrammus interruptus` (`sp_0020`).
- Canonical coverage is now 18 taxa / 306 directions: 270 caution, 34 not_recommended, 2 compatible.
- Runtime/Admin baseline is 21 Profiles / 5 Pair Rules; Git runtime snapshot matches canonical static authority.
- New additive migration: `202609120007_compatibility_congo_tetra_baseline.sql`; not applied to Staging/Production.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical coverage, Admin/Git/DB runtime, Staging preflight, Local File Admin, full build, Species Detail, Compatibility Beginner Action and GP001–GP004.

## Main Local File root-ownership hardening absorbed — 2026-09-13
- Recovery now contains main single-root ownership lease and PID-reuse protection through `f6820e69`; concurrent Local Admin processes cannot share one Durable Local File root.
- Product Recovery remains the active authority in this worktree; the 20/5 Compatibility baseline and 17-taxon Product checkpoint are unchanged.

## Denison barb reviewed-authority checkpoint — 2026-09-13
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Sahyadria denisonii` (`sp_0440`); ornamental variants remain unreviewed and do not inherit automatically.
- Canonical coverage is now 17 taxa / 272 directions: 238 caution, 32 not_recommended, 2 compatible.
- Runtime/Admin baseline is 20 Profiles / 5 Pair Rules; Git runtime snapshot matches canonical static authority.
- New additive migration: `202609120006_compatibility_denison_barb_baseline.sql`; not applied to Staging/Production.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical coverage, Admin/Git/DB runtime, Staging preflight, Local File Admin, full build, Species Detail, Compatibility Beginner Action and GP001–GP004.

## Main restore-visibility / cross-operation consistency absorbed — 2026-09-13
- Absorbed latest main Local File reader/writer authority lock and restore visibility fixes through `b6361522`.
- Recovery-specific canonical Compatibility publication guard remains dynamic and exact; main’s historical 7/4 constants are not reintroduced.
- This is DEV-only Admin reliability work and does not change the 16-taxon Product Recovery decision authority.

## Ember tetra reviewed-authority checkpoint — 2026-09-13
- Added `Hyphessobrycon amandae` as the 16th canonical priority taxon. Catalog aliases `sp_0114` / `sp_0469` share one biological Species Knowledge authority but retain two identical exact-ID runtime Profiles.
- Canonical coverage: 16 taxa / 240 ordered directions = 208 caution, 30 not_recommended, 2 compatible.
- Runtime/Admin baseline: 19 Profiles / 5 Pair Rules; Git runtime snapshot matches.
- New additive migration: `202609120005_compatibility_ember_tetra_baseline.sql`; not applied to Staging/Production.
- Full build, Species Detail, Compatibility Beginner Action, GP001–GP004, Admin contract, Git/DB runtime, Staging preflight and Local File Admin all PASS.

## Main concurrency hardening absorbed — 2026-09-13
- Recovery now contains main runtime-export isolation, atomic backup-ID reservation, same-asset mutation serialization, and authority snapshot serialization (`275587ea`, `6cd1d5d8`, `25ea430b`, `01fdca74`).
- Product Recovery remains the authority for Species/Compatibility work in this worktree; canonical Admin main remains `/Users/chuchu/aquaguide-main`.

## Main follow-up absorbed — Local File asset-pair transaction closure (2026-09-13)
- Absorbed `f2087f26`, `9a6855da`, and `af03864d` from main. Local asset blob + metadata writes/deletes now roll back cleanly on the second-half failure path.
- Product Recovery remains the active authority in this worktree; canonical Admin main remains `/Users/chuchu/aquaguide-main`.


## Cherry barb reviewed-authority checkpoint — 2026-09-13
- Added standard `Puntius titteya` (`sp_0012`) as the 15th canonical priority taxon; no commercial/variant inheritance is needed or granted.
- Canonical coverage: 15 taxa / 210 ordered directions = 180 caution, 28 not_recommended, 2 compatible; no new green-light direction.
- Runtime/Admin baseline: 17 Profiles / 5 Pair Rules. New additive migration: `202609120004_compatibility_cherry_barb_baseline.sql`; not applied to Staging/Production.
- Full Product/Admin/runtime validation is green through build and GP001–GP004.

## Black Skirt Tetra reviewed-authority checkpoint — 2026-09-12
- Current Product Recovery line adds standard `Gymnocorymbus ternetzi` (`sp_0010`) with reviewed water/space/social/reproduction evidence; no ornamental variant inheritance.
- Runtime/Admin reviewed baseline is 16 Profiles / 5 Pair Rules and Git snapshot matches it.
- New additive migration `202609120003_compatibility_black_skirt_baseline.sql` is part of the repository migration chain but has not been applied to Staging/Production.
- Canonical priority matrix is 14 taxa / 182 directions: 154 caution, 26 not_recommended, 2 compatible.
- Full Product/Admin/runtime/build/browser validation is green through GP001–GP004.
- After push: force-refresh real `origin/main`, require main-only 0, then verify PR #149 current-head CI before selecting the next taxon.

## Main failed-backup cleanup checkpoint absorbed — 2026-09-12
- `0c8cd464 fix(admin): clean failed backup snapshots` is contained in Product Recovery.
- Failed backup creation now removes its newly allocated partial directory before rethrowing; regression verifies the backup directory set is unchanged after a forced mid-copy failure.
- This is DEV-only Local File reliability work and does not alter the 15/5 Compatibility authority, Product V6 decisions, or Production deployment state.

## Main canonical environment context absorbed — 2026-09-12
- Default Admin continuation is `/Users/chuchu/aquaguide-main` on `main`; Product Recovery remains an isolated worktree for PR #149 only.
- Canonical main owns its own lockfile-installed dependencies. Do not link its `node_modules` to historical `aquaguide-admin-content-v0` or recovery worktrees.
- `CROSS_SESSION_START.md` on main now verifies canonical path/branch and live remote HEAD before edits; preserve that fail-closed operator boundary.
- No runtime, Production, Supabase, indexing, or Local File data state changed by these docs-only main commits.

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

## Main convergence checkpoint — Local File startup recovery guidance
- Current main fail-closed startup UX is absorbed: operators now receive distinct recovery guidance for Local File owner conflicts, unreadable owner lease files, interrupted restore journals, newer unsupported authority formats, and unavailable local API service.
- Product Recovery remains the active authority; Compatibility V7 and the 23/5 runtime baseline are unchanged.
## P1 — Ramirezi reviewed-authority checkpoint
- Standard `Mikrogeophagus ramirezi` (`sp_0448`) now has direct reviewed environment/social/space/reproduction authority; commercial color/fin/balloon variants remain outside automatic inheritance.
- Reviewed values: 27–30°C, pH 4.0–7.0, 1–10 dGH, ~4.2 cm SL, 60 cm / ~54 L pair planning. Mature fish form pairs; substrate spawning uses biparental brood care.
- `breeding_defense` is contextual only: normal state does not create permanent territorial pressure, while spawning/guarding triggers `breeding_territory_active`.
- Canonical matrix: 21 taxa / 420 directions = 340 caution, 78 not_recommended, 2 compatible. Runtime/Admin baseline: 24 Profiles / 5 Pair Rules.
- Added unapplied additive migration `202609120010_compatibility_ramirezi_baseline.sql`.
- Product, runtime/Admin, build and GP001–GP004 gates all PASS.

## Main convergence checkpoint — Local File lease/restore/backup hardening
- Absorbed current main Local File reliability fixes: held root leases are revalidated before continued use, interrupted-restore recovery is integrity-checked before serving, and corrupt backup candidates are filtered from operator choices.
- These changes do not alter Product Recovery authority, Compatibility V7, the 24 Profile / 5 Pair runtime baseline, or the 21-taxon canonical matrix.
## P1 — Discus partial reviewed-authority checkpoint
- Standard `Symphysodon aequifasciatus` (`sp_0447`) now has direct reviewed environment/social/space Compatibility authority.
- Reviewed values: 26–30°C, pH 5.0–8.0, 0–12 dGH, ~14 cm SL, 120 cm / ~255 L planning, minimum group 5. Breeding-season territory is contextual via `breeding_defense`; normal social authority remains schooling.
- Sex remains explicit unknown and reproduction is intentionally absent.
- Canonical matrix: 22 taxa / 462 directions = 340 caution, 120 not_recommended, 2 compatible. Runtime/Admin baseline: 25 Profiles / 5 Pair Rules.
- Added unapplied additive migration `202609120011_compatibility_discus_baseline.sql`. Product, runtime/Admin, build and GP001–GP004 gates all PASS.

## Main follow-up absorbed — failed restore rollback integrity
- Current main rollback-integrity validation is included; failed restore rollback must re-pass Local File integrity before authority becomes available again.
- Product Recovery authority and the 25 Profile / 5 Pair runtime baseline are unchanged.
