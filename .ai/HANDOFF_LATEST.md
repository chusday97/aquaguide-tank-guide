## HANDOFF — 2026-09-26 Recovery / relapse priority

- Functional checkpoint `b81cef2efa3d9d0afb720daf879811fc2d988374`.
- Recovery path is now explicitly covered: intervene → recovery-watch; reviewed high-risk compatibility remains remembered after repeated normal checks.
- Fixed relapse bug where a new chase after recovery was swallowed by historical AQ-STATE-011 context. Current relapse now wins and is exposed as an active signal.
- Targeted recovery tests PASS; full backend release gate PASS. No UI/Vision/DB/Production/main changes.

## HANDOFF — 2026-09-26 Runtime tank-state acceptance

- Functional checkpoint `0af0e000c2551feeaff89492b783fecd6dfc514f`.
- Added 9 static-risk + real-observation runtime cases and placed them in the backend release gate.
- Reviewed red predation/aggression/territory combinations no longer become `stable / no_action` after one normal patrol; they remain `watch / observe`.
- Generic high space guidance is intentionally not treated the same way and may remain stable when current evidence is normal.
- Temperature no-overlap/current target-temperature blockers are now active `intervene` hard constraints; water-type conflicts remain `urgent`.
- Current-state presentation now gives concrete signal-specific actions for respiratory distress, injury, and corroborated chasing/hiding pressure.
- Full backend release gate PASS. No catalog counts or DB artifacts changed; no UI/Vision/Production/main changes.

## HANDOFF — 2026-09-26 Complex multi-species compatibility acceptance

- Functional checkpoint `a64b366dbccf5ef1f63cddbd8835d7cddb48bdc1`.
- Compatibility real-tank regression now has 11 scenarios, including five 6–8 species tanks.
- Fixed complex red-verdict ordering so direct predation and no-common-temperature blockers outrank lower-priority social/territorial context.
- Fixed multi-group presentation truncation: all under-grouped species survive as one concise current→minimum action.
- Fixed Pair Rule evidence wording so direct husbandry fin-nipping evidence is not described as a predation experiment.
- Added Compatibility Evidence Coverage to the backend release gate; full gate PASS.
- No catalog/evidence/pair counts changed in this step; no new DB artifact was added or applied. UI/Vision/Production/main remain untouched.

## HANDOFF — 2026-09-26 Real-tank compatibility acceptance

- Validated functional checkpoint: `0acf8e9316cd1872b437305c5493230ca213573d`.
- Real-tank acceptance is now a release gate with six 3–4 species fixtures covering green community, temperature hard block, exact predation pair, multiple group deficits, space pressure, and whole-tank load.
- Fixed a real false positive: prey-vulnerability alone no longer makes peaceful community combinations yellow; reviewed predation pressure is required.
- Adjustments are more executable: under-grouped species receive exact current→minimum quantities; red hard blocks no longer mix in lower-priority warning actions.
- Added reviewed Angelfish × Neon Tetra predation Pair Rule while keeping generic `very_small_fish` mapping fail-closed.
- Authority counts: 49 reviewed Profiles / 22 reviewed Pair Rules / 79 evidence sources / 486 catalog objects; snapshot checksum `ebde097a8d086d947ad2b2de511ad36cad9988a1a5b396b9687e497beb4faaf0`.
- Full backend release gate PASS. `202609260002_compatibility_angelfish_neon_pair.sql` is repository-only HOLD and has not been applied. No UI/Vision/Production/main changes.

## HANDOFF — 2026-09-26 Actionable compatibility result contract

- Validated functional checkpoint: `f28999d9901653833acba69cf4b5c142400c8d60`.
- Compatibility output is now structurally `判断 / 原因 / 调整方式`: `verdict`, `reasons`, `adjustments`, with semantic indicator green/yellow/red/gray.
- Risk-specific adjustment mapping is backend-owned; whole-tank primary reasons outrank pairwise secondary reasons; duplicate same-dimension reasons are suppressed.
- Full backend release gate PASS. UI/Vision/DB application/Production/main remain untouched.

## HANDOFF — 2026-09-26 Priority compatibility knowledge batch 3

