# Execution Log

## 2026-08-28 — Admin Content V0 baseline

- Isolated branch: `feature/admin-content-v0`.
- Added standalone `apps/admin-content` Vite app.
- Verified independent build, Supabase Auth guard, `user_roles` admin check and RLS boundary.
- Local isolated Supabase test proved Admin Draft save succeeds and non-admin Draft read/write is denied.
- Remote Vercel `admin-content` project established as read-only Review environment.
- No `main` merge and no Production Supabase write.

## 2026-08-28 — Catalog authority correction

- Confirmed current public product reads 486 records from `src/data/fishData.ts`; connected Supabase `species` table is currently empty.
- Admin therefore reads a generated lightweight repository catalog and stores only editorial SEO in `species_seo`.
- Stable `catalog_key` remains the join key between Product Truth and editorial SEO.

## 2026-08-28 — Base Species / Variant milestone

- Added `generate-species-groups.mjs` and generated `species-groups.generated.json`.
- Measured 486 records → 276 Base Species groups; 83 multi-member batch groups; 223 explicit variants.
- Detected 28 exact duplicate records and 5 category-conflict groups for manual review.
- Added grouped/category navigation, variant checkboxes and same-group batch SEO template editor.
- Batch templates are Draft-only, Review-safe, Product-Truth isolated, and blocked on category conflicts / Published rows.
- Added contract assertions so flattening back to the empty Supabase `species` table or unsafe bulk writes fail tests.

## 2026-08-28 grouped UI verification
- Added root `PROGRESS.md` / `HANDOFF.md` pointers to the `.ai/` execution records.
- Verified 3011 read-only Review with real headless Chrome/CDP; 276 groups, 293 Variant rows, 5 conflict badges, no Vite overlay.
- Verified `Neocaridina davidi` two-member bulk template preview and disabled Review save.
- Verified `Pterophyllum scalare` category-conflict warning blocks bulk save.
- Verified 1440×900 desktop grid has no document horizontal overflow.
- Fixed batch checkbox selection to align the single-item editor with the last selected member.
- Removed runtime timestamp from generated grouping JSON; repeated generation now produces an identical SHA-256 hash.

## 2026-08-28 grouping milestone push
- Functional milestone committed as `746bce0 feat(admin): group species variants for bulk SEO`.
- Pushed successfully to `origin/feature/admin-content-v0`; `main` remains untouched.
- Vercel `admin-content` detected commit `746bce0` on the intended branch; deployment is currently queued on Hobby capacity, not yet verified READY.
- Deployment-side caveat: other repository branches without `apps/admin-content` can fail before Ignore Build runs because the configured Root Directory is absent. This is external deployment noise, not an Admin runtime failure.

## 2026-08-28 Base Species inheritance milestone
- Added `species_seo_groups` branch migration with admin-only write RLS and published/admin read policy.
- Added Base Species shared SEO editor and read-time inheritance resolver.
- Variant SEO fields are now explicit Overrides; clearing Title Override restores Base inheritance.
- Batch workflow now creates Draft shells only and previews effective inherited SEO instead of copying template text.
- Real Chrome Review verification: Base template edits propagate immediately to 极火虾 / 黄金米虾 previews; shared intro propagates; Variant Override remains isolated.
- Isolated local Supabase verification: admin Draft insert succeeds; non-admin Draft read returns 0 and non-admin insert is rejected by RLS; test rows cleaned up.

## 2026-08-28 bilingual SEO + review milestone
- GitHub research: Payload localization informed locale-specific content/status; Tolgee informed context-aware machine/AI suggestions with review before acceptance.
- Reused AquaGuide's existing OpenAI-compatible / DeepSeek server pattern instead of introducing a new translation SaaS/runtime dependency.
- Added `zh-CN` / `en` content switching, composite locale keys and `localized_name` editorial field.
- Added admin-authenticated `/api/translate`, English suggestion review panel and Draft-only acceptance flow.
- Added token-preservation validation and no-auto-overwrite rule for Published English.
- Completed source-data review queue with concrete category-conflict and duplicate-set evidence.
- Applied `202608280003_species_seo_localized_name.sql` only to isolated local Supabase; bilingual rows coexist and non-admin Draft read remains denied.
- Real Chrome Review verified English workspace, `Pterophyllum scalare` conflict evidence and `Neocaridina davidi` duplicate evidence.

