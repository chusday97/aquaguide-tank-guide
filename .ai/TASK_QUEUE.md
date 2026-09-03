# Task Queue

> **READ FIRST (2026-09-02): `.ai/HANDOFF_LATEST.md` is the canonical current-state handoff. Older sections below are historical unless the latest handoff explicitly retains them.**


Updated: 2026-09-02

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
- [x] Superseded: do not provision a dedicated AquaGuide Supabase staging branch/project for Species SEO; Repo-backed content is now the runtime/staging authority.
- [x] Superseded: hosted Supabase migration/secrets are no longer required for Species SEO Preview deployment.
- [x] Replace database-export direction with GitHub Repo Draft Store + explicit staging snapshot publication.
- [ ] Final hosted Repo vertical-slice acceptance: login → edit H1 → Save to `seo-admin-drafts` (no deploy) → Ready for Review → Approved Draft → explicit Staging Publish → one Preview rebuild → hosted HTML source changes; Production Published stays locked.

## 2026-09-01 staging lifecycle separation
- [x] Add `staging_release` generator mode: release-style HTML/sitemap on a non-production host from Approved Draft rows only.
- [x] Require an explicit `STAGING_CATALOG_KEYS` allowlist for hosted staging export; dedupe keys and cap each release at 20 Species.
- [x] Keep Production-style `release` Published-only; Approved Draft rows are ignored by normal release mode.
- [x] Strip reviewer identity from the server-side staging snapshot.
- [x] Add generator/guard contract tests for Approved Draft staging release and missing/oversized allowlists.
- [ ] On hosted acceptance, verify deployment-level `X-Robots-Tag: noindex` in addition to intended page-level SEO metadata.

## 2026-09-01 Repo-backed Species SEO authority
- [x] Add server-side Admin session with HttpOnly/SameSite cookie; no Supabase Auth dependency.
- [x] Add GitHub Contents API store for `content/species-seo/admin-store.json` on `seo-admin-drafts`.
- [x] Force all Repo content writes to Draft and invalidate approval after editorial/index changes.
- [x] Persist revision snapshots and Draft-only rollback in the Repo JSON store.
- [x] Add Repo API adapter so the existing three-pane UI/Data Review/History workflow does not need a product rewrite.
- [x] Move `/api/translate` authorization to the same server-side Admin session.
- [x] Disable Vercel deployments for `seo-admin-drafts`; ordinary Save must not deploy.
- [x] Add explicit Repo Staging Publish action that writes a sanitized allowlisted snapshot to the staging code branch.
- [x] Make root Preview build prefer `content/species-seo/staging-snapshot.json` and execute `staging_release`.
- [x] Add Repo backend + API gates proving H1 edit → approval reset → re-approval → staging HTML generation without Supabase.
- [x] Remove Supabase SDK from the SEO Admin browser runtime; latest Admin build transforms 52 modules instead of the prior 93.
- [x] Configure the server-only Repo Admin environment in Vercel Preview.
- [ ] Hosted acceptance: verify Draft Save creates/updates `seo-admin-drafts` with zero Vercel deploys.
- [x] Hosted acceptance: explicit Staging Publish causes exactly one Preview rebuild and returned Species HTML contains the edited H1.
- [x] Verify Preview response retains deployment-level `X-Robots-Tag: noindex`.

## 2026-09-01 Hosted Repo acceptance follow-up
- [x] Create and seed `seo-admin-drafts`.
- [x] Prove a real Draft content commit triggers neither GitHub Actions nor Vercel deployment.
- [x] Configure branch-scoped Preview Repo paths + server-session auth/hash secrets.
- [x] Add hosted Repo capability probes and login-before-editor fail-closed UI.
- [x] Add a fine-grained GitHub token scoped only to `chusday97/aquaguide-seo-content` + `chusday97/aquaguide-tank-guide` with Contents read/write. The broad local `gh` OAuth token was not reused.
- [x] Redeploy after token configuration; hosted Health is fully green for auth/token/private Content Repo/public Staging Repo/read-write/branches/store.
- [ ] Complete hosted H1 Save → Approved → Staging Publish → one rebuild → HTML source change acceptance.

