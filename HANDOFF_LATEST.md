# AquaGuide Handoff — Latest

更新时间：2026-08-21 17:29 +08:00

## 当前工作基线

- 当前分支：`codex/interactive-parity-v3`
- 当前产品/测试 head：`ff2b1685472318659add1650cab0f59c6ba84b92`
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 栈存在历史分叉，后续必须 semantic reconciliation，不能直接覆盖式 merge。
- 当前状态：**alignment recovery / regression hardening / 非 release-ready / 非视觉 PASS**。
- 最新全页面审计：`ALIGNMENT_AUDIT_LATEST.md`，commit `4b5ab1be2e51b5ffbc6d07cb39d70e7f9e24238c`。
- Vercel 对最新 `ff2b168` 仍返回 free-plan `build-rate-limit`；这是部署限频，不等于代码构建失败，但最新修改尚无 Preview/人工视觉证据。

## 当前不可变产品契约

1. Desktop Browsing Detail = persistent right Rail；左侧底层页面保持可见、可滚动、可继续点击。
2. 左侧切换物种/内容时 Rail 不关闭，只更新右侧内容。
3. Mobile Browsing Detail = bottom sheet；Task = high bottom sheet；Blocking Confirmation 才允许居中阻断。
4. Aquarium >=960px = 单一沉浸舞台；status/actions 是 overlay，不得重新占列压窄 3D。
5. Three camera 是 Aquarium framing 的唯一 owner；禁止用 CSS `scale()` 对 WebGL canvas 做第二次 framing。
6. UI 修复必须修改 canonical owner，不允许新增 `layout-v6/v7/v8` 式覆盖层。
7. GitHub head、deployed commit、browser regression、human visual acceptance 必须分别记录。

## Alignment Audit 原始结论

Audit 找到 3 个 P0 + 3 个 P1：

- P0-1：Surface responsive split-brain（UA vs viewport）。
- P0-2：Aquarium camera + CSS canvas scale 双重 framing。
- P0-3：Dialog legacy signature 将 Aquarium Smart Recommendation 误判为 Detail。
- P1：Encyclopedia/Care 768–1023 selection dock 回到 normal flow。
- P1：Aquarium legacy direct DialogContent 仍依赖 auto inference。
- P1：Collection Hub 交互对齐，但视觉仍偏“鱼+玻璃卡片”。

详见 `ALIGNMENT_AUDIT_LATEST.md`。

## 本轮已执行的修复

### P0-1 — Surface responsive source of truth：code-level fixed

#### `19eceb1` — shared viewport contract

新增 `lib/layout-mode.ts`：

- `PHONE_LAYOUT_BREAKPOINT_PX = 768`
- `PHONE_LAYOUT_QUERY = (max-width: 767px)`
- 统一 viewport snapshot / subscription / width → layout mode。

#### `8a0f500` — fail-before-fix layout policy

旧 `assert_layout_mode_policy.ts` 原先保护“设备布局不得跟随窗口宽度变化”，会把新 responsive 方案修回 UA-first。

现改为保护：390 / 600 / 767 = phone，768 / 1024 / 1440 = desktop；并禁止 UA/device inference 回归。

#### `e30a372` — LayoutModeProvider viewport reactive

- 删除 UA/iPhone/iPad/Android 作为产品布局判断源。
- 改用 `useSyncExternalStore` 监听 shared matchMedia contract。
- resize 跨越 768px 时 AppShell 与 `isPhoneLayout` 会同步更新。

#### `fbe6173` — Dialog 使用同一 viewport contract

- shared Dialog 不再拥有第二个硬编码 767px breakpoint。
- Root modal、overlay、geometry、dismissal 与 AppShell 使用同一 responsive source。

#### `7f4e28a` — regression governance

UI guard 已禁止：

- Provider 恢复 UA/device inference；
- Dialog 重新硬编码独立 phone breakpoint；
- Provider/Dialog 不引用 shared layout contract。

### P0-3 — Smart Recommendation surface misclassification：code-level fixed

同在 `fbe6173`：

- Aquarium Smart Recommendation 的 legacy signature `max-h-[88dvh] + max-w-[920px] + flex-col` 优先判定为 **Task**。
- 不再被 Encyclopedia group 的 920px/24px Detail bridge 抢先命中。
- 这是 compatibility bridge；长期仍需在 Aquarium 主路径显式 `surface="task"`，最终删除视觉 class inference。

### P0-2 — Aquarium duplicate framing：code-level fixed

#### `ac524b1` — fail-before-fix framing regression

`test-three-stage-framing.ts` 现在除 camera cover/contain 数学外，还会扫描 canonical aquarium CSS：

- `.aquarium-dashboard-tank > .aquarium-tank canvas` 不允许出现 `scale()`。

#### `d04018d` — remove CSS canvas zoom

`aquarium-stage-layout-v4.css` 已删除原来的：

- >=1600 scale(1.30)
- 1280–1599 scale(1.26)
- >=960 base scale(1.22)
- 960–1279 scale(1.16)
- 768–959 scale(1.08)