## 2026-08-28 — Species route, index strategy and page-effect preview
- Audited existing `public/problems` + `public/zh/problems` SEO pages and reused their English-default + `/zh/` hreflang pattern.
- Confirmed there are currently no independent public Species SEO HTML pages; existing `/encyclopedia?species=...` is an application deep link, not the new canonical contract.
- Added `seoRouteContract.js`, `index_strategy`, `canonical_catalog_key` and derived canonical paths.
- Extended the lightweight Admin catalog with read-only temperature/pH/tank-size/difficulty/description fields only for page preview.
- Added `PublicSpeciesPreview` so editors see H1/intro and existing Product Truth in a future public-page layout instead of relying on a generated image.
- Contract/build/diff checks passed; real Chrome verified URL/canonical/hreflang/noindex and disabled Published state.
- Recreated a fresh isolated local Supabase at `/tmp/aquaguide-admin-seo-test`; core + Admin migrations 001–004 applied successfully.
- RLS proof: admin saved canonical strategy; non-admin saw 0 Draft rows and INSERT was rejected; test rows cleaned up.

## 2026-08-28 — Fail-closed Species generator + revision history milestone
- Verified prior pushed route milestone `43eec47` on Vercel `admin-content`: deployment READY, HTTP 200, page and response remain noindex.
- Added `generate-public-species.mjs`: explicit non-production snapshot → deterministic bilingual static HTML + `sitemap-species.xml` + manifest. Production snapshots are rejected and output directory is always explicit.
- Added runtime generator regression and wired it into `test:contract`; fixture generates 4 pages with 2 self-canonical sitemap candidates and verifies title/meta/H1/robots/canonical/hreflang/x-default/sitemap behavior.
- First runtime pass caught a real locale defect: English file path rendered Chinese `<html lang>` and labels because locale was not forwarded to `renderPage`; fixed before milestone completion.
- Added migration 005 `content_revisions`, Base/Variant revision triggers and admin-only rollback RPC. Rollback always forces Draft, clears `published_at`, and records a `rollback` revision with source revision ID.
- Added Base/Variant History UI with two-click restore confirmation; read-only Vercel Review never queries real revision history.
- Fresh isolated local Supabase applied core + migrations 001–005. Variant proof: v1 Draft → v2 Published fixture → v3 rollback Draft. Base Species passed the same sequence.
- Non-admin history query returned 0; non-admin rollback RPC raised `Admin role required`; cleanup ended with 0 SEO/group/revision test rows.
- Read-only Chrome Review on temporary port 3099 showed both History panels, public Species preview and both disabled Published options with zero page errors. Temporary Vite/Supabase test environments were stopped after validation.
- `test:contract` and production Admin build pass; only the known >500KB bundle warning remains.
- Production Supabase and `main` were not modified. Published remains locked pending staging end-to-end publication validation.

## 2026-08-28 — Generator/history push and staging gate follow-up
- Re-ran Admin contract/build/diff checks and committed generator + revision history as `cd363b4 feat(admin): add species publishing safety and revision history`.
- Pushed `cd363b4` to `origin/feature/admin-content-v0`; `main` and Production Supabase remain untouched.
- Vercel Git Integration did not create a new deployment immediately. Manual Preview deploy from the linked `admin-content` project was rejected by Hobby `api-deployments-free-per-day` (>100/day); no Production deploy was attempted.
- Supabase project inventory confirmed there is no AquaGuide staging project or development branch. `ice-glide-staging-sg` is unrelated and was not used.
- Auditing the next staging step found that the generator still defaulted to the Production canonical host when `siteUrl` was omitted; removed that fallback and added a Production-host denial test.
- Added staging-only Published snapshot export using the Supabase publishable-key client plus explicit staging/Production project-ref guards.
- Added end-to-end staging verifier: export → generator → local HTTP serving → EN/ZH rendered response + sitemap checks.
- `verify:staging-publish` intentionally fails non-zero when staging DB/site configuration is absent; there is no local/Production fallback.

