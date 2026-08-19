# AquaGuide UI/UX — Latest Badcases

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104

## Current closure set

PUI-BC-040..044 remain closed from the UI/UX System Refactor. Visual QA V2 closed PUI-BC-045..048. Visual QA V3 adds one evaluation-system badcase, PUI-BC-049; it is **not** a product UI failure.

Authoritative visual references:

- V2 broad baseline: #19 / run `32259734301` — PASS
- V3 tight-threshold golden validation: #3 / run `32265296046` — 8/8 PASS, all 0% changed
- canonical-closeout Golden V3: #4 / run `32267440206` — PASS
- canonical-closeout System: #59 / run `32267440195` — PASS

## PUI-BC-045 · Aquarium 窄工作区任务层级回退

- **featureId:** `daily_check`
- **severity:** medium
- **rootCauseLayer:** `responsive_layout`
- **status:** `regression_verified`

390px 已是 Today → Manage → 3D，但 768/1024 desktop shell 曾重新把大块 3D 放到常用动作之前。根因是 Hero 用 content container 判断，而 task-first 排序仍用 viewport media query。

Fix: `aquarium-home` container 驱动任务排序；窄真实工作区保持 Today → Manage → 3D → Learn，宽度足够才恢复 Today + 3D balanced hero。

Primary fix: `f0ea9ecad4fbace00f9f0d1fdb3cecce277d31d7`.

## PUI-BC-046 · 1024px sidebar width cliff

- **featureId:** `responsive_detail_surface`
- **severity:** medium
- **rootCauseLayer:** `responsive_shell`
- **status:** `regression_verified`

1023px 约 76px collapsed rail，1024px 曾直接膨胀到约 280px，导致越过 breakpoint 后业务工作区反而更窄。

Fix: 1024–1199 使用 220px medium sidebar；1200+ 才恢复 full sidebar。

Primary fix: `1ad85cd399634c3a9c81e39963fbd13d80a5f259`.

## PUI-BC-047 · Search 用 viewport 判断嵌套双列

- **featureId:** `species_search`
- **severity:** medium
- **rootCauseLayer:** `responsive_layout`
- **status:** `regression_verified`

1024 下实际 Search workspace 不足，却曾先按 viewport 进入 Species/Care 双列，内部 Species 再双列，结果卡被压到约 180–200px。

Fix: `.search-v2-page` 使用 named inline-size container；真实 Search workspace <900px 时纵向，≥900px 才并列。

Primary fix: `1cb91612541396ec5d2ad515cc5b8f70443f8573`.

## PUI-BC-048 · Return-context 覆盖 Aquarium chrome/content

- **featureId:** `task_entry_navigation`
- **severity:** medium
- **rootCauseLayer:** `ui_navigation_affordance`
- **status:** `regression_verified`

全局 `返回上一个任务` fixed pill 曾覆盖手机 Aquarium toolbar/onboarding 或桌面 Aquarium identity header。

Fix: return context 获得独立 navigation band。手机顺序为 toolbar → return → onboarding/Today；桌面为 return → Aquarium header。回归直接比较真实可见 toolbar/onboarding/header 矩形，而不是外层 layout 空白区。

Relevant fixes: `1abb9ace99284a2050560eeac919f9a09b8b82e8`, `f3c48352fcc77a09207885f8f9edae25ff7fa33d`, `ef69d85e48712d27990423fcc85e23a4047f0756`.

## PUI-BC-049 · Golden comparator 的 1024 缩略图出现跨语言舍入假失败

- **featureId:** `evaluation_system`
- **severity:** medium
- **source:** `ci_fail_before`
- **rootCauseLayer:** `evaluation_contract`
- **status:** `regression_verified`

**Symptom**  
Golden V3 #1 / run `32264392607` 中，Aquarium/Search 的 1024×900 case 在真正像素 diff 前就失败：reference 是 128×112，JavaScript verifier 却要求 128×113。

**Root cause**  
`900 × 128 / 1024 = 112.5`。reference 生成使用 Python `round()`（banker’s rounding → 112），verifier 使用 JavaScript `Math.round()`（→113）。同一个批准 UI 因实现语言的舍入语义不同而被误判。

**Evidence this was evaluator failure, not UI drift**  
同一 #1 run 的其余 6 个 golden case 已是 0% changed。

**Fix**  
`manifest.json` 的 `thumbWidth` / `thumbHeight` 成为唯一、显式、语言无关的 normalization geometry contract；verifier 不再重新计算高度。

**Fixed by**  
`1eea45dfea367a571daf123836348c79f67e517f`

**Regression evidence**  
- Golden V3 #2 / run `32264776117`: 8/8 PASS, all 0%
- Golden V3 #3 / run `32265296046`: 收紧到 Aquarium 0.50%、Search 0.35%、Collection 0.30% 后仍 8/8=0%
- Golden V3 #4 / run `32267440206`: canonical-closeout head 仍 PASS
- System #59 / run `32267440195`: canonical product evaluation + system regressions PASS

Canonical append commit `08a2d31944919c51fb087400002c446fcc88097e` was verified as exactly **+1 / -0**. PUI-BC-032 remains unchanged with `guide_safe_water_change`.

## Evidence-quality lessons retained

- Storage-reset screenshots that silently captured Welcome instead of Aquarium are invalid evidence and remain fail-closed.
- CJK tofu screenshots are invalid evidence; font readiness remains mandatory.
- Geometry tests must compare actual visible surfaces, not wrapper boxes containing reserved whitespace.
- A golden comparator can itself produce badcases; evaluator semantics must be versioned just like product logic.

## Residual risks / non-claims

- Golden V3 covers eight stable fold states, not every V2 screenshot or every dialog/error state.
- It detects approved rendering drift; it does not score aesthetics.
- Raw diff artifacts retain for 7 days; compact `.sig` references are versioned in Git.
- CJK package download latency remains CI infrastructure debt.
- PR #104 remains Draft, not merged and not deployed.
