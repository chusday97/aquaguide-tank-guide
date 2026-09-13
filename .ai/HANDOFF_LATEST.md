# AquaGuide Admin / Operations Studio — HANDOFF LATEST

## 2026-09-13 corrupt backup candidate filtering closure
- Functional main: `091b3601 fix(admin): hide corrupt backup candidates`.
- Reproduced: manifest-valid backup with a missing copied asset blob was still returned by `GET /backups`; direct restore rejected it with 409.
- Fixed: backup listing now runs `inspectRoot()` per candidate and only exposes healthy/restorable backups. Corrupt backup directories stay on disk for manual inspection.
- Regression: corrupted candidate hidden from list; direct restore still 409.
- Gates PASS: Local File API/UI, Local Admin mode, Operations Studio populated UI, API/root TypeScript, full build, GitHub Product Golden Path; Vercel branch READY. Production unchanged.


## 2026-09-13 interrupted restore integrity closed
- New main checkpoint: `73276ee8 fix(admin): validate interrupted restore recovery`.
- Fresh-process recovery no longer trusts a backup manifest alone. It validates the safety backup before applying it and validates the recovered active root before deleting `.restore-transaction.json`.
- Corrupt safety backup regression: startup is 500 fail-closed, journal remains available for inspection/retry, and the active root is not overwritten. Valid interrupted-restore recovery remains PASS.
- GitHub Product Golden Path PASS; Vercel `dpl_9ctCqTd71u3rTWfa2tHVeMHcpPaa` READY. Production unchanged.

## 2026-09-13 held root lease displacement closed
- New main checkpoint: `988f6e4c fix(admin): revalidate held root leases`.
- A running Local Admin no longer trusts an in-memory root lease after the on-disk owner file is removed/replaced. Each request verifies the disk PID + token; missing lease triggers atomic reacquisition, while a replacement live owner forces the displaced process to 409.
- Fail-before-fix was dual 200 owners after deleting the lease file. Regression now requires replacement owner 200 + displaced owner 409 + safe reacquire after replacement exits.
- 20-cycle stress PASS; GitHub Product Golden Path PASS; Vercel `dpl_79GvoJ2iAM2F2yaf9MFDuGToJ3LF` READY. Production unchanged.

## 2026-09-13 fail-closed startup guidance closed
- New main checkpoint: `5845c79b fix(admin): tailor fail-closed startup guidance`.
- The Local Admin startup screen no longer gives the same root-owner instruction for unrelated fail-closed causes. Guidance is now mapped by API error/code.
- Browser-proven recovery paths: owner conflict -> close old owner; invalid `.aqua-admin-owner.json` -> verify no active owner and inspect exact file; invalid `.restore-transaction.json` -> stop writes and inspect exact journal/safety backup; newer Local File schema -> do not overwrite/downgrade, use newer compatible code.
- API error details expose local recovery file paths where needed. Local File remains fail-closed with no browser-only fallback.
- Local File API/UI + mode contract + TypeScript + build PASS; Product Golden Path PASS; Vercel `dpl_3qMeuV5hXC1GB6ocsqk2db2udiUc` READY. Production unchanged.

## 2026-09-13 Local owner conflict operator guidance closed
- New main checkpoint: `ac5959e6 fix(admin): preserve local owner conflict guidance`.
- Startup hydration no longer collapses root-ownership `VERSION_CONFLICT` into a generic Local File unavailable message; the original API reason is retained.
- `main.tsx` fail-closed startup screen now also says to close the old Local Admin process when it owns the same Local File root.
- Real browser verification with two API processes sharing one root confirms both messages render. Operations Home safety actions already preserve error messages and were left unchanged.
- GitHub Product Golden Path PASS; Vercel `dpl_9fDzEiUYioVy2GKG2wPWYEHKhuQf` READY. Production unchanged.

## 2026-09-13 interrupted restore recovery closed
- New main checkpoint: `bac95f66 fix(admin): recover interrupted restores`.
- Restore writes `.restore-transaction.json` before mutating authority. If the process dies mid-restore, the next Local Admin process acquires the root lease, rolls back from the recorded safety backup, removes `.restore-assets-*` residue, deletes the journal, and only then serves requests.
- Regression builds a mixed root and proves a fresh process returns the safety Business/Care state with no journal or restore-temp residue.
- GitHub Product Golden Path PASS; Vercel `dpl_J9RLH19ncFUciVuMSFyQdUL9snpR` READY.
- Production unchanged.

## 2026-09-13 — reused PID no longer permanently false-locks Local File root
- Functional checkpoint: `8105f032 fix(admin): disambiguate reused lease pids`.
- Fail-before-fix used a real unrelated live process PID in a stale ownership record; Local Admin incorrectly returned `409 VERSION_CONFLICT` because PID liveness alone was treated as owner identity.
- Lease v2 now records process-start identity. Linux compares `/proc/<pid>/stat` start ticks; macOS compares `ps` start time + stable command identity.
- A reused PID with a different start identity is reclaimed; a true live owner remains rejected; missing/unreadable identity remains fail-closed.
- Permanent regression covers stale dead PID, true second process, and reused live PID. Local File API/UI, contracts, TypeScript and full build PASS. GitHub Product Golden Path PASS; Vercel branch deployment READY.
- No Production promotion, Supabase Staging, Production DB migration or indexing change.


## 2026-09-13 — Cross-process Local File ownership closed
- Functional checkpoint: `32a5bb6c fix(admin): enforce single local authority owner`.
- Fail-before-fix used two real API processes on one root; same-asset concurrent writes produced a torn PNG-metadata/WebP-blob pair at round 37.
- Root ownership now uses an atomic hard-link lease with PID + token. A live second owner gets `409 VERSION_CONFLICT`; dead-PID stale leases are reclaimed safely.
- Regression covers stale lease recovery and real second-process rejection. 8-process stress: exactly one owner, seven conflicts, zero lease/candidate residue after shutdown.
- Local File API/UI, contracts, TypeScript, full build, GitHub Product Golden Path PASS; Vercel branch deployment READY.
- Operational invariant: do not run two Local Admin API processes against the same Durable Local File root.
- No Production promotion, Supabase Staging, Production DB migration or indexing change.


