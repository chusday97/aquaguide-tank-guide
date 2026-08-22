# AquaGuide — Production Readiness Latest

**Updated:** 2026-08-22  
**RC1 head:** `8d506fae4b165fdd4aed5f7a04101dc16d5d7d7f`  
**Status:** repository code/regression clean; production acceptance not yet proven.

## RC1 release baseline

Final RC1→main matrix after #107: **9/9 PASS**. EVAL-BC-002 is closed for RC code/regression.

## REL-BC-002 — legacy Vercel function bundle bloat

Real RC1 Preview fail-before deployment: `dpl_5g1soHvh1w7HiRZnPU1sZnhAVCAA`.

- `/api/v1/health`: **229.06 MB**
- `/api/ai/chat`: **229.06 MB**
- canonical `/api/v1/[...path]`: **40.13 MB**

Root cause: the two legacy bridge functions import `server/index.mjs`, whose standalone static-serving path references `dist/**`; Vercel tracing therefore included frontend assets in those serverless bundles.

### Repair candidate #109

PR #109 `Trim legacy Vercel function bundles before production` changes only `vercel.json` by excluding `dist/**` from the two legacy function bundles.

Repair head: `d653187eb009de6a2bf9b4184074e78a946ee026`.

Real Vercel Preview: `dpl_DXtnQCjugZ9xhBNWccbWuyuSACQ2` — **READY**.

Verified sizes:

- `/api/v1/health`: **1.13 MB**
- `/api/ai/chat`: **1.13 MB**
- `/api/v1/[...path]`: **40.13 MB**, unchanged

Permanent gates on #109:

- Security `32578090069` — PASS
- Dependency `32578090094` — PASS
- Compatibility `32578090063` — PASS
- Plant `32578090080` — PASS
- Result UX `32578090067` — PASS

#109 is Ready for review / open / mergeable / unmerged. REL-BC-002 is verified on #109 but is **not closed on RC1 until #109 is explicitly merged and final RC1 evidence is rerun**.

## Preview smoke boundary

The Preview is protected by Vercel Deployment Protection. Connected read attempts redirect to Vercel SSO before application code is reached, including temporary-share attempts.

Therefore these remain **unverified, not failed**:

- `databaseConfigured`
- `shareReportsConfigured`
- real Supabase/Auth persistence
- live AI provider/fallback
- Resend/share-report delivery

The repository `RC1 Post-Deploy Smoke` requires root HTML, `/api/v1/business-health` JSON with `databaseConfigured=true` and `shareReportsConfigured=true`, plus JSON 404 for unknown `/api/v1/*` routes.

## Next sequence

1. Explicit #109 merge decision.
2. If merged, re-run RC1→main acceptance and verify Vercel bundle sizes on final RC1 ancestry.
3. Run representative live-provider Tank Copilot usefulness cohort.
4. Verify production env/secrets and business-health state.
5. Only after explicit deployment authorization, run real Post-Deploy Smoke and production golden paths.
6. Make the separate RC1→main release decision.

No production deployment or main merge is authorized by this document.
