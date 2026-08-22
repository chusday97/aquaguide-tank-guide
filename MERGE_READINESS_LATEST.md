# AquaGuide #104 — Merge Readiness

**Date:** 2026-08-20  
**PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Base:** `integration/aquaguide-rc1`  
**Branch:** `agent/uiux-system-refactor-v1`

## Decision

**READY FOR REVIEW — not yet approved to merge or deploy.**

The last code/governance head `20157e0c786becf92dce2442c208e711da8cf60c` passed all five engineering gates. Subsequent commits only refresh merge-readiness documentation.

## Mandatory gate matrix

| Gate | Run | Result |
| --- | --- | --- |
| Navigation Context V1 | #15 / `32283514536` | PASS |
| UI UX System Refactor V1 | #87 / `32283514511` | PASS |
| UI UX Visual QA V2 | #70 / `32283514530` | PASS |
| UI UX Golden V3 | #32 / `32283514489` | PASS after infrastructure-only retry |
| Bundle Audit V1 | #25 / `32283514480` | PASS |

Golden V3 retry note: first attempt was blocked at Playwright Chromium download by a GitHub runner/CDN regional 403 before pixel comparison. The job was rerun without code, reference or tolerance changes. Retry completed all eight cases at 0% changed.

## Navigation-context acceptance

- PUI-BC-050: risk review no longer silently changes task; full Compatibility no longer deep-scrolls the Atlas.
- PUI-BC-051: Search deep Species/Care results restore explicit show-all state, exact source result, workspace scroll and focus.
- PUI-BC-052: Aquarium child Species Detail returns to the immediate parent livestock roster, restores roster scroll and exact profile focus.
- PUI-BC-051/052 are canonical; append commit `5ccdb3e2ebf96437bf0a671cbec180b4c583a8df` is exactly +2 / -0 in `evaluation/product/badcases.v1.jsonl`.
- PUI-BC-032 historical trigger remains unchanged.

## Review / preview checks

- PR is mergeable according to GitHub.
- No submitted reviews.
- No unresolved inline review threads.
- Cloudflare Pages preview for validated head `20157e0` succeeded.
- Vercel preview failure is the free-plan daily deployment quota (>100), not an application build failure.

## Accepted non-blocking debt

### 1. Thin wrapper + Base structure

`SpeciesDetailDialog.tsx` / `SpeciesDetailDialogBase.tsx` and `Encyclopedia.tsx` / `EncyclopediaBase.tsx` are intentionally surgical wrappers around large legacy components. They are not ideal final architecture, but consolidating thousand-line components inside this already-large PR has a worse risk/reward profile than retaining the wrappers with strong regressions.

**Disposition:** follow-up cleanup PR; retain Navigation Context and Compatibility regressions during any consolidation.

### 2. Bundle size

The entry bundle remains roughly 2.1 MiB, with large fish/localization data plus analytics/data-service dependencies. Three/Fiber is largely isolated in its own large chunk. Bundle Audit V1 measures the problem but #104 does not solve it.

**Disposition:** separate performance PR. Do not widen #104 further.

### 3. Dependency audit

`npm ci` currently reports 18 vulnerabilities (2 low, 6 moderate, 10 high). `package.json` and `package-lock.json` are not changed by #104, so these are pre-existing dependency findings rather than regressions introduced here.

**Disposition:** separate dependency-remediation audit.

### 4. Preview infrastructure

Vercel has exhausted its free daily deployment quota. Cloudflare branch preview succeeds.

**Disposition:** not a merge blocker; do not classify quota exhaustion as application failure.

## Explicit non-goals before review

Do not add more UI features, bundle refactors, dependency upgrades, or wrapper/Base consolidation to #104. New work should use a follow-up branch/PR after this review boundary.

## Transition

The appropriate next repository action is to mark #104 **Ready for Review** while keeping it open and unmerged. A merge decision should occur only after review of this bounded scope.
