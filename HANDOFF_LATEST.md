# AquaGuide — Latest Handoff

**Updated:** 2026-08-22  
**Repository:** `chusday97/aquaguide-tank-guide`  
**Active branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1` (Draft / open / mergeable / unmerged)  
**Parent:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Release rule:** do not merge to `main` or deploy production without explicit authorization.

## 1. Current verified release baseline

Latest fully verified product-code head: `e4068dc805422ed4bf797d5223ad0bdd44c2835f`.

Permanent gates on that head:

- Production Security Boundary V1 — **PASS**, run `32573927291`
- Dependency Release Baseline V1 — **PASS**, run `32573927275`
- Compatibility Stage Risk V1 — **PASS**, run `32573927293`
- Plant Roster Edit Fix — **PASS**, run `32573927318`
- Result UX V1 — **PASS**, run `32573927306`

Result UX now includes a permanent **Tank Copilot usefulness contract** in addition to the existing deterministic-authority and browser regressions.

## 2. PUI-BC-059 — AI parsing could be valid but unusable

The user-visible issue was real: the previous AI path could return syntactically valid structured output while still giving the user no useful next result.

### Fail-before evidence

Head `ab5243404a3c770ce5a8ed8905008a973de37dfa`, Result UX run `32573810707` failed at the new `Tank Copilot usefulness contract` while the older Result UX contract and deterministic Copilot boundary both passed.

The failing case was deliberately simple:

- deterministic local rules already provided safe candidates;
- the model returned `selectedCandidateIds: []`;
- the model returned `restart_goal` as the action;
- the old sanitizer accepted that response because it was schema-valid and did not violate hard safety rules.

This proved the prior suite guarded **safety and shape**, but not **semantic usefulness**.

### Repair

Policy repair: `ef843ef384d09cb79d8ac7df62372e21db0241e8`.

- If required tank facts are missing, deterministic questions for size/volume, water type, temperature and filter are restored ahead of preference chatter.
- Missing required facts force `complete_tank_info` as the primary action.
- If the tank is sufficiently configured and local rules already expose safe/adjustable candidates, a model response that drops all candidates is recovered to the deterministic candidate pool.
- With usable candidates, `restart_goal` cannot remain the primary action; the next step becomes `view_safe_candidates` or an executable addition simulation.
- Recovered IDs are still restricted to the local deterministic candidate pool; AI receives no new safety authority.

Prompt repair landed in `4814e8a0b565f18d9bde7623fd4ebda68049f988`.

The model is now explicitly required to:

- parse only user-stated maintenance, experience, visual-style and target-organism preferences;
- prioritize blocking tank facts before subjective preferences;
- select at least one local candidate when the tank is ready and a candidate pool exists;
- make `planSummary` concrete by naming candidates and quantities instead of returning workflow filler such as “view candidates and decide later”;
- state required adjustments when an adjustable/caution candidate is used.

The temporary write workflow self-deleted after validation; no permanent `contents: write` workflow remains.

### Permanent regression

`Result UX V1` now runs `scripts/test-tank-copilot-usability.ts` permanently. The final normal verification head `e4068dc...` passed that contract plus the complete Result UX browser chain.

### Important boundary

Repository CI does **not** prove the quality of every live DeepSeek response. The real provider still needs configured-environment smoke/evaluation before production. What is now guaranteed at product level is narrower and important: common schema-valid but non-actionable outputs cannot be consumed blindly for the tested failure modes.

## 3. Dependency-security baseline remains closed

Production dependency audit remains **0 findings** on the current verified head. The full developer/build graph still has 12 dev-only findings (7 high / 2 moderate / 3 low) and remains a separate tooling-debt queue.

Landed dependency remediation remains:

- `react-router-dom` `^7.18.2`
- root/API `express` `^4.22.2`
- Vite dev-only `^6.4.3`
- build-only packages outside runtime dependencies
- patched transitive DOMPurify resolution

The permanent dependency release gate remains read-only and blocks production high/critical findings.

## 4. Product correctness/UI baseline carried forward

- deterministic compatibility and life-stage risk remain authoritative;
- plant roster editing remains covered;
- share-report security/readiness contracts remain covered;
- Care wide-desktop 340/850px corridor regression remains closed;
- Aquarium narrow-desktop `Today → Context → Manage` hierarchy remains closed;
- Result UX browser coverage still includes Diagnosis, Compatibility, Knowledge, Procedure, Species Detail, Layout Recovery, Identification and Tank Copilot.

## 5. Backend/runtime boundary

Phase 1 authoritative path remains:

`frontend → api client → apps/api/src → Vercel Functions → Supabase / AI / Resend`

Known legacy bridges still exist and must not be removed before consumer proof:

- `api/ai/chat.js -> server/index.mjs`
- `api/v1/health.js -> server/index.mjs`

The AI usefulness repair touched `server/index.mjs` because `/api/ai/chat` still consumes that legacy bridge. This is not permission to delete or broadly rewrite the legacy server before Phase 2 inventory.

## 6. Remaining release risks / next order

1. **Live AI quality validation** — before production, run representative real-provider cases against the configured runtime and measure usefulness, fallback, invalid JSON, timeout and contradiction behavior. Repository fixtures alone are insufficient.
2. **Stack convergence** — only after explicit merge authorization: merge/reconcile #104 first, retarget #105, inspect ancestry/conflicts and rerun all permanent gates.
3. **Production readiness** — only after explicit deployment authorization: verify production env/secrets, Supabase/auth/persistence, AI provider, Resend/share reports and post-deploy golden paths.
4. **Legacy server Phase 2** — inventory consumers and migrate one bridge at a time with regression proof.
5. **Knowledge Engine** — provenance/version schema → trusted ingestion/freshness → evaluation baseline → hybrid retrieval → grounded result/citations → knowledge ops.

Do not interpret “AI usefulness guard is green” as proof that live model quality is solved. The next AI-specific engineering task is a small, representative live evaluation set, not more prompt decoration or a new AI page.
