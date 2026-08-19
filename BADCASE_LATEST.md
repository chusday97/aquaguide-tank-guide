# AquaGuide Badcase — Latest

## PUI-BC-033 · 水族册只有横滑能力，但缺少真正的轮播主次感

- `discoveredAt`: 2026-08-19
- `featureId`: collection
- `source`: user_review
- `severity`: medium
- `rootCauseLayer`: interaction_design
- `status`: verifying

### Symptom

「我的水族册」虽然已经能横向 scroll-snap，但模块仍像一排并列卡片：没有明确当前卡、没有邻卡弱化、没有方向按钮和位置反馈，用户很难感知“当前正在浏览哪一个模块”，整体交互与 IceGlide 的轮播体验差距明显。

### Trigger

进入 `/collection`，连续浏览「种草图鉴 / 养护收藏 / 生命纪念 / 成就勋章」。

### Expected

- 当前模块成为视觉中心。
- 左右邻卡露出但明显弱化。
- 支持拖拽、左右按钮和点击邻卡切换。
- 有清晰当前位置反馈。
- 非当前卡不能误触内部业务按钮。
- 已开放模块仍可直接进入真实对象；建设中模块不得恢复成伪 CTA。

### Actual before fix

首页模块依赖 CSS `overflow-x:auto + scroll-snap-type:x mandatory`。这解决了“能左右滑”，但没有 active index，也没有 scale / opacity / blur / arrow / indicator，因此体验仍属于 horizontal rail，而不是 focus carousel。

### Root cause

PUI-BC-017 的验收重点是“从纵向 grid/list 改为横向滑动”，测试也主要验证 scroll-snap 和下一卡露出。它覆盖了布局能力，没有覆盖轮播的状态表达和主次感，因此功能 PASS 后仍留下体验层 Badcase。

### Fix

- `src/pages/CollectionHub.tsx`
  - 新增 `CollectionCarousel`。
  - 使用循环 active index。
  - 当前卡 `scale=1`，邻卡 `scale=0.86`。
  - 邻卡降低 opacity 并加入轻 blur。
  - 使用 Motion spring 动画与横向 drag。
  - 新增上一张 / 下一张按钮与位置圆点。
  - 非当前卡内部 `pointer-events-none`。
- `scripts/test-collection-swipe-cards.mjs`
  - 新增 focus carousel 交互契约检查。

### Fix evidence

- implementation commit: `f3534d9`
- regression contract commit: `798aa45`
- branch: `fix/collection-carousel-20260819`

### Regression

当前静态门禁应至少验证：

- `CollectionCarousel` 存在。
- `data-carousel-active` 存在。
- `drag="x"` 存在。
- active / inactive scale 差异存在。
- inactive blur 存在。
- 上一张 / 下一张可访问名称存在。
- 指示器使用 `aria-current`。
- 中文发现性提示存在。

### Remaining verification

- TypeScript / build。
- 390px、600px、1280px 浏览器几何。
- 卡内按钮与拖拽手势冲突。
- 轮播按钮是否遮挡主卡正文。
- 成就建设中模块继续保持非业务 CTA。

通过以上回归后，将状态改为 `regression_verified`。
