# AI Execution Log

## 2026-08-26 — Canonical CI trigger alignment

- **Action:** Moved `Surface System V1` and `UI Regression V1` push triggers from retired `codex/interactive-parity-v3` to `codex/unified-rc-visual-v1`; added the canonical `npm run test:ui-smoke` step to the unified browser workflow using the isolated 4173 preview.
- **Verification:** Workflow trigger scan shows only the canonical branch for push events; `npm run test:ui-smoke` passes locally with `AQUAGUIDE_URL=http://127.0.0.1:4317`.
- **Verification:** The change was pushed as `834af948`; `npm run project:status` and `git ls-remote` report the same canonical SHA, and `/_preview/interactive` returns HTTP 200. `check:preview-parity` remains `AUTH_REQUIRED` for Vercel metadata.
- **Boundary:** No product UI, domain rule, API contract, database, Supabase environment or visual geometry changed. Remote workflow execution will be observed after the push.

## 2026-08-26 — Origin/main Care card reconciliation

- **Action:** Compared `origin/main@ed0cf380`'s Care card reachability patch with the canonical Care detail. The current branch already wires `分享卡片` to the existing local `生成养护卡` preview; only the regression evidence was missing.
- **Verification:** Added a canonical Preview browser check for the entry, local card preview, copy action and absence of public-sharing CTAs; the check will run in `UI Regression V1`.
- **Boundary:** No duplicate product entry, data field, API, Supabase or visual geometry was introduced. The origin/main patch remains a reviewed historical source, not a merge source.

## 2026-08-26 — Preview URL and stale regression repair

- **Action:** Added the canonical `scripts/preview-url.mjs` resolver (default `http://127.0.0.1:4317`) and migrated browser scripts away from mixed 3000/4173/localhost defaults. Repaired stale 600px, detail surface, compatibility route, Aquarium search/entry and dialog-name assertions. Restored the existing AI Tank Copilot as the desktop Dock seventh action and mobile more-actions entry.
- **Verification:** `npm run build`; `npm run test:core-ui`; `npm run test:page-runtime-matrix` (28/28); `npm run test:guided-navigation-ui`; `npm run test:settings-feedback`; `npm run test:interactive-scenes-ui`; `npm run lint`; `npx tsc --noEmit`; `npm run check:project-truth`; `npm run check:branch-convergence`; `git diff --check` all passed. 4317 serves the rebuilt production output and the Copilot dialog opens in Chromium.
- **Boundary:** Current visual baseline remains unchanged; no SQL, API, Supabase, main merge, or Vercel deployment was performed. Vercel exact SHA and Supabase schema/RLS parity remain external release gates.

## 2026-08-26 — Second stale-regression audit

- **Action:** Audited remaining browser scripts and documentation for retired detail surfaces, labels, and port assumptions. Updated Care category, Daily Discovery, Species Detail and the 3000-vs-4317 setup wording. Rebased Daily Discovery and action/mobile priority checks on the current product truth: discovery belongs to the Encyclopedia interactive scene, while Aquarium remains a single immersive tank workspace.
- **Verification:** `npm run test:daily-discovery`; `npm run test:product-actions-runtime`; `npm run test:mobile-aquarium-priorities`; `npm run test:core-ui`; `npm run test:page-runtime-matrix` (28/28); `npm run test:guided-navigation-ui`; `npm run test:interactive-scenes-ui`; `npm run test:settings-feedback`; `npm run lint`; `npm run check:project-truth`; `npm run check:branch-convergence`; `git diff --check` all passed on the canonical 4317 Preview. No product data, API, Supabase, or visual geometry changed.

## 2026-08-26 — Latest parity check

## 2026-08-26 — Browser contract convergence push

- **Action:** Pushed the validated convergence and documentation commits to `codex/unified-rc-visual-v1`.
- **Verification:** `npm run project:status` and `git ls-remote` report the same current SHA; worktree is clean; `/_preview/interactive` returns HTTP 200. `npm run check:preview-parity` confirms local/remote parity but remains `AUTH_REQUIRED` for Vercel deployment metadata.
- **Boundary:** No `main` merge, Supabase request/migration/write, or deployment mutation was performed.

## 2026-08-26 — Canonical UI smoke registration

