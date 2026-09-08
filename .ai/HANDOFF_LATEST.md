# AquaGuide Admin / Operations Studio — HANDOFF LATEST

Updated: 2026-09-08
Canonical repo: `chusday97/aquaguide-tank-guide`
Local worktree: `/Users/chuchu/aquaguide-admin-content-v0`
Branch: `feature/admin-content-v0`
Current SEO Operations functional HEAD: `f945e9f86dd0790cbc7e75a57b5968adb08a94e5`
Latest AI functional checkpoint: `a3f582c22492504edd2de5e1e81a9b43695150ab`
Final accepted Care SEO snapshot: `fd960667b951cafca83332a4f78a60b413e36d9e`

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
- Compatibility Rules: behavior profiles, pair rules, evidence, confidence, rule versions. `/admin/compatibility` implements isolated revisions, real regression, human review and versioned reviewed publish in code; live migrations remain unapplied.
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
## Current Species SEO Admin usability checkpoint
- Active user scope is `/admin/seo/`, not the fish-tank frontend and not reconciliation PR #144.
- Functional checkpoint `1e1414ec` rebuilds hierarchy as: 4-stage workflow → one current action → current-page key action → detailed editing → collapsed `更多工具`.
- The global workflow shows Data Review / Content Edit / Human Review / Staging with live counts and click-through filters.
- Submit/Approve/Staging actions now live in a visually separate page action panel; form fields are explicitly labeled `详细编辑`.
- 390px shows all four stages simultaneously in a 2×2 grid; 1440/390 browser checks report zero page overflow. Exact-SHA Cloudflare deployment `94ddb622` was browser-verified.
- Canonical read-only acceptance URL remains `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1`.
- Writable independent `admin-content` Preview credential binding is still a separate security task; do not manually shuttle secrets.
- Interaction correction after screenshot review: the extra Species-row ✓ badge was removed because it broke row typography. Normal selection now lives in the existing 16×16 square as a single-select radio; batch mode reuses the slot as a checkbox. Base selection remains secondary.
- `当前物种页面` and `基础模板` now have explicit, differently styled scope context cards (`页` vs `模`) explaining page-only vs shared-template impact. Read-only Demo no longer shows a false `Schema 未应用` warning.

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

P2 — [DONE] Unified Publish Center V1 + permission/audit visibility. [DONE] Care SEO Published projection + Editorial Draft/Review + sanitized Staging handoff + protected hosted acceptance + release-readiness evidence. [DONE] Explicit decision is `hold_noindex`. [DONE] First AI advisory layer for Published-Care source extraction/conflict/impact/SEO Draft suggestion. [DONE] SEO Operations Health Layer V2 + local browser/operator acceptance. [NEXT] User/hosted read-only visual acceptance of `/admin/seo-pages`; writable Preview credentials and reconciliation stay separate/parked unless explicitly requested.

## Branch / safety
- Fresh live `main`: `d3c70dee633ed4e24bbca161d138a832012b1d40`.
- Remote feature before the Health queue checkpoint: `46418ac591a55d73bf6bf5a2ee88a8338b848b9d`.
- Health queue functional checkpoint: `f945e9f86dd0790cbc7e75a57b5968adb08a94e5`.
- Measured divergence at that functional checkpoint: main-only 275 / feature-only 198 commits; merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
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
- Historical note: at this checkpoint Product/Care, SEO P0, P1 Change Impact Preview and P1 Compatibility Admin were closed and Publish Center was next. Publish Center V1 is now complete; use the current summary above for continuation.

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
- Historical note: Publish Center was the first unfinished milestone at this checkpoint; it is now complete. Continue from the current summary / TASK_QUEUE.
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
- Historical note: cross-domain coordination + permission/audit visibility were next here and are now complete in Publish Center V1.
## 2026-09-05 P2 Publish Center — permission + Product/Care audit checkpoint
- `ec5e9a2b feat(admin): expose release permission boundaries` shows current Business `admin` and independent SEO `repo-admin` identities/actions without merging auth systems.
- `2a1c0594 feat(admin): add product care release audit history` adds repository-only migration `202609050003_content_publication_audit_history.sql`.
- Product/Care audit is append-only (`baseline / published / archived`) with source version, snapshot, actor UUID and timestamp; `content_publications` remains the published authority.
- Admin Publish/Archive prefers audited service-role RPCs but falls back to existing RPCs only when the new functions are not deployed, preserving deployment-order safety.
- Publish Center uses full audit history when available and automatically falls back to current-only when the migration/table is unavailable.
- PASS: Publish Center contract/UI 390/1280, Admin content contract, Product/Care Save→Publish→Preview, API TS, root lint/build.
- Migration is NOT applied to live DB/Production. Role split is deliberately deferred until multi-operator need is proven.
- Next: read-only cross-domain coordination design; no centralized write orchestration.

## 2026-09-05 P2 Publish Center — cross-authority coordination closeout
- `5a549377` adds read-only cross-authority context by explicit catalog key / Pair key / SEO batch catalogKeys only.
- Related records are contextual evidence, not dependency inference and not a signal that synchronized publish is required.
- Event detail links back to the original Product/Care, Compatibility or SEO authority; Publish Center still performs no writes.
- Online lightweight CI run `33951946893` passed for `5a549377`.
- Product/Care append-only audit migration remains code-only/unapplied; current deployments safely fall back to current-only history.
- Business role split is deliberately deferred until a real multi-operator requirement exists.
- First unfinished milestone: Care SEO downstream projection from approved Care Knowledge.