现在所有 viewport 下 canvas 都是 `transform: none !important`；ThreeAquarium `stage-cover` camera 成为唯一 framing owner。

预期作用：

- 初始鱼缸不再被 CSS 额外放大；
- 跨 960/1280/1600 时不再发生 scale 跳变；
- R3F pointer/raycast 与视觉 canvas geometry 不再因 CSS transform 分离。

注意：**还未 latest browser/human validated**。如果 camera-only 后鱼缸仍偏大/偏小，下一步只调 camera math，不再恢复 CSS zoom。

### P1 — Encyclopedia/Care 768–1023 scene dock：code-level fixed

#### `cfcec41` — browser regression

`verify-interactive-scenes.mjs` 新增 768 / 1024 / 1440 geometry gate：

- 点击 scene node 后 result dock 必须 `position:absolute`；
- dock 必须完整落在 interactive stage 内，不能跑到 scene 下方形成白色结果带。

#### `ff2b168` — overlay contract 扩展到整个 desktop range

`immersive-detail-layout-v5.css`：

- selection dock/note overlay 从 `>=1024px` 扩展为 `>=768px`；
- 768–1023 使用更紧的 14px inset、58px image、44px action，减少窄桌面挤压；
- phone <768 保持原 mobile flow/sheet contract。

这直接针对用户最早指出的：“画面没到底、下面出现白色结果区域”。

## 当前仍未完成

### Aquarium Surface semantics — P1

`Aquarium.tsx` 仍有大量 direct `DialogContent`。下一批应逐类显式化：

- Daily Check article / water-change guide → Detail
- all reminders / observation / Smart Recommendation / conflict resolution / data backup → Task
- delete / exit draft → Blocking
- tank preview → Fullscreen/Media

约束：不要为方便继续扩大视觉-class inference；长期要删除 920px legacy bridge。

### Collection Hub visual completion — P1

已实现：

- 4 个 marine visual node；
- hover/focus 显示细分；
- click 切换 activeModule；
- 中央内容跟随切换；
- mobile 有独立入口。

未完成：

- Desktop 节点仍是 `min-h-[112px] min-w-[150px] rounded-[30px]` 的玻璃卡片；
- 需要改成“海洋生物本身就是悬浮导航”，弱化卡片容器；
- mobile 也应进一步从 2x2 card 向 compact tap-expand 靠拢。

### Legacy/dead CSS — governance debt

`index.css` 仍残留 `.collection-book-*`、旧 aquarium desktop grid 等历史样式。当前组件未必使用，但它们是未来 specificity 回归源，应在核心 P0/P1 稳定后删除。

### Admin — P2

`AdminContent.tsx` 仍有多处 `window.confirm`。这是内部后台 debt，不阻塞普通用户主路径。

## 页面当前 Alignment 概览

- `/aquarium`：单舞台结构和 camera-only framing 已 code-level 落地；latest browser/human pending。
- `/encyclopedia` main detail：persistent Rail 源码对齐；768–1023 scene dock 已补 overlay；browser/human pending。
- `/care` main detail：persistent Rail 源码对齐；768–1023 scene dock 已补 overlay；browser/human pending。
- `/collection` Hub：交互基本对齐，视觉语言 partial。
- `/collection/wishlist` / `/collection/care`：shared Detail + blocking remove，源码基本对齐。
- `/collection/memorial/:id`：dedicated detail + blocking discard，对齐。
- `/identify`：Species Detail + explicit blocking discard；现在也共享 viewport source。
- `/settings`：shared blocking + navigation guard，对齐。
- `/search`：无私有 popup；结果进入图鉴，属于 P2 consistency debt。
- `/admin/content`：native confirm 仍存在，P2。

## 下一步执行顺序

1. **Aquarium Surface explicit semantics**：逐类消灭用户主路径 auto inference，优先 Daily Check / water-change guide / Smart Recommendation / observation / conflict resolution。
2. **Collection visual completion**：从“鱼+玻璃卡片”改成“生物本身就是悬浮导航”。
3. **Runtime matrix**：latest build 可用后跑 1440 / 1280 / 1024 / 768 / 390：
   - Aquarium camera-only framing；
   - Encyclopedia/Care result dock；
   - Detail/Task/Blocking Surface；
   - left-side background interaction while right Rail remains open。
4. 人工 visual acceptance 后才能建立截图 golden baseline。
5. 最后再清 legacy/dead CSS 与 admin debt。

## 可信边界

- GitHub commit 存在 ≠ Vercel latest 已部署。
- Vercel success ≠ 人工视觉 PASS。
- static contract ≠ runtime interaction PASS。
- 当前最新 Vercel 状态仍为 build-rate-limit。
- `ALIGNMENT_AUDIT_LATEST.md` 是 source-level audit，不是截图验收。
- AI deterministic 47/47 与 UI alignment 没有直接证明关系。

同时参考：`ALIGNMENT_AUDIT_LATEST.md`、`UI_REGRESSION_CONTRACT.md`、`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`SURFACE_INVENTORY_LATEST.md`。
