# Unified Release Readiness

**Status:** `NOT_READY`
**Updated:** 2026-08-30
**Scope:** separates code-source convergence into `main` from the separately authorized production release.

| Gate | Current evidence | Status | What closes it |
| --- | --- | --- | --- |
| One code source | `main` is the intended canonical code source; PR #142 carries `codex/main-core-foundation-v1` into it. | Pending / source convergence | Push the current candidate once, pass CI, then merge PR #142 with a merge commit. |
| One project/product/UI/deployment truth map | Project Truth, Product Truth, Feature Catalog, Visual Baseline, Deployment State and history registry exist | Pass | `npm run check:project-truth`. |
| Local visual baseline | Current candidate UI remains provisional; 4317 is detached `37a8d4d1`; the latest 35-image matrix is stored outside the repository | Pass / provisional | Visual recovery and the new freeze baseline remain post-convergence release work. |
| GitHub convergence CI | PR #142 Head `c63cb2dd` is `CLEAN/MERGEABLE/Draft`; foundation, validate, Vercel Preview Comments and Cloudflare status checks are successful at the latest read-back | Pass / merge authorization | Keep Draft until the user separately authorizes the main merge. |
| Exact Preview SHA parity | The current candidate SHA has no newly verified matching Preview deployment | Pending / production release gate | Verify exact SHA after visual/data work; it is not a reason to deploy production during source convergence. |
| Supabase schema/RLS parity | Read-only check confirms 26 migrations, 35 RLS tables, 89 policies; production lacks `catalog_releases`, `species_reference_links` and `species.water_type` | Migration required | See [SUPABASE_PARITY_REPORT.md](./SUPABASE_PARITY_REPORT.md); separately authorize migration, then Catalog release. |
| P0 business migration | User-approved local contract; compatibility, tank-state and water-change deterministic tests passed; temporary 4320 preview passed layout/framing/scene/page matrix | Pass | Keep later authority/UI work in a separately approved unit. |
| Source convergence merge | Local and remote candidate are synchronized at `c63cb2dd`; PR #142 is still Draft | Pending / separate authorization | After final user confirmation, merge PR #142 into `main`. |
| Production release | `release/production` is anchored to `ed0cf380`; production remains unchanged | Blocked / release gates | Only fast-forward the deployment pointer after Preview, Catalog, Supabase and human acceptance pass. |

## Release rule

Source convergence may make `main` current while this file remains `NOT_READY`. No Preview/Production deployment, CI success, historical PR, or local build alone can change this file to `READY`. The production SHA must be reviewed locally, validated in CI, checked against the deployed environment, and accepted by the user.

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
