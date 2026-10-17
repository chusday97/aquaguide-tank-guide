# AquaGuide 产品文档入口

> 最后核对：2026-10-17。
>
> **本页是仓库内当前文档的唯一阅读入口。** 旧专项、旧 PR/分支记录和阶段性审计只作为历史证据；当文档与当前代码、自动测试或运行时验证冲突时，以当前代码与验证结果为准。

## 先读这里

| 问题 | 当前入口 | 使用规则 |
| --- | --- | --- |
| 产品现在能做什么 | [当前产品状态](./01-definition/CURRENT_PRODUCT_STATUS.md) | 当前能力、部分完成项与明确限制 |
| 下一步做什么 | [产品卡点与路线图](./04-planning/PRODUCT_GAPS_AND_ROADMAP.md) | P0/P1/P2 的唯一当前 backlog |
| 产品目标与边界 | [PRD](./01-definition/PRD.md) | 产品方向；若实现状态变化，以“当前产品状态”为准 |
| 正式用户路径 | [信息架构](./02-design/INFORMATION_ARCHITECTURE.md) → [交互规范](./02-design/INTERACTION_SPEC.md) → [用户路径登记](./02-design/USER_PATH_REGISTRY.md) | 不从历史 UX 专项反推当前入口 |
| 技术架构 | [技术架构](./03-development/TECH_ARCHITECTURE.md) → [项目结构](./03-development/PROJECT_STRUCTURE.md) | 具体实现仍以源码为最终事实 |
| 数据 / API 契约 | [根契约](../CONTRACT.md) + `packages/contracts/` + `src/types/` | 类型、Schema 与迁移必须彼此一致 |
| 发布是否可上线 | `npm run test:backend-release-gate` + `npm run readiness:production-preflight` + Git/Vercel/Supabase 实时结果 | **不要**用静态历史部署报告判断当前 Production |

## 按角色阅读

| 读者 | 建议顺序 |
| --- | --- |
| 产品 / 设计 | 当前产品状态 → PRD → 信息架构 → 交互规范 → 路线图 |
| 开发 | 当前产品状态 → 技术架构 → 项目结构 → 数据/API 契约 → 路线图 |
| 测试 / 验收 | 当前产品状态 → [QA 验收](./03-development/QA_ACCEPTANCE.md) → [证据矩阵](./05-validation/EVIDENCE_MATRIX.md) → 路线图 |
| 新成员 / 新 Agent | 本页 → 当前产品状态 → 路线图；只有需要追溯原因时才进入历史资料 |

## 当前正式文档地图

### 产品定义

- [当前产品状态](./01-definition/CURRENT_PRODUCT_STATUS.md)
- [PRD](./01-definition/PRD.md)
- [用户故事](./01-definition/USER_STORIES.md)
- [功能目录](./01-definition/FEATURE_CATALOG.md)
- [产品事实](./01-definition/PRODUCT_TRUTH.md)

### 设计与交互

- [信息架构](./02-design/INFORMATION_ARCHITECTURE.md)
- [交互规范](./02-design/INTERACTION_SPEC.md)
- [正式用户路径登记](./02-design/USER_PATH_REGISTRY.md)
- [设计系统](./02-design/DESIGN_SYSTEM.md)
- [数据模型](./02-design/DATA_MODEL.md)
- [AI 与 API](./02-design/AI_AND_API_SPEC.md)

### 开发与验证

- [技术架构](./03-development/TECH_ARCHITECTURE.md)
- [项目结构](./03-development/PROJECT_STRUCTURE.md)
- [本地配置](./03-development/SETUP.md)
- [QA 验收](./03-development/QA_ACCEPTANCE.md)
- [变更记录](./03-development/CHANGELOG.md)
- [证据矩阵](./05-validation/EVIDENCE_MATRIX.md)
- [AI Evaluation 状态](./05-validation/AI_EVALUATION_STATUS.md)
- [发布就绪说明](./05-validation/RELEASE_READINESS.md)

### 当前计划

- [产品卡点与路线图](./04-planning/PRODUCT_GAPS_AND_ROADMAP.md)
- [后续执行计划](./04-planning/NEXT_EXECUTION_PLAN.md)
- [外部验收协议](./04-planning/EXTERNAL_VALIDATION_PROTOCOL.md)
- [3D、物种数据与图片性能基线](./04-planning/THREE_AND_ASSET_PERFORMANCE_BASELINE.md)

## Authority 规则

1. **当前状态只写一处**：功能完成度写入 `CURRENT_PRODUCT_STATUS.md`；待办优先级写入 `PRODUCT_GAPS_AND_ROADMAP.md`。
2. **安全结论不以文档覆盖代码**：Compatibility、Tank State、Care Guidance 等安全判断以 Domain Rules、契约和回归测试为准。
3. **发布状态必须实时验证**：Git 分支、Production SHA、Supabase parity、Vercel alias 都是运行时事实，不允许从旧部署报告推断。
4. **历史文件不得重新升级为当前 authority**：需要复用历史结论时，先用当前代码/测试重新验证，再更新正式文档。
5. **不存在的入口不得出现在本页**：本页本地 Markdown 链接由自动门禁校验。

## 历史资料

以下文件保留用于追溯设计选择、旧架构、失败尝试和历史验收，**不是当前实现入口**：

- [历史证据登记](./HISTORICAL_EVIDENCE.md)
- [Project Truth（历史路由图）](./PROJECT_TRUTH.md)
- [交互重构 PRD](./01-definition/UX_REFACTOR_PRD.md)
- [交互与视觉方案](./02-design/UX_REFACTOR_CONCEPTS.md)
- [交互重构规范](./02-design/UX_REFACTOR_INTERACTION.md)
- [交互重构技术说明](./03-development/UX_REFACTOR_TECH.md)
- [早期功能分析](./aquaguide_functional_analysis.md)
- [早期交互走查](./interaction_review.md)
- [CTA 与导航历史审计](./UX_NAVIGATION_AUDIT.md)
- [历史部署状态记录](./03-development/DEPLOYMENT_STATE.md)

这些文件可以解释“为什么曾经这么做”，但不能回答“现在产品是什么状态”。