- Validated functional checkpoint: `b597790b7f672e32246c1af92a3c85c0de4f6cf0`.
- Five exact species promoted: Gnathonemus petersii, Piaractus brachypomus, Serrasalmus rhombeus, Gymnotus carapo, Leporinus fasciatus.
- Coverage: runtime reviewed objects `80 → 85`; direct reviewed Profiles `44 → 49`; evidence sources `73 → 78`; catalog stays 486.
- Full backend release gate PASS; Compatibility Admin contract PASS at 49 Profiles / 21 Pair Rules; staging preflight PASS.
- `202609260001_compatibility_priority_batch3_profiles.sql` is repository-only HOLD ownership and has not been applied.

## HANDOFF — 2026-09-25 Priority compatibility knowledge batch 2

- Validated functional checkpoint: `f90a57fdf8afc93e5e4c4a89f97ffcc12c81de36`.
- Five exact objects promoted: Macropodus ocellatus, Macropodus spechti, Moenkhausia sanctaefilomenae, Pantodon buchholzi, Hypancistrus inspector.
- Coverage: runtime reviewed objects `75 → 80`; direct reviewed Profiles `39 → 44`; evidence sources `68 → 73`; catalog stays 486.
- Full backend release gate PASS. Compatibility Admin contract PASS at 44 Profiles / 21 Pair Rules; staging preflight PASS.
- Repository-only batch2 Profile owner `202609250002_compatibility_priority_batch2_profiles.sql` is HOLD and has not been applied. No DB authority switch, UI/Vision change, Production promote, or main merge occurred.

## HANDOFF — 2026-09-25 Priority compatibility knowledge batch 1

- Validated functional checkpoint: `410434765bc9c64e5e513f4748b321094c2768d3`.
- Five exact high-priority freshwater species were promoted from completion-only records to runtime Species Knowledge + Compatibility authority after object-specific source review: 接吻鱼、天堂鱼、Badis badis、Dario dario、Pterophyllum altum.
- Coverage counters: direct reviewed profile records 34 → 39; runtime catalog objects resolving to reviewed Compatibility/Species Knowledge 70 → 75; evidence sources 63 → 68; catalog objects remain 486.
- Safety boundary remains intact: generic Phase-2 completion records stay matrix/detail evidence only, and unreviewed variants do not inherit base-species authority.
- New regression validates Altum small-fish predation, Paradise Fish cool-water ceiling, Kissing Gourami space pressure, exact runtime promotion, and fail-closed variant behavior.
- Full backend release gate PASS; snapshot checksum `22e5de3d94a7985e325602ead8af5b2ff04943d4943981c33175c7c063a55ee8`.
- No UI/Vision changes, DB migration application, DB-authority switch, Production promote, or main merge.
- Repository-only `202609250001_compatibility_priority_batch1_profiles.sql` was added solely as explicit reviewed-Profile ownership; application remains HOLD.
- Continue knowledge expansion in small source-audited batches only.

## HANDOFF — 2026-09-25 Whole-tank compatibility aggregation validated

- Current integration candidate: `/Users/chuchu/aquaguide-backend-integration-20260922`, branch `integration/backend-main-20260922`, validated functional head `9be6e49c8e0d64dda57f57c22c4ae0eb8e891b89`, built on `2b191896...`.
- Local and remote integration are synchronized (`0/0`). PR #154 is OPEN / non-draft / MERGEABLE and contains functional head `9be6e49c...`; foundation/validate/Vercel/Cloudflare were green at the previous checkpoint and are re-triggered by new pushes, with heavy optional gates intentionally skipped.
- Multi-species compatibility now combines pairwise explanations with a whole-tank canonical domain pass for 3+ species. This captures cumulative constraints that pairwise-only aggregation can miss without creating a second rules engine.
- Regression proves whole-tank-only `bioload_screening_elevated` is propagated to the overall verdict while 1–2 species stay on the existing pairwise path. The direct summary now leads with a tank-level-only risk when that risk changes the 3+ species verdict, and soft-capacity disclaimers are idempotent.
- Full backend release gate PASS at this head. Frozen UI/Vision behavior remains untouched; DB migration application/authority switch/Production remain HOLD.
- Next execution target: representative product-level badcases and direct user conclusion quality, not additional repository restructuring. Main merge requires a separate explicit decision.

## HANDOFF — 2026-09-22 Local backend integration candidate validated

