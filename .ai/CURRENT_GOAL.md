# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

Build an isolated AquaGuide Content Admin for non-technical Species SEO management without modifying `main` or Production Supabase.

## Current milestone

Complete bilingual Species SEO authoring on top of the inheritance model:

`中文 Source → AI English suggestion → human review → English Draft`

while preserving:

`Category → Base Species shared SEO → Variant Override → Effective SEO`

## Success criteria

- `zh-CN` and `en` are independent content rows; one language never overwrites the other.
- English common/display name is editorial localization, not Product Truth.
- AI translation is suggestion-only; it never auto-publishes or silently overwrites Published English.
- Scientific names, catalog keys and `{{template_tokens}}` remain protected.
- Empty Variant Overrides stay empty so Base inheritance is preserved across languages.
- Category conflicts and duplicate candidates remain visible with concrete review evidence.
- Remote Preview remains read-only; real writes still require Auth + admin role + RLS.
