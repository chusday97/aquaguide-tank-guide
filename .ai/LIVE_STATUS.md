# Live Status


## CURRENT OVERRIDE — Durable local runtime + SEO editor hierarchy status (2026-09-10)
- Functional checkpoint: `7ec556a3 fix(admin): reuse healthy local seo server`.
- Durable Local File + recovery status remains PASS; recommended single-machine entrypoint is `npm run dev:local-admin`.
- Data Review remains evidence-first with explicit human Canonical choice and one final confirmation; Product Data authority is not rewritten by SEO review.
- Save/review remains centralized in the top Review bar; contextual page/Base tools and history follow the active authority; cross-page work remains behind `运营工具`.
- Search & indexing remains default-open but compact: inherited SEO fields are source rows until `本页自定义`, and policy/route controls no longer repeat the global Production lock.
- Preview states the final composition (`基础模板 + 当前页面`). At >=1051px split view keeps editor >=480px and Preview 340–360px on medium desktop; <=1050px fresh load is closed and on-demand Preview is fixed overlay.
- Permanent `test:data-review-ui` now covers Data Review, ownership/history, SEO density, <=140px top chrome, mobile no-overflow and the 1280/1080/1051/1050 Preview matrix.
- The same browser gate also verifies medium-width editor/panel no-overflow, policy inputs >=180px, and a stable DOM-ready navigation strategy.
- Activity history is no longer a separate topbar action; it is the first global Operations item, with unread count surfaced on the Operations trigger. 390px topbar now exposes four actions instead of five.
- Publish Center no longer front-loads five readiness cards plus two full reference matrices. Source/readiness are compact, Timeline is the primary audit surface, event detail opens only after selection, and Capability/Permission stay available under one `发布边界详情` disclosure. Real 390px viewport regression is now valid.
- Product/Care now prioritizes editing: on mobile the full catalog is replaced by a compact selector, main fields precede Impact/downstream references, Care SEO is downstream after Care fields, and Product/Care forms have no internal horizontal overflow.
- Care SEO and Compatibility now share the same operator visual semantics: neutral Draft/reference states, Amber only for explicit human decisions, Green for reviewed/publish-safe states, Red for errors/drift.
- Operations Home remains task-first but is materially denser on mobile: ready-source details collapse, authority workspaces render 2×2, Recent Activity is one latest-event summary, and exact deep-link hydration is browser-guarded.
- Exact Operations task navigation now has return continuity: internal Product/Care + Compatibility use Router state; standalone Species SEO carries a constrained same-host return URL; the original task is highlighted when still queued.
- Home queue presentation caps repeated low-priority attention rows at three per authority/severity/gate and preserves authority-level hidden counts; the source queue and severity ordering are unchanged.
- Exact task closure is proven in browser (`fcc86c0d`): Product publish and Compatibility Profile reviewed publish return to Operations with the completed task absent and the next priority available immediately.
- SEO WorkItem actions now name the actual gate (`258a5d0d`); Care SEO `seo=1` routes focus the hydrated downstream editor (`7799d88a`); unpublished Care source tasks instead return to Product/Care source editing (`f79802b5`).
- Legacy Care `source_not_snapshot` is now executable (`1c78ef14`): Operations returns to Product/Care, a dedicated admin-only repair backfills the immutable publication snapshot without changing Care content/status/version, and missing snapshot infrastructure remains fail-closed. Exact Product/Care deep-links are protected from duplicate-load selection races.
- Bilingual SEO WorkItems now target the real counterpart locale (`44082ee0`); unavailable counterpart persistence is not misreported as actionable bilingual work.
- Compatibility approved revisions blocked by runtime authority alignment now expose a read-only gate refresh (`6d01980a`); publish stays hidden until the reviewed DB/runtime baseline is exact.
- SEO task completion is browser-proven (`393f52f7`): Care SEO task completion returns contextually to Operations, removes the completed task, and exposes the next priority without manual refresh.
- Legacy Care snapshot repair is maintenance-isolated (`f819182a`): only immutable snapshot repair remains writable in the repair context; content fields, save/upload and downstream SEO are locked, and Local Mode does not expose the legacy-only repair UI.
- Publish Center audit details now preserve exact authority identity where possible (`4fd1e280`), including Product/Care record ID, Compatibility revision ID and Species SEO catalog key + locale; ambiguous events fall back safely.
- Local Admin is now a complete three-process workspace (`832537db`): `dev:local-admin` starts Web + API + standalone Species SEO, localhost links resolve to the configured SEO port, deployed routing is unchanged, and Durable restart E2E asserts the SEO app responds.
- Cross-port Local SEO return is accepted (`af886726`): the standalone SEO app returns to root Operations with the original task context intact.
- Existing local SEO process reuse is guarded (`7ec556a3`): a healthy AquaGuide SEO process is reused; unrelated services on the configured SEO port are rejected rather than silently accepted.
- Compatibility review-check repair is executable (`298f5810`): pending/approved revisions missing Impact / Regression / Canonical Evidence expose a single repair action; approved revisions are reset to pending_review before regenerated checks can be re-approved, and publish/approval UI requires all three artifacts.
- Full Species SEO contract, Operations desktop/mobile matrix, Care SEO local editorial flow, Admin content UI, Product/Care + Compatibility closure regressions, root TypeScript, full root build and diff hygiene PASS.
- Production/main/live Supabase/indexing remain untouched; Supabase Staging remains parked.

