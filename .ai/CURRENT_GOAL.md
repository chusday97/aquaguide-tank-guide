# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

Build an isolated AquaGuide Species SEO Admin that can safely move reviewed bilingual content from Draft to deterministic static SEO pages without modifying `main` or Production Supabase.

## Current milestone

Close the publishing safety chain:

`Base/Variant Draft → revision history/rollback → index strategy → derived URL/canonical/hreflang → fail-closed static generator → sitemap/runtime SEO tests → staging publication validation`

## Success criteria

- Public URL is deterministic and not manually typed.
- English uses the existing default-language path pattern; Chinese uses `/zh/`.
- Every new Species SEO row defaults to `noindex`.
- Category conflicts and suspected duplicates cannot silently become independent index pages.
- Static generation accepts only explicit non-production publication snapshots and never writes into public routes implicitly.
- Runtime tests verify title, meta, H1, robots, canonical, hreflang and sitemap behavior.
- Every Base/Variant save creates an admin-only revision; rollback always restores as Draft and cannot republish content.
- Published remains disabled until the same migration + snapshot → generator → page verification path succeeds against a staging Supabase environment.
- Production Supabase and `main` remain untouched until explicit approval.
