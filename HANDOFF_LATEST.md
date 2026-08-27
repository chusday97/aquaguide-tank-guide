# AquaGuide Handoff — Latest

更新时间：2026-08-25 +08:00

## 2026-08-27 Main 收敛分支

- 当前工作分支：`codex/main-core-foundation-v1`，基于 `origin/main@ed0cf380`。
- 已选择性迁移 `99865414` 与 `c822bd0e` 的 P0 混养能力；`npm run lint` 与 `npm run test:compatibility` 通过。
- 迁移台账：`.ai/MAIN_CONVERGENCE_LEDGER.md`。不得把 PR #141 整体 merge/rebase 当作同步方案。
- 尚未完成：Catalog manifest/snapshot、Supabase schema/RLS parity、当前视觉基线完整迁移、main release PR。

### Catalog 阶段新增

- 已增加 Catalog 公共契约、Supabase migration 提案、不可变快照加载器和 `/api/v1/catalog/releases/current` 只读入口。
- `npm run lint`、`npm run check:api`、`npm run test:catalog-snapshot` 均通过。
- 当前本地快照为 486 个物种、13 个证据来源；旧物种水体字段仍为 `unknown`，等待审核数据回填，禁止文本推断。
- Migration 尚未执行；API 在生产 schema 未部署前预期返回 `503/404`，这是当前已知边界，不是静默成功。

### Domain Rules 阶段新增

- `packages/domain-rules/src/compatibility.ts` 已提供纯函数兼容判断基础层和统一添加策略；专项测试通过。
- 旧 UI 引擎仍保留作兼容适配，尚未宣称已完成全量切换；下一步是 Service/Repository 使用同一 Catalog 版本重新判断。
- `LivestockAddCommand`、API body 和错误语义已增加规划加入确认门禁；生产写入仍需 Catalog 发布后补上服务端重新计算，不能把客户端确认当作最终安全边界。
- 沙箱运行 `tsx` 时曾被临时 IPC 权限阻断，需在授权环境重跑既有 `npm run test:compatibility` 作为验证证据。

## 当前工作基线

- **统一进度入口：** `.ai/PROJECT_STATE.json`。新接手者先读该文件，再读本 Handoff；不得从旧 RC、本地旧 worktree 或 PR #140 推断当前目标。
- **项目总入口：** `docs/PROJECT_TRUTH.md`。产品、UI、部署、数据与历史材料必须按它的 canonical routing 读取。
- **功能状态：** `docs/01-definition/FEATURE_CATALOG.md` 是唯一模块状态目录；不要从旧 PR 或 `PROGRESS.md` 推断功能是否当前可用。
- **发布状态：** `docs/05-validation/RELEASE_READINESS.md` 当前为 `NOT_READY`；P0 契约已接受，local compatibility input/派生服务已通过回归，Supabase exact parity 和 release acceptance 仍未完成。
- **P0 独立审查：** Critic 已复验通过；曾发现的水质映射、侵略性负荷回归、共享类型边界与自由文本误判均已有回归用例和修复。
- **唯一统一分支：** `codex/unified-rc-visual-v1`，基于用户确认的视觉 SHA `37a8d4d1`。
- **RC 定位：** `integration/aquaguide-rc1@895f2f39` 是已验证业务能力来源，不是视觉验收来源；只允许按语义选择性迁移。
- **废弃入口：** `codex/rc1-visual-convergence-v1` / PR #140 是错误的 RC-first 局部视觉迁移，不得继续作为验收或合并基准。
- **唯一 GitHub 收敛入口：** Draft PR #141，head 必须保持 `codex/unified-rc-visual-v1`；P0 业务迁移已完成，仍不得在 Supabase parity 与单独 release acceptance 前转为 Ready 或合并。
- **GitHub 门禁：** `RC Convergence V1` 会在统一分支的相关推送后自动复验；最近两次可复核运行 `32849012409`、`32849349859` 均通过（project truth、状态、lint、布局、3D 取景和 production build）。
- **PR 拓扑：** `.ai/OPEN_PR_REGISTRY.md` 已冻结 2026-08-25 的 56 个 open PR；除 #141 外均为历史输入而非收敛路径。
- **唯一日常本地目录：** `/Users/chuchu/Documents/New project/aquaguide_frontend` 已切到该统一分支；旧 `codex/rc1-visual-integration` 仅保留作历史参考，禁止继续作为工作起点。
- **Supabase 状态校正：** 用户于 2026-08-25 确认既有 Supabase 工作已部署。旧文档中“待真实 Supabase 验证”只表示当前统一分支尚未重新核对连接环境、schema revision 与 RLS 回归，绝不表示 Supabase 没有部署。