Updated: 2026-09-10
Canonical branch: `feature/admin-content-v0`
Operational functional HEAD before this docs sync: `7ec556a3`
Latest AI functional checkpoint: `a3f582c22492504edd2de5e1e81a9b43695150ab`
Final accepted Care SEO snapshot: `fd960667b951cafca83332a4f78a60b413e36d9e`

## Product state
- AquaGuide product includes Species, Aquarium/Care, Compatibility and SEO acquisition flows.
- `/admin/product-content` currently exposes Product Data + Care editing/publish actions.
- `/admin/seo/` remains the Species SEO editorial/publishing subsystem.
- Compatibility Admin now has reviewed Profile/Pair revision, real regression, human review and versioned publish paths in code; live DB migrations remain intentionally unapplied.

## Product/Care runtime state
- Encyclopedia Product Data now reads the published runtime catalog.
- Care Encyclopedia plus Aquarium/Identify diagnosis now read the published Care runtime catalog.
- `/api/v1/*` is routed through a dedicated Business API Vercel function; local Preview proxies the same API boundary.
- Static datasets are retained as explicit fallback when the published API is unavailable.
- Controlled Product/Care Save→Publish→Preview acceptance now passes; user aquarium state and Compatibility static authority remain isolated.

## SEO subsystem state
- Repo-backed private Draft/review/revision/import-batch authority is stable.
- CSV preflight/Diff, duplicate evidence review, batch-bound review and bilingual Staging gates are implemented.
- Corrected 14-Species bilingual batch-01 completed the full authenticated hosted operating cycle: zh-CN + en import, batch-scoped review/approval, one Staging Publish, and 28/28 hosted page acceptance.
- Production remains locked.
## Current next work
P0-A: Product/Care target convergence is locally accepted.
P0-B: completed; Production remained locked.
P1 Change Impact Preview and Compatibility Admin are complete in code. P2 Publish Center V1 and Care SEO/AI milestones remain complete with explicit `hold_noindex`. The active user scope is Species SEO Admin usability/acceptance: `1e1414ec` adds the 4-stage workflow hierarchy, current-action command center, separate page action panel, detailed-editing section and collapsed advanced tools. Branch reconciliation PR #144 is parked. Production/index remain locked.

