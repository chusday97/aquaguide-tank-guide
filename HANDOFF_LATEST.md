# AquaGuide Handoff — Merge Readiness

**Date:** 2026-08-20  
**Branch:** `agent/uiux-system-refactor-v1`  
**PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Base:** `integration/aquaguide-rc1`

## Current state

The UI/UX branch has completed its Navigation Context closure and canonical governance. The last code/governance head before docs-only readiness updates is `20157e0c786becf92dce2442c208e711da8cf60c`.

#104 is still **not merged** into RC1 or `main` and is **not deployed to production**. The intended next state is Ready for Review, not merge.

## What #104 contains

- UI/UX system contracts: canonical typography/spacing/radius/elevation ownership, width-driven layout, 44×44 named targets, reduced-motion and inactive-carousel accessibility guards.
- Aquarium task hierarchy and responsive workspace corrections.
- Collection three-live-module focus carousel and quiet Achievements state.
- Search Species/Care show-all parity and content-width-driven layout.
- PUI-BC-050 risk-review/Compatibility navigation repair.
- PUI-BC-051 Search deep-result return-context repair.
- PUI-BC-052 Aquarium roster → Species Detail → roster nested-parent return repair.
- Visual QA V2 broad capture: 48 screenshots.
- Golden V3: eight stable normalized fold references.
- CJK screenshot-font fail-closed policy + verified Actions cache.
- Bundle Audit V1 measurement instrumentation; no bundle-size reduction claim.

## Navigation Context closure

### PUI-BC-051 — Search deep results

Old behavior: after explicit “View all”, opening a Species result beyond the first 18 or Care result beyond the first 12 and returning from detail collapsed the list. The source result no longer existed in the DOM, so source-ID-only focus restoration could not work.

Current behavior:

- persist `query + sourceId + showAllSpecies + showAllCare + workspace scrollTop`;
- restore expanded list structure before DOM restoration;
- restore exact workspace scroll and source focus with `preventScroll`;
- clear stale context when query changes.

Real fail-before: Navigation Context #1 / run `32280048039`.
Fix: `9feaac4d90fef5ce2e4665154f9554759e15f591`.

### PUI-BC-052 — Aquarium nested parent

Old behavior: `Aquarium → 缸内物种 roster → Species Detail → close` dropped to the Aquarium launcher instead of returning to the immediate parent roster.

Current behavior:

- roster captures originating record/fish and roster-internal scroll;
- only matching Aquarium species-detail dismissal triggers parent return;
- parent waits for child exit animation to complete before reopening;
- restores roster scroll and exact original profile-button focus;
- non-roster Species Detail entry points are unaffected.

True fail-before: Navigation Context #5 / run `32281408153` after evaluator ambiguity was removed.
Fixes: `28fb8a796bfd1b6b290daf74284945296daff9a3` + `dbf5546e99306ba078a723115451dcf12123a3b7`.

## Canonical governance

- PUI-BC-051 and PUI-BC-052 are now in `evaluation/product/badcases.v1.jsonl`.
- They were appended by a one-time guarded workflow that required exactly **+2 / -0**, checked PUI-BC-032's historic `guide_safe_water_change`, and ran `test:product-evaluation` before pushing.
- Canonical append commit: `5ccdb3e2ebf96437bf0a671cbec180b4c583a8df`.
- The temporary append workflow was then removed; cleanup head: `20157e0c786becf92dce2442c208e711da8cf60c`.

## Latest mandatory evidence

All primary gates passed on `20157e0c786becf92dce2442c208e711da8cf60c`:

- Navigation Context V1 #15 / run `32283514536` — PASS
- UI UX System Refactor V1 #87 / run `32283514511` — PASS
- UI UX Visual QA V2 #70 / run `32283514530` — PASS
- UI UX Golden V3 #32 / run `32283514489` — PASS after infrastructure-only retry
- Bundle Audit V1 #25 / run `32283514480` — PASS

Golden #32 first attempt failed before Chromium installation because a `westus3` GitHub runner received Playwright CDN 403 `service is not available in your location`. No product/reference/tolerance changes were made. Job-only retry on `eastus` succeeded, and all eight Golden signatures were **0% changed**. Artifact `9376839397`, digest `sha256:b5d5d9218a78bd5aee264e02a2242d1a17398000cc0b2486158b5961b3059067`.

## Preview / review status

- Cloudflare Pages preview for `20157e0` succeeded.
- Vercel preview is currently blocked by the free account's >100 deployments/day quota; the bot explicitly reports a resource limit rather than a build error.
- No submitted PR reviews.
- No unresolved inline review threads.

## Merge-readiness judgment

**No current product blocker was found.** The branch is suitable to move from Draft to Ready for Review once this readiness documentation and PR body are current.

### Accepted non-blockers

1. `SpeciesDetailDialog.tsx` + `SpeciesDetailDialogBase.tsx` and `Encyclopedia.tsx` + `EncyclopediaBase.tsx` remain thin-guard/Base structures. They were chosen to make surgical navigation fixes without rewriting thousand-line legacy components. Recombining them now would materially increase merge risk; clean them up in a follow-up PR only with the current regressions retained.
2. Bundle entry remains roughly 2.1 MiB; measured major contributors include fish/localization data and eager analytics/data-service dependencies. Do not start this refactor inside #104.
3. Vite still warns that fish/care data are both dynamically and statically imported.
4. `npm ci` still reports 18 existing vulnerabilities (2 low / 6 moderate / 10 high). `package.json` and `package-lock.json` are not changed by #104, so this is pre-existing dependency debt.
5. Vercel preview quota failure is external infrastructure state; Cloudflare preview is available.

## Next owner action

- Update PR #104 body with Navigation Context / canonical / latest-head readiness evidence.
- Move #104 from Draft to **Ready for Review**.
- Do **not** merge or production-deploy as part of that transition.
- Keep bundle optimization, dependency remediation and wrapper/Base consolidation in separate follow-up work so this already-large PR stops growing.
