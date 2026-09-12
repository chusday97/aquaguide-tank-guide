# AquaGuide Species SEO 当前交接

## 2026-09-13 替代浏览器探测

- Playwright WebKit/Firefox 均无法启动到页面，未取得 600px 运行时证据；该结果记录为环境缺口，不代表响应式断言失败，证据为 `EVD-20260913-129`。


## 2026-09-13 Critic 终态

- 既有 Critic 线程当前为 `idle`，最新 turn 已完成但没有 assistant 正文；不能计为六维审查通过，证据为 `EVD-20260913-128`。


## 2026-09-13 运行时侧栏边界

- 内置 Chrome 检查确认页面末尾的 `open-side-panel` 和 `thunderbit-crx-side-bar` 是第三方扩展注入节点，AquaGuide 自身按钮列表不包含它；证据为 `EVD-20260913-127`。
- 未修改 Public Shell；继续保持公开页面与应用侧栏隔离。


## 2026-09-13 最新构建复核

- `e644e95e` 的 `npm run build` 与 `git diff --check` 已通过，既有 chunk/导入提示未新增为错误；证据为 `EVD-20260913-126`。
- 用户三个未提交文件保持原样；页面继续 `noindex,follow`。


## 2026-09-13 加载骨架回归保护

- `e644e95e` 为加载骨架的面包屑、媒体框和文字轮廓补充 `aria-hidden` 回归断言；结构测试、lint 和 diff-check 通过，证据为 `EVD-20260913-125`。
- 页面继续 `noindex,follow`；用户三个未提交文件保持原样。600px 真实视口、Critic、Figma Canonical 和发布门禁仍未完成。


## 2026-09-13 当前 SHA 静态复核

- `a496d159` 的 Editorial evidence、Evidence bindings、Public contract、中文文案、Responsive contract、Typography、lint 和 diff-check 全部通过，证据为 `EVD-20260913-124`。
- 本轮仅验证加载态无障碍修复的静态回归；用户三个未提交文件保持原样，页面继续 `noindex,follow`。
- 未完成项仍为 600px 真实视口、可读独立 Critic、Figma Canonical、性能/reduced-motion 和发布门禁。


## 2026-09-13 最新代码收口

- `a496d159` 将公开 SEO 加载骨架的装饰性节点标记为 `aria-hidden="true"`，保留状态提示的辅助技术语义；结构测试、lint 和 diff-check 通过，证据为 `EVD-20260913-123`。
- 用户未提交的 `scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts` 保持原样。
- 页面继续 `noindex,follow`；600px 真实视口、可读 Critic、Figma Canonical 和发布门禁仍未完成。


## 2026-09-13 当前权威快照（`53780fa0`）

- 当前分支：`codex/species-seo-preview-v1`。
- 最新已提交闭环：公开 SEO 懒加载改为结构化骨架，完整静态回归通过；证据为 `EVD-20260913-117`、`EVD-20260913-118`。
- 最新 Critic 复验已完成，但同一只读线程仍返回 `items: []`、没有可读六维正文；证据为 `EVD-20260913-120`。该结果不计为审查通过。
- 公开页面继续 `noindex,follow`；不修改 `main`、Production Supabase、生产部署或 Figma。
- 600px 独立运行时、系统 Chrome MachPort、Figma Canonical、性能/reduced-motion 和最终发布门禁仍未完成。
- 用户未提交文件仍保持未提交、未暂存：`scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts`。

## 2026-09-13 后续环境结论

- 同一只读 Critic 对 `b2de6ab0` 的最新复验已完成但返回空 `items`，没有可读六维正文；证据为 `EVD-20260913-120`。
- 内置 Chrome 页面脚本不支持 `window.resizeTo`，当前标签页无法获得可控 600px 视口；证据为 `EVD-20260913-121`。这不是页面断言失败，也不计为 600px 通过。
- CSS 已明确包含 560–767px 的平板双列 Hero、三列参数带和独立间距规则；仍需真实 600px 运行时证据。

## 2026-09-13 宝莲灯素材预览

- 本地 `assetPreview=1` 已实际显示宝莲灯项目透明图；当前内置浏览器视口中 Hero 主体完整、未裁切，证据为 `EVD-20260913-122`。
- 该结果只证明素材可渲染，不等于 Hero 或 variant-card 用途批准；普通公开路由继续显示回退图。
- 最新文档与证据提交：`dccc9f9b`。

