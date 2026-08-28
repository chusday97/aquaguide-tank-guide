# AquaGuide Content Admin V0

Isolated companion app for editing Species SEO content. It lives in the same monorepo but is not mounted into the public AquaGuide web app.

## Safety boundary

- Branch-only prototype: `feature/admin-content-v0`.
- Do not merge or deploy to production yet.
- Uses only `VITE_SUPABASE_URL` and the browser-safe publishable/anon key.
- Never expose a Supabase service-role key to this app.
- Admin authorization is enforced by the existing `user_roles` table and database RLS, not by hiding the URL.
- Admin migrations 001–005 are branch-only proposals. They have been exercised only in fresh isolated local Supabase environments; Production remains unchanged.

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
5. Edit SEO title, meta description, H1, intro, image alt, focus keyword and explicit Index/Canonical/Noindex strategy.
6. Preview Google appearance plus the future public Species-page composition.
7. Save localized SEO content by `catalog_key + locale` once the branch migration exists in the target environment.
8. Review Base/Variant revision history and restore an earlier revision as Draft.
9. Explicitly surface schema/history-not-ready states rather than silently failing.

Not included yet: image upload, Search Console, Production publishing, or wiring generated Species files into the public AquaGuide deployment.

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
- English translation saves as Draft only. Published remains locked even though URL/canonical/hreflang and generator tests now exist; staging publication validation is still required.
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

`PublicSpeciesPreview` shows the future page composition using editorial H1/intro plus read-only Product Truth from the current catalog.

## Static Species generator (current branch)

`npm run generate:public-species -w @aquaguide/admin-content -- --snapshot <file> --out-dir <dir>` converts an explicit publication snapshot into static bilingual Species HTML, `sitemap-species.xml` and a generation manifest. It is deliberately fail-closed:

- accepted snapshot environments: `local`, `test`, `preview`, `staging`; `production` is rejected;
- it never writes into the repository `public/` directory unless an explicit output directory points there;
- a Published Variant requires a same-locale Published Base Species row plus non-empty editorial title/meta/H1/intro; English additionally requires `localized_name`;
- category-conflict and suspected-duplicate Index rules are checked again at generation time instead of trusting browser state;
- a canonical sibling must be Published and independently indexed;
- sitemap includes only self-canonical `index,follow` pages.

`test:contract` runs the public-page generator regression. It verifies HTML language, title, meta description, H1, robots, canonical, hreflang/x-default and sitemap membership. A runtime test caught and fixed an English locale propagation bug before this milestone was considered valid.

The generator is not yet connected to a Production content export or public deploy. Both Chinese and English Published controls therefore remain disabled.

## Revision history / rollback (current branch)

Migration `202608280005_species_seo_revision_history.sql` adds database-backed history for Base Species and Variant SEO.

- INSERT / UPDATE / DELETE are recorded automatically in `content_revisions`.
- History is admin-readable through RLS; ordinary authenticated users see no revision rows.
- Restore uses the guarded `restore_species_seo_revision` RPC and re-checks `is_admin()`.
- A restore always creates a new Draft revision, clears `published_at`, and records the source revision; rollback cannot silently republish content.
- The Admin requires a second click to confirm restore, while database authorization remains the actual security boundary.
- Fresh isolated local Supabase verified Variant and Base `v1 Draft → v2 Published fixture → v3 rollback Draft`, non-admin history visibility `0`, non-admin rollback rejection, and zero final test residue.

The remaining release gate is a dedicated staging Supabase running migrations 001–005 plus snapshot → generator → rendered-page verification. Production Supabase and `main` remain untouched.
