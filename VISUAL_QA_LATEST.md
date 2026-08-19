# AquaGuide Visual QA — V2 Baseline + V3 Golden Cohort

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104

## Current visual maturity

AquaGuide now has two complementary visual-QA layers:

1. **Visual QA V2 = broad review evidence.** Four viewports × six core routes × fold/full-page = 48 screenshots, plus geometry contracts for Aquarium and Search.
2. **Golden V3 = small regression gate.** Eight deliberately stable fold states are normalized and pixel-diffed against reviewed V2 references.

V3 does **not** replace V2. V2 answers “what does the product look like across the core surfaces?”; V3 answers “did a small set of approved responsive states unexpectedly drift?”

## V2 broad baseline

Viewports:

- 390×844
- 768×900
- 1024×900
- 1440×1000

Routes:

- `/aquarium`
- `/encyclopedia`
- `/care`
- `/search?q=鱼`
- `/collection`
- `/settings`

Authoritative V2 implementation run:

- `UI UX Visual QA V2 #19`
- run `32259734301`
- head `ef69d85e48712d27990423fcc85e23a4047f0756`
- artifact `9367824682`
- result: **PASS**

The V2 harness remains fail-closed: real Aquarium dashboard state must exist, CJK font readiness is required, and structural Aquarium/Search geometry checks run before accepting evidence.

## V3 Golden Cohort v1

The full 48-image matrix is intentionally **not** a pixel-diff contract. Long pages, recommendation text and WebGL would make that brittle. V3 locks only eight high-signal fold states:

| Surface | 390 | 768 | 1024 | 1440 |
| --- | --- | --- | --- | --- |
| Aquarium | Golden | Golden | Golden | Golden |
| Search | — | — | Golden | Golden |
| Collection | Golden | — | — | Golden |

Reference source: the approved V2 #19 fold screenshots.

### Repository contract

`evaluation/visual/golden-v1/` contains:

- `manifest.json`
- eight compressed `.sig` reference files
- baseline/update policy in `README.md`

Raw reference PNGs are not committed. CI still uploads current screenshots and diff evidence for human review, while Git stores compact deterministic pixel signatures.

### Normalization algorithm

For each case:

1. capture the approved route/state with the same first-aquarium seed, zh-CN locale and reduced motion;
2. require `Noto Sans CJK SC`;
3. apply only explicitly documented fixed masks;
4. sample to a 128px-wide grayscale thumbnail;
5. grayscale formula: `(77*r + 150*g + 29*b) >> 8`;
6. compare against the zlib-compressed reviewed signature;
7. a pixel counts as changed only when grayscale delta is greater than `24`;
8. fail when changed-pixel ratio exceeds the per-surface tolerance.

The manifest owns both `thumbWidth` and `thumbHeight`; verifier code must not re-derive approved thumbnail geometry.

### Fixed masks

Masks exist only where deterministic pixel comparison would otherwise measure content noise instead of layout:

- Aquarium 1024: WebGL context + lower recommendation content
- Aquarium 1440: WebGL context + lower recommendation content

The mask coordinates are fixed to the approved screenshot. Moving or resizing a masked region is therefore not silently ignored; new pixels outside the original rectangle still contribute to the diff.

### Final thresholds

- Aquarium: **≤0.50% changed pixels**
- Search: **≤0.35%**
- Collection: **≤0.30%**
- per-pixel grayscale noise threshold: `24`

These are deliberately much tighter than the initial provisional 1.8%–2.5% limits because repeated approved-state runs produced 0% changed pixels across all eight cases.

## V3 fail-before and correction

### PUI-BC-049 — cross-language thumbnail rounding false failure

Golden V3 #1 / run `32264392607` failed before real pixel comparison for only the two 1024×900 cases:

- approved Python reference: `900 × 128 / 1024 = 112.5` → banker’s rounding → 112
- JavaScript verifier: `Math.round(112.5)` → 113

The UI itself had not drifted: the other six cases were already exactly 0% changed.

Fix commit: `1eea45dfea367a571daf123836348c79f67e517f`.

The manifest is now the language-independent geometry contract. Golden V3 #2 / run `32264776117` then passed 8/8 at 0% changed.

## Authoritative final V3 evidence

### Tight-threshold implementation validation

`UI UX Golden V3 #3` / run `32265296046` on head `6bd1e045dcac709e0da7425a21b7b217142abb20`:

- 8/8 cases PASS
- every case = **0% changed**
- Aquarium limit 0.50%
- Search limit 0.35%
- Collection limit 0.30%

Same-head `UI UX System Refactor V1 #58` / run `32265296159` also passed.

### Canonical-closeout validation

After PUI-BC-049 was appended to the canonical product badcase registry:

- canonical commit: `08a2d31944919c51fb087400002c446fcc88097e`
- `UI UX System Refactor V1 #59` / run `32267440195`: **PASS**
- `UI UX Golden V3 #4` / run `32267440206`: **PASS**
- Golden artifact ID: `9370832138`
- artifact digest: `sha256:09728cd8efb33476c423e53ddb22adcc8f077edf48953940e3eef272891b7a11`
- artifact retention: 7 days

The canonical registry change was verified as exactly **+1 line / -0 lines**; historical PUI-BC-032 still uses the original `guide_safe_water_change` trigger.

## Baseline update policy

Do not update a `.sig` only to make CI green. A golden change is acceptable only when:

- the visual change is intentional;
- structural browser regressions still pass;
- the affected fold screenshot is manually reviewed;
- the PR explains which golden case changed and why.

If a state becomes intrinsically noisy, prefer a narrow documented mask or removing/replacing that case rather than increasing global tolerance.

## Non-claims / residual debt

- Golden V3 is a regression detector, not an aesthetic/perceptual design score.
- Only eight stable fold states are golden; the full 48-image V2 baseline remains review evidence rather than a golden contract.
- Current/reference/diff PNG artifacts retain for 7 days; compact signatures are what remain versioned in Git.
- `fonts-noto-cjk` is a ~61MB package and runner download speed is still a CI-latency risk. The readability gate should stay; caching/vendor strategy is a separate engineering follow-up.
- Bundle/code-splitting warnings and existing npm audit findings remain separate debt.
- PR #104 remains Draft, unmerged and undeployed.
