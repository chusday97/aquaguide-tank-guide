# AI Changelog

## 2026-08-26

### Canonical regression re-verification

- Re-ran the current canonical head `fd27daf2` locally: core experience, responsive route scan (7×17), and full page runtime matrix (28/28) passed.
- Re-ran the remote PR #141 gates; RC, Result UX, Surface and UI Regression all passed at `fd27daf2`.
- Vercel remains on Ready deployment `f465cb76` because the current push is blocked by Hobby `build-rate-limit`; strict Preview SHA parity remains `NOT_SYNCHRONIZED`.

## 2026-08-26

### Exact Preview SHA parity restored

- Vercel Ready Preview `aquaguide-ps1d4be93-chusday97s-projects.vercel.app` now matches canonical head `f465cb76…`.
- All four GitHub Actions for the current head passed; Supabase schema/RLS parity and release acceptance remain open.

### Species detail CTA regression alignment

- Updated the stale owned-atlas detail assertion from `View tank species` to the current canonical `Livestock in Tank` label.
- Added `npm run test:species-detail-ui` to `UI Regression V1`; the 4317 browser regression passes.
- No product, API, database, Supabase or visual-baseline change.

### Preview SHA parity gate repaired

- Fixed the read-only parity script to fall back to `npx --yes vercel` when the system `vercel` binary is unavailable.
- Verified `PASS` for local, origin, PR #141 and Vercel Ready Preview at `f2a5ec4719dcc388985c845217d66eb8d1f46f47`; Supabase schema/RLS metadata and release acceptance remain open.
- The later docs/guard-only head was briefly pending deployment; Vercel now has Ready deployment `aquaguide-jqfsw1rja-chusday97s-projects.vercel.app` for `9f1a543c…`, so strict current-head parity is PASS without a manual redeploy.

### Canonical CI regression hardening closed

- Confirmed the final canonical head `ef878e25144c4cd12c461e0f3eadbd5182a1bada` passes UI Regression `32948782199`, Surface System `32948782231`, Result UX Head Integrity `32948782259`, and RC Convergence `32948782285`.
- Local, remote and PR #141 SHA are aligned; 4317 preview returns HTTP 200. Vercel remains blocked by `AUTH_REQUIRED`/Hobby build quota and Supabase schema/RLS parity plus release acceptance remain open.

### UI regression API parity

- Updated UI Regression V1 to start the existing Express API and Vite API proxy so Identify fallback and other `/api/v1` browser flows run against the same local architecture as development.
- Production build remains a separate check; local API+Vite Identify and Aquarium regressions pass. Commit `0b52e947`.

## 2026-08-26

### Aquarium settings panel click synchronization

- Made the Substrate and Plants settings-panel regression clicks navigation-independent, matching the current state-update interaction contract.
- Local 4317 verification passed; committed as `78160db3`. No product or cloud state changed.

## 2026-08-26

### Aquarium action regression navigation wait

- Updated the Add Livestock browser regression to avoid waiting for a navigation that the current action does not guarantee; it now verifies the resulting Dialog directly.
- Local 4317 verification passed and the test-only fix was committed as `a90911fa`; no product or cloud state changed.

## 2026-08-26

### Surface and Aquarium CI regression repair

- Updated the Surface System V1 static guard to the canonical 480–600px Detail Rail width instead of the retired 920px token.
- Made the Aquarium primary-tools browser regression wait for the Settings Dialog to finish closing after Escape, preventing a slow-CI click race.
- Local 4317 regression, typecheck, project-truth and diff checks pass; pushed as `a7b85171`. No product UI, domain, API, database, Supabase or deployment mutation.

## 2026-08-26

### Canonical domain and API CI coverage

- Added existing three-tier contract, business/API boundary, compatibility, tank-state/evidence, water-change, evidence-presentation, recommendation and share-report tests to `RC Convergence V1`.
- This closes the CI coverage gap between the canonical branch's bottom-layer implementation and its visual/browser gates; no product, schema, RLS or deployment behavior changed.

### Canonical CI trigger alignment

