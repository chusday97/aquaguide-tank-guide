# AquaGuide UI/UX System Refactor — Badcases

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104  
**Final implementation validation:** UI UX System Refactor V1 #9 / run `32251342843` — PASS

## PUI-BC-040 · Collection 主 IA 有横滑能力，但缺少唯一视觉焦点

- **featureId:** `collection`
- **severity:** medium
- **source:** `uiux_system_refactor`
- **rootCauseLayer:** `information_architecture`
- **status:** `regression_verified`

**Symptom**  
水族册已经能横向浏览，但顶层仍是 rail/list 心智模型，没有唯一 active card；同时 Achievements 建设中模块继续占据主浏览 IA 的四分之一。

**Expected**  
顶层只保留可完成的 live modules，以 center-focus carousel 表达当前对象；building feature 退出主业务 IA，作为低权重 coming-next 信息面。

**Fix**  
Wishlist / Care / Memorial 三个 live module 进入 focus carousel；Achievements 移至独立 `data-collection-coming-soon` surface，无业务 CTA。详细 Wishlist/Care 内容继续使用 horizontal snap rails。

**Regression evidence**  
`test:collection-swipe-cards` + `verify-collection-hub-previews` + GP-005；最终 run `32251342843` 验证 390 / 600 / 1440 三个宽度、3 live modules、2 visible neighbors、1 active、无 page overflow、上下文恢复 PASS。

---

## PUI-BC-041 · Design token 存在多个事实源

- **featureId:** `typography_system`
- **severity:** medium
- **source:** `uiux_system_refactor`
- **rootCauseLayer:** `design_system`
- **status:** `regression_verified`

**Symptom**  
`ui-v2-foundation.css` 与 `typography-system.css` 同时定义 `--type-*` token，页面和共享组件可能从不同层拿到字号/字重，容易出现后续视觉漂移。

**Expected**  
UI V2 foundation 是 typography / spacing / radius / elevation 唯一 token source；semantic typography 只消费 token，不重新定义。

**Fix**  
移除 compatibility layer 中重复的 type token；保留 semantic roles 和 task-surface compatibility。Typography regression 改为验证最终 token ownership 与消费路径，而不是锁死旧 JSX class。

**Regression evidence**  
`test:typography-system` + `test-uiux-system-contract`；最终 run `32251342843` PASS。

---

## PUI-BC-042 · Search 的 Care 结果有数量但没有完整访问路径

- **featureId:** `species_search`
- **severity:** medium
- **source:** `uiux_system_refactor`
- **rootCauseLayer:** `ui_action_wiring`
- **status:** `regression_verified`

**Symptom**  
全局 Search 的 Care 结果会展示总数，但列表固定 `slice(0,12)`；Species 已有 show-all，Care 没有，两个结果域交互不对称。

**Expected**  
首屏仍保持有限 preview，但用户显式要求查看全部时，应使用同一计数口径渲染全部匹配结果。

**Fix**  
新增 `showAllCare` 与结果区 `data-search-show-all="care"`；同时保留 Species 的显式展开路径，并在新 query 时重置 expansion。

**Regression evidence**  
`verify-search-show-all-v2.mjs`；最终 run `32251342843`：`species=372; care(鱼)=33`，两组结果均从 preview 展开到全部 PASS。

---

## PUI-BC-043 · 非 active 轮播卡仍可进入键盘焦点，且部分具名控件低于 44px

- **featureId:** `responsive_detail_surface`
- **severity:** high
- **source:** `responsive_regression`
- **rootCauseLayer:** `accessibility`
- **status:** `regression_verified`

**Symptom**  
初次 full responsive scan 发现两类问题：非 active carousel card 虽然 `aria-hidden` 且视觉弱化，但内部按钮仍可能进入键盘 focus order；Care 多个来源/图片具名控件只有 28×28、约 34px 宽或 40px 高。

**Expected**  
非 active carousel content 对键盘和辅助技术不可交互；明确具名交互目标至少达到 44×44px。

**Fix**  
非 active carousel wrapper 增加 `inert={!isActive}`；全站 `button[aria-label]` / `a[aria-label]` 统一获得 44px minimum target。Responsive scanner 只忽略真正位于 `[inert]` / `[aria-hidden=true]` 中的 intentionally inactive controls，不做 route-specific whitelist。

**Regression evidence**  
`test-uiux-system-contract` + `test:responsive-routes`；最终 run `32251342843` 完成 **7 profiles × 17 routes PASS**。

---

## PUI-BC-044 · viewport 缺失时 iPad fallback 被 Mobile Safari 误判成 phone

- **featureId:** `responsive_detail_surface`
- **severity:** medium
- **source:** `ci_fail_before`
- **rootCauseLayer:** `responsive_layout`
- **status:** `regression_verified`

**Symptom**  
真实浏览器已经 width-driven，但当 `viewportWidth` 不可用时，iPad UA 因包含 `Mobile Safari` 被 generic phone regex 提前命中。

**Expected**  
正常浏览器始终使用可用宽度；只有 width 缺失时才使用 UA fallback，且 Tablet/iPad 判断优先于 generic mobile pattern。

**Fix**  
`LayoutModeProvider` 保持 viewport-first；fallback 顺序改为 Tablet/iPad → phone → UA Client Hint/default。

**Regression evidence**  
第一次 UI UX System CI fail-before 暴露问题；修复后 `test:layout-mode` 的 5 个 viewport cases + 4 个 fallback cases PASS，最终 run `32251342843` 全绿。

## Residual risks

本轮没有把以下事项伪装成已完成：全站 pixel-diff visual baseline、bundle code-splitting、npm audit vulnerability remediation。它们是后续工程/视觉治理项，不属于上述 Badcase 的 closure 条件。