## 2026-09-05 Care SEO downstream projection / static handoff closeout
- Functional chain: `108a4400` projection → `d6d267c3` canonical Care topic route → `8104a1b2` bilingual hreflang/static Staging handoff.
- SEO projection is derived only from the last Published Care snapshot/version. Draft Care changes cannot leak into SEO input; protected symptoms/steps/avoid/observe/diagnose/next-step/evidence remain Care authority.
- Deterministic SEO routes reuse the Species locale convention: EN `/care/<catalogKey>.html`, zh-CN `/zh/care/<catalogKey>.html`, `x-default`→EN. Route locale overrides display only and does not overwrite the user's saved language preference.
- SPA canonical fallback stays `noindex,follow`. Static Staging generation is fail-closed and refuses unpaired locales, source-version drift, unapproved editorial, Production snapshots or a Production staging host.
- PASS: Care projection/artifact contracts, Product/Care authority contract, Published runtime, API/root TS, production root build, canonical route 390/1280, Care guide/assessment/favorite regressions, Care first-screen. Online Admin Content CI `33955509807` validate PASS; Heavy skipped.
- No Care SEO Production/index unlock, main merge/rebase, live migration or Production mutation occurred.
- Historical note: Editorial Draft/Review, sanitized Staging handoff and hosted bilingual acceptance were unfinished at this checkpoint; all are now completed. Use the current summary above.

## 2026-09-05 — Care SEO foundation final sync
- Functional checkpoint `8104a1b2b49a1f35bbcfd3f7626d8b69d7255622` completed Published-Care-bound projection, deterministic EN `/care/<key>.html` + zh-CN `/zh/care/<key>.html` routing, hreflang/x-default, and a fail-closed static Staging artifact builder.
- Online Admin Content CI run `33955509807`: lightweight `validate` PASS; Heavy browser / SEO handoff gate skipped by policy.
- Latest docs checkpoint before this sync: `c4b1c1a1a308510029135bbad0f1bb6c552603c7`; worktree was clean and local/remote feature matched.
- Live main remains `64fa58a16a723b74621ac1db513adb1efb47e282`; current pre-sync divergence is main-only 269 / feature-only 145, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Feature is not merge-ready: dedicated reconciliation against live main remains mandatory. No main merge/rebase, Production deploy, index unlock or live DB migration occurred.
- Historical note: that Editorial/handoff/hosted-acceptance milestone is now complete. Current next gate is the explicit Index/Production release decision; Production stays locked.

## 2026-09-05 Care SEO Editorial + hosted Staging acceptance closeout
- Functional commits: `a2caf575043bc4e36472f57412f469ad168fc652` adds persisted Care SEO Editorial Draft/Review/Human Approve; `6079b6d44e7e3224822dcf06ae2253427679c632` adds the approved-only sanitized Staging handoff and explicit build routing.
- Editorial is downstream only: it stores SEO Title / Meta / H1 / Focus Keyword / index strategy and source binding; it cannot mutate Care Knowledge. Any new Published Care version makes older Editorial stale and blocks handoff until re-reviewed.
- Staging handoff accepts only immutable `publication-snapshot` authority, exact Care ID/catalogKey/locale/version alignment, Approved Editorial, bilingual same-version pairing and `noindex`. Sensitive Care facts and Editorial audit/revision metadata are stripped from the public snapshot.
- Ordinary code builds skip Care SEO generation. Automatic Preview generation is allowed only for an explicit snapshot-only `content(care-seo): publish staging ...` commit on `feature/admin-content-v0`; Production source/destination are denied.
- The accepted no-cost Staging source path is ephemeral local Supabase, not a paid persistent project. Node 24.14.0 + Supabase CLI 2.115.0 + Docker launched a disposable database with core publication + Care SEO migrations; it produced Published Care version 2, then EN/zh-CN SEO Draft → ready_for_review → Approved and a sanitized two-record snapshot. The ephemeral database was destroyed after export.
- The real DB run exposed a production-relevant bug: PostgREST emits valid `+00:00` timestamps while the snapshot schema only accepted `Z`. `5d2542ac68121809f68fd12e038a5d158c319606` fixes RFC3339 offset acceptance and adds regression coverage.
- Explicit snapshot-only commit `18711afc787dc48c814a63de2551ac56f4a99793` published `content/care-seo/staging-snapshot.json`. GitHub Admin Content CI run `33959147061` PASS. Vercel deployment `dpl_5XMFuB4p4VWyKBxyA5ML36ucc6D7` (`aquaguide-4y6g30ndp-chusday97s-projects.vercel.app`) reached READY; build logs prove `Care SEO artifact: merged 2 static pages into dist.` while Species SEO stayed skipped.
- Protected Vercel hosted acceptance PASS 2/2 EN/ZH pages: HTTP 200, deployment `X-Robots-Tag: noindex`, page `noindex,follow`, exact title/meta/H1, source version 2, branch-alias canonical, reciprocal EN/zh-CN/x-default hreflang and hygiene. Preview Authentication remained enabled; a temporary Vercel share-cookie was used only for verification and was deleted afterward.
- Paid Supabase branch/project is therefore optional, not a blocker. Do not use Production or unrelated `ice-glide-staging-sg` as Staging. No live migration, Production mutation, index unlock, main merge or rebase occurred. Next gate is the explicit Index/Production release decision.

## 2026-09-05 Care SEO release-readiness gate closeout
- `c1f4f35a3d4135f0b1312d655f1bbab258dcc98c` adds a fail-closed release-readiness contract; it performs no Production write and cannot toggle indexability.
- Closed a bypass found during audit: the Staging static builder now rejects `index` even if `staging-snapshot.json` is hand-edited; Staging sitemap remains non-indexable.
- `7ba66f9d9d0610d3be3e5ec121f3e157004849d2` is the snapshot-only republish using the new gate. Vercel `dpl_3knobTC9R84wkVfaVsCZrPnnrXrp` is READY; protected hosted acceptance passed 2/2 EN/ZH pages with noindex retained.
- `cbc4cdd0b2b1f5939dfb93abd9f3c7c28286f9d9` records non-secret `content/care-seo/staging-acceptance.json`, bound to the exact snapshot SHA-256, snapshot Git SHA, deployment ID and canonical base. Evidence-only Vercel deployment was correctly skipped by the ignore-build guard.
- `npm run check:care-seo-release-readiness` now resolves the accepted snapshot/evidence and returns `readyForProductionIndex: false` with the single blocker `explicit_human_release_decision_required`. No `release-decision.json` was created.
- Snapshot CI `33961210274` and evidence-only CI `33961337300` both passed all lightweight gates including release-readiness; Heavy skipped. Production, index, main and live DB remain untouched.