- Updated `Surface System V1` and `UI Regression V1` push triggers from the retired `codex/interactive-parity-v3` branch to `codex/unified-rc-visual-v1`.
- Registered the canonical `npm run test:ui-smoke` in the unified browser workflow against its isolated 4173 production preview.
- No product UI, domain rule, API contract, database, Supabase environment or visual geometry changed.

### Origin/main Care card reconciliation

- Reviewed `origin/main@ed0cf380`'s Care card reachability patch against the canonical Care article. The unified branch already exposes `分享卡片` → local `生成养护卡` with copy/save actions, so the old UI patch would duplicate the entry rather than restore missing behavior.
- Added `scripts/verify-care-card-action.mjs`, `npm run test:care-card-action-ui`, and the corresponding unified UI workflow step to protect the existing behavior. No product UI, domain rule, API contract, database, Supabase environment or visual geometry changed.
- Added `docs/03-development/ORIGIN_MAIN_RECONCILIATION.md` to record first-pass capability decisions for high-impact `origin/main` groups without claiming all 214 unique commits are reconciled.
- Reviewed `origin/main@daadc2a3`'s Settings sharing downgrade. The canonical branch has a real Settings → export/share route and deployed-reverification state, so the old “building” patch was not copied; added a browser guard for the destination.

### Preview target and runtime regression alignment

- Added `scripts/preview-url.mjs` as the single browser-regression target; scripts now default to the canonical 4317 production Preview and accept an explicit `AQUAGUIDE_URL`/`AQUAGUIDE_PREVIEW_URL`/`PREVIEW_URL` override.
- Updated stale 600px, detail surface, compatibility route, and Aquarium entry assertions to match the current viewport and UI contracts. Guided navigation now uses the current Search route and `data-tank-species-entry` instead of retired Aquarium/sidebar labels.
- Restored the existing AI Tank Copilot capability as the seventh desktop Aquarium Dock action and the existing mobile “更多鱼缸操作” action. No second page or new business rule was added.
- Verified core experience, page runtime matrix (28/28), guided navigation, settings feedback, interactive scenes, typecheck, project truth, branch convergence, and production build.

### Second stale-regression audit

- Replaced remaining `detail-drawer` and retired `Livestock in Tank` browser assertions with the current `detail-rail` and `View tank species` contracts.
- Clarified in README/SETUP that 3000 is the development server while 4317 is the production Preview used by regression scripts.
- Rebased Daily Discovery, action-kind runtime, and mobile Aquarium priority regressions on the current ownership contract: the six-item discovery scene is owned by Encyclopedia; Aquarium must not render a duplicate queue. Detail close, species favorite, livestock entry, and browse-mode filter assertions now use current observable actions.
- Re-ran the affected browser suite plus core/page/navigation/interactive/settings gates on 4317; all passed, including page runtime matrix 28/28.
- Replaced the unused legacy 3003 `verify-ui-smoke.mjs` with a canonical smoke that seeds a deterministic tank, checks formal routes/search, verifies six interactive atlas species, confirms the single livestock entry and rejects duplicate Aquarium discovery. Registered it as `npm run test:ui-smoke`; the smoke passes on 4317.

## 2026-08-26

### Automated Preview SHA parity gate

- Added `scripts/check-preview-parity.mjs` and `npm run check:preview-parity` to compare local HEAD, `origin/codex/unified-rc-visual-v1`, and the latest Vercel deployment for that branch using `githubCommitSha`.
- The live read-only check confirms local and GitHub are equal at the current head, while Vercel remains on `6b0e629d…`; the command correctly exits with `NOT_SYNCHRONIZED` instead of treating a stale Preview as release-ready.
- The command performs no deployment, Supabase, configuration, or data mutation.

### Compatibility evidence boundary migration

- Selectively retained the reviewed-pair evidence boundary from historical main batches: pair evaluation uses `species_only` scope, and reviewed species without a reviewed pair rule remain `insufficient_data`.
- Added `test:compatibility-evidence-coverage` and `test:compatibility-coverage-scorecard`; 501 catalog species, 7 reviewed profiles, 4 reviewed pair rules and 2 recordable priority directions are verified. No UI, API, SQL or Supabase change.

### Human visual baseline confirmation

