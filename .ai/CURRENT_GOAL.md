# Current Goal

Updated: 2026-09-11
Active branch: `product-recovery-20260911`

## Goal
Complete Aqua Product Recovery P1 Compatibility V4 by separating fin-nipping pressure from target vulnerability. Reviewed species traits drive general caution; reviewed direct pair evidence remains the higher-priority override.

## Current acceptance target
- Beginner Action tells the user what to do before professional evidence.
- `finNippingRisk` and `finNipVulnerability` are separate structured facts; `swimmingPace` may support target vulnerability when reviewed.
- Generic fin-nipper + vulnerable target is caution, not an invented hard block.
- A reviewed direct pair rule may upgrade the exact combination to `not_recommended`.
- Stable-tank history may only downgrade soft load/capacity screening and cannot override behavior hard blocks.
- Reviewed authority must override stale fish-name regex and legacy housing labels where reviewed facts exist.

## Validation gate
Domain compatibility, legacy facade, evidence coverage, visual actions, TypeScript, build, Compatibility beginner-action browser E2E, and GP001-GP004 must pass before checkpoint push.

## Next
After this checkpoint, expand target-vulnerability traits only for reviewed species with direct husbandry evidence; then continue the next high-frequency Species V2 cohort. Do not redesign frozen UI.

## Base-species inheritance checkpoint
- Runtime reviewed authority now resolves exact species ID first, then an explicit base-species key derived from scientific name.
- Variant inheritance is allowed only for shared base-species biology; direct-ID audit counts remain unchanged so inherited authority is never presented as a separately reviewed variant.
- `Betta splendens var.*` can inherit the reviewed `Betta splendens` baseline; variant-specific exceptions remain eligible for exact-ID overrides.
- `Pterophyllum scalare` is reviewed directly and now contributes structured fin-nip vulnerability instead of name-regex inference.
- Acceptance remains: inherited authority may improve runtime decisions, but must not inflate direct review coverage or override explicit pair/hard-risk evidence.

## Capacity heuristic cleanup checkpoint
- Aggressive/Territorial temperament must never multiply waste/bioload screening. Behavior risk and carrying-capacity screening are separate dimensions.
- Raw livestock count must not create a generic density warning; capacity remains based on reviewed species facts plus coarse body-size screening until filtration/flow/water-quality facts are added.
- No replacement hard limit is introduced here. This checkpoint removes false precision rather than inventing a new universal stocking formula.

## Bottom-zone ecology checkpoint
- Compatibility now carries reviewed swimming-zone context without turning shared zones into automatic incompatibility.
- `shared_bottom_zone_context` is informational only: it explains shared substrate/feeding pressure while preserving the underlying verdict.
- First bottom-dweller cohort: `sp_0014` Corydoras aeneus and `sp_0443` Corydoras panda with reviewed group size, adult size, tank footprint guidance and bottom-zone authority.

## Species Detail reviewed-knowledge presentation checkpoint
- Species Detail now renders reviewed adult size / planning volume / tank length / swimming zone / activity as a dedicated secondary evidence disclosure.
- Social presentation now renders reviewed recommended group range and human-readable swimming-zone labels instead of raw enum values.
- Reviewed knowledge stays optional: unreviewed species do not receive fabricated space/social sections.
- The unavailable compatibility disclosure keeps one calculator CTA only; duplicate route actions are prohibited.

## Species Detail presentation checkpoint
- Reviewed space authority is now rendered as a dedicated `成体与空间 / Adult size & space` disclosure with adult size, planning volume, tank length, swimming zone, activity level, notes, and reviewed sources.
- Social knowledge now renders recommended group range in addition to minimum group size, and internal swimming-zone enums are localized for users.
- The detail surface keeps these as progressive evidence rather than moving them into the primary action area.
- The unavailable compatibility disclosure no longer duplicates the calculator CTA; exactly one route remains.
- Browser contract updated so a single neon tetra is caution under the reviewed minimum-group rule rather than incorrectly treated as directly addable.
