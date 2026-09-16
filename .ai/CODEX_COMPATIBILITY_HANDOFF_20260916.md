# Codex Handoff — Compatibility Core — 2026-09-16

## Worktree / branch
- Worktree: `/Users/chuchu/aquaguide-compat-core`
- Branch: `agent/compatibility-core-20260916`
- Current committed HEAD: `bd3ab012` (`feat(knowledge): add phase2 batch01 authority`), based on the requested `53323ca2` baseline.
- DO NOT work in `/Users/chuchu/aquaguide-ui-redesign` or the old admin worktree.
- Default policy: local work + local commits only. DO NOT push or trigger Vercel unless the user explicitly approves a key milestone.

## Current goal — Knowledge Completion Program Phase 2
The launch matrix is closed and must not be expanded in this phase. Baseline runtime result at `53323ca2`:
- 435 unordered pairs
- 0 insufficient_data
- 198 not_recommended
- 221 caution
- 16 compatible
- deterministic + symmetric

Phase 2 Batch 1 is limited to direct, source-backed Knowledge authority for exactly:
- `sp_0016` 金波子 / `Mikrogeophagus ramirezi var. Gold`
- `sp_0224` 白金雷龙 / `Channa argus var. Platinum`
- `sp_0475` 高体鳑鲏 / `Rhodeus ocellatus`

