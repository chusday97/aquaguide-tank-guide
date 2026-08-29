# Production freeze before main convergence

## Purpose

Keep the current production deployment unchanged while `main` becomes the latest code source. `release/production` is a deployment pointer only; it must not receive independent commits.

## Current anchor

- Vercel production Git SHA: `ed0cf38025652db901ee81aa697ca55b1c1584b6`
- Local deployment pointer: `release/production`
- Release readiness: `NOT_READY`

## Required external changes

Before merging PR #142, an authorized operator must:

1. Set the Vercel Production Branch to `release/production`.
2. Read back the setting and confirm the production alias still serves the anchor SHA.
3. Confirm Cloudflare is either not connected to automatic `main` production deploys or is pinned to the same deployment-only branch.
4. Record the provider, branch, SHA and timestamp without recording credentials.

## Stop conditions

- The production branch cannot be read back.
- A provider still deploys `main` automatically.
- The production alias changes before release acceptance.

## After release acceptance

Fast-forward `release/production` to the accepted `main` SHA, deploy once, verify both providers, and retain the previous anchor for rollback. Never develop directly on the deployment pointer.