- GitHub CI exposed two reviewed Profile DB-authority ownership gaps (sp_0016, sp_0475); repository-only migration 202609220001_compatibility_gold_ram_rhodeus_profiles.sql now owns them. No DB migration has been applied.
- CI-required repository-only compatibility migration SQL is present as a static contract artifact; **no migration has been applied and DB authority remains HOLD**.
A selective backend candidate has been assembled in `/Users/chuchu/aquaguide-backend-integration-20260922` on branch `integration/backend-main-20260922`.

- Base: `origin/main@be0fdef9`
- Implementation tip: `018c52ba` (after `afc8ad2e` integration + `cb15eb6b` ownership fix)
- Validation: full backend integration gate PASS; Golden Path contract PASS; Business Admin staging preflight PASS; Compatibility Admin contract PASS (34 reviewed profiles / 21 reviewed pair rules); `git diff --check` PASS; GitHub PR checks all green at `018c52ba`.
- Candidate construction preserved main-only CI/Vercel/build work and excluded user-frozen Vision/UI behavior. Repository-only Compatibility SQL artifacts are included because CI/authority contracts require them; migration application remains HOLD.
- Integration debugging found presentation-layer leakage in the original backend manifest. The candidate therefore keeps current-main compatibility presentation service/test unchanged. User-conclusion tests retain backend status/risk/action safety only.
- No Production deployment, DB migration, DB authority switch, Care indexing change, or main merge has occurred.
- Draft PR #154 is open and green: https://github.com/chusday97/aquaguide-tank-guide/pull/154 . Next decision is review/merge only; keep Draft and do not merge, deploy, or apply migrations without separate authorization.

## HANDOFF — 2026-09-16 RC1 Production release CLOSED
Production is now `93549ddf1cad0855a7c479e4a696cdde7e66f06c` via `dpl_4uP6Jv7zei6wCpeKkCPfiBb7buNd` (READY / production). Final Production smoke is PASS.

Verified after promotion: `/api/v1/health` 200/ok; GP-001 first tank setup; GP-002 宝莲灯 search -> Compatibility -> quantity x8 -> stocking persistence; GP-003 Daily Check persistence and Today Action advance; GP-004 abnormal-care Quick Check with actionable result. No rollback required.

The browser smoke executed Production artifacts through a temporary read-only localhost proxy because Playwright engines on the authorized Mac could not directly negotiate the Vercel-protected TLS connection; curl could. The proxy allowed only GET/HEAD/OPTIONS to Production and rejected writes.

Release holds are unchanged: do not apply the 15 Compatibility migrations, do not switch DB authority, do not change Care indexing/noindex policy, and do not expose Local Admin. RC1 is closed; future work is a new scoped iteration.

## HANDOFF — 2026-09-14 Production promote attempted but externally blocked
User authorization for the code-only Production promote was received. `vercel promote dpl_8yd3w1kzbDhusqvckoRBJgyAEPUE` failed before promotion with HTTP 402 `api-deployments-free-per-day`. No Production state changed.

Candidate remains `93549ddf` / `dpl_8yd3w1kzbDhusqvckoRBJgyAEPUE` READY. Stable Production remains `5fa915d3` / `dpl_2n2CfsVatP4rzzE49Ttd9H752fR8` READY. Do not work around the quota with a Preview alias. Retry the same code-only promotion only when Vercel permits deployments; migrations/DB authority/Care indexing remain HOLD.

## HANDOFF — 2026-09-14 Release Rehearsal complete
Current release candidate is main `93549ddf1cad0855a7c479e4a696cdde7e66f06c`. RC1 Operator Acceptance and Production Release Rehearsal are both PASS.

Release decision is **GO WITH HOLDS**: a code-only Production promote is technically cleared, but requires explicit authorization. Keep all 15 Compatibility migrations repository-only, keep DB authority unchanged, keep Care SEO noindex/indexing policy unchanged, and do not expose Local Admin in Production.

Evidence: Product Golden Path `34832136047` PASS; Vercel Preview `dpl_8yd3w1kzbDhusqvckoRBJgyAEPUE` READY; Production remains stable deployment `dpl_2n2CfsVatP4rzzE49Ttd9H752fR8` at `5fa915d3`.

If promotion is authorized: promote code candidate only, then immediately smoke GP-001–GP-004/API/runtime and verify Production SHA; rollback to the prior stable deployment on any regression.