## Branch / deploy safety
- Live main: `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Feature remote before this docs sync: `1e1414ec768580843e4f9faf2599719fbe5805c7`.
- Do not treat feature as merge-ready for main; dedicated reconciliation remains required.
- Production/main remain untouched by this documentation sync.

## Canonical read set
Use `HANDOFF_LATEST → AQUA_OPERATIONS_STUDIO_ARCHITECTURE → CURRENT_GOAL → TASK_QUEUE → LIVE_STATUS → BRANCH_STATUS` before new work.

## Product/Care publication isolation — implemented locally
- `content_publications` stores immutable safe public snapshots for Species/Care.
- Save on an already-published record preserves the old snapshot and returns the editable source row to Draft.
- Publish/Archive use service-role-only transactional RPCs; public routes prefer the snapshot.
- Missing snapshot-table migration is tolerated only by public reads so deployment order does not break legacy content; Admin edit remains fail-closed until the migration exists.
- Validation PASS: API typecheck, Admin content contract, root build, Admin UI, SEO handoff, diff hygiene.
- Production migration/state was not touched.

## 2026-09-04 runtime convergence checkpoint
- Functional commit: `eff3bba3 feat(content): route published product care runtime`.
- Full root build PASS; Published runtime browser injection PASS for zh-CN Product/Care and EN Care.
- Care search + Identify manual-search browser checks PASS; diagnosis deterministic tests PASS.
- Local `vercel build` recognized `/api/v1/:path*` → dedicated `api/v1/router.func`; Business API bundle reduced from ~257 MB legacy-app packaging to ~24 MB.
- No Vercel deployment, Production migration, main merge or rebase occurred.

## 2026-09-04 Product/Care acceptance checkpoint
- Functional commit: `ee2fcc8a test(content): prove admin publish preview boundary`.
- Product and Care stateful browser Preview tests PASS: Save remains private; Publish advances the intended runtime consumer.
- Published Care titles now bypass legacy hardcoded title maps; runtime search suggestions preserve published Product/Care labels.
- `aquarium_app_state_v1` unchanged across the tested flows; Compatibility still consumes isolated static rule inputs.
- Full root build, Admin contract/UI, SEO handoff, runtime browser, isolation and both publish-preview tests PASS.
- Production migration/deployment and main remain untouched.

## 2026-09-04 SEO batch-01 + CI checkpoint
- zh-CN batch `batch-20260904132705-deca` and en batch `batch-20260904132732-9d0d` were authenticated, imported, reviewed and approved with exact 14-Species / 14-Base scope per locale.
- Staging publish commit `7aaeb44e02ce6b82ba35919b081945bf4d0ce1cd` produced Vercel deployment `dpl_B86KiBaD75LhGdcHMa6v8zTN6pJM`.
- Hosted acceptance PASS: 28/28 bilingual pages; metadata, H1, source facts, canonical/hreflang, robots, CTA and hygiene all verified.
- CI split implemented locally: light checks on ordinary runs; Golden/Visual/evaluation/browser heavy gates only on `workflow_dispatch`, `merge_group`, `run-heavy-ci` or `merge-ready` PRs.
- Local light CI command set PASS; heavy entrypoint smoke set PASS. Production untouched.

## 2026-09-04 Change Impact Preview checkpoint
- Functional commit `e58c70829b389b6a9a7b23fd9519afd96c802702`.
- Product/Care fields now expose before→after Diff, impact class, direct consumers and review-only independent authorities in `/admin/product-content`.
- Published baseline is loaded through existing public Product/Care detail APIs, so saved Draft impact survives reload.
- Compatibility and SEO are explicitly review-only where appropriate; Product/Care publish still cannot silently mutate either authority.
- PASS: impact unit contract, Product/Care browser impact flows at 1280/390, Admin contract/build, root lint/build, diff hygiene.
- Admin CI now covers Product/Care Admin source paths and the lightweight impact test.

## 2026-09-04 Change Impact Preview completion checkpoint
- Functional commit `9dc30c48fb02f565637e09f807e0a56d882c1252`.
- Encyclopedia Before/After is rendered for decision-critical Product changes and persists against the current published baseline after reload.
- Compatibility-sensitive saved Product changes run species-only engine regression across the static living-species cohort; status and rule-code changes are surfaced without mutating Compatibility authority.
- Publish confirmation carries the simulation summary.
- PASS: Product/Care browser flows at 1280/390, impact + Compatibility contracts, Product/Care Save→Publish Preview tests, Admin contract/build, lint and root build.
- Next: Compatibility Admin.

## 2026-09-04 Compatibility Admin Behavior Profile Draft checkpoint
- `/admin/compatibility` now shows reviewed Profile / Pair Rule authority and can safely create/edit/submit Behavior Profile revisions when DB baseline alignment is available.
- Static reviewed runtime remains unchanged; Pair Rule editing and reviewed publish remain locked.
- New revision migration is committed only; no live DB/Production mutation.
- PASS: compatibility admin contract, API TS check, 390/1280 browser workflow, root lint/build, diff hygiene.

## 2026-09-04 Compatibility Admin Pair Rule Draft checkpoint
- `/admin/compatibility` now safely supports Profile and Pair Rule revision Drafts where reviewed DB baselines are aligned.
- Pair Rule Drafts expose evidence/confidence/review-state fields but cannot mutate reviewed runtime authority or publish.
- PASS: pair/profile compatibility-admin contract, API TS, 1280/390 browser flow, Compatibility impact, root lint/build, diff hygiene.
- Pair migration remains unapplied to live DB/Production.

## 2026-09-04 Compatibility human review checkpoint
- Profile/Pair revisions require API-generated structural impact before pending review and explicit human Approve/Reject before becoming Approved.
- Approved remains non-runtime; no Compatibility publish endpoint exists.
- Online light CI for `25e3ec0d` PASS; Heavy skipped.
- Historical note only: this split-authority blocker was closed by the later runtime and versioned-publish checkpoints.

## 2026-09-05 Compatibility runtime authority convergence
- Functional commit `1e8a482a91655cc5929fdb635b51232c7c3d0541`.
- Existing Compatibility engine now reads an atomic runtime reviewed registry.
- Complete reviewed DB baseline (exact 7 Profile / 4 Pair coverage with reviewed evidence) may activate; partial/mismatched/unavailable DB always falls back wholesale to static reviewed evidence.
- Runtime authority fingerprint is exposed through decision `metadata.ruleVersion` and includes Profile/Pair + Evidence versions.
- PASS: runtime authority contract, legacy Compatibility engine suite, Admin impact/admin contracts, 390/1280 Admin UI, API TS, root lint/build, diff hygiene.
- No live DB migration/publish, main merge/rebase or Production mutation.

## 2026-09-05 Compatibility versioned publish completion
- Functional commit `57c4ef00571c00191248948af8218f978417c949`; online light CI run `33909317349` PASS and Heavy skipped.
- Runtime and Admin reviewed views use one exact DB authority loader with wholesale static reviewed fallback when 7 Profile / 4 Pair coverage is incomplete.
- Evidence source keys reconcile to canonical reviewed Evidence with strict drift rejection; real engine before/after regression is persisted and freshness-checked at Approve and Publish.
- Profile regression covers the Product runtime cohort (current 486 catalog rows; 1455 directional scenarios for a full Profile change); Pair regression covers three explicit-pair scenarios. Local benchmark for the full Profile cohort was ~42 ms.
- Atomic versioned publish RPC requires Approved revision, structural Impact, fresh regression, canonical Evidence, unchanged baseline/evidence versions and authority sequence; any Product/Compatibility/Evidence authority change invalidates stale regression.
- Migrations `202609050001_compatibility_reviewed_baseline_reconciliation.sql` and `202609050002_compatibility_versioned_publish.sql` are committed but NOT applied to a live database/Production.
- Next: P2 read-only Unified Publish Center / release timeline first; do not rewrite Product/Care, SEO or Compatibility publication mechanisms.
## 2026-09-05 P2 Publish Center inventory
- Historical note: read-only Unified Publish Center was the next milestone at this checkpoint and is now complete; use `## Current next work` above for continuation.
- Product/Care + Compatibility release history can be read from Business API/Supabase authority.
- SEO release history remains Repo Admin authority (`content_revisions`, `activity`, `import_batches`, Staging snapshot) behind its own authenticated API.
- The first Publish Center must aggregate these sources without changing where writes occur. Per-source unavailable/unauthenticated state should be visible instead of silently dropping history.
- Next: normalized `ReleaseEvent` contract → read-only aggregator → `/admin/publish-center` operator timeline.

