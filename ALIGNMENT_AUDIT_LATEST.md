# AquaGuide Alignment Audit — Latest

更新时间：2026-08-21 17:16 +08:00

> 范围：当前 `codex/interactive-parity-v3` 源码状态 vs 已确认产品/交互要求。
> 本报告是 **source-level alignment audit**；不等同于 latest browser regression 或人工视觉 PASS。

## 总结

当前不是“所有页面都回退”，而是存在 **4 个系统性高优先级回退/冲突 + 2 个局部未对齐**。这些问题足以让用户感觉“之前修好的东西又变回去了”，因为它们横跨共享 Surface、响应式与 Aquarium 3D framing。

### P0 / 必须先修

1. **Surface 响应式 split-brain：UA 判断与 viewport 判断并存**
2. **Aquarium 3D 双重 framing：Three camera + CSS canvas scale 同时生效**
3. **Dialog auto inference 签名冲突：Aquarium 智能推荐被误判为 Browsing Detail**

### P1 / 高优先级

4. **Encyclopedia / Care 在 768–1023px 仍会让 selection dock 参与正常文档流**
5. **Aquarium legacy Dialog 仍大量依赖 auto inference，浏览内容/任务/确认未显式分类**
6. **Collection Hub 交互逻辑已对齐，但视觉仍偏“悬浮卡片”而非“悬浮海洋生物图标”**

---

## 1. 全局 Surface 响应式：P0 回退风险

### 已确认需求

- Desktop 浏览详情：右侧 persistent Rail，底层页面可继续滚动和点击。
- Mobile 浏览详情：约 68dvh bottom sheet。
- Task：Desktop right rail / Mobile high bottom sheet。
- Blocking confirmation：centered modal。

### 当前状态

`LayoutModeProvider` 通过 user agent 判定 `phone | desktop`，并且状态初始化后不随 viewport resize 更新：

- iPad / Tablet 被明确当作 desktop；
- desktop browser 即使缩到 390px，provider 仍可能保持 desktop。

与此同时 shared `Dialog` 自己又通过 `matchMedia('(max-width: 767px)')` 判断 phone viewport。

高频页面 SpeciesDetail / Care 又显式传 `modal={isPhoneLayout}`。

### 风险

同一个弹窗可能出现：

- Root modal 语义按 UA；
- Popup geometry 按 viewport；
- overlay / body lock / dismissal 行为跟 geometry 不一致。

这会造成“同一个页面缩放后弹窗方向、遮罩、可交互性突然变化”。

### Verdict

**P0 — system regression / inconsistent contract**

### 修复方向

统一为一个 responsive source of truth。Surface 的 modal/geometry/dismissal 必须全部读取同一 layout contract；不能 UA 和 viewport 各自判断。

---

## 2. Aquarium 3D framing：P0 未对齐

### 已确认需求

- Aquarium 主视觉是一整块沉浸 stage。
- 初始鱼缸不能巨大到只看到玻璃/空白；窗口缩小时鱼也不能迅速变得不可读。
- 3D framing 应由 Three camera 根据容器 aspect 自适应。

### 当前状态

`ThreeAquarium` 已有 `stage-cover` camera framing。

但 `aquarium-stage-layout-v4.css` 仍继续对 canvas 做 CSS transform：

- >=1600px: scale(1.30)
- 1280–1599px: scale(1.26)
- >=960px: base scale(1.22)
- 960–1279px: scale(1.16)
- 768–959px: scale(1.08)

### 风险

Camera 已经做一次 cover，CSS 又做第二次 zoom/crop。结果正对应用户已观察到的：

- 初始鱼缸太大；
- viewport 变化时 framing 不连续；
- canvas 虽铺满，但真实 3D 内容比例仍不稳定；
- CSS transform 还可能影响 R3F pointer/raycast 与 Html overlay 对齐。

### Verdict

**P0 — still misaligned**

### 修复方向

移除 canvas CSS zoom，把 immersive framing 完全收回 `ThreeAquarium` camera math；通过 1440 / 1280 / 1024 / 768 / 390 runtime gate 验证。

---

## 3. Dialog auto inference 签名冲突：P0 真实错误

### 已确认需求

