# AquaGuide 产品文档索引

> 最后核对：2026-08-25。当前代码、真实浏览器行为和自动测试优先于旧报告或历史对话。

> **先读：** [Project Truth](./PROJECT_TRUTH.md)。它定义当前唯一交付线和每类事实的 canonical home；本页其余旧文档按该路由理解。

## 产品定位

> 面向水族新手的鱼缸管理、物种选择、混养决策与养护补救助手。

AquaGuide 以“先用确定性规则给出安全边界，再由 AI 解释”为核心原则，帮助用户把查资料、判断能否混养、记录日常异常和执行补救步骤串成一条短路径。

## 阅读入口

| 读者 | 建议顺序 |
| --- | --- |
| 产品与设计 | [项目真相](./PROJECT_TRUTH.md) → [产品真相](./01-definition/PRODUCT_TRUTH.md) → [视觉基线](./02-design/VISUAL_BASELINE.md) → [PRD](./01-definition/PRD.md) |
| 开发 | [项目真相](./PROJECT_TRUTH.md) → [技术架构](./03-development/TECH_ARCHITECTURE.md) → [数据契约](../CONTRACT.md) → [部署状态](./03-development/DEPLOYMENT_STATE.md) |
| 测试与验收 | [用户故事](./01-definition/USER_STORIES.md) → [QA 验收](./03-development/QA_ACCEPTANCE.md) → [外部验收协议](./04-planning/EXTERNAL_VALIDATION_PROTOCOL.md) → [交付检查](./delivery-checklist.md) |
| 新成员 | [项目 README](../README.md) → 本页 → [本地配置](./03-development/SETUP.md) |

## 文档地图

### 01 产品定义

- [PRD](./01-definition/PRD.md)：用户、问题、目标、功能优先级和成功指标。
- [用户故事](./01-definition/USER_STORIES.md)：核心场景及验收口径。
- [竞品分析](./01-definition/COMPETITIVE_ANALYSIS.md)：当前市场能力对比与差异化机会。
- [产品真相](./01-definition/PRODUCT_TRUTH.md)：当前产品承诺与模块状态的唯一入口。
- [当前产品状态（历史快照）](./01-definition/CURRENT_PRODUCT_STATUS.md)：2026-08-01 阶段快照，不覆盖产品真相。
- [交互重构 PRD（专项）](./01-definition/UX_REFACTOR_PRD.md)：水族册和分层表面的历史专项定义。

### 02 设计

- [信息架构](./02-design/INFORMATION_ARCHITECTURE.md)
- [交互规范](./02-design/INTERACTION_SPEC.md)
- [正式用户路径登记](./02-design/USER_PATH_REGISTRY.md)
- [设计系统](./02-design/DESIGN_SYSTEM.md)
- [视觉基线](./02-design/VISUAL_BASELINE.md)
- [数据模型](./02-design/DATA_MODEL.md)
- [AI 与 API](./02-design/AI_AND_API_SPEC.md)

### 03 开发与验收

- [技术架构](./03-development/TECH_ARCHITECTURE.md)
- [项目结构](./03-development/PROJECT_STRUCTURE.md)
- [本地配置](./03-development/SETUP.md)
- [QA 验收](./03-development/QA_ACCEPTANCE.md)
- [部署状态](./03-development/DEPLOYMENT_STATE.md)
- [变更记录入口](./03-development/CHANGELOG.md)

### 04 计划

- [后续执行计划](./04-planning/NEXT_EXECUTION_PLAN.md)（当前去重后的待办与外部门禁）
- [产品卡点与路线图](./04-planning/PRODUCT_GAPS_AND_ROADMAP.md)
- [3D、物种数据与图片性能基线](./04-planning/THREE_AND_ASSET_PERFORMANCE_BASELINE.md)
- [外部验收协议](./04-planning/EXTERNAL_VALIDATION_PROTOCOL.md)（真人新手、真实鱼缸跨入口与低端真机）
- [云同步方案评估](./04-planning/CLOUD_SYNC_EVALUATION.md)（只评估，不实施）
- [证据矩阵](./05-validation/EVIDENCE_MATRIX.md) · [产品假设](./05-validation/PRODUCT_HYPOTHESES.md) · [真人测试结果](./05-validation/USER_TEST_RESULTS.md) · [AI Evaluation 状态](./05-validation/AI_EVALUATION_STATUS.md)

## 单一事实来源

| 内容 | 事实来源 | 维护规则 |
| --- | --- | --- |
| 当前产品承诺与模块状态 | `docs/01-definition/PRODUCT_TRUTH.md` | 产品行为变化时更新 |
| UI 基线与交互行为 | `docs/02-design/VISUAL_BASELINE.md` + `UI_REGRESSION_CONTRACT.md` + 工作区 `interaction-rules.md` | 用户确认视觉或新增交互规则时同步 |
| 数据和 AI 契约 | [`CONTRACT.md`](../CONTRACT.md) + 类型文件 | 先改契约，再改实现和说明 |
| 部署与环境证据 | `docs/03-development/DEPLOYMENT_STATE.md` | 部署、环境或 parity 验证变化时更新 |
| 当前进度 | `.ai/PROJECT_STATE.json` + `.ai/TASK_QUEUE.md` | 每个独立步骤完成后更新 |
| 长期历史 | [`PROGRESS.md`](../PROGRESS.md) | 只追加已完成历史，不定义当前状态 |
| 项目结构 | [`PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md) | 新增、删除或移动模块时更新 |
| 变更记录 | [`40-DOCS/CHANGELOG.md`](../40-DOCS/CHANGELOG.md) | 功能、修复和移除实时追加 |

## 历史审计说明

`aquaguide_functional_analysis.md`、`interaction_review.md`、`UX_NAVIGATION_AUDIT.md` 等文件保留作为阶段性证据。前两份报告包含天气联动、旧弹窗和旧架构判断，不再代表当前产品能力；当前事实以本索引链接的正式分册为准。