## 2026-09-05 Care SEO AI advisory / hold closeout
- Human release decision: `hold_noindex`; Production/index remain locked. `content/care-seo/release-decision.json` is bound to the final accepted snapshot/deployment.
- AI advisory functional commit `a3f582c2`: explicit Admin action only; immutable Published Care + exact source version; output limited to source extraction, conflicts, impact explanation, review warnings and four SEO Draft fields. `indexStrategy` is forced `noindex`; protected Care facts cannot be rewritten.
- Applying an AI suggestion updates only local form state. Existing human Save Draft → Submit → Approve flow remains the only persistence/review path. Browser contract proves zero Editorial writes before Save.
- Existing Vercel AI configuration is reused (DeepSeek-compatible); no new model provider or secret was introduced. Local environment has no AI key, so local calls fail closed rather than fake results. No live paid-model request was made during this round.
- Final Care SEO Preview: snapshot `fd960667`, Vercel `dpl_Fx1NEVe7safjqmte2QPY6zvPQB5D`, hosted verifier PASS 2/2 EN/ZH, `noindex` retained. Evidence/decision binding commit `5899d643`; snapshot SHA-256 `cea5def0bb343747be439deaae8ac6e23bc449483034a260c1f87fa4303c9879`.
- Latest evidence CI `33962944072` PASS all light gates including Care SEO release-readiness and AI advisory; Heavy skipped. All defined product/operations queue items are closed.
- Next safe milestone comes from existing branch-safety policy: isolated feature ↔ live-main reconciliation audit. Do not merge/rebase main directly.

## 2026-09-05 — Species SEO Admin operator usability checkpoint
- User clarified the active product is SEO Admin, not the fish-tank frontend; `feature/admin-content-v0` remains the working branch.
- `843b9e31` removes duplicated topbar bulk-review/content-review/template-import controls and adds one queue-driven `当前下一步` CTA.
- Priority order is data issues → editorial review → Preview-ready → continue editing; existing secondary tools and authority gates are preserved.
- Local 1440/390 browser acceptance: zero horizontal overflow, CTA routes to the correct queue, read-only Demo has zero enabled Save actions.
- Added a safe query Demo entry restricted to localhost / `*.pages.dev`; it is read-only and cannot Save/Review/Publish.
- GitHub light CI for `843b9e31`: `33970208210` SUCCESS; Vercel new builds are temporarily account-rate-limited, so no paid upgrade was used.
- The separate PR #144 reconciliation work is parked. Current next action is hosted `/admin/seo/?demo=1` acceptance on the new Cloudflare exact SHA.

## 2026-09-05 — hosted SEO Admin usability acceptance entry
- Final usability/docs checkpoint: `ca6dda1c79748b6fea2f349d133f4b6c5ea4ec2b`; Admin Content CI `33970948642` SUCCESS, Heavy skipped by policy.
- Cloudflare exact-SHA Preview `https://8e1a3de3.aquaguide-frontend.pages.dev/admin/seo/?demo=1` and stable branch entry `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1` both return the Species SEO Admin, not the fish-tank frontend.
- Hosted 1440/390 acceptance PASS: `当前下一步` visible, zero horizontal overflow, CTA routes to pending data review, no enabled Save actions; banner explicitly states read-only UI demo.
- Independent Vercel `admin-content` deployment `dpl_96i313PnUMMZr5GUdRNbkjnbVpeN` is READY, but its project env contains only review-mode config and does not contain the 12 `ADMIN_REPO_*` / `ADMIN_GITHUB_*` write credentials present on the original AquaGuide feature Preview.
- Automated cross-project secret transfer was blocked by the safety layer; no secret was exposed or copied. Keep UI acceptance read-only until a secure server-side binding/transfer path is available.
## 2026-09-05 — SEO Admin selected-state feedback
- User reported that clicking tabs/buttons and selecting a Species produced almost no persistent visual feedback.
- Workflow stage state is now split into `attention` (system says work exists) vs `selected` (operator clicked it), so clicking Content Editing no longer leaves Data Review looking selected just because issues exist.
- Stateful controls use `aria-pressed`; selected scope/locale/filter controls receive persistent selected styling.
- Screenshot correction supersedes the first row treatment: normal Species selection uses only the existing 16×16 square radio; no second ✓ badge is inserted beside the text. The row keeps only a light supporting highlight. Batch mode switches that slot to checkbox semantics.
- `当前物种页面` vs `基础模板` now uses explicit plain-language context and impact copy; the ambiguous `页 / 模` badge is removed. Browser checks at 1440/390 verify 16×16 controls, left-aligned text and zero overflow. Production/main/index/live DB remain untouched.