Do not overwrite the user-owned `docs/species_knowledge_audit.csv`. Its pre-existing SHA-256 is
`d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
Do not use legacy fishData, template text, names, or automatic base-species inheritance as evidence.

## Important scope distinction
- Catalog objects: 486
- Compatibility-eligible species: 411
- Reviewed Compatibility Profiles: 31
- Broad catalog coverage is intentionally incomplete and fail-closed.
- Do NOT interpret the remaining 380 eligible species without full reviewed profiles as a requirement to finish all species now.
- Current launch closure target is only the remaining `sp_0451` Oscar authority and any regressions exposed while integrating it.

## Existing checkpoints
- `bd3ab012` feat(knowledge): add Phase 2 Batch 1 direct authority and completion matrix evidence.
- `53323ca2` docs(knowledge): record reviewed source conflicts; launch matrix is 0 insufficient.
- `72036acc` fix(catalog): preserve Rhodeus brackish provenance.
- `aa9706c5` fix(compatibility): close Oscar evidence authority.
- `d225bb86` feat(knowledge): add 486 species completion matrix.
- `68cc5c5c` fix(compatibility): add reviewed profile migration ownership.

## Phase 2 evidence decisions
- Gold ram: Aquarium Industries explicitly names gold rams as a Mikrogeophagus ramirezi colour variant and supports feeding, 24–28°C, pH 5.0–7.2, 4–6 cm, and breeding-period aggression. These are direct variant-aware claims, not automatic inheritance.
- Platinum snakehead: no reliable Platinum-specific feeding, environment, social, space, or care source was found. Direct reviewed-unknown blocks fallback inheritance; no Compatibility Profile is created.
- Rhodeus ocellatus: FishBase supports freshwater + brackish, 18–24°C, 9.2 cm SL and mussel-associated reproduction; J-STAGE supports 22–28°C reproductive temperature response. Water remains unknown in the single-value runtime schema, and no generic community behavior or feeding claim is promoted.
- No new launch pair rules or Compatibility Profiles are authorized by this batch.
- Runtime compatibility keeps the pre-existing reviewed Channa/Ram compatibility fallback where required for the frozen launch matrix; the completion matrix reads the three Phase 2 direct records and reports no inherited status for them. This is an explicit runtime compatibility boundary, not evidence completion by inheritance.

## Existing checkpoints (historical)
- `e617b2d6` fix(compatibility): align reviewed authority resolution
- `b3602a9f` feat(compatibility): review rummy-nose and otocinclus authority
- `ed0c2725` fix(compatibility): consume reviewed catalog facts
- `bb3e01b0` fix(catalog): preserve reviewed field provenance
- `13ffcedd` fix(compatibility): scope reviewed predation targets

## Current uncommitted work — preserve it
`git status --short` currently includes:
- `M scripts/test-catalog-review-batches.ts`
- `M src/data/catalogReviewBatches/batch-03.ts`

This is the reviewed correction for `sp_0475` 高体鳑鲏 / `Rhodeus ocellatus`.
Do NOT discard/reset it.

Source verification found FishBase supports:
- identity: Rhodeus ocellatus
- temperature: 18–24°C
- adult size: 9.2 cm SL

FishBase currently indicates freshwater + brackish. The current catalog water schema is single-valued, so DO NOT simplify that evidence to freshwater-only. Keep water unknown until the model can express the source faithfully.

## Non-negotiable evidence boundaries
1. Fail closed. Missing general behavior evidence must stay insufficient_data.
2. Do not infer compatibility from legacy `fishData` prose, temperament, category, feeding templates, or Google-search URLs.
3. Reviewed Species Knowledge / reviewed Catalog field values override legacy catalog values.
4. Direct pair evidence outranks trait inference.
5. Do NOT generalize one pair experiment into a universal species trait unless the source itself supports that scope.
6. `predationTargets` is now wired through Domain / legacy / Species Fit.
   - `small_fish` means small FISH, not small shrimp/snails.
   - `very_small_fish` has no audited numeric threshold; do not silently map all `Small` fish to it.
7. Ramirezi ornamental variants are explicitly protected by regression: do NOT auto-inherit standard-species authority unless separately reviewed.
8. A reviewed environmental field does not make the entire species behavior profile reviewed.

## Oscar / sp_0451 current evidence
Existing Catalog Review has verified FishBase support for:
- identity: `Astronotus ocellatus`
- water: freshwater
- temperature: 22–25°C
- adult size: max 45.7 cm

Current generic social behavior / territoriality / generic predation fields remain unknown in Catalog Review.

Existing direct reviewed pair evidence:
- `sp_0451` Oscar + `sp_0435` Zebrafish = `not_recommended`
- Sources are peer-reviewed predator-response studies using Astronotus ocellatus and Danio rerio.
- This pair rule is already implemented. Do NOT extrapolate it to every small fish merely to reduce insufficient count.

The correct next task is to find and verify source(s) that support an appropriately scoped GENERAL Oscar compatibility/behavior profile, or retain insufficient for combinations outside proven scope.
If adding a general profile, every promoted claim must have source support and citations. Prefer primary / professional / authoritative husbandry sources; avoid unsupported hobby summaries.

## Current matrix audit
Run `npm run test:compatibility-launch-matrix` to verify the frozen launch baseline:
`435 unordered pairs, 0 insufficient, 198 blocked, 221 caution, 16 compatible`.
Phase 2 must not add launch species, pair rules, or generalized predator claims.

## Required tests before local checkpoint
At minimum run:
- `npm run test:catalog-review-batches`
- `npm run test:catalog-review`
- `npm run test:species-knowledge`
- `npm run test:compatibility`
- `npm run test:compatibility-launch-matrix`
- `npm run test:compatibility-evidence-coverage`
- `npm run test:compatibility-coverage-scorecard`
- `npm run test:domain-compatibility`
- `npm run test:compatibility-service`
- `npm run lint`

Do not weaken tests to make the matrix greener. If reviewed evidence changes a fixture (e.g. reviewed temperature supersedes stale catalog temperature), update the fixture only when the reviewed authority actually justifies it.

## Success criteria for this handoff
1. Finish and verify the current uncommitted Rhodeus review correction first.
2. Audit Oscar evidence and integrate only defensible reviewed facts.
3. Reduce `insufficient_data` only when evidence supports the new conclusion.
4. Keep pair decisions symmetric and deterministic.
5. Keep evidence IDs / factEvidence provenance attached to every reviewed field used in runtime decisions.
6. Make local checkpoint commit(s), but DO NOT push.
7. Report exact changed files, exact matrix before/after, tests, remaining insufficients, and why any remaining gaps must stay fail-closed.

## Phase 2 Batch 02 checkpoint — 2026-09-16
- Completed ten direct, source-linked Knowledge records: `sp_0006`, `sp_0035`, `sp_0430`, `sp_0457`, `sp_0003`, `sp_0029`, `sp_0004`, `sp_0032`, `sp_0021`, and `sp_0036`.
- Sources reviewed: Raffles Bulletin of Zoology for `Geosesarma dennerle`; Australian Government/Australian Museum freshwater-mollusc account for `Anentome helena`; ITIS for `Caridina dennerli`; WoRMS for `Vittina turrita`; FishBase for `Amatitlania nigrofasciata`.
- All five applicable Knowledge completion fields are direct `reviewed_unknown` for this batch. No unsupported feeding, care, stocking, social, water, or variant claim was promoted. Existing mini-parrot Compatibility authority remains unchanged; no new profile, pair rule, migration, or launch object was created.
- Matrix before → after: feeding `needs_research 212→206`, `template_only 196→192`, `reviewed_unknown 2→12`; environment `needs_research 451→441`, `reviewed_unknown 1→11`; space `needs_research 410→400`, `reviewed_unknown 1→11`; social `needs_research 340→331`, `reviewed_unknown 2→12`, `inherited_reviewed 38→37`; care `template_only 88→79`, `reviewed_supported 385→384`, `reviewed_unknown 2→12`. The small care supported delta reflects the existing protected audit CSV state and was not a rewrite of that CSV.
- Frozen launch gate after the batch: 435 unordered pairs, 0 insufficient, 198 blocked, 221 caution, 16 compatible, deterministic and symmetric.
- Gates: batch-02 contract PASS; matrix PASS; Species Knowledge PASS; catalog review and batch contracts PASS; Compatibility PASS; launch matrix PASS; evidence coverage PASS; coverage scorecard PASS; Domain PASS; Compatibility Service PASS; runtime authority PASS; regression gate PASS; admin contract PASS; lint PASS. Exact `tsx` launcher commands were attempted but hit pre-existing EPERM IPC failures; equivalent `node --import tsx` commands passed. `npm run build:web` hit the pre-existing sandbox EPERM Vite cache path; `--configLoader runner` then exposed the existing ESM `__dirname` config limitation.
- Protected CSV SHA-256 remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next exact candidates: `sp_0052` 月光鼠 / `Corydoras hastatus`, `sp_0112` 蓝眼灯 / `Poropanchax normani`, `sp_0115` 琥珀灯 / `Hyphessobrycon amapaensis`, then `sp_0141` 甜心柠檬灯 (variant). Continue fail-closed if direct evidence is not available.

## Phase 2 Batch 03 checkpoint preparation — 2026-09-16
- Completed ten direct Knowledge records: `sp_0052`, `sp_0112`, `sp_0115`, `sp_0141`, `sp_0143`, `sp_0144`, `sp_0145`, `sp_0154`, `sp_0155`, and `sp_0167`.
- FishBase directly supports `sp_0052` (`Gastrodermus hastatus`) freshwater, 25–28°C, pH 6–8, 2.4 cm SL and small-school behavior; `sp_0112` (`Poropanchax normani`) freshwater, 22–26°C, pH 6.5–7.2 and 4.5 cm TL; and `sp_0115` (`Hyphessobrycon amapaensis`) freshwater and 3.0 cm SL. Other fields remain reviewed-unknown.
- Seven commercial variants were searched against their base-species FishBase records, but no variant-specific authority was found. All five completion fields remain direct `reviewed_unknown`; no base-species inheritance is used.
- Matrix before → after: feeding `needs_research 206→196`, `reviewed_unknown 12→22`; environment `needs_research 441→431`, `reviewed_supported 23→26`, `reviewed_unknown 11→18`; space `needs_research 400→390`, `reviewed_unknown 11→18`; social `needs_research 331→321`, `reviewed_unknown 12→21`; care `template_only 79→69`, `reviewed_unknown 12→22`.
- No Compatibility Profile, pair rule, launch object, or production/schema change was made. Frozen launch gate remains `435 unordered pairs / 0 insufficient / 198 blocked / 221 caution / 16 compatible`, deterministic and symmetric.
- Added `phase2Batch03Authority.ts`, its contract test, source registrations, matrix/backlog integration, and living documentation. Protected CSV was not staged or modified; SHA-256 remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Passing gates: Batch 01/02/03 contracts, Species Knowledge via `node --import tsx`, Knowledge Matrix, Catalog batch contract, Compatibility engine/evidence/scorecard, Domain, Compatibility Service, regression, admin, runtime authority, lint, and launch matrix. Direct `tsx` commands and Vite build remain blocked by pre-existing EPERM IPC/cache restrictions. Catalog review contract passes; its imported review diagnostic reports the pre-existing protected-CSV completeness mismatch without changing that file.
- Next exact candidates after this batch are the regenerated research backlog ranks 1 onward; continue source-first and fail-closed.

## Phase 2 Batch 04 checkpoint preparation — 2026-09-16
- Completed ten direct reviewed-unknown Knowledge records: `sp_0170`, `sp_0204`, `sp_0205`, `sp_0206`, `sp_0212`, `sp_0225`, `sp_0226`, `sp_0231`, `sp_0232`, and `sp_0244`.
- All are commercial variants. FishBase base-species records were reviewed as negative evidence for variant-specific authority; no feeding, environment, space, social, care, or sex claim was inherited or promoted.
- Matrix Batch 03 → Batch 04: feeding `needs_research 196→186`, `reviewed_unknown 22→32`; environment `needs_research 431→421`, `reviewed_unknown 18→28`; space `needs_research 390→380`, `reviewed_unknown 18→28`; social `needs_research 321→311`, `reviewed_unknown 21→31`; care `template_only 69→59`, `reviewed_unknown 22→32`.
- Batch 04 contract, matrix contract, and lint pass. Protected CSV SHA-256 remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`; no Compatibility or launch state changed.

