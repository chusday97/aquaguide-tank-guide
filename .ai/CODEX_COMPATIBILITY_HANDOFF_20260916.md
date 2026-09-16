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
- Regression fix after Batch 16: preserved existing runtime Neocaridina davidi Red authority for `sp_0001` while keeping its direct completion record matrix-only, so Species Detail and frozen Compatibility behavior remain unchanged.
- Regression fix after Batch 15: preserved the existing runtime Neritina natalensis authority for `sp_0428` while keeping its direct completion record matrix-only, restoring the frozen launch matrix and duplicate-catalog evidence consistency.

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

## Phase 2 Batch 11 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0236`, `sp_0240`, `sp_0241`, `sp_0243`, `sp_0247`, `sp_0249`, `sp_0250`, `sp_0251`, `sp_0256`, and `sp_0257`.
- FishBase/FAO professional sources were searched for the named base taxa. Commercial color, fin, balloon, and hybrid-like catalog variants remain fail-closed; no base-species facts were inherited into variants.
- Matrix Batch 10 → Batch 11: feeding `needs_research 130→123`, `reviewed_unknown 92→102`; environment `needs_research 361→351`, `reviewed_unknown 88→98`; space `needs_research 311→301`, `reviewed_unknown 88→98`; social `needs_research 252→242`, `reviewed_unknown 91→101`.
- Batch 11 contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## Phase 2 Batch 12 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0263`, `sp_0264`, `sp_0265`, `sp_0266`, `sp_0270`, `sp_0271`, `sp_0272`, `sp_0273`, `sp_0282`, and `sp_0288`.
- FishBase/FAO professional sources were searched for the named base taxa. Albino, color, long-fin, gold, and platinum commercial variants remain fail-closed; no base-species facts were inherited into variants.
- Matrix Batch 11 → Batch 12: feeding `needs_research 123→113`, `reviewed_unknown 102→112`; environment `needs_research 351→341`, `reviewed_unknown 98→108`; space `needs_research 301→291`, `reviewed_unknown 98→108`; social `needs_research 242→232`, `reviewed_unknown 101→111`.
- Batch 12 contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## Phase 2 Batch 13 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0289`, `sp_0290`, `sp_0291`, `sp_0294`, `sp_0338`, `sp_0340`, `sp_0341`, `sp_0359`, `sp_0363`, and `sp_0364`.
- FishBase species summaries and the USGS Aphyocharax anisitsi fact sheet were reviewed for the named base taxa. GloFish, albino, balloon, long-fin, and color variants remain fail-closed; no base-species feeding, environment, space, social, care, or sex facts were inherited into a variant object.
- Matrix Batch 12 → Batch 13: feeding `needs_research 113→108`, `template_only 185→180`, `reviewed_unknown 112→122`; environment `needs_research 341→331`, `reviewed_unknown 108→118`; space `needs_research 291→291`, `reviewed_unknown 108→118`; social `needs_research 232→222`, `reviewed_unknown 111→121`; care `reviewed_supported 321→316`, `template_only 42→37`, `reviewed_unknown 112→122`.
- Batch 13 contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## Phase 2 Batch 14 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0372`, `sp_0373`, `sp_0374`, `sp_0376`, `sp_0388`, `sp_0393`, `sp_0394`, `sp_0399`, `sp_0414`, and `sp_0415`.
- FishBase species summaries were reviewed for the named taxa. Balloon, color, fin, marine catalog, and uncertain Geophagus variants remain fail-closed; no base-species facts were inherited into a variant object.
- Matrix Batch 13 → Batch 14: feeding `needs_research 108→98`, `reviewed_unknown 122→132`; environment `needs_research 331→321`, `reviewed_unknown 118→128`; space `needs_research 291→281`, `reviewed_unknown 118→128`; social `needs_research 222→212`, `reviewed_unknown 121→131`; care `reviewed_supported 316→306`, `reviewed_unknown 122→132`.
- Batch 14 contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## Phase 2 Batch 15 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0416`, `sp_0417`, `sp_0419`, `sp_0421`, `sp_0428`, `sp_0429`, `sp_0449`, `sp_0450`, `sp_0452`, and `sp_0456`.
- FishBase species summaries were reviewed for the named taxa. Commercial variants and duplicate catalog objects remain fail-closed; no base-species feeding, environment, space, social, care, or sex facts were inherited into a variant/object record.
- Matrix Batch 14 → Batch 15: feeding `needs_research 98→91`, `template_only 180→177`, `reviewed_unknown 132→142`; environment `needs_research 321→311`, `reviewed_unknown 128→138`; space `needs_research 281→272`, `reviewed_unknown 128→138`, `inherited_reviewed 31→30`; social `needs_research 212→203`, `reviewed_unknown 131→141`, `inherited_reviewed 36→35`; care `reviewed_supported 306→300`, `template_only 37→33`, `reviewed_unknown 132→142`.
- Batch 15 contract, matrix contract, and lint pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## Phase 2 Batch 16 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0001`, `sp_0007`, `sp_0008`, `sp_0009`, `sp_0015`, `sp_0022`, `sp_0038`, `sp_0043`, `sp_0044`, and `sp_0047`.
- FishBase professional species records were reviewed for the named taxa. The Red shrimp variant and non-fish/freshwater/marine species remain fail-closed where object-specific aquarium authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 15 → Batch 16: feeding `needs_research 91→91`, `template_only 177→167`, `reviewed_unknown 142→152`; environment `needs_research 311→301`, `reviewed_unknown 138→148`; space `needs_research 272→263`, `reviewed_unknown 138→148`, `inherited_reviewed 30→29`; social `needs_research 203→194`, `reviewed_unknown 141→151`, `inherited_reviewed 35→34`; care `reviewed_supported 300→291`, `template_only 33→32`, `reviewed_unknown 142→152`.
- Batch 16 contract, matrix contract, lint, launch matrix, and Compatibility evidence coverage pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
## Phase 2 Batch 24 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0445`, `sp_0453`, `sp_0459`, `sp_0037`, `sp_0041`, `sp_0046`, `sp_0063`, `sp_0064`, `sp_0065`, and `sp_0066`.
- FishBase professional species records were reviewed for Trichopodus, Pterois, Neocaridina, Acheilognathus, Abbottina, Aphyocypris, and Carassius catalog objects. Species records and goldfish/commercial variants remain fail-closed where object-specific aquarium authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Batch 24 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions must pass before the checkpoint commit. No Compatibility authority, pair rule, launch state, schema, migration, push, or deployment is part of this batch.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.

