# Live Status

Updated: 2026-09-01
Branch: `feature/admin-content-v0`

## Current state
- Public AquaGuide `main`: untouched.
- Production Supabase: untouched; Admin migrations 001–007 remain branch-only proposals.
- A+B is green through schema v7 and Controlled Preview safety.
- Local read-only Admin preview is running at `http://localhost:3020/`.
- Local generated static Controlled Preview remains available at `http://localhost:4020/` while that process is alive.
- Catalog remains 486 rows → 276 Base Species; 5 category-conflict groups + 28 duplicate sets = 33 Data Review issues.

## Latest committed baseline
- `539baf4` — three-pane live workspace + global Admin language + lazy Product Truth preview.
- GitHub Actions run `33323234484` completed SUCCESS: contract, migration 001–007 ephemeral Supabase gate, production build, generated catalog parity and diff hygiene all green.
- `374db2f` remains the verified queue-filter baseline: 276 → 32 issue groups → 276 restore with zero page errors.

## UI convergence currently verified locally
- `aqua-fronted-cms` has been inspected as the AI Studio visual source. It is not connected as a backend/business dependency.
- Current Admin now uses a true three-pane desktop workspace: 270px Species navigation / flexible editor / 460px live preview; at 1600px the editor receives 870px.
- Left navigation is Category → Base Species → Variant. Parent click enters Base authoring; child click enters Variant authoring.
- Workflow filters are simplified to All / Data Issues / Awaiting Review / Ready.
- Main editor no longer embeds a second Google-preview column; right preview owns Page / Google / Mobile.
- Unsaved H1 edits stream to the live page immediately.
- Secondary operations (Data Review, readiness details, translation, batch, revision history, workflow overview) are progressively disclosed instead of permanently occupying the editor.
- Live Preview now lazy-loads image + read-only water/tank/difficulty/description facts from the existing catalog projection; Species Group JSON stays lightweight. Chrome confirms the current Species image and facts render correctly.
- Browser evidence at 1600×1000: left=270, center=870, right=460; H1 live update PASS; Base editor switch PASS; issue filter 33 issues → 32 groups; `pageErrors=[]`.
- Local Supabase gate remains PASS after the UI refactor; schema_version=7, RLS/rollback/static generation unchanged.

## Current local delta
- Top workflow navigation now uses semantic state colors: Data Review amber, Awaiting Review blue, Preview-ready green. Browser computed-style verification confirms all three states render distinctly.
- This small UI delta is intentionally being synchronized with the Inspector roadmap rather than treated as a standalone product milestone.

## Remaining product work
1. P1 next: refine spacing, preview fidelity and responsive behavior after the Inspector/inheritance/tool-drawer milestones.
2. Re-check Vercel Preview when quota permits.
3. Validate live English AI suggestions when the server-only provider key is available.
4. Production migration/public deploy remains a separate explicit approval.

## 2026-08-31 Admin UI / i18n status
- Local Review remains available at `http://localhost:3020/`.
- Three-pane browser proof at 1600px: left 270px / editor 870px / preview 460px.
- Global UI locale switch persists via `aquaguide-admin-app-locale` and updates `<html lang>`.
- Browser proof: UI English + content Chinese coexist; the right frontend preview remains Chinese when `contentLocale=zh-CN`.
- Product Truth lazy-load proof: `sp_0030` renders a 591px source image plus 18–28°C / pH 6.5–8.0 / 30L+ facts after the group projection was de-duplicated.
- B layer remains green through migration 007, RLS, rollback, bilingual generator and Controlled Preview gates.
## 2026-08-31 Preview Inspector evidence
- Center focus → right selection: H1 stays Page; SEO Title / Meta Description automatically switch the right pane to Google.
- Right click → center selection: Intro/H1 scroll and highlight the mapped editor field without forcing input focus.
- Base mode: inherited H1 maps to Base H1 template; Hero Image routes back to Current page because Image Alt is page-level.
- Hover shows the element label; click locks the outline and displays source + edit path.
- Product Truth temperature shows `Product Truth · 只读 / Product Truth → 只读` and leaves zero editor fields selected.
- Chromium regression `pageErrors=[]`; contract guards the six core mappings, Base targets, preview targets and read-only Product Truth behavior.
## 2026-08-31 Inheritance-control evidence
- Inherited H1 displays the resolved Base value with no editable input until Override is chosen.
- Override opens/focuses the input; unsaved text updates the right Preview immediately.
- `Use Base value` removes the Variant value, returns the field to Inherited, and restores the effective Base H1 in Preview.
- SEO Title Override automatically switches the selected Preview element to Google.
- A browser regression caught and removed an ambiguous nested-button-inside-label interaction; inheritance containers are now non-label wrappers with explicit input aria-labels.

