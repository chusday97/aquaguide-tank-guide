# AquaGuide Handoff — Latest

更新时间：2026-08-21 17:29 +08:00

## 当前工作基线

- 当前分支：`codex/interactive-parity-v3`
- 当前 head（handoff 同步前产品/测试 head）：`7f4e28a9fb30d1c09e6b7c9d0a43b1a1524d350f`
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 栈存在历史分叉，后续必须 semantic reconciliation，不能直接覆盖式 merge。
- 当前状态：**alignment recovery / regression hardening / 非 release-ready / 非视觉 PASS**。
- 最新全页面审计：`ALIGNMENT_AUDIT_LATEST.md`，commit `4b5ab1be2e51b5ffbc6d07cb39d70e7f9e24238c`。
- Vercel 对 `7f4e28a` 当前仍为 free-plan `build-rate-limit` failure；这是部署限频，不等于代码构建失败，但也意味着最新修改尚无 Preview 视觉证据。

## 当前最重要的产品契约

1. Desktop Browsing Detail = persistent right Rail；左侧底层页面保持原宽度、可滚动、可继续点击。
2. 用户在左侧切换物种/内容时，右侧 Rail 不关闭，只更新内容。
3. Mobile Browsing Detail = bottom sheet；Task = high bottom sheet；Blocking Confirmation 才允许居中阻断。
4. Aquarium >=960px = 单一沉浸舞台；status/actions 是 overlay，不得重新占列压窄 3D。
5. UI 修复必须修改 canonical owner，不允许新增 `layout-v6/v7/v8` 之类覆盖层。
6. GitHub head、deployed commit、browser regression、human visual acceptance 必须分别记录，不能互相代替。

## 2026-08-21 Alignment Audit 结论

当前确认 **3 个 P0 + 3 个 P1**：

### P0

- **P0-1 Surface responsive split-brain**：`LayoutModeProvider` 原先按 UA 判 phone/desktop，而 shared Dialog 按 viewport 判；同一弹窗可能出现 geometry/modal/overlay 语义不一致。
- **P0-2 Aquarium 3D 双重 framing**：Three camera 已有 `stage-cover`，但 `aquarium-stage-layout-v4.css` 仍对 canvas scale(1.08–1.30)，会造成初始过大、缩放后过小以及潜在 pointer/raycast 偏差。
- **P0-3 Dialog legacy inference 冲突**：Encyclopedia group 的 `max-w-[920px] + rounded-[24px]` bridge 会误命中 Aquarium Smart Recommendation，使 Task 被识别为 Detail。

### P1

- Encyclopedia / Care 在 768–1023px selection dock 仍可能参与正常文档流，复现“场景没到底、下面出现白色结果带”。
- Aquarium 仍有大量 legacy direct `DialogContent` 依赖 auto inference，Surface 语义未显式化。
- Collection Hub 的 hover/subitems/center-focus 已实现，但 marine node 视觉仍偏“悬浮卡片”，没有完全达到“生物本身就是悬浮导航图标”。

详见 `ALIGNMENT_AUDIT_LATEST.md`。

## 本轮已继续执行

### `19eceb1` — 新增唯一 viewport contract

新增 `lib/layout-mode.ts`：

- `PHONE_LAYOUT_BREAKPOINT_PX = 768`
- `PHONE_LAYOUT_QUERY = (max-width: 767px)`
- 统一提供 viewport snapshot / subscription / width → layout mode 纯函数。

目标：Provider、Dialog、测试不再各自拥有自己的 breakpoint/设备判断。

### `8a0f500` — 先更新旧 layout policy test

旧 `scripts/assert_layout_mode_policy.ts` 原本明确保护：

> “设备布局不得跟随窗口宽度变化”

这与当前产品 responsive contract 相反，是回退源之一。

现在改为保护：390 / 600 / 767 = phone，768 / 1024 / 1440 = desktop；并禁止 UA/device inference 回归。

### `e30a372` — LayoutModeProvider 改为 viewport reactive

- 删除 UA / iPhone / iPad / Android 判定作为产品布局源。
- 改用 `useSyncExternalStore + matchMedia` shared contract。
- resize 跨越 768px 时 AppShell 会同步切换 phone/desktop。
- `detectLayoutMode` 仅保留为 viewport-width pure helper，不再接受 device identity 作为判断依据。

### `fbe6173` — shared Dialog 使用同一 viewport contract + 修 Smart Recommendation 误分类