## 2026-09-13 — Restore visibility is externally atomic
- `deb5b085 fix(admin): hide in-flight restore states` closes a reproduced read-visibility race: Business B became visible before assets B, causing B's referenced image to return 404 during a restore that later succeeded.
- Local authority coordination is now a fair reader/writer lock. Mutations/restore are exclusive; state/asset/status/integrity reads and snapshot-style operations share read access.
- Formal two-authority restore regression PASS. Fairness probe with 8 continuous readers: restore 200 in 19ms, 36 reads, 0 errors, no timeout/starvation.
- Local API/UI, mode contract, TypeScript and full build PASS; GitHub Product Golden Path PASS; Vercel deployment `dpl_9BqvXujSc6Ey7hWWLT8VvAWewU7s` READY / target null. Production/Supabase/indexing unchanged.


## 2026-09-13 — Cross-operation Local File consistency closure
- `01fdca74`: Local authority mutation/snapshot operations now serialize; reproduced backup×asset race had returned 500 from disappearing atomic temp files. 30/30 backup×asset and 30/30 runtime-snapshot×Published-asset stress runs completed with zero torn output.
- `0df8a63d`: same asset GET/PUT/DELETE now share a pair queue; fail-before-fix GET mixed PNG metadata with WebP body. 1600 concurrent reads produced zero torn responses after the fix.
- `f83c08fd`: integrity reads now enter the authority transaction; fail-before-fix produced a false `ASSET_SIZE_MISMATCH` during save. 900 stress checks produced zero false errors.
- Restore×asset GET probe (70 assets, 20 restores, 4400 reads) found zero blocker, so restore behavior was intentionally not broadened.
- All three functional checkpoints: Local File API/UI + mode contract + TypeScript + full build PASS; GitHub Product Golden Path PASS; Vercel branch deployments READY. No Production promotion, Supabase Staging, live DB or indexing change.


## 2026-09-13 — Local File concurrency hardening closed
- Runtime export collision reproduced at 100-way concurrency: 35 success / 65 failure. Fixed with UUID-isolated atomic/staging temp paths (`275587ea`).
- Backup ID race reproduced: 32 success responses collapsed into 16 real backups. Fixed with atomic directory reservation (`6cd1d5d8`).
- Same-asset concurrent PUT race reproduced: both requests returned 201 but blob/metadata could come from different requests. Fixed by serializing same-ID PUT/DELETE mutations (`25ea430b`).
- Stress evidence: runtime export 100/100 success with zero temp residue; backup 100/100 unique IDs/directories; asset overwrite 80 rounds with zero torn pairs.
- Local File API/UI, contracts, TypeScript, full build, GitHub Product Golden Path and Vercel branch deployments all PASS/READY for the functional checkpoints.
- No Production promotion, Supabase Staging, Production DB migration or indexing change.

## 2026-09-13 — Local asset pair write/delete transaction closure
- Canonical worktree: `/Users/chuchu/aquaguide-main`, branch `main`.
- `f2087f26` closes failed asset PUT corruption: when blob write succeeds but metadata replacement fails, previous blob is restored (or new blob removed) before the error escapes.
- `9a6855da` closes failed asset DELETE corruption: blob deletion is now sequenced before metadata deletion, with blob restoration if metadata unlink fails.
- Fail-before-fix was reproduced on real macOS filesystem flags; permanent regressions are cross-platform and do not require OS-specific flags.
- PASS locally: Local File API/UI, Local Admin mode contract, API/root TypeScript, full build. GitHub Product Golden Path PASS and Vercel branch deployment READY for both commits.
- Restore rollback was inspected again; no stable product-grade failure was reproducible without artificial hooks, so it remains unchanged.
- Production deployment/alias, Supabase Staging, live DB and indexing were not changed.


## CURRENT OVERRIDE — failed Local File backups no longer leave hidden partial directories (2026-09-12)
- Functional checkpoint: `0c8cd464 fix(admin): clean failed backup snapshots`.
- Reproduced before fix: chmod a valid asset blob unreadable after integrity passed; POST backup returned `500 INTERNAL_ERROR` and left a new manifest-less `backup-*` directory that listBackups intentionally hid.
- Fix wraps backup copy + manifest write so any failure recursively removes that newly-created destination before rethrowing.
- Behavioral regression now requires backup directory contents to remain byte-for-byte/list-equivalent after forced mid-copy failure.
- Local File API/UI, Local Admin contract, TypeScript, full build, GitHub CI and Vercel branch deployment all PASS. Production was not promoted because this router remains DEV-only.


## CURRENT OVERRIDE — canonical main no longer depends on historical worktree dependencies (2026-09-12)
- Canonical worktree remains `/Users/chuchu/aquaguide-main` on `main`.
- Found a real continuation hazard: its `node_modules` was a symlink into historical `/Users/chuchu/aquaguide-admin-content-v0/node_modules`. The symlink was removed and canonical main received its own `npm ci` install from the repository lockfile.
- Canonical-only validation PASS: `test:local-file-admin`, `test:local-admin-mode-contract`, `test:operations-work-items`, `check:api`, root TypeScript, full build, and direct `dev:local-admin` HTTP smoke.
- Checked all known Aqua worktrees plus root override references: no persistent `.local/aqua-admin` authority exists and no non-test `ADMIN_LOCAL_FILE_ROOT` override exists, so moving the canonical worktree did not strand Local File data.
- Do not recreate dependency symlinks from canonical main into feature/reconcile/product-recovery worktrees.


## CURRENT OVERRIDE — canonical main recovery path hardened (2026-09-12)
- Reproduced a real cross-session authority failure: `.ai/CROSS_SESSION_START.md` still routed new sessions to `/Users/chuchu/aquaguide-admin-content-v0` / `feature/admin-content-v0`; this session initially entered an old reconciliation worktree before the mismatch was detected.
- Canonical `main` worktree is now durable at `/Users/chuchu/aquaguide-main` (moved from `/private/tmp/aqua-main-promoted-20260912` without changing HEAD/history/content).
- New recovery protocol requires exact canonical path, `branch=main`, status review, and live `HEAD` vs `git ls-remote origin refs/heads/main` comparison before edits.
- Historical feature/reconcile/product-recovery/preview worktrees remain intact but are no longer valid default continuation paths.
- No product runtime, Production deployment, Supabase or indexing state changed in this recovery-path repair.


