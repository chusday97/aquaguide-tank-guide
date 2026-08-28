# Current Goal

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

Build an isolated AquaGuide Species SEO Admin that supports grouped variants, bilingual drafts, safe indexing decisions and a visible public-page preview without modifying `main` or Production Supabase.

## Current milestone

Define and verify the public Species SEO route contract while keeping publishing fail-closed:

`Base/Variant content → locale draft → index strategy → derived URL/canonical/hreflang → public-page preview`

## Success criteria

- Public URL is deterministic and not manually typed.
- English uses the existing default-language path pattern; Chinese uses `/zh/`.
- Every new Species SEO row defaults to `noindex`.
- Canonical-to-sibling can only target a member of the same Base Species group in the Admin contract.
- Category conflicts and suspected duplicates cannot silently become independent index pages.
- Admin shows how H1/intro/Product Truth will appear on the future public page.
- No Species can be marked Published until the real static-page generator and runtime canonical/hreflang tests exist.
- All database validation remains local/non-production and all milestones are traceable in `.ai/`.
