# Current Goal


## CURRENT OVERRIDE — 2026-09-10 Operator UX convergence
The active objective is **finish real Aqua Operations Studio editor acceptance on top of the durable local data layer**. Functional checkpoint: `1c78ef14`.

Completed in the current local-first / UX phase:
1. Durable Local File authority + recovery safety remain complete (`746d5c66`, `f501a69d`).
2. Data Review decision basis is converged (`2fcba840`): read-only evidence → human conclusion → explicit Canonical choice when needed → final-result summary → one confirmation.
3. Edit action hierarchy (`b3ec2d8e`) centralizes save/review in the top Review bar and keeps core Search & indexing visible.
4. Tool hierarchy (`b6c44a62`) separates contextual page tools from global Operations.
5. Top workflow chrome (`bf85231b`) remains <=140px desktop/mobile.
6. Ownership clarity (`a9a54bc9`, `466025f7`): Preview is final Base + current-page composition; active Base/current-page tool/history authority is explicit; generic `单独修改` is replaced by `本页自定义`.
7. Visible SEO density (`6a1f1979`): required Search/indexing controls remain expanded while inherited SEO rows and route/policy controls are compacted; desktop full SEO section is ~514px.
8. Responsive Preview (`d1af2c08`): >=1051px uses side-by-side with editor >=480px; medium Preview defaults 340–360px; <=1050px uses closed-by-default/on-demand overlay. Multi-width browser regression PASS.
9. Responsive regression hardening (`c258640b`): editor/panel no-overflow and >=180px policy-control readability are now permanent browser guards.
10. Global topbar simplification (`1ea56f60`): Activity history moved under Operations with unread preservation; mobile topbar reduced from five actions to four.
11. Publish Center hierarchy (`3cb4a569`): timeline is primary, event detail is explicit-on-selection, readiness/source summaries are compact, and Capability/Permission live in one secondary boundary disclosure. Real 390px/1280px UI regression PASS.
12. Product/Care editing priority (`448bfcd8`): mobile record navigation is compact, full catalog is desktop-only, main fields render before Impact/Before-After/Compatibility/Care SEO review references, and dirty publish explicitly requires Save first. Full authority UI + Local Business + root build PASS.
13. Downstream review visual semantics (`340cbfd3`): Care SEO and Content Impact now follow Graphite/White/Green with Amber reserved for human-review/decision states; violet/indigo/sky parallel themes are contract-blocked. Care SEO projection/editorial/AI + full Admin UI + Local Business + root build PASS.
14. Compatibility review hierarchy (`89b6863a`): Profile/Pair no longer use separate indigo/violet authorities; revision states now map to neutral/Amber/Green/Red semantics, approve is Amber, publish remains Green, regression is neutral reference, and the authority summary is compact. 390px summary <=120px and Profile editor <500px are regression-guarded.
15. Operations Home density (`ee41c214`): task-first coordination is preserved while ready-source detail, workspace cards and duplicated recent-release history are compacted. 390px total page height improved ~1833→1373px; exact Product/Care and Compatibility deep-links remain regression-guarded.
16. Cross-workspace task continuity (`24097c4b`): Product/Care and Compatibility preserve Operations return context through Router state; standalone Species SEO uses a same-host `/admin/content` URL return contract. Returning locates/highlights the original task or explains that it left the current queue.
17. Operations queue repetition cap (`35134b0d`): repeated low-priority attention rows with the same authority/severity/gate expand at most three times on Home; hidden counts stay visible by authority and underlying WorkItems remain unchanged.

18. Task-completion closure is proven (`fcc86c0d`): a Product Draft publish and a Compatibility Profile reviewed publish both return to refreshed Operations, remove the completed task from the queue, and expose the next current priority without a manual refresh.
19. SEO task actions are exact (`258a5d0d`): generic page actions are replaced by blocker-specific labels such as `补齐 H1`, `设置 Index 策略`, `修正 Canonical`, `开始人工审核` and `重新审核 SEO`.
20. Care SEO deep-links are operational (`7799d88a`): `seo=1` now focuses the hydrated Care SEO Editorial workspace at 1280/390 instead of merely opening the Care record.
21. Authority targets match the stated action (`f79802b5`): `source_not_published` returns to the Care source editor with `seo=1` removed; true SEO issues retain downstream SEO focus.
22. Legacy Care snapshot repair is operational (`1c78ef14`): `source_not_snapshot` returns to Product/Care, exposes a dedicated admin-only immutable snapshot repair action, preserves Care content/status/version, fails closed when publication storage is unavailable, and clears the repair context after success. Exact Product/Care deep-links are also guarded against duplicate-load selection races.
23. Compatibility pre-publish check repair is operational (`298f5810`): pending/approved revisions missing Impact / Regression / Canonical Evidence expose one executable repair path. Repair recomputes only review artifacts; approved revisions are reset to `pending_review` and require a fresh human approval before publish.
24. Bilingual SEO task targeting is exact (`44082ee0`): `missing_bilingual_pair` opens the actual counterpart locale; review-ready counterparts go directly to human review. A counterpart authority that is not writable (for example Local Care English) no longer creates a fake bilingual WorkItem.
25. Compatibility publish-gate checking is executable (`6d01980a`): approved revisions blocked by DB/runtime baseline mismatch expose a read-only `重新检查发布资格` action; refresh never mutates the revision and publish only appears after authority alignment is restored.
26. SEO task completion closure is browser-proven (`393f52f7`): an exact Care SEO task goes Operations → focused SEO authority → Draft → review → human approval → contextual return; the completed SEO task is absent from refreshed Operations and the next priority is immediately visible.

NEXT milestones:
1. Current Product/Care, Compatibility and SEO WorkItem action→target→return loops are closed. Do not add more WorkItem machinery unless a concrete reproducible operator dead-end is observed.
2. Preserve durable data authority, centralized review boundary, explicit ownership, compact visible SEO and Preview editor-width budget. Staging/main reconciliation stays separately gated.

Supabase Staging, branch reconciliation, Production unlock and indexing remain parked/separately gated.

