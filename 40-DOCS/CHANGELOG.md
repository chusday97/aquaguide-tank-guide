# Changelog

## [Unreleased]

- Fixed the reviewed water facts for tetra species `sp_0431` (red neon tetra) and `sp_0432` (cardinal tetra) with explicit `freshwater` values; all other unreviewed species remain `unknown` and fail closed. Added caution and missing-water regressions. The candidate/PR SHA is resolved at runtime by `npm run project:status`; the previous code head `cdd46581` has the recorded exact Preview parity, while the latest docs-only head awaits a new deployment because of Vercel rate limiting. CI status is read at runtime with `gh pr checks 142`; Catalog checksum: `545ac808b6ef5889f841fd7ab4be77bba752e222f8384e2ac1a082632492c2d3`.

- Closed the local mixed-compatibility authority gap: the shared canonical adapter now applies Domain status/policy/version and maps every current Domain rule code into legacy evidence groups; the direct legacy entry and Compatibility Service share the same adapter. Local Critic re-review passed; GitHub/Preview parity remains pending until the candidate is pushed.
- Pushed candidate `7f0d208f` so local, remote branch, and PR #142 are synchronized; the exact Preview deployment is still unverified because Vercel reports a 24-hour build-rate limit.
- Made the legacy compatibility entrypoint apply the Domain Rules decision before returning, so frozen UI callers receive the canonical status while retaining evidence-rich legacy details; added direct-entry authority regression coverage.
- Shared the Domain rule-to-evidence merge with the legacy compatibility adapter, so direct UI callers receive matching blocking, warning and missing-data evidence as well as the canonical status.
- Removed the duplicate Service-side Domain evidence map and completed shared mappings for missing candidate/tank and unknown-water rules.
- Current candidate `16b3d8d5` is synchronized locally, remotely and with PR #142; Preview parity for this latest docs-only head is `UNVERIFIED` because Vercel build quota is exhausted. Previous exact Preview parity at `55a37745` remains historical evidence.
- Recorded final GitHub/PR/Preview SHA parity for candidate `1b28bc85`; Product Golden Path validation passed. Production Catalog migration, Catalog publication and `main` merge remain pending independent authorization.

### Added

- Added the provisional UI freeze manifest and `npm run check:ui-freeze` guard so backend/domain work cannot silently change visual-owned files.
- Added `npm run capture:ui-freeze` and fixed viewport evidence for the 4317 baseline and 4319 candidate at 390/600/1280px.
- Added the read-only Supabase parity report with migration, RLS, policy, Catalog and RPC evidence.
- Added a reproducible local Supabase CLI configuration, 26+1 migration replay gate, Catalog RLS pgTAP suite, and explicit Data API grants/revokes for the proposed Catalog tables.

### Changed

- Updated project truth and release readiness to mark the current UI as frozen provisional and Supabase parity as migration-required, without executing production changes.
- Updated the Care category browser gate to use the 4319 candidate and the current desktop detail-rail surface instead of the retired 4173/centered-dialog contract.
- Moved legacy PostgreSQL fixtures out of `supabase/tests/` so `supabase test db --local` executes only transaction-isolated pgTAP tests; local 26-migration normalized hashes now match the production read-only baseline across columns, constraints, functions, indexes, policies, grants and triggers.
- Updated `check:preview-parity` to use Vercel deployment metadata as a read-only fallback when GitHub Deployments omits the provider record, preventing false `UNVERIFIED` results.
- Added the canonical `SpeciesProfile` export and explicit-water-type Fish adapter; legacy text cannot infer freshwater or saltwater values.
- Moved legacy temperature/pH parsing into the `SpeciesProfile` adapter and added nullable/invalid-range regression coverage; Domain facts no longer read Fish text directly.
- Added a single Compatibility Service entry point for application/service consumers while preserving the frozen UI; the legacy engine is now internal to that boundary.
- Changed `reviewSpeciesAdditions` to honor `record_existing` versus `planned_addition` policies and mapped Domain-only rule codes into the returned evidence groups; added the missing `check:preview-parity` npm script without changing UI files.
- Pushed the canonical candidate and recorded exact local/remote/PR/Preview SHA parity at `781c6af9`; PR #142 remains Draft pending remaining gates.
- Isolated the unrelated Vercel `admin-content` project to its dedicated branch while keeping the repository connection; regular AquaGuide branches now skip that build.
- Changed Domain adapter pair status input to use reviewed structured pair rules only; legacy aggregate status is no longer passed back into Domain.
- Changed the Compatibility Service to normalize Domain Rules status/policy/version as the service-layer authority; legacy engine output is retained only for evidence-rich explanations while the UI freeze remains active.
- Added explicit Domain checks for candidate/tank water-type conflict and reviewed predation, territorial and solitary-housing traits; unknown catalog facts fail closed as `insufficient_data`.
- Added explicit `record_existing`/`planned_addition` intent propagation through the livestock assessment path and the `test:compatibility-service` authority regression.

