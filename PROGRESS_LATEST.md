# AquaGuide UI/UX System Refactor — Progress

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104 → `integration/aquaguide-rc1`

## Completed

- [x] Re-evaluated branch topology and selected RC1 rather than the older main-based Collection branch as the system-refactor baseline.
- [x] Preserved RC1's width-driven responsive architecture and Aquarium progressive-disclosure hierarchy.
- [x] Ported the useful IceGlide-style Collection focus-carousel interaction onto RC1.
- [x] Reduced Collection primary IA to three live modules: Wishlist / Care / Memorial.
- [x] Moved Achievements out of primary IA into a non-interactive `Coming next` building surface.
- [x] Preserved Wishlist/Care saved-object horizontal snap rails and GP-005 context restoration.
- [x] Made `ui-v2-foundation.css` the canonical design-token owner.
- [x] Converted `typography-system.css` into a semantic consumer/compatibility layer rather than a competing token source.
- [x] Upgraded typography regression to test final token consumption instead of stale JSX implementation details.
- [x] Locked width-driven layout contract: 390/600/767 compact, 768+ desktop.
- [x] Fixed viewportless iPad fallback ordering.
- [x] Added explicit Care result `show all` behavior to Search and retained Species expansion.
- [x] Added `prefers-reduced-motion` behavior for Collection interaction.
- [x] Removed non-active carousel cards from keyboard focus order with `inert`.
- [x] Enforced a 44×44 minimum target for explicitly named controls across AquaGuide.
- [x] Restored subtle desktop workspace scrollbar/scroll-position affordance.
- [x] Added cross-surface `test-uiux-system-contract.mjs`.
- [x] Added dedicated stacked-PR workflow `.github/workflows/uiux-system-refactor-v1.yml` targeting both `main` and `integration/aquaguide-rc1`.
- [x] Extended Search browser regression: Species `372`, Care `33` for broad `鱼` fixture.
- [x] Extended Collection browser regression at 390 / 600 / 1440.
- [x] Ported focus-carousel assertions into continuous GP-005 browser journey.
- [x] Ran full responsive scanner: 7 profiles × 17 routes.
- [x] Closed all fail-before issues found by the new gate rather than whitelisting them.
- [x] Final UI UX System Refactor V1 run #9 / `32251342843` completed successfully.
- [x] Created `HANDOFF_LATEST.md`.
- [x] Created `BADCASE_LATEST.md`.
- [x] Created `PROGRESS_LATEST.md`.

## Intentionally not completed

- [ ] Merge PR #104 into `integration/aquaguide-rc1` — not executed without explicit release/merge instruction.
- [ ] Merge/close PR #103 — it remains an older main-based implementation; no destructive branch action taken.
- [ ] Deploy to production — not part of this refactor.
- [ ] Full-system pixel-diff baseline for every route — RC1 has existing Aquarium visual screenshot coverage, but a broader product-wide visual baseline remains future work.
- [ ] Bundle/code-splitting cleanup — Vite warnings remain outside this UI/UX system scope.
- [ ] Dependency vulnerability remediation — npm audit findings remain outside this UI/UX system scope.

## Validation snapshot

Implementation head validated by workflow: `69a33c071a204c049bd0a5ad68097901d046d00c`  
Workflow: `UI UX System Refactor V1` #9  
Run ID: `32251342843`  
Result: **PASS**

Key browser evidence:
- Search: Species 372 / Care 33 full expansion PASS.
- Collection: 390 / 600 / 1440 focus-carousel IA PASS.
- GP-005: exact card context and horizontal position restored after detail close PASS.
- Responsive scanner: 7 profiles × 17 routes PASS.

## Next checkpoint

Before any further visual page work, treat these system contracts as constraints. The next meaningful product decision is whether PR #104 should be reviewed/merged into RC1; additional page-level styling should not be stacked on the older #103 branch.