## 2026-08-31 Tool drawer evidence
- Chromium at 1600×1000 measures editor x=270..1140, drawer x=580..1140, Preview x=1140..1600: no overlap.
- History closes via Escape, close button and backdrop; Data Review, Readiness, Workflow and Translation render inside the drawer with `pageErrors=[]`.
- Workflow Pending action closes the drawer and applies the real left-sidebar workflow filter.
- Editable Preview selection dismisses the drawer and highlights the editor field; Product Truth read-only selection does not invent an edit path.
- Variant and Base status selectors expose only Draft + disabled Published; Archived is removed from Species SEO UI.
- Contract/build and local Supabase schema-v7 gate remain PASS.

## 2026-08-31 Generator / responsive Preview evidence
- 1600px remains 270 / 870 / 460; 1200px remains 248 / 552 / 400 with no overflow.
- 1179/1120/1080 switch to 240px navigation + wide editor with no off-screen clipping.
- At 1120px the compact Preview trigger is visible; clicking editor H1 opens the Preview overlay with H1 selected, clicking that Preview H1 closes the overlay and highlights the editor field.
- 1200px+ keeps the persistent Preview and hides the compact trigger.
- Live Page no longer contains generator-absent care sections; Hero + facts + Product Truth note render and Inspector hover/selection remain green.
- Contract/build/local schema-v7 Supabase gate PASS.

## 2026-08-31 Calm editor density + authority routing
- `d79058f` clean GitHub A gate `33326654737` completed SUCCESS before this refinement started.
- Variant header no longer repeats catalog/status/title-inheritance pills; it now shows one `Draft · Editing/编辑中` line. Base uses the same pattern.
- Focus Keyword, Index Strategy, Canonical target and derived URL live under default-collapsed Advanced SEO; an active index/canonical blocker forces that disclosure open.
- Inherited Base shared intro is collapsed by default instead of expanding full Base copy inside every Variant page.
- Chromium at 1440px measures the common Variant editor at ~1032px tall versus ~1333px before the density work (~23% reduction), with Advanced SEO collapsed.
- Preview-origin Inspector routing now follows content authority: inherited H1/Intro/metadata → Base Species; image alt / localized English name / Variant overrides → Current page; Product Truth stays read-only.
- Editor-origin Inspector selection never changes authoring scope just to highlight Preview. Browser regression: inherited H1 editor click stays Current page; Preview H1 click switches Base and highlights Base H1; Preview Hero Image switches back to Current page. `pageErrors=[]`.
- Contract/build/local schema-v7 Supabase gate PASS.

## 2026-08-31 primary-editor density evidence
- Default Variant editor height at 1440×900: ~936px (previous audit ~1333px).
- Visible primary path: Meta Title / Meta Description / H1 / Intro / Image Alt; Advanced SEO is collapsed unless a blocker requires attention.
- Header status: `Draft · 编辑中/待审核/已审核`; repeated catalog/title-inheritance pills removed.
- Intro focus still selects the mapped live Preview element; browser `pageErrors=[]`.
- Responsive topbar prioritizes workflow state over admin identity details at common laptop widths.

## 2026-08-31 editor status-control parity
- Variant and Base editors now use the same explicit footer controls: `审核 · <state>` and `状态 · <lifecycle>`.
- Review states use neutral/blue/green semantics; Draft uses amber and Published uses green while Production Published remains locked.
- Browser regression confirms Base and Variant both retain `Draft · review-state` header summaries, live Preview visibility and zero page errors.

## 2026-08-31 three-pane visual regression evidence
- Editable selection: left active Variant, center Inspector target and right Preview selection use the same green token family.
- Read-only Product Truth selection uses graphite outline/background/tag and explicitly reports `Product Truth · 只读`.
- Active Variant parent Base name + hierarchy guide remain visible in the shared selection family; issue marks remain amber.
- Chromium 1600×900: editable H1, read-only temperature, Base/Variant hierarchy PASS; pageErrors=[].

