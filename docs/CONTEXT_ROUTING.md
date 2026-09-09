# Context Routing

本项目的长期事实来源按职责分开维护；本文件只说明各类信息的 canonical home，不复制完整产品规则。

| 信息类型 | Canonical destination |
|---|---|
| 产品定位与用户路径 | `docs/product/*`、`docs/PROJECT_TRUTH.md` |
| 业务规则与验收行为 | `docs/rules/*`、`docs/cases/*` |
| 未确认提案与决策理由 | `.ai/DECISION_LOG.md` |
| 数据/API/架构契约 | `CONTRACT.md`、`docs/architecture/*` |
| 当前实施状态 | `HANDOFF.md` |
| 长期实施历史 | `PROGRESS.md`、`40-DOCS/CHANGELOG.md` |
| 外部证据与缺口 | `docs/evidence/*`、`.project-journal/EVIDENCE_GAPS.md` |
| AI 协作任务状态 | `.ai/CURRENT_GOAL.md`、`.ai/TASK_QUEUE.md`、`.ai/CHANGELOG_AI.md` |

## 当前 Species SEO 入口

- Figma 设计交接：`.ai/CODEX_FIGMA_SEO_HANDOFF.md`
- 用户端页面当前状态：`HANDOFF.md`、`PROGRESS.md`
- 页面数据契约边界：`CONTRACT.md`
- 项目证据：`.project-journal/events.jsonl`、`.project-journal/evidence-index.json`
- 公开页当前为本地优先、`noindex,follow` 预览；只有 Published SEO/editorial/FAQ/Alt 聚合可用后，才能定义公开 DTO/API 并移除索引门禁。

## 使用门禁

- 现有代码是当前行为证据，不自动等于产品真相。
- Product Truth 由现有 catalog/规则引擎维护；公开 SEO 内容不能改写参数或适配结论。
- Base/Variant 继承、FAQ、图片 Alt 和索引状态必须有审核依据；缺证据时保持缺失或 noindex。
- 不修改 `main`、Production Supabase 或生产部署，除非用户明确授权且完成相应验收。
