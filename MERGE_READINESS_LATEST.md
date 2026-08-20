# AquaGuide — Stacked Merge & Release Readiness

**Date:** 2026-08-20  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Child PR:** #105 `Introduce decision-first Result UX V1`  
**Latest validated child head:** `1da62bb1ce11098ce38a489e6a7b95bc40995178`

## Decision

**PRODUCT / RESULT UX: READY. REPOSITORY-LEVEL PRODUCTION SECURITY: READY. STACK INTEGRATION AND DEPLOYED-ENVIRONMENT VERIFICATION: NOT YET AUTHORIZED / COMPLETE.**

No known code-level blocker remains on the current #105 head. Do not merge or deploy yet because the parent→child stack transition, deployment policy, and actual environment readiness still require explicit actions.

## Current gate matrix

Head `1da62bb1ce11098ce38a489e6a7b95bc40995178`:

| Gate | Run | Result |
| --- | --- | --- |
| Production Security Boundary V1 | `32365318251` | PASS |
| Result UX V1 | `32365318222` | PASS |
| Plant Roster Edit Fix + Navigation Context | `32365318305` | PASS |
| Compatibility Stage Risk V1 | `32365318290` | PASS |

Result UX covers all seven live consumers; Production Security covers the dedicated share-report secret, release-gate inclusion, API type/boundary/business contracts, and deployed-readiness source contracts.

## PUI-BC-055 production-security closure

### Credential separation

The old configuration reused `SUPABASE_SERVICE_ROLE_KEY` as the share-token HMAC secret when `SHARE_TOKEN_SECRET` was missing.

- fail-before: Security `32363518780`;
- fix: `173530bdc5ea34abcea65d00700b145fc7cf88db`;
- result: a dedicated `SHARE_TOKEN_SECRET` is mandatory and missing configuration fails closed.

### Release-gate enforcement

RC1 Release Acceptance did not enforce that security contract.

- fail-before: `32364388187`;
- fix: `8f9bccf3dc7ba85688c9d727dc551cd3898b60d6`;
- result: `.github/workflows/rc1-release-acceptance.yml` runs `npm run test:share-report-contract`.

### Deployment readiness

The old `/business-health` could report a healthy database even if share reports were not deployable.

- fail-before: `32364742513`;
- fix: `6f4f402414d36296a17b3087ed8ce4e550ba5208`;
- result: health exposes only `shareReportsConfigured: boolean`; no secret value is returned; post-deploy smoke requires it to be true.

Canonical public report URLs also require `WEB_BASE_URL`.

- fail-before: `32365165728`;
- fix: `1da62bb1ce11098ce38a489e6a7b95bc40995178`;
- readiness is now true only when all of these exist:
  - business Supabase URL/anon configuration;
  - `SUPABASE_SERVICE_ROLE_KEY`;
  - dedicated `SHARE_TOKEN_SECRET`;
  - `WEB_BASE_URL`.

## Deployed-environment verification is still a blocker

Repository contracts cannot prove the target hosting environment has the required secrets/configuration.

The connected Vercel account returned the team but no visible projects through the available connector, so this audit could not inspect project environment variables. Therefore the following remain required before calling production ready:

1. verify `SHARE_TOKEN_SECRET` is configured server-side;
2. verify `WEB_BASE_URL` is the intended canonical production origin;
3. verify Supabase service-role configuration remains server-only;
4. deploy only through the explicitly chosen release policy;
5. run `RC1 Post-Deploy Smoke` against the deployed URL and require `shareReportsConfigured:true`.

Do not claim production environment readiness until that smoke passes.

## Stacked topology / transition

Pre-parent-merge structure remains:

- #104: `integration/aquaguide-rc1` → `agent/uiux-system-refactor-v1`;
- #105: `agent/uiux-system-refactor-v1` → `agent/result-ux-v1`.

The original post-retarget CI blocker was fixed in `a8e402b0f6b6d83dbed5927ca39e7507fd232548`: #105's Result UX, Plant, Stage Risk, and Production Security validation are designed to remain available when the base becomes `integration/aquaguide-rc1`. Permanent workflow permissions are read-only.

Correct transition:

1. review #104 without widening its frozen scope;
2. only after explicit approval, merge #104 to `integration/aquaguide-rc1`;
3. retarget #105 to `integration/aquaguide-rc1`;
4. inspect the actual new merge-base and history;
5. if the chosen parent merge method creates legitimate behind/diverged ancestry, reconcile it explicitly rather than treating `behind > 0` as a product regression;
6. check for conflicts and duplicated parent changes;
7. rerun all four permanent #105 gates on the RC1-based candidate;
8. review #105 separately;
9. make an explicit release-policy and merge/deploy decision.

For this stacked history, a merge commit for #104 remains the least surprising ancestry-preserving option, but no merge method is executed by this document.

## Vercel deployment policy

#105 adds:

```json
"git": {
  "deploymentEnabled": false
}
```

This prevented per-commit Vercel builds during repair. Before production choose explicitly:

- **manual / milestone deployment:** keep it; or
- **Git-driven deployment:** deliberately remove/change it.

The code audit does not silently choose for the release owner.

## Non-blocking technical debt

Still present and not introduced by the current security fix:

- npm audit: 18 findings (2 low, 6 moderate, 10 high);
- mixed static/dynamic imports for large data modules;
- large main and react-three-fiber chunks;
- thin wrapper/Base structures inherited from #104.

Do not run blind `npm audit fix` or widen #104/#105 with unrelated architecture work.

## Badcase governance

PUI-BC-054 and PUI-BC-055 are documented in `BADCASE_LATEST.md`. The machine-readable `evaluation/product/badcases.v1.jsonl` has not been claimed updated for them. Any canonical append must be separately observable and append-only.

## Current blockers before merge/deploy

1. explicit #104 review/merge authorization;
2. #105 retarget/reconciliation after the actual #104 merge;
3. all four #105 gates PASS on the RC1-based candidate;
4. explicit Vercel deployment-policy choice;
5. actual production environment configuration for share reports;
6. post-deploy smoke PASS;
7. explicit #105 merge/deploy authorization.

Until those steps occur, keep #105 Draft and do not deploy.
