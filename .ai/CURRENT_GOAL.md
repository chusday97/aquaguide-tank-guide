# Current Goal
## Ember tetra reviewed-authority checkpoint — 2026-09-13
- Added one canonical biological taxon `Hyphessobrycon amandae` across two exact catalog aliases: `sp_0114` 红莲灯 and `sp_0469` 喷火灯.
- Both aliases share one Species Knowledge V2 object and identical reviewed Compatibility facts; canonical coverage counts them once, while runtime/Admin keeps two exact-ID Profiles for auditability.
- Canonical priority coverage: 16 taxa / 240 ordered directions = 208 caution, 30 not_recommended, 2 compatible; no new unconditional green-light direction.
- Runtime/Admin reviewed baseline: 19 Profiles / 5 Pair Rules. Additive migration `202609120005_compatibility_ember_tetra_baseline.sql` is repository authority only and is not applied to Staging/Production.
- Full Product/Admin/runtime/build/browser validation is green through GP001–GP004.

## Main follow-up absorbed — Local File asset-pair rollback (2026-09-13)
- Latest main commits `f2087f26` / `9a6855da` close Local File asset blob+metadata transaction gaps: failed metadata writes restore/remove the blob; failed metadata deletes restore the prior blob.
- Main docs checkpoint `af03864d` records this DEV-only reliability closure.
- This does not change Product Recovery Compatibility/Species authority or apply any database migration.

## Main Local File backup cleanup absorbed — 2026-09-12
- Main checkpoint `0c8cd464` removes partial `backup-*` directories when Local File backup copy/manifest creation fails.
- Product Recovery has absorbed the functional fix and its regression; this remains DEV-only Local File maintenance and does not change Product Compatibility authority or Production runtime.
- Main validation for this fix recorded Local File/API/TypeScript/build/CI/Vercel green; Product Recovery already revalidated Local File Admin, API TypeScript, Git runtime and full build after merge.

## Main canonical environment context — 2026-09-12
- Canonical Admin continuation remains `/Users/chuchu/aquaguide-main` on `main`; Product Recovery uses its isolated recovery worktree and must not replace the default Admin entry path.
- Main is self-contained after removing the historical `node_modules` symlink and running its own lockfile-driven `npm ci`; do not recreate dependency symlinks from canonical main into historical/recovery worktrees.
- Main cross-session recovery now fail-closes on wrong path/branch and requires live HEAD vs GitHub main comparison before edits.
- No Local File authority migration, Production deployment, Supabase change, or indexing change is implied by this documentation convergence.

## Main / recovery alignment — 2026-09-12
- `product-recovery-20260911` fully contains current `origin/main`; PR #149 is mergeable/clean and remains Draft.
- Root Vercel build authority is explicit (`npm run build` → `dist`); both aquaguide and admin-content preview deployments are green on the aligned recovery line.
- No Supabase Staging/Production migration is authorized by Product Recovery. New Compatibility migrations remain repository authority only until an explicit environment promotion task.

Updated: 2026-09-12
Active branch: `product-recovery-20260911`

## Goal
Continue Aqua Product Recovery P1 Species Knowledge V2 coverage expansion without fabricating missing biology. Close reviewed-authority gaps that materially improve Compatibility and Species Detail, using base-species inheritance only when the evidence supports shared biology.

## Current acceptance target
- Add reviewed facts field-by-field; unavailable sex/reproduction/space data stays unknown or absent.
- Exact reviewed species facts win, then evidence-backed base-species inheritance, then legacy fallback.
- Species Knowledge V2 and Compatibility must share the same biological authority instead of diverging.
- Canonical biological-taxon coverage is the progress metric; duplicate catalog IDs/ornamental morphs never inflate progress.
- Hard biological conflicts and reviewed pair overrides remain stronger than generic trait inference.
- Frozen global UI/IA stays unchanged; this phase improves decision quality and evidence disclosure, not visual redesign.