### Main convergence
- Updated convergence browser gates to default to the 4319 candidate preview, accept the current desktop `detail-rail` and localized “Why?” evidence disclosure, and verify mobile Sheet/desktop Rail detail behavior without silently falling back to port 3000.
- Exported the server-side Catalog decision adapter for behavior-level testing and kept the planned-addition recheck on the shared Domain Rules engine; production Supabase behavior remains an external parity gate.
- Restored the shared viewport-based layout contract; 390/600px now use the same phone surfaces regardless of user-agent, preventing the desktop rail/sidebar from reappearing in narrow previews.
- Fixed Critic findings on the current candidate: restored Aquarium Archive/Discovery learn-zone targets, normalized legacy `Freshwater`/`Saltwater` values before Domain evaluation, expanded formal scene checks to 600/1280px, and removed trailing migration blank lines.
- Updated the candidate truth to `codex/main-core-foundation-v1@94f37ba4`; separated 4317 (detached `37a8d4d1` baseline) from 4319 (candidate), captured the fixed-viewport comparison matrix, and made the formal scene gate reject branch/SHA drift.
- Restored the approved creature-first Collection hub, single immersive Aquarium stage, shared desktop detail rail/mobile bottom sheet, and transparent scene-image loading/failure behavior on the main convergence candidate.
- Restored the eight production migration history files locally, aligned memorial migration versioning, and added branch/SHA/seed/build-time metadata to the interactive preview.
- Added server-side Catalog/domain re-evaluation before planned livestock writes; stale or conflicting client confirmations now fail with explicit version/compatibility errors.
- 校正最终统一执行线：`codex/main-core-foundation-v1@5b419e98` 为唯一候选，4317 固定为 `37a8d4d1` 基线，4319 用于候选验收；记录生产 Supabase 26 个 migration、35 张 RLS 表、89 条 policy 与 Catalog/history 双向漂移，未执行生产写入。
- PR #142 最新候选 `ff2520c9` 的远端 validate 重跑通过；保留 Draft，等待 Preview SHA parity、Supabase 只读 parity 和用户人工视觉验收。
- 更新 GP-003 返回用户每日检查回归：先展开今日行动拉手再进入检查任务，并提高 CI 等待窗口；本地完整路径通过。
- GP-001 CI 浏览器门禁扩大等待窗口至 30 秒，修复 GitHub runner 上设置弹层异步加载导致的偶发不可编辑超时；本地完整建缸路径通过。
- `project:status` 现在同时允许从 canonical recovery 分支和 PR #142 release candidate 运行，并按当前分支比较远端 SHA，避免切到候选后无法核对同步状态。
- 修复正式场景深链与交互可访问性：Care 的 `#care-*` 入口自动切换 browse，Encyclopedia scene/browse 切换同步 `mode`，今日行动支持 Enter/Space 键盘展开/收起。
- 手机端今日行动 Rail 改为鱼缸舞台底部拉起层，补充 390px 几何回归，桌面右上浮层保持不遮挡主要舞台。
- 统一底层回归重新通过：添加意图、现实记录服务、API 错误语义、Mini 混养、Catalog checksum、Domain policy 与项目真相门禁均通过；仅修正了过时的文案断言。
- 将 `today_action_surface` 纳入 disclosure 契约白名单，允许今日行动按产品要求折叠，但仍保持核心任务内容在展开态直接可见。
- 将 Aquarium 今日行动改为半透明可交互拉手：点击展开、Esc 收起，支持触控/鼠标拖拽在收起/半展开/完全展开三档吸附；任务内容与 Repository 写入保持不变，并新增 `test:today-action` 门禁。
- 恢复正式 `/encyclopedia` 与 `/care` 的默认互动场景，并保留显式 `?mode=browse` 传统浏览入口；新增 `test:formal-scenes` 门禁覆盖场景点选与模式切换。
- 修正图鉴手机端 320px 分页布局，更新核心/手机回归脚本以使用显式 browse 模式和当前 Rail/成就页文案，避免旧断言掩盖真实回归。
- 修复 main 收敛候选误删用户确认视觉入口的问题：恢复 `/_preview/interactive`、互动场景组件、canonical Aquarium/Detail 样式，并保持当前 Domain/Catalog/Service/API 不变；固定视口人工验收仍待完成。
- 恢复候选分支的 `.ai/PROJECT_STATE.json`、canonical 文档路由、`project:status`、`check:project-truth` 和候选分支 CI；当前 delivery line 为 `codex/main-core-foundation-v1 → main`，Draft PR #142 已创建并由运行时状态门禁追踪，PR #141 仅保留为历史迁移证据。
- 从最新 `origin/main` 建立 `codex/main-core-foundation-v1`，按能力台账选择性迁移已验证混养规则；PR #141 继续作为历史证据，不整体合并。
- 记录当前迁移状态与门禁于 `.ai/MAIN_CONVERGENCE_LEDGER.md`。
- 增加 Catalog manifest/snapshot 契约、本地 SHA-256 校验与云端失败回退，以及当前发布版本只读 API；Supabase migration 仅作为提案保存，未执行。
- 增加纯函数 Domain compatibility authority 基础层，统一空缸/未知资料降级和现实记录与规划添加策略；旧 UI 引擎暂保留兼容适配。
- 新增现实记录/规划加入的 `intent`、Catalog 版本和混养确认字段；API 对规划加入增加阻断与资料不足错误语义，服务端重算待 Catalog 发布后接入。
- 修复规划加入缺少鱼缸时的 fail-open、已发布 Catalog 可修改和 legacy content API 对未部署 Catalog migration 的依赖，并补充契约回归。
- Main foundation candidate 已通过同线程 Critic 六维复验与格式门禁；Supabase parity、服务端重算与 release PR 仍保持未完成。
- 兼容性 UI 引擎增加 Domain Rules 适配层，统一输出 Catalog/规则元数据与添加策略；保留旧证据丰富结果作为迁移期 fallback，规划写入前服务端重算仍待完成。
- 增加 Catalog build/validate/publish 三个独立命令，校验数量、引用、重复 ID 和 SHA-256；publish 默认只生成待发布产物，不自动上传。
- 修复候选 CI 暴露的 Catalog tuple 类型错误，并为混养记录失败补齐显式错误状态、稳定文案和保存中禁用状态。
- 修复非空鱼缸从物种详情进入混养结算的 Golden Path，保留真实缸内生物，补充数量控件，并统一谨慎确认按钮文案。

### Changed
- 定义“记录已有生物”和“规划想养生物”两类添加语义；现实事实不再受混养结论阻断。
- 鱼缸资料状态改为根据真实字段派生，未记录的尺寸、温度、设备和换水信息保持未知。
- 新建鱼缸和新增缸内生物改为 Repository 命令；页面只消费保存后的返回值，云端创建使用服务端 UUID，新增批次使用稳定操作号防止重试重复。
- 图鉴物种详情、完整混养、鱼缸首页和 3D 工具区明确区分“规划想养”与“记录已有”，旧 `add-species` 深链兼容进入规划流程。
- 云端记录现实生物改为单个 PostgreSQL 事务，父物种、批次和幂等结果共同提交；响应丢失可安全重放，业务不存在与幂等冲突分别保持 404/409 语义。

### Added
- 新增现实生物记录服务，按“验证 → 保存 → 基于写入前快照评估”返回已保存事实和风险提示；评估异常不回滚现实记录。
- 新增鱼缸事实链路 Chromium 回归，覆盖真实空状态、无伪默认值、规划不写入、明确确认后记录和旧深链兼容。
- 新增原子新增生物失败注入与 API 错误语义专项，覆盖批次失败回滚、重复重放和未知依赖故障兜底。
- 新增 14 个正式路由与六类动作的 Chromium 运行时门禁，补足仅检查处理函数存在的静态按钮审计。
- 为 41 篇养护内容的 228 条立即、禁止、观察、复查与下一步动作建立稳定逐项引用；动作旁直接显示来源与审核状态。
- 新增鱼缸操作时间线，按时间倒序聚合建缸、设置、物种、体态、换水、喂食、巡检与计划完成记录，并区分旧记录整理与新操作。
- 新增应用内循环养护：喂食、换水和通用计划支持快捷周期，完成后按实际完成时间生成下一条。
- 为 41 篇养护内容增加可见来源、支持范围、审核状态和全量动作审计；6 篇专项细节明确标记待复核。
- 新增混养证据来源、物种审核画像、特殊配对规则与养护步骤引用的数据契约、RLS 和公开 API 映射。
- 新增鱼缸时间线事件来源、旧记录标记和 1–90 天应用内循环养护字段契约。
- 新增 Vercel SPA 路由回退配置，生产深链接可直接打开并加载当前构建。
- 新增去重后的后续执行计划，分开生产部署、养护正确性、体态交互、鱼缸时间线、三层架构外部门禁、AI、性能与暂停项。
- 新增首次打开、完整混养、激活完成和受控 AI 任务的会话事件基线；事件仅保留匿名白名单字段。
- 新增产品证据矩阵、H1–H5 产品假设、真人测试空结果门禁和 AI Evaluation 状态基线，明确自动测试不等于真人体验有效。
- 新增结构化 AI Evaluation：20 个 Copilot、13 个每日检查和 14 个物种状态判断 Case，分离本地、Mock 与显式 Live Provider，并建立统一报告和 Badcase 回流。

