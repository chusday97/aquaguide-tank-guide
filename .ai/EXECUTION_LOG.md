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

## 2026-09-02 — Code Preview / Staging publication decoupling
- Remote AquaGuide Preview on the hygiene-gate commit failed for the correct content reason: normal code deployment was still auto-consuming the historical dirty staging snapshot.
- Reworked root Species artifact routing so normal code Preview skips staging content; only the server-generated `content(seo): publish staging ...` snapshot-only commit can auto-generate Species pages.
- Added `test:species-seo-build-routing` and wired it into CI; explicit CI fixture generation remains supported.
- Simulated code Preview PASS; simulated explicit publish with the dirty historical snapshot FAILS CLOSED on zh `验收` and en `Dual-Repo`.
- GitHub CI #48 PASS; AquaGuide Vercel `dpl_FfdQmQxKfSYhQS8yBz9F7eVukj2b` READY; admin-content `dpl_8FuNP96AYyUTDhtaqEEXt2gXv8Y4` READY.

## 2026-09-02 — Global copy-cleanup queue
- Added per-locale content-hygiene task queues without creating a new review state.
- Added a conditional full-width sidebar cleanup alert, locale-aware filtering, and direct navigation to the affected Species.
- Inherited dirty Base content now routes to the Base editor; page Overrides keep one-click Base restore.
- Local contract/build/UI/deployment-routing gates PASS; GitHub CI #49 PASS.
- AquaGuide Preview dpl_7wysx8FDcz1CX4oWqNtmmdiLvVzq READY; Admin Preview dpl_F6jSc7U9pece3NaprHUdGbsU8Gyp READY; hosted Admin remains noindex.

## 2026-09-02 — Blocked next-action diagnostics
- Replaced the opaque 458-page Not-ready queue with a nested, mutually-exclusive next-action breakdown while retaining the existing readiness states.
- Structured blocker codes now classify hygiene, Data Review, current-locale content, bilingual dependency and Index/Canonical policy without parsing display text.
- Review fixture: 458 blocked = 51 Data Review-first + 407 content-first; Data Review filter maps to 32 Base groups, English content filter to 248 Base groups and switches locale correctly.
- Local full gates PASS; GitHub CI #50 PASS.
- AquaGuide dpl_8ZMK57zfuGkTa4sqmh2rrE7cJ8xD READY; Admin dpl_8oPnHbvVE5Sd1op6DLhFDWwpKka7 READY; hosted Admin remains noindex.

## 2026-09-02 — Unified top-right action feedback
- Added a global `AdminNoticeViewport` mounted above App so login and Admin actions share one top-right transient feedback surface.
- Repo mutations still use `aquaguide-admin-operation`; client-side precondition failures use `aquaguide-admin-notice`. Success/info/warning/error auto-dismiss and can be manually closed.
- Removed transient inline save/error/status messages from Variant/Base editors, Data Review, Translation, Batch Drafts, CSV import, Revision History, Activity Center and Staging feedback.
- Changed semantic action blockers from unexplained disabled buttons to clickable actions that immediately explain the exact reason; only in-flight/busy states remain disabled. Persistent content diagnostics and safety banners remain inline because they describe page/system state, not a click result.
- Browser Review-mode validation: bulk-import and submit-review blockers toast correctly; manual close + timed dismissal pass; old inline transient selector count=0; browser errors=0.
- Contract, Admin build, build-routing, full root build, SEO handoff, Admin UI and diff gates PASS. Normal root build still skips Species staging content.
- Remote: functional commit `0f7a32e`; GitHub Admin Content CI #51 (`33606431007`) PASS; AquaGuide Vercel `dpl_8nhb9HoVFBiuafNMrJZtxN5UEsvs` READY; Admin-only `dpl_EQrgN5itFAmSr6T1Eq5bmiy2RMzY` READY. Hosted `/admin/seo/` returns 200 + deployment `X-Robots-Tag: noindex`.

## 2026-09-02 — Strict status vs action visual semantics
- Replaced sidebar `处理重复` actionable tag with a standalone button and separated it from Species row navigation.
- Replaced clickable issue-count badge behavior with an explicit `处理数据` button.
- Restored static count badges to pill-only/non-clickable semantics; action buttons now have visible border, rectangular radius, hover/press affordance and chevron/count treatment.
- Added regression guards that forbid actionable duplicate-review tags and require explicit button styling.

## 2026-09-02 — Bulk duplicate review + template import
- Added a dedicated bulk duplicate-review workflow with select-all, explicit human conclusion, per-group keep-page verification, and one final confirmation.
- Added atomic `resolve_species_duplicate_reviews_bulk`; multiple duplicate reviews now create one private-store commit/activity and fail without partial writes if any item is invalid.
- Promoted CSV workflow to explicit `SEO 模板导入`: download template, fill in Excel/Numbers, upload/validate, import Draft changes.
- Browser fixture: 28 duplicate sets selected and ready for one batch confirmation; Template Import download/upload actions are both visible; no page errors.
- Local contract/build/routing/handoff/Admin UI gates PASS; normal code build still skips explicit Staging content publication.

## 2026-09-02 — CSV import diff preview and no-op protection
- Added a pre-write field-level preview to SEO template import.
- Marked CSV rows now show the exact fields that will change; cleared Override fields are called out separately.
- Rows with no actual Draft changes are skipped instead of being upserted and unnecessarily reset to Editing.
- Final import CTA uses the actual changed-row count.
- Browser regression: preview rendered successfully with no page errors.
- Full Admin contract/build/routing/handoff/UI gates PASS; normal code build still skips Staging Species publication.

