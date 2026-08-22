# AquaGuide UI/UX — Latest Badcases

**Date:** 2026-08-20  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104

## Current closure set

PUI-BC-040..052 are represented in the current UI/UX work. PUI-BC-049 is an evaluation-system failure; PUI-BC-050 is the prior user-reported compatibility navigation failure; PUI-BC-051/052 are the Navigation Context audit closure.

## PUI-BC-051 · Search 深层结果返回后列表状态丢失

- **featureId:** `species_search`
- **source:** `navigation_context_audit`
- **severity:** medium
- **rootCauseLayer:** `navigation_state`
- **status:** `regression_verified`

### Symptom

Search 点击“查看全部”后，如果用户打开 Species 第 19 个以后或 Care 第 13 篇以后的结果，关闭详情回到 Search 时列表会重新折叠。原结果不再存在于 DOM，因此旧的 source focus restore 无法真正恢复用户上下文。

### Root cause

旧 Search 只在 `sessionStorage` 保存单个 `sourceId`。页面 remount 后 `showAllSpecies/showAllCare` 都重新初始化为 `false`，随后再尝试 `scrollIntoView + focus`；对于 preview 边界之外的结果，目标节点根本不存在。旧逻辑也没有记录真实 `.desktop-workspace-scroll.scrollTop`。

### Fix

Search return context 现在统一保存：

- query；
- source result ID；
- Species/Care 两个 show-all 状态；
- workspace `scrollTop`。

返回时先恢复列表结构，再恢复精确 workspace scroll 与 source focus；query 改变时清除旧 context，防止跨搜索词误恢复。

### Evidence

- Fail-before: Navigation Context V1 #1 / run `32280048039` — TypeScript/build/Chromium 均通过后，深层 Species 返回等待原 result 45 秒仍不存在于 DOM。
- Fix: `9feaac4d90fef5ce2e4665154f9554759e15f591`。
- Evaluator correction: `7a736ef6349b4b77dceaf240c1fc61f96f769b98` — Playwright `.click()` 会在产品 click-handler 捕获前自动滚动，改为已可见卡片的坐标点击，避免用不同时间点 scroll 制造假失败。
- Search-only verified: Navigation Context V1 #3 / run `32280704349` — deep Species + Care 的 expansion / target / focus / workspace scroll 全 PASS。
- Final combined verified: Navigation Context V1 #9 / run `32282629416` on head `0c7d28ec647359f3b6e4a1afd1fd1e9a908f4bfc` — PASS。

## PUI-BC-052 · Aquarium 子详情关闭后少返回一层 roster

- **featureId:** `livestock_state_task`
- **source:** `navigation_context_audit`
- **severity:** medium
- **rootCauseLayer:** `nested_surface_navigation`
- **status:** `regression_verified`

### Symptom

真实路径 `Aquarium → 缸内物种 roster → 某个物种详情 → 关闭详情` 会掉回 Aquarium 首页的“缸内物种”入口，而不是返回刚才的 roster。用户从父任务工作面进入子详情，关闭子详情后上下文少了一层。

### Root cause

roster 打开物种详情前会关闭自身；Aquarium 原有 `WorkspaceNavigationContext` 只记录页面级 `#aquarium-records` source。`closeAquariumSpeciesDetail` 因此只能恢复底层 Aquarium page scroll/focus，不知道子详情来自哪个 roster record，也不知道 roster 内部 scroll。

### Fix

在共享 surface 边界实现嵌套返回，不扩大修改到巨大 `Aquarium.tsx`：

- `SpeciesDetailDialog` 在真实用户 dismissal 时发送带 `source + fishId` 的 `aquaguide:species-detail-dismissed`；
- `LivestockRosterDialog` 仅在从 roster 打开 detail 时记录 `recordId + fishId + roster scrollTop`；
- 等 child detail 的退出动画真正结束后才重新打开父 roster，避免两个 focus trap 同时有效；
- roster 重新打开后恢复内部 scroll，并把键盘焦点还给原物种 profile button；
- 从 3D 鱼缸等其他入口打开 Species Detail 不会触发这条 roster return path。

### Evidence

- Evaluator ambiguity: Navigation Context #4 / run `32281110657` 最初用通用 `right-drawer:visible` 同时命中 roster 退出动画和 child detail，不能作为产品失败证据；随后改成 `data-detail-kind` 精确区分父/子工作面。
- True fail-before: Navigation Context #5 / run `32281408153` — child Species Detail 已关闭后等待原 roster 45 秒仍未重新出现。
- Fix commits: `28fb8a796bfd1b6b290daf74284945296daff9a3` + `dbf5546e99306ba078a723115451dcf12123a3b7`。
- Navigation Context #7 已验证 parent roster reopening。
- Evaluator-only #8 failure来自 `waitForFunction` 内误写 TypeScript generic syntax，产品 roster 已恢复；修正为纯浏览器 JavaScript 后不改变产品实现。
- Final combined verified: Navigation Context V1 #9 / run `32282629416` — parent roster 重新打开、底层 Aquarium workspace 保持、焦点回到 `stock-1` 原 profile button，Search 两条链同时 PASS。

## PUI-BC-050 · 风险复核误跳混养 + 混养进入后 Atlas 跳到底部

- **featureId:** `compatibility`
- **source:** `user_review`
- **severity:** medium
- **rootCauseLayer:** `navigation_semantics`
- **status:** `regression_verified`

