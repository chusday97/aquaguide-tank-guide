# AquaGuide Handoff — Latest

更新时间：2026-08-21 21:24 +08:00

## 当前工作基线

- 当前分支：`codex/interactive-parity-v3`
- 当前产品代码 head：`f34eb29`
- 本次 Handoff 文档更新后会产生新的 docs-only head；判断产品行为仍以 `f34eb29` 为最新产品代码基线。
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 等历史栈存在明显分叉，后续必须 semantic reconciliation，禁止覆盖式 merge/rebase 当作“同步最新”。
- 当前状态：**alignment recovery / runtime regression hardening / 非 release-ready / 非视觉 PASS**。
- 最新 source audit：`ALIGNMENT_AUDIT_LATEST.md`。
- UI 不可变原则：`UI_REGRESSION_CONTRACT.md`。

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

## 当前最重要的未修问题

### P1 — Full-page runtime alignment 仍需继续扩展

当前主路由 smoke 在 1440/1024/768/390 已完成基础 overflow/page-error 检查，核心 runtime gates 也通过；仍需继续覆盖：Aquarium 四类显式 Surface 的代表路径、Collection 子页、Identify 完整流程、Settings 导航 guard、Search → Detail。

### P2 — Shared Dialog legacy inference 尚未全部退役

Aquarium 已不再依赖 visual signature inference；但 Encyclopedia species-group 等少数 legacy direct Dialog 仍通过 `max-w/radius` 临时推断 Detail。最终目标仍是所有业务 callsite 显式声明 `surface=` 后删除这类视觉猜测。

### P2 — 后台与 legacy confirm debt

AdminContent 等内部页面仍有原生 `window.confirm`/legacy confirmation debt；不影响当前普通用户主路径，但在 release candidate 前应统一。

## 当前测试 / 证据状态

当前最新本地 product build（基于 `f34eb29`）：

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

### Step 1 — 扩展真实 runtime alignment matrix

优先覆盖：

1. Aquarium 14 个 explicit Surface 的关键代表路径（Task / Detail / Blocking / Media）；
2. Collection wishlist/care/memorial 子页和返回路径；
3. Identify 未保存退出；
4. Settings 未提交反馈导航 guard；
5. Search → Species Detail；
6. 1440 / 1024 / 768 / 390 的 popup geometry 与 horizontal overflow。

所有结果记录为 `PASS / REGRESSION / PARTIAL / NOT VERIFIED`，不再以 source audit 代替 runtime。

### Step 2 — 退役剩余 Dialog visual inference

- Encyclopedia species-group 改为显式 Detail Surface；
- 扫描其他 direct `DialogContent`；
- 当所有用户主路径均显式后，删除 `max-width/radius` inference；
- CI 禁止新增 visual-signature inference。

### Step 3 — Human visual baseline + Vercel parity

- 继续使用 `http://127.0.0.1:4317/` 作为开发验收源；
- 用户确认当前视觉后才建立 screenshot golden baseline；
- Vercel 恢复时 deployed SHA 必须等于已验收 product SHA；
- Local / Vercel 使用同一 state seed 与 browser regression 做 parity。

### Step 4 — 最后清内部 debt

- Admin native confirm；
- 其他 dead CSS / stale test；
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
- 当前已无已知 720px Detail Rail P0；最高优先未完成项转为 **English taxonomy presentation + extended runtime alignment**。

同时参考：`ALIGNMENT_AUDIT_LATEST.md`、`UI_REGRESSION_CONTRACT.md`、`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`SURFACE_INVENTORY_LATEST.md`。
