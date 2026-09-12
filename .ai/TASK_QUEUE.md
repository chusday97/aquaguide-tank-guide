# Task Queue

## 2026-09-12 独立审查复验

- [x] 同一只只读 Critic 已完成当前 HEAD 复验请求。
- [ ] Critic 返回空 `items`、无可读六维正文；保持审查基础设施阻塞，不创建重复线程，不解除 `noindex`。
- [ ] 下一步：继续内置浏览器可复核的用户体验检查；系统 Chrome/Figma 环境恢复后再补对应门禁。

## 2026-09-12 缺图体验收口

- [x] 缺图 Hero/品系卡显示物种名称并收紧回退高度，不改变素材审核状态或 Published 聚合。
- [ ] 继续检查三档视口与其他公开页面的空状态一致性。

## 2026-09-12 公开页面 Intro 间距

- [x] Category/Guide 使用同一 `seo-page-intro` 令牌，Guide 去除额外章节顶距。
- [ ] 继续补三档视口的视觉证据；不改变内容、图片或索引门禁。

## 2026-09-12 — Public SEO continuation

- [x] 修复 Public Species 收藏边界：公开页使用本地收藏，不读取应用 Repository；代码提交 `acfadea1`，证据 `EVD-20260912-043`。
- [x] 收口 Species `日常怎么养` 的用户文案，移除内部说明式表达（`0c3f217c`）。
- [x] 公开文案、结构、lint、build 和 diff-check 复验通过。

- [x] 记录首页、分类页、Guide 和三条 Species 路径在 390/600/1440px 的内置浏览器证据（EVD-20260912-008/009）。
- [x] 修复公开 SEO 文档滚动高度受应用壳 `html height:100%` 约束的问题（EVD-20260912-007）。
- [ ] 获取当前 SHA 的可读独立 Critic 六维复验；空输出不计为通过。
- [ ] 等待系统 Chrome 权限恢复后补一次自动化回归；不重复启动已知失败通道。
- [ ] Figma 配额恢复后集中完成 Public SEO Canonical 模板。
- [ ] 完成关键词归属、最终发布门禁和用户批准的非生产索引候选。

## 2026-09-08 — Action contract browser gate alignment

- [x] Align product-action and species-detail browser assertions with current routes, labels and safe states.
- [x] Verify authorized Chromium runs for task routes, action contract, onboarding paths, product actions, task actions, species detail, Compatibility and launch matrix.
- [ ] Independent Critic review, local commit, one push and short PR remain pending.

## 2026-08-28 safe convergence preparation (latest)

## 2026-08-30 readiness evidence center

- [x] Added SHA-bound local readiness collection, read-only dashboard server (port 4320) and evidence schema test.
- [x] Added explicit six-track statuses and fixed business-case rows; UI acceptance and production freeze cannot be hidden by backend PASS results.
- [x] Re-ran the collector in an unrestricted environment; local gates and Preview SHA evidence are bound to `3e1dca89`.
- [x] Pushed the candidate once; remote branch, PR #142, Vercel and Cloudflare Preview now point to `3e1dca89`.
- [ ] Re-read Product Golden Path once its remaining browser paths finish; keep UI acceptance and production freeze separate.

- [x] Reviewed tetra water facts and fail-closed regressions are in the canonical Catalog; checksum is recorded in the parity report.
- [x] Added `check:compatibility-authority` to guard the legacy facade boundary without changing frozen UI files.
- [x] Updated Feature Catalog and convergence ledger to record local compatibility authority as migrated/currently verified.
- [x] Prepared `docs/05-validation/SUPABASE_CATALOG_MIGRATION_AUTHORIZATION.md`; production execution remains unauthorized.
- [x] Re-ran the complete local release rehearsal: compatibility authority, Catalog, Domain/Service, core UI, formal scenes, today action, species detail, responsive routes, Supabase 26+1, pgTAP 19/19, schema lint, lint, API typecheck, build, UI freeze and project truth passed.
- [x] Same-thread Critic re-review passed and the consolidated local remediation was pushed once; local/remote/PR SHA parity is synchronized.
- [ ] Read the new Preview/CI result once; Vercel exact SHA remains an external gate and is not retried during rate limiting.

## P0 — Progress unification

