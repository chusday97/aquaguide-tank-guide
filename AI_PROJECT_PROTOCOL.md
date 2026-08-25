# AI Project Protocol

本文件是 AquaGuide 项目的 AI 协作入口。所有 AI 编码任务都必须遵守以下同步协议。

## Before coding（强制）

开始任何代码、配置、数据库、测试或文档变更前，必须按顺序读取：

1. `.ai/CURRENT_GOAL.md`
2. `.ai/PRODUCT_CONTEXT.md`
3. `.ai/DECISION_LOG.md`

然后读取 `docs/CONTEXT_ROUTING.md`，并按任务范围定位唯一 canonical 文档。

根据任务范围追加读取：

- 涉及架构、数据、API、持久化或权限：`.ai/ARCHITECTURE.md` 与 `CONTRACT.md`
- 涉及已知失败或回归：`.ai/BADCASES.md`
- 涉及当前交接：`HANDOFF.md`

现有代码只能证明当前行为，不能单独替代产品上下文或决策记录。

## After changes（强制）

每次有意义的变更后，必须更新 `.ai/` 内的：

1. `CHANGELOG_AI.md`：记录新增、修改、修复或移除
2. `EXECUTION_LOG.md`：记录读取内容、动作和验证结果
3. `TASK_QUEUE.md`：同步完成项、新待办和发布门禁

如产生对应事实，还必须更新：

- `.ai/BADCASES.md`：确认的失败或回归
- `.ai/DECISION_LOG.md`：决策及其状态；未获用户确认不得写成已接受
- `.ai/ARCHITECTURE.md`：架构、数据、API 或持久化变化

## Git 与远端

允许在关键步骤创建本地 commit。不要每一步 `git push`；只在用户要求、关键里程碑、审查/验收、预览或发布节点推送，并提前说明可能触发 Vercel 部署。

## 交付声明

交付时说明：`Context synced: <files changed>`；若没有持久化上下文变化，明确写 `No durable context changes.`。不得写入密钥、令牌、私人数据或未经验证的指标。
