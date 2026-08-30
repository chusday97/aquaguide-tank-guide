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
