# AquaGuide Species SEO 当前有效快照

## 2026-09-12 最新运行时证据

- 内置浏览器实际读取极火虾公开长页面并点击“常见问题”进入 `#faq` 锚点，证据为 `EVD-20260912-073`；不替代系统 Chrome 三档验收。
- 刷新可访问性树后执行页面滚动成功，截图显示底部“资料来源”和专业来源链接，证据为 `EVD-20260912-074`。
- 通过 Tab + Space 实际展开第一条 FAQ，答案出现且焦点保持在按钮，证据为 `EVD-20260912-075`。
- 通过 Tab + Enter 实际切换黄金米虾品系，URL、H1、Alt、参数和黄色差异正确，证据为 `EVD-20260912-076`。
- 通过 Tab + Enter 从虾螺蟹分类进入极火虾，公开 Header 和唯一 H1 正常，证据为 `EVD-20260912-077`；robots 继续以静态 metadata 门禁为准。
- 当前 HEAD 的 Editorial、Evidence、Asset、Public Contract、Copy、Structure、Responsive、lint、build 和 diff-check 已重新通过，证据为 `EVD-20260912-078`。
- 内置浏览器通过 Tab + Enter 从 Guide 准备态进入 `/care`；未审核操作正文未泄漏，应用入口可达，证据为 `EVD-20260912-079`。
- 内置浏览器通过 Tab + Enter 从品牌首页“开始认识物种”进入虾螺蟹分类，公开 Header 和唯一 H1 正常，证据为 `EVD-20260912-080`。
- 内置浏览器通过 Tab + Enter 从首页“进入我的鱼缸”进入 `/welcome` onboarding，未绕过新手引导，证据为 `EVD-20260912-081`。
- `/welcome` 通过 Tab + Enter 选择“先跳过，直接进入我的鱼缸”后进入 `/aquarium`，应用空状态和控制正常，证据为 `EVD-20260912-082`。
- Species 通过 Tab + Enter 进入兼容工具，物种 ID、来源参数、已选极火虾和未选择鱼缸状态正确，证据为 `EVD-20260912-083`。
- 兼容工具通过 Tab + Enter 返回 `/species/sp_0001#tool`，极火虾 H1、公开 Header、面包屑和章节导航恢复，证据为 `EVD-20260912-084`。
- 宝莲灯通过 Tab + Enter 进入兼容工具，保留 `sp_0432`、来源参数、已选宝莲灯和无缸状态，证据为 `EVD-20260912-085`。

更新时间：2026-09-12

当前代码快照：`68231405`（公开缺图回退统一）；应用页面、生产环境与索引策略未改变。

## 当前目标

持续收口公开 SEO 系统：统一中文公开页面的视觉与交互，维护物种内容证据、素材 fingerprint 和 Base/Variant 继承，在浏览器回归、可读独立 Critic、Figma Canonical 与发布门禁全部通过前保持 `noindex,follow`。

## 2026-09-12 独立审查状态

- 同一只只读 Critic 已针对当前 HEAD 完成复验，但返回空 `items`、无可读六维正文；记录为 `EVD-20260912-061`，不能计为独立审查通过，也不创建重复审查线程。
- 工作树检查确认用户原有三个未提交文件保持原样。

## 2026-09-12 缺图回退版式收口

- Species Hero 与品系卡的缺图回退新增物种名称，并使用较紧凑的响应式高度；素材状态仍由 evidence binding 控制，未把待审核图片带入 Published；提交 `0ab0cca9`。
- 内置 Chrome 实际回读宝莲灯桌面页，回退区域显示“宝莲灯 / 图片暂时不可用”，首屏空白明显减少；证据为 `EVD-20260912-062`。

## 2026-09-12 公开页面 Intro 间距统一

- Category 与 Guide 共享 `seo-page-intro` 首段间距；Guide 不再额外使用 Species 的 `seo-section` 顶部间距。内置 Chrome 对照确认两页的标题、首卡和阅读路径更一致，证据为 `EVD-20260912-063`。

## 2026-09-12 公开缺图回退组件统一

- 新增 `SeoAssetFallback`，首页/分类页/Species 页的缺图状态使用同一套物种身份卡；提交 `b4006374`，仍按素材 binding fail-closed，不把待审核图片带入公开聚合，证据为 `EVD-20260912-064`。

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

## 当前已验证

- 当前公开物种表达已用 FishBase、UF/IFAS 与 USGS NAS 做来源范围复核；宝莲灯中层/群游/取食和极火虾底部刮食表达均未发现越界，证据为 `EVD-20260912-010`。
- 公开滚动根因已修复；首页、分类、Species 三条路径和未发布 Guide 已由内置浏览器在 390/600/1440px 复核。
- 公开页面无横向溢出、单一 H1、参数带 2/3/6 列、公开 Header 存在、应用侧栏/底栏不存在，且保持 `noindex,follow`。
- 分类 → Species → 品系 → 返回链路已实测；JSON-LD 与 Guide fail-closed 门禁已复核。
- Evidence、Public Contract、Responsive Contract、Editorial、Asset、lint、build 和 diff-check 已通过；文案收口后的最新静态复跑证据为 `EVD-20260912-030`。

## 当前阻塞与边界

- 当前 SHA `159a095b` 的 Critic 复验已完成但没有可读正文，记录为 `EVD-20260912-011`；不能宣称独立审查通过。
- 系统 Chrome 自动化仍受 macOS MachPort/SIGABRT 阻塞；内置浏览器证据不等同于系统 Chrome 通过。
- 独立 Critic 最新复验返回空正文，不能认定六维审查通过；不创建重复 Critic。
- Figma Canonical 模板尚未完成，Starter 配额恢复前不调用 Figwright。
- reduced-motion、性能指标和完整失败状态仍未形成完整门禁证据。
- 不修改 `main`、Production Supabase 或生产部署；不解除 `noindex`。

## 工作树注意

- 当前分支：`codex/species-seo-preview-v1`；HEAD：`35ad130c`。
- 以下用户未提交文件保持原样，未暂存、未提交：`scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts`。

## 最新静态验证

- 当前 HEAD `0c3f217c` 的 Editorial、Evidence、Public Contract、Responsive Contract、Asset、lint、build 和 diff-check 全部通过；文案收口专项证据为 `EVD-20260912-030`。
- 内置 Chrome 已补充复核首页、分类页和宝莲灯页；证据为 `EVD-20260912-037`、`EVD-20260912-038`。当前未发现公开入口或首屏新增问题。
- 本轮仅同步证据与状态文档；未修改代码、Figma、生产环境或索引策略。

## 2026-09-12 本地主页运行时复核

- Chrome 用户标签实际读取主页，公开 Header、已批准极火虾图片、滚动、canonical、robots 和 44px 可见链接均正常，证据为 `EVD-20260912-013`。
- 性能资源读取受浏览器隔离环境限制，未计为性能通过；完整三档性能、Critic、Figma 和索引门禁仍未完成。

## 2026-09-12 中文体验静态复核

- 公开文案、结构和字体系统测试全部通过，证据为 `EVD-20260912-014`；未改变页面、Product Truth、素材、索引策略或用户未提交文件。

## 2026-09-12 分类到 Species 运行时跳转

- Chrome 用户标签实际点击分类页极火虾入口进入 `/species/sp_0001`；Species 图片、章节、H1、robots 和无横向溢出正常，证据为 `EVD-20260912-015`。

- 同一标签已复核黄金米虾切换与浏览器返回；共享生活习性、品系图片 Alt、H1、URL 和 `noindex` 正确，证据为 `EVD-20260912-016`。

- Species“检查我的鱼缸”已实际进入带 `species=sp_0001` 的兼容工具并可返回百科，证据为 `EVD-20260912-017`。

## 下一步

1. 继续以当前 SHA 做内置浏览器可复核的用户体验检查；不重复启动已知受 MachPort 阻塞的系统 Chrome。
2. Critic 恢复可读输出后，只对当前 SHA 做一次只读六维复验。
3. Figma Starter 配额恢复后，集中完成 Canonical 模板。
4. 所有发布门禁通过并获得用户批准前保持 `noindex,follow`。

## 2026-09-12 用户文案收口

- `日常怎么养` 的章节引导已改为面向用户的中文，提交 `0c3f217c`。
- 相关静态门禁、lint、build 和 diff-check 已通过。
- 用户未提交的三个文件仍保持未暂存、未提交。

## 2026-09-12 文案运行时复核

- 内置 Chrome 回读 `/species/sp_0001`，新的日常照料引导已实际呈现；页面可滚动，生活习性、参数、品系、FAQ、来源和 `noindex` 均可见，证据为 `EVD-20260912-031`。
- 该证据仅覆盖当前桌面可读性树，不替代系统 Chrome 三档自动化、性能、reduced-motion、Figma Canonical 或可读独立 Critic。

## 2026-09-12 文案回退门禁

- `test-public-seo-copy` 已新增断言，保护 Species 日常照料章节不回退到内部说明式文案；提交 `d245bb8a`，测试通过。

## 2026-09-12 Species 章节当前态

- 章节导航已加入当前章节状态：滚动进入章节时同步 `aria-current="location"` 和视觉高亮，点击锚点时立即反馈，提交 `26f7d05d`。
- 公开结构、响应式、文案、lint 和 build 通过；仍不能替代系统 Chrome 三档自动化、性能、Figma Canonical 或可读独立 Critic。

## 2026-09-12 章节当前态回归

- 章节当前态提交后，Editorial、Evidence、Public Contract、Copy、Structure、Responsive、Asset、Typography、lint、build 和 diff-check 全部通过，证据为 `EVD-20260912-034`。
- 仍保持 `noindex,follow`；上述结果不替代系统 Chrome 三档、性能、reduced-motion、Figma Canonical 或独立 Critic。

## 2026-09-12 首屏章节当前态视觉复核

- 内置 Chrome 截图确认首屏“ 一眼了解 ”导航项已绿色高亮，Hero、物种身份、参数入口和导航构图可见，证据为 `EVD-20260912-035`。
- 仅覆盖当前桌面首屏；滚动后的章节切换、三档自动化和性能仍待验证。

## 2026-09-12 分类页单卡布局收口

- 分类页单个已公开基础物种时使用约 760px 单列宽度，多物种时才使用双列；内置 Chrome 截图确认半宽空白已消除，提交 `8c045c34`。
- 相关公开结构、响应式、lint、build 和 diff-check 通过；仍需三档自动化、性能和独立 Critic。

## 2026-09-09 Species SEO 干净 Preview 候选

- 远端状态：Draft PR #147 的稳定提交为 `01d71f12`；`foundation`、`validate`、Vercel、Cloudflare 和 GP-001…GP-005 全部通过，PR 保持 Draft，未合并。
- Preview parity：本地、远端、PR head 与 READY Vercel deployment 均为 `01d71f12e3538b445b673b8b81acfa5067e6c338`；目标为 `https://aquaguide-pwq75dpnl-chusday97s-projects.vercel.app`。
- 第二个回归：CI `validate` 发现旧 SEO App Shell 覆盖导致 GP-002 失败；已恢复 main 的 App/Encyclopedia/SpeciesDetail/CSS Owner，只保留 Public SEO 路由增量。GP-001…GP-005、Care、Species 三档和 Public/App 全路由本地生产预览已通过。
- 托管证据：精确 SHA Preview 的六条公开路由均为 HTTP 200 且带 `x-robots-tag:noindex`；本机 Chrome/Codex Browser 对 Vercel 域名返回 `ERR_CONNECTION_CLOSED`，因此托管截图与 CWV 尚未完成。
- Preview 安全证据：Vercel 项目只读列表显示 Supabase/Postgres 变量仅属于 `Production`，不属于 `Preview`；公开 SEO 路由仍需在托管 Preview 记录零 Supabase/登录/鱼缸请求。
- 当前分支：`codex/species-seo-preview-v1`，基于最新 `origin/main@d3c70dee` 的独立 worktree。
- 已完成：公开 SEO 页面、中文视觉系统、Species 证据/素材门禁和专项测试移植；保留 main 的 App Shell 类型与兼容性能力。
- 已验证：lint、SEO 证据、公开契约、素材门禁、build、内置浏览器三条 Species 路径 × 390/600/1440 均通过；页面保持 `noindex,follow`。
- 未完成：托管 Preview 浏览器截图/网络瀑布/CWV、可读独立 Critic、Figma Canonical、关键词归属和索引放行。
- 已完成：`scripts/check-preview-parity.mjs` 改为必须显式 `PREVIEW_PR`，严格校验本地/远端/PR/READY Preview SHA；缺少任何一项即失败。
- 当前阻塞：本机 Chrome/Codex Browser 访问 Vercel 域名为 `ERR_CONNECTION_CLOSED`；独立 Critic 持续运行但没有返回可读报告，已关闭并记录为基础设施阻塞。不解除索引、不合并。
- 禁止项：不改 `main`、不改 Production Supabase、不合并、不部署 Production、不调用 Figma。
- 用户现有 `feature/admin-content-v0`、PR #144 和未跟踪文件均不在本分支修改范围内。

## 2026-09-10 本地预览与类型回归修复

- `3000` 当前由残留进程占用，已在 `3001` 启动预览；内置浏览器确认 Species 长页面内容实际存在，章节锚点可到达 FAQ。
- 修复 Species `assetPreview=1` 品系卡预览调用的最小类型适配；普通公开路由、Published 聚合、metadata、JSON-LD 和 `noindex,follow` 不变。
- Evidence、Editorial、Public Contract、Responsive Contract、lint、build、diff-check 通过；Species 与动效 Playwright 仍因 macOS MachPort 启动权限失败。
- 用户未提交的 `scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts` 未触碰、未暂存。
- 内置浏览器已补充验证黄金米虾切换、返回恢复和 FAQ 展开；这属于本地交互证据，不替代三档 Playwright 或独立 Critic。

# AquaGuide 交接文档

## 2026-09-10 当前有效状态

- 内置浏览器已完成三条 Species 路径在 390/600/1440px 的真实检查：可滚动、无横向溢出、单一 H1、标题层级、44px 交互目标、中文术语和 `noindex,follow` 均通过。
- 已实际验证章节锚点、FAQ 展开、黄金米虾品系切换与浏览器返回；宝莲灯普通访问保持图片回退，`assetPreview=1` 仅用于本地预览。
- 系统 Chrome Playwright 仍是独立环境缺口；reduced-motion、性能指标、托管 Preview 截图和可读独立 Critic 未完成，不能宣称最终验收或解除索引。
- 下一步：保持 Figma 暂停，先完成可读独立 Critic；系统 Chrome 恢复后只补跑一次，不重复启动失败进程。
- Critic 状态：当前 worktree 的最新复验 turn 已结束但返回空正文；旧报告仅作历史参考，不能替代当前版本六维审查。

## 2026-09-10 公开 metadata 架构门禁

- 结构回归现在要求四类公开页面都使用共享 `setSeoDocument`；Species 的第二套写入器已移除并由测试持续保护。
- 公开结构、契约、文案、TypeScript 与 diff-check 通过；真实路由切换、三档截图和独立 Critic 仍待浏览器恢复。

## 2026-09-10 Species metadata 统一

- Species 公开页现在与 Marketing、Category、Guide 共用 `setSeoDocument`，不再保留第二套 metadata 写入逻辑。
- 相关结构、契约、文案、TypeScript 与 diff-check 已通过；真实浏览器路由切换和 JSON-LD 清理仍需在 Mac 解锁后复验。

## 2026-09-10 窄屏导航兼容性补强

- 章节导航的边缘渐隐现在同时使用标准和 WebKit `mask-image`，降低 Safari 下横向可滑动提示缺失的风险。
- 响应式、结构、文案、TypeScript 与 diff-check 通过；真实 390/600/1440 截图仍受 Mac 锁定阻塞。

## 2026-09-10 浏览器环境复查结果

- 本轮重新检查 Computer Use，系统返回 Mac 处于锁定状态且无法自动解锁；未能读取当前页面或执行真实截图。
- 不再重复启动 Playwright/系统浏览器；静态响应式与结构门禁不能替代真实视觉证据。
- 解锁后下一步：一次性重跑 Species 与公开路由的 390/600/1440 回归，再依据实际截图进入独立 Critic。

## 2026-09-10 公开页面滚动根因修复

- 定位并修复桌面应用壳全局 `#root { overflow: hidden; }` 对公开 SEO 长页面的裁切：`.seo-system.css` 对包含公开页面的 `#root` 明确设置 `height: auto`、`overflow: visible`。
- 响应式契约、公开结构、公开文案、公开契约、TypeScript、production build 与 diff-check 已通过。
- 真实三档浏览器截图仍未完成；本轮修复已提交前不应将静态门禁称为视觉验收。

## 2026-09-10 品牌 Hero 图片失败回退

- Marketing Hero 现在在批准图片不存在时显示用户可理解的“物种图片暂不可用”，不再留下无说明的空媒体区。
- `test:public-seo-structure` 已覆盖该回退；结构、文案、响应式契约和 TypeScript 检查通过。
- 该修复不改变 Product Truth、证据状态、路由、metadata 或 `noindex,follow`；真实 viewport 截图仍待浏览器环境恢复。

## 2026-09-10 公开响应式约束补强

- 当前新增 `scripts/test-public-seo-responsive-contract.mjs` 与 `npm run test:public-seo-responsive-contract`，把公开 SEO 的桌面、平板、手机和 reduced-motion 关键规则固化为可重复门禁。
- 已验证：响应式契约、公开结构、公开文案、TypeScript 与 diff-check 通过；未修改 Product Truth、路由、证据绑定或 `noindex,follow`。
- 仍未完成：真实可调 viewport 三档截图、系统浏览器启动级回归、Figma Canonical、可读独立 Critic 和索引放行。
- 本轮只提交新门禁和登记文档；`scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts` 的用户既有改动未暂存。

## 2026-08-31 专业身份核实进展（当前）

