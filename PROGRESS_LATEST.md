# AquaGuide Progress — UI/UX System + PUI-BC-050

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104

## Latest user-reported navigation repair

- [x] Reproduced/located why risky species footer action jumped directly into Compatibility.
- [x] Located the second independent cause of the “Atlas jumps to bottom” symptom: `mode=compatibility` explicitly scrolled to the deep calculator anchor.
- [x] Converted first risk-review action into in-detail Compatibility evidence expansion.
- [x] Preserved second-stage full-calculator navigation after the user has already reviewed the evidence.
- [x] Preserved dedicated calculator navigation paths.
- [x] Made Compatibility behave as a top-level fixed drawer surface rather than a deep Atlas destination.
- [x] Prevented underlying Atlas browse content from keeping the long layout active underneath Compatibility.
- [x] Kept Atlas workspace scroll position near the top in Compatibility mode.
- [x] Added deterministic browser regression for both the two-stage detail flow and direct Compatibility route.
- [x] Corrected the regression to inspect the real fixed drawer rather than the zero-layout `#compatibility-calculator` wrapper.
- [x] Updated static interaction audit to follow wrapper + Base implementation without weakening the existing sharing feature gate.
- [x] TypeScript PASS.
- [x] Production build PASS.
- [x] Search regression PASS.
- [x] Collection regression PASS.
- [x] GP-005 PASS.
- [x] Full 7×17 responsive route scan PASS.
- [x] Visual QA V2 PASS.
- [x] Golden V3 PASS.
- [x] Bundle Audit PASS.
- [x] Added PUI-BC-050 to canonical `evaluation/product/badcases.v1.jsonl`.
- [x] Verified canonical registry commit is exactly +1 / -0 against implementation head.
- [x] Updated `BADCASE_LATEST.md`, `PROGRESS_LATEST.md`, `HANDOFF_LATEST.md`.

Implementation verification head: `34b4a898ea16dfd8fe85628c29a75265ef8bc409`.

Authoritative runs on that implementation head:

- UI UX System Refactor V1 #69 / `32275254732` — PASS
- UI UX Visual QA V2 #52 — PASS
- UI UX Golden V3 #14 — PASS
- Bundle Audit V1 #7 — PASS

Canonical append:

- `1e7eea5d7f4326b161d6ecbd953ba3394e1fe564`
- one file changed, +1 / -0
- PUI-BC-050 = `regression_verified`

## Existing system work retained

- [x] Canonical UI typography/spacing/radius/elevation tokens.
- [x] Width-driven layout system with tablet fallback guard.
- [x] Aquarium progressive disclosure and task-first narrow-workspace hierarchy.
- [x] Collection three-live-module focus carousel + quiet Achievements state.
- [x] Species/Care Search show-all parity.
- [x] 44×44 named interaction baseline.
- [x] Inactive carousel `inert` / accessibility guard.
- [x] Reduced-motion support.
- [x] Desktop scroll-position affordance.
- [x] Broad Visual QA V2: 48 screenshots across 390 / 768 / 1024 / 1440 and six core routes.
- [x] Golden V3: eight stable fold states with strict normalized pixel-diff thresholds.
- [x] CJK font readiness fail-closed + verified Actions cache miss→save→hit path.
- [x] Bundle audit instrumentation with entry/module composition evidence.

## Bundle performance state

- [x] Established measured bundle baseline instead of guessing from Vite warning text.
- [x] Confirmed large entry contributors include `fishData.ts`, localization data, PostHog and Supabase-related dependencies.
- [x] Confirmed Three/React Three Fiber is largely isolated in a separate large chunk.
- [ ] Remove low-risk eager PostHog load and re-measure.
- [ ] Trace/decouple remaining root-level Supabase eager imports where safe.
- [ ] Redesign synchronous i18n data mutation before attempting to lazy-load fish/care translation data.

No bundle-size reduction is claimed yet.

## Still intentionally not done

- [ ] Merge #104 into RC1 or main.
- [ ] Production deploy.
- [ ] Broad dependency vulnerability remediation.
- [ ] Replace Golden V3 with aesthetic/perceptual scoring.
- [ ] Expand Golden V3 indiscriminately to all V2 screenshots.
- [ ] Refactor the current thin wrapper/Base surgical navigation fix back into the large original components without retaining the new regression coverage.
