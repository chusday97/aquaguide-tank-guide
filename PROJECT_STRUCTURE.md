# AquaGuide 项目结构

## 收敛治理

- `scripts/audit-branch-convergence.mjs`：只读比较统一分支、`origin/main`、RC1 和远端历史分支的 Git 拓扑，不能替代功能迁移判定。
- `scripts/check-preview-parity.mjs`：只读比较本地 HEAD、canonical 远端 HEAD 与 Vercel canonical-branch Preview 的 `githubCommitSha`；不触发部署。
- `scripts/preview-url.mjs`：所有正式浏览器回归共用的 Preview 地址解析器；显式环境变量优先，默认用户确认的 4317。
- `docs/03-development/BRANCH_CONVERGENCE_AUDIT.md`：分支差异快照、解释和逐项迁移规则。
- `docs/03-development/ORIGIN_MAIN_RECONCILIATION.md`：对 `origin/main` 高影响能力的首轮逐项语义复核；不等同于完成全部提交迁移。

## 本轮交互结构

- `src/components/common/AdaptiveDetailContent.tsx`：手机底部面板与桌面页面内双屏详情的表面适配。
- `src/components/ThreeAquarium.tsx`：`contain` / `stage-cover` 响应式相机取景。
- `scripts/verify-split-workspace-detail.mjs`：阻止桌面详情退回 Portal 固定抽屉的结构门禁。
- `scripts/verify-split-workspace-runtime.mjs`：在正式预览中打开物种/养护详情，断言其为页面内非固定双屏区域、无 Portal、无滚动锁并可关闭。
- `scripts/verify-care-card-action.mjs` / `scripts/verify-settings-share-action.mjs`：验证本地养护卡可达性，以及 Settings 到导出/分享中心的真实导航。

根目录 `vercel.json`：Vercel 生产部署的 API-before-SPA rewrite 和 SPA 路由回退配置；`api/v1/[...path].ts` 复用 canonical Express API app。

## 核心入口

- `src/modules/recommendation/recommendation.service.ts`：推荐候选与智能推荐服务；候选严重级别由统一混养引擎裁决，局部负载/群游计算只提供风险和调整提示。
- `scripts/test-recommendation-authority.ts`：推荐权威边界回归，覆盖单养候选保留、canonical 严重级别、近负载候选和理由来源。
- `scripts/test-discovery-storage-boundary.ts`：验证图鉴与鱼缸互动发现共用 canonical app-state 写入、保留旧键读取兼容并发出统一变更事件。
- `scripts/test-compatibility-evidence-coverage.ts` / `scripts/test-compatibility-coverage-scorecard.ts`：验证已审核物种与未审核配对的 fail-closed 边界、直接配对证据优先级和优先物种矩阵覆盖；不代表全库知识已完成。
- `api/v1/[...path].ts`：Vercel V1 API catch-all，不启动独立 listener。
- `scripts/test-production-cloud-runtime-contract.mjs` / `scripts/test-production-cloud-runtime-smoke.ts`：API namespace root/nested before SPA、环境边界、JSON health/404、AI fallback 和 canonical Express runtime 回归。
- `.github/workflows/result-ux-head-integrity-v1.yml` / `scripts/test-result-ux-workflow-head-integrity.mjs`：只验证 PR head 或规范推送 SHA 的精确 checkout；不承载历史 Result UX 页面或旧 UI workflow。
- `.github/workflows/rc-convergence-v1.yml`：在 canonical 分支统一执行数据契约、API、领域规则、证据和分享回归，再进入类型与构建门禁。