## Session stop record — 2026-09-16

## Phase 2 Batch 05 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0245`, `sp_0246`, `sp_0255`, `sp_0287`, `sp_0339`, `sp_0358`, `sp_0360`, `sp_0362`, `sp_0375`, and `sp_0002`.
- Sources reviewed were FishBase base-species pages and an ITIS taxonomic record; no variant-specific authority was found, so no fields inherit from base species.
- Batch 04 → Batch 05: feeding `needs_research 186→176`, environment `needs_research 421→411`, space `needs_research 380→371`, social `needs_research 311→302`, care `template_only 59→49`; each field gained 10 `reviewed_unknown` records, with one inherited-space count changing due the protected CSV state.
- Batch contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.

- Exact HEAD remains `cdccdc038ebaced006d323076b3666ba3ffe01cc`.
- Batch 02 changes are uncommitted because Git could not create the worktree index lock at `/Users/chuchu/aquaguide-preview-current/.git/worktrees/aquaguide-compat-core/index.lock` (`Operation not permitted`). No commit was created, nothing was pushed, and no user-owned work was discarded.
- Stop reason: required local checkpoint commit is unavailable under the session filesystem boundary; the exact `tsx` and Vite build gates are also blocked by the pre-existing cross-worktree dependency/cache boundary. Equivalent TypeScript test invocations passed as recorded above.