- Dialog 不再自己硬编码 `(max-width: 767px)`；与 LayoutModeProvider 读取同一 `lib/layout-mode.ts`。
- Root modal、overlay、geometry、dismissal 现在使用同一 breakpoint 语义。
- 在 legacy inference 仍存在期间，优先识别 Aquarium Smart Recommendation 的 `max-h-[88dvh] + max-w-[920px] + flex-col` 为 **Task**，避免被 Encyclopedia group Detail bridge 误判。
- 这是临时 compatibility bridge；长期目标仍是 Aquarium 主路径显式 `surface="task"`。

### `7f4e28a` — UI regression guard 同步

`verify-ui-regression-contract.mjs` 新增防回退：

- layout contract 必须唯一拥有 768px breakpoint；
- LayoutModeProvider / Dialog 必须都引用 shared contract；
- 禁止 Provider 恢复 UA/device inference；
- 禁止 Dialog 再硬编码 767px；
- Smart Recommendation 在 legacy inference 存在期间必须保持 Task 分类。

## 已确认仍未完成

### Aquarium 3D — P0

当前 `aquarium-stage-layout-v4.css` 仍对 canvas 做二次 CSS scale：

- >=1600: 1.30
- 1280–1599: 1.26
- 960–1279: 1.16
- 768–959: 1.08

下一步必须移除 CSS zoom，让 `ThreeAquarium` camera 成为唯一 framing owner，再做 1440 / 1280 / 1024 / 768 / 390 runtime 验证。

### Encyclopedia / Care interactive scene — P1

当前 selection result dock 只有 >=1024px 才通过 CSS absolute overlay；768–1023 仍有原 badcase 复发风险。

下一步优先把 overlay contract 下沉到 scene component / >=768 canonical layout，而不是继续靠 desktop-only screenshot 修补。

### Aquarium Surface semantics — P1

仍需逐类显式化：

- Daily Check article / water-change guide → Detail
- all reminders / observation / Smart Recommendation / conflict resolution / data backup → Task
- delete / exit draft → Blocking
- tank preview → Fullscreen/Media

不要整写 460KB `Aquarium.tsx`，除非拿到完整 blob 并能严格控制 diff；优先 shared bridge / extracted component / 小文件迁移。

## 页面当前 Alignment 概览

- `/encyclopedia` main Species Detail：源码方向对齐 persistent Rail；latest browser/human pending。
- `/care` main detail：源码方向对齐 persistent Rail；latest browser/human pending。
- `/collection` Hub：交互基本对齐，视觉语言 partial。
- `/collection/wishlist` / `/collection/care`：shared Detail + blocking remove，源码基本对齐。
- `/collection/memorial/:id`：dedicated detail + blocking discard，对齐。
- `/identify`：Species Detail + explicit blocking discard，对齐；现已共享 viewport source。
- `/settings`：shared blocking + navigation guard，对齐。
- `/search`：无私有 popup，但结果仍通过路由进入图鉴；一致性为 P2。
- `/admin/content`：仍有 `window.confirm`，P2 admin debt，不阻塞当前用户端 P0。

## 下一步执行顺序

1. **P0-2 Aquarium framing**：移除 CSS canvas zoom，camera-only framing；补/更新 runtime geometry gate。
2. **P1 interactive scene**：修 Encyclopedia / Care 768–1023 dock/note overlay，消除“场景没到底”复发区间。
3. **P1 Aquarium Surface explicit semantics**：逐类替换 auto inference；最终删除视觉 class signature 推断。
4. **Collection visual completion**：从“鱼+玻璃卡片”改成“生物本身是悬浮导航”。
5. latest Preview/CI 可用后做 1440 / 1280 / 1024 / 768 / 390 browser matrix，再由用户进行 visual acceptance。

## 可信边界

- GitHub commit 存在 ≠ Vercel latest 已部署。
- Vercel success ≠ 人工视觉 PASS。
- static contract ≠ runtime interaction PASS。
- 当前 `ALIGNMENT_AUDIT_LATEST.md` 是 source-level audit，不是截图验收。
- AI deterministic 47/47 与 UI alignment 没有直接证明关系。

同时参考：`ALIGNMENT_AUDIT_LATEST.md`、`UI_REGRESSION_CONTRACT.md`、`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`SURFACE_INVENTORY_LATEST.md`。
