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

- `feature-states.v1.json`：当前核心功能的状态矩阵。每个注册功能必须 `states.length >= 6`。
- `core-flow-v1.json`：第一批**可执行核心流程 Case**，当前覆盖 `compatibility` + `add_livestock`。六状态矩阵只说明“应该设计什么”，这个文件进一步绑定真实规则、写入、幂等、失败和 UI Contract。
- `badcases.v1.jsonl`：开发、用户测试、回归中发现的产品 Badcase。发现即记录，不等到功能做完再补。
- `scripts/test-product-evaluation.mjs`：校验每个功能至少 6 种状态、字段完整、Badcase 有可回归信息。
- `scripts/test-core-flow-state-eval-v1.ts`：执行混养 + 添加生物的核心状态 Case。
- `scripts/test-responsive-detail-surface.mjs`：校验手机仍是 bottom sheet，桌面内容型详情为右侧 drawer，ConfirmDialog 不被误改。

## Badcase 回流规则

每次开发或验收发现问题时，按下面顺序处理：

1. **先登记 Badcase**：现象、触发条件、期望、实际、严重级别、根因层。
2. **再修代码**：Badcase 不是修完后才补的事故报告，而是修复输入。
3. **转成回归条件**：能自动化的写 test；不能自动化的至少进入 `feature-states.v1.json` 的 pass criteria。
4. **修复后更新状态**：`open → investigating → fixed → regression_verified`。只有回归真实执行通过后，才能标为 `regression_verified`。
5. **PR 合并前检查**：新增功能必须进入 feature registry；新增 Badcase 必须有回归条件或明确 `wont_fix` 原因。

Badcase 最少包含：`id / featureId / discoveredAt / source / severity / symptom / trigger / expected / actual / rootCauseLayer / status / regression`。

## 可执行核心流程验收规则

状态矩阵不能替代真实验收。核心流程进入 executable eval 时，每个 Case 至少明确：`trigger → expected → forbidden → automation`。

当前 v1 重点验证：

- 混养的 `compatible / caution / insufficient_data / not_recommended` 必须映射到唯一添加策略；AI 不得覆盖 deterministic block。
- 现实中已经存在的生物属于用户事实：即使风险未知或明确冲突，也应保存事实，再返回 `save_with_unknown / save_with_urgent_warning`，不能因为产品判断而篡改现实记录。
- 部分成功必须保留成功项和失败项；只重试失败项时，已经成功的记录不能重复增加。
- 同一个 `operationId` 重放必须幂等。
- Failure state 必须结束 loading、保留上下文、允许重试，不显示 repository/API/database/raw error。

## 响应式弹窗规则

内容型/任务型详情（物种详情、养护详情、结果解释、设置/编辑等）使用 `AdaptiveDetailContent`：

- **手机**：保持现有 bottom sheet，约 `92dvh`，底部贴边、顶部圆角。
- **桌面**：从右侧滑入，约半屏宽，保留左侧页面上下文。
- **短决策确认**：删除、放弃未保存修改、高风险确认继续使用居中 `ConfirmDialog`，不改成 Drawer。

这条规则的目的不是追求统一外观，而是区分两类任务：**阅读/操作型详情需要保留上下文；短决策型确认需要集中注意力。**
