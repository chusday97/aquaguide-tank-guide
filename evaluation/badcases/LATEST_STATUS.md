# Badcase 最新状态

更新时间：2026-08-21 15:06 +08:00

## AI / 规则评测状态

- 最近一次已执行 `npm run eval:all`。
- 确定性规则评测：37 / 37 通过。
- 模拟 Provider 评测：10 / 10 通过。
- 合计：47 / 47 通过。
- `registry.jsonl` 当前为 0 条；本轮没有新增真实 AI Badcase。
- 部署 handler 的配置、结构化成功、非法 JSON、未配置和网络失败已由既有 `test:ai-capabilities` 覆盖；该协议回归不等同于真实模型失败，因此不新增 AI Badcase。

## 2026-08-21 新增 Product / UI Badcase

当前用户实际体验暴露出的主要问题是 Surface/布局问题，不属于 AI registry。已在仓库根目录 `BADCASE_LATEST.md` 单独登记：

- `PUI-BC-056`：浏览详情 Surface 不统一，点击底层另一对象时详情自动消失。
- `PUI-BC-057`：物种详情在窄右 Rail 内仍按桌面双列排版，内容严重挤压。
- `PUI-BC-058`：手机版详情/任务 Surface 方向与高度不一致。
- `PUI-BC-059`：全站 Dialog / Sheet / Rail 尚未完成完整 Surface Inventory。
- `PUI-BC-060`：Aquarium 3D framing 在不同 viewport 下视觉尺寸不稳定。
- `INFRA-BC-001`：Vercel build-rate-limit 阻塞最新 UI 视觉验收。

其中 PUI-BC-056/057/058 已完成代码级修复，但由于最新完整 branch preview 尚未生成，状态只能是 `fix_implemented_validation_pending`，不能写成 `regression_verified`。PUI-BC-059/060 仍为 `investigating`。

## 记录边界

只有真实 AI/规则评测失败才写入 `evaluation/badcases/registry.jsonl`。产品 UI、响应式布局、弹窗位置、Surface 行为、3D framing 与部署验收问题统一记录在 `BADCASE_LATEST.md`，并由 `HANDOFF_LATEST.md` / `PROGRESS_LATEST.md` 跟踪关闭条件。

**AI PASS 不代表 UI PASS；GitHub commit 存在不代表最新 Vercel preview 已完成；Vercel READY 也不代表人工视觉验收通过。**
