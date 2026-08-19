# AquaGuide Handoff — UI/UX System Refactor + Visual QA V2

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Base:** `integration/aquaguide-rc1`  
**Latest validated implementation head:** `ef69d85e48712d27990423fcc85e23a4047f0756`

## Current state

The UI/UX system refactor is implemented on top of RC1 and now has a second visual-QA layer. The work remains **Draft**, is **not merged** into RC1 or `main`, and is **not deployed**.

The earlier system refactor established canonical design tokens, width-driven layout, Aquarium progressive disclosure, Collection focus-carousel IA, Search show-all parity, 44×44 named controls, reduced-motion/inert behavior, desktop scroll affordance, and a dedicated deterministic system workflow.

Visual QA V2 then added cross-surface screenshot evidence and closed medium-width layout regressions that were not visible in static contracts alone.

## Visual QA V2 implementation

### Cross-surface baseline

`UI UX Visual QA V2` captures four viewports across six core routes:

- 390×844
- 768×900
- 1024×900
- 1440×1000

Routes:

- `/aquarium`
- `/encyclopedia`
- `/care`
- `/search?q=鱼`
- `/collection`
- `/settings`

For every viewport/route pair the workflow saves one fold screenshot and one full-page screenshot: **4 × 6 × 2 = 48 screenshots**, plus a manifest.

The capture harness is fail-closed:

- `/aquarium` must still contain `[data-aquarium-dashboard-v2]` after route navigation, so a storage-reset bug cannot silently capture Welcome as Aquarium.
- `Noto Sans CJK SC` must be available before screenshots are accepted.
- CJK font installation uses apt retry/timeouts because the package is large and runner network speed is variable.

### PUI-BC-045 — Aquarium narrow-workspace task hierarchy

A valid baseline showed a responsive cliff: phone was correctly `Today → Manage → 3D`, but 768/1024 could promote a large contextual 3D tank above recurrent actions.

Fix: `src/styles/ui-v2-dashboard.css` now uses the real `aquarium-home` container width. Below 720px of actual content width, the order is:

1. Today
2. Manage
3. 3D context
4. Learn/discovery

The contextual 3D tank is limited to 140–170px in this stacked task-first mode. Only a genuinely wide content container restores the balanced Today + 3D hero.

Primary fix commit: `f0ea9ecad4fbace00f9f0d1fdb3cecce277d31d7`.

### PUI-BC-046 — 1024px sidebar width cliff

The shell previously auto-collapsed through 1023px, then jumped to a roughly 280px expanded rail at 1024px. That made the usable workspace narrower at 1024 than immediately below it.

Fix: 1024–1199 uses a 220px medium desktop sidebar. Search and labeled navigation remain available; 1200+ restores the full navigation rail.

Primary fix commit: `1ad85cd399634c3a9c81e39963fbd13d80a5f259`.

### PUI-BC-047 — Search nested layout used viewport instead of content width

At 1024 the Search page could be classified as desktop even though the actual workspace after the sidebar was too narrow for Species and Care side-by-side. Species then split internally again and produced cramped cards.

Fix: `.search-v2-page` is now a named inline-size container. Species/Care stay stacked until the actual Search workspace reaches 900px; 1440 restores side-by-side comparison.

Primary fix commit: `1cb91612541396ec5d2ad515cc5b8f70443f8573`.

### PUI-BC-048 — Return-context navigation covered Aquarium chrome/content

`WorkspaceNavigationProvider` renders `返回上一个任务` as a global fixed control. The old fixed top position could overlap the phone aquarium toolbar/onboarding content and the desktop Aquarium identity header.

Fix:

- desktop return context gets a dedicated top navigation band before the Aquarium header;
- phone keeps the fixed Aquarium toolbar in its existing position, then reserves a separate return band after the toolbar flow placeholder;
- final phone regression measures the real toolbar bottom and keeps the return pill outside it and before first visible content.

Relevant commits include `1abb9ace99284a2050560eeac919f9a09b8b82e8`, `f3c48352fcc77a09207885f8f9edae25ff7fa33d`, and final alignment `ef69d85e48712d27990423fcc85e23a4047f0756`.

## Validation evidence

### Visual QA implementation validation

**UI UX Visual QA V2 #19**  
Run ID: `32259734301`  
Head: `ef69d85e48712d27990423fcc85e23a4047f0756`  
Result: **PASS**  
Artifact: `aquaguide-uiux-visual-baseline-v2` / ID `9367824682`

Passed:

- CJK font installation/readability gate
- TypeScript
- production build
- Aquarium visual task hierarchy at 390 / 768 / 1024 / 1440
- Search visual density at 768 / 1024 / 1440
- cross-surface 48-screenshot capture
- artifact upload

Manual fold review also confirmed:

- 390 Aquarium: toolbar → return context → onboarding → Today, without overlap
- 768 Aquarium: Today and recurrent Manage actions precede 3D context
- 1024 Aquarium: medium sidebar preserves usable workspace and Manage remains above fold
- 1024 Search: Species cards are readable and Care follows below rather than squeezing beside it
- 1440 Search: Species/Care side-by-side returns naturally
- 1440 Aquarium: Today + contextual 3D hero remains balanced and Manage stays visible

### System regression validation

**UI UX System Refactor V1 #36**  
Run ID: `32259734291`  
Head: `ef69d85e48712d27990423fcc85e23a4047f0756`  
Result: **PASS**

Passed static contracts, TypeScript, build, Search regression, Collection regression, GP-005 and the 7 profiles × 17 routes responsive scan.

## Evaluation lessons from this round

The first visual capture run was technically green but invalid: the init script cleared localStorage on every navigation, so Aquarium screenshots silently became Welcome. That baseline was rejected rather than used as evidence. The harness now requires the real dashboard after navigation.

A later return-context regression initially compared against the outer `.aquarium-desktop-layout` box and produced a false overlap because that box contains reserved whitespace. The regression was corrected to compare the pill against actual visible toolbar/onboarding/header surfaces rather than weakening the product constraint.

The CJK install also had a runner-network timeout once; the solution was retry/timeout hardening, not disabling the font-readiness requirement.

## Next safe step

After canonical PUI-BC-045..048 and final documentation validation, #104 can be reviewed as the UI/UX-system + structural Visual-QA layer on top of RC1. Keep it Draft unless the user explicitly asks to mark ready or merge.

## Explicit non-claims / residual debt

- No merge to RC1 or `main` has happened.
- No production deployment has happened.
- This is a screenshot baseline plus structural/geometry gates, **not yet a committed pixel-diff golden-image comparator**.
- Screenshots are workflow artifacts with 7-day retention, not repository assets.
- Bundle/code-splitting warnings remain.
- Existing npm audit vulnerabilities remain outside this UI/UX task.