## 2026-09-05 P2 Unified Publish Center — read-only checkpoint
- Functional commit `f1b7adae feat(admin): add unified publish center read model`.
- Added shared `ReleaseEvent` / source-status contract, authenticated Business Admin `GET /api/v1/admin/releases`, independent SEO Repo Admin read adapter, and `/admin/publish-center`.
- Product/Care + Compatibility remain Business API/Supabase write authorities; SEO remains Repo Admin / `admin-store.json`. Publish Center performs no cross-authority writes.
- Product/Care source is explicitly marked `current_only` because `content_publications` stores one current Published snapshot per resource; Compatibility exposes revision history and SEO exposes activity/revision/import/Staging history.
- SEO auth is independent: when Repo Admin is not logged in the Publish Center shows `auth_required` while Product/Care + Compatibility continue to render.
- PASS: read-only contract, API TS, root lint/build, 390/1280 Publish Center browser flow, existing Admin Hub/Product/Care browser regression, Repo Admin contract.
- CI policy preserved: read-only contract runs in lightweight CI; Publish Center Playwright runs only in Heavy Gate.
- Next: read-only release detail/readiness drill-down before any cross-domain write orchestration. Production/main/live DB untouched.
## 2026-09-05 Publish Center capability checkpoint
- Read-only ReleaseEvent aggregation is complete across Product/Care, Compatibility and independently authenticated SEO Repo Admin history.
- Event detail, source-readiness cards and filter-safe selection are implemented.
- Capability matrix now shows each authority's Diff / Impact / Preview / Review / Staging / Production state with explicit locked/not-applicable distinctions.
- Production remains locked; Product/Care current history is still current-only by design.
- Historical note: cross-domain coordination + permission/audit visibility were next here and are now complete in Publish Center V1.
## 2026-09-05 Publish Center permission + Product/Care audit
- Current Business `admin` and SEO `repo-admin` permissions are visible as separate authorities; Production locks are explicit.
- Product/Care full release audit history exists in code as append-only baseline/publish/archive events with actor/version; migration remains unapplied.
- Unmigrated environments keep existing publish behavior and Publish Center current-only history via legacy RPC/read fallback.
- First unfinished P2 item: read-only cross-domain coordination design.

## 2026-09-05 P2 Publish Center — cross-authority coordination closeout
- `5a549377` adds read-only cross-authority context by explicit catalog key / Pair key / SEO batch catalogKeys only.
- Related records are contextual evidence, not dependency inference and not a signal that synchronized publish is required.
- Event detail links back to the original Product/Care, Compatibility or SEO authority; Publish Center still performs no writes.
- Online lightweight CI run `33951946893` passed for `5a549377`.
- Product/Care append-only audit migration remains code-only/unapplied; current deployments safely fall back to current-only history.
- Business role split is deliberately deferred until a real multi-operator requirement exists.
- First unfinished milestone: Care SEO downstream projection from approved Care Knowledge.

## 2026-09-05 Care SEO projection/static handoff closeout
- Functional HEAD `8104a1b2b49a1f35bbcfd3f7626d8b69d7255622`; online light CI `33955509807` PASS, Heavy skipped.
- Published Care is the only source for downstream SEO projection. Draft Care remains private.
- SEO route contract: EN `/care/<key>.html`, zh-CN `/zh/care/<key>.html`, x-default EN; client fallback noindex.
- Static Care SEO staging artifact generation is explicit-input-only and fail-closed; normal builds skip it.
- Production/index remains locked. Next is editorial Draft/Review + explicit Staging snapshot/hosted acceptance.

## 2026-09-05 — Care SEO foundation final sync
- Functional checkpoint `8104a1b2b49a1f35bbcfd3f7626d8b69d7255622` completed Published-Care-bound projection, deterministic EN `/care/<key>.html` + zh-CN `/zh/care/<key>.html` routing, hreflang/x-default, and a fail-closed static Staging artifact builder.
- Online Admin Content CI run `33955509807`: lightweight `validate` PASS; Heavy browser / SEO handoff gate skipped by policy.
- Latest docs checkpoint before this sync: `c4b1c1a1a308510029135bbad0f1bb6c552603c7`; worktree was clean and local/remote feature matched.
- Live main remains `64fa58a16a723b74621ac1db513adb1efb47e282`; current pre-sync divergence is main-only 269 / feature-only 145, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Feature is not merge-ready: dedicated reconciliation against live main remains mandatory. No main merge/rebase, Production deploy, index unlock or live DB migration occurred.
- Historical note: the Editorial/handoff/hosted-acceptance milestone is now complete. Current next gate is explicit Index/Production release; Production stays locked.

## 2026-09-05 Care SEO Editorial + sanitized Staging handoff
- Functional chain now extends through `a2caf575` Editorial persistence/review and `6079b6d4` sanitized approved-only Staging handoff.
- Handoff rejects legacy-published fallback, source identity/version drift, unapproved rows, indexable rows, Production source labels and Production destinations.
- Public Staging snapshot contains only rendering-minimum Care facts plus approved SEO editorial fields; protected diagnosis/evidence/revision/audit metadata are not exported.
- Local HTTP hosted verifier PASS 2/2 EN/ZH pages. Root build PASS and ordinary code builds skip Care SEO generation.
- Online Admin Content CI `33958334178`: validate PASS; Heavy skipped.
- Historical note: persistent AquaGuide Staging was later proven unnecessary; the free ephemeral Supabase path completed hosted acceptance. `ice-glide-staging-sg` remains unrelated and Production remains locked.

