# Task Queue

## CURRENT OVERRIDE — 2026-09-13 after corrupt active authority startup recovery closure
- DONE: reproduce a corrupt active root still entering Operations Studio with normal workspaces available.
- DONE: add startup integrity preflight before Durable Local File partition hydration.
- DONE: fail closed with `INTEGRITY_FAILED` instead of loading ordinary Admin when active authority is unhealthy.
- DONE: preserve a recovery-only path that lists healthy backups and restores the latest healthy backup without opening normal workspaces.
- DONE: permanent Playwright regression covers corrupt blob -> blocked startup -> one-click healthy backup restore -> reload -> healthy root.
- DONE: Local File API/UI / Operations Studio / mode contract / API+root TypeScript / full build / GitHub Product Golden Path PASS.
- NOTE: no Vercel Git auto-preview was created; no manual Preview because this is DEV-only. Production unchanged.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.

## CURRENT OVERRIDE — 2026-09-13 after backup manifest-directory binding closure
- DONE: reproduce newest backup metadata aliasing an older backup id and restoring the wrong directory with HTTP 200.
- DONE: require `manifest.id === backup directory id` in the canonical backup reader.
- DONE: mismatched manifest hidden from candidate list; direct restore rejected with 409.
- DONE: permanent regression + Local File/UI/Operations/mode/TypeScript/full-build gates.
- DONE: GitHub Product Golden Path `34754738827` PASS.
- NOTE: Vercel Git auto-preview was not created for this push; no manual Preview was triggered because Local Admin is DEV-only and Production is unchanged.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.

## CURRENT OVERRIDE — 2026-09-13 after failed restore rollback integrity closure
- DONE: reproduce restore failure reporting successful automatic rollback while the safety backup had become corrupt.
- DONE: validate safety backup before immediate rollback apply.
- DONE: validate active authority after immediate rollback apply.
- DONE: retain `.restore-transaction.json` and report rollback failure if either integrity gate fails.
- DONE: permanent real-filesystem race regression.
- DONE: Local File API/UI / Operations Studio / mode contract / TypeScript / full build / GitHub Product Golden Path PASS; Vercel branch deployment READY.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.

## CURRENT OVERRIDE — 2026-09-13 after corrupt backup candidate filtering closure
- DONE: reproduce a manifest-valid but content-corrupt backup still appearing in `GET /backups`.
- DONE: filter restorable backup candidates by full backup-root integrity, not manifest validity alone.
- DONE: preserve corrupt backups on disk for operator inspection; do not auto-delete.
- DONE: retain direct restore integrity rejection as a second safety gate.
- DONE: permanent regression + Local File/UI/mode/Operations/TypeScript/build gates.
- DONE: GitHub Product Golden Path PASS; Vercel branch deployment READY.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.


## CURRENT OVERRIDE — 2026-09-13 after interrupted restore integrity closure
- DONE: reproduce startup recovery accepting a corrupt safety backup and deleting its journal.
- DONE: validate the safety backup before apply.
- DONE: validate the recovered active root before temp/journal cleanup.
- DONE: permanent regression requires corrupt safety backup => startup 500 + journal retained + active root unchanged.
- DONE: valid interrupted-restore recovery remains PASS.
- DONE: Local File API/UI / mode contract / TypeScript / full build / GitHub Product Golden Path PASS; Vercel branch deployment READY.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.

## CURRENT OVERRIDE — 2026-09-13 after held root lease displacement closure
- DONE: reproduce dual-live-owner state after externally deleting the active `.aqua-admin-owner.json`.
- DONE: revalidate in-memory lease ownership against on-disk PID + token on every Local Admin request.
- DONE: missing lease forces atomic reacquisition; displaced owner fails closed instead of continuing to serve.
- DONE: formal regression + 20-cycle displacement/reacquisition stress.
- DONE: Local File API/UI / mode contract / API+root TypeScript / full build / GitHub Product Golden Path PASS; Vercel branch deployment READY.
- NEXT: only another reproducible operator/runtime/data-reliability badcase. Do not expand multi-owner semantics.

## CURRENT OVERRIDE — 2026-09-13 after fail-closed startup guidance closure
- DONE: reproduce misleading fixed startup guidance for invalid restore journal, unreadable root lease, and future Local File schema.
- DONE: map Local Admin startup failures to cause-specific operator actions.
- DONE: expose exact lease/journal recovery paths through DEV-only Local Admin API error details.
- DONE: deterministic same-root owner browser probe still shows owner reason + close-old-process action.
- DONE: real browser verification for owner conflict / invalid journal / invalid lease / future schema.
- DONE: Local File API/UI / mode contract / API+root TypeScript / full build / GitHub Product Golden Path PASS; Vercel branch deployment READY.
- NEXT: only another reproducible operator/runtime/data-reliability badcase. Do not add recovery buttons or mutate authority speculatively.

## CURRENT OVERRIDE — 2026-09-13 after Local owner conflict guidance closure
- DONE: reproduce the startup UX loss of the same-root `VERSION_CONFLICT` reason.
- DONE: preserve the actionable Local File API message through startup hydration.
- DONE: add explicit same-root old-process recovery guidance to the fail-closed startup screen.
- DONE: real two-process browser verification confirms both owner reason and recovery instruction are visible.
- DONE: audit Operations Home safety actions; they already preserve `cause.message`.
- DONE: Local File UI / mode contract / TypeScript / full build / GitHub Product Golden Path PASS; Vercel branch deployment READY.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.

## CURRENT OVERRIDE — 2026-09-13 after interrupted restore recovery closure
- DONE: protect restore with a durable transaction journal tied to the pre-restore safety backup.
- DONE: recover an interrupted/mixed active root before serving any Local Admin request on the next process start.
- DONE: clean stale `.restore-assets-*` directories and delete the journal only after successful rollback recovery.
- DONE: fail closed for invalid journals or failed safety recovery.
- DONE: formal fresh-process recovery regression + GitHub Product Golden Path PASS + Vercel branch deployment READY.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.

## CURRENT OVERRIDE — 2026-09-13 after PID-reuse lease closure
- DONE: reproduce stale lease false-lock with a real unrelated live process reusing the recorded PID (`409 VERSION_CONFLICT`).
- DONE: upgrade root lease identity from PID-only to PID + process-start identity.
- DONE: preserve conservative fail-closed behavior for legacy/no-identity leases and unreadable process identity.
- DONE: formal recovery regression + full Local File/UI/contract/TypeScript/build gates.
- DONE: GitHub Product Golden Path PASS; Vercel branch deployment READY.
- NEXT: only another reproducible operator/runtime/data-reliability badcase. Do not expand Local File semantics speculatively.


## CURRENT OVERRIDE — 2026-09-13 after root ownership closure
- DONE: reproduce cross-process same-root torn asset pair.
- DONE: enforce atomic single-owner root lease with live-PID conflict rejection and stale-PID recovery.
- DONE: formal second-process + stale-lease regression.
- DONE: 8-process contention stress (1 owner / 7 conflicts / zero residue).
- DONE: full Local File/UI/contract/TypeScript/build gates; GitHub Product Golden Path PASS; Vercel branch deployment READY.
- DO NOT: add distributed/multi-process Local File semantics. One root = one live Local Admin API process is the accepted invariant.
- NEXT: only another reproducible operator/runtime/data-reliability badcase.


## CURRENT OVERRIDE — 2026-09-13 after restore visibility closure
- DONE: restore intermediate state can no longer leak through state/asset/status/integrity reads (`deb5b085`).
- VERIFIED: shared reads remain concurrent and a waiting restore writer is not starved under sustained GET load.
- NEXT: only another concrete reproducible operator/runtime/data-reliability badcase. Do not expand locking or restore behavior speculatively.


## CURRENT OVERRIDE — 2026-09-13 after cross-operation consistency closure
- DONE: authority snapshot/write serialization (`01fdca74`).
- DONE: same-asset read/write pair serialization (`0df8a63d`).
- DONE: integrity consistent-read serialization (`f83c08fd`).
- VERIFIED NO BLOCKER: restore×asset GET stress (70 assets / 20 restores / 4400 reads).
- NEXT: only another reproducible operator/runtime/data-reliability badcase, or an explicit separately-authorized Staging/indexing decision. Do not expand Local Admin speculatively.


