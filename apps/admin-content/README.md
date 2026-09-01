# AquaGuide Species SEO Admin

Species editorial SEO workspace for AquaGuide. The current runtime is **GitHub Repo-backed** and does **not require Supabase** for Admin login, Draft persistence, revision history, staging publication, or the primary CI gate.

## Current authority — read this first

```text
AquaGuide Product Truth (repository catalog)
        +
Species SEO Admin
        ↓
HttpOnly server-side Admin session
        ↓
GitHub draft branch: seo-admin-drafts
content/species-seo/admin-store.json
        ↓
Editing → Ready for Review → Approved Draft
        ↓ explicit action only
content/species-seo/staging-snapshot.json
on feature/admin-content-v0
        ↓
Vercel Preview build
        ↓
static /species + /zh/species HTML + sitemap
        ↓
AquaGuide product CTA
```

The dedicated `seo-admin-drafts` branch is deployment-disabled in `vercel.json`. **Normal Save does not deploy.** Only an explicit Staging Publish writes a reviewed snapshot to the staging code branch and is intended to trigger one Preview rebuild.

## Safety boundary

- Work remains isolated on `feature/admin-content-v0`; do not merge to `main` or unlock Production Published without explicit later approval.
- Repo-backed Admin writes are coerced to `Draft`; a content/index/canonical edit invalidates `Approved` back to `Editing`.
- Production-style static generation remains `Published`-only and therefore ignores Repo Admin Drafts.
- Admin password/hash, session-signing secret and GitHub write token are **server-only**. Never expose them through `VITE_*`.
- Login uses an HttpOnly, SameSite server session; `/api/translate` reuses the same session.
- Product Truth (temperature, pH, tank size, difficulty, image asset, taxonomy) remains repository-owned/read-only from Species SEO Admin.
- Staging snapshots strip reviewer identity and private Data Review notes.
- Preview acceptance must retain deployment-level `X-Robots-Tag: noindex` even when page source contains intended future robots/canonical values for SEO inspection.

## Content storage

The 486 Species Product Truth catalog remains `src/data/fishData.ts`. Editorial SEO is stored separately in versioned JSON:

- Draft authority: `content/species-seo/admin-store.json` on `seo-admin-drafts`.
- Staging publication snapshot: `content/species-seo/staging-snapshot.json` on the non-production staging code branch.
- `catalog_key` remains the stable join key.
- `species_seo` stores localized Variant/page overrides.
- `species_seo_groups` stores Base Species shared templates/content.
- `species_data_reviews` stores human duplicate/category-review decisions without rewriting Product Truth.
- `content_revisions` keeps compact application revisions; Git commit history provides an additional durable audit trail.

## Server configuration

Use `apps/admin-content/repo-admin.server.env.example` as the placeholder-only reference. Required hosted values are server-only:

- `ADMIN_REPO_EMAIL`
- `ADMIN_REPO_PASSWORD_HASH` (preferred) or `ADMIN_REPO_PASSWORD`
- `ADMIN_REPO_SESSION_SECRET`
- `ADMIN_GITHUB_TOKEN` — fine-grained Contents write access only to this repository
- `ADMIN_GITHUB_REPO`
- `ADMIN_GITHUB_DRAFT_BRANCH=seo-admin-drafts`
- `ADMIN_GITHUB_STAGING_BRANCH=feature/admin-content-v0`

Do not reuse ChatGPT/GitHub connector credentials as application secrets.

## Local development

The Vite-only dev command renders the UI, but root `/api/*` serverless routes require a Vercel-compatible local runtime for real login/save behavior. For pure UI work:

```bash
npm install
npm run dev -w @aquaguide/admin-content
```

For the real Repo-backed API path, use the repository's Vercel development runtime or test through a protected Vercel Preview after server secrets are configured.

## Verification

Primary no-Supabase gates:

```bash
npm run test:contract -w @aquaguide/admin-content
npm run test:repo-backend -w @aquaguide/admin-content
npm run test:repo-api -w @aquaguide/admin-content
npm run build -w @aquaguide/admin-content
```

`test:repo-backend` proves H1 edit → approval invalidation → re-approval → Approved Draft staging snapshot → generated bilingual static HTML, while Production-style release generates zero pages from those Drafts. It explicitly reports `supabase_started=false`.

