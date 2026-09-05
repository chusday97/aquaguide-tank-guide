# Live Status

Updated: 2026-09-05
Canonical branch: `feature/admin-content-v0`
Operational functional HEAD before this docs sync: `1e1414ec768580843e4f9faf2599719fbe5805c7`
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
- Current-page vs Base-template editing now has explicit `页 / 模` context cards with different accents and impact copy. Read-only Demo no longer reports `Schema 未应用`; it says only `只读演示 · 不会写入`.
- This remains Species SEO Admin-only work on `feature/admin-content-v0`; PR #144 reconciliation stays parked.

## 2026-09-05 — SEO Admin focus/layout state
- Current feature adds Workspace Focus for editor/Preview and a neutral professional CMS palette. Editor/Preview interaction collapses fixed workflow chrome; left Species navigation alone leaves the full workflow visible.
- Desktop workspace gains 196px vertical space in Focus; 390px gains 312px and focused editor controls are 46px high. Production/main/index/live DB remain untouched.
