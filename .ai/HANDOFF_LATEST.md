# Handoff Latest

Updated: 2026-09-11
Branch: `product-recovery-20260911`
Base: current recovery line from `main`

## Current checkpoint
- Compatibility rule authority advanced to `compatibility-domain-v4-target-vulnerability`.
- Added structured `finNipVulnerability` and `swimmingPace` alongside existing `finNippingRisk`.
- Generic reviewed fin-nipper + reviewed vulnerable target now raises `fin_nipping_target_vulnerability` as caution.
- Species Fit prefers reviewed vulnerability/fin-nipping facts over fish-name regex when reviewed knowledge exists.
- Guppy is the first reviewed vulnerable target; its social authority records high fin-nip vulnerability.
- Added a reviewed tiger-barb × guppy pair override as `not_recommended`; sufficient tiger-barb group size does not erase the long-fin fin-nipping conflict.
- Beginner Action has a dedicated vulnerability caution and recognizes reviewed pair blocks as explicit `不建议混养`.

## Verified
- Compatibility evidence coverage: PASS; reviewed pair-rule floor is now 5.
- Domain compatibility: PASS, including generic target-vulnerability caution.
- Legacy compatibility facade: PASS, including tiger-barb × guppy reviewed block.
- Visual result actions: PASS.
- TypeScript lint: PASS.
- Production build: PASS.
- Compatibility beginner-action browser E2E: PASS, including tiger-barb × guppy reviewed block.
- GP001, GP002, GP003, GP004: PASS.

## Next task
Expand target vulnerability only where reviewed husbandry evidence supports it, then continue the next high-frequency Species Knowledge V2 cohort. Keep pair rules as overrides and do not infer vulnerability from names.

## Latest checkpoint — base-species authority inheritance
- Added runtime lookup helpers that prefer exact species/variant review, then fall back to an explicit base-species scientific-name authority.
- Kept direct review audit APIs unchanged so inherited variants do not count as independently reviewed species.
- Betta ornamental variants now inherit the reviewed `Betta splendens` baseline instead of falling back to stale catalog-only behavior.
- Added direct reviewed `Pterophyllum scalare` knowledge/profile; tiger barb × angelfish now surfaces structured fin-nipping target vulnerability without a stale single-housing or fake predation block.
- Runtime Compatibility, Species Fit, compatibility presentation, and housing labels use inheritance-aware authority consistently.
- Verified: Species Knowledge PASS, Compatibility PASS, Domain PASS, TypeScript PASS, production build PASS, Compatibility beginner-action E2E PASS, GP001–GP004 PASS.

## Latest checkpoint — capacity heuristic cleanup
- Removed the remaining legacy 1.35× Aggressive/Territorial multiplier from bioload estimation.
- Removed `loadMultiplier` from the Domain species contract because behavior must not act as a waste-production proxy.
- Retired Species Fit `density_high`, which treated raw animal count as comparable regardless of adult size/species needs.
- Added regressions proving temperament cannot change load screening for the same species/size/quantity and raw count alone cannot produce `density_high`.
- Verified: Domain PASS, Compatibility PASS, TypeScript PASS, production build PASS, Compatibility beginner-action E2E PASS, GP001–GP004 PASS.