## 2026-08-28 — Release-gate schema probe hardening
- Found that content/page verification alone could not prove the staging database had revision/rollback schema applied when using only a publishable client key.
- Added migration 006 `species_seo_release_gate_status()` as a data-free readiness probe. It reports only schema-version/feature booleans and grants execute to anon/authenticated; it does not expose revisions or SEO content.
- At the migration-006 milestone, staging snapshot export began refusing schema versions below 6 or any missing feature flag; migration 007 later raised the current minimum to schema version 7.
- Fresh temporary Supabase applied core + migrations 001–006 from scratch. Publishable anon successfully received all readiness flags=true while direct `content_revisions` SELECT remained `permission denied`.
- Generator staging mode now also requires an explicit Production public URL deny-list, so direct generator use cannot silently target another Production alias through the staging path.
- Temporary Supabase stack was stopped and removed after verification; Production remained untouched.

## 2026-08-28 — A+B CI gate implementation
- Added `.github/workflows/admin-content-ci-gate.yml` scoped to Admin/catalog/SEO migration paths and the isolated feature branch.
- Pinned immutable action SHAs plus Node 24.14.0 and Supabase CLI 2.115.0; workflow uses Ubuntu 24.04 and repository read-only permissions.
- Added shared `test:supabase-gate` used by both local macOS and GitHub Actions.
- First local run exposed missing temporary `migrations/` creation; fixed before push.
- Second local run exposed that service_role lacked `user_roles UPDATE`; test setup was corrected to use only ephemeral PostgreSQL admin fixture preparation instead of widening service-role privileges.
- Final local shared gate PASS: migrations 001–006, readiness probe, admin/non-admin RLS, Base/Variant rollback, anonymous Published reads, DB→2 bilingual static pages, canonical/hreflang/sitemap.
- No Production secret, Production database write, main merge, automatic Git commit or automatic deploy is part of this workflow.

## 2026-08-28 — First GitHub A-layer clean run
- Pushed A+B workflow as `2d85a4e ci(admin): add pinned ephemeral Supabase gate`, preserving concurrent Figma handoff commit `bc1fd3f` via safe rebase; no force push.
- GitHub Actions run `33146619043` started on Ubuntu 24.04 with Node 24.14.0, Supabase CLI 2.115.0 and read-only repository permissions.
- First clean run failed before database tests at `npm ci`: root `package-lock.json` did not yet contain `@aquaguide/admin-content` workspace metadata.
- The failure was reproduced/fixed locally by updating lockfile with npm 11.9.0; no dependency upgrade was introduced.
- Clean local `npm ci --no-audit --no-fund` then passed contract, ephemeral Supabase gate and Admin build.
- Clean install also removed local node_modules drift: Vite returned from untracked 6.4.3 to lockfile-resolved 6.4.2 with all tests still green.

## 2026-08-28 — A+B gate proven green
- Commit `ef2f6ae ci(admin): fix clean workspace install gate` aligned root lockfile workspace metadata without downgrading resolved `date-fns` (still 4.1.0).
- GitHub Actions run `33147127271` completed SUCCESS on Ubuntu 24.04.
- Every gate step passed: pinned Node 24.14.0, Supabase CLI 2.115.0, clean npm install, Admin contract, ephemeral Supabase gate, build, generated catalog parity and diff hygiene.
- A+B is now an executed stability protocol, not a proposal. Paid persistent Supabase staging remains optional.