## 2026-09-05 — SEO Admin workspace focus + palette checkpoint
- Removed automatic Workspace Focus switching. Publishing is now a permanent compact Progress Navigation bar: current stage / 4, four stage buttons, completion/current/upcoming semantics and one current-action CTA. It has a distinct neutral navigation surface and strong divider from the white editor canvas; system progress and operator filter selection are separate.
- Measured at 1440×900 and 1366×768: fixed chrome drops from ~308px to ~112px and workspace gains 196px. At 390×844 workspace grows from 400px to 712px; focused editor sticky controls shrink from ~140px to 46px.
- Historical checkpoint: green-heavy chrome was first neutralized with blue; superseded by the current single Green interaction accent.
- Admin contract and root production build pass; zero horizontal overflow in measured desktop/mobile focus states.
## 2026-09-06 — Species SEO Admin strict three-color + typography checkpoint
- Current CMS rule is **Graphite / White / one Green `#2F6F4E` accent only**. Primary buttons and selected interaction states use that same Green; Preview is explicit-on-demand in an overlay drawer, and the scope badge is plain language rather than `页 / 模`.
- Warning/review/ready/error/success states are hue-neutral; status is conveyed by copy, icon/border style and weight. Color transitions were disabled so intermediate click-animation hues cannot create temporary fourth colors.
- Hidden tools were included, not just the first screen: all six advanced tools were opened and runtime-scanned at 1440×900 and 390×844. Every state reports `0` extra saturated hues and `0` horizontal overflow.
- Typography hierarchy: desktop page 24, section 18, action 15, field/Species label 13, body 12, meta 10px; mobile 22/17/14/12/11/10px. Focus mode remains compact to maximize editing/Preview space.
- Removed the superseded 2026-09-05 professional-palette block instead of stacking another permanent theme layer. Current design-system block is the final visual authority.
- Local Admin contract and full root build PASS. No main/Production/index/live-DB mutation; PR #144 stays parked and Care SEO remains `hold_noindex`.

## 2026-09-06 — Page Review Status Bar checkpoint
- User feedback identified `审核进度 / 可执行操作` as another workflow layer incorrectly embedded in the editor. It is now a standalone `PageReviewStatusBar` between scope context and content editing.
- Variant/Base both show three-step review progress, content publish state and next action in the same control strip; duplicate status clusters were removed from editor headers.
- Desktop keeps the bar sticky under editor context controls; mobile uses an additional compact review-progress indicator in its sticky toolbar while the full bar scrolls naturally.
- Contract was updated to enforce the new architecture rather than the superseded editor-header status requirement.

## 2026-09-06 — SEO Admin resizable Preview + unified language
- Preview is no longer a desktop overlay. `compactPreviewOpen` now drives `preview-split-open`: sidebar | editor | 8px draggable separator | Preview. Preview width is keyboard/pointer adjustable; selecting an editable element from Preview keeps Preview open.
- <=900px intentionally uses an overlay instead of forcing unreadable side-by-side panes.
- Top interface switch and editor content-language switch now share `switchWorkspaceLocale`, synchronizing `appLocale` and `contentLocale`. The historical two-language drift is closed by contract.
- Contract now protects the split grid, resize handle, non-closing inspector behavior and unified locale action.
- This round is Aqua SEO Admin only. The user's separate “subscribe current segment -> subscribe competition icon” request belongs to IceGlide and was not written into Aqua.
- Follow-up locale cleanup completed across advanced tools. Product-state language is localized end-to-end; canonical technical tokens such as SEO, H1, URL, Canonical and `catalog_key` may remain unchanged. Do not translate source-data identities merely to make the UI look monolingual.

## 2026-09-06 — review/editor separation + semantic component states
- Current-page/Base review chrome is now in normal document flow; it is no longer sticky and cannot cover the editing surface while scrolling or while split Preview is open.
- Review/editor health uses exactly three semantic colors on top of the neutral UI: red = blocking/error, yellow = incomplete/attention, green = healthy/success.
- Variant editor computes field + section health from real effective SEO content, required-field completeness, content-hygiene blockers, and index/canonical policy blockers. Base fields use the same health grammar.
- Component states are now explicit across the editing workflow: Default, Hover, Active/focus, Selected, Loading, Disabled, Success, Error, Empty. Review busy state shows a spinner; editor empty state is visually distinct.
- Browser proof: desktop review/editor overlap = 0px with 18px gap; split Preview keeps review/editor 742px + Preview 420px with 0 horizontal overflow; mobile 390px overlap = 0 and overflow = 0. A forced hygiene badcase turns field + section + review red immediately.
- Admin contract, repo backend/API/dual-repo gates, full root build, and `git diff --check` pass.


## 2026-09-06 — review progress promoted to top control stack
- User clarified that current-page review progress belongs at the top with publishing progress, not inside the editor workspace.
- The accepted hierarchy is now `Publish Progress → Current Page Review → Workspace`. `PageReviewStatusBar` renders through a top-level portal slot; `.studio-editor-area` contains no review bar.
- Variant/Base switches update the same top review surface and preserve their own review state/actions. The previous mobile duplicate review pill is removed.
- Local 1440 acceptance: Publish flow ends at y≈125, top review occupies ≈62px, Workspace starts immediately below at y≈187; editor-review overlap=0. Split Preview remains 742px editor + 420px Preview with overflow=0.
- Local 390 acceptance: review top strip ≈61px, Workspace ≈639px high, overflow=0. Main/Production/index/live DB remain untouched.

## 2026-09-06 — Data Review action-first hierarchy
- User reported that opening `处理数据` mixed buttons with long evidence/content and made the action difficult to find.
- Data Review now uses a wide workspace drawer (900px at 1440 when space allows) and a strict order: **decision command → evidence → optional notes**.
- `需要你做的决定` is the first visual focus. The conclusion choices and the single `确认并保存` CTA are visible in the first viewport; the CTA is Disabled until a valid conclusion is selected and becomes enabled immediately after selection.
- Desktop keeps the command sticky while evidence scrolls; evidence is explicitly labeled read-only and notes are collapsed as optional secondary content.
- Runtime acceptance: 1440 drawer 900px, action command fully visible, sticky after 700px scroll, zero overflow; 390 command fully visible in first view with zero overflow.
- Contract now locks action-before-evidence ordering, wide Data Review mode, obvious primary CTA and subordinate notes. Production/main/live DB remain untouched.