## 2026-09-05 Care SEO real hosted acceptance
- Ephemeral local Supabase generated the approved bilingual source-bound snapshot without reading or mutating Production; the temporary database was destroyed after export.
- Timestamp compatibility fix: `5d2542ac68121809f68fd12e038a5d158c319606`. Explicit Staging snapshot commit: `18711afc787dc48c814a63de2551ac56f4a99793`.
- GitHub light CI `33959147061` PASS. Vercel Preview `dpl_5XMFuB4p4VWyKBxyA5ML36ucc6D7` READY and generated 2 Care SEO pages.
- Hosted protected acceptance PASS 2/2 EN/ZH pages; `X-Robots-Tag: noindex` and page `noindex,follow` retained. Canonical/hreflang use the feature branch alias; source Care version is 2.
- A paid Supabase Staging branch/project is not required for this acceptance path. Production/index/main remain locked and untouched.

## 2026-09-05 Care SEO release-readiness gate closeout
- `c1f4f35a3d4135f0b1312d655f1bbab258dcc98c` adds a fail-closed release-readiness contract; it performs no Production write and cannot toggle indexability.
- Closed a bypass found during audit: the Staging static builder now rejects `index` even if `staging-snapshot.json` is hand-edited; Staging sitemap remains non-indexable.
- `7ba66f9d9d0610d3be3e5ec121f3e157004849d2` is the snapshot-only republish using the new gate. Vercel `dpl_3knobTC9R84wkVfaVsCZrPnnrXrp` is READY; protected hosted acceptance passed 2/2 EN/ZH pages with noindex retained.
- `cbc4cdd0b2b1f5939dfb93abd9f3c7c28286f9d9` records non-secret `content/care-seo/staging-acceptance.json`, bound to the exact snapshot SHA-256, snapshot Git SHA, deployment ID and canonical base. Evidence-only Vercel deployment was correctly skipped by the ignore-build guard.
- `npm run check:care-seo-release-readiness` now resolves the accepted snapshot/evidence and returns `readyForProductionIndex: false` with the single blocker `explicit_human_release_decision_required`. No `release-decision.json` was created.
- Snapshot CI `33961210274` and evidence-only CI `33961337300` both passed all lightweight gates including release-readiness; Heavy skipped. Production, index, main and live DB remain untouched.

## 2026-09-05 Care SEO AI advisory closeout
- AI advisory is implemented behind authenticated Admin: Published snapshot/version only, deterministic source-gap/source-drift checks, SEO-only schema output, forced noindex and no persistence until explicit Save Draft.
- UI shows source extraction, search intent/key terms, safety boundaries, conflicts, impact explanation and review warnings; “apply” is local-form-only.
- Final accepted Preview `dpl_Fx1NEVe7safjqmte2QPY6zvPQB5D` from snapshot `fd960667`; hosted verifier PASS 2/2 and branch-alias canonical/hreflang remain exact.
- `5899d643` binds acceptance + `hold_noindex`; readiness is intentionally false with blocker `release_decision_hold`.
- Latest light CI `33962944072` PASS; Heavy skipped. Production/main/live DB untouched.

## 2026-09-05 — SEO Admin usability / acceptance override
- Active scope is `feature/admin-content-v0` Species SEO Admin, not AquaGuide fish-tank UI and not Draft PR #144 reconciliation.
- UI checkpoint `843b9e31`: one `当前下一步` action, reduced duplicate topbar tools; Admin contract/root build and 1440/390 read-only browser checks PASS.
- Safe `?demo=1` mode is localhost/Cloudflare-Pages-only and hard read-only.
- Vercel currently reports free-plan build-rate limit for new deployments; existing Production/index state is unchanged and no paid upgrade is authorized.
- Next: verify the new exact-SHA Cloudflare `/admin/seo/?demo=1` entry and use it as the user acceptance URL.

## 2026-09-05 — hosted SEO Admin demo verified
- Current feature HEAD `ca6dda1c`; CI `33970948642` SUCCESS.
- Stable SEO-only acceptance URL: `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1`.
- Exact-SHA URL: `https://8e1a3de3.aquaguide-frontend.pages.dev/admin/seo/?demo=1`.
- 1440/390 hosted browser checks PASS; Demo is hard read-only and exposes no enabled Save actions.
- Vercel `admin-content` is READY for the same code, but writable Repo Admin credentials are not configured in that independent project; do not describe it as writable yet.
## 2026-09-05 — SEO Admin interaction feedback checkpoint
- Stateful UI selection is now explicit rather than subtle: workflow stages distinguish system attention from operator selection.
- Species/Base selection, workflow filters, editor scope and locale controls expose persistent selected styling and `aria-pressed` state.
- Screenshot-driven correction supersedes the previous strong-row selection treatment: normal Species selection is now shown only in the existing 16×16 square radio; no extra ✓ badge is inserted into the text grid. Batch mode switches the same slot to checkbox semantics. 1440/390 checks confirm left-aligned text, 16×16 controls and zero overflow.
- Current-page vs Base-template editing uses plain-language context (`当前物种页面` / `基础模板`) and impact copy; the ambiguous `页 / 模` glyph badge has been removed. Read-only Demo says only `只读演示 · 不会写入`.
- This remains Species SEO Admin-only work on `feature/admin-content-v0`; PR #144 reconciliation stays parked.