## 2026-08-28 — Post A+B planning sync
- Rebased project planning from infrastructure setup to product completion after GitHub Actions run `33147127271` passed end-to-end.
- Updated CURRENT_GOAL / TASK_QUEUE / LIVE_STATUS and corrected stale HANDOFF / PROGRESS references that still treated paid dedicated staging as mandatory.
- Next implementation order is publish-readiness → persisted data-review decisions → controlled Preview Publish → real translation suggestion smoke test.
- No product code, Production Supabase, Vercel Production or `main` changed in this planning sync.


## 2026-08-28 — Publish readiness + actionable Data Review implementation
- Added branch migration 007 with Base/Variant editorial review state, persisted `species_data_reviews`, admin-only RLS and a minimal public review-resolution RPC.
- Added `PublishReadinessPanel` and deterministic readiness assessment covering Base/Variant existence, content completeness, editorial approval, bilingual counterpart, index/canonical rules and Data Review decisions.
- Changed Data Review from evidence-only cards to persisted human decisions for category conflict / duplicate sets; Review mode remains write-disabled.
- Extended Base editor to all 276 groups so single-member Species can satisfy the same Base publication contract.
- Added DB trigger invalidation: any content/index change after Approved forces Editing and clears reviewer metadata.
- Extended rollback RPC through migration 007 so restored rows return Draft + Editing.
- Extended generator and staging snapshot to require Approved content and consume only safe review resolutions.
- First DB run found a PostgreSQL trigger bug caused by cross-table OLD-field access; fixed by branching on `TG_TABLE_NAME`.
- Real Chrome found a runtime `groupMember is not defined` missed by build; fixed and rerun across duplicate/conflict/singleton paths with zero page errors.
- Fresh B-layer Supabase gate passed schema v7, Data Review RLS, approval invalidation, rollback and DB→EN/ZH generation.


## 2026-08-28 — Controlled Preview Publish milestone
- Verified `3669146` on GitHub Actions run `33149941551`: clean Ubuntu A-layer passed install, contract, migration 001–007 ephemeral Supabase gate, build, generated catalog parity and diff hygiene.
- Extended the existing static generator with explicit `release` vs `preview` eligibility without changing release/staging Published semantics.
- Added `build-controlled-preview.mjs`: requires `environment=preview`, `delivery_mode=controlled_preview`, explicit selected catalog keys and a non-Production host.
- Preview output is defense-in-depth noindex: page meta `noindex,nofollow`, visible PREVIEW ONLY banner, root `robots.txt` Disallow-all, no release sitemap.
- Added Preview output-dir deny-list for repository public, Admin public and Admin dist. First test exposed the missing Admin-public deny-list; fixed before completion.
- Added `buildControlledPreviewSnapshot` + Admin export action; exported snapshot strips `reviewed_by` and Data Review `notes`.
- Added permanent `test:preview-publish` to `test:contract`.
- B-layer regression confirms release fixture still generates 2 real indexable pages + sitemap after Preview mode was added.
- Generated a local Approved-Draft two-language preview and served it on `127.0.0.1:4020`; HTTP root/EN/ZH = 200. Chromium clicked the English page and verified H1, forced noindex, PREVIEW banner and `pageErrors=[]`.

## 2026-08-30 — AI Studio visual integration pass 1
- Located the AI Studio source in separate private repo `chusday97/aqua-fronted-cms` and verified it contains React/Vite components rather than the earlier README-only state.
- Audited the source and rejected mock business behavior: random preview token generation, fake preview domains, in-memory delete, client-side Data Review resolution and client-side readiness authority.
- First closed the pre-existing Workflow Overview work as `374db2f feat(admin): add workflow overview filters`; real Chrome verifies 33 pending issues filter to 32 Base groups and clearing restores all 276.
- Reworked the real Admin into a three-pane desktop workspace while preserving existing callbacks/state: 270px contextual Species navigation, flexible center editor, 460px live frontend preview.
- Added Base-parent / Variant-child navigation and moved language switching into the editor context instead of duplicating it in the global header.
- Moved Data Review, readiness details, translation, batch operations, revision history and queue overview behind progressive disclosure.
- Added `LiveFrontendPreview`: Page / Google / Mobile modes; unsaved Variant H1/title/meta/intro resolve through the existing inheritance logic and update the right pane without saving.
- Browser validation at 1600×1000 measured 270/870/460 panes, confirmed live H1 updates, Base editor switching, 33→32 issue filtering and zero page errors.
- Browser validation also found grouped Species had lost image/Product Truth fields. Extended deterministic group projection with image, temperature, pH, tank size, difficulty and product description; preview image now loads and facts render from catalog.
- Full local Supabase gate remains PASS after UI changes: schema v7, RLS/rollback and DB→2 bilingual indexable static pages unchanged.

