# AquaGuide Admin / Operations Studio — HANDOFF LATEST

Updated: 2026-09-05
Canonical repo: `chusday97/aquaguide-tank-guide`
Local worktree: `/Users/chuchu/aquaguide-admin-content-v0`
Branch: `feature/admin-content-v0`
Current functional HEAD before this docs sync: `1e8a482a91655cc5929fdb635b51232c7c3d0541`
Latest operational checkpoint: `1e8a482a feat(compatibility): converge reviewed runtime authority`

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
- Primary Encyclopedia/Care/diagnosis runtime consumers are converged and controlled Admin Save→Publish→Preview acceptance now passes for Product and Care.

## Product/Care P0 status after runtime convergence
The primary target consumers are now routed through the published runtime catalog:
- Encyclopedia Product Data → published Product API/runtime catalog.
- Care Encyclopedia → published Care API/runtime catalog.
- Aquarium and Identify diagnosis Care Knowledge → the same published Care runtime catalog.
- Static Product/Care datasets remain explicit seed/offline fallback, not the successful live authority.

Controlled Preview acceptance now proves Save stays private, Publish advances the intended Product/Care consumer, user aquarium state remains unchanged, and Compatibility static authority is not mutated. This is local/controlled acceptance only; Production migration/deployment was not performed.
## Species SEO subsystem — stable baseline
- Private Draft/review/revision/import-batch authority: `chusday97/aquaguide-seo-content / seo-admin-drafts`.
- Public AquaGuide repo receives only code + explicit sanitized Staging snapshot.
- Supabase Species SEO paths are historical/compatibility only; Repo-backed authority is canonical.
- CSV flow: blank template → preflight → field Diff → Create Draft.
- Durable `import_batches` scope bulk review and Staging publication; server rejects out-of-batch review/publish writes.
- Duplicate review uses evidence cards, real Preview, explainable recommendation and no-write defer.
- Staging requires bilingual page/Base approvals, hygiene gates, exact batch allowlist and required Canonical dependencies.
- Production remains locked.

## Species SEO operational proof — completed 2026-09-04
- Authenticated zh-CN import batch: `batch-20260904132705-deca`; 14 Species / 14 Base groups; final status Approved.
- Authenticated English import batch: `batch-20260904132732-9d0d`; same 14 Species / 14 Base groups; final status Staging Published.
- Explicit Staging publication commit: `7aaeb44e02ce6b82ba35919b081945bf4d0ce1cd` on `feature/admin-content-v0`; sanitized snapshot path `content/species-seo/staging-snapshot.json`.
- Hosted Vercel deployment: `dpl_B86KiBaD75LhGdcHMa6v8zTN6pJM` / `aquaguide-bds0xiu0q-chusday97s-projects.vercel.app`.
- Hosted acceptance: 28/28 EN/ZH pages passed title/meta/H1, Product facts, canonical/hreflang, robots, CTA and internal-copy hygiene checks.
- Existing historical `sp_0001` acceptance/test Drafts were outside both batch scopes and were not published.
- Production remained locked throughout.

## CI operating policy — 2026-09-04
- Normal pushes/PRs run lightweight checks only: Admin contract/build, product fast contracts, lint/typecheck, root build, generated-data/diff hygiene.
- Heavy Golden / Visual / evaluation-history / browser suites run only on `workflow_dispatch`, merge queue (`merge_group`), or PRs labeled `run-heavy-ci` / `merge-ready`.
- Existing workflow/check identities are preserved where possible so branch rules do not silently break.
- Heavy tests were not deleted; local entrypoint validation passed before commit.

## Next implementation order
P0-A — Product/Care authority convergence:
- [done locally] published-content read contract + Draft isolation;
- [done locally] Encyclopedia Product + Care Encyclopedia/Aquarium/Identify diagnosis runtime cutover with explicit fallback;
- [done locally] stateful browser Preview proves Admin Product/Care Save→Publish behavior plus user-state/Compatibility isolation.

P0-B — [DONE] Authenticated bilingual batch-01 import/review/Staging/28-page hosted acceptance.

P1 — [DONE] Change Impact Preview: field classification, persisted Draft-vs-Published Diff, affected-consumer summary, Encyclopedia Before/After and Compatibility-result regression simulation.

P1 — [DONE in code] Compatibility Admin: Profile/Pair Draft, structural Impact, real server engine Regression, canonical Evidence resolution, explicit human Review/Approve, exact reviewed runtime authority and atomic versioned publish are implemented. Live migrations remain unapplied.

P2 — unified Publish Center, stronger permissions/audit, then AI-assisted extraction/conflict detection/Draft generation from approved facts.

