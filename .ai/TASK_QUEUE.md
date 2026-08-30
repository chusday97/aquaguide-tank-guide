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
- [x] Restore read-only Product Truth fields into grouped member projection for actual frontend preview.

## Next
- [ ] Finish visual polish of inheritance fields: inherited vs custom should read naturally without repeated technical badges.
- [ ] Convert Data Review, Translation and Revision History from large inline panels into lighter drawer/disclosure interactions while keeping the same callbacks and DB authority.
- [ ] Run final B gate for the UI convergence milestone, commit/push, then require the A-layer GitHub Actions run to pass.
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
- [ ] Continue visual refinement: inheritance controls, spacing, preview fidelity, and secondary-tool density.
