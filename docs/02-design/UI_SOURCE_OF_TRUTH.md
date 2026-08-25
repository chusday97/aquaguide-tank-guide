# AquaGuide UI Source of Truth

Updated: 2026-08-25

## Canonical visual baseline

- Visual / interaction baseline branch: `codex/interactive-parity-v3`
- Accepted baseline SHA before reconciliation: `a3f1664`
- Unified integration branch: `reconcile/final-ui-rc1-v1`
- Local integration workspace: `~/aquaguide-final-ui-rc1`
- RC1 logic donor: `integration/aquaguide-rc1` at `895f2f3`

This document makes the interactive UI baseline authoritative for presentation. RC1 is authoritative for deterministic product logic, evidence authority, recommendation authority, and production runtime. RC1 page layout is not a visual source of truth.

`UI_REQUIREMENT_LEDGER.md` is authoritative for the complete chronological requirement set. The baseline SHA is not equivalent to the final requirement set; accepted UI decisions after `a3f1664` must be reconciled forward.

## Non-negotiable UI contracts

1. Aquarium desktop (`>=960px`) remains a single immersive 3D stage. Status and actions are overlays; they must not become columns that squeeze the tank.
2. Three.js camera owns aquarium framing. Do not add CSS `scale()` framing to the WebGL canvas.
3. Desktop browse detail uses a persistent right rail, target width 480–600px. Background content remains visible, scrollable, and selectable.
4. Mobile browse detail uses a bottom sheet. Task uses a high bottom sheet. Blocking confirmation is centered. Media may be centered/fullscreen.
5. Switching species/content while a desktop detail rail is open replaces the rail content instead of closing the workspace.
6. Collection remains creature-first / interaction-first and preserves IceGlide-like center-focus carousel behavior: active center focus, adjacent context, arrows/dots, horizontal drag/swipe, and compact tablet/mobile creature shortcuts. Mobile drag must preserve vertical scrolling via `touch-action: pan-y`.
7. Interactive Atlas canonical visual owner is `SpeciesSceneAtlas`: default scene shows a persisted 6-creature discovery batch on transparent textures; first click selects in-scene, explicit CTA opens the profile; whole-batch refresh/restart is user-controlled; the scene never implies Compatibility. Mobile keeps one Encyclopedia toolbar containing Scene/Browse/Compatibility plus Search/Identify/Settings.
7a. Interactive Atlas has a specific desktop observation-state exception to the generic Rail contract: after the explicit profile CTA, the aquarium/scene must reflow narrower on the left and yield real space to the right Species Detail Rail. The Rail must not cover the tank. Closing the detail restores the exact same scene width, selection context, and discovery batch. This exception does not authorize 50/50 split-workspace behavior for ordinary Browse/Care pages.
8. Care remains workspace/detail oriented rather than a chain of blocking modals.
9. Responsive behavior is viewport-driven, not UA-driven.
10. Localization changes presentation only; domain enums and business rules stay canonical.
11. No new `layout-vN` override layer may be introduced to patch regressions around the canonical owner.

## Reconciliation rule

When old UI and RC1 disagree:

- layout / surface / motion / interaction hierarchy -> preserve this UI baseline;
- Compatibility / Whole-Tank / Current Tank State / Water Change / Recommendation authority -> use RC1;
- API / repository / production runtime -> use RC1;
- data presentation adapters -> reconcile semantically and test both UI and authority.

Never resolve the divergence with a blanket merge, rebase, or whole-file checkout that would overwrite one side's authority.
