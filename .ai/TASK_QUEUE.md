# Task Queue

## P0 — Progress unification

- [x] 建立 `codex/unified-rc-visual-v1`，基于用户确认的视觉 SHA `37a8d4d1`。
- [x] 建立 `.ai/PROJECT_STATE.json` 作为唯一状态入口。
- [x] 审计 RC 提交并建立 `.ai/RC_MIGRATION_LEDGER.md`。
- [x] 完成 P0 数据/契约影响评审 `.ai/P0_MIGRATION_IMPACT.md`。
- [x] 用户确认 P0 迁移的类型、证据和派生服务范围。
- [x] 只迁入有产品规则、测试和受影响文件证据的 RC 业务能力。
- [x] 创建唯一 RC 目标 PR，并将本地预览、PR head 和状态入口对齐。
- [x] 新增 `npm run project:status` 与 RC 收敛 CI，防止状态入口和分支漂移；GitHub Actions run `32846848569` 已真实通过。
- [x] 对 56 个 GitHub open PR 建立登记表；#141 为唯一收敛入口，其余 55 个已关闭并只作历史输入。
- [x] 建立 `docs/05-validation/MODULE_FACT_INVENTORY.md`，将产品、UI、领域规则、Service、数据/API、证据与部署状态放进同一模块事实索引。
- [x] 关闭 55 个历史 PR，保留其远端分支；#141 是唯一开放的当前收敛 PR，记录见 `docs/03-development/PR_CLEANUP_RECORD.md`。
- [x] 新增 `npm run audit:branch-convergence`，记录统一分支、`origin/main`、RC1 与远端分支的 Git 拓扑差异（`98977966`）。
- [x] 新增 `npm run check:branch-convergence`，在本地/远端 canonical SHA 不一致或远端关键 ref 缺失时阻断；统一分支 push CI 执行该检查。
- [ ] 对 `origin/main` 独有提交和历史来源按功能建立逐项迁移判定，不以提交数量或分支存在作为完成证据。
- [x] 完成 Species Detail evidence authority：详情关键理由和混养证据来源改由统一规则结果驱动，物种档案文字标记为参考；新增结构化证据适配回归。
- [x] 完成 Recommendation authority and severity：推荐候选保留与严重级别由统一混养结果裁决；新增 `npm run test:recommendation-authority`，未迁移旧推荐 UI。
- [x] 完成 Compatibility evidence coverage boundary：配对判断显式使用 `species_only` scope，已审核物种但未审核配对时 fail closed；新增覆盖矩阵与 scorecard 回归，未整批合并 `origin/main`。
- [x] 完成 Vercel/API runtime contract 本地迁移审查：新增 V1 catch-all、API-before-SPA rewrite、canonical Express runtime 和 ESM-safe imports；未修改 Supabase schema、RLS、LifeStage 或业务 API 字段。
- [x] 完成 Result UX workflow head integrity 本地迁移审查：仅保留 PR head/推送 SHA checkout 与 `git rev-parse HEAD` 精确校验；未复制历史 Result UX 页面、旧 workflow 或 UI。
- [ ] 完成授权 Supabase schema/RLS 只读 parity；Vercel exact Preview SHA 已在 canonical head `9f1a543c…` 通过只读门禁确认与 local/remote/PR 同步。
- [x] 新增 `npm run check:preview-parity`，自动比较 local/remote/Vercel branch Preview SHA；当前结果明确报告 `NOT_SYNCHRONIZED`，不把旧 Preview 误报为通过。
- [x] 统一浏览器回归的 Preview URL 入口为 `scripts/preview-url.mjs`（默认 4317），并修复核心/导航脚本中已淘汰的断点、入口和 surface 断言；桌面沉浸式 Dock 恢复可见 AI 建缸助手卡片，移动端保留“更多操作”入口。
- [x] 第二轮陈旧回归审计：修复 Care category、Daily Discovery、Species Detail、动作语义和手机优先级中残留的旧 detail surface/首页推荐/英文入口断言，并把 3000 开发地址与 4317 production 验收地址在 README/SETUP 中明确区分；受影响回归与全页面矩阵 28/28 已通过。
- [x] 注册 canonical UI smoke：移除旧 3003 端口和过时默认图鉴搜索假设，新增 `npm run test:ui-smoke`，覆盖正式路由、搜索、互动图鉴六项发现、鱼缸唯一缸内物种入口和无重复推荐。
- [x] 将 UI Regression / Surface System push CI 收口到 `codex/unified-rc-visual-v1`，并把 canonical UI smoke 纳入统一浏览器工作流。
- [x] 对 `origin/main` Care card 能力完成首轮语义复核：统一分支已有本地“分享卡片”流程，补充 canonical Care card 浏览器门禁，不迁入重复 UI。
- [x] 建立 `docs/03-development/ORIGIN_MAIN_RECONCILIATION.md`，记录首轮高影响能力的“已存在 / 选择性迁移 / 契约复核 / 历史排除”判定；其余 origin/main 独有提交仍待逐项复核。
- [x] 复核 `origin/main@daadc2a3` Settings sharing 状态：统一分支保留已实现的脱敏报告流程，不复制“建设中”降级，并用 Settings → 导出与分享浏览器回归守住真实入口。
- [x] 将核心三层契约、API、混养、当前鱼缸、水质、证据、推荐和分享回归纳入 `RC Convergence V1` canonical CI。
- [x] 修复 Surface workflow 陈旧 `max-w-[920px]` 断言与 Aquarium 设置关闭后的 CI 点击竞态；本地回归通过，提交 `a7b85171` 已推送。
- [x] 根据远端日志修复 Aquarium 添加生物点击后的导航等待竞态；本地回归通过，提交 `a90911fa` 已推送。
- [x] 根据远端日志将 Aquarium 两个设置面板切换点击设为 `noWaitAfter`；本地回归通过，提交 `78160db3` 已推送。
- [x] 修复 UI Regression 静态 Preview 缺少 `/api/v1` fallback 的环境缺口：启动 Express API + Vite proxy，API+Vite 本地 Identify/Aquarium 回归通过，提交 `0b52e947` 已推送。
- [x] 观察 `0b52e947` 后续 canonical Actions：UI `32948782199`、Surface `32948782231`、Result UX `32948782259`、RC `32948782285` 全部通过；最终 head 为 `ef878e25`，local/remote/PR 同步。
- [x] 修复 `check:preview-parity` 在无系统 Vercel CLI 时的误报，并确认 `f2a5ec47` 的 local/remote/PR/Vercel SHA parity `PASS`。
- [ ] 完成授权部署环境的 Vercel exact SHA 与 Supabase schema/RLS parity 复核。

