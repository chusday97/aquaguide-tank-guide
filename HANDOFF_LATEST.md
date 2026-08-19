# AquaGuide Handoff — 2026-08-19

## 当前目标

把「我的水族册」从“可横向滑动的列表”升级为与 IceGlide `UpcomingCarousel` 同类的中心聚焦轮播：当前卡明确突出、左右邻卡露出、支持拖拽/箭头切换，并继续保持收藏对象可直接进入详情。

## 本轮已落地

- 工作分支：`fix/collection-carousel-20260819`
- `src/pages/CollectionHub.tsx`
  - 新增 `CollectionCarousel`。
  - 四个水族册模块改为中心聚焦轮播，不再依赖首页模块的普通 scroll-snap 轨道表达轮播感。
  - 当前卡 `scale=1 / opacity=1 / blur=0`；邻卡缩小并弱化，点击邻卡先切换为当前卡。
  - 支持横向拖拽，阈值同时考虑 offset 与 velocity。
  - 新增上一张 / 下一张圆形按钮。
  - 新增位置圆点，并用 `aria-current` 暴露当前位置。
  - 中文/英文都增加“左右滑动或点击箭头”发现性提示。
  - 非当前卡内部交互禁用，避免用户在弱化卡上误触收藏/详情按钮。
  - `成就勋章` 继续保持 `building` 非业务 CTA，不因为轮播改造重新伪装成可用功能。
- `scripts/test-collection-swipe-cards.mjs`
  - 保留种草收藏 / 养护收藏详情页原有横向 scroll-snap 契约。
  - 新增首页 focus carousel 的静态回归：拖拽、active state、缩放、弱化、左右按钮、圆点与发现性提示。

## 设计基线

参考 IceGlide `components/UpcomingCarousel.tsx` 的交互原则，而不是复制视觉皮肤：

1. 中心卡是唯一主对象。
2. 邻卡只作为“还有内容”的空间提示。
3. 手势、左右按钮、点击邻卡三种方式都能改变当前卡。
4. 动画使用 spring，避免硬切。
5. 非当前卡降低 scale / opacity / clarity，主次关系必须肉眼可见。
6. 轮播负责模块切换；模块内部仍遵守 AquaGuide 的 `Card = Open object` 交互契约。

## 与旧实现的关系

2026-08-12 的 PUI-BC-017 已解决“水族册完全是纵向 grid/list”的问题，当时使用 horizontal scroll-snap。此次用户复核说明：功能层面虽然可滑，但体验仍更像横向列表，不像真正轮播。因此本轮不是推翻 PUI-BC-017，而是把“可滑动”进一步升级为“中心聚焦、有明确 active state 的轮播”。

## 当前验证状态

- 代码已提交到分支：`f3534d9`。
- 轮播静态契约已提交：`798aa45`。
- GitHub CI / typecheck / build / 浏览器几何验证：待本轮 PR 触发后确认。
- 在 CI 和浏览器回归完成前，不宣称已进入 `main` 或生产环境。

## 下一步

1. 创建 PR 触发 Product Golden Path / typecheck / build。
2. 检查 390px 手机、600px 窄桌面、1280px 桌面：主卡不裁切、邻卡露出合理、箭头不遮挡正文。
3. 验证拖拽与卡内按钮不会互相抢手势。
4. CI 与浏览器通过后，把 PUI-BC-033 标记为 `regression_verified` 并合并。
