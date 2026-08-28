# Unified Release Readiness

**Status:** `NOT_READY`
**Updated:** 2026-08-28
**Scope:** final gate for a unified branch becoming eligible for a separately authorized RC/main release.

| Gate | Current evidence | Status | What closes it |
| --- | --- | --- | --- |
| One delivery line | Local candidate, remote candidate and Draft PR #142 are checked at runtime by `npm run project:status`; current exact head is `df3c4e11` | Blocked / Supabase and acceptance pending | Complete Supabase parity, then obtain user release acceptance. |
| One project/product/UI/deployment truth map | Project Truth, Product Truth, Feature Catalog, Visual Baseline, Deployment State and history registry exist | Pass | `npm run check:project-truth`. |
| Local visual baseline | Current candidate UI is frozen provisionally at `02457dd2`; 4317 is detached `37a8d4d1`; fixed 390/600/1280 screenshots are stored in `/private/tmp/aquaguide-visual-matrix/ui-freeze-02457dd2` | Pass / provisional | Do not change visual-owned files before main; run `npm run check:ui-freeze` on every backend change. |
| GitHub convergence CI | Foundation, Product Golden Path validate, Cloudflare Pages and AquaGuide Vercel checks are being evaluated for current head `7420919c`; the unrelated admin-content check is rate-limited | Pending / external admin-content gate | Keep PR Draft until current validate completes and admin-content is isolated or explicitly waived by GitHub policy. |
| Exact Preview SHA parity | `npm run check:preview-parity` passed for prior code head `55a37745`; latest docs-only head `df3c4e11` has no exact Preview deployment because Vercel is rate-limited | Pending / rate limited | After quota reset, deploy once and require `environment=Preview`, exact SHA and `state=success` for `df3c4e11`. |
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