## 2026-09-06 — clean editor canvas rule
- Content editing is a neutral writing surface, not a status dashboard. Variant/Base editor backgrounds stay white/transparent.
- Success may appear only as a small green status dot/label at section level; healthy fields must not receive green fills or green card backgrounds.
- Warning/Error remain visible through a slim semantic edge, input border and compact status label; they must not tint the whole section or field.
- Removed the permanent red/yellow/green legend above forms. Health is shown contextually where it matters.
- Editor typography is deliberate and stable: page 24px, content heading 18px, section 15px, field/input 12–13px, helper/meta 10–11px. Legacy 9/9.5/10.5px editor copy is retired.

## 2026-09-06 — task-first content editor
- User screenshot showed the current-page editor still behaved like a field catalog: duplicated page identity, generic SEO headings, a separate Content Source card, inherited Meta/H1 rows presented like required inputs, and repeated read-only copy.
- Accepted editor hierarchy is now **one current-page identity → actual page-specific tasks → inherited search appearance (collapsed) → advanced SEO (collapsed)**.
- Current-page scope explanation card is removed; the toolbar already carries Current Page/Base scope. Base keeps only a compact impact notice because edits can affect multiple pages.
- Page-specific fields use task questions and guidance instead of CMS jargon. Inherited Meta title/description/H1 are grouped under `搜索展示`, default-collapsed when healthy, with Base Template / This Page source and `单独修改 / 改用模板` preserved inside the disclosure.
- The separate `内容来源` manager, duplicate `页面内容与 SEO 字段`, `SPECIES SEO · locale`, redundant workspace label, and editor-level read-only notice are retired.
- Contract protects task-first ordering and forbids those regressions. Production/main/live DB remain untouched.
## 2026-09-06 — Preview-linked editor alignment
- User reported that current-page fields and Preview were structurally misaligned, so visible page content could not be edited directly.
- Preview/editor ownership is now explicit: `sharedIntro` belongs to Base, `variantIntro` belongs to Current Page, and both map to their own editor target instead of sharing one ambiguous `intro` element.
- Preview H1 / Meta selection no longer forces inherited content into Base. From Current Page it opens the collapsed Search Appearance section, highlights the exact field, and exposes `Base template / Edit this page`.
- Preview intro is split into separate inspectable Base and current-page regions; inspect mode exposes an `Add page-specific content` target when the current-page addition is empty.
- Switching Current Page ↔ Base no longer resets Preview. Preview always composes the latest Base layer and current-page layer into one final-page snapshot.
- Runtime proof: H1 override updates Preview immediately; current-page intro updates only the current-page Preview region; Base intro updates only the Base region; both remain visible across scope switches; Preview clicks route back to the correct owner editor.
- Contract, repo backend/API/dual-repo gates, full root build and `git diff --check` pass locally. Production/main/live DB remain untouched.
## 2026-09-06 — explicit submit-review handoff
- User reported that the editor did not make the path to the next review stage obvious. Root cause: after any edit, the top review CTA was replaced by a generic Save action, so `Submit for review` disappeared exactly when the operator needed it.
- Editing state now always keeps review progression visible. Clean state shows `提交审核 →`; dirty state shows secondary `仅保存草稿` plus primary `保存并提交审核 →`.
- Dirty save-and-submit persists the content/template changes and `ready_for_review` in one write; clean submit keeps the existing metadata-only review transition. Current Page and Base Template share the same rule.
- Desktop top review bar stays compact at ~61px: `下一步：进入待审核 · 2/3` sits inline with the 148px primary CTA. Mobile stays 60px with a 112px `提交审核 →` CTA and zero horizontal overflow.
- Contract now protects visible submit-review continuity and the atomic dirty save-and-submit path. Admin contract, repo backend/API/dual-repo gates and full root build pass locally. Production/main/live DB remain untouched.

## 2026-09-06 17:52 +08:00 — exact branch / progress sync
- Working branch: `feature/admin-content-v0` at `03919cb65d0a0d1f85860e83e5176dbfa8d075f4` before this docs-only checkpoint. Remote feature matches that SHA; worktree was clean before documentation sync.
- Live `main`: `64fa58a16a723b74621ac1db513adb1efb47e282`. Merge base: `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Exact divergence from live main: **269 main-only / 184 feature-only commits**. This is a two-way divergence, not a simple feature-ahead-of-main relationship.
- A read-only `git merge-tree` probe reports real conflicts across `.ai` state docs, `.gitignore`, `HANDOFF.md`, `PROGRESS.md`, `package.json`, `src/App.tsx`, compatibility files, `src/pages/CareEncyclopedia.tsx`, etc. Therefore do **not** blind merge/rebase this feature into main.
- Draft reconciliation PR #144 (`codex/reconcile-admin-content-v0-main-20260905` → `main`) remains OPEN / Draft / UNSTABLE and stays PARKED while Species SEO Admin operator acceptance continues.
- Latest functional SEO Admin checkpoint: `03919cb6 fix(admin): keep review handoff visible`. Review progression is now continuous: clean Editing shows `提交审核 →`; dirty Editing shows `仅保存草稿` + primary `保存并提交审核 →`; desktop also shows `下一步：进入待审核 · 2/3`. Current Page and Base share the same rule.
- Previous accepted checkpoints immediately beneath it: `798596af` Preview↔Editor 1:1 ownership/alignment; `2e741fac` task-first editor; `dbf29f35` clean neutral editor canvas; `2d0aa1a8` Data Review action-first workspace.
- Latest GitHub Admin Content CI run `34026353946`: `validate` PASS; heavy browser/SEO handoff gate correctly SKIPPED by low-cost policy. Cloudflare exact-SHA deployment for the functional checkpoint is successful; verified Preview: `https://7ff827d1.aquaguide-frontend.pages.dev/admin/seo/?demo=1`. Stable branch Preview remains `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1`.
- Production, live DB, `main`, Care SEO `hold_noindex`, and public indexing remain untouched.
- Active next work is still **Species SEO Admin operator acceptance / usability convergence**. Do not resume PR #144 reconciliation until the user explicitly returns to branch convergence.