- [x] 建立 `codex/unified-rc-visual-v1`，基于用户确认的视觉 SHA `37a8d4d1`。
- [x] 建立 `.ai/PROJECT_STATE.json` 作为唯一状态入口。
- [x] 审计 RC 提交并建立 `.ai/RC_MIGRATION_LEDGER.md`。
- [x] 完成 P0 数据/契约影响评审 `.ai/P0_MIGRATION_IMPACT.md`。
- [x] 用户确认 P0 迁移的类型、证据和派生服务范围。
- [x] 只迁入有产品规则、测试和受影响文件证据的 RC 业务能力。
- [x] 创建唯一 RC 目标 PR，并将本地预览、PR head 和状态入口对齐。
- [x] 新增 `npm run project:status` 与 RC 收敛 CI，防止状态入口和分支漂移；GitHub Actions run `32846848569` 已真实通过。
- [x] 对 56 个 GitHub open PR 建立登记表；#141 为唯一收敛入口，其余 55 个只作历史输入。

## Eight-phase truth consolidation

- [x] Phase 1: 建立项目、产品、UI、部署的 canonical truth 文件与总入口。
- [x] Phase 2: 将冲突/重复文档降级为历史入口或改为链接，不删除证据。
- [x] Phase 3: 将 4317 视觉基线、路由和回归证据整理为唯一 UI 验收入口；2026-08-25 自动门禁通过。
- [x] Phase 4: 将功能清单收口为“已验证 / 已部署待复验 / 未迁入 / 废弃”。
- [x] Phase 5a: 启动本地 Supabase 栈并从零重放生产 26 个 migration；七类规范化结构 hash 与生产只读基线完全一致。
- [x] Phase 5b: 本地重放第 27 个 Catalog 提案；显式 grants/RLS、不可变发布触发器、schema lint 与 19/19 pgTAP 通过；匿名/普通用户 REST 写入边界已验证。
- [ ] Phase 5c: 生产 Catalog migration、Catalog checksum parity、双身份/管理员生产语义仍需独立授权；不得把本地结果描述为生产写入已验证。
- [x] Phase 6: 固化 Git/PR 模板和 CI 门禁，阻止新的平行交付线；RC branch protection 等待 workflow 进入基分支后的管理员配置。
- [x] Phase 7: 用户已接受 P0 兼容性契约；已选择性迁入本地生命周期、审核证据、当前鱼缸/换水纯规则与派生服务，保留现有 UI。
- [ ] Phase 8: 发布就绪表已建立；本地/远端/PR/Preview exact SHA 已统一，仍等待生产 Supabase migration、Catalog parity 和单独 release acceptance。

## Release Gate

- [ ] Visual recovery is being completed on the single candidate branch; formal Encyclopedia/Care scene wiring, transparent assets and fixed-viewport parity remain to be accepted.
- [ ] Visual recovery: reconnect formal Encyclopedia/Care scene owners and rerun the fixed-viewport matrix before updating PR #142.
- [x] Keep 4317 as the frozen visual reference and use 4319 for the candidate; every preview must show branch, full SHA, seed and build time.
- [ ] 统一 RC 分支验收通过后，再单独评估是否合并 `main`。
- [ ] 视觉 AI 未配置时继续保持 `manual_confirmation` 回退语义。
- [ ] 关键节点前完成本地验证；未达到关键节点不推送远端。

## Not in Scope

- 不新增静态鱼缸。
- 不改变业务数据、混养规则、API 或 Supabase 契约。

## Protocol Maintenance

- [x] 建立八文件 `.ai/` 结构、项目协议和 Context Routing。
- [ ] 每次编码前读取 `CURRENT_GOAL.md`、`PRODUCT_CONTEXT.md`、`DECISION_LOG.md`。
- [ ] 每次变更后更新 `CHANGELOG_AI.md`、`EXECUTION_LOG.md`、`TASK_QUEUE.md`。

## 2026-09-12 Species SEO 当前任务

- [x] 修复 Species 生活习性区域的稀疏网格：桌面/平板两列，窄屏单列；提交 `822871b7`。
- [x] 真实浏览器复核宝莲灯和黄金米虾内容继承、图片回退、页面滚动和 Product Truth。
- [ ] 补齐系统 Chrome 三档证据、可读独立 Critic、Figma Canonical；继续保持 `noindex,follow`。
- [ ] Critic 最新复验仍为空输出；不创建重复任务，等待同一任务恢复可读六维报告。
- [ ] 宝莲灯 Hero 与品系卡用途级视觉确认；批准前普通公开路由继续使用回退。
- [x] 去重公开 Species 资料来源展示，保留不同专业来源和归组来源。
- [x] 收口 Species 公开面包屑与分类入口，避免公开页误跳 App Shell。

## 2026-09-12 来源区收口

- [x] 归并同一 FishBase 物种的公开 URL 变体，避免用户看到重复来源。
- [ ] 继续完成三档浏览器证据和独立 Critic 可读报告。

## 2026-09-12 虾类继承复核

