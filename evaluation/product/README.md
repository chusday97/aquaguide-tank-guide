# AquaGuide Product Evaluation

本目录用于记录 **产品交互、任务闭环、响应式 UI、状态设计** 的评测集和 Badcase。它与上层 `evaluation/` 的模型/规则评测并行：模型评测回答“AI 输出是否正确”，这里回答“用户在真实产品状态里能不能完成任务、失败时会发生什么”。

## 六状态最低覆盖规则

“每个功能至少设计 6 种状态”不是要求做 6 个页面，而是要求在上线前覆盖至少 6 类**可观察状态**。默认骨架是：

| 状态 | 要回答的问题 |
|---|---|
| Initial / Default | 用户刚进入时看到什么？主 CTA 是什么？ |
| In progress / Loading | 点击后等待期间如何反馈？能否重复点击、取消、离开？ |
| Success | 成功后真实状态是否更新？用户下一步是什么？ |
| Empty / Missing context | 没数据、没鱼缸、没结果、没收藏时怎么办？ |
| Failure | 网络/API/写入/模型失败时如何恢复？是否保留用户输入？ |
| Boundary / Conflict | 信息不足、冲突、高风险、对象失效、重复提交等业务边界怎么处理？ |

这六类只是**最低骨架**。具体功能必须把第 6 类替换成最重要的业务边界，而不是机械凑数。例如：混养的关键边界是“明确冲突”，识别的关键边界是“低置信度/多候选”，保存类功能的关键边界是“部分成功/重复提交”。

## 当前评测集

- `feature-states.v1.json`：核心功能状态矩阵。每个注册功能必须 `states.length >= 6`。
- `core-flow-v1.json`：混养 + 添加生物的可执行状态 Case。
- `core-flow-v2.json`：换水 + 每日检查的可执行状态 Case。
- `golden-path-v1.json`：5 条跨模块核心用户旅程。它不替代单功能状态测试，而是检查用户能否从入口连续完成目标。
- `badcases.v1.jsonl`：开发、用户测试、回归中发现的产品 Badcase。发现即记录，不等到功能做完再补。
- `scripts/test-product-evaluation.mjs`：校验 Feature State 与 Badcase 基础结构。
- `scripts/test-golden-path-acceptance.mjs`：校验 Golden Path 里程碑、禁止项与自动化证据映射。
- `scripts/test-compatibility-evidence-coverage.ts`：用真实图鉴物种验证“可记录组合必须有 reviewed evidence”，并防止和平小型鱼被误判成捕食者。
- `scripts/verify-golden-path-species-to-stocking.mjs`：GP-002 连续 Chromium 验收，从搜索具体物种一直验证到真实入缸后的持久化数量。

## Golden Path 验收规则

Golden Path v1 固定覆盖五条旅程：

1. 首次使用 → 建鱼缸 → 补参数。
2. 找物种 → 看详情 → 加入混养 → 入缸。
3. 老用户回访 → 今日任务 → 完成一次养护动作。
4. 发现异常 → 快速检查 → 养护指南 → 立即行动。
5. 水族册 → 滑动收藏 → 打开具体对象 → 返回原位置。

每条路径至少定义：`goal / milestones / forbidden / existingAutomation / coverage`。

`coverage` 只允许：

- `partial`：已有多个单点回归，但还没有连续跨模块证据。
- `mostly_covered`：主路径已有浏览器证据，仅剩非核心边界或上下文恢复待补。
- `covered`：入口、关键中间状态、数据副作用和返回/恢复均有真实连续验收。

**多个单点测试全部通过，不等于 Golden Path 已 covered。** 只有连续旅程的缺口真正补齐后，才允许升级 coverage。

当前 GP-002 已有连续浏览器证据：搜索宝莲灯 → 打开精确物种详情 → 从主 CTA 进入混养 → 候选数量调至群游要求 ×6 → 查看 caution 结论 → 显式确认风险 → 记录实际入缸 → 读取持久化状态确认宝莲灯 ×6、原有红绿灯数量不变。对应门禁为 `test:golden-path-gp002-ui`。兼容性知识覆盖另由 `test:compatibility-evidence-coverage` 约束：未知组合继续保持 insufficient_data，不得为了让 Golden Path 通过而放宽安全规则。

## Badcase 回流规则

每次开发或验收发现问题时，按下面顺序处理：

1. **先登记 Badcase**：现象、触发条件、期望、实际、严重级别、根因层。
2. **再修代码**：Badcase 不是修完后才补的事故报告，而是修复输入。
3. **转成回归条件**：能自动化的写 test；不能自动化的至少进入状态/Golden Path pass criteria。
4. **修复后更新状态**：`open → investigating → fixed → regression_verified`。只有回归真实执行通过后，才能标为 `regression_verified`。
5. **PR 合并前检查**：新增功能必须进入 feature registry；新增 Badcase 必须有回归条件或明确 `wont_fix` 原因。

Badcase 最少包含：`id / featureId / discoveredAt / source / severity / symptom / trigger / expected / actual / rootCauseLayer / status / regression`。

## 响应式 Surface 规则

内容/任务 Surface 不再统一成 50vw：

- **手机**：内容详情保持 bottom sheet；任务按既有 mobile task surface 展示。
- **桌面阅读/详情**：约 520px。
- **桌面编辑任务**：约 560px。
- **桌面复杂决策**：约 640px。
- 上述宽度都必须再受固定侧栏之后的真实剩余工作区限制。
- 删除、放弃未保存修改、高风险确认继续使用居中 `ConfirmDialog`。

这条规则的目的不是追求统一尺寸，而是让**阅读、编辑、复杂决策、短确认**分别使用合适的信息密度和注意力模式。