The primary GitHub `Admin Content CI Gate` no longer installs Supabase CLI/Docker or starts an ephemeral database. It validates Repo authority, static generation, root AquaGuide artifact integration, browser handoff, catalog parity and diff hygiene.

## Current V0 scope

1. Server-session Admin login.
2. Repository-derived 486-Species navigation grouped into Base Species / Variant.
3. Bilingual `zh-CN` / `en` editorial authoring and Base inheritance.
4. SEO title, meta description, H1, intro, image alt, focus keyword and explicit Index/Canonical/Noindex strategy.
5. Data Review, Editorial Review, Publish Readiness and revision rollback.
6. Bidirectional Editor ↔ live frontend Preview Inspector.
7. Suggestion-only Chinese → English AI translation protected by the same Admin session.
8. Explicit Staging Publish of a small reviewed Species set; normal Save does not deploy.
9. Static EN/ZH Species pages integrated into the AquaGuide root `dist/` with real product CTA handoff.

Production Published, Search Console release integration and mass publication remain out of scope.

## Legacy Supabase compatibility — not the current Species SEO runtime

The repository retains the earlier Species SEO Supabase migrations/exporter and `test:supabase-gate` as historical/compatibility evidence. Sections below that describe Supabase-specific milestones document how the earlier implementation was validated; they do **not** mean that a hosted AquaGuide Supabase staging project should now be provisioned. The 2026-09-01 Repo-backed decision supersedes that runtime/staging direction for Species SEO.

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

The generator is now connected to the AquaGuide root build through a guarded snapshot-only artifact step. A build without `SPECIES_SEO_SNAPSHOT_PATH` publishes no Species pages; a configured non-production build merges generated Species HTML + sitemap into root `dist/`. Production content export and Production Published controls remain disabled.

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
# Or build the AquaGuide root artifact directly from hosted staging DB:
npm run build:staging-from-db
```

The verifier does not reuse local or Production defaults. Configure these values only for a dedicated AquaGuide staging environment:

Template: `apps/admin-content/staging-publish.env.example` (contains placeholders only; never commit a real secret).

- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_SECRET_KEY` (server-only; prefer `sb_secret_...`)
- `STAGING_SUPABASE_PROJECT_REF`
- `PRODUCTION_SUPABASE_PROJECT_REF` (deny-list only)
- `STAGING_PUBLIC_SITE_URL`
- `PRODUCTION_PUBLIC_SITE_URL` (deny-list only)
- optional `STAGING_SOURCE_LABEL`
- `STAGING_CATALOG_KEYS` — required comma-separated allowlist, max 20 Species

`verify:staging-publish` performs:

1. explicit staging-vs-Production Supabase identity validation;
2. Explicitly allowlisted Approved Draft Base/Variant snapshot export through a server-only Supabase secret/service-role key;
3. static Species HTML + sitemap generation with an explicit non-production canonical host;
4. temporary local HTTP serving of the generated output;
5. HTTP fetch and assertions for one bilingual self-canonical Index pair plus sitemap membership.

The command fails if the explicit allowlist has no eligible bilingual Approved Draft Index pair. It also fails if the staging DB/project ref or public host matches Production. Hosted acceptance must additionally verify the deployment response carries a crawler-level `X-Robots-Tag: noindex` (the current protected Vercel Preview does); source HTML intentionally preserves intended per-route robots/canonical values for SEO review.

As of 2026-08-28, the connected Supabase account has the AquaGuide project and an unrelated IceGlide staging project, but no AquaGuide development branch. Do not reuse the IceGlide environment. Creating an AquaGuide Supabase branch/project may incur cost and requires explicit approval before provisioning.

The generator itself also requires `--site-url`; it no longer defaults to the Production canonical domain for preview/staging snapshots.

### Staging schema readiness probe

Migration 006 introduced `species_seo_release_gate_status()`; migration 007 added Editorial Review/Data Review readiness. Migration 008 upgrades the probe to `schema_version=8`, verifies explicit `service_role` Data API grants for the release exporter, and confirms the Data Review resolution RPC is no longer executable by anon/authenticated. The probe still exposes only capability booleans, not revision rows or editorial content.

