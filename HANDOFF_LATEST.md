# AquaGuide Handoff — UI/UX System Refactor + Visual QA V2/V3

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Base:** `integration/aquaguide-rc1`

## Current state

The UI/UX system layer, broad Visual QA V2 baseline, small Golden V3 regression cohort, and CJK visual-test cache are implemented on top of RC1. The PR remains **Draft**, is **not merged** into RC1 or `main`, and is **not deployed**.

The visual-evaluation stack now has three different responsibilities:

1. **System contracts** — token ownership, layout policy, interaction/accessibility rules and route-level browser regressions.
2. **Visual QA V2** — broad 48-screenshot evidence across 4 viewports × 6 routes.
3. **Golden V3** — eight stable fold states with normalized pixel-diff regression thresholds.

Do not collapse these into one test. Structural rules remain the primary guard for business-critical layout; Golden V3 detects approved visual drift in a deliberately small stable cohort.

## UI/UX system state retained

- canonical typography/spacing/radius/elevation tokens
- width-driven layout policy
- Aquarium progressive disclosure with three recurrent primary actions
- Collection 3-live-module focus carousel and quiet Achievements coming-next state
- Search Species/Care show-all parity
- 44×44 named interaction targets
- inactive carousel `inert` + `aria-hidden`
- reduced-motion support
- desktop scroll-position affordance
- deterministic `UI UX System Refactor V1` workflow

PUI-BC-040..044 remain closed.

## Visual QA V2

V2 captures 390×844 / 768×900 / 1024×900 / 1440×1000 across Aquarium, Encyclopedia, Care, Search, Collection and Settings, with fold + full-page images: **48 screenshots**.

Authoritative implementation evidence:

- `UI UX Visual QA V2 #19`
- run `32259734301`
- head `ef69d85e48712d27990423fcc85e23a4047f0756`
- result PASS
- artifact `9367824682`

V2 closed PUI-BC-045..048: Aquarium narrow-workspace task hierarchy, 1024 sidebar width cliff, Search viewport/content-width mismatch and return-context overlap.

The V2 harness rejects Welcome-as-Aquarium screenshots, missing CJK fonts and false wrapper-box overlap measurements.

## Visual QA V3 Golden Cohort

Approved Golden Cohort v1:

- Aquarium 390 / 768 / 1024 / 1440
- Search 1024 / 1440
- Collection 390 / 1440

Reference source: approved V2 #19 fold screenshots.

`evaluation/visual/golden-v1/` stores the policy, manifest and eight zlib/base64 grayscale `.sig` files. Raw reference PNGs are not committed; CI generates current full screenshots, reconstructed reference/current/diff thumbnails and `report.json` as 7-day artifacts.

Normalization contract:

- zh-CN
- first-aquarium seed
- reduced motion
- `Noto Sans CJK SC` required
- documented fixed masks only
- 128px grayscale signature
- `(77*r + 150*g + 29*b) >> 8`
- pixel delta threshold 24
- manifest dimensions authoritative

Final tolerances:

- Aquarium ≤0.50%
- Search ≤0.35%
- Collection ≤0.30%

### PUI-BC-049

Golden V3 #1 / run `32264392607` exposed a comparator bug, not UI drift: Python banker’s rounding made the 1024 reference 128×112 while JavaScript `Math.round()` re-derived 128×113. Other six cases were already 0% changed.

Fix: `1eea45dfea367a571daf123836348c79f67e517f`. Manifest thumbnail dimensions are now the cross-language contract.

PUI-BC-049 is canonical `evaluation_system / evaluation_contract / regression_verified`.

## Authoritative V3 validation

- Golden #3 / `32265296046` on `6bd1e045dcac709e0da7425a21b7b217142abb20`: 8/8 PASS, every case 0% changed under final thresholds.
- System #58 / `32265296159`: PASS on the same implementation head.
- Canonical PUI-049 commit `08a2d31944919c51fb087400002c446fcc88097e` changed the registry by exactly +1/-0; PUI-032 remains `guide_safe_water_change`.
- System #59 / `32267440195`: PASS.
- Golden #4 / `32267440206`: PASS; artifact `9370832138`, digest `sha256:09728cd8efb33476c423e53ddb22adcc8f077edf48953940e3eef272891b7a11`.

## CJK visual-test cache

Commit `da8cf1310f87a768edbf3c9c494a31ce3b489152` closes the V2/V3 CJK download bottleneck without weakening readability validation.

Implementation:

- `scripts/ensure-cjk-font.sh`
- `actions/cache@v4` in both Visual V2 and Golden V3
- cache key `aquaguide-noto-cjk-${{ runner.os }}-${{ runner.arch }}-20230817-v1`
- miss → retrying apt install → copy `NotoSansCJK-*.ttc` into cache
- hit → restore cached TTC into user font directory → `fc-cache`
- both paths must pass `fc-match` for `Noto Sans CJK SC`

Evidence:

- V2 #44 / run `32268929911` first attempt: cache miss, apt fallback, visual suite PASS, then cache saved.
- Manual rerun of the same workflow, job `96122316264`: cache hit restored ~27MB / 2 TTC files; helper printed `Restoring 2 cached Noto Sans CJK TTC file(s).` and `CJK font match: Noto Sans CJK SC`; apt was skipped.
- The hit run still passed TypeScript/build, Aquarium hierarchy, Search density and all 48 screenshots; artifact `9371672874`.
- System #61 / run `32268929844`: PASS after the cache workflow changes.

Important: never replace the font-readiness gate with a soft warning. Cache is an optimization only; corrupt/missing cache must fall back to apt, and missing CJK must still fail visual evidence generation.

## Baseline maintenance rule

Never update a golden signature just to make CI green. For a Golden V3 change: inspect structural gates and diff evidence, confirm intent, manually review the fold state, then update only the affected signature/mask/tolerance with an explicit PR explanation.

Prefer a narrow documented mask or replacing an unstable case over raising global tolerance.

## Next safe work

Do **not** expand the golden cohort merely because the infrastructure exists. Add a new golden case only after a real regression shows the current eight + structural contracts missed something important.

The next technically valuable work is separate from visual correctness:

1. bundle/chunk investigation — current Vite output still contains large chunks, including the 3D/React bundle;
2. existing dependency vulnerability triage;
3. only after review, decide whether #104 should move out of Draft and merge into RC1.

## Explicit non-claims / residual debt

- No merge to RC1 or `main`.
- No production deployment.
- Golden V3 is not a perceptual/aesthetic score.
- Only eight stable fold states are hard golden references; V2 retains broader review coverage.
- Raw PNG evidence expires after 7 days; compact signatures remain versioned in Git.
- Bundle/code-splitting warnings remain.
- Existing npm audit vulnerabilities remain outside this UI/UX scope.
