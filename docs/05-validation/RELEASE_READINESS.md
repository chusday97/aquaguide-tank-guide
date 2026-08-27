# Unified Release Readiness

**Status:** `NOT_READY`
**Updated:** 2026-08-27
**Scope:** final gate for a unified branch becoming eligible for a separately authorized RC/main release.

| Gate | Current evidence | Status | What closes it |
| --- | --- | --- | --- |
| One delivery line | Local candidate, remote candidate and Draft PR #142 are checked at runtime by `npm run project:status`; the latest check passes at the same candidate SHA | Blocked / Preview SHA, Supabase and acceptance pending | Record deployed Preview Git SHA, complete Supabase parity, then obtain user release acceptance. |
| One project/product/UI/deployment truth map | Project Truth, Product Truth, Feature Catalog, Visual Baseline, Deployment State and history registry exist | Pass | `npm run check:project-truth`. |
| Local visual baseline | Candidate contains recovery commits; formal pages, transparent scene assets and layout parity are not yet human-accepted against `37a8d4d1` | Failed / recovery in progress | Run fixed-viewport matrix and user visual acceptance on 4319 against the detached 4317 baseline. |
| GitHub convergence CI | Product Golden Path run `33083433779`, both Foundation runs, Cloudflare Pages and Vercel checks passed on the latest reviewed candidate | Pass | Any later commit must receive a fresh exact-head run. |
| Exact Preview SHA parity | Branch Preview exists | Pending | Record the exact deployed SHA associated with the accepted review. |
| Supabase schema/RLS parity | Read-only inspection found 26 production migrations, 35 RLS tables, 89 policies; candidate now restores the production 26-migration history and adds candidate-only Catalog migration `202608270001` | Migration required / history conflict | Separately authorize Catalog migration and release checks, then verify schema/RLS/RPC/checksum against production. |
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
