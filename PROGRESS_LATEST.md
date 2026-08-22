# AquaGuide — Latest Progress

**Updated:** 2026-08-22  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 (Draft)  
**Latest fully validated product-code head:** `dbaab622371494a89effafe1e982598c46b2d1f7`

## Current phase

**RC1 convergence complete in feature branches → UI/UX system complete → Result UX complete → Layout Recovery complete → release-baseline maintenance next.**

No production merge or deployment has been authorized.

## Verification status

| Gate | Result | Run |
|---|---|---:|
| Production Security Boundary V1 | PASS | 32568805732 |
| Result UX V1 | PASS | 32568805769 |
| Compatibility Stage Risk V1 | PASS | 32568805704 |
| Plant Roster Edit Fix | PASS | 32568805727 |
| Vercel Preview | SUCCESS | head `dbaab622` |

Result UX run #113 passed the complete browser sequence including Layout Recovery, Identification, and Tank Copilot.

## Completed in this repair cycle

- [x] Added Layout Recovery V1 to the permanent Result UX workflow.
- [x] Reproduced wide Care guide regression at about 340px.
- [x] Made the selected Care detail span the workspace and made decision content primary.
- [x] Kept the original regression threshold; first repair exposed a second 850px legacy corridor instead of weakening the test.
- [x] Removed that corridor only in truly wide Care workspaces.
- [x] Exposed the next hidden failure: 768px Aquarium ordered management before tank context.
- [x] Restored narrow-desktop `Today → Context → Manage` hierarchy while preserving phone ordering.
- [x] Re-ran all four permanent gates to green.
- [x] Confirmed Vercel Preview success on the verified product head.

## Current release readiness

### Green

- deterministic compatibility / stage-risk boundary;
- plant roster edit path;
- decision-first Result UX paths;
- repository-level share-report secret contract;
- Vercel preview build;
- Atlas/Care/Aquarium layout recovery regression.

### Not yet closed

- [ ] classify current npm audit findings by runtime reachability and fix only justified dependencies;
- [ ] perform #104 → #105 stack convergence after explicit authorization;
- [ ] rerun four gates after final retargeted ancestry;
- [ ] verify production environment/secrets;
- [ ] perform production golden-path smoke after explicit deployment authorization;
- [ ] inventory remaining `server/index.mjs` bridge consumers;
- [ ] start Knowledge Engine P0 only after release-baseline work is closed.

## Next sequence

1. Dependency-security triage: distinguish dev-only, transitive, runtime reachable, and actually exploitable findings.
2. Stack convergence: #104 decision first, then retarget/reconcile #105; no opportunistic feature changes in either PR.
3. Production readiness: env matrix + post-deploy smoke after authorization.
4. Backend Phase 2: legacy bridge consumer inventory and one-at-a-time migration with regression coverage.
5. Knowledge architecture: P0 → P1 → P4 → P2 → P3 → P5.

## Guardrails

- Do not lower regression thresholds to turn CI green.
- Do not use AI output as the authority for deterministic safety blocks.
- Do not delete legacy API bridges before consumer inventory/replacement proof.
- Do not use preview success as a proxy for production validation.
- Do not broaden scope until the release baseline is reproducible.
