# Live Status

Updated: 2026-09-04
Canonical branch: `feature/admin-content-v0`
Operational HEAD before this sync: `4c9ec12e8f6929712d3780b06f4ef5ca93be3be6`
Latest converged functional baseline: `eff3bba3 feat(content): route published product care runtime`

## Product state
- AquaGuide product includes Species, Aquarium/Care, Compatibility and SEO acquisition flows.
- `/admin/product-content` currently exposes Product Data + Care editing/publish actions.
- `/admin/seo/` remains the Species SEO editorial/publishing subsystem.
- Compatibility runtime exists and uses reviewed evidence/rules, but no mature operator rule-management UI exists yet.

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
P1 Change Impact Preview: completed and regression-accepted. Compatibility Profile + Pair Rule Draft workflows are implemented; human Review/Approve + rule versioning/regression gate are next.

## Branch / deploy safety
- Live main: `64fa58a16a723b74621ac1db513adb1efb47e282`.
- Feature remote before this docs sync: `9dc30c48fb02f565637e09f807e0a56d882c1252`.
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