## 2026-09-12 最新运行时证据

- 内置浏览器确认极火虾公开长页面和 `#faq` 章节锚点可达，证据为 `EVD-20260912-073`；系统 Chrome 三档、性能/reduced-motion、Figma Canonical 和可读 Critic 仍未完成。
- 刷新可访问性树后实际滚动到页面底部并看到资料来源，证据为 `EVD-20260912-074`；这仍不替代系统 Chrome 三档验收。
- 通过 Tab + Space 实际展开第一条 FAQ，答案出现且焦点保持在按钮，证据为 `EVD-20260912-075`；完整多视口键盘回归仍未完成。
- 通过 Tab + Enter 实际切换黄金米虾品系，URL、H1、Alt、参数和黄色差异正确，证据为 `EVD-20260912-076`；完整多视口键盘回归仍未完成。
- 通过 Tab + Enter 从虾螺蟹分类进入极火虾，公开 Header 和唯一 H1 正常，证据为 `EVD-20260912-077`；robots 未从辅助树推断，仍以静态 metadata 门禁为准。
- 当前 HEAD 静态发布门禁已重新通过，证据为 `EVD-20260912-078`；系统 Chrome 多视口、性能/reduced-motion、Figma Canonical 和可读 Critic 仍未完成。
- 内置浏览器通过 Tab + Enter 从 Guide 准备态进入 `/care`，未审核操作正文未泄漏，证据为 `EVD-20260912-079`；完整多视口回归仍未完成。
- 内置浏览器通过 Tab + Enter 从品牌首页“开始认识物种”进入虾螺蟹分类，公开 Header 和唯一 H1 正常，证据为 `EVD-20260912-080`；完整多视口回归仍未完成。
- 内置浏览器通过 Tab + Enter 从首页“进入我的鱼缸”进入 `/welcome` onboarding，未绕过新手引导，证据为 `EVD-20260912-081`；完整多视口回归仍未完成。
- `/welcome` 通过 Tab + Enter 选择“先跳过，直接进入我的鱼缸”后进入 `/aquarium`，应用空状态和控制正常，证据为 `EVD-20260912-082`；完整多视口回归仍未完成。
- Species 通过 Tab + Enter 进入兼容工具，物种 ID、来源参数、已选极火虾和未选择鱼缸状态正确，证据为 `EVD-20260912-083`；完整多视口回归仍未完成。
- 兼容工具通过 Tab + Enter 返回 `/species/sp_0001#tool`，极火虾 H1、公开 Header、面包屑和章节导航恢复，证据为 `EVD-20260912-084`；完整多视口回归仍未完成。
- 宝莲灯通过 Tab + Enter 进入兼容工具，保留 `sp_0432`、来源参数、已选宝莲灯和无缸状态，证据为 `EVD-20260912-085`；完整多视口回归仍未完成。

> 当前有效快照：2026-09-12，分支 `codex/species-seo-preview-v1`，HEAD `68231405`。

## 当前有效结论

- 缺图回退已做体验收口：公开页面在素材未批准时显示物种名称和稳定回退，不显示空白画布，也不绕过 Published 证据门禁；证据为 `EVD-20260912-062`。
- Category 与 Guide 已统一首段 Intro 间距；Guide 不再叠加 Species 章节间距，减少页面首屏空白差异，证据为 `EVD-20260912-063`。
- 首页、分类页和 Species 页已统一使用 `SeoAssetFallback`；缺图时显示物种身份，不再出现无样式孤立文字，证据为 `EVD-20260912-064`。

- 同一只只读 Critic 已重新读取当前 HEAD `6732344c`，但完成 turn 仍无可读正文（`items: []`）。该结果只能记录为审查基础设施阻塞，不能声明六维审查通过，也不创建重复 Critic。

