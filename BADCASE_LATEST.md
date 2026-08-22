# AquaGuide Badcase — Latest

更新时间：2026-08-22 +08:00

> UI / 产品 badcase 与 AI evaluation registry 分开管理。本文件只记录当前仍需关注或刚完成验证的产品问题。

## DATA-BC-002 — Compatibility evidence coverage 过低

- **Severity**：P1 / High
- **Feature**：`compatibility_evidence`
- **Status**：`open_data_gap`
- 当前 501 条物种中只有 3 条 reviewed behavior profile，覆盖率 **0.60%**；reviewed pair rule 只有 1 条。
- 抽样 12,000 个真实物种组合：`behavior_evidence_unreviewed` 是主要 medium missing-data 原因。
- 抽样 30,000 个真实组合：`caution = 0`，主要结果为 `insufficient_data` / `not_recommended`。
- **禁止错误修法**：不得把 `behavior_evidence_unreviewed` 从 medium 降级，仅为了让更多组合显示“可尝试”。
- **正确修法**：补 reviewed evidence + citation + confidence；优先高频物种和常见 pair。
- **关闭条件**：核心高频物种达到可接受 reviewed coverage，并出现可由真实数据稳定触发的 compatible / caution / block 三类业务路径。

## PUI-BC-056 — 浏览详情 Surface 不统一 / 切换对象关闭

- **Severity**：P0 / High
- **Status**：`regression_verified`
- Desktop persistent right rail；切换物种 Rail 保持打开。
- 1440 computed width 600px；无 blocking overlay；背景可继续交互。

## PUI-BC-057 — Detail Rail 被旧 720px / 双列 geometry 覆盖

- **Severity**：P0 / High
- **Status**：`regression_verified`
- `.modalCard` 已退役 geometry owner；Detail geometry 归 explicit Surface 所有。
- Encyclopedia dead legacy detail 已删除。

## PUI-BC-058 — Mobile Surface 横向偏移 / 高度不一致

- **Severity**：P1 / High
- **Status**：`regression_verified`
- 修复 double translate；390px Task / Detail 均完整位于 viewport。
- Detail ≈68dvh；Task ≈82dvh；Blocking centered。

## PUI-BC-059 — 全站 private popup / visual inference debt

- **Severity**：P0 / High
- **Status**：`regression_verified`
- 所有业务 `DialogContent` 显式 `surface=`。
- shared Dialog 不再根据 max-width / radius / close button 猜 Surface。
- `window.confirm` = 0。
- 业务手写 `role="dialog"` / `aria-modal="true"` = 0。
- Species Export → Media；Compatibility Adjustment → Task；Admin confirmation → Blocking。
- CI governance 禁止这些旧模式回归。

## PUI-BC-060 — Aquarium 3D stage / primary tools 回退

- **Severity**：P0 / High
- **Status**：`runtime_verified_visual_pending`
- >=960px 使用单一 immersive stage；camera-only framing；不再用 CSS scale。
- 添加生物 / 鱼缸设置主入口已恢复；桌面保留 fullscreen。
- 底砂 / 水草 inline search PASS。
- Aquarium stage browser regression / Surface runtime matrix PASS。
- **剩余**：用户人工视觉 acceptance 尚未授予。

## PUI-BC-061 — Nested modal body lock

- **Severity**：P1 / High
- **Status**：`fix_implemented_runtime_guarded`
- reference-count body lock 已实现；Blocking / Media / mobile Task 共用 shared Surface contract。

## INFRA-BC-001 — Vercel build-rate-limit

- **Type**：Infrastructure / Acceptance blocker
- **Status**：`open_intermittent`
- free-plan build-rate-limit 曾阻塞 latest deployment。
- local 4317 是开发验收源；Vercel 只作为部署验收源。
- 不能把 rate limit 解释成代码 compile failure。

## 当前关闭原则

- `fix_implemented` ≠ human visual PASS。
- deterministic compatibility PASS ≠ evidence coverage 足够。
- GitHub commit ≠ deployed latest SHA。
- Local / Vercel parity 必须基于同 SHA、同 seed、同 viewport。