## Phase 2 Batch 06 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0005`, `sp_0051`, `sp_0018`, `sp_0019`, `sp_0023`, `sp_0024`, `sp_0026`, `sp_0033`, `sp_0034`, and `sp_0042`. Existing reviewed authority for `sp_0049` was detected and excluded to prevent regression.
- Batch contract, matrix contract, and lint pass. No Compatibility or launch change; protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.

## Phase 2 Batch 07 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0054`, `sp_0055`, `sp_0056`, `sp_0057`, `sp_0058`, `sp_0062`, `sp_0069`, `sp_0070`, `sp_0121`, and `sp_0122`.
- FishBase species summaries were reviewed for the exact named taxa where available. The records provide partial ecology/taxonomy facts, but not a complete object-specific aquarium authority for the contract fields; catalog variants (`Cichlasoma var.`, `Cyprinus carpio var.`, and `Cyprinus carpio var. Longfin`) were not allowed to inherit base-species facts.
- Matrix Batch 06 → Batch 07: feeding `needs_research 169→159`, `reviewed_unknown 52→62`; environment `needs_research 401→391`, `reviewed_unknown 48→58`; space `needs_research 361→351`, `reviewed_unknown 48→58`; social `needs_research 292→282`, `reviewed_unknown 51→61`; care `reviewed_supported 377→367`, `reviewed_unknown 52→62`.
- Batch 07 contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint, excluding any object that already has direct Knowledge or Compatibility authority.

