# AquaGuide — Latest Handoff

**Updated:** 2026-08-22  
**Repository:** `chusday97/aquaguide-tank-guide`  
**Sync branch:** `agent/rc1-post-107-release-sync`  
**Release candidate branch:** `integration/aquaguide-rc1`  
**Current RC1 head:** `8d506fae4b165fdd4aed5f7a04101dc16d5d7d7f`  
**Release rule:** RC1 is code/regression clean. Do not merge RC1 to `main` or deploy production without separate explicit authorization.

## 1. Current stack state

The stacked repair line is now fully converged into RC1:

- #104 merged to RC1 via `2f07075e447778ea37229ca07ef485d8c0686d9c`.
- #105 merged to RC1 via `e5a9dd1ccc18a296075521fdd01b0407341af617`.
- #107 `Repair post-#105 RC1 evaluator drift` merged to RC1 via `8d506fae4b165fdd4aed5f7a04101dc16d5d7d7f`.
- `main` remains unchanged.
- No production deployment has been performed.

## 2. Final RC1→main release validation

After #107 merged, the real RC1→main PR (#102) re-ran the full release/UI matrix on final RC1 ancestry. **9/9 workflows passed**:

| Gate | Result | Run |
|---|---|---:|
| RC1 Release Acceptance | PASS | 32576580996 |
| Product Golden Path | PASS | 32576580976 |
| UI Interaction Repair V1 | PASS | 32576580968 |
| UI UX System Refactor V1 | PASS | 32576580986 |
| UI UX Visual QA V2 | PASS | 32576580966 |
| UI UX Golden V3 | PASS | 32576581069 |
| UI V2 Aquarium | PASS | 32576580983 |
| Navigation Context V1 | PASS | 32576580972 |
| Bundle Audit V1 | PASS | 32576580993 |

Critical closure evidence:

- RC1 Release Acceptance passed persistence contracts, canonical cloud runtime source + runtime smoke, share-report security, Admin/UI source contracts, API typecheck, production build and browser boundaries.
- Product Golden Path passed GP-001 through GP-005 on final ancestry.
- GP-002 passed the current two-stage path: read-only species detail → reveal compatibility evidence → explicitly enter the compatibility tool → explicit selection → quantity write → persisted aquarium state.
- UI Interaction browser regression passed the current `DecisionResultSurface` semantics and navigation/CTA contracts.
- UI System responsive route scan passed.
- Visual QA and Golden V3 passed without threshold weakening.

## 3. EVAL-BC-002 — CLOSED for RC code/regression

Fail-before after #105 merge:

- RC1 Release Acceptance `32575093543` — FAIL
- UI Interaction Repair V1 `32575093548` — FAIL
- Product Golden Path `32575093550` — FAIL

Root cause was evaluator drift after legitimate architecture / Result UX migrations, not a newly discovered runtime product regression.

Repair in #107 migrated assertions to current owners and semantics without changing product CSS/runtime/persistence/rules or relaxing thresholds. A temporary targeted diagnostic `32575689962` passed source contracts, runtime smoke, TypeScript/build, UI browser regression and GP-002 before the repair was merged.

Because #107 is now merged and all real RC1→main gates pass, **EVAL-BC-002 is closed for the release-candidate code/regression layer**.

## 4. Permanent product/security baseline

The #107 final head also passed the permanent child gates before merge:

- Production Security Boundary V1 — PASS `32576188012`
- Dependency Release Baseline V1 — PASS `32576188054`
- Compatibility Stage Risk V1 — PASS `32576188009`
- Plant Roster Edit Fix — PASS `32576188004`
- Result UX V1 — PASS `32576188011`

Production dependency audit remains **0 findings**. The full developer/build graph still contains 12 dev-only findings (7 high / 2 moderate / 3 low), tracked as tooling debt rather than production-runtime release findings.

## 5. Product baseline carried forward

- deterministic compatibility and life-stage risk remain authoritative;
- AI cannot override hard safety decisions;
- Tank Copilot has separate schema, deterministic-safety and usefulness contracts;
- missing blocking tank facts outrank subjective preference questions;
- model omissions cannot erase deterministic safe/adjustable candidates;
- plant roster edit remains covered;
- share-report server-secret boundary remains covered;
- Care wide-desktop layout recovery remains covered;
- narrow-desktop Aquarium uses `Today → Context → Manage`, while phone remains task-first;
- Species Detail browsing is read-only with respect to compatibility selection;
- identification uncertainty requires explicit confirmation;
- exact return context remains covered across cross-route tasks.

## 6. Backend/runtime boundary

Phase 1 authoritative path remains:

`frontend → api client → apps/api/src → Vercel Functions → Supabase / AI / Resend`

Known legacy bridges still exist:

- `api/ai/chat.js -> server/index.mjs`
- `api/v1/health.js -> server/index.mjs`

Do not remove them before Phase 2 consumer inventory and one-bridge-at-a-time migration.

## 7. Release status: code clean, production not yet proven

**Current classification:** `release-candidate clean` for repository code, browser regression and synthetic release acceptance.

This is **not** the same as `production-ready` because the real deployed environment has not yet been accepted.

Still required before production release:

1. representative live-provider Tank Copilot usefulness evaluation;
2. production env/secrets verification, including Supabase/Auth/persistence, `SHARE_TOKEN_SECRET`, `WEB_BASE_URL`, AI provider/fallback and Resend/share-report configuration;
3. real deployed RC1 Post-Deploy Smoke requiring frontend HTML, `/api/v1/business-health` JSON, `databaseConfigured=true`, and JSON 404 for unknown `/api/v1/*`;
4. post-deploy golden-path acceptance on the actual release URL.

## 8. Next execution order

1. Keep RC1 frozen from new feature work while release readiness is evaluated.
2. Run live AI usefulness cohort and record fail/pass cases separately from deterministic safety.
3. Prepare production environment matrix and deployment checklist.
4. Only after explicit deployment authorization, deploy RC1 and run Post-Deploy Smoke + production golden paths.
5. If production acceptance is green, make the separate RC1→`main` release decision.
6. Then proceed to legacy server Phase 2 and Knowledge Engine work.

The immediate objective is no longer stack convergence. It is **prove the same clean behavior against the real provider and real production environment without weakening deterministic safety or release gates**.
