# AquaGuide Handoff — Latest

更新时间：2026-08-27 00:55 +08:00

## 本轮新增

- 修复 P0-07 迁移期跨标签页刷新缺口：`subscribeToAppState` 同时监听 canonical app-state 与 Aquarium/图鉴仍在兼容期使用的 legacy 镜像键；无关 storage key 不触发页面回流。
- `npm run test:discovery-storage-boundary` 新增 legacy/unrelated storage event 回归；专项测试、lint、build、project truth、4317 UI smoke 与 product-actions runtime 均通过。
- 推送后只读 parity 已恢复：local/origin/Vercel READY Preview 均为当前 head `3330c02d`，`npm run check:preview-parity` 返回 `PASS`；PR #141 仍 Draft/CONFLICTING，最新四项 Actions 仍在队列或尚未针对当前 head 完成。

- Critic 复验后补齐逐对 telemetry 去重签名：组合、数量、逐对状态和规则代码变化会生成新事件；单纯 React 重渲染仍去重。
- Critic 复验建议已关闭：签名覆盖 `passedRules` 及风险/缺失规则，且使用排序后的物种 ID，反向选择不再产生方向性重复。
- `RC Convergence V1` 已执行 `npm run test:session-events`，将 pairKey 隐私/归一化回归纳入远端统一门禁。
- 混养评估补充 `compatibility_pair_evaluated` 会话级事件：每个逐对结论记录 `status` 与规范化 `pairKey`，仅接受 catalog `sp_####` ID，拒绝自由文本、路径样式值和自配对；不写入数据库、不影响运行时结论。
- `npm run test:session-events` 已覆盖 allowlist、方向归一化、隐私拒绝和 reset；混养/证据覆盖回归与 production build 也通过。
- 本轮修复已提交并推送；代码与证据提交记录见 Git 历史。当前 SHA 不固化在交接文档，始终以 `npm run project:status` 与 `git ls-remote` 为准，工作区应保持 `dirty=false`。

## 当前工作基线

- **P0-07 存储边界修复（2026-08-26）：** Aquarium 与 Encyclopedia 的互动发现牌堆已统一通过 `src/services/storage/local-app-state.ts` 读写；旧 `aquapediaDiscoveryDeck` 键仍可读取并由 canonical writer 镜像，跨页面统一发出 `aquaguide:app-state-changed`。新增 `npm run test:discovery-storage-boundary` 并纳入 RC Convergence；图鉴筛选使用统计与未路由 AI 聊天仍保留为页面级 UI 状态，P0-07 继续为部分完成。

- **P0-07 交错写入修复（2026-08-26）：** 延迟写入现在记录字段 patch，并在 flush 时合并最新持久化快照；发现牌堆更新不会再被愿望清单等即时/延迟更新覆盖，清空本地状态也会取消待执行写入。专项回归覆盖同页交错、双延迟 patch 和外部标签页更新。
- **跨页刷新补强（2026-08-26）：** Aquarium 与 Encyclopedia 已订阅统一 `APP_STATE_CHANGED_EVENT`；收到 canonical 写入或跨标签 storage 事件时刷新 discovery/wishlist，且对未变化的 Set 保持引用，避免事件回流触发重复保存。
- **清除状态修复（2026-08-26）：** Aquarium 刷新不再用旧队列兜底；当 canonical/legacy discovery 均不存在时会清空页面状态。只有显式 `clearLocalAppState()` 清理 legacy 键，普通 app-state 保存继续保留旧键兼容并等待 discovery 迁移。
- **独立审查结果（2026-08-26）：** Critic 对 `8095815f`、`901db4cf`、`d26b3270` 的交错写入、跨页刷新、清除态与 legacy migration 进行了同线程六维复验，全部通过；仅保留 direct full-snapshot debounce 语义文档化与真实浏览器等待 flush 作为非阻塞后续建议。

- **main 合并状态（实时复核）：** 统一分支 `codex/unified-rc-visual-v1` 已推送至本轮修复 head；PR #141 仍为 Draft，GitHub `mergeable=CONFLICTING`、`mergeStateStatus=DIRTY`。相对 `origin/integration/aquaguide-rc1` 与 `origin/main` 的拓扑差异仍需逐项语义收敛；当前没有指向 `main` 的发布 PR，不能直接合并或用整体 rebase 解决。
- **Preview parity（实时复核）：** `npm run project:status` 与 `npm run check:preview-parity` 已确认 local/origin/Vercel READY Preview 同为当前 head `3330c02d`；Supabase schema/RLS parity 和用户 release acceptance 仍未完成。

