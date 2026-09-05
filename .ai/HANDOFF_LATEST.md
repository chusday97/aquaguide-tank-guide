# AquaGuide Admin / Operations Studio — HANDOFF LATEST

Updated: 2026-09-05
Canonical repo: `chusday97/aquaguide-tank-guide`
Local worktree: `/Users/chuchu/aquaguide-admin-content-v0`
Branch: `feature/admin-content-v0`
Current functional HEAD before this docs sync: `1e1414ec768580843e4f9faf2599719fbe5805c7`
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

P2 — [DONE] Unified Publish Center V1 + permission/audit visibility. [DONE] Care SEO Published projection + Editorial Draft/Review + sanitized Staging handoff + protected hosted acceptance + release-readiness evidence. [DONE] Explicit decision is `hold_noindex`. [DONE] First AI advisory layer for Published-Care source extraction/conflict/impact/SEO Draft suggestion. [NEXT] Dedicated feature ↔ live-main reconciliation audit only; no merge is authorized yet.

## Branch / safety
- Live `main`: `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Feature remote before this docs sync: `5899d64343fdc5d6e4929c31ed84a29af437be1c`.
- Current measured divergence before this docs-only sync: main-only 269 / feature-only 161 commits; merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
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
- Stateful controls use `aria-pressed`; selected scope/locale/filter controls receive a dark fill, stronger border/shadow, and check feedback where appropriate.
- Selected Base/Species rows now show an explicit ✓ plus stronger background/left marker; changing Species moves the marker to the newly selected row.
- Browser checks at 1440/390 verified real computed-style changes, selected Species switching, Base selection, scope selection and zero horizontal overflow. Production/main/index/live DB remain untouched.