- `apps/api/`：Express TypeScript 业务 API 入口、统一错误、Supabase 客户端、鉴权和版本化路由。
- `server/index.mjs` / `api/health.js` / `functions/api/health.js`：本地 Express、Vercel 与 Pages 兼容健康接口；公开文字/视觉 AI 能力状态，但不暴露 Secret。
- `apps/api/src/feedback-rate-limit.ts`：意见反馈单实例有界限流；生产多实例由入口网关提供共享额度。
- `apps/api/src/routes/admin.ts`：受管理员权限保护的物种、养护文章、发布状态与版本化图片处理接口。
- `apps/api/src/routes/species-ai.ts`：物种图片识别、匿名未命中和动态症状判断 API。
- `apps/api/src/ai/provider.ts`：视觉与文本模型的独立 OpenAI 兼容调用、超时和单次重试。
- `apps/web/`：Web workspace 边界；现有 React 源码在云端 Repository 接入完成前继续保留根目录。
- `packages/contracts/`：API 请求、响应、分页、错误码和公开内容 DTO。
- `packages/contracts/src/content-admin.ts`：内容编辑、状态切换和素材上传的服务端校验契约。
- `packages/contracts/src/localization.ts`：中英文语言、偏好、回退元数据、审核与覆盖率契约。
- `packages/contracts/src/species-diagnosis.ts`：视觉候选、匿名未命中、受控观察、动态追问与原因排序契约。
- `packages/domain-rules/`：跨前后端共享的确定性规则类型与安全不变量。
- `packages/domain-rules/src/species-diagnosis.ts`：受控观察、本地症状解析、红旗优先与信息增益追问策略。
- `src/services/onboarding/onboarding-paths.ts`：两条新手目标路线、真实进度计算与统一任务定义。
- `scripts/test-onboarding-activation.ts`：验证目标顺序、真实适配门禁、历史用户保护、旧引导兼容和清单单一来源。
- `src/services/compatibility/compatibility-records.service.ts`：保存并校验与真实鱼缸关联的完整混养判断记录。
- `scripts/verify-mobile-aquarium-priorities.mjs`：验证手机页头、高频操作、首页推荐边界与图鉴模式工具栏。
- `scripts/assert_taxonomy_rules.ts` / `scripts/generate_taxonomy_review.ts`：486 条物种来源分类、生命类型、角色、水体和筛选标签的确定性门禁与人工复核报告。
- `scripts/verify-taxonomy-ui.mjs`：珊瑚、歧义名称、两条五彩青蛙及中英文角色标签的真实浏览器分类回归。
- `scripts/verify-daily-discovery-deep-link.mjs`：鱼缸首页今日推荐的位置、每日进度、详情返回、切换收藏、响应式边界和图鉴去重回归。
- `supabase/migrations/`：PostgreSQL 表、索引、RLS、触发器和 Storage 策略。
- `supabase/migrations/202607160002_localization.sql`：四张翻译表、审核字段、索引与公开/管理员 RLS。
- `supabase/migrations/202607180001_species_recognition.sql`：只允许后端聚合写入的匿名识别未命中表。
- `supabase/migrations/202607220001_livestock_batches.sql`：缸内物种批次、生长阶段、繁殖状态、汇总数量触发器与所有者 RLS。
- `supabase/migrations/202607220002_atomic_livestock_batch_split.sql` 至 `202607220005_fix_livestock_batch_merge_signature.sql`：拆分、生命纪念扣减与合并的原子数据库函数，以及旧合并函数签名的显式升级。
- `supabase/migrations/202607260001_feedback_submissions.sql`：低敏感意见反馈、管理员 RLS、状态索引与版本触发器。
- `supabase/migrations/202607260002_atomic_livestock_removal.sql`：缸内物种数量移出的事务锁、整数校验与幂等重放。
- `supabase/migrations/202607290001_memorial_reflection_fields.sql`：生命纪念“当时观察 / 可能原因 / 后续改进”字段与原子批次纪念写入函数。
- `supabase/migrations/202608010001_memorial_causes_feedback_email.sql`：生命纪念受控原因代码、反馈邮件投递状态与新版原子纪念写入函数。
- `supabase/migrations/202608090001_evidence_timeline_recurrence.sql` 至 `202608090002_atomic_care_reminder_completion.sql`：可信证据、时间线来源、循环养护字段，以及完成当前计划和生成下一期的原子事务函数。

