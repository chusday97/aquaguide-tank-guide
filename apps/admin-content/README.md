# AquaGuide Content Admin V0

Isolated companion app for editing Species SEO content. It lives in the same monorepo but is not mounted into the public AquaGuide web app.

## Safety boundary

- Branch-only prototype: `feature/admin-content-v0`.
- Do not merge or deploy to production yet.
- Uses only `VITE_SUPABASE_URL` and the browser-safe publishable/anon key.
- Never expose a Supabase service-role key to this app.
- Admin authorization is enforced by the existing `user_roles` table and database RLS, not by hiding the URL.
- Admin migrations 001–007 are branch-only proposals. They have been exercised only in fresh isolated local Supabase environments; Production remains unchanged.

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

`LiveFrontendPreview` is now the primary editor preview: the center editor streams unsaved Variant changes to a persistent right pane with Page / Google / Mobile modes. Product Truth remains read-only. `PublicSpeciesPreview` is retained only as an older route-contract evidence component, not the main workspace surface.

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

The A+B database/public-page gate is now proven locally and on GitHub Actions. The remaining product gate is publish-readiness + human data-review decisions + controlled non-production Preview Publish. A persistent paid staging branch is optional. Production Supabase and `main` remain untouched.

## Staging release gate

Persistent staging is optional, not the primary gate. A+B now proves the database/public-page chain on ephemeral Supabase; the following staging-only commands remain available when a persistent remote environment is operationally useful:

```bash
npm run export:staging-snapshot -w @aquaguide/admin-content -- --out /tmp/species-staging.json
npm run verify:staging-publish -w @aquaguide/admin-content
```

The verifier does not reuse local or Production defaults. Configure these values only for a dedicated AquaGuide staging environment:

- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_PUBLISHABLE_KEY`
- `STAGING_SUPABASE_PROJECT_REF`
- `PRODUCTION_SUPABASE_PROJECT_REF` (deny-list only)
- `STAGING_PUBLIC_SITE_URL`
- `PRODUCTION_PUBLIC_SITE_URL` (deny-list only)
- optional `STAGING_SOURCE_LABEL`

`verify:staging-publish` performs:

1. explicit staging-vs-Production Supabase identity validation;
2. Published Base/Variant snapshot export through RLS using the publishable client key;
3. static Species HTML + sitemap generation with an explicit non-production canonical host;
4. temporary local HTTP serving of the generated output;
5. HTTP fetch and assertions for one bilingual self-canonical Index pair plus sitemap membership.

The command fails if staging has no eligible bilingual Index pair. It also fails if the staging DB/project ref or public host matches Production.

As of 2026-08-28, the connected Supabase account has the AquaGuide project and an unrelated IceGlide staging project, but no AquaGuide development branch. Do not reuse the IceGlide environment. Creating an AquaGuide Supabase branch/project may incur cost and requires explicit approval before provisioning.

The generator itself also requires `--site-url`; it no longer defaults to the Production canonical domain for preview/staging snapshots.

### Staging schema readiness probe

Migration 006 introduced `species_seo_release_gate_status()`; migration 007 upgrades it to `schema_version=7` and adds readiness flags for Editorial Review, Data Review and the safe review-resolution RPC. The probe still exposes only capability booleans, not revision rows or editorial content.

The staging exporter calls this probe before exporting Published rows. It blocks if the probe is missing, reports a schema version below 7, or any required capability is false. Fresh local verification confirmed that anon publishable access can call the probe while direct `content_revisions` reads remain denied.

For staging generation, `PRODUCTION_PUBLIC_SITE_URL` is also mandatory. Direct staging generator calls must pass `productionSiteUrl` / `--production-site-url`; the staging verifier supplies it automatically from the environment deny-list.

## Stable A+B development gate (2026-08-28)

AquaGuide Admin now uses two complementary environments instead of paying for a persistent Supabase development branch by default:

- **B / local:** Mac + pinned Supabase CLI for fast development and debugging.
- **A / CI:** GitHub Actions + an ephemeral Supabase database for reproducible clean-run validation.

Both environments execute the same command:

```bash
npm run test:supabase-gate -w @aquaguide/admin-content
```

The gate pins Node `24.14.0` and Supabase CLI `2.115.0`, loads only core schema + Admin migrations `001–007`, verifies Auth/RLS and rollback behavior, creates one bilingual Published fixture, then generates and checks EN/ZH static Species pages. The temporary database is destroyed after each run.

GitHub CI has repository read-only permission and receives no Production Supabase/Vercel deployment credentials. It does not commit, deploy, migrate Production, or unlock Published automatically.

## Current product milestone: publish readiness implemented locally

Migration 007 and the current Admin UI now implement the readiness layer:

- Base + Variant review states: `Editing / Ready for Review / Approved`;
- approval is invalidated by later editorial/index changes at the database trigger layer;
- rollback restores Draft + Editing;
- Data Review decisions persist separately from Product Truth;
- duplicate/category decisions feed Index eligibility and static generation;
- all 276 Base Species, including single-member groups, have a Base authoring/review surface;
- generator requires Approved Base + Variant and safe review resolutions.

The B/local gate is green through schema version 7. The immediate next gate is the GitHub A-layer clean run through migration 007, followed by Controlled non-Production Preview Publish. `publish-ready` still never means automatic Production deployment.


## Controlled Preview Publish

Publish-ready content can be exported from the Admin as a minimal JSON Preview Snapshot. The snapshot includes the selected Species, its available locale rows/Base rows and only minimal Data Review resolutions; reviewer identity and review notes are omitted.

Generate a local static preview with:

```bash
npm run generate:preview-publish -w @aquaguide/admin-content -- \
  --snapshot /path/to/sp_xxxx-preview-snapshot.json \
  --site-url http://127.0.0.1:4020 \
  --production-site-url https://aqua-tank-guide.vercel.app
