# AquaGuide Handoff — UI/UX System + Encyclopedia Navigation Fix

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Base:** `integration/aquaguide-rc1`

## Current state

PR #104 remains **Draft**, is **not merged** into RC1 or `main`, and is **not deployed**.

The UI/UX system refactor, Visual QA V2, Golden V3, CJK visual-test cache, bundle audit instrumentation, and the latest Encyclopedia/Compatibility navigation repair are present on this branch.

## Latest user-reported issue — PUI-BC-050

Two related navigation failures were reported:

1. In a risky species detail, the footer action for reviewing risk/alternatives jumped straight into Compatibility instead of first showing the evidence in the current detail.
2. Entering `/encyclopedia?mode=compatibility` caused Atlas to scroll to the deep `#compatibility-calculator` anchor, making the Encyclopedia workspace appear to jump to the bottom.

### Root cause

- `SpeciesDetailDialog` directly called `onGoCalculator()` for unsuitable/conflict-risk/caution states.
- `Encyclopedia` synchronized `mode=compatibility` by calling `navigateToSection('compatibility-calculator')` even though `CompatibilityRiskCalculator` is itself a fixed top-level drawer.

### Current behavior

The interaction is now deliberately two-stage:

- **First footer click in a not-recommended detail:** URL stays unchanged, the detail remains open, and the existing `混养关系 / Compatibility` evidence disclosure expands in context.
- **After the user has reviewed that evidence:** the footer action may enter the full Compatibility calculator.
- **Full Compatibility mode:** presents the fixed `compatibility-checkout-drawer` from the viewport top; Atlas browse content is removed from layout underneath it and the underlying workspace is kept near the top rather than restoring a deep/bottom scroll position.
- Direct `/encyclopedia?mode=compatibility` navigation follows the same surface/scroll contract.

### Implementation

Primary product commits:

- `d91a227a58ea6383a2f654d70b54d946f0d2f121` — keep initial risk review in context; introduce thin navigation guards around the existing large implementations.
- `0c0189edb9dd707a8e83409dee15b3705ef78d29` — preserve the existing second-stage route after Compatibility evidence has already been deliberately reviewed.

Supporting regression commits:

- `c5e9e8762a66150e62217125bb7c7245ee53d137` — make static interaction audit follow the thin wrapper + Base implementation structure rather than falsely losing the sharing feature gate.
- `61dc5acacbfa388cd2ac049ecd99ddc412bda3dc`, `240b74080164c8756b071528a25d73d2491a49c2`, `34b4a898ea16dfd8fe85628c29a75265ef8bc409` — converge the Playwright regression on user-visible behavior and the actual fixed drawer rather than its zero-layout wrapper.

Relevant files:

- `src/components/SpeciesDetailDialog.tsx` — thin interaction guard.
- `src/components/SpeciesDetailDialogBase.tsx` — preserved pre-fix detail implementation.
- `src/pages/Encyclopedia.tsx` — thin Compatibility surface/scroll guard.
- `src/pages/EncyclopediaBase.tsx` — preserved pre-fix Atlas implementation.
- `scripts/verify-encyclopedia-risk-navigation.mjs` — deterministic two-stage navigation + scroll regression.
- `.github/workflows/uiux-system-refactor-v1.yml` — regression is mandatory in System CI.

The wrapper/Base split is a surgical low-diff repair, not the preferred long-term architecture. A future cleanup may move the two guards into the original large components once the surrounding Atlas/detail code is safer to refactor.

## Authoritative validation for PUI-BC-050

Implementation head: `34b4a898ea16dfd8fe85628c29a75265ef8bc409`.

All passed on that head:

- **UI UX System Refactor V1 #69** / run `32275254732`
  - static UI/UX contracts PASS
  - TypeScript PASS
  - production build PASS
  - Encyclopedia risk navigation regression PASS
  - Search hierarchy PASS
  - Collection IA PASS
  - GP-005 PASS
  - full 7×17 responsive route scan PASS
- **UI UX Visual QA V2 #52** — PASS
- **UI UX Golden V3 #14** — PASS
- **Bundle Audit V1 #7** — PASS

Canonical badcase append:

- commit `1e7eea5d7f4326b161d6ecbd953ba3394e1fe564`
- `evaluation/product/badcases.v1.jsonl`
- compare against implementation head: exactly **+1 / -0**
- PUI-BC-050 status: `regression_verified`

## UI/UX / Visual evaluation baseline retained

System responsibilities remain separated:

1. **System contracts** — tokens, layout, interaction/accessibility, route browser regressions.
2. **Visual QA V2** — broad 48-screenshot matrix across 390 / 768 / 1024 / 1440 and six primary routes.
3. **Golden V3** — eight stable normalized fold signatures with strict pixel-diff thresholds.

Golden V3 approved cohort remains:

- Aquarium 390 / 768 / 1024 / 1440
- Search 1024 / 1440
- Collection 390 / 1440

Final thresholds remain Aquarium ≤0.50%, Search ≤0.35%, Collection ≤0.30%, grayscale delta 24. Do not widen thresholds or update signatures merely to make CI green.

CJK rendering remains fail-closed. `scripts/ensure-cjk-font.sh` + Actions cache may optimize font provisioning, but `fc-match` for `Noto Sans CJK SC` is still mandatory.

## Bundle audit state

Bundle audit is measurement-only so far; no bundle-size improvement should be claimed yet.

Known baseline findings:

- entry chunk roughly 2.1 MiB in normal Vite output
- `fishData.ts` and localization data are major entry contributors through root-level synchronous localization dependencies
- PostHog is another removable eager dependency candidate
- Three/React Three Fiber is largely already isolated in its own large chunk

The next safe performance work is to remove low-risk eager dependencies first and compare against the established audit baseline. The synchronous locale/data mutation path should not be made async without explicitly handling locale-race/flicker behavior.

## Explicit non-claims / remaining work

- No merge to RC1 or `main`.
- No production deployment.
- PUI-BC-050 is browser-regression verified on the Draft PR; it is not yet a production observation.
- Bundle/chunk optimization is not complete.
- Existing dependency vulnerabilities remain separate debt.
- The wrapper/Base repair should eventually be simplified after behavior is stable, but must not be refactored without retaining the new two-stage navigation and scroll regressions.