## Validation gate
Domain compatibility, legacy facade, evidence coverage, visual actions, TypeScript, build, Compatibility beginner-action browser E2E, and GP001-GP004 must pass before checkpoint push.

## Next
Continue distinct canonical taxon expansion only after the Ember-tetra checkpoint is pushed and current remote main / PR #149 are revalidated. Prefer evidence-complete standard species; duplicate catalog aliases must share biological facts without inflating canonical coverage. Keep runtime/Admin/Git authority in lockstep and use additive migrations only.

## Base-species inheritance checkpoint
- Runtime reviewed authority now resolves exact species ID first, then an explicit base-species key derived from scientific name.
- Variant inheritance is allowed only for shared base-species biology; direct-ID audit counts remain unchanged so inherited authority is never presented as a separately reviewed variant.
- `Betta splendens var.*` can inherit the reviewed `Betta splendens` baseline; variant-specific exceptions remain eligible for exact-ID overrides.
- `Pterophyllum scalare` is reviewed directly and now contributes structured fin-nip vulnerability instead of name-regex inference.
- Acceptance remains: inherited authority may improve runtime decisions, but must not inflate direct review coverage or override explicit pair/hard-risk evidence.

## Capacity heuristic cleanup checkpoint
- Aggressive/Territorial temperament must never multiply waste/bioload screening. Behavior risk and carrying-capacity screening are separate dimensions.
- Raw livestock count must not create a generic density warning; capacity remains based on reviewed species facts plus coarse body-size screening until filtration/flow/water-quality facts are added.
- No replacement hard limit is introduced here. This checkpoint removes false precision rather than inventing a new universal stocking formula.

## Bottom-zone ecology checkpoint
- Compatibility now carries reviewed swimming-zone context without turning shared zones into automatic incompatibility.
- `shared_bottom_zone_context` is informational only: it explains shared substrate/feeding pressure while preserving the underlying verdict.
- First bottom-dweller cohort: `sp_0014` Corydoras aeneus and `sp_0443` Corydoras panda with reviewed group size, adult size, tank footprint guidance and bottom-zone authority.

## Species Detail reviewed-knowledge presentation checkpoint
- Species Detail now renders reviewed adult size / planning volume / tank length / swimming zone / activity as a dedicated secondary evidence disclosure.
- Social presentation now renders reviewed recommended group range and human-readable swimming-zone labels instead of raw enum values.
- Reviewed knowledge stays optional: unreviewed species do not receive fabricated space/social sections.
- The unavailable compatibility disclosure keeps one calculator CTA only; duplicate route actions are prohibited.

## Species Detail presentation checkpoint
- Reviewed space authority is now rendered as a dedicated `成体与空间 / Adult size & space` disclosure with adult size, planning volume, tank length, swimming zone, activity level, notes, and reviewed sources.
- Social knowledge now renders recommended group range in addition to minimum group size, and internal swimming-zone enums are localized for users.
- The detail surface keeps these as progressive evidence rather than moving them into the primary action area.
- The unavailable compatibility disclosure no longer duplicates the calculator CTA; exactly one route remains.
- Browser contract updated so a single neon tetra is caution under the reviewed minimum-group rule rather than incorrectly treated as directly addable.

### Current checkpoint — housing authority convergence
- Shared reviewed housing authority now drives Species Detail, Compatibility, Encyclopedia, and Aquarium.
- Exact reviewed species facts win, then base-species inheritance, then legacy fallback.
- Next focus: increase reviewed common-species coverage; do not reopen broad UI redesign.

### Current checkpoint — V5 prey vulnerability
- `predationRisk` means active predation; `predationVulnerability` means prey-side susceptibility. These facts must never be substituted for each other.
- Common reviewed shrimp authority now uses base-species inheritance where appropriate; nerite snails do not receive a fabricated minimum group size or prey-vulnerability level.
- Fish + highly vulnerable shrimp is caution unless stronger reviewed predator evidence already hard-blocks the pair.
- Current priority catalogue-direction coverage is 110/132 recordable, overwhelmingly caution. Do not present this as overall species coverage or a safety rate.
- Next: canonicalize the coverage metric by biological taxon so duplicate catalogue IDs/variants do not inflate progress, then continue reviewed common-species expansion.