## 2026-08-31 workflow-filter regression
- Left filters now use amber / blue / green semantics matching the top workflow states.
- Browser: Chinese `问题 / 待审核 / 预览`; English `Issues / Awaiting Review / Preview`; workflow banner is fully localized.
- Data Review filter regression: 33 issues → 32 Base groups → clear → 276 Base groups; pageErrors=[].
- Parent `c6c65b7` A gate run 33366834732 SUCCESS.

## 2026-08-31 navigation count-unit regression
- Left navigation now reads `全部/All 276`; catalog summary remains 486 records.
- `问题/Issues 33` continues to represent pending Data Review issues; active banner explicitly reports 32 affected Base groups.
- Localized hover help explains Base-group / issue / review-item / Preview-page units without increasing button width.
- Chromium zh/en regression PASS; pageErrors=[].

## 2026-08-31 unsaved-change evidence
- Isolated writable browser gate: Variant edit → dirty indicator → Save enabled; cancel navigation retains edits; confirmed navigation discards; successful local save clears dirty and disables Save.
- Content-language switching follows the same discard confirmation contract.
- Base browser gate: clean `beforeunload=false`; dirty `beforeunload=true`; cancel keeps Base edits; local save clears dirty; confirmed scope change discards and returns to Variant.
- Re-clicking the already-selected Variant produces no confirmation and preserves dirty state.
- Browser `pageErrors=[]`; contract/build/local schema-v7 Supabase gate PASS.

## 2026-08-31 live workflow-label localization
- Active workflow filter banners now derive labels from current `appLocale`; switching 中文/English updates an already-active filter immediately.
- Browser regression: Data Review and Awaiting Review banners switch live between Chinese/English with zero page errors.

## 2026-08-31 image Inspector semantics
- Hero image Inspector now maps to `Image Alt`, not to image replacement.
- Selected image status explicitly says `Alt custom/not set · Image source read-only`; Product Truth remains the image authority.
- Inspector edit path now includes the exact mapped field after scope/section.
- Browser regression in Chinese/English: image selection highlights the Image Alt editor target and reports zero page errors.

## 2026-08-31 publication-readiness status
- Latest stable pushed Admin HEAD: `2a737de fix(admin): clarify image inspector authority`. GitHub A gate run `33370177087` SUCCESS.
- Stable chain now includes grouped navigation, Base/Variant inheritance, bilingual editorial rows, Data Review, editorial review, Publish Readiness, Controlled Preview, generator-aligned Page Preview, bidirectional Inspector and unsaved-change protection.
- Product Truth is still catalog authority; Content Admin edits editorial SEO only.
- Product Truth loading correctness is locally gated: explicit Loading/Unavailable states, `catalog_key` ownership, no stale cross-Species facts, and retryable lazy JSON fetch. Chromium delayed/race/failure recovery regressions are clean; contract/build/schema-v7 B gate PASS.
- Production Supabase, Production Published and `main` remain untouched.

## 2026-09-01 Admin authority integration evidence
- `/admin/content` renders an Admin Hub with separate Species SEO and Product/Care destinations.
- `/admin/product-content` retains the legacy business content editor and explicitly labels Species fields as Product data, not SEO.
- Root build emits `dist/index.html` and `dist/admin/seo/index.html`; SEO Admin assets use `/admin/seo/assets/...`.
- Static artifact check: `/admin/seo/`, its JS and CSS all return HTTP 200.
- TypeScript, Admin UI regression, Product/Care API contract, SEO Admin contract and root build PASS.

## 2026-09-01 Root Species SEO artifact integration
- Root `npm run build` now runs `build:web → build:seo-admin → build:species-pages`.
- `build:species-pages` is fail-closed around publication input: no `SPECIES_SEO_SNAPSHOT_PATH` means an explicit safe skip; a configured snapshot must use the generator's non-production host guards.
- Representative staging fixture covers 3 catalog records in both locales (6 HTML pages): self-canonical Index, canonical-to-sibling and noindex.
- Full root build merged `/species/**`, `/zh/species/**`, `sitemap-species.xml`, generator manifest and an integration receipt into the same AquaGuide `dist/`.
- Artifact verifier PASS: Title, Meta Description, H1, canonical, hreflang, robots, Image Alt and sitemap inclusion/exclusion.
- Admin contract, Controlled Preview guard, staging Production deny-list and Admin Hub/Product-Care browser regression remain PASS.
- Production Published, Production Supabase and `main` remain untouched. Next gate is a real hosted staging snapshot/URL vertical slice, not more CMS UI.

