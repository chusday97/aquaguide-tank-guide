# Current Goal

> 初始化日期：2026-08-25。以下内容仅整理自当前 `PROGRESS.md` 与 `HANDOFF.md`，没有新增产品决策。

## 当前目标

完成 AquaGuide 的单一事实收口：

1. 以用户确认的 `37a8d4d1` 作为唯一视觉基准。
2. 为产品、UI、部署、数据契约、进度和 Git 建立不冲突的 canonical home。
3. 将旧 PR、历史状态与历史 Handoff 降级为可追溯证据，而不是当前真相。
4. 在完成数据契约确认后，将 RC 的已验证业务能力按语义选择性迁入统一分支。
5. 让本地工作树、GitHub PR、交接文档、预览与部署证据都可追溯到同一交付线。

## 关键约束

- 视觉 AI 未配置时必须明确回退到手动物种确认，不得表述为识图已启用。
- 未经数据契约确认，不修改既有业务数据、混养规则或 API 契约。
- 远端推送只在关键节点执行；本次初始化不推送。

## 当前状态

`IN_PROGRESS` — 当前唯一工作树为 `codex/main-core-foundation-v1`，目标是在保留已验证底层能力的前提下恢复 `37a8d4d1` 的正式视觉，并完成 Domain/Service、生产 Supabase migration history、Preview SHA 和 release acceptance 门禁后合并 `main`。4317 仅运行冻结视觉基线，4319 运行当前候选；`main` 尚未合并。
