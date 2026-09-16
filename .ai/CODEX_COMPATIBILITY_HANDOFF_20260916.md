# Codex Handoff — Compatibility Core — 2026-09-16

## Worktree / branch
- Worktree: `/Users/chuchu/aquaguide-compat-core`
- Branch: `agent/compatibility-core-20260916`
- Current committed HEAD at Phase 2 handoff baseline: `53323ca2` (`docs(knowledge): record reviewed source conflicts`).
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
