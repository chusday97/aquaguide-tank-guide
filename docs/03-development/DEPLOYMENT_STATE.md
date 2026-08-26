# AquaGuide Deployment State

**Status:** Active  
**Updated:** 2026-08-26

## Evidence categories

| Category | Meaning | Current fact |
| --- | --- | --- |
| Local preview | A local production build is running | User-approved interactive preview is `http://127.0.0.1:4317/_preview/interactive`. |
| GitHub delivery | Current branch and PR can be traced | `codex/unified-rc-visual-v1` and Draft PR #141 are the only active delivery line. |
| CI | Automated checks passed for a concrete SHA | GitHub Actions run `32854080645` passed state, PR topology, lint, layout, framing and build checks for `cc99ec47`; the final head contains documentation-only evidence updates. |
| Supabase deployment | A cloud environment has been deployed | User-confirmed on 2026-08-25. Existing schema, RLS, API and repository work must not be described as undeployed. |
| Environment parity | The current branch was verified against the connected cloud environment | Not yet re-verified. This is distinct from deployment. |
| Human visual acceptance | A person accepted the rendered UI | The 4317 local interactive baseline is user-confirmed; a matching deployed-SHA review remains pending. |

## 2026-08-25 non-secret deployment audit

- The repository contains 18 tracked Supabase migration files, from `202607160001_core_schema.sql` through `202608090003_atomic_livestock_addition.sql`.
- `npm run test:three-tier-contract` passed: 31 tables, RLS, Storage, API and shared types are internally aligned.
- Vercel Production contains configured Supabase/Postgres environment-variable names; values were not read or recorded.
- A Ready Preview is aliased to `codex/unified-rc-visual-v1`.
- The Vercel inspection response identifies the branch alias but does not expose an exact Git SHA, so branch Preview readiness is not accepted as exact SHA parity by itself.
- GitHub Actions run `32854080645` passed the unified branch's project-truth, state, PR topology, lint, layout, framing and production-build checks on `cc99ec47`.

## 2026-08-25 read-only parity attempt

- Vercel production environment variable names were pulled through the existing project authorization into a temporary file; no values were recorded. The configured Supabase project returned `200` for read-only PostgREST probes against all **31/31** contract tables.
- Read-only column probes for the latest unified fields passed for species identity, aquarium livestock and batch records, care action metadata, recurring reminders/events, compatibility evidence and care-article references. No write, RPC mutation, migration or RLS change was executed.
- The Vercel environment pull masks the production PostgreSQL connection strings as `[SENSITIVE]`, and the Supabase anon REST surface does not expose migration history or policy metadata. Therefore the exact applied migration revision and direct RLS policy inspection remain **unverified**, not inferred from HTTP `200` responses.
- The latest Ready branch Preview `aquaguide-2kdgtap8s-chusday97s-projects.vercel.app` is aliased to `codex/unified-rc-visual-v1` and was created at `21:35:47`; the unified commit `187d16ba` was created at `21:35:41`. This is a timing correlation only. Vercel API metadata access did not return the Git SHA, so exact Preview SHA parity remains **pending**.

## 2026-08-26 parity follow-up

- A read-only request to the recorded branch Preview returned an HTTP `302` redirect to Vercel SSO. The response did not expose a deploy Git SHA, so exact Preview SHA parity remains **pending** and the protected URL cannot be used as browser evidence from this environment.
- No authorized Supabase schema/RLS inspection surface was available in this environment. No Supabase request, migration, RPC mutation or data write was executed; the prior 31/31 PostgREST result remains the latest read-only evidence and does not prove migration/RLS parity.

## Deployment rules

- Never treat a Vercel/Cloudflare success as proof that its deployed SHA is the accepted review SHA.
- Never expose Supabase URL, anon key, service role, deployment IDs with sensitive context, or any secret in this file.
- Before a release, record: branch SHA, deployed SHA, Supabase environment identity (non-secret label only), schema revision, relevant RLS/API regression result, and the reviewer.
- No redeploy is required merely to organize project truth.

## Required future parity check

1. Read the configured non-secret environment label/project reference.
2. Compare applied migration revision with the current contract's expected migrations.
3. Run the existing RLS/API smoke checks against that environment using authorized test credentials.
4. Record only pass/fail, revision and timestamp here; never record credentials.
5. Compare the deployed frontend SHA with the local accepted product SHA.

## Current limitation

The repository contains historical records that use phrases such as “real Supabase verification pending.” They mean the exact current-environment parity check above has not been repeated from the unified branch. They do not mean that Supabase was never deployed.

The remaining parity evidence requires an authorized read-only Supabase schema/RLS inspection against the deployed project. No migration rename, schema change, environment-variable change or redeployment is authorized by this audit.