- **兼容性研究延期复核（2026-08-26）：** `origin/main@2eaa20c2` / `e8d6c652` 仅记录 research-only 无配对证据后的延期，当前无已接受的研究队列契约，已标记 `HISTORICAL_OR_EXCLUDED`；不传播到运行时混养结论。
- **成就模块语义复核（2026-08-26）：** `origin/main@5bf9800c` 的“建设中”降级与当前产品契约冲突，已标记 `HISTORICAL_OR_EXCLUDED`；Collection hub 回归现在确认成就入口可聚焦中央并渲染派生成就预览。提交 `d5dcbd7a` 的 RC/UI/validate/candidate/Vercel/Cloudflare 全部通过，Preview SHA parity PASS；未改变视觉基线或数据契约。
- **空养护计划深链修复（2026-08-26）：** 选择性迁移 `origin/main@d464e24b`；鱼缸页“浏览养护”现在直达 `/care#care-recommendations`，并由 task-entry contract 锁定。提交 `66cb109c` 的 RC Convergence、UI Regression、validate、候选 head、Vercel、Cloudflare 全部通过，Preview SHA parity PASS；本地 4317 HTTP 200。
- **CI 环境修复（2026-08-26）：** UI Regression V1 的 Chromium 安装已去除 `--with-deps` 系统包安装，仅保留 Playwright 浏览器下载；新 run `32959367104` 已通过，浏览器回归已越过安装步骤并完成。
- **Daily Check 规则修复（2026-08-26）：** `origin/main@37177a60` 的否定水质答案误判已选择性迁入统一分支；精确枚举匹配、正/负回归和 RC Convergence 门禁均已加入，未改变当前 4317 视觉基线。
- **Daily Check 导航修复（2026-08-26）：** `origin/main@2add55a5` 的导航澄清已选择性迁入；桌面鱼缸子菜单明确显示每日鱼缸检查并直达 `/aquarium?action=daily-check`。提交 `d4e61514` 的远端 CI 与 Vercel Preview parity 已通过。
- **CI 触发修复（2026-08-26）：** `RC Convergence V1` 已将 `PROGRESS.md`、`HANDOFF_LATEST.md`、`.ai` 执行/变更记录、`40-DOCS/CHANGELOG.md` 与 `.project-journal/**` 纳入 push/PR 路径过滤；后续文档同步会产生同一 SHA 的底层门禁结果，不再沿用旧 head 的 RC 结果。

