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
- Staging snapshot export now calls the probe before reading Published rows and refuses schema versions below 6 or any missing feature flag.
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