- 当前数据分支 `codex/catalog-cohort-30-v1` 的数据代码复验点为 `e8e6f3ce`；后续仅有文档修订，工作树干净，尚未推送。
- 新增4条 GBIF Backbone Taxonomy 身份来源，分别核实 Hemigrammus rhodostomus、Corydoras aeneus、Pterophyllum scalare 和 Symphysodon aequifasciatus；GBIF 仅用于身份，不覆盖水体、温度、体型、缸体或行为字段。
- 当前聚合统计为 30 种/300 字段、105 supported、195 reviewed+unknown、32 条内容已核实来源、99 个字段可进入运行时；486 种 Catalog checksum 为 `05576a71b29b6548efee79a119480fd4ab000674bd110533683bbc91c27bb1c2`。
- 批次、Catalog、435 组合、Domain/Service/Presentation、authority、lint 和 build 均通过；同一 Critic 已复验本轮来源边界，无实现阻塞。
- 仍未完成：30 种全部来源核实、数据短 PR 推送/合并、UI 验收、生产第27个 migration、Catalog 发布和正式上线。来源无法明确支持的字段继续保持 unknown，持续推进下一个来源，不等待单个来源恢复。

## 2026-08-29 4319 本地预览恢复（本轮最新）

- 用户报告的“乱码”已复现为 Vite 技术错误遮罩，不是中文编码问题：候选 worktree 的临时 `node_modules` 链接在服务启动后被移除，reload/HMR 再次解析 `@tailwindcss/vite` 时失败。
- 4319 已重启，并在服务生命周期内保留依赖链接；链接通过仓库本地 exclude 忽略，不进入提交。
- 同一浏览器标签 reload 后验证：UTF-8、错误遮罩为 0、正式互动内容与候选完整 SHA/seed/build time 可见。Three.js 仅有弃用 warning，没有页面错误。
- 禁止重踩：候选 worktree 预览存活期间不得移除依赖链接；交付 localhost 前必须在首次加载后再执行一次 reload/HMR 复验。

## 2026-08-29 本地收口复核（本轮最新）

- 4317 冻结视觉基线和 4319 当前候选均已恢复并返回 HTTP 200；4319 元数据对应候选当前 SHA，4317 保持历史构建，不为元数据改写基线。
- 真实浏览器已通过 Aquarium factual flow（规划只写种草清单、鱼缸不变、现实记录可保存）、正式图鉴/养护 scene/browse、今日行动点击/Escape/拖拽吸附。
- 当前候选 HEAD、远端候选/PR #142 SHA 和领先数量均由 `git rev-parse`/`git rev-list` 运行时读取；工作树干净，候选已提交但未推送。
- `check:ui-freeze` 明确报告的是本轮已批准的混养结果区域变化（7 个 visual-owned 文件），不是 Aquarium 舞台布局回退；需要用户确认后再重新 capture freeze。
- 生产 Supabase、Catalog 发布和 `main` 合并均未执行；本轮没有 GitHub、生产数据库或 Catalog 写入。

## 2026-08-29 浏览器门禁修复（本轮最新）

- 修复 Aquarium 空缸创建后的 React Hook 顺序错误。原因是混养展示 `useMemo` 位于 `!activeAquarium` 条件返回之后；现已移到所有条件返回之前，页面创建空缸后不再进入错误边界。
- `scripts/verify-aquarium-factual-flow.mjs` 现在走真实的“鱼类 → 黑裙鱼 → 查看规划判断”交互，覆盖：规划不写鱼缸、资料不完整时只写种草清单、不调用新增生物 API、现实记录独立保存、旧 `add-species` 深链兼容。
- 浏览器回归通过：`PREVIEW_URL=http://localhost:3001 node scripts/verify-aquarium-factual-flow.mjs`；静态/构建门禁也通过。当前 3001 是临时本地候选预览，结束后已关闭临时依赖链接。
- `check:ui-freeze` 仍是批准范围内混养结果变化导致的预期失败，不代表 Aquarium 舞台回退。当前候选领先远端的提交数以 `git rev-list` 运行时读取，未推送；生产 Supabase、Catalog 和 `main` 均未改动。
- 双预览已恢复：4317 使用独立基线 worktree `37a8d4d1` 的 production build，4319 使用候选当前提交；两个 `/_preview/interactive` 均已用真实 Chromium 验证 HTTP 200 且无页面错误。4317 不能显示候选版新增的元数据条，因为那会修改冻结 SHA；4319 已显示 branch/SHA/seed/build time。

## 2026-08-29 混养结果体验修复（本轮最新）

- 当前分支：`codex/main-core-foundation-v1`；本轮只改混养结果展示、收藏操作和推荐过滤，不动 Aquarium 舞台、布局、素材、今日行动、Supabase 或生产数据。
- Domain 仍返回真实 `insufficient_data`，但用户界面改为“当前可确认”或“暂未开放这组混养建议”；有部分事实时列出已核对维度，没有可靠事实时只提供物种养护和种草清单操作。
- `insufficient_data` 的规划组合不会调用新增缸内生物 API；种草清单复用现有本地收藏服务，保存 species ID，支持重复点击和跨页事件同步。
- 新增中央展示服务 `src/services/compatibility/compatibility-presentation.service.ts`，并接入 Compatibility Calculator、Visual Result Card、Species Detail、Encyclopedia、Aquarium 和 Recommendation。
- 验证通过：`test:compatibility-presentation`、`test:recommendation-unknown-filter`、`test:visual-results`、混养 Domain/Service/435 组合矩阵、Catalog、lint、API 类型和 production build。
- Critic 初审发现两个阻塞：未审核候选仍进入自动推荐、Aquarium 的 `complete_information` 仍进入设置并可能写鱼缸；已在 `ef1bba10` 修复并补回归，未审核候选现在只留在 blocked，规划资料不足只写种草清单。
- 同一 Critic 已复验 `ef1bba10`：需求完整性、逻辑、边界、代码质量、测试设计和 diff 范围均无新的实现级阻塞；完整交付仍受 UI freeze 人工确认和远端/Preview/Supabase/main 门禁限制。
- 追加修复 `9584dbef`：Aquarium 规划结果逐项区分“当前可确认”和“暂未开放”，没有确认事实的物种不再被错误标成当前可确认；展示测试、类型检查和 production build 已重新通过，同一 Critic 复验通过。
- `check:ui-freeze` 当前为 `FROZEN_PROVISIONAL` 失败，原因仅是批准范围内的混养结果区域文件变化；不是舞台或布局回退。用户验收新文案后需要重新 capture freeze。
- 本地 HEAD 以 `git rev-parse HEAD` 运行时读取，工作树干净；远端候选和 PR #142 仍停留在 `396e71da`，本轮不推送、不执行生产 migration/Catalog 发布、不合并 `main`。

下一步：将 `ef1bba10` 交回同一 Critic 做六维复验；如无阻塞，等待用户确认混养结果显示，再重新 capture UI freeze，之后才讨论一次性推送 PR #142。

## 2026-08-28 当前执行快照（本轮最新）

> 当前本地 HEAD 以 `git rev-parse HEAD` 运行时读取，已提交但尚未推送；远端候选和 PR #142 仍为 `396e71da`。此前“已同步/已推送”描述均为历史记录，不能作为当前状态。

- 当前分支：`codex/main-core-foundation-v1`。UI 继续冻结；本轮未改布局、素材、今日行动或视觉 Owner 文件，未推送 GitHub、未写生产 Supabase、未合并 `main`。
- 首批 30 个物种队列已改为固定、去重的 Catalog ID；新增逐记录 Catalog 审计报告和只生成草稿的 `catalog:research`/`catalog:review` 命令。审核状态不会因进入队列自动提升。
- Domain 现在输出个体上下文、现实共处等级和分层数量指导；领地性仅谨慎提示，繁殖护域与现实伤害有独立等级，幼体风险不会覆盖成体风险。旧引擎仍是冻结页面使用的兼容 facade，最终状态由 Domain 决定。
- 新增 435 组合矩阵门禁，验证无序组合确定性、顺序对称性和资料不足安全降级；本地 324/435 组合返回 `insufficient_data`，其余为明确硬冲突。
- 本地门禁结果：Domain/Service/legacy facade、Catalog、lint、API 类型、production build、UI freeze、project truth、26+1 migration 重放、pgTAP 19/19、schema lint 0 error 均通过。
- 当前阻塞：30 种字段级内容仍需水族内容专家整批审核；生产第 27 个 migration、Catalog 发布、最新 Preview exact SHA、人工 release acceptance 和 `main` 合并仍未完成。
- 下一步：先让同一 Critic 基于本轮 diff 和测试证据复验；随后整理少量本地提交。除非另行授权，不执行生产 migration、Catalog 发布、GitHub 推送或 main 合并。

## 2026-08-28 物种底层修复（最新）

- 当前工作线仍为 `codex/main-core-foundation-v1`；本轮保持冻结 UI，不执行生产 SQL、Catalog 发布、GitHub 推送或 `main` 合并。
- 已完成 Domain 环境约束（温度/pH/缸温/容量/缸长）和 `decisionReadiness` 元数据；旧引擎入口已固化为 Domain-authoritative facade，正式页面保持原 import 以满足 UI freeze，但最终结论不再来自旧逻辑。
- 新增 `scripts/audit-species-data-quality.ts` 和 `src/data/compatibility-launch-cohort.ts`：486 条记录审计、30 条确定性研究队列。研究队列只用于排期，不能把未审核物种当作安全可规划加入。
- 本地验证：`lint`、API 类型、Domain/Service 混养回归、Catalog 快照、30 条队列测试、`check:compatibility-authority`、`check:ui-freeze`、`check:project-truth` 和 production build 通过。
- 当前阻塞：首批 30 种事实仍需人工逐字段审核；生产第 27 个 migration、Catalog checksum parity、Preview exact SHA、人工验收和 `main` 合并仍未完成。
- 下一步：先跑完整本地门禁并交独立 Critic 复验，再按授权边界申请生产 migration；任何 UI freeze 差异立即停止。

> 说明：本文件更早日期段中的 `545ac...` checksum、旧 SHA 和“未推送”描述均为历史证据；当前候选状态以本节和 `npm run project:status` 为准。

## 2026-08-28 忽略 Vercel 后的本地收敛（最新）

- 当前工作线仍为 `codex/main-core-foundation-v1`；本轮没有修改冻结 UI、生产 Supabase、Catalog 发布或 `main`。
- 已完成混养唯一权威静态门禁、486 物种 Catalog 校验、26+1 本地 migration 重放、19/19 pgTAP、schema lint、Domain/Service/API 与浏览器回归。核心 UI 测试中的旧 600px/混养/AI 入口/证据折叠断言已按当前正式契约修正并通过。
- 当前可复核事实：旧引擎只能作为 facade；生产前 26 个 migration 只读结构等价；第 27 个 migration 仍需生产授权；生产 Catalog checksum、真实身份写入和回滚仍 `UNVERIFIED`。
- 已完成：独立 Critic 对最新 diff 的复验和一次性 GitHub 同步；`npm run project:status` 显示本地、远端候选和 PR #142 SHA 同步。PR #142 继续 Draft，不合并 `main`。
- 未完成：新 head 的 Preview exact SHA、生产第 27 个 migration、Catalog 发布、人工 release acceptance 和 `main` 合并。
- 下一步：读取本次 GitHub CI/Preview 收敛结果；Preview 未验证前不发布，随后由用户单独决定生产 migration 授权。

## 2026-08-28 忽略 Vercel 的安全补救（最新）

- 本轮只处理本地与文档收敛，不等待 Vercel、不修改当前 UI、不执行生产 Supabase SQL。
- 新增 `check:compatibility-authority` 门禁：旧 `tankCompatibilityEngine` 是冻结页面的兼容 facade，Domain Rules 保留最终结论权威。
- Feature Catalog/Convergence Ledger 已记录混养本地验证完成；Catalog parity 报告更新为当前 checksum `545ac808b6ef5889f841fd7ab4be77bba752e222f8384e2ac1a082632492c2d3`。
- 第 27 个 migration 授权包已生成：`docs/05-validation/SUPABASE_CATALOG_MIGRATION_AUTHORIZATION.md`。生产仍只有前 26 个 migration，Catalog 未发布。
- 下一步：跑完整本地回归、交独立 Critic 复验，再一次性同步 GitHub；Preview 仍按 Vercel 恢复情况单独验证。

## 2026-08-28 最新执行快照：水体事实修复已同步

- 红绿灯 `sp_0431` 和宝莲灯 `sp_0432` 已加入有证据支持的显式 `freshwater`；其余未审核物种保持 `unknown`，未知水体仍安全返回 `insufficient_data`。
- 完整资料下红绿灯↔宝莲灯返回 `caution`；移除任一方显式水体后返回 `insufficient_data`。Catalog 486 个物种 checksum 为 `545ac808b6ef5889f841fd7ab4be77bba752e222f8384e2ac1a082632492c2d3`。
- 本地、远端 `codex/main-core-foundation-v1` 和 PR #142 当前 SHA 已同步，精确值以 `npm run project:status` 运行时读取，工作树干净。上一个代码 head `cdd465817dc796bf77c9d3aef5e95c25366befff` 的 Preview parity 仅作为历史证据保留。
- 当前候选没有 exact Preview 部署，`check-preview-parity` 为 `UNVERIFIED`；AquaGuide 与 `admin-content` Vercel checks 均因 24 小时部署限流失败。Cloudflare、Foundation、`validate` 的实时结果以 `gh pr checks 142` 读取；未全绿不得发布。
- 当前没有改 UI、没有执行生产 Supabase migration/Catalog 发布、没有合并 `main`。PR #142 继续保持 Draft，等待生产授权和最终人工验收。

## 2026-08-28 最新执行快照

- 混养结论已完成本地唯一权威闭环：Domain Rules 是最终状态/策略/版本来源，`src/lib/compatibility/canonical-result.adapter.ts` 负责把结构化 ruleCodes 映射为 legacy 页面仍需的证据分组；Service 与旧入口共用同一适配器。最新代码提交为 `b9d56da2`。
- 本地门禁与独立 Critic 六维复验通过；正式场景、今日行动、UI freeze 和 project truth 均通过，未修改视觉文件。
- 当前 GitHub 同步已完成：本地、远端候选和 PR #142 均为 `7f0d208f`，工作树干净；当前 head 的 Preview SHA 仍未验证，GitHub 报告 Vercel AquaGuide/admin-content build-rate-limit（24 小时后重试）。生产第 27 个 migration、Catalog 发布和 `main` 合并未执行。
- 下一步：不再重复推送；等待额度恢复后只读运行 `check:preview-parity`。在此之前可继续本地与生产只读证据整理，PR #142 保持 Draft。

## 2026-08-28 当前执行边界

- 本地 Compatibility Service 与 Domain Rules 权威收敛已通过专项回归；当前候选工作树为 `codex/main-core-foundation-v1`，SHA 由运行时状态命令读取。
- 4319 已重启到当前工作树，正式图鉴/养护 scene/browse 与今日行动回归通过；4317 冻结视觉基线未动。
- 页面层 import 切换尝试被 `check:ui-freeze` 正确拦截并回退，因此正式页面仍有旧引擎适配层入口；这是解冻 UI 后的明确待办，不是已完成事项。
- 当前本地领先远端候选 9 个提交；不要宣称 GitHub/PR/Preview 与当前 head 已同步。生产第 27 个 migration、Catalog 发布和 `main` 合并均未执行。
- 下一步：等待 Vercel 配额恢复后一次性推送；重跑 `project:status`/Preview parity；随后分别申请生产 migration、Catalog 发布和 main 合并授权。

## 2026-08-28 混养唯一结论闭环

- 旧引擎入口已改为 Domain-authoritative adapter：保留 legacy Fish 输入和说明证据，但最终 `status`、风险等级、策略所依据的元数据来自 Domain Rules；commit `7fa70ac1`。
- 现有 Aquarium、Encyclopedia、Species Detail 和 Compatibility Calculator 页面文件没有改动，`check:ui-freeze` 通过；无需为了切换逻辑重新设计视觉。
- 回归通过：`test:compatibility`、`test:compatibility-service`、Catalog、添加/记录、build、UI freeze 和 project truth；正式 scene/browse 与今日行动此前已通过。
- 当前本地候选领先远端 11 个提交；不要宣称 GitHub、PR #142 或 Preview 已同步。生产第27个 migration、Catalog 发布和 main 合并仍未执行。

## 2026-08-28 Critic 阻塞修复

- 独立 Critic 发现旧入口只同步 Domain 状态、未同步 Domain 证据；现已把证据合并下沉到 `src/lib/compatibility/canonical-result.adapter.ts`，直连旧页面也能显示对应阻断/资料不足理由。（commit: `33576cc6`）
- 新增 direct-entry 水体冲突回归并通过；类型、混养、UI freeze 和 project truth 继续通过。当前代码修复尚未推送。
- 后续已删除 Service 内重复的 Domain evidence map，统一复用共享 adapter，并补齐未映射 ruleCodes；Critic 复验结论为本地六维 PASS。（commit: `b9d56da2`）

## 2026-08-28 Domain 结论接管 Service

- Compatibility Service 已把 Domain Rules 的状态与添加策略接到应用/服务层；legacy 引擎仍只提供证据详情，Service 不再把 legacy status 当最终结论。
- Domain 新增显式候选水体校验及已审核捕食、领地、单养特征规则；未知水体/未审核资料安全返回 `insufficient_data`。
- 新增 `npm run test:compatibility-service`，并通过 Domain、Catalog、添加意图、现实记录、API 类型、lint、build、UI freeze、project truth 回归。
- `record_existing` 与 `planned_addition` 现在由记录/规划服务显式传入，现实记录仍可保存，规划加入仍按 `allow / confirm / complete_information / block` 处理。
- 本步骤已本地提交为 `9d0110f6`，尚未推送；推送前仍需独立 Critic 复验，并考虑 Vercel 配额限制。
- UI 冻结仍有效：正式页面的旧引擎 import 本轮没有改动，因此布局和素材没有变化；解除冻结后的页面入口切换仍是待办。
- 生产第 27 个 migration、Catalog 发布、最新 Preview parity 和 `main` 合并未执行。

