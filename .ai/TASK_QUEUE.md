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
