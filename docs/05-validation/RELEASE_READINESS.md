# Unified Release Readiness

**Status:** `NOT_READY`
**Updated:** 2026-08-28
**Scope:** final gate for a unified branch becoming eligible for a separately authorized RC/main release.

| Gate | Current evidence | Status | What closes it |
| --- | --- | --- | --- |
| One delivery line | `npm run project:status` reports the local candidate, remote candidate and PR #142 SHA at runtime; the working tree is currently synchronized | Pass / Supabase and acceptance pending | Keep the runtime-reported SHA unchanged through Preview and release acceptance. |
| One project/product/UI/deployment truth map | Project Truth, Product Truth, Feature Catalog, Visual Baseline, Deployment State and history registry exist | Pass | `npm run check:project-truth`. |
| Local visual baseline | Current candidate UI is frozen provisionally at `02457dd2`; 4317 is detached `37a8d4d1`; fixed 390/600/1280 screenshots are stored in `/private/tmp/aquaguide-visual-matrix/ui-freeze-02457dd2` | Pass / provisional | Do not change visual-owned files before main; run `npm run check:ui-freeze` on every backend change. |
| GitHub convergence CI | Prior candidate checks passed; the two local authority commits are not on GitHub yet. The unrelated admin-content check remains rate-limited | Pending / local sync and external admin-content gate | Complete Critic re-review, push once, then read checks for the pushed SHA. |
| Exact Preview SHA parity | The current candidate SHA from `npm run project:status` has not yet been verified against a new exact Preview deployment; earlier Preview evidence is historical | Pending / external Vercel gate | When quota permits, verify `environment=Preview`, exact SHA and `state=success` for the runtime-reported candidate SHA. |
| Supabase schema/RLS parity | Read-only check confirms 26 migrations, 35 RLS tables, 89 policies; production lacks `catalog_releases`, `species_reference_links` and `species.water_type` | Migration required | See [SUPABASE_PARITY_REPORT.md](./SUPABASE_PARITY_REPORT.md); separately authorize migration, then Catalog release. |
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