### Changed
- 当前 P0 构建已发布到 Vercel 生产别名；生产 `/aquarium`、时间线及六类代表动作运行时验收通过。
- 修正养护证据审计文档的旧 35/6 统计；当前真实门禁为 228 条动作全部待专家审核，只有显式登记审核人、时间和来源 ID 才可标记 reviewed。
- 养护动作审核改为显式人工登记；关键词只能推荐候选来源，不能自动把具体动作标成已审核。
- 养护文章提醒统一经 Local/API Repository 保存，登录云端状态不再被本地提醒订阅覆盖。
- 今日推荐收藏统一经游客/登录 Repository，写入时防重复，失败时恢复心形、队列操作和持久化状态。
- 养护诊断改为快速评测后的行动方案，首屏直接显示处理步骤、禁止动作和复查目标，原因证据下沉为次级展开。
- 鱼缸时间线与养护计划改为统一通过 Repository 读写；循环计划完成改为数据库原子事务，重试或并发不会重复生成下一期。
- 缸内体态调整改为“选择数量、选择体态、核对保存”三步任务；部分数量自动保留原组并生成新状态组，不再暴露机械的拆分/合并操作。
- 今日推荐收藏与取消改为原位反馈，只有“换一个”推进每日十项队列。
- 全站按钮审计扩大到正式用户页面与共享组件，并输出 route/view/mutation/dialog/section/external 六类动作清单。
- 养护详情将“现在做什么”与来源绑定展示；缺少旧 `nextStep` 的内容按问题类型生成确定性复查动作。
- 混养行为判断改为审核证据门禁：未审核行为资料返回资料不足，攻击性不再自动推断为捕食性，旧混养说明不再直接决定结论。
- 今日推荐使用原有紧凑图片卡回到鱼缸首页第 3 区，图鉴不再重复展示；第 2 区六个常用操作全部直显，不再放入“更多工具”。
- 识别完成与健康分诊阶段使用共享边界函数；识别完成页不会触发症状草稿保护，分诊仍需用户主动选择。
- 新手任务 ID 与激活语义对齐；建缸和浏览路线继续共享同一任务派生函数，旧引导数据与历史用户保持兼容。
- 今日推荐详情继续复用图鉴物种档案，并在关闭后返回鱼缸首页来源位置。
- 物种分类改为来源生命类型优先，鱼类体型/性情角色标签只允许用于鱼类；全库 486 条记录输出分类与人工复核报告。
- 新手引导按“先建缸 / 先看物种”提供不同四步路线，并要求真实鱼缸完整混养判断后才完成核心价值步骤；欢迎页不再提前提供空白清单下载。
- 拍照识别确认后先展示独立物种结果，混养、资料和健康分诊成为明确分开的下一步；健康分诊不再由识别确认自动触发。
- 手机鱼缸页头保持鱼缸切换、新建和“更多”；首页核心养护操作通过响应式网格全部直显。