## Branch / safety
- Live `main`: `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Feature remote before this docs sync: `57c4ef00571c00191248948af8218f978417c949`.
- Current measured divergence against live main and local functional HEAD: main-only 269 / feature-only 129 commits; merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Do not blindly merge/rebase main; dedicated reconciliation is required after operational acceptance.
- Do not unlock Production, bypass Admin authentication, or write private Draft content to the public repo.
## Known operational data that must not be forgotten
- Prepared corrected batch-01 files live under `~/aquaguide-seo-batches/batch-01/`; 14 low-risk Species × zh-CN/en; isolated 28-page dry-run passed.
- Real duplicate decisions already recorded for 3 source sets: keep `sp_0001` (极火虾), `sp_0214` (白金西非凤凰), `sp_0082` (黑木蕨). Do not overwrite these decisions during UI testing.
- Existing `sp_0001` private Drafts contain historical acceptance/test wording in Chinese/English. Do not publish that content to Production; hygiene gates should remain fail-closed.
- Source identity gate blocks incomplete scientific names such as trailing `var.` / `subsp.` / `ssp.` markers.

## Execution style for next session
Start with live state reads, not memory. Continue the first incomplete TASK_QUEUE milestone unless the user supplies a newer concrete bug. Do not reimplement stable SEO features. Update this handoff plus `CURRENT_GOAL`, `TASK_QUEUE`, `LIVE_STATUS`, `BRANCH_STATUS` and `EXECUTION_LOG` after material changes.

## Cross-session recovery anchor
For a brand-new conversation, start with `.ai/CROSS_SESSION_START.md`. It contains the exact canonical read order, current first P0, safety rules and a copy-paste startup prompt. This file remains the detailed handoff; `CROSS_SESSION_START.md` is the stable entry point.

## 2026-09-04 Product/Care controlled Preview acceptance
- Product: Admin edit/save returns Draft; pre-Publish Encyclopedia Preview still shows old public name; after Publish a fresh Preview shows the new public name.
- Care: same Save/private → Publish/public sequence verified against Care Guide.
- Fixed a real hidden P0 bug uncovered by stricter acceptance: hardcoded common-guide display titles could mask an Admin-published Care title. Published Care now wins; legacy title maps apply only to fallback content.
- Search suggestion presentation now preserves published Product/Care names/categories instead of reapplying legacy English translation maps.
- User aquarium local state and Compatibility static inputs remain unchanged.
- Functional acceptance commit: `ee2fcc8a test(content): prove admin publish preview boundary`.
- Product/Care, SEO P0, P1 Change Impact Preview and P1 Compatibility Admin are closed in code. The first unfinished milestone is P2 Unified Publish Center / release history & audit; do not touch Production.

## 2026-09-04 Change Impact Preview first round
- Functional commit: `e58c7082 feat(admin): add change impact preview`.
- Product/Care editor now computes field-level Diff and classifies changes as display-only, decision-critical Product Data or Care workflow. Compatibility/SEO categories remain explicit independent authorities.
- Impact UI separates `发布后直接更新` from `需单独复核`; Product changes never claim to auto-mutate Compatibility or SEO.
- Existing public `/species/:catalogKey` and `/care-articles/:catalogKey` detail reads provide the published baseline, so Draft-vs-Published Diff survives refresh.
- Product browser acceptance proves name Diff survives save + reload; Care acceptance proves workflow changes expose Care Guide / Aquarium / Identify as direct consumers. 1280px and 390px layouts pass.
- Admin CI path filters now include Product/Care Admin page/services/impact test; ordinary pushes still run the lightweight job only.
- Historical note: Change Impact Preview was followed by and is now joined by completed P1 Compatibility Admin.

## 2026-09-04 Change Impact Preview completion
- Functional commit: `9dc30c48 feat(admin): complete change impact preview`.
- Product decision-critical edits show current Published vs ready-to-publish Encyclopedia data, with changed fields highlighted.
- Product Drafts with Compatibility-sensitive fields run the existing `evaluateSpeciesCombination` engine against the static living-species cohort after save; both status changes and rule-only changes are counted and surfaced.
- Publish confirmation includes the Compatibility simulation summary and reiterates that Compatibility authority is not auto-written.
- PASS: impact contracts, Compatibility regression contract, Product/Care Admin browser flows at 1280/390, Product/Care Save→Publish Preview boundaries, Admin contract/build, root lint/build.
- Historical note: the Compatibility operator surface and versioned reviewed publish chain are now implemented in code.

## 2026-09-04 Compatibility Admin Behavior Profile Draft checkpoint
- Functional commit `dfed5a948982719505cc5d557be2b98ef4e9baea`.
- New `/admin/compatibility` operator surface audits current reviewed engine inputs: 7 Species Profiles / 4 Pair Rules.
- Behavior Profile Drafts are isolated revisions with one active revision per species, optimistic versioning, Admin-only RLS, reviewed citation snapshots, and Draft → pending_review transition.
- No reviewed profile/pair rule is mutated and there is no Compatibility publish endpoint in this round.
- API exposes DB-baseline writable catalog keys; static reviewed profiles without DB alignment remain read-only.
- Migration is repository-only and unapplied to Production/live databases.
- Next unfinished item: Pair Rule revision management with Evidence / Confidence / Review Status.

## 2026-09-04 Compatibility Admin Pair Rule Draft checkpoint
- Functional commit `4c9ec12e8f6929712d3780b06f4ef5ca93be3be6`.
- Pair Rule revisions mirror Profile safety: DB-baseline capability gating, one active revision per canonical pair, optimistic versioning, reviewed citation snapshots and Draft → pending_review.
- Pair editor covers verdict / risk type / reason / mitigation / basis / confidence; reviewed Pair Rule rows remain immutable from Draft APIs.
- Contract rejects same-species pairs and contains no Pair publish endpoint.
- 1280/390 browser flow passes create/edit/save/submit/lock; root lint/build, API check, Compatibility impact and compatibility-admin contract pass.
- Migrations 0002/0003 remain code-only; no live DB or Production mutation.
- Next unfinished item: versioned human Review/Approve + regression gate before reviewed Compatibility publish.

## 2026-09-04 Compatibility human review / authority checkpoint
- Functional commit `25e3ec0d445a6b8342593313c2783b98dc9b6b86`; online lightweight CI run `33893177526` passed and Heavy was skipped.
- Server computes Draft-vs-reviewed structural impact at submit time; revisions without actual changes cannot enter review.
- Explicit authenticated Approve/Reject is required; Reject requires a review note. Approval remains revision-only and cannot change reviewed runtime.
- Canonical architecture was corrected: Product/Care published runtime is converged, while Compatibility still has a split-path risk because the user-facing engine reads code/data evidence and Admin revisions are DB-backed.
- Do not create a Compatibility publish endpoint until runtime/published authority is converged.
- Next: design/read-contract + controlled fallback for reviewed Compatibility runtime, then versioned publish with engine regression gate.

## 2026-09-05 Compatibility reviewed runtime authority checkpoint
- Functional commit `1e8a482a91655cc5929fdb635b51232c7c3d0541`.
- Profile + Pair Draft workflows and server-generated impact/human review gate are already in place; approval still does not publish.
- New public reviewed bootstrap + runtime registry allows the existing engine to consume DB reviewed authority only when DB coverage exactly matches all current 7 Profiles / 4 Pair Rules. Any partial, duplicate, evidence-incomplete or unavailable payload atomically falls back to static reviewed evidence.
- Compatibility decision algorithms remain unchanged; legacy static behavior tests pass.
- Runtime `ruleVersion` is no longer a misleading constant when DB authority is active: it fingerprints rule versions and evidence membership/versions.
- Lightweight CI includes `test:runtime-compatibility-authority`; Heavy remains gated.
- No migration was applied to a live database, no Compatibility publish endpoint was enabled, and Production/main were untouched.
- This blocker was closed by `57c4ef00`; canonical Evidence, real engine regression and versioned reviewed publish are now implemented in code. Live migrations remain unapplied.

## 2026-09-05 Compatibility versioned reviewed publish completion
- Functional commit `57c4ef00571c00191248948af8218f978417c949`; online CI `33909317349` validate PASS including the server regression gate; Heavy skipped.
- Canonical Evidence reconciliation covers 13 Evidence / 7 Profiles / 4 Pair Rules and fails closed on pre-existing reviewed drift. Reconciliation/versioned-publish migrations remain code-only and unapplied live.
- The same reviewed authority loader drives public `/compatibility-bootstrap`, Admin reviewed baseline and server regression. DB activates only at exact 7/4 coverage; otherwise the engine atomically uses the static reviewed fallback.
- Submit Review computes a real before/after engine regression over the Product runtime cohort; reports include authority sequence, engine version, Product catalog fingerprint and semantic digest. Approve/Publish recompute freshness.
- Product/Compatibility/Evidence authority mutations invalidate the global sequence, so concurrent/stale reviews cannot publish. Atomic RPC then updates reviewed baseline + Evidence links + revision history in one transaction.
- First unfinished milestone: P2 Unified Publish Center / release history & audit. Start with a read-only aggregation of existing release sources; do not create a new competing publication authority.
## 2026-09-05 P2 Unified Publish Center — architecture inventory
- P1 Compatibility Admin is closed in code. Functional checkpoint `57c4ef00571c00191248948af8218f978417c949`; online Admin Content CI run `33909317349` passed all light checks including the server Compatibility regression gate, while Heavy was skipped.
- Docs checkpoint before this sync: `a1242eb04a981f8815f2f1760bb4be833ddd6dc0`.
- P2 inventory found two operational auth/storage domains that must remain separate:
  1. Product/Care publications + Compatibility reviewed revisions/publish: Business API / Supabase.
  2. Species SEO revisions/import/activity/Staging: independent Repo Admin cookie + `admin-store.json` / staging snapshot.
- Publish Center v1 must be a **read-only multi-authority aggregation**, not a new write authority and not an SEO-to-Supabase migration.
- Planned normalized read model: `ReleaseEvent` carrying domain, action/status, resource/batch, version/revision, actor/time, impact summary, source authority and source availability/auth state.
- First unfinished code task: implement ReleaseEvent contracts + per-authority readers/aggregator, then `/admin/publish-center` timeline. Existing Product/Care, Compatibility and SEO publish mechanisms must stay unchanged.
- Safety unchanged: no Production unlock, no live migration application, no ordinary merge/rebase of main.

## 2026-09-05 P2 Unified Publish Center — read-only checkpoint
- Functional commit `f1b7adae feat(admin): add unified publish center read model`.
- Added shared `ReleaseEvent` / source-status contract, authenticated Business Admin `GET /api/v1/admin/releases`, independent SEO Repo Admin read adapter, and `/admin/publish-center`.
- Product/Care + Compatibility remain Business API/Supabase write authorities; SEO remains Repo Admin / `admin-store.json`. Publish Center performs no cross-authority writes.
- Product/Care source is explicitly marked `current_only` because `content_publications` stores one current Published snapshot per resource; Compatibility exposes revision history and SEO exposes activity/revision/import/Staging history.
- SEO auth is independent: when Repo Admin is not logged in the Publish Center shows `auth_required` while Product/Care + Compatibility continue to render.
- PASS: read-only contract, API TS, root lint/build, 390/1280 Publish Center browser flow, existing Admin Hub/Product/Care browser regression, Repo Admin contract.
- CI policy preserved: read-only contract runs in lightweight CI; Publish Center Playwright runs only in Heavy Gate.
- Next: read-only release detail/readiness drill-down before any cross-domain write orchestration. Production/main/live DB untouched.
## 2026-09-05 P2 Publish Center — detail/readiness + capability checkpoint
- Functional commits: `10b90394 feat(admin): deepen publish center audit view` and `bd2e8059 feat(admin): add release capability matrix`.
- Release detail is selectable and filter-safe; source coverage is explicit, including Product/Care `current_only` history.
- Readiness summarizes source availability/auth degradation without blocking healthy authorities.
- New capability matrix distinguishes `available / partial / locked / not_applicable` for Diff → Impact → Preview → Review → Staging → Production.
- Product/Care has no separate Staging layer; Compatibility live publish remains locked because live migrations are unapplied; SEO Staging is available while Production remains locked.
- PASS: Publish Center contract, 390/1280 browser flow, API TS, root lint/build, diff hygiene.
- Next: cross-domain orchestration design + stronger roles/audit; Publish Center must remain a coordination layer, not a fourth authority.
## 2026-09-05 P2 Publish Center — permission + Product/Care audit checkpoint
- `ec5e9a2b feat(admin): expose release permission boundaries` shows current Business `admin` and independent SEO `repo-admin` identities/actions without merging auth systems.
- `2a1c0594 feat(admin): add product care release audit history` adds repository-only migration `202609050003_content_publication_audit_history.sql`.
- Product/Care audit is append-only (`baseline / published / archived`) with source version, snapshot, actor UUID and timestamp; `content_publications` remains the published authority.
- Admin Publish/Archive prefers audited service-role RPCs but falls back to existing RPCs only when the new functions are not deployed, preserving deployment-order safety.
- Publish Center uses full audit history when available and automatically falls back to current-only when the migration/table is unavailable.
- PASS: Publish Center contract/UI 390/1280, Admin content contract, Product/Care Save→Publish→Preview, API TS, root lint/build.
- Migration is NOT applied to live DB/Production. Role split is deliberately deferred until multi-operator need is proven.
- Next: read-only cross-domain coordination design; no centralized write orchestration.
