# AquaGuide RC1 Handoff — PUI-BC-033

## Problem
Global Search advertised “查看全部 N 个物种”, but the old action only submitted the query while the result surface remained capped at 18. An earlier fix also exposed a second mismatch: the autocomplete count and result-page count used different matching logic.

## RC1 product contract
- Normal Search remains a compact preview capped at 18 species.
- An explicit “查看全部 N 个物种” action expands the result set to all N matches.
- The advertised N and rendered result set use the same `getSpeciesSearchResults()` matcher.
- Editing or normally resubmitting the query resets the expanded state.
- UI V2 layout/classes remain unchanged; this is an Action Completeness fix, not a visual rollback.

## RC1 implementation
`src/pages/Search.tsx` now owns a `showAllSpecies` state, a shared species matcher, and a real `showAllSpeciesResults()` action. The autocomplete receives the exact result-page count rather than a separate suggestion-service count.

## Regression
`scripts/verify-search-show-all-v2.mjs` runs against the UI V2 DOM and verifies that the number embedded in the CTA equals the number of rendered `.search-v2-species-card` results after the action.

Keep RC1 Draft until the clean Product Golden Path and UI gates pass on the final convergence head.