- 内置浏览器已完成首页、分类、未发布 Guide 和三条 Species 路径的 390/600/1440px 结构复核；公开文档滚动问题已修复。
- Evidence、Public Contract、Responsive Contract、lint、build 和 diff-check 已通过；页面继续 `noindex,follow`。
- 当前物种公开表达已用 FishBase、UF/IFAS 与 USGS NAS 逐条复核，未发现来源范围越界，证据为 `EVD-20260912-010`。
- 系统 Chrome 自动化仍受 macOS MachPort/SIGABRT 阻塞；独立 Critic 最新复验返回空正文；Figma Canonical 仍等待 Starter 配额。
- 用户未提交的三个文件保持原样，不能覆盖或代提交。
- 首页 Marketing Hero 当前工作树也已接入 `SeoAssetFallback`；三类公开入口的缺图状态由同一组件和结构回归保护，证据为 `EVD-20260912-065`。
- Public Shell 当前工作树已加入路由滚动处理：无 hash 的路径切换回顶部，有 hash 的路径在渲染后定位章节；内置浏览器验证通过，证据为 `EVD-20260912-066`。
- 内置浏览器补充确认极火虾 FAQ 展开和黄金米虾品系继承边界，证据为 `EVD-20260912-067`。
- 内置浏览器补充确认宝莲灯、分类页和未发布 Guide 的公开入口状态，证据为 `EVD-20260912-068`。
- 内置浏览器补充确认宝莲灯进入兼容工具时物种与来源参数正确，证据为 `EVD-20260912-069`。
- 内置浏览器补充确认兼容工具返回宝莲灯公开页后状态恢复，证据为 `EVD-20260912-070`。
- 宝莲灯面包屑边界已验证：首页可点击，灯科鱼暂为未链接的分类文字，等待未来鱼类分类页，不伪造目标，证据为 `EVD-20260912-071`。
- 当前静态发布门禁全套通过，记录为 `EVD-20260912-072`；真实多视口和独立审查仍是开放门禁。
- 公开 Species 收藏已改为仅使用本地 `toggleSpeciesFavorite`；不再通过应用 Repository 读取登录、鱼缸或 Supabase 状态，应用页面行为不变，证据为 `EVD-20260912-043`。
- 内置 Chrome 实际复核分类 → Species → 返回链路：返回后 URL 和标题恢复为 `/category/shrimp-snails-crabs` 与“虾螺蟹｜AquaGuide 物种分类”，证据为 `EVD-20260912-044`。
- 同一只读 Critic 已针对当前 `d4b84d15` 完成复验，但仍返回空 `items`、无可读正文；按门禁不能计为六维审查通过，记录为 `EVD-20260912-045`，不创建重复线程。
- 内置 Chrome 实际复核黄金米虾品系 → 兼容工具 → 返回链路：品系继承内容、黄色差异、18–28°C 参数、物种 ID/来源参数和返回后的 URL/标题均正确，证据为 `EVD-20260912-046`。
- 内置 Chrome 实际复核宝莲灯鱼类页 → 兼容工具 → 返回链路：鱼类自身内容、`species=sp_0432` 参数、应用壳和返回后的 URL/标题均正确，证据为 `EVD-20260912-047`。
- 图片失败边界已收口：`ResilientImage` 在原图、重试地址和占位图都失败时切换到稳定可读终态，不再继续渲染失败图片；结构、契约、响应式、lint、build 和 diff-check 通过，代码提交 `929dc011`，证据为 `EVD-20260912-048`。
- 终态图片修复后的完整公开 SEO 静态回归再次通过，证据为 `EVD-20260912-049`；未改变内容、证据 fingerprint、路由、metadata、JSON-LD 或 `noindex`。

## 2026-09-12 宝莲灯素材预览补充

- 本地 `assetPreview=1` 已在内置浏览器真实显示宝莲灯项目图片及中文 Alt；普通公开路由仍保持图片回退，证据为 `EVD-20260912-051`。
- 鱼类参数、环境、中层活动、群游至少 5 条、取食内容和 FishBase 来源均可读；Hero 与品系卡用途仍需项目负责人分别确认。

## 2026-09-12 公开 SEO 门禁复跑补充

- 静态证据、公开契约、文案、结构、响应式、lint、build 和 diff-check 通过。
- `test:seo-motion`、`test:species-landing`、`test:public-seo-routes` 均在 Chromium 启动阶段触发同一 macOS MachPort 权限错误，不能计为浏览器通过，也不是页面断言失败；不重复重启。

## 2026-09-12 章节导航运行时补充

- 内置浏览器点击宝莲灯页面“它如何生活”后 URL 更新为 `#behavior`，行为章节进入视口，三个问题卡可读；证据为 `EVD-20260912-053`。

## 2026-09-12 黄金米虾继承运行时补充

- 黄金米虾真实显示黄色差异和自身参数，同时继承基础物种活动/觅食内容；没有独立品系生活习性证据。回到极火虾基础页后状态恢复，证据为 `EVD-20260912-054`。