## CURRENT OVERRIDE — Local File temp cleanup reliability fix (2026-09-12)
- Main functional checkpoint: `0b662155 fix(admin): clean failed atomic temp writes`.
- Failure injection proved generic atomic Local File writes could leave `.tmp-*` files when final rename failed. Previous authority stayed intact, but the workspace could become dirty.
- JSON and binary atomic helpers now always clean their temp path in `finally`; manifest failure regression explicitly asserts no `runtime-authority.json.tmp-*` remains.
- PASS: Local File API + mode contract, Git runtime authority, durable Local Admin browser restart/backup/restore, API/root TypeScript, full build. Product Golden Path PASS.
- Vercel branch deployment `dpl_BAmT1TrjkUTE8Wz3Vvk1WUcU8kzB` is READY. The fix is DEV-only and not part of Production `/api/v1/router`, so current Production remains `dpl_2n2CfsVatP4rzzE49Ttd9H752fR8` by design.
- NEXT: fix only newly reproduced badcases; no speculative UI/authority expansion.


## CURRENT OVERRIDE — remote release closed with Vercel Business API bundle (2026-09-12)
- GitHub `main` runtime checkpoint is `5fa915d31ebb6aa0915cc39b34016a1ffa933a66` (`fix(api): bundle vercel business runtime`); Product Golden Path `34667970125` completed successfully.
- Remote rollback branch remains `rollback/main-pre-aqua-admin-20260912 -> d3c70dee633e`.
- First release attempt exposed a real Vercel trace bug: DEV-only Local Admin pulled `public/` into `/api/v1/router`, producing 266.91 MB > 250 MB. `86fc0525` removed Local Admin from the production router and reduced the function to ~43 MB.
- The next attempt exposed Node 24 ESM resolution failure across the raw API source graph. Production was immediately rolled back to stable `dpl_9b9QBEpKCskSZLefuLTJm5cZxWH5` / `ed0cf380` while the fix was developed.
- Final fix `5fa915d3` bundles only the Business API local import graph with esbuild and keeps npm packages external. Cloud build generated `api/v1/business-app.bundle.mjs` at 1.49 MB; final `/api/v1/router` package is 41.08 MB. Bundle has no relative imports and no Local Admin references.
- Verified branch deployment `dpl_2uvAopBMqKfnr5xJdvn68dfNNZfa` before promotion: Business Health 200, Local Admin 404, Git runtime authority readable.
- Verified production deployment `dpl_2n2CfsVatP4rzzE49Ttd9H752fR8` before public alias switch: Business Health 200 with Production DB configured, Local Admin 404, root healthy. Public alias `aqua-tank-guide.vercel.app` was then explicitly reassigned to this exact deployment without another code change.
- Public Production smoke PASS: `/` 200; `/api/v1/business-health` 200; `/api/v1/content-bootstrap` 200; `/api/v1/local-admin/status` 404; `/runtime-authority.json` 200 with Compatibility 7/4; `/admin/seo/` 200 and noindex. Public Playwright fallback also found static `极火虾` and `新鱼入缸` with zero page errors while Product/Care cloud publications are 0/0.
- Vercel runtime error query after closeout returned no error clusters.
- No Supabase Staging/Production migration or indexing unlock occurred. Do not reintroduce Supabase Staging as a prerequisite for the accepted Durable Local File + Git operating path.
- NEXT: release is closed. Continue only from a concrete operator/runtime badcase or an explicitly authorized separate Staging/indexing decision.

## HISTORICAL OVERRIDE — local main promotion PASS; remote push still gated (2026-09-12, superseded)
- Local `main` was created from `origin/main=d3c70dee633e` and fast-forwarded to accepted candidate `83f8fd7a`; no merge commit or conflict was introduced.
- Rollback ref preserved before promotion: `rollback/main-pre-aqua-admin-20260912 -> d3c70dee633e`.
- Post-promotion main smoke PASS: Git runtime Product/Care fallback, Published Content isolation, Compatibility runtime authority, Local Admin DEV-only contract, Compatibility authority scan, root TypeScript and API TypeScript.
- The temporary `node_modules` validation symlink was removed; local main worktree is clean.
- `origin/main` is still `d3c70dee633e`: nothing has been pushed and no deployment was triggered. Supabase Staging/Production/indexing remain untouched.
- NEXT: treat `main push` as an explicit release action. Refresh origin and re-run ancestry/smoke checks immediately before any push.


## HISTORICAL OVERRIDE — candidate is main-ready after promotion rehearsal (2026-09-12, fulfilled)
- Functional checkpoint `72ad2693 fix(runtime): preserve published api under empty git snapshot`; promotion-readiness record: `.ai/MAIN_PROMOTION_READINESS_20260912.md`.
- P0 closed: the committed Git snapshot has Compatibility 7/4 but Product/Care 0/0; empty Product/Care no longer suppresses `/content-bootstrap`. Non-empty Git Product/Care still wins, while Compatibility can independently remain `reviewed-git`.
- Current Published Content browser contract was repaired to the real Encyclopedia search and Care `传统浏览 / Browse guides` flow; zh-CN + EN PASS.
- Disposable `origin/main → candidate` `git merge --ff-only` rehearsal PASS with exact tree equality; rehearsal worktree/branch were removed. Real main remains `d3c70dee633e`, unchanged.
- Authority gates, TypeScript, full build and diff hygiene PASS. Candidate is READY for an explicit main fast-forward, but no main move/push/deploy occurred.
- NEXT: preserve `d3c70dee633e` as rollback anchor before any explicit promotion; treat main push/deployment as a separate action.

