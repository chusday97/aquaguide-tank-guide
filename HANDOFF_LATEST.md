# AquaGuide Handoff — Latest

更新时间：2026-08-21 18:53 +08:00

## 当前工作基线

- 当前分支：`codex/interactive-parity-v3`
- 当前产品代码 head：`aa1e1d9ecc2ff2e84a3ea6c3ce726097e90d6d36`
- 本次 Handoff 文档更新后会产生新的 docs-only head；判断产品行为仍以 `aa1e1d9` 为最新产品代码基线。
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

- taxonomy 全量 486 条 PASS；
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

## 当前最重要的未修问题

### P0 — Species Detail Rail 实际宽度仍为 720px

本地 4317 browser regression 已真实测到：

- viewport：1440px
- Detail DOM 已有：
  - `data-dialog-surface="detail"`
  - `data-surface="detail-rail"`
  - `data-detail-behavior="persistent-browse-rail"`
- class 中也包含目标 `w-[clamp(480px,42vw,600px)]`
- **但浏览器最终 computed width = 720px，left = 720px**。

这说明仍有 legacy CSS / split-workspace rule 在 cascade 中覆盖 shared Rail geometry。

产品契约要求：1440px 下应真实落在 **480–600px**，不得使用 50vw / 720px。

下一步必须：

1. 找到最终覆盖 width 的 legacy selector/source；
2. 删除错误 owner，不允许再追加一个 `!important width:600px` 补丁；
3. browser regression 在 1440/1024/768/390 读取 `getComputedStyle + boundingBox`；
4. 1440 desktop Rail 宽度必须 480–600px；
5. 左侧仍可点击另一物种且 Rail 不关闭。

### P1 — Aquarium legacy Surface semantics 仍未显式化

`Aquarium.tsx` 仍有大量 direct `DialogContent`，目前部分依赖 auto inference。

目标分类：

- Daily Check article / water-change guide => Detail
- all reminders / observation / Smart Recommendation / conflict resolution / data backup => Task
- delete / exit draft => Blocking
- tank preview => Fullscreen/Media

要求：逐步改成显式 `surface=`，最终删除基于 `max-width/radius` 的 legacy visual-class inference。

### P1 — Collection Hub visual completion

当前交互已有：

- marine nodes；
- hover/focus subdivision；
- active module；
- center content；
- mobile fallback。

但 desktop 仍偏“鱼 + 玻璃卡片”，未完成用户要求的“海洋生物本身就是悬浮导航”。

### P1 — Full-page runtime alignment 尚未重新验收

source-level audit 不能代替浏览器验收。用户已明确反馈“很多以前的问题仍存在/又回退”。

后续必须按 runtime matrix 重新检查，而不是从源码推断“应该已经修好”。

## 当前测试 / 证据状态

当前最新本地 product build（基于 `aa1e1d9`）：

- `npm run lint` / `tsc --noEmit`：PASS
- `npm run test:taxonomy`：PASS（486 条）
- `npm run test:layout-mode`：PASS
- `npm run test:three-stage-framing`：PASS
- static persistent detail contract：PASS
- production `npm run build`：PASS
- Aquarium immersive stage browser geometry：PASS
- English interactive scene：PASS，6 nodes
- Tiger barb taxonomy browser check：PASS
- Detail Rail browser geometry：**FAIL — 720px**

注意：部分 browser regression 脚本仍含旧交互假设，已在本地开始修正；测试若与当前明确产品契约冲突，先修 test contract，不能为了过旧测试把产品改回旧交互。

## Local → Vercel parity 规则

后续 Vercel 恢复部署后，只有满足以下条件才能说“线上与本地一致”：

1. Vercel deployed Git SHA == 已通过 local review 的 product SHA；
2. 使用相同 viewport / language / localStorage seed；
3. 同一套 browser regression 同时跑 Local 和 Vercel；
4. 关键 computed geometry 一致；
5. 用户人工 review 后才标 human PASS。

Vercel build-rate-limit 不再阻塞日常 UI 修复；local 4317 是开发验收源，Vercel 是部署验收源。

## 下一步执行顺序

### Step 1 — P0：彻底修掉 720px Detail Rail 回退

- 定位 cascade/source；
- 删除 legacy 50vw/720px owner；
- 不新增 override 文件；
- 1440/1024/768/390 browser geometry regression；
- 连续切换物种验证 Rail 保持打开。

**退出条件：** 1440 width ∈ [480,600]；height 到 viewport 底部；left page 可交互；切换物种不关闭。

### Step 2 — P0/P1：做一轮真实页面 runtime alignment matrix

逐页检查：

- Aquarium
- Encyclopedia
- Care
- Collection Hub
- Collection wishlist/care/memorial
- Identify
- Settings
- Search

每页记录：`PASS / REGRESSION / PARTIAL / NOT VERIFIED`，并给截图/geometry/interaction 证据。

优先关注用户反复指出的问题：

- Popup direction/width/height；
- scene 是否到底；
- background 是否可操作；
- object switching 是否保持 detail；
- 1024 / 768 是否再次退回 stacked layout；
- 数据/类型是否随语言或状态改变。

### Step 3 — Aquarium Surface explicit semantics

先处理用户主路径，不碰后台：

1. Smart Recommendation
2. Daily Check article
3. water-change guide
4. observation
5. reminders
6. conflict resolution
7. fullscreen/media preview
8. destructive confirmation

每一个都显式声明 surface，不再依赖 class inference。

### Step 4 — Collection Hub visual completion

在结构稳定后再做：

- 弱化/移除玻璃卡片；
- 海洋生物图形成为真正导航主体；
- hover/focus 才露出标签与细分；
- active node 有空间移动/聚焦，而不是普通 card selected state。

### Step 5 — Human visual baseline + Vercel parity

- 本地 4317 人工确认一版；
- 才建立 screenshot golden baseline；
- 等 Vercel 可部署时，确认 deployed SHA 完全相同；
- 同一 regression matrix 对比 Local/Vercel；
- 通过后才进入 release candidate。

### Step 6 — 最后清 debt

- 删除 `.collection-book-*`、旧 aquarium grid、旧 split-workspace 等 dead CSS；
- 删除 Dialog visual signature inference；
- 处理 Admin native confirm；
- 做 main/RC1/#104/#105 semantic reconciliation。

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
- 当前最明确仍未关闭的 UI P0：**Detail Rail 720px regression**。

同时参考：`ALIGNMENT_AUDIT_LATEST.md`、`UI_REGRESSION_CONTRACT.md`、`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`SURFACE_INVENTORY_LATEST.md`。
