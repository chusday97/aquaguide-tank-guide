# AquaGuide Badcase → Automation Map — 2026-08-16

> 配套 `BADCASES_2026-08-16.md`。状态只表示“这个失败模式是否已经有 executable guard”，不表示对应用户功能已全部上线。

| Badcase | 当前状态 | 自动化 / PR | 说明 |
|---|---|---|---|
| `CATALOG-001` AI 推荐 catalog 外物种 | ✅ 核心 grounding contract 已自动化 | PR #36 `test-catalog-grounding-contract.ts` | canonical ID 可验证；unknown ID 保持 unresolved；不得因相似名称静默回退 |
| `CATALOG-002` 库外现有物种无法记录 | ⏳ 未实现 | 计划 P2 | 需要 #29 catalog identity + #34 canonical repository 汇合后实现 unresolved livestock persistence |
| `CATALOG-003` unresolved livestock 被推荐系统忽略 | ⏳ 未实现 | 计划 P2 | compatibility 必须把 unresolved 当前生物转成 missing evidence / `INSUFFICIENT_DATA` |
| `CATALOG-004` 低置信识别直接绑定 canonical species | 🟡 部分已有边界，未完成统一 contract | 后续 identity resolution | 需要照片识别候选与 catalog resolver 统一 |
| `REC-001` CTA 承诺替代方案但实际没有 | ⏳ 未实现 | Replacement MVP 前先修 CTA | 当前不能把 calculator 跳转包装成“已经生成替代方案” |
| `REC-002` 替代推荐丢失用户意图 | ⏳ 未实现 | Replacement Intent | 在 Replacement Engine 阶段实现 |
| `REC-003` 捕食结构下不断换另一种小鱼 | ⏳ 未实现 | Replacement Engine golden case | 必须允许 0 个安全同类替代 |
| `REC-004` evidence 不足包装成高置信推荐 | 🟡 Compatibility evidence gate 已有，Recommendation 仍需统一 | 后续 evidence-quality ranking | 环境匹配与行为证据质量必须分开 |
| `REC-005` fitScore 被当科学概率 | 🟡 语义底座已建立 | PR #37 | #37 明确 load/score 类 heuristic 不等于安全概率；UI 仍需迁移 |
| `MIX-001` 不说谁威胁谁 | 🟡 Engine 已有 affected species evidence，UI/action 未闭环 | Compatibility v2 | 需要 Conflict Graph / relation card |
| `MIX-002` 所有 blocker 都给同一句动作 | ⏳ 未实现 | Action Engine | 需要 fixability 分类 |
| `MIX-003` 移出 A 不模拟后果 | ⏳ 未实现 | Intervention Simulation | 需要 simulateWithout / destination evaluation |
| `DIAG-001` Care aggression 只给泛化建议 | ⏳ 未实现 | Unified Tank Diagnosis | Care Diagnosis 尚未接 compatibility graph |
| `EXPLAIN-001` “有效容量”像真实水量 | ✅ 语义 contract 已自动化 | PR #37 `test-recommendation-explanation-contract.ts` | 54L 仍是 54L；filter / oxygen / maintenance 不能解释成更多升水 |
| `EXPLAIN-002` 固定 L/fish 通用规则 | 🟡 原则已固化，UI/推荐仍需迁移 | PR #37 + 后续 UI | 水量只能是约束之一，不能成为通用换算公式 |
| `EXPLAIN-003` “建议 6 条”无来源等级 | ⏳ 未实现 | group-size evidence model | 需区分 reviewed / structured / heuristic fallback |
| `EXPLAIN-004` 只显示负载百分比 | ✅ 语义 contract 已自动化，UI 未迁移 | PR #37 | load pressure 先映射 qualitative band；unknown capacity 不得 fake 0% |
| `FACT-001` 缺数据默认常见值 | ✅ 已有 executable guard | PR #29 `test-recommendation-profile-certainty.ts`；PR #37 复跑 | unknown tank 不造 Freshwater / 60×40×40 / direct plan |
| `FACT-002` 已存在不安全事实被阻止保存 | ✅ policy contract 已有 | #34 / `test-addition-intents.ts` | `record_existing` 保存事实，`planned_addition` 继续 safety gate |
| `EVAL-*` 严重风险 false negative / 推荐效果 | 🟡 部分 deterministic gates 已有，真实效果未建立 | 后续 Recommendation evaluation suite | 不能宣称真实推荐准确率 |

## 当前自动化优先级

下一批最值得转 executable 的 case：

1. `CATALOG-002` / `CATALOG-003` — unresolved species 事实与 recommendation uncertainty；
2. `REC-001` — CTA 先与真实能力一致；
3. `EXPLAIN-003` — group-size 来源等级；
4. `MIX-001` / `MIX-002` — 具体 A→B + fixability；
5. `REC-003` — 替代推荐必须允许空结果。

## 依赖提醒

`CATALOG-002/003` 不应在当前任意单边分支强行实现：

- catalog identity / unknown 语义在 #29 stack；
- canonical repository / cross-device facts 在 #34 stack。

两条基线汇合前先保留 executable contract 和数据模型设计，避免制造难以回收的交叉 PR。