## ACTIVE OVERRIDE — Local File concurrency closure (2026-09-13)
- [x] Reproduce concurrent runtime snapshot collision (100 requests: 35×201 / 65×500).
- [x] Make atomic JSON/buffer temp paths and runtime staging paths uniquely namespaced with `randomUUID`.
- [x] Add 32-way runtime export regression; stress 100/100 success with zero temp residue.
- [x] Reproduce concurrent backup ID race (32×201 but only 16 unique backups).
- [x] Reserve backup directories atomically with `mkdir` / `EEXIST` retry.
- [x] Add 24-way backup regression; stress 100/100 unique IDs/directories.
- [x] Reproduce same-asset concurrent PUT torn pair despite both requests returning 201.
- [x] Serialize same-ID PUT/DELETE mutations with keyed in-process queue.
- [x] Add 24-round asset concurrency regression; stress 80 rounds with zero mismatch.
- [x] Re-run Local File UI, Local Admin contract, API/root TypeScript and full build.
- [x] Product Golden Path PASS and Vercel branch deployments READY for `275587ea`, `6cd1d5d8`, `25ea430b`.
- [x] Keep Production unchanged; Local File route is DEV-only.
- [ ] Continue only from another reproducible operator/runtime/data-reliability badcase.

## ACTIVE OVERRIDE — Local asset pair transaction closure (2026-09-13)
- [x] Reproduce PUT failure where blob commits but metadata replacement fails.
- [x] Roll back the previous blob, or remove a newly-created blob, when metadata commit fails.
- [x] Add cross-platform regressions for new asset and overwrite failure.
- [x] Reproduce DELETE failure where blob is removed but metadata unlink fails.
- [x] Make DELETE sequential and restore the previous blob on metadata failure.
- [x] Re-run Local File API/UI, Local Admin contract, TypeScript and full build.
- [x] GitHub Product Golden Path PASS and Vercel branch deployments READY for `f2087f26` and `9a6855da`.
- [x] Re-audit restore rollback read-only; no reproducible blocker found, so no speculative restore changes.
- [x] Keep Production unchanged; Local File routes are DEV-only.
- [ ] Continue only from a new reproducible operator/runtime/data-reliability badcase.


## ACTIVE OVERRIDE — failed backup residue closure (2026-09-12)
- [x] Reproduce a mid-copy backup failure using an unreadable but integrity-stat-valid asset blob.
- [x] Prove pre-fix failure leaves an extra manifest-less `backup-*` directory.
- [x] Delete the newly-created backup destination on any createBackup failure.
- [x] Add permanent behavioral regression requiring no backup directory residue.
- [x] Re-run Local File API/UI, Local Admin contract, API/root TypeScript and full build.
- [x] GitHub Product Golden Path PASS and Vercel branch deployment READY for `0c8cd464`.
- [x] Keep Production unchanged; route is DEV-only.
- [ ] Continue only from a new reproducible operator/runtime/data-reliability badcase.


## ACTIVE OVERRIDE — canonical environment hardening closed (2026-09-12)
- [x] Detect canonical main dependency symlink into historical Admin worktree.
- [x] Replace it with a lockfile-driven local `npm ci` install.
- [x] Verify Local File, Local Admin mode, Operations, API/root TypeScript and full build from canonical main only.
- [x] Start `dev:local-admin` from canonical main and verify API/main/SEO Admin HTTP responses.
- [x] Confirm no existing Durable Local File data/root override needs migration.
- [ ] Continue only from a new reproducible operator/runtime/data-reliability badcase.


## ACTIVE OVERRIDE — canonical continuation path repair (2026-09-12)
- [x] Reproduce stale cross-session entry routing to old `feature/admin-content-v0` / historical worktree.
- [x] Verify current main and GitHub main are synchronized before filesystem change.
- [x] Move canonical main worktree from temporary `/private/tmp/...` to durable `/Users/chuchu/aquaguide-main` without changing Git history.
- [x] Rewrite `CROSS_SESSION_START.md` current routing to main and add path/branch/remote guards.
- [x] Preserve all historical worktrees; do not reset/delete them.
- [ ] Continue only from a new reproducible operator/runtime/data-reliability badcase or explicit Staging/indexing work.


## ACTIVE OVERRIDE — post-release concrete badcase closure (2026-09-12)
- [x] Re-run Operations/Product-Care/Compatibility/Publish Center acceptance; no operator blocker reproduced.
- [x] Reproduce failed atomic Local File rename leaving `.tmp-*` residue.
- [x] Clean JSON/binary atomic temp files on both success and failure.
- [x] Add fail-before-fix regression for runtime manifest temp cleanup.
- [x] Re-run Local File API/UI, Git runtime authority, TypeScript and full build.
- [x] Push `0b662155`; Product Golden Path PASS; Vercel branch deployment READY.
- [x] Keep Production unchanged because Local File API is DEV-only and excluded from the Production Business API bundle.
- [ ] Continue only from a new reproducible operator/runtime badcase or separately authorized Staging/indexing work.


## ACTIVE OVERRIDE — remote main + Production release closeout (2026-09-12)
- [x] Push accepted local main to GitHub main using compare-and-push guards.
- [x] Preserve remote Git rollback branch at pre-Aqua main `d3c70dee633e`.
- [x] Diagnose and fix Vercel `/api/v1/router` 266.91 MB serverless package overflow.
- [x] Keep DEV-only Local Admin outside the Production Business API graph; Production route returns 404.
- [x] Diagnose Node 24 ESM raw-source import failures and replace the raw graph with a generated 1.49 MB Business API bundle.
- [x] Pass local contract/type/build gates with the bundle absent before lint and generated during build.
- [x] GitHub Product Golden Path PASS for runtime checkpoint `5fa915d3`.
- [x] Vercel branch deployment PASS: Business Health 200, Local Admin 404, runtime authority readable.
- [x] Production deployment PASS before traffic switch: Business Health 200 with DB configured, Local Admin 404.
- [x] Reassign public `aqua-tank-guide.vercel.app` alias to validated Production deployment `dpl_2n2CfsVatP4rzzE49Ttd9H752fR8`.
- [x] Public Production smoke PASS, including Encyclopedia/Care static fallback when Product/Care Published API is 0/0.
- [x] Post-release Vercel runtime error check reports no current error clusters.
- [ ] Supabase Staging migration remains separately gated and unapplied.
- [ ] Care SEO indexing remains `hold_noindex`; any index unlock requires a separate explicit release decision.

## HISTORICAL OVERRIDE — local main promotion closed (2026-09-12, superseded)
- [x] Refresh origin and verify no new main commits.
- [x] Preserve pre-promotion main as `rollback/main-pre-aqua-admin-20260912`.
- [x] Create local main from origin/main and fast-forward only to accepted candidate.
- [x] Verify main tree equals candidate and main worktree is clean.
- [x] Run post-promotion main smoke gates.
- [ ] Push local main to origin remains a separate explicit release action.
- [ ] Production deployment/indexing remains untriggered.


## HISTORICAL OVERRIDE — main promotion readiness closed (2026-09-12, fulfilled)
- [x] Re-fetch origin and prove no new main commits are missing from candidate.
- [x] Audit committed Git runtime snapshot before promotion.
- [x] Fix empty Product/Care Git snapshot suppressing Published API.
- [x] Repair Published Content browser gate to current Encyclopedia/Care UI; zh-CN + EN PASS.
- [x] Re-run Compatibility authority/regression, Published isolation, Local Admin, TypeScript and full build gates.
- [x] Rehearse `origin/main → candidate` with `git merge --ff-only` in a disposable worktree; exact tree equality PASS.
- [ ] Preserve current main `d3c70dee633e` as rollback ref when promotion is explicitly authorized.
- [ ] Move main only after explicit promotion authorization.
- [ ] Push/deploy remains a separate explicit action.

## ACTIVE OVERRIDE — Local File → Git runtime authority closed (2026-09-12)
- [x] Export only Published Product/Care + reviewed Compatibility from Durable Local File authority.
- [x] Make frontend Product/Care and Compatibility prefer the committed Git runtime snapshot before network authority fallback.
- [x] Keep Draft/review notes and machine-local paths out of the runtime snapshot.
- [x] Use versioned/content-addressed runtime assets so the manifest is the only authority pointer that changes.
- [x] Make publication failure-safe: final manifest failure preserves the old runtime asset set and rolls back newly staged assets.
- [x] Verify API contract, forced failure rollback, real Local Admin browser flow, TypeScript, full build and diff hygiene.
- [x] Make the operator boundary explicit: snapshot generation writes the repo working tree only; it does not commit, push or deploy, and UI/API both say so.
- [ ] Supabase Staging validation remains optional/separately gated and unapplied.
- [ ] Candidate→main promotion remains separately gated and unperformed.