## CURRENT OVERRIDE — atomic Local File → Git runtime publication closed (2026-09-12)
- Active candidate: `reconcile/admin-content-main-20260911`; functional checkpoints `e7b445c1 fix(admin): make git runtime snapshot atomic` and `65af7dd2 fix(admin): clarify git snapshot publish boundary`, built on `d93ae6b feat(admin): publish local authority through git snapshot`.
- Local Operations can generate one **pending Git runtime snapshot** containing only Published Product/Care + reviewed Compatibility. Draft rows, review notes and machine-local file paths remain excluded. The action explicitly does not commit, push or deploy.
- Runtime assets are content-addressed as `assetId-v<version>-<sha12>.<ext>`. New files land before the manifest switch; `runtime-authority.json` is the final atomic authority pointer.
- Failure rollback is browser/API guarded: a forced final-manifest write failure after an asset version/content change preserves the previous referenced asset and removes the uncommitted new asset. A failed publication therefore cannot strand the previous Git authority with missing media.
- PASS after the fix: `test:local-file-admin`, `test:git-runtime-authority`, `test:local-file-admin-ui`, API TypeScript, root TypeScript, full root build and `git diff --check`.
- Candidate contains live main and remote feature histories (`main...HEAD 0/336`, `feature...HEAD 0/351`). Main pointer was not moved and nothing was pushed; Supabase Staging/Production/indexing remain untouched.
- NEXT: Local File → reviewed publish → Git runtime authority is locally closed. Any Supabase Staging validation or candidate→main promotion is a separate explicit gate, not the next implicit development step.


## CURRENT OVERRIDE — populated v3 migration + atomic publish verified (2026-09-11)
- Candidate: `reconcile/admin-content-main-20260911`; local code checkpoint `b8703fec`, prior docs checkpoint `d8bfd30e`.
- Compatibility v3 migration has now executed successfully on real local Supabase PostgreSQL 17. The pending migration chain reached `202609110001` with `Local database is up to date`.
- Populated pre-v3 guppy fixture PASS: reviewed Profile version 1 + approved revision base version 1 migrated to Profile version 2, v3 requiredFacts, Profile-owned adult→fry Stage Risk, two dedicated Stage Risk Evidence links, revision `pending_review`, base version 2, and stale Impact/Regression/Evidence cleared.
- Direct publish after migration correctly failed closed with `revision_not_approved`. After fresh review payloads were supplied, `publish_compatibility_profile_revision` atomically succeeded (`baselineVersion=3`, `authorityVersion=20`).
- Post-publish assertions PASS: Profile sources contain only FishBase + schooling evidence; Stage Risk sources contain only the two fry-predation studies; revision is `published`; active revision count is 0.
- Temporary Docker test resources were deleted; original `supabase_db_aquaguide-admin-supabase-local` volume remains. No Staging/Production/indexing/main mutation.
- NEXT: local reconciliation is technically ready for an explicit cloud/main promotion decision; do not promote implicitly.


## CURRENT OVERRIDE — reconciliation migration invariants complete (2026-09-11)
- Latest functional checkpoint: `b8703fec fix(admin): enforce compatibility evidence sets`; preceding safety checkpoints: `f849b6c6`, `92ba6c50`, `8ab60adb`.
- Candidate branch remains `reconcile/admin-content-main-20260911`; main itself has not moved and nothing has been pushed.
- Compatibility v3 DB boundary now validates full stocking guidance shape, unique requiredFacts/life-stage sets, unique Profile/Stage Risk citation sourceKeys and unique stocking evidenceIds.
- CREATE and PATCH contracts both reject duplicate requiredFacts, duplicate Stage Risk life stages and duplicate Stage Risk rule keys; Profile/Pair citation arrays share sourceKey uniqueness.
- Publish RPC independently rejects malformed or duplicate reviewed authority even if Admin API is bypassed. Historical published/rejected/superseded revisions remain untouched by v3 backfill.
- PASS: Compatibility contract/browser/authority/regression, API/root TypeScript, pglast migration parse (41 statements), full build, diff hygiene.
- Docker backend remains unresponsive; no local PostgreSQL apply and no Supabase Staging/Production/indexing mutation occurred.
- NEXT: controlled migration execution validation is the only remaining database gate before any cloud/main promotion discussion.

## CURRENT OVERRIDE — reconciliation candidate migration hardening complete (2026-09-11)
- Latest functional checkpoint: `0a938a12 fix(admin): harden compatibility v3 migration` on `reconcile/admin-content-main-20260911`.
- Candidate contains all live main (`0 / 325`) and all remote feature (`0 / 340`) histories; main itself has not moved and nothing was pushed.
- Migration `202609110001_compatibility_v3_profile_authority.sql` no longer rewrites historical rejected/published/superseded revisions with present-day v3 snapshots; only active Draft/pending/approved revisions are upgraded.
- Reviewed Profile requiredFacts and Stage Risk life-stage shape are enforced at the DB boundary. Stage Risk source-link RLS now inherits reviewed Profile + published Species visibility.
- Publish RPC fail-closes on missing/invalid requiredFacts, malformed Stage Risk rules, duplicate ruleKey and duplicate/blank citation sourceKey, so direct admin-table mutation cannot bypass v3 authority shape.
- PASS: Compatibility contract, Local Compatibility browser, authority gate, regression gate, API/root TypeScript, full build, diff hygiene.
- Docker daemon was unresponsive, so no local Postgres/Supabase migration execution was claimed. Staging/Production/indexing remain untouched.
- NEXT: no speculative feature work; next cloud step, if explicitly authorized, is controlled migration execution validation before any main/Production promotion.



## CURRENT OVERRIDE — isolated reconciliation candidate accepted locally (2026-09-11)
- Candidate branch/worktree: `reconcile/admin-content-main-20260911` at `/private/tmp/aqua-admin-reconcile-20260911`.
- Merge checkpoint: `80aded34 merge: reconcile admin content with main compatibility v3`. Parents: `1a032743` (accepted feature) + `d3c70dee` (live main).
- Git relation after explicit fetch: candidate contains all live main (`0 / 323`) and all remote feature (`0 / 338`); worktree was clean after merge commit. Main itself was not moved and nothing was pushed.
- Compatibility v3 is semantically merged, not ours/theirs: main domain engine remains behavior base; reviewed runtime authority now carries Profile/Pair + Profile-owned Stage Risk with independent Evidence.
- Local and Cloud contracts include `requiredFacts`, optional `stockingGuidance`, `stageRiskRules`, independent `stageRiskEvidenceResolution`, exact DB coverage and fail-closed fallback.
- New additive migration `202609110001_compatibility_v3_profile_authority.sql` remains code-only/unapplied. Old approved Profile revisions are designed to return to pending review during the v3 migration rather than retaining stale approval.
- Operator UI exposes Required Facts and Stage Risk review/editing; guppy adult→fry Stage Risk browser flow is proven Draft → review → regression → publish.
- PASS: Compatibility/domain/runtime/service/launch tests, admin contract, Local Compatibility browser, Operations desktop/mobile, Publish Center, Admin authority UI, authority gate, API/root TypeScript, full build, diff hygiene.
- NEXT: no further speculative reconciliation coding. Keep candidate isolated until explicit decision to validate Staging migration or promote toward main.