## 2026-09-02 17:26 +0800 — Overall cross-session sync checkpoint
- Canonical continuation file remains `.ai/HANDOFF_LATEST.md`; it was normalized so the top-level latest commit/deployment evidence no longer points to older #50-era state.
- Current branch: `feature/admin-content-v0`; latest functional checkpoint before this docs sync: `2423202 fix(admin): preview bulk import changes`.
- Current bulk workflow is end-to-end at the Admin layer: atomic duplicate review → explicit SEO CSV template download/upload → field-level import diff/no-op protection → atomic bulk editorial submit/approve/return → explicit Staging Publish.
- UI contracts now treated as stable: action buttons vs status tags are visually/semantically separate; transient action outcomes/errors use top-right Toasts; persistent inline messages are reserved for page/system diagnostics.
- Data authority remains dual-repo and fail-closed: Product Truth read-only; private editorial Draft/review authority in `chusday97/aquaguide-seo-content`; public repo contains code plus explicit Staging snapshot only; Species SEO runtime uses no Supabase.
- Duplicate source audit: 28 duplicate sets total; 3 real human decisions already exist (极火虾 keep `sp_0001`, 白金西非凤凰 keep `sp_0214`, 黑木蕨 keep `sp_0082`); 25 remain for authenticated bulk review.
- `sp_0001` still requires removal of Chinese/English acceptance-test H1 copy before a new Staging release; hygiene gates continue to block dirty review/Staging/static generation.
- Next operational proof: resolve remaining Data Review → produce first real 10–20 Species SEO batch → bulk review → one explicit Staging publish → verify generated EN/ZH title/meta/H1/canonical/hreflang/robots/CTA/noindex.
- GitHub Admin Content CI Gate #55 (`33613630539`) completed SUCCESS for `2423202`; every validation step succeeded.
- GitHub commit statuses for `2423202` report both `Vercel – admin-content` and `Vercel – aquaguide` SUCCESS. Production remains locked; no `main` merge implied.
- New-session instruction is now consolidated at the end of `.ai/HANDOFF_LATEST.md` under section 32; future sessions should read that file first, then git status/HEAD and the latest execution-log tail, and continue the first incomplete operational item unless the user supplies a newer concrete bug.

## 2026-09-03 — Atomic first-batch import foundation
- Audited the canonical `apps/admin-content` flow while preparing the first 10–20 Species production batch; rejected the standalone `aqua-fronted-cms` as a duplicate runtime and marked it visual-reference-only.
- Found that CSV import wrote page Drafts but did not ensure required Base rows, which made cross-group bulk production depend on manual one-by-one Base creation.
- Added `import_species_seo_bulk` as one Repo transaction: create only missing Base defaults + import changed page Drafts + revisions + one Activity. Existing Base templates are never overwritten.
- Added atomicity/authority regression tests and semantic contract guards.
- `npm run test:contract -w @aquaguide/admin-content` PASS, including Repo backend/API and dual-repo gates.
- `npm run build -w @aquaguide/admin-content` PASS.
- Root `npm run build` PASS; normal code build continues to skip Species staging content without explicit Staging publish input.
- `npm run verify:seo-species-handoff` PASS.
- `npm run test:admin-content-ui` PASS: hub routing, Product/Care edit/save, forbidden state and 390/1280px layout.
- `git diff --check` PASS.
- Next: prepare low-risk bilingual Draft content batch; no human duplicate decisions or Production publication will be automated.

## 2026-09-03 — Batch-01 operational dry-run
- `408c7ae` added atomic CSV import with create-if-missing Base templates.
- Prepared 14 low-risk Species in `~/aquaguide-seo-batches/batch-01/` as bilingual noindex Draft CSVs.
- Full isolated Repo/session workflow generated 28 bilingual static Species HTML pages with all review gates preserved.
- Dry-run exposed user-facing `Product Truth` implementation jargon in the generator; fixed it across publication/preview/admin guidance in `348d6a0`.
- Admin contract, root build, SEO handoff and Admin UI regression all PASS after the copy cleanup.
- No real private content repo write, no Staging publish and no Production write performed in this dry-run.

## 2026-09-03 — Source identity gate / batch-01 correction
- Detected malformed source identity `sp_0069 / Cyprinus carpio var.` during real batch QA.
- Added pre-import, readiness and static-generator fail-closed source identity checks.
- 35 catalog rows ending in incomplete `var.`-style rank markers are now explicit source-data blockers.
- Replaced batch-01 `sp_0069` with `sp_0011 月光鱼 / Platy`.
- Full isolated 14×2 Draft → review → Staging-generation dry-run PASS; 28 HTML remain noindex; no private/Production writes.
- `npm run test:contract -w @aquaguide/admin-content` PASS; Admin build + full root build + diff hygiene PASS.
- Functional commit pushed: `43d0cfa`.

## 2026-09-03 — Blank operational template + Preview writeability
- Reworked SEO template download from 486-row catalog export to a blank operating template with field guidance, format rules, 20 blank rows and 3 examples.
- Only explicit `import_action=update/更新` rows participate in validation/import; guide/example rows are safe and ignored.
- Playwright round-trip PASS: download → inspect 26-line CSV → upload unchanged → 0 marked rows, no validation failure.
- Replaced legacy read-only flag `VITE_ADMIN_REVIEW_MODE` with explicit `VITE_ADMIN_READ_ONLY_DEMO`; normal Vercel Preview is intended to remain authenticated + writable.
- Renamed read-only UI copy to `只读演示 / Read-only demo` to eliminate Preview/read-only ambiguity.
- Functional commit `71cecdc`; full local regression PASS; Production/main untouched.
- Hosted check found standalone `admin-content` Preview is blocked at Repo setup (`content_repo_not_configured`); canonical writable acceptance remains AquaGuide Preview `/admin/seo/`. Documented this to prevent future URL confusion.

