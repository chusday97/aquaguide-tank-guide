# AquaGuide Progress — 2026-08-19

## 本轮目标

把「我的水族册」升级成与 IceGlide 同类的中心聚焦轮播，并同步整理 handoff / badcase / progress。

## 当前进度

| 阶段 | 状态 | 结果 |
|---|---|---|
| 读取 AquaGuide 最新状态 | ✅ 完成 | 确认当前首页水族册仅有 horizontal scroll-snap；PUI-BC-017 已解决“可横滑”，但未覆盖 focus carousel 主次感 |
| 对照 IceGlide 轮播 | ✅ 完成 | 参考 `components/UpcomingCarousel.tsx`：active index、循环位移、drag、spring、side-card weakening、箭头 |
| 水族册首页实现 | ✅ 完成 | 新增 `CollectionCarousel`；中心主卡、邻卡露出、缩放/透明度/blur、拖拽、箭头、圆点 |
| 保留原业务交互 | ✅ 完成 | Active 卡内部仍可直接进入对象；非 Active 卡先切换；Achievements 继续 building 非 CTA |
| 回归契约 | ✅ 完成 | `test-collection-swipe-cards.mjs` 增加 focus carousel 静态契约，同时保留收藏详情页 scroll-snap 契约 |
| Handoff | ✅ 完成 | 新建 `HANDOFF_LATEST.md` |
| Badcase | ✅ 完成 | 新建 `BADCASE_LATEST.md`，登记 PUI-BC-033，当前 `verifying` |
| Progress | ✅ 完成 | 本文件 |
| Typecheck / Build | ⏳ 待 CI | 创建 PR 后通过 GitHub Actions 验证 |
| 浏览器 390 / 600 / 1280px | ⏳ 待验证 | 重点检查卡片裁切、箭头覆盖、拖拽与内部按钮冲突 |
| 合并 main | ⏳ 待验证 | CI 与浏览器回归通过后执行 |

## 代码提交

- `f3534d9` — `feat: turn collection hub into focus carousel`
- `798aa45` — `test: cover collection focus carousel interaction`
- `3fd822f` — latest handoff
- `1729e9b` — latest badcase

## 本轮产品判断

旧方案不是“完全没做轮播”，而是停在了横向轨道这一层。它解决了信息密度和手机左右滑动，但没有解决“当前对象是谁”的认知问题。此次改动把首页模块切换升级为显式状态机；种草/养护详情页仍保留 scroll-snap，因为那里用户是在连续浏览同类对象，不需要强制一张主卡占据注意力。

## 下一步判定标准

只有同时满足以下条件，PUI-BC-033 才能关闭：

1. typecheck 与 build 通过。
2. 水族册现有功能回归不退化。
3. 手机与桌面都能看到明确中心卡和邻卡。
4. 拖拽不吞掉 Active 卡内部点击。
5. 箭头在窄屏不遮挡核心文本或 CTA。
6. Achievements 继续为不可执行业务的 building surface。
