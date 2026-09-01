# Task Queue

Updated: 2026-08-30

## Completed
- [x] Isolated Admin app with Auth/admin role/RLS and migrations 001–007.
- [x] 486 catalog rows → 276 Base Species groups; Base/Variant inheritance and batch Drafts.
- [x] Bilingual zh-CN/en authoring + suggestion-only translation architecture.
- [x] Route/canonical/hreflang/index contract + static release generator + revision history/rollback.
- [x] A+B stable validation gate with pinned GitHub Actions ephemeral Supabase.
- [x] Persisted Data Review decisions + Editorial Review + Publish Readiness.
- [x] Controlled Preview Publish with forced noindex and Production/deployable-path guards.
- [x] Queue-level Workflow Overview and filters; Chrome verifies 33 pending issues → 32 Base groups.
- [x] Audit `aqua-fronted-cms` and classify it as visual source only; reject mock readiness/delete/fake-preview logic.
- [x] Integrate first three-pane editorial shell: Species navigation → editor → persistent live frontend preview.
- [x] Add Base-parent / Variant-child navigation and live unsaved Variant preview updates.
- [x] Lazy-load read-only Product Truth for the live preview without duplicating those fields into Species Group JSON.

## Completed — P0 Bidirectional Preview Inspector
- [x] Stable registry for `localizedName`, `h1`, `intro`, `imageAlt`, `seoTitle`, `metaDescription`.
- [x] Center → right selection, mode switching, scrolling, outline and element label.
- [x] Right → center hover/click selection and editor scrolling without forced text-input focus.
- [x] Source state: Custom / Inherited from Base / Product Truth · Read only.
- [x] Inspectable read-only Product Truth facts.
- [x] Page default with automatic Google mode for SEO metadata.
- [x] Base-aware routing and Chromium regression with `pageErrors=[]`.

## Next — P1 Visual refinement
- [x] Reduce repeated inherited/custom badges and convert Meta Title / Meta Description / H1 to `Inherited from Base → Override → Use Base value` interactions.
- [x] Move Data Review, Publish Readiness, Translation, Batch SEO, Revision History and Workflow into editor-cell tool drawers while keeping the live Preview visible and existing DB/RPC callbacks authoritative.
- [x] Reduce primary Variant editor density: one calm lifecycle/review status line, Advanced SEO disclosure for keyword/index/canonical/URL, and collapsed inherited Base intro.
- [x] Route Preview-origin Inspector selection to the authoritative editor: inherited → Base Species, Variant-only/custom → Current page, Product Truth → read-only.
- [ ] Re-check Vercel Admin Preview after Hobby deployment quota reset.
- [ ] Validate 1–2 live translation suggestions after server-only provider key is configured.

## Later
- [ ] Explicit Production migration/public-deploy integration review before unlocking Published.
- [ ] Search Console integration only after public Species routes are deliberately released.

## 2026-08-31 UI milestone
- [x] Preserve the workflow overview baseline and fix 33-issue → 32-group filtering.
- [x] Integrate the AI Studio visual direction without importing mock business logic.
- [x] Establish 270px Species navigation / flexible editor / 460px live frontend preview.
- [x] Stream unsaved Variant edits into Page / Google / Mobile preview.
- [x] Add global Chinese/English Admin interface switch with refresh persistence.
- [x] Keep interface locale independent from content locale.
- [x] Lazy-load Product Truth preview data so Group JSON stays lightweight.
- [x] Add semantic top workflow colors: Data Review amber / Awaiting Review blue / Preview-ready green.
- [x] Implement bidirectional Editor ↔ Preview Inspector before further broad CSS polishing.
- [x] Complete inheritance controls and secondary-tool drawer density pass.
- [x] Align Page Preview to the real static generator structure and preserve Preview access below 1180px with a compact overlay.
- [ ] Continue visual refinement: spacing and typography polish without changing the stable three-pane interaction model.