## 2026-09-12 FAQ 运行时补充

- 内置浏览器激活极火虾 FAQ 后，辅助树显示 `expanded` 并出现对应答案，其他 FAQ 保持收起；证据为 `EVD-20260912-055`。

## 2026-09-12 Figwright连接补充

- Figwright 版本已统一为 server/leader `0.5.0`，但 ping 仍为 `server-only`，`plugin=null` 且插件请求超时；本轮未写入 Figma，证据为 `EVD-20260912-056`。

## 2026-09-12 Figma文件连接补充

- Figma Desktop 已启动，但 AquaGuide 文件显示 `ERR_CONNECTION_CLOSED (-100)`，画布未加载；未执行插件或写入，证据为 `EVD-20260912-057`。

## 2026-09-12 Species摘要视觉补充

- 参数带后的已确认概览摘要已改为统一“先记住这一点”结论卡，相关静态门禁通过；证据为 `EVD-20260912-058`。

## 2026-09-12 结论卡运行时补充

- 内置浏览器回读极火虾页面确认结论卡标签、摘要、Hero、参数和章节顺序可见；证据为 `EVD-20260912-059`。

## 2026-09-12 环境章节锚点补充

- 内置浏览器点击环境章节后，标题、编号03、环境观察卡和正文进入视口且未被 Header 遮挡；证据为 `EVD-20260912-060`。

## 最新静态验证

- 当前 HEAD `0c3f217c` 的 Editorial、Evidence、Public Contract、Responsive Contract、Asset、lint、build 和 diff-check 全部通过；文案收口后的公开文案、结构、lint、build 和 diff-check复验见 `0c3f217c`。
- 本轮仅更新证据与状态文档；三个用户未提交文件未触碰、未暂存。

## 本地主页运行时证据

- 当前 Chrome 用户标签实际读取主页：图片、公开Header、滚动、canonical、robots 和 44px 可见链接均正常，证据为 `EVD-20260912-013`。
- 性能资源读取受浏览器隔离环境限制，未计为性能通过；当前目标继续保持 active。
- 当前提交 `52c16657` 的首页首屏在内置Chrome中实际加载完成；公开Header、品牌Hero、已批准极火虾图片、单一H1、价值区、能力卡和相关入口可读，证据为 `EVD-20260912-037`。未发现首页首屏异常，但不替代系统Chrome三档、性能、reduced-motion、Figma或Critic门禁。

## 中文公开体验复核

- 公开中文文案、四类页面结构和共享字体系统门禁全部通过，证据为 `EVD-20260912-014`。
- 未发现后台术语、结构分叉或字体角色回归；系统 Chrome、性能、Figma 和 Critic 仍是外部未完成门禁。

## 最新运行时导航证据

- 分类页极火虾入口已在 Chrome 用户标签实际点击进入 Species 页；图片、章节、H1、robots 和无横向溢出正常，证据为 `EVD-20260912-015`。

- 黄金米虾品系切换与浏览器返回也已实际复核；共享生活习性和品系身份/图片状态正确，证据为 `EVD-20260912-016`。

- Species到鱼缸工具的真实跳转已复核：物种 ID 和来源参数保留，工具页可读，返回后恢复百科状态，证据为 `EVD-20260912-017`。

## 当前 Critic 状态

- 当前 SHA `159a095b` 的既有 Critic 复验已完成但没有可读正文，证据为 `EVD-20260912-011`；不能计为独立审查通过。

## 最新公开页面运行时复核

- 首页、分类页和宝莲灯页均已在内置 Chrome 中实际加载完成；分类入口、宝莲灯环境/行为内容、稳定图片回退和公开 Header 可读，证据为 `EVD-20260912-037`、`EVD-20260912-038`。
- 当前未发现公开跳转或页面首屏的新增问题；系统 Chrome 三档、性能、reduced-motion、Figma Canonical 和可读独立 Critic 仍未完成。
- 黄金米虾页的继承 FAQ 已按当前品系名称呈现；仍使用基础物种的来源与 fingerprint，没有新增品系事实证据，证据为 `EVD-20260912-039`。
- FAQ 修复后的公开 SEO 全套静态回归已通过，证据为 `EVD-20260912-040`；用户原有的三个未提交文件仍未触碰。
- 当前提交下三条 Species 路径已在内置 Chrome 复读，内容继承、图片/回退、FAQ 和 Product Truth 均正常，证据为 `EVD-20260912-041`。
- 公开文案回归现同时保护 FAQ 问题和答案的品系名称适配，提交 `f8cd8b79`，证据为 `EVD-20260912-042`。

