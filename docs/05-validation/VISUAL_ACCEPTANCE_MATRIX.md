# Visual Acceptance Matrix

**Status:** Active  
**Visual source:** `http://127.0.0.1:4317/_preview/interactive`  
**Current code baseline:** `37a8d4d1` (user-confirmed local direction)

This matrix makes the visual baseline executable. It does not replace [`UI_REGRESSION_CONTRACT.md`](../../UI_REGRESSION_CONTRACT.md); it connects the contract to routes, scripts and human review.

| Area | Required outcome | Automated evidence | Human evidence |
| --- | --- | --- | --- |
| Global responsive surfaces | One viewport contract at `<768` / `>=768`; no UA split-brain | `npm run test:layout-mode`, `node scripts/verify-ui-regression-contract.mjs` | Confirm resize does not switch to conflicting modal geometry. |
| Aquarium | >=960 immersive stage; camera-only framing; task/detail surfaces preserve semantics | `npm run test:three-stage-framing`, `node scripts/verify-aquarium-stage-layout-runtime.mjs`, `node scripts/verify-aquarium-surface-runtime.mjs` | Review 1440, 1024 and 390 routes. |
| Encyclopedia | Underwater scene stays visible; selected result overlays scene; browse detail stays in Rail/Sheet | `npm run test:interactive-scenes-ui`, `node scripts/verify-split-workspace-runtime.mjs` | Review a selected species at desktop and phone. |
| Care | Interactive scene and traditional browse remain distinct; mobile task/detail geometry remains usable | `npm run test:mobile-care-ui`, `node scripts/verify-split-workspace-runtime.mjs` | Review `/care` and `/care?mode=browse`. |
| Collection | Desktop creature-first navigation; compact phone fallback | `npm run test:collection-hub-ui` | Review 1440 and 390 navigation and return paths. |
| Whole application | Required routes have no page errors, accidental dialogs, body lock or horizontal overflow | `npm run test:ui-smoke`, `node scripts/verify-page-runtime-matrix.mjs` | Spot-check the user-confirmed preview after material UI change. |

## Evidence status

- **User-confirmed:** the 4317 interactive preview is the correct local visual direction.
- **Automated (2026-08-25):** `test:layout-mode` (6/6), `test:three-stage-framing`, `verify-ui-regression-contract`, `test:interactive-scenes-ui`, `verify-split-workspace-runtime`, and `verify-page-runtime-matrix` (28/28) passed against the local baseline.
- **Automated policy:** this matrix is re-run whenever a UI owner, responsive behavior, scene or surface semantics changes.
- **Fresh browser check (2026-08-25):** the claimed 4317 preview rendered the complete interactive preview DOM, 9 species images and a 592×728 WebGL canvas at the current 523×812 viewport; browser logs contained no application errors. The remaining Three.js messages are deprecation warnings only.
- **Human review:** user confirmed the current 4317 visual direction on 2026-08-26 as a working baseline. This is not a final visual lock; any later UI-owner change requires a new fixed-viewport review.
- **Not yet a screenshot golden:** no screenshot baseline is promoted until a stored image set, viewport, locale and seed are all recorded.
- **Deployment parity pending:** a deployed preview is accepted only when its SHA and rendered behavior match this baseline.

## Required change record

A visual PR must state:

1. Which row of this matrix it affects.
2. Which canonical CSS/component owner it changes.
3. Which automated evidence was rerun.
4. Whether human review is required again.

No visual PR may claim a global UI pass from a single route or a production build alone.
