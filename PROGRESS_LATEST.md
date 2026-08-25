# AquaGuide Progress — Latest

## 2026-08-25 14:31 +0800 — Atlas detail reflow restored

- UI-014 PASS: explicit profile action now transitions Interactive Atlas from full exploration scene to narrow left context + right Species Detail Rail.
- 1440 and 1024 geometry: scene/rail overlap = 0; close restores original width and exact batch.
- Redundant scene selection dock is hidden while the full detail Rail is open.
- Phone remains bottom-sheet behavior.
- New permanent regression: `test:interactive-atlas-detail-reflow` PASS.

## 2026-08-25 14:20 +0800 — Interactive Atlas latest UI restored

- Corrected visual source-of-truth: `SpeciesSceneAtlas` (accepted 2026-08-21 interaction line) replaces RC1 `InteractiveSpeciesAtlas` as the canonical Atlas visual owner.
- Encyclopedia now defaults to `scene`; Browse and Compatibility remain explicit separate modes.
- Mobile single toolbar semantically merges both lines: Scene/Browse/Compatibility + Search/Identify/Settings, all 44px controls.
- Regression PASS: interactive atlas authority, 6-item batch persistence/no-repeat, 411 transparent scene assets, scene runtime including dock overlay, mobile toolbar, full page matrix 28/28, TypeScript.
- RC1 `InteractiveSpeciesAtlas` implementation/runtime gate retired from the unified checkpoint; runtime alias points to `verify-interactive-scenes.mjs`.
- Next only after Atlas visual confirmation: resume UI-013 Aquarium hierarchy.

## 2026-08-25 13:38 +0800 — UI Recovery V2

- UI-011 Species Detail authority presentation: PASS; canonical Compatibility owns decision evidence, contextual heuristics are reference-only.
- UI-012 Mobile Species Detail first viewport: PASS; primary CTA is reachable before feeding/reference detail.
- UI-005 Collection: creature-first + center-focus carousel implementation complete; browser drag/arrow/dot regressions PASS; status VERIFY pending human visual acceptance.
- Mobile Collection creature shortcuts reduced from a tall 2x2 block to one compact row so center focus is visible earlier.
- Page runtime matrix remains 28/28 PASS; TypeScript and production build PASS.
- Next: UI-013 Aquarium hierarchy visual/state audit, then remaining Production runtime reconciliation.

## 2026-08-25 02:29 +0800 — UI Requirement Recovery V1

- Added `UI_REQUIREMENT_LEDGER.md` to separate visual baseline from the full chronological UI requirement set.
- UI-006 Interactive Atlas: restored + authority/runtime PASS.
- UI-007 Mobile Encyclopedia direct Search: restored + PASS.
- UI-008 Encyclopedia single mobile toolbar: restored + PASS.
- UI-009 Identify/mobile-header isolation: restored + PASS.
- UI-010 Browse/detail does not implicitly become Compatibility intent: explicit secondary action protected.
- Full page runtime matrix: 28/28 PASS after replacing stale old-scene selector with the accepted Interactive Atlas owner.
- Production build and TypeScript remain green.
- Next: UI-012 Mobile Species Detail first-viewport CTA; then UI-011, UI-005, UI-013.


更新时间：2026-08-25 00:33 +08:00

## 当前结论

AquaGuide 已切换为 **Final UI 基线上的 RC1 semantic reconciliation**。

- Working branch：`reconcile/final-ui-rc1-v1`
- UI baseline：`a3f1664`
- RC1 donor：`895f2f3`
- 第一阶段 deterministic authority 已实际接线，不是 docs-only。
- UI shell / Aquarium immersive stage / Surface system 保持旧 UI final 形态。
- 当前 build PASS；尚未完成 unified branch 的全页面 browser visual matrix 与 human visual acceptance。

## 2026-08-25 第一阶段完成

1. Compatibility / Whole-Tank
   - canonical Compatibility engine 已迁入；
   - Whole-Tank group / space / equipment / bioload authority 已迁入；
   - reviewed minimumGroupSize 替代关键词群游猜测；
   - temperament 不再放大 bioload。
2. Recommendation
   - static `housingMode=建议单养` 不再在 Compatibility 之前屏蔽候选；
   - heuristic load / group gap 不再自行升级为 `blocked`；
   - Interactive Discovery 保留。
3. Existing Tank
   - Tank State Engine + Evidence Adapter + presentation service 已接入当前 UI；
   - Today Action 当前风险由 Current Tank State 拥有；
   - static planning risk 不再直接制造当前危险。
4. Water Change
   - deterministic Water Change Engine 已接入；
   - Aquarium 不再用 shortest species cycle/default 7-day 作为 decision authority；
   - calendar overdue alone 不再制造 high-priority current risk。
5. Verification
   - Compatibility 5/5 PASS；Whole-Tank 7/7 PASS；Tank State 11/11 PASS；
   - Tank Evidence PASS；Existing Tank Authority PASS；Water Change 8/8 PASS；Water Change Authority PASS；
   - TypeScript PASS；production build PASS。

## 下一步

- 跑 unified branch 的 Aquarium / Encyclopedia / Collection / Care runtime + visual matrix；
- 完成 Current Tank State watch/unknown 与 Water Change 展示 parity；
- 迁入 Recommendation #134/#135 永久 regression；
- 再迁 Production runtime / Vercel ESM contracts；
- 最后才进入 live provider + Production Acceptance。

---

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
