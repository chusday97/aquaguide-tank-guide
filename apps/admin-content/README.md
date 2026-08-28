# AquaGuide Content Admin V0

Isolated companion app for editing Species SEO content. It lives in the same monorepo but is not mounted into the public AquaGuide web app.

## Safety boundary

- Branch-only prototype: `feature/admin-content-v0`.
- Do not merge or deploy to production yet.
- Uses only `VITE_SUPABASE_URL` and the browser-safe publishable/anon key.
- Never expose a Supabase service-role key to this app.
- Admin authorization is enforced by the existing `user_roles` table and database RLS, not by hiding the URL.
- The `species_seo` migration in this branch is code-only until explicitly applied to a non-production database.

## Current data contract

The public AquaGuide product currently reads 486 Species from `src/data/fishData.ts`. The connected AquaGuide Supabase project has the `species` table but currently contains no Species rows.

For V0, the Admin therefore:

1. Generates a lightweight Species index from the existing repository catalog before dev/build.
2. Uses the stable Species id (`sp_0001`, etc.) as `catalog_key`.
3. Stores only editorial SEO content in Supabase `species_seo`.
4. Joins product truth and SEO content by `catalog_key` rather than duplicating the entire product catalog into Supabase.

This keeps the SEO Admin useful without forcing a product-data migration first.

## Run locally

From the repository root:

```bash
npm install
npm run dev -w @aquaguide/admin-content
```

Open `http://localhost:3010`.

## Read-only remote review

The separate Vercel project `admin-content` is for review only at this stage:

- Root Directory is locked to `apps/admin-content`.
- `VITE_ADMIN_REVIEW_MODE=true` is scoped to Preview deployments of `feature/admin-content-v0`.
- Review mode loads the committed 486-Species index but never performs Supabase auth/data writes.
- The save action is disabled in review mode.
- Vercel Authentication protects the Preview URL, and the page declares `noindex,nofollow,noarchive`.
- The project-level Ignored Build Step skips Git deployments from branches other than `feature/admin-content-v0`.

This remote review mode is separate from the locally verified Supabase Auth + RLS + draft-save flow. Do not treat review mode as an Admin authentication bypass.

## Verify

```bash
npm run test:contract -w @aquaguide/admin-content
npm run build -w @aquaguide/admin-content
```

The contract test checks the catalog projection, admin-role guard, SEO storage key, RLS requirements, and that no service-role key is exposed in the browser app.

## V0 scope

1. Supabase email/password sign-in.
2. Verify the signed-in user has `user_roles.role = admin`.
3. Read the Species index generated from the same repository catalog used by AquaGuide.
4. Search and select a Species.
5. Edit SEO title, meta description, H1, intro, image alt, canonical path and focus keyword.
6. Preview a search-result snippet.
7. Save localized SEO content by `catalog_key + locale` once the branch migration exists in the target environment.
8. Explicitly surface a schema-not-ready state rather than silently failing.

Not included yet: image upload, history/rollback UI, Search Console, production publishing, or changes to the public Species page.

## Base Species / Variant grouping (2026-08-28)

The flat 486-row catalog is now projected into a content-management hierarchy:

`Category → Base Species → Variant / strain`

Current deterministic scan:

- 486 catalog rows
- 276 Base Species groups
- 83 groups contain 2+ records and can become batch SEO candidates
- 293 records belong to those multi-member groups
- 223 records expose an explicit variant marker
- 28 exact duplicate records need review
- 5 Base Species groups contain category conflicts and are fail-closed for batch writes

Grouping uses the existing scientific name plus explicit `var.`, cultivar quotes and `wild type` markers. It does not alter `fishData.ts` or infer new Product Truth.

## Base Species inheritance (current branch)

SEO is no longer modeled as 486 independent copies. Multi-member groups use:

`Base Species SEO → Variant Override → Effective SEO`

- `species_seo_groups` stores shared Title/Description/H1 templates and shared editorial intro.
- `species_seo` stores Variant-specific overrides/differences; blank override means inherit Base.
- Batch selection creates Variant Draft shells only; it does not copy shared Base text into every Variant row.
- Category-conflict groups remain blocked from publish/bulk write until the source catalog is reviewed.
- The group migration has only been applied to the isolated local Supabase test environment; Production remains unchanged.

## Chinese → English content workflow (current branch)

The Admin now follows a locale-specific editorial model inspired by mature CMS/localization patterns without adding another CMS dependency:

- `zh-CN` is the editorial source; `en` is stored as a separate locale row, never as an overwrite of Chinese.
- Base Species and Variant inheritance both resolve independently per locale.
- `localized_name` is an English editorial display/common name and never changes Product Truth in `fishData.ts`.
- `/api/translate` creates an AI suggestion only. It requires the signed-in Supabase JWT and re-checks `user_roles.role = admin` server-side.
- Scientific names, catalog keys and `{{template_tokens}}` are protected; token loss rejects the suggestion.
- English translation saves as Draft only. English Published is intentionally locked until public URL, canonical and hreflang contracts are implemented and tested.
- Existing Published English rows, if any are introduced later, are not overwritten by the translation workflow.

For UI-only work, `npm run dev -w @aquaguide/admin-content` is sufficient. The serverless `/api/translate` route requires a Vercel runtime (`vercel dev` or a Vercel Preview) plus a server-only `AI_API_KEY` / `DEEPSEEK_API_KEY`. Never rename that secret to a `VITE_*` variable.

## Data review queue

The generated grouping layer now exposes the source-data problems found during deterministic catalog scanning:

- 5 Base Species groups have category conflicts. The Admin shows the conflicting category members and keeps bulk/publish actions fail-closed.
- 28 records are suspected exact duplicates. Duplicate sets and peer `catalog_key` values are displayed for review.
- The first record in a duplicate set is only a review candidate; the Admin does not delete, merge, rewrite Product Truth, or silently choose a canonical record.

## Public Species route and indexing proposal (current branch)

The Admin no longer treats `/species/<catalog_key>` as an existing canonical URL. AquaGuide currently has no standalone public Species SEO HTML pages. The branch defines a deterministic future contract instead:

- English: `/species/<base-scientific-slug>/<catalog-key>.html`
- Chinese: `/zh/species/<base-scientific-slug>/<catalog-key>.html`
- `x-default`: English
- New records: `noindex,follow` by default
- Optional review strategies: independent Index, canonical to a sibling Variant, or Noindex

Canonical paths are derived and cannot be freely typed. Category-conflict groups cannot become indexable, and suspected exact duplicates cannot be marked as independent Index before review. Base Species remains an inheritance layer rather than automatically becoming a public URL.

`PublicSpeciesPreview` shows the future page composition using editorial H1/intro plus read-only Product Truth from the current catalog. This is a preview only: the static Species HTML generator and sitemap are not implemented yet, so both Chinese and English Published states remain disabled.
