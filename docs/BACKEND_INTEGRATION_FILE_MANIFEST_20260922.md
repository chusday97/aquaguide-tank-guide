# Backend Integration File Manifest — 2026-09-22

Generated from `origin/main...backend/convergence-20260922` after refreshing main.

Classification is intentionally conservative. No merge/rebase is authorized by this file.

## Main-only commits that must be preserved

- `be0fdef9` Merge pull request #153 from chusday97/sync/care-layer-problem-copy-20260918
- `c6b1d9a6` refactor(care): clarify layer to problem journey
- `d2e23dc3` Merge pull request #152 from chusday97/sync/final-ui-local-convergence-20260918
- `1fd23722` ci: build business api before typecheck
- `2b8abc4d` feat(aquarium): preserve local hierarchy semantics on current main
- `240f79a1` perf(vercel): prune legacy static image masters
- `e7245e2f` fix(vercel): isolate admin-content deployment
- `f21be25b` fix(vercel): remove legacy generated API bundle
- `7cc48684` fix(vercel): import private generated business bundle
- `902ea808` fix(vercel): keep generated business bundle out of function discovery
- `2f5197f3` fix(vercel): exclude static dist from function bundles
- `870b6cb5` chore(vercel): require explicit releases for shared repo
- `7e564f95` chore(vercel): disable branch preview deployments

## Summary

- INCLUDE_BACKEND: 176
- MANUAL_RECONCILE: 4
- EXCLUDE_FROZEN_VISION: 8
- EXCLUDE_FROZEN_UI: 2
- EXCLUDE_DB_HOLD: 0
- INCLUDE_DB_ARTIFACT_HOLD: 2

## Manual reconcile notes

- `.env.example`: preserve API/CORS additions if selected; exclude Vision environment contract while Vision is frozen.
- `apps/api/src/config.ts`: preserve non-Vision API configuration; exclude Vision model/key/fallback configuration while Vision is frozen.
- `package.json`: reconcile backend scripts with main's newer business-bundle/typecheck/Vercel workflow; never replace the whole main file.

## Integration-candidate refinements discovered by validation

- `apps/admin-content/scripts/business-admin-staging-readiness.mjs`: current-main staging plan now lists the two repository-only Compatibility authority migrations so preflight remains exhaustive; this does not apply them.
- CI ownership audit found that reviewed Profiles sp_0016 and sp_0475 lacked explicit additive migration ownership. Repository-only migration 202609220001_compatibility_gold_ram_rhodeus_profiles.sql closes that authority gap; it is not applied by this integration.
- CI requires `supabase/migrations/202609160001_compatibility_rummy_oto_oscar_baseline.sql` as a static contract artifact. It is included in the repository candidate but **must not be applied** during this integration.
The initial file classification was conservative but validation found additional presentation coupling:
- `src/services/compatibility/compatibility-presentation.service.ts`: kept from current main because user-facing copy is frozen.
- `scripts/test-compatibility-presentation.ts`: kept from current main so existing presentation semantics remain the contract.
- `scripts/test-compatibility-user-conclusion.ts`: mixed file; backend status/risk/action safety assertions retained, presentation-copy assertions removed from the backend integration scope.

These refinements are represented in candidate commit `afc8ad2e` and are stricter than the initial manifest.

## Files

