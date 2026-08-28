# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

Build an isolated AquaGuide Content Admin for non-technical Species SEO management without modifying `main` or Production Supabase.

## Current milestone

Replace the flat 486-record Species list with a safe hierarchy:

`Category → Base Species → Variant / Strain → SEO`

The Admin must support batch SEO for members of the same Base Species while keeping aquarium Product Truth separate and read-only.

## Success criteria

- Group variants using stable, traceable catalog data rather than UI/DOM guessing.
- Batch SEO changes only editorial SEO fields.
- Category-conflict groups fail closed and require review.
- Published SEO cannot be silently batch-overwritten before versioned drafts exist.
- Remote Preview remains read-only and cannot write Supabase.
- Every meaningful change is recorded under `.ai/` and indexed from root handoff/progress docs.