## 2026-09-01 Hosted Species staging integration
- Local Vercel-preview simulation PASS: root build auto-selected the staging fixture only for `VERCEL_ENV=preview` + `feature/admin-content-v0` and emitted 6 Species HTML pages.
- Production simulation PASS: `VERCEL_ENV=production` with no explicit snapshot skipped Species generation.
- Generator contract PASS after adding compatibility/browse/aquarium CTAs carrying the real catalog key and `source=seo-species`.
- Awaiting hosted verification on the Vercel deployment produced by the next push.

## 2026-09-01 CTA runtime correction
- Initial hosted CTA check exposed that compatibility deep links preserved query params but did not preselect the Species in the calculator.
- Local correction PASS: `sp_0030` now renders as `Neocaridina davidi var. Yellow · planned ×1`; pageErrors=[]; regression is automated.

## 2026-09-01 Hosted vertical slice evidence
- Vercel Preview `0222f4e` serves the generated Species files as real static HTML, not SPA fallback.
- Hosted EN/ZH index pages, canonical-to-sibling page, noindex page and `sitemap-species.xml` all passed source-level assertions.
- Hosted compatibility deep link passed runtime browser verification: `sp_0030` appears as `Neocaridina davidi var. Yellow · planned ×1`, compatibility UI is active and `pageErrors=[]`.
- GitHub CI #26 failed only because the clean Ubuntu runner had npm Playwright installed but no Chromium executable. The workflow now explicitly installs pinned-project Playwright Chromium before the browser handoff gate.

## 2026-09-01 — Hosted DB readiness
- Latest local database gate: PASS on migrations 001–008 / schema v8.
- Hosted export credentials: server-only secret/service_role required; publishable/anon refused.
- Public Species SEO policy: Published + Approved only.
- Data Review release inputs: server-only.
- One-command root artifact path ready: `npm run build:staging-from-db`.
- Infrastructure blocker: no dedicated AquaGuide hosted staging Supabase branch/project currently exists; Production remains untouched.

## 2026-09-01 — Approved Draft staging release
- Hosted staging no longer depends on Production `Published`. `staging_release` accepts only explicitly allowlisted Draft rows whose editorial review is Approved and has `reviewed_at`.
- `STAGING_CATALOG_KEYS` is mandatory, deduplicated and capped at 20 Species; canonical dependencies must be explicitly included when needed.
- Production-style `release` remains Published-only and ignores Approved Drafts.
- Staging snapshots omit reviewer identity. Hosted acceptance must verify deployment-level `X-Robots-Tag: noindex`; page source keeps intended robots/canonical values for SEO inspection.

## 2026-09-01 — Repo-backed runtime is now primary
- Species SEO Admin no longer imports Supabase SDK in browser runtime; Vite Admin build dropped from 93 transformed modules to 52.
- Browser persistence client is `adminContentClient` → `/api/admin-content/query` → server-side GitHub Contents API.
- Admin login uses `aquaguide_admin_session` HttpOnly/SameSite cookie; translation uses the same session.
- Draft store: `content/species-seo/admin-store.json` on `seo-admin-drafts`; that branch is Vercel deployment-disabled.
- Explicit staging publication writes `content/species-seo/staging-snapshot.json` to the non-production staging code branch and is the only content-edit action intended to trigger Preview build.
- Local gates PASS: Repo backend (`supabase_started=false`, 2 generated bilingual pages, revision history), Repo API auth, Admin contract, root build, 6-page artifact verifier and SEO compatibility handoff.
- Legacy `test:supabase-gate`/migrations remain available for compatibility only and are removed from the primary GitHub Admin CI workflow.
- Remaining hosted blocker is configuration, not database infrastructure: Vercel Preview needs server-only Admin session/GitHub Contents credentials. Production `main`, Production Published and Production Supabase remain untouched.