## CURRENT OVERRIDE — Durable Local Aqua Operations Studio + editor hierarchy convergence (2026-09-10)
Functional checkpoint: `7ec556a3 fix(admin): reuse healthy local seo server`.
- Durable Local File + recovery remains stable: versioned disk authority, integrity checks, backup/restore safety and Production isolation are unchanged.
- Data Review remains evidence-first with explicit human conclusion, explicit Canonical choice when needed, one `最终确认版本`, and one final confirmation action.
- Save/review actions remain centralized in the top Review bar; page/Base footer duplicate actions and repeated Draft chips are removed.
- Current-page tools and cross-page Operations are separated; one neutral `运营工具` entry owns batch SEO, bulk review/import and global queues.
- Top current-task + workflow + page-review chrome remains <=140px on desktop/mobile.
- Ownership is explicit: Base task header is the single Base impact explanation; Preview labels the final composition as `基础模板 + 当前页面`; Base/current-page history renders only the active authority.
- Visible Search & indexing controls stay open but compact (`6a1f1979`): inherited Title/Description/H1 remain visible as compact source rows until `本页自定义`; Search display is ~242px, Indexing/Canonical ~220px, full SEO section ~514px on desktop.
- Responsive Preview contract (`d1af2c08`): split Preview opens only at >=1051px, medium desktop Preview narrows to 340–360px, editing keeps >=480px, <=1050px fresh load keeps Preview closed and on-demand Preview uses overlay. Permanent browser matrix covers 1280/1080/1051/1050 plus mobile no-overflow.
- Responsive editor regression is hardened (`c258640b`): medium-width editor/panel have no internal horizontal scroll and policy controls remain >=180px; browser navigation waits for real editor readiness instead of brittle network-idle.
- Global topbar density is reduced (`1ea56f60`): Activity Center remains fully available but lives inside `运营工具`; unread count moves to the Operations entry. Mobile topbar is now Operations + 中文 + 英文 + 退出 only.
- Publish Center hierarchy is converged (`3cb4a569`): source/readiness are compact summaries, audit timeline comes before low-frequency Capability/Permission reference, details open only after an explicit event choice, and true 390px viewport coverage is enforced. Informational states no longer use decision-Amber.
- Product/Care editor hierarchy is converged (`448bfcd8`): mobile uses a compact record navigator instead of stacking the full catalog before editing; Product/Care fields precede Impact/downstream review; Care SEO moved after Care fields; dirty publish says `保存后可发布`; form internal overflow is guarded. 390px form start improved ~934→244px and Care width 504→366px.
- Downstream review visual semantics are converged (`340cbfd3`): Care SEO no longer looks like a separate violet/indigo product; Graphite/White is default, Green is success/publish-safe, Red is drift/error, and Amber is reserved for explicit human review/conflict/approval. Content Impact uses the same rule.
- Compatibility review hierarchy is converged (`89b6863a`): Profile/Pair share one visual authority; Draft/Open/Submit/Regression are neutral, pending review/approve/Impact decision support use Amber, reviewed publish uses Green, reject/error uses Red. Compact authority summary and 390px editor-position/no-overflow guards pass.
- Operations Home hierarchy is converged (`ee41c214`): task remains first, ready sources collapse repeated detail, authority workspaces use a compact 2×2 mobile grid, and Recent Activity is one latest-event summary linking to Publish Center instead of a duplicated timeline. 390px page height improved ~1833→1373px.
- Cross-workspace return continuity is explicit (`24097c4b`): exact Product/Care and Compatibility tasks return via Router state; standalone Species SEO uses a validated same-host URL handoff. Operations restores and highlights the original task when present, otherwise explains that it is no longer in the current queue.
- Repeated Operations attention noise is capped (`35134b0d`): the same authority/severity/gate expands at most three low-priority rows on Home; hidden task counts are summarized by authority without mutating the source WorkItems.
- Task closure is browser-proven (`fcc86c0d`): exact Product Draft publish and Compatibility Profile reviewed publish both return to refreshed Operations, remove the completed task from the current queue, and expose the next priority immediately.
- SEO WorkItem actions are gate-specific (`258a5d0d`): generic `处理/完善页面` labels are replaced by exact operator actions.
- Care SEO Operations deep-linking is complete (`7799d88a`): `seo=1` waits for the final Care SEO workspace to hydrate, then focuses it in both desktop internal-scroller and mobile document-scroller layouts.
- Action targets now preserve authority ownership (`f79802b5`): unpublished Care source tasks strip `seo=1` and return to Product/Care source editing; real SEO tasks keep downstream focus.
- Legacy Care snapshot repair is closed (`1c78ef14`): `source_not_snapshot` no longer sends the operator to downstream SEO. It opens Product/Care with an explicit repair context and calls a dedicated admin-only snapshot repair endpoint that reuses the immutable publication authority without changing Care content/status/version. Local Mode rejects this legacy-only repair, and missing publication storage remains fail-closed.
- Compatibility missing-check repair is closed (`298f5810`): missing Impact / Regression / Canonical Evidence no longer leaves pending/approved revisions with unusable disabled actions. A dedicated repair path recomputes the three review artifacts without changing Profile/Pair business fields; approved revisions are reset to pending_review so human approval must be repeated against the regenerated evidence.
- Bilingual SEO counterpart routing is closed (`44082ee0`): a `missing_bilingual_pair` WorkItem opens the actual missing/unapproved locale instead of the already-complete locale; review-ready counterparts say `审核 English/中文版本`. Local Care English remains fail-closed and no longer emits a fake bilingual task while that authority is unavailable.
- Compatibility publish-gate recheck is closed (`6d01980a`): an approved revision with DB/runtime baseline mismatch now exposes `重新检查发布资格`, which only refreshes the reviewed runtime bootstrap. Publish remains hidden until exact authority coverage returns; the approved revision itself is not mutated by the check.
- Product/Care exact-ID deep-link hydration is race-safe (`1c78ef14`): duplicate/late list loads cannot clear an already requested record back to `新草稿`; browser regressions cover 1280/390 and Operations handoffs.
- Validation PASS: Operations desktop/mobile matrix, Care SEO Draft→Review→Approve→drift browser flow, Admin authority UI, Product/Care + Compatibility closure regressions, root TypeScript, full root build and diff hygiene.
- SEO task completion is browser-proven (`393f52f7`): the exact Care SEO Operations task is completed through Draft → review → human approval, contextual return lands back on Operations, the old SEO task is gone, and the next priority is immediately visible.
- Legacy snapshot repair is strict maintenance-only (`f819182a`): non-Local `snapshot=1` locks Care fields, save/upload and downstream review/SEO so the only write is immutable snapshot repair; Local Mode does not expose this legacy repair context. Normal Product/Care editing returns after repair clears.
- Publish Center audit navigation is exact where event identity is stable (`4fd1e280`): Product/Care uses resource ID, Compatibility uses revision ID, Species SEO uses catalog key + locale; ambiguous audit events fall back to the authority home instead of guessing.
- Local Species SEO workspace is connected (`832537db`): `npm run dev:local-admin` starts root Web, Local API and the standalone SEO Admin together; localhost Operations/Publish Center links resolve to the configured SEO port (default 3010), while deployed `/admin/seo/` routing is unchanged. Durable Local File restart E2E verifies the SEO app is reachable.
- Local SEO → Operations return is browser-proven (`af886726`): cross-port return preserves the original Operations task context.
- Local launcher reuse is safe (`7ec556a3`): a healthy existing AquaGuide Species SEO server is reused without being killed when the parent Local Admin stops; an unrelated service occupying the configured SEO port causes an explicit startup failure.
- Final Local Acceptance is PASS (`8438f24e` docs baseline): Local File restart/backup/restore, Product/Care, Compatibility, Care SEO, Operations, Publish Center, Data Review, Admin authority UI, TypeScript and full root build all passed with no new operator blocker.
- Reconciliation audit is complete: main changed 220 files, local feature 234, only 21 overlap; 7 overlap files are auto-mergeable by three-way simulation and only seven product/runtime files need manual semantic handling. Canonical audit: `.ai/RECONCILIATION_AUDIT_20260911.md`.
- Compatibility v3 authority design is explicit in `.ai/COMPATIBILITY_V3_AUTHORITY_RECONCILIATION.md`: main v3 engine stays behavioral baseline; existing Profile authority expands to requiredFacts/stockingGuidance/Profile-owned Stage Risk with dedicated Evidence mapping.
- NEXT: build an isolated local reconciliation candidate/worktree, low-risk unions first and Compatibility last. Do not modify main or push. Supabase Staging/Production/indexing remain separately gated.