### Fixed
- 修正养护提醒仍声称只保存到本地的旧文案，避免误导已登录的云端用户。
- 修复图鉴原位筛选触发器缺少展开状态和目标面板关联，辅助技术与自动验收现在可以确认点击结果。
- 修复今日推荐点击收藏后立即切换物种、已收藏状态只能跳水族册而无法取消的问题。
- 修复水质浑浊自查在缸内存在斗鱼时错误建议增加躲避物。
- 修复安全换水把静置当作通用除氯方式，以及死鱼处理未经诊断直接建议药浴/主缸杀菌的问题。
- 修复虎皮鱼与迷你鹦鹉鱼错误以体型捕食为主因的问题；现在展示追鳍、追逐、领地和繁殖防御风险及可追溯来源。
- 修复丁香珊瑚因名称命中植物规则而被标为水草/淡水/草缸，以及珊瑚因通用 `Small` 字段获得鱼类或小缸标签的问题。
- 修复两条五彩青蛙被“两栖/蛙”关键词覆盖海水鱼身份，以及人工分类覆盖项在英文界面回退中文的问题。
- 修复六类记录卡导出为全透明/不可见图片：改用固定 1080px Canvas 绘制，避免离屏 foreign-object 空画布和 `oklch` 解析失败。
- 健康评分、养护计划和鱼缸档案的下载入口改为可见文字动作，不再只显示难发现的图标。
- 今日推荐详情改为进入图鉴正式物种深链，删除首页孤立的重复详情弹窗，并在关闭后返回鱼缸上下文。
- 养护指南移除遗留遮罩筛选弹窗和重复草稿状态，分类、搜索与收藏筛选保持原位，并提供始终可发现的“清除全部”。
- 意见反馈现在先可靠入库再尝试投递邮件；邮件未配置或失败时不再把已保存的反馈误报为提交失败。
- 生命纪念不再强迫用户先写长篇原因：记录与编辑均可选择预设原因，只有“其他”才显示自定义输入；日期、批次和数量控件改为明确的快捷选择与步进操作。
- 首页、养护分类、体态观察、生命纪念与桌面设置本轮修复通过独立 Critic 六维复验及 Evaluator 用户路径裁决。
- 生命纪念复盘用项目内确认框统一保护取消、应用内跳转和浏览器返回；返回时先恢复详情并保留草稿，确认放弃后才离开。
- 生命纪念状态区分“已记录但原因待补充”和“尚未记录”，同时保留“认真复盘”勋章必须填写可能原因的原规则。
- 英文今日推荐不再拼入中文结构字段；体态观察入口会把对应的确定性观察重点带入每日巡检。
- 数据库 migration 显式删除旧七参数生命纪念 RPC，避免新旧函数重载并存。
- 养护分类改用稳定 ID 并对中文基准字段匹配；中英文同分类返回相同文章集合，“新鱼入缸”不再被收敛为单篇文章。
- 分类、搜索词和当前文章状态分离；只有明确点击文章才打开详情，关闭后恢复原分类结果。
- 设置页删除大型宣传头与移动卡片堆叠，桌面改为分类侧栏加紧凑内容区；语言、分享管理和反馈在 600px 英文桌面及手机下不再溢出。
- 生命纪念列表与水族册预览改为进入独立纪念档案页，不再使用内容弹窗；旧 `?item=` 地址自动兼容跳转。
- 缺少原因的旧纪念记录可直接补录当时现象、可能原因与后续改进，保存失败保留输入，成功后刷新可恢复。
- 缸内物种体态调整改为同一任务表面，删除嵌套大弹窗和原生下拉式交互；手机全高、桌面中央，退出未保存修改会确认。
- 幼年、怀孕/抱卵、生产/繁殖和产后恢复生成确定性观察任务；体态不直接改变健康评分或混养四态。
- 首页今日推荐补充 `N / 10` 进度并保持同日顺序；收藏和切换按钮显式位于图片层之上，避免“看得见但点不到”。
- 删除首页进阶水质检测区和缸内预览的数字占位卡；窄屏常用操作保留六个真实入口并隐藏重复辅助说明。
- 生命纪念结构化复盘字段贯通本地与云端写入，旧记录缺少字段时保持兼容，不再要求用户重新创建记录才能补充复盘。
- 收紧分享报告权限：普通用户不能直接 UPDATE 快照、令牌、到期时间或撤销状态；撤销由后端核对 owner 后执行，公开响应禁止缓存。
- 分享链接撤销增加不可恢复二次确认；导出文件名统一清洗特殊字符并提供空值兜底。
- 修复 html2canvas 无法解析 `oklch` 导致 PNG 点击后失败；固定离屏 1080px 模板已通过真实下载尺寸验证。
- 补齐公共报告、分享管理、档案分享与诊断下载的中英文显示。
- 每日检查的未保存保护覆盖“只填写答案”和“已经生成结果但尚未保存”两种状态；标题退出、Esc 与遮罩使用同一确认，保存成功后不再误拦截。
- 任务流程与确认弹窗统一返回、退出和底部决策语义；移除重复右上角关闭，并补齐中英文收藏确认与日期/决策控件 44×44px 触控范围。
- 八类养护自查使用各自的立即动作、禁止动作和复查语义；所有必要安全动作完整直显，不再被折叠或截断。
- 修复手机今日推荐被全局 CSS 强制改回单列的问题；320–430px 现在保持图片与摘要双列，卡片高度受浏览器回归约束。
- 修复多物种养护自查仍显示“全缸检查”的错误语义；八类问题分别使用对应的立即动作、禁止动作与复查项，水质自查不再输出浮头观察。
- 全路由可见图标按钮统一到至少 44×44px，并为侧栏、鱼缸工具、图鉴收藏、养护收藏、图片预览和移除操作补齐焦点样式。
- 物种风险详情的主操作现在进入可复制的 `/encyclopedia?mode=compatibility`，不再只切换页面内部隐藏状态。
- 手机鱼缸首页不再折叠整个管理和学习模块；今日行动删除重复原因折叠，单条养护计划直接可操作，风险禁止动作始终可见。
- 缸内物种预览将 `+N` 改为“另有 N 种”，数量改为“条/只”；今日推荐改为以图片为视觉基点的紧凑横向卡。
- 养护自查不再默认把缸内数组第一种生物当作判断对象：环境问题检查整个鱼缸，行为与喂养问题明确选择全缸、单种或多种；禁止动作始终直接显示。
- 物种档案与缸内物种详情改用共享表面标题栏；默认和自定义关闭按钮统一为右上角 44px 触控目标，并补齐键盘焦点样式。
- 统一添加生物、每日检查、换水、缸内物种、完整混养和鱼缸设置的任务深链，修复旧 Hash 或未处理查询导致的跳转无结果。
- 为未知地址增加可恢复页面，工具页不再错误高亮“我的鱼缸”或展示鱼缸专属侧栏操作。
- 养护详情按文章类型精简重复语义；问题自查结果直接承接处理步骤、禁忌和复查提醒，流程开始后不再显示旧“开始问题自查”按钮。
- 修正紧急程度覆盖文章用途的问题，换水、过水等操作指南不再误显示为诊断问卷。
- 操作和护理完成状态可在刷新后恢复；护理清单只保存用户实际勾选的项目，空清单不可保存。
- 两题全选“不确定”会进入资料不足并返回补充检查；复查提醒在当前结果区显示成功状态和日期。
- 水族册已收藏文章不再提供无效跳转；换水文章进入鱼缸统一换水记录，不再写第二套完成记录。
- 知识文章正文改为只读信息卡；资料不足结果只保留“重新补充关键检查”，不再显示无关提醒操作。
- 删除今日推荐图片与按钮的重复详情 CTA；已收藏推荐进入水族册，搜索结果使用符合两步确认的“选择这个物种”。

### Added
- 鱼缸内“导出与分享”任务页，集中预览和下载六类记录卡，并生成 7 天脱敏报告链接。
- Resend 反馈邮件投递与幂等、HTML 转义、失败降级专项；设置页显示真实邮件送达状态。
- 共享 `MemorialCauseSelector`、`QuickDatePicker` 与 `QuantityStepper`，贯通本地/云端纪念记录和成就追溯。
- 生命纪念受控可能原因契约：支持水质、缺氧、温差、过水应激、追咬、喂食、疑似疾病、近期操作、衰老、不确定和其他；不确定不可与其他原因同时选择。
- 意见反馈邮件投递状态契约和数据库字段，反馈正文继续先保存，再由服务端尝试发送。
- 独立生命纪念地址 `/collection/memorial/:recordId`，支持复制链接、刷新、明确返回、结构化复盘编辑与再次加入统一混养复核。
- 生命纪念 A「纪念档案」、B「时间轴复盘」、C「影像卡册」三套设计稿；正式实现以 A 为基线。
- `memorial_records` 新增“当时观察”和“后续改进”字段，API 与 Repository 支持更新结构化复盘。
- 独立公共报告页 `/report/:token`，不显示私人侧栏或自定义鱼缸名，支持手机/桌面查看与脱敏 PNG 下载。
- 鱼缸档案“生成分享报告”与设置页“已分享报告”管理，覆盖创建后复制、7 天失效状态和主动撤销。
- 七天脱敏鱼缸报告 API：登录用户创建/列出/撤销，匿名持令牌读取；原始令牌不入库，公开接口只返回字段白名单快照。
- 分享报告隐私契约专项，阻止自定义鱼缸名、用户标识、内部记录 ID、自由描述和 AI 原始回复泄露。
- 六类固定 1080px PNG 记录卡：鱼缸健康评分、诊断结果、本周养护计划、新手开缸清单、鱼缸档案摘要和百日纪念；导出前提供预览、加载和失败反馈。
- 鱼缸建缸日期确认与百日纪念门禁：旧记录推算日期必须由用户确认，满 100 天后纪念卡持续可下载。
- `test:aquarium-artifacts` 导出展示模型专项，验证隐私字段边界、健康分数、计划区间、档案物种汇总和纪念天数。
- 折叠门禁扩展到 React 状态型 `aria-expanded` 控件；响应式路由扫描新增 44×44px 图标点击范围断言。
- 新增折叠用途白名单和 `test:disclosures` 自动审计，只允许次级证据、进阶数据、超长列表剩余项与备选方案折叠。
- 新增 `SurfaceHeader`，统一详情表面的标题、说明、次级操作和关闭位置。
- 新增 `task-routes` 任务地址契约、四类文章回归、静态契约测试和真实浏览器闭环回归。

### Added