## 当前下一步

只在 Critic 可返回正文后做一次当前 SHA 只读复验；系统 Chrome 恢复后只补一次自动化回归；Figma 配额恢复后批量完成 Canonical 模板。全部完成前不解除索引、不部署生产。

更新时间：2026-09-12

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

## 2026-09-12 当前最新变更

- 视觉收口提交 `822871b7`：Species“它如何生活”改用共享 `seo-life-grid`，两张内容在桌面/平板按两列收拢，559px 以下单列，避免固定三列造成空白。
- 内置 Chrome 长截图实际确认页面可滚动、内容和图片可见；静态结构、响应式、文案、证据、lint、build、diff-check 通过。
- 不涉及 Product Truth、Editorial、路由、metadata、JSON-LD、索引策略或用户未提交文件。
- 未完成：系统 Chrome 三档自动化、性能/reduced-motion、完整失败状态、Figma Canonical 和可读独立 Critic。保持 `noindex,follow`。

## 2026-09-12 公开来源规范化

- 已提交 `93a3edb7`：FishBase 同物种 URL 变体在公开资料区归并为一条，底层 evidence 仍按 source ID 保留。
- `test:public-seo-contract`、Editorial、Evidence、lint、build、diff-check通过。
- 仍未完成三档系统浏览器、Critic 可读报告、Figma Canonical 和索引发布门禁。

## 2026-09-12 缺图回退版式收口

- 已提交 `ea8a96a6`：blocked Species 图片的 Hero 回退媒体高度收紧为 320px，已批准图片不受影响。
- 内置 Chrome 真实复核通过：宝莲灯普通页面回退清晰、可滚动，后续内容仍可见。
- 静态响应式契约、lint、build、diff-check 通过；系统 Chromium 仍受 MachPort 权限阻断。
- 独立 Critic 最新复验仍为空正文，不能计为通过；不创建重复任务。
- 继续保持 `noindex,follow`、不调用 Figma、不修改 main/Production Supabase/生产部署；保留用户未提交文件。

## 2026-09-12 运行时来源复核

- 内置 Chrome 复核 `/species/sp_0432`：公开资料区只显示一条 FishBase 来源，页面滚动和公开内容正常。
- 记录：`EVD-20260912-028`；不改变 `noindex,follow` 或任何发布门禁。

## 2026-09-12 虾类继承运行时复核

- 内置 Chrome 已复核极火虾与黄金米虾：图片、参数、黄色差异和基础物种生活习性继承均符合当前契约。
- 证据：`EVD-20260912-029`；未改变 `noindex,follow`。
## 2026-09-12 最新执行补充

- 当前 HEAD：`f17ebbf3`（实现提交 `31c8e5fc`，本次为文档与证据同步）。
- 本轮完成公开 SEO 视觉一致性收口：Species 面包屑改用公开分类名，参数区改用共享章节标题，首页/分类/Guide 的状态说明改成用户可理解的内容整理提示。
- 相关静态门禁与构建通过，内置浏览器已回读极火虾页面；没有改变 Product Truth、Editorial、素材 fingerprint、路由、metadata、JSON-LD 或 `noindex,follow`。
- 用户未提交的三个文件保持原样。剩余浏览器、性能、Figma 和独立 Critic 门禁仍未完成。
## 2026-09-12 宝莲灯素材预览补充

- 当前本地 `assetPreview=1` 已在内置浏览器真实显示宝莲灯图片及其中文 Alt；普通公开路由仍保持图片回退。
- 该预览只证明素材能加载和页面构图可读，不代表 Hero/品系卡已批准；两种用途仍需分别确认。
- 当前目标继续保持 `noindex,follow`，不修改 Production、main 或 Figma。
## 2026-09-13 最新运行时/代码状态

- `b54b4557` 修正Species章节导航：`#overview`现在对应参数带所在章节，Hero不再占用该锚点；静态结构、响应式、lint、build和diff-check通过，证据为 `EVD-20260913-086`。
- 下一次浏览器可用时，优先复核 `/species/sp_0001#overview` 是否直接落在“一眼了解”参数区；不重复启动已知受MachPort阻塞的系统Chrome。
- 页面仍为 `noindex,follow`；Figma Canonical与可读独立Critic仍未通过；用户未提交文件保持原样。
## 2026-09-13 最新代码状态