### Symptom

在 `not_recommended` 物种详情中，底部风险/混养行动会直接跳到完整混养计算，而不是先让用户查看当前物种的风险与替代/混养证据。与此同时，进入 `/encyclopedia?mode=compatibility` 后，Atlas 会主动滚到页面深处的 `#compatibility-calculator`，造成“图鉴被下拉到最底部”的体验。

### Root cause

两个独立导航行为叠加：

1. `SpeciesDetailDialog` 对 unsuitable / conflictRisk / caution footer action 直接调用 `onGoCalculator()`。
2. `Encyclopedia` 在 `mode=compatibility` 时又调用 `navigateToSection('compatibility-calculator')`。但真正的 `CompatibilityRiskCalculator` 本身是 fixed top-level drawer，因此这个深锚点滚动既没有必要，也会污染 Atlas 的 scroll context。

### Fix

详情风险复核改成二阶段：

- 第一次点击：不换 URL、不关闭详情，展开现有 `混养关系 / Compatibility` disclosure。
- 用户已经明确展开并看过 Compatibility evidence 后，再次执行 footer action 才允许进入完整计算器。
- Dedicated calculator action 仍保留原有完整计算器导航。

Compatibility 模式则作为顶层工作面处理：

- full calculator 继续使用现有 fixed `compatibility-checkout-drawer`；
- Atlas browse surface 在该模式下退出底层布局；
- underlying `.desktop-workspace-scroll` 保持靠近顶部，不恢复深部/底部 Atlas scroll；
- direct `/encyclopedia?mode=compatibility` 与详情二阶段跳转遵守同一规则。

### Fixed by

- `d91a227a58ea6383a2f654d70b54d946f0d2f121`
- `0c0189edb9dd707a8e83409dee15b3705ef78d29`

Regression/evaluator support:

- `c5e9e8762a66150e62217125bb7c7245ee53d137`
- `61dc5acacbfa388cd2ac049ecd99ddc412bda3dc`
- `240b74080164c8756b071528a25d73d2491a49c2`
- `34b4a898ea16dfd8fe85628c29a75265ef8bc409`

### Regression evidence

`UI UX System Refactor V1 #69` / run `32275254732` on implementation head `34b4a898ea16dfd8fe85628c29a75265ef8bc409` passed all of the following:

- first not-recommended footer click keeps URL unchanged;
- species detail stays visible for in-context review;
- Compatibility evidence becomes `aria-expanded=true`;
- second-stage navigation reaches `/encyclopedia?mode=compatibility`;
- actual `[data-surface="compatibility-checkout-drawer"]` is visible from the viewport top;
- drawer occupies the expected workspace height;
- Atlas workspace `scrollTop <= 120` and is not near its maximum scroll depth;
- direct Compatibility route obeys the same surface contract;
- no page errors in the two flows;
- Search hierarchy, Collection IA, GP-005 and the full 7×17 responsive route scan also pass.

Same implementation head also passed:

- UI UX Visual QA V2 #52
- UI UX Golden V3 #14
- Bundle Audit V1 #7

Canonical registry append commit: `1e7eea5d7f4326b161d6ecbd953ba3394e1fe564`. Compare against the implementation head is exactly **+1 / -0**, so historical badcases were not rewritten.

## PUI-BC-049 · Golden comparator 1024 跨语言舍入假失败

- **featureId:** `evaluation_system`
- **severity:** medium
- **rootCauseLayer:** `evaluation_contract`
- **status:** `regression_verified`

Python banker’s rounding and JavaScript `Math.round()` disagreed on `112.5`, so approved 1024×900 reference geometry became 128×112 vs 128×113. `manifest.json` thumbnail dimensions are now authoritative. Tight Golden V3 cohort remains green; this was evaluator drift, not UI drift.

## Prior UI/UX closure retained

- PUI-BC-040 — Collection top-level IA moved from rail/list semantics to 3-live-module focus carousel; Achievements removed from primary business IA.
- PUI-BC-041 — typography/design token ownership converged on the foundation layer.
- PUI-BC-042 — Search Care results gained explicit show-all parity.
- PUI-BC-043 — inactive carousel focusability + sub-44px named controls closed.
- PUI-BC-044 — iPad widthless UA fallback ordering corrected.
- PUI-BC-045 — narrow Aquarium workspace keeps task-first hierarchy.
- PUI-BC-046 — 1024 sidebar width cliff removed.
- PUI-BC-047 — Search nested layout now follows real content width.
- PUI-BC-048 — return-context navigation band no longer overlaps Aquarium chrome/content.

## Evidence-quality rules retained

- Do not validate user-visible state from labels alone when deterministic status/data attributes exist.
- Test the real visible surface, not a zero-layout wrapper around a fixed child.
- Navigation tests must distinguish “review evidence” from “change task/mode”.
- Scroll restoration is part of navigation correctness; a route may be technically correct while landing the user in the wrong viewport position.
- Nested task surfaces must restore the immediate parent task before the broader page context.
- Browser regression code executed inside `waitForFunction/evaluate` must be valid plain JavaScript; TypeScript-only syntax is evaluator drift.
- Canonical badcase updates must be append-only unless a separately justified correction is explicitly required.

## Non-claims

- PR #104 remains Draft.
- No merge to RC1/main.
- No production deploy.
- PUI-BC-051/052 evidence is deterministic PR-browser evidence, not production telemetry.