## 2026-09-01 Dual-repo privacy hardening
- [x] Create private `chusday97/aquaguide-seo-content`.
- [x] Seed private `main` and `seo-admin-drafts` with the empty Admin store.
- [x] Remove the public AquaGuide `seo-admin-drafts` branch before real editorial content exists.
- [x] Remove public `content/species-seo/admin-store.json`.
- [x] Make `ADMIN_GITHUB_CONTENT_REPO` mandatory; no fallback to the public app repo.
- [x] Split Health into private Content Repo and public Staging Repo readiness.
- [x] Add dual-repo routing gate for Draft PUT vs Staging PUT.
- [x] Configure branch-scoped Vercel Preview repo names/paths and private source branch.
- [x] Add least-privilege `ADMIN_GITHUB_TOKEN` to Preview: selected repositories = `aquaguide-seo-content` + `aquaguide-tank-guide`; Contents Read/Write only.
- [x] Redeploy and confirm Health: all Content/Staging repository checks green.
- [ ] Hosted vertical slice: edit H1 → private Draft commit (0 Aqua CI/deploy) → Approve → explicit Staging Publish → one Aqua Preview rebuild → returned HTML contains exact H1.

## 2026-09-01 Hosted dual-repo gate status
- [x] GitHub CI #32 SUCCESS for `eb478ab`.
- [x] Vercel Preview for `eb478ab` READY.
- [x] Hosted Health identifies private Content Repo and public Staging Repo correctly.
- [x] Hosted Admin Session/password/session secret configured.
- [x] Preview remains deployment-level noindex.
- [x] Add docs-only Vercel ignore guard without suppressing code or staging-snapshot deploys.
- [x] Supply least-privilege `ADMIN_GITHUB_TOKEN` (two selected repositories; Contents Read/Write only).
- [x] Recheck hosted Health until all repo/write/branch/store flags are green.
- [ ] Execute real hosted H1 edit → private Draft commit → approval → staging snapshot → one Preview rebuild → returned HTML exact-H1 acceptance.

## 2026-09-01 hosted dual-repo vertical-slice evidence
- [x] Private Draft Store received real bilingual Approved Draft content for `sp_0001` on `aquaguide-seo-content/seo-admin-drafts`.
- [x] That private Draft commit produced 0 AquaGuide Vercel deployments.
- [x] Explicit public staging snapshot commit `118fa21` produced exactly 1 AquaGuide Preview deployment.
- [x] Hosted EN H1 = `Red Cherry Shrimp Care Guide | Dual-Repo Staging`.
- [x] Hosted ZH H1 = `极火虾饲养指南｜双仓 Staging 验收`.
- [x] Both hosted static pages return page-level `noindex,follow` and retain compatibility / browse / planning CTAs for `sp_0001`.
- [x] GitHub Admin Content CI #34 completed SUCCESS for the staging snapshot commit.
- [ ] One final browser-only acceptance remains: sign into `/admin/seo/` with the rotated Admin password and perform one Save through the hosted Admin UI/API. Automated secret reading is intentionally blocked, so this must be a human paste/click rather than a tool bypass.

## 2026-09-01 Admin productization after first human use
- [x] Fix hosted login UX: prefill `admin@aquaguide.local` and stop requiring the user to remember the internal account.
- [x] Separate source-record count from current SEO-page candidates: 486 source rows / 458 current page candidates / 28 folded duplicate rows / 276 Base groups.
- [x] Fold unresolved duplicate secondary records from normal SEO navigation without deleting Product Truth.
- [x] Make duplicate visibility review-aware: confirmed distinct restores both; confirmed duplicate retains the selected SEO main page.
- [x] Scope duplicate publish blockers to the affected duplicate set instead of blocking every page in the Base group.
- [x] Make workflow queue counts use the same duplicate-aware page candidates.
- [x] Replace Chinese `Base / Variant / Override / 使用 Base 值` terminology with shared-content/page-specific language.
- [x] Make unsaved content edits visibly reset review to Editing; replace database-like status controls with `草稿 · 不会直接上线` + `内容流程`.
- [x] Verify rendered DOM locally and complete full Admin/root build regression.
- [x] GitHub CI #36 SUCCESS and Vercel `8d1905c` Preview READY with fully green hosted Health.
- [ ] Human click-path acceptance: from the hosted editor, save one edited Draft and confirm private `aquaguide-seo-content` commit + zero AquaGuide deployment.
- [ ] Next UX pass: simplify Data Review from evidence-oriented cards into a short decision workflow and reduce Publish Readiness drawer density.

## 2026-09-01 current next
- Do not ask the user to submit 极火虾 again; zh-CN is already `ready_for_review` after compensating for the prior broken submit interaction.
- Next human action, only if continuing acceptance: `批准预览` for zh-CN. Before Staging publish, verify bilingual Species + Base approvals and replace old acceptance/test copy intentionally.