### Current checkpoint — canonical coverage accounting
- Coverage progress is measured by canonical biological taxon, not raw catalog ID.
- Priority baseline is now 8 taxa / 56 ordered directions: 42 caution, 14 not_recommended, 0 unconditional compatible.
- Raw 12-record / 132-direction output remains an integrity audit only. Duplicate IDs/morphs must produce the same canonical verdict.
- Next reviewed-data work should raise canonical taxon coverage or decision quality, not merely add duplicate catalogue records.

### Current checkpoint — Amatitlania partial Species Knowledge V2
- Closed the Compatibility-only gap for `Amatitlania nigrofasciata` using the existing peer-reviewed territory/aggression source.
- Added only reviewed social/territorial behavior; sex identification explicitly remains unknown, while reproduction and space blocks remain absent.
- `Amatitlania nigrofasciata var.*` ornamental forms inherit the reviewed base-species behavior authority; direct-ID review counts remain unchanged.
- Canonical priority coverage expands from 8 taxa / 56 ordered directions to 9 taxa / 72 ordered directions: 56 caution and 16 not_recommended, with 0 unconditional compatible in the audit setup.
- Next authority gap: `Channa asiatica`; preserve the same partial-review discipline.

### Current checkpoint — Channa partial Species Knowledge V2
- Added evidence-backed base-species Knowledge V2 for `Channa asiatica` using the existing U.S. Fish and Wildlife Service assessment.
- Migrated only reviewed predator / solitary authority into Knowledge V2; sex remains explicit unknown and reproduction / space remain absent.
- `Channa asiatica var.*` now inherits the same reviewed biological authority, including the existing hard small-fish predation boundary.
- Added a regression audit requiring every Compatibility-reviewed catalog fish to resolve to Species Knowledge V2 authority; current gap count is zero.
- Next work must select a genuinely new canonical high-frequency taxon rather than duplicate a variant.

### Current checkpoint — reviewed environment authority + Xiphophorus maculatus
- Species Knowledge V2 now has an optional reviewed `environment` block for water type, temperature, pH and hardness evidence.
- Compatibility prefers reviewed temperature / pH / water authority over broader legacy catalog strings when the reviewed block exists.
- Added reviewed `Xiphophorus maculatus` (月光鱼) authority from Seriously Fish + FishBase: 20–26°C, pH 7.0–8.2, 10–30 dGH, 60 cm planning length, up to 6 cm TL, internal livebearing with 24–30 day gestation.
- Added soft `territorial_pressure_context`: a territorial species paired with a reviewed low/non-territorial species is caution rather than an automatic green light. Hard predation / single-housing rules still outrank it.
- Canonical priority matrix is now 10 taxa / 90 ordered directions: 70 caution, 18 not_recommended, 2 compatible. The remaining compatible pair is Xiphophorus maculatus ↔ Neritina natalensis in the audit setup.

### Current checkpoint — Molly reviewed authority + visible environment evidence
- Added direct reviewed Species Knowledge/Compatibility authority for standard `Poecilia sphenops` (`sp_0437`) only. Commercial molly variants are not base-inherited because ornamental stocks may include `P. latipinna` hybrid ancestry.
- Species Detail now renders reviewed temperature / pH / hardness as secondary evidence with reviewed source links.
- Reviewed environment and space authority drive Compatibility ahead of broader legacy catalog values.
- Conflicting gestation durations across sources remain unresolved; no fabricated single gestation range is exposed.
- Canonical priority matrix: 11 taxa / 110 ordered directions; 88 caution, 20 not_recommended, 2 compatible. The only compatible canonical directions remain platy ↔ nerite snail.
- Next: add another distinct high-frequency canonical taxon only when reviewed environment/space/social facts are supportable; do not mass-inherit commercial hybrids.