## 2026-09-06 19:05 +08:00 — task prompt alignment acceptance
- Functional checkpoint `01521a8c fix(admin): align task prompts with inputs` closes the first remaining hosted operator-acceptance defect found after restoring the session from canonical authority.
- Root cause was legacy global `label > span` CSS (`justify-self:end` + negative top margin) leaking into the newer task-first question spans. The question copy existed, but visually detached from its guidance/input, especially at 390px.
- Page-specific task questions now explicitly reset to left alignment / zero negative margin and share the same left edge as their input. Contract coverage prevents the legacy label treatment from regressing onto task prompts.
- Local and hosted exact-SHA acceptance both pass at 1440×900 and 390×844 with horizontal overflow `0`. Desktop Preview remains 742px editor + 420px Preview; Base ↔ Current Page switches preserve the open Preview and synchronize the top review scope. Mobile Preview remains a ~374px fixed overlay. `.studio-editor-area` contains zero review bars.
- Admin contract (including Repo backend/API/dual-repo gates), Admin build, full root build and `git diff --check` PASS. GitHub Admin Content CI run `34029137779`: `validate` PASS; Heavy browser/SEO handoff gate SKIPPED by policy.
- Cloudflare exact-SHA Preview PASS: `https://0e0f1106.aquaguide-frontend.pages.dev/admin/seo/?demo=1`. Stable branch Preview remains `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1`.
- Before this docs-only sync, feature is `01521a8c5c5152b1e7b5438e66c7a454a38f0ffb`, live main `64fa58a16a723b74621ac1db513adb1efb47e282`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence **269 main-only / 186 feature-only**. PR #144 stays PARKED. Production/live DB/index/Care SEO remain untouched.
- Active next work remains user/operator visual acceptance and any new Species SEO Admin UX feedback. Writable `admin-content` Preview credential restoration remains separate and must use safe server-side secret binding.

## 2026-09-06 20:38 +08:00 — operator visual hierarchy convergence
- User reported that the whole Species SEO Admin still felt visually chaotic. The problem was structural rather than one misaligned field: the first screen exposed too many persistent surfaces as peers — topbar, a separate read-only Demo banner, four card-like publish stages, a verbose semantic review strip, sidebar statistics/filters, a second locale switch and the editor toolbar.
- Functional checkpoint `e584e3f6 fix(admin): simplify operator visual hierarchy` collapses those competing layers without changing content authority or review semantics. The accepted persistent hierarchy is now **Topbar → one linear Publish Progress Navigation → one compact Current Page/Base Review strip → Workspace**.
- The read-only Demo message is now a compact topbar state (`只读演示 · 不会写入`), not another horizontal banner. Publish stages are connected steps rather than four independent cards; only the current step marker uses the Green accent. Page Review stays white and uses only a slim semantic edge/status marker instead of a full pink/yellow/green fill.
- The editor-local language switch is removed; the single top workspace language control still switches UI + content locale together. Sidebar search is first, the repeated `486 / duplicate / Base` catalog summary is removed, and `管理基础模板` is shortened to `基础模板`.
- Hosted exact-SHA acceptance at 1440×900: workflow 50px, review 49px, Workspace starts at y=143 (previous accepted hosted layout was ~187px), horizontal overflow 0. Preview remains 742px editor + 420px Preview and stays open across Base ↔ Current Page; review scope remains synchronized.
- Hosted 390×844: workflow 69px, review 60px, Workspace starts at y=171 (previous hosted layout ~205px), horizontal overflow 0. Preview remains a ~374px fixed Overlay. No review bar is rendered inside the editor.
- PASS: Admin contract including Repo backend/API/dual-repo gates, full root build and `git diff --check`. GitHub Admin Content CI `34033618797` validate PASS; Heavy browser/SEO handoff gate correctly SKIPPED by low-cost policy. Cloudflare exact-SHA: `https://9660b6c1.aquaguide-frontend.pages.dev/admin/seo/?demo=1`. Stable acceptance URL remains `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1`.
- Pre-doc-sync refs: feature `e584e3f6fe49159b7896e7a8429bca59a9877f60`, live main `64fa58a16a723b74621ac1db513adb1efb47e282`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence **269 main-only / 188 feature-only**. Draft PR #144 remains PARKED. Production, live DB, Care SEO `hold_noindex` and public indexing remain untouched.
- Do not reintroduce the removed banner/card/stat/locale layers merely to make status more visible. Future acceptance work should reduce cognition through progressive disclosure, not add another permanent surface.

## 2026-09-06 — SEO Page Registry operator queue checkpoint
- Functional checkpoint `e554fcc8` (`feat(seo): add registry operator queue summary`).
- SEO Operations Registry now has the first operator queue summary layer above the read-only page registry: it distinguishes pages requiring attention from unknown/unavailable source states instead of treating unreadable state as healthy.
- Existing authority boundaries remain unchanged: Species stays Repo Admin authority; Care stays Published Care / Care SEO authority. Registry remains read-only and does not become a new CMS or publication database.
- Local verification: SEO Page Registry contract PASS (`speciesCandidates=972`, Care candidates verified, unique keys validated), TypeScript check PASS.
- Current refs after sync: local feature `e554fcc816f9e696163b8184144820b1391f9557`; remote feature currently `3dfa76af8d1493b8a7fb17e950afb7849cfb2eac`; live main `64fa58a16a723b74621ac1db513adb1efb47e282`; merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Measured divergence against live main: `269 main-only / 191 feature-only`. This remains a two-way divergence. Do not merge/rebase or resume PR #144 reconciliation.
- Production, live DB, Care SEO `hold_noindex`, public indexing and main remain untouched.

