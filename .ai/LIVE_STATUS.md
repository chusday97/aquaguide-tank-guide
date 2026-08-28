# Live Status

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched by this Admin milestone.
- Production Supabase: untouched; migrations 001–006 remain branch-only proposals.
- Latest pushed milestone: `cd363b4 feat(admin): add species publishing safety and revision history`.
- Generator/history baseline is `cd363b4`; the current HEAD adds staging release-gate hardening on top of it. Check `git log -1` for the final milestone SHA.
- Vercel Git Integration has not produced a `cd363b4` Preview yet; manual Preview deploy was refused by Hobby `api-deployments-free-per-day` (>100 deployments/day), not by build/runtime failure.
- Previous `43eec47` Admin Preview remains READY / HTTP 200 / noindex.
- AquaGuide Supabase currently has no development branches; the only separate staging project is for IceGlide and must not be reused.
- 486 catalog rows → 276 Base Species groups; 83 multi-member groups; 28 suspected duplicate records; 5 category-conflict groups.

## Publishing pipeline implemented
- Static path contract: English `/species/<base-scientific-slug>/<catalog-key>.html`; Chinese `/zh/species/...`; English is `x-default`.
- Generator accepts only explicit `local/test/preview/staging` snapshots, requires an explicit output directory, and rejects `production` snapshots.
- Generator now also requires an explicit non-production `siteUrl`; it refuses the known Production canonical host.
- Published Variant + same-locale Published Base + complete editorial Title/Meta/H1/Intro are required; English also requires `localized_name`.
- Independent Index fails closed for category conflicts and suspected duplicates; canonical targets must be Published + independently indexed.
- Sitemap includes only self-canonical `index,follow` pages.

## Staging release gate tooling
- Added staging snapshot export using Supabase publishable-key client; it reads Published `species_seo` / `species_seo_groups` only.
- Staging DB config requires `STAGING_SUPABASE_URL`, publishable key, expected staging project ref, and explicit Production project ref deny-list.
- Staging public verification requires `STAGING_PUBLIC_SITE_URL` plus explicit Production public URL deny-list.
- `verify:staging-publish` exports staging rows, runs the static generator, serves generated files locally, fetches an English/Chinese self-canonical pair and sitemap over HTTP, and verifies language/canonical/reciprocal hreflang/x-default/sitemap.
- The staging verifier requires at least one bilingual self-canonical Index pair; an empty staging database cannot produce a false PASS.
- With no staging configuration present, `verify:staging-publish` exits non-zero instead of falling back to local or Production settings.

## Verification
- `test:contract` passes, including generator runtime tests and staging Production-deny guard tests.
- Generator fixture still produces 4 pages / 2 sitemap candidates; missing site URL and Production canonical host are now rejected.
- Fresh isolated Supabase proof for migrations 001–005 and Base/Variant rollback remains valid from `cd363b4`; migration 006 release-gate probe has now been verified separately.
- Production Admin build passes; only the known >500KB bundle warning remains.

## Remaining release gate
- Published stays disabled.
- A dedicated AquaGuide staging Supabase must be provisioned or identified before migrations 001–006 and real snapshot export can be validated remotely.
- Creating a Supabase branch/project may incur cost and therefore requires explicit approval; no paid environment was created in this run.
- Re-check the new Admin Vercel Preview after the Hobby daily deployment quota resets.

## Schema readiness probe verification
- Migration 006 adds `species_seo_release_gate_status()` so staging verification can prove the required schema exists without using service-role credentials.
- The probe returns only schema-version/readiness booleans for Species SEO, Base groups, localized name, index strategy, revision history and rollback RPC.
- Fresh isolated Supabase applied core + migrations 001–006 successfully; anon publishable access received `schema_version=6` with every readiness flag true.
- The same anon identity still received `permission denied for table content_revisions`, confirming the probe does not weaken revision-history data access.