Updated: 2026-09-10
Canonical repo: `chusday97/aquaguide-tank-guide`
Branch: `feature/admin-content-v0`
Broader architecture: `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`

## Current objective
Mature Aqua Admin from a Species-SEO-focused publication tool into **Aqua Operations Studio** without breaking the already-working SEO subsystem.

P1 Compatibility Admin, P2 Unified Publish Center V1, Care SEO projection/editorial/handoff/hosted acceptance/release gate, the first AI-assisted Care SEO advisory flow, SEO Operations Health Layer V2, and the current Species SEO CMS operator-convergence baseline are complete. The explicit Care SEO release decision remains **`hold_noindex`**. The user has now returned to the broader **Aqua Operations Studio** product line. **Phase 1 Operations Home is complete at `b40011ef`; Phase 2 resource-level WorkItems + exact authority deep-links is complete at `12f6f9b9`; Phase 3 task-critical readiness gates is complete in code at `76dfc817`**. `/admin/content` is a task-first, read-only coordination surface over existing Product/Care, Compatibility and SEO authorities. Each actionable WorkItem now exposes the current gate, exact next operator step and an authority-verification note. The active next objective is authenticated operator acceptance with real current tasks; current headless local acceptance is intentionally unauthenticated and therefore cannot prove populated task click-through without a real session. Writable hosted credentials and branch reconciliation remain separate gated tasks.

## Why this is current
The Admin had the required capabilities but exposed too many simultaneous queues/tools, making the first action unclear. Follow-up operator feedback tightened the visual system further: state must be obvious **without changing information layout**, workflow chrome must stay permanently compact as a distinct Progress Navigation bar to yield space to editing/Preview, and the CMS defaults to **Graphite / White / one Green publish accent**. **Amber is the single explicit exception for controls that require human judgment / second confirmation** (for example Data Review decisions and Human Review approval queues). Ordinary warnings, navigation, selection, review readiness and decorative status must not spread Amber or introduce extra blue/purple hues; they continue to use copy, iconography, restrained borders and weight. Typography is a deliberate hierarchy rather than many near-equal micro sizes. Workflow `attention` stays separate from operator `selected`; normal Species selection remains inside the existing 16×16 square control; batch selection uses that same slot only in batch mode. `当前物种页面` and `基础模板` remain distinct contexts. Draft PR #144 reconciliation stays parked.
## Stable subsystem that must not regress
Species SEO remains Repo-backed and fail-closed:
- private Draft/review/import-batch authority;
- CSV preflight + Diff;
- evidence-based duplicate review;
- batch-scoped editorial review;
- bilingual Staging readiness;
- exact Staging allowlist + Canonical dependency validation;
- Production locked.

## Next milestones
1. [DONE locally] Define one published Product/Care read contract, inventory direct static consumers, and isolate Draft from the last Published snapshot.
2. [DONE locally] Converge Encyclopedia Product and Care Encyclopedia/Aquarium/Identify diagnosis reads onto the published runtime authority with explicit static fallback.
3. [DONE locally] Prove Product and Care Save→Publish→Preview boundaries with user-state and Compatibility isolation.
4. [DONE] Complete the 14-Species bilingual SEO batch-01 operating cycle on authenticated Preview; 28/28 hosted EN/ZH pages passed acceptance.
5. [DONE] Change Impact Preview: field classification, affected-consumer summary, decision-critical Before/After and Compatibility-result regression checks.
6. [DONE in code] Compatibility Admin: Profile + Pair Draft, structural Impact, server engine Regression, canonical Evidence resolution, human Approve/Reject, exact reviewed runtime authority and transactional versioned publish are implemented. Migrations remain unapplied to live/Production.
7. [DONE] P2 Unified Publish Center V1: read-only release/audit aggregation, detail/readiness, capability/permission boundaries, Product/Care audit history fallback and explicit-key cross-authority context.
8. [DONE in code] P2 Care SEO projection foundation: Published-Care-bound projection, protected Care facts, deterministic EN/ZH canonical + hreflang routes, and fail-closed static Staging artifact builder.
9. [DONE in code] Care SEO Editorial Draft/Review persistence + approved-only sanitized explicit Staging snapshot/handoff.
10. [DONE] Hosted bilingual Care SEO acceptance on protected Vercel Preview using the free ephemeral local Supabase source path; 2/2 EN/ZH pages passed and remained noindex.
11. [DONE in code] Release-readiness mechanics: exact snapshot SHA-256 + Vercel acceptance evidence + explicit human decision contract; Staging remains noindex and acceptance-evidence-only commits do not redeploy runtime.
12. [DONE] Explicit Care SEO decision recorded as `hold_noindex`; accepted snapshot/deployment binding is current and Production/index remain locked.
13. [DONE] AI-assisted Care SEO advisory: Published-only source extraction, conflict detection, impact explanation and SEO Draft suggestion with no auto-write/review/publish.
14. [PARKED] Dedicated feature ↔ live-main reconciliation audit exists separately; do not resume it without explicit user scope change.
15. [DONE locally] SEO Operations Health Layer V2: effective Species Meta/H1 inheritance, bilingual/Canonical checks, Published-Care snapshot-aware batch health, source drift/legacy-source checks, health filtering and authority deep-links.
16. [DONE locally] Browser/operator acceptance for `/admin/seo-pages`: 1440/390 zero horizontal overflow, priority-vs-unknown separation, health filter toggle/reset, issue copy, search and progressive 50-row loading.
17. [DONE locally] Aqua Operations Studio Phase 1: task-first Operations Home + read-only Unified WorkItem aggregation across Product/Care current Drafts, Compatibility current revisions and SEO Health, with source availability isolated and ReleaseEvent history kept secondary.
18. [DONE] Aqua Operations Studio Phase 2: resource/reason-specific WorkItems now deep-link to exact Product/Care records, Species/Care SEO editor targets, and Compatibility Profile/Pair revisions. Operations Home remains read-only and capped to one primary + eleven queue rows.
19. [DONE in code] Aqua Operations Studio Phase 3: every actionable WorkItem exposes current gate / next step / authority verification. SEO hard blockers outrank softer issues; Compatibility missing Impact/Regression/Evidence becomes a blocker instead of ordinary attention.
20. [NEXT] Authenticated operator acceptance with populated real WorkItems: verify resource titles/reasons, exact click-through for Product/Care + Compatibility + Species/Care SEO, and post-click ability to continue normal navigation. Do not shuttle secrets manually; use an existing secure session/binding only.

