# AquaGuide Handoff — UI/UX System Refactor + Visual QA V2/V3

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Base:** `integration/aquaguide-rc1`

## Current state

The UI/UX system layer, broad Visual QA V2 baseline, and small Golden V3 regression cohort are implemented on top of RC1. The PR remains **Draft**, is **not merged** into RC1 or `main`, and is **not deployed**.

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

V2 captures:

- 390×844
- 768×900
- 1024×900
- 1440×1000

across Aquarium, Encyclopedia, Care, Search, Collection and Settings, with both fold and full-page images: **48 screenshots**.

Authoritative implementation evidence:

- `UI UX Visual QA V2 #19`
- run `32259734301`
- head `ef69d85e48712d27990423fcc85e23a4047f0756`
- result PASS
- artifact `9367824682`

V2 closed:

- PUI-BC-045 Aquarium narrow-workspace task hierarchy
- PUI-BC-046 1024 sidebar width cliff
- PUI-BC-047 Search viewport/content-width mismatch
- PUI-BC-048 return-context overlap

The V2 harness rejects Welcome-as-Aquarium screenshots, missing CJK fonts and false wrapper-box overlap measurements.

## Visual QA V3 Golden Cohort

### Why only eight cases

Do not turn the whole 48-image V2 matrix into a hard pixel contract. Long content, recommendations and WebGL create brittle noise. The approved Golden Cohort v1 is:

- Aquarium 390 / 768 / 1024 / 1440
- Search 1024 / 1440
- Collection 390 / 1440

Reference source: approved V2 #19 fold screenshots.

### Versioned reference representation

`evaluation/visual/golden-v1/` stores:

- `README.md` baseline/update policy
- `manifest.json`
- eight zlib/base64 grayscale `.sig` files

Raw reference PNGs are not committed. CI generates current full screenshots plus reconstructed reference/current/diff thumbnails and `report.json` as a 7-day artifact.

### Normalization contract

- zh-CN locale
- first-aquarium seed
- reduced motion
- `Noto Sans CJK SC` required
- fixed documented masks only
- 128px-wide grayscale thumbnail
- formula `(77*r + 150*g + 29*b) >> 8`
- per-pixel noise threshold `24`
- manifest `thumbWidth/thumbHeight` is authoritative geometry

Final changed-pixel tolerances:

- Aquarium ≤0.50%
- Search ≤0.35%
- Collection ≤0.30%

### PUI-BC-049 evaluation fail-before

Golden V3 #1 / run `32264392607` exposed an evaluator bug, not UI drift. At 1024×900, normalized height is mathematically 112.5. Python reference generation used banker’s rounding (112) while JavaScript `Math.round()` produced 113. The two 1024 cases failed before real pixel comparison; all other six cases were already 0% changed.

Fix commit: `1eea45dfea367a571daf123836348c79f67e517f`.

The verifier now consumes manifest dimensions directly. PUI-BC-049 is canonical `evaluation_system / evaluation_contract / regression_verified`.

## Authoritative validation

### V3 implementation / threshold calibration

`UI UX Golden V3 #3` / run `32265296046` on head `6bd1e045dcac709e0da7425a21b7b217142abb20`:

- 8/8 PASS
- every case 0% changed
- tightened final thresholds active

Same-head `UI UX System Refactor V1 #58` / run `32265296159`: PASS.

### Final canonical closeout

Canonical PUI-BC-049 commit:

`08a2d31944919c51fb087400002c446fcc88097e`

The canonical registry diff was explicitly checked as **+1 line / -0 lines**. Historical PUI-BC-032 still contains the original `guide_safe_water_change` trigger.

Final canonical-head workflows:

- `UI UX System Refactor V1 #59` / run `32267440195` — **PASS**
- `UI UX Golden V3 #4` / run `32267440206` — **PASS**
- Golden artifact ID `9370832138`
- digest `sha256:09728cd8efb33476c423e53ddb22adcc8f077edf48953940e3eef272891b7a11`

System #59 passed canonical product evaluation, static UI/UX contracts, TypeScript, production build, Search/Collection browser regressions, GP-005 and the 7 profiles × 17 routes responsive scan.

## Baseline maintenance rule

Never update a golden signature just to make CI green. When a Golden V3 case changes:

1. determine whether structural regressions also fail;
2. inspect current/reference/diff evidence;
3. decide whether the visual change is intentional;
4. manually review the affected fold state;
5. update only the affected signature/mask/tolerance with a PR explanation.

Prefer a narrow documented mask or replacing an unstable case over raising global tolerance.

## Next safe work

The strongest next engineering improvement is **CJK snapshot-font delivery optimization** because `fonts-noto-cjk` is ~61MB and runner download speed has already dominated V2/V3 runtime. Preserve the font-readiness gate; improve caching/vendor/install strategy rather than accepting tofu screenshots.

A later visual expansion should be evidence-driven: add a new golden state only after a real regression demonstrates that structural assertions plus the existing eight cases do not cover it.

## Explicit non-claims / residual debt

- No merge to RC1 or `main`.
- No production deployment.
- Golden V3 is not a perceptual/aesthetic score.
- Only eight stable fold states are hard golden references; V2 retains broader review coverage.
- Raw PNG evidence is not committed and expires after 7 days; compact signatures are versioned in Git.
- Bundle/code-splitting warnings remain.
- Existing npm audit vulnerabilities remain outside this UI/UX scope.
