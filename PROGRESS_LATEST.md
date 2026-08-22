# AquaGuide Progress — Latest

更新时间：2026-08-22 +08:00

## 当前结论

当前 feature branch：`codex/interactive-parity-v3`。最新产品 / 测试基线：`2086059`。

Surface、响应式和主路径 runtime 已从“持续修回退”进入 **基础契约稳定 + 数据可信度补齐 + 人工视觉验收** 阶段。

- Shared Surface architecture：已收口。
- 业务 `DialogContent`：全部显式 `surface=`。
- 业务手写 `role=dialog` / `aria-modal`：0。
- `window.confirm`：0。
- Full-page runtime matrix：28/28 PASS。
- 501 条 taxonomy：PASS，locale drift = 0。
- Human visual acceptance：尚未授予。
- Vercel same-SHA parity：尚未完成。

## 本轮完成

### 1. 剩余手写 Dialog 退役 — `2086059`

- Species Export：手写 fixed modal → shared `surface="media"`。
- Compatibility Adjustment：手写 430px bottom sheet → shared `surface="task"`。
- 删除从未被触发的 `conflictDetail` dead branch。
- governance 禁止业务代码重新手写 `role="dialog"` / `aria-modal="true"`。
- Species export PNG / print browser regression：PASS。

### 2. Compatibility evidence audit

当前证据库：

- 物种总数：501
- reviewed behavior profile：3
- reviewed pair rule：1
- reviewed species coverage：**0.60%**
- coverage status：`coverage_gap`

抽样 12,000 个真实组合时，`behavior_evidence_unreviewed` 是最主要的 medium missing-data 原因；抽样 30,000 个真实组合没有出现 `caution`，主要落在 `insufficient_data` / `not_recommended`。

当前策略保持严格：**不降低 evidence gate 来制造可用结果**。下一步应补 reviewed evidence，而不是放宽判断阈值。

### 3. 已稳定的 runtime contract

- Species Detail desktop：480–600px persistent right rail；1440 实测 600px。
- Species Detail mobile：约 68dvh bottom sheet。
- Task desktop：persistent right rail，无 blocking overlay。
- Task mobile：约 82dvh bottom sheet。
- Blocking：centered modal。
- Media：centered / fullscreen semantics。
- Aquarium：添加 + 设置主入口恢复；底砂 / 水草内嵌搜索可用。
- Collection：creature-first desktop navigation，tablet/mobile compact fallback。
- Identify：identity result 与 health triage 分离；unsaved guard PASS。
- Settings：unsaved feedback guard PASS。
- Search → Species Detail：PASS。
- Admin unsaved changes：shared Blocking PASS。

## 当前优先级

### P1 — Compatibility evidence coverage

先扩 reviewed behavior profile 和 pair evidence，优先覆盖最常用淡水物种与鱼缸常见组合；所有新增 evidence 必须带来源、review status、confidence，不能从 description 自动“审核通过”。

### P1 — Human visual acceptance / Vercel parity

继续使用 `http://127.0.0.1:4317/` 作为 local production preview。用户人工确认后才能建立 screenshot golden baseline；Vercel 必须部署同一 SHA 再做 parity。

### P2 — stale tests / dead CSS / branch reconciliation

继续清旧测试和死样式；禁止用 merge `main` 或旧 UX 分支恢复历史实现。

## 可信边界

- build PASS ≠ human visual PASS。
- browser regression PASS ≠ 所有业务数据已具备生产可信度。
- compatibility engine deterministic PASS ≠ 501 条物种 evidence coverage 足够。
- Vercel success ≠ deployed SHA 与本地验收 SHA 一致。
