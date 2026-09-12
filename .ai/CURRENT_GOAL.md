# Current Goal
## Main production context inherited — 2026-09-12
- Current remote `main` includes `5fa915d3 fix(api): bundle vercel business runtime` and release-closeout docs at `162bbc1f`. The Business API production path depends on `build:business-api` and the generated ESM bundle; Product Recovery must preserve that build boundary.
- Main release smoke recorded `/api/v1/business-health` 200, DEV-only `/api/v1/local-admin/status` 404, and no Supabase Production migration/index unlock. Product Recovery remains a separate Draft PR and does not treat that Production release as authorization to deploy the 14/5 Compatibility baseline.
- Second convergence target is only to absorb these two main commits, keep `origin/main` fully contained, and rerun build/runtime gates before updating PR #149.

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
Continue canonical high-frequency Species Knowledge V2 expansion using the reviewed environment authority path. Prefer a genuinely new taxon with reliable water/space/behavior evidence; do not widen catalog ranges when reviewed evidence is narrower, and keep unsupported fields unknown/absent.

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