- Browse/read content → Detail Rail
- Multi-step/action workflow → Task Rail
- Delete/discard → Blocking

### 当前状态

Shared `inferSurface()` 为 Encyclopedia species-group 建了 legacy bridge：

`max-w-[920px] + rounded-[24px] => detail`

但 Aquarium 的“缸内生物智能推荐”恰好也使用：

`max-w-[920px] + rounded-[24px]`

它本质是 Task Flow，却会被自动识别成 Browsing Detail。

### 用户可见影响

- Desktop 宽度可能落到 detail 480–600px，而不是 task <=760px；
- mobile 可能使用 68dvh 而不是 82dvh；
- modal/non-modal 和 dismissal 语义也可能错误。

### Verdict

**P0 — concrete current misclassification**

### 修复方向

删除基于视觉 class signature 的业务语义推断。用户主路径 Dialog 必须显式 `surface="detail|task|blocking|media"`，或迁入 Adaptive primitive。

---

## 4. Encyclopedia / Care interactive scene：P1 高优先级回退

### 已确认需求

互动场景背景/图片必须一直到底；选中结果以 overlay 方式浮在 scene 上，不能把 scene 本身压短。

### 当前状态

`SpeciesSceneAtlas` 的 DOM 仍为：

`stage -> dock -> note`

其中 dock/note 是 stage 的兄弟节点。

base `index.css` 中 dock 是正常文档流；只有 `immersive-detail-layout-v5.css` 在 **>=1024px** 才把 dock 改为 absolute overlay。

因此 768–1023px：

- selection dock 仍会占据正常页面高度；
- Encyclopedia note 也会继续位于 stage 之后；
- 原先“画面没有到底、下面出现白色结果带”的问题可以重新出现。

Care 的 KnowledgeSceneExplorer 存在同样结构问题。

### Verdict

**P1 High — original badcase can recur at 768–1023**

### 修复方向

场景结构层统一：scene shell 自身拥有 viewport，dock 从组件结构上就是 overlay，而不是依赖 >=1024 CSS 才变 overlay。

---

## 5. Aquarium legacy popup inventory：P1 未完成

`Aquarium.tsx` 仍有大量 direct `DialogContent`：

- reminder reschedule → Task
- delete reminder → Blocking
- delete aquarium → Blocking
- local data / backup → Task
- tank preview → Fullscreen / Media
- diagnosis exit → Blocking
- Daily Check article → Browsing Detail
- all reminders → Task
- observation → Task
- smart recommendation → Task（当前被错误 signature bridge 识别）
- water-change guide → Browsing Detail
- share-url result → Result/Task
- conflict resolution → Task

### 当前问题

不少弹窗“位置看起来暂时对”只是因为 shared auto inference 兜底，并不是页面明确表达了产品语义。

其中 Daily Check article / 换水指南当前默认落入 Task，而它们本质是 browse/read detail。

### Verdict

**P1 — semantics not normalized**

### 修复方向

不要整写 460KB 页面。优先抽小组件或逐个显式 `surface`；最后删除对应 auto-inference debt。

---

## 6. Collection Hub：P1 视觉部分未对齐

### 已确认需求

- 海洋生物图标悬浮在场景里；
- hover 显示下面细分；
- 点击后对应模块置于中央；
- Desktop 更像场景导航，而非普通功能卡片；
- Mobile 用 tap-expand / compact icon，而非强行 hover。

### 当前状态

已实现：

- 4 个 marine visual node；
- desktop absolute positioning；
- hover/focus 展开细分；
- click 改变 activeModule；
- 中央主内容随 activeModule 更新；
- mobile 有独立 2x2 入口。

未完全对齐：

- Desktop marine node 仍是 `min-h-[112px] min-w-[150px] rounded-[30px]` 的玻璃卡片；
- 海洋生物图片被包在明显按钮容器内，因此视觉上仍更像“4 个悬浮功能卡”，不是“生物本身就是导航”；
- Mobile 仍是 2x2 卡片网格，而非更轻的 icon/tap-expand 体验。

### Verdict

**P1 — interaction aligned, visual language partial**

---

# 页面级 Alignment Matrix

