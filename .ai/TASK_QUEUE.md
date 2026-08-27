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
- [x] 对 56 个 GitHub open PR 建立登记表；#141 为唯一收敛入口，其余 55 个只作历史输入。

## Eight-phase truth consolidation

- [x] Phase 1: 建立项目、产品、UI、部署的 canonical truth 文件与总入口。
- [x] Phase 2: 将冲突/重复文档降级为历史入口或改为链接，不删除证据。
- [x] Phase 3: 将 4317 视觉基线、路由和回归证据整理为唯一 UI 验收入口；2026-08-25 自动门禁通过。
- [x] Phase 4: 将功能清单收口为“已验证 / 已部署待复验 / 未迁入 / 废弃”。
- [ ] Phase 5: 已完成非敏感环境、18 份 migration、31 表契约和分支 Preview 审计；仍需授权只读核对已部署 Supabase 的 schema/RLS 与 exact SHA parity。
- [x] Phase 6: 固化 Git/PR 模板和 CI 门禁，阻止新的平行交付线；RC branch protection 等待 workflow 进入基分支后的管理员配置。
- [x] Phase 7: 用户已接受 P0 兼容性契约；已选择性迁入本地生命周期、审核证据、当前鱼缸/换水纯规则与派生服务，保留现有 UI。
- [ ] Phase 8: 发布就绪表已建立；P0 实现已通过，仍等待 exact Preview SHA、授权 Supabase schema/RLS parity 和单独 release acceptance。

## Release Gate

- [ ] Visual recovery: restore the user-confirmed 37a8d4d1 preview and rerun the fixed-viewport matrix before updating PR #142.
- [ ] Keep 4317 as the frozen visual reference and use an independent candidate port; never infer version from the port alone.
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
