# AquaGuide UI/UX — Latest Badcases

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104  
**Visual implementation head:** `ef69d85e48712d27990423fcc85e23a4047f0756`  
**Visual QA:** #19 / run `32259734301` — PASS  
**System regression:** #36 / run `32259734291` — PASS

This file summarizes the new Visual QA V2 closures. PUI-BC-040..044 remain closed from the preceding UI/UX System Refactor and are still present in the canonical registry.

## PUI-BC-045 · Aquarium 在窄真实工作区重新把 3D 提到常用操作之前

- **featureId:** `daily_check`
- **severity:** medium
- **source:** `visual_qa`
- **rootCauseLayer:** `responsive_layout`
- **status:** `regression_verified`

**Symptom**  
390px 手机已经是 Today → Manage → 3D，但 768/1024 进入 desktop shell 后，大块 3D context 会重新出现在常用操作之前，把高频养护动作推到首屏以下。

**Root cause**  
Hero 是否并排已经使用 `aquarium-home` container width，但 task-first 排序仍由旧 viewport media query 控制。浏览器宽度和真实 workspace 宽度因此产生冲突。

**Fix**  
`@container aquarium-home (max-width: 719px)` 固定 Today → Manage → Context → Learn；窄工作区 3D 限制为 140–170px。只有真实 Aquarium content width ≥720px 才允许 Today + 3D balanced hero。

**Fixed by**  
`f0ea9ecad4fbace00f9f0d1fdb3cecce277d31d7`

**Regression evidence**  
`verify-uiux-aquarium-visual-hierarchy.mjs` + Visual QA #19；390/768 task-first，1024 不允许 full-width 3D 在 Manage 前成为主块，1440 恢复 balanced hero。

---

## PUI-BC-046 · 1023→1024 时侧栏突然膨胀，工作区反而变窄

- **featureId:** `responsive_detail_surface`
- **severity:** medium
- **source:** `visual_qa`
- **rootCauseLayer:** `responsive_shell`
- **status:** `regression_verified`

**Symptom**  
1023px 仍是约 76px collapsed rail；到 1024px 立即展开到约 280px，导致可用工作区出现反向宽度断崖。Aquarium、Search 等页面同时受影响。

**Expected**  
中等桌面宽度应该逐级增加信息密度，不能因为越过 1px breakpoint 反而损失数百像素业务工作区。

**Fix**  
1024–1199 使用 220px medium sidebar，保留文字导航、搜索和工具；1200+ 才恢复完整侧栏。

**Fixed by**  
`1ad85cd399634c3a9c81e39963fbd13d80a5f259`

**Regression evidence**  
1024 visual hierarchy 要求 sidebar ≤230px、workspace ≥790px；1440 要求 full sidebar ≥260px。Visual QA #19 PASS。

---

## PUI-BC-047 · Search 用 viewport 决定双列，实际内容区不足时卡片被压成窄条

- **featureId:** `species_search`
- **severity:** medium
- **source:** `visual_qa`
- **rootCauseLayer:** `responsive_layout`
- **status:** `regression_verified`

**Symptom**  
1024 viewport 下，Search 外层已经进入 Species/Care 双列，但侧栏占宽后真实工作区仍不足；Species section 内部又分两列，卡片缩到约 180–200px，标题/学名接近竖向换行。

**Expected**  
嵌套信息架构必须根据自己的 content width，而不是浏览器 viewport 判断是否并列。

**Fix**  
`.search-v2-page` 设为 `search-workspace` inline-size container；真实 Search workspace <900px 时 Species/Care 单列，≥900px 才双列。

**Fixed by**  
`1cb91612541396ec5d2ad515cc5b8f70443f8573`

**Regression evidence**  
`verify-uiux-search-density.mjs`：768/1024 stacked、1440 side-by-side、Species card ≥220px、无 horizontal overflow。Visual QA #19 PASS。

---

## PUI-BC-048 · “返回上一个任务”悬浮导航覆盖 Aquarium toolbar / onboarding / desktop header

- **featureId:** `task_entry_navigation`
- **severity:** medium
- **source:** `visual_qa`
- **rootCauseLayer:** `ui_navigation_affordance`
- **status:** `regression_verified`

**Symptom**  
全局 return-context pill 使用固定 top 值。实际截图中，手机会覆盖 Aquarium 顶部工具栏或新手起步区域，768/1024 会覆盖鱼缸身份 Header。

**Expected**  
Return context 属于 persistent navigation chrome，必须占据独立导航带，不得浮在业务内容之上。

**Fix**  
桌面为 return context 预留 top band；手机保持固定 Aquarium toolbar 原位，在 toolbar flow placeholder 之后额外预留 return band，最终 pill 从实测 toolbar 下沿之外开始，随后才进入 onboarding / Today 内容。

**Fixed by**  
`1abb9ace99284a2050560eeac919f9a09b8b82e8` + `f3c48352fcc77a09207885f8f9edae25ff7fa33d` + `ef69d85e48712d27990423fcc85e23a4047f0756`

**Regression evidence**  
`verify-uiux-aquarium-visual-hierarchy.mjs` 直接比较 return pill 与实际 `.aquarium-toolbar` / `.aquarium-onboarding-strip` / `.aquarium-desktop-header` 几何，不再用包含空白的外层 layout box。Visual QA #19 PASS；人工检查 390 / 768 / 1024 / 1440 fold screenshots 无重叠。

## Visual QA evidence quality notes

本轮还发现两类“评测证据本身”的问题，但没有把它们伪装成产品缺陷：

1. 第一版 capture harness 在 `addInitScript` 中每次 navigation 都清空 storage，导致 Aquarium 截图实际变成 Welcome。该 artifact 被判无效并废弃；现在 `/aquarium` 必须重新验证真实 dashboard 存在。
2. 第一版 return-overlap 断言拿 `.aquarium-desktop-layout` 外层 box 当可见内容边界，产生 false fail。现在只与真实可见 toolbar/onboarding/header 比较。
3. CJK package 曾因 runner 下载慢超过旧 120s timeout；CI 现在保留字体 readiness gate，同时增加 apt retries/合理超时，而不是接受 tofu 字体截图。

## Residual risks / non-claims

- 当前是 **structural visual gates + screenshot baseline**，还不是 pixel-diff golden comparator。
- Artifact retention 为 7 天；截图没有提交进仓库。
- 没有完成每一张 full-page screenshot 的人工逐像素评分。
- Bundle splitting / existing npm vulnerabilities 仍属于后续工程债务。
- PR #104 仍 Draft，未 merge，未 production deploy。