The staging exporter calls this probe before exporting rows. It blocks unless schema v8 is present and only exports explicitly allowlisted rows with `status=draft`, `review_state=approved` and non-null `reviewed_at`. This is intentionally separate from Production Published. The exporter uses a server-only secret/service-role key; publishable/anon keys are refused. Browser clients may still call the data-free readiness probe, but Data Review release inputs are server-only.

For staging generation, `PRODUCTION_PUBLIC_SITE_URL` is also mandatory. Direct staging generator calls must pass `productionSiteUrl` / `--production-site-url`; the staging verifier supplies it automatically from the environment deny-list.

## Stable A+B development gate (2026-08-28)

AquaGuide Admin now uses two complementary environments instead of paying for a persistent Supabase development branch by default:

- **B / local:** Mac + pinned Supabase CLI for fast development and debugging.
- **A / CI:** GitHub Actions + an ephemeral Supabase database for reproducible clean-run validation.

Both environments execute the same command:

```bash
npm run test:supabase-gate -w @aquaguide/admin-content
```

The gate pins Node `24.14.0` and Supabase CLI `2.115.0`, loads only core schema + Admin migrations `001–008`, verifies Auth/RLS and rollback behavior, creates one bilingual Published fixture, then generates and checks EN/ZH static Species pages. The temporary database is destroyed after each run.

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
- accepts Approved Draft in controlled Preview; Production-style `release` remains Published-only; hosted `staging_release` accepts only explicitly allowlisted Approved Drafts;
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

### Unsaved edit safety
The editor streams unsaved Base/Variant changes into Live Preview, but marks them as `Unsaved changes / 未保存修改` until a successful database save. Resource/scope/content-locale navigation requires discard confirmation while dirty, and browser refresh/close is protected with `beforeunload`. Re-selecting the current resource is intentionally a no-op so it cannot mask unsaved edits.

## Frontend SEO publication pipeline

This Admin is the editorial and review layer for static AquaGuide Species SEO pages. Product Truth remains in the AquaGuide catalog; the Admin owns localized editorial SEO such as title, meta description, H1, intro, image alt, localized common name and index strategy. Base Species supplies shared templates/content and Variants inherit unless an explicit override exists.

The intended publication flow is:

`Catalog Product Truth + reviewed Base/Variant SEO → Publish Readiness → explicit publication snapshot → generate-public-species.mjs → AquaGuide frontend static artifact`

Controlled Preview is deliberately separate: it may render approved Draft content but is forced noindex/nofollow and must never be promoted as the Production publication source. Production Published remains locked.

The first frontend integration should publish only a small reviewed staging set and verify the resulting HTML source: `<title>`, meta description, `<h1>`, canonical, robots, reciprocal hreflang, image alt and sitemap membership. Do not mass-publish all catalog rows merely because generation succeeds.

Species SEO pages should eventually connect organic acquisition to AquaGuide product value. CTA/navigation contracts should preserve the current `catalog_key` when sending a visitor into compatibility, recommendation or related product journeys.

### Product Truth loading correctness
Product Truth is lazy-loaded to keep grouped navigation data lightweight. The catalog is emitted as a separate JSON build asset and fetched on demand so transient network failures can be retried without reloading the Admin. Loading is explicit (`Loading… / 加载中…`); transport failure is explicit (`Unavailable / 数据不可用`); `—` is reserved for a genuinely empty field after Product Truth is available. Product Truth rows are applied only when their `catalog_key` matches the active Species, preventing stale facts/images during navigation.

### AquaGuide Admin authority and deployment
The three-pane app is the only Species Editorial SEO authority. In the root AquaGuide application, `/admin/content` is an Admin Hub and legacy Product Truth/Care editing is isolated at `/admin/product-content`.

The root `npm run build` also builds this app with base `/admin/seo/` into `dist/admin/seo/`, so the SEO Admin ships in the same AquaGuide deployment artifact without injecting its CSS/runtime into the main SPA. This authority split must remain intact: Product Truth fields belong to Product/Care content, while Title/Meta/H1/Intro/Image Alt/index/canonical/editorial review belong here.