- `2fd4fba3` 将Species章节观察器扩展到 `tool` 和 `related`，能力区/继续探索区纳入当前章节反馈；结构、响应式、lint、build和diff-check通过，证据为 `EVD-20260913-087`。
- 浏览器可用后优先验证滚动进入两个区域时 `aria-current="location"` 是否更新；继续不重复启动已知受MachPort阻塞的系统Chrome。
- 页面仍为 `noindex,follow`；Figma Canonical与可读独立Critic仍未通过。
## 2026-09-13 当前续接点

- `c1975c39` 之后，内置浏览器验证 Species 章节导航的两个末端锚点：`#tool` 与 `#related` 均可通过点击到达，证据为 `EVD-20260913-088`。
- 不能将该证据扩大解释为完整多视口、`aria-current` 精确读回、性能/reduced-motion、Figma Canonical 或独立审查通过。
- 继续顺序：浏览器多视口 → 只读 Critic 复验；保持 noindex，保留系统 Chrome MachPort、Figma Starter 配额与 Critic 空正文阻塞记录。
## 2026-09-13 浏览器回归状态更新

- 系统 `npm run test:species-landing` 已再次执行，但 Chromium 在启动阶段收到 `MachPortRendezvousServer: Permission denied (1100)`，没有进入页面断言；证据 `EVD-20260913-089`。
- 静态公开 SEO 测试、证据测试、lint、build、diff-check 通过；证据 `EVD-20260913-090`。
- 该状态仍为 `IN_PROGRESS`：真实三档、性能/reduced-motion、可读独立 Critic、Figma Canonical 和发布门禁未完成。
## 2026-09-13 系统 Chrome 通道复核

- 已尝试显式 `PLAYWRIGHT_CHANNEL=chrome`，Chrome 仍在启动阶段 SIGABRT；证据 `EVD-20260913-091`。
- 系统浏览器自动化暂时不可用；下一步采用内置浏览器/托管 Preview 的真实运行证据，不再重复启动同一环境。
## 2026-09-13 Public Species收藏隔离

- `b42d1049` 修复公开页收藏服务间接读取应用鱼缸状态的问题；公开页现在使用独立存储服务，应用内收藏不变，证据 `EVD-20260913-092`。
- 同一Critic当前复验仍为空输出，证据 `EVD-20260913-093`；仍不能宣称独立审查通过。
## 2026-09-13 公开收藏运行时反馈

- 内置浏览器确认公开 Species 收藏点击后的状态反馈和焦点保持正常，证据 `EVD-20260913-094`。
- 下一步仍是多视口替代证据与 Critic 可读复验；页面保持 `noindex,follow`。
## 2026-09-13 收藏写入失败反馈

- 公开收藏写入失败现在进入可见失败提示，证据 `EVD-20260913-095`；页面继续保持 noindex。
## 2026-09-13 公开收藏隔离专项测试

- 新增并通过 `test:public-favorites-isolation`，公开收藏不会访问 `aquarium_app_state_v1`，证据 `EVD-20260913-096`。
## 2026-09-13 黄金米虾继承运行时复核

- 内置浏览器确认黄金米虾品系切换后的身份、参数、黄色差异、共享生活习性和工具上下文正确，证据 `EVD-20260913-097`。
## 2026-09-13 托管 Preview 版本一致性

- Chrome用户会话可访问托管Preview，但页面为旧结构/错误部署：`/encyclopedia`面包屑、缺少care/variants/faq，证据 `EVD-20260913-098`。
- 托管Preview暂不计入当前验收；下一步先做SHA parity，不修改Production。
## 2026-09-13 Preview SHA parity

- 本地版本领先远端跟踪分支 204 个提交，实时远端查询受 GitHub DNS 阻塞；托管Preview旧结构不能代表当前HEAD，证据 `EVD-20260913-099`。
- 下一步先做远端/部署SHA核对，再考虑非生产Preview。
## 2026-09-13 最新状态

