# AquaGuide Handoff — 2026-08-19

## 当前目标

把「我的水族册」从“可横向滑动的列表”升级为与 IceGlide `UpcomingCarousel` 同类的中心聚焦轮播：当前卡明确突出、左右邻卡露出、支持拖拽/箭头切换，并继续保持收藏对象可直接进入详情。

## 本轮已落地

- 工作分支：`fix/collection-carousel-20260819`
- Draft PR：`#103 Upgrade collection hub to IceGlide-style focus carousel`
- `src/pages/CollectionHub.tsx`
  - 新增 `CollectionCarousel`。
  - 四个水族册模块改为中心聚焦轮播，不再依赖首页模块的普通 scroll-snap 轨道表达轮播感。
  - 当前卡 `scale=1 / opacity=1 / blur=0`；邻卡 `scale=0.86` 并弱化，点击邻卡先切换为当前卡。
  - 支持横向拖拽，阈值同时考虑 offset 与 velocity。
  - 新增上一张 / 下一张圆形按钮、位置圆点及 `aria-current`。
  - 中文/英文增加滑动发现性提示。
  - 非当前卡内部交互禁用，避免用户在弱化卡上误触业务按钮。
  - `成就勋章` 继续保持 `building` 非业务 CTA。
- `src/styles/typography-system.css`
  - 删除已经不再命中的 collection hub 旧 scroll-snap rail CSS，避免两套交互契约并存。
  - 为 Motion carousel card 增加 `touch-action: pan-y`，允许手机纵向滚动与横向拖拽共存。
- `scripts/test-collection-swipe-cards.mjs`
  - 保留种草收藏 / 养护收藏详情页原有横向 scroll-snap 契约。
  - 新增首页 focus carousel 静态回归：drag、active state、scale、blur、左右按钮、圆点与发现性提示。
- `scripts/verify-golden-path-collection-context.mjs`
  - GP-005 现在先验证水族册 focus carousel，再继续验证 Wishlist → 精确收藏对象 → Drawer/Sheet → 返回原卡片和原横向位置。
  - 几何中心以 carousel 内容容器而不是整个 viewport 为基准，避免固定侧栏造成假失败。
  - 浏览器断言覆盖唯一 active card、两张可见邻卡、前后切换、圆点当前位置与页面无横向溢出。
- `.github/workflows/product-golden-path.yml`
  - `test:collection-swipe-cards` 已进入 Product Evaluation contracts，后续不能只改 UI 不跑轮播契约。

## 设计基线

参考 IceGlide `components/UpcomingCarousel.tsx` 的交互原则，而不是复制视觉皮肤：

1. 中心卡是唯一主对象。
2. 邻卡只作为“还有内容”的空间提示。
3. 手势、左右按钮、点击邻卡都能改变当前卡。
4. 动画使用 spring，避免硬切。
5. 非当前卡降低 scale / opacity / clarity，主次关系必须肉眼可见。
6. 首页轮播负责模块切换；种草/养护详情继续使用 scroll-snap 浏览同类收藏对象。
7. 模块内部继续遵守 AquaGuide 的 `Card = Open object` 契约。

## 与旧实现的关系

2026-08-12 的 PUI-BC-017 已解决“水族册完全是纵向 grid/list”的问题，当时使用 horizontal scroll-snap。此次用户复核说明：功能层面虽然可滑，但体验仍更像横向列表，不像真正轮播。因此本轮不是推翻 PUI-BC-017，而是把“可滑动”进一步升级为“中心聚焦、有明确 active state 的轮播”。

## 验证状态

- 实现验证 head：`6cc54c25082b0e7033aa6ffa349e0ab2ee05dcc0`
- Product Golden Path：run `32243038773` / #949，PASS。
- PASS：Product Evaluation contracts（包含 `test:collection-swipe-cards`）、TypeScript、production build、preview、Care card regression、GP-001～GP-005。
- GP-005 浏览器验证：1440×900 桌面 + 390×844 手机；中心 active card、至少两张可见邻卡、前后按钮状态、位置圆点、无页面级横向溢出、Wishlist 详情打开/关闭上下文恢复均通过。
- 600px / 1280px 本轮没有作为独立 viewport 再跑一次，因此不要把它们写成已验证事实。
- 当前仍是 Draft PR，尚未进入 `main`，也没有宣称生产环境已更新。

## 下一步

PUI-BC-033 已达到 `regression_verified`。如果继续本分支，下一动作应是评审 PR #103；只有合并后再按项目发布流程确认 main / production，不要把 PR 通过等同于已上线。
