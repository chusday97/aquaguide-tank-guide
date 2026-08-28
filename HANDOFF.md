# AquaGuide 交接文档

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
- 修复尚未提交；当前需要先完成同一 Critic 的复验，再提交并决定是否推送。生产 migration、Catalog 发布和 main 合并仍不执行。

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