- 当前 HEAD `b0bffe59` 的公开契约、收藏隔离、证据指纹、结构、lint、build 和 diff-check 已通过，证据为 `EVD-20260913-100`。
- 远端 `origin/codex/species-seo-preview-v1` 仍指向 `93f199c1`，本地领先 205 个提交；托管 Preview 版本不匹配，继续保持发布阻塞。
- 不重复推送或启动已知受 MachPort 阻塞的系统浏览器；下一步先读取远端/部署 SHA，再决定非生产 Preview 同步动作。
## 2026-09-13 Preview 同步结果

- GitHub 已确认远端 `codex/species-seo-preview-v1` 指向 `915bb0e7`，与本地已提交 HEAD 一致，证据为 `EVD-20260913-101`。
- 下一步只核对 Vercel 部署是否为同一 SHA；未确认部署前不把托管页面当作当前实现，不解除 `noindex,follow`。
## 2026-09-13 最新 Preview

- Vercel Preview 已 Ready，内置 Chrome 实际显示当前 Public Shell、公开面包屑和完整 Species 章节，证据为 `EVD-20260913-102`。
- 部署 commit SHA 尚未从 Vercel CLI 得到；继续保持 Preview parity 和发布门禁未完成，不解除 `noindex,follow`。
## 2026-09-13 部署访问状态

- 最新 Vercel Preview 已 Ready，但内置 Chrome 返回 `ERR_CONNECTION_CLOSED`，暂不能取得托管 DOM/截图证据；保持浏览器验收和发布门禁未完成。
## 2026-09-13 本地品系复核

- 黄金米虾本地页面的继承、参数、FAQ、图片 Alt、工具链接和资料来源已由内置浏览器复核，证据为 `EVD-20260913-104`；托管三档验收仍未完成。
## 2026-09-13 Preview 路由响应

- 部署侧只读请求确认三条 Species 路径 HTTP 200 + `x-robots-tag:noindex`，证据为 `EVD-20260913-105`；浏览器 DOM/截图仍因连接异常缺失。
## 2026-09-13 Preview 最新状态

- HEAD `102626b9` 已推送到 `codex/species-seo-preview-v1`，对应最新 Vercel Preview 已 `READY`。
- 三条 Species 部署侧 HEAD 请求均 HTTP 200 且 `x-robots-tag: noindex`，证据为 `EVD-20260913-106`。
- 内置浏览器 DOM/截图尚未在该最新部署复核；不把部署侧响应当作浏览器验收。

## 下一步

- 同一部署只尝试一次内置浏览器访问；失败则保持环境阻塞。
- 继续保持 noindex、Figma 暂停和用户三个未提交文件不变。
## 2026-09-13 托管访问阻塞

- 最新 READY Preview 的 HTTP 响应正常，但内置浏览器被 Vercel 登录保护重定向，无法进入页面 DOM；证据 `EVD-20260913-107`。
- 下一步需使用已授权 Preview 会话或继续本地/内置浏览器验证；不绕过登录、不创建重复部署、不解除 noindex。
## 2026-09-13 本地运行复核

- 本地 `3001` Preview 已启动，极火虾长页面与 `#behavior` 章节锚点可读；证据 `EVD-20260913-108`。
- 当前仍保持 noindex；用户三个未提交文件未触碰。
## 2026-09-13 鱼类与品系运行证据

- 宝莲灯和黄金米虾本地页面继承边界通过：鱼类内容不混入虾类，品系不复制独立习性 evidence；证据 `EVD-20260913-109`。
## 2026-09-13 工具入口链路

- 宝莲灯百科进入兼容工具并返回的本地运行链路通过；物种参数和来源参数均保留，证据 `EVD-20260913-110`。
## 2026-09-13 静态回归

- 当前提交通过公开 SEO 静态回归、lint、build 和 diff-check；证据 `EVD-20260913-111`。
- 构建仅保留既有 chunk 体积警告；宝莲灯素材仍 blocked。
## 2026-09-13 Critic 状态

- 当前版本 `09fd37d3` 已交回既有 Critic；任务仍运行中，没有可读报告，证据 `EVD-20260913-112`。
## 2026-09-13 Critic 门禁更新

- 既有 Critic 线程已完成最新只读复验，但返回空 `items`，无可读六维正文；状态为审查基础设施阻塞，不计为通过。证据：`EVD-20260913-113`。
- 当前继续允许 Web 本地验证和小步 UX 修复；Figma、索引解除、Production Supabase、main 和生产部署保持锁定。
- 不要重复创建 Critic 线程；下一次只有在出现新的实质代码/证据变化或工具恢复可读输出时，才把同一线程用于复验。
