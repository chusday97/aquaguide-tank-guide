# AquaGuide — Latest Handoff

**Updated:** 2026-08-22  
**Repository:** `chusday97/aquaguide-tank-guide`  
**Active branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1` (Draft / open / mergeable / unmerged)  
**Parent:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Release rule:** do not merge to `main` or deploy production without explicit authorization.

## 1. Current verified release baseline

Latest fully verified post-remediation head: `74738962b3f23631b48973b6d7467276789b4241`.

Permanent gates on that head:

- Production Security Boundary V1 — **PASS**, run `32573206862`
- Dependency Release Baseline V1 — **PASS**, run `32573206901`
- Result UX V1 — **PASS**, run `32573206841`
- Compatibility Stage Risk V1 — **PASS**, run `32573206824`
- Plant Roster Edit Fix — **PASS**, run `32573206969`

The dependency-security P0 is therefore **closed for the current feature-branch release baseline**: production audit is clean, and the same descendant head also passes normal product/browser regressions.

## 2. Dependency-security repair completed

### Before remediation

`npm audit --omit=dev` and the full audit both reported:

- 18 total findings
- 10 high
- 6 moderate
- 2 low
- 0 critical

The original production audit therefore could not be dismissed as dev-tooling noise.

### Remediation landed

Landed dependency commit: `5c277cec1f99f5bb507b7d50b2018d5d571ef0f1`.

- `react-router-dom`: `^7.14.1 → ^7.18.2`
- root `express`: `^4.21.2 → ^4.22.2`
- `apps/api` `express`: `^4.21.2 → ^4.22.2`
- `vite`: moved to `devDependencies` and raised to `^6.4.3`
- build-only packages moved out of production dependency classification: `@tailwindcss/vite`, `@types/three`, `@vitejs/plugin-react`, `shadcn`, `vite`
- transitive `dompurify` lock resolution advanced to patched `3.4.14` in the validated graph

Validated remediation candidate run `32572924271` passed `npm ci`, TypeScript, production build, ancestry tracing, and audit summarization. Candidate production audit was **0 findings**; full audit remained **12 dev-only findings** = 7 high + 2 moderate + 3 low.

A one-time writer then reproduced and landed the exact remediation only after requiring install/types/build plus zero production findings. Apply run `32573063116` passed, and its workflow self-deleted in the same landed commit.

Commit `8bd327bf69d7a7b74d9ff91f601accddc0ffe7cb` then converted the dependency check into a permanent read-only release gate. Future #105 heads install the locked graph, run lint/build, summarize audits, and block release if production high/critical findings reappear.

The 12 remaining full-audit findings stay visible as dev/build tooling debt, mainly under `shadcn → @modelcontextprotocol/sdk` and build chains. They are not production-runtime blockers under the corrected manifest and are not being blindly auto-fixed.

## 3. Product correctness/UI baseline carried forward

The same verified head preserves the prior product contracts:

- Care wide-desktop actionable guide no longer collapses into the 340/850px legacy corridor.
- Aquarium narrow desktop preserves `Today → Context → Manage` while phone task ordering remains unchanged.
- deterministic compatibility and life-stage risk boundaries remain authoritative.
- plant roster edit regression remains covered.
- share-report secret/readiness contract remains covered.
- AI remains explanatory/candidate evidence; it does not override deterministic hard-safety decisions.

Result UX browser verification continues through Diagnosis, Compatibility, Knowledge, Procedure, Species Detail, Layout Recovery, Identification, and Tank Copilot.

## 4. Backend/runtime boundary

Phase 1 authoritative path remains:

`frontend → api client → apps/api/src → Vercel Functions → Supabase / AI / Resend`

Known legacy bridges still exist and must not be removed before consumer proof:

- `api/ai/chat.js -> server/index.mjs`
- `api/v1/health.js -> server/index.mjs`

## 5. Remaining release risks

1. **Stack convergence is now the next blocker.** #105 remains stacked on #104; no merge/retarget sequence has been authorized.
2. **Production smoke is not complete.** Repository/CI correctness is not proof that real production env variables, auth, persistence, share links, AI provider, Supabase, or Resend are configured correctly.
3. **Dev/build dependency debt remains.** Full audit still has 12 dev-only findings; manage this separately from production runtime risk.
4. **Legacy server Phase 2 is not started.** Consumer inventory is required before bridge removal.
5. **Knowledge Engine remains planned, not implemented.** Do not jump to vector retrieval before provenance, trusted ingestion, and evaluation exist.

## 6. Next execution order

1. **Stack convergence** — only after explicit merge authorization: review/merge #104, retarget #105, inspect ancestry/conflicts, rerun all permanent gates.
2. **Production readiness** — only after explicit deployment authorization: verify env/secrets and execute post-deploy golden paths.
3. **Legacy server Phase 2** — inventory consumers, add regression contract, migrate one bridge at a time.
4. **Knowledge Engine** — `P0 provenance/version schema → P1 trusted ingestion/freshness → P4 evaluation baseline → P2 hybrid retrieval → P3 grounded result/citations → P5 knowledge ops console`.

Do not add broad new feature scope before stack convergence and production readiness are resolved.
