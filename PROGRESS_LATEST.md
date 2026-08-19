# AquaGuide Progress — UI/UX System Refactor + Visual QA V2/V3

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104

## System refactor completed

- [x] UI/UX system based on `integration/aquaguide-rc1`.
- [x] Canonical design-token ownership in `ui-v2-foundation.css`.
- [x] Width-driven layout policy + viewportless iPad fallback.
- [x] Aquarium three primary actions + progressive disclosure.
- [x] Collection 3-live-module focus carousel; Achievements outside primary IA.
- [x] Search Species/Care explicit show-all parity.
- [x] 44×44 named-control baseline, reduced-motion and inactive-card `inert` behavior.
- [x] Deterministic `UI UX System Refactor V1` CI.
- [x] PUI-BC-040..044 closed.

## Visual QA V2 completed

- [x] 390 / 768 / 1024 / 1440 screenshot matrix.
- [x] Aquarium / Encyclopedia / Care / Search / Collection / Settings.
- [x] Fold + full page = 48 screenshots.
- [x] CJK readiness fail-closed.
- [x] Real Aquarium state fail-closed.
- [x] Aquarium geometry regression.
- [x] Search content-density regression.
- [x] PUI-BC-045..048 closed.
- [x] Manual review of highest-risk fold states.

Authoritative V2: #19 / run `32259734301` — PASS, artifact `9367824682`.

## Visual QA V3 completed

### Golden cohort

- [x] Chose eight stable fold states instead of locking all 48 V2 screenshots.
- [x] Aquarium: 390 / 768 / 1024 / 1440.
- [x] Search: 1024 / 1440.
- [x] Collection: 390 / 1440.
- [x] Added `evaluation/visual/golden-v1/README.md`.
- [x] Added `manifest.json` and eight compressed `.sig` references.
- [x] Added `scripts/verify-uiux-golden-cohort.mjs`.
- [x] Added `.github/workflows/uiux-golden-v3.yml`.
- [x] Current/reference/diff thumbnails + current full screenshots + `report.json` uploaded on every run.
- [x] Kept CJK readiness and reduced-motion requirements.
- [x] Masked only documented WebGL/recommendation regions at Aquarium 1024/1440.

### Fail-before

- [x] Golden V3 #1 / run `32264392607` failed only for 1024 thumbnail geometry before real pixel comparison.
- [x] Identified Python banker’s rounding vs JavaScript `Math.round()` at exact `112.5`.
- [x] PUI-BC-049 created as an `evaluation_system` badcase, not a product UI badcase.
- [x] Manifest `thumbWidth/thumbHeight` made authoritative; verifier stopped re-deriving geometry.

### Threshold calibration

- [x] Golden V3 #2 / run `32264776117`: 8/8 PASS, all 0% changed.
- [x] Initial provisional thresholds rejected as too loose.
- [x] Final limits: Aquarium 0.50%, Search 0.35%, Collection 0.30%, grayscale delta threshold 24.
- [x] Golden V3 #3 / run `32265296046`: 8/8 PASS, all 0% changed under tightened limits.
- [x] Same-head System #58 / run `32265296159`: PASS.

## Canonical governance closeout

- [x] PUI-BC-049 appended to `evaluation/product/badcases.v1.jsonl`.
- [x] Commit diff verified exactly `+1 / -0` for canonical registry.
- [x] PUI-BC-032 rechecked: still `guide_safe_water_change` exactly.
- [x] Canonical commit: `08a2d31944919c51fb087400002c446fcc88097e`.
- [x] System #59 / run `32267440195`: PASS.
- [x] Golden V3 #4 / run `32267440206`: PASS.
- [x] Golden artifact `9370832138`, digest `sha256:09728cd8efb33476c423e53ddb22adcc8f077edf48953940e3eef272891b7a11`.
- [x] `VISUAL_QA_LATEST.md`, `BADCASE_LATEST.md`, `PROGRESS_LATEST.md`, `HANDOFF_LATEST.md` updated for V3.

## Still intentionally not done

- [ ] Expand golden cohort indiscriminately to all 48 V2 screenshots — intentionally avoided.
- [ ] Perceptual/aesthetic scoring — Golden V3 is regression detection, not design judgment.
- [ ] Commit raw PNG baselines — compact signatures are versioned; raw current/reference/diff evidence remains a 7-day artifact.
- [ ] Optimize/cache the ~61MB CJK package installation.
- [ ] Bundle/chunk optimization.
- [ ] Existing dependency vulnerability remediation.
- [ ] Merge #104 into RC1/main.
- [ ] Production deploy.