Updated: 2026-09-10
Canonical repo: `chusday97/aquaguide-tank-guide`
Local worktree: `/Users/chuchu/aquaguide-admin-content-v0`
Branch: `feature/admin-content-v0`
Current SEO Operations functional HEAD: `f945e9f86dd0790cbc7e75a57b5968adb08a94e5`
Current Operations Studio functional HEAD: `7ec556a3`
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
## 2026-09-08 21:14 +08:00 — Dirty-state Species navigation safety
- Functional checkpoint: `d0f03ff2abfc3d37abafa6308ca96c071f38235e` (`fix(admin): preserve dirty species navigation`).
- Mobile Species selector auto-collapse now depends on the real `runEditorNavigation()` result. If the operator cancels the unsaved-change confirmation, the selector stays open, the current Species remains unchanged, and dirty edits remain protected.
- `onSelect` / `onSelectBase` now return the navigation result instead of swallowing it; Sidebar closes only when that result is not `false`.
- Contract guards protect this return-value chain so future UI simplification cannot bypass the existing dirty-state boundary.
- PASS: Admin Content contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Fresh remote read before docs sync: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature `ccf2feac122f288fd0de17665bb9ac3b034032ce`, divergence at functional checkpoint **275 main-only / 214 feature-only**.

## 2026-09-08 22:01 +08:00 — Secondary editor hierarchy convergence
- Functional checkpoint: `5b4be8cb20ff5bb7d0eb2dd124f26e4c2c048e8b` (`fix(admin): collapse secondary editor hierarchy`).
- Variant editor secondary SEO is now one stateful `更多 SEO 设置 / More SEO settings` disclosure. Search Appearance + Indexing/Canonical no longer occupy two persistent hierarchy rows.
- Secondary SEO defaults collapsed, auto-opens for real Meta/H1/index blockers or Preview pick-to-edit targets, and manual open state survives React rerenders. Chinese `Noindex` is rendered as operator language `暂不收录`.
- Inherited Base intro reference moved into the current page task helper as a text action (`查看模板内容`); the old standalone `基础模板内容` disclosure is removed. Default editor panel height is ~563px desktop / ~626px mobile versus ~680px / ~743px before this round.
- `更多工具` is now `辅助工具 / Utility tools`, styled as a flat footer affordance rather than a third editor card. Readiness enum `blocked` is localized to `未就绪`; zero-count `批量内容审核` does not render.
- Browser acceptance: 1440×900 and 390×844 zero horizontal overflow; old Search/Advanced/Template disclosures count 0; template reference toggle PASS; Preview Meta/H1 selection auto-opens unified secondary SEO; utility drawer entries remain functional.
- PASS: Admin Content contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. Production/main/live DB/index remain untouched.
- Correct local CMS Preview: `http://127.0.0.1:3010/?demo=1`.
- Fresh remote read before docs sync: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature `2d8eaccd71191155d7d62160f66a974c6e5e56a2`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence at functional checkpoint **275 main-only / 216 feature-only**.

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

