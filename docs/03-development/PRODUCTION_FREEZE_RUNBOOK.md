# Production freeze before main convergence

## Purpose

Keep the current production deployment unchanged while `main` becomes the latest code source. `release/production` is a deployment pointer only; it must not receive independent commits.

## Current anchor

- Vercel production Git SHA: `ed0cf38025652db901ee81aa697ca55b1c1584b6`
- Local deployment pointer: `release/production`
- Remote deployment pointer: `release/production` (created at the anchor SHA)
- Vercel Production Branch: `release/production` (saved and read back via project settings/API)
- Cloudflare: `INACTIVE_LEGACY` for AquaGuide (user confirmed Vercel-only production; historical resources are retained and not modified)
- Release readiness: `NOT_READY`

## Required external changes

Before merging PR #142, an authorized operator must:

1. ~~Set the Vercel Production Branch to `release/production`.~~ **DONE** — setting and API read-back both show `release/production`.
2. ~~Read back the setting and confirm the production alias still serves the anchor SHA.~~ **DONE** — production deployment remains `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
3. ~~Confirm Cloudflare is either not connected to automatic `main` production deploys or is pinned to the same deployment-only branch.~~ **NOT APPLICABLE** — Cloudflare is not an AquaGuide production channel; it is retained as historical evidence only.
4. Record the active provider, branch, SHA and timestamp without recording credentials.

## Stop conditions

- The active production branch cannot be read back.
- An active provider still deploys `main` automatically.
- The production alias changes before release acceptance.

## After release acceptance

Fast-forward `release/production` to the accepted `main` SHA, deploy once, verify both providers, and retain the previous anchor for rollback. Never develop directly on the deployment pointer.
