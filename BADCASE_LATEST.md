# AquaGuide Badcase — Latest

## PUI-BC-033 · 水族册只有横滑能力，但缺少真正的轮播主次感

- `discoveredAt`: 2026-08-19
- `featureId`: collection
- `source`: user_review
- `severity`: medium
- `rootCauseLayer`: interaction_design
- `status`: regression_verified

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
  - 新增循环 `CollectionCarousel` active index。
  - 当前卡 `scale=1`；邻卡 `scale=0.86`，降低 opacity 并加入轻 blur。
  - 使用 Motion spring + horizontal drag。
  - 新增上一张 / 下一张按钮与位置圆点。
  - 非当前卡内部 `pointer-events-none`，邻卡本身仍可点击切换。
- `src/styles/typography-system.css`
  - 移除旧 collection-hub rail 样式；保留 Wishlist/Care 同类对象的 scroll-snap rail。
  - carousel card 使用 `touch-action: pan-y`。
- `scripts/test-collection-swipe-cards.mjs`
  - 新增 focus carousel 静态交互契约并接入 CI。
- `scripts/verify-golden-path-collection-context.mjs`
  - GP-005 增加真实浏览器轮播状态与几何断言。

### Fix evidence

- implementation: `f3534d9374a639ca782f210c52b650db340cd25e`
- static regression: `798aa45c1dbd0bf1541d5fa00df7ef5f6f1cc6e5`
- browser regression extension: `d288fda68fd6b80855a87fc04eba1c71c2acd211`
- CI gate: `ea520e28d043f21e69f88112a599f806da834de1`
- stale CSS cleanup: `dc8364fef9c22132c21e3346a5115afae7573147`
- final geometry test fix: `6cc54c25082b0e7033aa6ffa349e0ab2ee05dcc0`
- branch: `fix/collection-carousel-20260819`
- PR: `#103`

### Regression evidence

Product Golden Path run `32243038773` / #949 on head `6cc54c25082b0e7033aa6ffa349e0ab2ee05dcc0` passed completely:

- Product Evaluation contracts PASS，且包含 `test:collection-swipe-cards`。
- TypeScript PASS。
- Production build + preview PASS。
- GP-001～GP-005 PASS。
- GP-005 在 1440×900 桌面和 390×844 手机验证：唯一 active card、中心卡相对 carousel surface 居中、至少两张可见邻卡、上一张/下一张切换、唯一 `aria-current` 圆点、页面无横向溢出。
- 继续验证 Wishlist detail journey：横向位置存在 → 打开精确收藏对象 → desktop right drawer / mobile bottom sheet → 关闭后恢复精确卡片焦点和原 rail position。

### Residual scope

- 本轮没有单独跑 600px / 1280px viewport，因此不把这两个尺寸写成已验证。
- PR 仍为 draft，尚未合并 `main`，也没有宣称生产环境已更新。
