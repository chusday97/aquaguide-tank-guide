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

## Latest checkpoint — bottom-zone ecology
- Added reviewed Species V2 profiles for 咖啡鼠 (`sp_0014`) and 熊猫鼠 (`sp_0443`).
- Corrected catalog scientific name `Corydoras pandas` → `Corydoras panda`.
- Added `swimmingZone` to Domain species facts and wired reviewed social/space knowledge into compatibility.
- Added informational `shared_bottom_zone_context`; two bottom dwellers no longer disappear into generic compatibility, but the shared zone does not itself raise caution.
- Evidence coverage remains fail-closed: 132 priority directions, 12 reviewed recordable directions, 98 insufficient, 22 not recommended, 12 caution.
- Verified: Species Knowledge PASS, Domain PASS, Compatibility PASS, evidence coverage PASS, TypeScript PASS, production build PASS, Compatibility beginner-action E2E PASS, GP001–GP004 PASS.

## Latest checkpoint — Species Detail reviewed knowledge presentation
- Added a reviewed `Adult size & space / 成体与空间` disclosure using Species V2 authority.
- Social/group disclosure now includes reviewed recommended-group guidance and localized swimming-zone labels.
- Browser contract updated for the reviewed neon-tetra group-size rule: a default quantity of 1 is caution and exposes the risk action rather than direct stocking.
- Removed the duplicate calculator CTA from the unavailable compatibility disclosure.
- Verified: Species Knowledge PASS, TypeScript PASS, production build PASS, Species Detail E2E PASS, Compatibility E2E PASS, GP001–GP004 PASS.
