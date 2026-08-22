# UI Regression Contract

Status: **interaction/layout contract active; visual golden baseline not yet accepted**.

This file is the canonical product contract for layout behavior. When older tests, CSS, screenshots, or handoff notes disagree with this document, this document wins until the user explicitly approves a newer baseline.

## 1. Responsive source of truth

AquaGuide product layout is **viewport-based**, not device/UA-based.

Required behavior:
- one shared breakpoint contract owns phone vs desktop layout;
- current phone boundary is `< 768px`; desktop/tablet workspace starts at `768px`;
- AppShell, Dialog root modal semantics, popup geometry, overlay, dismissal, Adaptive Detail, and Adaptive Task must all consume the same responsive source;
- resizing a desktop browser across the breakpoint must update product layout consistently.

Forbidden regression:
- iPhone/iPad/Android/userAgent strings deciding the product layout;
- Dialog owning a second hard-coded phone breakpoint independent from LayoutModeProvider;
- popup geometry switching to phone while root modal behavior remains desktop, or the reverse.

Canonical responsive owner: `lib/layout-mode.ts`.

## 2. Desktop browsing detail

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

## 3. Mobile surfaces

- Browsing detail: bottom sheet, approximately 68dvh with bounded min/max height.
- Task flow: taller bottom sheet, approximately 82dvh.
- Blocking confirmation: centered compact modal.
- Media/fullscreen preview: may use fullscreen/centered media behavior.
- Mobile surfaces must never reintroduce a left-edge drawer for these flows.

### Surface semantics ownership

Every business `DialogContent` must declare an explicit `surface="detail|task|blocking|media|fullscreen"`. Shared Dialog infrastructure may keep `auto` only as a conservative compatibility fallback; business semantics must never be inferred from CSS width/radius classes, visual signatures, or whether the corner close button is hidden.

Forbidden regression:
- `max-w-*`, `rounded-*`, or other visual classes deciding Detail/Task/Blocking/Media meaning;
- `showCloseButton={false}` being treated as proof that a flow is destructive/blocking;
- adding a business `DialogContent` without explicit `surface=`.

## 4. Interactive discovery scenes

For Encyclopedia and Care at every desktop/tablet workspace width `>= 768px`:
- the underwater scene remains the visual canvas after an item is selected;
- the selected-result dock overlays the scene instead of participating in normal document flow;
- Encyclopedia scene note also stays inside/over the scene rather than creating a white strip below it;
- selected-result geometry must remain inside the stage bounds.

Phone `<768px` may use its own compact flow where hover does not exist.

Forbidden regression:
- 768–1023px returning to `stage -> white result strip` stacking;
- selection shortening the underwater background;
- fixing only 1024/1440 while leaving tablet landscape with different structure.

## 5. Aquarium stage

At desktop and landscape widths from 960px upward:
- the 3D aquarium is one immersive stage, not a dashboard grid column;
- status/Today Action floats over the stage and must not consume aquarium width;
- bottom actions live inside the stage as an overlay dock;
- the tank-species entry stays inside the stage;
- 1024px must not fall back to the old stacked dashboard layout.

At 768–959px a deliberate tablet fallback is allowed. Mobile uses its own compact priorities.

### Aquarium framing ownership

`ThreeAquarium` camera math is the **only** owner of 3D framing.

Required behavior:
- `framing="stage-cover"` adapts to the real canvas aspect ratio;
- CSS may size the canvas 100% × 100%, but must not zoom/crop it with `scale()`;
- viewport changes must not introduce breakpoint-based visual jumps caused by different CSS zoom factors.

Forbidden regression:
- `.aquarium-tank canvas { transform: ... scale(...) }` for framing;
- restoring separate 1.08 / 1.16 / 1.22 / 1.26 / 1.30 canvas zoom values;
- compensating for camera problems by adding another CSS zoom layer.

If camera-only framing is visually wrong, fix `ThreeAquarium` camera math and its tests.

## 6. CSS ownership

Canonical layout owners:
- `src/styles/aquarium-stage-layout-v4.css` — Aquarium stage geometry, never camera zoom.
- `src/styles/immersive-detail-layout-v5.css` — Detail/Task/Surface and interactive scene overlay geometry.
- shared surface behavior — `components/ui/dialog.tsx` plus Adaptive Detail/Task components.
- responsive breakpoint contract — `lib/layout-mode.ts`.

Do **not** add `layout-v6.css`, `surface-v7.css`, or another versioned override layer to fix a regression. Change the canonical owner or refactor the primitive.

`src/index.css` still contains historical layout debt. New fixes must not restore obsolete split-workspace contracts from it.

## 7. Acceptance hierarchy

A change is not considered visually complete merely because it builds.

Evidence levels:
1. source/diff reviewed;
2. deterministic/static contract passed;
3. browser geometry/runtime regression passed at required viewports;
4. human visual review passed;
5. only after explicit human PASS may screenshots be promoted to a visual golden baseline.

Until level 4 is reached, HANDOFF/PROGRESS/BADCASE must use `validation_pending`, not `PASS`.

## 8. Branch discipline

Current UI work is owned by `codex/interactive-parity-v3`.

The branch is materially diverged from `main` and `agent/result-ux-v1`. Do not merge either line into the active UI branch as a routine sync step: reconcile contracts first, because those branches may carry older layout implementations/tests that can silently restore rejected behavior.
