# AI Execution Log

## 2026-09-12 — Public SEO continuation

- 读取 Git 状态、最近提交与现有 authority，确认分支为 `codex/species-seo-preview-v1`，HEAD 为 `5c435f65`。
- 内置浏览器多页面三档回归证据已提交；系统 Chrome 与独立 Critic 仍保持阻塞状态。
- 校准公开 SEO authority 文件；未触碰三个用户未提交文件。
- 下一步：等待可读 Critic 输出后做当前 SHA 只读复验，Figma 配额恢复后集中补 Canonical 模板。

## 2026-09-12 — Species authority audit

- 使用 FishBase、UF/IFAS 和 USGS NAS 复核当前宝莲灯与极火虾公开表达；只记录来源支持范围，不扩写页面事实。
- 结论：现有中层活动、群游、取食蠕虫和小型甲壳类、底部叶屑/生物膜刮食表达均有直接支持；证据 `EVD-20260912-010`。

## 2026-09-08 — Action contract browser gate alignment

- Updated only regression scripts: browse-mode filter URL, current add-species task title/search selection, current species-detail safe states, and temperature mismatch presentation.
- Authorized evidence: lint, API typecheck, build, task routes, UI action contract, onboarding goals, task entry, product actions, task actions, species detail, Compatibility and 435-pair launch matrix all pass.
- No Domain, Catalog, Supabase, production or visual-owner files changed; action branch remains unpushed.

## 2026-09-08 — GP-002 compatibility route correction

- Remote Product Golden Path exposed a stale assertion for the retired embedded compatibility drawer. The detail surface now always exposes the explicit compatibility action after risk disclosure, and GP-002 verifies the independent `/compatibility` page before continuing quantity/recording steps.
- Local GP-002, lint and production build pass; the PR requires a new head check after this fix.

## 2026-08-30 — Readiness candidate synchronized

- Pushed the clean candidate `3e1dca89` once to `codex/main-core-foundation-v1`; remote branch and PR #142 now report the same head.
- Vercel and Cloudflare Preview deployments for the candidate are ready; foundation checks passed and Product Golden Path remains pending on the final browser paths.
- No production branch setting, Supabase production SQL, Catalog publication or `main` merge was changed.

## 2026-08-28 — Local convergence rehearsal after Vercel deferral

- Added `check:compatibility-authority` and kept legacy compatibility imports explicitly allowlisted as a facade boundary; Domain Rules remains the final status/policy/version source.
- Updated current Catalog checksum/parity facts and created the production Catalog migration authorization package. No production SQL, Catalog publication, business-data write or main merge was executed.
- Re-ran local gates: Catalog build/validate, Domain/Service/API, compatibility evidence, core flow, core UI, formal scenes, today action, species detail, responsive routes/detail surface, Supabase 26+1 reset, pgTAP 19/19, schema lint, lint, API typecheck, build, project truth, UI freeze and diff check. All passed.
- Corrected only stale browser assertions: 600px follows the 768px phone breakpoint; formal compatibility uses `/encyclopedia?mode=compatibility`; AI Tank Copilot emits the existing feature-preview event; evidence disclosure is checked through `aria-expanded`.
- Remaining: independent Critic re-review, one consolidated GitHub push, and Preview parity for the new head. Vercel remains external and rate-limited.

## 2026-08-28 — Candidate push completed

- Independent Critic re-review passed; the consolidated candidate was pushed once. `npm run project:status` now confirms local, remote branch and PR #142 SHA parity.
- GitHub foundation/validate checks are still settling and AquaGuide Vercel is deploying; `admin-content` remains an unrelated rate-limit failure. Preview exact SHA is not yet accepted.

## 2026-08-28 — Candidate head and admin-content isolation

- Candidate `codex/main-core-foundation-v1`, remote branch and PR #142 are synchronized at `df3c4e11`; `main` remains unchanged and PR #142 remains Draft.
- Exact Preview parity was verified at preceding code head `55a37745`; the latest docs-only head is `UNVERIFIED` because Vercel build quota is exhausted.
- Vercel `admin-content` was configured to use repository-root auto detection and build only on `feature/admin-content-v0`; its new PR status is currently rate-limited for 24 hours, so release readiness remains blocked by an external gate.
- No production Supabase migration, Catalog publication or main merge was executed.

## 2026-08-28 — Local Supabase replay and RLS verification