## ACTIVE OVERRIDE — populated migration gate closed (2026-09-11)
- [x] Execute Compatibility v3 migration on real local Supabase PostgreSQL 17.
- [x] Verify populated pre-v3 Profile/approved revision backfill.
- [x] Verify requiredFacts, Stage Risk, independent Stage Risk Evidence and base-version rebase.
- [x] Verify migrated stale approval cannot publish.
- [x] Verify fresh re-review can atomically publish and keep Profile/Stage Risk evidence isolated.
- [x] Remove temporary migration-test Docker resources while preserving original local Supabase volume.
- [ ] Supabase Staging migration remains separately gated and unapplied.
- [ ] Candidate→main promotion remains separately gated and unperformed.


## ACTIVE OVERRIDE — reconciliation migration invariants closed locally (2026-09-11)
- [x] Reconciliation candidate contains live main + feature without moving main.
- [x] Add transactional migration + actionable requiredFacts preflight.
- [x] Preserve historical revision audit semantics during v3 backfill.
- [x] Validate full stockingGuidance shape at DB + publish boundaries.
- [x] Enforce set semantics for requiredFacts and Stage Risk life-stage arrays.
- [x] Enforce unique Profile/Pair/Stage Risk evidence sourceKeys and stocking evidenceIds.
- [x] Guard both CREATE and PATCH Compatibility Profile inputs against duplicate set values/rule keys.
- [x] Re-run Compatibility contract/browser/authority/regression + API/root TypeScript + full build + pglast SQL parse.
- [ ] Execute migration against a controlled PostgreSQL/Supabase environment; Docker-local execution is blocked by an unresponsive Docker backend.
- [ ] Main promotion remains separately gated.

## ACTIVE OVERRIDE — reconciliation candidate migration safety (2026-09-11)
- [x] Reconciliation candidate contains live main + feature without moving main.
- [x] Compatibility v3 authority integration and operator UI accepted locally.
- [x] Preserve historical revision audit semantics during v3 backfill.
- [x] Enforce requiredFacts / Stage Risk DB shape, visibility and publish-RPC fail-closed gates.
- [x] Re-run Compatibility contract/browser/authority/regression + full build.
- [ ] Execute v3 migration against a controlled local/Postgres or explicitly authorized Staging environment; Docker-local execution is currently blocked by an unresponsive daemon.
- [ ] Main promotion remains separately gated.



## ACTIVE OVERRIDE — reconciliation candidate complete locally (2026-09-11)
- [x] Build isolated reconciliation candidate without modifying main.
- [x] Resolve all Git conflicts and preserve both main product changes and Aqua Operations Studio authorities.
- [x] Reconcile Compatibility v3 domain behavior with reviewed runtime authority.
- [x] Add Profile v3 authority: requiredFacts + stockingGuidance + Profile-owned Stage Risk + dedicated Evidence.
- [x] Add Local v1→v2 compatibility migration and Stage Risk regression/browser publish coverage.
- [x] Add Cloud additive migration/API contracts fail-closed; migration remains unapplied.
- [x] Restore canonical Compatibility service boundary and authority gate.
- [x] Full candidate regression/build PASS.
- [ ] Supabase Staging migration validation remains gated and requires explicit resume.
- [ ] Main promotion/merge remains gated; do not move main or push by default.

## ACTIVE OVERRIDE — Durable Local Operations Studio (2026-09-10)
- [x] Product/Care Local adapter from canonical 486 Species / 41 Care.
- [x] Draft save/refresh persistence and separate Published Snapshot.
- [x] Preserve Care step `actionTitle` / `actionKind` through Local save→publish round-trip.
- [x] Compatibility Local Profile + Pair revision stores with structural Impact + real Regression + Evidence + human review + runtime publish.
- [x] Operations exact WorkItems/deep-links for local Product/Care + Compatibility.
- [x] DEV-only local authority guard; Production cannot enable local authority from Vite flags alone.
- [x] Local Publish Center aggregation/readiness/history (`174cf174`).
- [x] Care SEO Editorial local persistence/readiness (`691c4b43`).
- [x] Local Product/Care image Draft/Published isolation (`2d26b1ca`).
- [x] Durable Local File Mode (`746d5c66`): `.local/aqua-admin` JSON partitions + image files, disk-first persistence, startup hydration, corruption fail-closed, overridable safe ports, Operations persistence indicator.
- [x] Durable full restart regression: Product + image + Compatibility + Care SEO survive server restart and a fresh browser context; browser-only Local regressions remain green.
- [x] Local File backup/restore + schema safety (`f501a69d`): versioned envelopes, legacy migration, future-version refusal, integrity report, timestamped snapshots, restore safety backup and rollback-on-failure.
- [x] Data Review decision-basis convergence (`2fcba840`): evidence-only comparison → human conclusion → explicit canonical choice → final-result summary → one confirm; system recommendation is not auto-selected.
- [x] Species SEO edit action convergence (`b3ec2d8e`): Search & indexing defaults open; top Review bar owns save/review; page/Base bottom duplicate save buttons and Draft chips removed.
- [x] Page/global tool hierarchy (`b6c44a62`): current-page footer keeps only contextual tools; one top-level Operations drawer owns batch SEO, bulk duplicate/content review, template import and global queues.
- [x] Compact top workflow chrome (`bf85231b`): current task + stage navigator + page review stay <=140px on desktop/mobile while retaining one action boundary.
- [x] Base / Preview ownership clarity (`a9a54bc9`): remove duplicate Base impact strip; Preview labels final composition as Base + current page.
- [x] Editor tool ownership (`466025f7`): current-page/Base tools and revision history follow the active authority; `本页自定义` states override scope explicitly.
- [x] Visible SEO density (`6a1f1979`): required Search/indexing controls remain open while inherited rows and policy/route controls are compacted.
- [x] Responsive Preview (`d1af2c08`): >=1051px split keeps editor >=480px; medium Preview is 340–360px; <=1050px uses closed-by-default/on-demand overlay; browser matrix PASS.
- [x] Medium-width editor acceptance hardening (`c258640b`): editor/panel no internal horizontal scroll; policy controls remain >=180px.
- [x] Topbar action convergence (`1ea56f60`): Activity Center moved under Operations; unread count preserved; mobile topbar reduced to four actions.
- [x] Publish Center hierarchy (`3cb4a569`): compact source/readiness summary, audit-first timeline, explicit-on-selection detail, secondary release-boundary disclosure, true 390px viewport regression.
- [x] Product/Care editor priority (`448bfcd8`): compact mobile navigator, fields before review/downstream blocks, no internal mobile overflow, explicit Save-before-Publish state.
- [x] Downstream review visual semantics (`340cbfd3`): Graphite/White/Green default; Amber only for explicit human decision/review; Care SEO purple/indigo parallel theme removed and contract-guarded.
- [x] Compatibility review hierarchy (`89b6863a`): one Profile/Pair visual authority, explicit state colors, compact authority summary, 390px editor-before-lists/no-overflow guards.
- [x] Operations Home first-screen density (`ee41c214`): task-first layout preserved; ready-source detail compacted; workspaces 2×2 on mobile; Recent Activity reduced to latest-event summary; 390px total height ~1833→1373px.
- [x] Cross-workspace task continuity (`24097c4b`): Product/Care + Compatibility return by Router state; standalone Species SEO has a validated same-host Operations return contract; returned tasks are located/highlighted or explained if no longer queued.
- [x] Repeated Operations queue cap (`35134b0d`): identical low-priority authority/severity/gate attention rows show at most three on Home; hidden counts remain summarized by authority.
- [x] Exact task completion closure (`fcc86c0d`): Product publish and Compatibility reviewed publish return to Operations with the completed task removed and the next priority visible without manual refresh.
- [x] Exact SEO WorkItem action semantics (`258a5d0d`): blocker/review/attention actions name the concrete next gate instead of generic page actions.
- [x] Care SEO Operations focus (`7799d88a`): real `seo=1` deep-links land on the hydrated Care SEO Editorial workspace at 1280/390.
- [x] Authority-target alignment (`f79802b5`): unpublished Care source work returns to Product/Care editing; actual SEO work retains downstream focus.
- [x] Legacy `source_not_snapshot` repair ownership (`1c78ef14`): WorkItem returns to Product/Care; dedicated admin-only repair creates the immutable Published Snapshot without changing Care content/status/version; Local Mode rejects the legacy-only action; exact record deep-links are race-safe.
- [x] Compatibility missing-check repair (`298f5810`): missing Impact / Regression / Canonical Evidence has one executable repair path; approved revisions drop back to pending review and require fresh human approval.
- [x] Bilingual SEO counterpart targeting (`44082ee0`): tasks open the actual counterpart locale; review-ready counterparts route to review; unavailable Local Care English does not create fake actionable work.
- [x] Compatibility publish-gate recheck (`6d01980a`): approved revisions blocked on runtime baseline alignment can re-read authority without mutation; publish appears only after exact alignment.
- [x] SEO task completion closure (`393f52f7`): exact Care SEO task → Draft → review → human approval → contextual return; completed task leaves refreshed Operations and next priority is visible.
- [x] Snapshot repair maintenance isolation (`f819182a`): legacy non-Local repair exposes only immutable snapshot repair; Care editing, save/upload and downstream SEO are locked until the repair context clears.
- [x] Publish Center exact audit targets (`4fd1e280`): stable Product/Care, Compatibility and Species SEO audit identities deep-link to the exact authority resource instead of only the workspace root.
- [x] One-command Local Species SEO workspace (`832537db`): Local Admin starts Web + API + standalone SEO; localhost links use the configured SEO port and Durable restart E2E verifies that third service.
- [x] Local SEO task return acceptance (`af886726`): standalone SEO returns to root Operations with task context preserved across the dev-port boundary.
- [x] Healthy local SEO server reuse (`7ec556a3`): existing AquaGuide SEO on the configured port is reused safely; unrelated port occupants fail closed.
- [x] Final Local Acceptance (`8438f24e` docs baseline): end-to-end local data/edit/review/publish/navigation/audit regressions + TypeScript + full build PASS with no new operator blocker.
- [x] Read-only feature ↔ main reconciliation audit: latest accepted local baseline measures 275 main-only / 320 local-feature-only commits from merge base `ed0cf380`; only 21 files overlap and seven product/runtime files require manual semantic resolution. See `.ai/RECONCILIATION_AUDIT_20260911.md`.
- [x] Compatibility v3 authority reconciliation design: preserve main v3/domain-rule behavior while integrating feature runtime reviewed authority; Stage Risk is a Profile-owned reviewed child model with dedicated Evidence mapping. Contract: `.ai/COMPATIBILITY_V3_AUTHORITY_RECONCILIATION.md`.
- [ ] Build isolated reconciliation candidate/worktree: resolve low-risk unions and auto-mergeable pages first, then App/Care composition, Compatibility last. No main mutation or push.
- [ ] Supabase Staging remains parked until cloud/multi-operator validation is explicitly resumed.

