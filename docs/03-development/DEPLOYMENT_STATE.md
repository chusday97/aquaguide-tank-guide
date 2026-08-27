# AquaGuide Deployment State

**Status:** Active
**Updated:** 2026-08-27

## Evidence categories

| Category | Meaning | Current fact |
| --- | --- | --- |
| Local preview | A local production build is running | User-approved interactive preview is `http://127.0.0.1:4317/_preview/interactive`. |
| GitHub delivery | Current branch and PR can be traced | `codex/main-core-foundation-v1@94f37ba4` and Draft PR #142 target `main`; #141 is historical. |
| CI | Automated checks passed for a concrete SHA | GitHub Actions run `32854080645` passed state, PR topology, lint, layout, framing and build checks for `cc99ec47`; the final head contains documentation-only evidence updates. |
| Supabase deployment | A cloud environment has been deployed | User-confirmed on 2026-08-25. Existing schema, RLS, API and repository work must not be described as undeployed. |
| Environment parity | The current branch was verified against the connected cloud environment | Migration history conflict found; reconciliation required before Catalog release. |
| Human visual acceptance | A person accepted the rendered UI | The 4317 local interactive baseline is user-confirmed; a matching deployed-SHA review remains pending. |

## 2026-08-25 non-secret deployment audit

- The candidate now contains the 26 production migration versions plus the candidate-only `202608270001_catalog_releases_and_species_water_type.sql` (27 tracked files total). The memorial migration is aligned to production's `202607290004` version; no duplicate `202607290001` memorial version remains.
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

## 2026-08-26 remote CI follow-up

- PR #141 head `ffdcabd8411a8339ce09196f7310b96b33a4ce8a` was confirmed through GitHub read-only metadata. `RC Convergence V1` run `32915252842` and `Result UX Head Integrity V1` run `32915252831` both completed successfully; the candidate-head checkout assertion therefore has remote CI evidence.
- GitHub's Vercel and Cloudflare status contexts also completed successfully, but the Vercel status did not expose the deployed Git SHA. Deployment success is recorded separately from exact Preview SHA parity, which remains **pending**.

## 2026-08-26 latest parity check

- The public GitHub API was rate-limited for the anonymous request, so no new PR head or check-run evidence was recorded in this pass.
- The local canonical Preview `http://127.0.0.1:4317/_preview/interactive` returned HTTP `200`; this confirms local availability only and does not prove a deployed Vercel SHA.
- No Supabase request, migration, RPC mutation or data write was executed. Exact Preview SHA and schema/RLS parity remain **pending**.

## 2026-08-26 Vercel CLI metadata check

- Using the existing authenticated Vercel CLI in read-only mode, the newest Ready deployment for the canonical branch was identified as `aquaguide-uwfft41zv-chusday97s-projects.vercel.app` with branch alias `aquaguide-git-codex-unified-rc-visual-v1-chusday97s-projects.vercel.app`.
- Vercel metadata exposed `githubCommitSha=6b0e629d8b6694a06b98182a38da01d34718c44f`; the canonical local/GitHub SHA is the current value reported by `npm run project:status`. This is an explicit deployment lag, not parity.
- After pushing the parity evidence commit, a second read-only `vercel ls aquaguide --json` still showed no deployment matching the current canonical head; the branch Preview remains on the older SHA above.
- A Git-connected Preview creation request targeting the current branch/SHA was rejected with `api-deployments-free-per-day` because the Hobby daily deployment limit was exceeded. No deployment or Production promotion was created; retry only after the quota window resets.

## 2026-08-26 automated parity gate

- Added the repeatable read-only command `npm run check:preview-parity`. It compares local HEAD, `origin/codex/unified-rc-visual-v1`, and the latest Vercel deployment metadata for that branch.
- The current result is `NOT_SYNCHRONIZED`: local and remote match, while Vercel still reports `githubCommitSha=6b0e629d…`. This is an explicit failing gate, not a deployment mutation.
- No redeploy, configuration change, database migration, RPC mutation or data write was executed.

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

Read-only inspection is now available. It confirmed a production migration-history conflict and that the candidate Catalog migration is not deployed. No schema change, environment-variable change, Catalog upload or business-data write has been authorized by this audit.

## 2026-08-27 direct read-only Supabase inspection

- Supabase project status: `ACTIVE_HEALTHY`.
- Production migration history contains 26 versions through `20260816160129_atomic_verified_livestock_relocation`.
- Production has 35 public tables with RLS enabled and 89 public policies.
- `public.catalog_releases` is absent and `public.species.water_type` is absent in production.
- Candidate-only Catalog migration: `202608270001_catalog_releases_and_species_water_type.sql`.
- Production-only migration history must be restored into the candidate before the Catalog migration is considered for execution. No write or migration was executed.

## 2026-08-27 migration history reconciliation (local only)

- Restored the eight production migration files missing from the candidate: atomic water change, function security hardening, water-change RPC qualification, RLS optimization, care operation completion event, care checklist progress, unresolved existing livestock and verified livestock relocation.
- Renamed the duplicate memorial migration to the production-aligned `202607290004_memorial_reflection_fields.sql`; file contents are unchanged.
- Local migration order now matches the 26 production versions through `20260816160129_atomic_verified_livestock_relocation`; the Catalog migration remains an unapplied proposal after that history.
- This step only changes repository history files. It does not run `supabase db push`, alter production schema/RLS, upload Catalog data or write business data.