## 2026-08-28 Critic 修复与复验准备

- 修复 `reviewSpeciesAdditions` 的 intent policy：现实记录不再返回规划加入的 `complete_information`，改为保存类策略；新增 Domain ruleCode 到结构化说明的映射，避免状态/理由不一致。
- 补回 `npm run check:preview-parity` 脚本入口；本地执行因 GitHub DNS/网络限制失败，不能将 Preview parity 记为通过。
- 修复已提交为 `ba23c69d`；当前需要完成同一 Critic 的复验，再决定在 Vercel 配额恢复后推送。生产 migration、Catalog 发布和 main 合并仍不执行。
- 追加规则说明归类和重复脚本键修复，提交为 `9495a95b`；Domain-only 水体冲突现在进入 blocking，未知/审核缺口进入 missing/warning，避免风险等级过度放大。
- 本地 authority checkpoint 已提交且工作树干净；本地门禁通过。当前仍比远端候选领先本地提交，未推送；等待 Vercel 配额恢复后一次性同步并验证 PR/Preview SHA，具体 SHA 以状态命令动态读取。

## 2026-08-28 候选推送与 Preview parity

- 本地候选、远端 `codex/main-core-foundation-v1`、PR #142 Head 与 Vercel Preview 已同步为 `781c6af916a012ed4ff25a1e517eca3363ae0862`。
- `npm run project:status`：本地/远端同步，PR #142 为 Draft，`releaseReady=false`。
- `npm run check:preview-parity`：`PASS / EQUIVALENT`；Preview 为 `https://aquaguide-a7lldqywp-chusday97s-projects.vercel.app`，实际部署 SHA 与候选一致。
- 本次只推送候选代码和文档；未执行生产第 27 个 migration、Catalog 发布或 main 合并。当前唯一底层未完成项仍是 legacy UI status/evidence 尚未完全由 Domain 接管。

> 追加事实：后续 docs-only 提交将候选推进到 `df3c4e119b14e323502b9c711ad607b66eeb5435`，本地/远端/PR 仍同步；Vercel 对该 head 受每日额度限制，Preview parity 暂为 `UNVERIFIED`。上一笔代码 head `55a37745` 的 exact Preview parity 保留为历史证据。

## 2026-08-28 admin-content 门禁隔离

- 已更新 Vercel `admin-content` 项目配置：Root Directory 恢复自动检测（仓库根），仅 `feature/admin-content-v0` 执行 `npm run build --workspace @aquaguide/admin-content`；其他分支直接跳过。
- 该配置不改变 AquaGuide 代码、当前 UI 或仓库分支；旧候选失败部署已按新配置重试并被安全取消（表示忽略构建），需下一次 GitHub push 生成新的 status 才能确认 PR 门禁恢复。

## 2026-08-28 Domain fact source 收敛第二步

- `speciesProfileFromFish` 现在负责将旧 Fish 的显式温度/pH 文本转换为 canonical `SpeciesProfile` 数值范围；Domain adapter 不再直接读取 Fish 文本字段。
- 补充空文本、无效换水周期、nullable 文案和范围转换回归；`test:species-profile`、Catalog、Domain、lint、API、build、UI freeze 和 project truth 均通过。
- 本步骤仍未宣称完整 Domain authority：legacy UI status/evidence 仍为迁移期 fallback；生产第 27 个 migration、Catalog 发布和 main 合并未执行。

## 2026-08-28 Compatibility Service 入口收敛

- 新增 `src/services/compatibility/compatibility.service.ts` 作为统一应用入口，服务、知识模块、推荐、Collection 和测试不再直接导入旧引擎；旧引擎仅在该入口内部调用。
- 页面/组件文件因 UI freeze 约束保持不变，因此正式页面消费者尚未完成最后切换；不能把本步骤描述为 Domain status 已完全接管。
- `check:ui-freeze`、lint、API 类型、Domain/兼容性回归和 project truth 已通过；当前工作树待提交。

## 2026-08-28 Domain authority 收敛进展

- 已新增 canonical `SpeciesProfile` 类型和 `speciesProfileFromFish` 适配器；旧 Fish 的缺失水体保持 `unknown`，不从名称、分类或描述推断。
- Catalog Snapshot 与 Domain 输入复用同一 Profile 边界；已审核结构化 pair rule 才能进入 Domain，legacy 总状态不再反向覆盖 Domain。
- 本地验证：`test:species-profile`、`test:catalog-snapshot`、`test:domain-compatibility`、兼容性引擎回归、lint、API 类型、`check:ui-freeze` 和 `check:project-truth` 通过。
- 当前仍未完成：所有 Service/Repository/UI 结果完全改由 Domain 决定；生产 Catalog migration、Catalog 发布和 `main` 合并继续未授权。

## 2026-08-28 GitHub 与 Preview parity 已闭合

- 当前候选分支 `codex/main-core-foundation-v1`、远端分支、PR #142 Head 和 Vercel Preview 均为 `1a3d366bd8432eadf20442274ba06dfd90904a98`。
- `npm run check:preview-parity` 已通过：Preview 为 `https://aquaguide-6xdkkkg9e-chusday97s-projects.vercel.app`，状态 `EQUIVALENT`。
- PR #142 的 `foundation`、`validate`、Cloudflare Pages 和 aquaguide Vercel 检查通过；PR 仍为 Draft，另有无关的 `Vercel – admin-content` 失败状态，不作为 AquaGuide 候选部署证据。
- 生产 Supabase 仍只读：前 26 个 migration 与结构基线等价；Catalog 三项仍 `MIGRATION_REQUIRED`。未执行第 27 个 migration、Catalog 发布、生产写入或 `main` 合并。
- 下一步只有三个独立授权点：生产第 27 个 migration、Catalog 发布、PR #142 转 Ready/合并 `main`。

## 2026-08-28 本地 Supabase 验证续跑

- 当前目标：在 Vercel 等待期间完成候选分支的本地数据库重放与权限门禁，不改变 localhost UI、不写生产 Supabase、不推送 GitHub。
- 已完成：Docker Desktop + Supabase CLI 本地栈；前 26 个生产 migration 从零重放；七类规范化结构 hash 与生产只读基线完全一致；第 27 个 Catalog migration 本地重放、schema lint 和 19/19 pgTAP 通过；匿名 Catalog REST 读取成功、匿名写入被 `401/42501` 拒绝（commit `b9903924`）。
- 关键文件：`supabase/config.toml`、`supabase/tests/catalog_rls.test.sql`、`supabase/fixtures/`、`docs/05-validation/SUPABASE_PARITY_REPORT.md`。
- 当前卡点：生产尚未执行第 27 个 migration，生产 Catalog checksum 与真实身份写入/回滚语义仍 `UNVERIFIED`；PR #142 仍为 Draft，`main` 尚未改变。
- 下一步：等待 Product Golden Path validate 收尾；随后由用户单独授权第 27 个生产 migration。Catalog 发布与合并 `main` 继续分别授权。
- 独立 Critic 复验：六维均通过本地范围；确认 26+1 replay、RLS/GRANT、19/19 pgTAP 和 fixture 移动无阻塞。生产 parity、Catalog 发布和身份写入/回滚仍明确为外部门禁。
- 2026-08-28 生产只读复核：26 个 migration、35/35 RLS 表、89 条 policy、56 个外键、86 个索引与候选历史一致；33 个触发器对象对应 35 个 information_schema 事件行（多事件展开）；Catalog 表/水体字段缺失，标记 `MIGRATION_REQUIRED`，未执行任何生产写入。
- 2026-08-28 GitHub/Preview 同步：历史 `ad858032` 部署 `6133389265` 仅作旧证据；当前候选已同步至 `1a3d366b`，并完成新的 exact Preview SHA 记录。
- 2026-08-28 parity 门禁修复：Vercel CLI metadata fallback 已加入 `check:preview-parity`，解决 GitHub Deployments API 漏报 Vercel deployment 的误报；修复后候选 `1a3d366b` 的 parity 检查通过。
- 禁止重踩：不要运行 `supabase db reset --linked`、`supabase db push`、生产 DDL/DML；不要把本地 pgTAP/REST 结果描述为生产写入已验证；不要修改视觉文件。

## 2026-08-13 Golden Path GP-002 + Compatibility Evidence baseline

- GP-002 已升级为 covered：真实 Chromium 连续执行“搜索宝莲灯 → 精确物种详情 → 主 CTA 进入混养 → 候选 ×6 → caution 风险确认 → 实际入缸 → 持久化数量验证”，不得用多个单点测试替代。
- Species deep-link 详情进入下一任务时，`closeAtlasDetail(false)` 只关闭详情/清理 detail state，不得恢复旧浏览上下文；下一任务 CTA 是唯一导航所有者，避免 return navigation 与 task navigation 竞争。
- 捕食硬阻断不得从 description / diet / housingReason / feeding notes 等自由文本中的“被捕食、避免大型鱼”等字样反推 predator 身份。Predator identity 只读取结构化 Aggressive/Large 及名称/类别中的明确掠食身份。
- Compatibility evidence 继续 fail closed：没有 reviewed behavior profile 的组合保持 insufficient_data。红绿灯（sp_0431）与宝莲灯（sp_0432）新增 reviewed species profile；pair 只标 caution，因为当前证据支持群游属性与水质区间重叠，但不是直接配对实验。
- 永久回归：`test:golden-path-contract` + `test:compatibility-evidence-coverage` + `test:golden-path-gp002-ui` + `test:core-flow-state-eval` + `test:task-entry` + lint + build。

## 2026-08-12 Core-flow executable evaluation baseline

- 核心行为不再只做静态“六状态”登记：混养 + 添加生物有 14 个 executable Case，换水 + 每日检查有 12 个 executable Case；四个核心功能都至少覆盖 6 种有业务意义的状态。
- 持久化契约：用户可见层不得展示 repository / storage / HTTP / database 等 raw error；部分成功必须保留已成功事实和失败项重试入口；同一 operationId 的响应丢失重试不得重复增加数量。
- “规划添加”和“现实已在缸内”必须分开：规划冲突可以阻断；现实事实即使高风险也必须允许记录，再明确显示风险，不得为了产品判断删除现实事实。
- 换水记录以 waterChangeHistory 为唯一事实源：最近换水由真实历史推导并同步到鱼缸和所有缸内生物；空历史就是未记录；未来日期不能进入正式历史。
- 每日检查采用同鱼缸、同本地日期 upsert；保存失败必须保留结果并允许重试，保存后的文章/下一步行动只允许在正式记录持久化成功之后执行。
- 永久回归：test:core-flow-state-eval（v1+v2）+ test:core-flow-state-ui + test:compatibility + test:livestock-recording + test:daily-check + lint + build。新增核心行为时，应优先扩展对应 executable Case，而不是只补 happy path。

## 2026-08-12 Surface Sizing + Typography Migration + 收藏滑动卡片基线

- 桌面 Drawer 不再统一使用 50vw。Surface 按任务密度分级：阅读/详情约 520px、编辑任务约 560px、复杂决策约 640px；所有宽度必须再受固定侧栏之后的真实剩余工作区限制。手机端继续使用原有 bottom sheet / mobile task surface。
- “调整缸内物种体态”保留单物种编辑一列修复：进入编辑后单个编辑器占满 Drawer 可用宽度，不得继承缸内物种列表的两列网格。
- 物种详情、品类详情与养护指南属于 reading surface；缸内体态/设置等属于 editing surface；混养结算属于 decision surface。ConfirmDialog 仍保持居中短决策。
- Typography 只提供 page / section / card / body / meta / action 语义层级；不得通过全局 CSS 强制重写所有 font-black/font-bold/font-semibold 或 text-[Npx]。旧页面按共享组件逐步迁移，避免一次性改变导航、标签、卡片等既有节奏。
- 语义 Typography 与 Surface token 必须定义在 Portal 可访问的作用域；Dialog/Drawer 挂载到 body 时不能因为脱离 .aquaguide-app 而回退到错误字号或宽度。
- 水族册首页模块预览、种草收藏和养护收藏使用横向可滑动 snap 卡片轨道；手机露出下一张卡作为滑动提示，桌面支持触控板/横向滚动。生命纪念保持自己的浏览结构；成就继续保持建设中且不展示真实进度。
- Card 仍遵守 Card=Open object：点击收藏卡直接进入对应物种/养护详情；详情再按 Surface Sizing contract 展示。
- 回归门禁：test:responsive-detail-surface + test:typography-system + test:collection-swipe-cards + test:collection-hub-ui + test:livestock-state-surface + test:livestock-state-drawer-ui + test:guided-navigation-ui + lint + build。

## Task-entry / Deep-link contract (2026-08-11)

- 功能 CTA 必须把用户直接送到任务起点、目标对象、对应结果或具体操作区，不能只打开大页面后让用户自己翻找。
- 顶层主导航（我的鱼缸 / 图鉴 / 养护 / 水族册）和明确的“返回首页”是例外，可以落页面首页。
- Task intent 必须显式表达在 `taskRoutes` 的 action/query/hash 中；目标页面必须实际消费该 intent，不能出现 URL 看似有 action 但页面不处理的伪 deep link。
- 典型路径：换水→换水记录；每日检查→巡检；混养→compatibility mode；物种→指定物种详情；养护→指定 topic/推荐/搜索区；收藏→对应水族册子模块。
- 跨页面任务跳转必须保留必要上下文（如 species/topic/source），辅助 source 参数不得破坏导航高亮。
- Search、Identify、Onboarding、今日行动、养护计划和内容详情新增 CTA 时都必须遵守本契约；用 `test:task-entry` + `test:task-routes` 防止回退。


## First-screen task contract (2026-08-11)

- Detail pages must show the user's core conclusion, next action, or primary control in the first viewport. Users should not need to scroll to discover what the page is for.
- On mobile, task content comes before decorative/supporting media. Hero imagery is secondary to the task.
- Care guides follow: title/risk → conclusion → immediate steps/check/start action → supporting image → detailed explanation/sources/related content.
- Secondary actions such as favorite, reminder, sources, and related reading must not outrank the core care task.
- Knowledge guides are for understanding first; “save to collection” is not treated as the primary CTA.
- This is a product interaction rule, not only a Care-page styling preference. New detail flows should follow the same first-screen principle.


## 2026-08-10 文案与交互一致性基线

- 2026-08-10 已完成连续七轮用户可见文案审计：删除模型/provider/fallback/候选池/数据结构/原始错误等内部实现语言；普通用户界面不得直接展示 raw error.message。
- 已确认产品事实边界：用户事实必须显式；未回答与明确“无”不同；高风险确定性规则与 AI 解释分离，AI 不得反转安全阻断。
- 当前建设中功能统一为：云端同步/登录、成就勋章、分享与隐私。图片、卡片、打印、报告及本地数据导出已从当前产品移除，不再作为建设中入口展示。建设中是显式 feature state，不能再依靠按钮文字或 DOM 正则猜测。
- Interaction Contract：①浏览场景 Card=Open object；收藏/添加/删除/选择必须是独立 control。②只有明确选择任务允许 Card=Select。③Guard first, side effect second。④删除/清空/放弃未保存内容使用共享 ConfirmDialog，不新增 window.confirm。⑤侧栏 active 按业务 route/query 判断，source/item 等辅助参数不能破坏高亮。⑥同一建设中功能的所有入口必须表现一致。
- Search 物种结果卡应打开物种档案；AI 助手提到的物种卡应打开物种档案，收藏为独立按钮。
- Achievements 不属于当前正常 IA：可保留灰色建设中入口，但不得展示真实进度、自动解锁、目标或下一步。直接 URL 与点击入口应落到同一建设中 surface。
- 分享在转 live 之前不得保留 icon-only 绕过入口，不得一边在 Settings 标注建设中、一边仍调用 navigator.share/clipboard。
- 2026-08-10 产品范围收缩：移除全部导出入口、导出中心、物种/诊断/评分/养护计划/纪念卡导出、PNG/打印实现和本地数据导出 API；分享仍保持 building。
- 未保存内容保护应覆盖应用内导航、浏览器返回/前进、刷新/关闭和 reset/restart；任何 reset/write/delete 副作用都必须发生在用户确认之后。
- UI/导航改动合并前至少运行 build + 交互一致性回归检查；合并后必须确认 Vercel Production success 才能宣称上线。


## 2026-08-09 GitHub main 合并

- 已确认远端 `main@de61600` 是功能分支的共同祖先，功能分支只领先 64 个提交，因此使用 fast-forward 合并，无冲突、无强制推送、无历史改写。
- 已把 `codex/activation-evaluation-v1@153695e` 推送到 GitHub `main`；功能分支继续保留。
- 生产预览此前已发布同一 P0 产品代码；本条只记录 GitHub 默认分支同步状态。

## 2026-08-09 P0 独立审查闭环

- 本地 P0 已由同一独立 Critic 完成“首轮审查 → Builder 修复 → 同线程复验”，最终 PASS。
- 审查修复提交：时间线/循环事务 `2b32de9`；动作级来源 `9fe79df`；推荐收藏 Repository 与失败回滚 `cd66bc3`；运行时按钮门禁 `1f6a51e`；显式人工审核与提醒 Repository `b8627ad`；提醒归属文案 `3da4587`。
- 已关闭的主要问题：页面绕过 Repository、循环完成半成功、动作来源只在文章级、体态重试操作号不稳定、收藏失败不回滚、按钮只做静态扫描、关键词自动授予“已审核”。
- 当前可信边界：本地规则、契约、构建和 Chromium 路径已验证；真实 Supabase migration/RLS/RPC 尚未运行；41 篇文章的 228 条动作只有候选来源，全部等待水族内容专家显式审核，不能称为已发布可靠知识。
- 独立 Evaluator 已按原始 P0-1 至 P0-4 从六维最终裁决 PASS，并指出证据审计文档仍有旧 35/6 数字；该漂移已修正为 `0 reviewed / 228 pending`。
- 当前构建已发布：deployment `dpl_Dsw3wUTfmaHWZw3v2BPQhtCysJrq` READY，别名为 `https://ice-glide.vercel.app`；`/aquarium` 返回 200 并加载 `index-0k6PQE5x.js`。生产环境的时间线专项与 14 路由/六类动作运行时门禁均通过。
- 发布排障：Vercel CLI 58 会拒绝本地旧绑定 `directory: "."`；从 Git 忽略的 `.vercel/repo.json` 移除该失效字段后，预构建上传与别名切换成功。不要把密钥或 `.env.local` 纳入 Git。

