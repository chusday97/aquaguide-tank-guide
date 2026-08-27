# AI Execution Log

## 2026-08-25 — Initialize `.ai/`

## 2026-08-27 — Main convergence candidate

## 2026-08-27 — Visual recovery started

- Confirmed a real visual regression: the main-based candidate had removed `/_preview/interactive`, the canonical stage/detail styles, and 919 lines of baseline index styles.
- Created local recovery branch `codex/main-visual-recovery-v1` from the candidate without changing Domain, Catalog, Service, API or Supabase files.
- Restored the interactive preview route, preview-only scene components, canonical stage/detail styles and interactive scene styles. Adapted only removed prop signatures to the current `ResilientImage` and `ThreeAquarium` APIs.
- Verification: `npm run lint` and `npm run build` pass; the preview build contains the restored `InteractivePreview` chunk. Fixed-viewport browser review is still pending because the local browser policy blocked localhost inspection.
- Remote: not pushed; PR #142 remains unchanged and not release-ready.

## 2026-08-27 — Unified plan execution started

## 2026-08-27 — Final unified line and Supabase audit

## 2026-08-27 — Stage 2 visual recovery on the canonical candidate

- Restored the shared desktop `detail-rail` and mobile bounded `bottom-sheet` contract without reintroducing the legacy `right-drawer` assertions.
- Added transparent loading/failure surfaces to `ResilientImage` and enabled them for formal Encyclopedia and Care scene assets; failures no longer paint opaque white placeholders over the immersive stage.
- Restored the creature-first Collection hub from the approved visual baseline and removed Aquarium follow-up cards outside the single immersive stage. No Domain, Catalog or Supabase files were changed.
- Updated responsive/formal/collection browser gates to assert the current visual contract. Lint, build, responsive surface, formal scenes, today action, collection hub, aquarium layout and framing checks pass on the local candidate.
- Candidate changes are local only; Preview SHA parity, fixed screenshots, independent review, Supabase reconciliation and main merge remain pending.

## 2026-08-27 — Preview identity and fixed-viewport evidence

- Replaced the stale 4317 candidate listener with a detached `37a8d4d1` baseline worktree and started the candidate on the planned 4319 port.
- Captured both sets at 390×844, 600×900 and 1280×900 for `/_preview/interactive`, Aquarium, Encyclopedia, Care and Collection under `zh-CN`; local artifacts are in `/private/tmp/aquaguide-visual-matrix/`.
- Formal scene verification now checks the candidate branch and exact checked-out SHA exposed by preview metadata before route interaction tests.
- Production migration, Catalog publication, remote push and main merge remain blocked by their separate authorization/acceptance gates.

## 2026-08-27 — Independent Critic fixes

- Critic found that Aquarium `archive`/`discovery` props were accepted but not rendered, so the `aquarium-learn-zone`, Archive and Daily Discovery deep links were restored as one learn zone below the immersive stage.
- Normalized both legacy database enum spellings (`Freshwater`/`Saltwater`) and Catalog spellings (`freshwater`/`saltwater`) before server-side Domain evaluation; added direct regression assertions.
- Expanded formal scene structural checks to 600px and 1280px, restored Collection wishlist/care route checks, and removed trailing blank lines from the eight restored production migrations.
- Rebuilt the candidate and reran lint, API typecheck, build, API semantics and diff-check; remote candidate and PR remain stale until the reviewed local head is pushed.

- **Action:** 将唯一工作线校正为 `codex/main-core-foundation-v1@5b419e98`；4317 固定视觉基线，4319 作为候选预览；恢复分支降级为历史证据。
- **Read-only evidence:** Supabase project `AquaGuide` 为 `ACTIVE_HEALTHY`；生产有 26 个 migration、35 张启用 RLS 的 public 表、89 条 policy。
- **Finding:** 生产缺少候选 Catalog migration (`catalog_releases`、`species.water_type`)，候选缺少 8 个生产 migration，并存在 memorial migration 版本命名漂移；状态为 `MIGRATION_REQUIRED + MIGRATION_HISTORY_CONFLICT`。
- **Safety:** 未执行 migration、Catalog 上传、RPC mutation、业务数据写入或 `main` 合并。

- Corrected canonical status to distinguish the active recovery worktree from the PR #142 release candidate.
- Marked formal Encyclopedia and Care scene entry as `PARTIAL_WITH_FALLBACK`; preview-only scene components are not treated as restored product routes.
- Updated project-truth verification to require both active worktree and release-candidate metadata.

- Created `codex/main-core-foundation-v1` from `origin/main@ed0cf380`.
- Migrated only accepted P0 compatibility capabilities from `99865414` and `c822bd0e`; resolved the main Dialog prop mismatch with commit `5b0c8ea7`.
- Verification: `npm run lint` PASS and `npm run test:compatibility` PASS (19 assertions).
- Not done: catalog release snapshot, Supabase parity, visual baseline migration, release PR.

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