- **Action:** Replaced the stale 3003 UI smoke with a small 4317-targeted smoke and registered `npm run test:ui-smoke`; it covers formal routes, browse search, interactive atlas ownership and Aquarium's single livestock entry.
- **Verification:** `npm run test:ui-smoke` passed against the production Preview. The smoke uses a deterministic local fixture and does not write cloud data.

- **Action:** Rechecked canonical local/remote SHA and the local 4317 preview; attempted a read-only public GitHub PR metadata query.
- **Verification:** `npm run project:status`, `npm run check:branch-convergence` and `curl -I http://127.0.0.1:4317/_preview/interactive` passed. GitHub API returned anonymous rate-limit protection, so no new remote check-run evidence was claimed.
- **Boundary:** No Supabase request, migration, RPC mutation, data write or Vercel deployment change.
- **Next:** Obtain authorized Vercel exact deployed SHA and Supabase schema/RLS inspection, then run release acceptance.

## 2026-08-26 — Compatibility evidence boundary migration

- **Action:** Selectively ported the reviewed-pair evidence boundary from `origin/main` history into the canonical branch. Pair decisions now call the compatibility engine with `scope: 'species_only'`; when both species have reviewed profiles but no reviewed pair rule, the result is explicitly `insufficient_data` instead of inferred recordable compatibility. Aggregate decisions still merge separate `scope: 'tank'` evaluations, so volume, equipment, temperature and bioload blocks cannot be lost; visual adapters consume the aggregate primary blocker.
- **Verification:** `test:compatibility-evidence-coverage`, `test:compatibility-coverage-scorecard`, `test:compatibility`, `test:compatibility-evidence`, `test:recommendation-authority`, `test:visual-results`, `lint` and `build` passed. Coverage includes a tiny/high-load tank regression and aggregate visual authority assertion. The scorecard reports 501 catalog species, 7 reviewed profiles, 4 reviewed pair rules, 12 priority directions and 2 recordable directions.
- **Boundary:** No SQL, API, Supabase, UI geometry or visual baseline change. Main-only evidence commits were not cherry-picked; current stage-risk evidence remains intact.
- **Next:** Expand reviewed evidence only with cited sources and update the compatibility coverage audit; cloud parity remains a separate external gate.

## 2026-08-26 — Human visual baseline confirmation

- **Decision:** User confirmed the current `http://127.0.0.1:4317/_preview/interactive` visual direction as the working baseline; this is not a final visual lock and future UI-owner changes require a new review.
- **Verification:** `project:status` reports canonical branch `codex/unified-rc-visual-v1`, clean worktree and SHA `91cc980c`; `check:branch-convergence`, `check:project-truth`, three-tier contract, compatibility (17/17), recommendation authority, tank-state (11/11), tank-evidence, water-change (8/8), API typecheck, lint, production build, Result UX head integrity, PR governance, taxonomy UI and full page runtime matrix (28/28) passed. Real Chromium loaded the 4317 route with HTTP 200, title `aquaguide` and no page errors.
- **Boundary:** No product UI, domain rule, API contract, database, Supabase environment or deployment was changed. Exact Preview SHA and Supabase schema/RLS parity remain pending.
- **Next:** Continue with authorized read-only Preview SHA/Supabase parity; re-run visual acceptance after any later UI change.

## 2026-08-26 — Preview/Supabase parity follow-up

- **Action:** Attempted only read-only cloud parity checks against the recorded Vercel branch Preview and available local deployment context.
- **Evidence:** The Preview returned `302 → Vercel SSO` without an exposed Git SHA. No authorized Supabase schema/RLS inspection surface was available; no Supabase request, migration, RPC mutation or data write was executed.
- **Decision:** Keep exact Preview SHA and Supabase schema/RLS parity as `pending`; do not infer parity from a redirect, environment names or the prior 31/31 PostgREST reachability result.
- **Next:** Obtain authorized Preview access exposing the deployed SHA, an authorized read-only Supabase schema/RLS inspection, then request human visual acceptance on 4317.

## 2026-08-26 — Remote CI evidence

- **Evidence:** GitHub read-only metadata confirmed PR #141 head `ffdcabd8411a8339ce09196f7310b96b33a4ce8a`; `RC Convergence V1` run `32915252842` and `Result UX Head Integrity V1` run `32915252831` passed. Vercel and Cloudflare status checks also passed.
- **Boundary:** Vercel did not expose the deployed Git SHA, so deployment success does not close exact Preview parity. Supabase schema/RLS and human visual acceptance remain pending.

