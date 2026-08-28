# Live Status

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched by this Admin milestone.
- Production Supabase: untouched; migrations 001–005 remain branch-only proposals.
- Latest pushed milestone: `43eec47 feat(admin): define species SEO routes and page preview`.
- Vercel `admin-content` Preview for `43eec47` is READY, HTTP 200, and protected by page-level `noindex,nofollow,noarchive` plus `x-robots-tag: noindex`.
- Current uncommitted milestone: fail-closed public Species generator + runtime SEO tests + revision history/rollback.
- 486 catalog rows → 276 Base Species groups; 83 multi-member groups; 28 suspected duplicate records; 5 category-conflict groups.

## Publishing pipeline now implemented locally
- Static path contract: English `/species/<base-scientific-slug>/<catalog-key>.html`; Chinese `/zh/species/...`; English is `x-default`.
- Generator requires an explicit `local/test/preview/staging` publication snapshot and explicit output directory; `production` snapshots are rejected.
- Only Published Variant rows with a same-locale Published Base row are eligible for generation.
- English generation requires an editorial `localized_name`; editorial intro/title/meta/H1 must be non-empty.
- Independent Index still fails closed for category-conflict groups and suspected duplicates; canonical targets must be Published + independently indexed.
- Sitemap includes only self-canonical `index,follow` pages; noindex and canonical-to-sibling pages are excluded.

## Verification
- `test:contract` passes and now includes the public-page runtime generator test.
- Generator fixture produced 4 static pages and 2 sitemap candidates; production input was explicitly refused.
- Runtime test caught and fixed an English rendering bug where the file path was English but `<html lang>`/fact labels were Chinese.
- Fresh isolated Supabase applied core + Admin migrations 001–005 from scratch.
- Variant history proof: v1 Draft → v2 Published fixture → restore v1 → v3 `rollback` Draft; `published_at` cleared and source revision recorded.
- Base Species history passed the same v1 → v2 → rollback-to-Draft sequence.
- Non-admin history SELECT returned 0 rows; non-admin rollback RPC was rejected with `Admin role required`; final test residue was 0.
- Read-only Chrome Review shows Base/Variant History panels, public-page preview, bilingual workspace and two disabled Published options with no page errors.
- Production Admin build passes; only the known >500KB bundle warning remains.

## Remaining release gate
- Published stays disabled even though the local generator and rollback are verified.
- Next required proof is a dedicated staging Supabase running migrations 001–005 plus a staging snapshot → generator → rendered-page verification.
- No current operation has modified Production Supabase or merged this branch into `main`.
