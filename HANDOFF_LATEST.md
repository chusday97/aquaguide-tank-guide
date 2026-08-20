# AquaGuide Handoff — Result UX + Production Readiness

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Latest validated head:** `363e29bd9a93b4b87f2cd28af1351589a5b84681`

## Current state

Result UX, lifecycle/plant regressions, production-security contracts, and machine-readable badcase governance are complete on the current stacked branch. PR #105 remains **open / mergeable / Draft / not merged**. No production deployment is claimed.

Verified live Result UX consumers:

1. Diagnosis — DONE
2. Compatibility — DONE
3. Knowledge — DONE
4. Procedure — DONE
5. Species Detail — DONE
6. Identification — DONE
7. Live AI Tank Copilot — DONE

## Authoritative clean gate matrix

Head `363e29bd9a93b4b87f2cd28af1351589a5b84681`:

- Production Security Boundary V1 / `32368279920` — **PASS**
  - product-evaluation registry contract;
  - dedicated share-report secret / release / deployed-readiness contract;
  - API type check;
  - API boundary contract;
  - business API contract.
- Result UX V1 / `32368279929` — **PASS**
  - static Result UX contract;
  - deterministic Tank Copilot boundary;
  - production share-token boundary;
  - TypeScript / production build;
  - all seven browser consumers.
- Plant Roster Edit Fix / `32368279880` — **PASS**, including plant quantity/edit and Navigation Context.
- Compatibility Stage Risk V1 / `32368279892` — **PASS**, including same-species life-stage browser regression.

Permanent CI is back to `contents: read`; the one-time migration helper has been removed.

## Product badcase registry — CLOSED

The machine-readable product registry now includes the two final product/security cases:

- `PUI-BC-054` → `tank_copilot`;
- `PUI-BC-055` → `share_report`.

`evaluation/product/feature-states.v1.json` now contains a six-state `share_report` contract covering initial, in-progress, success, missing dependencies, public-access boundary and deployment boundary.

The JSONL update was append-only: existing product records were not rewritten. `PUI-BC-053` remains evaluator-only and is intentionally excluded from the product registry.

Migration product commit: `e59a73ab85ba1f72a562c511675cc776aeb1725c`.  
Final read-only cleanup head: `363e29bd9a93b4b87f2cd28af1351589a5b84681`.

## Production security closure — PUI-BC-055

The production-readiness audit closed four linked gaps:

1. **Dedicated signing secret** — `173530bdc5ea34abcea65d00700b145fc7cf88db` removes `SUPABASE_SERVICE_ROLE_KEY` as a signing-secret fallback. Missing `SHARE_TOKEN_SECRET` fails closed.
2. **Release acceptance** — `8f9bccf3dc7ba85688c9d727dc551cd3898b60d6` adds `test:share-report-contract` to RC1 Release Acceptance.
3. **Deployed readiness signal** — `6f4f402414d36296a17b3087ed8ce4e550ba5208` adds boolean-only `shareReportsConfigured` and post-deploy enforcement without exposing secret values.
4. **Canonical share URL** — `1da62bb1ce11098ce38a489e6a7b95bc40995178` requires `WEB_BASE_URL` as part of share-report readiness.

`shareReportsConfigured=true` therefore requires business database configuration, server-side service-role access, a dedicated signing secret, and the canonical web base URL.

## Deployment environment limitation

The connected Vercel account exposes the team but its project listing returned no visible projects, so the actual target environment could not be inspected for `SHARE_TOKEN_SECRET` or `WEB_BASE_URL`.

Do not convert repository-level PASS into a claim that Production is configured. The deployed environment must still pass `RC1 Post-Deploy Smoke`, including `shareReportsConfigured:true`.

## Stack / integration state

Current pre-parent-merge topology remains:

- #104: `integration/aquaguide-rc1` → `agent/uiux-system-refactor-v1`;
- #105: `agent/uiux-system-refactor-v1` → `agent/result-ux-v1`.

The permanent #105 workflows support both the stacked parent branch and `integration/aquaguide-rc1`, so they remain available after retarget.

Correct transition:

1. review #104 as its bounded UI/UX-system PR;
2. merge #104 to RC1 only with explicit authorization;
3. retarget #105 to RC1;
4. inspect the actual new merge-base/history and reconcile legitimate ancestry change;
5. confirm no unresolved conflicts or duplicated parent changes;
6. rerun Result UX + Plant/Navigation + Stage Risk + Production Security on the RC1-based candidate;
7. review #105 separately;
8. make an explicit deployment-policy and merge/deploy decision.

## Vercel policy still unresolved

#105 contains `vercel.json -> git.deploymentEnabled: false`, intentionally disabling per-commit Vercel builds during repair. Before production, explicitly choose either:

- keep manual / milestone deployment; or
- deliberately restore Git-driven deployment.

Do not silently change this policy.

## Non-blocking engineering debt

- npm audit: 18 findings (2 low, 6 moderate, 10 high);
- mixed dynamic/static Vite imports;
- large main / react-three-fiber chunks;
- wrapper/Base structures inherited from #104.

Do not widen the stacked PRs with opportunistic dependency or architecture work.

## Next state-changing action

No known Result UX, registry-governance, or repository-level production-security code blocker remains. The next state-changing repository action is an explicit #104 review/merge decision. Until that authorization exists, keep #105 Draft and do not merge or deploy.
