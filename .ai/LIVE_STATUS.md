# Live Status

Updated: 2026-08-30
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