- 水族册首页种草、养护、纪念和勋章预览项的稳定 `?item=<id>` 深链；刷新可恢复详情或目标勋章，无效内容会留在模块并提示。
- 水族册首页四模块真实内容预览：3 个种草物种、2 篇养护文章、2 条生命纪念及“最近解锁 + 下一项进度”的成就摘要。
- 水族册首页 1440/600/390px 布局、空状态、四个独立地址和“今日种草不混入”浏览器回归。
- 物种优先的共享搜索联想索引与可访问候选组件，覆盖中文、英文、学名、已有别名和受控相关词。
- 搜索联想与原位筛选专项单测、桌面/手机/识别页浏览器回归。
- 全局响应式浏览器扫描：覆盖 7 种设备/语言配置、13 个正式页面及四类养护详情，检查页面错误、横向溢出和可见控件边界。
- 设置页意见反馈表单、游客/登录可选归属的 Express 提交接口、频率限制及管理员反馈列表/状态接口；失败会保留用户输入。
- 桌面侧栏鱼缸列表和 `/aquarium?tank=` 直达切换；鱼缸名称可在首页行内重命名并即时同步侧栏。
- 鱼缸风险可执行处理向导：以真实物种图片突出风险对象，提供建议调整数量、三步操作、禁止动作和唯一目标入口。
- 仅用于展示和规则补充的水体酸性/中性/碱性倾向估计，不生成或持久化虚构 pH 数值。
- 首页第一步的缸内物种小图预览与统一详情弹窗；物种卡支持按批次、按数量二次确认移出，并明确转缸、可靠送养与禁止放生。
- 意见反馈 2.3.0 数据契约：游客与登录用户通过 Express 提交，管理员读取和更新状态；不保存鱼缸参数、症状、附件或联系方式。
- 缸内物种按批次和数量安全移出的 Repository 契约，以及不持久化数值 pH 的水体倾向展示模型。

- 鱼缸首页 C「引导式工作台」：按观察、管理、学习与养护组织现有功能；新增新手可确认的鱼缸基础摘要和默认折叠的进阶水质说明，并增加 390–1440px 双语布局回归。

### Changed
- 物种档案在名称后直接显示喂养速览，并在适配结论后直显环境速览；删除“养护要点”总折叠，完整适配、混养和公母资料继续作为次级证据。

- 水族册四格由整块单一按钮改为模块标题、具体预览项和“更多 N 项”三个明确入口；种草、养护、纪念及完整模块列表按真实可解释的新增顺序展示。
- 单物种详情改为“一屏物种名片”：删除重复适配结果页签，首屏以真实图片、鱼缸结论和唯一主操作为核心，完整适配、混养与养护信息默认折叠。
- 水族册模块首页由空白封面卡改为内容型四格卡；每格只保留一个进入对应模块的路径，今日种草继续留在鱼缸首页。
- 全局搜索、桌面侧栏、图鉴和识别手动搜索改为“选择具体物种 → 查看/确认”的两步交互。
- 侧栏搜索建议加载和失败均提供可见状态；建议不可用时仍可按 Enter 进入完整搜索。
- 图鉴更多筛选从遮罩弹窗改为工具栏下原位半下拉，四组草稿可组合且可分别清除。

### Fixed

- 压缩手机物种名片首屏，确保三条关键原因完整位于固定主操作上方；恢复异常指标的精准鱼缸设置定位，并删除风险状态下重复进入完整混养的按钮。
- 图鉴筛选回归增加真实滚轮边界验证，比较筛选区、父滚动容器和物种结果位置。
- 无可比较对象时，物种详情的混养关系显示资料不足，不再以绿色兼容状态代替缺失证据。
- 图鉴原位筛选隔离嵌套滚动链，筛选内容到达顶部或底部后不再带动下方物种列表，同时保持页面本身可滚动。
- 物种详情指标改为按稳定类型匹配，中英文生成相同的水体、温度、空间、过滤和加热节点；水族册与鱼缸来源的主操作均进入真实目标，删除重复底栏 CTA，并把 pH/硬度低优先级提示下沉到折叠依据。
- 600–1023px 桌面自动使用 76px 图标侧栏但不覆盖用户偏好；手机首页管理与学习模块改为可定位的任务折叠，英文底栏使用短标签，并补充全局长文本换行与页签压缩保护。
- 修复未完成国际化改动导致的养护详情 `isEn` 运行崩溃，以及物种详情、混养、搜索、登录、AI 助手、加热提醒和鱼缸配置中的未定义变量、错误条件字符串与类型错误；中英文详情恢复可加载。
- 缸内物种按数量移出改为数据库原子事务：正整数校验、批次锁、扣减/软删除与幂等记录一次提交，防止响应丢失后的重复扣减。
- 同一次移出确认在失败重试时复用稳定操作号；最后批次软删除父记录后仍先执行幂等重放，不会在 RPC 前被 404 拦截。
- 移出失败重试浏览器回归会精准命中最终物种写入故障，验证弹窗保留操作号、锁定数量且重试只完成一次。
- 删除首页遗留的第二套 pH 区间阻断；缺少 pH 不再覆盖已确认的非阻断策略。
- 设置反馈增加有界代理感知限流、空内容字段聚焦、失败正文保留和未提交草稿离开确认。
- 桌面侧栏改为订阅当前页面发布的鱼缸导航快照，避免登录云端模式继续显示游客 localStorage 中的旧鱼缸。
- **鱼缸首页全量英文本地化与图片鲁棒加载修复**：全面本地化 `Aquarium.tsx` 内底砂、造景、水草、设备、建缸模板、风险提示 Modal、换水日历、日常观察及 AI 建缸助手等 970 余处硬编码中文与标签；将 HTML `<img>` 标签升级为包含加载占位与异常自动重试机制的 `ResilientImage`，消除了图片缺失与掉图问题，确保在英文模式下全站按钮、弹窗与图片均保持 100% 纯净对应的英文呈现。
- **养护百科全量汉化与中英双语切换修复**：全面本地化 `CareEncyclopedia.tsx` 内硬编码的中文规则、步骤、判断依据、卡片标签及自查诊断结论引擎；修复英文视角下 `shortActionLabel` 误将英文单词截断为 `Dechlo`、`Measur`、`Add ne` 的 Bug，补全步骤标题中漏译的 `后续判断` 等中文标签；补充生成 5 张英文养护图的 480w / 960w 高清 WebP 响应式图片；优化全站按钮与卡片标签在移动端的 CSS 文字换行控制 (`break-words hyphens-auto leading-snug`)，防止英文长词溢出或裁切。
- **图鉴页面崩溃修复与全量筛选词条英译**：修正了 `Encyclopedia.tsx` 页面因函数作用域置顶顺序缺失导致 `ReferenceError: getSpeciesNameLocalized is not defined` 引起的页面打不开问题；补全了难度（`Beginner Friendly` / `Intermediate Challenge` / `Expert Level`）、水温区间（`Coldwater` / `Tropical` / `Broad Tolerance`）、体型（`Small Size` / `Medium Size` / `Large Size`）及性情（`Peaceful` / `Territorial` / `Aggressive`）等筛选抽屉词条的英文映射，恢复了图鉴页面的正常渲染与全量英文呈现。
- **养护卡片与长图图片汉化/英文版图全量对齐**：使用 `generate_image` 为过水、水质恶化、鱼苗照料、安全换水、死鱼处理等 5 张核心养护说明图片分别生成了对应的高清纯英文版图（去中文字符、純英文字體），并在切换语言时自动替换图例与图片预览，确保分享卡片和步骤配图在英文状态下实现 100% 全量纯英文显示。
- **六角恐龙 (*Ambystoma mexicanum*) 极值分类修正**：修正 `species.service.ts` 中的大类正则映射，将六角恐龙由误分类 of “淡水特色鱼”修正为正确的“两栖 / 爬行类”。

