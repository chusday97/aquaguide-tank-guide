# AquaGuide Structured Evaluation

本目录把规则、安全过滤、Provider 降级、真实模型评测和产品交互评测分开，避免把 Mock 结果误当成模型质量，也避免只测 AI 而忽略用户任务是否真正闭环。

## AI / 规则数据集

- `tank-copilot.v1.jsonl`：20 个既有建缸助手场景。
- `daily-check.v1.jsonl`：13 个巡检规则、安全过滤与 Provider 失败场景。
- `species-diagnosis.v1.jsonl`：14 个物种状态判断、追问、映射与非鱼类门禁场景。
- `vision-manifest.v1.jsonl`：经授权的真实图片清单；当前为空，因此不能宣称视觉准确率。

每行必须通过 `evaluationCaseSchema`。新增 Case 时使用稳定 ID、递增版本，并明确 `origin`、严重级别和可观察行为。

## 产品 / UI 评测

`evaluation/product/` 记录任务入口、状态设计、响应式详情 Surface、收藏/写入失败、空状态等产品级评测：

- `product/feature-states.v1.json`：核心功能状态矩阵；每个功能至少 6 个有业务意义的可观察状态。
- `product/badcases.v1.jsonl`：开发、用户测试和 CI 中发现的产品 Badcase。
- `product/README.md`：六状态设计方法、Badcase 回流规范和响应式弹窗规则。

新增功能时，除功能代码外，还要同步补充状态矩阵；开发过程中发现 Badcase 时先登记，再修复并补回归条件。

## Runner

```bash
npm run eval:deterministic
npm run eval:mocked
npm run eval:report
npm run eval:all
npm run test:product-evaluation
npm run test:responsive-detail-surface
```

- deterministic：只运行本地规则、Schema、Sanitizer 和 Fallback，不调用 Provider。
- mocked：只模拟网络失败、超时、非法结构与越权输出。
- live：只有 `RUN_LIVE_EVAL=1` 时通过现有 AquaGuide BFF 调用真实 Provider；默认安全跳过。
- product-evaluation：检查产品功能至少 6 状态、状态字段完整、Badcase 可回归。
- responsive-detail-surface：检查手机 bottom sheet / 桌面右侧 Drawer / ConfirmDialog 居中边界。

```bash
RUN_LIVE_EVAL=1 EVAL_API_BASE_URL=http://127.0.0.1:8787 npm run eval:live
```

Live 报告只保存任务、延迟、状态、失败原因和数据键摘要，不保存自由文本、图片、密钥或完整模型回复。生成报告位于 `evaluation/reports/latest.json` 和 `latest.md`，默认不提交 Git。

## Badcase 回流

AI/规则评测失败可通过：

```bash
npm run eval:register-badcase -- --result=evaluation/reports/deterministic.json --layer=rule
```

失败进入 `evaluation/badcases/registry.jsonl` 后，先定位根因并标记 `fixed`，再增加或更新 `origin=regression` 的 Case。完整回归通过后才能改为 `regression_verified`。

产品/UI Badcase 则进入 `evaluation/product/badcases.v1.jsonl`，并同步到 `feature-states.v1.json` 或自动化测试中，形成可重复验证的回归条件。
