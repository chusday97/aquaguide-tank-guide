# AquaGuide Visual QA V2 — Latest Baseline

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104  
**Validated implementation head:** `ef69d85e48712d27990423fcc85e23a4047f0756`

## Purpose

This round turns visual review from ad-hoc screenshots into reproducible evidence. It does **not** claim pixel-perfect visual regression yet; it establishes a reliable cross-surface screenshot baseline plus deterministic geometry contracts for the highest-risk responsive failures discovered in review.

## Baseline matrix

Viewports:

| Profile | Viewport |
| --- | --- |
| Phone | 390×844 |
| Compact desktop | 768×900 |
| Medium desktop | 1024×900 |
| Wide desktop | 1440×1000 |

Routes:

- `/aquarium`
- `/encyclopedia`
- `/care`
- `/search?q=鱼`
- `/collection`
- `/settings`

Evidence per case:

- one viewport/fold screenshot
- one full-page screenshot
- layout/width/height/basic DOM manifest

Total: **4 viewports × 6 routes × 2 screenshots = 48 screenshots**.

## Authoritative run

**Workflow:** `UI UX Visual QA V2 #19`  
**Run ID:** `32259734301`  
**Result:** PASS  
**Artifact:** `aquaguide-uiux-visual-baseline-v2`  
**Artifact ID:** `9367824682`  
**Artifact retention:** 7 days

The run passed:

- CJK font install/readability gate
- TypeScript
- production build
- Aquarium visual task hierarchy
- Search medium-workspace density
- cross-surface capture
- artifact upload

## Structural visual contracts

### Aquarium

`verify-uiux-aquarium-visual-hierarchy.mjs` checks:

- no page horizontal overflow
- 390/768 task-first ordering
- 1024 medium sidebar ≤230px
- 1024 workspace ≥790px
- 1440 full sidebar restored
- contextual 3D tank remains subordinate
- return-context pill cannot overlap actual phone toolbar, onboarding content or desktop Aquarium header

### Search

`verify-uiux-search-density.mjs` checks:

- 768 and 1024 use one outer Species/Care column
- 1440 restores two outer columns
- Species result card width stays ≥220px
- no horizontal overflow

## Manual fold review

The deterministic gates were followed by manual inspection of the final artifact.

### 390 Aquarium

Observed hierarchy:

1. fixed aquarium toolbar
2. `返回上一个任务` navigation band
3. onboarding card
4. Today decision surface
5. recurrent quick actions

No toolbar/return/onboarding overlap remained.

### 768 Aquarium

Today remains first and recurrent Manage actions are fully visible before the contextual 3D tank. The collapsed rail preserves workspace width.

### 1024 Aquarium

The medium 220px sidebar preserves enough content width for a useful Today + context composition while keeping Manage above the fold. Return context has its own desktop top band.

### 1024 Search

Species uses the full outer content column, with readable two-up result cards. Care follows below instead of squeezing alongside the Species section.

### 1440 Search

Species and Care return to a side-by-side comparison layout once the actual Search workspace is genuinely wide enough.

### 1440 Aquarium

Today + contextual 3D form a balanced hero, with Manage immediately below and visible in the fold. The 3D surface remains visually secondary rather than taking over the page.

## Invalid evidence explicitly rejected during this round

### Storage-reset capture bug

The first capture harness used `localStorage.clear()` in `addInitScript`. Because init scripts run on every navigation, it deleted the seeded aquarium before `/aquarium` was captured, silently producing Welcome screenshots.

That artifact was rejected. The final harness now requires `[data-aquarium-dashboard-v2]` after navigating back to `/aquarium`.

### Missing CJK font

Old RC1 screenshots rendered Chinese as tofu boxes. Visual QA V2 installs `fonts-noto-cjk` and refuses capture when `Noto Sans CJK SC` is unavailable.

A runner once timed out downloading the 61.2MB package. The fix was apt retry/timeout hardening, not removing the font gate.

### Wrong overlap reference box

An intermediate return-context regression compared the floating pill against the outer `.aquarium-desktop-layout` box. That container included reserved whitespace and generated a false overlap failure.

The final regression compares against actual visible `.aquarium-toolbar`, `.aquarium-onboarding-strip`, and `.aquarium-desktop-header` surfaces.

## Product badcases closed

- PUI-BC-045 — Aquarium narrow-workspace task hierarchy
- PUI-BC-046 — 1024 sidebar width cliff
- PUI-BC-047 — Search viewport/content-width mismatch
- PUI-BC-048 — workspace return-context overlap

## Non-claims / next visual maturity step

This baseline is intentionally **not** described as a full visual-regression system yet.

Still missing:

- committed golden screenshots or durable external baseline storage
- automatic pixel-diff comparison with reviewed tolerance/masks
- a human visual score for every full-page screenshot
- visual checks for every dialog/drawer/empty/error state

The next mature step is to choose a small stable golden cohort, define acceptable dynamic regions, and introduce reviewed pixel-diff thresholds without making CI brittle.