## 2026-08-09 体态编辑退出竞态修复

- 体态草稿不再在父组件因状态同步而重渲染时重新初始化，避免数量或体态选择被旧记录覆盖。
- 数量、日期和体态一经修改便同步标记未保存；Esc 由最内层草稿编辑器优先处理，打开“继续编辑 / 放弃修改”确认，而不是直接关闭整个缸内物种面板。
- 验证：`test:guided-navigation-ui` 的中文 390px 部分数量调整、英文 600px Esc 继续编辑和放弃修改全部通过。

## 2026-08-09 鱼缸时间线与循环养护

- `0112998` 新增 `/aquarium?action=timeline&tank=<id>`，桌面和手机都从鱼缸标题区直达并明确返回。
- 旧建缸、入缸、换水、喂食、巡检和计划完成记录确定性回填并标记“由旧记录整理”；新设置、加减生物、体态和操作记录使用稳定来源去重。
- 循环养护复用现有提醒：喂食 1/2/3 天、换水 3/7/14 天、通用 1/3/7 天；底层支持 1–90 天。完成后按实际完成时间生成下一条，关闭循环不删历史。
- 审查后补齐云端边界：时间线与提醒统一经 Local/API Repository；`complete_care_reminder_with_recurrence` 在一个事务中完成当前计划、创建下一期和写入幂等记录；批次同步及提醒修改使用可重放的稳定操作号。
- 验证：`lint`、`check:api`、`build`、`test:care-timeline`、`test:care-timeline-ui`、业务 API、状态服务、任务路由和按钮审计通过。真实 Supabase migration/RLS 仍属于外部门禁。

## 2026-08-09 缸内体态三步任务

- `4c027b5` 将体态调整收口为“选择数量、选择体态、核对保存”三步；部分数量由服务层自动分组，总数量保持不变，界面不再暴露“拆分/合并”术语。
- 水草、硬景和珊瑚不显示繁殖状态；鱼、虾螺和爬宠继续使用现有生长/繁殖状态。
- 验证：`lint`、`test:species-batches`、`test:product-actions`、`build` 与真实 Chromium 手机/600px 英文窄桌面回归通过。

## 2026-08-09 今日推荐收藏与按钮门禁

- `13c6994` 将推荐收藏从“收藏后自动换卡”改为原位收藏/取消；当前物种、进度和队列保持不变，只有“换一个”推进队列。
- 收藏统一经当前 Local/API Repository；写入期间心形与“换一个”禁用，成功显示“已收录到水族册 / 已从水族册移除”，失败回滚心形和持久化状态并展示原因。Chromium 已注入存储配额失败验证恢复路径。
- `test:product-actions` 现扫描 13 个正式页面和所有共享组件（排除基础 UI 原语），覆盖 49 个交互表面并输出六类动作清单。
- `test:product-actions-runtime` 追加 14 个正式路由的真实浏览器扫描，并分别点击验证 route、view、mutation、dialog、section、external 的可观察结果；图鉴原位筛选补齐展开状态和目标关联。
- 验证：`lint`、`test:product-actions`、`test:daily-discovery`、`build`、`git diff --check`；浏览器使用 `http://127.0.0.1:4178`。

## 2026-08-09 养护动作与来源门禁

- `1367000` 修复水浑自查被斗鱼条件错误追加“增加躲避物”的串线问题；躲避物现在只属于追咬/领地场景。
- 审查后把文章级来源下沉到每个立即动作、禁止动作、观察项、复查动作和下一步；页面在行动旁直接显示候选来源与状态。二次 Critic 指出关键词匹配不能等同人工审核，现只有显式登记审核人、时间和来源 ID 才能授予 reviewed；当前 228 条全部保持待复核，后续须由水族内容专家逐项确认。
- 养护自查改为“快速评测 → 行动方案”：结果首屏直接给出最多三步、暂时不要和复查目标，原因证据保持次级展开；全缸、多种和单种检查范围仍使用原有确定性规则。
- 文章内设置提醒统一经 Local/API Repository；保存期间禁用确认并显示 loading，失败保留当前选择。鱼缸页仅在 local 模式消费本地 care activity 订阅，避免覆盖云端提醒快照。
- 安全换水不再依赖静置 24 小时处理氯胺；死鱼处理不再自动建议药浴和主缸杀菌。
- 验证：`audit:care-evidence`、`test:care-guidance`、`test:care-guide-types`、`test:task-actions-ui`、`test:three-step-ui`、`lint`、`check:api`、`build`、`git diff --check`。
- 浏览器验收使用当前开发进程 `http://127.0.0.1:4178`；生产站尚未因本提交重新部署。

## 2026-08-09 混养审核证据门禁

- `985da98` 删除“攻击性或大体型自动等于捕食者”的旧推断；捕食、领地和单养阻断只读取已审核画像或特殊配对规则。
- 虎皮鱼 × 迷你鹦鹉鱼主因改为追鳍、追逐、领地和繁殖防御风险，并明确是两种行为资料的组合推断，不是直接配对实验。
- 全库 486 条均进入证据审计：3 条已审核、483 条待人工审核；待审核行为资料不能生成 `compatible` 或允许加入。
- 混养完整结果显示审核状态和来源链接；Mini 与完整计算复用同一引擎。
- 验证：混养引擎、Mini、视觉结果、物种知识、API 类型、前端类型和生产构建通过。

## 2026-08-09 可信证据与时间线契约

- 契约升级为 2.5.0：新增证据来源、物种审核画像、特殊配对规则、养护步骤引用、时间线事件来源和循环养护字段。
- 公开内容 API 已能返回审核后的物种兼容画像与养护引用；管理端步骤写入同步保存动作标题和动作类型。
- 当前只完成契约与安全边界，尚未把本地混养引擎切换到证据门禁，也未在真实 Supabase 执行 migration。
- 契约提交：`716fdad`。
- 验证：`test:three-tier-contract`、`check:api`、`lint`、`build` 和 `git diff --check` 通过；构建仍保留既有大代码块警告。

## 2026-08-02 激活事件与全量同步

- `a29d7df` 完成会话内安全事件白名单、首次打开、真实鱼缸完整混养与首次激活记录；PostHog 不可用时不影响本地会话记录。
- 事件只保留受控字段；自由描述和巡检答案会被丢弃。
- 验证：`lint`、`check:api`、`build`、`test-session-events`、`test-onboarding-activation`、`test-tank-compatibility-engine` 均通过；构建仍保留主包与 Three.js 大块警告。
- 当前证据不代表已有真实激活率、TTV 或留存数据；生产 PostHog 仍取决于部署环境变量。
- GitHub 功能分支已完整同步。最新生产版本部署到 `https://ice-glide.vercel.app`；首次部署暴露 SPA 深链接 404，新增 `vercel.json` rewrite 后复部署，`/aquarium` 已返回 200 且加载 `index-BtS9X_Qg.js`。`https://aquaguide-frontend.pages.dev` 仍是旧版本，仅在决定继续使用 Cloudflare 时再完成 OAuth 发布。
- 全部去重后待办已写入 `docs/04-planning/NEXT_EXECUTION_PLAN.md`。

## 2026-08-02 今日推荐回迁与常用操作直显

- 最新用户决策替代 2026-08-01 的首页内容边界：今日推荐使用原有紧凑图片卡回到鱼缸首页第 3 区，图鉴不再显示重复推荐卡。
- 推荐继续复用 `discoveryState` 与每日 10 个候选；查看详情进入正式图鉴物种档案，并通过 `dailyDiscoveryReturn` 返回鱼缸首页。
- 鱼缸首页第 2 区六个常用操作全部进入同一响应式网格，“更多工具”折叠已删除。
- 验证通过：`lint`、`build`、`test:daily-discovery`、`test:mobile-aquarium-priorities`、`test:aquarium-home-c`、`test:disclosures`、`test:responsive-routes`。
- 提交边界：本功能只应提交 Aquarium、Encyclopedia、两个浏览器脚本、package 命令与同步文档；Analytics 四个未提交文件属于后续激活阶段，不得混入。

## 2026-08-01 激活与 Evaluation 基线

- 当前分支：`codex/activation-evaluation-v1`，从已通过审查的 `codex/ux-core-flow-v1@4ece6cb` 建立。
- 本轮不新增产品功能；目标是补齐证据边界、结构化 AI Evaluation、激活/TTV/AI 生命周期匿名事件和真人测试准备。
- 已确认 Onboarding 真实适配任务与识别/健康分诊分离主体均已实现，本轮只补兼容测试、事件语义和验证缺口，不重写页面。
- 安全默认：旧兼容记录不补发新激活；真人原始匿名记录保存在 Git 忽略文件；Live Eval 只走现有 BFF 且必须显式设置 `RUN_LIVE_EVAL=1`。
- 当前阶段：证据矩阵、产品假设、真人测试空状态和 AI Evaluation 状态基线已写入 `docs/05-validation/`，等待阶段提交。
- 阶段 1 只补齐任务 ID 和专项门禁；`compatibilityCompleted` 仍只接受关联现存鱼缸、至少两个物种、`scope=tank` 且具备正式四态结果的有效记录。
- 阶段 2 增加 `identification-triage-flow.ts` 作为边界单一来源；页面外观和既有识别/分诊业务结果不变。
- 阶段 3 的 47 个 Case 已迁入 `evaluation/datasets/`；生成报告默认 Git 忽略。Live Runner 只有显式 `RUN_LIVE_EVAL=1` 才通过现有 BFF 调用 Provider，视觉 manifest 仍为空。

## 2026-08-01 物种属性审计与今日推荐

- 486 条物种已全部进入 `output/classification_audit/`；实际派生为 40 条珊瑚生命类型。此前“39 条”是丁香珊瑚被名称正则误判成水草后的错误统计。
- 来源分类现在先于名称关键词：`sp_0335` 丁香珊瑚为珊瑚/海水，不再出现水草、草缸或淡水；`sp_0366`、`sp_0406` 两条五彩青蛙均为海水鱼/虾虎青蛙鱼。
- 非鱼类不能获得“小型观赏鱼 / 群游搭配”；珊瑚不能仅凭通用 `Small` 获得两类小缸标签。61 条旧来源分类差异留在审核表，不自动覆盖原始资料。
- 图鉴今日推荐在无搜索/筛选时展示；筛选后隐藏，避免混入结果语义。站内详情关闭恢复图鉴位置，复制或直接打开推荐深链时关闭安全回 `/encyclopedia`。
- 提交：`38ba7b4`、`28f58ed`、`a81131a`、审查修复 `e26f278`。分类、审计、UI、推荐深链、lint、API 类型与生产构建均通过；同线程 Critic 六维复验与独立 Evaluator 用户路径裁决最终 PASS。

## 2026-08-01 手机导航与首页优先级

- 手机鱼缸页头为“切换鱼缸 / 新建 / 更多”，更多菜单承接重命名、设置、数据与删除。首页只直显巡检、换水和喂食，完整今日推荐从鱼缸页移除，图鉴保留物种发现职责。390px 手机和 600–1440px 桌面真实 Chromium 回归通过。

## 2026-08-01 识别与健康分诊拆分

- 确认物种不再自动打开症状问诊；新增 `identified` 阶段，提供混养判断、物种资料和可选健康分诊。识别进度只覆盖上传与确认，问诊使用独立标题和离开保护。真实手机 Chromium 与完整动态追问回归通过。

## 2026-08-01 新手引导核心价值闭环

- 新手引导改用 `getOnboardingTasks(goal, progress)` 单一任务来源；完整混养计算写入现有 `compatibilityRecords` 后才计为核心价值完成。建缸路线仍要求首次巡检，浏览路线不强制巡检。专项、类型检查和生产构建通过。

> 写给一个完全没有此前对话上下文的新接手者。最后更新：2026-08-09（Asia/Shanghai）。

## 2026-08-09 核心鱼缸事实链路重构

- 当前目标：把“现实中已经存在的生物”和“未来准备加入的生物”拆成不同 Intent；事实必须先保存，混养判断只能生成保存后的风险提示。
- 已完成：2.6.0 契约、鱼缸资料 `empty / incomplete / usable / complete` 派生规则、`AquariumFish.lastWaterChangeDate` 可空语义和两类 Intent 策略测试。（commit: `56c486b`）
- 已完成：Local/API Repository 增加 `createAquarium` 与幂等 `addLivestock` 命令；现实记录按照“先写入、再基于写入前快照评估”执行，评估失败不会回滚已保存事实。（commit: `7284008`）
- 已完成：新增 `/aquarium?action=record-existing` 与 `/aquarium?action=plan-species`；旧 `add-species` 映射为规划链路。空状态、新建鱼缸、首页、3D、图鉴详情和完整混养的新增入口已接入新边界，页面不再为新鱼缸生成推荐值。（commit: `f04f189`）
- 已完成：关闭建缸模板、图鉴、完整混养与模拟入口的事实写入绕过；云端空数组保持真实空状态，批量部分失败只把实际保存项计入已拥有。（commits: `8d272aa`, `9accb48`）
- 已完成：云端父物种、批次和幂等结果由 `add_aquarium_livestock` 在同一 PostgreSQL 事务提交；真实 PostgreSQL 16 失败注入证明批次失败后三类记录均为 0，重试和重放最终各保留 1 条。RPC 业务错误分别映射为 404/409，未知故障安全降级为 503。（commits: `f97e6ca`, `3af5c61`）
- 当前阶段：主线程 lint、API 类型、生产构建、领域测试和生产预览 Chromium 闭环均已通过；独立 Critic 与独立 Evaluator 均对照原始计划给出六维 PASS。
- 禁止重踩：不得用入缸日期补换水日期；不得让 `not_recommended` 或 `insufficient_data` 阻止记录现实事实；规划阶段不得静默写入真实鱼缸。
- 验证：`lint`、`check:api`、`build`、`test:compatibility`、`test:aquarium-creation-semantics`、`test:addition-intents`、`test:livestock-recording`、`test:repository-boundary`、`test:species-batches`、`test:business-api-contract`、`test:atomic-livestock-addition`、`test:livestock-addition-api-errors`、真实 PostgreSQL 失败注入、`test:aquarium-factual-flow` 与首页 C 浏览器专项通过。
- 剩余边界：旧版本已经保存的默认组合不自动删除；真实 Supabase 项目尚未执行本轮创建/批次幂等验收。

## 2026-07-29 首页、体态与生命纪念修复交接

- 当前结果：功能实现、主线程回归、同一 Critic 修复后复验和独立 Evaluator 最终裁决均 PASS。
- 审查修复：纪念记录状态区分“已记录但原因待补充”和“尚未记录”；原生确认已替换为项目内确认框，并新增在路由器启动前注册的历史导航守卫，浏览器返回会恢复当前详情并保留草稿，确认放弃后才离开。英文今日推荐只使用本地化名称与受控英文摘要；体态观察进入巡检时直显对应观察重点。旧七参数纪念 RPC 重载已在 migration 中显式删除。（commit: `df1532b`）
- 审查修复验证：`lint`、`build`、`check:api`、`test:collection-hub-ui`、`test:aquarium-home-c`、`test:care-categories`、`test:care-guidance` 与 `test-species-batches.ts` 全部通过；构建只保留既有大块警告。
- 已完成：生命纪念结构化字段已贯通数据库 migration、共享契约、API、Repository 和本地服务；专项验证覆盖新增与编辑、版本递增和变更事件。（commit: `b79793f`）
- 设计基线：`docs/02-design/MEMORIAL_DETAIL_CONCEPTS.md` 收录 A/B/C 三套方案，正式采用 A「纪念档案」；B 依赖连续过程数据，C 的手机首屏过长，暂不实施。
- 兼容边界：旧纪念记录无需迁移即可读取；新字段均可空。生命纪念原因只来自用户复盘，不允许 AI 推断或自动写入。
- 首页已完成：删除进阶水质检测和生物预览数字占位，补今日推荐 `N / 10`；同日刷新、按钮真实命中、320–1440px 紧凑布局已通过真实浏览器回归。（commit: `8ecfb58`）
- 体态已完成：嵌套大弹窗改为缸内物种同一任务表面；阶段用图标卡、繁殖状态用胶囊，保留拆分、合并、删除、保存摘要和未保存退出保护。（commit: `fd5776d`）
- 规则边界：体态只补充今日巡检或在巡检后生成观察任务；生产/繁殖为重点观察。专项门禁确认体态不进入健康评分，混养引擎未增加任何体态输入。
- 生命纪念已完成：`/collection/memorial/:recordId` 使用 A「纪念档案」独立页面；旧 `?item=` 自动替换跳转，缺原因旧记录提供“补充复盘”，编辑经 Repository 保存，刷新可恢复；列表返回、浏览器返回和“再次加入”均进入真实目标。（commit: `2728359`）
- 验证：`lint`、`build`、`test:collection-hub-ui`；浏览器覆盖水族册首页直达、旧深链、补录、保存、刷新、返回、窄桌面和手机无横向溢出。
- 设置页已完成：删除渐变头图，900px 以上改为 210px 分类栏与内容工作区；语言为单行选择，分享记录为状态行，反馈保持错误恢复和离开保护；手机为紧凑单列。（commit: `e20adc9`）
- 设置验证：`lint`、`build`、`test:settings-feedback`；覆盖 1280px 双栏、390px 手机、600px 英文桌面、提交成功/失败、字段聚焦与未保存导航确认。
- 养护分类已完成：使用稳定 `CareCategoryId`，确定性匹配读取未翻译基准字段；中英文点击同一分类返回完全相同文章 ID，“新鱼入缸”至少包含过水指南和直接入缸安全文章。（commit: `054916e`）
- 养护验证：`test:care-categories`、`test:care-categories-ui`、`test:care-guidance`、`test:care-guide-types`、`lint`、`build`；分类只筛选列表，明确点击文章才打开详情，关闭后分类结果不丢失。
- 审查结论：Critic 六维 PASS；Evaluator 确认首页推荐、体态观察、生命纪念、桌面设置、双语养护分类与 AI 边界六项路径均闭环。
- 外部门禁：真实 Supabase migration/RLS/RPC 并发、配置视觉模型后的照片准确率，以及真实手机/水族新手可用性仍需外部环境验证。

