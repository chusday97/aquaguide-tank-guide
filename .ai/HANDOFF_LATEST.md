# AquaGuide Latest Handoff

## 2026-09-09 4198 cleanup (current)

- Local-only cleanup on `codex/project-authority-recovery-v1`: removed unused duplicate `review-*` CSS/scripts, added the direct-page shell/responsive owner, and made Encyclopedia/Care details hide their first-level selection surface while open.
- Cleanup commit: `8e2f4b98`; manifest refresh: `d47f6933`.
- Freeze manifest now records `contentSha256` over files excluding the manifest itself. Five direct pages return HTTP 200; no React, Domain, Catalog, Supabase or production files changed.
- Status remains `REVIEW_REQUIRED`; no user acceptance or HTML Freeze exists. Next: direct-page matrix at 390/600/1024/1440/1920px, then independent Critic review.

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

## Verification evidence

Git branch/HEAD and working-tree status are checked before each mutation. Any preview must display the same branch and full SHA as its process working tree.