## 2026-09-01 — Hosted Repo backend diagnostics
- `seo-admin-drafts` remote branch is created and seeded with `content/species-seo/admin-store.json`.
- A real content-only Draft commit on `seo-admin-drafts` produced **0 GitHub Actions runs** and **0 Vercel deployments**, proving normal Save is isolated from CI/deploy cost.
- GitHub Actions run `33484383681` for `5f89864` completed SUCCESS on the new no-Supabase primary gate.
- Vercel Preview `dpl_8hTSbaeKjowQvSFXYkp91g6QJsiX` is READY and serves `/api/admin-content/health` with `X-Robots-Tag: noindex`.
- Branch-scoped Preview config now includes Repo paths plus server-session auth secrets; the generated Admin password was placed on the local macOS clipboard and only its scrypt hash is stored in Vercel.
- The remaining external secret is a repository-scoped GitHub token with Contents read/write. The existing local `gh` OAuth token has broad `repo/workflow` scopes and is intentionally not reused.
- Health now probes token validity, repository readability, Contents-write capability, Draft branch readiness and content-store readability. Admin login fails closed before the editor when these checks are not ready.

## 2026-09-01 — Dual-repo privacy correction
- Private repo `chusday97/aquaguide-seo-content` created and seeded; `main` + `seo-admin-drafts` exist.
- Public `aquaguide-tank-guide/seo-admin-drafts` removed before any real editorial content was stored there; the only test data was an empty store.
- Public root `content/species-seo/admin-store.json` removed. AquaGuide may contain only sanitized staging/release snapshots, never Draft authority.
- Vercel Preview config now declares `ADMIN_GITHUB_CONTENT_REPO=chusday97/aquaguide-seo-content`, `ADMIN_GITHUB_STAGING_REPO=chusday97/aquaguide-tank-guide`, and private source branch `main`.
- Hosted Admin session/password/session secret are configured; `ADMIN_GITHUB_TOKEN` remains intentionally absent until a least-privilege fine-grained token is supplied.
- `test:dual-repo-routing` PASS: exactly two simulated PUTs route to the intended repositories.

## 2026-09-01 — Hosted dual-repo evidence
- `eb478ab fix(admin): isolate SEO drafts in private repo` is pushed to `feature/admin-content-v0`.
- GitHub Admin Content CI #32 completed SUCCESS on a clean runner, including dual-repo routing, root Species artifact integration, catalog parity and diff hygiene.
- Vercel Preview deployment `dpl_gvQV8AY3cGPC2Vk2J5uFuFfFa6Mx` reached READY for `eb478ab`.
- Hosted `/api/admin-content/health` returns `auth_configured=true`, `content_repo=chusday97/aquaguide-seo-content`, `staging_repo=chusday97/aquaguide-tank-guide`, correct branches/paths, and `repo_access_error=token_missing`. This proves every hosted dependency except the GitHub write token is wired.
- Preview responses retain `X-Robots-Tag: noindex`.
- The remaining hosted external gate is one least-privilege fine-grained GitHub token covering exactly the private content repo + public AquaGuide repo with Contents Read/Write only. The broad local `gh` OAuth token is intentionally not reused.
- Added `scripts/vercel-ignore-build.mjs`: docs-only `.ai/**`, `HANDOFF.md`, `PROGRESS.md`, and README changes skip Vercel; any code/config/data or `staging-snapshot.json` change continues deployment.

## 2026-09-01 — Hosted token + dual-repo vertical slice PASS
- Least-privilege `ADMIN_GITHUB_TOKEN` is configured as a Vercel Preview Sensitive variable for `feature/admin-content-v0`.
- Latest hosted Health is fully green: Admin auth, token, private Content Repo read/write, Draft branch/store, public Staging Repo read/write, and Staging branch all true; `repo_access_error` is empty.
- Private `aquaguide-seo-content/seo-admin-drafts` received a real bilingual Approved Draft for `sp_0001`; that private commit caused 0 AquaGuide Vercel deployments.
- Explicit staging snapshot commit `118fa21` in public AquaGuide caused exactly 1 Preview deployment and did not target Production.
- Hosted static EN H1: `Red Cherry Shrimp Care Guide | Dual-Repo Staging`.
- Hosted static ZH H1: `极火虾饲养指南｜双仓 Staging 验收`.
- Both pages are `noindex,follow` and retain compatibility, browse, and aquarium-planning CTAs carrying `species=sp_0001&source=seo-species`.
- GitHub Admin Content CI #34 completed SUCCESS across contract, docs-only guard, root artifact integration, catalog parity and diff hygiene.
- Admin password was rotated again; only its scrypt hash is in Vercel, and the plaintext password was copied to the local macOS clipboard.
- Remaining acceptance is intentionally narrow: one human login + Save through the hosted Admin UI/API. Tool-level secret reading is blocked by the platform safety layer and must not be bypassed.