- User confirmed the current 4317 visual direction as the working baseline; later visual changes remain allowed but must be incremental and re-reviewed.
- Core contract/domain checks, production build and real Chromium route check passed on canonical SHA `91cc980c`; exact Preview SHA and Supabase schema/RLS parity remain release blockers.

### Preview/Supabase parity follow-up

- Attempted read-only parity against the recorded Vercel branch Preview; it returned `302 → Vercel SSO` without an exposed Git SHA.
- No authorized Supabase schema/RLS inspection surface was available, so no Supabase request or mutation was executed. Exact Preview SHA, schema/RLS parity and human acceptance remain pending.

### Remote CI evidence

- GitHub confirmed PR #141 head `ffdcabd8411a8339ce09196f7310b96b33a4ce8a`; `RC Convergence V1` (`32915252842`) and `Result UX Head Integrity V1` (`32915252831`) passed.
- Vercel and Cloudflare status checks passed, but Vercel did not expose a deployed Git SHA; exact Preview parity remains pending.

### Result UX workflow head integrity

- Retained only the candidate-head verification semantics from the historical Result UX branch: pull-request head or canonical push SHA checkout, followed by an exact `git rev-parse HEAD` assertion.
- Added `result-ux-head-integrity-v1.yml`, `scripts/test-result-ux-workflow-head-integrity.mjs` and `npm run test:result-ux-head-integrity`.
- Deliberately did not copy the historical Result UX page workflow, UI or release-path assumptions; current PR #141 remains the only convergence entry.
- Local contract passed. The workflow is configured for PR/push events, but its remote run remains pending until the file is available on the PR base/default delivery path. Exact Preview SHA, Supabase migration/RLS metadata and human release acceptance remain open.

## 2026-08-25

### Recommendation authority and severity

- Preserved non-blocked single-housing candidates instead of filtering them by a free-text planning label.
- Removed recommendation-local temperament, load and group-size hard-block authority; canonical `evaluateTankCompatibility` now owns severity while local calculations remain risk/adjustment context.
- Routed candidate reasons through the canonical compatibility summary and added `scripts/test-recommendation-authority.ts` / `npm run test:recommendation-authority`.
- Verified recommendation contract, compatibility 17/17, evidence presentation, lint, production build, diff check and delayed 4317 interactive preview rendering. Kept the current visual baseline and did not copy RC recommendation UI.
- Next review unit is Result UX workflow head integrity; exact Preview SHA, Supabase migration/RLS metadata and human release acceptance remain open.

### Vercel/API runtime contract

- Added the canonical `api/v1/[...path].ts` catch-all and placed the `/api/v1/:path*` rewrite before the SPA fallback.
- Reused a standalone Express API app for Vercel instead of attaching routes to the legacy server; converted the API dependency graph to ESM-safe `.js` imports.
- Added runtime contract and local HTTP smoke tests plus server/public environment examples. Deliberately excluded RC-only LifeStage, database-field and business-API semantic changes.
- Verified API typecheck, runtime contract/smoke, business API, API boundary, AI capabilities, lint, build and project-truth checks. Independent Critic rechecked the health capability shape, AI aliases, fallback-key semantics and exact namespace-root rewrite with six-dimensional PASS. Deployed exact SHA and Supabase schema/RLS parity remain pending.

### Species Detail evidence authority

- Added `compatibilityEvidencePresentation.ts` to adapt canonical `TankCompatibilityResult` rules into ordered, status-aware detail evidence.
- Species Detail key reasons no longer derive from local metric heuristics; profile `housingReason` is visibly reference-only and cannot override the compatibility result.
- Added deterministic evidence-presentation regression and verified lint, compatibility, species knowledge, build, and 4317 browser detail checks.
- Critic follow-up fixed the rejected-evidence boundary: rejected rules remain pending for provenance accounting but are excluded from user-facing key reasons; added rejected-only and reviewed/rejected mixed regressions.
- Kept the overall compatibility module `PARTIAL_WITH_FALLBACK`; evidence coverage is still incomplete and remains a follow-up task.

### Branch convergence audit