- 缸内物种批次的原子拆分、同会话改体态再合并、生命纪念扣减与幂等重放测试；最后一组软删除后仍可恢复已提交结果。

- `/search?q=` 物种/养护分组搜索与 `/settings` 正式页面；桌面侧栏和手机页头直达搜索、拍照识别和设置。
- `/welcome` 首次使用目标选择、设置页重播入口和鱼缸首页四步新手起步卡；进度只由真实操作自动完成。
- 登录用户的新手目标、跳过和完成状态同步至现有 `profiles.preferences`；新设备无本地状态时读取云端，失败时保留本地状态并明确提示。
- 任务式导航、新手引导和缸内物种批次的 2.2.0 数据契约；批次支持幼年/成年和怀孕、生产、产后恢复等短期状态。
- `aquarium_species_batches` Supabase migration：旧物种记录无损回填、父级数量自动汇总和鱼缸所有者 RLS。
- 缸内物种批次 API：初始批次、新建、修改、拆分和删除，带幂等键、版本冲突与失败恢复。
- 缸内物种批次管理界面：按批次记录数量、入缸日期、生长阶段与繁殖状态，支持拆分、确认移除和中英文窄屏布局。
- 首次引导、侧栏任务直达、手机批次编辑与 600px 英文桌面的浏览器回归脚本。

- 物种拍照识别、匿名未命中聚合与动态症状追问的共享契约；视觉候选、用户确认、受控观察、紧急等级和原因排序明确分层。
- `species_recognition_misses` Supabase migration：仅保存图片指纹和候选元数据，不保存原图、用户身份或症状原文，且不开放客户端 RLS 权限。
- 独立视觉配置、内存图片预处理、匿名未命中登记和动态症状 step API；确定性规则负责红旗优先、信息增益追问、原因排序和紧急动作。
- `/identify` 三步识别与状态判断页面：图片上传、最多三项候选、现有物种详情、手动搜索兜底、用户确认、最多三问及可视化原因排序。
- 图鉴桌面与手机“拍照识别”入口，以及真实手机、英文桌面和 600–1440px 页面回归。

- 混养、图鉴 Mini、物种适配、每日巡检和养护自查共用的 `VisualResultCard`、展示模型与规则适配器；支持真实物种图、对象关系切换、单一主操作和默认折叠依据。
- 可视化结果专项测试及桌面/手机浏览器断言，覆盖关注对象稳定、规则结果只读、图片失败占位、横向溢出和折叠状态。

- 简体中文/英文语言框架、浏览器首选检测、`aquaguide_locale` 持久化、桌面左下角与手机鱼缸页头设置入口，以及双设备浏览器回归。
- 四张内容翻译表、逐表 RLS、翻译审核字段、API 本地化元数据和登录用户 `/api/v1/profile` 语言偏好接口。

- AquaGuide 2.0.0 三层数据契约、20 张 Supabase 表、逐表 RLS、Storage 桶策略、自动用户档案/角色、幂等写入记录与 camelCase 共享类型。
- `apps/api`、`apps/web`、`packages/contracts` 与 `packages/domain-rules` workspace 边界；首批版本化健康、物种和养护只读 API 支持结构化错误与依赖未配置兜底。
- 三层契约静态断言与本地 API 边界回归，覆盖旧健康接口兼容、请求 ID、404 和数据库未配置 503。
- 受 JWT/RLS 保护的鱼缸、生物、设备、环境、每日巡检、收藏、生命纪念、养护计划和养护事件 API；写请求校验幂等键并使用版本冲突保护。
- 游客 `LocalAquaGuideRepository`、登录 `ApiAquaGuideRepository`、统一 API 客户端及 Repository 边界回归。
- 管理员物种/养护内容 CRUD、发布下线与图片上传接口；上传时生成卡片、详情和 3D 衍生图，保留私有原图并支持版本失败回滚。
- 管理内容 Zod 契约及自动回归，覆盖管理员鉴权、幂等重放、图片处理和私有素材隔离。
- 本地物种、喂养资料、养护文章、步骤与 2,026 项素材的批量导入工具；默认只预检，显式 `--commit` 才写入 Supabase，并按哈希跳过未变化素材。
- 不进入普通导航的 `/admin/content` 简易内容后台，支持物种/养护列表、新建编辑、发布下线、图片替换、未保存提醒、空状态和权限错误反馈。

- 图鉴普通物种卡与具体变种的独立快捷收藏按钮、失败回滚、水族册直达反馈及桌面/手机浏览器回归。
- 真人水族新手、真实鱼缸跨入口与低端真机 3D 的外部证据采集协议。
- 18 张中优先级物种素材逐项人工复核：16 张接受现有非破坏性显示保护，2 张确认需要重新生成。
- 12 条正式用户路径登记、三步上限静态断言与每日检查/养护自查/添加生物浏览器验收。
- 水族册模块首页与种草、养护、生命纪念、成就勋章四个独立可刷新地址。
- 核心路由错误边界、动态模块单次重试/单次刷新、会话级脱敏诊断与坏数据恢复提示。
- 486 个物种的 256/768px WebP、54 张养护图的 480/960px WebP 及生成/体积断言脚本。

- 批量物种图片质量报告与 18 张中优先级返工队列；486 张素材中未发现高优先级问题。
- 3D/物种/图片性能事实基线与云同步方案评估；云同步仍不实施。
- 鱼缸、巡检和养护活动统一写入服务及业务状态专项测试。
- 每日检查“单独拒食”确定性规则和七类常见巡检回归样本。
- 生命纪念统一写入服务及日期、原因、存储兼容和变更事件专项测试。
- 中文产品文档体系：产品定义、用户故事、竞品、现状、信息架构、交互说明、设计系统、数据模型、AI/API、技术架构、运行、QA 与产品路线图。
- 物种详情、窄桌面、每日检查、混养、水族册、成就和 AI 建缸助手的可验收交互契约。
- 我的水族册、派生成就与分层交互的数据契约和设计基线。
- `/collection` 四合一水族册及种草、养护、生命纪念、成就勋章四个页签。
- 8 枚从既有鱼缸、收藏、巡检、换水和死亡记录自动追溯的成就勋章。
- 桌面中央详情弹窗、手机底部详情面板与自适应任务流程表面。
- 水族册成就断言、按钮行为审计和新版核心浏览器路径验收。
- 真实设备级 `MobileAppShell` / `DesktopAppShell` 与设备策略断言。
- 3D 与普通物种卡素材一致性断言。
- AI 建缸助手自动评估集。
- 图鉴 Mini 混养判断与 `species_only` 规则范围。
- 每日鱼缸检查、同日记录更新和受控 AI 补充解读。
- 仅驻留当前会话的核心事件适配器与端到端验收脚本。
- 应用内养护计划：明确日期、鱼缸绑定、到期状态、完成、改期、确认删除和旧提醒兼容。
- 320–430px 手机分页、手动养护推荐、水族册入口、缸内物种与养护计划浏览器回归脚本。