## 2026-08-31 — AI Studio visual integration + global language layer
- Preserved `374db2f` workflow overview filters as a rollback baseline before UI integration.
- Imported only layout/visual concepts from `chusday97/aqua-fronted-cms`; rejected its mock Preview URLs/tokens, client-side Data Review decisions, deletion flows and Readiness authority.
- Reworked Admin into Species hierarchy / editor / live frontend preview; unsaved H1 changes update the right page immediately.
- Added `AppLanguageProvider` with persisted Chinese/English interface locale and independent `contentLocale`.
- Local browser proof: English Admin UI with Chinese content remained intact after reload, Product Truth image/facts loaded, and `pageErrors=[]`.
- Initial Product Truth duplication inflated the main bundle to ~921KB; replaced with dynamic catalog loading, returning the main bundle to ~748KB plus a lazy catalog chunk.

## 2026-08-31 — Workflow state colors + Inspector planning sync
- Added distinct semantic topbar workflow styling: Data Review amber, Awaiting Review blue, Preview-ready green; active filters use matching soft backgrounds/borders.
- Production Admin build remains green; Chromium computed styles confirm the three states are visually distinct.
- Synchronized project docs around the next P0 milestone: bidirectional center-editor ↔ right-preview element inspection/highlighting with explicit editable/read-only mappings.
## 2026-08-31 — Bidirectional Preview Inspector implementation
- Added six editable mappings plus scientific name / temperature / pH / tank size / difficulty read-only mappings.
- Chromium proof: center H1 → Page selection; Meta Description → Google selection; right Intro → center highlight; Product Truth temperature → zero editor selections.
- Base proof: inherited H1 stays Base and highlights the H1 template; Hero Image routes to Current page / Image Alt.
- Hover element labels, selected outline, source state and edit path all render with `pageErrors=[]`.
- Admin contract/build and local schema-v7 Supabase gate pass after the interaction change.
## 2026-08-31 — Variant inheritance UI refinement
- Replaced always-visible blank inputs for Meta Title / Meta Description / H1 with inherited-value disclosures.
- Added Override and Use Base value flows while preserving live Preview updates and resolver authority.
- Browser proof: inherited H1 → Override focus → custom live H1 → Use Base value → inherited H1 restored; Google mode switches on SEO Title Override; `pageErrors=[]`.
- Contract/build/schema-v7 Supabase gate all pass after the change.

## 2026-08-31 — Tool drawer convergence
- Added `EditorToolDrawer` and moved Data Review, Readiness, Translation, Batch SEO, History and Workflow out of inline disclosures.
- Added grid-cell-only overlay CSS and semantic launcher rows; Chromium confirms 560px drawer stays inside the 870px editor while the 460px Preview remains visible.
- Verified Escape / close / backdrop dismissal, Workflow filter handoff, English Translation drawer, and Inspector-to-editor return.
- Removed Archived from Variant/Base Species status controls; Draft is writable and Published remains locked.
- Contract/build PASS; local ephemeral Supabase gate PASS at schema_version=7.