## 2026-07-29 鱼缸 PNG 导出与百日记录交接

- 当前结果：六类下载均使用独立固定 1080px 模板，不直接截取响应式页面；健康评分、诊断、本周计划、新手清单、鱼缸档案和百日纪念均可预览后保存 PNG。
- 隐私边界：诊断导出只读取结构化风险、动作、原因、禁止动作与复查时间，不写自由描述和 AI 原始回复；所有卡片明确“来自用户记录，并非智能设备实时检测”。
- 日期边界：新建鱼缸当天即确认；旧鱼缸从换水和最早生物入缸记录推算，用户在缸内物种/档案表面确认后才解锁 100 天纪念。
- 验证：`lint`、API check、build、`test:aquarium-artifacts`；390px 健康卡预览和 1280px 页面无运行错误。
- 下一步：实现七天脱敏报告的后端令牌哈希、公开读取、设置页撤销管理及公共报告下载。

## 2026-07-29 七天脱敏分享 API 交接

- 创建：`POST /api/v1/aquariums/:id/share-reports` 要求登录和幂等键；服务端覆盖生成/失效时间，令牌由服务端密钥和幂等上下文派生，数据库仅保存 SHA-256。
- 管理：`GET /api/v1/share-reports` 只列出本人记录；`DELETE /api/v1/share-reports/:id` 只做撤销，不暴露原令牌。
- 公开：`GET /api/v1/public/share-reports/:token` 通过 service role 按哈希读取，失效、撤销和无效令牌均不返回快照。
- 隐私：Zod 白名单会剥离 owner、鱼缸自定义名称、内部 ID、自由描述和 AI 原文；专项 `test:share-report-contract` 已通过。
- 外部门禁：真实 Supabase migration、双账号 RLS 和过期/撤销接口仍需测试项目验证。

## 2026-07-29 脱敏分享前端交接

- 档案入口：缸内物种/档案标题区提供“生成分享报告”；创建成功显示一次原始链接和复制操作。
- 公共页面：`/report/:token` 使用独立无私人导航布局，只展示白名单快照，并可下载同内容 PNG。
- 设置管理：`/settings#shared-reports` 显示有效期、过期与撤销状态；有效链接可撤销。数据库只保存哈希，因此页面刷新后不会伪造“再次复制”能力。
- 验证：导出模型和隐私契约专项、390/1280px 公共报告浏览器回归、lint、API check 与生产 build。

## 2026-07-29 独立安全审查修复

- Critic 阻塞：旧 UPDATE RLS 允许 owner 绕过 API 改到期时间、恢复撤销或替换快照。
- 修复：新增 migration 删除 owner UPDATE policy；撤销由 Express 验证 JWT owner 后用 service role 仅写 `revoked_at`。公开接口成功/错误均 `no-store`。
- 交互：撤销链接现在必须经过居中确认，明确“立即失效且无法恢复”，提交期间防重复。
- 导出：克隆到离屏 1080px 模板并使用 foreign-object 渲染，避免 Tailwind `oklch` 让 html2canvas 报错；真下载尺寸 `1080×651`。
- 仍需：真实 Supabase 执行 migration、用户 JWT 直接 PATCH 拒绝、双账号、撤销/过期生命周期和恢复攻击验证。

## 2026-07-29 全局交互显性化与折叠治理交接

- 当前结果：物种喂养与环境摘要、今日行动、紧急依据、单条养护计划和手机管理/学习模块均直接显示；只允许次级证据、进阶数据、超长列表剩余项和备选方案折叠。
- 自查范围：环境问题以鱼缸为中心；单种以用户选择物种为中心；多种显示“所选 N 种生物”并排除未选择对象。八类问题使用各自的立即动作、禁止动作和复查项。
- 首页：今日推荐在 320–430px 保持图片与摘要双列，卡片不超过 200px；手机管理区保持六个真实操作直显并压缩卡片高度。
- 控件：共享详情右上角关闭；正式路由可见图标按钮均由浏览器门禁验证至少 44×44px。
- 任务保护：每日检查填写后、以及结果生成但尚未保存时，退出、Esc 和遮罩都会进入同一确认；继续保留答案与结果，只有保存成功后才能直接退出。
- 提交：`d06f7df`、`35927a8`、`c908fce`、`b1da90c`、`b29e902`、`9faecad`、`4c47b81`、`aa419de`、`781a4f8`、`dbc83a8`、`392e829`。
- 验证：`lint`、`build`、`test:disclosures`、视觉结果、按钮审计、首页 C、任务动作闭环、四类养护、物种详情及 7 配置 × 17 路由响应式扫描通过。
- 审查状态：首轮 Critic 问题和 Evaluator 的“生成结果未保存可直接退出”阻塞均已修复；同线程 Critic 与独立 Evaluator 最终 PASS。

## 2026-07-28 水族册具体内容直达交接

- 当前结果：`/collection` 的模块标题进入完整列表，预览条目进入 `/collection/<module>?item=<id>` 并自动打开物种、养护、纪念详情或定位勋章；存在未展示内容时才显示“更多 N 项”。
- 排序口径：种草使用现有收藏插入顺序倒序，养护使用 `favoritedAt`，生命纪念使用记录日期；查看内容不修改顺序。勋章没有解锁时间，不声称“最近”，固定展示已解锁优先项与最接近完成项。
- 兼容处理：旧收藏不增加伪时间；无效或已经移除的 ID 会显示错误、清除 `item` 并停留在模块页。
- 提交：`e58b438`。
- 验证：`lint`、`build`、`test:collection`、`test:collection-hub-ui`；真实 Chromium 覆盖 1440/600/390px、四类深链、关闭清参、浏览器返回和无效 ID。

## 2026-07-28 物种详情一屏名片交接

- 当前结果：首屏集中展示物种大图、身份、当前鱼缸结论、三条关键原因和唯一主操作；适配依据、混养关系、养护要点改为原位折叠区。
- 行为保持：收藏、分享、完整混养、加入鱼缸、设置定位和生命纪念继续调用原有动作；关闭后仍恢复来源上下文。
- 安全修正：没有可比较物种时，混养视觉状态为资料不足，不再默认显示绿色兼容。
- 首轮审查修复：390px 首屏原因不再被固定按钮遮挡；异常指标可精准进入对应设置；风险状态不再显示两个同目标按钮；旧禁用详情已删除。
- 验证：`lint`、`build`、状态化物种详情 Chromium；390px 手机和 1280px 桌面截图无页面错误、横向溢出或底部主操作遮挡。
- 独立验收：同一 Critic 复验六维 PASS；Evaluator 对照原始筛选滚动与一屏详情路径最终 PASS。iOS Safari 弹性滚动尚无真机证据，标准滚动链已通过 Chromium 实际滚轮验证。

## 2026-07-28 图鉴筛选滚动边界交接

- 当前结果：原位筛选仍在工具栏下展开，但内部到达滚动边界后不会继续带动下方物种列表。
- 实现边界：只增加嵌套滚动隔离，不锁 `body`、不增加遮罩、不改筛选草稿和应用逻辑。
- 验证：`lint`、`build`、`SEARCH_UI_GROUP=atlas` Chromium 专项通过。
- 下一步：按用户选择的“一屏物种名片”重构详情，删除首屏与适配页签的重复结论。

## 2026-07-28 水族册首页内容预览交接

- 当前结果：`/collection` 四格直接预览现有种草、养护收藏、生命纪念和成就数据，不再只有标题、说明、数字和大面积空白。
- 交互边界：每格整体是唯一入口，进入四个既有独立地址；内部预览不建立第二套详情动作；“今日种草”继续归属鱼缸首页。
- 提交：`c8172f4`。
- 验证：`lint`、`build`、水族册成就规则、`verify-collection-hub-previews.mjs`；1440px 双列、600px 桌面单列、390px 手机单列、四路由和无横向溢出均通过。
- 已知边界：种草收藏目前没有收藏时间字段，首页按现有收藏 ID 顺序显示前三项，不能宣称“最近收藏”；真实用户数据超过预览上限时只显示总数和查看全部。

## 2026-07-28 搜索联想与原位筛选交接

- 当前目标：物种搜索先确认具体候选，再由用户主动打开详情；养护和相关概念不得抢占物种前排。
- 已完成：共享确定性索引、五个入口接入、键盘列表框、已选物种摘要、图鉴四组原位筛选与独立清除标签。
- 提交：`c740dc7`、`5343d80`、`a1bca37`；最后一项补齐侧栏建议加载和失败的可见反馈。
- 验证：搜索排序脚本、`lint`、`build`；`SEARCH_UI_GROUP=atlas|mobile|care|entries|identify` 五组浏览器场景分别通过，最新侧栏回归在 `127.0.0.1:4178` 复跑通过。
- 已知边界：第一版不支持拼音；未审核英文物种名若只是学名会回退中文原名以避免相似变种同名；当前 macOS 环境连续创建过多 Chromium 页面会提前退出，因此浏览器回归按组隔离。
- 下一步：真实用户验证单字高重复词的候选可辨识度；如需拼音，先确认词库体积和排序策略。

## 项目一句话说明

- 项目解决什么问题：帮助水族新手管理鱼缸、选择物种、判断混养并完成养护补救。
- 目标用户：刚开始养鱼或缺少系统养护经验的用户。
- 当前阶段：首页 C、缸内物种安全移出、风险向导、pH 非阻断、侧栏切缸、重命名和设置反馈均已完成；Critic 六维复验与 Evaluator 用户路径裁决均 PASS，本地预览可交付。

## 2026-08-01 结构化纪念原因与反馈邮件契约交接

- 用户已确认：纪念原因采用多选预制标签 + 不确定 + 其他；反馈采用数据库先保存、服务端邮件直送；下载采用统一中心 + 上下文入口；今日推荐保留首页但必须进入正式物种深链。
- 契约：`causeCodes` 最多五项，`unknown` 单独选择，旧 `reason` 继续兼容；反馈记录新增邮件投递状态、服务商 ID、错误和发送时间。
- 数据库：`202608010001_memorial_causes_feedback_email.sql` 扩展纪念表、反馈表及原子纪念 RPC；真实 Supabase 尚未执行。
- 验证：`lint`、API check、业务 API 契约、三层契约、`git diff --check` 通过。

## 当前目标与成功标准

- 当前实施：全局交互显性化与折叠治理已完成；下一步仅保留真实用户对手机页面长度、多物种范围理解度和 iOS Safari 真机的外部验证。
- 自查范围约束：环境问题以鱼缸为对象；只有用户明确选择单种时才以该物种为视觉焦点，多种模式只消费选中的物种。范围仅存在当前会话，不新增持久化字段。
- 首页约束：手机管理和学习区不允许整区折叠；今日行动只显示行动、原因、主操作，只有紧急状态增加安全依据；养护计划只有“其余 N 项”可折叠；禁止动作必须直显。
- 自动门禁：`npm run test:disclosures` 同时扫描 `<details>` 和状态型 `aria-expanded` 折叠；`verify-responsive-route-scan.mjs` 额外阻止图标按钮小于 44×44px。

- 当前目标：任务动作与养护评测闭环已经通过 Critic 与 Evaluator，当前只剩文档和证据归档收口。
- 成功标准：所有正式任务入口消费 `task-routes`；四种养护详情具有不同任务语义；评测、操作、清单、提醒、收藏和换水都产生可观察且可恢复的业务结果。
- 当前证据：生产构建通过；`test:care-guide-types`、`test:task-actions-ui`、`test:mobile-care-ui`、`test:three-step-ui`、`test:localization-ui`、`test:responsive-routes`、任务路由和按钮审计通过。Critic 首轮 6 个阻塞项和 Evaluator 发现的 2 个目标级问题均已修复并同线程复验 PASS。

- 当前目标：完成首页 C 方案的独立审查、复验和文档收口；阿里云百炼视觉模型配置等待用户通知。
- 本轮范围：只重排鱼缸首页、压缩新手起步、提供新手可确认的鱼缸基础摘要并补充本功能中英文词条；不改业务数据和 AI 配置。
- 当前目标：完成首页 C 的缸内物种弹窗与安全移出、具体风险步骤、侧栏切缸、鱼缸重命名、设置反馈和 pH 非阻断判断。
- 明确不做：不处理英文国际化，不接入或测试阿里云百炼，不新增鱼缸 pH 数值字段，不恢复重复“下一步行动”，不宣称全站翻译完成。
- 成功标准与验证方式：三段任务层级清晰；现有鱼缸、行动、计划、物种、常用操作、推荐与基础信息均可达；390px 手机和 600–1440px 英文桌面无横向溢出；进阶水质默认折叠。

## 正在做什么

- 当前步骤：全局响应式与物种详情 A 已完成；独立 Critic 首轮发现的英文指标、来源页 CTA、已拥有物种动作、重复主操作和 pH 优先级问题已关闭，手机首屏 CTA 回归已关闭。Evaluator 两轮复验进一步把 `unsuitable/conflictRisk` 的“不建议”动作统一为“查看风险与替代建议”，并用银龙鱼与极火虾真实捕食组合验证阻断。Critic 与 Evaluator 最终均 PASS。
- 已开始但未完成的工作：真实 Supabase migration/RLS、登录偏好同步和真实视觉准确率依赖外部环境；Antigravity 全局翻译暂停。
- 涉及文件/模块：`src/App.tsx`、`src/pages/{Search,Settings,Welcome,Aquarium}.tsx`、`src/services/onboarding/`、`src/services/aquarium/species-batches.service.ts`、`apps/api/src/routes/{aquariums,profile}.ts`、`supabase/migrations/202607220001_livestock_batches.sql`。
- 工作区未提交状态及归属：实现提交已拆分；审查前需以 `git status --short` 再确认工作区。

## 已完成