## Safety
No Production unlock. No blind main merge/rebase. No SEO field may become authority for decision-critical Product Data or Compatibility Rules.

## 2026-09-04 implementation state
Functional checkpoint `d6d2b37e` adds publication snapshots and Draft isolation. Public API routes now prefer the immutable published snapshot, while pre-migration published rows remain a compatibility fallback. The database migration is committed but not applied to Production. Runtime bootstrap now prefers the published Product/Care API; Encyclopedia Product plus Care Encyclopedia/Aquarium/Identify diagnosis consume that runtime catalog. Browser injection acceptance passed for zh-CN Product/Care and English Care. Production migration remains unapplied; the next P0 is a real Admin edit/save/publish → Preview proof.

## 2026-09-04 Product/Care P0 acceptance
- Controlled browser Preview proves Product and Care Save remain invisible until Publish, then advance the intended runtime consumer.
- Care hardcoded display-title overrides were corrected so published Care titles are not masked by legacy presentation maps.
- `aquarium_app_state_v1` remains byte-identical across Admin Save/Publish and before/after user Preview loads.
- Published Product hydration mutates only `runtimeFishData`; static `fishData` used by Compatibility remains unchanged.
- This closes the defined Product/Care P0 target locally. Production migration/deployment remains intentionally untouched.

## 2026-09-04 SEO operational acceptance + CI cost control
- Authenticated batch-01 completed for zh-CN and en: 14 Species × 2 locales, with durable batch scope and 14 Base groups per locale.
- One explicit Staging snapshot publish created commit `7aaeb44e02ce6b82ba35919b081945bf4d0ce1cd`; Production remained locked.
- Hosted deployment `dpl_B86KiBaD75LhGdcHMa6v8zTN6pJM` passed 28/28 page checks for metadata, H1, Product facts, canonical/hreflang, robots, CTA and content hygiene.
- CI is now split into light default checks and gated heavy Golden/Visual/evaluation/browser checks.

## 2026-09-04 Change Impact Preview first round
- `e58c7082` adds field-level impact classification for Product/Care edits.
- The editor distinguishes direct runtime consumers from independent/downstream consumers that require separate review.
- Draft impact uses the current published public detail as baseline and survives page refresh; no new authority/database path was introduced.
- This first-round note is historical; the following completion checkpoint closes Before/After and Compatibility regression. Next milestone is Compatibility Admin.

## 2026-09-04 Change Impact Preview completion
- Functional commit `9dc30c48 feat(admin): complete change impact preview`.
- Decision-critical Product edits now show Encyclopedia current-published vs ready-to-publish Before/After, including temperature, pH, tank size, water-change cycle, temperament, size, housing and feeding fields.
- Saved Product Drafts automatically run the existing species-only Compatibility engine against the current static living-species cohort; status changes and rule-only changes are both surfaced.
- Compatibility regression is explicitly simulation-only: Product publish does not mutate Compatibility evidence/rules.
- Browser regression passes at 1280/390 including save → reload persistence and publish-confirmation summary. Product/Care Save→Publish boundaries, Admin contract/build and root build remain green.
- Next milestone: Compatibility Admin.

## 2026-09-04 Compatibility Admin — Behavior Profile Draft checkpoint
- Functional commit `dfed5a94 feat(admin): add compatibility profile draft workflow`.
- `/admin/compatibility` audits the exact 7 reviewed static Profiles / 4 reviewed Pair Rules currently used by the Compatibility engine.
- Species Behavior Profile edits now use isolated `species_compatibility_profile_revisions`; create/update/submit-review never mutate `species_compatibility_profiles`.
- Drafts inherit reviewed citation snapshots only; reviewed publish is intentionally unavailable until source reconciliation and human review are implemented.
- API reports which catalog keys already have reviewed DB baselines; profiles without DB alignment remain read-only instead of failing after click.
- Migration `202609040002_compatibility_profile_revisions.sql` is committed but NOT applied to Production or any live database in this round.
- 390/1280 browser contract proves create Draft → edit → save → submit review → edit lock. API check, root lint/build, compatibility contracts and diff hygiene pass.
- Next: Pair Rule revision Draft workflow; keep reviewed runtime and Production locked.

## 2026-09-04 Compatibility Admin — Pair Rule Draft checkpoint
- Functional commit `4c9ec12e feat(admin): add compatibility pair rule draft workflow`.
- Reviewed Pair Rules now support isolated revision Draft create/edit/submit-review when the exact DB pair baseline is aligned.
- Draft fields cover verdict, risk type, reason, mitigation, basis, confidence and reviewed citation snapshots; same-species pairs are rejected.
- One active Pair Rule revision per canonical pair is enforced; reviewed runtime rows are never updated by Draft routes and no Compatibility publish endpoint exists yet.
- Browser acceptance passes at 1280/390 for create → edit → save → submit-review → edit lock. A Zod refine/omit runtime crash found during acceptance was corrected at the contract layer.
- Migration `202609040003_compatibility_pair_rule_revisions.sql` is repository-only and unapplied to live databases/Production.
- Next: reviewed rule versioning + human approval + regression/impact gate before any Compatibility publish path is introduced.

## 2026-09-04 Compatibility human review / impact checkpoint
- Functional commit `25e3ec0d feat(admin): add compatibility human review gate`.
- Submitting a Profile/Pair Draft now makes the API compare it with the current reviewed DB baseline and persist an impact report; no-change drafts cannot enter review.
- `pending_review` revisions can only move to Approved/Rejected through an explicit authenticated human action; Reject requires a note.
- Approval changes revision status only and never updates reviewed runtime rows.
- Browser 1280/390 proves submit → Impact Check → approve → Approved while editing remains locked.
- Migration `202609040004_compatibility_revision_review_gate.sql` is code-only/unapplied.
- Remaining blocker before publish: user-facing Compatibility still reads code/data reviewed evidence, so DB publish would create split authority.

