# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

Build an isolated AquaGuide Species SEO Admin that can safely move reviewed bilingual content from Draft to deterministic static SEO pages without modifying `main` or Production Supabase.

## Current milestone

Close the final non-production release gate:

`reviewed Draft → revision history/rollback → Published staging rows → staging-only snapshot export → explicit staging canonical host → static generator → HTTP-rendered EN/ZH + sitemap verification`

## Success criteria

- Staging database identity must be explicit and different from Production Supabase.
- Staging public host must be explicit and different from the Production canonical host.
- Generator cannot fall back to Production canonical URLs when `--site-url` is omitted.
- At least one reviewed bilingual self-canonical Index pair must pass the staging verifier; empty staging cannot PASS.
- Runtime verification covers title/meta/H1/robots/canonical/reciprocal hreflang/x-default and sitemap behavior.
- Published remains disabled until a real AquaGuide staging Supabase exists and the end-to-end verifier passes.
- Production Supabase and `main` remain untouched until explicit approval.

## Current external blockers

- No AquaGuide Supabase development branch currently exists; creating one may incur cost and requires explicit approval.
- Vercel Hobby daily deployment quota currently blocks a new Preview for `cd363b4`; previous Preview remains healthy.