## 2026-08-31 density pass
- [x] Replace repeated Variant header status pills with one calm lifecycle/review line.
- [x] Collapse Focus Keyword / indexing / canonical / route details into Advanced SEO.
- [x] Reduce Variant Intro default height while preserving resize and Inspector mapping.
- [x] Prioritize workflow status over admin identity text in narrower desktop topbar.

## 2026-08-31 editor state controls
- [x] Make Variant footer lifecycle/review controls self-describing instead of bare values.
- [x] Apply the same state-control language and tones to Base Species editing.
- [x] Keep Published locked and preserve the existing review-state machine.

## 2026-08-31 three-pane hierarchy convergence
- [x] Unify Base/Variant navigation, editor selection and Preview selection around shared selection tokens.
- [x] Give Product Truth Inspector a distinct read-only visual state.
- [x] Preserve parent Base hierarchy context while a Variant is selected.
- [ ] Continue only evidence-based visual polish; avoid further density reductions that do not increase usable information.

## 2026-08-31 workflow filter semantics
- [x] Carry issue/review/Preview-ready semantic colors into the left Species workflow filters.
- [x] Keep workflow filter labels fully localized in both zh-CN and English UI modes.
- [x] Preserve real filter behavior: 33 pending Data Review issues map to 32 affected Base groups; clearing returns 276 groups.

## 2026-08-31 navigation count units
- [x] Use 276 Base groups for the left `All` navigation count instead of 486 catalog rows.
- [x] Keep 486 catalog records visible separately in the catalog summary.
- [x] Explain mixed count units via localized hover help and show affected Base-group count in active workflow banners.

## 2026-08-31 unsaved-change safety
- [x] Show `未保存修改 / Unsaved changes` for Variant and Base editing.
- [x] Guard Species, Base/current-page, content-language, workflow, batch and sign-out navigation.
- [x] Protect dirty state from browser refresh/close with `beforeunload`.
- [x] Keep no-op re-selection from clearing dirty state.
- [x] Verify save/discard/cancel flows against an isolated ephemeral Supabase browser environment.

## 2026-08-31 workflow localization consistency
- [x] Remove mixed-language labels from topbar workflow actions.
- [x] Derive active filter banner labels from live `appLocale` instead of cached click-time strings.
- [x] Keep content-locale prefixes (`中文/Chinese/English`) aligned with interface language.

## 2026-08-31 image Inspector boundary
- [x] Rename ambiguous `Hero image / 主图` Inspector mapping to explicit Image Alt text.
- [x] Mark image asset authority as Product Truth read-only while keeping alt text editable.
- [x] Extend Inspector paths to the exact field level.

## 2026-08-31 frontend SEO publication path
- [x] Finish Product Truth loading correctness: explicit loading state, key-scoped data, no stale facts across Species switches.
- [x] Add regression coverage for delayed catalog loading, rapid Species switching, transient fetch failure and retry; contract/build/B gate pass locally.
- [ ] Define an explicit Published snapshot boundary separate from Controlled Preview Draft snapshots.
- [ ] Generate a tiny staging set of real Species pages from approved bilingual fixtures; do not publish all 486 records.
- [ ] Verify staging HTML source for title/meta/H1/canonical/robots/hreflang/alt and verify sitemap inclusion only for indexable pages.
- [ ] Connect the staging Species artifact into the AquaGuide frontend build/deploy path without enabling Production Published.
- [ ] Add a product CTA handoff contract so SEO landing pages can pass `catalog_key` into AquaGuide compatibility/recommendation flows.

## 2026-09-01 AquaGuide ↔ SEO Admin integration
- [x] Finish and gate Product Truth loading correctness without stale Species facts.
- [x] Establish one authoritative Species SEO Admin entry; `/admin/content` is now an Admin Hub, `/admin/product-content` owns Product/Care content, and `/admin/seo/` owns Species SEO.
- [x] Integrate the Species generator into the AquaGuide root deployment artifact with an explicit snapshot-only build step; no snapshot = safe skip.
- [x] Build 3–5 representative bilingual Species pages in staging.
- [x] Verify final HTML: title, meta, H1, canonical, hreflang, robots and sitemap.
- [x] Add real AquaGuide compatibility / aquarium-planning CTA return paths with Species ID + `source=seo-species`.
- [ ] Keep Production publishing locked until the staging vertical slice passes.

