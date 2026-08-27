# Unified Release Readiness

**Status:** `NOT_READY`
**Updated:** 2026-08-27
**Scope:** final gate for a unified branch becoming eligible for a separately authorized RC/main release.

| Gate | Current evidence | Status | What closes it |
| --- | --- | --- | --- |
| One delivery line | Local candidate, remote candidate and Draft PR #142 point to the same head according to `npm run project:status` and GitHub metadata | Pass | Keep future work on the candidate until release acceptance. |
| One project/product/UI/deployment truth map | Project Truth, Product Truth, Feature Catalog, Visual Baseline, Deployment State and history registry exist | Pass | `npm run check:project-truth`. |
| Local visual baseline | Recovery branch restored the preview route and canonical visual layers; candidate UI is not yet human-accepted against `37a8d4d1` | Failed / recovery in progress | Run fixed-viewport matrix and user visual acceptance on the recovery candidate. |
| GitHub convergence CI | PR #142 foundation runs `33041753905`, `33041755993` and Product Golden Path `33041756115` all passed; current head is runtime-checked by `npm run project:status` | Pass | Keep the same head through Preview/Supabase parity and release acceptance. |
| Exact Preview SHA parity | Branch Preview exists | Pending | Record the exact deployed SHA associated with the accepted review. |
| Supabase schema/RLS parity | Deployment and environment variables are user-confirmed/non-secret-audited; local 31-table contract passes | Pending | Authorized read-only schema revision and RLS/API smoke check. |
| P0 business migration | User-approved local contract; compatibility, tank-state and water-change deterministic tests passed; temporary 4320 preview passed layout/framing/scene/page matrix | Pass | Keep later authority/UI work in a separately approved unit. |
| RC/main merge | Not authorized | Blocked by release decision | Separate user release acceptance after all above gates pass. |

## Release rule

No Preview/Production deployment, CI success, historical PR, or local build alone can change this file to `READY`. The release SHA must be the same one reviewed locally, validated in CI, checked against the deployed environment, and accepted by the user.

## Verification commands

```bash
npm run project:status
npm run check:project-truth
npm run lint
npm run test:layout-mode
npm run test:three-stage-framing
npm run build
```

The Supabase parity row requires authorized environment access and must never be simulated by an environment-variable presence check.
