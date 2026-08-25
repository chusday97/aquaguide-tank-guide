# Context Routing

本文件定义 AquaGuide 的 durable context canonical home。完整同步纪律见根目录 `AI_PROJECT_PROTOCOL.md`。

| 信息类型 | Canonical destination |
|---|---|
| 编码前目标、用户确认的当前范围 | `.ai/CURRENT_GOAL.md`、`docs/PROJECT_TRUTH.md` |
| 当前产品承诺与模块状态 | `docs/01-definition/PRODUCT_TRUTH.md` |
| UI 基线与可见交互规则 | `docs/02-design/VISUAL_BASELINE.md`、`UI_REGRESSION_CONTRACT.md` |
| 产品原则与业务规则 | `docs/01-definition/`、`docs/02-design/`、`packages/domain-rules/` |
| 未确认提案 | `docs/decisions/DECISION_LOG.md`（状态 `PROPOSED`；如目录尚不存在先创建） |
| 数据、API、Supabase、Repository 契约 | `CONTRACT.md`、`packages/contracts/`、`docs/03-development/` |
| 可验收行为 | `docs/05-validation/`、相关 `scripts/` 测试 |
| 已发生的失败 | `BADCASE_LATEST.md`、`evaluation/badcases/`；不要把 UI badcase 写入 AI registry |
| 部署、环境与 parity 证据 | `docs/03-development/DEPLOYMENT_STATE.md` |
| 当前实施状态 | `.ai/PROJECT_STATE.json`、`.ai/TASK_QUEUE.md`、`HANDOFF_LATEST.md` |
| 长期实施历史 | `PROGRESS.md`、`40-DOCS/CHANGELOG.md` |
| 外部证据与证据缺口 | `docs/05-validation/`、`.project-journal/` |
| AI 协作目标与执行记录 | `.ai/` |
| 临时讨论 | 不持久化 |

规则：一个事实只保留在一个 canonical home；`HANDOFF.md` 只记录当前状态，`PROGRESS.md` 只记录历史，不复制完整产品规则。