- `src/App.tsx`：设备级应用壳、导航与路由。
- `src/i18n/`：i18next 初始化、浏览器语言检测和本地偏好保存。
- `src/components/visual-results/`：混养、物种适配、巡检与养护自查共用的视觉结果卡、展示模型和规则适配器。
- `src/components/interactive/`：场景化物种探索与养护鱼缸入口；图鉴以现有发现存储中的独立 6 个物种批次整批替换，场景贴图与加载/失败态均保持透明；养护热点始终显示类型名称、按需展开症状。两者只触发现有路由/详情，不生成业务结论。首页不使用该场景组件。
- `scripts/test-interactive-discovery-batches.ts` / `scripts/assert_interactive_scene_assets.ts` / `scripts/verify-interactive-scenes.mjs`：分别门禁互动批次无交集、411 个场景资源的 Alpha/透明角像素，以及生产预览的图鉴换批与手机养护热点呈现。
- `src/components/layout/LayoutModeProvider.tsx`：基于 viewport 的布局判定；不得恢复 UA/设备字符串作为布局事实来源。
- `src/pages/Aquarium.tsx`：我的鱼缸；桌面首页以现有 `ThreeAquarium` 为主舞台，右侧承接今日行动/推荐，底部承接高频任务。
- `src/pages/Encyclopedia.tsx`：图鉴与完整混养计算。
- `src/pages/Identify.tsx`：拍照识别候选、手动兜底、物种确认、动态追问与可视化风险结果。
- `src/pages/Search.tsx`：物种与养护指南的双语统一搜索，候选先确认具体物种再打开资料。
- `src/components/search/SearchAutocomplete.tsx`：共享可访问搜索联想、键盘选择和已选物种摘要。
- `src/services/search/search-suggestions.service.ts`：确定性物种优先排序、养护匹配与受控相关词。
- `src/services/navigation/task-routes.ts`：添加生物、巡检、换水、缸内物种、混养与设置的正式任务地址契约。
- `scripts/test-task-entry-contract.mjs`：锁定桌面鱼缸子菜单与每日检查 canonical route 的对应关系。
- `src/services/aquarium/aquarium-setup.service.ts`：鱼缸未知字段规范化、空白鱼缸草稿和 `empty / incomplete / usable / complete` 资料状态派生。
- `src/services/aquarium/species-addition-policy.ts`：现实记录与未来规划在混养四态下的独立产品策略。
- `src/services/aquarium/livestock-recording.service.ts`：现实生物先保存、后评估及批量部分失败保留的统一服务。
- `src/services/aquarium/aquarium-selection.service.ts`：鱼缸选择、云端空状态与本地兼容选择的统一边界。
- `src/services/navigation/history-navigation-guard.service.ts`：在路由器启动前拦截受保护的浏览器历史导航，供未保存纪念复盘显示项目内确认并安全继续或放弃。
- `src/pages/Settings.tsx`：正式设置路由，替代侧栏设置弹层。
- `src/services/feedback/feedback.service.ts`：设置页意见反馈的唯一前端 API 入口，支持游客与可选登录会话。
- `src/pages/Welcome.tsx`：首次使用的“先建缸 / 先看物种”目标选择页。
- `src/components/onboarding/OnboardingTaskCard.tsx`：根据真实鱼缸、浏览、收藏/入缸和巡检记录自动更新的新手任务卡。
- `src/components/aquarium/LivestockBatchCard.tsx`：同一任务表面内的批次汇总、三步体态调整、部分数量自动分组、保存摘要与删除确认。
- `src/components/aquarium/LivestockRosterDialog.tsx`：首页唯一缸内物种详情；桌面中央/手机全高管理体态，并按数量二次确认移出。
- `src/components/aquarium/AquariumTimeline.tsx`：鱼缸操作时间线与循环养护工作区，桌面双栏、手机单列。
- `src/services/aquarium/livestock-removal-attempt.service.ts`：一次移出确认草稿的稳定操作号，失败重试复用、重新发起才更换。
- `src/pages/CareEncyclopedia.tsx`：养护百科、互动排查/传统浏览两种呈现状态与共享养护详情。
- `src/pages/InteractivePreview.tsx`：只供内部视觉验收的 React 预览页；直接复用正式互动图鉴和互动养护组件，不维护独立静态原型。
- `src/data/careEvidence.ts`：41 篇养护内容的确定性来源映射、审核状态与复查动作兜底。
- `src/pages/CollectionHub.tsx`：水族册模块首页，以水下展开书册承载种草、养护收藏、生命纪念与成就；章节原位展开，具体条目使用稳定深链，剩余内容通过“更多”进入模块。
- `src/pages/Collection.tsx`：四个独立水族册模块的排序列表、物种/养护详情深链、纪念旧地址兼容跳转、勋章定位与空状态。
- `src/pages/MemorialDetail.tsx`：生命纪念独立档案页；结构化复盘补录/编辑、未保存保护、列表返回与再次加入统一复核。
- `src/pages/AdminContent.tsx`：受管理员权限保护的独立内容后台页面，不进入普通用户导航。
- `src/components/common/RouteErrorBoundary.tsx`：核心路由隔离、友好重试、会话诊断复制与坏数据恢复提示。
- `src/components/common/ResilientImage.tsx`：图片骨架、单次重试与本地占位兜底；互动场景可使用透明加载表面，避免出现白色方块。
- `src/services/diagnostics/`：`chunk / render / image / data` 会话级失败分类与脱敏诊断。
- `public/responsive/`：物种 256/768px 与养护 480/960px WebP 衍生资源；原图继续保留。