## 2026-09-02 — Latest continuation pointer
- **Canonical cross-session handoff is now `.ai/HANDOFF_LATEST.md`. Read it first before changing Species SEO Admin.**
- Latest code HEAD at sync: `fae815f`; GitHub Admin Content CI #43 (`33532055685`) SUCCESS; Vercel Preview `dpl_EeFvNvuqySA6RVpHYsvjPCuCG8Jw` READY.
- Real hosted human path is proven through Chinese approval for `sp_0001`; zh-CN is Approved/version 6/index. English `sp_0001` remains Editing and still contains acceptance copy, so do not Staging Publish it yet.
- Data Review now reports 32 pending issues after the 极火虾 duplicate decision. `Pelvicachromis pulcher` (`sp_0214 / sp_0338`) remains an unresolved duplicate example.
- Duplicate labels are now actionable: `处理重复` opens the current group's review drawer with two decision buttons and a final `确认并保存`; no review-decision dropdown.
- Status and actions are permanently separated; review actions update only review state. Inheritance UI is centralized under `内容来源 / 管理基础模板`, not repeated `公共内容` explanations.

## 2026-09-03 first real batch operational blockers
- [x] Make SEO template import atomically create missing locale Base templates without overwriting existing Base content.
- [x] Prove failed bulk import leaves no partial Base/page writes and records one Activity on success.
- [ ] Prepare first low-risk 10–20 Species bilingual SEO Draft batch from Product Truth; exclude unresolved duplicate/category-conflict groups.
- [ ] Run CSV diff/no-op validation and import through authenticated Admin only.
- [ ] Batch submit + approve the intended bilingual pages/Base templates.
- [ ] Explicitly Staging Publish only the reviewed allowlist and verify generated EN/ZH metadata/CTA/noindex.
- [ ] Keep Production locked unless explicitly authorized.

## 2026-09-03 first real Species batch
- [x] Make bulk SEO import atomic and create missing Base templates without overwriting existing Base content.
- [x] Prepare a 14-Species bilingual noindex batch with no unresolved duplicate/category-conflict blocker.
- [x] Run isolated end-to-end Draft → review → Staging snapshot → 28 static page generation dry-run.
- [x] Remove publication-facing/internal `Product Truth` jargon exposed by the dry-run.
- [ ] Authenticated Admin: upload batch-01 zh-CN CSV, inspect diff, import Draft.
- [ ] Authenticated Admin: upload batch-01 English CSV, inspect diff, import Draft.
- [ ] Batch submit + approve the intended 14 Species and required Base templates.
- [ ] Explicitly Staging Publish the 14-Species allowlist once and verify hosted EN/ZH output + deployment noindex.
- [ ] Keep Production locked until explicit authorization.

## 2026-09-03 source identity / batch-01 correction
- [x] Block incomplete source scientific identity before CSV Draft import.
- [x] Surface incomplete source identity as its own workflow next action.
- [x] Fail static Species generation on incomplete source identity.
- [x] Remove `sp_0069` from batch-01 and replace with clean `sp_0011`.
- [x] Re-run 14-Species bilingual full-chain dry-run after replacement.
- [ ] Authenticated Admin: import corrected zh-CN batch-01 after field-level diff review.
- [ ] Authenticated Admin: import corrected English batch-01 after field-level diff review.
- [ ] Batch submit + approve 14 Species + required Base rows.
- [ ] Explicit one-time Staging Publish for the 14-Species allowlist; verify hosted EN/ZH/noindex.
- [ ] Keep Production locked until explicit authorization.

## 2026-09-03 operational template clarification
- [x] Replace full-catalog CSV dump with a blank uploadable template.
- [x] Put per-field meaning and accepted format inside the downloaded template.
- [x] Provide 20 blank working rows and 3 typical examples below them.
- [x] Ensure guide/example rows are never imported and untouched template uploads safely with 0 marked rows.
- [x] Separate normal writable Vercel Preview from explicit read-only demo mode.
- [ ] Authenticated Preview: import the real batch-01 zh-CN CSV and inspect field-level diff.
- [ ] Authenticated Preview: import batch-01 English CSV and inspect field-level diff.
- [ ] Batch submit + approve the intended 14 Species/Base resources.
- [ ] One explicit Staging Publish + hosted EN/ZH verification.
- [x] Clarify canonical hosted path: use AquaGuide Preview `/admin/seo/`; standalone `admin-content` Preview is not the real writable import surface.