## 2026-08-26 — Result UX workflow head integrity

- **Action:** Ported only the candidate-head verification concept from historical Result UX commits: the new workflow is configured to check out `${{ github.event.pull_request.head.sha || github.sha }}` and compare `git rev-parse HEAD` with the same expected SHA for PRs targeting `main`/`integration/aquaguide-rc1` and pushes to the canonical branch.
- **Verification:** `npm run test:result-ux-head-integrity` and `git diff --check` passed.
- **Boundary:** No product UI, domain rule, API contract, database, Supabase environment or visual baseline changed. Historical Result UX pages and workflow steps were not copied. Because this workflow is new on the feature branch, its remote PR run is pending until it is present on the PR base/default delivery path; local static verification is not a remote CI result.
- **Next:** Verify exact Vercel Preview SHA, authorized Supabase schema/RLS parity and human visual acceptance.

## 2026-08-25 — Recommendation authority and severity

- **Action:** Ported only RC recommendation authority semantics into `recommendation.service.ts`; removed free-text single-housing suppression and local hard-block overrides, reused reviewed group-size evidence, and made candidate reasons prefer `TankCompatibilityResult.summary`.
- **Verification:** `npm run test:recommendation-authority`; `npm run test:compatibility`; `npm run test:compatibility-evidence`; `npm run lint`; `npm run build`; `git diff --check`; and a read-only delayed render check against `http://127.0.0.1:4317/_preview/interactive` all passed. Build retained existing dynamic-import and large-chunk warnings only.
- **Commit:** `9fcad4a2`.
- **Boundary:** No UI geometry, SQL, API field, Supabase schema/RLS or deployed environment was changed. Compatibility evidence remains partial (501 species / 7 reviewed / approximately 1.4%).
- **Critic:** Independent six-dimension review passed with no blocking or required fixes. Optional follow-up: add an explicit canonical-blocked and `riskLevel` mapping assertion.
- **Next:** Vercel/API runtime contract review.

## 2026-08-25 — Vercel/API runtime contract

- **Action:** Ported only deployment-boundary semantics from RC #136–#138: V1 catch-all, API-before-SPA rewrite, standalone canonical Express runtime, ESM-safe imports and non-secret environment documentation. Excluded RC changes to LifeStage, database fields and business API semantics.
- **Verification:** `test:production-cloud-runtime-contract`, `test:production-cloud-runtime-smoke`, `check:api`, `test:business-api-contract`, `test:api-boundary`, `test:ai-capabilities`, `lint`, `build`, `check:project-truth` and `git diff --check` passed.
- **Boundary:** No Supabase read/write, migration, RLS, schema, deployed environment or visual baseline change. Independent Critic rechecked the health capability shape, AI aliases, fallback-key semantics and exact namespace-root rewrite; six dimensions passed. This is local runtime evidence only; exact deployed SHA and schema/RLS parity remain pending.
- **Next:** Result UX workflow head integrity review.

## 2026-08-25 — Branch convergence audit gate

## 2026-08-25 — Species Detail evidence authority

- **Action:** Ported only the RC evidence-authority semantics into the current Species Detail implementation. Added a pure adapter for ordered blocking/warning/missing/passed rules and review status; kept the current visual geometry and labeled `housingReason` as profile reference.
- **Verification:** `npm run lint`; evidence presentation assertions; compatibility 17/17; species knowledge; production build; `PREVIEW_URL=http://127.0.0.1:4317 node scripts/verify-species-detail-experience.mjs` all passed. The browser command required escalated Playwright permissions in this environment.
- **Evidence gap:** compatibility audit remains 501 species / 7 reviewed / 4 pair rules / 1.4% reviewed coverage; this migration does not claim full evidence completeness.
- **Critic follow-up:** rejected evidence was found displayable despite being non-authoritative. Excluded rejected rules from detail key reasons while retaining pending source status; added rejected-only and mixed-state assertions.
- **Next:** review Recommendation authority and severity.

- **Action:** Added `scripts/audit-branch-convergence.mjs`, `npm run audit:branch-convergence`, and `docs/03-development/BRANCH_CONVERGENCE_AUDIT.md`.
- **Evidence:** The read-only audit reported 149 canonical-only and 214 `origin/main`-only commits, plus 149 canonical-only and 742 RC1-only commits.
- **Decision:** Treat these as graph topology only; require capability-level review in `.ai/RC_MIGRATION_LEDGER.md` before any selective port.
- **Commit:** `98977966`.

