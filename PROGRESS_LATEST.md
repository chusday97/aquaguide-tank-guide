# AquaGuide Progress — 2026-08-19

## 本轮目标

把「我的水族册」升级成与 IceGlide 同类的中心聚焦轮播，并同步整理 handoff / badcase / progress。

## 当前进度

| 阶段 | 状态 | 结果 |
|---|---|---|
| 读取 AquaGuide 最新状态 | ✅ 完成 | 确认旧首页只有 horizontal scroll-snap；PUI-BC-017 解决了“可横滑”，但未覆盖 focus carousel 主次感 |
| 对照 IceGlide 轮播 | ✅ 完成 | 参考 `components/UpcomingCarousel.tsx` 的 active index、循环位移、drag、spring、side-card weakening、箭头 |
| 水族册首页实现 | ✅ 完成 | `CollectionCarousel`：中心主卡、两侧预览、scale/opacity/blur、drag、箭头、圆点 |
| 旧样式收口 | ✅ 完成 | 删除 hub 旧 rail CSS；Wishlist/Care 详情仍保留 scroll-snap；carousel card 加 `touch-action: pan-y` |
| 保留业务交互 | ✅ 完成 | Active 卡内部继续直接进入对象；非 Active 卡先切换；Achievements 继续 building 非 CTA |
| 静态回归契约 | ✅ 完成 | `test-collection-swipe-cards.mjs` 覆盖 focus carousel，并已接入 Product Golden Path CI |
| 浏览器回归 | ✅ 完成 | GP-005 新增 carousel 状态/几何；1440×900 desktop + 390×844 mobile PASS |
| Typecheck / Build | ✅ 完成 | Product Golden Path #949 / run `32243038773` PASS |
| GP-001～GP-005 | ✅ 完成 | 全部 PASS；GP-005 同时验证轮播与 Wishlist detail context restoration |
| Handoff | ✅ 完成 | `HANDOFF_LATEST.md` 已收口 |
| Badcase | ✅ 完成 | `BADCASE_LATEST.md`：PUI-BC-033 → `regression_verified` |
| Canonical badcase registry | ✅ 完成 | PUI-BC-033 同步进入 `evaluation/product/badcases.v1.jsonl` |
| 合并 main | ⏳ 未执行 | 当前保持 Draft PR #103；PR PASS 不等于 main/production 已更新 |

## 关键代码提交

- `f3534d9` — `feat: turn collection hub into focus carousel`
- `798aa45` — `test: cover collection focus carousel interaction`
- `d288fda` — `test: verify collection focus carousel in GP-005`
- `ea520e2` — `ci: gate collection carousel regression`
- `dc8364f` — `style: retire obsolete collection hub rail rules`
- `6cc54c2` — `test: scope carousel geometry locator`

## 验证证据

Product Golden Path #949 / run `32243038773` on head `6cc54c25082b0e7033aa6ffa349e0ab2ee05dcc0`：

- Product Evaluation contracts PASS；其中包含 `npm run test:collection-swipe-cards`。
- TypeScript PASS。
- Production build PASS。
- Preview PASS。
- Care card action regression PASS。
- GP-001、GP-002、GP-003、GP-004、GP-005 全 PASS。
- GP-005 浏览器几何覆盖 1440×900 与 390×844：active card 唯一且相对 carousel surface 居中、至少两张邻卡可见、前后按钮切换正确、唯一 `aria-current` indicator、无页面级横向溢出。
- Wishlist 原有核心链路继续通过：进入横向收藏 rail → 精确对象详情 → desktop drawer / mobile sheet → 关闭后恢复同一对象焦点与原 rail scroll position。

## 本轮产品判断

旧方案不是“完全没做轮播”，而是停在横向轨道这一层。它解决了信息密度和手机左右滑动，却没有解决“当前对象是谁”的认知问题。此次首页升级为显式 active state 的 focus carousel；种草/养护详情仍保留 scroll-snap，因为那里的任务是连续浏览同类对象，不需要强制一张主卡独占注意力。

## 当前边界

- PUI-BC-033 已可关闭为 `regression_verified`。
- 600px / 1280px 本轮没有作为独立 viewport 再跑，因此不宣称已验证。
- PR #103 仍为 Draft，尚未合并 `main`；生产环境没有在本轮被修改。
