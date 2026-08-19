# AquaGuide UI/UX System Refactor — Handoff

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Base:** `integration/aquaguide-rc1`  
**Validated implementation head:** `69a33c071a204c049bd0a5ad68097901d046d00c`

## 1. Why this branch exists

The earlier Collection carousel work in PR #103 was based on `main`. During the full UI/UX audit we found that `integration/aquaguide-rc1` already contained the newer UI V2 foundation, width-driven responsive layout, Aquarium progressive disclosure, and broader visual/browser regression work. Continuing to stack system work on #103 would increase branch divergence.

This branch therefore uses **RC1 as the product baseline** and ports the useful IceGlide-style Collection interaction onto that baseline. PR #103 remains an older main-based implementation and has not been merged or closed by this refactor.

## 2. System decisions now enforced

### Design system
- `src/styles/ui-v2-foundation.css` is the single source of truth for typography, spacing, radius, and elevation tokens.
- `src/styles/typography-system.css` is now a semantic compatibility layer only: `type-page-title / type-section-title / type-card-title / type-body / type-meta / type-action`, task-surface widths, and saved-object rail behavior.
- Duplicate `--type-*` token ownership was removed.

### Responsive contract
- Real viewport width is the product source of truth: `<=767px` compact/phone, `>=768px` desktop workspace.
- The layout reacts to `matchMedia` changes.
- UA parsing remains fallback-only; iPad/tablet is checked before generic `Mobile Safari` so viewportless fallback cannot misclassify iPad as phone.

### Aquarium hierarchy
RC1's progressive-disclosure fix is preserved as a system invariant:
- Primary: record water change, record feeding, record existing species.
- Secondary actions remain under `More actions`.
- The system contract prevents a regression back to seven equal-weight primary actions.

### Collection information architecture
- `/collection` primary carousel now contains exactly three **live** modules: Wishlist, Care, Memorial.
- Achievements remains explicitly `building` but is moved outside the primary carousel into a quiet `Coming next` surface with no fake business CTA.
- Carousel has one active card, visible neighbor previews, drag, arrows, position indicators, active scale/opacity hierarchy, and reduced-motion support.
- Non-active cards use `inert` and `aria-hidden` so hidden/offscreen child controls do not remain in keyboard focus order.
- Detailed Wishlist/Care saved objects remain horizontal snap rails; top-level focus carousel and object rails are intentionally different interaction patterns.

### Search hierarchy
- Species keeps an 18-card preview and can explicitly expand to all results.
- Care keeps a 12-card preview and now has the same explicit section-level show-all behavior.
- Final browser fixture `鱼`: Species `372`, Care `33`; both expand to the full advertised set.

### Cross-surface accessibility and affordance
- Explicit named controls (`button[aria-label]`, `a[aria-label]`) inherit a `44×44px` minimum target.
- This closed legacy Care source/image controls that were 28–40px in the full responsive scan.
- Desktop workspaces restore a subtle scrollbar so long task surfaces expose scroll-position affordance.
- Reduced-motion rules cover Collection rails/carousel and system transitions.

## 3. Regression system added

New dedicated workflow: `.github/workflows/uiux-system-refactor-v1.yml`.

It runs on PRs targeting both `main` and `integration/aquaguide-rc1`, and gates:
- width-driven layout policy;
- canonical token ownership and semantic typography;
- interaction consistency;
- Collection IA/static contract;
- cross-surface UI/UX system contract;
- TypeScript and production build;
- Search show-all browser regression;
- Collection browser regression at 390 / 600 / 1440;
- GP-005 Collection context restoration;
- full responsive route scan.

## 4. Fail-before evidence from this refactor

The system gate caught real issues before turning green:
1. **iPad fallback misclassification:** viewportless iPad UA hit generic `Mobile Safari` before tablet detection.
2. **Evaluation drift:** old typography test required a JSX semantic class even though RC1 correctly applies Aquarium heading tokens through container-aware V2 CSS.
3. **Ambiguous browser locator:** Collection heading test initially matched both sidebar text and page heading; locator was tightened to semantic heading.
4. **Carousel focus bug:** non-active cards were visually hidden but child controls could remain keyboard-focusable/offscreen.
5. **Touch-target debt:** Care had named source/image controls at 28×28 / ~34px / 40px instead of the 44px baseline.

These were fixed rather than hidden with route-specific scanner exceptions.

## 5. Final validation

**UI UX System Refactor V1 — Run #9**  
**Run ID:** `32251342843`  
**Result:** `success`

Verified in the successful run:
- `layout mode policy: 5 viewport cases + 4 fallback cases passed`
- canonical typography/token contract PASS
- interaction consistency PASS
- three-live-module Collection contract PASS
- cross-surface UI/UX system contract PASS
- TypeScript PASS
- production build PASS
- Search show-all: `species=372; care(鱼)=33`
- Collection: focus carousel PASS at **390 / 600 / 1440**, building IA separated, saved-object rails preserved, no overflow
- GP-005: exact saved object → desktop drawer/mobile sheet → Escape → exact focus + rail position restored
- full responsive scan: **7 profiles × 17 routes PASS**

## 6. Remaining debt / explicit non-claims

- PR #104 is still **Draft** and has not been merged into RC1/main.
- Nothing in this refactor has been deployed to production.
- RC1 already has Aquarium-specific screenshot visual regression, but this PR does **not** claim a complete pixel-diff visual baseline for every product surface. A future system-wide screenshot baseline is still useful.
- Vite still reports large-chunk/code-splitting warnings; the main bundle remains a performance debt outside this UI/UX contract refactor.
- `npm ci` reports dependency vulnerabilities. They were not introduced or remediated as part of this UI/UX scope.

## 7. Recommended next decision

Review PR #104 as the UI/UX system layer on top of RC1. Do not continue visual refactors on PR #103. If RC1 remains the convergence branch, future page-level UI work should consume these system contracts rather than adding new page-specific spacing/radius/interaction rules.