## 共享业务

- `src/services/favorites/`：物种与养护收藏的唯一读写入口。
- `src/services/api/`：携带 Supabase JWT、幂等键和结构化错误的版本化 API 客户端。
- `src/services/admin/content-admin.service.ts`：内容后台唯一 API 访问层，封装 CRUD、发布状态与原始图片上传。
- `src/services/repository/`：游客本地与登录云端两种 Repository 实现；页面后续只依赖统一接口。
- `apps/api/src/livestock-memorial-replay.ts`：最后一组被删除后仍可读取已提交生命纪念的幂等重放门禁。
- `apps/api/src/routes/feedback.ts`：游客/登录反馈提交、频率限制，以及管理员分页和状态更新接口。
- `src/services/analytics/`：只驻留当前会话的隐私安全事件白名单。
- `src/services/collection/`：水族册聚合读取与 8 枚派生成就计算。
- `src/services/collection/memorial.service.ts`：生命纪念校验、兼容存储写入与统一变更通知。
- `src/modules/collection/`：水族册模块、纪念条目与成就进度类型。
- `src/services/aquarium/`：鱼缸生物写入与复核。
- `src/services/aquarium/tank-state-evidence.service.ts`、`tank-state-presentation.service.ts`：从既有混养/诊断事实派生当前状态；不新增持久化记录。
- `src/services/aquarium/water-change*.service.ts`：基于既有历史和当前信号得出维护建议；不将日历逾期伪装为紧急诊断。
- `src/services/onboarding/onboarding.service.ts`：新手引导状态、首次识别、真实任务进度与完成派生。
- `src/services/aquarium/aquarium-state.service.ts`：鱼缸集合兼容存储、当前鱼缸校验与统一变更通知。
- `src/services/aquarium/aquarium-navigation.service.ts`：本地/云端共用的会话级鱼缸列表与当前选择快照，供桌面侧栏订阅。
- `src/services/aquarium/species-batches.service.ts`：游客模式的批次规范化、汇总、拆分、体态更新与确定性今日观察信号。
- `src/services/care/care-activity.service.ts`：应用内养护计划、完成操作与护理清单的旧键兼容写入。
- `src/services/storage/local-app-state.ts`：统一本地 app state 写入与 discovery deck 读写边界，兼容旧 localStorage 键并派发跨页面变更事件。
- `src/services/care/care-timeline.service.ts`：现有鱼缸记录的确定性时间线聚合、新事件来源去重与本地持久化。
- `src/services/care/care-category.service.ts`：养护分类稳定 ID 与中文基准字段匹配，保证中英文返回相同文章集合。
- `src/services/compatibility/`：Mini 与完整混养的会话级选择传递。
- `src/services/diagnosis/`：巡检记录的同日更新策略。
- `src/modules/diagnosis/`：每日检查问题、确定性规则与数据类型。
- `src/lib/tankCompatibilityEngine.ts`：统一混养规则引擎。
- `src/modules/knowledge/compatibilityEvidencePresentation.ts`：把混养规则结果适配为详情页可展示的结构化证据与审核状态；不从物种自由文本推导结论。
- `packages/domain-rules/src/{bioload,tank-state,water-change}.ts`：P0 本地确定性规则；与 UI 和云端存储解耦。
- `src/lib/waterProfileEstimate.ts`：从水体类型、底床、造景和水草派生非数值水体倾向，供缺少 pH 时安全展示。
- `src/lib/speciesVisual.ts`：二维与 3D 物种素材解析。
- `src/lib/speciesRecognition.ts`：视觉候选与学名、名称、别名及模糊候选的本地物种库映射。
- `src/services/ai/species-identification.service.ts`：物种识别、匿名未命中和动态症状 step API 的前端访问层。
- `src/services/ai/identification-triage-flow.ts`：识别阶段与健康分诊草稿保护的纯边界，防止两项任务再次耦合。
- `src/components/SpeciesDetailDialog.tsx`：共享物种详情与同表面生命纪念任务。
- `src/components/forms/QuickDatePicker.tsx`、`QuantityStepper.tsx`：日期快捷选择与数量步进控件。
- `src/components/memorial/MemorialCauseSelector.tsx`：生命纪念受控原因标签。
- `src/components/export/AquariumExportCenter.tsx`：六类鱼缸记录和脱敏分享的统一任务页。
- `src/services/export/png-export.service.ts`：固定 1080px Canvas 记录卡绘制与通用文件名清理。
- `src/components/common/AdaptiveDetailContent.tsx`：桌面中央详情弹窗与手机底部详情面板。
- `src/components/common/AdaptiveTaskContent.tsx`：桌面与手机的沉浸式任务流程表面。
- `src/components/common/SurfaceHeader.tsx`：统一详情/任务表面的标题、返回、关闭与 44px 图标操作。
- `src/components/ThreeAquarium.tsx`：3D 鱼缸。

