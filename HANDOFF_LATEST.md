# AquaGuide Handoff — Latest

## 2026-08-31 并行首发审核结果

- 三个子任务已完成各自10种批次并提交，主线程已聚合为30种/300条字段记录。
- 当前统计：84条 `supported`，216条 `reviewed + unknown`；unknown 不覆盖运行时 Profile。
- `test:catalog-review-batches`、`lint`、`catalog:build`、`catalog:validate` 已通过；来源页面仍需网络恢复后复核，未申请生产发布。

Critic 初审提出的引用归属和 `baseSpeciesKey` 一致性问题已在 `55b50b42` 修复；复验待完成。当前统计仍是机器审核结构完成，不等于来源内容已逐页确认。

`66b90d43` 已把运行时覆盖进一步收紧为“字段支持 + 引用来源内容已核实”；当前 `catalogContentVerifiedSourceIds` 为空，任何暂支持字段都不会进入运行时。三个核实子任务正在各自批次文件中工作。

## 2026-08-30 字段级审核管道已落地（当前）

## 2026-08-31 专业来源候选已登记（当前）

- 分支：`codex/catalog-cohort-30-v1`，当前 HEAD 以 `git rev-parse HEAD` 为准；本地工作树干净，未推送。
- 新增 `src/data/catalogReviewSourceCandidates.ts`，为第一批10种物种登记 FishBase 来源候选；来源全部是 `draft`，不是审核事实。
- `catalog-research` 已接入候选来源，生成研究草稿时会保留来源标题、发布者和 URL；`fieldReviews[].citationIds` 仍为空，不能升级为运行时数据。
- 验证：`npm run test:catalog-review`、第一批 `catalog:research`、`catalog:review` 均通过；第一批报告为 `reviewedCount=0`、`reviewedFieldCount=0`、`pendingCount=10`。
- `3bb38297` 进一步锁定来源候选 ID 集合必须与第一批 cohort 完全一致；工作树仍干净、尚未推送。
- 下一步：逐页核对专业来源实际支持哪些字段，填写字段值、citationIds、冲突说明和审核状态；无法确认的字段保持 `unknown`。用户只需最后看整批混养判断，不参与逐字段审核。

- 历史节点 `2b7c34d9` 记录字段审核管道落地；当前 HEAD、提交数和工作树状态以本交接顶部的运行时说明及 Git 命令为准。
- 本步新增 `src/data/catalogFieldReviews.ts`、`scripts/test-catalog-review-contract.ts`，并扩展 `catalog:research` / `catalog:review` / Catalog snapshot 生成链路。
- 三批研究草稿每个物种包含 10 个字段（身份、水体、温度、pH、成体体型、缸体、社会行为、领地、捕食、繁殖），全部为 Draft、无引用；机器校验为 `0/30 reviewed`、`300` 个字段待审核。
- 运行证据：`test:catalog-review`、`catalog:build`、`catalog:validate`、`lint`、`check:project-truth`、首发队列/435 组合矩阵、Catalog snapshot、compatibility authority 均通过；Catalog 保持 486 条，checksum `6a676e5587e77498c74fa99b79db9d0c7840383d3522543acd628bdbb8d0673b`。
- 安全边界：批准记录数组目前为空；只有 `status=reviewed` 且存在 citationIds 的字段才会覆盖 Profile。研究草稿不会进入运行时事实，也不会改写 `fishData.ts`、数据库或生产 Supabase。
- Critic 首轮发现的两个阻塞已在 `62539910` 修复：审核脚本要求 citationId 指向同一物种的已审核 source，并拒绝无效 reviewed 值；领地、捕食和繁殖字段会保留到 Profile 的 `factEvidence`，避免审核通过后静默丢弃。新增测试覆盖无效引用、无效行为值、全字段 reviewed 正例、重复字段和行为字段 overlay；同一 Critic 已按六维复验通过。该阶段仍不是 30 种已审核结果，当前为 `0/30 reviewed`。
- 已知阻塞：`check:ui-freeze` 仍针对旧 provisional `02457dd2` 报告历史视觉 Owner 差异；这是既有视觉基线问题，不是本次数据提交造成。UI 需后续短分支处理，当前本地预览/生产均未改动。
- 下一步：由内容审核人员补齐每个字段的可靠来源、冲突说明和审核状态；完成后由同一 Critic 复验，再由用户一次性确认整批资料。未完成前不要发布 Catalog、执行第27个 migration 或推送 GitHub。

## 2026-08-30 30种资料审计启动（当前）

- 短分支：`codex/catalog-cohort-30-v1`，基于最新 `main@016dbca5`，当前仅本地存在。
- `npm run catalog:audit` 已运行：486条记录、458个唯一中文名、437个唯一学名；`VERIFIED=0`、`PARTIAL=58`、`TEMPLATE_DERIVED=348`、`CONFLICT=33`、`AMBIGUOUS=47`；484条缺显式水体，427条引用搜索页。
- `npm run catalog:research -- --batch 10` 已生成3批研究草稿，共30种；`catalog:review` 返回 `reviewedCount=0`、`pendingCount=30`，未进入运行时 Catalog。
- 当前结论：资料审核是内容证据阻塞，不是脚本阻塞；不能用现有模板或搜索页自动提升为 Approved。
- 下一步：先实现字段级审核记录和批次校验，再填充来源、冲突和审核状态；用户只需在整批审核包完成后一次确认。

## 当前边界

- `main` 是唯一代码事实来源；`release/production@ed0cf380` 是唯一生产回退指针。
- 本阶段不修改 UI、Supabase 生产、Catalog 发布或 GitHub 远端。
- 30 种资料只有在字段级来源审核完成后，才能进入正式 Catalog；现有 7 个运行时 reviewed profile 也要重新审核，不能直接当作 30 种完成。

## 2026-08-30 main 收敛完成（当前）

- PR #142 已以普通 merge commit `2d0b4cfe5416e706edb6dcf195dc9597d0c94ae6` 合入 `main`；候选 `b87ae5d6` 已验证为 `main` 祖先。
- 稳定工作树为 `/Users/chuchu/Documents/New project/aquaguide-main-stable`，本地 `main` 与 `origin/main` 同步且干净。
- 生产继续冻结在 `release/production@ed0cf380`；未执行 Supabase 第27个 migration、Catalog 发布或正式生产部署。
- 下一步从 `main` 创建短分支，先做首批30种资料闭环，再做 UI 视觉闭环；不再回到候选分支开发。

更新时间：2026-08-30 +08:00

## 2026-08-30 可验证进度中心（当前）