## 2026-09-14 — RC1 Operator Acceptance PASS
- Main acceptance checkpoint `66030ece test(rc): align operator acceptance gates` contains only test-gate updates; no product behavior changed.
- Product/Care save-vs-publish boundaries, Compatibility Profile/Pair operator lifecycle, Durable Local File restart/backup/restore/recovery, Operations Studio desktop/mobile, three-step flows, and GP-001..GP-004 all PASS.
- Current reviewed Compatibility authority observed by acceptance: 29 Profiles / 5 Pair Rules. The gate now validates Local baseline alignment dynamically and targets tiger barb explicitly instead of depending on list order.
- Care acceptance now follows the real default Interactive Check -> Traditional Browse path before searching.
- GitHub Product Golden Path `34826290607` PASS; Production remains unchanged on `5fa915d3`.
- Next phase is release decision/rehearsal, not further speculative Admin reliability expansion.

## 2026-09-14 — Runtime asset publication TOCTOU closure
- Functional main `78aaef71 fix(admin): revalidate runtime asset publication`.
- Reproduced external post-preflight disk corruption causing `/runtime-snapshot` to return 201 while committing an undecodable published asset.
- Runtime publication now validates the exact copied metadata/body pair again for MIME, byteSize and full decode before staging can commit.
- Failed post-preflight validation returns `409 MIGRATION_REJECTED`, leaves the prior runtime manifest unchanged, and removes staging residue.
- Product Golden Path `34821812724` PASS; Preview `dpl_9W7EHy8Lhn6pTfw97x9C4fX9vBby` READY; Production unchanged.

## 2026-09-14 — Decodable Local asset integrity closed

## 2026-09-14 — Restore safety backup lifecycle closure
- Main `57577c74` makes `pre-restore-safety` backups transaction-scoped instead of permanently hidden disk snapshots.
- Successful restore / successful rollback / successful crash recovery remove the consumed safety backup only after journal cleanup.
- Failed rollback/recovery still retains safety backup + journal.
- Repeated restore regression proves hidden safety directories no longer grow linearly.
- Product Golden Path `34819368401` PASS; Preview `dpl_2U3yL9oq4FpPp7CyABU2Wi74DZrB` READY; Production unchanged.

## 2026-09-14 — corrupt asset reads now fail closed
- Functional main: `422dbede fix(admin): fail closed on corrupt asset reads`.
- A corrupt on-disk asset can no longer bypass integrity by being fetched directly: GET validates MIME, metadata size and full image decode before sending bytes.
- Known-corrupt reads return `409 INTEGRITY_FAILED`; targeted re-PUT repair remains supported.
- Full Local File/UI/Operations/type/build gates PASS; GitHub Product Golden Path `34814195437` PASS; Preview `dpl_43FE572hz3QRDXyQCUevp33kWVzx` READY.

- Functional `935bb529 fix(admin): require decodable local assets` is contained in current main merge `b01f2d28`.
- Signature-correct but non-decodable PNG/JPEG/WebP content is no longer accepted: PUT requires successful `sharp` decode + format match, and root integrity applies the same rule to persisted blobs.
- `ASSET_CONTENT_INVALID` remains targeted-repairable by re-PUT of the same asset. Local File/API/UI/Operations/type/build gates PASS.
- Direct functional CI was cancelled only because the immediate main merge superseded it; merged-head Product Golden Path `34812307958` PASS. Functional and merged-head Vercel Previews are READY. Production remains on `5fa915d3`; no DB migration/promotion.

## 2026-09-14 — Synced main Local asset signature authority
- Main docs checkpoint `58fd8d8b` records functional `38eed2a7`: Local asset PUT now validates PNG/JPEG/WebP signatures and active-root integrity detects persisted signature corruption as `ASSET_CONTENT_INVALID`.
- Targeted re-PUT repair is preserved; fake uploads leave no files behind.
- Main validation: Local File/UI/Operations/type/build PASS; Product Golden Path `34810288146` PASS; Preview READY; Production unchanged.
- Recovery already contains the functional code and passed its merged-head Admin + Product dual gates.
## 2026-09-14 — Latest main Admin safety line merged into Product Recovery
- Main moved ahead during Product Release Gate; recovery explicitly fetched and merged the 7 new main-only commits through `38eed2a7 fix(admin): validate local asset signatures`.
- Imported functional Admin checkpoints include invalid state-write rollback, referenced asset delete protection, hidden internal restore safety backups, and PNG/JPEG/WebP signature validation for Local assets.
- Local Admin route + regression test merged automatically; Product UI / Compatibility closure code did not conflict.
- Product Recovery authority remains the release owner for this branch; merged-head Product + Admin dual validation is green, and latest-head remote CI is the remaining merge prerequisite.
- Production unchanged; no Compatibility migration has been applied.
# Handoff Latest

