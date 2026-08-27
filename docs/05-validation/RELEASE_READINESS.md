# Unified Release Readiness

**Status:** `NOT_READY`
**Updated:** 2026-08-27
**Scope:** final gate for a unified branch becoming eligible for a separately authorized RC/main release.

| Gate | Current evidence | Status | What closes it |
| --- | --- | --- | --- |
| One delivery line | Local candidate is `74415854`; remote candidate and Draft PR #142 are still on `5b419e98`; `npm run project:status` fails until the candidate is pushed | Blocked / remote sync pending | Push the reviewed candidate once, then re-run `project:status` and record PR/Preview SHAs. |
| One project/product/UI/deployment truth map | Project Truth, Product Truth, Feature Catalog, Visual Baseline, Deployment State and history registry exist | Pass | `npm run check:project-truth`. |
| Local visual baseline | Candidate contains recovery commits; formal pages, transparent scene assets and layout parity are not yet human-accepted against `37a8d4d1` | Failed / recovery in progress | Run fixed-viewport matrix and user visual acceptance on 4319 against the detached 4317 baseline. |
| GitHub convergence CI | Historical runs `33041753905`, `33041755993` and `33041756115` passed on the old PR head; they do not cover local `74415854` | Pending | Push the candidate and require fresh CI on the exact PR head. |
| Exact Preview SHA parity | Branch Preview exists | Pending | Record the exact deployed SHA associated with the accepted review. |
| Supabase schema/RLS parity | Read-only inspection found 26 production migrations, 35 RLS tables, 89 policies; production lacks `catalog_releases` and `species.water_type`, while candidate lacks 8 production migrations | Migration required / history conflict | Reconcile production migration history locally, then separately authorize Catalog migration and release checks. |
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