## Eight-phase truth consolidation

- [x] Phase 1: 建立项目、产品、UI、部署的 canonical truth 文件与总入口。
- [x] Phase 2: 将冲突/重复文档降级为历史入口或改为链接，不删除证据。
- [x] Phase 3: 将 4317 视觉基线、路由和回归证据整理为唯一 UI 验收入口；2026-08-25 自动门禁通过。
- [x] Phase 4: 将功能清单收口为“已验证 / 已部署待复验 / 未迁入 / 废弃”。
- [ ] Phase 5: 模块事实盘点已建立；只读 PostgREST 已核对 31/31 契约表和最新字段，仍缺 exact migration revision、直接 RLS policy metadata 与 exact Preview Git SHA。
- [x] Phase 6: 固化 Git/PR 模板和 CI 门禁，阻止新的平行交付线；RC branch protection 等待 workflow 进入基分支后的管理员配置。
- [x] Phase 7: 用户已接受 P0 兼容性契约；已选择性迁入本地生命周期、审核证据、当前鱼缸/换水纯规则与派生服务，保留现有 UI。
- [ ] Phase 8: 发布就绪表已建立；P0 实现和当前视觉基线人工验收已通过，仍等待 exact Preview SHA、授权 Supabase schema/RLS parity 和用户单独 release acceptance。

## Release Gate

- [ ] 统一 RC 分支验收通过后，再单独评估是否合并 `main`。
- [ ] 视觉 AI 未配置时继续保持 `manual_confirmation` 回退语义。
- [ ] 关键节点前完成本地验证；未达到关键节点不推送远端。

## Not in Scope

- 不新增静态鱼缸。
- 不改变业务数据、混养规则、API 或 Supabase 契约。

## Protocol Maintenance

- [x] 建立八文件 `.ai/` 结构、项目协议和 Context Routing。
- [ ] 每次编码前读取 `CURRENT_GOAL.md`、`PRODUCT_CONTEXT.md`、`DECISION_LOG.md`。
- [ ] 每次变更后更新 `CHANGELOG_AI.md`、`EXECUTION_LOG.md`、`TASK_QUEUE.md`。