### Current checkpoint — V6 tank-requirements symmetry + swordtail
- Compatibility authority advances to `compatibility-domain-v6-tank-requirements-symmetry`.
- Reviewed tank volume/length cautions now apply symmetrically to existing livestock and the planned candidate; swapping pair direction must not hide an already-unmet space requirement.
- Added direct reviewed authority for standard `Xiphophorus hellerii` (`sp_0438`): 16–28°C, pH 7.0–8.0, 10–25 dGH, ~14 cm SL, 120 cm tank length / ~108 L planning volume, adult sexing, livebearing and male dominance context.
- Commercial swordtail variants are not base-inherited because ornamental stocks commonly include hybrid ancestry with other `Xiphophorus`.
- Canonical priority matrix: 12 taxa / 132 ordered directions; 108 caution, 22 not_recommended, 2 compatible.
- Next: continue distinct canonical-taxon coverage; do not turn same-sex dominance into generic interspecific territorial aggression.

## Current checkpoint — main convergence / runtime authority alignment (2026-09-12)
- Merged current `origin/main` into `product-recovery-20260911` under a controlled no-commit convergence; main runtime/Admin infrastructure is retained alongside Product Recovery V6.
- Runtime Compatibility Profile authority is exact-ID first; evidence-backed base-species inheritance remains available for reviewed biological variants. Pair Rule and Stage Risk runtime authority are authoritative once hydrated and are not silently restored from static fallback.
- `waterType` remains field-level static reviewed authority until it enters the runtime Profile DTO: Species Knowledge reviewed environment → static reviewed Compatibility waterType → legacy catalog. This prevents runtime hydration from erasing reviewed freshwater/saltwater identity.
- Admin/Git runtime Compatibility baseline is aligned to the current canonical reviewed baseline: 14 direct Profiles / 5 Pair Rules. Publication guards validate exact canonical profile/pair keys and reviewed state, not count alone.
- Added additive migration `202609120001_compatibility_recovery_baseline.sql` for the 7 recovery Profiles + tiger-barb/guppy Pair Rule and their evidence. Historical migrations remain immutable; partial published baseline fails closed.
- Convergence validation passed across Product Domain/Compatibility/Knowledge/Visual, runtime authority, regression gate, Local File Admin, Git runtime, published-content isolation, staging seed contract, API typecheck, full build, Species Detail E2E, Compatibility Beginner Action E2E, and GP001–GP004.
- Next: create and push the merge commit, verify `origin/main...product-recovery-20260911` has main-only 0, then inspect PR #149 current-head CI before any main promotion.

## Current checkpoint — second main convergence / Production bundle alignment (2026-09-12)
- Absorbed remote main through `162bbc1f`, including the Vercel Business API esbuild bundle boundary and Production release-closeout context, while Product Recovery remains the active development authority on `product-recovery-20260911`.
- Root `npm run build` now includes `build:business-api`; the generated Business API bundle is ~1.57 MB and builds successfully before Web/Admin/static artifacts.
- Fixed a canonicalization gap found by the merged Admin regression gate: reviewed `conspecific_fry_predation` Stage Risk must survive Domain canonicalization as `not_recommended` until life-stage risk becomes a native Domain rule. No other legacy hard block regains decision authority.
- Verified after this fix: root/API TypeScript, Compatibility + regression gate, runtime/Git authority, Published Content isolation, Admin Content/Business API contracts, full build, Species Detail E2E, Compatibility Beginner Action E2E, and GP001–GP004.
- Next: complete the merge commit/push, force-refresh `origin/main`, require main-only 0, then re-check PR #149 mergeability and current-head CI before any main promotion.

## Main follow-up absorbed — local file atomic temp cleanup (2026-09-12)
- Latest main cleanup `0b662155` / `e871aee0` is absorbed into Product Recovery.
- Failed atomic Local File writes now clean temporary files instead of leaving stale temp artifacts.
- This does not change Product Recovery authority, Compatibility V6, or reviewed baseline semantics.

