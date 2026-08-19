# AquaGuide UI/UX — Latest Badcases

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104

## Current closure set

PUI-BC-040..050 are represented in the current UI/UX work. PUI-BC-049 is an evaluation-system failure; PUI-BC-050 is the latest product navigation failure reported by the user.

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
- Canonical badcase updates must be append-only unless a separately justified correction is explicitly required.

## Non-claims

- PR #104 remains Draft.
- No merge to RC1/main.
- No production deploy.
- Current PUI-BC-050 evidence is deterministic PR-browser evidence, not production telemetry.