## 2026-08-31 — Generator-aligned Preview + responsive fallback
- Extracted shared Species page labels / tank-size localization into `speciesPagePresentation.js`; generator tests remain green.
- Rebuilt Page Preview to match generator output and removed non-published mock sections.
- Moved the three-column cutoff to 1180px after Chromium proved 1120/1080 clipped the old 400px Preview column.
- Added compact Preview state/trigger for narrow layouts and source-aware Inspector handoff between editor and overlay Preview.
- Chromium responsive/Inspector regression, contract, build and local Supabase gate all PASS.

## 2026-08-31 — Editor density and Inspector authority milestone
- Confirmed GitHub A gate `33326654737` for `d79058f` SUCCESS.
- Collapsed Advanced SEO and inherited Base intro; unified Variant/Base status lines.
- Browser measured Variant panel ~1032px at 1440px with advanced controls collapsed; all advanced controls remain present after disclosure expansion.
- Fixed Preview-origin authority routing and verified Current page → Base inherited H1 → Current page image-alt round trip with mapped editor highlights and zero page errors.
- `npm run test:contract`, production build and local ephemeral Supabase schema-v7 gate all PASS.

## 2026-08-31 — Primary editor density verification
- Removed duplicate Variant header status badges in favor of one lifecycle/review summary.
- Advanced SEO is now the single home for keyword/index/canonical/route controls.
- Chromium 1440×900 measured ~936px default editor height; Intro Inspector mapping PASS; pageErrors=[]; B gate PASS.

## 2026-08-31 — Base/Variant status-control regression
- Base and Variant footer selects now identify review vs content lifecycle explicitly and share the same semantic tones.
- Browser regression: header summary PASS, Preview remains visible, pageErrors=[]; contract/build/B gate PASS.

## 2026-08-31 — Three-pane hierarchy convergence verification
- Added shared selection/read-only CSS tokens and migrated active Base/Variant + Inspector styling onto them.
- Added read-only Inspector class/state for Product Truth and fixed fact-card CSS specificity so the graphite background remains visible.
- Added `containsActiveVariant` parent context in Species navigation.
- Chromium evidence: editable H1 green, temperature graphite read-only, parent Base guide green, issue marks amber, pageErrors=[]. Contract + schema-v7 B gate PASS.

## 2026-08-31 — Left workflow-filter semantics
- Added semantic issue/review/Preview tones to Species quick filters and localized filter labels/punctuation.
- Chromium verified no English-label overflow and correct zh/en banner text.
- Filter behavior unchanged: 33 pending issues → 32 Base groups; clear → 276; pageErrors=[]. Contract + B gate PASS.

## 2026-08-31 — Navigation count-unit correction
- Changed Species `All` from 486 catalog records to 276 Base groups while preserving the separate 486-record catalog summary.
- Active Data Review banner now reports 32 affected Base groups for 33 pending issues.
- Added localized unit tooltips; browser zh/en regression PASS; pageErrors=[].

## 2026-08-31 — Unsaved-change regression
- Added dirty comparison for Base/Variant forms, sticky unsaved indicator, save enablement, guarded editor navigation and `beforeunload`.
- Fixed conditional Hook ordering discovered during review before browser validation.
- Fixed no-op navigation masking: current Variant re-selection no longer prompts or clears dirty state.
- Ran two writable browser gates against local ephemeral Supabase: Variant/save/language/navigation and Base/save/scope/beforeunload all PASS with zero page errors.
- `npm run test:contract`, production build and `npm run test:supabase-gate` PASS.

## 2026-08-31 — Workflow localization regression
- Removed remaining mixed-language topbar filter labels.
- Added live `workflowFilterLabel` derivation in Species sidebar.
- Chromium verified active Data Review / Awaiting Review filters re-render across 中文 ↔ English with `pageErrors=[]`.
- Contract and local schema-v7 Supabase gate PASS.

## 2026-08-31 — Image Inspector regression
- Changed registry label to `主图 Alt 文本 / Hero image alt text` and marked the asset read-only.
- Added exact field names to Preview Inspector edit paths.
- Chromium verified Image Alt selection, source/read-only explanation, Base-owned H1 path and English rendering with `pageErrors=[]`.
- Contract and local schema-v7 Supabase gate PASS.