## Phase 2 Batch 25 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0067`, `sp_0068`, `sp_0077`, `sp_0089`, `sp_0111`, `sp_0124`, `sp_0142`, `sp_0149`, `sp_0150`, and `sp_0159`.
- FishBase, Texas A&M AquaPlant, and Kew professional records were reviewed for goldfish variants, aquatic plants, Sawbwa, Ancistrus, and Poecilia objects. Variant and genus-level records remain fail-closed where object-specific aquarium authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 24 → Batch 25: feeding `reviewed_unknown 232→242`, `needs_research 84→74`; environment `reviewed_unknown 228→238`, `needs_research 221→211`; space `reviewed_unknown 228→238`, `needs_research 184→174`; social `reviewed_unknown 231→241`, `needs_research 115→105`; care `reviewed_unknown 232→242`, `reviewed_supported 212→202`.
- Batch 25 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions pass. No Compatibility authority, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## Phase 2 Batch 26 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0160`, `sp_0161`, `sp_0162`, `sp_0168`, `sp_0169`, `sp_0180`, `sp_0188`, `sp_0189`, `sp_0190`, and `sp_0196`.
- FishBase professional records were reviewed for Ancistrus, Poecilia, Carassius, Lysmata, Thor, and Sahyadria/Dawkinsia objects. Commercial variants and marine invertebrates remain fail-closed where object-specific aquarium authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 25 → Batch 26: feeding `reviewed_unknown 242→252`, `needs_research 74→64`; environment `reviewed_unknown 238→248`, `needs_research 211→201`; space `reviewed_unknown 238→248`, `needs_research 174→164`; social `reviewed_unknown 241→251`, `needs_research 105→95`; care `reviewed_unknown 242→252`, `reviewed_supported 202→192`.
- Batch 26 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions pass. No Compatibility authority, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## Phase 2 Batch 27 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0203`, `sp_0209`, `sp_0213`, `sp_0215`, `sp_0230`, `sp_0237`, `sp_0253`, `sp_0254`, `sp_0280`, and `sp_0281`.
- FishBase professional records were reviewed for Poecilia, Crossocheilus, Sahyadria/Dawkinsia, and Ancistrus catalog variants. Commercial and color/fin variants remain fail-closed where object-specific aquarium authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 26 → Batch 27: feeding `reviewed_unknown 252→262`, `needs_research 64→54`; environment `reviewed_unknown 248→258`, `needs_research 201→191`; space `reviewed_unknown 248→258`, `needs_research 164→154`; social `reviewed_unknown 251→261`, `needs_research 95→85`; care `reviewed_unknown 252→262`, `reviewed_supported 192→182`.
- Batch 27 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions pass. No Compatibility authority, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
## Phase 2 Batch 23 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0402`, `sp_0407`, `sp_0408`, `sp_0409`, `sp_0410`, `sp_0411`, `sp_0412`, `sp_0420`, `sp_0441`, and `sp_0442`.
- FishBase and WoRMS professional taxonomic records were reviewed for the named anemone, arowana, stingray, snakehead, gourami, and algae-eater objects. Commercial variants remain fail-closed where object-specific husbandry authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 22 → Batch 23: feeding `needs_research 91→91`, `template_only 107→97`, `reviewed_unknown 212→222`; environment `needs_research 241→231`, `reviewed_unknown 208→218`; space `needs_research 203→193`, `reviewed_unknown 208→218`; social `needs_research 134→124`, `reviewed_unknown 211→221`; care `reviewed_supported 231→221`, `reviewed_unknown 212→222`.
- Batch 23 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
## Phase 2 Batch 22 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0333`, `sp_0334`, `sp_0365`, `sp_0368`, `sp_0370`, `sp_0379`, `sp_0382`, `sp_0384`, `sp_0400`, and `sp_0401`.
- FishBase and WoRMS professional taxonomic records were reviewed for the named anemone, jellyfish, coral, and marine variant objects. Commercial variants and marine invertebrates remain fail-closed where object-specific husbandry authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 21 → Batch 22: feeding `needs_research 91→91`, `template_only 117→107`, `reviewed_unknown 202→212`; environment `needs_research 251→241`, `reviewed_unknown 198→208`; space `needs_research 213→203`, `reviewed_unknown 198→208`; social `needs_research 144→134`, `reviewed_unknown 201→211`; care `reviewed_supported 241→231`, `reviewed_unknown 202→212`.
- Batch 22 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
## Phase 2 Batch 21 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0285`, `sp_0286`, `sp_0296`, `sp_0297`, `sp_0318`, `sp_0319`, `sp_0321`, `sp_0322`, `sp_0323`, and `sp_0325`.
- FishBase and WoRMS professional taxonomic records were reviewed for the named snakehead, marine catalog variants, corals, and anemone objects. Commercial variants and marine invertebrates remain fail-closed where object-specific husbandry authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 20 → Batch 21: feeding `needs_research 91→91`, `template_only 127→117`, `reviewed_unknown 192→202`; environment `needs_research 261→251`, `reviewed_unknown 188→198`; space `needs_research 223→213`, `reviewed_unknown 188→198`; social `needs_research 154→144`, `reviewed_unknown 191→201`; care `reviewed_supported 251→241`, `reviewed_unknown 192→202`.
- Batch 21 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
## Phase 2 Batch 20 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0200`, `sp_0216`, `sp_0229`, `sp_0234`, `sp_0242`, `sp_0248`, `sp_0268`, `sp_0269`, `sp_0283`, and `sp_0284`.
- FishBase professional species records were reviewed for Dario, Channa, Gyrinocheilus, Scleropages, Osphronemus, and Trichopodus taxa. Commercial variants remain fail-closed; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 19 → Batch 20: feeding `needs_research 91→91`, `template_only 137→127`, `reviewed_unknown 182→192`; environment `needs_research 271→261`, `reviewed_unknown 178→188`; space `needs_research 233→223`, `reviewed_unknown 178→188`; social `needs_research 164→154`, `reviewed_unknown 181→191`; care `reviewed_supported 261→251`, `reviewed_unknown 182→192`.
- Batch 20 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
## Phase 2 Batch 19 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0151`, `sp_0156`, `sp_0179`, `sp_0181`, `sp_0183`, `sp_0184`, `sp_0185`, `sp_0197`, `sp_0198`, and `sp_0199`.
- FishBase professional species records were reviewed for the named taxa, including marine angelfish/triggerfish, freshwater labyrinth fish, knifefish, and cichlids. Commercial variants remain fail-closed; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 18 → Batch 19: feeding `needs_research 91→91`, `template_only 147→137`, `reviewed_unknown 172→182`; environment `needs_research 281→271`, `reviewed_unknown 168→178`; space `needs_research 243→233`, `reviewed_unknown 168→178`; social `needs_research 174→164`, `reviewed_unknown 171→181`; care `reviewed_supported 271→261`, `reviewed_unknown 172→182`.
- Batch 19 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
## Phase 2 Batch 18 checkpoint — 2026-09-17
- Completed ten direct reviewed-unknown records: `sp_0117`, `sp_0118`, `sp_0119`, `sp_0120`, `sp_0127`, `sp_0130`, `sp_0131`, `sp_0138`, `sp_0139`, and `sp_0140`.
- FishBase professional species records were reviewed for the named taxa, including Arowana, freshwater butterflyfish, knifefish, loach, and characins. Records remain fail-closed where object-specific aquarium authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 17 → Batch 18: feeding `needs_research 91→91`, `template_only 157→147`, `reviewed_unknown 162→172`; environment `needs_research 291→281`, `reviewed_unknown 158→168`; space `needs_research 253→243`, `reviewed_unknown 158→168`; social `needs_research 184→174`, `reviewed_unknown 161→171`; care `reviewed_supported 281→271`, `reviewed_unknown 162→172`.
- Batch 18 contract, matrix contract, lint, launch matrix, Compatibility evidence coverage, and Species Detail assertions pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
## Phase 2 Batch 17 checkpoint — 2026-09-16
- Completed ten direct reviewed-unknown records: `sp_0048`, `sp_0050`, `sp_0059`, `sp_0103`, `sp_0104`, `sp_0105`, `sp_0108`, `sp_0109`, `sp_0110`, and `sp_0116`.
- FishBase professional species records were reviewed for the named taxa. Snakehead, arowana, bichir, and other large-fish objects remain fail-closed where object-specific aquarium authority was insufficient; no template, name inference, or base-species inheritance was promoted.
- Matrix Batch 16 → Batch 17: feeding `needs_research 91→91`, `template_only 167→157`, `reviewed_unknown 152→162`; environment `needs_research 301→291`, `reviewed_unknown 148→158`; space `needs_research 263→253`, `reviewed_unknown 148→158`; social `needs_research 194→184`, `reviewed_unknown 151→161`; care `reviewed_supported 291→281`, `reviewed_unknown 152→162`.
- Batch 17 contract, matrix contract, lint, launch matrix, and Compatibility evidence coverage pass. No Compatibility profile, pair rule, launch state, schema, migration, push, or deployment changed. Protected CSV SHA remains `d5f3d1b92e85c58c1f17c5f2cf1cd5335fa24819c9b82258037ad886bbb09e1c`.
- Next batch must use the regenerated research backlog after this checkpoint and continue excluding existing direct Knowledge/Compatibility objects.

## VISIBLE_CODEX_CHAT_NEXT_PROMPT
Continue AquaGuide Knowledge Completion Program from the local Batch 6 checkpoint in `/Users/chuchu/aquaguide-compat-core` on branch `agent/compatibility-core-20260916`. Use the latest research backlog for the next 10–15 uncompleted catalog objects, use source-first evidence, preserve strict variant boundaries, regenerate the matrix/backlog, run the full required gates, create one local commit per passing batch excluding the protected CSV, and update this handoff. Never push, merge, deploy, migrate production, or weaken evidence standards.