| 日期 | 完成事项 | 证据（commit / 测试 / 文档） |
|---|---|---|
| 2026-07-28 | 首页按最终 C 方案完成真实层级重排：侧栏统一鱼缸切换/新建/紧凑引导，正文观察双栏、管理学习并排、进阶检测横跨底部；修复新建深链接伪操作 | commit `eb0fe80`；lint/build；`scripts/verify-aquarium-home-c.mjs` 覆盖 1440/1000/600px 桌面与 320–430px 真手机 |
| 2026-07-27 | 手机物种详情恢复唯一吸底主操作，并补齐六状态及 Manage/Learn 深链接回归 | commit `440376d`；生产预览 species-detail/home-C/core；Critic 六维 PASS |
| 2026-07-27 | 修复物种详情英文指标、来源页无效 CTA、已拥有物种错跳、重复主操作与 pH 低优先级提示 | commit `2c80073`；species-detail/home-C/core/compatibility；生产预览；7×17 响应式扫描 |
| 2026-07-27 | 修复养护详情及正式用户页面的国际化作用域、条件表达式和 TypeScript 基线 | commit `1823b88`；lint/API check/build；中英文 390px 养护详情直达无 pageerror |
| 2026-07-27 | 1024px 以下图标侧栏、手机第 2/3 模块折叠与英文短底栏 | commit `d326dc2`；lint/build；600–1280px 桌面与 390px 英文手机真实 Chrome 边界审计 |
| 2026-07-27 | 单物种详情采用 A「图像结论」并修复手机弹层宽度与英文页签溢出 | commit `59168b7`；lint/build；visual-results/compatibility；390/600/1280px 真实 Chrome |
| 2026-07-27 | 全路由响应式与双语回归收口 | commit `79ba243`；7×17 路由扫描；localization/mobile-care/core/home-C/product-actions 全部通过 |
| 2026-07-15 | 建立本项目交接入口并记录本轮范围 | 本文档 |
| 2026-07-15 | 今日行动、水族册四路由、侧栏二级导航与生命纪念安全回流 | commit `917b80a`；lint/build；1280/390px 浏览器回归 |
| 2026-07-15 | 路由/数据/图片局部恢复、1080 张响应式 WebP 与慢网 3D 策略 | commit `b38508c`；生产故障注入；手机首屏传输量与 2G 回归 |
| 2026-07-15 | 每日巡检、养护自查和添加生物压缩为两屏任务；登记 12 条正式三步路径 | commit `a52181e`；lint/build；静态与浏览器三步验收 |
| 2026-07-15 | 全量规则、数据、AI、布局、图片、桌面与手机浏览器回归 | 全部专项通过；36 个 Markdown 链接检查通过 |
| 2026-07-15 | 快捷收藏、内嵌计划、唯一物种入口、自动聚焦与 AI 入口收敛 | commit `5f84ff1`；lint/build；收藏/手机养护/核心浏览器回归；混养、收藏、状态、AI、布局、三步与素材专项通过 |
| 2026-07-15 | 18 张素材人工复核与外部证据采集协议 | commit `cf5bea2`；`manual_rework_review_2026-07-15.md`；`EXTERNAL_VALIDATION_PROTOCOL.md` |
| 2026-07-16 | 三层数据契约、20 张表、RLS、Storage、幂等记录与共享类型 | commit `3e644a3`；`npm run lint`；`test-three-tier-contract` |
| 2026-07-16 | API workspace、共享 contracts/domain-rules、版本化健康与内容只读接口 | commit `82e5653`；API check/boundary；Web build |
| 2026-07-16 | 用户业务 API 与游客/登录 Repository 边界 | commit `e7ee912`；业务 API、Repository、lint/build 回归 |
| 2026-07-16 | 管理内容 CRUD、发布下线、图片衍生上传和私有原图隔离 | commit `fb2a6fd`；管理员契约/API 边界；API/Web 类型检查与 build |
| 2026-07-16 | 486 物种、41 文章、2,026 素材的 dry-run 优先批量导入工具 | commit `834db83`；lint/API check/build；本地内容和素材预检 |
| 2026-07-16 | 独立管理员内容后台页面与前端管理服务 | commit `b5face3`；390/1280px 浏览器验收；按钮审计；lint/API check/build |
| 2026-07-16 | 中英文语言契约、设置入口、内容回退和手机养护轮播宽度修复 | commits `d542fd0`, `3619e05`；lint/API check/build；24 表契约；用户/偏好/管理员 API 边界；双语桌面/手机与养护浏览器回归 |
| 2026-07-16 | 混养、物种适配、巡检与养护自查结果可视化 | commit `ec36e6b`；lint/build；可视化、混养、Mini、巡检专项；核心与三步浏览器回归；390/1200px 无溢出截图检查 |
| 2026-07-17 | 部署标准 i18next 数据翻译层，精译 12 个核心物种并实现中英无缝秒切 | commit `7d952a8` 前后修改；`test:localization-ui` 通过；新增 `localizeData.ts` 翻译层，打通全量 450 物种 Fallback |
| 2026-07-18 | 固定物种识别、动态追问和匿名未命中数据契约 | commit `2ec147d`；lint、API check、diff check |
| 2026-07-18 | 实现视觉识别、匿名未命中与确定性动态追问 API/规则 | commit `9da053a`；lint、API check；规则专项场景 |
| 2026-07-18 | 实现 `/identify`、图鉴入口、双语动态追问与可视化结果 | commit `1e96d31`；lint/API check/build；真实手机与 600–1440px 浏览器主流程；400/413/降级/紧急 API 实测 |
| 2026-07-18 | 完成独立 Critic 审查、三轮修复与同线程静态复验 | commits `802e655`, `cdeec7f`, `c9fa49a`；上下文、类别、死亡红旗、信息增益、并发、全局导航、环境节点和原因详情通过；最新 history 浏览器运行待补 |
| 2026-07-18 | 清除旧鱼类关键词追问并完成 Evaluator 最终复验 | commit `f1c535e`；鱼类异常入口统一进入 `/identify`；lint/API check/build、diff check 与 14 场景通过；Evaluator 判定为可交付本地预览 |
| 2026-07-22 | 任务式搜索/设置/识别路由和首次引导 | commits `551f34a`–`b19280e`；浏览器验证建缸任务、搜索、识别和设置直达 |
| 2026-07-22 | 体态批次契约、API、游客 UI 与登录 Repository | commits `5c3032d`, `e079432`, `e0c91ca`, `5dc311c`, `70b22cd`；批次/混养/API/Repository 测试 |
| 2026-07-22 | 引导偏好同步、旧设置浮层清理和双语浏览器回归 | commits `315e0d9`, `22a3876`, `6f49f80`；390px 手机与 600px 英文桌面通过 |
| 2026-07-22 | 修复批次/纪念云端一致性、迁移门禁、未保存导航与本地快照覆盖 | commits `67ecc0d`–`79ebd56`；lint/API check/build；Repository/API/批次专项；真实 Chromium guided navigation 通过 |
| 2026-07-22 | 首页改为 C「观察—管理—学习与养护」引导式工作台 | commit `d3c396a`；lint/build；国际化回归；1440/1000/600px 桌面与真实 iPhone 首页专项通过 |
| 2026-07-26 | 缸内物种预览与安全移出、具体风险向导和 pH 非阻断判断 | commits `8204664`, `4174cda`；批次/Repository/兼容性专项、build、320–1440px Playwright |
| 2026-07-26 | 桌面侧栏切缸与鱼缸行内重命名 | commit `26258bf`；build；真实 Chromium 深链接、保存和跨区域同步 |
| 2026-07-26 | 设置意见反馈与 Express/API 管理闭环 | commit `5e38185`；API check、业务契约、build、390/1280px Playwright、真实 400/503 |
| 2026-07-26 | 修复侧栏在云端模式读取旧游客鱼缸 | commit `5535a02`；build；首页 Playwright 复跑 |
| 2026-07-26 | 云端数量移出改为数据库原子事务并四层限制正整数 | commit `b3d8d01`；API check、业务契约、批次、build、浏览器回归 |
| 2026-07-26 | 删除第二套 pH 阻断并修复导航订阅清理类型 | commit `5dc8900`；14 项兼容规则、build、首页 Playwright |
| 2026-07-26 | 反馈限流有界化、代理感知与未提交草稿保护 | commit `2544ef6`；限流单测、API check、390/1280px Playwright |
| 2026-07-26 | 移出失败重试复用稳定操作号，最后批次重放不被软删除父记录拦截 | commit `d681ecd`；重放专项、业务契约、API check、build、首页 Playwright |
| 2026-07-26 | 精准注入最终移出写入故障并验证同草稿重试只完成一次 | commit `5f3084c`；最新首页 C Playwright；Critic PASS；Evaluator PASS |

## 当前卡点

- 未完成翻译曾造成的 `isEn / i18n` 类型与运行基线已在 `1823b88` 清除；正文翻译质量与未审核英文内容仍属于后续内容审核，不再阻断 lint/build。
- 本轮本地实现、专项回归、Critic 与 Evaluator 均完成；仅云端生产发布受真实 Supabase 验证门禁约束。

| 卡点 | 已尝试 | 为什么仍未解决 | 解除条件 |
|---|---|---|---|
| 真实低端设备 3D 基线缺失 | 已有桌面构建体积与限帧证据 | 当前环境不能代表低端真机 | 后续用真机采集五分钟帧率和 GPU 内存 |
| 两张物种源图确实损坏 | 已复核 18 张候选，确认莫斯墙碎片化、公子小丑身体断裂 | 需要重新生成候选并人工确认，不能自动覆盖线上素材 | 新候选通过透明边缘、语义和 2D/3D 一致性验收 |
| 真实新手可用性数据缺失 | 已建立固定六任务协议 | 当前没有真实参与者 | 完成至少一轮可追溯原始记录 |
| 真实视觉模型尚未配置 | 识别 API 已完成内存预处理、独立配置和安全降级 | 当前只能验证手动搜索确认路径，不能验证真实识别准确率 | 配置 `VISION_API_KEY / VISION_BASE_URL / VISION_MODEL` 并使用真实照片校准集 |
| 阿里云百炼视觉服务待用户开通 | 已明确本轮不写入密钥、不修改视觉配置 | 缺少用户侧已开通的服务、Base URL、模型名和本机 Secret | 用户完成开通并在本机 `.env.local` 配置后通知继续 |
| 数据库 migration 尚未真实执行 | 已完成静态契约、路由与重放顺序专项，并尝试隔离 Docker PostgreSQL | Docker daemon 从官方 registry 拉取 PostgreSQL 镜像连续 EOF；未提供测试 Supabase 凭据 | 配置测试 Supabase 项目或恢复 registry 后执行最后批次真实重放、RLS 与回滚验证 |


## 下一步计划

1. 获得测试 Supabase 后执行 migration、RLS 双账号、并发扣减、最后批次重放、事务回滚和反馈写入。
2. 真实数据库门禁通过后再评估登录云端生产发布；当前本地预览无需继续等待。

1. 在测试 Supabase 项目执行 5 个批次 migration、RLS 双账号隔离、父级数量触发器、原子合并/纪念重放和引导偏好同步。
2. 继续全站翻译前先审计 Antigravity 已提交范围，避免覆盖或重复翻译；当前只保证本功能新增文案双语。
3. 组织真实手机与水族新手完成建缸、浏览物种和管理体态的外部可用性测试。

## 关键决策与理由

| 决策 | 理由 | 影响范围 | 日期 |
|---|---|---|---|
| 今日行动只显示一个任务和一个主操作 | 用户需要知道今天先做什么，而不是阅读鱼缸报告 | 鱼缸首页、AI 解释入口 | 2026-07-15 |
| 水族册采用首页加四个独立地址 | 支持侧栏直达、刷新和复制链接 | 路由、侧栏、手机入口 | 2026-07-15 |
| 错误诊断只保留当前会话 | 避免新增持久化用户数据 | 错误边界、诊断复制 | 2026-07-15 |
| 卡片快捷收藏与详情动作分离 | 缩短收藏路径并避免误开详情 | 图鉴卡、品类变种、水族册同步 | 2026-07-15 |
| 鱼缸只保留一个正式缸内物种入口 | 多入口指向隐藏目标会造成“点击无反应” | 鱼缸画面下展开区与程序化打开 | 2026-07-15 |
| 公开 AI 只保留建缸与异常巡检 | 正常结构化任务不需要 AI，避免入口过密 | 今日行动、风险弹窗、物种详情、每日检查 | 2026-07-15 |
| 中文主数据不被英文展示替换 | 保持规则正则和结论稳定；英文缺失时可安全回退 | 翻译表、内容 API、前端展示层 | 2026-07-16 |
| 结果页统一使用视觉结论层与折叠证据层 | 用户先识别对象、关系和下一步，需要时再读完整规则；展示层不得产生第二套结论 | 混养、Mini、物种适配、巡检、养护自查 | 2026-07-16 |
| 视觉只给候选、物种必须确认、规则决定风险 | 图片相似度与异常原因的可信度是两件事；避免误识别直接演变成误诊 | `/identify`、视觉 API、动态症状判断 | 2026-07-18 |

## 踩坑日志：绝对不要再踩

| 现象 | 根因 | 正确做法 | 防复发检查 |
|---|---|---|---|
| 风险标签很高但没有对应任务 | 状态与任务由两套派生逻辑生成 | 同一个行动选择器同时产生状态、原因和主操作 | 覆盖六级行动优先级测试 |
| 水族册内容在鱼缸页和页签里重复 | 收藏功能按来源页堆叠 | 统一进入独立模块地址 | 扫描旧展开区与查询式主入口 |
| 局部失败只能整页刷新 | 只有全局错误边界 | 核心路由独立隔离并限制自动恢复次数 | 注入 chunk/render/image/data 四类失败 |
| 收藏反馈按钮被桌面侧栏拦截 | 固定提示条处于主内容定位上下文且没有按设备壳验收 | 桌面定位避开侧栏，手机使用真实设备环境回归 | `test:wishlist-shortcut-ui` |
| 多个缸内物种入口都像没反应 | 正式目标区被旧桌面样式隐藏，各入口未复用同一展开方法 | 只保留画面下方一个入口并保证目标可见 | `test:mobile-care-ui` |
| 只缩窄浏览器就当作手机验收 | 产品按真实设备而非视口判定布局 | 手机测试必须同时使用手机 UA、触控与移动设备环境 | 布局策略与快捷收藏回归 |
| 根节点裁切后误判轮播没有溢出 | 多张 `min-width:100%` 卡片反向撑大父级，`overflow-x:hidden` 只掩盖症状 | 轮播视口设 `w-full min-w-0 max-w-full`，卡片使用 `flex:0 0 100%`，验收真实边界 | 手机养护浏览器回归 + scrollWidth 检查 |
| 用一组长段落说明规则结果 | 用户难以判断哪个生物导致风险，也看不到立即动作 | 大图突出关注对象，小图展示关系，完整证据默认折叠 | `test:visual-results` + 核心/三步浏览器回归 |

## 关键文件与入口

## 2026-09-09 当前 Species SEO 接手快照

- 当前分支：`codex/species-seo-preview-v1`；最新代码提交：`e347612f`。
- 本批已将 Species 的生活习性卡和品系卡接入统一 `seo-stagger` 进入节奏，保留静态可读与 reduced-motion 规则。
- `f232d884` 修复相关分类真实跳转：宝莲灯的“浏览灯科鱼分类”进入图鉴筛选，不再错误进入虾螺蟹公开分类。
- 已验证：`npm run lint`、`npm run build`、`git diff --check`。
- 内置浏览器已复核：Species 页面可向下滚动；本地 `assetPreview=1` 能显示宝莲灯图片和 Alt，普通访问仍按素材审核门禁显示 fallback。
- 内置浏览器已完成分类页点击极火虾并使用浏览器返回；返回后仍在原分类页，公开链接链路可用。
- 纯 Vite `127.0.0.1:3002` 复核同一路径通过；常规 `npm run dev` 会因 API 8787 已占用/tsx IPC 权限退出，不能将该启动问题误判为公开页面故障。
- 仍未完成：系统 Playwright/Chrome 启动级三档回归（macOS MachPort 权限阻断）、用户完整视觉确认、可读独立 Critic、Figma Canonical 模板。
- 未提交且必须保持隔离：`scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts`。
- 禁止重踩：不要把 build 通过写成浏览器验收通过；不要提交既有未跟踪素材/截图脚本；不要调用 Figma、解除 `noindex`、修改 `main` 或 Production。
- 直接下一步：用内置浏览器核对 Species/Category/Guide 的滚动、图片和内容覆盖，记录可复核截图/AX 证据；然后再决定是否启动一次独立 Critic。

| 用途 | 路径 |
|---|---|
| 项目进度 | `PROGRESS.md` |
| 数据契约 | `CONTRACT.md` / `src/types.ts` |
| 交互规范 | `docs/02-design/INTERACTION_SPEC.md` |
| 知识节点 | `../KNOWLEDGE_BASE/nodes/K-0004-aquaguide-core-experience.md` |

## 验证状态

- 已通过：`check:api`、生产构建、反馈限流、业务 API 契约、批次、14 项混养、Repository、按钮、布局、三层契约、首页 C 与反馈浏览器回归；全量 lint 只剩已排除的未完成英文改动基线。
- 当前预览：Web 为 `http://localhost:3001/aquarium` 与 `http://localhost:3001/settings#feedback`，API 为 `http://localhost:8787`；2026-07-26 已验证 API 200、非法反馈 400、未登录移出 401。地址依赖当前开发进程持续运行，不是永久部署地址。
- 未执行及原因：低端真机 3D 五分钟曲线、真实用户可用性和真实鱼缸人工点击需要外部设备或参与者；两张损坏源图需要生成候选后人工确认。
- 已知边界情况：构建体积与自动规则一致性不能代替真机性能或真人理解证据。
- hardcode / 待替换：图片尺寸目标为 256/768 与 480/960，来自已确认产品计划。
- 待确认实现：`sp_0357` 与 `sp_0452` 的新候选图必须经用户或指定审核人确认后才能替换。

## 接手者第一步

1. 先读：根 `PROGRESS.md`、根 `HANDOFF.md`、知识索引、本项目 `PROGRESS.md` 与本文档。
2. 再检查：`git status --short`、最近 20 条提交和当前差异。
3. 然后执行：从本文后续独立专项中选择一个继续，不重复本轮已验证功能。

## 2026-09-10 最新公开 SEO UI 补充

- 品牌首页 Hero 已接入 `sp_0001` 的已批准项目 Hero 素材，解决原先空的浅绿视觉卡；使用公开聚合返回的批准资产，不新增内容或数据契约。
- 内置浏览器实测首页可见极火虾图片、中文 Alt、品牌文案和公开入口；工程门禁已通过。
- 不要把这次首页素材接入扩展为宝莲灯批准：`sp_0432` 仍为素材待确认，普通页面继续显示 fallback。
- 当前工作树另有三份用户未提交文件：`scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts`；本次变更不得覆盖或纳入提交。

## 2026-09-10 标题层级补充

- `SeoRelatedLinks` 已移除与 H2 相同的重复眉题，保留正式标题和现有链接；公开 SEO 内容与路由不变。
- 相关工程检查通过；真实三档截图仍受浏览器环境阻塞，不能将本地固定视图当作响应式验收。
# 2026-08-01 结构化生命纪念录入交接

- 当前结果：死亡原因改为受控多选标签；“暂不确定”独占，“其他”必须补充文字，旧 `reason` 继续兼容。
- 交互：日期为今天/昨天/自选；多批次以可见卡片选择；数量和拆分使用 44px 步进器。物种详情内的纪念录入改为同一详情表面的任务层，不再创建第二个 Dialog。
- 数据：`causeCodes` 已贯通本地服务、Local/API Repository、普通纪念 API、缸内批次原子纪念 RPC 与水族册快照；“认真复盘”只接受明确原因，不接受单独“暂不确定”。
- 验证：`lint`、API check、生产 build、纪念服务与成就专项通过。下一步是反馈先入库、再由 Resend 邮件投递。

## 反馈邮件直送

- 顺序固定为数据库保存成功后再投递邮件，邮件失败不会让用户反馈丢失。
- 服务端读取 `RESEND_API_KEY / FEEDBACK_EMAIL_TO / FEEDBACK_EMAIL_FROM`；未配置时回传 `not_configured`，前端显示已保存但未送达。
- 邮件内容只包含反馈分类、页面、语言、版本、布局和用户正文；正文 HTML 转义，Resend 请求用反馈 ID 保证幂等。
- 验证：`lint`、API check、业务 API 契约、`scripts/test-feedback-email.ts`。

## 养护筛选原位化

- 删除无触发入口的旧 `FilterBottomSheet` 和分类/收藏草稿副本，避免隐藏状态造成布局与结果不一致。
- 分类区直接显示“清除全部”；结果标题仍可分别清空搜索、查看全部或清除分类。
- 真实 Chromium 覆盖中英文 390/600/1440px：无页面错误、无横向溢出，清除后恢复 41 篇。

## 今日推荐深链