## 2026-08-31 — SEO handoff + loading audit
- Confirmed `2a737de` GitHub A gate run `33370177087` SUCCESS.
- Audited first-load Product Truth behavior under artificial network delay: prior behavior showed four `—` facts and no image before the lazy catalog chunk resolved.
- Identified an additional stale-data risk during Species switching if the previously resolved Product Truth row is merged before the new `catalog_key` resolves.
- Local fix is in progress with explicit loading state and key-scoped Product Truth ownership; production build passes, but browser delay regression/contract/B/A gates are still pending.
- Reframed next project milestone from further CMS styling to a staging frontend SEO vertical slice.

## 2026-09-01 — Product Truth loading correctness closed locally
- Cold-load regression with 1.4s delayed Product Truth asset: four facts and hero image show explicit loading; no fake `—` / empty image.
- Cross-Species regression: switching 64L → 40L Variant produced no frame where the new H1 was paired with the previous 64L facts.
- Pending-request race: switching Species before the delayed asset returned stayed Loading until the final selected `catalog_key` resolved.
- Failure/recovery regression: first JSON fetch forced to fail → Unavailable; next Species selection emitted a second fetch and recovered to the correct 40L Product Truth.
- `npm run test:contract -w @aquaguide/admin-content`, production build, `git diff --check`, and schema-v7 ephemeral Supabase B gate PASS.

## 2026-09-01 — Admin authority unification
- Added root `AdminHub`: Species SEO and Product/Care are explicit separate authorities.
- Moved legacy Product/Care UI route from `/admin/content` to `/admin/product-content`; preserved CRUD, publish/archive, image assets and safe 403 messaging.
- New Species SEO Admin is named explicitly and built under `/admin/seo/`.
- Root `npm run build` now runs AquaGuide web build + SEO Admin sub-build into one `dist`.
- Validation: TypeScript PASS; root Admin UI regression PASS at 1280/390; Product/Care API contract PASS; SEO Admin contract PASS; root build PASS; static `/admin/seo/` + JS/CSS assets return 200.

## 2026-09-01 — Root deployment artifact integration
- Added `scripts/build-species-seo-artifact.mjs` and wired root `npm run build` to merge generated Species pages only from an explicit snapshot.
- Added a 3-Species bilingual staging fixture and `scripts/verify-root-species-seo-artifact.mjs`.
- Added Admin CI coverage for the full root artifact path.
- Local evidence: root build PASS with 6 generated HTML pages; artifact verifier PASS; Admin contract/generator/Controlled Preview/staging guard PASS; Admin authority browser verification PASS.
- Safety: no snapshot = safe skip; generator still rejects Production snapshot/host paths.

## 2026-09-01 — Hosted staging slice preparation
- Confirmed Vercel deployment for `4ad6472` was READY and `/admin/seo/` served the embedded Admin app, but Species HTML was absent because automatic Git deployment had no snapshot build input.
- Added branch-scoped Preview input resolution: only `feature/admin-content-v0` + `VERCEL_ENV=preview` receives the committed 3-Species staging fixture and Vercel preview host as canonical base.
- Added deterministic product CTAs from generated Species pages to `/encyclopedia?mode=compatibility`, `/encyclopedia?mode=browse`, and `/aquarium?action=plan-species`, always carrying `species=<catalog_key>&source=seo-species`.
- Local verification: Admin generator contracts PASS; simulated Vercel Preview root build emits 6 pages; root artifact verifier PASS; Production simulation safely skips without explicit snapshot; `git diff --check` PASS.

## 2026-09-01 — Compatibility CTA runtime fix
- Browser-tested the hosted compatibility deep link and rejected a false PASS: mode/source/species parameters were present, but the target Species was not in the calculator selection.
- Updated Encyclopedia query handling so compatibility deep links append the requested Species to `calculatorSpeciesIds` and do not open the detail overlay. Browse-mode deep links retain detail behavior.
- Added isolated Vite + Playwright regression proving `sp_0030` is a planned compatibility candidate with zero page errors.

