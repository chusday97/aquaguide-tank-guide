# AquaGuide Species SEO 当前交接

> 当前有效快照：2026-09-12，分支 `codex/species-seo-preview-v1`，HEAD `ff2f2ff1`。

## 当前有效结论

- 内置浏览器已完成首页、分类、未发布 Guide 和三条 Species 路径的 390/600/1440px 结构复核；公开文档滚动问题已修复。
- Evidence、Public Contract、Responsive Contract、lint、build 和 diff-check 已通过；页面继续 `noindex,follow`。
- 当前物种公开表达已用 FishBase、UF/IFAS 与 USGS NAS 逐条复核，未发现来源范围越界，证据为 `EVD-20260912-010`。
- 系统 Chrome 自动化仍受 macOS MachPort/SIGABRT 阻塞；独立 Critic 最新复验返回空正文；Figma Canonical 仍等待 Starter 配额。
- 用户未提交的三个文件保持原样，不能覆盖或代提交。

## 最新静态验证

- 当前 HEAD `ff2f2ff1` 的 Editorial、Evidence、Public Contract、Responsive Contract、Asset、lint、build 和 diff-check 全部通过，证据为 `EVD-20260912-012`。
- 本轮仅更新证据与状态文档；三个用户未提交文件未触碰、未暂存。

## 当前 Critic 状态

- 当前 SHA `159a095b` 的既有 Critic 复验已完成但没有可读正文，证据为 `EVD-20260912-011`；不能计为独立审查通过。

## 当前下一步

只在 Critic 可返回正文后做一次当前 SHA 只读复验；系统 Chrome 恢复后只补一次自动化回归；Figma 配额恢复后批量完成 Canonical 模板。全部完成前不解除索引、不部署生产。

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
- 同一 Critic 任务曾针对当前 HEAD `93a7fad6` 出现空输出；随后已读取可读六维报告，不能替代整体验收通过，报告中列出的未完成项仍需继续处理。

## 2026-09-10 独立 Critic 结果

- Critic 任务 `01a05275-2b85-76f2-9e84-98bbb04617d5` 已返回可读六维报告，基于 `93a7fad6`；当前到 HEAD 仅有文档和证据变更。
- 报告状态为静态与部分内置浏览器证据基本达标，但整体交付仍阻塞；需继续补真实多视口、失败状态恢复、完整键盘证据，并等待 Figma Canonical 与发布门禁。
- 当前 HEAD 静态公开SEO门禁、lint、build 和 diff-check 复跑通过，证据为 EVD-20260910-142。
- 原生 Chrome CUA 通道也不可用，证据为 EVD-20260910-143；最终多视口浏览器门禁保持阻塞。

## 2026-09-10 交互复核补充

- 内置浏览器完成黄金米虾品系跳转、浏览器返回、FAQ 展开和分类公开页入口验证。
- 证据范围为当前内置浏览器视口；系统 Chrome 多视口、性能、reduced-motion 和独立 Critic 仍未通过。

## 2026-09-10 宝莲灯内容复核

- 本地 Vite 重启后，宝莲灯普通路由实际呈现环境、中层活动、群游/最低群体数量和觅食答案；待审核图片未泄漏，仍保持 `noindex,follow`。
- 一次连接拒绝归因于预览进程停止，非路由逻辑失败；系统 Chrome、多视口性能、reduced-motion 和独立 Critic 仍是未完成门禁。

## 2026-09-12 本地浏览器交互复核

- 本地 Vite 服务恢复后，内置浏览器新标签成功打开宝莲灯 `/species/sp_0432`。
- 页面实际向下滚动可到达“继续探索”和“资料来源”；Tab 可从公开 Header 进入面包屑、章节导航并到达“收藏”。
- 普通路由图片回退、鱼类内容和 `noindex,follow` 均保持正确；证据为 `EVD-20260912-001`。
- 仍未完成：系统 Chrome 可调整视口回归、reduced-motion、性能、失败状态完整覆盖、Figma Canonical 和 Critic 复验。
## 2026-09-12 系统 Chrome 复验结果

- 仅执行一次系统 Chrome Species 脚本；进程在页面断言前以 SIGABRT 退出，属于环境阻塞。
- 内置浏览器证据 `EVD-20260912-001` 仍有效，不重复启动同一失败通道；本轮证据为 `EVD-20260912-002`。
## 2026-09-12 静态回归更新

- 当前代码的 Editorial、Evidence、Asset、Public Contract、Copy、Structure、Responsive Contract、lint、build 与 diff-check 全部通过，证据为 `EVD-20260912-003`。
- 系统 Chrome 单次启动仍在页面断言前 SIGABRT；不将其计为浏览器通过，也不重复启动同一失败通道。
- 继续保持 `noindex,follow`，Figma调用暂停；系统多视口、reduced-motion、性能、完整失败状态、独立Critic复验和Figma Canonical仍是未完成门禁。
## 2026-09-12 内置浏览器加载复核

- `/species/sp_0001` 在内置浏览器新标签完成加载，主要公开区块和导航均可读，证据为 `EVD-20260912-004`。
- 继续保持 `noindex,follow`；这只是运行内容证据，不替代三档系统浏览器与独立审查。
## 2026-09-12 Critic 输出阻塞

- 当前 HEAD `32a7470b` 的既有 Critic 复验已完成，但返回空 turn items，没有可读六维正文；证据为 `EVD-20260912-005`。
- 空输出不代表通过；不创建重复任务，等待输出能力恢复后再复验。浏览器多视口、Figma Canonical 和索引门禁保持未完成。
## 2026-09-12 导航链路复核

- 分类 → 物种 → 品系 → 返回的真实点击链路已在内置浏览器通过，证据为 `EVD-20260912-006`。
- 系统多视口、性能、reduced-motion、Figma Canonical 和可读 Critic 仍未通过；继续保持 `noindex,follow`。
## 2026-09-12 公开滚动修复

- 已修复公开 SEO 页面桌面文档滚动高度被 `html height:100%` 限制的问题；显式 390/600/1440 viewport 复验通过，证据为 `EVD-20260912-007`。
- 继续保持 `noindex,follow`；系统 Chrome、性能/reduced-motion、Figma Canonical 和 Critic 可读报告仍是未完成门禁。
## 2026-09-12 三物种多视口复核

- 内置浏览器九次真实加载已通过基本结构、滚动、列数、H1、公开Header、中文术语和robots检查，证据为 `EVD-20260912-008`。
- 系统Chrome、性能/reduced-motion、Figma Canonical和可读Critic仍未完成；继续保持 `noindex,follow`。
## 2026-09-12 公共 SEO 多页面回归

- 首页、分类和 Guide 的三档真实 viewport 结构与 JSON-LD 门禁已复核，证据为 `EVD-20260912-009`。
- 系统 Chrome、性能/reduced-motion、Figma Canonical 和可读 Critic 仍未完成；不解除 `noindex,follow`。
