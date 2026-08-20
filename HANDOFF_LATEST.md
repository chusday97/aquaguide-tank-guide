# AquaGuide Handoff — Result UX + Production Readiness

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Latest validated code head:** `1da62bb1ce11098ce38a489e6a7b95bc40995178`

## Current state

Result UX implementation and the production-security slice discovered during final audit are **complete on the current stacked branch**. PR #105 remains **open / mergeable / Draft / not merged**. No production deployment is claimed.

Verified live Result UX consumers:

1. Diagnosis — DONE
2. Compatibility — DONE
3. Knowledge — DONE
4. Procedure — DONE
5. Species Detail — DONE
6. Identification — DONE
7. Live AI Tank Copilot — DONE

## Authoritative current gate matrix

Clean head `1da62bb1ce11098ce38a489e6a7b95bc40995178`:

- Production Security Boundary V1 / run `32365318251` — **PASS**
  - dedicated share-report secret contract;
  - RC1 release-acceptance coverage contract;
  - deployed share-report readiness contract;
  - API type check;
  - API boundary contract;
  - business API contract.
- Result UX V1 / run `32365318222` — **PASS**
  - Result UX static contract;
  - deterministic Tank Copilot boundary;
  - production share-token boundary;
  - TypeScript / production build;
  - all seven browser consumers.
- Plant Roster Edit Fix / run `32365318305` — **PASS**
  - plant quantity/edit;
  - inherited Navigation Context regression.
- Compatibility Stage Risk V1 / run `32365318290` — **PASS**
  - same-species life-stage contracts and browser regression.

## Production security closure — PUI-BC-055

The final production-readiness audit found a credential-boundary and release-observability chain in share reports.

### 1. Dedicated signing secret

Old `apps/api/src/config.ts` allowed:

`SHARE_TOKEN_SECRET || SUPABASE_SERVICE_ROLE_KEY`

This reused the highest-privilege database credential as an HMAC signing secret whenever the dedicated secret was absent.

Fail-before: Production Security run `32363518780` failed exactly on this fallback.  
Fix: `173530bdc5ea34abcea65d00700b145fc7cf88db` requires `SHARE_TOKEN_SECRET` explicitly; missing secret now follows the existing fail-closed 503 path.

### 2. Release acceptance coverage

RC1 Release Acceptance did not run the share-report security contract.

Fail-before: `32364388187` failed only because `.github/workflows/rc1-release-acceptance.yml` lacked `npm run test:share-report-contract`.  
Fix: `8f9bccf3dc7ba85688c9d727dc551cd3898b60d6` adds the contract to the release gate.

### 3. Post-deploy readiness visibility

`/api/v1/business-health` previously exposed only database readiness, so a deployment could look healthy while share reports lacked their service-role/signing dependencies.

Fail-before: `32364742513` failed on the missing readiness signal.  
Fix: `6f4f402414d36296a17b3087ed8ce4e550ba5208` adds `shareReportsConfigured` as a boolean-only health capability and requires post-deploy smoke to see it as `true`. No secret value is returned.

### 4. Canonical share URL requirement

A production share link also needs `WEB_BASE_URL`; otherwise URL generation can fall back to request Origin or localhost.

Fail-before: `32365165728` failed exactly because `isShareReportsConfigured()` did not require `WEB_BASE_URL`.  
Fix: `1da62bb1ce11098ce38a489e6a7b95bc40995178` now requires:

- business database config;
- `SUPABASE_SERVICE_ROLE_KEY`;
- dedicated `SHARE_TOKEN_SECRET`;
- `WEB_BASE_URL`.

Post-deploy smoke therefore fails if the deployed share-report capability is not completely configured.

## Deployment environment limitation

The connected Vercel account exposes team `chusday97s-projects`, but the available project listing returned no projects. The current tooling therefore cannot verify that the eventual target deployment actually has `SHARE_TOKEN_SECRET` and `WEB_BASE_URL` configured.

Do **not** convert repository-level PASS into a claim that the production environment is configured. Before/after deployment, the platform configuration must be checked and `RC1 Post-Deploy Smoke` must pass against the deployed base URL.

## Stack / integration state

Current pre-parent-merge topology remains stacked:

- #104: `integration/aquaguide-rc1` → `agent/uiux-system-refactor-v1`;
- #105: `agent/uiux-system-refactor-v1` → `agent/result-ux-v1`.

The three #105 permanent product workflows already support both the parent base and `integration/aquaguide-rc1` after commit `a8e402b0f6b6d83dbed5927ca39e7507fd232548`; the Production Security workflow follows the same read-only base policy. Permanent CI uses `contents: read`.

Correct transition remains:

1. review #104 as its bounded UI/UX-system PR;
2. merge #104 to RC1 only with explicit authorization;
3. retarget #105 to RC1;
4. inspect new merge-base/history and reconcile any merge-method ancestry change explicitly;
5. confirm no unresolved conflicts or duplicated parent changes;
6. rerun Result UX + Plant/Navigation + Stage Risk + Production Security on the RC1-based candidate;
7. review #105 separately;
8. make an explicit release/deployment decision.

## Vercel policy still unresolved

#105 contains `vercel.json -> git.deploymentEnabled: false`, intentionally disabling per-commit Vercel builds during repair. Before production, explicitly choose either:

- keep manual / milestone deployment; or
- deliberately restore Git-driven deployment.

Do not silently change this policy.

## Badcase / governance

- PUI-BC-054 — live Tank Copilot entry was unreachable — CLOSED / regression verified.
- PUI-BC-055 — share-report credential separation + release/deployment readiness — CLOSED at repository contract level / final deployed environment still must be verified by post-deploy smoke.
- `evaluation/product/badcases.v1.jsonl` still ends at PUI-BC-052; PUI-BC-053 is evaluator-only. Do not claim 054/055 have been canonicalized there without a separately observable append-only update.

## Non-blocking engineering debt

- npm audit: 18 findings (2 low, 6 moderate, 10 high);
- mixed dynamic/static Vite imports;
- large main / react-three-fiber chunks;
- wrapper/Base structures inherited from #104.

Do not widen the stacked PRs with opportunistic dependency or architecture work.

## Next state-changing action

The implementation branch has no known Result UX or production-security code blocker. The next state-changing repository action is an explicit #104 review/merge decision. Until that authorization exists, keep #105 Draft and do not merge or deploy.