### Changed

- 鱼缸首页按最终 C「引导式工作台」重排：桌面新手起步移入侧栏，鱼缸切换与新建入口统一归属侧栏；观察区采用“鱼缸与物种预览 / 今日行动”双栏，管理与学习并排，进阶检测横跨底部。侧栏新建鱼缸深链接现在会实际创建并给出反馈。
- 物种详情将“不建议”状态的主操作独立改为“查看风险与替代建议”，不再使用暗示仍可确认加入的谨慎状态文案；专项浏览器测试会点击进入完整混养并确认没有直接加入操作。

- 单物种详情重构为 A「图像结论」：大图与适配结论成为首屏中心，最多三条关键原因、一个固定主操作和三类可访问页签；收藏、混养与更多操作降为次级。

- 普通物种不再因缺少 pH 或硬度被判为资料不足；对参数敏感的物种仅提示使用试纸或滴定测试确认。
- 首页 C 将缸内物种从第二步移入第一步；第二步“管理”和第三步“学习与养护”按内容容器在宽桌面并排、窄桌面和手机降列。
- 新手起步由四张常驻任务卡压缩为进度条、唯一下一步和按需展开的完整步骤；手机端不再重复展示与今日行动竞争的“下一步行动”卡。

- 缸内物种摘要显示幼年、成年、怀孕/抱卵、生产和产后恢复数量；体态同时进入每日观察、养护推荐和物种症状判断上下文，但不改变混养结论。
- 登录模式 Repository 读取并逐组同步物种批次；多批次不再通过旧总数量接口覆盖，游客与云端使用同一页面模型。
- 侧栏设置不再打开弹层；搜索结果使用可复制深链接打开具体物种或养护文章，关闭后返回原搜索词。
- 图鉴“浏览/混养”二级入口由 hash 改为可复制查询路由；建缸和巡检引导动作会直接打开对应任务。

- 修复 `getLifeType` 在英文模式下因分类字段 `Amphibians/Reptiles` 变更导致六角恐龙（`Ambystoma mexicanum`）错误归类为“淡水特色鱼”的问题，精准重建其两栖/爬宠（`Reptile / Amphibian`）分类。
- 本地化物种角色标签（`getSpeciesRoleLabel` / `getSpeciesPositioning`），在英文模式下自动转换“观赏生物 / 鱼缸搭配”、“工具虾螺 / 除藻生物”等为“Ornamental Creature / Tank Mix”等标准英文标签。
- 彻底清除 `localizeDataAuto.ts` 自动翻译数据中残留的 `[EN]` 前缀，并在 `applyLocalization` 中增加正则剥离处理，确保物种英文名无杂质。
- 新增 `getLocalizedAquariumName` 动态翻译函数，将默认与自动编号鱼缸名称（如“我的鱼缸”、“我的鱼缸 1”）在英文模式下自动映射为“My Aquarium / My Aquarium 1”，同时保留用户自定义名称。
- 深度本地化 `Aquarium.tsx`（首页/鱼缸管理器）、`Home.tsx`、`CollectionHub.tsx`、`SpeciesDetailDialog.tsx` 与 `CompatibilityRiskCalculator.tsx` 剩余全部 100+ 处硬编码中文文本，包括基础容量、诊断排查、水质警告、养护指南、确认弹窗及各组件辅助描述。
- 全面本地化五个核心页面与弹窗：`Collection.tsx`（水族册）、`Identify.tsx`（拍照识别）、`Encyclopedia.tsx`（图鉴）、`CareEncyclopedia.tsx`（养护百科）与 `Aquarium.tsx`（鱼缸管理器）。
- 动态转换底砂选项（`substrateOptions`）和五种建缸方案模板（`tankBuildTemplates`）的中文展示文本为对应英文属性。
- 本地化每日检查状态判定、养护紧急状态等级（`CareUrgencyTag`）及动作详情提示，确保无缝切换与持久化语言设置。


- 物种与养护内容 API 支持 `locale=zh-CN|en`；未发布英文内容安全回退中文，规则仍使用中文主数据。

- 现有 Express AI 服务改为可复用应用模块，开发命令由 TypeScript API 入口启动；`/api/health`、`/api/ai/chat` 继续兼容并增加 `/api/v1` 别名。

- 鱼缸首页将养护计划内嵌到“今日行动”，删除独立计划卡；正式“缸内物种”入口收敛为鱼缸画面下方唯一可展开区域。
- 每日检查选择单选答案后自动聚焦下一道有效问题，最后一题只聚焦结果按钮而不自动提交。
- 公开 AI 入口收敛为“AI 建缸助手”和异常/自由描述巡检解读；今日行动、鱼缸风险与单物种详情不再显示 AI 解读。
- 每日巡检改为六个必答观察项加可选描述的单页检查表；养护问题自查由四阶段改为“单页回答 → 结果”。
- 添加生物的混养复核改为独立第二屏，不再与搜索、推荐和数量长列表叠加。
- “今日建议”重构为“今日行动”：统一优先级选择器只展示一个任务、一个原因和一个主操作，解释改为原位展开。
- “我的水族册”提升为桌面主导航，并在展开状态下显示四个直达二级标题。
- 图鉴、水族册、养护和鱼缸核心图片使用固定容器、骨架、响应式来源与单图失败占位；3D 在空闲时加载，慢网改为用户主动加载。