- `c63cb2dd` 已完成 Vercel-only 生产渠道状态收敛和候选同步：Vercel=`ACTIVE_FROZEN`，Cloudflare=`INACTIVE_LEGACY`；`project:status` 现在按活动渠道计算 `productionDeploymentFrozen=true`。
- `npm run readiness:collect` 已在授权环境完成（19 PASS、1 UNVERIFIED、1 USER_ACCEPTANCE_REQUIRED），报告绑定完整 SHA `c63cb2dd138a379ec75a5bc867113ce86f9462a9`。PR #142 已读回为 `OPEN/Draft/CLEAN/MERGEABLE`；UI仍待人工验收，Supabase生产migration/Catalog/main合并仍未执行。
- 用户已明确选择 Vercel 作为 AquaGuide 唯一正式生产渠道；Cloudflare 的历史 Worker/Pages 资源登记为 `INACTIVE_LEGACY`，保留但不修改，也不再参与生产冻结计算。
- 已更新生产提供方状态模型：Vercel 为 `ACTIVE_FROZEN`（分支 `release/production`，生产 SHA `ed0cf380...`），Cloudflare 为 `INACTIVE_LEGACY`。外部 GitHub/Preview/Supabase 门禁仍按当前网络和权限证据显示。

- 新增只读证据采集：`npm run readiness:collect`；新增本地看板：`npm run readiness:serve`，默认地址为 [http://127.0.0.1:4320](http://127.0.0.1:4320)。
- 看板将 Main 代码收敛和生产发布分开，并为每条门禁记录当前 SHA、命令、预期/实际结果、来源和时间；固定业务案例也单独列出。
- 当前候选 SHA 和报告数量以 `npm run project:status`、`npm run readiness:collect` 运行时输出为准。工作树有未提交变更时，项目事实显示 `BLOCKED`、本地门禁显示 `UNVERIFIED`；提交后必须重新采集，才能显示绑定当前 SHA 的 PASS。GitHub/Preview 网络不可用时也必须保持 `UNVERIFIED`。
- 4319 乱码/视觉差异仍是 UI 发布问题，不影响底层进度中心收集；不得把底层 PASS 解读为 UI 已验收。
- 运行验证：`npm run test:readiness` 通过。沙箱中部分 `tsx` 测试遇到临时 IPC `EPERM`，看板已按环境证据降级为 `UNVERIFIED`，需在授权运行环境重跑作为最终门禁。
- `e3316997` 已提交；独立 Critic 同线程复验通过。当前授权运行的最新报告绑定候选 `fb6db2a2`，为 18 PASS、1 BLOCKED（生产未冻结）、1 UNVERIFIED（生产 Supabase 未写入验证）、1 USER_ACCEPTANCE_REQUIRED（视觉基线）。
- 候选当前提交、远端候选、PR #142、Vercel Preview 和 CI 的精确关系以运行时报告为准；Vercel Production Branch 已切换到 `release/production`，设置页与 API 均读回成功，正式部署仍保持旧生产 SHA `ed0cf38025652db901ee81aa697ca55b1c1584b6`。
- Cloudflare 已根据用户决定登记为 `INACTIVE_LEGACY`：AquaGuide 正式生产只使用 Vercel，历史 Worker/Pages 资源保留且不修改，不再参与生产冻结计算。
- 下一步：申请 PR #142 合并授权；合并前保持 UI、生产 Catalog 和 Supabase migration 门禁不变。

## 2026-08-30 正式预览入口收敛（当前）

- 代码基线：`codex/main-core-foundation-v1`；当前候选 SHA 由 `git rev-parse HEAD` 读取。
- 4319 的 `/_preview/interactive?module=aquarium|encyclopedia|care|collection` 已改为正式路由演示入口：初始化隔离 demo seed、跳过 onboarding、进入真实 App Shell，并强制 local Repository。
- 浏览器已验证四个模块：正式 Aquarium 不再跳 `/welcome`；图鉴、养护和水族册均使用正式路由；没有 `/api` 请求或页面错误；元数据显示当前构建完整 SHA。
- 本地门禁已通过：lint、API 类型、build、formal scenes、core UI、responsive routes、project truth、compatibility authority。
- 当前未完成：本轮候选改动待本地审查后一次性同步；用户视觉验收、新 UI Freeze、Supabase 第27个 migration、Catalog 发布和 `main` 合并。Vercel生产冻结已完成，Cloudflare不再是AquaGuide生产门禁。
- 唯一预览入口：[http://127.0.0.1:4319/_preview/interactive?module=aquarium](http://127.0.0.1:4319/_preview/interactive?module=aquarium)。4317 仅作视觉母版对照。

## 2026-08-30 当前验证快照

- 当前候选分支：`codex/main-core-foundation-v1`；本地、远端候选、PR #142 与 Vercel Preview 已同步到 `fb6db2a2`，精确值由 `npm run project:status` 和 `npm run readiness:collect` 运行时读取。
- 本地门禁：Catalog 486 条校验、Domain/Service/Presentation、435 组合矩阵、26+1 Supabase 重放、pgTAP 19/19、Schema lint 0 error、lint、API 类型、build、核心体验、正式场景、今日行动和响应式路由均通过。
- 本轮修复：Care 来源链接满足 44×44px 触控区域；核心浏览器断言兼容正式“混养风险计算”标题；未改数据库、Domain 规则或生产设置。
- 历史记录（合并前）：用户视觉验收后才能替换旧 UI Freeze；候选尚未同步到远端，PR #142尚未合并。Supabase第27个 migration、Catalog发布和最终release acceptance仍未执行。
- 后续顺序：重新采集readiness → 单独授权候选推送 → 单独授权PR #142合入 `main` → 从 `main` 完成30种审核和生产 migration/Catalog授权 → 最终release acceptance。

## 2026-08-30 快速收敛路线（当前）

- 代码事实目标已切换为 `main`；当前候选 `codex/main-core-foundation-v1` 的同步状态与精确 SHA 由 `npm run project:status` 运行时读取。
- 生产部署锚点已只读确认：Vercel 生产 SHA 为 `ed0cf38025652db901ee81aa697ca55b1c1584b6`；本地 `release/production` 已指向同一 SHA，仅作为部署/回退指针。Vercel Production Branch 已读回为 `release/production`。
- 远端 `release/production` 已建立并指向 `ed0cf38025652db901ee81aa697ca55b1c1584b6`，未强推；Vercel Production Branch已读回为 `release/production`，生产冻结按Vercel唯一活动渠道计算完成。
- Cloudflare按用户决定退出AquaGuide正式生产，Worker/Pages资源仅保留历史证据；不再要求读取其分支设置，也不把截图中的 `ice-glide`当作AquaGuide发布目标。
- 合并 `main` 后仍保持 `NOT_READY`：视觉新基线、30 种资料、Supabase 第27个 migration、Catalog 发布和最终 Preview 只作为生产门禁。
- 本轮已更新状态模型、浏览器验证和部署说明；生产设置、Supabase、Catalog 和 `main` 均未修改。候选推送与远端检查状态以运行时门禁为准。
- `npm run project:status` 现在会动态输出 `productionPointerSha`、`productionPointerSynchronized`、`productionDeploymentFrozen` 和 `productionProviders`；当前回退锚点已对齐，Vercel为活动冻结渠道，Cloudflare为历史渠道。

## 2026-08-29 4317 严格视觉恢复（当前工作）

- 当前分支：`codex/main-core-foundation-v1`；当前本地 HEAD、远端候选和 PR 状态以 `git rev-parse HEAD` 与项目门禁运行时读取。
- 4317：detached `37a8d4d1` 视觉母版；4319：当前候选 production preview。
- 已完成：预览 Aquarium 高度恢复为 4317 的 `72dvh/720px`；图鉴/养护场景恢复 500/520px；正式核心页面移除额外 workspace 内边距；字体栈恢复为母版显式 fallback。
- 保留：候选现有 Domain、Service、Repository、Catalog、API 和模块切换预览；未复制旧页面业务逻辑，未修改数据库或公共接口。
- 验证：build、桌面布局、Aquarium stage、Three framing、project truth 和兼容权威门禁通过；4319 HTTP 200，页面显示分支、完整 SHA、seed 和构建时间，且元数据与本地 HEAD 一致。
- 当前卡点：完整矩阵已生成，但 `check:ui-freeze` 仍会报告候选已有视觉 Owner 变化，不能据此宣称通过；用户人工验收尚未完成。
- 下一步：用户先确认四模块截图与正式路由差异；确认后更新 UI Freeze，提交 Critic 复验，再一次性同步 PR #142。最近一次测试修正仅触及回归断言，不改变 UI。
- 禁止重踩：不要直接替换候选为 4317，不要把旧远端 PR SHA 当作当前代码，不要在视觉门禁前执行生产 migration、Catalog 发布或 main 合并。

## 2026-08-29 网页端布局统一（当前）

- 当前工作线：`codex/main-core-foundation-v1`；本轮只修改桌面布局壳层、正式页面根布局和互动预览，不修改 Domain、Catalog、Supabase、素材或业务写入。
- 已建立三类布局契约：沉浸工作区、内容工具页、独立页面；Care Scene 不再进入 Browse 双栏网格，互动预览改为 URL 模块切换。
- 已通过：`npm run test:desktop-layout`、`npm run lint`、`npm run build`、`npm run test:aquarium-stage-layout`、`npm run test:three-stage-framing`、`npm run check:project-truth`、`git diff --check`。
- 当前阻塞：真实截图/人工布局验收尚未完成。`check:ui-freeze` 预期失败，因为本轮已批准解冻布局 Owner 文件；不得把它描述成业务回退。
- 下一步：按 390/600/768/1024/1280/1440/1920px 验收正式路由与预览模块，修复实际越界/空白，再由用户确认并重录 UI freeze；在此之前不推送、不做生产 migration、不合并 `main`。

## 2026-08-27 当前执行状态（阶段 2 视觉恢复）

- 唯一修改工作线：`codex/main-core-foundation-v1`；`codex/main-visual-recovery-v1` 仅作历史证据。
- 已恢复共享 `detail-rail`/`bottom-sheet` Surface、透明场景图片失败容器、正式 `/collection` creature-first 水族册和 Aquarium 单一沉浸舞台；未修改 Domain/Catalog/Supabase。
- 已通过：`npm run lint`、`npm run build`、`npm run check:api`、`npm run check:project-truth`、`npm run test:responsive-detail-surface`、`PREVIEW_URL=http://127.0.0.1:4319 npm run test:formal-scenes`、`PREVIEW_URL=http://127.0.0.1:4319 npm run test:today-action`、`PREVIEW_URL=http://127.0.0.1:4319 npm run test:collection-hub-ui`、`npm run test:aquarium-stage-layout`、`npm run test:three-stage-framing`；两套固定视口截图已保存到 `/private/tmp/aquaguide-visual-matrix/`。
- 未完成：正式 Catalog/Service 唯一权威切换、生产 migration 授权、用户人工验收和 `main` 合并；PR #142 当前 CI 已全绿，需在最终候选部署完成后记录 exact Preview SHA，仍为 Draft。
- 禁止重踩：不要把 4319 候选当成 4317 基线；不要恢复旧 `right-drawer`/四卡片水族册断言；不要在 Supabase parity 前执行 migration 或 Catalog 上传。

## 2026-08-27 阶段 4 交接

- 本地候选已包含生产报告的 26 个 migration 版本；Catalog migration `202608270001` 仍为第 27 个未执行提案。
- 候选预览构建现在在 `/_preview/interactive` 显示 branch/SHA/seed/build time；正式门禁会检查完整 40 位 SHA。
- 已通过透明素材、正式 scene/browse、今日行动、creature-first 水族册、Aquarium 单一舞台和响应式 Surface 回归。
- 下一步优先：服务端规划加入重算与 Catalog 版本绑定 → 干净 PostgreSQL 历史回放 → 固定视口截图矩阵 → Critic/Evaluator → 单次推送 Preview parity。生产 migration、Catalog 发布和 main 合并仍需独立授权。

## 2026-08-27 阶段 3 交接

- 规划加入现在在 API 写入前重新读取已发布 Catalog、鱼缸和缸内物种事实，经 Domain Rules 计算后才允许 RPC；客户端确认仅用于证明用户确认过 caution。
- Catalog 表、水体字段或证据引用在生产缺失时，API 明确返回 `COMPATIBILITY_INFORMATION_REQUIRED`，不会静默放行；现实记录路径仍保持可保存事实。
- 已通过 `test:livestock-addition-api-errors`、`test:domain-compatibility`、`test:addition-intents`、`check:api`、`lint`。尚未执行生产 migration 或真实登录写入回归。

## 2026-08-27 最终统一执行线（当前权威）

- 唯一日常工作树与发布候选：`codex/main-core-foundation-v1`（SHA 以 `git rev-parse HEAD` 运行时读取）；`codex/main-visual-recovery-v1` 仅作历史恢复证据，不再作为第二条开发线。
- 4317 只运行冻结视觉基线 `37a8d4d1`，4319 运行当前候选；预览版本必须同时记录分支、完整 SHA、seed 和构建时间。
- PR #142 是唯一发布 PR，仍为 Draft；PR #141 仅作历史证据，不能整体 merge/rebase。
- 当前视觉门禁：`FAILED / recovery in progress`。正式图鉴、养护、水族册和 Aquarium 需通过固定视口视觉验收后才能 release-ready。
- Supabase 只读检查已确认：生产 26 个 migration、35 张启用 RLS 的表、89 条 policy；生产缺少 `catalog_releases` 和 `species.water_type`，候选缺少 8 个生产 migration，状态为 `MIGRATION_REQUIRED + MIGRATION_HISTORY_CONFLICT`。
- 当前禁止：生产 migration、Catalog 上传、PR 推送、`main` 合并，直到本地迁移历史和视觉门禁完成；生产动作仍需独立授权。
- 下一步顺序：恢复生产 migration 历史到候选 → 完成正式视觉/透明素材 → 完成 Domain/Service 服务端重算 → 本地完整回归与独立审查 → Preview/Supabase parity → 用户验收 → 合并 `main`。

## 当前视觉恢复状态（2026-08-27）

- 已确认 main 收敛候选发生真实 UI 回退，不是缓存：`/_preview/interactive` 路由及两套 canonical 布局样式曾被删除，4317 也被复用来服务候选构建。
- 当前本地恢复分支：`codex/main-visual-recovery-v1`，从 `codex/main-core-foundation-v1` 创建；未推送，PR #142 尚未更新。
- 已恢复互动预览路由、互动场景组件、Aquarium 舞台样式、详情 Rail/Sheet/Blocking 样式及互动样式；生产 Aquarium 的 tank/status/actions 已重新归一到 dashboard stage，3D 相机使用 `stage-cover`，并恢复场景标题与缸内物种入口（`5ab8ca79`）。Domain/Catalog/Service/API/Supabase 未回退。
- `test:aquarium-stage-layout`、`test:three-stage-framing`、`npm run lint`、`npm run build`、`npm run check:project-truth` 已通过；4317 已切换为 detached `37a8d4d1` 基线，4319 已切换为候选 `b9203dd3`。Aquarium learn zone 已恢复 Archive/Discovery 深链，viewport contract 已恢复；人工验收仍未完成，因此视觉门禁保持 `FAILED / recovery in progress`。
- Critic 复验后，互动 journey 已明确为 preview-only fixture，Archive 外层补充 `aria-label`（`62135580`）。Critic 认为恢复代码基本合理，但要求先完成固定视口视觉、Preview SHA 与 PR 同步，才可继续 main 门禁。
- 继续执行前必须先完成 390/600/1280px 视觉复验，再决定是否将恢复提交合入候选并推送 PR #142。

## 2026-08-27 统一计划执行校正

- 当前实际工作树为 `codex/main-visual-recovery-v1`；PR #142 仍指向旧候选 `codex/main-core-foundation-v1`，不能把旧 CI 结果当作恢复版本证据。
- `/_preview/interactive` 已渲染，但正式 `/encyclopedia` 当前没有 `SpeciesSceneAtlas` 场景入口，正式 `/care` 当前没有 `KnowledgeSceneExplorer` 场景入口；两个模块状态已降级为 `PARTIAL_WITH_FALLBACK`。
- 本轮先同步状态和交接文档，下一步恢复正式路由的 scene/browse 双模式，再做今日行动；Supabase、Preview 推送和 main 合并保持暂停。

## 2026-08-27 Main 收敛分支

- 当前工作分支：`codex/main-core-foundation-v1`，基于 `origin/main@ed0cf380`。
- 候选已推送并创建 [Draft PR #142](https://github.com/chusday97/aquaguide-tank-guide/pull/142)（`codex/main-core-foundation-v1 → main`）；本地/远端/PR head 由 `npm run project:status` 和 GitHub 元数据实时核验。
- 已选择性迁移 `99865414` 与 `c822bd0e` 的 P0 混养能力；`npm run lint` 与 `npm run test:compatibility` 通过。
- 迁移台账：`.ai/MAIN_CONVERGENCE_LEDGER.md`。不得把 PR #141 整体 merge/rebase 当作同步方案。
- 尚未完成：Supabase schema/RLS parity、完整 Domain Service 切换、当前视觉基线完整迁移、main release PR。

### Catalog 阶段新增

## 2026-08-27 正式互动场景恢复进展

- `Encyclopedia` 默认场景已恢复为 `SpeciesSceneAtlas`，`CareEncyclopedia` 默认场景已恢复为 `KnowledgeSceneExplorer`；`?mode=browse` 保留传统列表路径，模式切换由路由显式记录。
- 新增 `scripts/verify-formal-interactive-scenes.mjs` / `npm run test:formal-scenes`，并修正手机/核心回归脚本使用显式 browse 模式；`test:formal-scenes`、`test:mobile-care-ui` 通过，`test:core-ui` 无错误退出。
- 图鉴手机分页调整为 320px 可用的紧凑布局，未改变领域规则、Catalog 或 Supabase。
- 下一步：先提交本步并继续实现半透明可拖拽“今日行动”；完成后再做统一门禁、推送候选和 parity。当前仍暂停 Supabase 写入、PR 更新和 main 合并。

## 2026-08-27 今日行动交互

- `StatusSummaryCard` 已改为半透明拉手默认收起；点击可展开，Esc 可收起，Pointer 拖拽会吸附到 collapsed / half / expanded 三档。
- 新增 `npm run test:today-action`，已在 1280px 真实浏览器验证点击、Esc 和拖拽到半展开；任务数据、完成状态和写入回调未改动。
- 已补齐手机 CSS：`max-width:767px` 时今日行动 Rail 固定在鱼缸舞台底部；回归脚本同时检查 390px 底部位置与 1280px 拖拽状态。
- 已修复 Care `#care-*` 深链自动进入 browse、Encyclopedia scene/browse 的 `mode` URL 持久化和今日行动 Enter/Space 键盘操作；正式场景、今日行动与 disclosure 门禁重新通过。
- 当前恢复分支最新本地 head 为 `86ec4ec4`；本地候选门禁已通过，下一步可将候选分支快进并推送 PR #142。推送前仍不合并 main，Supabase 只读 parity 待外部授权。
- 候选已快进并推送至 `codex/main-core-foundation-v1@a8532072`；`project:status` 现可从 recovery 或 candidate 运行并报告远端同步。PR #142 仍 Draft，未合并 main。
- PR #142 validate 的 GP-001 失败定位为 GitHub runner 异步设置弹层等待不足，已将测试默认等待从 10s 提升为 30s；本地 GP-001 通过，需推送后重跑远端门禁。
- 远端 validate 进一步暴露 GP-003 直接寻找隐藏“开始今日检查”按钮；测试已改为先展开今日行动拉手并提高等待窗口，本地 GP-003 通过。
- 最新候选 `ff2520c9` 已通过 GitHub validate/foundation、Vercel 与 Cloudflare checks，PR #142 状态为 CLEAN/Draft；Preview 部署已成功，但 Preview 实际 Git SHA 尚未由独立 parity 工具确认。
- `today_action_surface` 已加入 disclosure 契约白名单，`npm run test:disclosures` 通过。
- 底层回归已复验：Catalog、Domain policy、添加意图、现实记录/API 错误语义、Mini 混养、布局与 3D framing 门禁通过；Supabase 仍只读待授权 parity。
- 下一步：运行统一底层/Catalog 门禁，之后再做 Preview SHA/Supabase 只读 parity；当前仍未推送候选或合并 main。

- 已增加 Catalog 公共契约、Supabase migration 提案、不可变快照加载器和 `/api/v1/catalog/releases/current` 只读入口。
- `npm run lint`、`npm run check:api`、`npm run test:catalog-snapshot` 均通过。
- 当前本地快照为 486 个物种、13 个证据来源；旧物种水体字段仍为 `unknown`，等待审核数据回填，禁止文本推断。
- Migration 尚未执行；API 在生产 schema 未部署前预期返回 `503/404`，这是当前已知边界，不是静默成功。

### Domain Rules 阶段新增

- `packages/domain-rules/src/compatibility.ts` 已提供纯函数兼容判断基础层和统一添加策略；专项测试通过。
- 旧 UI 引擎仍保留作兼容适配，尚未宣称已完成全量切换；下一步是 Service/Repository 使用同一 Catalog 版本重新判断。
- `LivestockAddCommand`、API body 和错误语义已增加规划加入确认门禁；生产写入仍需 Catalog 发布后补上服务端重新计算，不能把客户端确认当作最终安全边界。
- Critic 发现的无鱼缸规划误放行、已发布 Catalog 可变、legacy content 查询依赖新 migration 三项阻塞已修复；同一 Critic 已最终复验六维 PASS，格式门禁 `13ce05da` 通过。
- 沙箱运行 `tsx` 时曾被临时 IPC 权限阻断，需在授权环境重跑既有 `npm run test:compatibility` 作为验证证据。
- 旧兼容引擎已接入 Domain Rules 适配层：结果保留现有 UI 所需证据列表，但 metadata 的 Catalog 版本、Domain 规则版本、规则代码和域状态由纯函数引擎生成；尚未完成服务端写入前按同一 Catalog Snapshot 重算。
- Catalog 已具备三个独立本地产物命令：`npm run catalog:build`、`npm run catalog:validate`、`npm run catalog:publish`；发布命令只生成待发布目录，不上传或修改 Supabase。
- PR #142 首轮 CI 发现 Catalog 校验脚本的 tuple 类型和混养记录失败 UI 契约缺口；随后本地 Golden Path 暴露非空缸详情 CTA、数量控件和 Portal 确认按钮断言缺口，均已在 `2b841e95` 修复。`npm run test:golden-path-gp002-ui` 已在 4317 通过，最近一轮远端 foundation 与 Product Golden Path runs `33041753905`、`33041755993`、`33041756115` 均通过；当前候选 SHA 以 `npm run project:status` 运行时输出为准。

## 当前工作基线

- **统一进度入口：** `.ai/PROJECT_STATE.json`。新接手者先读该文件，再读本 Handoff；不得从旧 RC、本地旧 worktree 或 PR #140 推断当前目标。
- **项目总入口：** `docs/PROJECT_TRUTH.md`。产品、UI、部署、数据与历史材料必须按它的 canonical routing 读取。
- **功能状态：** `docs/01-definition/FEATURE_CATALOG.md` 是唯一模块状态目录；不要从旧 PR 或 `PROGRESS.md` 推断功能是否当前可用。
- **发布状态：** `docs/05-validation/RELEASE_READINESS.md` 当前为 `NOT_READY`；P0 契约已接受，local compatibility input/派生服务已通过回归，Supabase exact parity 和 release acceptance 仍未完成。
- **P0 独立审查：** Critic 已复验通过；曾发现的水质映射、侵略性负荷回归、共享类型边界与自由文本误判均已有回归用例和修复。
- **产品参考分支（非当前工作分支）：** `codex/unified-rc-visual-v1`，基于用户确认的视觉 SHA `37a8d4d1`；只按语义提供迁移证据。
- **RC 定位：** `integration/aquaguide-rc1@895f2f39` 是已验证业务能力来源，不是视觉验收来源；只允许按语义选择性迁移。
- **废弃入口：** `codex/rc1-visual-convergence-v1` / PR #140 是错误的 RC-first 局部视觉迁移，不得继续作为验收或合并基准。
- **历史 GitHub 收敛入口：** Draft PR #141，head 为 `codex/unified-rc-visual-v1`、base 为 `integration/aquaguide-rc1`；它不再承担 main 发布。当前唯一 release 入口为 Draft PR #142。
- **GitHub 门禁：** `RC Convergence V1` 会在统一分支的相关推送后自动复验；最近两次可复核运行 `32849012409`、`32849349859` 均通过（project truth、状态、lint、布局、3D 取景和 production build）。
- **PR 拓扑：** `.ai/OPEN_PR_REGISTRY.md` 已冻结 2026-08-25 的 56 个 open PR；除 #141 外均为历史输入而非收敛路径。
- **唯一日常本地目录：** `/Users/chuchu/Documents/New project/aquaguide_frontend` 已切到该统一分支；旧 `codex/rc1-visual-integration` 仅保留作历史参考，禁止继续作为工作起点。
- **Supabase 状态校正：** 用户于 2026-08-25 确认既有 Supabase 工作已部署。旧文档中“待真实 Supabase 验证”只表示当前统一分支尚未重新核对连接环境、schema revision 与 RLS 回归，绝不表示 Supabase 没有部署。

- 当前分支：`codex/main-core-foundation-v1`
- 本地与 GitHub 的对齐提交必须每次以 `npm run project:status` 的 `sha` 为准；Handoff 不固化易过期 SHA。
- 当前产品代码 head：`90c1ad6`
- 本次 Handoff 文档更新后会产生新的 docs-only head；判断产品行为仍以 `90c1ad6` 为最新产品代码基线。
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 等历史栈存在明显分叉，后续必须 semantic reconciliation，禁止覆盖式 merge/rebase 当作“同步最新”。
- 当前状态：**alignment recovery / runtime regression hardening / 非 release-ready / 非视觉 PASS**。
- 最新 source audit：`ALIGNMENT_AUDIT_LATEST.md`。
- UI 不可变原则：`UI_REGRESSION_CONTRACT.md`。

> 下文的旧阶段记录只保留为验证和决策证据。当前产品/UI/部署状态以 `docs/PROJECT_TRUTH.md` 链接的权威文件为准。

## 当前本地 Preview（开发验收源）

- 隔离目录：`~/aquaguide-preview-current`
- 固定端口：`4317`
- Preview：`http://127.0.0.1:4317/`
- 关键路由：
  - Aquarium：`http://127.0.0.1:4317/aquarium`
  - Encyclopedia：`http://127.0.0.1:4317/encyclopedia`
  - Care：`http://127.0.0.1:4317/care`
  - Collection：`http://127.0.0.1:4317/collection`
  - 虎皮鱼直达验证：`http://127.0.0.1:4317/encyclopedia?mode=browse&species=sp_0439`
- 该 Preview 使用 production `npm run build` 产物，不是旧 Vercel Preview，也不占用现有 3000/4173 等地址。
- 日常 UI review 优先以 4317 为开发验收源；Vercel 恢复后只作为部署 parity 验收源。

## 当前不可变产品契约

1. Desktop Browsing Detail = persistent right Rail；左侧底层页面保持可见、可滚动、可继续点击。
2. 左侧切换物种/内容时 Rail 不关闭，只替换右侧内容。
3. Desktop Detail Rail 目标宽度约 **480–600px**，不得重新变成 50vw/720px split workspace。
4. Mobile Browsing Detail = bottom sheet；Task = high bottom sheet；Blocking Confirmation 才允许居中阻断。
5. responsive source of truth = viewport contract；不得恢复 UA-first device inference。
6. Aquarium >=960px = 单一沉浸舞台；status/actions 是 overlay，不得重新占列压窄 3D。
7. Three camera 是 Aquarium framing 的唯一 owner；禁止 CSS `scale()` 二次 framing WebGL canvas。
8. taxonomy 必须由 species identity 字段决定，不允许 description 中提到的其他物种污染自身分类。
9. i18n 只负责 presentation；不得修改业务 domain enum 并让 schema/rules 随语言改变。
10. UI 修复只改 canonical owner；禁止新增 `layout-v6/v7/v8` 式覆盖层。
11. GitHub head、local preview、Vercel deployed commit、browser regression、human acceptance 必须分开记录。

## 本轮新增真实回归与修复

### Species taxonomy cross-contamination — FIXED + LOCAL BROWSER VERIFIED

用户发现：点击虎皮鱼后，详情“类型”显示成孔雀鱼类型。

根因：`getSecondaryCategory()` 原来使用：

`name + scientificName + description`

虎皮鱼描述包含“严禁与天使鱼、孔雀鱼等长鳍鱼类混养”，于是 description 里的“孔雀鱼”误命中 livebearer 分类规则。

#### `b40c8a6` — `fix(species): prevent taxonomy cross-contamination`

已改为：

- taxonomy 只从 identity 字段 `name + scientificName` 推断；
- description 不再参与“它是什么类型”的分类；
- 新增 `鲃类/小型鲤科` 规则，覆盖虎皮鱼 / 一眉道人等 `Puntigrus / Puntius / Pethia / Desmopuntius / Sahyadria / Barbus`；
- taxonomy regression fixture：
  - `sp_0436 孔雀鱼` => `孔雀/月光/玛丽/剑尾`
  - `sp_0439 虎皮鱼` => `鲃类/小型鲤科`
  - `sp_0440 一眉道人` => `鲃类/小型鲤科`
- 同 commit 修复 shared Dialog 两个 TypeScript 类型问题（render-function children / functional className）。

本地验证：

- taxonomy 当前全量 **501 条 PASS**；
- `tsc --noEmit` PASS；
- production build PASS；
- 4317 浏览器直达虎皮鱼详情，已显示：
  - 虎皮鱼
  - `Puntigrus tetrazona`
  - `鲃类/小型鲤科`
  - 不再出现 `孔雀/月光/玛丽/剑尾`。

### English localization mutating domain enums — FIXED + LOCAL BROWSER VERIFIED

运行时发现：英文模式互动图鉴出现 `This group: 0`。

根因：`applyLocalization()` 原地把业务字段 `fish.housingMode` 从 canonical enum：

- `适合混养`
- `谨慎混养`
- `建议单养`

改成：

- `Compatible`
- `Caution Mix`
- `Single Specimen`

但 recommendation / fishSchema 只接受 canonical enum，导致英文浏览器中 schema validation fallback，interactive discovery batch 变空。

#### `aa1e1d9` — `fix(i18n): preserve species domain enums`

已改为：

- `housingMode` 在所有语言下保持 canonical domain enum；
- 英文文本仅在 UI render 时通过 localization helper 显示；
- Compatibility / Encyclopedia 相关展示同步改为 presentation-time localization；
- fallback `housingReason` 可以使用英文文本，但不修改 domain enum。

本地浏览器验证：

- 英文 Encyclopedia interactive scene：**6 个物种恢复正常**；
- 不再出现 `This group: 0`；
- `lint` PASS；
- taxonomy PASS；
- production build PASS。

## 之前 P0/P1 修复仍保留

### Surface responsive source of truth

已完成：

- shared `lib/layout-mode.ts`；
- 390/600/767 = phone，768/1024/1440 = desktop；
- `LayoutModeProvider` 与 shared Dialog 共用 viewport contract；
- 禁止恢复 UA-first inference。

### Aquarium camera-only framing

已完成：

- 删除 canvas CSS `scale(1.08–1.30)` 二次 zoom；
- ThreeAquarium `stage-cover` camera 成唯一 framing owner；
- local browser `Aquarium immersive stage runtime geometry` 当前 PASS。

### Encyclopedia/Care selection dock 768–1023

已完成 code-level 修复：

- selection dock/note overlay 扩展至整个 `>=768px` desktop range；
- 768–1023 采用 compact inset/image/action geometry。

## 2026-08-21 晚间新增完成项

- `cbb1e35`：taxonomy identity/water/life 全部改为 canonical identity；方氏拟腹吸鳅与古代蝴蝶鱼淡水误判修复；locale taxonomy drift = 0。
- `9a09163`：退役 `.modalCard` 720px geometry owner；Species Detail Rail 1440px 实测 600px；Care close race 同步修复。
- `b896c23`：核心 runtime tests 统一 Preview URL source，避免测试悄悄跑旧 localhost。
- `563397e`：Aquarium 14 个 active Dialog 全部显式 `surface=`；删除约 160 行永远关闭的 legacy fish detail modal；删除 Smart Recommendation visual-signature inference。
- `8e6417f`：Collection desktop 改为 creature-first navigation；1024/1440 无 center overlap；768/390 compact fallback；删除 502 行 dead `collection-book-*` CSS；旧书页 browser regression 已改为 creature-navigation contract 并接入 UI workflow。
- `7274da4`：taxonomy presentation helper 完成；英文 Species Detail / taxonomy UI 显示英文 label，但 canonical domain taxonomy 保持稳定。
- `44168a6` + `cc0960f`：远端新增 27 个水草透明素材，并注册 `sp_0487~sp_0501` 水草数据。
- `3145922`：恢复 Aquarium 主舞台 `+ 添加生物` 与 `⚙ 鱼缸设置` 常驻 icon；桌面保留全屏预览 icon；底砂/造景与水草增加内嵌搜索；搜索已覆盖新增水草（含 `sp_0498 金鱼藻`）；新增专用 browser regression。
- `f34eb29`：修复 mobile Task Sheet 双重 translate 导致半屏移出 viewport；Aquarium primary Task 入口互斥，禁止设置/添加/缸内物种 Task Rail 同时叠开；新增 Task / Detail / Blocking / Media 四类 runtime matrix 并接入 UI regression workflow。
- 同 `3145922`：`isAquaticPlantSpecies` / `isHardscapeSpecies` 改为 canonical identity 判定，修复新增水草在英文模式被误判为 fish 的 locale drift；501 条 taxonomy PASS。
- `90c1ad6`：所有业务 `DialogContent` 已显式声明 `surface=`；删除 shared Dialog 的 class/尺寸/close-button visual inference；删除 Encyclopedia 约 229 行永远关闭的 legacy detail；旧 Settings/Search/mobile Care browser tests 同步到当前真实交互。
- `2086059`：退役最后两套手写 Dialog；Species Export → Media，Compatibility Adjustment → Task；删除不可达 `conflictDetail` 分支；业务手写 `role=dialog/aria-modal` = 0；compatibility evidence audit 更新到 501 条。

## 当前最重要的未修问题

### P1 — Compatibility evidence coverage 只有 0.60%

当前 501 条物种只有 3 条 reviewed behavior profile、1 条 reviewed pair rule。抽样 12,000 个真实组合时 `behavior_evidence_unreviewed` 是主要 medium missing-data；抽样 30,000 个真实组合没有出现 `caution`。这不是 UI bug，而是证据覆盖不足。禁止降低 evidence gate 来制造“可尝试”结果；下一步应扩 reviewed evidence + citation + confidence。

### P1 — Human visual acceptance / deployment parity 尚未完成

Identify、Aquarium Surface、Collection 子页、Settings guard、Search → Detail 与 28-case 全页面 matrix 均已 browser 验证。剩余是用户人工视觉验收、Vercel 同 SHA parity，以及后续新改动持续回归。

### P2 — Remaining stale-test / dead-style debt

`window.confirm` = 0；业务手写 `role=dialog` / `aria-modal` = 0；所有业务 DialogContent 显式 `surface=`。剩余主要是旧测试/死样式和最终分支 semantic reconciliation。

## 当前测试 / 证据状态

当前最新本地 product/test baseline（基于 `2086059`）：

- `npm run lint` / `tsc --noEmit`：PASS
- `npm run test:taxonomy`：PASS（**501 条**；locale taxonomy drift 0；新增水草在中英文下保持 plant taxonomy）
- `npm run test:layout-mode`：PASS
- `npm run test:three-stage-framing`：PASS
- UI regression governance：PASS
- production `npm run build`：PASS
- Species Detail persistent Rail runtime：PASS（1440px computed width 600px，贴右、满高、背景不锁、切换物种不关闭）
- Care Detail Rail open/close runtime：PASS（URL close race 已修）
- Interactive Encyclopedia scene：PASS
- Aquarium immersive stage browser geometry：PASS
- Collection creature-navigation runtime：PASS（1440/1024 creature nav；768/390 compact fallback；hover 不裁切；node 不覆盖 center）
- Tiger barb / hillstream loach / African butterfly fish browser taxonomy：PASS
- Aquarium primary tools runtime：PASS（1440/1024/390 添加 + 设置可见、在舞台内且不覆盖缸内物种入口）
- Aquarium settings inline search runtime：PASS（底砂 `溪流砂`、水草 `小水榕`、新增水草 `金鱼藻` 均可过滤命中）
- Aquarium Surface runtime matrix：PASS（desktop Task 单 Rail/无 overlay；mobile Task 完整贴底；Blocking 居中 modal；Media 居中 modal；desktop Detail 600px Rail；mobile Detail 68dvh bottom sheet；Task→Detail 不叠层）
- Settings unsaved-feedback navigation guard：PASS（shared Blocking，不再依赖 native confirm）
- Search → Species Detail：PASS；Atlas/Care/global/sidebar search regressions 已对齐当前 scene→browse 产品路径
- Collection wishlist/care/memorial 子页与返回路径：PASS
- Mobile Care end-to-end regression：PASS
- Identify identity→optional health triage + unsaved navigation guard：PASS
- Full-page runtime matrix：PASS（7 routes × 4 viewports = **28/28**；无 horizontal overflow / initial dialog / body-lock / pageerror）
- Admin unsaved-change / status confirmation：PASS（shared Blocking；全仓 `window.confirm` = 0）
- Species export Media regression：PASS（variant switch / PNG / print）
- Business hand-built dialog semantics：0；governance PASS
- Compatibility evidence audit：501 total / 3 reviewed / 1 pair rule / **0.60% coverage_gap**

注意：以上属于 local build/browser evidence，不等于用户已经完成视觉验收；human visual PASS 仍未授予。

## Local → Vercel parity 规则

后续 Vercel 恢复部署后，只有满足以下条件才能说“线上与本地一致”：

1. Vercel deployed Git SHA == 已通过 local review 的 product SHA；
2. 使用相同 viewport / language / localStorage seed；
3. 同一套 browser regression 同时跑 Local 和 Vercel；
4. 关键 computed geometry 一致；
5. 用户人工 review 后才标 human PASS。

Vercel build-rate-limit 不再阻塞日常 UI 修复；local 4317 是开发验收源，Vercel 是部署验收源。

## 下一步执行顺序

### Step 1 — 扩 Compatibility reviewed evidence

- 保持 `behavior_evidence_unreviewed` 的严格门槛，不通过降级规则制造可用结果；
- 优先补高频淡水物种的 reviewed behavior profile；
- 每条必须有 citation / confidence / reviewStatus；
- 持续运行 evidence coverage audit，覆盖率只能上升不能回退。

### Step 2 — Human visual baseline + Vercel parity

- 继续使用 `http://127.0.0.1:4317/` 作为开发验收源；
- 用户确认当前视觉后才建立 screenshot golden baseline；
- Vercel deployed SHA 必须等于已验收 product SHA；
- Local / Vercel 使用同一 seed 与 regression 做 parity。

### Step 3 — stale test / dead CSS / branch reconciliation

- 清其他 dead CSS / stale test；
- main/RC1/#104/#105 semantic reconciliation，禁止覆盖式 merge。

## 禁止事项

- 不因为 Vercel 没刷新就把代码改回旧 Preview 的样子。
- 不用截图肉眼估计替代 computed geometry。
- 不用 description/translation 改写 domain identity 或 enum。
- 不为了旧测试 PASS 恢复已经否定的 split workspace。
- 不继续新增 versioned CSS override。
- 不直接 merge `main` 或旧 UX 分支解决“缺失修改”。

## 可信边界

- GitHub commit 存在 ≠ UI PASS。
- local build PASS ≠ 所有 runtime path PASS。
- browser regression PASS ≠ human visual acceptance。
- Vercel success ≠ deployed SHA 一定是当前 review SHA。
- source audit ≠ runtime audit。
- 当前已无已知 720px Detail Rail / Surface runtime P0；最高优先未完成项转为 **Compatibility reviewed evidence coverage + human visual/Vercel parity**。

同时参考：`ALIGNMENT_AUDIT_LATEST.md`、`UI_REGRESSION_CONTRACT.md`、`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`SURFACE_INVENTORY_LATEST.md`。

## 2026-08-27 当前候选交接

- 当前本地候选、远端候选和 PR #142 Head 均由 `project:status` 运行时核对；最新一次核对通过。PR 当前检查与 Preview SHA 仍需完成验收，不能据此声称可合并 main。
- 4317 是 detached `37a8d4d1` 视觉基线，4319 是候选并显示完整 SHA；若服务进程退出，先重启再做 Preview 证据。
- viewport、正式场景、透明素材、详情 Rail/Sheet、今日推荐深链和门禁默认端口已修复并通过本地回归；人工视觉验收、远端 CI/Preview SHA、Supabase parity 尚未完成。
- 用户未授权前不得执行生产 migration、Catalog 发布或 main 合并。

## 2026-08-28 当前收敛状态（UI 冻结 + Supabase 只读 parity）

- 当前候选为 `codex/main-core-foundation-v1`（SHA 以 `npm run project:status` 运行时读取；UI 冻结基线为 `02457dd2`），4317 运行 detached `37a8d4d1` 基线，4319 运行候选；本轮不修改布局、视觉组件、素材或交互结构。
- `.ai/UI_FREEZE.json` 和 `npm run check:ui-freeze` 已建立；固定截图/manifest 位于 `/private/tmp/aquaguide-visual-matrix/ui-freeze-02457dd2`，覆盖 390/600/1280px 的 `/_preview/interactive`。
- Supabase 只读证据已刷新：26 migrations、35/35 RLS 表、89 policies、56 外键、86 索引、33 非内部触发器；13 个 public RPC 已读取签名。详细报告见 `docs/05-validation/SUPABASE_PARITY_REPORT.md`。
- 生产缺少 `catalog_releases`、`species_reference_links`、`species.water_type`，故 parity 为 `MIGRATION_REQUIRED`，不是 `EQUIVALENT`；未执行 SQL、Catalog 发布或业务写入。
- 下一步只做逐条 schema/RLS/RPC 语义比对、干净 PostgreSQL 回放和统一回归。只有用户另行授权才执行第 27 个 migration、Catalog 发布或合并 main。
- 验证：`npm run check:ui-freeze` 通过；4317/4319 HTTP 200；截图 manifest 记录两套 SHA。
## 2026-08-29 4317 严格视觉恢复：最新交接

- 当前候选分支：`codex/main-core-foundation-v1`；最新 SHA 始终以 `git rev-parse HEAD` 读取，未推送 GitHub、未执行 Supabase、未合并 main。
- 4317 继续是 detached `37a8d4d1` 视觉母版；候选 4319 当前运行最新 production preview，不能用 Vite 开发态的白色 Canvas 作为验收证据。
- 已修复：Aquarium 预览工作区的明确高度、4317 字体变量/标题层级、截图 ready/font/Canvas 等待和 4xx/pageerror 失败门禁。
- 已验证：候选 production build 在 4319 渲染 WebGL 鱼缸、透明生物和操作层；无页面错误。最新四模块 35 张固定截图位于 `/private/tmp/aquaguide-visual-matrix/ui-parity-126f99b8`，manifest 全部 HTTP 200。
- 当前卡点：四模块严格对照 4317 的截图、网页端断点矩阵和人工视觉验收尚未完成；`check:ui-freeze` 仍只能在视觉确认后更新基线。
- 下一步：按 Aquarium → Encyclopedia → Care → Collection 完成与 4317 的截图和人工验收；通过后再提交新的 UI freeze 证据。

## 2026-08-30 候选预览运行时证据

- 候选 4319 已移除外部 Google 字体导入，避免网络请求失败造成字体 403；字体仍按本地/系统回退栈渲染。
- 候选四模块截图矩阵已重新生成并绑定当前构建 checkpoint：`/private/tmp/aquaguide-visual-matrix/ui-parity-e6a59190`，28 张、7 个视口、全部 HTTP 200，无 page error 或 failed request。
- 4317 仍为 detached `37a8d4d1` 视觉母版；其外部字体请求在当前网络环境可能失败，因此基线截图工具不能把该网络失败伪装成候选通过。候选无此失败。
- 当前候选 CSS 修复已形成提交，4319 已重建并重启，页面元数据与当前 SHA 一致；独立 Critic 已完成复验。本地尚未推送，故 `project:status` 按设计显示候选不同步。
## 2026-08-31 并行审核底座

- 当前分支已增加 `CatalogFieldResolution` 语义（`supported` 或 `unknown`），提交 `bb666b31`。
- `reviewed + unknown` 要求来源与冲突说明，且不会写入运行时 Catalog；Draft/Rejected 仍不进入事实层。
- 下一步由三个子任务分别写入 batch-01/02/03 审核文件；主线程随后聚合并运行 300 字段与435组合门禁。
