# AquaGuide — Stacked Merge & Release Readiness

**Date:** 2026-08-20  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Child PR:** #105 `Introduce decision-first Result UX V1`  
**Latest validated child head:** `363e29bd9a93b4b87f2cd28af1351589a5b84681`

## Decision

**PRODUCT / RESULT UX: READY. REPOSITORY-LEVEL PRODUCTION SECURITY: READY. PRODUCT BADCASE GOVERNANCE: READY. STACK INTEGRATION AND DEPLOYED-ENVIRONMENT VERIFICATION: NOT YET AUTHORIZED / COMPLETE.**

No known code-level blocker remains on the current #105 head. Do not merge or deploy yet because the parent→child stack transition, deployment policy, and actual environment readiness still require explicit actions.

## Current clean gate matrix

Head `363e29bd9a93b4b87f2cd28af1351589a5b84681`:

| Gate | Run | Result |
| --- | --- | --- |
| Production Security Boundary V1 | `32368279920` | PASS |
| Result UX V1 | `32368279929` | PASS |
| Plant Roster Edit Fix + Navigation Context | `32368279880` | PASS |
| Compatibility Stage Risk V1 | `32368279892` | PASS |

Production Security now permanently runs the product-evaluation registry contract plus share-report security and API contracts. All permanent workflows use read-only repository permissions.

## Product badcase governance

The machine-readable product evaluation set is now current:

- `PUI-BC-054` appended with featureId `tank_copilot`;
- `PUI-BC-055` appended with featureId `share_report`;
- `share_report` added to `feature-states.v1.json` with six baseline states;
- `PUI-BC-053` remains evaluator-only and intentionally excluded from the product registry.

The migration enforced append-only JSONL behavior (+2/-0), passed `npm run test:product-evaluation`, and then removed its one-time write helper. Product registry commit: `e59a73ab85ba1f72a562c511675cc776aeb1725c`; final read-only cleanup head: `363e29bd9a93b4b87f2cd28af1351589a5b84681`.

## PUI-BC-055 production-security closure

### Credential separation

Old config reused `SUPABASE_SERVICE_ROLE_KEY` as the share-token HMAC secret when `SHARE_TOKEN_SECRET` was missing.

- fail-before: Security `32363518780`;
- fix: `173530bdc5ea34abcea65d00700b145fc7cf88db`;
- result: dedicated `SHARE_TOKEN_SECRET` is mandatory and missing configuration fails closed.

### Release-gate enforcement

RC1 Release Acceptance previously omitted the security contract.

- fail-before: `32364388187`;
- fix: `8f9bccf3dc7ba85688c9d727dc551cd3898b60d6`;
- result: release acceptance runs `npm run test:share-report-contract`.

### Deployment readiness

Business health previously could look healthy while share reports were not deployable.

- fail-before: `32364742513`;
- fix: `6f4f402414d36296a17b3087ed8ce4e550ba5208`;
- result: health exposes only `shareReportsConfigured: boolean`; no secret value is returned; post-deploy smoke requires true.

Canonical report URLs also require `WEB_BASE_URL`:

- fail-before: `32365165728`;
- fix: `1da62bb1ce11098ce38a489e6a7b95bc40995178`.

Readiness is true only when business Supabase configuration, `SUPABASE_SERVICE_ROLE_KEY`, dedicated `SHARE_TOKEN_SECRET`, and `WEB_BASE_URL` are all present.

## Deployed-environment verification is still a blocker

Repository contracts cannot prove the target hosting environment has the required secrets/configuration. The connected Vercel account returned the team but no visible projects, so this audit could not inspect project environment variables.

Before calling production ready:

1. verify `SHARE_TOKEN_SECRET` is configured server-side;
2. verify `WEB_BASE_URL` is the intended canonical production origin;
3. verify Supabase service-role configuration remains server-only;
4. deploy only through the explicitly chosen release policy;
5. run `RC1 Post-Deploy Smoke` against the deployed URL and require `shareReportsConfigured:true`.

## Stacked topology / transition

Pre-parent-merge structure remains:

- #104: `integration/aquaguide-rc1` → `agent/uiux-system-refactor-v1`;
- #105: `agent/uiux-system-refactor-v1` → `agent/result-ux-v1`.

The post-retarget CI blocker was fixed in `a8e402b0f6b6d83dbed5927ca39e7507fd232548`: Result UX, Plant, Stage Risk, and Production Security remain available when #105 targets `integration/aquaguide-rc1`.

Correct transition:

1. review #104 without widening its frozen scope;
2. only after explicit approval, merge #104 to `integration/aquaguide-rc1`;
3. retarget #105 to `integration/aquaguide-rc1`;
4. inspect the actual new merge-base/history;
5. reconcile legitimate ancestry changes introduced by the chosen parent merge method;
6. check for conflicts and duplicated parent changes;
7. rerun all four permanent #105 gates on the RC1-based candidate;
8. review #105 separately;
9. make an explicit release-policy and merge/deploy decision.

A merge commit for #104 remains the least surprising ancestry-preserving option for this stack, but no merge method is executed here.

## Vercel deployment policy

#105 contains:

```json
"git": {
  "deploymentEnabled": false
}
```

This prevented per-commit Vercel builds during repair. Before production choose explicitly:

- **manual / milestone deployment:** keep it; or
- **Git-driven deployment:** deliberately remove/change it.

## Non-blocking technical debt

- npm audit: 18 findings (2 low, 6 moderate, 10 high);
- mixed static/dynamic imports for large data modules;
- large main and react-three-fiber chunks;
- thin wrapper/Base structures inherited from #104.

Do not run blind `npm audit fix` or widen #104/#105 with unrelated architecture work.

## Current blockers before merge/deploy

1. explicit #104 review/merge authorization;
2. #105 retarget/reconciliation after the actual #104 merge;
3. all four #105 gates PASS on the RC1-based candidate;
4. explicit Vercel deployment-policy choice;
5. actual production environment configuration for share reports;
6. post-deploy smoke PASS;
7. explicit #105 merge/deploy authorization.

Until those steps occur, keep #105 Draft and do not deploy.
