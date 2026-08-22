# AquaGuide — Latest Handoff

**Updated:** 2026-08-22  
**Repository:** `chusday97/aquaguide-tank-guide`  
**Active branch:** `agent/rc1-post-105-evaluator-repair`  
**Active PR:** #107 `Repair post-#105 RC1 evaluator drift`  
**Base:** `integration/aquaguide-rc1`  
**RC1 head:** `e5a9dd1ccc18a296075521fdd01b0407341af617`  
**Release rule:** #105 is merged to RC1. Do not merge #107, merge RC1 to `main`, or deploy production without explicit authorization.

## 1. Current stack state

PR #104 and PR #105 are both merged into `integration/aquaguide-rc1`.

- #104 merge commit: `2f07075e447778ea37229ca07ef485d8c0686d9c`
- #105 merge commit: `e5a9dd1ccc18a296075521fdd01b0407341af617`
- comparison of `e5a9dd1c...` vs `integration/aquaguide-rc1`: **identical / ahead 0 / behind 0**

This means the RC1 branch now contains the full UI/UX System + Result UX product stack. `main` and production remain untouched.

## 2. Post-#105 merge validation exposed evaluator drift

After #105 merged, the real RC1→main synthetic validation exposed three red workflows:

- RC1 Release Acceptance — run `32575093543` — FAIL
- UI Interaction Repair V1 — run `32575093548` — FAIL
- Product Golden Path — run `32575093550` — FAIL

Investigation showed stale evaluator assumptions after earlier architectural/interaction migrations, not a newly discovered product-code regression:

1. production runtime source contract still expected `legacyApp.use('/api/v1', ...)`, while the canonical API app now correctly uses `app.use('/api/v1', ...)`;
2. UI source/browser contracts still assumed old Species Detail / Encyclopedia file ownership and the removed `[data-compatibility-verdict]` DOM structure;
3. GP-002 still assumed one-click Species Detail → compatibility drawer, while current product behavior intentionally uses two stages: reveal in-context compatibility evidence, then explicitly enter the full calculator.

This is tracked as **EVAL-BC-002**.

## 3. PR #107 repair scope

PR #107 currently changes evaluator/test code only. No product CSS, runtime behavior, deterministic compatibility logic, persistence logic, secrets, deployment policy, or production environment is changed.

Final functional repair files:

- `scripts/test-production-cloud-runtime-contract.mjs`
- `scripts/test-ui-interaction-repair-v1.mjs`
- `scripts/verify-ui-interaction-repair-v1.mjs`
- `scripts/verify-golden-path-species-to-stocking.mjs`

The temporary diagnostic workflow used during investigation was deleted after producing executable proof and is not part of the final PR diff.

## 4. Executable evidence for #107

Temporary diagnostic run `32575689962` — **PASS** end to end:

- Production cloud runtime source contract — PASS
- Production cloud runtime smoke — PASS
- UI interaction source contract — PASS
- TypeScript — PASS
- Production build — PASS
- UI interaction browser regression — PASS
- GP-002 continuous browser path — PASS

The GP-002 path still proves:

`search species → read-only detail → reveal compatibility evidence → explicitly enter compatibility tool → explicit species selection → quantity ×6 → risk confirmation when required → real persisted aquarium write`

Opening a Species Detail remains read-only and does not silently mutate compatibility selection.

## 5. Permanent gate proof on the repaired evaluator head

Verified evaluator head before this documentation refresh: `13ef3b4c2fd3c7df9fb43127da4dcf153e1bfc7a`.

Permanent gates on that head:

- Production Security Boundary V1 — **PASS**, run `32575784071`
- Dependency Release Baseline V1 — **PASS**, run `32575784098`
- Compatibility Stage Risk V1 — **PASS**, run `32575784108`
- Plant Roster Edit Fix — **PASS**, run `32575784097`
- Result UX V1 — **PASS**, run `32575784082`

Result UX includes Diagnosis, Compatibility, Knowledge, Procedure, Species Detail + parent-context return, Layout Recovery, Identification explicit confirmation, and Tank Copilot authority/usefulness regressions.

## 6. Dependency/security baseline

Production dependency audit remains **0 findings**.

Full developer/build graph still contains **12 dev-only findings**:

- 7 high
- 2 moderate
- 3 low

The permanent read-only Dependency Release Baseline gate blocks production high/critical findings. Do not use broad `npm audit fix` merely to force total vulnerability count to zero.

## 7. Product baseline carried forward

- deterministic compatibility and life-stage risk remain authoritative;
- AI cannot override hard safety decisions;
- Tank Copilot has separate schema, deterministic-safety, and usefulness contracts;
- plant roster editing remains covered;
- share-report server-secret boundary remains covered;
- Care wide-desktop layout recovery remains covered;
- narrow-desktop Aquarium hierarchy remains `Today → Context → Manage` while phone stays task-first;
- identification uncertainty requires explicit confirmation;
- Species Detail browsing remains separate from compatibility selection;
- exact return context remains covered across cross-route tasks.

## 8. Backend/runtime boundary

Phase 1 authoritative path remains:

`frontend → api client → apps/api/src → Vercel Functions → Supabase / AI / Resend`

Known legacy bridges still exist:

- `api/ai/chat.js -> server/index.mjs`
- `api/v1/health.js -> server/index.mjs`

Do not delete these before Phase 2 consumer inventory and one-bridge-at-a-time migration.

## 9. Remaining release risks

1. **#107 is not merged into RC1 yet.** The three original RC1→main red workflows therefore remain expected on the current RC1 head.
2. **Final RC1→main acceptance has not been re-proven after #107.** After a separately authorized #107 merge, rerun Release Acceptance, UI Interaction, Product Golden, and the permanent product/security gates on final ancestry.
3. **Live AI provider usefulness remains unmeasured.** Repository fixtures prove encoded behavior, not representative real-provider quality.
4. **Production smoke is still incomplete.** Preview/build green is not production proof.
5. **Legacy server Phase 2 has not started.**
6. **Knowledge Engine remains planned, not implemented.**

## 10. Next execution order

1. **#107 review state** — keep scope evaluator-only, verify final diff/gates, then make it review-ready. No merge without explicit authorization.
2. **#107 merge decision** — if explicitly authorized, merge to `integration/aquaguide-rc1` with expected head locking.
3. **Final RC1 acceptance** — rerun/observe the actual RC1→main Release Acceptance, UI Interaction, Product Golden and permanent gates on the new RC1 head. Exit criterion: no red gate and no threshold weakening.
4. **Live AI usefulness evaluation** — representative configured-provider cohort for blocking-fact priority, candidate-drop, hallucinated preference, generic-answer, invalid JSON, timeout and fallback behavior.
5. **Production readiness** — only after explicit deployment authorization: verify production env/secrets, Supabase/auth/persistence, live AI/fallback, Resend/share reports, then run post-deploy golden paths.
6. **Legacy server Phase 2** — inventory consumers, migrate one bridge at a time, regression before deletion.
7. **Knowledge Engine** — provenance/version schema → trusted ingestion/freshness → evaluation → hybrid retrieval → grounded citations/results → knowledge ops.

The immediate objective is **not new feature work**. It is to make the merged RC1 stack reproducibly clean under the actual release evaluators, then prove live-provider and production behavior separately.