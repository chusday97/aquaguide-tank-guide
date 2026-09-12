# Current Goal

> 校准日期：2026-09-12。本文只记录本 worktree 的 AquaGuide 公开 SEO 目标；旧主线收敛目标保留在历史进度中，不作为本分支执行依据。

## 当前目标

持续完成 AquaGuide 公开 SEO 系统：优先修复真实用户体验与响应式问题，统一中文公开页面的视觉和交互，补齐并验证有权威来源的物种内容与素材，维护 Base/Variant 内容继承和 fail-closed 发布门禁。

每轮推进一个可验证闭环并同步项目文档、测试和证据。浏览器回归、可读独立 Critic 和发布门禁全部通过前，不宣称最终完成。

## 关键约束

- 始终保持公开页面 `noindex,follow`。
- 不修改 `main`、Production Supabase 或生产部署。
- Figma Starter 配额恢复前不调用 Figwright；恢复后集中完成 Canonical 模板。
- Product Truth 只来自 AquaGuide catalog；已确认来源之外的生物事实必须省略。
- Base 提供共享正文，Variant 只表达已确认差异，不重复建立共享 evidence。
- 英文内容保持 Draft/review-only，不混入中文公开页面。
- 当前工作树中的用户未提交文件不得覆盖、重写或代提交。

## 当前状态

`IN_PROGRESS` — Public Shell、首页/分类/Species/Guide Web 结构、中文视觉令牌、证据与素材门禁已经落地；内置浏览器已复核公开页面多视口结构。当前仍等待系统 Chrome 自动化、可读独立 Critic、Figma Canonical 和最终发布门禁。

## 当前可验证下一步

1. 保持已完成的内置浏览器多视口证据，不重复启动已知受 MachPort 阻塞的系统 Chrome。
2. 在可读输出能力恢复后，对当前 SHA 只进行一次独立 Critic 只读复验。
3. 等待 Figma 配额恢复后，批量完成四类公开 SEO Canonical 模板。
4. 最后进行关键词归属、Canonical、结构化数据、Sitemap 和用户批准的非生产索引候选。