- **统一进度入口：** `.ai/PROJECT_STATE.json`。新接手者先读该文件，再读本 Handoff；不得从旧 RC、本地旧 worktree 或 PR #140 推断当前目标。
- **项目总入口：** `docs/PROJECT_TRUTH.md`。产品、UI、部署、数据与历史材料必须按它的 canonical routing 读取。
- **功能状态：** `docs/01-definition/FEATURE_CATALOG.md` 是唯一模块状态目录；不要从旧 PR 或 `PROGRESS.md` 推断功能是否当前可用。
- **发布状态：** `docs/05-validation/RELEASE_READINESS.md` 当前为 `NOT_READY`；P0 契约已接受，local compatibility input/派生服务已通过回归。当前 canonical head 始终以 `npm run project:status` 为准；提交 `2b544836` 的 PR #141 RC Convergence、UI Regression、Surface、Result UX、Vercel、Cloudflare 全部通过。`npm run check:preview-parity` 已确认 Vercel READY Preview `aquaguide-kh6huu1vq-chusday97s-projects.vercel.app` 与 local/remote 同 SHA。exact migration revision、直接 RLS policy metadata 与用户 release acceptance 仍未完成。
- **P0 独立审查：** Critic 已复验通过；曾发现的水质映射、侵略性负荷回归、共享类型边界与自由文本误判均已有回归用例和修复。
- **唯一统一分支：** `codex/unified-rc-visual-v1`，基于用户确认的视觉 SHA `37a8d4d1`。
- **RC 定位：** `integration/aquaguide-rc1@895f2f39` 是已验证业务能力来源，不是视觉验收来源；只允许按语义选择性迁移。
- **废弃入口：** `codex/rc1-visual-convergence-v1` / PR #140 是错误的 RC-first 局部视觉迁移，不得继续作为验收或合并基准。
- **唯一 GitHub 收敛入口：** Draft PR #141，head 必须保持 `codex/unified-rc-visual-v1`；P0 业务迁移已完成，仍不得在 Supabase parity 与单独 release acceptance 前转为 Ready 或合并。
- **GitHub 门禁：** `RC Convergence V1` 会在统一分支的相关推送后自动复验；运行 `32854080645` 已在 `cc99ec47` 通过 project truth、状态、PR topology、lint、布局、3D 取景和 production build；当前 head 仅包含文档证据更新。
- **最近一次远端门禁：** PR #141 当前 head `fd27daf2…` 的 RC Convergence `32956751975`、Result UX Head Integrity `32956752189`、Surface System `32956751865`、UI Regression `32956751904` 均已通过，且 UI Regression 已包含物种详情专项回归。
- **最新远端门禁：** PR #141 head `2b544836…` 的 RC Convergence `32961005538`、Result UX/validate `32961005535`/`32961005567`、UI Regression `32961005592` 均通过；Vercel 与 Cloudflare 状态也通过。
- **最新远端门禁：** PR #141 head `d4e61514…` 的 RC Convergence `32962622208`、UI Regression `32962622300`、validate `32962622235`、verify-candidate-head `32962622268` 均通过；Vercel/Cloudflare 也通过，Preview SHA parity 为 PASS。
- **PR 拓扑：** `.ai/OPEN_PR_REGISTRY.md` 与 `docs/03-development/PR_CLEANUP_RECORD.md` 已记录安全收敛结果；当前开放列表只剩 #141，其他 55 个历史 PR 已关闭但分支保留。
- **分支收敛审计：** `98977966` 新增 `npm run audit:branch-convergence` 和 `docs/03-development/BRANCH_CONVERGENCE_AUDIT.md`。最新远端快照显示统一分支相对 `origin/main` 为 149/214、相对 RC1 为 149/742；这些是 Git 拓扑差异，不是缺失功能结论。后续必须按 `.ai/RC_MIGRATION_LEDGER.md` 逐项审查，禁止整体 merge/rebase。
- **Parity 门禁：** `54f3e005`、`b39dbbd7`、`6e71cb05` 已加入 local/remote SHA、缺失 ref 和 detached CI 分支检查；统一分支已推送，当前 `project:status` 与 `check:branch-convergence` 均通过。当前环境无法连接 GitHub API，Actions 真实运行仍待外部观察。
- **跨层事实盘点：** `docs/05-validation/MODULE_FACT_INVENTORY.md` 统一记录产品、UI、领域规则、Service、数据/API、测试和部署状态；任何新模块变更必须同步该索引和对应验收证据。
- **治理提交：** `28142542`、`642b007b` 已加入只读 GitHub PR 拓扑检查、`.ai` 门禁触发范围和 PR 清理/模块盘点记录；Critic 六维复验通过，GitHub Actions `32853545889` 成功。
- **唯一日常本地目录：** `/Users/chuchu/Documents/New project/aquaguide_frontend` 已切到该统一分支；旧 `codex/rc1-visual-integration` 仅保留作历史参考，禁止继续作为工作起点。
- **Supabase 状态校正：** 用户于 2026-08-25 确认既有 Supabase 工作已部署。旧文档中“待真实 Supabase 验证”只表示当前统一分支尚未重新核对连接环境、schema revision 与 RLS 回归，绝不表示 Supabase 没有部署。
- **Parity 核对结果（2026-08-25）：** 使用 Vercel 现有授权读取生产环境配置名，并以 anon key 对配置项目执行 GET-only PostgREST 探针；31/31 契约表、鱼缸/批次/换水、养护动作/循环、兼容证据和引用字段均返回 HTTP 200。Vercel 脱敏 PostgreSQL 连接串，anon REST 不公开 migration history/RLS policy metadata，因此不能把这次结果升级为 exact schema/RLS parity。
- **Preview 核对结果（2026-08-25）：** 最新 Ready branch Preview `aquaguide-2kdgtap8s-chusday97s-projects.vercel.app` 绑定统一分支，创建时间与 `187d16ba` 提交时间相差 6 秒；Vercel 元数据接口未返回 Git SHA，只能记为 timing correlation，不能记为 exact SHA parity。
- **人工验收状态（2026-08-26）：** 用户已确认当前 4317 视觉方向作为工作基线；后续视觉仍可修改，但每次 UI owner 变更都必须重新做固定视口人工验收。此前 523×812 视口的 DOM、9 个物种图像和 WebGL canvas 浏览器检查无应用错误；Three.js 仅有弃用警告。

