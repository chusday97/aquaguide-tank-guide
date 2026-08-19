# AquaGuide Golden Visual Cohort v1

This directory contains the small, intentionally stable golden visual cohort for AquaGuide UI/UX Visual QA V3.

## Why this is not the full 48-screenshot baseline

The V2 artifact is broad review evidence, not a good pixel-diff contract. Locking every route/full-page image would make CI sensitive to content growth, long-page height changes, recommendations and WebGL rendering. V3 therefore locks only eight high-signal **fold states** that represent recent responsive UI failures.

## Cohort

- Aquarium: 390 / 768 / 1024 / 1440
- Search: 1024 / 1440
- Collection: 390 / 1440

The references come from `UI UX Visual QA V2 #19`, run `32259734301`, artifact `9367824682`, implementation head `ef69d85e48712d27990423fcc85e23a4047f0756`.

## Why the repository stores normalized pixel signatures instead of eight raw PNGs

Raw screenshots are still produced and uploaded by CI for human review. The committed reference is a compact deterministic pixel signature in `manifest.json`:

1. start from the approved V2 fold screenshot;
2. apply only explicitly documented fixed masks for known nondeterministic regions;
3. sample the image to a 128px-wide grayscale thumbnail with a fixed integer formula;
4. deflate the grayscale bytes and store them as base64.

This keeps the review contract versioned in Git without adding large binary screenshot churn. CI reconstructs the reference thumbnail and compares it pixel-by-pixel with the current normalized capture.

## Comparison policy

`verify-uiux-golden-cohort.mjs`:

1. reproduces the original V2 navigation order and fresh-account first-aquarium seed;
2. forces `zh-CN`, reduced motion, fold-only capture and CJK-font availability;
3. applies the same fixed mask rectangles to the current image before normalization;
4. performs grayscale pixel diff with a noise threshold and per-case changed-pixel tolerance;
5. fails when a case exceeds its approved tolerance;
6. writes current full screenshots, reconstructed reference thumbnails, current thumbnails, diff thumbnails and `report.json` to the CI artifact.

Fixed masks are intentionally narrow. Because the coordinates are tied to the approved source image, moving/resizing a masked surface is **not** silently ignored: the moved pixels appear outside the old mask and contribute to the diff.

## Baseline update rule

Do not update the signature only to make CI green. A baseline change is acceptable only when:

- the visual change is intentional;
- the structural browser regressions still pass;
- the affected viewport screenshot is manually reviewed;
- the PR explains which golden case changed and why.

If content/catalog churn creates noise without a visual regression, prefer a documented narrow mask or a more stable cohort state instead of raising global tolerance.

## Non-claims

This is not a perceptual-design scorer and does not prove the UI is aesthetically good. It is a regression detector for approved geometry, hierarchy and stable rendering. Structural assertions remain the primary guard for business-critical layout behavior.
