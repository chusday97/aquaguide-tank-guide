# Aqua Product Recovery Status

Updated: 2026-09-11
Active branch: `product-recovery-20260911`
Base: `main` @ `d3c70dee633ed4e24bbca161d138a832012b1d40`
Draft PR: #149

## Branch authority
- `product-recovery-20260911` is the only active Aqua product recovery branch for this effort.
- Latest measured relation to `main` before this status commit: ahead 14 / behind 0.
- Merge base is exactly the current main base commit above.
- `feature/admin-content-v0` remains reference-only. Do not merge/rebase it wholesale.

## Completed in this recovery line
### P0
- Accepted product baseline created.
- Product scope created.
- Change boundaries / agent ownership created.
- Recovery branch created directly from current main.

### P1 — Compatibility / beginner result first checkpoint
- Coarse body-size/volume bioload screening can no longer be the sole hard block.
- Aggressive/territorial temperament no longer inflates canonical waste-load screening.
- Legacy coarse capacity blocks are reclassified as advisory warnings by the canonical adapter.
- Hard biological constraints remain blocking: water-type incompatibility, severe temperature mismatch, reviewed predation, explicit single-housing, observed emergency.
- Beginner Action Layer added: can mix / conditional / need information / do not mix.
- Visual result now puts the beginner decision and immediate action first; professional evidence remains in detail sections.
- Compatibility page copy now explicitly tells users that the first result is the conclusion/action, with evidence available afterward.
- Beginner golden actions now cover compatible / soft-capacity caution / hard block / missing information.
- Tank Stability Context added: established duration, stable coexistence duration, maintenance consistency and recent water-quality incident.
- Trusted stability can downgrade only an elevated coarse-load screening to informational context; high screening remains caution.
- Stability context cannot override water-type, temperature, predation, single-housing or observed emergency hard blocks.

### P1 — Species Knowledge V2 contract checkpoint
- Added field-level evidence contract.
- Added staged structured contracts for sex identification, reproduction, social behavior, adult size / space and swimming zone.
- New V2 blocks are optional during migration so existing species do not receive invented facts.
- First reviewed V2 cohort added: `sp_0436` 孔雀鱼, `sp_0431` 红绿灯, `sp_0432` 宝莲灯.
- Cohort includes reviewed sex-identification, reproduction and social-behavior facts with field-level source IDs; unknown species continue to return unknown rather than generic invented biology.
- Reviewed Species V2 social facts now feed the canonical compatibility domain before older compatibility-profile fallbacks.
- Minimum group-size planning is now a canonical caution rule (`minimum_group_not_met`); reviewed V2 values override older profile minima (for example neon/cardinal tetra 8 rather than the older 5 fallback).
- Beginner Action Layer has a dedicated group-size result: `可以养，但数量要够`, with the reviewed minimum shown when available.
- `insufficient_data` results now expose missing evidence in the expandable `为什么这样判断` layer instead of hiding the reason.
- Knowledge Source Registry added for reviewed Species V2 claims; source IDs now resolve to publisher/title/URL instead of remaining opaque strings.
- Existing sex-identification disclosure now shows traceable reviewed-source links without changing the surrounding Species Detail layout.

## Validation status
- Main Convergence foundation workflow on the latest pre-golden-case checkpoint: PASS through project truth, catalog, domain compatibility, legacy compatibility, lint, API and production build.
- Domain compatibility regression: PASS after soft-capacity change.
- Legacy compatibility facade regression: PASS after canonical adapter/test alignment.
- Main Convergence foundation workflow passed through project truth, catalog, compatibility, lint, API and build on the recovery line.
- Local recovery validation after Tank Stability Context: domain compatibility PASS, legacy compatibility PASS, TypeScript lint PASS, production build PASS.
- Species Knowledge V2 first-cohort assertions PASS; TypeScript lint PASS after reviewed cohort wiring.
- Species V2 → compatibility wiring: domain compatibility PASS, legacy facade PASS, beginner visual/action regression PASS, species knowledge PASS, TypeScript PASS, production build PASS.
- Knowledge Source Registry checkpoint: source-resolution assertions PASS, TypeScript PASS, full compatibility regressions PASS, production build PASS.
- Local preview verified HTTP 200 at `http://127.0.0.1:4320/`.
- Do not merge until the latest current-head workflows are green.

## Next execution order
1. Add user-facing stability evidence capture with progressive disclosure; do not require advanced inputs for beginners.
2. Expand the reviewed cohort incrementally; do not mass-fill unknown fields.
3. Add reviewed adult-size / space fields for the next cohort and wire them through the same V2-first authority path.
4. Present reviewed reproduction/social blocks inside the existing Species Detail hierarchy without a layout rewrite.
5. Continue browser-level golden-path validation before any merge to main.