## 2026-09-01 — Hosted vertical slice PASS / clean-runner repair
- Latest hosted Species artifact passed: EN/ZH title, robots, H1, reciprocal hreflang, canonical sibling behavior, noindex behavior, sitemap inclusion/exclusion and SEO-to-product CTA source parameters.
- Latest hosted runtime handoff passed: compatibility deep link retained `species=sp_0030&source=seo-species`, preselected that Species as planned and produced zero page errors.
- CI #26 diagnosis: root build and static artifact checks passed; only `verify:seo-species-handoff` failed because GitHub Actions had no downloaded Chromium binary. Added `npx playwright install --with-deps chromium` after `npm ci` so the same browser regression runs on a clean runner.

## 2026-09-01 — Server-only hosted publication boundary
- Audited the hosted staging exporter against current Supabase API-key/Data-API defaults.
- Added migration 008: Published public visibility now also requires Approved; explicit `service_role` SELECT grants cover SEO/Base/Data Review release inputs.
- Data Review resolution RPC is no longer callable by anon/authenticated; staging exporter reads a sanitized projection with a server-only secret/service-role client.
- Release readiness probe advanced to schema v8 with `server_export_ready`.
- Added `build:staging-from-db` to export from a future dedicated hosted staging Supabase and merge Species pages directly into AquaGuide `dist/`.
- Fresh ephemeral Supabase 001–008 PASS: schema_version=8, draft/unapproved visibility blocked, rollback preserved, bilingual generation PASS.

## 2026-09-01 — Approved Draft staging release
- Hosted staging no longer depends on Production `Published`. `staging_release` accepts only explicitly allowlisted Draft rows whose editorial review is Approved and has `reviewed_at`.
- `STAGING_CATALOG_KEYS` is mandatory, deduplicated and capped at 20 Species; canonical dependencies must be explicitly included when needed.
- Production-style `release` remains Published-only and ignores Approved Drafts.
- Staging snapshots omit reviewer identity. Hosted acceptance must verify deployment-level `X-Robots-Tag: noindex`; page source keeps intended robots/canonical values for SEO inspection.


## 2026-09-02 — Latest continuation pointer
- **Canonical cross-session handoff is now `.ai/HANDOFF_LATEST.md`. Read it first before changing Species SEO Admin.**
- Latest code HEAD at sync: `fae815f`; GitHub Admin Content CI #43 (`33532055685`) SUCCESS; Vercel Preview `dpl_EeFvNvuqySA6RVpHYsvjPCuCG8Jw` READY.
- Real hosted human path is proven through Chinese approval for `sp_0001`; zh-CN is Approved/version 6/index. English `sp_0001` remains Editing and still contains acceptance copy, so do not Staging Publish it yet.
- Data Review now reports 32 pending issues after the 极火虾 duplicate decision. `Pelvicachromis pulcher` (`sp_0214 / sp_0338`) remains an unresolved duplicate example.
- Duplicate labels are now actionable: `处理重复` opens the current group's review drawer with two decision buttons and a final `确认并保存`; no review-decision dropdown.
- Status and actions are permanently separated; review actions update only review state. Inheritance UI is centralized under `内容来源 / 管理基础模板`, not repeated `公共内容` explanations.

## 2026-09-02 — Content hygiene release gate
- Added shared acceptance/test-copy detection for Species and Base editorial fields.
- Variant/Base review actions now block dirty content; `sp_0001` browser check exposes the exact H1 marker and supports one-click restore to the clean Base template.
- Repo review updates and Staging snapshot creation enforce the same rule server-side; static Species generation independently rejects dirty snapshots.
- Historical staging snapshot verification now fails closed on `sp_0001/zh-CN` (`验收`) and `sp_0001/en` (`Dual-Repo`) instead of regenerating those acceptance H1s.
- Contract, Repo backend/API, dual-repo routing, full root build, SEO handoff and Admin UI gates PASS locally.