## 2026-09-05 Compatibility reviewed runtime authority checkpoint
- Functional commit `1e8a482a feat(compatibility): converge reviewed runtime authority`.
- Public `/compatibility-bootstrap` exposes reviewed DB Profiles / Pair Rules only when species and evidence remain publishable/reviewed.
- Runtime switches to DB only when it exactly covers the current 7 Profile / 4 Pair reviewed baseline; partial/mismatched/unavailable DB data fails closed to the static reviewed baseline as one atomic authority.
- `tankCompatibilityEngine` now reads the runtime registry without changing decision algorithms.
- `metadata.ruleVersion` records a stable authority fingerprint covering Profile/Pair versions plus Evidence IDs/versions/membership.
- This runtime checkpoint was followed by `57c4ef00`, which closes canonical Evidence reconciliation, real server regression and versioned publish in code. Live/Production migrations remain unapplied.

## 2026-09-05 Compatibility versioned reviewed publish completion
- Functional commit `57c4ef00571c00191248948af8218f978417c949 feat(compatibility): gate versioned reviewed publish`.
- Canonical reconciliation covers 13 reviewed Evidence sources, 7 Profiles and 4 Pair Rules with fail-closed drift detection; migrations `202609050001/0002` remain repository-only and unapplied live.
- Submit Review resolves canonical Evidence and runs the real Compatibility engine before/after against the Product runtime cohort; Profile changes evaluate the full cohort (486 catalog rows → 1455 pair-direction scenarios in the current runtime), while Pair Rules evaluate the explicit pair in three scenarios.
- Regression reports carry authority sequence, engine version, Product catalog fingerprint and semantic digest. Approve and Publish recompute freshness; Product/Compatibility/Evidence changes invalidate stale reports.
- Versioned publish is an atomic DB RPC gated by structural Impact + regression + canonical Evidence + human approval + unchanged baseline/evidence/authority sequence. Admin and user runtime share the same reviewed authority loader and refresh after publish.
- Online light CI run `33909317349` PASS including `Compatibility server regression gate`; Heavy browser/SEO gate skipped. Production/main/live DB remained untouched.
- First unfinished milestone is P2 Unified Publish Center / release history & audit.
## 2026-09-05 P2 Publish Center architecture inventory
- P1 Compatibility Admin is closed in code at functional checkpoint `57c4ef00`; docs checkpoint `a1242eb0` made P2 the canonical next milestone.
- First P2 implementation is deliberately read-only. Product/Care + Compatibility remain Business API/Supabase authorities, while Species SEO remains independently authenticated Repo Admin state (`content_revisions`, `activity`, `import_batches`, Staging snapshot).
- Do **not** migrate SEO history into Supabase or create a fourth publication database merely to make the UI look unified.
- Next code task: define a normalized `ReleaseEvent` read model, aggregate the three existing release sources with per-source auth/availability status, then render `/admin/publish-center`.
- No Production/main/live-database mutation is part of this first Publish Center round.

## 2026-09-05 P2 Unified Publish Center — read-only checkpoint
- Functional commit `f1b7adae feat(admin): add unified publish center read model`.
- Added shared `ReleaseEvent` / source-status contract, authenticated Business Admin `GET /api/v1/admin/releases`, independent SEO Repo Admin read adapter, and `/admin/publish-center`.
- Product/Care + Compatibility remain Business API/Supabase write authorities; SEO remains Repo Admin / `admin-store.json`. Publish Center performs no cross-authority writes.
- Product/Care source is explicitly marked `current_only` because `content_publications` stores one current Published snapshot per resource; Compatibility exposes revision history and SEO exposes activity/revision/import/Staging history.
- SEO auth is independent: when Repo Admin is not logged in the Publish Center shows `auth_required` while Product/Care + Compatibility continue to render.
- PASS: read-only contract, API TS, root lint/build, 390/1280 Publish Center browser flow, existing Admin Hub/Product/Care browser regression, Repo Admin contract.
- CI policy preserved: read-only contract runs in lightweight CI; Publish Center Playwright runs only in Heavy Gate.
- Next: read-only release detail/readiness drill-down before any cross-domain write orchestration. Production/main/live DB untouched.

## 2026-09-05 Care SEO projection + static handoff closeout
- `108a4400` binds Care SEO projection to the last Published Care snapshot/version; Care Draft facts never become SEO source.
- `d6d267c3` adds standalone Care topic canonical pages while preserving legacy `/care?topic=...` Dialog behavior.
- `8104a1b2` completes deterministic bilingual SEO routes (`/care/<key>.html`, `/zh/care/<key>.html`, x-default→EN), route-owned locale, canonical/hreflang/noindex SPA fallback, and fail-closed static Staging artifact generation.
- Static artifact requires bilingual pairing, equal Published Care source version, approved editorial and non-Production staging destination; ordinary builds without an explicit snapshot skip generation.
- Online light CI `33955509807` PASS; Heavy skipped by policy. Production/main/live DB untouched.
- Historical note: Editorial Draft/Review, sanitized Staging snapshot and hosted acceptance are now complete; do not reopen them unless a regression is proven.

## 2026-09-05 Care SEO Editorial / Staging handoff checkpoint
- `a2caf575` persists isolated Care SEO Editorial revisions with explicit Draft → Review → human Approved transitions and source-drift invalidation.
- `6079b6d4` adds approved-only sanitized Staging export, immutable publication-snapshot enforcement, bilingual same-version binding, noindex retention, explicit snapshot-only build routing and hosted verifier.
- Local HTTP end-to-end hosted verifier PASS: 2/2 bilingual pages. Online lightweight CI `33958334178` PASS; Heavy skipped.
- Historical note: a persistent non-Production Supabase branch was initially treated as a blocker, but the later accepted free ephemeral-Supabase path closed hosted acceptance without paid infrastructure.