## 2026-09-08 — SEO Operations Health Layer V2 local completion
- Restored from real authority at Git HEAD `46418ac591a55d73bf6bf5a2ee88a8338b848b9d`; current changes are intentionally local/uncommitted in this session.
- Species health now reads Variant + Base Template together and evaluates the **effective** SEO result, so inherited Meta Title / Meta Description / H1 are not falsely reported missing. It also checks bilingual completeness and real Canonical-to-sibling validity.
- Care health now has one authenticated **batch read** across current `content_publications` + legacy-published fallback + Care SEO Editorial revisions. Per resource, immutable Published snapshot wins; legacy is used only when that resource lacks a snapshot. An editable Care row returning to Draft therefore does not erase its last Published authority.
- Care health distinguishes not published, legacy-not-snapshot, source drift, missing bilingual pair, missing Meta/H1 and incomplete human review. Legacy source and source drift are hard blockers because Staging handoff requires immutable Published snapshot binding.
- `/admin/seo-pages` remains read-only. Health cards now show truthful all-page counts, filter the registry, expose row-level issue labels, and route operators back to the existing Species/Care editor authority.
- PASS: `test:care-seo-editorial`, `test:seo-page-registry`, root TypeScript, `@aquaguide/api` TypeScript, `git diff --check`, and full root `npm run build`. Species/Care artifact builders correctly skipped normal code builds.
- Current refs after fresh fetch: local `feature/admin-content-v0` HEAD `46418ac5`; remote feature `3dfa76af`; live main `64fa58a1`; divergence **269 main-only / 197 feature-only**, merge base `ed0cf380`. Local HEAD is 35 commits ahead of remote feature before these uncommitted changes.
- Production, main, live DB, Care SEO `hold_noindex`, public indexing and Draft PR #144 remain untouched. Next: browser/operator acceptance of the Health queue/filter/deep-link behavior before any separate credential or reconciliation work.

## 2026-09-08 — SEO Operations Health queue acceptance closeout
- `f945e9f8` completes the Health V2 implementation and the operator-facing queue behavior without adding any write authority. Effective Species inheritance, bilingual/Canonical checks and snapshot-aware Care health remain the source of truth.
- Default `/admin/seo-pages` now prioritizes only `blocked / attention`; source permission/service failures are isolated as `来源待读取`, with an explanatory empty state and explicit filter. Unknown does not masquerade as healthy or actionable SEO work.
- Inventory rendering is capped to 50 rows per reveal instead of 300. Search spans all states; health cards filter/toggle back to priority. Issue labels explain the operator action instead of exposing raw codes.
- Local Playwright acceptance at 1440×900 and 390×844: zero horizontal overflow; default priority, unknown expansion/reset, all-pages mode, `sp_0001` search and progressive footer pass.
- Local Preview is `http://127.0.0.1:3003/admin/seo-pages`. Use `API_PORT=8788` for this worktree while the legacy Aqua worktree owns 8787; do not kill the unrelated process just to reuse the port.
- PASS: `test:seo-page-registry`, `test:care-seo-editorial`, `check:api`, root `lint`, `git diff --check`, full `npm run build`.
- Fresh branch read after functional commit: live main `d3c70dee`, remote feature `46418ac5`, merge base `ed0cf380`, divergence **275 main-only / 198 feature-only**. This strengthens the existing rule: no blind merge/rebase and PR #144 stays parked. Production/live DB/index/Care `hold_noindex` remain untouched.

## 2026-09-08 18:20 +08:00 — Species SEO CMS UI Foundation convergence
- Functional checkpoint `f57cc39d3e127c34edfcb376c8e83a3d2a59c1e9` (`fix(admin): establish ui foundation hierarchy`).
- Added `apps/admin-content/src/ui-foundation.css`, loaded after legacy `styles.css`, to centralize typography/control/editor-density authority instead of adding more page-local overrides.
- Primary actions now use stable readable sizes: Submit Review 40px/13px, workflow current action 36px/12px, scope/Preview 36px/12px, global locale 34px/12px.
- Desktop editor panel reduced from ~760px/772px to 700px/~698px while task-question typography increased to 13px and guidance to 12px; textarea reduced from 104px to 76px.
- Mobile fixes: workflow action no longer overflows, review uses progressive disclosure instead of 7px step labels, sidebar is capped at 180px, editor begins around y=413, scope controls are 12px/36px; horizontal overflow remains 0.
- Secondary tool launchers now use 13px labels / 11px helper+status copy; Bulk upload is 13px/36px; Data Review confirm consumes the primary control token.
- Desktop Preview remains simultaneous at 742px editor + 420px Preview; mobile remains ~374px fixed overlay.
- PASS: Admin contract, Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`, 1440/390 browser acceptance.
- Live refs at checkpoint: main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature before push `a7db1e186ec10ad29520f041ff1da03a44a6de06`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence **275 main-only / 200 feature-only**. No main merge/rebase, Production deploy, live DB/index change; PR #144 remains parked.
- Local CMS Preview: `http://127.0.0.1:3010/?demo=1`.

## 2026-09-08 18:37 +08:00 — CMS low-noise hierarchy convergence
- Functional checkpoint: `8a44d1c8d835ff62c3cee07124b9c541cb8f1cdf` (`fix(admin): reduce editor preview visual noise`).
- User acceptance found the current-page editor + Preview still expressed the same state at too many nested layers. Warning state appeared in task summary, section edge, field edge and input border; Preview mapping also reused Green across tabs, inspect controls, outlines and tags.
- New rule: **one state is expressed once**. Page-level `2 项待填写` remains the visible warning. Primary section/fields/inputs stay neutral; selected Preview↔Editor mapping uses Graphite rather than Green.
- Removed redundant editor hierarchy: the repeated `当前页面` eyebrow and duplicate section `待补充` chip are gone; the decorative section-heading dash is removed.
- Preview top chrome is reduced from Header + readiness row + inspector breadcrumb row to Header + one context row. Exact editor path remains available via tooltip/contract but no longer occupies a persistent visual band.
- Preview Page/Google/Mobile selection and `点击内容编辑` use Graphite; Green is reserved for primary workflow actions such as `开始处理` / `提交审核`. The real public-page Preview content is not recolored.
- Browser acceptance: 1788×846 and 390×844 both have zero horizontal overflow; selected editor field is a single Graphite edge, warning inputs are neutral, Preview context row is 36px.
- PASS: Admin Content contract including Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index/Care `hold_noindex` remain untouched.
- Correct local CMS Preview remains `http://127.0.0.1:3010/?demo=1`.