- 当前分支：`codex/unified-rc-visual-v1`
- 本地与 GitHub 的对齐提交必须每次以 `npm run project:status` 的 `sha` 为准；Handoff 不固化易过期 SHA。
- 当前产品代码 head：`90c1ad6`
- 本次 Handoff 文档更新后会产生新的 docs-only head；判断产品行为仍以 `90c1ad6` 为最新产品代码基线。
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 等历史栈存在明显分叉，后续必须 semantic reconciliation，禁止覆盖式 merge/rebase 当作“同步最新”。
- 当前状态：**alignment recovery / runtime regression hardening / 非 release-ready / 非视觉 PASS**。
- 最新 source audit：`ALIGNMENT_AUDIT_LATEST.md`。
- UI 不可变原则：`UI_REGRESSION_CONTRACT.md`。

> 下文的旧阶段记录只保留为验证和决策证据。当前产品/UI/部署状态以 `docs/PROJECT_TRUTH.md` 链接的权威文件为准。

## 当前本地 Preview（开发验收源）

- 隔离目录：`~/aquaguide-preview-current`
- 固定端口：`4317`
- Preview：`http://127.0.0.1:4317/`
- 关键路由：
  - Aquarium：`http://127.0.0.1:4317/aquarium`
  - Encyclopedia：`http://127.0.0.1:4317/encyclopedia`
  - Care：`http://127.0.0.1:4317/care`
  - Collection：`http://127.0.0.1:4317/collection`
  - 虎皮鱼直达验证：`http://127.0.0.1:4317/encyclopedia?mode=browse&species=sp_0439`
- 该 Preview 使用 production `npm run build` 产物，不是旧 Vercel Preview，也不占用现有 3000/4173 等地址。
- 日常 UI review 优先以 4317 为开发验收源；Vercel 恢复后只作为部署 parity 验收源。

## 当前不可变产品契约

1. Desktop Browsing Detail = persistent right Rail；左侧底层页面保持可见、可滚动、可继续点击。
2. 左侧切换物种/内容时 Rail 不关闭，只替换右侧内容。
3. Desktop Detail Rail 目标宽度约 **480–600px**，不得重新变成 50vw/720px split workspace。
4. Mobile Browsing Detail = bottom sheet；Task = high bottom sheet；Blocking Confirmation 才允许居中阻断。
5. responsive source of truth = viewport contract；不得恢复 UA-first device inference。
6. Aquarium >=960px = 单一沉浸舞台；status/actions 是 overlay，不得重新占列压窄 3D。
7. Three camera 是 Aquarium framing 的唯一 owner；禁止 CSS `scale()` 二次 framing WebGL canvas。
8. taxonomy 必须由 species identity 字段决定，不允许 description 中提到的其他物种污染自身分类。
9. i18n 只负责 presentation；不得修改业务 domain enum 并让 schema/rules 随语言改变。
10. UI 修复只改 canonical owner；禁止新增 `layout-v6/v7/v8` 式覆盖层。
11. GitHub head、local preview、Vercel deployed commit、browser regression、human acceptance 必须分开记录。

## 本轮新增真实回归与修复

### Species taxonomy cross-contamination — FIXED + LOCAL BROWSER VERIFIED

用户发现：点击虎皮鱼后，详情“类型”显示成孔雀鱼类型。

根因：`getSecondaryCategory()` 原来使用：

`name + scientificName + description`