## 2026-09-05 Care SEO hosted Staging acceptance closeout
- Free acceptance path proven: ephemeral local Supabase → Published Care v2 → EN/zh-CN Editorial Draft/Review/Approved → sanitized snapshot-only commit → protected Vercel Preview → destroy ephemeral DB.
- Real DB acceptance exposed and fixed RFC3339 offset handling in `5d2542ac`; snapshot publish commit is `18711afc`.
- Vercel `dpl_5XMFuB4p4VWyKBxyA5ML36ucc6D7` is READY and hosted acceptance passed 2/2 pages with deployment/page noindex, exact metadata/H1, source-version, branch-alias canonical/hreflang and hygiene.
- Persistent paid Staging is optional. The next gate is an explicit Index/Production release decision; current default remains noindex and Production locked.

## 2026-09-05 Care SEO release-readiness gate closeout
- `c1f4f35a3d4135f0b1312d655f1bbab258dcc98c` adds a fail-closed release-readiness contract; it performs no Production write and cannot toggle indexability.
- Closed a bypass found during audit: the Staging static builder now rejects `index` even if `staging-snapshot.json` is hand-edited; Staging sitemap remains non-indexable.
- `7ba66f9d9d0610d3be3e5ec121f3e157004849d2` is the snapshot-only republish using the new gate. Vercel `dpl_3knobTC9R84wkVfaVsCZrPnnrXrp` is READY; protected hosted acceptance passed 2/2 EN/ZH pages with noindex retained.
- `cbc4cdd0b2b1f5939dfb93abd9f3c7c28286f9d9` records non-secret `content/care-seo/staging-acceptance.json`, bound to the exact snapshot SHA-256, snapshot Git SHA, deployment ID and canonical base. Evidence-only Vercel deployment was correctly skipped by the ignore-build guard.
- `npm run check:care-seo-release-readiness` now resolves the accepted snapshot/evidence and returns `readyForProductionIndex: false` with the single blocker `explicit_human_release_decision_required`. No `release-decision.json` was created.
- Snapshot CI `33961210274` and evidence-only CI `33961337300` both passed all lightweight gates including release-readiness; Heavy skipped. Production, index, main and live DB remain untouched.

## 2026-09-05 Care SEO AI advisory + hold closeout
- `a3f582c2` adds the Care SEO AI advisory endpoint/UI using the existing OpenAI-compatible/DeepSeek-compatible provider configuration; no new provider or key path was introduced.
- AI is advisory only: exact Published Care snapshot/version binding, legacy-source refusal, schema-validated output, deterministic source-gap/source-drift checks, forced `noindex`, and no auto-save/review/approve/publish.
- Admin browser acceptance at 1280/390 proves AI analysis and local form application do not persist Editorial state until explicit Save Draft. Local AI provider is intentionally unconfigured; Vercel Preview/Production already expose `AI_API_KEY`, and deployed health reports DeepSeek `deepseek-v4-flash` configured. No live paid model call was made in this implementation round.
- Final snapshot-only republish: `fd960667`; Vercel `dpl_Fx1NEVe7safjqmte2QPY6zvPQB5D` READY; protected hosted acceptance PASS 2/2 EN/ZH with noindex retained.
- `5899d643` binds the new hosted acceptance evidence and the existing human `hold_noindex` decision to snapshot SHA-256 `cea5def0bb343747be439deaae8ac6e23bc449483034a260c1f87fa4303c9879`.
- GitHub light CI: AI commit `33962566946` PASS; reacceptance-test fix `33962759009` PASS; final snapshot `33962809578` PASS; evidence/decision `33962944072` PASS. Heavy remained skipped by policy.
- All defined functional queue items are now closed. Next: isolated feature ↔ live-main reconciliation audit; no merge/Production/index action is authorized.

## 2026-09-05 Species SEO Admin usability acceptance status
- Simplified operator flow is hosted and ready for user review at `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1`.
- This hosted acceptance path is intentionally read-only; it is for UI/workflow validation, not content mutation.
- Independent `admin-content` writable Preview configuration is incomplete because its Repo Admin/GitHub write credentials are not bound there. Restore them only through a secure secret-binding path; do not expose or manually shuttle values.
- Current product decision required from the user is UI/operator acceptance feedback, not main reconciliation or Production release.

## 2026-09-05 SEO Admin workspace-focus / professional theme rule
- Publishing workflow is permanent compact **Progress Navigation**, not an expandable panel or ordinary information box. It stays fixed at the top and is visually separated from the white editor canvas.
- It exposes `current stage / 4`, four clickable stage buttons, completion/current/upcoming states and one current-action CTA. System progress (`aria-current=step`) stays separate from the operator's temporary queue selection (`aria-pressed`). There is no `展开流程 / 专注编辑` mode switch or interaction-driven height change.
- At that checkpoint the Admin used a blue interaction accent; this is superseded by the 2026-09-06 Green accent rule below.
## 2026-09-06 Species SEO Admin three-color / typography rule
- Visible CMS palette defaults to Graphite neutrals, White/paper and one Green `#2F6F4E` publish accent. Newest operator override (2026-09-08): Amber is allowed only for explicit human-decision / second-confirmation controls; it must not become a general warning/status color or spread to navigation. Blue/purple remain excluded from normal CMS workflow chrome.
- Runtime computed-style scans at 1440×900 and 390×844 cover the initial workspace plus all six advanced tools; extra saturated hue count is `0` in every scanned state and page overflow is `0`.
- Typography hierarchy is explicit: workflow chrome uses 8–10px navigation/status type while editor content starts at 18px section / 24px page titles on desktop (17 / 22px mobile).
- Obsolete 2026-09-05 professional-palette override was removed; Focus layout remains, while the strict design-system block is the final visual authority.

## 2026-09-06 Species SEO Admin page-review control layer
- Information architecture is now three explicit layers: global Publish Progress Navigation → current-page `PageReviewStatusBar` → content editor.
- Publish/review status is removed from the editor header. Variant and Base both use one standalone review bar with `审核进度 n/3`, Draft/Published state, review state and the current next action.
- Desktop review chrome is sticky below the 48px editor context bar; editor content scrolls independently beneath it. Mobile keeps the full standalone bar in document flow plus a compact `审核 n/3 · 状态` indicator in the sticky 46px editor toolbar.
- Contract now forbids `editor-status-cluster` regression and requires PageReviewStatusBar for both Variant and Base.

