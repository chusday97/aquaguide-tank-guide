# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

Build a stable AquaGuide Species SEO Admin with a two-layer development model:

`B: Mac local Supabase for fast development` + `A: pinned GitHub Actions ephemeral Supabase for reproducible release gating`.

## Current milestone

Make A and B execute the same database contract:

`core + Admin migrations 001–006 → Auth/RLS → Base/Variant revision + rollback → bilingual Published fixture → DB read → static Species generator → EN/ZH canonical/hreflang/sitemap verification`

## Stability rules

- GitHub CI is validation-only: no Production secrets, writes, deploys or automatic commits.
- CI pins Ubuntu 24.04, Node 24.14.0 and Supabase CLI 2.115.0.
- Local B uses the exact same `test:supabase-gate` command as GitHub A.
- Only core schema + Admin migrations 001–006 are loaded into the ephemeral database; unrelated historical migrations are excluded.
- Production Supabase and `main` remain untouched until explicit approval.
- A paid remote Supabase development branch is optional later, not required for the current release gate.
