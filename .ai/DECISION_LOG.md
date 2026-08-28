# Decision Log

## 2026-08-28 — Species grouping for SEO

1. Admin hierarchy is `Category → Base Species → Variant`, not a flat 486-row list.
2. “Family” is not used for this product grouping because Family is a biological taxonomic rank.
3. Stable `catalog_key` (`sp_xxxx`) remains the record identity; Base Species grouping is an additional content-management layer.
4. First-pass grouping uses explicit scientific-name evidence: exact scientific name, `var.`, cultivar quotes, and `wild type`.
5. Ambiguous data must fail closed; grouping is not allowed to silently rewrite Product Truth.
6. Groups whose members disagree on category are marked `需复核` and cannot use batch SEO writes.
7. Batch SEO may change SEO Title, Meta Description and H1 templates only; water parameters, compatibility and other Product Truth are outside its authority.
8. Batch output is Draft-only. If any selected row is already Published, bulk overwrite is blocked until true versioned Draft/Publish is implemented.
9. Similar variants may share a Base Species template, but each variant can later add an override. Full duplicate copy generation is not the target architecture.
10. Not every catalog variant is automatically an indexable SEO page; canonical/noindex strategy will be decided in a later SEO strategy phase.

## Existing Admin safety decisions retained

- One monorepo, isolated `apps/admin-content` companion app.
- Supabase Auth + `user_roles` + RLS enforce admin access.
- No service-role key in browser code.
- Remote Preview is read-only and noindex.
- No merge to `main` and no Production Supabase migration without explicit later approval.

## 2026-08-28 — Base inheritance, not bulk text duplication
- Base Species owns shared SEO templates and shared editorial intro.
- Variant rows store only explicit overrides/differences; blank override means inherit Base.
- Batch selection creates Draft shells only; it must not materialize copied Base Title/Description/H1 into every Variant row.
- Effective SEO is resolved at read/preview time: `Variant Override ?? Base Template`.
- This reduces future maintenance: changing shared wording once updates all non-overridden Variants.
- Category-conflict groups remain publish-blocked even if the inheritance UI can render them.