## 2026-09-06 SEO Admin split Preview + unified language checkpoint
- `效果预览` is explicit-on-demand. Desktop opens a simultaneous editor + Preview split; the editor shrinks instead of being covered, and a draggable separator adjusts the balance. Narrow screens keep an overlay Preview.
- Preview inspector navigation no longer closes Preview when routing to an editable field, so side-by-side compare/edit remains continuous.
- Interface locale and content locale are now one operator choice in the main workspace. Both top and editor language controls call the same switch action; Chinese/English may not drift independently.
- Core chrome runtime checks at 1440x900 and 390x844 show zero horizontal overflow. English chrome contains zero Han characters; Chinese chrome contains none of the ordinary English state words Draft/Preview/Species/Base/Staging/Ready.
- Technical field tokens such as SEO, H1, URL and Canonical remain canonical terms; ordinary product-state language is localized.

## 2026-09-06 Admin UX rule
- Review progress must stay visually separate from editable content and must never float over the editor.
- State color is semantic, not decorative: red = blocker/error, yellow = attention/incomplete, green = healthy/success. Neutral black/white remains the base visual system.
- New editor/control work must define interaction states beyond Default: Hover, Active/focus, Selected, Loading, Disabled, Success, Error and Empty where applicable.


## 2026-09-06 top-level review progress rule
- Current information hierarchy is now **Publish Progress Navigation → Current Page Review Progress → Workspace (Species / editor / Preview)**.
- `PageReviewStatusBar` is portaled into a top-level slot outside `.studio-editor-area`; editor content must contain zero review bars.
- The mobile duplicate `审核 n/3` editor-toolbar indicator is retired because the full review progress now stays in the top control stack.
- Keep this top review chrome compact: ~62px in current 1440/390 acceptance, with zero overlay and zero horizontal overflow.

## 2026-09-06 Data Review operator hierarchy
- `处理数据问题` must open an action-first decision workspace, not a generic content drawer.
- Required order: **需要你做的决定 → 判断依据 → 可选审核备注**. The primary confirmation action must be visible before any long evidence content.
- Desktop Data Review uses the wide drawer variant and keeps the decision command visible while evidence scrolls. Mobile keeps the same information order without sticky obstruction.
- Base CMS chrome remains neutral; red/yellow/green are reserved for real semantic health states and must not be used decoratively.

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

## 2026-09-06 — task-first prompt alignment checkpoint
- Hosted acceptance found one remaining hierarchy leak: legacy global label CSS pushed the new task questions to the far-right/negative-offset position, so the operator saw helper copy before a clearly owned question.
- `01521a8c` resets task prompts to the field's left edge above guidance/input and adds a contract guard. This is presentation-only; review state, Preview ownership, Repo authority and publish boundaries are unchanged.
- 1440/390 local + exact-SHA hosted checks pass with zero overflow. Desktop Preview remains simultaneous and survives Base/Current switches; mobile remains Overlay.
- CI `34029137779` validate PASS; Heavy skipped by low-cost policy; exact Cloudflare Preview `0e0f1106` PASS.
- Next remains Species SEO Admin operator acceptance feedback; do not resume PR #144 reconciliation without explicit user scope change.

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

## 2026-09-08 — SEO Operations Health Layer V2 local completion
- Species health resolves Variant + Base through the same `resolveEffectiveSeo` inheritance model used by the editor instead of treating raw Variant blanks as missing SEO.
- Index pages now fail on missing bilingual completion; Canonical-to-sibling validates target existence, non-self reference and same-locale indexed target. Whitespace-only Meta/H1 values are also rejected.
- Care health no longer infers publication state from editable `care_articles.status`. A batch read composes immutable `content_publications` with per-resource legacy fallback and latest bilingual Care SEO Editorial rows, preserving Published truth while a new Draft is edited.
- Care blocks legacy-only authority, source-version drift and unpublished source; noindex bilingual incompleteness remains actionable rather than falsely index-blocking.
- Health totals and priority filters are visible directly in `/admin/seo-pages`, while all writes remain in Species Repo Admin / Care SEO Editorial.
- Local validation PASS: Care SEO Editorial contract, Page Registry contract, root TS, API TS, diff hygiene and full root build.
- Next: browser/operator acceptance of this queue. Production/main/live DB/index remain untouched.

## 2026-09-08 — SEO Operations Health queue browser acceptance
- Functional checkpoint: `f945e9f86dd0790cbc7e75a57b5968adb08a94e5` (`feat(seo): complete operations health queue`).
- Default Registry view now shows only real actionable `blocked / attention` work. `unknown` source state is isolated and never counted as healthy or as an SEO to-do.
- Source-unavailable empty state explicitly explains the difference and links to the `来源待读取` filter instead of saying only that no pages exist.
- Large inventories use 50-row progressive disclosure; search intentionally reaches all states. Health issue copy is operator-facing and explains the required action.
- 1440×900 and 390×844 Playwright acceptance: zero horizontal overflow; unknown toggle/reset, all-pages mode, `sp_0001` search and progressive footer pass.
- Local Preview: `http://127.0.0.1:3003/admin/seo-pages`; this session uses Aqua API `8788` because another legacy Aqua worktree owns `8787`.
- PASS: Page Registry contract, Care SEO Editorial contract, root/API TypeScript, `git diff --check`, full production build.
- Fresh remote read: live main `d3c70dee633ed4e24bbca161d138a832012b1d40`, remote feature before this checkpoint `46418ac591a55d73bf6bf5a2ee88a8338b848b9d`, merge base `ed0cf38025652db901ee81aa697ca55b1c1584b6`, divergence at functional checkpoint **275 main-only / 198 feature-only**. No merge/rebase/Production/index/live-DB action.