Updated: 2026-09-10
Canonical continuation: read `.ai/HANDOFF_LATEST.md` first.
Architecture contract: `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`.

## P0 — Product/Care authority convergence
- [x] Inventory every frontend consumer of `fishData.ts` / `careTopicsData.ts` and classify runtime vs build-time use. See `PUBLISHED_CONTENT_AUTHORITY.md`.
- [x] Define one published Product/Care read contract for Species and Care content. See `PUBLISHED_CONTENT_AUTHORITY.md`.
- [x] Decide explicit role of static datasets: seed/audit fixture/offline fallback only — never a competing live authority.
- [x] Implement Draft/save isolation from the last Published Product/Care version using immutable publication snapshots; Production migration remains intentionally unapplied.
- [x] Route Encyclopedia Product Data to the published authority, with static seed only as explicit API fallback.
- [x] Route Care Encyclopedia plus Aquarium/Identify diagnosis Care Knowledge to the published authority, with static seed only as explicit API fallback.
- [x] Prove one Admin Product edit reaches the intended frontend Preview: Save remains private; Publish advances Encyclopedia runtime.
- [x] Prove one Admin Care edit reaches the intended frontend Preview: Save remains private; Publish advances Care runtime.
- [x] Verify Product/Care publish does not mutate `aquarium_app_state_v1` and Product runtime hydration does not mutate Compatibility/static authority inputs.
- [x] Correct Admin publish copy to describe only connected Product/Care consumers and preserve Compatibility authority boundaries.

## P0 — Existing SEO operational acceptance
- [x] Authenticated import corrected batch-01 zh-CN → preflight/Diff → Draft batch.
- [x] Authenticated import corrected batch-01 en → preflight/Diff → Draft batch.
- [x] Batch-scoped submit/approve intended Species + Base rows.
- [x] One explicit bilingual Staging Publish when readiness is fully green.
- [x] Verify 28 hosted EN/ZH pages: metadata, H1, facts, canonical/hreflang, robots, CTA, hygiene.
- [x] Keep Production locked.
## CI operating policy — completed
- [x] Every normal push/PR runs lightweight checks only: contracts, lint/typecheck, builds and diff/generated-data hygiene.
- [x] Golden / Visual / evaluation-history / browser-heavy suites run only on manual dispatch, merge queue, or PR labels `run-heavy-ci` / `merge-ready`.
- [x] Preserve existing required-check workflow/job identities for compatibility with branch rules.

## P1 — Change Impact Preview
- [x] Classify fields as display-only, decision-critical Product Data, Care workflow, Compatibility rule or SEO-only.
- [x] Show affected consumers before release: Encyclopedia, Aquarium, Compatibility, Care and SEO; distinguish direct update vs independent-authority review.
- [x] Add before/after Preview for decision-critical edits.
- [x] Add regression checks for compatibility-result changes caused by Product Data edits.

## P1 — Compatibility Admin
- [x] Operator UI for Species behavior profiles with reviewed-baseline audit plus isolated Draft revision create/edit/submit-review.
- [x] Pair Rule management with reviewed Evidence snapshots, Confidence and Review Status using isolated Draft revision create/edit/submit-review.
- [x] Add server-computed Draft-vs-reviewed structural Impact Check plus explicit human Approve/Reject; approval does not publish.
- [x] Converge reviewed Compatibility publish authority with the runtime read path; exact 7/4 DB authority activates atomically with static reviewed fallback.
- [x] Version Compatibility rules through the final reviewed publish transition using transactional Profile/Pair RPCs.
- [x] Require structural impact + real server engine regression + canonical Evidence resolution before human approval/publish, with freshness invalidation.
- [x] Preserve explicit human review; no opaque AI auto-publish.

## P2 — Operations maturity
- [x] Unified Publish Center / release history & audit V1.
  - [x] Architecture inventory: Product/Care + Compatibility remain Business API/Supabase authorities; SEO remains independent Repo Admin / `admin-store.json` authority.
  - [x] Define one read-only `ReleaseEvent` contract across Product/Care publications, Compatibility revisions/publishes and SEO revisions/activity/import/staging history.
  - [x] Add read-only aggregation services/API without copying or moving any subsystem write authority.
  - [x] Add `/admin/publish-center` timeline/readiness UI with source/auth availability clearly shown.
  - [x] Add read-only release detail/readiness drill-down and explicitly surface Product/Care current-only history coverage.
  - [x] Add per-authority capability matrix for Diff → Impact → Preview → Review → Staging → Production, distinguishing available / partial / locked / not applicable.
  - [x] Add read-only cross-authority coordination context by explicit catalog/pair/batch keys, with authority jump links; do not infer dependency or auto-publish.
  - [x] Close Publish Center V1 as a coordination/read model only; any future cross-domain write orchestration requires a separate product decision.
- [x] Stronger roles/permissions boundary visibility and release audit history V1.
  - [x] Expose current Business `admin` vs SEO `repo-admin` permission boundary without merging auth systems.
  - [x] Add append-only Product/Care publication audit history in code with actor/version/publish/archive events; migration remains unapplied and route falls back to current-only.
  - [x] Decision: defer editor/reviewer/publisher role split until a real multi-operator requirement exists; do not expand RLS surface speculatively.
- [x] Care SEO downstream projection foundation from approved Care Knowledge.
  - [x] Projection reads only the last Published Care snapshot/version; Draft Care never becomes SEO source.
  - [x] SEO-editable projection fields are isolated from protected Care facts/evidence.
  - [x] Deterministic bilingual routes: EN `/care/<catalogKey>.html`, zh-CN `/zh/care/<catalogKey>.html`, `x-default` → EN; SPA fallback stays `noindex,follow`.
  - [x] Fail-closed static Staging artifact builder requires bilingual pairing, equal Care source version, approved editorial and non-Production destination; no explicit snapshot means normal builds skip generation.
- [x] Care SEO Editorial Draft/Review + Staging acceptance.
  - [x] Persist downstream SEO Draft/review state without duplicating Care Knowledge authority.
  - [x] Produce an explicit sanitized Staging snapshot/handoff from approved Care SEO rows.
  - [x] Hosted bilingual acceptance for title/meta/H1/canonical/hreflang/robots/source-version before any index unlock.
  - [x] Prove the no-cost acceptance path with ephemeral local Supabase; paid persistent Staging is optional, not required.
  - [x] Keep Production locked unless separately authorized.
