# AquaGuide Progress — Merge Readiness

**Date:** 2026-08-20  
**Branch:** `agent/uiux-system-refactor-v1`  
**PR:** #104

## Navigation Context closure

- [x] Preserved PUI-BC-050 Compatibility behavior: first risk-review click stays in detail; second stage may enter full Compatibility; Atlas no longer jumps to the deep calculator anchor.
- [x] Added permanent `Navigation Context V1` browser workflow.
- [x] Reproduced and fixed Search deep-result return failure after explicit show-all.
- [x] Search now persists query, Species/Care expansion state, source result ID and exact workspace scroll before leaving for detail.
- [x] Search return restores structure first, then exact scroll + focus.
- [x] Species >18 and Care >12 return flows both pass.
- [x] Distinguished Playwright actionability auto-scroll from the real Search product bug.
- [x] Reproduced and fixed Aquarium → Tank livestock roster → Species Detail → close losing the immediate parent roster.
- [x] Added roster-scoped return context: record ID, fish ID and internal roster scroll.
- [x] Child Species Detail dismissal reopens only its originating Aquarium roster after child exit animation completes.
- [x] Restores roster internal scroll and exact original profile-button focus.
- [x] Other Species Detail entry points do not inherit the roster-specific return path.
- [x] Final combined Navigation Context V1 regression passes.

## Canonical governance

- [x] `BADCASE_LATEST.md` documents PUI-BC-051 and PUI-BC-052.
- [x] PUI-BC-051 / PUI-BC-052 appended to `evaluation/product/badcases.v1.jsonl` by a one-off fail-closed append workflow.
- [x] Canonical commit `5ccdb3e2ebf96437bf0a671cbec180b4c583a8df` changes exactly one file with **+2 / -0**.
- [x] Historical PUI-BC-032 still contains its original `guide_safe_water_change` trigger.
- [x] The one-off canonical append workflow was removed immediately after success; cleanup head `20157e0c786becf92dce2442c208e711da8cf60c`.

## Authoritative latest-head validation

Current validated code/governance head: `20157e0c786becf92dce2442c208e711da8cf60c`.

All primary PR engineering gates are green on that head:

- Navigation Context V1 #15 / run `32283514536` — PASS
- UI UX System Refactor V1 #87 / run `32283514511` — PASS
- UI UX Visual QA V2 #70 / run `32283514530` — PASS
- UI UX Golden V3 #32 / run `32283514489` — PASS after retry
- Bundle Audit V1 #25 / run `32283514480` — PASS

Golden #32 first attempt did **not** reach pixel comparison: a `westus3` runner received Playwright CDN 403 `service is not available in your location`. The failed job was rerun without product/reference/tolerance changes on an `eastus` runner. Retry passed Chromium install and all eight Golden cases at **0% changed**. Artifact ID `9376839397`, digest `sha256:b5d5d9218a78bd5aee264e02a2242d1a17398000cc0b2486158b5961b3059067`.

## Preview / review state

- [x] Cloudflare Pages preview for commit `20157e0` succeeded.
- [x] No submitted PR reviews.
- [x] No unresolved inline review threads.
- [ ] Vercel preview is unavailable because the free account exceeded the daily deployment limit (>100). This is an external preview-quota condition, not a product build failure.

## Merge-readiness classification

### No current product blocker

The latest navigation fixes, canonical registry, system contracts, broad visual capture, Golden cohort and bundle measurement all pass. No known user-facing regression from this audit remains unclosed.

### Accepted non-blocking debt

- Thin wrapper/Base repair structure remains in `SpeciesDetailDialog.tsx` + `SpeciesDetailDialogBase.tsx` and `Encyclopedia.tsx` + `EncyclopediaBase.tsx`. Recombining thousand-line legacy files now would create more merge risk than value; preserve regressions and clean up in a follow-up PR.
- Bundle entry remains roughly 2.1 MiB. Bundle Audit measured the problem; #104 does not claim size reduction.
- `fishData.ts` / `careTopicsData.ts` remain both dynamically and statically imported through shared localization/page dependencies.
- Existing npm audit output remains 18 vulnerabilities (2 low / 6 moderate / 10 high). `package.json` / `package-lock.json` are not part of this PR's changes, so this is pre-existing dependency debt, not introduced by #104.
- Vercel free-plan deployment quota is external infrastructure debt; Cloudflare preview is available.

## Fail-before trail retained

### Search — PUI-BC-051

- Navigation Context #1 / run `32280048039`: deep Species result disappeared from DOM after detail return — **real product fail-before**.
- Fix: `9feaac4d90fef5ce2e4665154f9554759e15f591`.
- #2 exposed Playwright `.click()` auto-scroll between measurement and product capture — **evaluator artifact**.
- Evaluator fix: `7a736ef6349b4b77dceaf240c1fc61f96f769b98`.
- #3: Species + Care expansion/focus/scroll PASS.

### Aquarium — PUI-BC-052

- #4: generic `right-drawer:visible` matched both roster exit animation and child Species Detail — **evaluator ambiguity**, not product evidence.
- #5 / run `32281408153`: after exact parent/child discrimination, child detail closed but roster did not reappear for 45 seconds — **real product fail-before**.
- Product fixes: `28fb8a796bfd1b6b290daf74284945296daff9a3` + `dbf5546e99306ba078a723115451dcf12123a3b7`.
- #7: parent roster reopening PASS.
- #8: exact-focus assertion used TypeScript generic syntax inside serialized browser JS — **evaluator bug**; product roster had already restored.
- #9: parent roster + original profile focus + workspace context PASS.

## Decision

- [x] Stop adding page-level features or bundle optimizations to #104.
- [x] Treat bundle optimization and wrapper/Base consolidation as follow-up work, not reasons to enlarge this PR.
- [ ] Update PR #104 description with Navigation Context + Merge Readiness evidence.
- [ ] Transition #104 from Draft to **Ready for Review** after the PR description is updated.
- [ ] Do **not** merge into RC1/main in this step.
- [ ] Do **not** deploy to production in this step.
