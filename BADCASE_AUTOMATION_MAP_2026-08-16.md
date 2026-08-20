# AquaGuide Badcase → Automation Map — 2026-08-16

> 配套 `BADCASES_2026-08-16.md`。这里记录 executable guard 与 rollout 状态；Draft / CI green / remote schema deployed 三者必须分开描述。

| Badcase | 当前状态 | 自动化 / PR | 说明 |
|---|---|---|---|
| `CATALOG-001` AI 推荐 catalog 外物种 | ✅ 核心 grounding 自动化 | PR #36 | canonical ID 可验证；unknown ID 保持 unresolved；相似名称不得静默回退 |
| `CATALOG-002` 库外现有物种无法记录 | ✅ 代码/UI/browser + remote schema + RLS acceptance | PR #38 | `record_existing` 可按 raw name 保存；canonical identity 保持 NULL；remote migration 已部署并验证；cross-device deployed browser 尚待外部环境 |
| `CATALOG-003` unresolved livestock 被推荐系统忽略 | ✅ fail-closed 自动化 | PR #38 | unresolved 当前生物进入 missing evidence，aggregate 至少 `insufficient_data`；重复窄版 PR #39 已关闭 |
| `CATALOG-004` 低置信识别直接绑定 canonical species | 🟡 部分边界 | 后续 identity resolution | 识别候选仍需与 catalog resolver 统一 |
| `REC-001` CTA 承诺替代方案但实际没有 | 🟡 engine 已开始，UI 未接 | PR #40 + 后续 UI | #40 已提供真实 replacement result model；当前 CTA 仍需从 calculator 假跳转迁移到真实 panel |
| `REC-002` 替代推荐丢失用户意图 | 🟡 executable MVP 已提交 | PR #40 | v1 intent = life type / water / role / social / size / difficulty；同角色优先且当前为 hard filter |
| `REC-003` 捕食结构下不断换另一种小鱼 | 🟡 golden case 已提交 | PR #40 | reviewed predator + small schooling replacement 必须允许 `no_safe_same_intent_alternative`，不能强凑 Top N |
| `REC-004` evidence 不足包装成高置信推荐 | 🟡 Replacement 层已加降级，覆盖仍稀疏 | PR #40 + compatibility evidence | 已有 livestock 且 candidate 缺 reviewed behavior profile 时 nominal compatible → `needsConfirmation` |
| `REC-005` fitScore 被当科学概率 | 🟡 语义底座已建立 | PR #37 | heuristic 不等于安全概率；真实 UI 仍需迁移 |
| `MIX-001` 不说谁威胁谁 | 🟡 Engine 已有 affected species evidence | 后续 Conflict Graph | 需要 relation card / source→target 可视化 |
| `MIX-002` 所有 blocker 都给同一句动作 | ⏳ 未实现 | Action Engine | 需要 fixability 分类 |
| `MIX-003` 移出 A 不模拟后果 | ⏳ 未实现 | Intervention Simulation | 需要 simulateWithout / destination evaluation |
| `DIAG-001` Care aggression 只给泛化建议 | ⏳ 未实现 | Unified Tank Diagnosis | Care Diagnosis 尚未接 compatibility graph |
| `EXPLAIN-001` “有效容量”像真实水量 | ✅ 语义 contract | PR #37 | 54L 仍是 54L；filter/oxygen/maintenance 不得解释成更多真实水量 |
| `EXPLAIN-002` 固定 L/fish 通用规则 | 🟡 原则已固化 | PR #37 + UI | 水量只是约束之一 |
| `EXPLAIN-003` “建议 6 条”无来源等级 | ⏳ 未实现 | group-size evidence model | 需区分 reviewed / structured / heuristic fallback |
| `EXPLAIN-004` 只显示负载百分比 | ✅ 语义 contract，UI 未迁移 | PR #37 | qualitative pressure；unknown capacity 不 fake 0% |
| `FACT-001` 缺数据默认常见值 | ✅ executable guard | PR #29 + #37 regression | unknown tank 不造 Freshwater / 60×40×40 / direct plan |
| `FACT-002` 已存在不安全事实被阻止保存 | ✅ policy contract | #34 / #38 | 现实事实可记录；planned addition 继续 safety/catalog gate |
| `EVAL-*` 严重风险 false negative / 推荐效果 | 🟡 部分 deterministic gates | 后续 evaluation suite | 不能宣称真实推荐准确率 |

## CATALOG-002 / 003 rollout 事实

PR #38 当前已经完成：

- clean-head permanent read-only CI ✅
- remote migration `20260816103423_unresolved_existing_livestock` ✅
- source-control migration version 与 remote history 对齐 ✅
- truth constraint / partial unique index / SECURITY INVOKER / grants 检查 ✅
- Supabase security advisor：无新增 WARNING ✅
- authenticated ownership + cross-user isolation + idempotent replay acceptance ✅
- acceptance transaction rollback 后无测试数据 ✅

仍未完成：

- deployed-browser true cross-device unresolved hydrate；
- Device B hydrate 后 candidate compatibility 必须 cloud path 返回 `insufficient_data`。

因此 #38 仍是 Draft，不能描述成 main/production。

## REC-001 / 002 / 003 当前推进

PR #40 正在把“替代方案”从文案承诺变成 deterministic engine：

```text
rejected candidate
→ derive intent
→ same-life/water/role pool
→ evaluateTankCompatibility(candidate)
→ recommended / conditional / needsConfirmation / excluded
→ allow zero safe alternatives
```

当前 golden cases：

1. neon tetra → cardinal tetra 同类意图；
2. predator structure → 0 safe small-schooling alternative；
3. unresolved current resident → formal replacement fail-closed；
4. unrelated large cichlid 不得作为 filler。

UI 只有在 #40 engine contract 绿后才接入 `查看风险与替代方案`。

## 下一批自动化优先级

1. #40 Replacement engine golden cases 全绿；
2. `REC-001` 真 CTA + result panel；
3. `EXPLAIN-003` group-size evidence level；
4. `MIX-001` source→target conflict edge；
5. `MIX-002` fixability/action mapping；
6. `CATALOG-004` recognition identity resolution。