虎皮鱼描述包含“严禁与天使鱼、孔雀鱼等长鳍鱼类混养”，于是 description 里的“孔雀鱼”误命中 livebearer 分类规则。

#### `b40c8a6` — `fix(species): prevent taxonomy cross-contamination`

已改为：

- taxonomy 只从 identity 字段 `name + scientificName` 推断；
- description 不再参与“它是什么类型”的分类；
- 新增 `鲃类/小型鲤科` 规则，覆盖虎皮鱼 / 一眉道人等 `Puntigrus / Puntius / Pethia / Desmopuntius / Sahyadria / Barbus`；
- taxonomy regression fixture：
  - `sp_0436 孔雀鱼` => `孔雀/月光/玛丽/剑尾`
  - `sp_0439 虎皮鱼` => `鲃类/小型鲤科`
  - `sp_0440 一眉道人` => `鲃类/小型鲤科`
- 同 commit 修复 shared Dialog 两个 TypeScript 类型问题（render-function children / functional className）。

本地验证：

- taxonomy 当前全量 **501 条 PASS**；
- `tsc --noEmit` PASS；
- production build PASS；
- 4317 浏览器直达虎皮鱼详情，已显示：
  - 虎皮鱼
  - `Puntigrus tetrazona`
  - `鲃类/小型鲤科`
  - 不再出现 `孔雀/月光/玛丽/剑尾`。

### English localization mutating domain enums — FIXED + LOCAL BROWSER VERIFIED

运行时发现：英文模式互动图鉴出现 `This group: 0`。

根因：`applyLocalization()` 原地把业务字段 `fish.housingMode` 从 canonical enum：

- `适合混养`
- `谨慎混养`
- `建议单养`

改成：

- `Compatible`
- `Caution Mix`
- `Single Specimen`

但 recommendation / fishSchema 只接受 canonical enum，导致英文浏览器中 schema validation fallback，interactive discovery batch 变空。

#### `aa1e1d9` — `fix(i18n): preserve species domain enums`

已改为：

- `housingMode` 在所有语言下保持 canonical domain enum；
- 英文文本仅在 UI render 时通过 localization helper 显示；
- Compatibility / Encyclopedia 相关展示同步改为 presentation-time localization；
- fallback `housingReason` 可以使用英文文本，但不修改 domain enum。

本地浏览器验证：

- 英文 Encyclopedia interactive scene：**6 个物种恢复正常**；
- 不再出现 `This group: 0`；
- `lint` PASS；
- taxonomy PASS；
- production build PASS。

## 之前 P0/P1 修复仍保留

### Surface responsive source of truth

已完成：

- shared `lib/layout-mode.ts`；
- 390/600/767 = phone，768/1024/1440 = desktop；
- `LayoutModeProvider` 与 shared Dialog 共用 viewport contract；
- 禁止恢复 UA-first inference。

### Aquarium camera-only framing

已完成：

- 删除 canvas CSS `scale(1.08–1.30)` 二次 zoom；
- ThreeAquarium `stage-cover` camera 成唯一 framing owner；
- local browser `Aquarium immersive stage runtime geometry` 当前 PASS。

### Encyclopedia/Care selection dock 768–1023

已完成 code-level 修复：

- selection dock/note overlay 扩展至整个 `>=768px` desktop range；
- 768–1023 采用 compact inset/image/action geometry。

## 2026-08-21 晚间新增完成项