## 2026-09-04 — Duplicate review evidence convergence
- Replaced `catalog_key`-centric duplicate decisions with evidence-based side-by-side candidate cards.
- Added source identity/facts, real image, bilingual SEO completeness, editorial state and explicit SEO last-edited evidence.
- Added explainable canonical recommendation priority: source-primary → approved SEO → completeness → recent edit as weak evidence only.
- Added in-context real-image Preview with zh-CN / EN switching; `暂不处理` leaves the issue pending and performs no write.
- Found and corrected an intermediate performance regression: synchronous full Catalog import increased Admin JS to ~894 KB. Reused the existing catalog URL loader and lazy-loaded full source evidence only when needed; main Admin JS returned to ~642 KB.
- Browser acceptance PASS on read-only demo: 28 pending groups, two candidate cards/images in the first real set, Preview locale switch, defer-without-write and zero horizontal overflow.
- `npm run test:contract -w @aquaguide/admin-content`, Repo/API/dual-repo gates, Admin build, root build, SEO handoff, Admin UI regression and `git diff --check` PASS.
- Functional commit pushed: `22d9322 feat(admin-content): add duplicate decision evidence`.
- No real human duplicate decision, private Draft mutation, Staging publication, Production write or `main` merge was performed.
## 2026-09-04 — duplicate review entry-point convergence
- Audited `DataReviewPanel` after bulk evidence UI shipped; found single `处理重复` still used legacy system-comparison + catalog-key radio selection.
- Extracted shared `DuplicateCandidateComparison` and `duplicateReviewEvidence`; both single and bulk review now render the same evidence and recommendation logic.
- Added explicit single-review defer with no persistence and removed obsolete legacy duplicate-review styles.
- Browser PASS: single path 2 cards/2 images/Preview/defer; bulk path 28 shared comparisons/56 cards/Preview.
- Contract + Repo/API + dual-repo gates PASS; Admin build ~640 KB JS; root build, SEO handoff, Admin UI and diff hygiene PASS.
- Pushed functional commit `e0b40b7`; no Production write and no main merge.

## 2026-09-04 — import preflight + documentation convergence
- Started from clean `feature/admin-content-v0 @ c4c2601`; read canonical handoff/current goal/task queue/live status before modification.
- Found Bulk Import surfaced only the first validation issue by Toast and left the write action visually present without a persistent preflight report.
- Added upload → preflight → field Diff → Create Draft workflow and fail-closed Draft button gating.
- Browser test: invalid `index_strategy` on row 2 rendered inline issue + disabled Draft; valid CSV rendered actual Diff; read-only demo stayed non-writing.
- Contract, generator, Repo backend/API, dual-repo routing, root build, SEO handoff, Admin UI and diff hygiene PASS.
- Functional commit pushed: `8c9ceeb fix(admin-content): add import preflight gate`.
- Re-read authoritative remote heads rather than stale `origin/main`: live main `64fa58a`, feature `8c9ceeb`, common base `ed0cf38`.
- Divergence audit: main 269 unique commits / feature 95; 205 vs 108 changed files; 11 overlap; merge-tree shows 7 changed-in-both files and 13 conflict hunks.
- Rewrote `CURRENT_GOAL.md` and `LIVE_STATUS.md`; created `BRANCH_STATUS.md`; Supabase is no longer presented as current Species SEO runtime/staging authority.
- No private real Draft write, Staging publish, Production write, merge or rebase performed.

## 2026-09-04 — durable import-batch convergence
- Identified governance risk: bulk editorial review could select historical eligible Drafts outside the just-imported CSV scope.
- Added Repo store schema v3 `import_batches` and server-generated durable batch identity/scope.
- Added server-side batch membership validation for bulk review and exact batch+Canonical-dependency allowlist validation for Staging.
- Preserved concurrent remote implementation's latest-import default scope, Activity/localStorage recovery, bilingual Approved/clean readiness and Canonical dependency calculation.
- Concurrent push rejection was handled by fetch + no-force merge; only BulkEditorialReviewPanel conflicted and was manually reconciled.
- Final converged functional head: `f4805669`.
- Validation PASS: `test:contract`, Repo backend/API/dual-repo, root build, SEO handoff, Admin authority UI, `git diff --check`.
- WebCodex invocation returned platform FORBIDDEN; no WebCodex execution result should be attributed to this change.
- Production/main untouched. Next real proof is authenticated batch-01 zh-CN + en import/review/Staging on AquaGuide Preview.

## 2026-09-04 — Aqua Operations Studio documentation convergence
- Re-read real local branch/worktree and authoritative remote heads before documentation edits.
- Confirmed Product/Care/Compatibility/SEO ownership from current code: Product/Care Admin exists, Compatibility runtime exists, SEO Admin is mature as a separate acquisition subsystem.
- Verified P0 architecture gap: `Encyclopedia.tsx` still imports static `fishData.ts`; `CareEncyclopedia.tsx` still imports generated `careTopicsData.ts`; `/admin/product-content` writes API-backed Product/Care records. Admin Product/Care publish is not yet the single frontend source of truth.
- Added `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md` as the canonical broader architecture/ownership contract.
- Rewrote `HANDOFF_LATEST`, `CURRENT_GOAL`, `LIVE_STATUS`, `TASK_QUEUE`, `BRANCH_STATUS` around the current Operations Studio roadmap rather than the older SEO-only mental model.
- Added permanent decision: SEO is downstream acquisition content; Product Data/Care/Compatibility remain separate authorities; personalized results come from shared approved knowledge/rules + user aquarium context.
- Authoritative remote refs before docs commit: main `64fa58a`, feature `7fb19b28`; divergence 269 main-only / 106 feature-only; merge base `ed0cf38`. Narrow/stale `origin/main` must not be trusted without explicit live-ref verification.
- No application code, private Draft content, Staging snapshot, Production state or main branch was modified by this documentation pass.