- 首页推荐保留自然日 10 个队列，只替换详情入口。
- “查看物种详情”进入图鉴正式物种深链；不再维护首页第二套详情内容或操作。
- 关闭正式详情使用浏览器历史返回鱼缸首页；390/1280px 专项已通过。

## 导出与分享中心

- 地址：`/aquarium?action=exports`。六类下载集中展示；没有诊断、未确认建缸日期或未满 100 天时直接说明缺少条件。
- 设置页“分享与隐私”提供直达；健康评分、养护计划和鱼缸档案仍保留清晰的文字下载动作。
- 根因：旧 `foreignObjectRendering` 在离屏 1080px 克隆上生成全透明画布；常规 html2canvas 又会被 Tailwind `oklch` 阻断。
- 修复：记录卡使用 Canvas API 固定 1080px 直接绘制，不读取响应式页面 CSS；实际 PNG 为 1080×1000，深色像素和通道对比度门禁通过。
- 验证：导出模型、分享隐私契约、390/600/1280px 布局和真实下载像素检查。
## 当前接手快照（2026-08-31，`48c56db7`）

目标仍是完成首批30种物种的专业来源闭环；当前不修改 UI、不写生产 Supabase、不发布 Catalog、不推送远端。

已验证：30种/300字段结构、来源归属与审核分辨率门禁；85条 `supported`、215条 `reviewed + unknown`；20条来源已实际打开核对（其中5条 GBIF 仅支持身份），55个字段允许进入运行时；486种 Catalog 构建/校验、435组矩阵、Domain/Service/Presentation、lint/build 和独立 Critic 复验通过。

当前卡点：仍有来源页面未打开或未能明确支持字段。未核实引用被运行时门禁拦截，不能将“supported”统计直接当成专业事实，也不能发布 Catalog。

下一步：继续逐页核实剩余来源；每条来源必须记录可访问 URL、发布者、访问日期及明确支持的字段。无法确认就保留 `reviewed + unknown`。完成后重建 Snapshot/checksum、435组矩阵并交同一 Critic 复验，再申请一次性推送数据短分支。

禁止重踩：不要从名称、分类、模板、搜索结果或 AI 摘要推断水体、行为或数量；不要把本地测试描述为生产权限验证；不要在本阶段改 UI 或执行生产 migration。
## 2026-09-09 Species SEO 高级动效试点

- 当前分支：`codex/species-seo-preview-v1`；动效代码已本地提交 `f1057d71`，未推送。
- 本轮完成：共享 motion tokens、Species Hero/章节进入、可测量 FAQ 展开、按钮与链接反馈、reduced-motion 静态可读性，以及 `test:seo-motion`。
- 验证：`npm run lint`、`npm run build`、`npm run test:seo-evidence-bindings`、`npm run test:public-seo-contract`、`npm run test:seo-editorial-evidence`、`git diff --check` 通过；内置浏览器实测 FAQ 可展开，品系切换后的 URL、H1、图片 Alt 和当前状态一致。
- 内置浏览器追加检查：Category 与 Guide 路由均可进入并保持 Public Header；Guide 的“内容正在准备”状态没有持续动画。
- 动效扩展提交：`eb98b615`；Marketing/Category/Guide 已复用相同 motion tokens 和 PageShell 可见性机制，Guide 准备态不使用循环动画。
- 最新布局修复提交：`5071ae2c`；公开 SEO 页面覆盖全局滚动限制，环境章节改为自适应双区布局，缺图时不再显示空白大卡。
- 最新内容占位修复提交：`3832bfcf`；分类页物种卡显示已批准项目图片，统一 4:3 媒体区并提供缺图 fallback。
- 当前阻塞：Playwright 内置 Chromium 与系统 Chrome 均被 macOS MachPort 权限阻断，不能宣称本轮动效浏览器专项通过。Figma 继续暂停，独立 Critic 尚未取得可读报告。
- 未提交且明确隔离：`scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts` 的既有素材/截图改动。
- 下一步：恢复可用浏览器后重跑 `test:seo-motion` 和三档 Species 回归；随后做用户视觉确认，再启动一次可读独立 Critic。所有页面保持 `noindex,follow`。

## 2026-09-10 最新验证补充

- 纯 Vite 预览已验证 `极火虾 → 黄金米虾品系 → 浏览器返回 → 极火虾`：返回后恢复 `/species/sp_0001`，H1、图片 Alt、15–28°C Product Truth、当前品系和工具链接均正确。
- 黄金米虾页面展示基础物种共享的活动/觅食内容，未创建重复生活习性 evidence；品系差异仅保留黄色外观及自身参数。
- 当前仍缺系统 Playwright 三档截图证据、Figma Canonical、可读独立 Critic；不要将当前内置浏览器验证表述为自动化浏览器通过。
- 本轮内置浏览器已补查 Species 长页面滚动与内容覆盖；当前只能验证可用预览 viewport，不能替代 390/600/1440 的完整视觉回归。
- 最新工程验收：Evidence、Public Contract、Editorial、lint、build 通过；`test:seo-motion` 因 Playwright Chromium 启动时 `MachPortRendezvousServer: Permission denied` 失败，需恢复浏览器权限后重跑。
- 2026-09-10 追加诊断：指定系统 Chrome 可执行文件仍在 MachPort 启动阶段崩溃；Playwright WebKit 因本机缺少安装包不可用。不要继续反复启动，待浏览器环境恢复后一次性重跑三档专项。
- 2026-09-10 追加诊断：内置浏览器新标签显式传入 390px viewport 仍被固定视图忽略；该工具可做人工内容/导航验证，但不能提供三档响应式截图。
- 2026-09-10 追加诊断：Playwright WebKit 已安装但启动即 `Abort trap: 6`，与 Chromium 一样未进入页面断言；当前不能生成自动化三档截图。
- 2026-09-10 UI 修复：Species Hero 移动/平板媒体卡最小高度改为 280px，桌面仍为 470px；lint/build 已通过。待可调整 viewport 环境恢复后重点复核 390/600 构图。
- 2026-09-10 UI 修复：`SeoSectionHeading` 不再重复显示与正式标题相同的眉题，减少“它如何生活/常见问题”等视觉重复；Editorial、Public Contract、lint/build 已通过。
- 2026-09-10 浏览器诊断收口：Firefox 也在 headless 启动阶段 `SIGABRT`；Chromium/WebKit/Firefox 三个 Playwright 引擎均不可用。不要再重复安装引擎，等待系统权限或托管浏览器。

## 2026-09-10 Guide 准备态结构补充

- Guide 仍没有可公开的审核步骤；本轮只增加“阅读路径”结构预览，帮助用户理解未来内容组织，不承载生物或操作事实。
- 内置浏览器复核 `http://127.0.0.1:3000/guides/new-fish-acclimation`：Public Header、面包屑、准备卡、阅读路径和 `/care` 入口均可见，页面可滚动。
- 本轮通过 lint、公开契约、Editorial、Evidence、build 与 diff-check；系统 Playwright、Figma Canonical、独立 Critic 仍是门禁。

### 本轮后续收口

- 三个阅读路径卡片已改为不同的中文用户预期，底部状态标题改为“资料状态”；没有新增未经审核的步骤或事实。
- 重新通过 lint、公开契约、Editorial、Evidence、build 与 diff-check；内置浏览器本轮启动超时，未将其记为新的页面通过证据。

## 2026-09-10 公开流程文案收口

- Category 的公开路径说明和 Species metadata fallback 已改为用户语言，不再把“公开路径/已核对”作为用户页面表达。
- 通过公开契约、Editorial、Evidence、lint 与 diff-check；Product Truth、证据绑定、路由与 `noindex,follow` 未改变。

## 2026-09-10 宝莲灯公开行为答案收口

- 宝莲灯公开的群游描述已改为直接回答“它有群游倾向，建议至少 5 条一起活动”，不再显示审核流程措辞。
- 同一来源 ID 与 fingerprint 保持不变；这只是公开呈现层修复，不是新增生物事实。
- 公开契约、Editorial、Evidence、lint 与 diff-check 通过；浏览器三档、Figma Canonical 和独立 Critic 仍待完成。

## 2026-09-10 Marketing / Category 公开文案收口

- Marketing 的“理解饲养”卡片已改为用户视角的主题阅读说明；Marketing 与 Category 页脚改为“资料说明”，不再把后台审核流程直接呈现给用户。
- 通过 lint、公开契约、build 与 diff-check；未改变 Product Truth、Published 聚合、路由或索引策略。
- 当前仍需在可用 viewport 浏览器中复核三档布局，并完成独立 Critic 与 Figma Canonical 门禁。

## 2026-09-10 公开文案自动门禁

- 新增 `npm run test:public-seo-copy`，覆盖四个公开页面文件，阻止 Product Truth、Base Species、Publish Gate、审核流程等后台表达进入用户文案，并检查 Guide 准备态三个不同阅读预期。
- 通过公开文案、契约、Editorial、Evidence、lint 与 diff-check；用户未提交的素材/截图脚本仍未纳入。
- 下一步仍是可调整 viewport 浏览器回归、Figma Canonical 和可读独立 Critic。

## 2026-09-10 公开结构密度自动门禁

- 新增 `npm run test:public-seo-structure`，为四类公开页面检查稳定骨架，并确认 Species 的生活习性、Editorial、FAQ、品系内容仍按 Published 条件显示。
- 结构、文案、公开契约、lint 与 diff-check 通过；该检查不能替代真实 viewport 视觉验收。

## 2026-09-10 公开聚合层文案门禁补强

- 文案门禁现在同时覆盖四个公开页面组件和 `publishedSpeciesProfile.ts` 的中文公开摘要，避免后台流程词从数据聚合层泄漏。
- `test:public-seo-copy` 与 lint、diff-check 通过；原有用户未提交素材/截图脚本仍未纳入。

## 2026-09-10 Guide 状态文案最终收口

- Guide 准备卡已移除“事实审核”流程词，改为“具体步骤整理好后开放”；公开文案门禁与相关证据测试通过。
## 2026-09-10 权威来源复核

- 宝莲灯的“中层活动”和“取食蠕虫及小型甲壳类”已由 FishBase 物种摘要页直接复核；本地来源登记已统一到主域名 `fishbase.org`，不改变页面结论范围。
- 本轮只更新来源登记与证据记录，不新增行为事实、不修改 Product Truth、路由或索引策略。
- Editorial 回归现在同时保护 FishBase 主域名、`eligible` 状态和“中层活动/蠕虫及小型甲壳类”支持范围。
- UF/IFAS 与 USGS 的来源资格及其对极火虾身份、栖息与机会性取食的支持范围也已纳入 Editorial 回归；未新增未经来源支持的习性。
- 黄金米虾公开差异现在显示为“与极火虾的主要区别是黄色外观”，不再把确认流程暴露给用户；事实来源和 Base/Variant 边界不变。
- 本轮文案 fingerprint 已重算，相关回归通过；真实 viewport 验收仍待 Mac 解锁。
- `test:public-seo-copy` 现在额外阻止品系确认和待审核流程词出现在公开页面或公开聚合层。
- 该语言门禁已通过当前四类公开页面扫描，未改变事实或索引策略。
- 公开结构回归现在保护分类、品系、鱼缸工具和首页入口的目标路由；真实点击/返回仍待浏览器恢复。
- 当前静态导航契约通过；不把它称为真实浏览器点击验收。
- 仍未完成：真实三档截图、可读独立 Critic、Figma Canonical；继续保持 `noindex,follow`。
- 本轮 `cua.getState` 仍返回 Mac 锁定且无法自动解锁；未重复启动浏览器，静态公开 SEO 回归全部通过。
# 2026-09-10 最新构建复验

- 当前提交 `a4c4bcfb` 的 `npm run build` 已成功；`git diff --check` 已通过。
- 构建输出仍有既有动态/静态导入和大字体/大 chunk 警告，未在本轮扩大范围处理。
- 当前工作树仍只保留用户未提交的三份修改：`scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts`；本轮未触碰或暂存。
- 下一步：Mac 解锁后一次性完成真实浏览器三档回归；随后进行可读独立 Critic。Figma 继续暂停，页面保持 `noindex,follow`。

## 2026-09-10 动效/全路由回归复查

- `test:seo-motion` 与 `test:public-seo-routes` 均未进入页面断言阶段，Chromium 在启动时因 `MachPortRendezvous ... Permission denied` 退出。
- 静态内容、证据、结构、响应式契约和构建门禁通过；不能据此宣称动效或真实点击验收通过。
- Mac 解锁后优先执行这两个脚本，再导出三档截图；不要在当前锁定环境重复启动。

## 2026-09-10 宝莲灯图片缺失根因

- 原图 `/public/species-image-overrides/sp_0432.png` 存在，尺寸 521×316，透明鱼体可见。
- `src/data/speciesLandingPilot.ts` 中 Hero 与 `variant-card` 均为 `needs_review`，所以 `publishedSpeciesProfile.ts` 有意不返回图片，页面显示“图片暂时不可用”。
- 不能仅因文件存在就改成 `approved`；需要项目负责人分别确认两种用途，避免把未确认素材放进公开聚合。

## 2026-09-10 素材预览测试更新

- `verify-species-asset-preview.mjs` 已加入宝莲灯待审核预览，以及普通路由不暴露该图片、显示回退、保持 noindex 的断言。
- 脚本已通过 `node --check` 和 `git diff --check`；真实执行仍受 Chromium MachPort 权限阻塞。

## 2026-09-10 宝莲灯 evidence binding 补齐

- `seoEvidenceBindings.ts` 已为 `sp_0432` Hero 和 `variant-card` 登记当前文件 hash 与 snapshot fingerprint。
- 两条 binding 当前显式为 `blocked/pending-review`；不会因为文件存在就进入 Published Profile。
- `test:seo-evidence-bindings`、`lint`、`build` 和 `diff-check` 已通过。批准素材时必须同时更新用途状态、fingerprint 和确认记录。

## 2026-09-10 分类与指南公开路由复核

- 内置浏览器实际加载分类页，确认公开 Header、虾螺蟹层级和极火虾入口可读。
- 内置浏览器实际加载新鱼入缸指南，确认未审核步骤保持用户可理解的准备态，不进入公开正文或结构化内容。
- 证据记录为 EVD-20260910-139；当前视口证据不替代三档自动化、独立 Critic 或 Figma Canonical。
- 当前版本 Critic 复验曾出现空输出；随后已读取同一任务（`01a05275-2b85-76f2-9e84-98bbb04617d5`，基准 `93a7fad6`）的可读六维报告，报告结论为部分达标而非整体通过。

## 2026-09-10 独立 Critic 报告

- 同一 Critic 任务已返回可读六维报告，审查基准为 `93a7fad6`；当前 HEAD 相对该基准只有文档/证据变更，无代码变更。
- 报告确认静态结构、SEO 元数据、Shell 隔离、Base/Variant 基础逻辑和部分交互证据成立；真实多视口、失败状态、完整键盘路径、Figma Canonical 和发布门禁仍未完成。
- 该报告不能表述为“独立通过”，应按其修复清单继续推进。
- 当前 HEAD 静态公开SEO门禁和构建已复跑通过，证据为 EVD-20260910-142；不替代浏览器自动化或独立审查。
- 原生 Chrome CUA 通道返回不可用，和 Playwright MachPort 失败合并记录为浏览器环境阻塞；恢复后直接复用当前 HEAD 补跑。

## 2026-09-10 交互闭环补充

- 内置浏览器实际验证品系跳转、返回、FAQ 展开和分类页入口：黄金米虾 URL/H1/图片/Alt 正确，返回恢复极火虾，FAQ 答案可见，分类页保持 Public Shell。
- 本次证据只覆盖内置浏览器当前视口，不宣称系统 Chrome 多视口、性能、reduced-motion 或 Critic 通过。

## 2026-09-10 宝莲灯样板复核

- 重启本地 Vite 预览后，内置浏览器实际读取宝莲灯页面：环境、中层活动、群游数量和“取食蠕虫和小型甲壳类”均可见；普通路由图片仍按 pending 状态回退，robots 为 `noindex,follow`。
- 之前一次连接拒绝确认是预览进程停止造成；新建标签后复核成功。当前仍不能替代系统 Chrome 多视口与独立 Critic。
# 2026-09-10 内置浏览器真实验收结果

- Codex 内置浏览器已完成三条 Species 路径 × 390/600/1440：页面内容加载后均可滚动且无横向溢出；H1、标题层级、44px 目标、中文术语、robots 均通过。
- 真实交互已验证：章节导航滚动、FAQ 展开、黄金米虾品系 URL/H1/Alt、浏览器返回。
- 宝莲灯原图在 `assetPreview=1` 本地预览可见；普通路由图片数量为 0，符合当前 blocked binding 的回退策略。
- 首次仅等待 250ms 会读到 React 加载壳；本次以 H1 可见作为加载完成信号后再采集，避免误报。
- 仍缺系统 Chrome Playwright、reduced-motion、性能采样、可读独立 Critic 和 Figma Canonical。
## 2026-09-10 当前代码变更

- 本轮只修复本地 `assetPreview=1`：待审核物种素材现在会同时出现在 Hero 和品系卡，便于用途级人工确认。
- 普通公开访问不会显示 pending 素材；Published 聚合、审核 fingerprint、metadata、JSON-LD 和 `noindex,follow` 未改变。
- `npm run lint`、`npm run build`、`git diff --check` 通过；用户保留的三份未提交文件未修改。

## 2026-09-12 本地预览滚动与键盘复核

- 本地 Vite 预览已恢复，内置浏览器新标签成功打开 `/species/sp_0432`。
- 实际向下滚动后可见“继续探索”和“资料来源”；Tab 从公开 Header 进入面包屑、章节导航并到达“收藏”。
- 普通宝莲灯路由按 `needs_review` 显示图片回退，正文和 `noindex,follow` 正常。
- 证据：`EVD-20260912-001`。范围仅为内置浏览器当前视口，不代表系统 Chrome 多视口或最终交付通过。
- 下一步：补充可调整视口/系统浏览器证据，再按 Critic 修复清单补失败状态和完整键盘路径。
## 2026-09-12 系统 Chrome 复验阻塞

