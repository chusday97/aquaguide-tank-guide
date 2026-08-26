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
| Exact Preview SHA parity | Vercel CLI identifies the latest Ready branch Preview and exposes `githubCommitSha=6b0e629d8b6694a06b98182a38da01d34718c44f`; the canonical local/GitHub SHA is always the value reported by `npm run project:status` | Pending | Trigger/observe a Git-connected Preview for the current `project:status` SHA, then re-run `vercel ls aquaguide --json` and record the matching deployment. |
| Supabase schema/RLS parity | Read-only PostgREST probes: 31/31 contract tables and latest contract columns returned 200; migration revision/RLS policy metadata unavailable from authorized surfaces | Pending | Authorized read-only schema revision and direct RLS/API smoke check. |
| P0 business migration | User-approved local contract; compatibility, tank-state and water-change deterministic tests passed; temporary 4320 preview passed layout/framing/scene/page matrix | Pass | Keep later authority/UI work in a separately approved unit. |
| Human visual acceptance | User confirmed the current 4317 visual as the working baseline on 2026-08-26; future visual changes require a new review | Pass (baseline only) | Re-run human review after any visual-owner change; this does not approve `main` release. |
| RC/main merge | Not authorized | Blocked by release decision | Separate user release acceptance after all above gates pass. |

## 2026-08-26 parity follow-up

- The recorded branch Preview returned `302 → Vercel SSO` without an exposed Git SHA; exact Preview SHA parity remains pending.
- No authorized Supabase schema/RLS inspection surface was available; no database mutation was attempted. The existing 31/31 PostgREST evidence remains read-only table/column reachability only.
- A read-only Vercel CLI listing later exposed deployment metadata: the newest Ready deployment on the canonical branch is `aquaguide-uwfft41zv-chusday97s-projects.vercel.app` with `githubCommitSha=6b0e629d8b6694a06b98182a38da01d34718c44f`, so the deployment is verifiably behind the canonical SHA `43f75e739655e8061fb880ed3415b741a90275c1`. No redeploy was triggered in this pass.
- A Git-connected Preview creation request for the current canonical SHA was rejected with Vercel `api-deployments-free-per-day` (Hobby daily limit exceeded). This is an external quota blocker; no deployment was created and the gate remains pending until the quota resets or the account plan/limit changes.
- The repeatable read-only command `npm run check:preview-parity` now reports local SHA = remote SHA and Vercel deployment SHA `6b0e629d…`; its `NOT_SYNCHRONIZED` result keeps this gate explicitly pending.

## 2026-08-26 remote CI evidence

- GitHub read-only metadata confirms PR #141 head `ffdcabd8411a8339ce09196f7310b96b33a4ce8a`; convergence and candidate-head workflows both passed.
- Vercel and Cloudflare deployment checks passed, but exact Vercel deployed SHA was not exposed and therefore does not close the Preview parity gate.

## Release rule

No Preview/Production deployment, CI success, historical PR, or local build alone can change this file to `READY`. The release SHA must be the same one reviewed locally, validated in CI, checked against the deployed environment, and accepted by the user.

## Verification commands

```bash
npm run project:status
npm run check:preview-parity
npm run check:project-truth
npm run lint
npm run test:layout-mode
npm run test:three-stage-framing
npm run build
```

The Supabase parity row requires authorized environment access and must never be simulated by an environment-variable presence check.
