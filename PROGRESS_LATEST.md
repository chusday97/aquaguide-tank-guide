# AquaGuide Progress — Latest

更新时间：2026-08-21 15:06 +08:00

## 当前结论

当前工作重点已经从“单页视觉补丁”升级为 **全站 Surface System 重构**。最新产品代码基线为 `68070298e01ffe2547cac444c9cf85df0173d773`。本轮代码已写入 `codex/interactive-parity-v3`，但最新完整视觉预览受 Vercel build-rate-limit 阻塞，因此当前状态是 **implementation progressed / validation pending**，不是 UI PASS。

## Workstream 状态

### 1. 全站详情 / 弹窗体系 — 进行中，结构已重构

**发现的问题**

- 详情 Surface 在不同页面表现为左侧、右侧、页面内双栏或居中弹窗，缺少统一语义。
- Desktop 物种详情会因为 viewport media query 在约 600px Rail 内继续渲染双列，产生严重挤压。
- 非模态 Base UI Dialog 在用户点击底层另一个物种时会触发 outside dismissal，导致“换物种 = 弹窗消失”。
- Mobile Task Surface 仍有从左侧/整屏进入的旧结构，与详情 bottom sheet 不一致。

**已实现**

- `25c7ea9`：非模态浏览 Rail 不因底层点击自动关闭。
- `0206e3a`：AdaptiveDetailContent 统一成 Desktop persistent right rail + Mobile bottom sheet。
- `a936233`：移除 split-workspace 网格；Rail 内物种详情改纵向信息结构，正文内部滚动。
- `6807029`：AdaptiveTaskContent 手机端统一从底部上拉；桌面任务流统一右 Rail。

**当前状态**

- Code: implemented。
- Latest full branch preview: pending / rate-limit blocked。
- Human visual acceptance: NOT PASS。
- Browser interaction regression on final code head: pending。

### 2. Aquarium 首页 3D framing — 继续观察

- `3a6bb9a` 已撤销与 ThreeAquarium `stage-cover` 重叠的极端 CSS 二次 zoom。
- 当前 CSS crop 收敛为：1600+ 约 1.30x、1280–1599 约 1.26x、1050–1279 约 1.16x、Tablet 约 1.08x、Mobile 无额外 zoom。
- 舞台最大高度已收敛，避免超大玻璃缸背景。
- 但用户最新反馈仍指出“初始鱼缸太大 / 缩小时看不清”，因此此项保持 **investigating**，不能视为完成。

### 3. 我的水族册 — 新交互已实现，视觉验收待继续

- `1031517`：旧翻页书册主页替换为悬浮海洋生物导航。
- 四个真实模块仍为：Wishlist / Care / Memorial / Achievements。
- Desktop：海洋生物节点漂浮在场景边缘；hover/focus 显示真实细分；点击把对应模块置中。
- Mobile：无 hover，改为 tap 切换中央模块。
- 原有 collection snapshot、真实数据、deep link 保留。
- Vercel 对 `1031517` 已有 READY 部署；但最终视觉风格仍需用户继续确认。

### 4. 互动图鉴 / Care 场景 — 功能基础保留

- 互动图鉴批次、透明素材、热点名称常驻等既有能力继续保留。
- 新 Surface System 的原则是：详情 Rail 是场景上方的非模态浏览层，不能重新把场景切成固定 50/50 两栏。
- 选中结果 dock 继续保持场景内部 overlay，不能再把水下画面向上顶短。

### 5. AI / Rule Evaluation — 本轮无新增 AI Badcase

既有最近一次结果：

- deterministic: 37 / 37 PASS
- mocked provider: 10 / 10 PASS
- total: 47 / 47 PASS
- `evaluation/badcases/registry.jsonl`: 0

注意：本轮主要是 UI/Surface 代码，没有把 UI 视觉问题写进 AI registry。AI PASS 不能证明 UI PASS。

### 6. Deployment / Preview — 当前阻塞

- `25c7ea9` 对应 Vercel deployment 已 READY，可验证“非模态 Rail 不因底层点击关闭”的第一步代码。
- 后续 `0206e3a`、`a936233`、`6807029` 的 GitHub status 在同步时返回 Vercel `build-rate-limit`。
- 因此当前 branch alias 可能仍展示旧实现，不能用旧 preview 判断最终 Rail 排版。

## 当前 P0 验收任务

1. 等最新 Surface head 真正部署后跑 1440px Encyclopedia 连续切换物种路径。
2. 验证 `/encyclopedia` 互动模式和传统浏览模式都能保持右 Rail 常驻。
3. 验证 `/care` / `/care?mode=browse` 使用同一右 Rail 规范。
4. 验证 Aquarium roster → Species Detail → close 的 immediate-parent / scroll / focus 恢复。
5. 验证 1024px 不因 Rail 导致底层浏览区域不可用。
6. 验证 390px Detail 68dvh bottom sheet、Task 82dvh bottom sheet，无横向溢出。
7. 全站盘点剩余直接使用 `DialogContent` 的表面，分类为 Browsing Detail / Task Flow / Blocking Confirmation；不允许未分类弹窗继续自由决定位置。
8. 重新 review Aquarium 3D framing：1440 / 1280 / 1024 / 768 / 390。

## Merge / Release 边界

- 不合并 `main`。
- 不因为 Vercel 某个旧 deployment READY 就宣布本轮完成。
- 当前 `codex/interactive-parity-v3` 与 RC1/#104/#105 有明显 ancestry divergence，后续需要 semantic reconciliation。
- 在 Surface 浏览器验收、Aquarium framing 视觉确认、分支整合计划完成前，状态保持 **not release-ready**。

详见 `HANDOFF_LATEST.md` 和 `BADCASE_LATEST.md`。
