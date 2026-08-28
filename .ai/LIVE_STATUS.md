# Live Status

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched by this Admin branch.
- Production Supabase: untouched; Admin migrations remain branch-only proposals.
- Admin app: `apps/admin-content`; remote Vercel Preview stays read-only.
- 486 catalog rows are grouped into 276 Base Species; 83 groups support same-group batch workflows.
- Base Species SEO inheritance + Variant Override is implemented locally and awaiting milestone commit/push.

## Inheritance verification
- Editing a Base title template updates both selected Variant Google Preview and multi-Variant batch preview immediately in Review mode, without database writes.
- Base shared intro appears in Variant content context; Variant intro remains a separate difference/override field.
- A Variant title override affects only that Variant; clearing it immediately restores Base inheritance.
- Batch creation stores only Draft shells (`catalog_key + locale + status`) instead of duplicating Base SEO text.
- Category-conflict groups remain blocked.

## Database verification
- `202608280002_species_seo_group_inheritance.sql` applied successfully to the isolated local Supabase only.
- `species_seo_groups` has RLS enabled.
- Simulated admin JWT: Base SEO Draft insert succeeds and is visible.
- Simulated non-admin JWT: Base SEO Draft select returns 0; insert is rejected by RLS.
- RLS test data cleanup returned 0 remaining test rows.

## Gate before push
- Rerun contract test, production build, `git diff --check`.
- Inspect staged files and confirm `.env.local` remains ignored.
- Commit/push one concentrated inheritance milestone; do not merge main.