- [x] Care SEO Index / Production release decision.
  - [x] Hosted Staging prerequisite is satisfied.
  - [x] Fail-closed release readiness gate binds the exact Staging snapshot hash to hosted acceptance evidence; Staging builder rejects `index` even if the snapshot is hand-edited.
  - [x] Persist non-secret hosted acceptance evidence without triggering a Vercel runtime deployment.
  - [x] Explicit human decision recorded as `hold_noindex`; exact accepted snapshot/deployment are bound and Production/index remain locked.
- [x] AI-assisted source extraction, conflict detection, impact explanation and Draft generation from approved facts.
  - [x] Published-Care-only source binding with exact source-version rejection and legacy-source refusal.
  - [x] AI output is schema-gated to SEO-only fields with forced `noindex`; protected Care rewrites and auto-save/review/publish are rejected.
  - [x] Admin UI exposes source extraction, conflicts, impact explanation, review warnings and local-only Draft application.
  - [x] Contract + 1280/390 browser acceptance prove AI generation/application creates no Editorial write until explicit Save Draft.

## Previous override — Species SEO Admin usability / acceptance
- [x] Remove duplicated first-screen bulk review / content review / template import controls from the topbar; keep those capabilities in secondary tools.
- [x] Add one queue-driven `当前下一步` primary action: data review → editorial review → Preview-ready → editing fallback.
- [x] Verify 1440px / 390px layout, zero horizontal overflow, CTA queue routing and read-only no-write behavior.
- [x] Add safe `?demo=1` read-only entry only for localhost / `*.pages.dev`; save/review/publish remain disabled.
- [x] Verify exact-SHA + stable-branch Cloudflare `/admin/seo/?demo=1`; use the stable feature URL as the canonical UI acceptance entry.
- [x] Make stateful interaction feedback unmistakable without breaking layout: workflow `attention` is separate from operator `selected`; scope/locale/filter controls use persistent selected styling; normal Species selection uses the existing 16×16 square radio only, while that slot becomes a checkbox only in batch mode. No extra row-level ✓ badge.
- [x] Rebuild information hierarchy around a visible 4-stage workflow: Data Review → Content Edit → Human Review → Staging.
- [x] Separate current-page key actions from detailed editing; collapse batch/history/translation/diagnostic tools under `更多工具`.
- [x] Verify all 4 stages are simultaneously visible at 390px in a 2×2 layout; 1440/390 browser checks have zero page overflow.
- [x] Visually separate `当前物种页面` from `基础模板`: explicit scope context card, different accent/background, and clear copy explaining page-only vs shared-template impact.
- [x] In read-only Demo, suppress false `Schema 未应用` error language; show only `只读演示 · 不会写入`.
- [x] Enforce a strict three-color CMS system: Graphite / White / one Green accent; all semantic states and all six advanced tools are hue-neutral outside the Green interaction accent.
- [x] Establish an explicit typography hierarchy (page → section → action → field label → body → meta) and verify desktop/mobile computed sizes.
- [x] Runtime-scan 1440/390 initial + all advanced-tool states: zero extra saturated hues and zero horizontal overflow.
- [x] Remove the ambiguous `页 / 模` glyph badge; keep scope identity in plain language (`当前物种页面` / `基础模板`).
- [x] Make Preview explicit-on-demand: visible `效果预览` control in the editor bar, Preview hidden by default, overlay drawer on open, zero page overflow.
- [x] Move current-page review status/actions into a top-level Page Review Status Bar directly below Publish Progress; remove the duplicate mobile editor-toolbar review indicator.
- [x] Correct task-first field prompt alignment: page-specific questions are left-aligned directly above guidance/input at 1440/390; legacy global label styling cannot push prompts to the far right. Exact-SHA hosted acceptance preserves Preview split/overlay, review placement and zero overflow.
- [x] Collapse persistent operator chrome after overall-UI feedback: remove the standalone Demo banner, turn the four workflow cards into one linear Progress Navigation, keep Page Review neutral with a slim semantic edge, remove the duplicate editor locale switch/catalog summary, and put sidebar search first. Exact-SHA 1440/390 acceptance preserves Preview/review behavior and zero overflow.
- [ ] User visual/operator acceptance of the new hierarchy on the hosted read-only SEO Admin demo; collect screenshots/feedback.
- [ ] Restore a writable `admin-content` Preview only through a safe server-side credential binding/transfer. Do not expose or manually shuttle `ADMIN_REPO_*` / `ADMIN_GITHUB_*` secrets; current independent project lacks those write credentials.

## Parked — dedicated branch reconciliation (not current user scope)
The isolated reconciliation candidate exists on Draft PR #144. Do not continue/merge it while the user is asking to work on SEO Admin.

## Next — dedicated branch reconciliation (no merge yet)
- [x] Re-read live `main` / feature refs and run an isolated merge-tree/reconciliation audit against the current accepted feature baseline. Completed 2026-09-11; canonical result: `.ai/RECONCILIATION_AUDIT_20260911.md`.
- [ ] Classify overlap/conflicts by authority and preserve all completed Product/Care, Compatibility, Publish Center, Species SEO and Care SEO invariants.
- [ ] Validate a reconciliation candidate before any explicit decision to merge `main`; do not change Production/index as part of reconciliation.

## Stable completed baseline — do not reimplement
- [x] Product/Care Admin route exists at `/admin/product-content`.
- [x] Species SEO Admin authority exists at `/admin/seo/`.
- [x] SEO private Repo Draft/review/revision authority.
- [x] Atomic bulk import + missing Base creation.
- [x] Blank operational CSV template + preflight + field Diff.
- [x] Source-identity fail-closed gate.
- [x] Evidence-based duplicate comparison shared by single/bulk review.
- [x] Durable import batches + server-side review/publish scope checks.
- [x] Bilingual Staging readiness + Canonical dependencies + noindex Preview safety.

- [x] Replace Workspace Focus dual-mode behavior with one permanent compact workflow/status strip; remove `展开流程 / 专注编辑` and all interaction-driven workflow height changes.
- [x] Upgrade the compact strip into dedicated Progress Navigation: current stage / 4, four clickable stage buttons, complete/current/upcoming states, separate operator filter selection, current-action CTA, and a clear visual divider from the editor canvas.
- [x] Initial neutralization checkpoint used a blue accent; superseded by the current Graphite / White / one Green accent system.
- [x] Verify fixed-chrome reduction: 1440/1366 workspace gains 196px vertical space; 390 workspace gains 312px and mobile editor sticky bar drops from ~140px to 46px, with zero horizontal overflow.
- [x] Make `效果预览` a simultaneous resizable editor/Preview split on desktop, with narrow-screen overlay fallback and no inspector-driven auto-close.
- [x] Unify interface + content locale switching; remove visible mixed Draft/Preview/Species/Base/Staging state copy from Chinese core chrome and Chinese leakage from English core chrome.

## 2026-09-06 Admin UX state-system closure
- [x] Remove sticky Current Page Review overlap with the editor; keep review as a separate in-flow control surface.
- [x] Add red/yellow/green semantic health to review, editor sections, fields, readiness and blocker surfaces.
- [x] Add explicit Default / Hover / Active / Selected / Loading / Disabled / Success / Error / Empty component-state contracts.
- [x] Keep Preview split-view compatible and mobile overflow-free.
- [x] Lock the new behavior in `verify-contract.mjs` and pass full Admin/root build regression.

## 2026-09-06 top review placement
- [x] Portal Variant/Base review progress and actions into the top control stack above the Workspace.
- [x] Keep review progress synchronized when switching Current Species Page ↔ Base Template.
- [x] Preserve split Preview, semantic red/yellow/green states, and 0-overflow mobile/desktop layout.

## 2026-09-06 Data Review action hierarchy
- [x] Widen the single Data Review workspace instead of squeezing comparison evidence into the default narrow drawer.
- [x] Put conclusion choices + one primary `确认并保存` action before evidence content.
- [x] Keep the decision command sticky on desktop while long evidence scrolls; keep mobile non-overlapping.
- [x] Demote evidence to a labeled read-only section and notes to an optional collapsed disclosure.
- [x] Add contract coverage for action-first ordering / wide drawer / primary action visibility.

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

