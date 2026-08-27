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

`IN_PROGRESS` — 当前工作树为 `codex/main-visual-recovery-v1`，目标是先恢复用户确认的正式互动视觉，再把经过门禁的恢复提交提升到 Draft PR #142 的 `codex/main-core-foundation-v1`。发布前仍需 Domain/Service 唯一权威、固定视口视觉、今日行动、exact Preview SHA、授权 schema/RLS parity 和 release acceptance；`main` 尚未合并。
