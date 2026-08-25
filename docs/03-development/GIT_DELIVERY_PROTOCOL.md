# Git Delivery Protocol

**Status:** Active  
**Updated:** 2026-08-25

## One delivery line

- Start work from `codex/unified-rc-visual-v1`.
- Use Draft PR #141 as the only active convergence entry.
- Do not merge `main`, `integration/aquaguide-rc1`, #140, or a historical feature branch wholesale into the unified branch.
- Use `.ai/OPEN_PR_REGISTRY.md` and `.ai/RC_MIGRATION_LEDGER.md` as read-only evidence maps.

## Required PR evidence

Every new PR must use `.github/pull_request_template.md` and include:

1. Product/feature status affected.
2. UI matrix row and canonical owner affected, if any.
3. Data/API/Supabase contract impact, if any.
4. Local status and relevant test evidence.
5. Historical branch/PR evidence used, if any.

## Automated gates

- `npm run project:status` prevents local/remote branch drift.
- `npm run check:project-truth` prevents missing canonical truth routes and status vocabulary.
- `RC Convergence V1` runs those checks plus lint, layout, framing and build on relevant unified-branch pushes.

## Branch-protection boundary

`integration/aquaguide-rc1` is currently not protected. Do not configure a required check until that check is available from the base branch; otherwise GitHub can permanently block the PR without running it.

After the convergence workflow has been introduced to the RC base through an explicitly approved configuration change, an administrator should require `RC Convergence V1` before merge. That administrative setting is intentionally not changed by this protocol.