- `cbb1e35`：taxonomy identity/water/life 全部改为 canonical identity；方氏拟腹吸鳅与古代蝴蝶鱼淡水误判修复；locale taxonomy drift = 0。
- `9a09163`：退役 `.modalCard` 720px geometry owner；Species Detail Rail 1440px 实测 600px；Care close race 同步修复。
- `b896c23`：核心 runtime tests 统一 Preview URL source，避免测试悄悄跑旧 localhost。
- `563397e`：Aquarium 14 个 active Dialog 全部显式 `surface=`；删除约 160 行永远关闭的 legacy fish detail modal；删除 Smart Recommendation visual-signature inference。
- `8e6417f`：Collection desktop 改为 creature-first navigation；1024/1440 无 center overlap；768/390 compact fallback；删除 502 行 dead `collection-book-*` CSS；旧书页 browser regression 已改为 creature-navigation contract 并接入 UI workflow。
- `7274da4`：taxonomy presentation helper 完成；英文 Species Detail / taxonomy UI 显示英文 label，但 canonical domain taxonomy 保持稳定。
- `44168a6` + `cc0960f`：远端新增 27 个水草透明素材，并注册 `sp_0487~sp_0501` 水草数据。
- `3145922`：恢复 Aquarium 主舞台 `+ 添加生物` 与 `⚙ 鱼缸设置` 常驻 icon；桌面保留全屏预览 icon；底砂/造景与水草增加内嵌搜索；搜索已覆盖新增水草（含 `sp_0498 金鱼藻`）；新增专用 browser regression。
- `f34eb29`：修复 mobile Task Sheet 双重 translate 导致半屏移出 viewport；Aquarium primary Task 入口互斥，禁止设置/添加/缸内物种 Task Rail 同时叠开；新增 Task / Detail / Blocking / Media 四类 runtime matrix 并接入 UI regression workflow。
- 同 `3145922`：`isAquaticPlantSpecies` / `isHardscapeSpecies` 改为 canonical identity 判定，修复新增水草在英文模式被误判为 fish 的 locale drift；501 条 taxonomy PASS。
- `90c1ad6`：所有业务 `DialogContent` 已显式声明 `surface=`；删除 shared Dialog 的 class/尺寸/close-button visual inference；删除 Encyclopedia 约 229 行永远关闭的 legacy detail；旧 Settings/Search/mobile Care browser tests 同步到当前真实交互。
- `2086059`：退役最后两套手写 Dialog；Species Export → Media，Compatibility Adjustment → Task；删除不可达 `conflictDetail` 分支；业务手写 `role=dialog/aria-modal` = 0；compatibility evidence audit 更新到 501 条。

## 当前最重要的未修问题

### P1 — Compatibility evidence coverage 只有 0.60%

当前 501 条物种只有 3 条 reviewed behavior profile、1 条 reviewed pair rule。抽样 12,000 个真实组合时 `behavior_evidence_unreviewed` 是主要 medium missing-data；抽样 30,000 个真实组合没有出现 `caution`。这不是 UI bug，而是证据覆盖不足。禁止降低 evidence gate 来制造“可尝试”结果；下一步应扩 reviewed evidence + citation + confidence。

### P1 — Human visual acceptance / deployment parity 尚未完成

Identify、Aquarium Surface、Collection 子页、Settings guard、Search → Detail 与 28-case 全页面 matrix 均已 browser 验证。剩余是用户人工视觉验收、Vercel 同 SHA parity，以及后续新改动持续回归。

### P2 — Remaining stale-test / dead-style debt

`window.confirm` = 0；业务手写 `role=dialog` / `aria-modal` = 0；所有业务 DialogContent 显式 `surface=`。剩余主要是旧测试/死样式和最终分支 semantic reconciliation。

## 当前测试 / 证据状态

当前最新本地 product/test baseline（基于 `2086059`）：