## Active override — SEO Operations Health Layer V2 / acceptance
- [x] Evaluate Species Meta Title / Meta Description / H1 from effective Variant + Base inheritance, not raw Variant fields.
- [x] Add Species bilingual completeness and Canonical-to-sibling validation using real same-locale targets.
- [x] Add authenticated batch Care health read using immutable `content_publications` plus per-resource legacy fallback and latest Care SEO Editorial rows; no N+1 page requests.
- [x] Preserve Published Care truth while an editable source row returns to Draft.
- [x] Distinguish Care unpublished source, legacy-not-snapshot authority, source drift, missing bilingual pair, missing Meta/H1 and incomplete review.
- [x] Keep `/admin/seo-pages` read-only and route issues back to existing Species/Care authority editors.
- [x] Add truthful all-page health counts, clickable health filters and row-level issue labels.
- [x] PASS focused contracts, root/API TypeScript, diff hygiene and full root build.
- [x] Browser/operator acceptance: desktop/mobile health counts, priority/unknown filter toggles, operator issue copy, search/progressive inventory behavior, and authority deep-link contracts.
- [ ] User/hosted read-only visual acceptance of the completed Health queue; local Preview is `http://127.0.0.1:3003/admin/seo-pages`.
- [ ] Writable `admin-content` Preview remains a separate security task and must use safe server-side credential binding; do not expose or manually shuttle Repo Admin/GitHub secrets.
- [ ] Branch reconciliation remains parked until explicitly requested.

## Active override — 2026-09-08 18:20 +08:00 — Species SEO CMS UI Foundation
- [x] Add a dedicated late-loaded UI Foundation instead of continuing ad-hoc edits inside the 3389-line legacy stylesheet.
- [x] Normalize primary/secondary/ghost/compact control sizes and typography.
- [x] Normalize workflow, review handoff, locale, scope and Preview controls.
- [x] Reduce editor width/padding/textarea/disclosure density while increasing task-question readability.
- [x] Fix mobile workflow overflow and replace tiny review step labels with progressive disclosure.
- [x] Normalize secondary tool launchers, Bulk upload and Data Review confirm action.
- [x] Add contract guards for UI Foundation loading and critical tokens.
- [x] PASS Admin contract + Admin/root builds + diff hygiene + 1440/390 Preview acceptance.
- [ ] User/operator visual acceptance; repair only observed badcases before any legacy CSS cleanup.

## 2026-09-08 — Species SEO Admin visual hierarchy acceptance
- [x] Establish UI Foundation tokens for readable Button / Typography / Input / spacing hierarchy.
- [x] Remove repeated warning paint from section edge, field edge and input border; keep task-level warning once.
- [x] Remove duplicate Current Page eyebrow and primary-section status chip.
- [x] Make Preview inspector selection Graphite instead of Green.
- [x] Merge Preview readiness + selected-element context into one compact row; preserve exact path as tooltip/contract.
- [x] PASS desktop/mobile 0-overflow acceptance, Admin contract/build, full root build and diff hygiene.
- [ ] Continue operator visual acceptance only for concrete bad cases; do not add another persistent hierarchy layer.
- [ ] Writable Preview credentials and branch reconciliation remain separate parked tasks.

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
## 2026-09-08 21:14 +08:00 — Dirty-state Species navigation safety
- Functional checkpoint: `d0f03ff2abfc3d37abafa6308ca96c071f38235e` (`fix(admin): preserve dirty species navigation`).
- Mobile Species selector auto-collapse now depends on the real `runEditorNavigation()` result. If the operator cancels the unsaved-change confirmation, the selector stays open, the current Species remains unchanged, and dirty edits remain protected.
- `onSelect` / `onSelectBase` now return the navigation result instead of swallowing it; Sidebar closes only when that result is not `false`.
- Contract guards protect this return-value chain so future UI simplification cannot bypass the existing dirty-state boundary.
- PASS: Admin Content contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Fresh remote read before docs sync: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature `ccf2feac122f288fd0de17665bb9ac3b034032ce`, divergence at functional checkpoint **275 main-only / 214 feature-only**.

## 2026-09-08 22:01 +08:00 — Secondary editor hierarchy acceptance
- [x] Merge Search Appearance + Advanced SEO into one stateful `更多 SEO 设置` disclosure.
- [x] Auto-open secondary SEO for real blockers and Preview Meta/H1 targets while preserving manual open state across rerenders.
- [x] Move inherited Base intro reference into the current page helper as `查看模板内容`; remove standalone template-content row.
- [x] Flatten `辅助工具`, localize readiness enum labels, and hide zero-count bulk editorial review entry.
- [x] PASS desktop/mobile zero-overflow acceptance, Admin contract/build, full root build and diff hygiene.
- [ ] Continue operator visual acceptance only for concrete bad cases; no new persistent hierarchy layer.
- [ ] Writable Preview credentials and branch reconciliation remain separate parked tasks.

## 2026-09-08 22:50 +08:00 — Workflow next-action / human-decision convergence
- Functional checkpoint: `818b049a0df75b72ab72621e459d5161deeb70b9` (`fix(admin): clarify workflow next actions`).
- Global 1→4 Publish Flow is now a **next-action navigator**, not a numbered decoration. It shows `当前下一步`, the real queue reason/count, and stage-specific click guidance; detached numeric badges are removed.
- Current demo: `复核 33 个数据问题`; Data Review says `33 项需人工确认 · 继续复核 →`; Content Editing says `458 页待完成 · 查看队列 →`; later stages explain their entry condition when empty.
- New visual semantic rule: **Amber = explicit human judgment / second confirmation only**. Data Review queue/filter, group `处理数据`, selected decision choice and final `确认并保存` share Amber. Graphite remains navigation/selection; Green remains publish advancement/success.
- Preview inspector is now optional `定位字段 / Locate field`, defaults OFF, and changes to `退出定位` only while active. OFF clicks do not move editor selection; ON clicks locate the mapped editor field.
- Browser acceptance: desktop workflow ~72px, mobile ~94px with only the current-stage helper expanded; 1440×900 and 390×844 horizontal overflow = 0. Data Review → group action → decision → confirm chain uses one Amber grammar.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build and `git diff --check`. No Production/main/live-DB/index/Care release change.
- Fresh refs at functional checkpoint: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`; remote feature before push `3894442d3a2a6917e22123ce9542e7392055f543`; merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`; divergence **275 main-only / 218 feature-only**.
- Correct local CMS Preview remains `http://127.0.0.1:3010/?demo=1`.

## 2026-09-08 — Data Review operator acceptance
- [x] Put evidence before the human decision.
- [x] Show category-conflict facts, uncertainty boundary and concise category comparison.
- [x] Make conclusion choices radio selections; keep one final confirmation action.
- [x] Preview the exact result before confirmation, including SEO blocking / Canonical consequences.
- [x] Reduce duplicate candidate Preview/keep controls to text action + radio selection.
- [x] PASS 1440/390 browser acceptance, Admin contract/repo gates, root build and diff hygiene.
- [ ] Continue only with newly observed operator badcases.
## 2026-09-08 23:57 +0800 — Species editor hierarchy acceptance
- [x] Audit current-page editor with AquaGuide UI/UX + Product Manager + UI Designer skill rules.
- [x] Remove competing identity-header task/inheritance summary.
- [x] Make current task objective and remaining work explicit.
- [x] Add truthful per-field task states and dynamic Base-intro guidance.
- [x] Demote Search & Indexing below primary authoring tasks.
- [x] PASS desktop/mobile 0-overflow, Preview field mapping, Admin contract/build, full root build and diff hygiene.
- [ ] Continue operator acceptance only for observed badcases.

## 2026-09-09 00:57 +0800 — Current task notification acceptance
- [x] Promote the current highest-priority task into a top-level notification directly below the Topbar.
- [x] Show the problem, reason and one real action; use restrained semantic emphasis (human decision Amber / blocker red / ready Green).
- [x] Remove duplicate `当前下一步` from the 1→4 workflow; keep 1→4 as stage navigation only.
- [x] PASS 1440/390 browser acceptance, queue-action routing, Admin contract/build, full root build and diff hygiene.
- [ ] NEXT: move task-critical Publish Readiness / task queue access out of the low-frequency utility disclosure; keep only truly optional tools folded.


