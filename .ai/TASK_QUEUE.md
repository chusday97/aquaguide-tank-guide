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

## Next — P0 Bidirectional Preview Inspector
- [ ] Add a stable editor-element registry for `localizedName`, `h1`, `intro`, `imageAlt`, `seoTitle`, `metaDescription`.
- [ ] Center → right: focus/click/edit a center field, switch Preview mode when necessary, scroll the mapped frontend element into view and show an outline + element label.
- [ ] Right → center: hover preview elements subtly; click to lock selection, scroll the matching editor field into view and highlight it without immediately forcing text input focus.
- [ ] Show source state on selection: Custom / Inherited from Base / Product Truth · Read only.
- [ ] Map Product Truth facts as inspectable read-only elements so users understand why they appear on the page but cannot be edited here.
- [ ] Keep Page as default; SEO Title / Meta Description selection may automatically switch the right pane to Google Preview.
- [ ] Add browser regression for both directions, inherited content and read-only Product Truth; keep `pageErrors=[]`.

## Next — P1 Visual refinement
- [ ] Reduce repeated inherited/custom badges and convert inheritance to calm `Inherited from Base → Override → Use Base value` interactions.
- [ ] Refine Data Review, Translation and Revision History into lighter drawer/disclosure surfaces while keeping current DB authority and callbacks.
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
- [ ] Implement bidirectional Editor ↔ Preview Inspector before further broad CSS polishing.
- [ ] Continue visual refinement: inheritance controls, spacing, preview fidelity, and secondary-tool density.