- Added the read-only `npm run audit:branch-convergence` command and its canonical snapshot document.
- Added `npm run check:branch-convergence`, local/remote SHA parity reporting, missing-ref diagnostics and a push-workflow blocking step.
- CI parity now handles detached `actions/checkout` by using `GITHUB_REF_NAME` for the expected canonical branch.
- Pushed the reviewed parity gate to the canonical remote; local/remote SHA parity now passes. GitHub Actions observation remains pending because the current environment cannot reach the GitHub API.
- Recorded that the unified branch and `origin/main` diverge by 149/214 commits and that graph differences are not missing-feature verdicts.
- Kept migration decisions in `.ai/RC_MIGRATION_LEDGER.md`; no merge, rebase, push, database or product-code change was performed.

### Read-only parity evidence

- Verified the configured Supabase project through GET-only PostgREST probes: 31/31 contract tables and latest contract columns responded successfully.
- Recorded the remaining evidence gaps: exact migration revision, direct RLS policy metadata and exact Vercel Preview Git SHA are not exposed through the currently authorized surfaces.
- Verified the claimed 4317 preview renders the interactive DOM, species images and WebGL canvas without application errors; human visual acceptance still requires user confirmation.

### Visual baseline decision

- Recorded that the current 4317 version is usable as a working baseline, not a final visual lock; future UI fixes must be incremental and module-scoped.

### Unified governance implementation

- Added the cross-layer module fact inventory and routed it through the canonical truth map.
- Added a read-only PR governance contract and CI trigger coverage for `.ai` governance inputs.
- Closed the 55 historical PRs from the original snapshot, retained branches, and left #141 as the only open convergence PR.
- Preserved the explicit release blockers: exact Preview SHA parity, authorized Supabase schema/RLS parity, and separate release acceptance.

### Added

- 用户批准 P0 契约后，新增本地当前鱼缸/换水规则、审核阶段风险证据、派生服务和确定性回归；未改 UI、SQL、API 或 Supabase。

- 初始化 `.ai/` 上下文目录及四个标准文件。
- 补齐 `PRODUCT_CONTEXT.md`、`ARCHITECTURE.md`、`DECISION_LOG.md` 与 `BADCASES.md`。
- 新增项目根目录 `AI_PROJECT_PROTOCOL.md`，明确编码前读取与变更后更新要求。

### Notes

- 本次仅新增项目上下文文档，没有修改产品代码、业务数据或远端状态。
- 本轮只做上下文协议落地，未执行 `git push`，未触发 Vercel 部署。
- 协议与路由文档本地提交：`de906c2`。
## 2026-08-25 — Unified progress baseline

- Added `.ai/PROJECT_STATE.json` to name the one canonical branch, visual baseline, RC business reference, local preview, and deprecated integration PR.
- Changed the active goal from partial visual convergence to local/GitHub progress unification.
- Added a grouped RC migration ledger; API/persistence changes are explicitly held for contract review.
- Closed deprecated PR #140 and created Draft PR #141 as the sole RC convergence entry.
- Added the P0 data/contract impact review; no P0 runtime code was migrated.
- Added an executable project-status contract and RC convergence CI workflow.
- Changed the official daily local worktree to the canonical branch; legacy `codex/rc1-visual-integration` is no longer a valid starting point.
- Verified the RC Convergence CI in GitHub Actions run `32846848569`; the gate now runs on pushes to the canonical branch.
- Added `.ai/OPEN_PR_REGISTRY.md` to classify all 56 open PRs and prevent old stacked branches from being treated as parallel delivery paths.
- Started the eight-phase project truth consolidation: added canonical project, product, visual and deployment routing without changing UI, data or deployed environments.
- Added a historical-evidence registry and explicit supersession markers for the most misleading old Handoff, audit and cloud-planning documents.
- Added a visual acceptance matrix so the approved 4317 direction is tied to route-level browser and human evidence instead of informal references.
- Added the canonical Feature Catalog with one status vocabulary for current, deployed-but-unreverified, partial, proposed RC and archived capability.
- Added a Git delivery protocol, PR template and project-truth verification gate; branch protection remains intentionally pending until the check can run from its base branch.
- Added the Unified Release Readiness gate, separating local visual acceptance, CI, exact deployed SHA, Supabase parity, P0 migration and release authorization.