- [x] 内置 Chrome 复核极火虾与黄金米虾的图片、参数、品系差异和基础物种生活习性继承。
- [ ] 继续补齐三档浏览器证据与独立 Critic 可读报告。
- [ ] Figma 配额恢复后集中完成 Canonical 模板。

## 2026-09-12 下一步

- [x] 收紧 Species 缺图 Hero 回退版式，避免普通鱼类页面出现过大空白。
- [ ] 补齐系统 Chrome 三档自动化；若环境未变化不重复启动已知 MachPort 失败通道。
- [ ] 等同一 Critic 返回可读六维正文；不创建重复审查任务。
- [ ] Figma Starter 配额恢复后集中完成 Canonical 模板。
- [ ] 在上述门禁完成前保持所有公开页面 `noindex,follow`。

## 2026-09-12 运行时来源复核

- [x] 内置 Chrome 确认宝莲灯公开资料区只显示一条 FishBase 来源。
- [ ] 继续完成三档浏览器证据和独立 Critic 可读报告。
## 2026-09-12 视觉一致性收口

- [x] 统一公开 Species 面包屑、参数标题组件和公开状态文案，提交 `31c8e5fc`。
- [x] 运行公开 SEO 静态门禁、证据/素材门禁、lint、build 和 diff-check，并在内置浏览器回读极火虾页面。
- [ ] 不把用户语言收口误认为发布完成；系统 Chrome、性能/reduced-motion、Figma Canonical 和可读独立 Critic仍是后续门禁。
## 2026-09-12 宝莲灯素材审核预览

- [x] 本地审核预览显示宝莲灯项目图片、Alt 和鱼类公开内容；证据 `EVD-20260912-051`。
- [ ] 分别确认宝莲灯 Hero 与品系卡用途；确认前普通路由继续 fallback。
## 2026-09-12 浏览器门禁复跑

- [x] 静态公开 SEO 门禁、build、lint、diff-check 已复跑通过。
- [ ] Species、全路由和 motion 脚本仍被同一 Chromium/MachPort 启动环境阻塞；不把环境失败记录为页面通过或页面缺陷。
- [ ] 等系统浏览器环境恢复后补跑；在此之前继续使用内置浏览器作为运行时辅助证据。
## 2026-09-12 章节导航运行时复核

- [x] 宝莲灯 `#behavior` 锚点真实跳转并滚动到生活习性内容，证据 `EVD-20260912-053`。
- [ ] 继续补充其他 Species 和三档视口的内置浏览器证据；不改变素材审批状态。
## 2026-09-12 黄金米虾继承边界复核

- [x] 黄金米虾品系页只显示已确认黄色差异和自身参数，生活习性沿用基础物种来源，未新增独立证据；证据 `EVD-20260912-054`。
- [ ] 继续补充三档视口和宝莲灯图片用途确认，不放行未经确认的素材。
## 2026-09-12 FAQ 交互复核

- [x] 极火虾 FAQ 可真实展开，辅助树状态和答案文本正确；证据 `EVD-20260912-055`。
- [ ] 系统 Chrome 键盘/减少动态效果证据仍待环境恢复；不因鼠标交互通过而宣称完整可访问性通过。
## 2026-09-12 Figwright连接状态

- [x] 只读 ping 确认 server/leader 均为 `0.5.0`。
- [ ] Desktop 插件仍未在线：`hop=server-only`、`plugin=null`、请求超时；不重复 Ping，不执行写入。
- [ ] 插件在线后再集中补 Canonical；在此之前 Web 轨道不等待。
## 2026-09-12 Figma文件加载状态

- [x] Figma Desktop 已启动并确认目标窗口存在。
- [ ] AquaGuide Fish Landing Page 因 `ERR_CONNECTION_CLOSED (-100)` 未加载，暂不执行 Figwright 写入；证据 `EVD-20260912-057`。
## 2026-09-12 Species摘要视觉收口

- [x] 将参数后的孤立概览摘要统一为“先记住这一点”结论卡；证据 `EVD-20260912-058`。
- [ ] 等系统 Chrome/Figma 恢复后补三档视觉截图，避免仅凭静态门禁宣称最终通过。
## 2026-09-12 结论卡运行时复核

- [x] 极火虾页面真实显示“先记住这一点”结论卡；证据 `EVD-20260912-059`。
- [ ] 等待系统 Chrome/Figma 恢复和人工图片用途确认，不把内置浏览器单页回读扩大为完整验收。
## 2026-09-12 环境章节可见性复核

- [x] 环境章节锚点滚动后标题不被 Header 遮挡，视觉卡和正文可读；证据 `EVD-20260912-060`。
- [ ] 继续等待系统 Chrome/Figma 外部门禁，不将内置浏览器抽查扩大为完整验收。