- `npm run lint` / `tsc --noEmit`：PASS
- `npm run test:taxonomy`：PASS（**501 条**；locale taxonomy drift 0；新增水草在中英文下保持 plant taxonomy）
- `npm run test:layout-mode`：PASS
- `npm run test:three-stage-framing`：PASS
- UI regression governance：PASS
- production `npm run build`：PASS
- Species Detail persistent Rail runtime：PASS（1440px computed width 600px，贴右、满高、背景不锁、切换物种不关闭）
- Care Detail Rail open/close runtime：PASS（URL close race 已修）
- Interactive Encyclopedia scene：PASS
- Aquarium immersive stage browser geometry：PASS
- Collection creature-navigation runtime：PASS（1440/1024 creature nav；768/390 compact fallback；hover 不裁切；node 不覆盖 center）
- Tiger barb / hillstream loach / African butterfly fish browser taxonomy：PASS
- Aquarium primary tools runtime：PASS（1440/1024/390 添加 + 设置可见、在舞台内且不覆盖缸内物种入口）
- Aquarium settings inline search runtime：PASS（底砂 `溪流砂`、水草 `小水榕`、新增水草 `金鱼藻` 均可过滤命中）
- Aquarium Surface runtime matrix：PASS（desktop Task 单 Rail/无 overlay；mobile Task 完整贴底；Blocking 居中 modal；Media 居中 modal；desktop Detail 600px Rail；mobile Detail 68dvh bottom sheet；Task→Detail 不叠层）
- Settings unsaved-feedback navigation guard：PASS（shared Blocking，不再依赖 native confirm）
- Search → Species Detail：PASS；Atlas/Care/global/sidebar search regressions 已对齐当前 scene→browse 产品路径
- Collection wishlist/care/memorial 子页与返回路径：PASS
- Mobile Care end-to-end regression：PASS
- Identify identity→optional health triage + unsaved navigation guard：PASS
- Full-page runtime matrix：PASS（7 routes × 4 viewports = **28/28**；无 horizontal overflow / initial dialog / body-lock / pageerror）
- Admin unsaved-change / status confirmation：PASS（shared Blocking；全仓 `window.confirm` = 0）
- Species export Media regression：PASS（variant switch / PNG / print）
- Business hand-built dialog semantics：0；governance PASS
- Compatibility evidence audit：501 total / 3 reviewed / 1 pair rule / **0.60% coverage_gap**

注意：以上属于 local build/browser evidence，不等于用户已经完成视觉验收；human visual PASS 仍未授予。

## Local → Vercel parity 规则

后续 Vercel 恢复部署后，只有满足以下条件才能说“线上与本地一致”：

1. Vercel deployed Git SHA == 已通过 local review 的 product SHA；
2. 使用相同 viewport / language / localStorage seed；
3. 同一套 browser regression 同时跑 Local 和 Vercel；
4. 关键 computed geometry 一致；
5. 用户人工 review 后才标 human PASS。

Vercel build-rate-limit 不再阻塞日常 UI 修复；local 4317 是开发验收源，Vercel 是部署验收源。

## 下一步执行顺序

### Step 1 — 扩 Compatibility reviewed evidence

- 保持 `behavior_evidence_unreviewed` 的严格门槛，不通过降级规则制造可用结果；
- 优先补高频淡水物种的 reviewed behavior profile；
- 每条必须有 citation / confidence / reviewStatus；
- 持续运行 evidence coverage audit，覆盖率只能上升不能回退。

### Step 2 — Human visual baseline + Vercel parity

- 继续使用 `http://127.0.0.1:4317/` 作为开发验收源；
- 用户确认当前视觉后才建立 screenshot golden baseline；
- Vercel deployed SHA 必须等于已验收 product SHA；
- Local / Vercel 使用同一 seed 与 regression 做 parity。

### Step 3 — stale test / dead CSS / branch reconciliation

- 清其他 dead CSS / stale test；
- main/RC1/#104/#105 semantic reconciliation，禁止覆盖式 merge。

## 禁止事项

- 不因为 Vercel 没刷新就把代码改回旧 Preview 的样子。
- 不用截图肉眼估计替代 computed geometry。
- 不用 description/translation 改写 domain identity 或 enum。
- 不为了旧测试 PASS 恢复已经否定的 split workspace。
- 不继续新增 versioned CSS override。
- 不直接 merge `main` 或旧 UX 分支解决“缺失修改”。

## 可信边界

- GitHub commit 存在 ≠ UI PASS。
- local build PASS ≠ 所有 runtime path PASS。
- browser regression PASS ≠ human visual acceptance。
- Vercel success ≠ deployed SHA 一定是当前 review SHA。
- source audit ≠ runtime audit。
- 当前已无已知 720px Detail Rail / Surface runtime P0；最高优先未完成项转为 **Compatibility reviewed evidence coverage + human visual/Vercel parity**。

同时参考：`ALIGNMENT_AUDIT_LATEST.md`、`UI_REGRESSION_CONTRACT.md`、`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`SURFACE_INVENTORY_LATEST.md`。
