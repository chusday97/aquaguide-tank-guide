# AI Changelog

## 2026-08-25

### Result UX workflow head integrity

- Retained only the candidate-head verification semantics from the historical Result UX branch: pull-request head or canonical push SHA checkout, followed by an exact `git rev-parse HEAD` assertion.
- Added `result-ux-head-integrity-v1.yml`, `scripts/test-result-ux-workflow-head-integrity.mjs` and `npm run test:result-ux-head-integrity`.
- Deliberately did not copy the historical Result UX page workflow, UI or release-path assumptions; current PR #141 remains the only convergence entry.
- Local contract passed. The workflow is configured for PR/push events, but its remote run remains pending until the file is available on the PR base/default delivery path. Exact Preview SHA, Supabase migration/RLS metadata and human release acceptance remain open.

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
