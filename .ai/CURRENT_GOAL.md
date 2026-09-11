# Current Goal

Updated: 2026-09-12
Active branch: `product-recovery-20260911`

## Goal
Continue Aqua Product Recovery P1 Species Knowledge V2 coverage expansion without fabricating missing biology. Close reviewed-authority gaps that materially improve Compatibility and Species Detail, using base-species inheritance only when the evidence supports shared biology.

## Current acceptance target
- Add reviewed facts field-by-field; unavailable sex/reproduction/space data stays unknown or absent.
- Exact reviewed species facts win, then evidence-backed base-species inheritance, then legacy fallback.
- Species Knowledge V2 and Compatibility must share the same biological authority instead of diverging.
- Canonical biological-taxon coverage is the progress metric; duplicate catalog IDs/ornamental morphs never inflate progress.
- Hard biological conflicts and reviewed pair overrides remain stronger than generic trait inference.
- Frozen global UI/IA stays unchanged; this phase improves decision quality and evidence disclosure, not visual redesign.

## Validation gate
Domain compatibility, legacy facade, evidence coverage, visual actions, TypeScript, build, Compatibility beginner-action browser E2E, and GP001-GP004 must pass before checkpoint push.

## Next
The Compatibility-reviewed → Species Knowledge V2 authority gap is now zero for catalog fish. Reassess the next canonical high-frequency cohort using reviewed external evidence; add a new taxon only when it improves decision quality, and keep unsupported fields unknown/absent.

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

### Current checkpoint — housing authority convergence
- Shared reviewed housing authority now drives Species Detail, Compatibility, Encyclopedia, and Aquarium.
- Exact reviewed species facts win, then base-species inheritance, then legacy fallback.
- Next focus: increase reviewed common-species coverage; do not reopen broad UI redesign.

### Current checkpoint — V5 prey vulnerability
- `predationRisk` means active predation; `predationVulnerability` means prey-side susceptibility. These facts must never be substituted for each other.
- Common reviewed shrimp authority now uses base-species inheritance where appropriate; nerite snails do not receive a fabricated minimum group size or prey-vulnerability level.
- Fish + highly vulnerable shrimp is caution unless stronger reviewed predator evidence already hard-blocks the pair.
- Current priority catalogue-direction coverage is 110/132 recordable, overwhelmingly caution. Do not present this as overall species coverage or a safety rate.
- Next: canonicalize the coverage metric by biological taxon so duplicate catalogue IDs/variants do not inflate progress, then continue reviewed common-species expansion.

### Current checkpoint — canonical coverage accounting
- Coverage progress is measured by canonical biological taxon, not raw catalog ID.
- Priority baseline is now 8 taxa / 56 ordered directions: 42 caution, 14 not_recommended, 0 unconditional compatible.
- Raw 12-record / 132-direction output remains an integrity audit only. Duplicate IDs/morphs must produce the same canonical verdict.
- Next reviewed-data work should raise canonical taxon coverage or decision quality, not merely add duplicate catalogue records.

### Current checkpoint — Amatitlania partial Species Knowledge V2
- Closed the Compatibility-only gap for `Amatitlania nigrofasciata` using the existing peer-reviewed territory/aggression source.
- Added only reviewed social/territorial behavior; sex identification explicitly remains unknown, while reproduction and space blocks remain absent.
- `Amatitlania nigrofasciata var.*` ornamental forms inherit the reviewed base-species behavior authority; direct-ID review counts remain unchanged.
- Canonical priority coverage expands from 8 taxa / 56 ordered directions to 9 taxa / 72 ordered directions: 56 caution and 16 not_recommended, with 0 unconditional compatible in the audit setup.
- Next authority gap: `Channa asiatica`; preserve the same partial-review discipline.

### Current checkpoint — Channa partial Species Knowledge V2
- Added evidence-backed base-species Knowledge V2 for `Channa asiatica` using the existing U.S. Fish and Wildlife Service assessment.
- Migrated only reviewed predator / solitary authority into Knowledge V2; sex remains explicit unknown and reproduction / space remain absent.
- `Channa asiatica var.*` now inherits the same reviewed biological authority, including the existing hard small-fish predation boundary.
- Added a regression audit requiring every Compatibility-reviewed catalog fish to resolve to Species Knowledge V2 authority; current gap count is zero.
- Next work must select a genuinely new canonical high-frequency taxon rather than duplicate a variant.