## Active override — 2026-09-08 18:20 +08:00 — CMS UI Foundation
- [DONE] Establish one late-loaded UI Foundation for Species SEO CMS typography, button variants, inputs, spacing and editor density.
- [DONE] Restore primary workflow/review actions from 7–10px micro-controls to readable 11–13px controls without increasing card chrome.
- [DONE] Compress authoring space through padding/textarea/disclosure density rather than shrinking type.
- [DONE] Carry the same hierarchy into secondary tool launchers, Bulk Import and Data Review confirmation.
- [DONE] Preserve desktop split Preview, mobile overlay, zero horizontal overflow and all authority boundaries.
- [NEXT] Operator visual acceptance on `http://127.0.0.1:3010/?demo=1`; fix only concrete hierarchy badcases. After acceptance, consider deleting superseded legacy density rules instead of adding new overrides.
- [PARKED] Branch reconciliation / PR #144, Production, public indexing and Care SEO release state.

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

## 2026-09-08 22:01 +08:00 — Current CMS visual-convergence checkpoint
- `5b4be8cb` completes the current secondary-editor hierarchy pass: one `更多 SEO 设置`, template reference inline with the current task, and `辅助工具` as a flat footer utility.
- Preserve the rule: primary page task stays visible; inherited/search/indexing/tooling surfaces are progressive disclosure and must not create another persistent hierarchy row.
- Operator labels must not expose raw enums (`Noindex`, `blocked`) in the Chinese UI when a clear task-language label exists.
- Browser acceptance and full contract/build gates are green.
- NEXT: continue only concrete operator visual/interaction bad cases on the 3010 CMS; do not add a new persistent layer. Writable Preview credentials and branch reconciliation stay parked.

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

## 2026-09-08 — Current CMS acceptance refinement
- [DONE] Make Data Review evidence-first: operators must understand the evidence and authority boundary before choosing a conclusion.
- [DONE] Replace competing conclusion buttons with radio decisions and show the exact after-confirmation result before the single confirm action.
- [DONE] Clarify that `Source Data needs correction` records a blocker only; Product Data remains a separate authority and is not edited from SEO Data Review.
- [NEXT] Continue user/operator acceptance on concrete CMS badcases only; do not add new permanent hierarchy layers or reopen reconciliation.
## 2026-09-08 23:57 +0800 — Species editor PM + UI hierarchy convergence
- Active acceptance remains the local Species SEO CMS at `http://127.0.0.1:3010/?demo=1`.
- Current-page authoring hierarchy is now: Species identity → one dominant current task → explicit field task states → secondary Search & Indexing disclosure.
- Product rule: page-specific intro may be blank only when the Base template actually provides shared intro content; otherwise the editor must state that the current page or Base template still needs content.
- Continue only with concrete operator badcases; do not add another persistent hierarchy layer.

## 2026-09-09 00:36 +0800 — Preview workspace rule
- Active CMS acceptance remains `http://127.0.0.1:3010/?demo=1`.
- Desktop Preview is now default-open and persistent across Species/locale changes; operator manual close is respected. Mobile/narrow Preview remains default-closed.
- Preserve the product rule: desktop Preview is part of the primary editing workspace when it does not cover editable content, not an optional disclosure the operator must repeatedly open.
- NEXT: continue concrete operator badcases only; do not add new permanent hierarchy layers or touch main/Production.

## 2026-09-09 00:57 +0800 — Top-level current-task notification
- Functional checkpoint: `6ae7112eb423235c6297c00093afad277511bfa2` (`fix(admin): surface current task notification`).
- Current task is now the first operator notification directly below the Topbar; it states the highest-priority problem, why it blocks progress and one real queue action.
- Current demo surfaces `33 个数据问题需要确认` with Amber emphasis for human confirmation. Blockers use red emphasis; Preview-ready uses Green. The bar itself remains neutral.
- The 1→4 Publish Flow no longer repeats `当前下一步`; it is stage navigation only. Clicking the notification action applies the real corresponding workflow filter.
- Browser acceptance: 1440×900 notification 54px, 390×844 notification 80px, zero horizontal overflow/no page errors. Desktop Preview remains default-open; mobile Preview remains default-closed.
- PASS: Admin contract incl. Repo backend/API/dual-repo gates, Admin build, full root build, `git diff --check`. No Production/main/live DB/index changes.
- NEXT: continue operator acceptance by moving task-critical capabilities (especially Publish Readiness / task queue) out of low-frequency utility disclosure without adding another permanent hierarchy layer.


## 2026-09-09 01:32 +0800 — Aqua Operations Studio Phase 1
- Functional checkpoint: `b40011efc60dca0cb77fa37631a2d08a9ca26346` (`feat(admin): add operations studio work queue`).
- `/admin/content` is now **Aqua Operations Studio / 运营工作台**, not a launcher card wall. Persistent hierarchy is current priority task → work queue → authority source status → authority workspaces → recent release/audit activity.
- Added a read-only Unified WorkItem model over existing authorities only: Product/Care current Drafts, Compatibility current revisions, and SEO Health. Release history remains recent activity and is never inferred as current work.
- Source truth is explicit (`ready / partial / auth_required / unavailable`). Unreadable authority state never becomes a fake `0` and never blocks healthy authorities.
- Priority contract is blocker → explicit human decision → attention. Compatibility `approved` remains attention until real Regression/Evidence/runtime publish gates are checked.
- WorkItem aggregation has no create/update/submit/approve/publish calls and no new DB/API write authority. Every action deep-links back to the existing authority.
- Local Operations Home: `http://127.0.0.1:3003/admin/content` using this worktree API on `8788`; Species SEO CMS remains `http://127.0.0.1:3010/?demo=1`. Do not take over unrelated `8787`.
- Browser acceptance: 1440×900 and 390×844, zero horizontal overflow and no page errors. Current unauthenticated local state truthfully shows SEO partial availability and Product/Care + Compatibility unavailable instead of fake task counts.
- PASS: WorkItem contract, Product/Care Admin contract, Compatibility Admin contract, Publish Center contract, SEO Page Registry contract, root/API TypeScript, full root build and `git diff --check`.
- NEXT: Phase 2 resource-level WorkItems + exact deep-links + task-critical readiness; no centralized writes, main merge, Production unlock or live DB/index change.