### 本轮修复（canonical regression hardening）

- 浏览器回归脚本统一通过 `scripts/preview-url.mjs` 解析目标，默认使用当前 4317 production Preview；不再静默落到 3000/4173 等旧端口。
- 已按当前 UI 契约修复 600px 断点、detail surface、混养路由、Aquarium 搜索/物种入口和 Dialog accessible-name 断言。
- AI 建缸助手恢复为桌面沉浸式 Dock 的第七个操作卡片；移动端继续使用“更多鱼缸操作”入口。未新增第二套业务入口或规则。
- 第二轮陈旧回归审计已完成：Care 分类改用正式 `/care?mode=browse` 路由；Daily Discovery、动作语义和手机优先级回归改为验证图鉴互动场景拥有六项发现队列，鱼缸首页不再渲染重复推荐；Species Detail 使用当前 `View tank species`/`查看缸内物种` 入口与 `detail-rail`/`bottom-sheet` 表面。
- 物种详情回归已进一步对齐当前双语 CTA：已拥有图鉴详情使用 `Livestock in Tank`，`npm run test:species-detail-ui` 在 4317 受控浏览器环境通过，并已纳入 `UI Regression V1`；未修改产品 UI、业务规则或视觉基线。
- 已移除旧 3003 UI smoke 并注册 `npm run test:ui-smoke`：脚本固定使用 4317，验证正式路由、browse 搜索、互动图鉴六项发现、鱼缸唯一缸内物种入口和无重复推荐；该 smoke 已通过。
- 已修复 CI 触发漂移：`Surface System V1` 与 `UI Regression V1` 现在均监听 `codex/unified-rc-visual-v1`，并在隔离 4173 production Preview 上执行 canonical UI smoke；旧 `codex/interactive-parity-v3` 不再作为 push 门禁来源。
- 该 CI 收口已推送为 `834af948`；`project:status` 与 `git ls-remote` 已确认 local/remote 同 SHA，4317 `/_preview/interactive` 返回 200。该时点 Vercel CLI 误报 `AUTH_REQUIRED`，后续已修复 CLI 解析并确认 exact Preview SHA；Supabase schema/RLS 与 release acceptance 仍未完成。
- `origin/main@ed0cf380` 的 Care card 可达性已完成首轮复核：统一分支已有 `分享卡片` → 本地 `生成养护卡` 流程；新增 `test:care-card-action-ui` 守住该行为并纳入统一 UI CI，没有复制旧入口或改变产品契约。
- 首轮 `origin/main` 高影响能力判定已整理到 `docs/03-development/ORIGIN_MAIN_RECONCILIATION.md`；这只是已验证分组，不代表 214 个独有提交全部完成，剩余提交仍不得直接合并。
- `origin/main@daadc2a3` 的 Settings sharing 降级已复核：统一分支保留真实脱敏报告流程，并由 `test:settings-share-action-ui` 验证 Settings → 导出与分享；状态继续为 `DEPLOYED_REVERIFY_PENDING`，不降级为建设中。
- `RC Convergence V1` 已补齐底层门禁：三层契约、业务/API、混养、鱼缸状态/证据、换水、证据展示、推荐和分享测试均在 canonical workflow 执行；视觉 UI 门禁仍由 `UI Regression V1` 负责。
- 已修复远端 Surface System V1 的陈旧 `max-w-[920px]` 断言，改为验证当前 Detail Rail `w-[clamp(480px,42vw,600px)]`；同时修复 Aquarium primary-tools 回归在 Escape 关闭设置面板后的 CI 点击竞态（`a7b85171`）。本地 4317 回归、lint、project truth 和 diff check 通过，新的远端 Actions 结果待观察。
- 新远端 Surface 已通过；UI Regression 继续暴露回归脚本在添加生物点击后等待导航的超时，已改为 `noWaitAfter` 并以目标 Dialog 可见性验收（`a90911fa`）。本地 4317 回归通过，需等待下一次远端 UI run。
- 后续远端日志显示设置内“水草”面板切换也存在同类导航等待，两个设置面板切换已统一改为 `noWaitAfter`（`78160db3`）；本地 4317 回归通过，等待新 UI run。
- Identify 失败进一步确认是 UI CI 环境缺少 API：workflow 现在在隔离前端前启动现有 Express API（8787），再用 Vite 开发代理提供 4173；production build 仍单独执行。API+Vite 本地回归通过，提交 `0b52e947` 已推送。
- 最新远端 CI 证据（2026-08-26）：当前 canonical head `9f1a543c1e1527282f4b8436ebff815270e34c1c` 上 `UI Regression V1` `32951613998`、`Surface System V1` `32951614156`、`Result UX Head Integrity V1` `32951614036`、`RC Convergence V1` `32951614083` 全部 success；PR #141 head、本地和 origin 分支 SHA 一致，4317 `/_preview/interactive` HTTP 200。Vercel Ready Preview `aquaguide-jqfsw1rja-chusday97s-projects.vercel.app` 也绑定该 SHA，`check:preview-parity` 为 `PASS`；Supabase schema/RLS parity 与 release acceptance 未完成。
- README/SETUP 已明确 3000 是开发服务、4317 是 production Preview 验收源。`npm run test:daily-discovery`、`test:product-actions-runtime`、`test:mobile-aquarium-priorities`、核心体验、全页面运行矩阵 28/28、导航、设置反馈、互动场景、lint、project truth、branch convergence 与 diff check 均通过。回归、文档与最终状态提交已全部推送；当前 SHA 不固化在 Handoff，始终以 `npm run project:status` 与 `git ls-remote` 输出为准，工作区 clean。
- 修复 `check:preview-parity` 的 Vercel CLI 解析：无系统 `vercel` 时自动使用 `npx --yes vercel`。当前只读输出为 `PASS`：local = origin = PR #141 = Vercel Ready Preview `aquaguide-k48ki2sbb-chusday97s-projects.vercel.app`，SHA `f2a5ec47…`；Supabase schema/RLS 直接元数据和 release acceptance 仍 pending。