## 2026-08-25 — Branch parity gate repair

- **Action:** Added local/remote SHA output and `npm run check:branch-convergence`; the canonical push workflow now fetches full refs and runs the blocking check.
- **Verification:** The check correctly fails locally while `HEAD=9c4d9500` is ahead of `origin/codex/unified-rc-visual-v1=589eb23c`; this prevents claiming GitHub parity before the push.
- **Ledger:** Advanced the next review unit from the completed P0 group to Species Detail evidence authority.
- **CI boundary:** The parity script uses `GITHUB_REF_NAME` for detached push checkouts and keeps the local Git branch name for workstation checks (`b39dbbd7`).

## 2026-08-25 — Canonical parity restored

- **Action:** Pushed `codex/unified-rc-visual-v1` through `6e71cb05`.
- **Verification:** Local and `origin/codex/unified-rc-visual-v1` both resolve to the same SHA; `project:status` and `check:branch-convergence` pass.
- **Evidence gap:** The current environment cannot reach the GitHub API, so the resulting Actions run has not been independently observed here.

## 2026-08-25 — Initialize `.ai/`

- **Read:** 项目 `PROGRESS.md`、`HANDOFF.md`、`PROJECT_STRUCTURE.md`、`40-DOCS/CHANGELOG.md`。
- **Action:** 创建 `CURRENT_GOAL.md`、`TASK_QUEUE.md`、`CHANGELOG_AI.md`、`EXECUTION_LOG.md`。
- **Verification:** 文件结构和当前目标均来自现有项目文档；未新增未经确认的产品事实。
- **Remote:** 未执行 `git push`，未触发 Vercel 部署。

## 2026-08-25 — Standardize AI project protocol

- **Read:** `.ai/CURRENT_GOAL.md`、`PROGRESS.md`、`HANDOFF.md`、`PROJECT_STRUCTURE.md`、`40-DOCS/CHANGELOG.md`。
- **Action:** 新增 `PRODUCT_CONTEXT.md`、`ARCHITECTURE.md`、`DECISION_LOG.md`、`BADCASES.md`、`docs/CONTEXT_ROUTING.md` 和根目录 `AI_PROJECT_PROTOCOL.md`。
- **Verification:** 新增内容均来自现有项目文档；协议明确要求编码前读取三个核心文件，变更后更新三个执行文件。
- **Remote:** 仅准备本地提交，不执行 `git push`，不触发 Vercel 部署。
- **Commit:** `de906c2`（仅文档；未推送）。
## 2026-08-25 — Progress unification started

- Created `codex/unified-rc-visual-v1` from `37a8d4d1` after user confirmed the 4317 interactive preview as the correct visual result.
- Recorded `integration/aquaguide-rc1@895f2f39` as a selective business reference only.
- Recorded PR #140 as deprecated because its RC-first partial UI migration regressed the approved visual result.
- Audited RC-only commits and grouped them into domain authority, recommendation, UI, interactive atlas, runtime/API, and workflow integrity categories.
- Closed PR #140 and opened Draft PR #141 against `integration/aquaguide-rc1`.
- Confirmed that P0 migration expands `LifeStage`, evidence data and planning semantics; paused code migration pending the required contract confirmation.
- Added local/CI checks that report canonical branch, SHA, approved visual baseline, RC business reference and Draft PR.

## 2026-08-25 — Daily local worktree aligned

- Switched `/Users/chuchu/Documents/New project/aquaguide_frontend` from legacy `codex/rc1-visual-integration` to `codex/unified-rc-visual-v1`.
- Verified local `HEAD` and `origin/codex/unified-rc-visual-v1` both resolve to `5b619a08`; `npm run project:status` reports `dirty: false`.
- The approved 4317 preview remains isolated on the user-approved visual baseline and was not changed.

## 2026-08-25 — Unified branch CI verified

- Added the canonical branch push trigger to `RC Convergence V1`, because a PR-only workflow not present on the default branch does not provide a usable gate for this Draft PR.
- GitHub Actions run `32846848569` passed: canonical-state check, lint, layout-mode contract, three-stage framing contract, and production build.

## 2026-08-25 — Open PR topology archived