## Clown loach reviewed-authority checkpoint — 2026-09-13
- Added direct reviewed Species Knowledge V2 + Compatibility authority for standard `Chromobotia macracanthus` (`sp_0126`).
- Canonical coverage is now 25 taxa / 600 directions: 460 caution, 138 not_recommended, 2 compatible.
- Runtime/Admin baseline is 28 Profiles / 5 Pair Rules; Git runtime snapshot matches canonical static authority.
- New additive migration: `202609120014_compatibility_clown_loach_baseline.sql`; not applied to Staging/Production.
- Reviewed long-term planning uses 24–30°C, pH 5.0–7.0, 1–12 dGH, ~40 cm SL, 180 cm / ~648 L, minimum group 5 with 10+ preferred. Legacy `Territorial` is not promoted into permanent territorial pressure; fin-nipping risk remains a caution dimension for vulnerable long-fin tankmates.
- Sex identification remains unknown and reproduction remains absent until stronger reviewed authority exists.
- Validation PASS: TypeScript, Species Knowledge, Compatibility, canonical coverage, Admin/Git/DB runtime, Staging preflight, Local File Admin, full build, Species Detail, Compatibility Beginner Action and GP001–GP004.


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

## Local File restore visibility fix
- Fixed the GitHub-runner race where a reader could fetch pre-restore Business state and then receive 404 for its asset after restore committed.
- Restore overlays backup assets and retains superseded assets as auditable orphans so visible state never points at an immediately hidden asset.
- Local File test passed repeatedly and full build passed before push.
## P1 — Pygmy cory reviewed-authority checkpoint
- Standard `Corydoras pygmaeus` (`sp_0053`) now has direct reviewed environment/social/space authority: 22–26°C, pH 6.4–7.4, 0–8 dGH, ~2.1 cm SL, 45 cm / ~41 L, minimum group 6.
- Reviewed small-body vulnerability is represented as `predationVulnerability: high`; ordinary fish create caution context while explicit reviewed predators retain hard blocks.
- Canonical matrix: 23 taxa / 506 directions = 378 caution, 126 not_recommended, 2 compatible. Runtime/Admin baseline: 26 Profiles / 5 Pair Rules.
- Added unapplied additive migration `202609120012_compatibility_pygmy_cory_baseline.sql`. Corrected the also-unapplied Discus `120011` minimum-group drift assertion and extended migration self-consistency tests to minimumGroupSize + requiredFacts.
- Product, runtime/Admin, build and GP001–GP004 gates all PASS.

## Main convergence checkpoint — backup manifest binding and corrupt authority fail-closed
- Current main Local File hardening is absorbed: backup manifests are directory-bound and corrupt active authority now fails closed with recovery guidance.
- Product Recovery authority, Compatibility V7, 26/5 runtime baseline, and the 23-taxon reviewed matrix are unchanged.

## P1 — Sewellia lineolata reviewed-authority checkpoint
- Standard `Sewellia lineolata` (`sp_0045`) now has direct reviewed environment/social/space authority: 20–24°C, pH 6.0–7.5, 1–10 dGH, ~6.5 cm SL, 75 cm / ~68 L, minimum group 6.
- Bottom-resource competition stays `territoriality: low`; no permanent community-wide territorial warning is introduced. High-flow/high-oxygen requirements remain husbandry guidance, not a fabricated equipment rule.
- Canonical matrix: 24 taxa / 552 directions = 418 caution, 132 not_recommended, 2 compatible. Runtime/Admin baseline: 27 Profiles / 5 Pair Rules.
- Added unapplied additive migration `202609120013_compatibility_sewellia_baseline.sql`. Product, runtime/Admin, build and GP001–GP004 gates all PASS.

## Main convergence checkpoint — corrupt active authority write guard
- Current main now fails closed for both reads and writes when durable active authority is corrupt.
- Product Recovery authority, Compatibility V7, 27/5 runtime baseline, and the 24-taxon reviewed matrix remain unchanged.