## 2026-09-08 23:34 +08:00 — Data Review evidence-first convergence
- Functional checkpoint: `fdc75d9d3150d4d6bb73b4b2d8d3b09dcf90493f` (`fix(admin): make data review evidence-first`).
- Data Review now follows `evidence → one human conclusion → after-confirmation result → one confirm action`; the old action-first sticky decision block is retired.
- Category conflicts explicitly separate `系统已确认` from `系统无法自动确认`, summarize category/record differences, and keep full source rows behind `查看全部 N 条源记录`.
- Human conclusions are radio selections, not competing action buttons. `标记为源数据待修正` truthfully records a review conclusion only; it does not rewrite Product Data and keeps SEO blocked until Product Data is corrected and re-reviewed.
- Duplicate review keeps its system recommendation/reasons, uses text-only candidate Preview actions and radio keep-page selection, then previews the exact Canonical outcome before confirmation.
- Browser acceptance: category + duplicate flows at 1440×900 / 390×844, zero horizontal overflow, no page errors. Admin contract incl. Repo backend/API/dual-repo gates and full root build PASS.
- Production/main/live DB/index remain untouched. Local CMS: `http://127.0.0.1:3010/?demo=1`.
## 2026-09-08 23:57 +0800 — Species editor PM + UI hierarchy convergence
- Used AquaGuide UI/UX, Product Manager and UI Designer skill rules together for the current-page editor acceptance.
- Removed the parallel header summary (`2 项待填写 · 3 项搜索字段沿用模板`) so identity no longer competes with task status.
- Primary editor now leads with `完成本页补充` + remaining task count; fields expose explicit `需要填写 / 模板已覆盖 / 本页已补充 / 已填写 / 需修复` states.
- Intro guidance is data-dependent: Base shared intro present → current-page difference may be blank; Base shared intro missing → page must add an intro or complete Base first.
- `更多 SEO 设置` is now the quieter `搜索与收录设置`; typography scale is 24px identity / 17px current task / 15px field question / 12px guidance / 13px secondary settings on desktop.
- Browser acceptance: 1440×900 + 390×844, zero horizontal overflow/no page errors. Preview `定位字段` still maps H1 to the left editor and auto-opens Search & Indexing.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`.
- Functional checkpoint: `02713144bd4b0ae5d0c106cfd957c29c686ed9bc`. No Production/main/live DB/index changes.

## 2026-09-09 00:36 +0800 — Desktop Preview default-open
- Functional checkpoint: `980a29dcb35365e00fade906dff9816aae7e6183` (`fix(admin): default desktop preview open`).
- Desktop (`>=900px`) now treats Preview as part of the default authoring workspace: it opens on first load, remains open across Species/locale changes, and closes only when the operator explicitly chooses `关闭预览`.
- Narrow/mobile layouts still default Preview closed because the Preview surface overlays the editor there.
- Browser acceptance: 1440×900 initial `aria-expanded=true`, Species/locale persistence PASS, explicit close PASS; 390×844 initial `aria-expanded=false`; horizontal overflow 0 / page errors 0.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. No Production/main/live DB/index changes.
- Correct local CMS remains `http://127.0.0.1:3010/?demo=1`.

## 2026-09-09 00:57 +0800 — Top-level current-task notification
- Functional checkpoint: `6ae7112eb423235c6297c00093afad277511bfa2` (`fix(admin): surface current task notification`).
- Current task is now the first operator notification directly below the Topbar; it states the highest-priority problem, why it blocks progress and one real queue action.
- Current demo surfaces `33 个数据问题需要确认` with Amber emphasis for human confirmation. Blockers use red emphasis; Preview-ready uses Green. The bar itself remains neutral.
- The 1→4 Publish Flow no longer repeats `当前下一步`; it is stage navigation only. Clicking the notification action applies the real corresponding workflow filter.
- Browser acceptance: 1440×900 notification 54px, 390×844 notification 80px, zero horizontal overflow/no page errors. Desktop Preview remains default-open; mobile Preview remains default-closed.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. No Production/main/live DB/index changes.
- NEXT: continue operator acceptance by moving task-critical capabilities (especially Publish Readiness / task queue) out of low-frequency utility disclosure without adding another permanent hierarchy layer.


## 2026-09-09 01:32 +0800 — Aqua Operations Studio Phase 1
- User explicitly moved the active product scope from further Species SEO-only refinement to the broader **Aqua Operations Studio**. Species SEO remains a stable authority/editor subsystem, not the whole Admin.
- Functional checkpoint `b40011efc60dca0cb77fa37631a2d08a9ca26346` replaces the root AdminHub card launcher with a task-first Operations Home at `/admin/content`.
- New `operations-work-item.service.ts` is a read-only aggregation layer over existing Product/Care current Drafts, Compatibility current revisions and SEO Health. It does not copy authority state into a new DB and contains no mutation calls.
- WorkItems sort by blocker → human decision → attention. Unknown/unavailable source state is excluded from task counts and exposed separately as authority availability.
- Publish Center ReleaseEvents appear only as recent activity; historical events are never used to claim a current task.
- Local acceptance URLs: Operations Home `http://127.0.0.1:3003/admin/content` with API `8788`; Species SEO CMS `http://127.0.0.1:3010/?demo=1`. Port `8787` belongs another Aqua worktree and must not be killed/reused.
- Browser PASS at 1440×900 / 390×844 with zero horizontal overflow and truthful partial/unavailable authority rendering. WorkItem + Product/Care + Compatibility + Publish Center + SEO Registry contracts, API/root TS and full build PASS.
- Active next: **Phase 2 resource-level WorkItems / exact authority deep-links / task-critical readiness**. Do not build a new centralized CMS/write authority, do not infer dependency from release history, and keep reconciliation / Production / live migrations parked.


## 2026-09-09 — Aqua Operations Studio Phase 2
- Functional checkpoint `12f6f9b94c35b709b2f64e4c19172fdbf62144fe` converts aggregate WorkItems into exact resource/reason tasks.
- Product/Care actions now land on exact records (`/admin/product-content?type=...&id=...`). SEO tasks reuse the registry's exact editor target. Compatibility tasks land on exact Profile/Pair revisions using `kind + revision`.
- Compatibility exact links apply once and then allow normal operator navigation; they do not lock the editor to the initial URL target.
- Operations Home intentionally caps the task surface at one primary + eleven queue rows; the authority workspace remains the full-list owner.
- Read-only boundary preserved: WorkItem aggregation has no mutation calls, no new DB and no centralized publish authority. Unknown/unavailable sources remain availability state, not fake work or fake health.
- Local browser acceptance remains `http://127.0.0.1:3003/admin/content`, API `8788`, with 1440/390 zero horizontal overflow in the current unauthenticated environment.
- Validation PASS: WorkItem, Product/Care, Compatibility, Publish Center and SEO Registry contracts; root/API TypeScript; full build; diff hygiene.
- Active next: **Phase 3 task-critical readiness / exact next operator decision**. Keep writable hosted credentials, PR #144 reconciliation, main, Production, live DB and indexing parked.