- 只执行一次 `PLAYWRIGHT_CHANNEL=chrome npm run test:species-landing`；Chrome 在页面断言前 SIGABRT 退出。
- 未生成多视口截图，不计为浏览器通过；证据为 `EVD-20260912-002`。
## 2026-09-12 静态门禁复跑结果

- 当前工作树的 Editorial、Evidence、Asset、Public Contract、Copy、Structure、Responsive Contract、lint、build 与 diff-check 全部通过，证据为 `EVD-20260912-003`。
- 系统 Chrome 已按约定只重试一次，仍在页面断言前 SIGABRT/进程权限错误；这属于环境阻塞，不是页面断言失败。
- 用户既有未提交文件仍为 `scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts`，未触碰、未暂存。
- 下一步仍是：浏览器环境恢复后补真实多视口与性能/reduced-motion证据，再针对当前版本取得可读独立Critic复验；Figma配额恢复后集中补Canonical模板。保持 `noindex,follow`。
## 2026-09-12 内置浏览器运行内容复核

- 内置浏览器新标签已成功打开并加载 `/species/sp_0001`；可读到公开 Header、面包屑、章节导航、Hero、参数、生活习性、环境、品系、FAQ、能力入口和资料来源，证据为 `EVD-20260912-004`。
- 该证据证明本地页面不是停留在加载态，但不代表系统 Chrome 的三档 viewport、reduced-motion、性能或完整失败状态门禁已通过。
## 2026-09-12 Critic 复验结果

- 既有 Critic 任务已针对当前 HEAD `32a7470b` 完成只读复验，但 turn items 为空，没有可读六维报告；记录为 `EVD-20260912-005`，不计为通过。
- 不再创建重复审查任务；系统 Chrome 多视口、Figma Canonical 和当前版本独立审查仍是门禁。继续保持 `noindex,follow`。
## 2026-09-12 公开导航链路复核

- 内置浏览器已实际点击分类页极火虾卡片、Species 页黄金米虾品系卡，并执行返回；URL、H1、图片 Alt 和公开 Header 均正确，证据为 `EVD-20260912-006`。
- 仍不能把内置浏览器当前视口证据扩写为系统 Chrome 三档或最终发布验收。
## 2026-09-12 公开页面滚动根因修复

- 公开页面在 1440px 下的真实根因是全局 `html { height:100% }` 与应用壳规则共同限制文档滚动高度；已在 `.seo-system.css` 的公开 html/body 选择器加入 `height:auto !important`，并增加响应式契约断言。
- 内置浏览器显式 390/600/1440 viewport 复验后 document scrollHeight 为 4680/4225/4038，参数带为 2/3/6 列且无溢出，证据为 `EVD-20260912-007`。
- 此修复只影响公开 SEO 文档滚动，不改变应用壳、Product Truth、路由或 `noindex,follow`。
## 2026-09-12 三物种三档真实 viewport 回归

- 内置浏览器已完成极火虾、宝莲灯、黄金米虾三条路径 × 390/600/1440 共九次加载；2/3/6 参数列、无横向溢出、单一 H1、公开 Header、中文术语和 `noindex,follow` 均通过，证据为 `EVD-20260912-008`。
- 宝莲灯环境/生活习性章节和黄金米虾基础物种继承在真实路径中可见。该证据仍不替代系统 Chrome 自动化、性能/reduced-motion、完整失败状态或独立 Critic。
## 2026-09-12 公共 SEO 多页面 viewport 回归

- 内置浏览器已完成首页、分类和未发布 Guide 的 390/600/1440 共九次真实加载；公共壳层、H1、滚动、无溢出、robots 和 JSON-LD 门禁通过，证据为 `EVD-20260912-009`。
- Guide 仍是用户可理解的准备态，不产生未审核 Article/HowTo/FAQ 数据；所有页面继续 `noindex,follow`。

## 2026-09-12 Species 稀疏内容布局修复

- 真实长截图发现桌面“它如何生活”只有两张卡却使用三列，右侧空白过大；已在 `SpeciesLanding.tsx` 使用 `seo-life-grid`，并在 `seo-system.css` 统一两列/窄屏单列规则。
- 代码提交：`822871b7 fix: tighten sparse species behavior layout`。
- 内置 Chrome 复核确认页面可滚动、生活习性卡并列、Hero/品系图片/工具入口仍可见；静态门禁通过。
- 用户文件 `scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts` 仍未触碰、未暂存。
- 未完成门禁：系统 Chrome 三档自动化、性能/reduced-motion、完整失败状态、Figma Canonical、可读独立 Critic；保持 `noindex,follow`。

## 2026-09-12 鱼类与品系页面复核

- 宝莲灯真实页面已加载：鱼类 Product Truth、环境章节、中层活动、群游和觅食内容均可见；图片因 `blocked` 用途绑定显示稳定回退，未绕过门禁。
- 黄金米虾真实页面已加载：黄色 Hero、自己的 18–28°C 参数和黄色外观差异可见，同时继承极火虾基础物种生活习性；没有新增 `sp_0030` 生活习性 evidence。
- 当前可见 UX：两列生活卡在桌面/平板更紧凑，页面可滚动；仍需补 390/600/1440 专项自动化与独立 Critic 可读报告。

## 2026-09-12 宝莲灯素材边界确认

- `http://127.0.0.1:3000/species/sp_0432?assetPreview=1` 实际显示项目内宝莲灯图片，主体和构图正常；该模式仅用于本地审核预览。
- 普通路由仍显示稳定图片回退，因为 Hero 和品系卡用途绑定当前为 `blocked`；这不是图片不存在或路由失效。
- 下一步需要项目负责人分别确认 Hero 和品系卡用途；确认前保持 fail-closed、`noindex,follow`。

## 2026-09-12 资料来源展示去重

- 公开来源列表已按展示身份去重，防止同一 AquaGuide 目录来源重复出现；不同标题、发布方或外部链接仍分别保留。
- 提交：`90a53625 fix: deduplicate public species sources`。
- 相关证据和 Product Truth 未改变；页面继续 `noindex,follow`。

## 2026-09-12 导航回归测试

- `test-public-seo-structure` 已加入公开导航边界断言：根面包屑必须是公开首页，未公开的鱼类分类不得生成应用内分类链接。
- 测试通过；该保护只约束路由目标，不改变页面内容或数据契约。

## 2026-09-12 Critic 当前状态

- 既有 Critic 任务已复验最新代码，但完成结果仍为空 `items`，没有可读六维报告；记录为 `EVD-20260912-025`，不视为通过。
- 不创建重复任务；等输出能力恢复后继续使用同一 Critic。代码、内容、图片和索引门禁不因空报告放行。

## 2026-09-12 来源区运行时复核

- 内置 Chrome 长截图确认极火虾资料区只显示一条 AquaGuide 目录记录；专业来源和品系归组来源仍可见。
- 该复核覆盖当前桌面视口，不替代完整三档自动化、性能、Figma Canonical 或独立 Critic。

## 2026-09-12 公开导航边界修复

- Species 面包屑已从应用内 `/encyclopedia` 改为公开首页；虾螺蟹使用现有公开分类链接，鱼类没有公开分类页时保留文本分类但不生成错误链接。
- 鱼类“继续探索”不再生成不存在的公开分类入口；真实 Chrome 页面确认宝莲灯可从首页面包屑继续浏览，来源、内容和 `noindex` 不变。
- 代码尚未单独提交前的变更已通过静态门禁；当前用户未提交文件仍未触碰。

## 2026-09-12 当前交接：公开缺图回退统一（待提交）

- 首页 Marketing Hero 已改用与 Category/Species 相同的 `SeoAssetFallback`，避免三个公开入口在素材不可用时出现不同的空状态。
- `test:public-seo-structure` 新增共享组件、可读图片角色和三类页面接入断言；结构、文案、响应式、证据、lint、build、diff-check 已通过。
- 本轮不批准或发布任何新素材；页面继续 `noindex,follow`。用户未提交的三个文件保持不动。

## 2026-09-12 当前交接：公开路由滚动闭环（`283cbae5`）

- Public Shell 已处理路由滚动：普通公开路径切换回到页面顶部，带 hash 的章节链接定位到目标章节。
- 内置浏览器已实际确认分类页 Header 不再继承旧滚动位置，并确认 `/species/sp_0432#behavior` 直接进入“它如何生活”；结构、lint、build、diff-check 通过，证据为 `EVD-20260912-066`。
- 未改变页面内容、素材状态、Product Truth、metadata、JSON-LD、`noindex,follow` 或用户未提交文件。

## 2026-09-12 当前交接：Species 交互回归

- 内置浏览器已确认极火虾 FAQ 展开和黄金米虾品系切换；品系页继承基础物种生活习性，不产生重复 evidence，证据为 `EVD-20260912-067`。

## 2026-09-12 当前交接：公开入口运行时回归

- 内置浏览器已复核宝莲灯、虾螺蟹分类页和新鱼入缸指南；宝莲灯内容与资料可读，分类物种卡和能力入口存在，Guide 保持用户可理解的准备态，证据为 `EVD-20260912-068`。

## 2026-09-12 当前交接：宝莲灯工具入口回归

- 内置浏览器点击宝莲灯的鱼缸比较入口后，兼容工具保留 `species=sp_0432` 和 `source=species-profile`，并显示已选宝莲灯；证据为 `EVD-20260912-069`。

## 2026-09-12 当前交接：宝莲灯工具返回回归

- 兼容工具返回按钮已真实回到宝莲灯公开页，公开内容和导航状态恢复，证据为 `EVD-20260912-070`。

## 2026-09-12 当前交接：宝莲灯公开面包屑边界

- 宝莲灯面包屑的“首页”真实可点击；“灯科鱼”当前只作为分类文字，因为尚无已批准的鱼类分类公开页，不创建伪链接，证据为 `EVD-20260912-071`。

## 2026-09-12 当前交接：静态发布门禁基线

- 当前静态门禁全套通过，证据为 `EVD-20260912-072`；这只证明代码和内容门禁稳定，不替代真实多视口、性能、Figma 或独立 Critic。

## 2026-09-12 当前交接：公开来源规范化

- 最新代码提交：`93a3edb7 fix: normalize duplicate public fishbase sources`。
- 公开展示层现在按 FishBase 规范化路径去重同一物种的 URL 变体；证据绑定、来源 ID、fingerprint 与 Product Truth 不变。
- 宝莲灯契约测试确认 FishBase 公开来源只展示一条；Editorial、Evidence、lint、build、diff-check通过。
- 用户未提交的三个文件仍保持未暂存；不涉及内容、路由、Figma、Production 或索引策略。

## 2026-09-12 当前交接：缺图回退版式

- 最新代码提交：`ea8a96a6 fix: compact missing species hero fallback`。
- 变更范围：仅收紧 `blocked` 图片对应的 Hero 回退媒体到 320px，并加入静态响应式回归断言；不改变 Product Truth、Editorial、素材审核、路由、metadata、JSON-LD 或 `noindex,follow`。
- 内置 Chrome 复核宝莲灯普通页面：回退状态清晰、页面可滚动、后续章节与资料来源可见；项目内图片仍仅在 `assetPreview=1` 显示。
- 验证：响应式契约、lint、build、diff-check 通过；系统 Chromium 仍因 macOS MachPort 权限无法启动。
- 仍阻塞：既有 Critic 完成但返回空正文；不创建重复 Critic。还缺系统 Chrome 三档、性能/reduced-motion、宝莲灯用途级批准、Figma Canonical。
- 用户未提交的 `scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts` 保持未暂存。

## 2026-09-12 运行时复核：来源区

- 内置 Chrome 打开 `/species/sp_0432` 并等待页面稳定后复核：同一 FishBase 物种来源实际只显示一条。
- 页面可滚动，公开导航、内容章节、工具入口和 `noindex` 保持正常。
- 证据：`EVD-20260912-028`；仍不能替代 390/600/1440 自动化、性能、Figma 或 Critic。

## 2026-09-12 运行时复核：虾类继承

- 内置 Chrome 复核 `/species/sp_0001` 和 `/species/sp_0001?variant=sp_0030`：极火虾已批准图片与内容正常；黄金米虾显示黄色 Hero、自身参数和黄色差异，并共享基础物种生活习性。
- 未产生 `sp_0030` 独立生活习性 evidence；页面和来源区正常，继续 `noindex,follow`。
- 证据：`EVD-20260912-029`。
## 2026-09-12 当前交接：公开 SEO 视觉一致性

- 最新代码提交：`31c8e5fc fix: unify public SEO section language`。
- Species 面包屑统一使用公开分类名称，避免把内部照料分类显示给用户；参数区统一复用共享章节标题组件。
- 首页、分类页和指南页底部状态改为用户语言，不暴露“暂不进入搜索索引”等发布流程表达；robots 仍由 metadata 服务保持 `noindex,follow`。
- 公开文案/结构/响应式/证据/素材/字体/TypeScript/build/diff-check 门禁通过；内置浏览器实际确认极火虾面包屑与“一眼了解”标题层级。
- 用户未提交的 `scripts/verify-public-seo-routes.mjs`、`scripts/verify-species-landing.mjs`、`src/data/speciesLandingPilot.ts` 仍未触碰、未暂存、未提交。
- 剩余门禁：系统 Chrome 三档、性能/reduced-motion、完整图片故障注入、宝莲灯图片用途级确认、Figma Canonical、可读独立 Critic；未全部通过前不解除 `noindex`。
## 2026-09-12 当前交接：宝莲灯素材预览

- 当前本地预览 `http://127.0.0.1:3000/species/sp_0432?assetPreview=1` 已实际显示宝莲灯项目图片，Alt 为“侧视的宝莲灯”。
- 预览同时显示鱼类参数、环境、中层活动、群游数量和觅食内容；普通路由仍显示图片回退，证明待确认素材没有泄漏到公开聚合。
- 下一步需要项目负责人分别确认 Hero 和品系卡用途的主体、清晰度、边缘完整性、构图和 Alt；未确认前保持 `blocked`、`noindex,follow`。
## 2026-09-13 当前交接：Species章节锚点

- 最新代码提交：`b54b4557 fix: align species overview chapter anchor`。
- “一眼了解”现在定位到参数带的实际章节，不再与Hero共用 `#overview`；结构、响应式、lint、build和diff-check通过，证据为 `EVD-20260913-086`。
- 尚未完成真实浏览器hash滚动复核、系统Chrome多视口、性能/reduced-motion、Figma Canonical和可读独立Critic；继续保持 `noindex,follow`。
- 用户未提交的三个文件仍未触碰、未暂存、未提交。
## 2026-09-13 当前交接：章节当前态范围补全

- 最新代码提交：`2fd4fba3 fix: track species tool and related chapters`。
- Species章节观察器新增 `tool` 和 `related`，导航当前态不再在滚动到能力区或继续探索区时停留在上一章；证据为 `EVD-20260913-087`。
- 静态结构、响应式、lint、build和diff-check通过；真实浏览器滚动后的 `aria-current` 仍待复核。
- 页面继续 `noindex,follow`；用户未提交的三个文件未触碰、未暂存、未提交。
## 2026-09-13 最新交接：能力区与继续探索锚点

- 内置浏览器已验证 `/species/sp_0001#overview` 的章节导航：点击“AquaGuide”后 URL 变为 `#tool`，目标能力区存在；再点击“继续探索”后 URL 变为 `#related`，目标区域存在，证据为 `EVD-20260913-088`。
- 该证据只证明两个锚点可达，不代表完整 `aria-current`、三档多视口、性能/reduced-motion、Figma Canonical 或可读独立 Critic 已通过。
- 下一步：补做可复核的三档浏览器回归，再启动既有只读 Critic；不创建重复 Critic，不解除 `noindex`。
## 2026-09-13 当前阻塞与已验证回归

- 系统 Playwright/Chromium 已重新尝试，但在浏览器启动阶段因 macOS `MachPortRendezvousServer: Permission denied (1100)` 退出，未进入页面断言；证据为 `EVD-20260913-089`。不再重复重启该进程。
- 当前静态公开 SEO 契约、结构、响应式、证据绑定、编辑证据、TypeScript、build 和 diff-check 全部通过，证据为 `EVD-20260913-090`。
- 下一步仍是：在浏览器环境恢复或有合规托管 Preview 后完成 390/600/1440 回归；随后只读 Critic 复验。Figma 配额恢复前不调用 Figwright。
## 2026-09-13 系统 Chrome 替代通道结果

- `PLAYWRIGHT_CHANNEL=chrome npm run test:species-landing` 已执行；显式使用 `/Applications/Google Chrome.app` 仍在启动阶段 SIGABRT，未进入页面断言，证据为 `EVD-20260913-091`。
- 该结果确认阻塞属于系统浏览器自动化环境，不是 bundled Chromium 单一版本问题。下一轮不重复启动，改用内置浏览器或托管 Preview。
## 2026-09-13 收藏边界修复与审查状态

- Critic 旧版可读报告发现：公开 Species 使用通用收藏服务，会间接读取包含鱼缸数据的 `aquarium_app_state_v1`。
- 已在 `b42d1049` 将公开页改为独立收藏服务；结构测试明确禁止公开页接回应用收藏服务或应用状态依赖，相关静态回归通过，证据为 `EVD-20260913-092`。
- 同一 Critic 对当前版本复验完成但仍返回空 `items`，不能计为独立审查通过，证据为 `EVD-20260913-093`。
## 2026-09-13 公开收藏运行时确认

- `b42d1049` 后，内置浏览器点击极火虾公开页收藏可显示“已加入收藏”，控件变为“已收藏”并保持焦点，证据为 `EVD-20260913-094`。
- 这只证明用户反馈链路正常；存储隔离仍以独立服务代码和结构门禁为依据，不扩大为系统 Chrome 或完整多视口通过。