## Active override — 2026-09-09 01:32 +0800 — Aqua Operations Studio
- [x] Replace the old AdminHub launcher-card wall with a task-first Operations Home at `/admin/content`.
- [x] Add a read-only Unified WorkItem model across Product/Care current Drafts, Compatibility current revisions and SEO Health.
- [x] Keep ReleaseEvent history secondary; never infer current tasks from historical release events.
- [x] Expose authority availability as `ready / partial / auth_required / unavailable`; unreadable state never becomes fake zero work.
- [x] Prioritize `blocker → human decision → attention`; do not label approved Compatibility as publish-ready before real publish gates pass.
- [x] Keep WorkItem actions as deep-links only; add no new database, mutation endpoint or centralized write authority.
- [x] Add `test:operations-work-items` to lightweight Admin CI; preserve existing Product/Care, Compatibility, Publish Center and SEO contracts.
- [x] PASS 1440/390 Operations Home browser acceptance with zero horizontal overflow and truthful unavailable-source behavior.
- [x] Phase 2: generate resource/reason-specific WorkItems with exact deep-links into Product/Care, Compatibility and Species/Care SEO authority targets.
- [x] Phase 3: surface task-critical readiness at the WorkItem boundary as current gate + exact next step + authority verification; hard blockers must outrank softer issues.
- [ ] NEXT: authenticated operator acceptance with populated real WorkItems and exact click-through. Use only an existing secure Business/Repo Admin session; do not expose or manually shuttle credentials.
- [ ] Writable hosted credentials remain a separate security task; branch reconciliation / PR #144, Production, live DB and indexing remain parked.

## Active continuation — 2026-09-09 02:55 +0800
- [x] Add durable populated-state browser regression for Operations Home exact WorkItem routing using isolated fake auth/read fixtures only.
- [x] Prove desktop/mobile `Operations → exact Compatibility revision` and `Operations → exact Product Draft`, with zero overflow/page errors/API 5xx.
- [x] Run this regression only in Heavy browser CI; keep lightweight CI focused on contracts/typechecks.
- [ ] NEXT: real authenticated Business/Repo Admin operator acceptance with populated current WorkItems. Reuse only an existing secure browser session; never extract or manually shuttle cookies/tokens.
- [ ] Writable hosted credentials remain separate. Reconciliation / PR #144, main, Production, live DB and indexing remain parked.

## Active continuation — 2026-09-09 09:13 +0800
- [x] Distinguish Business Admin 401 `AUTH_REQUIRED` from real source/service unavailability in Operations authority status.
- [x] Distinguish signed-in 403 `FORBIDDEN` as `权限不足`, not `暂不可用`.
- [x] Preserve `partial` when one sub-source is readable and never infer fake zero/healthy state from unreadable sources.
- [x] Add Heavy browser proof for no-session and forbidden states while preserving desktop/mobile exact WorkItem routing regression.
- [x] PASS Operations/Product-Care/Compatibility/SEO Registry/Publish Center contracts, root/API TypeScript, full root build and diff hygiene.
- [ ] NEXT: real authenticated Business/Repo Admin operator acceptance with populated current WorkItems, using only an existing secure browser session.
- [ ] Writable hosted credentials, reconciliation / PR #144, main, Production, live DB and indexing remain parked.

## Active continuation — 2026-09-09 10:45 +0800
- [x] Do not show `0 个真实任务` while any authority source is unreadable/partial; show known/readable task count with incomplete-source qualification.
- [x] When no readable WorkItem exists but sources are incomplete, promote source recovery to the top operator task with one direct `查看数据来源` action.
- [x] When a WorkItem exists under incomplete source coverage, scope the claim to `当前已读取优先任务`; do not claim global priority from partial evidence.
- [x] Preserve Amber for human judgment only; source recovery stays Graphite/Slate.
- [x] PASS desktop/mobile browser regression, mobile source-scroll behavior, focused contracts, root/API TypeScript, full build and diff hygiene.
- [ ] NEXT: real authenticated Business/Repo Admin operator acceptance with populated current WorkItems using only an existing secure browser session.
- [ ] Writable hosted credentials, reconciliation / PR #144, main, Production, live DB and indexing remain parked.

## 2026-09-09 13:19 +0800 — Operations authority schema-readiness checkpoint
- Functional checkpoint: `5d4408347b4ae5ec2f345c52e97ea8ad04c931db` (`fix(admin): expose authority schema readiness`).
- Read-only live AquaGuide Supabase inventory confirms the current project has migrations only through `20260816160129_atomic_verified_livestock_relocation`; Admin Product/Care publication + Compatibility revision migrations from 2026-09-04/05 are not applied there. The checked `species`, `care_articles`, reviewed compatibility profile and pair-rule tables currently contain 0 rows. No database write or migration was performed.
- Publish Center now distinguishes `schema_not_ready` from authentication, permission and runtime failure. Missing `content_publications` / Compatibility revision tables no longer collapse the entire Business release feed into generic 503. Product/Care and Compatibility are fail-isolated.
- Operations Home consumes Publish Center environment readiness. A readable legacy/current list can no longer make an undeployed release authority look ready; `schema_not_ready` displays `尚未启用` and suppresses misleading Product/Care Draft or Compatibility revision WorkItems.
- Heavy browser regression now proves the schema-not-ready state in both Operations Home and Publish Center, while preserving 401/403 truthfulness and desktop/mobile exact WorkItem deep-links.
- PASS: Operations WorkItem, Publish Center, Product/Care, Compatibility and SEO Registry contracts; root/API TypeScript; full root build; browser regression; `git diff --check`.
- Safety boundary unchanged: do NOT apply these parked Admin migrations to Production merely to finish acceptance. main / Production / live DB / indexing remain untouched.
- NEXT: identify or provision a non-Production Business Admin Staging/Preview data environment with the required Admin schema and representative Product/Care/Compatibility data, bind a secure authorized session server-side, then run real populated operator acceptance. Real authenticated acceptance is not completable against the current empty/unmigrated live Business source.

## 2026-09-09 13:31 +0800 — Business Admin non-Production staging preflight
- Functional checkpoint: `0dc9c9815c35d46034f690fd0bf1cfe6fdc66f39` (`test(admin): add staging readiness preflight`).
- Added `npm run check:business-admin-staging`, a read-only preflight for a future non-Production Business Admin Supabase environment. It reuses the existing server-only Supabase key validation and Production project-ref deny-list before any query is allowed.
- Acceptance now requires both schema readiness and representative data. Required schema covers admin role/idempotency, Product/Care core + immutable publication history, Compatibility reviewed baseline + versioned revision authority + Evidence, and Care SEO editorial persistence.
- Representative data gate requires at least one admin role, Species row, Care row, reviewed Compatibility Profile, reviewed Pair Rule and reviewed Evidence source. An empty database cannot pass real operator acceptance merely because tables exist.
- CI runs only the credential-free preflight contract; it also launches the real checker with a synthetic Production identity and asserts hard refusal before network access. Real staging credentials are never stored in CI or browser code.
- Existing `apps/admin-content/staging-publish.env.example` now documents the preflight command. No project was created, no migration/seed was applied, and no live data was changed.
- Fresh refs before docs sync: remote feature `4ab9d9293e1194837667cbb1fce74bb75f0b8653`; live main `d3c70dee633ed4e24bbca161d138a832012b1d40`; functional HEAD is ahead 1 / behind 0 vs feature and divergence vs main is **275 main-only / 242 feature-only**.
- NEXT: provision or identify a dedicated non-Production AquaGuide Business Admin Supabase project, apply the parked Admin migrations there only, load representative acceptance data + an authorized admin identity, run `check:business-admin-staging` until green, then bind the Business API/Preview to that environment and execute real populated operator acceptance. Production remains explicitly excluded.