| Class | Path | Reason |
|---|---|---|
| INCLUDE_BACKEND | `.ai/CODEX_COMPATIBILITY_HANDOFF_20260916.md` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `.ai/CURRENT_GOAL.md` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `.ai/HANDOFF_LATEST.md` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| MANUAL_RECONCILE | `.env.example` | Mixed scope and/or main-only overlap; reconcile hunks explicitly and preserve main behavior. |
| INCLUDE_BACKEND | `40-DOCS/CHANGELOG.md` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `PROGRESS.md` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `PROJECT_STRUCTURE.md` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| EXCLUDE_FROZEN_VISION | `apps/api/src/ai/provider.ts` | Image-recognition scope frozen by user. |
| INCLUDE_BACKEND | `apps/api/src/app.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `apps/api/src/business-app.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| MANUAL_RECONCILE | `apps/api/src/config.ts` | Mixed scope and/or main-only overlap; reconcile hunks explicitly and preserve main behavior. |
| INCLUDE_BACKEND | `apps/api/src/http.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| EXCLUDE_FROZEN_VISION | `apps/api/src/routes/species-ai.ts` | Image-recognition scope frozen by user. |
| INCLUDE_BACKEND | `docs/BACKEND_RELEASE_INTEGRATION_CHECKLIST_20260922.md` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `docs/compatibility_knowledge_coverage.json` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `docs/compatibility_knowledge_coverage.md` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `docs/compatibility_knowledge_gap_queue.json` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `docs/species_knowledge_audit.csv` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `docs/species_knowledge_completion_matrix.csv` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `docs/species_knowledge_completion_matrix.json` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `docs/species_knowledge_research_backlog.json` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `docs/species_knowledge_research_backlog.md` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| MANUAL_RECONCILE | `package.json` | Mixed scope and/or main-only overlap; reconcile hunks explicitly and preserve main behavior. |
| EXCLUDE_FROZEN_VISION | `packages/contracts/src/species-diagnosis.ts` | Image-recognition scope frozen by user. |
| INCLUDE_BACKEND | `packages/domain-rules/src/compatibility.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/assert_species_detail_knowledge.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/generate-compatibility-knowledge-coverage.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/generate-species-knowledge-completion-matrix.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-addition-intents.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-api-cors-contract.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-api-origin-contract.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-backend-release-gate.mjs` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-catalog-identity-boundaries.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-catalog-review-batches.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-catalog-review-contract.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-admin-contract.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-coverage-scorecard.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-evidence-coverage.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-knowledge-coverage.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-launch-cohort.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-launch-matrix.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-pair-evidence-ceilings.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-presentation.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-symmetry.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-compatibility-user-conclusion.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-core-flow-state-eval-v1.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-domain-compatibility.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-fire-red-shrimp-knowledge-authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-gold-ram-compatibility-authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-identity-bound-catalog-bridges.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-01.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-02.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-03.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-04.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-05.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-06.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-07.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-08.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-09.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-10.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-11.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-12.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-13.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-14.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-15.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-16.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-17.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-18.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-19.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-20.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-21.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-22.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-23.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-24.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-25.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-26.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-27.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-28.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-29.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-30.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-31.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-32.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-33.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-34.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-35.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-36.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-37.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-38.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-39.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-40.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-41.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-42.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-43.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-44.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-45.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-46.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-47.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-48.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-completion-batch-49.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-knowledge-evidence-ceilings.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-launch-environment-batch-authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-multi-water-type-authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-neon-tetra-environment-authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-pearl-red-snakehead-knowledge-authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-platinum-snakehead-catalog-bridge.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-platinum-snakehead-remaining-pairs.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-platinum-snakehead-small-fish-pairs.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-rhodeus-compatibility-authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-secondary-environment-batch-authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-species-fit-multi-water.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-species-knowledge-completion-matrix.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-tank-compatibility-engine.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| EXCLUDE_FROZEN_VISION | `scripts/test-vision-provider-fallback.ts` | Image-recognition scope frozen by user. |
| INCLUDE_BACKEND | `scripts/test-visual-results.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `scripts/test-wild-neocaridina-knowledge-authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| EXCLUDE_FROZEN_VISION | `scripts/verify-identify-flow-separation.mjs` | Image-recognition scope frozen by user. |
| EXCLUDE_FROZEN_VISION | `scripts/verify-species-identification.mjs` | Image-recognition scope frozen by user. |
| EXCLUDE_FROZEN_UI | `src/components/visual-results/visual-result.adapters.ts` | UI scope frozen by user. |
| INCLUDE_BACKEND | `src/data/catalogFieldReviews.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/data/catalogIdentityBoundaries.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/data/catalogReviewBatches/batch-03.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/data/compatibility-launch-cohort.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/data/compatibilityEvidence.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/data/compatibilityPairEvidenceCeilings.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/data/knowledgeEvidenceCeilings.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/data/phase2Batch01Sources.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/lib/compatibility/canonical-result.adapter.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/lib/speciesFitEngine.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| EXCLUDE_FROZEN_VISION | `src/lib/speciesRecognition.ts` | Image-recognition scope frozen by user. |
| INCLUDE_BACKEND | `src/lib/tankCompatibilityEngine.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/knowledge.types.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/knowledgeSources.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2AuthorityRegistry.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch01Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch02Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch03Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch04Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch05Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch06Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch07Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch08Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch09Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch10Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch11Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch12Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch13Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch14Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch15Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch16Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch17Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch18Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch19Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch20Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch21Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch22Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch23Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch24Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch25Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch26Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch27Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch28Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch29Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch30Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch31Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch32Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch33Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch34Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch35Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch36Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch37Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch38Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch39Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch40Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch41Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch42Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch43Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch44Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch45Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch46Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch47Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch48Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/phase2Batch49Authority.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/modules/knowledge/speciesKnowledge.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| EXCLUDE_FROZEN_UI | `src/pages/Aquarium.tsx` | UI scope frozen by user. |
| EXCLUDE_FROZEN_VISION | `src/services/ai/species-identification.service.ts` | Image-recognition scope frozen by user. |
| INCLUDE_BACKEND | `src/services/api/api-client.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/services/api/api-origin.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/services/catalog/catalog-snapshot.service.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_BACKEND | `src/services/compatibility/compatibility-presentation.service.ts` | Backend/data/authority/test scope with no detected frozen-scope or main-only path overlap. |
| INCLUDE_DB_ARTIFACT_HOLD | `supabase/migrations/202609160001_compatibility_rummy_oto_oscar_baseline.sql` | Repository-only reviewed-baseline artifact required by CI contract; migration application and DB authority switch remain HOLD. |
| INCLUDE_DB_ARTIFACT_HOLD | supabase/migrations/202609220001_compatibility_gold_ram_rhodeus_profiles.sql | Repository-only additive owner for reviewed Profiles sp_0016/sp_0475; application remains HOLD. |
| MANUAL_RECONCILE | `apps/admin-content/scripts/business-admin-staging-readiness.mjs` | Current-main Business Admin staging plan reconciled to include repository-only Compatibility authority migrations; no migration execution is performed. |
