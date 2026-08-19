# AquaGuide Progress — Navigation Context Closure

**Date:** 2026-08-20  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104

## Latest navigation-context audit

- [x] Preserved prior PUI-BC-050 Compatibility behavior: first risk-review click stays in detail; second stage may enter full Compatibility; Atlas no longer jumps to the deep calculator anchor.
- [x] Added permanent `Navigation Context V1` browser workflow.
- [x] Reproduced Search deep-result return failure after explicit show-all.
- [x] Search now persists query, Species/Care expansion state, source result ID and exact workspace scroll before leaving for detail.
- [x] Search return restores structure first, then exact scroll + focus.
- [x] Species >18 and Care >12 return flows both pass.
- [x] Distinguished a Playwright actionability auto-scroll evaluator artifact from the real Search product bug.
- [x] Audited Aquarium → Tank livestock roster → Species Detail → close.
- [x] Confirmed a real nested-surface failure: closing Species Detail dropped back to the Aquarium launcher instead of the parent roster.
- [x] Added roster-scoped return context: record ID, fish ID and internal roster scroll.
- [x] Child Species Detail dismissal now reopens only its originating Aquarium roster after child exit animation completes.
- [x] Restores roster internal scroll and exact original profile-button focus.
- [x] Other Species Detail entry points do not inherit the roster-specific return path.
- [x] Refined browser evaluator to distinguish parent/child drawers during Radix exit animation.
- [x] Corrected a browser-evaluator-only TypeScript-generic syntax mistake in `waitForFunction` without changing product behavior.
- [x] Final combined Navigation Context V1 #9 PASS.
- [x] Same implementation head passed System, broad Visual QA V2, Golden V3 and Bundle Audit.

## Authoritative implementation head

`0c7d28ec647359f3b6e4a1afd1fd1e9a908f4bfc`

Passed on this head:

- Navigation Context V1 #9 / run `32282629416` — PASS
- UI UX System Refactor V1 #81 / run `32282629391` — PASS
- UI UX Visual QA V2 #64 / run `32282629417` — PASS
- UI UX Golden V3 #26 / run `32282629479` — PASS
- Bundle Audit V1 #19 / run `32282629407` — PASS

## Fail-before trail retained

### Search

- Navigation Context #1 / run `32280048039`: deep Species result disappeared from DOM after detail return — **real product fail-before**.
- Fix: `9feaac4d90fef5ce2e4665154f9554759e15f591`.
- #2 exposed Playwright `.click()` auto-scroll between measurement and product capture — **evaluator artifact**.
- Evaluator fix: `7a736ef6349b4b77dceaf240c1fc61f96f769b98`.
- #3: Species + Care expansion/focus/scroll PASS.

### Aquarium

- #4: generic `right-drawer:visible` matched both roster exit animation and child Species Detail — **evaluator ambiguity**, not product evidence.
- #5 / run `32281408153`: after exact parent/child discrimination, child detail closed but roster did not reappear for 45 seconds — **real product fail-before**.
- Product fixes: `28fb8a796bfd1b6b290daf74284945296daff9a3` + `dbf5546e99306ba078a723115451dcf12123a3b7`.
- #7: parent roster reopening PASS.
- #8: exact-focus assertion used TypeScript generic syntax inside serialized browser JS — **evaluator bug**; product roster had already restored.
- #9: parent roster + original profile focus + workspace context PASS.

## Governance

- [x] `BADCASE_LATEST.md` documents PUI-BC-051 and PUI-BC-052.
- [ ] Append PUI-BC-051 / PUI-BC-052 to canonical `evaluation/product/badcases.v1.jsonl` without rewriting history.
- [ ] Verify canonical delta is exactly +2 / -0 and PUI-BC-032 remains unchanged.
- [ ] Update PR #104 description with final Navigation Context evidence.

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
- [ ] Refactor the thin wrapper/Base compatibility repair without retaining its navigation regression coverage.