- Queried 56 open GitHub PRs and recorded `.ai/OPEN_PR_REGISTRY.md`.
- Designated #141 as the only active convergence entry; the other 55 PRs remain traceable historical inputs and are not direct merge sources.
- No historical PR was closed or otherwise modified.

## 2026-08-25 — Unified cross-layer inventory and safe PR cleanup

- Added `docs/05-validation/MODULE_FACT_INVENTORY.md` and routed it from `docs/PROJECT_TRUTH.md`; the inventory links each module's product/UI, domain/Service, data/API, evidence and deployment state.
- Closed the 55 historical PRs from the original open-PR snapshot with a traceability comment; retained all branches and left #141 as the only open convergence PR.
- Recorded the result in `docs/03-development/PR_CLEANUP_RECORD.md` and updated the task queue, handoff and changelog.
- No SQL, Supabase, API, page component, CSS or remote branch deletion was performed.

## 2026-08-25 — Independent review fixes for governance implementation

- Critic found that the first governance script checked only document strings, that `.ai` registry/ledger edits did not trigger CI, and that Care/Identification/Text AI were combined into one ambiguous status row.
- Added a read-only GitHub API check requiring exactly open PR #141 with the canonical head/base and expected SHA in CI; local runs explicitly skip only when no token is available.
- Added `pull-requests: read` permission and `.ai/OPEN_PR_REGISTRY.md`, `.ai/RC_MIGRATION_LEDGER.md`, `.ai/TASK_QUEUE.md` workflow paths.
- Split the module inventory into Care, Identification/health triage and Text AI rows to match the canonical Feature Catalog.
- Critic rechecked the same diff and passed all six dimensions; GitHub Actions `32853545889` passed the real read-only PR topology API check on `642b007b`.

## 2026-08-25 — Supabase deployment status corrected

- The user confirmed that the existing Supabase work had already been deployed.
- Corrected the status distinction: deployed Supabase is a user-confirmed fact; re-validating the exact connected environment, schema revision and RLS behavior from the unified branch remains a separate verification task.

## 2026-08-25 — Truth consolidation phase 1 started

- Added canonical project, product, visual and deployment documentation routes.
- Reclassified the dated current-product snapshot as historical evidence; no product code, Supabase configuration or accepted visual baseline changed.

## 2026-08-25 — Truth consolidation phase 2 started

- Added a historical-evidence registry and supersession headers for legacy progress, Handoff, UI audit and cloud-planning records.
- No historical file was deleted; the change makes their evidence role explicit.

## 2026-08-25 — Truth consolidation phase 3 started

- Added `docs/05-validation/VISUAL_ACCEPTANCE_MATRIX.md` to connect the user-confirmed 4317 UI baseline to regression commands, routes and human-review status.
- Verified the local baseline: layout 6/6, framing, UI governance, interactive scenes, persistent detail rail, and page runtime matrix 28/28 all passed.

## 2026-08-25 — Truth consolidation phase 4 started

- Added `FEATURE_CATALOG.md` as the single module-status inventory and removed the duplicate capability table from Product Truth.

## 2026-08-25 — Truth consolidation phase 5 audited

- Verified non-secret evidence: 18 tracked migrations, the 31-table three-tier contract test, configured Vercel Production Supabase/Postgres variable names, and a Ready unified-branch Preview.
- Recorded exact deployed schema/RLS/SHA parity as an authorized read-only verification still required; no redeploy or configuration change was attempted.

## 2026-08-25 — Truth consolidation phase 6 started

- Added PR evidence template, delivery protocol and a deterministic project-truth verifier.
- Read the RC branch-protection API: the branch is not protected. Recorded the safe prerequisite rather than enabling a check that could block all PRs before it is runnable from the base branch.

## 2026-08-25 — Truth consolidation phase 7 contract drafted

- Read the RC domain-rule and evidence source; created a `PROPOSED` contract with exact types, no SQL/API/persistence change and explicit UI exclusions.
- No P0 product code was migrated. User approval is required before this contract changes implementation or `CONTRACT.md`.

## 2026-08-25 — Truth consolidation phase 8 gate established

- Added `RELEASE_READINESS.md`; the unified line is intentionally `NOT_READY` until exact deployment parity, authorized Supabase parity, P0 contract implementation and a separate release acceptance are complete.

## 2026-08-25 — Accepted P0 compatibility authority migration

