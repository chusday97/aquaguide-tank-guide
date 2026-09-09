# AquaGuide Latest Handoff

## 2026-09-09 4198 cleanup (current)

- Local-only cleanup on `codex/project-authority-recovery-v1`: removed unused duplicate `review-*` CSS/scripts, added the direct-page shell/responsive owner, and made Encyclopedia/Care details hide their first-level selection surface while open.
- Cleanup commit: `8e2f4b98`; manifest refresh: `d47f6933`.
- Freeze manifest now records `contentSha256` over files excluding the manifest itself. Five direct pages return HTTP 200; no React, Domain, Catalog, Supabase or production files changed.
- Status remains `REVIEW_REQUIRED`; no user acceptance or HTML Freeze exists. Next: direct-page matrix at 390/600/1024/1440/1920px, then independent Critic review.
- Only the original Node 4198 listener remains. `test-html-freeze-matrix.mjs` is available, but local Playwright/system Chrome exits with MachPort `BROWSER_UNAVAILABLE`; no visual pass is claimed.

## Current goal

Recover one authoritative UI direction before further React work. The active deliverable is a combined, clickable HTML Freeze; no formal React page changes are allowed until it is accepted.

## Verified state

- Branch: `codex/project-authority-recovery-v1`, based on locally available `origin/main@d3c70dee`.
- Production pointer: `release/production@ed0cf380`; production remains frozen.
- Action contract and independent `/compatibility` route are already in `origin/main`.
- Legacy UI branches, Master 20 preview and PBR scene are separate evidence/experiments.

## Next step

Create the 4198 combined HTML review package, then capture 390/600/1024/1440/1920px evidence and request one user acceptance pass.

## Blocking conditions

- Remote fetch is currently unavailable; do not claim latest remote state until fetch succeeds.
- No visual Freeze exists for the combined five-page set.
- Production migration 27, Catalog release, SEO indexing and deployment remain unauthorized.

## 2026-09-09 Matrix status

- Current 4198 cleanup is at `984a3f70`; direct pages now normalize `data-page`, move selection surfaces into the stage, use an app-level desktop grid rail, and count every `[data-surface]` in the matrix gate.
- Only the canonical Node listener remains on port 4198; all five direct pages return HTTP 200 and static local-resource/H1 checks pass.
- Real browser matrix remains blocked by local Chrome MachPort SIGABRT (`BROWSER_UNAVAILABLE`). Manifest stays `REVIEW_REQUIRED`; no Freeze or React rewrite is authorized.
- Same Critic re-verified `defad8b2`: direct state entry, Care retry, TaskSurface focus and manifest content-snapshot semantics pass static review; only the real five-viewport browser evidence remains blocked.

## 2026-09-09 CUA manual evidence

- Direct Encyclopedia review: scene shows multiple species; clicking a scene species opens only the base-species/variant selection; selecting a variant hides that selection surface and opens the single detail surface; risk expands in place without URL navigation.
- Direct Care review: default scene exposes only water/livestock/filter; selecting water exposes two problem cards; selecting a card hides the card tray and opens one guide detail with an explicit start-task action.
- This is manual visual/accessibility evidence only. The automatic matrix still returns `BROWSER_UNAVAILABLE` because local Chrome aborts during Playwright launch, so `REVIEW_REQUIRED` remains authoritative.
- A gated CI workflow now exists at `.github/workflows/html-freeze-matrix.yml`; it installs Chromium on Ubuntu, starts the 4198 static server, runs the matrix, and uploads screenshots/report. It has not produced a remote run in this local-only session.
- Remote connectivity is restored for a read-only fetch; `origin/main` is confirmed at `d3c70dee`, matching the local baseline. The current branch has not been pushed and no remote CI evidence exists yet.
- PR #148 produced the first real 25-record matrix: only Care at 390px failed (`scrollWidth=667` vs `clientWidth=390`) because direct scene images lacked a mobile width constraint. The fix is scoped to the Care scene CSS owner; matrix rerun is pending.
- Rerun `34364866656` at PR Head `950ce65e` passed 25/25 records with zero failures across all five pages and required viewports. This is the automatic matrix evidence; visual signoff is still pending.

## Verification evidence

Git branch/HEAD and working-tree status are checked before each mutation. Any preview must display the same branch and full SHA as its process working tree.
