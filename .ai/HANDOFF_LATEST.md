# Handoff Latest

Updated: 2026-09-11
Branch: `product-recovery-20260911`
Base: current recovery line from `main`

## Current checkpoint
- Replaced the old “no direct pair study = insufficient_data” gate with explicit `pair_trait_inference` provenance.
- Direct reviewed pair rules still override trait inference and can block.
- Reviewed compatibility profiles now provide water type authority for the reviewed cohort.
- Species Fit no longer treats `Aggressive` or `Large` as automatic predation when reviewed behavior evidence exists.
- Reviewed solitary/group behavior overrides stale `housingMode` labels in Compatibility UI.
- Tiger barb now presents reviewed group guidance rather than the stale `建议单养` label.
- New browser test covers tiger-barb group pressure and stable-tank soft-load downgrade.
- GP001 navigation click was hardened to target the real button rather than a child text span.

## Verified
- Compatibility evidence coverage: PASS; 132 common-species directions, 6 currently recordable reviewed directions.
- Domain compatibility: PASS.
- Legacy compatibility facade: PASS.
- Visual result actions: PASS.
- TypeScript lint: PASS.
- Production build: PASS.
- Compatibility beginner-action browser E2E: PASS.
- GP001, GP002, GP003, GP004: PASS.

## Next task
Add reviewed target-vulnerability traits (for example long-fin / slow-swimming susceptibility) to the same domain contract so fin-nipping risk is inferred from structured evidence rather than fish-name regex. Keep direct pair rules as overrides.
