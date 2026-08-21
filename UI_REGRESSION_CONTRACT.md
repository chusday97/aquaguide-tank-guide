# UI Regression Contract

Status: **interaction/layout contract active; visual golden baseline not yet accepted**.

This file is the canonical product contract for layout behavior. When older tests, CSS, screenshots, or handoff notes disagree with this document, this document wins until the user explicitly approves a newer baseline.

## 1. Desktop browsing detail

Species details, Care details, and equivalent browse/read surfaces use a **persistent right-side detail rail**.

Required behavior:
- rail is attached to the viewport right edge and reaches the viewport bottom;
- opening the rail does not shrink the underlying browse page into a split-workspace column;
- no blocking backdrop on desktop;
- the underlying page remains visible, scrollable, and interactive;
- selecting another species/item while the rail is open updates the rail in place instead of closing it;
- long detail content scrolls inside the rail;
- target desktop rail width remains approximately 480–600px unless a later accepted design changes it.

Forbidden regression:
- inline 54/46 or 50/50 split-workspace geometry for browsing detail;
- outside press closing the rail while the user is switching browse targets;
- detail ending above the viewport bottom;
- desktop detail content forced into a two-column layout that becomes unreadable inside a narrow rail.

## 2. Mobile surfaces

- Browsing detail: bottom sheet, approximately 68dvh with bounded min/max height.
- Task flow: taller bottom sheet, approximately 82dvh.
- Blocking confirmation: centered compact modal.
- Media/fullscreen preview: may use fullscreen/centered media behavior.
- Mobile surfaces must never reintroduce a left-edge drawer for these flows.

## 3. Aquarium stage

At desktop and landscape widths from 960px upward:
- the 3D aquarium is one immersive stage, not a dashboard grid column;
- status/Today Action floats over the stage and must not consume aquarium width;
- bottom actions live inside the stage as an overlay dock;
- the tank-species entry stays inside the stage;
- 1024px must not fall back to the old stacked dashboard layout.

At 768–959px a deliberate tablet fallback is allowed. Mobile uses its own compact priorities.

## 4. CSS ownership

Canonical layout owners:
- `src/styles/aquarium-stage-layout-v4.css` — Aquarium stage geometry.
- `src/styles/immersive-detail-layout-v5.css` — Detail/Task/Surface geometry.
- shared surface behavior — `components/ui/dialog.tsx` plus Adaptive Detail/Task components.

Do **not** add `layout-v6.css`, `surface-v7.css`, or another versioned override layer to fix a regression. Change the canonical owner or refactor the primitive.

`src/index.css` still contains historical layout debt. New fixes must not restore obsolete split-workspace contracts from it.

## 5. Acceptance hierarchy

A change is not considered visually complete merely because it builds.

Evidence levels:
1. source/diff reviewed;
2. deterministic/static contract passed;
3. browser geometry/runtime regression passed at required viewports;
4. human visual review passed;
5. only after explicit human PASS may screenshots be promoted to a visual golden baseline.

Until level 4 is reached, HANDOFF/PROGRESS/BADCASE must use `validation_pending`, not `PASS`.

## 6. Branch discipline

Current UI work is owned by `codex/interactive-parity-v3`.

The branch is materially diverged from `main` and `agent/result-ux-v1`. Do not merge either line into the active UI branch as a routine sync step: reconcile contracts first, because those branches may carry older layout implementations/tests that can silently restore rejected behavior.