- 鱼缸顶部区域在桌面按三列、两列、单列重排；图鉴工具区、物种卡和水族册四页签按可用内容宽度降列，600px 桌面不出现手机工具栏。
- 勋章页明确自动解锁且无需领取，卡片统一显示三态、当前、目标、差值和唯一下一步。
- 单物种详情在无鱼缸时只显示一个明确状态；混养动作直接进入完整计算并保留物种，温度、尺寸和设备问题直接打开对应鱼缸设置。
- 死亡记录统一改为“更多操作 → 填写日期和原因 → 确认保存”，未确认不写入。
- 桌面物种、养护、纪念与水族册详情由右侧抽屉统一改为最大 900px、88dvh 的中央弹窗；真实手机仍使用底部详情面板。
- 养护百科桌面页面改为按内容容器响应的双栏/单列结构，移除强制最小画布与旧网格跨行拼接；操作型文章采用“图示操作台”信息层级。
- 新增同一篇“如何安全给新鱼过水？”的图示操作台、图解长页、逐步带做三套桌面与手机高保真对照稿。
- `docs/README.md` 成为当前产品事实入口；旧功能分析与交互报告标记为历史审计，不再作为当前 PRD 依据。
- `/3d-demo` 在产品文档中明确为内部实验，不进入正式导航与核心验收。
- 桌面浏览器缩窄后保持桌面工作台，平板默认使用桌面布局。
- 种草、养护收藏和生命纪念入口统一进入“我的水族册”，继续共用既有数据。
- `/wishlist` 与 `/care-favorites` 改为兼容跳转到水族册对应页签。
- 用户界面的“Copilot / AI 建缸规划”统一命名为“AI 建缸助手”，内部接口名保持兼容。
- 物种、养护和纪念详情按设备使用右侧抽屉或底部面板；每日检查、添加生物、鱼缸设置和 AI 建缸助手使用任务流程表面。
- 3D 与普通物种卡素材一致性断言。
- 完整混养继续使用 `tank` 范围，图鉴 Mini 使用同一引擎的 `species_only` 范围。
- 详情关闭统一通过共享导航恢复来源滚动位置、可访问焦点和短暂高亮。
- 操作型养护详情改为 A「图示操作台」：大图与三步操作指引构成首屏；B/C 作为桌面和手机对照稿保留。
- 手机推荐取消自动轮播和相邻卡片露出；养护页移除重复底部安全区与厚重“养护知识”框架。
- 桌面鱼缸顶部恢复切换、新建和缸内物种入口；手机 3D 全屏预览补充物种列表。
- 手机种草与养护收藏入口统一进入水族册，水族册增加“种草 · 养护 · 纪念 · 勋章”二级说明。
- 手机图鉴底部分页改为首页、上一组、组数、下一组、尾页单行布局。
- 新增 `speciesGrouping.ts` 英文组名映射 `MANUAL_GROUP_NAMES_EN`，并更新 `getRepresentativeSpecies` 兼容原中文名匹配，确保翻译模式下组别分类与代表物种选择正确。
- 将 `i18n.language` 引入 `Encyclopedia.tsx` 中 `allSpeciesGroups`、`filteredFishes` 及 `atlasDisplayItems` 依赖数组，实现语言切换时分类数据和代表物种的即时重新计算。
- 为 `App.tsx` 中的设置按钮添加 `aria-label={t('common.settings')}`，保证侧栏折叠状态下 Playwright 可视化自动化测试用例仍能正确选取元素。
- 在 `fix_all_rembg.py` 与 `fix_selected_rembg.py` 抠图脚本中引入原格子边界触碰检测和 25px 线性透明渐变，并清空边界外的邻格像素，从而平滑消除水母和水草在原始素材边缘的硬切角痕迹。

### Fixed

- 修复登录状态变化绕过本地迁移确认、养护/喂食/观察数据未计入本地数据门禁的问题。
- 修复延迟保存的旧本地快照覆盖刚保存的体态，以及放弃未保存修改后导航守卫残留的问题。
- 修复合并 RPC 使用文本参数写入 PostgreSQL enum，以及最后一组纪念响应丢失后重试被父记录 404 阻断的问题。

- 旧版物种数量更新不再绕过体态批次：单批次请求自动更新该批次，多批次请求要求选择具体组，父级数量继续由数据库汇总。
- 修复 `scripts/verify-mobile-care-experience.mjs` 在 Playwright 测试中未在 local storage 内设置 `'aquaguide_locale': 'zh-CN'`，导致浏览器首选语言可能载入英文，无法与测试脚本中的中文按钮及文本断言相匹配。
- 修复测试脚本中 `nextPageLabel` 的按钮可访问名称从 `'下一页'` / `'下一组'` 错配成 `'下一组图鉴'`，导致分页操作超时无法点击的问题。
- 修复 `CareEncyclopedia.tsx` 在英文模式重构中，`CareArticleDetail` 和 `CareImage` 子组件缺失 `t` 和 `isEn` 的词法作用域定义，造成在访问养护页面或大图预览时抛出 `ReferenceError` 崩溃。
- 修复 `Collection.tsx` 在加入英文多语言代码后缺失 `i18n` 实例导入，导致访问“自然水族册” `/collection` 路由时直接抛出 `ReferenceError: i18n is not defined` 导致页面白屏的问题。
- 修复 `CareEncyclopedia.tsx` 和 `Encyclopedia.tsx` 中仍在使用废弃的 Collection 查询参数路由（`/collection?tab=care` 和 `/collection?tab=wishlist`），更新为与 `App.tsx` 匹配的新版嵌套路由 `/collection/care` 和 `/collection/wishlist`，确保手机水族册收藏点击能正常进入对应子页签。
- 修复识别页使用仅 Data Router 支持的 `useBlocker` 导致 `BrowserRouter` 页面崩溃；改用页面内离开确认和浏览器刷新保护。
- 修复图片预览清理 effect 在上传时提前中止识别请求；请求生命周期和 Object URL 生命周期改为独立清理。
- 限制文本 AI 观察结果只能使用登记过的代码和值，非法结构化输出不会影响本地问题策略。
- 修复物种状态判断未消费结构化上下文：水体、温度、空间、过滤、增氧和近期操作现会影响本地排序，并作为结果视觉节点；第一版仅允许鱼类进入鱼类规则集。
- 修复动态追问快速连点、定时器重置、陈旧响应和全局导航离开竞态；桌面侧栏、手机底栏、浏览器历史和重新开始统一保护未保存内容。
- 连续/多条死亡进入本地红旗；紧急结果先展开应急步骤，每个原因可查看支持事实、反证、缺失信息、建议和禁止动作。
- 删除鱼缸页残留的关键词拼接追问和“继续补充信息”入口；鱼只异常、浮头、拒食、躲藏、追咬、新鱼及死亡异常统一进入 `/identify` 的受控动态分诊。
- 修复手机养护推荐轮播的多张全宽卡片反向撑大父容器，内容虽被裁切却实际超过屏幕的问题。
- 修复 `src/i18n/localizeData.ts` 中多余的闭合大括号导致开发服务器和 UI 测试无法启动编译的语法错误。
- 修复桌面收藏成功反馈被侧栏遮挡，以及品类详情打开后焦点未稳定落到具体变种收藏按钮的问题。
- 修复桌面缸内物种目标区被旧样式隐藏、多个入口点击后看不到展开结果的问题。
- 更新核心与手机浏览器回归脚本，使其断言独立水族册地址和单页巡检，不再等待旧 query 页签或逐题按钮。
- 修复 3D 鱼缸继续显示旧版生物素材的问题。
- 修复详情关闭后滚动、焦点与来源高亮未稳定恢复的问题。
- 修复手机图鉴分页折叠、养护推荐自动移动和页面底部重复大留白。

### Removed

- 删除已无引用的侧栏语言设置浮层与状态 Provider；设置只通过 `/settings` 正式页面进入。

- 鱼缸页内重复的“死亡图鉴”列表与再次加入入口；再次加入统一从生命纪念详情进入混养复核流程。

- 独立种草图鉴与养护收藏页面实现，旧 URL 仅保留兼容重定向。
- 路由页面中的空点击、仅日志处理、原生 `alert` 和无可观察结果的按钮。
