# AquaGuide — Latest Handoff

**Updated:** 2026-08-22  
**Repository:** `chusday97/aquaguide-tank-guide`  
**Active branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1` (Draft / open / mergeable / unmerged)  
**Parent:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Release rule:** do not merge to `main` or deploy production without explicit authorization.

## 1. Current release-baseline state

The dependency-security P0 has now moved from an unclassified audit count to an evidence-based production baseline.

Landed dependency baseline: `5c277cec1f99f5bb507b7d50b2018d5d571ef0f1` (`Land production dependency remediation baseline`).

### Before remediation

`npm audit --omit=dev` and the full audit both reported:

- 18 total findings
- 10 high
- 6 moderate
- 2 low
- 0 critical

The original production audit therefore could not be dismissed as dev-tooling noise.

### Remediation landed

- `react-router-dom`: `^7.14.1 → ^7.18.2`
- root `express`: `^4.21.2 → ^4.22.2`
- `apps/api` `express`: `^4.21.2 → ^4.22.2`
- `vite`: moved to `devDependencies` and raised to `^6.4.3`
- build-only packages moved out of production dependency classification: `@tailwindcss/vite`, `@types/three`, `@vitejs/plugin-react`, `shadcn`, `vite`
- transitive `dompurify` lock resolution advanced to a patched release (`3.4.14` in the validated candidate)

The one-time writer used to land the exact regenerated lockfile self-deleted in the same commit; no permanent `contents: write` dependency-remediation workflow remains.

### Validation evidence

Dependency Release Baseline candidate run `32572924271` passed all steps, including:

- lockfile regeneration
- `npm ci`
- TypeScript lint/check
- production build
- package ancestry trace
- production/full audit summary
- artifact preservation

Validated candidate result:

- production `npm audit --omit=dev`: **0 findings**
- full audit: **12 dev-only findings** = 7 high + 2 moderate + 3 low

The remaining full-audit findings are primarily in `shadcn → @modelcontextprotocol/sdk` and build-tool chains. They remain tracked technical debt and are not hidden or mass-fixed.

The one-time apply workflow run `32573063116` completed **PASS** and produced the landed commit above after requiring `npm ci`, lint, build, and zero production audit findings.

## 2. Product correctness/UI baseline carried forward

The earlier Result UX / Layout Recovery baseline remains the product reference point:

- Care wide-desktop actionable guide no longer collapses into the 340/850px legacy corridor.
- Aquarium narrow desktop preserves `Today → Context → Manage` while phone task ordering remains unchanged.
- deterministic compatibility and life-stage risk boundaries remain authoritative.
- plant roster edit regression remains covered.
- share-report secret/readiness contract remains covered.
- AI remains explanatory/candidate evidence; it does not override deterministic hard-safety decisions.

Core browser-covered paths remain Diagnosis, Compatibility, Knowledge, Procedure, Species Detail, Layout Recovery, Identification, and Tank Copilot.

## 3. Backend/runtime boundary

Phase 1 authoritative path remains:

`frontend → api client → apps/api/src → Vercel Functions → Supabase / AI / Resend`

Known legacy bridges still exist and must not be removed before consumer proof:

- `api/ai/chat.js -> server/index.mjs`
- `api/v1/health.js -> server/index.mjs`

## 4. Remaining release risks

1. **Final gate proof on the landed dependency ancestry.** The one-time applier validates the dependency baseline itself, but the normal permanent product gates must also be green on a descendant head before P0 is considered fully closed.
2. **Stack convergence is still blocked on authorization.** #105 remains stacked on #104; no merge/retarget sequence has been authorized.
3. **Production smoke is not complete.** Repository/CI correctness is not proof that real production env variables, auth, persistence, share links, AI provider, Supabase, or Resend are configured correctly.
4. **Dev/build dependency debt remains.** Full audit still has 12 dev-only findings; treat these separately from production runtime risk.
5. **Legacy server Phase 2 is not started.** Consumer inventory is required before bridge removal.
6. **Knowledge Engine remains planned, not implemented.** Do not jump to vector retrieval before provenance, trusted ingestion, and evaluation exist.

## 5. Next execution order

1. **Close dependency P0** — rerun/confirm all permanent product gates on the post-remediation descendant head. Do not reopen broad dependency churn if production audit stays at zero.
2. **Stack convergence** — only after explicit merge authorization: review/merge #104, retarget #105, inspect ancestry/conflicts, rerun gates.
3. **Production readiness** — only after explicit deployment authorization: verify env/secrets and execute post-deploy golden paths.
4. **Legacy server Phase 2** — inventory consumers, add regression contract, migrate one bridge at a time.
5. **Knowledge Engine** — `P0 provenance/version schema → P1 trusted ingestion/freshness → P4 evaluation baseline → P2 hybrid retrieval → P3 grounded result/citations → P5 knowledge ops console`.

Do not add broad new feature scope before release-baseline and stack convergence are resolved.