- 当前分支：`codex/unified-rc-visual-v1`
- 本地与 GitHub 的对齐提交必须每次以 `npm run project:status` 的 `sha` 为准；Handoff 不固化易过期 SHA。
- 当前统一代码与文档 head：以 `npm run project:status` 输出为准（本轮已完成推送并复核）。
- 最近代码里程碑 `6b0e629d` 包含兼容性聚合修复、证据状态门禁和回归脚本；后续判断产品行为以 canonical 分支最新 SHA 及其验证证据为准。
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 等历史栈存在明显分叉，后续必须 semantic reconciliation，禁止覆盖式 merge/rebase 当作“同步最新”。
- 当前状态：**alignment recovery / runtime regression hardening / 非 release-ready / 非最终视觉锁定**。
- 当前下一步：完成 exact Preview SHA 与 Supabase schema/RLS parity；在这些门禁及单独 release acceptance 完成前不创建 `main` 发布合并。
- 最新 parity 尝试（2026-08-26）：记录的 Vercel Preview 返回 `302 → Vercel SSO`，未暴露 Git SHA；当前环境没有授权 Supabase schema/RLS inspection surface。本轮未执行 Supabase 请求、migration、RPC 或写库，以上门禁仍为 pending。
- 最新 parity 复核（2026-08-26）：公开 GitHub API 查询因匿名 rate limit 被拒，无法新增 PR head/check-run 证据；本地 4317 `/_preview/interactive` 继续返回 HTTP 200。未将本地响应升级为 Vercel SHA parity，也未执行 Supabase 写入或 schema/RLS 变更。
- 最新 Vercel CLI 只读复核（2026-08-26）：已通过缓存的 Vercel CLI 读取项目 `aquaguide` 最近部署；最新 Ready 分支 Preview `aquaguide-uwfft41zv-chusday97s-projects.vercel.app`（别名 `aquaguide-git-codex-unified-rc-visual-v1-chusday97s-projects.vercel.app`）明确绑定 `codex/unified-rc-visual-v1`，但其 `githubCommitSha` 为 `6b0e629d8b6694a06b98182a38da01d34718c44f`，落后于当前本地/GitHub `43f75e739655e8061fb880ed3415b741a90275c1`；exact Preview SHA parity 因此仍为 pending。该检查只读，没有部署或配置修改。
- 推送 parity 证据提交 `bf1e936d` 后再次读取 Vercel 部署列表，尚未出现匹配当前 canonical head 的新部署；Preview 仍停留在 `6b0e629d8b6694a06b98182a38da01d34718c44f`。当前 head 以 `npm run project:status` 输出为准，不能用旧 Preview 作为发布 SHA。
- 继续修复 Preview parity 时，通过已授权 Vercel API 使用 Git-connected `codex/unified-rc-visual-v1` + 当前 SHA 创建 Preview；请求被 Vercel 明确拒绝为 `api-deployments-free-per-day`（Hobby 每日超过 100 次，约 24 小时后恢复）。未创建部署、未触碰 Production、GitHub 或 Supabase；额度恢复后只需重试同一 Git SHA。
- 已新增 `npm run check:preview-parity` 作为可重复的只读门禁：当前输出确认 local SHA 与 `origin/codex/unified-rc-visual-v1` 一致，但 Vercel canonical-branch Preview 仍为 `6b0e629d…`，命令明确返回 `NOT_SYNCHRONIZED`。该门禁不触发部署、不修改 Supabase 或配置。
- 最新远端 CI 证据（2026-08-26）：旧 head `6e6e2b97` 的 `RC Convergence V1` `32945314825`、`Result UX Head Integrity V1` `32945314743` 通过；`Surface System V1` `32945314731` 因陈旧 `max-w-[920px]` 断言失败，`UI Regression V1` `32945314830` 因设置 Dialog 关闭竞态失败。修复提交 `a7b85171` 已推送，需以新 head 的 Actions 结果复核；Vercel exact Preview Git SHA 与 Supabase schema/RLS 仍 pending。
- 最近完成：`Compatibility evidence boundary migration`（`6b0e629d`）。配对判断显式固定为 `species_only`，避免鱼缸级捕食/负载启发式污染逐对结论；聚合结果额外合并 `tank` scope，保留容量、设备、温度和负载硬约束，视觉适配器展示聚合主阻断；证据 getter 只暴露 `reviewed` 状态。已审核物种但没有已审核配对规则时统一返回 `insufficient_data`，显式已审核配对规则继续保留阻断/谨慎权威。新增覆盖回归、优先级 scorecard、高负载与视觉权威测试：501 条物种、7 个 reviewed profiles、4 个 reviewed pair rules、12 个优先方向，其中 2 个可记录结论、8 个资料不足、2 个不建议。未改 API、数据库、Supabase 或视觉几何。
- 最近完成：`Species Detail` 回归脚本对齐当前产品契约（待本地提交）。测试 fixture 使用当前孔雀鱼 ID `sp_0436`，当前缸内谨慎路径验证“查看风险后确认添加 → 混养计算”，鱼缸入口改用 `data-tank-species-entry`；手机布局断言改为验证结论后动作顺序，避免把已淘汰的首屏按钮可见性和旧样式当作当前真相。
- 最近完成：`Species Detail evidence authority`。详情关键理由、混养证据状态和来源提示消费统一 `TankCompatibilityResult`；`housingReason` 仅显示为档案参考并明确不覆盖计算结果。保持当前视觉基线，未迁移 RC 详情布局。新增 `src/modules/knowledge/compatibilityEvidencePresentation.ts` 与专项回归。
- 最近完成：`Recommendation authority and severity`（`9fcad4a2`）。推荐候选保留与 direct/adjustable/blocked 严重级别消费统一 `TankCompatibilityResult`；“建议单养”、负载和群游局部启发式不再独立硬阻断，理由优先使用 canonical summary。保持当前视觉基线，未迁移 RC 推荐 UI；专项契约回归通过。
- 最近完成：`Vercel/API runtime contract`（`039135ba`）。新增 V1 catch-all、精确 namespace root 与 nested API-before-SPA rewrites、standalone canonical Express runtime、ESM-safe imports、AI/health 兼容边界与本地 contract/smoke 回归；未迁移 RC 的 LifeStage、数据库字段或业务 API 语义变化，保持当前视觉基线。独立 Critic 六维复验 PASS；exact Preview SHA 仍是发布门禁。
- 最近完成：`Result UX workflow head integrity`。仅保留候选 PR head/规范推送 SHA checkout 与 `git rev-parse HEAD` 精确校验，新增 `.github/workflows/result-ux-head-integrity-v1.yml` 和本地静态契约；未复制历史 Result UX 页面、旧 workflow 或 UI，未改 Supabase/API/视觉基线。远端 PR workflow run 仍待该文件进入 PR base/default 交付路径。
- 下一功能审查单元：Preview/Supabase parity；保持当前视觉基线，不自动改 Supabase schema/RLS 或 API 契约。
- **视觉决策更新：** 用户确认当前 4317 版本可用作工作基线，但仍有后续视觉问题；后续修改必须按模块和视口渐进推进，并保留正式组件、Rail/Sheet/Blocking 语义。
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
- 2026-08-26 运行状态：本地预览服务已恢复，使用当前 `dist` 产物运行于 `127.0.0.1:4317`；`/` 与 `/_preview/interactive` 均已通过 HTTP 200 检查。若浏览器仍显示旧错误，请刷新该标签页。

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

