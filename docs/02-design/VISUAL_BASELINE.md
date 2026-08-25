# AquaGuide Visual Baseline

**Status:** User-confirmed local baseline  
**Updated:** 2026-08-25  
**Preview:** `http://127.0.0.1:4317/_preview/interactive`  
**Code baseline:** `37a8d4d1` plus docs/CI-only commits on `codex/unified-rc-visual-v1`

## Baseline decision

The user confirmed the interactive preview as the correct **working direction**. It is the current visual acceptance source, not a claim that every visual detail is final; future issues will be corrected incrementally by module and viewport. `integration/aquaguide-rc1`, PR #140, old mockups, and historical PR screenshots are not visual acceptance sources.

## Required visual behavior

| Surface | Desktop/tablet | Phone |
| --- | --- | --- |
| Species and Care browse detail | Persistent right Rail; background remains visible, scrollable and interactive | Bottom sheet |
| Multi-step task | Right-side task surface | Tall bottom sheet |
| Destructive/leave confirmation | Centered blocking modal | Centered blocking modal |
| Aquarium at >=960px | One immersive 3D stage with overlay actions | Compact mobile priorities |
| Encyclopedia/Care scene at >=768px | Selected result remains over the underwater scene | Compact non-hover flow is allowed |
| Collection | Creature-first scene navigation | Tap-expand compact navigation |

## Ownership

- Responsive contract: `src/lib/layout-mode.ts`
- Surface semantics: `src/components/ui/dialog.tsx` and adaptive surfaces
- Aquarium geometry: `src/styles/aquarium-stage-layout-v4.css`
- Detail/scene geometry: `src/styles/immersive-detail-layout-v5.css`
- 3D framing: `ThreeAquarium` camera math only

The detailed enforceable contract remains [`UI_REGRESSION_CONTRACT.md`](../../UI_REGRESSION_CONTRACT.md). If this summary and that contract differ, the regression contract wins until the user approves a newer baseline.

## Acceptance evidence

1. Static/source review
2. Browser regression at required viewports
3. Local approved-preview review
4. User visual acceptance
5. Only then may screenshots become a replacement golden baseline

No UI change may introduce a new versioned override stylesheet, restore CSS canvas zoom, or infer business surface type from visual CSS classes.