## 2026-09-04 — Product/Care publication isolation checkpoint
- Recovered exclusively from `CROSS_SESSION_START.md` and the canonical `.ai` read order, then verified clean `feature/admin-content-v0`, local/remote `9f4119c9`, and live main `64fa58a` before changes.
- Inventoried all direct runtime/build-time `fishData.ts` and `careTopicsData.ts` consumers; recorded the authoritative classification in `.ai/PUBLISHED_CONTENT_AUTHORITY.md`.
- Found a P0 release-boundary defect: Admin PATCH mutated already-published rows in place, so Save could change fields while public routes still considered the row published.
- Added immutable Product/Care publication snapshots and service-role-only transactional publish/archive RPCs. First edit of published content preserves the last public snapshot and moves the editable source back to Draft.
- Public Species/Care APIs now prefer publication snapshots while retaining legacy published-row fallback for safe migration/deployment ordering.
- Regression protection added to `test:admin-content-contract`; API typecheck, contract, full root build, Admin UI regression, SEO handoff and `git diff --check` PASS.
- Functional commit: `d6d2b37e feat(content): isolate product care publication`.
- Migration is committed only; Production was not touched. No main merge/rebase. Next P0 is frontend runtime migration off direct static authority.


## 2026-09-04 — Product/Care runtime authority convergence
- Continued from publication snapshot checkpoint without touching main or Production.
- Added `/content-bootstrap`, `runtimeContentCatalog`, locale-aware hydration and explicit static fallback.
- Routed Encyclopedia Product Data plus Care Encyclopedia, Aquarium diagnosis and Identify diagnosis to the published runtime authority.
- Added dedicated `/api/v1/*` Business API Vercel function routing and local Preview proxy; avoided legacy-app packaging bloat (~257 MB → ~24 MB function bundle in local Vercel build).
- Added regression guards preventing target consumers from reverting to direct static authority.
- Validation PASS: root build, TypeScript/API checks, Admin content contract, Product/Care runtime browser injection, Care/Identify search checks, species diagnosis, care guidance/category consistency, Admin UI and SEO handoff. Existing unrelated Identify tests contain older wording assumptions and were not used to alter product behavior.
- Functional commit: `eff3bba3 feat(content): route published product care runtime`.
- Next P0: real Admin Product edit and Care edit through Save/Publish into Preview, with Save-invisibility and compatibility/user-state spillover checks.


## 2026-09-04 — Product/Care Save→Publish Preview acceptance
- Built stateful browser contracts for one Product and one Care record using the real Admin UI plus controlled API fixtures.
- Verified Save changes Admin source to Draft while the user-facing Preview keeps the previous published value; verified Publish advances the intended Encyclopedia/Care consumer on fresh load.
- Tightened Care runtime acceptance from search-summary matching to exact rendered card-title matching; this exposed a real legacy `displayTitleMap` override that masked published Care titles. Fixed the override so published Care wins and legacy maps only format fallback content.
- Protected published Product/Care search labels from legacy translation maps.
- Added runtime isolation test: published Product can change name/temperature/pH/difficulty/temperament in `runtimeFishData` without mutating static `fishData` used by Compatibility; static Care seed also remains unchanged.
- Added browser assertions that `aquarium_app_state_v1` is byte-identical before/after Admin Save/Publish and user Preview loads.
- Updated Admin publish confirmation copy so it no longer claims universal immediate visibility and explicitly preserves Compatibility as an independent authority.
- Validation PASS: full root build, Admin contract/UI, SEO handoff, strict published runtime browser test, runtime isolation, Product publish-preview, Care publish-preview, diff hygiene.
- Functional commit: `ee2fcc8a test(content): prove admin publish preview boundary`.
- No Production migration/deploy, main merge/rebase, or real user data mutation occurred. Next unfinished P0 is authenticated bilingual SEO batch-01 operational acceptance.

## 2026-09-04 21:40 +0800 — authenticated SEO batch-01 acceptance + CI tiering
- User authenticated Aqua SEO Admin locally; no password/cookie/token was copied into chat or committed.
- Executed corrected batch-01 through official Repo Admin API with fail-closed scope checks.
- zh-CN batch `batch-20260904132705-deca`: 14/14 Species changed, 14 Base groups, submitted and approved; final batch status `approved`.
- en batch `batch-20260904132732-9d0d`: same 14 Species/Base scope, submitted and approved; one explicit Staging Publish completed.
- Staging snapshot commit: `7aaeb44e02ce6b82ba35919b081945bf4d0ce1cd` → `feature/admin-content-v0`; Production remained locked.
- Vercel deployment `dpl_B86KiBaD75LhGdcHMa6v8zTN6pJM` became READY for the staging commit.
- Hosted verification PASS 28/28: exact title/meta/H1, Product Truth temperature/pH/tank/difficulty, canonical + EN/zh-CN/x-default hreflang, `noindex,follow`, three AquaGuide CTAs, no acceptance/test/placeholder hygiene markers.
- English tank-size verification uses the canonical `localizeSpeciesTankSize` presentation rule (`至少 N 升` → `At least N L`), avoiding a false source-string mismatch.
- CI policy changed without deleting coverage: ordinary runs use lightweight Admin contracts/build + product fast contracts + lint/root build; heavy Golden/Visual/evaluation-history/browser suites run only for manual dispatch, merge queue, or PR labels `run-heavy-ci` / `merge-ready`.
- Preserved existing `Admin Content CI Gate` and `Product Golden Path` workflow identities and `validate` job key to reduce branch-rule breakage risk.
- Local validation PASS: YAML parse, `git diff --check`, full light command set, Golden contract, Visual result contract, evaluation report 47/47, Admin UI regression.