## Current checkpoint — Harlequin rasbora reviewed authority (2026-09-12)
- Added direct reviewed Species Knowledge V2 + Compatibility authority for `Trigonostigma heteromorpha` (`sp_0468`, 金三角灯) using Seriously Fish and FishBase.
- Reviewed facts: freshwater; 21–28°C; pH 5.0–7.5; 1–12 dGH; ~4.5 cm SL; 60 cm / ~54 L planning space; peaceful schooling; minimum group 8, recommended 8–10; adult sexing cues; external leaf-underside egg attachment with no parental care.
- Canonical priority matrix expands to 13 taxa / 156 ordered directions: 130 caution, 24 not_recommended, 2 compatible. No new unconditional green light was introduced; the remaining compatible directions are still platy ↔ nerite snail.
- Admin/Git runtime baseline advances to 15 direct Profiles / 5 Pair Rules. `public/runtime-authority.json` is regenerated from the canonical local store.
- Added additive migration `202609120002_compatibility_harlequin_baseline.sql`; prior migrations remain immutable and no database environment was mutated.
- Coverage scorecard now accepts reviewed base-species inheritance instead of falsely requiring duplicate direct-ID profiles.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, coverage scorecard, canonical evidence coverage, Compatibility Admin contract, Git/runtime authority, Staging preflight, Local File Admin, SQL parse, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.

## Current checkpoint — Black Skirt Tetra reviewed authority (2026-09-12)
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Gymnocorymbus ternetzi` (`sp_0010`) from Seriously Fish + FishBase.
- Reviewed authority replaces stale legacy `Territorial` semantics with schooling behavior, no territoriality, medium fin-nipping risk, and a reviewed minimum group of 12.
- Reviewed environment/space authority: 20–26°C, pH 6.0–7.0, 5–20 dGH, 75 cm planning length / ~68 L, conservative adult-size upper bound 7.5 cm SL across reviewed sources.
- Ornamental long-fin/balloon/albino/color variants do not inherit the standard profile automatically; variant morphology may materially change fin vulnerability/body form.
- Canonical priority matrix: 14 taxa / 182 ordered directions = 154 caution, 26 not_recommended, 2 compatible. No new unconditional compatible direction was introduced.
- Admin/Git runtime baseline is now 16 direct Profiles / 5 Pair Rules. New additive migration: `202609120003_compatibility_black_skirt_baseline.sql`; do not apply it to Staging/Production in this recovery checkpoint.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, evidence coverage, Compatibility Admin contract, Git/runtime authority, Staging preflight, Local File Admin, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.
- Next: continue only with another distinct canonical taxon whose environment/space/social evidence is strong enough; do not widen inheritance merely to raise counts.

## Current checkpoint — Cherry barb reviewed authority (2026-09-13)
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Puntius titteya` / Cherry barb (`sp_0012`) using Seriously Fish + FishBase.
- Reviewed planning authority: 20–27°C, pH 6.0–8.0, 2–20 dGH, ~5 cm SL, 60 cm / ~54 L, school minimum 6 with 6–10 preferred.
- Four fish correctly retains `minimum_group_not_met`; six removes the group-size warning. No variant inheritance was introduced.
- Canonical priority matrix is now 15 taxa / 210 ordered directions: 180 caution, 28 not_recommended, 2 compatible. No new unconditional compatible direction was introduced.
- Git/Admin reviewed Compatibility baseline is 17 Profiles / 5 Pair Rules. Additive migration `202609120004_compatibility_cherry_barb_baseline.sql` is repo authority only and has not been applied to Staging/Production.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical evidence coverage, Admin/runtime/Git authority, Staging preflight, Local File Admin, full build, Species Detail E2E, Compatibility Beginner Action E2E, GP001–GP004.
- Next: commit/push and verify current-head PR #149; then continue only with another distinct canonical taxon backed by reviewed evidence.