## 2026-09-05 — SEO Admin focus/layout state
- Workflow is now a permanent Progress Navigation bar: `current / 4` + four clickable stage buttons + current-action CTA. Current system stage is solid Green; clicked queue selection is a separate outlined state. The bar uses its own neutral surface + strong divider above the white editor canvas; no expand/focus control exists.
- Desktop workspace gains 196px vertical space in Focus; 390px gains 312px and focused editor controls are 46px high. Production/main/index/live DB remain untouched.
## 2026-09-06 — strict CMS visual system
- Species SEO Admin now has one visual authority: Graphite neutrals + White/paper + Green `#2F6F4E`; no additional semantic hue is allowed. Preview is hidden by default and opens from the always-visible `效果预览` control as an in-workspace overlay drawer.
- Computed-style scan PASS at 1440×900 and 390×844 for initial UI and all six advanced tools (`发布资格 / 批量审核 / 批量内容审核 / SEO 模板导入 / 版本历史 / 任务队列`): extra saturated hue count `0`, horizontal overflow `0`.
- Type hierarchy PASS: desktop 24/18/15/13/12/10px and mobile 22/17/14/12/11/10px; Focus editor bar remains 48px desktop / 46px mobile.
- Admin contract + Repo backend/API routing + controlled Preview + root build remain PASS locally. Main/Production/index/live DB untouched; Care SEO stays `hold_noindex`.

## 2026-09-06 — current-page review status separation
- Variant/Base `审核进度 / 关键操作` is no longer inside the 760px editor panel. `PageReviewStatusBar` is a full-width control strip above editor content.
- Desktop browser acceptance: review bar width 1170px vs editor 760px; after 673px editor scroll the review bar remains sticky while content scrolls away.
- Mobile: standalone review bar remains separate; sticky editor toolbar continuously exposes `审核 1/3 · 编辑中`, avoiding nested-sticky overlap. 1440/390 horizontal overflow remains 0.
- Admin contract and root build PASS; Production/main/index/live DB remain untouched.

## 2026-09-06 — split Preview / locale consistency
- Local 1440 acceptance: editor 1170px closed -> 742px + 420px Preview open; drag verified 654px editor + 508px Preview; Preview remains open after selecting H1 in inspector; overflow 0.
- Local 390 acceptance: editor remains 390px; Preview opens as 374px fixed overlay; overflow 0.
- Unified locale acceptance: English workspace + content selector => `lang=en`, core chrome Han count 0; Chinese => `lang=zh-CN`, no ordinary English state-label leakage in scanned chrome.
- Admin contract and full root build PASS. Production/main/live DB untouched.

## 2026-09-06 — full Admin locale cleanup
- Advanced-tool runtime localization acceptance now covers Publish Readiness, translation, duplicate review, bulk editorial review, template import, revision history and work queues.
- Chinese-mode UI scan reports zero ordinary English state-label leakage (`Draft / Preview / Species / Base / Staging / Ready / Published / Production / Source / Review / Editing`) across the scanned tool controls/headings.
- English-mode UI labels/headings contain no Chinese copy; Chinese common names that remain inside duplicate evidence are authoritative source-data values, not interface labels and are intentionally preserved.
- Full Admin contract + root build PASS after updating old contract expectations that previously required mixed Chinese/English labels.

## 2026-09-06 — Admin review state UI checkpoint
- Aqua SEO Admin current-page review no longer overlays editor content; it is a separate in-flow control surface on desktop and mobile.
- Runtime demo at 1440px showed red review blocker state, green healthy sections, and yellow incomplete section simultaneously; all three semantic colors were visible from actual state, not decorative labels.
- Split Preview remained side-by-side (editor/review width 742px, Preview 420px) with 0 horizontal overflow. Mobile 390px also had 0 review/editor overlap and 0 horizontal overflow.
- Editing a healthy SEO title to a blocked acceptance/test value immediately changed field + parent section + review chrome to Error/red while Selected stayed a neutral black outline.
- No Production/index/live DB mutation is part of this UI checkpoint.


## 2026-09-06 — top review placement acceptance
- Species SEO Admin local browser now renders `Publish Progress → Current Page Review → Workspace` in document order.
- 1440: review top slot ≈61.6px; editor review descendants=0; split Preview still 742/420; page overflow=0.
- 390: review top slot ≈61px; no duplicate mobile review indicator; page overflow=0.
- Base-template switch updates the top surface from `当前页面审核` to `基础模板审核` without moving it back into editor content.

## 2026-09-06 — Data Review action-first runtime acceptance
- Local 1440 demo: Data Review drawer width 900px; decision command is fully visible in the first viewport, `确认并保存` is visible immediately, Disabled before a conclusion and Enabled after selection; command remains visible after 700px evidence scroll; overflow 0.
- Local 390 demo: action command is fully visible before evidence; confirmation state changes correctly after selection; overflow 0.
- Supporting evidence and candidate Preview now live below the command; optional notes are collapsed. Admin contract + full root build PASS.

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

## 2026-09-06 — Species SEO Admin task-prompt alignment acceptance
- Functional feature checkpoint: `01521a8c5c5152b1e7b5438e66c7a454a38f0ffb` (`fix(admin): align task prompts with inputs`).
- Task-first questions (`这个品种有什么不同？` / `主图里是什么？`) now render left-aligned directly above their guidance/input instead of inheriting legacy right-side label positioning.
- Exact-SHA hosted 1440/390 acceptance: overflow 0; editor review descendants 0; desktop split 742/420; Preview stays open across Base/Current switch; mobile Preview fixed overlay ≈374px.
- Admin contract + Repo backend/API/dual-repo + Admin build + full root build PASS. GitHub run `34029137779` validate PASS; Heavy skipped. Cloudflare exact-SHA `https://0e0f1106.aquaguide-frontend.pages.dev/admin/seo/?demo=1` PASS.
- Pre-doc-sync refs: feature `01521a8c5c5152b1e7b5438e66c7a454a38f0ffb`, main `64fa58a16a723b74621ac1db513adb1efb47e282`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence main-only 269 / feature-only 186. PR #144 remains parked; Production/index/live DB unchanged.

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

