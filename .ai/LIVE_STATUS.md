# Live Status

Updated: 2026-08-28
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched by this Admin milestone.
- Production Supabase: untouched; migrations 001–004 remain branch-only proposals.
- Latest pushed milestone before current work: `465024a` bilingual translation + data review.
- Current uncommitted milestone: Species route/index contract + live public-page effect preview.
- 486 catalog rows → 276 Base Species groups; 83 multi-member groups; 28 suspected duplicate records; 5 category-conflict groups.

## Public Species SEO contract
- Existing AquaGuide static SEO pages already use English default paths and Chinese `/zh/` paths with reciprocal hreflang and English `x-default`; Species proposal follows the same pattern.
- Proposed stable Species paths: `/species/<base-scientific-slug>/sp-0001.html` and `/zh/species/<base-scientific-slug>/sp-0001.html`.
- URL identity uses Base Scientific Name + stable catalog key, not translated/common names.
- `index_strategy` defaults to `noindex`; available review choices are `index`, `canonical_to_sibling`, `noindex`.
- Canonical path is derived by contract, not editable free text.
- Base Species remains an inheritance layer; it is not automatically a separate public landing page.

## Verification
- Contract test and production Admin build pass; only the existing >500KB bundle warning remains.
- Real Chrome Review shows Public URL, canonical, hreflang en/zh-CN/x-default, `noindex,follow`, Google Preview and public Species-page preview.
- Preview reads existing water temperature, pH, tank size and difficulty from catalog as read-only Product Truth.
- Fresh isolated Supabase on ports 56321/56322 applied core + Admin migrations 001–004 from scratch.
- Simulated admin RLS write stored `canonical_to_sibling`; simulated non-admin Draft read returned 0 and write was rejected; cleanup left 0 test rows.
- Published is disabled for both locales until an actual Species HTML generator + runtime SEO validation exists.

## Safety boundary
- Remote Review remains read-only.
- No service-role key is exposed to browser code.
- No current operation has modified Production Supabase or merged this branch into `main`.
