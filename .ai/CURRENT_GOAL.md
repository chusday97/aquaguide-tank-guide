# Current Goal

Updated: 2026-09-05
Canonical repo: `chusday97/aquaguide-tank-guide`
Branch: `feature/admin-content-v0`
Broader architecture: `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`

## Current objective
Mature Aqua Admin from a Species-SEO-focused publication tool into **Aqua Operations Studio** without breaking the already-working SEO subsystem.

P1 Compatibility Admin, P2 Unified Publish Center V1, Care SEO projection/editorial/handoff/hosted acceptance/release gate, and the first AI-assisted Care SEO advisory flow are complete. The explicit release decision is **`hold_noindex`**. The immediate priority is now the **dedicated feature ↔ live-main reconciliation audit**, with no merge or Production action implied.

## Why this is current
The defined Operations Studio functional backlog is closed. Care SEO remains fail-closed to `noindex`, with hosted acceptance evidence bound to the exact snapshot/deployment and a human `hold_noindex` decision. AI now reads only immutable Published Care, detects source gaps/conflicts, explains editorial impact and proposes SEO-only Draft fields; applying AI only changes local form state until a human explicitly saves. The remaining project-level risk is branch divergence from live `main`, so the next safe activity is an isolated reconciliation audit before any merge decision.
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
14. [NEXT] Dedicated feature ↔ live-main reconciliation audit in isolation; do not merge main until a validated reconciliation candidate is reviewed.

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

## 2026-09-05 — live-main reconciliation candidate
- Re-read authoritative refs: feature `3dfa76af8d1493b8a7fb17e950afb7849cfb2eac`; live main `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Isolated two-parent merge candidate `6e5d9aab906390119408982ad456c50dcb588a7e` resolves 12 real conflicts while preserving main Product/Catalog/immersive UX and feature Operations Studio/SEO/AI authority boundaries.
- Compatibility now keeps Domain Rules as final decision authority and records reviewed runtime Evidence via separate `evidenceAuthorityVersion`; Admin/API regression callers use the Compatibility Service boundary instead of importing the legacy engine directly.
- Local PASS: composite build, project truth, Compatibility legacy/domain/runtime/Admin/server regression, Catalog/435-pair matrix, formal 4-module Preview with zero API/resource failures, mobile Care/Aquarium, Admin Content, Publish Center, Admin Repo contracts, local Supabase DB/schema gates.
- Draft PR #144 created from `codex/reconcile-admin-content-v0-main-20260905` to `main`. GitHub Main Convergence V1, Product Golden Path light validate and Admin Content CI Gate all passed on `6e5d9aab`; heavy suites stayed skipped by policy.
- AquaGuide Preview for `6e5d9aab` is READY at `aquaguide-cyzedovfy-chusday97s-projects.vercel.app`. The separate Admin Preview project had a branch-allowlist bug; its Vercel Build Command now also permits `codex/reconcile-admin-content-v0-main-*`, and redeploy `dpl_J5EJhtETyvKJWhpGZNTMkhjhB3YB` reached READY.
- `check:preview-parity` exposed a stale hard-coded PR #142 assumption; current change resolves the open PR by branch by default while preserving `PREVIEW_PR` override. The resolver passes against the deployed `6e5d9aab` checkpoint.
- Care SEO remains `hold_noindex`; Production, main and live migrations remain untouched. Next gate: current-HEAD Preview parity plus deliberate human visual acceptance; only then present a merge decision.

## 2026-09-05 — Preview parity no-cost fallback
- Vercel accepted `6e5d9aab` for AquaGuide/Admin Preview, then the account hit a build-rate limit on the later parity/docs-only HEAD; no paid upgrade was authorized or required.
- Cloudflare Pages check for `0470071c` succeeded and reported an exact-SHA Preview at `https://3ad8a0b0.aquaguide-frontend.pages.dev`. This is Preview evidence only and does not reactivate Cloudflare as a Production provider.
- `check:preview-parity` now resolves the current open PR by branch and accepts an exact-SHA successful Preview from either GitHub deployment/Vercel or Cloudflare Pages. It does not accept stale SHAs.
- `scripts/check-preview-parity.mjs` is classified as non-runtime for Vercel ignore-build purposes so CI-only parity changes do not intentionally consume a product build.

## 2026-09-05 — reconciliation technical closeout
- Validated functional HEAD: `5169f4fc5b4ecac337f6e7fd8b34e869e5dbc435` on Draft PR #144. Original two-parent merge checkpoint remains `6e5d9aab` = feature `3dfa76af` + live main `64fa58a`.
- GitHub current-head CI PASS: Main Convergence V1 `33967123788`, Product Golden Path `33967123846`, Admin Content CI Gate `33967123945`; heavy suites skipped by the existing cost policy.
- Exact-SHA Cloudflare Preview PASS: `https://2b65ad0a.aquaguide-frontend.pages.dev`; embedded metadata reports the exact reconciliation branch and `5169f4fc`. `check:preview-parity` PASS using Cloudflare Pages exact-SHA evidence.
- Remote browser PASS on that exact Preview: formal 4-module Preview has zero API/resource failures; mobile Care/Aquarium covers pager, recommendation, collection, tank species and care-plan flow.
- Fixed cross-platform Preview metadata so Cloudflare uses `CF_PAGES_BRANCH` / `CF_PAGES_COMMIT_SHA` and Vercel uses its native Git env before falling back to local git.
- Vercel AquaGuide/Admin builds later returned account build-rate-limit; no paid upgrade was authorized. Earlier `6e5d9aab` AquaGuide/Admin Vercel Previews are READY, and Cloudflare provides the current exact-SHA Preview. Cloudflare remains Preview evidence only, not a Production provider.
- UI freeze intentionally remains `FROZEN_PROVISIONAL`: visual-owned files differ from baseline `02457dd2...`; this requires deliberate human visual acceptance before any new freeze baseline or merge decision.
- Production/index/live migrations/main remain untouched; Care SEO stays `hold_noindex`.
