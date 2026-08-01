# AquaGuide Structured Evaluation

本目录把规则、安全过滤、Provider 降级和真实模型评测分开，避免把 Mock 结果误当成模型质量。

## 数据集

- `tank-copilot.v1.jsonl`：20 个既有建缸助手场景。
- `daily-check.v1.jsonl`：13 个巡检规则、安全过滤与 Provider 失败场景。
- `species-diagnosis.v1.jsonl`：14 个物种状态判断、追问、映射与非鱼类门禁场景。
- `vision-manifest.v1.jsonl`：经授权的真实图片清单；当前为空，因此不能宣称视觉准确率。

每行必须通过 `evaluationCaseSchema`。新增 Case 时使用稳定 ID、递增版本，并明确 `origin`、严重级别和可观察行为。

## Runner

```bash
npm run eval:deterministic
npm run eval:mocked
npm run eval:report
npm run eval:all
```

- deterministic：只运行本地规则、Schema、Sanitizer 和 Fallback，不调用 Provider。
- mocked：只模拟网络失败、超时、非法结构与越权输出。
- live：只有 `RUN_LIVE_EVAL=1` 时通过现有 AquaGuide BFF 调用真实 Provider；默认安全跳过。

```bash
RUN_LIVE_EVAL=1 EVAL_API_BASE_URL=http://127.0.0.1:8787 npm run eval:live
```

Live 报告只保存任务、延迟、状态、失败原因和数据键摘要，不保存自由文本、图片、密钥或完整模型回复。生成报告位于 `evaluation/reports/latest.json` 和 `latest.md`，默认不提交 Git。

## Badcase 回流

```bash
npm run eval:register-badcase -- --result=evaluation/reports/deterministic.json --layer=rule
```

失败进入 `badcases/registry.jsonl` 后，先定位根因并标记 `fixed`，再增加或更新 `origin=regression` 的 Case。完整回归通过后才能改为 `regression_verified`。
