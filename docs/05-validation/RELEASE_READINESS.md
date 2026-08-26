# Unified Release Readiness

**Status:** `NOT_READY`  
**Updated:** 2026-08-26
**Scope:** final gate for a unified branch becoming eligible for a separately authorized RC/main release.

| Gate | Current evidence | Status | What closes it |
| --- | --- | --- | --- |
| One delivery line | Local branch, remote and Draft PR #141 are tracked by `project:status` | Pass | Keep all future work on the canonical branch. |
| One project/product/UI/deployment truth map | Project Truth, Product Truth, Feature Catalog, Visual Baseline, Deployment State and history registry exist | Pass | `npm run check:project-truth`. |
| Local visual baseline | User-confirmed 4317 direction; layout/framing/scene/Rail/page matrix passed locally | Pass | Rerun affected matrix rows after any UI-owner change. |
| GitHub convergence CI | PR #141 head `ffdcabd8`; `RC Convergence V1` run `32915252842` and `Result UX Head Integrity V1` run `32915252831` passed | Pass | Rerun automatically for relevant future pushes. |
| Exact Preview SHA parity | Latest branch Preview is Ready and timing-correlated with `187d16ba`, but Vercel metadata did not expose its Git SHA | Pending | Record the exact deployed SHA associated with the accepted review. |
| Supabase schema/RLS parity | Read-only PostgREST probes: 31/31 contract tables and latest contract columns returned 200; migration revision/RLS policy metadata unavailable from authorized surfaces | Pending | Authorized read-only schema revision and direct RLS/API smoke check. |
| P0 business migration | User-approved local contract; compatibility, tank-state and water-change deterministic tests passed; temporary 4320 preview passed layout/framing/scene/page matrix | Pass | Keep later authority/UI work in a separately approved unit. |
| Human visual acceptance | Local 4317 scene/DOM/Canvas rendered at 523×812 with no application errors; user confirmation of the current visual is still required | Pending | User confirms the fixed-view visual review, then record reviewer and timestamp. |
| RC/main merge | Not authorized | Blocked by release decision | Separate user release acceptance after all above gates pass. |

## 2026-08-26 parity follow-up

- The recorded branch Preview returned `302 → Vercel SSO` without an exposed Git SHA; exact Preview SHA parity remains pending.
- No authorized Supabase schema/RLS inspection surface was available; no database mutation was attempted. The existing 31/31 PostgREST evidence remains read-only table/column reachability only.

## 2026-08-26 remote CI evidence

- GitHub read-only metadata confirms PR #141 head `ffdcabd8411a8339ce09196f7310b96b33a4ce8a`; convergence and candidate-head workflows both passed.
- Vercel and Cloudflare deployment checks passed, but exact Vercel deployed SHA was not exposed and therefore does not close the Preview parity gate.

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
