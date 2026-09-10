# AquaGuide Species SEO 当前交接

更新时间：2026-09-10

## 当前目标

持续收口公开 SEO 页面：保持统一中文视觉与响应式规则，保证公开内容遵守证据/fingerprint 门禁，并在真实浏览器、独立 Critic、Figma Canonical 和发布条件完成前保持 `noindex,follow`。

## 已完成

- Public Shell、Marketing、Category、Species、Guide 的 Web 结构与中文公开文案已完成。
- Species 的 Product Truth、Base/Variant 继承、素材状态和自然志内容门禁已建立。
- 新增公开页面结构、中文文案和响应式静态契约回归。
- 最新相关提交：`6bd9341c docs: record public asset fallback check`；素材预览修复提交为 `02a27ea4`，用户保留的三份未提交文件仍未纳入提交。

## 当前验证

- 通过：`test:public-seo-responsive-contract`、`test:public-seo-structure`、`test:public-seo-copy`、`test:public-seo-contract`、`test:seo-editorial-evidence`、`test:seo-evidence-bindings`、`lint`、`build`、`git diff --check`。
- 通过：`test:seo-asset-candidates`；内置浏览器实际确认黄金米虾 Hero/品系卡预览和宝莲灯普通路由图片回退，证据为 EVD-20260910-135、EVD-20260910-136。
- 响应式静态规则覆盖桌面、平板、手机参数带列数、窄屏章节导航、平板 Hero 和 reduced-motion；Codex 内置浏览器已补充三条 Species 路径在 390/600/1440px 的真实 DOM/交互证据，包括滚动、无溢出、锚点、FAQ、品系切换和返回。

## 阻塞与禁止项

- 系统 Playwright 浏览器仍受 macOS MachPort/进程权限阻塞；内置浏览器证据已通过，但不能把它扩写成系统 Chrome 自动化通过。reduced-motion 与性能指标仍未完成。
- 已尝试让既有 Critic 任务复验当前 worktree；最新 turn 已结束但没有返回正文。旧 turn 的可读报告基于旧提交/旧工作树，不能作为当前 Critic 通过证据。
- Figma Canonical 模板和可读独立 Critic 尚未完成。
- 不调用 Figma、不修改 `main`、Production Supabase 或生产部署，不解除 `noindex`。

## 下一步

1. 不把当前空 Critic 输出算作通过；待审查任务可读输出恢复后，再进行一次当前 SHA 的只读复验。
2. Critic 修复/复验后，系统 Chrome 恢复时只补跑一次 Species/公开路由自动化；不重复启动失败进程。
3. 等待 Figma 配额恢复后集中补 Canonical 模板。
4. 最后才做关键词归属、canonical、结构化数据、Sitemap 和用户批准的非生产索引候选。

## 工作树注意

用户既有未提交文件 `scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts` 未纳入本轮提交，后续不得覆盖或代替用户决定。

## 2026-09-10 本地预览复核补充

- `3000` 当前由残留进程占用；本轮在 `3001` 启动预览，内置浏览器确认 Species 长页面和 FAQ 锚点真实可达。
- 修复 Species `assetPreview=1` 品系卡预览的最小字段类型适配；Evidence、Editorial、Public Contract、Responsive Contract、lint、build、diff-check 均通过。
- `test:species-landing` 与 `test:seo-motion` 仍是 Chromium 启动阶段 MachPort 权限失败；Critic 最新复验无正文，Figma 继续暂停。
- 内置浏览器已实测品系切换、浏览器返回和 FAQ 展开；交互状态与内容可见性正确，证据记录为 EVD-20260910-138。
- 分类页和新鱼入缸指南已补充实际加载证据，记录为 EVD-20260910-139；指南未审核正文仍保持 fail-closed。
- 同一 Critic 任务已针对当前 HEAD `93a7fad6` 完成只读复验，但仍没有可读正文；不能替代独立验收通过，当前记录为审查基础设施阻塞。