## 2026-09-04 — Change Impact Preview first round
- Added field-level Product/Care impact classification and `发布后直接更新` vs `需单独复核` consumer mapping.
- Product decision-critical fields flag Aquarium / Compatibility / SEO review where applicable without implying those independent authorities are auto-mutated; Care workflow changes directly flag Care Guide / Aquarium / Identify.
- Reused public Product/Care detail reads as published baseline, so Draft-vs-Published Diff survives refresh.
- Added Impact UI to editor and publish confirmation; Product save→reload and Care workflow browser scenarios pass at desktop/mobile widths.
- Added lightweight `test:admin-content-impact` and fixed Admin CI path coverage for `AdminContent.tsx`, admin components/services and impact test.
- Validation PASS: diff hygiene, impact logic, Admin UI, Admin contract, Admin build, root lint and root build.
- Functional commit pushed: `e58c70829b389b6a9a7b23fd9519afd96c802702`. Production/main untouched.
- Next: full user-facing before/after Preview for decision-critical changes, then Compatibility-result regression simulation.

## 2026-09-04 22:38 +0800 — P1 Change Impact Preview completed
- Completed decision-critical Encyclopedia Before/After against the published Product baseline, including all editable critical fields and changed raw numeric bounds when present.
- Added species-only Compatibility regression using the existing `evaluateSpeciesCombination` engine; static living-species cohort is read-only and Compatibility evidence/rules are never mutated.
- Regression detects both status/risk changes and rule-only changes (for example a new pH-gap rule while overall status remains insufficient-data).
- Publish confirmation now includes Compatibility simulation counts while preserving the independent-authority boundary.
- Validation PASS: impact contract, compatibility regression contract, Admin UI 1280/390, Product/Care publish-preview tests, Admin contract/build, root lint/build.
- Functional commit: `9dc30c48 feat(admin): complete change impact preview`. Production/main untouched.
- Next unfinished milestone: P1 Compatibility Admin.

22:xx
- Continued P1 Compatibility Admin from reviewed-baseline audit into safe Behavior Profile revision workflow.
- Added isolated revision schema/RLS/version trigger, Admin API create/update/submit-review, DB baseline capability gating, Profile Draft editor, and 390/1280 browser acceptance.
- Reviewed runtime inputs remain 7 Profiles / 4 Pair Rules; no Compatibility publish route and no reviewed authority mutation.
- Validation PASS: compatibility admin contract, Compatibility impact regression, Admin browser, Business API check, root lint/build, diff hygiene.
- Functional commit pushed: `dfed5a948982719505cc5d557be2b98ef4e9baea`. Migration not applied to any live database; Production/main untouched.
Next: Pair Rule revision Draft workflow with evidence/confidence/review status.

23:xx
- Completed P1 Compatibility Admin Pair Rule Draft workflow on top of the reviewed 4-rule baseline.
- Added pair revision schema/API/editor with DB-baseline gating, canonical pair ordering, reviewed citation snapshots, versioning, Draft save and submit-review lock.
- Acceptance exposed and fixed a real Zod runtime crash caused by calling `.omit()` on a refined schema.
- PASS: pair/profile compatibility admin contract, 1280/390 browser workflow, API TS, root lint/build, Compatibility impact, diff hygiene.
- Functional commit pushed: `4c9ec12e8f6929712d3780b06f4ef5ca93be3be6`. Migration not applied to live DB/Production; reviewed runtime unchanged.
Next: explicit human Review/Approve + rule versioning and regression gate before any reviewed Compatibility publish.

23:5x
- Added server-computed structural impact at Compatibility revision submit and explicit human Approve/Reject for Profile + Pair Rule revisions.
- No-change revisions cannot enter review; Reject requires a review note; Approved remains non-runtime.
- Browser 1280/390, compatibility admin contract, API TS, root lint/build and Compatibility impact all PASS.
- Functional commit `25e3ec0d445a6b8342593313c2783b98dc9b6b86`; online light CI `33893177526` PASS / Heavy skipped.
- Architecture audit confirmed the next blocker: runtime still consumes code/data reviewed evidence while Admin revisions are DB-backed. No publish endpoint was added.
Next: converge reviewed Compatibility runtime/publish authority before versioned publish + engine regression gate.

## 2026-09-05 — Compatibility reviewed runtime authority
- Commit: `1e8a482a91655cc5929fdb635b51232c7c3d0541`.
- Added public reviewed Compatibility bootstrap, atomic runtime registry, exact-baseline fail-closed activation, and rule/evidence authority fingerprinting.
- Preserved existing Compatibility algorithms and static fallback behavior; regression suites/build passed.
- CI light gate now executes runtime authority contract.
- No live migration/publish/Production/main changes.
- Next: resolve revision citation source keys to canonical Evidence rows, then implement versioned reviewed publish.


