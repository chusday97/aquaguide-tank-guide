# Live Status

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched by this Admin branch.
- Production Supabase: untouched; `species_seo` migration is not applied there.
- Admin app: `apps/admin-content`.
- Remote Vercel Preview remains read-only; Supabase writes disabled.
- Local Auth/RLS/draft-save path was previously verified against isolated local Supabase.

## Grouping snapshot
- 486 catalog records → **276 Base Species groups**.
- **83** groups have 2+ members; **293** records are inside these batch candidates.
- **223** members have explicit Variant labels.
- **28** suspected exact duplicate records.
- **5** Base Species groups have category conflicts and are blocked from bulk publish.

## Verification completed
- Group generator is deterministic: two consecutive runs produce identical SHA-256 output.
- Real headless Chrome at 1440×900: 276 groups / 293 variant rows render, no Vite overlay, no horizontal page overflow.
- Selecting 极火虾 + 黄金米虾 opens `Neocaridina davidi` bulk preview with per-variant titles; Review save stays disabled.
- Selecting two `Pterophyllum scalare` members shows source-category conflict warning and keeps save disabled.
- Batch checkbox selection now also aligns the single-item editor to the most recently selected member.
- Before commit: rerun contract test, production build, `git diff --check`, then inspect and push one concentrated commit.
