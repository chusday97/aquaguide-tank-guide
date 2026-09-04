# AquaGuide Admin / Operations Studio — HANDOFF LATEST

Updated: 2026-09-04
Canonical repo: `chusday97/aquaguide-tank-guide`
Local worktree: `/Users/chuchu/aquaguide-admin-content-v0`
Branch: `feature/admin-content-v0`
Current functional HEAD before this docs sync: `d6d2b37e`
Latest converged functional baseline: `d6d2b37e feat(content): isolate product care publication`

## Read order for every new session
1. `.ai/HANDOFF_LATEST.md`
2. `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`
3. `.ai/CURRENT_GOAL.md`
4. `.ai/TASK_QUEUE.md`
5. `.ai/LIVE_STATUS.md`
6. `.ai/BRANCH_STATUS.md`
7. latest tail of `.ai/EXECUTION_LOG.md`

Do not reconstruct current architecture from older historical sections in git. The files above are the canonical continuation set.

## Current product definition
AquaGuide is not only a Species-information product and this Admin is not only an SEO CMS. The target operating model is **Aqua Operations Studio** with separate authorities for Product Data, Care Knowledge, Compatibility Rules, SEO Editorial and controlled publishing.
## Authority boundaries
- Product Data: scientific identity, temperature, pH, tank size, temperament, feeding, housing facts, images. Current operator surface: `/admin/product-content` → Species.
- Care Knowledge: symptoms, actions, avoid/observe/escalate/next-step playbooks. Current operator surface: `/admin/product-content` → Care.
- Compatibility Rules: behavior profiles, pair rules, evidence, confidence, rule versions. Product runtime exists; mature operator UI does not yet exist.
- SEO Editorial: SEO Title, Meta, H1, Intro, Image Alt, localized display copy, canonical/index policy. Authority: `/admin/seo/`.
- User Context: aquarium/livestock/reminders/history. This is user data, not CMS content.

SEO is downstream acquisition content. Editing SEO must not mutate Product Data, compatibility decisions, care logic or stored user state.

## Latest P0-A implementation checkpoint
- Full direct runtime consumer inventory is now canonical in `.ai/PUBLISHED_CONTENT_AUTHORITY.md`.
- Product/Care public read contract is defined: public API is the published authority; static datasets are seed/audit/offline fallback only.
- Added immutable `content_publications` snapshots plus service-role-only publish/archive RPCs in migration `202609040001_product_care_publication_snapshots.sql`.
- Editing an already-published Species/Care record now preserves its last public snapshot and moves the editable row back to Draft; Save no longer intentionally advances public content.
- Public `/species` and `/care-articles` routes now prefer publication snapshots and retain a migration-order fallback to legacy published rows.
- Local API typecheck, publication contract test, root build, Admin UI regression and SEO handoff all pass. Migration has not been applied to Production.
- Primary Encyclopedia/Care/diagnosis runtime consumers are converged; real Admin edit → Preview acceptance is now the first unfinished P0.

## Product/Care P0 status after runtime convergence
The primary target consumers are now routed through the published runtime catalog:
- Encyclopedia Product Data → published Product API/runtime catalog.
- Care Encyclopedia → published Care API/runtime catalog.
- Aquarium and Identify diagnosis Care Knowledge → the same published Care runtime catalog.
- Static Product/Care datasets remain explicit seed/offline fallback, not the successful live authority.

Do not yet claim full Admin-to-user publication acceptance. The next unresolved proof is one real Product edit and one real Care edit through Admin Save/Publish into Preview, including proof that Save alone stays invisible and that compatibility/user aquarium state is not mutated.
## Species SEO subsystem — stable baseline
- Private Draft/review/revision/import-batch authority: `chusday97/aquaguide-seo-content / seo-admin-drafts`.
- Public AquaGuide repo receives only code + explicit sanitized Staging snapshot.
- Supabase Species SEO paths are historical/compatibility only; Repo-backed authority is canonical.
- CSV flow: blank template → preflight → field Diff → Create Draft.
- Durable `import_batches` scope bulk review and Staging publication; server rejects out-of-batch review/publish writes.
- Duplicate review uses evidence cards, real Preview, explainable recommendation and no-write defer.
- Staging requires bilingual page/Base approvals, hygiene gates, exact batch allowlist and required Canonical dependencies.
- Production remains locked.

## Current operating proof still pending
Run the corrected 14-Species batch-01 through the authenticated AquaGuide Preview:
1. zh-CN CSV → Preflight/Diff → Draft batch.
2. English CSV → Preflight/Diff → Draft batch.
3. Batch-scoped review/approval for intended Species + Base rows.
4. One explicit Staging Publish only when bilingual readiness is green.
5. Verify 28 hosted EN/ZH pages for title/meta/H1, facts, canonical/hreflang, robots, CTA and internal-copy hygiene.

This proves the SEO subsystem operationally; it does **not** solve the Product/Care source-of-truth gap.
## Next implementation order
P0-A — Product/Care authority convergence:
- [done locally] published-content read contract + Draft isolation;
- [done locally] Encyclopedia Product + Care Encyclopedia/Aquarium/Identify diagnosis runtime cutover with explicit fallback;
- [next] browser-test a real Admin Product and Care Save/Publish cycle against Preview and prove no compatibility/user-state spillover.

P0-B — Finish batch-01 SEO operational acceptance in parallel only when authenticated human review is available.

P1 — Change Impact Preview: classify display-only vs decision-critical edits and show affected Encyclopedia / Aquarium / Compatibility / SEO consumers before release.

P1 — Compatibility Admin: reviewed Species behavior profiles, Pair Rules, Evidence, Confidence and Rule Version with regression testing before publish.

P2 — unified Publish Center, stronger permissions/audit, then AI-assisted extraction/conflict detection/Draft generation from approved facts.

## Branch / safety
- Live `main`: `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Feature remote before this docs sync: `b982e2a69e5c3a4ca575f45aa93bea81e362fe35`.
- Current measured divergence against live main and local functional HEAD: main-only 269 / feature-only 111 commits; merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Do not blindly merge/rebase main; dedicated reconciliation is required after operational acceptance.
- Do not unlock Production, bypass Admin authentication, or write private Draft content to the public repo.
## Known operational data that must not be forgotten
- Prepared corrected batch-01 files live under `~/aquaguide-seo-batches/batch-01/`; 14 low-risk Species × zh-CN/en; isolated 28-page dry-run passed.
- Real duplicate decisions already recorded for 3 source sets: keep `sp_0001` (极火虾), `sp_0214` (白金西非凤凰), `sp_0082` (黑木蕨). Do not overwrite these decisions during UI testing.
- Existing `sp_0001` private Drafts contain historical acceptance/test wording in Chinese/English. Do not publish that content to Production; hygiene gates should remain fail-closed.
- Source identity gate blocks incomplete scientific names such as trailing `var.` / `subsp.` / `ssp.` markers.

## Execution style for next session
Start with live state reads, not memory. Continue the first incomplete P0 unless the user supplies a newer concrete bug. Do not reimplement stable SEO features. Update this handoff plus `CURRENT_GOAL`, `TASK_QUEUE`, `LIVE_STATUS`, `BRANCH_STATUS` and `EXECUTION_LOG` after material changes.

## Cross-session recovery anchor
For a brand-new conversation, start with `.ai/CROSS_SESSION_START.md`. It contains the exact canonical read order, current first P0, safety rules and a copy-paste startup prompt. This file remains the detailed handoff; `CROSS_SESSION_START.md` is the stable entry point.
