# AquaGuide Handoff — Navigation Context Closure

**Date:** 2026-08-20  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Base:** `integration/aquaguide-rc1`

## Current state

PR #104 remains **Draft**, is **not merged** into RC1 or `main`, and is **not deployed**.

The branch now contains the UI/UX system refactor, Visual QA V2, Golden V3, CJK visual-test cache, bundle audit instrumentation, PUI-BC-050 Compatibility navigation repair, and the new Navigation Context V1 closure for Search and Aquarium nested detail flows.

## Latest closure — Navigation Context V1

The audit intentionally tested more than route correctness. A return path must restore the immediate task context: expanded/collapsed state, exact source object, scroll and keyboard focus.

### Search deep results — PUI-BC-051

Fail-before:

- `/search?q=鱼` → explicit “View all” → open a Species result after the 18-item preview → close detail.
- Search remounted with `showAllSpecies=false`; the deep source result was no longer in the DOM, so the old source-ID-only focus restore could never work.
- Care had the same latent issue for results after the 12-item preview.
- Navigation Context #1 / run `32280048039` is the real fail-before.

Current behavior:

- Search stores `query + sourceId + showAllSpecies + showAllCare + workspace scrollTop` in one return-context record before opening a detail.
- Returning Search hydrates expansion state before DOM restoration, then restores exact workspace scroll and focus with `preventScroll`.
- Query changes clear stale return context.
- Species and Care use the same contract.

Implementation:

- `src/pages/Search.tsx`
- fix commit `9feaac4d90fef5ce2e4665154f9554759e15f591`

Evaluator note:

- Navigation #2 initially reported a Care scroll mismatch because Playwright `.click()` auto-scrolled the target after the test measured scroll but before the product handler captured it.
- `7a736ef6349b4b77dceaf240c1fc61f96f769b98` changed the evaluator to click an already-visible card by screen coordinates, so it compares the same user-visible state instead of two different instants.
- Navigation #3 then passed deep Species + Care expansion/focus/scroll.

### Aquarium roster → Species Detail → roster — PUI-BC-052

Fail-before:

- `Aquarium → 缸内物种 roster → one species profile → close Species Detail` dropped the user back to the Aquarium archive launcher instead of returning to the parent roster.
- Parent roster was intentionally closed before opening the child detail; the existing page-level navigation context only knew about `#aquarium-records`, not the originating roster record or roster internal scroll.
- After correcting the evaluator to distinguish the parent roster from its exit animation and the child `data-detail-kind="species"` drawer, Navigation Context #5 / run `32281408153` waited 45 seconds and the roster still never returned. This is the genuine product fail-before.

Current behavior:

- `LivestockRosterDialog` captures `recordId + fishId + roster scrollTop` only when a Species Detail originates from the roster.
- `SpeciesDetailDialog` emits a scoped dismissal signal only for an actual user close.
- The roster waits until the child drawer has physically completed its exit animation before reopening, preventing overlapping focus traps.
- It then restores its internal scroll and the exact original species profile button focus.
- Species Details opened from other Aquarium contexts such as the 3D surface do not inherit this roster-specific return path.

Implementation:

- `src/components/SpeciesDetailDialog.tsx`
- `src/components/aquarium/LivestockRosterDialog.tsx`
- product commits `28fb8a796bfd1b6b290daf74284945296daff9a3` + `dbf5546e99306ba078a723115451dcf12123a3b7`

Evaluator note:

- Navigation #4 was a locator ambiguity caused by Radix exit animation; it is not counted as product evidence.
- Navigation #8 used TypeScript generic syntax inside `page.waitForFunction`, which executes as plain browser JavaScript; that evaluator bug was corrected without changing product behavior.

## Authoritative implementation validation

Implementation/evaluator head: `0c7d28ec647359f3b6e4a1afd1fd1e9a908f4bfc`.

All passed on that head:

- **Navigation Context V1 #9** / run `32282629416` — Search deep Species/Care restore + Aquarium roster child-detail return + exact focus PASS.
- **UI UX System Refactor V1 #81** / run `32282629391` — PASS.
- **UI UX Visual QA V2 #64** / run `32282629417` — PASS.
- **UI UX Golden V3 #26** / run `32282629479` — PASS.
- **Bundle Audit V1 #19** / run `32282629407` — PASS.

The product build still reports the known bundle warnings. This Navigation Context work does **not** claim bundle reduction or dependency remediation.

## Prior PUI-BC-050 behavior retained

The risky Species Detail interaction remains deliberately two-stage:

- first “risk / alternatives” action stays in the detail and reveals Compatibility evidence;
- after the evidence has been reviewed, the user may enter the full Compatibility calculator;
- full Compatibility is a top-level fixed drawer and does not deep-scroll the underlying Atlas.

Permanent regression remains `scripts/verify-encyclopedia-risk-navigation.mjs` in System CI.

## Evaluation layers retained

1. **System contracts** — tokens, layout, interaction/accessibility, route regressions.
2. **Navigation Context V1** — task-return semantics across nested/search detail flows.
3. **Visual QA V2** — 48 screenshots across 390 / 768 / 1024 / 1440 and six primary routes.
4. **Golden V3** — eight stable normalized fold signatures with strict pixel-diff thresholds.
5. **Bundle Audit V1** — measurement only; not yet an optimization claim.

## Governance status

- `BADCASE_LATEST.md` documents PUI-BC-051 and PUI-BC-052.
- `PROGRESS_LATEST.md` records fail-before, evaluator corrections and final green evidence.
- Canonical `evaluation/product/badcases.v1.jsonl` still needs PUI-BC-051/052 appended as an exact +2 / -0 change before this audit is fully closed.
- After canonical append, re-run the mandatory System gate and update PR #104 body.

## Explicit remaining work

- Do not merge or deploy until canonical Navigation Context governance is complete and latest mandatory checks are green.
- After this closure, perform **#104 Merge Readiness** before adding more UI features: scope audit, temporary wrapper/Base review, obsolete test cleanup, and final mandatory-check matrix.
- Bundle/code-splitting remains a separate measured debt: entry is still roughly 2.1 MiB and synchronous localization/data dependencies remain the major structural obstacle.
- Existing npm audit findings remain separate debt.