## 2026-09-09 13:48 +0800 — Empty-safe Business Admin staging migration plan
- Functional checkpoint: `10becf15d9d7e2568c273c2402d14ce91e0eda21` (`fix(admin): make staging migrations empty-safe`).
- Static dependency audit found a real provisioning blocker in `202609050001_compatibility_reviewed_baseline_reconciliation.sql`: its reviewed baseline drift assertions required 11 canonical Published Species and would fail against a fresh/empty non-Production database before operator acceptance could even start.
- Reconciliation is now fail-closed in three states: 0/11 canonical Species present -> skip only the data-dependent baseline seed/assertions; 11/11 present and Published -> run the existing canonical reconciliation; any partial or unpublished combination -> abort the migration. Evidence canonicalization still runs in every state.
- All 7 reviewed Profile and 4 reviewed Pair Rule drift assertions are contract-protected to honor only the explicit empty-baseline skip gate; partial baseline drift is never auto-accepted.
- Business Admin preflight now exposes the canonical 8-migration Admin plan, and CI verifies every migration exists chronologically plus the required pre-Admin prerequisites (`species`, `care_articles`, Evidence/reviewed Compatibility tables, `user_roles`, `idempotency_records`, `is_admin()`, `set_updated_at_and_version()`).
- PASS: Business Admin staging preflight contract, Compatibility Admin contract, Operations WorkItem contract, Publish Center contract, root/API TypeScript, full root build, and `git diff --check`.
- Environment discovery: Supabase currently has only `AquaGuide` live and unrelated `ice-glide-staging-sg`; AquaGuide has no development branches. No cloud branch/project was created. Local Supabase CLI exists, but Docker daemon is currently unresponsive and no standalone local PostgreSQL is installed, so a real isolated migration execution was not forced.
- Fresh refs before docs sync: remote feature `7b67d1ebdef88c5d6a693c6f098b45040869b088`; live main `d3c70dee633ed4e24bbca161d138a832012b1d40`; functional HEAD is ahead 1 / behind 0 vs feature and divergence vs main is **275 main-only / 244 feature-only**.
- Safety unchanged: no Production migration, live DB write, cloud branch creation, main merge/rebase, or indexing change. NEXT: when Docker is healthy, run the full migration plan against an isolated local Supabase first; otherwise create a dedicated non-Production Supabase branch/project only after explicit organization/cost confirmation, then run `check:business-admin-staging` and real populated operator acceptance.

## 2026-09-09 13:54 +0800 — Corrected full Staging upgrade plan
- Functional checkpoint: `ef201b58702e390ed5e8a915f2fbd09c4075ed7f` (`fix(admin): harden staging upgrade plan`).
- Correction to the prior 8-migration wording: those 8 files are only the Business Admin authority subset. The real AquaGuide live database is at migration baseline `20260816160129`, so a branch cloned from live must apply **all 16 repo migrations after that baseline**: 8 Species SEO prerequisite migrations (`202608280001` through `20260901064408`) followed by the 8 Business Admin authority migrations (`202609040001` through `202609050004`).
- `check:business-admin-staging` now reports `upgrade_from_migration`, the complete `expected_upgrade_migrations`, and the Business Admin authority subset separately. CI asserts that every repo migration after the live baseline is included, so a prerequisite cannot be silently skipped.
- Static audit confirms the Species SEO prerequisite migrations are schema/function/trigger changes without empty-Species data assertions. The only data-dependent provisioning blocker found was `202609050001_compatibility_reviewed_baseline_reconciliation.sql`.
- That migration now distinguishes true empty baseline from partial data: existing canonical Species count 0 -> skip only Compatibility baseline data reconciliation; all 11 exist and are Published -> run canonical reconciliation; any other combination -> fail closed. Evidence source canonicalization always runs.
- The 11 Profile/Pair drift checks use explicit `IF NOT skip THEN ... END IF` guards; no anonymous-block early return is required.
- Local environment check: Docker socket itself times out, no standalone PostgreSQL is installed, so no local Supabase migration execution was forced. AquaGuide has no existing Supabase development branch.
- PASS: staging preflight contract, Compatibility Admin contract, Operations/Publish Center contracts, root/API TypeScript, prior full root build, and diff hygiene.
- Fresh refs before docs sync: remote feature `4fda478e4d5dc24583a13458b74627de315fb49c`; live main `d3c70dee633ed4e24bbca161d138a832012b1d40`; functional HEAD ahead 1 / behind 0 vs feature; divergence vs main **275 main-only / 246 feature-only**.
- Safety unchanged: no Production migration/write, no Supabase project/branch creation, no main merge/rebase, no indexing change. NEXT: execute the 16-migration plan first on isolated local Supabase once Docker is healthy, or create a dedicated non-Production branch/project only after explicit organization/cost confirmation; then load representative acceptance data, run `check:business-admin-staging`, bind Business API/Preview, and perform real populated operator acceptance.
## 2026-09-09 15:44 +0800 — Safe representative Staging seed
- Functional checkpoint: `646fe047723b1f83e7068f52228e63ab4682b139` (`feat(admin): add safe staging representative seed`).
- Added `npm run seed:business-admin-staging`. Default mode is dry-run; `--commit` is refused unless the target passes the existing non-Production project-ref deny-list and `check:business-admin-staging` reports `schema_ready=true`.
- Species/Care seed reuses the canonical repo catalog: 486 Species + 41 Care as Published metadata only; asset uploads are intentionally skipped.
- Compatibility seed reuses `getCompatibilityEvidenceAudit()` rather than duplicating rules: 13 reviewed Evidence sources, 7 reviewed Profiles and 4 reviewed Pair Rules. Existing drift or extra evidence links fail closed instead of being overwritten.
- Staging readiness now checks seed-critical tables plus key columns (`content_publications.snapshot/source_version`, `evidence_sources.source_key`, Compatibility `impact_report/evidence_resolution/regression_report`) so a partially applied migration set cannot masquerade as ready.
- Seed safety contract protects default dry-run, explicit commit, Production refusal on both wrapper and Compatibility sub-seed, metadata-only import, and the 13/7/4 canonical Compatibility counts. CI paths now include staging seed/preflight scripts.
- PASS: staging seed/preflight contracts, Compatibility/Operations/Publish Center contracts, root/API TypeScript, Admin build, full root build, and `git diff --check`.
- Safety unchanged: no Supabase project/branch created, no live DB write, no Production migration, no main merge/rebase, no indexing change.
- Fresh refs before docs sync: remote feature `a5adbab9bf1f12bdd5f627b151b5f00469668da8`; live main `d3c70dee633ed4e24bbca161d138a832012b1d40`; functional HEAD ahead 1 / behind 0 vs feature; divergence vs main **275 main-only / 248 feature-only**.
- NEXT: provision a dedicated non-Production AquaGuide Supabase plus a real authorized Admin identity; run the 16-migration upgrade plan, then `seed:business-admin-staging -- --commit`, `check:business-admin-staging`, bind Business API/Preview, and execute real populated operator acceptance. Admin identity provisioning must remain explicit and non-Production-only.
## 2026-09-09 15:51 +0800 — Safe non-Production Admin identity provisioning
- Functional checkpoint: `394088571792ca041b16a48857d6280f0b9fcba5` (`feat(admin): add safe staging admin provisioning`).
- Existing AquaGuide login already uses Supabase `signInWithPassword`; no second Admin auth system or new login page was introduced.
- Added `npm run provision:business-admin-staging`. It only promotes an already-existing Staging Supabase Auth user from `user` to `admin`; it never creates users, passwords, invites or Production identities.
- Provisioning is fail-closed: requires non-Production project validation, exact `STAGING_ADMIN_USER_ID` + expected email match against Supabase Auth, an existing non-deleted `user_roles` row created by the canonical auth trigger, and an explicit `--commit`. Existing admin is idempotent no-op; deleted/missing role rows are not auto-repaired.
- The real CLI entrypoint has a credential-free Production-refusal contract, so it must abort before any Auth lookup when Staging ref equals Production. CI runs only this safety contract; it never promotes a real account.
- `user_roles` already has the canonical `set_updated_at_and_version()` trigger, so role promotion preserves audit/version semantics without manual version writes.
- PASS: staging identity/seed/preflight contracts, Admin content contract, Operations/Publish Center contracts, API TypeScript, Admin build, full root build, and `git diff --check`.
- Fresh refs before docs sync: remote feature `09c66bb57a6a8c1bfca3b91cdb7014be49d5d9a7`; live main `d3c70dee633ed4e24bbca161d138a832012b1d40`; functional HEAD ahead 1 / behind 0 vs feature; divergence vs main **275 main-only / 250 feature-only**.
- Safety unchanged: no Staging cloud project created, no live DB write, no Production migration/account change, no main merge/rebase, no indexing change.
- NEXT: obtain/provision a dedicated non-Production AquaGuide Supabase project, apply the 16-migration upgrade plan, seed canonical representative data, create/sign in one ordinary Staging Auth user through the Staging Auth flow, dry-run then commit `provision:business-admin-staging`, require `check:business-admin-staging` green, bind Business API/Preview, and run real populated operator acceptance.

- [x] Species SEO ownership clarity (`466025f7`): `本页自定义`, dynamic Base/current-page tool labels, one-scope revision history, final-page readiness wording.
- [ ] Continue authoring-surface visual hierarchy cleanup: card/section/color density, while preserving required controls and the centralized review boundary.

- [x] Visible SEO control density (`6a1f1979`): inherited Meta/H1 compact source rows, two-column desktop keyword/index policy, flat route summary, no repeated Production-lock note.
- [ ] Converge authoring typography hierarchy: reduce redundant near-equal font sizes without shrinking required controls or metadata below readable levels.