- **Approval:** 用户明确批准 `docs/decisions/P0_COMPATIBILITY_CONTRACT.md`。
- **Action:** 迁入本地 `CompatibilityLifeStage` 输入、审核阶段风险证据、纯 tank-state / water-change / bioload 规则和从既有鱼缸、诊断事实派生的服务；共享 `LifeStage` 保持 API/数据库原枚举，未导入 RC 页面、CSS、API、迁移、RLS 或写入逻辑。
- **Verification:** `lint`、兼容性 16/16、tank-state 11/11、water-change 8/8、three-tier contract、production build 通过；4320 临时 build preview 的 layout、framing、interactive scenes、page runtime matrix 通过。
- **Remote:** 尚未推送本次产品代码；`main` 未修改，发布仍受 Supabase parity 和单独 release acceptance 阻断。
- **Independent review:** Critic initially found incomplete structured diagnosis mapping, a legacy bioload threshold regression, a shared lifecycle/API boundary leak, and free-text false positives. The builder restored the legacy multiplier, isolated `CompatibilityLifeStage`, mapped current structured question fields, excluded free text, and added regressions; the same Critic recheck passed.

## 2026-08-25 — Read-only Supabase and Preview parity attempt

- **Read:** `DEPLOYMENT_STATE.md`, `RELEASE_READINESS.md`, `CONTRACT.md`, `test-three-tier-contract`, current canonical branch and Vercel project metadata.
- **Action:** Pulled production environment names through the existing Vercel authorization into a temporary 600-permission file; queried Supabase PostgREST with the anon key using GET only. No migration, RPC mutation, INSERT, UPDATE, DELETE or RLS change was executed.
- **Verification:** 31/31 contract tables returned HTTP 200; latest aquarium, livestock batch, care-action, recurring-event, compatibility-evidence and care-reference columns returned HTTP 200. `npm run check:project-truth`, `npm run project:status` and `npm run test:three-tier-contract` passed.
- **Evidence gap:** Vercel masks PostgreSQL connection strings and the anon REST surface does not expose migration history or policy metadata, so exact schema revision/direct RLS policy verification remains pending. The latest Ready branch Preview is timing-correlated with `187d16ba` but its exact Git SHA was not returned by Vercel metadata.
- **Human review:** 4317 preview rendered at 523×812 with complete DOM, images and WebGL canvas; no application errors. User visual acceptance remains pending.

## 2026-08-25 — Visual baseline remains usable, not final

- **User decision:** The current 4317 version is usable as the working visual baseline, while additional visual issues remain for later incremental work.
- **Action:** Recorded D-AQUA-005 and clarified the Visual Baseline; no product code or UI geometry changed.
- **Constraint:** Future visual work must be module-scoped, preserve formal component/surface semantics, and rerun only the affected viewport matrix before acceptance.

## 2026-08-26 — Vercel deployment lag identified (read-only)

- **Read:** canonical branch status, branch convergence audit, Vercel project metadata and latest deployment list.
- **Verification:** local and GitHub canonical SHA are both `43f75e739655e8061fb880ed3415b741a90275c1`; `vercel ls aquaguide --json` identified the newest Ready deployment on `codex/unified-rc-visual-v1` as `aquaguide-uwfft41zv-chusday97s-projects.vercel.app` with `githubCommitSha=6b0e629d8b6694a06b98182a38da01d34718c44f`.
- **Conclusion:** Preview is verifiably behind the canonical branch; exact Preview SHA parity remains pending. No redeploy, migration, RPC mutation, configuration change or data write was executed.
- **Follow-up:** Pushed the evidence commit and rechecked `vercel ls aquaguide --json`; no deployment for the new canonical head appeared, so the lag is still active and must be resolved through the Git-connected Vercel deployment path.
- **Quota blocker:** The Git-connected Preview API request for the current head was rejected with `api-deployments-free-per-day` (Hobby daily limit exceeded). No deployment was created; retry is deferred until the quota resets.

## 2026-08-26 — Automated Preview SHA parity gate

- **Action:** Added `scripts/check-preview-parity.mjs` and `npm run check:preview-parity`.
- **Verification:** The gate reports local SHA = remote SHA, but the latest canonical-branch Vercel deployment is `6b0e629d…`; status is `NOT_SYNCHRONIZED` and the command exits non-zero.
- **Safety:** The check is read-only and does not trigger Vercel, Supabase, configuration, or data changes.