### P1 — Compatibility evidence coverage 只有 1.4%

当前 501 条物种有 7 条 reviewed behavior profile、4 条 reviewed pair rule，仍有 494 条物种没有审核画像，广泛配对覆盖仍不足。优先矩阵 12 个方向中只有 2 个可记录结论，8 个 fail closed 为 `insufficient_data`，2 个为 `not_recommended`。这不是 UI bug，而是证据覆盖不足。禁止降低 evidence gate 来制造“可尝试”结果；下一步应扩 reviewed evidence + citation + confidence。

### P1 — Deployment parity 尚未完成

Identify、Aquarium Surface、Collection 子页、Settings guard、Search → Detail 与 28-case 全页面 matrix 均已 browser 验证。当前视觉基线已获用户确认；剩余是 Vercel 同 SHA parity、Supabase schema/RLS parity，以及后续新改动持续回归。

### P2 — Remaining stale-test / dead-style debt

`window.confirm` = 0；业务手写 `role=dialog` / `aria-modal` = 0；所有业务 DialogContent 显式 `surface=`。剩余主要是旧测试/死样式和最终分支 semantic reconciliation。

## 当前测试 / 证据状态

当前最新本地 product/test baseline（基于 `2086059`）：

- `npm run lint` / `tsc --noEmit`：PASS
- `npm run test:compatibility-evidence-coverage`：PASS（501 / 7 / 4；未审核配对 fail closed）
- `npm run test:compatibility-coverage-scorecard`：PASS（12 个优先方向；2 个可记录）
- `npm run test:compatibility`：PASS（17 个兼容性断言）
- `npm run test:compatibility-evidence`：PASS
- `npm run test:recommendation-authority`：PASS
- `PREVIEW_URL=http://127.0.0.1:4317 node scripts/verify-species-detail-experience.mjs`：PASS
- `node scripts/verify-page-runtime-matrix.mjs`：PASS（28/28）
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
- Compatibility evidence audit：501 total / 7 reviewed profiles / 4 reviewed pair rules / **1.4% profile coverage**；优先矩阵 12 个方向中 2 个可记录、8 个资料不足、2 个不建议。

注意：以上属于 local build/browser evidence；用户已对当前 4317 工作基线完成视觉确认，但这不等于部署 parity 或 `main` release acceptance。

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

### Step 2 — Preview/Supabase parity

- 继续使用 `http://127.0.0.1:4317/` 作为开发验收源；
- 当前 4317 视觉方向已获用户确认；后续 UI owner 变更必须重新做固定视口人工验收；
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
# AquaGuide Handoff — Latest

更新时间：2026-08-26 23:55 +08:00

## 本轮新增

- 混养评估补充 `compatibility_pair_evaluated` 会话级事件：每个逐对结论记录 `status` 与规范化 `pairKey`，仅接受 catalog `sp_####` ID，拒绝自由文本、路径样式值和自配对；不写入数据库、不影响运行时结论。
- `npm run test:session-events` 已覆盖 allowlist、方向归一化、隐私拒绝和 reset；混养/证据覆盖回归与 production build 也通过。
- 当前工作区有本轮三文件未提交改动，提交前不得以 `project:status` 的 dirty 状态作为发布通过。

## 当前工作基线