## 文档与验证

- `.ai/`：AI 持久化目标、任务队列、AI 变更记录与执行日志。
- `AI_PROJECT_PROTOCOL.md`：编码前读取、变更后更新、Context Sync 和关键节点推送约束。
- `docs/CONTEXT_ROUTING.md`：产品规则、契约、Badcase、交接和证据的 canonical 路由。
- `.project-journal/`：按工作区证据规则维护可追溯事件、证据索引、事实卡和证据缺口；职业材料仅使用 verified 结论。
- `docs/05-validation/`：证据矩阵、产品假设、真人测试结果与 AI Evaluation 当前状态；严格区分自动测试、真实模型和真人证据。
- `evaluation/`：47 个版本化 JSONL Case、Zod 契约、deterministic/mocked/live Runner、统一报告与 Badcase Registry。
- `docs/README.md`：当前产品文档总入口与事实来源说明。
- `docs/PROJECT_TRUTH.md`：项目级 canonical routing，指向当前产品、UI、部署、数据、进度与历史证据的唯一入口。
- `docs/HISTORICAL_EVIDENCE.md`：旧 Handoff、审计、计划与 PR 的可追溯历史登记；不作为当前事实来源。
- `docs/01-definition/PRODUCT_TRUTH.md`：当前产品承诺与模块状态；旧 `CURRENT_PRODUCT_STATUS.md` 只保留为历史快照。
- `docs/01-definition/FEATURE_CATALOG.md`：当前模块功能状态与 RC 选择性迁移边界的唯一目录。
- `docs/02-design/VISUAL_BASELINE.md`：用户确认的 4317 视觉验收基线与 UI owner。
- `docs/03-development/DEPLOYMENT_STATE.md`：本地、GitHub、CI、Supabase 和部署 parity 的分层状态。
- `docs/03-development/GIT_DELIVERY_PROTOCOL.md` 与 `.github/pull_request_template.md`：唯一交付线、PR 必填事实和 branch-protection 前置条件。
- `scripts/verify-project-truth.mjs`：检查 canonical truth 路由、统一分支、PR 与功能状态词汇。
- `docs/05-validation/VISUAL_ACCEPTANCE_MATRIX.md`：正确 UI 基线与浏览器/人工验收证据的可执行对应表。
- `docs/05-validation/RELEASE_READINESS.md`：统一分支进入 RC/main 前的可复核发布门禁。
- `docs/05-validation/P0_COMPATIBILITY_ACCEPTANCE.md`：已接受的本地 P0 迁移验收案例与边界。
- `docs/05-validation/MODULE_FACT_INVENTORY.md`：跨层模块事实盘点，连接产品、UI、领域规则、Service、数据/API、测试与部署状态。
- `docs/03-development/PR_CLEANUP_RECORD.md`：历史 PR 安全关闭记录与分支保留策略。
- `docs/decisions/`：未确认的产品、数据与迁移决策；只有用户确认后才能写入 `CONTRACT.md` 或实现。
- `docs/01-definition/`：PRD、用户故事、竞品分析与当前产品状态。
- `docs/02-design/`：信息架构、交互说明、设计系统、数据模型与 AI/API 边界。
- `docs/02-design/USER_PATH_REGISTRY.md`：正式入口、三步上限、返回上下文与空状态登记。
- `docs/02-design/demos/`：养护详情 A/B/C 三套桌面与手机高保真方案及可复现原型。
- `docs/02-design/MEMORIAL_DETAIL_CONCEPTS.md`：生命纪念 A/B/C 三套视觉方案与独立详情页实施约束。
- `docs/03-development/`：技术架构、模块结构、本地运行、QA 与日志入口。
- `docs/04-planning/PRODUCT_GAPS_AND_ROADMAP.md`：证据化卡点、优先级与迭代顺序。
- `docs/LAYOUT_FEATURE_PARITY.md`：手机/桌面功能对照。
- `scripts/`：规则、契约、素材与回归断言。
- `scripts/content-import/import-catalog.ts`：本地目录内容与图片的预检、去重、版本化 Storage 上传和数据库导入工具。
- `scripts/test-visual-results.ts`：视觉结果适配、关注对象、折叠依据和规则只读性的专项断言。
- `scripts/verify-disclosure-contract.mjs`：同时扫描 `<details>` 与 `aria-expanded` 的折叠用途白名单，并验证喂养、环境、单条计划、安全内容和首页核心模块直显。
- `scripts/test-care-assessment-guidance.ts`：验证八类养护自查的范围、立即动作、禁止动作和复查内容不会串用语义。
- `scripts/test-care-category-consistency.ts` / `scripts/verify-care-category-ui.mjs`：中英文分类文章 ID 一致性，以及分类筛选、单篇打开和关闭恢复的浏览器门禁。
- `scripts/verify-task-action-closure.mjs`：验证任务路由、统一关闭、44px 决策控件，以及每日检查从草稿、生成结果到保存后的退出保护。
- `scripts/verify-responsive-route-scan.mjs`：7 种设备/语言配置 × 17 个正式地址的页面错误、横向溢出、控件越界及 44×44px 图标点击范围门禁。
- `scripts/test-species-diagnosis.ts`：单条新鱼、全缸急促呼吸、最多三问和中英文一致性规则断言。
- `scripts/test-species-batches.ts`：旧鱼缸批次回填、体态更新、拆分、追加和最后一组移除断言。
- `scripts/verify-guided-navigation.mjs`：首次引导、侧栏直达、手机体态批次和 600px 英文桌面浏览器验收。
- `scripts/verify-aquarium-home-c.mjs`：首页 C 三段任务层级、可选进阶参数、重复行动隐藏及 390–1440px 英文无溢出验收。
- `scripts/verify-species-identification.mjs`：真实手机降级流程、紧急追问、英文桌面、600–1440px 溢出和图鉴入口验收。
- `scripts/verify-core-experience.mjs`：设备布局、水族册、自适应详情、Mini、每日检查与 AI 建缸助手浏览器验收。
- `scripts/verify-mobile-care-experience.mjs`：320–430px 图鉴分页、手动养护推荐、水族册入口、缸内物种、3D 全屏列表与养护计划浏览器验收。
- `scripts/verify-wishlist-shortcut.mjs`：普通物种与具体变种快捷收藏、触控尺寸、跨页同步和水族册直达验收。
- `scripts/verify-collection-hub-previews.mjs`：水族册固定预览数量、最近排序、四类内容深链、纪念独立页补录/刷新、关闭/返回/失效恢复及桌面/窄桌面/手机布局验收。
- `scripts/test-three-step-paths.ts` / `scripts/verify-three-step-experience.mjs`：正式路径上限与每日检查、养护自查、添加生物两屏流程验收。
- `scripts/test-collection-achievements.ts`：水族册聚合与 8 枚勋章追溯断言。
- `scripts/test-memorial-service.ts`：日期/原因校验、结构化复盘更新、版本递增、旧键兼容和跨页面变更事件断言。
- `scripts/test-business-state-services.ts`：鱼缸、巡检与养护业务写入服务断言。
- `scripts/test-care-timeline.ts` / `scripts/verify-care-timeline.mjs`：时间线派生、来源幂等、循环计划和桌面/手机直达回归。
- `scripts/audit-product-actions.ts`：路由页面空操作、日志操作、原生 alert 与重复伪 CTA 审计。
- `CONTRACT.md`：三层架构、数据库、RLS、API、Repository、迁移与 AI 边界的权威契约。
- `src/types/database.ts`：camelCase 数据库与关联实体共享类型。
- `scripts/test-three-tier-contract.ts` / `scripts/test-api-boundary.ts`：三层契约与本地 API 边界回归。
- `scripts/test-business-api-contract.ts` / `scripts/test-repository-boundary.ts`：业务路由、校验、稳定 ID、安全规则与本地/云端访问边界回归。
- `scripts/test-aquarium-creation-semantics.ts` / `scripts/test-addition-intents.ts` / `scripts/test-livestock-recording.ts`：空白鱼缸语义、两类 Intent 策略与现实记录顺序/幂等专项。
- `supabase/migrations/202608090003_atomic_livestock_addition.sql`：原子创建/复用父物种、写入批次并登记幂等结果。
- `scripts/test-atomic-livestock-addition.ts` / `supabase/tests/atomic_livestock_addition.sql`：代码契约及真实 PostgreSQL 父记录成功、批次失败回滚专项。
- `apps/api/src/livestock-addition-error.ts` / `scripts/test-livestock-addition-api-errors.ts`：原子 RPC 的 404、409 与 503 错误语义映射和回归。
- `scripts/verify-aquarium-factual-flow.mjs`：真实浏览器验证创建无伪数据、规划不写入、明确现实确认后保存和旧深链兼容。
- `scripts/test-livestock-memorial-replay.ts`：已提交纪念重放先于父记录所有权查询的行为回归。
- `scripts/verify-admin-content.mjs`：内容后台列表、编辑、保存反馈、权限错误与 390/1280px 布局验收。
- `scripts/verify-localization-ui.mjs`：浏览器首选、桌面/手机设置、即时切换、持久化、触控尺寸与横向溢出验收。
- `scripts/verify-responsive-route-scan.mjs`：7 种设备/语言组合下扫描 13 个正式页面和四类养护详情，拦截页面错误、整页横向溢出与可见控件越界。
- `scripts/verify-species-detail-experience.mjs`：物种详情中英文稳定指标、唯一主操作、水族册直达和鱼缸来源已拥有状态的浏览器回归。
- `docs/01-definition/UX_REFACTOR_PRD.md`：本轮交互重构定义。
- `docs/02-design/UX_REFACTOR_CONCEPTS.md`：三套设计方向与默认自然水族册方案。
- `docs/02-design/UX_REFACTOR_INTERACTION.md`：分层表面与 CTA 契约。
- `docs/03-development/UX_REFACTOR_TECH.md`：实现架构与数据流。
- `docs/04-planning/EXTERNAL_VALIDATION_PROTOCOL.md`：真人新手任务、混养跨入口人工验收和低端真机 3D 证据表。
- `output/image_quality/manual_rework_review_2026-07-15.md`：18 张中优先级素材的逐项人工复核与两张重做门槛。
- `PROGRESS.md`：项目内进度、决策与阻塞记录。

## 内部实验

- `src/pages/ThreeDemo.tsx` 与 `/3d-demo`：3D 独立验证入口，不进入正式导航和核心发布验收。
# 2026-07-29 导出模块补充

- `src/components/export/ExportArtifactDialog.tsx`：固定宽度 PNG 预览与下载表面。
- `src/services/export/png-export.service.ts`：字体/图片就绪、1080px 渲染与本地保存。
- `src/services/export/aquarium-artifact.service.ts`：健康、诊断、计划、档案和百日纪念展示模型。
- `scripts/test-aquarium-artifacts.ts`：导出内容与隐私边界专项。
- `src/pages/SharedReport.tsx`：匿名脱敏报告页面与 PNG 下载。
- `src/services/share/aquarium-share-report.service.ts`：创建、列出、撤销和公开读取分享报告。
- `apps/api/src/routes/share-reports.ts`：令牌哈希、七天失效、owner 管理与匿名快照读取。
- `scripts/verify-share-report-ui.mjs`：390/1280px 公共报告浏览器回归。