## 2026-09-09 — Aqua Operations Studio Phase 3
- Functional checkpoint `76dfc817cdebf2b6357523e31df08b123d1ed5b3` adds task-critical readiness to resource-level WorkItems without creating a new authority.
- Every actionable WorkItem now has `current gate / next step / verification note`. The home page shows these directly for the primary task and queue rows.
- SEO task reason selection now surfaces the actual hard blocker first; softer health issues cannot hide the condition that caused `blocked`.
- Compatibility pending/approved revisions are checked for Impact, Regression and Canonical Evidence. Missing checks become blocker tasks. Even fully checked `approved` revisions remain non-green until the Compatibility authority verifies the live runtime baseline/freshness gate.
- Product/Care Draft next-step copy remains truthful to immutable Published snapshot isolation and points back to impact/Preview + explicit authority publish.
- Read-only guard remains intact: no WorkItem mutation call, centralized DB or direct publish action was added.
- Local 1440/390 Operations Home still has zero overflow and zero page errors in unauthenticated mode. This proves fail-isolated behavior, not populated-task click-through.
- Active next: authenticated populated-state operator acceptance using an existing secure session. If no secure session is available, treat that as a real acceptance blocker rather than inventing fixture data as production truth. Reconciliation/Production/live DB/index remain parked.

## 2026-09-09 02:55 +0800 — Operations Studio populated-state browser contract
- Test checkpoint `ae818fb9e97fc52b7241d0bfefd9303dcb45d270` (`test(admin): cover populated operations routing`) adds a credential-free populated-state Playwright regression for Operations Studio.
- The test starts an isolated Vite instance with fake Supabase config/session and intercepts read endpoints only; it never uses real cookies/tokens and never writes Product/Care/Compatibility/SEO data.
- Desktop 1440×900 and mobile 390×844 both prove `Operations Home → exact Compatibility revision` and `Operations Home → exact Product Draft`, with zero horizontal overflow, zero page errors and zero API 5xx.
- `test:operations-studio-ui` is wired only into the Heavy browser gate, not lightweight CI. This is durable routing/UI regression evidence, **not** a substitute for real authenticated operator acceptance.
- Real authenticated acceptance is still pending because the existing Chrome profile has `查看 → 开发者 → 允许 Apple 事件中的 JavaScript` disabled; no credential extraction or manual token shuttling is allowed.
- NEXT: when a secure existing Business/Repo Admin browser session is automatable, repeat populated WorkItem click-through against real current authority state. Production/main/live DB/index and PR #144 remain parked.

## 2026-09-09 09:13 +0800 — Operations authority access-state checkpoint
- Functional checkpoint: `6ea35173fb92f69cf7eb90b97c3a56e62b713dfa` (`fix(admin): distinguish authority access states`).
- Operations Home now tells operators *why* an authority cannot be read: missing Business Admin session → `需要登录`; authenticated but non-admin → `权限不足`; dependency/service failure → `暂不可用`; one of two sub-sources readable → `部分可读`.
- No admin login UI was invented. The root `/login` is not a Business Admin login flow; Product/Care and Compatibility remain Business API/Supabase authorities. SEO keeps independent Repo Admin authentication.
- Recovery guidance reuses the existing `刷新任务` after a secure authorized session is restored, avoiding another persistent button layer.
- Browser regression covers 401 and 403 rendered states plus exact Compatibility revision / Product Draft routing at 1440×900 and 390×844. Local unauthenticated environment remains zero-overflow/zero-page-error and correctly reports dependency unavailability.
- Full focused contracts, root/API TS, full build and `git diff --check` PASS. No Production/main/live DB/index change.
- Remaining acceptance gate: real populated current-state click-through using an existing secure Business/Repo Admin browser session; do not expose cookies/tokens or weaken browser security to obtain it.

## 2026-09-09 10:45 +0800 — Operations incomplete-source UX checkpoint
- Functional checkpoint `cab3bc5d6c23e6946dc9ca2017892b90925c3d30` fixes a task-truth badcase in `/admin/content`: incomplete authority coverage can no longer look like a globally empty queue.
- No readable WorkItem + incomplete sources now surfaces `先恢复数据来源，再判断是否真的没有任务` as the top operator task and links to the existing source-status section.
- Work queue totals use `已读取任务 · 来源未完整`; unreadable sources are explicitly excluded from the zero claim.
- Concrete tasks under partial source coverage are labeled `当前已读取优先任务` and disclose that ranking is based only on readable sources.
- Source recovery is neutral Graphite/Slate, so Amber remains reserved for explicit human decisions/second confirmation.
- Browser regression covers auth-required, forbidden, partial-source priority scoping, exact Product/Compatibility routing at 1440/390, and real local mobile source scrolling with zero horizontal overflow.
- Remaining hard gate is still real current-state acceptance under an existing secure Business/Repo Admin browser session; do not extract/shuttle cookies or tokens. No main/Production/live DB/index change.

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

- SEO editor ownership clarity is complete at `466025f7`: inherited Search fields use explicit `本页自定义`, current-page/Base tool labels follow the active editor scope, history drawers render exactly one matching revision authority, and publish readiness is labeled as final composed-page readiness.
- NEXT: continue visual hierarchy cleanup in the authoring surface (card/section/color density and context clarity) without changing authority or review semantics.

- Visible Search & indexing density is converged at `6a1f1979`: inherited Meta/H1 stay visible as compact source rows until `本页自定义`; indexing policy keeps keyword + strategy visible side-by-side on desktop; route/canonical are a flat read-only summary; redundant per-form Production lock copy was removed.
- Measured desktop density improved from Search 311→242px, Policy 370→220px, full Search & indexing 733→514px; mobile returns to one column with no horizontal overflow.
- NEXT: audit and converge typography hierarchy in the authoring surface; do not hide required SEO controls.