| 页面 / Scope | 当前状态 | Severity | Audit verdict |
|---|---|---:|---|
| 全局 Surface responsive | UA / viewport 双源判断 | P0 | **回退风险 / 系统不一致** |
| `/aquarium` 3D stage | stage geometry已改善，但 camera + CSS zoom 重复 | P0 | **未对齐** |
| `/aquarium` Smart Recommendation | Task 被 legacy signature 推断成 Detail | P0 | **真实错误** |
| `/aquarium` legacy dialogs | 多数仍依赖 auto inference | P1 | **未完全收口** |
| `/encyclopedia` main detail | persistent Rail 代码已在 | — | **主体对齐，browser pending** |
| `/encyclopedia` scene 768–1023 | dock/note 仍参与 flow | P1 | **回退** |
| `/care` main detail | shared persistent Rail | — | **主体对齐，browser pending** |
| `/care` scene 768–1023 | selection dock 仍参与 flow | P1 | **回退** |
| `/collection` Hub | hover/subitems/center focus 已实现 | P1 | **交互对齐，视觉部分未对齐** |
| `/collection/wishlist` | shared Species Detail + blocking remove | — | **源码层面基本对齐** |
| `/collection/care` | shared Care Detail + blocking remove | — | **源码层面基本对齐** |
| `/collection/memorial/:id` | dedicated page + discard blocking modal | — | **对齐** |
| `/collection/achievements` | full module page | — | **未发现当前硬回退** |
| `/identify` | Species Detail + explicit blocking discard | — | **对齐，受全局 responsive split-brain 影响** |
| `/settings` | shared blocking confirmation / nav guard | — | **对齐** |
| `/search` | 无 private popup；species 先选择再跳图鉴 detail | P2 | **一致性 debt，不是已确认回退** |
| `/welcome` | standalone onboarding | — | **未发现回退** |
| `/login` | standalone login | — | **未发现回退** |
| `/report/:token` | standalone report + shared media export | — | **对齐** |
| `/admin/content` | 多处 `window.confirm` | P2 | **内部治理 debt** |

---

# Historical / Regression Debt

## `src/index.css`

当前仍保留大量历史布局实现，例如：

- `.aquarium-desktop-layout` 三列 dashboard；
- `.collection-book-*` 旧翻书式 Collection；
- 其他旧 split workspace selector。

它们未必当前全部生效，但依然是未来 specificity / selector collision 的回归源。

当前 import order 是：

1. `index.css`
2. `aquarium-stage-layout-v4.css`
3. `immersive-detail-layout-v5.css`

因此 canonical override 当前可以压住很多旧规则，但这不是理想长期架构。

### Verdict

**Architecture debt / regression risk**

长期需要把已废弃规则真正删除，而不是永远依靠后加载 + `!important` 覆盖。

---

# 修复顺序

## Phase A — 先修系统性回退

1. **统一 LayoutMode / Dialog viewport source of truth**。
2. **删除 `max-w/rounded` class signature inference**，先修 Aquarium Smart Recommendation 错分。
3. **Encyclopedia / Care scene dock 改成结构性 overlay，覆盖 768–1023。**

## Phase B — 修当前视觉 P0

4. **Aquarium 移除 canvas CSS zoom，camera 成为唯一 framing owner。**
5. 1440 / 1280 / 1024 / 768 / 390 runtime geometry + interaction regression。

## Phase C — UI polish / semantic cleanup

6. Collection marine nodes 从 glass card 收敛成真正的 floating creature icon。
7. Aquarium legacy Dialog 显式分类并逐步拆小组件。
8. 删除 `index.css` 已废弃 `.collection-book-* / aquarium-desktop-layout / old split` 规则。
9. Admin native confirm 作为 P2 后台治理处理。

---

# 验收边界

- 本 audit 只证明源码结构/规则的当前 alignment 状态。
- `source aligned` ≠ browser PASS。
- `browser PASS` ≠ human visual PASS。
- Vercel branch preview 可能因 build-rate-limit 落后于 GitHub head。
- 当前视觉仍未达到可冻结 golden screenshot baseline 的状态。

下一轮修复必须从本文件和 `UI_REGRESSION_CONTRACT.md` 出发；旧测试、旧 CSS、旧分支若与两者冲突，不得作为正确产品状态恢复。