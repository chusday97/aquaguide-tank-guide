# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

Build an isolated AquaGuide Content Admin for non-technical Species SEO management without modifying `main` or Production Supabase.

## Current milestone

Complete the inheritance model:

`Category → Base Species shared SEO → Variant Override → Effective SEO`

Base Species owns shared templates/content. Variants inherit by default and only persist fields that genuinely differ. Batch operations create Variant Draft shells rather than copying shared text into every record.

## Success criteria

- Base Species changes immediately propagate to every non-overridden Variant preview.
- Clearing a Variant override restores inheritance automatically.
- Product Truth remains read-only and outside the SEO write path.
- Category-conflict groups fail closed and require source-data review.
- Published SEO cannot be silently batch-overwritten before versioned drafts exist.
- Remote Preview remains read-only; actual writes remain limited by Auth + admin role + RLS.
- Every milestone is recorded in `.ai/` and indexed from root handoff/progress docs.