## 2026-09-05 — Compatibility versioned reviewed publish completion
- Functional commit `57c4ef00571c00191248948af8218f978417c949`.
- Added canonical reviewed Evidence reconciliation (13 Evidence / 7 Profiles / 4 Pair Rules), exact reviewed authority loader, real server-side Compatibility regression, freshness digests/authority sequence, human approval gates and transactional Profile/Pair versioned publish RPCs.
- Profile regression mirrors Product runtime Published-over-static fallback; current 486 catalog yields 1455 directional scenarios for a full Profile change, benchmarked ~42 ms locally. Pair Rule regression evaluates three explicit-pair scenarios.
- Product/Compatibility/referenced-Evidence authority changes stale old reports; Approve and Publish recompute freshness before RPC execution.
- Validation PASS: Admin contract, 16 Compatibility engine cases, runtime authority, structural impact, compatibility-admin contract, server regression gate, 1280/390 Admin browser publish flow, API TS, root lint/build, diff hygiene.
- Online light CI run `33909317349` PASS including `Compatibility server regression gate`; Heavy skipped.
- Migrations `202609050001` / `202609050002` remain unapplied to live DB/Production; main untouched.
Next: P2 Unified Publish Center / release history & audit, beginning with a read-only aggregation contract.
## 2026-09-05 — P2 Publish Center architecture inventory / docs sync
- Verified branch `feature/admin-content-v0`, local/remote HEAD `a1242eb04a981f8815f2f1760bb4be833ddd6dc0`, clean worktree, live main `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Confirmed P1 Compatibility Admin functional checkpoint `57c4ef00`; online light CI run `33909317349` PASS, Heavy skipped.
- Inventoried release-history authorities: Product/Care + Compatibility use Business API/Supabase; SEO uses separate Repo Admin cookie and `admin-store.json` (`content_revisions`, `activity`, `import_batches`, Staging snapshot).
- Decision: Publish Center v1 is read-only multi-authority aggregation. It must not create a new write authority or migrate SEO operational history into Supabase.
- Next: implement normalized `ReleaseEvent` read contract + source readers/availability state + `/admin/publish-center` timeline.
- Docs-only round; no business code, main, Production, deployment or live migration changes.

## 2026-09-05 — P2 Unified Publish Center read model
- Added multi-authority read-only ReleaseEvent contract and Business/SEO adapters without moving any write authority.
- Added `/admin/publish-center` with per-source availability/coverage and unified timeline; SEO auth failure degrades independently.
- Product/Care is explicitly current-publication-only; Compatibility and SEO expose their existing richer history.
- PASS: contract, API TS, lint/build, 390/1280 browser, existing Admin/Repo regressions.
- Functional commit `f1b7adaee86eecbd99f1b6c908acfb45c0bd6de2`; online light CI run `33950528930` started.
Next: read-only release detail/readiness drill-down; no cross-domain publish writes yet.
## 2026-09-05 — Publish Center detail/readiness + capability matrix
- Continued from `f1b7adae`/`7c125112` read-only checkpoint.
- Added selectable event detail, source readiness summary, filter-safe selection and explicit Product/Care current-only coverage.
- Added typed release capability matrix across Product/Care, Compatibility and SEO for Diff → Impact → Preview → Review → Staging → Production.
- Verified SEO auth-required degradation, 390/1280 layout, contract, API TS, lint/build and diff hygiene.
- Functional commits: `10b90394`, `bd2e8059`. No Production/main/live DB mutation.
Next: cross-domain orchestration design + roles/audit without moving write authority into Publish Center.
## 2026-09-05 — Publish Center permission + Product/Care audit history
- Added read-only permission projection for Business admin and independently authenticated SEO repo-admin; did not alter role/RLS models.
- Added append-only Product/Care publication audit migration and migration-safe audited RPC fallback.
- Publish Center upgrades from current-only to revision-history automatically when audit storage is available; 390/1280 browser test covers both states.
- Product/Care publish-preview regressions, Admin contract, API TS, lint/build pass.
- Commits: `ec5e9a2b`, `2a1c0594`. Migration not applied live.
Next: read-only cross-domain coordination design; no centralized writes.

## 2026-09-05 P2 Publish Center — cross-authority coordination closeout
- `5a549377` adds read-only cross-authority context by explicit catalog key / Pair key / SEO batch catalogKeys only.
- Related records are contextual evidence, not dependency inference and not a signal that synchronized publish is required.
- Event detail links back to the original Product/Care, Compatibility or SEO authority; Publish Center still performs no writes.
- Online lightweight CI run `33951946893` passed for `5a549377`.
- Product/Care append-only audit migration remains code-only/unapplied; current deployments safely fall back to current-only history.
- Business role split is deliberately deferred until a real multi-operator requirement exists.
- First unfinished milestone: Care SEO downstream projection from approved Care Knowledge.

## 2026-09-05 16:31 +0800 — Care SEO projection/static handoff closeout
- Closed Care SEO downstream foundation across three functional checkpoints: `108a4400` Published projection, `d6d267c3` standalone canonical route, `8104a1b2` deterministic bilingual hreflang/static Staging handoff.
- Published Care snapshot/version is the only SEO source; Draft Care remains private and protected Care facts/evidence are not editable in SEO projection.
- Canonical routes now follow Species SEO locale convention: EN `/care/<key>.html`, zh-CN `/zh/care/<key>.html`, x-default→EN. Route locale does not overwrite saved user language preference.
- SPA canonical fallback remains `noindex,follow`; old `/care?topic=...` Dialog links remain compatible.
- Added explicit-input-only static Care SEO builder. It rejects missing bilingual pairing, source-version drift, unapproved editorial, Production snapshot, or Production host leakage; normal root builds skip it.
- Final local verification PASS: full lightweight Admin CI command set, Care projection/artifact contracts, Product/Care runtime, API/root TS, root production build, 390/1280 canonical route, Care guide/assessment/favorites and first-screen regressions.
- Pushed functional commit `8104a1b2b49a1f35bbcfd3f7626d8b69d7255622`. Online Admin Content CI run `33955509807`: validate success; Heavy skipped.
- Live main `64fa58a1`; divergence main-only 269 / feature-only 144; merge base unchanged. No main merge/rebase, live migration, index unlock or Production mutation.
- Next unfinished item: Care SEO Editorial Draft/Review persistence → explicit sanitized Staging snapshot/handoff → hosted bilingual acceptance.

## 2026-09-05 — final progress/docs sync after Care SEO foundation closeout
- Re-read live refs: main `64fa58a16a723b74621ac1db513adb1efb47e282`, feature `c4b1c1a1a308510029135bbad0f1bb6c552603c7`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Measured divergence before this docs-only sync: main-only 269 / feature-only 145; local HEAD matched remote feature and worktree was clean.
- Confirmed functional Care SEO checkpoint `8104a1b2` online CI `33955509807` PASS; Heavy gate skipped by policy.
- Canonical next task remains Care SEO Editorial Draft/Review + sanitized Staging snapshot/handoff + hosted bilingual acceptance; Production/index/live DB remain locked.

## 2026-09-05 — Care SEO Editorial + sanitized Staging handoff
- Continued from Care SEO static foundation without changing main/Production or applying live migrations.
- `a2caf575043bc4e36472f57412f469ad168fc652` added downstream Care SEO Editorial revision persistence, Draft → ready_for_review → human Approved transitions, Published Care source binding and source-drift invalidation.
- `6079b6d44e7e3224822dcf06ae2253427679c632` added explicit approved-only sanitized Staging handoff, immutable `publication-snapshot` requirement, exact Editorial/projection identity matching, bilingual same-version binding, `noindex` retention and Production source/destination denial.
- Sanitization contract now object-tests protected-field non-leakage: Care title/symptoms/diagnose/evidence and Editorial revision/audit metadata are absent from the handoff.
- Automatic Care SEO generation occurs only for a snapshot-only `content(care-seo): publish staging ...` commit on the feature Preview branch; normal root build skips Care SEO artifact generation.
- Local full validation PASS: Care projection/editorial/handoff/build-routing/artifact tests, API TS, root lint, root production build, diff hygiene. Local HTTP hosted acceptance verifier PASS 2/2 bilingual pages for HTTP/title/meta/H1/canonical/hreflang/robots/source-version/hygiene with noindex retained.
- GitHub Admin Content CI run `33958334178` completed SUCCESS for `validate`; Heavy browser/SEO handoff job skipped by policy.
- Live refs at checkpoint: feature `6079b6d4`, main `64fa58a1`, merge base `ed0cf38`, divergence main-only 269 / feature-only 148.
- Supabase inventory rechecked: AquaGuide `ydiygvhuqpogmqlcvgob` ACTIVE_HEALTHY with zero development branches; separate `ice-glide-staging-sg` is unrelated. Therefore real hosted Care SEO acceptance cannot honestly use a non-Production AquaGuide source yet.
- No Production source was substituted, no branch/project was created, no cost was incurred, no index unlock occurred, and no main merge/rebase was performed. Next step requires an existing non-Production AquaGuide source or explicit approval for a cost-bearing Supabase branch/project.

## 2026-09-05 — Care SEO no-cost hosted Staging acceptance
- Corrected the earlier false blocker: a persistent paid AquaGuide Supabase Staging project is not required. Used disposable local Supabase as the non-Production source, then destroyed it after snapshot export.
- Ephemeral flow: core publication + Care SEO Editorial migrations → Published Care `care_water_stability` version 2 → EN/zh-CN SEO Draft → submit review → human Approved → sanitized two-record handoff. Local-only service-role grants were used inside the disposable stack to exercise server-only APIs; no grant/migration was applied live.
- Real DB run found RFC3339 timestamp mismatch (`+00:00` rejected by Z-only schema); fixed in `5d2542ac68121809f68fd12e038a5d158c319606` with regression coverage. Full Care SEO tests, API TS, lint and root build PASS.
- Snapshot hygiene PASS: only category/urgency/summary/immediateActions/avoidActions/observeItems/nextStep plus approved SEO fields; no symptoms/diagnosis/evidence/revision/audit/operator metadata.
- Explicit one-file publish commit `18711afc787dc48c814a63de2551ac56f4a99793`; GitHub CI `33959147061` SUCCESS. Vercel `dpl_5XMFuB4p4VWyKBxyA5ML36ucc6D7` READY; build log confirms 2 Care SEO pages merged into `dist`.
- Protected hosted acceptance PASS 2/2: HTTP 200, deployment X-Robots noindex, page noindex, title/meta/H1, source version 2, branch-alias canonical, EN/zh-CN/x-default hreflang and hygiene. Temporary Vercel share authentication was used without disabling protection and then removed locally.
- Production, index, main and live databases remained untouched. Next gate is an explicit Care SEO Index/Production release decision; default remains locked.

## 2026-09-05 Care SEO release-readiness gate closeout
- `c1f4f35a3d4135f0b1312d655f1bbab258dcc98c` adds a fail-closed release-readiness contract; it performs no Production write and cannot toggle indexability.
- Closed a bypass found during audit: the Staging static builder now rejects `index` even if `staging-snapshot.json` is hand-edited; Staging sitemap remains non-indexable.
- `7ba66f9d9d0610d3be3e5ec121f3e157004849d2` is the snapshot-only republish using the new gate. Vercel `dpl_3knobTC9R84wkVfaVsCZrPnnrXrp` is READY; protected hosted acceptance passed 2/2 EN/ZH pages with noindex retained.
- `cbc4cdd0b2b1f5939dfb93abd9f3c7c28286f9d9` records non-secret `content/care-seo/staging-acceptance.json`, bound to the exact snapshot SHA-256, snapshot Git SHA, deployment ID and canonical base. Evidence-only Vercel deployment was correctly skipped by the ignore-build guard.
- `npm run check:care-seo-release-readiness` now resolves the accepted snapshot/evidence and returns `readyForProductionIndex: false` with the single blocker `explicit_human_release_decision_required`. No `release-decision.json` was created.
- Snapshot CI `33961210274` and evidence-only CI `33961337300` both passed all lightweight gates including release-readiness; Heavy skipped. Production, index, main and live DB remain untouched.

## 2026-09-05 — hold_noindex + Care SEO AI advisory closeout
- User explicitly chose `hold_noindex`; persisted release decision stays bound to accepted snapshot/deployment and cannot unlock Production/index.
- Added Care SEO AI advisory with Published-Care-only exact version binding, legacy-source rejection, source extraction, conflicts, impact explanation, SEO Draft suggestion, forced noindex and fail-closed provider handling.
- Admin UI apply is local-only; browser 1280/390 acceptance proves AI generation/application creates no Editorial write before explicit Save Draft.
- Reused existing Vercel DeepSeek-compatible AI configuration; no new provider/key. Local key absent; no live paid model call made in this round.
- AI functional `a3f582c2`; two-phase reacceptance test fix `af68d40a`; final snapshot `fd960667`; Vercel `dpl_Fx1NEVe7safjqmte2QPY6zvPQB5D` READY; hosted verifier 2/2 PASS/noindex.
- Final snapshot SHA-256 `cea5def0bb343747be439deaae8ac6e23bc449483034a260c1f87fa4303c9879`; evidence + hold binding commit `5899d643`.
- CI PASS: `33962566946`, `33962759009`, `33962809578`, `33962944072`; Heavy skipped by policy.
- All defined P0/P1/P2/AI functional queue items are closed. Next: dedicated feature ↔ live-main reconciliation audit; no merge/Production/index/live-migration action authorized.

## 2026-09-05 — Return to Species SEO Admin usability
- Corrected project scope after user reported the prior acceptance URL was the fish-tank frontend rather than SEO Admin.
- On `feature/admin-content-v0`, `843b9e31` simplifies first-screen controls and adds a queue-driven `当前下一步` CTA.
- PASS: Admin contract, full root build, 1440/390 no-overflow browser checks, CTA queue routing, read-only no-write check. Online light CI `33970208210` SUCCESS.
- Added safe localhost/`*.pages.dev` `?demo=1` read-only entry for hosted UI acceptance while Vercel free build quota is rate-limited.
- Next: push this checkpoint once, verify exact-SHA Cloudflare `/admin/seo/?demo=1`, then hand that SEO-specific URL to the user. Production/index/main/live DB remain untouched.

## 2026-09-05 — SEO Admin hosted acceptance entry verified
- `ca6dda1c` deployed to Cloudflare Pages and the independent `admin-content` Vercel project; Admin CI `33970948642` PASS.
- Verified `/admin/seo/?demo=1` on Cloudflare at 1440/390: correct Species SEO Admin title, one current-next-action CTA, zero overflow, queue routing, and zero enabled Save actions.
- Canonical UI acceptance URL is the stable feature Pages URL; this is intentionally read-only.
- Found original AquaGuide feature Preview has 12 Admin Repo/GitHub write env keys while independent `admin-content` has only review-mode config. Automated secret transfer was safety-blocked; no values were exposed/copied.
- Next user-facing step: user reviews the hosted SEO Admin UI and sends screenshots/feedback. Writable Preview credential restoration remains a separate secure configuration task.

## 2026-09-05 — Species SEO Admin information hierarchy V2
- User reported that key information/buttons/sections lacked hierarchy and critical steps were buried in editing.
- `1e1414ec` replaces competing first-screen controls with a visible four-stage workflow: Data Review → Content Edit → Human Review → Staging.
- Added one `现在只做这件事` command, separate current-page `关键操作`, explicit `详细编辑`, and collapsed `更多工具` for batch/history/translation/diagnostics.
- Mobile changed from hidden horizontal stage scrolling to a fully visible 2×2 stage grid.
- PASS: Admin contract, Repo auth/write-boundary guards, root production build, 1440/390 hierarchy browser checks, zero horizontal page overflow.
- Historical `test:admin-content-ui` currently fails in an unrelated Care SEO async assertion (`Published v1` expected before the loading state clears); no Care SEO code was changed in this round.
- Hosted exact-SHA Cloudflare `94ddb622` PASS for `1e1414ec` at 1440/390: all four stages visible, 390px 2×2 stage grid, page action + detail hierarchy present, advanced tools collapsed, zero overflow.
- Next: user visual/operator acceptance on the stable feature SEO Admin demo. Production/index/main/live DB remain locked.