## 2026-09-01 hosted staging vertical slice
- [x] Make the SEO staging branch auto-consume only the committed 3-Species Published fixture on Vercel Preview.
- [x] Keep Production builds fail-closed: no explicit snapshot means no generated Species artifact.
- [x] Add Species-page CTAs to compatibility, browse/detail and aquarium planning with catalog key + `source=seo-species`.
- [x] Verify the CTA query contract against existing Encyclopedia/Aquarium route consumers.
- [x] Verify the next Vercel Preview deployment returns the 6 static HTML pages + sitemap rather than SPA fallback.
- [x] Fetch and assert hosted title/meta/H1/canonical/hreflang/robots/alt + CTA URLs.
- [x] Browser-check at least one hosted CTA into the correct AquaGuide Species context.

## 2026-09-01 CTA handoff correction
- [x] Correct compatibility deep-link semantics so SEO Species IDs enter the compatibility calculator as planned candidates.
- [x] Add browser regression `verify:seo-species-handoff` and wire it into the Admin CI integration step.
- [x] Verify the corrected handoff on the next hosted Vercel Preview.

## 2026-09-01 hosted vertical slice acceptance
- [x] Hosted Vercel Preview returns real static Species HTML and sitemap.
- [x] Hosted EN/ZH index, canonical and noindex strategies match expected metadata and sitemap rules.
- [x] Hosted SEO compatibility CTA preselects `sp_0030` as a planned species with zero page errors.
- [x] Diagnose CI-only Playwright failure as missing clean-runner Chromium and add explicit browser installation.
- [x] Confirm the replacement GitHub Actions run is fully green, including root artifact integration and diff hygiene.

## 2026-09-01 hosted Supabase publication boundary
- [x] Add migration 008: public Species SEO visibility requires `published + approved`; unapproved edits fail closed.
- [x] Move staging publication export to server-only Supabase secret/service-role credentials; publishable/anon credentials are refused.
- [x] Remove anon/authenticated access to Data Review release-resolution RPC and add explicit service_role Data API grants.
- [x] Upgrade release readiness probe to schema v8 with `server_export_ready`.
- [x] Add one-command `build:staging-from-db` path: hosted staging Supabase → Published Snapshot → AquaGuide root `dist/`.
- [x] Verify migration 001–008 on a fresh ephemeral Supabase instance.
- [ ] Provision a dedicated AquaGuide hosted staging branch/project only after explicit cost approval.
- [ ] Apply migrations 001–008 and configure server-only staging secrets in the Preview deployment.
- [ ] Replace the committed fixture in Vercel Preview with the hosted Approved Draft database export + explicit `STAGING_CATALOG_KEYS`.
- [ ] Final vertical-slice acceptance: edit H1 in Admin → Save → Ready for Review → Approved Draft → staging rebuild → hosted HTML source changes; Production Published stays locked.

## 2026-09-01 staging lifecycle separation
- [x] Add `staging_release` generator mode: release-style HTML/sitemap on a non-production host from Approved Draft rows only.
- [x] Require an explicit `STAGING_CATALOG_KEYS` allowlist for hosted staging export; dedupe keys and cap each release at 20 Species.
- [x] Keep Production-style `release` Published-only; Approved Draft rows are ignored by normal release mode.
- [x] Strip reviewer identity from the server-side staging snapshot.
- [x] Add generator/guard contract tests for Approved Draft staging release and missing/oversized allowlists.
- [ ] On hosted acceptance, verify deployment-level `X-Robots-Tag: noindex` in addition to intended page-level SEO metadata.