## 2026-09-06 — SEO Operations Health Layer V2 start
- Functional checkpoint `49c136bf` adds the first SEO Operations health layer above the read-only Page Registry.
- Registry entries now expose derived health severity from existing authoritative signals instead of creating a new content authority. Current checks cover unknown index strategy, unavailable source state and incomplete editorial progression.
- `/admin/seo-pages` remains read-only: no CMS/database/publication authority was added. Species remains Repo Admin authority; Care remains Published Care / Care SEO authority.
- Root build PASS after the change. Production/main/live DB/index/Care SEO hold_noindex remain untouched.
- Next implementation: expand health checks only from real available fields (Meta Title, Meta Description, H1, bilingual completeness, canonical validation, source publication state) and route priority items into existing authority editors.

## 2026-09-08 — SEO Operations Health queue local acceptance
- Local operator URL: `http://127.0.0.1:3003/admin/seo-pages`. Vite is running with `API_PORT=8788`; API is `http://localhost:8788`.
- Port 8787 belongs to `/Users/chuchu/Documents/New project/aquaguide-ui-atlas-care`; do not terminate that unrelated process just to run this worktree.
- Current local environment has no Business Admin login service, so Care health is truthfully `来源待读取`; Species Repo Admin is also independent-login required. This is an environment/auth limitation, not a Health logic failure.
- Default Health queue hides source-unknown inventory from actionable work; explicit unknown/all/search views remain available and progressive loading is 50 rows.
- 1440×900 and 390×844 local Playwright acceptance reports 0 horizontal overflow.
- Functional checkpoint `f945e9f8`; Production/main/live DB/index remain untouched.

## 2026-09-08 18:20 +08:00 — Local Species SEO CMS UI Foundation accepted technically
- Local read-only CMS: `http://127.0.0.1:3010/?demo=1`.
- Functional checkpoint: `f57cc39d3e127c34edfcb376c8e83a3d2a59c1e9`.
- 1440×900: Submit Review 40px/13px; current workflow action 36px/12px; scope/Preview 36px/12px; editor panel ~700×698; split Preview 742/420; overflow 0.
- 390×844: Submit Review 36px/11px; locale/scope 34–36px/12px; sidebar 180px; editor starts y≈413; Preview overlay ≈374px; overflow 0.
- Production/main/live DB/index remain untouched.

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

## 2026-09-08 22:01 +08:00 — Local CMS acceptance status
- Local Species SEO CMS remains available at `http://127.0.0.1:3010/?demo=1`.
- Functional UI checkpoint: `5b4be8cb20ff5bb7d0eb2dd124f26e4c2c048e8b`.
- Secondary editor hierarchy is compact: default panel ~563px desktop / ~626px mobile, one secondary SEO row, one flat utility footer, zero horizontal overflow at 1440×900 and 390×844.
- Full Admin contract/build and root build PASS. No Production publish, live DB/index mutation, or main reconciliation was performed.

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

## 2026-09-08 23:34 +08:00 — Local CMS Data Review status
- Local CMS remains `http://127.0.0.1:3010/?demo=1`.
- Data Review category-conflict and duplicate flows are evidence-first and browser-accepted at 1440×900 and 390×844 with zero horizontal overflow.
- Functional HEAD before docs sync: `fdc75d9d3150d4d6bb73b4b2d8d3b09dcf90493f`.
- No Production/main/live DB/index mutation.
## 2026-09-08 23:57 +0800 — Local CMS editor hierarchy status
- Local CMS: `http://127.0.0.1:3010/?demo=1`.
- Functional checkpoint: `02713144bd4b0ae5d0c106cfd957c29c686ed9bc`.
- Current-page editor now presents identity → current task → fields → secondary Search & Indexing; desktop/mobile browser acceptance PASS with 0 horizontal overflow.
- Production/main/live DB/index remain untouched.

## 2026-09-09 00:36 +0800 — Local CMS Preview behavior
- `http://127.0.0.1:3010/?demo=1` running.
- Desktop Preview defaults open; mobile Preview defaults closed.
- Production/main/live DB/index unchanged.

## 2026-09-09 00:57 +0800 — Top-level current-task notification
- Functional checkpoint: `6ae7112eb423235c6297c00093afad277511bfa2` (`fix(admin): surface current task notification`).
- Current task is now the first operator notification directly below the Topbar; it states the highest-priority problem, why it blocks progress and one real queue action.
- Current demo surfaces `33 个数据问题需要确认` with Amber emphasis for human confirmation. Blockers use red emphasis; Preview-ready uses Green. The bar itself remains neutral.
- The 1→4 Publish Flow no longer repeats `当前下一步`; it is stage navigation only. Clicking the notification action applies the real corresponding workflow filter.
- Browser acceptance: 1440×900 notification 54px, 390×844 notification 80px, zero horizontal overflow/no page errors. Desktop Preview remains default-open; mobile Preview remains default-closed.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. No Production/main/live DB/index changes.
- NEXT: continue operator acceptance by moving task-critical capabilities (especially Publish Readiness / task queue) out of low-frequency utility disclosure without adding another permanent hierarchy layer.