- Started Docker Desktop and initialized the repository-local Supabase CLI configuration with production-compatible legacy grants for the existing 26-migration history.
- Replayed the first 26 migrations from an empty local database. Normalized hashes for columns, constraints, functions, indexes, policies, table grants and triggers exactly matched the read-only production baseline.
- Hardened the proposed Catalog migration with explicit Data API grants/revokes and moved legacy non-pgTAP SQL fixtures out of `supabase/tests/`.
- Added a 19-assertion transaction-isolated Catalog/RLS pgTAP suite. Full 27-migration replay, schema lint, Catalog contract/snapshot validation, domain/API/repository tests and UI freeze checks pass locally.
- Local anonymous REST read returned 200 for published Catalog data; anonymous write returned 401/`42501`. No production migration, Catalog publication, business-data write, GitHub push, PR update or main merge occurred.
- Local verification/configuration commit: `b9903924` (not pushed).
- Production read-only recheck confirmed 26 migration versions, 35/35 RLS tables, 89 policies, 56 foreign keys and 86 indexes; 33 trigger objects appear as 35 information_schema event rows because one trigger covers multiple events. Catalog objects remain absent and no production write was attempted.
- Pushed the consolidated candidate once after the recheck: local/remote/PR #142 SHA `ad858032`; `npm run check:preview-parity` passed with Vercel deployment `6133389265`. Product Golden Path validation is still in progress.
- Fixed the parity gate false negative by adding a read-only Vercel CLI metadata fallback; the fix is committed as `75dafff3` and has been pushed. The previous `ad858032` Preview record is historical; the new candidate deployment SHA is pending one final read.
- Final read-only parity: local, remote branch, PR #142 and Vercel Preview all match `1a3d366bd8432eadf20442274ba06dfd90904a98`; `npm run check:preview-parity` returned `EQUIVALENT`, and Product Golden Path validate completed successfully. Production migration/catalog publication/main merge remain separately unauthorized.

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

## 2026-08-27 — Viewport regression fix

- Independent visual review caught a real narrow-screen regression: the candidate had replaced the shared viewport contract with UA detection, causing a 390px desktop sidebar and overlapping scene controls.
- Restored `lib/layout-mode.ts` and `LayoutModeProvider` to the 768px viewport contract, updated the stale UA-oriented gate, and verified 390px now renders the phone toolbar/bottom navigation while 600/1280 retain their intended modes.

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
# 2026-08-30 — Readiness evidence center

- Added `scripts/readiness-collect.mjs`, `scripts/readiness-serve.mjs` and `scripts/test-readiness-evidence.mjs`.
- Added npm commands `readiness:collect`, `readiness:serve` and `test:readiness`.
- Verified report generation at candidate SHA `6d202f9c26581f1e19e70a50b557996fc36ae51e`; 11 local gates PASS, production freeze BLOCKED, 5 remote/environment gates UNVERIFIED, UI freeze USER_ACCEPTANCE_REQUIRED.
- Sandbox `tsx` IPC `EPERM` and GitHub DNS failure are preserved as evidence limitations, not classified as business failures.
## 2026-09-12 Species UX 收口

- 动作：读取 Species 长截图，修复生活习性稀疏网格，重载极火虾/宝莲灯/黄金米虾页面复核。
- 结果：页面可滚动；两张生活卡按两列收拢；宝莲灯图片保持 fail-closed 回退；黄金米虾继承基础物种生活习性。
- 验证：结构、响应式、文案、Editorial、Evidence、lint、build、diff-check 通过；记录 `EVD-20260912-018`。
- 未完成：系统 Chrome 三档、性能/reduced-motion、Figma Canonical、可读独立 Critic。

## 2026-09-12 宝莲灯素材预览复核

- 动作：打开本地 `assetPreview=1` 宝莲灯路由并导出完整页面截图；对照普通公开路由的回退状态。
- 结果：项目内图片可实际显示，主体和构图正常；普通公开页因 Hero/品系卡 binding 为 `blocked` 继续回退。
- 结论：问题属于人工用途级确认缺口，不是图片文件缺失或路由加载故障；未修改 Published 聚合或索引策略。
- 证据：`EVD-20260912-020`。

## 2026-09-12 公开来源展示去重

- 动作：检查 Species 长截图与来源聚合，确认重复项来自不同证据绑定而非不同公开来源。
- 修复：公开聚合按来源标题、发布方和链接去重；证据绑定仍按 source ID 保留。
- 验证：Public Contract、Editorial、Evidence、Copy、lint、build、diff-check通过。
- 提交：`90a53625`。

## 2026-09-12 来源区运行时复核

- 动作：重新打开 Species 本地页面并导出完整截图，检查来源展示。
- 结果：重复 AquaGuide 目录记录已消失，专业来源与品系归组来源仍显示。
- 限制：仅覆盖当前 Chrome 桌面视口；三档自动化、性能和独立 Critic仍未完成。