## Phase 2 Batch 08 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0123`, `sp_0125`, `sp_0129`, `sp_0146`, `sp_0152`, `sp_0157`, `sp_0158`, `sp_0163`, `sp_0173`, and `sp_0174`.
- FishBase species summaries were searched for the named base taxa. Commercial variants were kept fail-closed: no base-species feeding, environment, space, social, care, or sex facts were inherited into a variant object.
- Matrix Batch 07 → Batch 08: feeding `needs_research 159→150`, `reviewed_unknown 62→72`; environment `needs_research 391→381`, `reviewed_unknown 58→68`; space `needs_research 351→341`, `reviewed_unknown 58→68`; social `needs_research 282→272`, `reviewed_unknown 61→71`; care `reviewed_supported 367→358`, `reviewed_unknown 62→72`.
- Batch 08 contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## Phase 2 Batch 09 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0175`, `sp_0176`, `sp_0177`, `sp_0178`, `sp_0182`, `sp_0187`, `sp_0201`, `sp_0202`, `sp_0207`, and `sp_0208`.
- FishBase/FAO professional sources were reviewed for the named base taxa. Four angelfish variants, the White Black Skirt variant, Balloon variant, and catalog L-number objects remain fail-closed; no base-species facts were inherited into variants or uncertain catalog taxa.
- Matrix Batch 08 → Batch 09: feeding `needs_research 150→140`, `reviewed_unknown 72→82`; environment `needs_research 381→371`, `reviewed_unknown 68→78`; space `needs_research 341→331`, `reviewed_unknown 68→78`; social `needs_research 272→262`, `reviewed_unknown 71→81`; care `reviewed_supported 358→348`, `reviewed_unknown 72→82`.
- Batch 09 contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## Phase 2 Batch 10 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0211`, `sp_0214`, `sp_0217`, `sp_0218`, `sp_0219`, `sp_0220`, `sp_0221`, `sp_0227`, `sp_0228`, and `sp_0235`.
- FishBase/FAO professional sources were searched for the named base taxa. Commercial variants remain fail-closed; no base-species feeding, environment, space, social, care, or sex facts were inherited into a variant object.
- Matrix Batch 09 → Batch 10: feeding `needs_research 140→130`, `reviewed_unknown 82→92`; environment `needs_research 371→361`, `reviewed_unknown 78→88`; space `needs_research 321→311`, `reviewed_unknown 78→88`; social `needs_research 262→252`, `reviewed_unknown 81→91`; care `reviewed_supported 348→338`, `reviewed_unknown 82→92`.
- Batch 10 contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
Continue AquaGuide Knowledge Completion Program from the local Batch 6 checkpoint in `/Users/chuchu/aquaguide-compat-core` on branch `agent/compatibility-core-20260916`. Use the latest research backlog for the next 10–15 uncompleted catalog objects, use source-first evidence, preserve strict variant boundaries, regenerate the matrix/backlog, run the full required gates, create one local commit per passing batch excluding the protected CSV, and update this handoff. Never push, merge, deploy, migrate production, or weaken evidence standards.