## 2026-09-09 01:32 +0800 — Operations Studio Phase 1 local status
- Functional checkpoint: `b40011efc60dca0cb77fa37631a2d08a9ca26346`.
- Root Admin `/admin/content` now renders Aqua Operations Studio task-first Operations Home.
- Current local Operations UI: `http://127.0.0.1:3003/admin/content`; this worktree API is `8788`. Species SEO CMS remains on `3010`.
- Current unauthenticated local environment correctly reports SEO `partial` and Product/Care + Compatibility unavailable; it does not invent zero-task health.
- 1440/390 browser acceptance: zero horizontal overflow / zero page errors. Full contracts/typechecks/build/diff hygiene pass.
- Production/main/live DB/index remain untouched. Next: resource-level WorkItems and exact authority deep-links.


## 2026-09-09 — Operations Studio Phase 2 local status
- Functional checkpoint: `12f6f9b94c35b709b2f64e4c19172fdbf62144fe`.
- `/admin/content` now produces exact resource-level tasks with exact Product/Care, SEO and Compatibility deep-links.
- Compatibility URL selection uses `kind=profile|pair&revision=<id>` and applies once; operator can switch afterward.
- Home surface is bounded to one primary + eleven queue rows; hidden remainder is explicitly reported and remains owned by the corresponding authority workspace.
- Current local URL remains `http://127.0.0.1:3003/admin/content`; API `8788`; Species SEO CMS `3010`. Current unauthenticated source behavior remains fail-isolated/truthful.
- 1440/390 browser acceptance: zero horizontal overflow. Full focused contracts, root/API TS, full build and diff hygiene PASS.
- Production/main/live DB/index remain untouched. Next: Phase 3 task-critical readiness / decision surfacing.


## 2026-09-09 — Operations Studio Phase 3 local status
- Functional checkpoint: `76dfc817cdebf2b6357523e31df08b123d1ed5b3`.
- Operations WorkItems now render current gate, exact next step and authority-verification note. SEO hard-blocker priority and Compatibility Impact/Regression/Evidence blockers are contract-protected.
- Local URL remains `http://127.0.0.1:3003/admin/content`; API `8788`; Species SEO CMS `3010`.
- Current headless browser is unauthenticated: it truthfully reports SEO partial and Product/Care + Compatibility unavailable. 1440/390 remain zero overflow / zero page errors.
- Populated real-task browser click-through is not yet accepted because no secure Business/Repo Admin session is attached to this browser. Do not substitute fake production state.
- Production/main/live DB/index remain untouched. Next: authenticated populated-state operator acceptance only if a secure existing session is available.

## 2026-09-09 02:55 +0800 — Operations populated-state test status
- Test checkpoint: `ae818fb9e97fc52b7241d0bfefd9303dcb45d270`. Local test `npm run test:operations-studio-ui` PASS at 1440×900 and 390×844.
- Exact Compatibility revision and Product Draft routing both PASS; zero horizontal overflow, zero page errors and zero intercepted API 5xx.
- Fixture test uses only fake local auth/session values and read-only intercepted responses. Real authenticated current-state acceptance remains pending.
- Temporary manual fixture server on port 3014 was terminated; the durable test self-manages port 4318 and leaves it closed after completion.
- Operations dev remains `http://127.0.0.1:3003/admin/content`; API `8788`; Species SEO CMS `3010`.

## 2026-09-09 09:13 +0800 — Operations authority access status
- Functional checkpoint `6ea35173fb92f69cf7eb90b97c3a56e62b713dfa` adds truthful Business Admin access-state handling to Operations Home.
- 401/no session renders `需要登录`; 403/non-admin renders `权限不足`; dependency/service failure renders `暂不可用`; partial reads remain `部分可读`.
- Current local `http://127.0.0.1:3003/admin/content` still shows Product/Care + Compatibility `暂不可用` because the local Business Admin login service is not configured; SEO is `部分可读` with independent Repo Admin requirement. This is expected environment truth, not fake zero work.
- Local real-page check: 1440px horizontal overflow 0, page errors 0. Heavy fixture browser regression also passes auth-required, forbidden, desktop and mobile exact-routing states.
- Production/main/live DB/index untouched. Real authenticated populated-state acceptance remains pending.

## 2026-09-09 10:45 +0800 — Operations source completeness
- `/admin/content` no longer presents an incomplete read as `0 个真实任务`.
- Incomplete sources produce a top recovery task when no WorkItem is known, and known WorkItems are explicitly scoped to `当前已读取优先任务` when other sources remain unreadable.
- Real local state still has Product/Care + Compatibility unavailable because the Business Admin login dependency is not configured; SEO remains partially readable. This is now visible as incomplete coverage, not an empty healthy queue.
- Local Operations Home remains `http://127.0.0.1:3003/admin/content`; Species SEO CMS remains `http://127.0.0.1:3010/?demo=1`.
- No Production/main/live DB/index change. Real authenticated current-state acceptance remains pending.

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

- Current functional checkpoint: `466025f7 fix(admin): clarify editor tool ownership`.
- Current-page/Base tool labels now follow active scope; revision history renders one matching authority only; inherited search overrides say `本页自定义`; publish readiness describes the final composed page.

- Current functional checkpoint: `6a1f1979 fix(admin): compact visible seo controls`.
- Search & indexing remains open by default but desktop height is now ~514px (from ~733px); Policy ~220px (from ~370px); mobile remains one-column and overflow-free.
