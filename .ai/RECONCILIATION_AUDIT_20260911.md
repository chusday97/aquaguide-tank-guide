# Feature ↔ Main Reconciliation Audit — 2026-09-11

## Scope and safety
This is a read-only reconciliation audit. No merge, rebase, cherry-pick, force-push, Production deployment, live DB migration, Supabase Staging mutation or indexing change was performed.

Authoritative refs at audit start:
- local accepted feature HEAD: `a7ee4a13`
- live remote feature: `e9c63560`
- live main: `d3c70dee`
- merge base: `ed0cf38025652db901ee81aa697ca55b1c1584b6`
- local vs live feature: ahead 60 / behind 0
- main vs local: 275 main-only / 320 local-feature-only

## File-level divergence
From the merge base:
- main changed 220 files
- local feature changed 234 files
- only 21 files overlap
- 199 files are main-only
- 213 files are feature-only

A three-way `git merge-file -p --diff3` simulation shows that 7 of the 21 overlapping files have zero conflict hunks and should be eligible for automatic merge followed by regression tests:
- `packages/contracts/src/index.ts`
- `src/i18n/index.ts`
- `src/main.tsx`
- `src/pages/AdminContent.tsx`
- `src/pages/Aquarium.tsx`
- `src/pages/Encyclopedia.tsx`
- `src/pages/Identify.tsx`

The remaining textual conflicts are concentrated in metadata/docs plus seven product/runtime files.

## Product/runtime conflict clusters
### 1. Compatibility runtime — highest risk
Files:
- `src/lib/tankCompatibilityEngine.ts` — 4 conflict hunks
- `src/data/compatibilityEvidence.ts` — 1 conflict hunk

Main has evolved the engine through 13 commits from `7e19a7ba` to `6539611a`, adding Compatibility v3/domain-rule authority, life-stage risk, required facts, canonical decision readiness, stocking guidance, individual context and observed signals.

Feature independently changed the engine so reviewed Profile + Pair evidence comes from `runtimeCompatibilityRegistry`, with exact reviewed-DB activation and wholesale static fallback.

Required resolution: **main v3 engine/domain rules must remain the behavioral base; feature runtime reviewed authority must be injected into that engine. Do not choose one side wholesale.**

Merge gate: main's `ReviewedStageRiskProfile` is currently species-specific reviewed evidence but is not represented in feature's runtime bootstrap/version/coverage model. Directly retaining static Stage Risk beside runtime DB Profile/Pair would create split decision authority. Integration must explicitly resolve Stage Risk authority before this cluster can be accepted.

### 2. Root routing / app shell — medium risk
File: `src/App.tsx` — 2 conflict hunks.

Resolution formula:
- retain main interactive-preview/onboarding bypass semantics;
- retain feature Admin login/AdminHub/Product-Care/Compatibility/Publish/SEO routes;
- do not collapse `/admin/content` back to the old single `AdminContent` route.

### 3. API route registry — low risk, explicit union
File: `apps/api/src/routes/index.ts` — 1 conflict hunk.

Resolution formula: preserve both `catalogRouter` from main and `localAdminFileRouter` from feature, with route-order regression checks.

### 4. Build/test scripts — low-medium risk, explicit union
File: `package.json` — 2 conflict hunks.

Resolution formula:
- keep feature composite `build:web + build:seo-admin + build:species-pages + build:care-pages`;
- also retain main project-truth/readiness/UI-freeze/preview-parity/layout test scripts;
- retain both feature Admin/SEO tests and main aquarium/layout tests.

### 5. Care Encyclopedia composition — medium risk
File: `src/pages/CareEncyclopedia.tsx` — 1 conflict hunk.

Resolution formula: preserve main's newer desktop/scene wrapper composition and feature's canonical-topic route behavior (`!isCanonicalTopicRoute` dialog guard). Validate canonical Care routes plus 390/desktop layout.

### 6. Vite dev/build metadata — low risk, explicit union
File: `vite.config.ts` — 1 conflict hunk.

Resolution formula: preserve main preview build identity metadata and feature externally assigned `API_PORT` proxy support. Neither should replace the other.

### 7. Documentation / repo metadata
Conflicts also exist in `.ai/CURRENT_GOAL.md`, `.ai/DECISION_LOG.md`, `.ai/EXECUTION_LOG.md`, `.ai/TASK_QUEUE.md`, `.gitignore`, `HANDOFF.md`, `PROGRESS.md`.

Resolution formula: treat the latest Aqua Admin continuation set as feature authority for current Admin state, while preserving genuinely newer main product history where it is not contradictory. Do not use historical branch counts as current truth.

## Recommended integration order
1. Create an isolated reconciliation candidate branch/worktree; do not work directly on main.
2. Apply low-risk unions first: API route registry, Vite config, package scripts, contracts/i18n/main entry, docs/meta.
3. Accept auto-mergeable page files, then immediately run the existing main UI/golden-path gates plus Aqua Admin Final Local Acceptance gates.
4. Resolve `CareEncyclopedia.tsx` manually and validate canonical route + main scene/layout behavior.
5. Resolve `src/App.tsx` manually and validate preview shell, onboarding, normal frontend navigation and all Admin routes.
6. Resolve Compatibility last. Use main v3/domain-rule behavior as base, then extend/adapter-inject feature reviewed runtime authority. Decide Stage Risk authority explicitly before accepting the engine.
7. Run full combined regression: main project-truth/preview/layout/golden paths + feature Product/Care publication isolation, Compatibility authority/regression, Care SEO, Operations, Publish Center, Local File restart, TypeScript and full build.
8. Only after the reconciliation candidate is green should any merge-to-main decision be considered.

## Current merge-readiness verdict
**Not merge-ready yet.** Git conflict count is manageable, but Compatibility Stage Risk authority is a semantic merge gate. The branch should not be merged/rebased into main by selecting conflict sides mechanically.