## 2026-09-09 — Aqua Operations Studio Phase 2
- Functional checkpoint: `12f6f9b94c35b709b2f64e4c19172fdbf62144fe` (`feat(admin): add resource-level operations tasks`).
- Unified WorkItems are now one-resource/one-reason items rather than aggregate counts. Product/Care Drafts deep-link by exact `type + id`; SEO uses each registry entry's exact `editorHref`; Compatibility uses `kind=profile|pair&revision=<id>`.
- Compatibility deep-links auto-open and scroll to the requested revision once, then release control so the operator can manually switch revisions without being forced back.
- Operations Home shows one primary task plus at most eleven additional queue rows; remaining tasks stay in their authority workspace so the home page cannot become another 900-row registry.
- Unknown/unavailable source state still does not become a WorkItem. Approved Compatibility remains attention until Regression/Evidence/runtime gates are satisfied.
- PASS: Operations WorkItem contract, Compatibility Admin contract, Product/Care Admin contract, SEO Page Registry contract, Publish Center contract, root/API TypeScript, full build, diff hygiene, and 1440/390 zero-overflow Operations Home browser acceptance.
- NEXT: Phase 3 task-critical readiness / decision surfacing; no centralized writes, no main merge/rebase, no Production/live DB/index change.


## 2026-09-09 — Aqua Operations Studio Phase 3
- Functional checkpoint: `76dfc817cdebf2b6357523e31df08b123d1ed5b3` (`feat(admin): surface task readiness gates`).
- WorkItems now carry `gateLabel`, `nextStep` and `verificationNote`; Operations Home renders them directly so operators can see the blocker/decision before entering an authority.
- SEO blocker selection now prioritizes real hard blockers over softer issues such as unknown index strategy. Example contract: blocked + `index_strategy_unknown + missing_h1` surfaces `缺少 H1` and its exact repair step.
- Compatibility readiness now checks structural Impact, real Regression and Canonical Evidence for pending/approved revisions. Missing checks elevate the task to blocker; approved revisions with checks remain attention until the Compatibility authority re-evaluates the live runtime baseline gate.
- Product/Care Draft tasks explicitly direct operators to inspect impact/Preview before deciding whether to publish; the last Published snapshot remains unchanged until explicit authority publish.
- Operations remains read-only and never claims Production eligibility. Final publish/index decisions stay in each canonical authority.
- PASS: WorkItem + Compatibility + Product/Care + SEO Registry + Publish Center contracts, root/API TypeScript, full build, diff hygiene, 1440/390 zero-overflow/no-page-error local Operations Home.
- Remaining acceptance gap is populated-state browser proof under a real authenticated Business/Repo Admin session. Current local Playwright environment has no configured/login session and correctly renders source unavailable/partial rather than fake tasks.

## 2026-09-09 02:55 +0800 — Populated-state acceptance coverage
- Durable Heavy-CI browser proof now covers populated Operations tasks without real credentials: exact Compatibility revision and Product Draft deep-links pass at 1440/390 with zero overflow/page-error/API-5xx.
- Checkpoint: `ae818fb9e97fc52b7241d0bfefd9303dcb45d270`. The fixture is isolated, read-only and explicitly non-production truth.
- This narrows the remaining acceptance gap to **real authenticated current-state proof** only; do not mark that gate complete until an existing secure Business/Repo Admin session is used without exposing credentials.
- Chrome Apple Events JavaScript is currently disabled, so automated reuse of the real browser session is blocked by browser configuration rather than product code.

## 2026-09-09 09:13 +0800 — Operations authority access truthfulness
- Functional checkpoint `6ea35173fb92f69cf7eb90b97c3a56e62b713dfa` fixes a real Operations Home availability badcase: Business Admin 401/403 responses are no longer collapsed into generic service-unavailable state.
- Product/Care + Compatibility now distinguish `auth_required` (no secure Business Admin session), `forbidden` (signed in but insufficient admin permission), `unavailable` (login/source dependency or service failure), plus existing `ready / partial`.
- UI labels are intentionally restrained: `需要登录` / `权限不足` / `暂不可用`; recovery copy points to the existing top-level `刷新任务` after the operator restores an authorized secure session. No fake `/login` admin flow was added.
- Heavy browser regression now proves no-session 401 and signed-in 403 states, in addition to exact populated WorkItem routing on desktop/mobile. Full focused contracts, root/API TypeScript, full build and diff hygiene PASS.
- Local real environment still truthfully shows Product/Care + Compatibility `暂不可用` because Business Admin login service is not configured there; SEO remains partially readable with independent Repo Admin auth.
- NEXT remains real authenticated current-state operator acceptance using an existing secure Business/Repo Admin browser session. Do not extract/shuttle credentials or weaken browser security settings.

## 2026-09-09 10:45 +0800 — Operations source-completeness truthfulness
- Functional checkpoint: `cab3bc5d6c23e6946dc9ca2017892b90925c3d30` (`fix(admin): scope operations task truth`).
- When no WorkItem is readable but one or more sources are incomplete, the top task now says `先恢复数据来源，再判断是否真的没有任务` instead of implying a clean queue.
- Queue totals now say `已读取任务 · 来源未完整`; unreadable sources are never represented as zero work.
- When a concrete WorkItem exists while any source is incomplete, it is labeled `当前已读取优先任务`, with an explicit note that priority is scoped to readable sources only.
- Source recovery uses neutral Graphite/Slate, preserving Amber exclusively for human judgment/second-confirmation semantics.
- Mobile recovery action scrolls to the existing source-status section; no new login/write authority was introduced.
- NEXT remains real authenticated Business/Repo Admin current-state acceptance using only an existing secure session. Production/main/live DB/index and PR #144 remain parked.

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

6. Ownership clarity (`466025f7`): current-page overrides are explicitly labeled `本页自定义`; Base/current-page utility labels follow active scope; history shows only the active scope authority; publish readiness is explicitly the final composed page.
3. Continue visual hierarchy cleanup inside the editing surface: reduce competing cards/colors and keep the primary authoring task visually dominant without hiding required controls.

7. Visible SEO density (`6a1f1979`): required Search/Index controls remain expanded, but inherited fields use compact source rows; desktop Policy uses two columns; redundant Production lock copy is removed.
4. Audit authoring typography and reduce near-duplicate font tiers that make the page feel visually noisy, while preserving readable task/field/meta hierarchy.