```

The default output is ignored `.preview-output/`. Preview mode is intentionally safer than release mode:

- requires `environment=preview` + `delivery_mode=controlled_preview`;
- requires explicit selected catalog keys;
- accepts Approved Draft, while release/staging remains Published-only;
- forces every rendered page to `noindex,nofollow`;
- writes `robots.txt` with `Disallow: /`;
- does not emit the release `sitemap-species.xml`;
- refuses repository/Admin `public/` and Admin `dist/` output;
- refuses Production canonical hosts.

`npm run test:preview-publish -w @aquaguide/admin-content` is part of `test:contract`. Local reference output was verified in Chromium at `http://localhost:4020/` with zero page errors.


## Content Studio visual integration (2026-08-30)

The Admin workspace follows one persistent interaction model: **left = choose content, center = edit, right = live frontend result**. The separate `aqua-fronted-cms` AI Studio repository is a visual reference only; its mock data model, fake preview URLs, delete behavior and client-side readiness logic must not be imported as authority.

The left pane is Category → Base Species → Variant. Selecting a Base Species opens shared template/content authoring; selecting a Variant opens that page's overrides. Data Review, readiness details, translation, batch operations and revision history remain available through secondary disclosures rather than permanently occupying the main editor.

The live preview loads read-only image/water/tank/difficulty/description fields from the existing catalog projection on demand. Species Group JSON remains focused on hierarchy and review metadata, so Product Truth is not duplicated into the main bundle.

## Global interface language

The Admin has two independent language concepts:

- `appLocale`: Admin UI language (`zh-CN` / `en`), persisted in localStorage as `aquaguide-admin-app-locale`.
- `contentLocale`: the Species editorial language currently being edited and rendered in the live frontend preview.

Switching the global interface language does not switch or rewrite content. This allows, for example, an English Admin interface while reviewing Chinese Species content. The right preview follows `contentLocale`, not `appLocale`.

Product Truth used by the live preview is lazy-loaded from `catalog.generated.json` through `productTruthLoader.js`; it must not be duplicated into the Species grouping projection.

## Workflow state colors and Preview Inspector roadmap

Top workflow filters use restrained semantic colors: Data Review = amber, Awaiting Review = blue, Preview-ready = green. The color is a navigation/status aid only; database review/readiness state remains authoritative.

The next interaction milestone is a bidirectional Editor ↔ Preview Inspector. It will use an explicit element registry rather than arbitrary DOM editing. Center-field focus/edit selects and highlights the matching frontend element; clicking an inspectable preview element locates/highlights the corresponding center field. SEO Title and Meta Description map to Google Preview; page fields map to Page Preview.

Inspector selections also expose content authority: Custom, Inherited from Base, or Product Truth · Read only. Product Truth facts can be inspected for context but cannot be mutated from Content Admin.
## Bidirectional Preview Inspector

The center editor and right live preview share stable element keys through `editorElementRegistry.js`. The first mapped editorial elements are localized name, H1, intro, image alt, SEO title and meta description.

Focusing a center field selects and scrolls the matching preview element. SEO title/meta description automatically use Google Preview. Clicking a preview element selects and scrolls the mapped center field without forcing input focus. The selection status explains the element source and edit path.

Product Truth facts such as temperature, pH, tank size, difficulty and scientific name are inspectable but read-only. Base/Variant routing is source-aware so the UI does not highlight a field that cannot affect the selected page.
## Inherited Variant fields

Variant Meta Title, Meta Description and H1 use progressive inheritance controls. An inherited field shows the resolved Base value and an explicit Override action instead of a blank input. Choosing Override reveals the Variant input. `Use Base value` clears the Variant override and returns to normal resolver-based inheritance; Base content is never copied into the Variant row.

## Secondary tool drawers

Data Review, Publish Readiness, Translation, Batch SEO, Revision History and Workflow use `EditorToolDrawer`. The drawer overlays only the center editor grid cell; the live frontend Preview remains visible and interactive in the right column. Close with the explicit close control, Escape, or the editor-cell backdrop. Selecting an editable Preview Inspector element dismisses the drawer and returns to the mapped editor field.

Species SEO authoring exposes only `draft` and `published` lifecycle choices; `published` remains disabled until Production integration is explicitly approved. Do not expose the shared legacy enum value `archived` in this Admin.

## Generator-aligned Page Preview

The Page tab mirrors the static Species publication structure rather than maintaining an independent mock layout. `speciesPagePresentation.js` is shared by `LiveFrontendPreview` and `generate-public-species.mjs` for publication-facing labels and tank-size localization. Do not add Page Preview sections that are absent from the generator.

At widths below 1180px the persistent third column is replaced by an explicit compact Preview overlay so the editor is not squeezed and Preview access is not lost. Editor Inspector selection opens the compact Preview; selecting an editable element in the overlay returns to the mapped editor field.

### Primary editor density and Inspector ownership
- The common authoring path keeps Meta Title / Meta Description / H1 / Variant intro / Image Alt visible. Focus Keyword, index strategy, canonical target and derived URLs are in Advanced SEO.
- Advanced SEO is collapsed by default and automatically opens when an active index/canonical blocker exists.
- Base shared intro is collapsed in Variant editing; use Base authoring for shared copy.
- Preview-origin Inspector selection follows content ownership: inherited → Base Species, Variant-only/custom → Current page, Product Truth → read-only. Editor-origin selection only highlights Preview.

### Visual selection contract
The Admin uses one shared selection token family across Species navigation, editor Inspector and live Preview. Product Truth Inspector targets use a separate read-only graphite tone. Active Variant navigation keeps parent Base context visible without turning the Base row into a second active selection.
