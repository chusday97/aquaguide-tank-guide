# AquaGuide Progress — UI/UX System Refactor + Visual QA V2

**Date:** 2026-08-19  
**Branch:** `agent/uiux-system-refactor-v1`  
**Draft PR:** #104

## Completed

- [x] Rebased UI/UX system work conceptually on `integration/aquaguide-rc1` instead of the older main-only Collection branch.
- [x] Consolidated design-token ownership in `ui-v2-foundation.css`.
- [x] Locked width-driven layout policy and viewportless iPad fallback.
- [x] Preserved Aquarium 3 primary actions + progressive disclosure.
- [x] Ported Collection into a 3-live-module focus carousel; Achievements remains outside primary IA.
- [x] Added Search Species/Care explicit show-all parity.
- [x] Added 44×44 named-control baseline, reduced-motion and inactive-carousel `inert` behavior.
- [x] Added `UI UX System Refactor V1` deterministic CI.
- [x] Closed PUI-BC-040..044.

## Visual QA V2 completed

- [x] Added cross-surface capture script for 390 / 768 / 1024 / 1440.
- [x] Covered Aquarium / Encyclopedia / Care / Search / Collection / Settings.
- [x] Captured fold + full-page per route/viewport = 48 screenshots.
- [x] Installed Noto CJK in CI so Chinese baseline is readable.
- [x] Made screenshot capture fail if Aquarium state was accidentally wiped.
- [x] Made screenshot capture fail if CJK font is unavailable.
- [x] Fixed invalid first capture harness that cleared storage on every navigation.
- [x] Added Aquarium visual hierarchy geometry regression.
- [x] Added Search content-density geometry regression.
- [x] PUI-BC-045: narrow real Aquarium workspace remains Today → Manage → 3D.
- [x] PUI-BC-046: 1024–1199 uses 220px medium sidebar instead of 280px width cliff.
- [x] PUI-BC-047: Search Species/Care uses actual content width; 768/1024 stacked, 1440 side-by-side.
- [x] PUI-BC-048: return-context navigation no longer overlays phone toolbar/onboarding or desktop Aquarium header.
- [x] Corrected false return-overlap regression to compare against visible surfaces, not the outer layout box.
- [x] Hardened CJK package install with apt retries/timeouts while keeping readability fail-closed.
- [x] Manual fold review completed for the highest-risk final screenshots.

## Implementation validation

**Visual QA:** `UI UX Visual QA V2 #19` / run `32259734301` — **PASS**  
Artifact ID: `9367824682`  
Implementation head: `ef69d85e48712d27990423fcc85e23a4047f0756`

**System regression:** `UI UX System Refactor V1 #36` / run `32259734291` — **PASS**

System regression still passes static contracts, TypeScript, production build, Search/Collection browser regressions, GP-005 and 7 profiles × 17 routes.

## Governance closeout

- [x] `HANDOFF_LATEST.md` updated for Visual QA V2.
- [x] `BADCASE_LATEST.md` updated with PUI-BC-045..048.
- [x] `PROGRESS_LATEST.md` updated.
- [x] `VISUAL_QA_LATEST.md` created as the dedicated baseline/evidence record.
- [x] PUI-BC-045..048 appended to canonical `evaluation/product/badcases.v1.jsonl`.
- [x] Historical PUI-BC-032 trigger restored exactly after an append-time text drift was detected; new badcases remain intact.
- [ ] Final canonical `test:product-evaluation` + system regression on the registry closeout head.
- [ ] Update PR #104 body with authoritative Visual QA and final canonical validation.

## Still intentionally not done

- [ ] Pixel-diff golden-image comparator with committed baselines/tolerance.
- [ ] Repository storage of screenshot images; current artifact retention is 7 days.
- [ ] Bundle/chunk optimization.
- [ ] Existing dependency vulnerability remediation.
- [ ] Merge #104 into RC1/main.
- [ ] Production deploy.