## 2026-09-08 19:13 +08:00 — Preview toggle semantics cleanup
- Functional checkpoint: `c2f52dc619c262289686be37afd286c983ad2430` (`fix(admin): clarify preview pick edit mode`).
- `点击内容编辑` was an instructional sentence rendered as a button. It is now the actual mode label `点选编辑` / `Pick to edit`.
- The control now exposes `aria-pressed`, action-specific `aria-label`, and guidance in `title`; instruction is help text, not button copy.
- Browser acceptance: 1440×900 + 390×844; toggle true→false→true, zero horizontal overflow; Preview clicks do not select editor fields while off and do select when on.
- Visible-button audit found no other same-class instruction-as-button badcase on the current CMS screen.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Correct local CMS Preview remains `http://127.0.0.1:3010/?demo=1`.

## 2026-09-08 19:26 +08:00 — CMS action hierarchy convergence
- Functional checkpoint: `dde46eef0b577b76fc89ed1c912dbde82a75613a` (`fix(admin): clarify action hierarchy`).
- Workflow queue CTA now tells the truth: `开始处理` → `查看待处理`; it only navigates/filters the queue and is styled as a neutral navigation action, not a Green primary mutation CTA. Edit fallback likewise reads `返回编辑区`.
- Interface language and Preview mode segmented controls expose explicit `aria-pressed`; active selection uses Graphite, not Green.
- Preview toggle is action-aware: closed=`效果预览`, open=`关闭预览`, with matching `aria-label`.
- `单独修改` is now a readable 12px underlined Text Action rather than a 21px Green micro-button; Preview add-supplement affordance is raised to 11px/30px.
- Current workflow stage, current review step and selected Species use Graphite. Browser color scan at 1440/390 leaves Green on the current screen only for the real primary `提交审核 →` action; zero horizontal overflow.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Correct local CMS Preview: `http://127.0.0.1:3010/?demo=1`.

## 2026-09-08 19:31 +08:00 — Page Review hierarchy dedupe
- Functional checkpoint: `2182bb106a9e76a051cc5fb18ed5dbd1e77315dd` (`fix(admin): dedupe review status hierarchy`).
- Page Review meta no longer repeats the active review stage. Left meta now carries only distinct information: scope + health + publish status (`当前页面审核 / 需修复 / 草稿`); the 1→2→3 stepper remains the single source for `编辑中 / 待审核 / 已批准预览`.
- 1440×900 and 390×844 browser acceptance keep zero horizontal overflow.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. No Production/main/live DB/index changes.

## 2026-09-08 19:40 +08:00 — CMS workflow hierarchy simplification
- Functional checkpoint: `58f6af61af891b16387f03845ed527fedf6f34ea` (`fix(admin): simplify workflow hierarchy`).
- Removed the duplicate global `workflow-current-action` layer; the four Publish Flow stages are now the single queue navigation authority. Current priority stage derives directly from real Data Review / editorial review / Preview-ready counts.
- `发布流程` is now only a section label; the redundant `1/4` indicator is removed. Zero-value global stage badges are suppressed while non-zero actionable counts remain.
- Mobile global workflow height reduced from 88px before convergence / 43px after this round; editor begins at y=368 instead of the earlier y=413 baseline. Desktop/mobile remain zero-overflow.
- Sidebar quick filters with zero work (`待审核 0`, `预览 0`) are real Disabled controls; actionable `数据问题 33` remains interactive.
- Page Review severity now treats ordinary incomplete/blocked authoring as Warning (`待处理`), matching `2 项待填写`; Error (`需修复`) is reserved for hygiene/indexing-policy invalidity.
- PASS: Admin Content contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Correct local CMS Preview: `http://127.0.0.1:3010/?demo=1`.
- Fresh remote read before docs sync: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature `83d7e982dfaf15a8f0c77ae6ef525fa3f0162871`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence at functional checkpoint **275 main-only / 210 feature-only**.
## 2026-09-08 21:09 +08:00 — Species navigation hierarchy convergence
- Functional checkpoint: `71b2e7a8c188688d8f7c3d81a688c2e643750fbe` (`fix(admin): prioritize mobile species selection`).
- Mobile Species navigation now defaults to a 58px current-selection row (`当前选择 / 更换物种`) instead of spending the first 180px on search/filter chrome. Editor begins at y=200 versus y=368 before this round.
- `更换物种` expands an inline selector to 520px max with a 299px scrollable Species list; selecting a Species automatically collapses back to 58px and updates the current selection. No new persistent hierarchy layer was added.
- Empty sidebar workflow queues are not rendered. Current demo shows only actionable `基础种 276` and `数据问题 33`; review/Preview shortcuts appear only when count > 0.
- Sidebar hierarchy is explicit: scientific-name group labels are 12px/600 muted structure; Species rows remain 13px, and only the selected Species rises to 700. Duplicate variant metadata such as `迷你鹦鹉鱼 / 迷你鹦鹉鱼` now falls back to `使用模板`.
- Removed superseded Foundation rules for 220px/180px mobile sidebar and disabled empty-queue styling instead of stacking more overrides.
- Browser acceptance: desktop 1440×900 and mobile 390×844 both zero-overflow/no page errors; mobile closed=58px, expanded list=299px, selection auto-collapse PASS.
- PASS: Admin Content contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Correct local CMS Preview: `http://127.0.0.1:3010/?demo=1`.
- Fresh remote read before docs sync: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature `543cc4c556890846737e4c5e3a522f4025f94a28`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence at functional checkpoint **275 main-only / 212 feature-only**.
