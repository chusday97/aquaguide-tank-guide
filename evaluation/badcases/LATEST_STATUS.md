# Badcase 最新状态

## 2026-08-21 回归结果

- 已执行 `npm run eval:all`。
- 确定性规则评测：37 / 37 通过。
- 模拟 Provider 评测：10 / 10 通过。
- 合计：47 / 47 通过。
- `registry.jsonl` 当前为 0 条；本轮没有新增 AI Badcase。

## 记录边界

只有真实评测失败才会写入 `registry.jsonl`。互动视觉一致性中的内部预览路由、宽/窄桌面与手机视觉回归尚未完成，属于 UI 验收待办，不伪装成 AI 模型或规则 Badcase；它们应继续记录在 `PROGRESS.md` 与 `HANDOFF.md`。
