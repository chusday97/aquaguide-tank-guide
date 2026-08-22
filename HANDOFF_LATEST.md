# AquaGuide — Latest Handoff

**Updated:** 2026-08-22  
**Repository:** `chusday97/aquaguide-tank-guide`  
**Sync branch:** `agent/rc1-post-110-release-sync`  
**Release candidate branch:** `integration/aquaguide-rc1`  
**Current RC1 head:** `5e605fb7a68001ecd80096ef42f063909cf5aa03`  
**Release rule:** RC1 is code/regression clean after #110. Do not merge RC1 to `main` or deploy production without separate explicit authorization.

## 0. Latest delta — #110 merged and substrate regression closed on RC1

- #110 `Render substrate as a tank-bottom surface` merged into RC1 via `5e605fb7a68001ecd80096ef42f063909cf5aa03`.
- Product rule is now explicit: substrate is a continuous tank-bottom surface/material layer; hardscape remains object-based.
- Bare bottom stays explicit as `none`; the renderer consumes persisted `aquarium.substrate` directly and no longer invents River Sand / Coral Sand defaults.
- The previous per-grain pebble mesh cloud was removed; configured substrate keeps a full-width/full-depth bed and top surface.
- PR-head Substrate Surface V1 gate `32579395579` — PASS.
- Earlier targeted diagnostic `32579071402` — PASS for source contract, repository settings contract, TypeScript, production build and Chromium save-to-3D flow.
- Exact merged RC1 head `5e605fb7...` was also re-run locally on an isolated AquaGuide preview port and passed the browser path: `bare bottom none → choose 黑金沙 → save → repository substrate=黑金沙 → 3D data-substrate=黑金沙`.
- An initial exact-head browser retry on port 4173 timed out because that port was serving an unrelated IceGlide preview. The diagnostic showed IceGlide page content and no AquaGuide controls; re-running on isolated port 4189 passed. This is recorded as test-environment contamination, not product regression.

## 1. Current RC1 convergence state

The repair/release line is now converged into RC1 through #110:

- #104 merged via `2f07075e447778ea37229ca07ef485d8c0686d9c`.
- #105 merged via `e5a9dd1ccc18a296075521fdd01b0407341af617`.
- #107 merged via `8d506fae4b165fdd4aed5f7a04101dc16d5d7d7f`.
- #109 merged via `1e455a82a6542b7a8fb684c69da06221ef6bdba0`.
- #110 merged via `5e605fb7a68001ecd80096ef42f063909cf5aa03`.
- `main` remains unchanged by this step.
- No production deployment has been performed.

## 2. Final RC1→main synthetic release matrix after #110

The actual RC1→main validation re-ran automatically on `5e605fb7...` and finished **9/9 PASS**:

| Gate | Result | Run |
|---|---|---:|
| RC1 Release Acceptance | PASS | 32579834369 |
| Product Golden Path | PASS | 32579834368 |
| UI Interaction Repair V1 | PASS | 32579834400 |
| UI UX System Refactor V1 | PASS | 32579834362 |
| UI UX Visual QA V2 | PASS | 32579834402 |
| UI UX Golden V3 | PASS | 32579834371 |
| UI V2 Aquarium | PASS | 32579834499 |
| Navigation Context V1 | PASS | 32579834412 |
| Bundle Audit V1 | PASS | 32579834439 |

No visual/browser threshold was lowered to obtain this result.

## 3. PUI-BC-060 — CLOSED on RC1

**Saved substrate was not visibly applied to the 3D aquarium.**

Root causes:

1. the renderer silently substituted a default substrate when the saved value was empty;
2. substrate semantics were mixed with discrete decoration/grain meshes;
3. there was no stable runtime marker proving which persisted substrate the 3D renderer consumed.

Closed behavior:

- `none` means bare bottom;
- saved substrate is the renderer source of truth;
- substrate fills the floor as a continuous layer;
- hardscape remains discrete objects;
- settings persistence and 3D consumption are covered by one browser path.

Status: `regression_verified` on actual RC1 ancestry.

## 4. #109 production-bundle baseline remains preserved

#109 reduced the two legacy Vercel bridge bundles without changing the canonical API bundle:

- `/api/v1/health` — 1.13 MB
- `/api/ai/chat` — 1.13 MB
- canonical `/api/v1/[...path]` — 40.13 MB

The post-#110 Bundle Audit remains PASS, so #110 did not regress that repository-level baseline.

## 5. Dependency / security baseline

- production dependency audit remains at **0 findings** under the permanent release gate;
- full developer/build graph still carries **12 dev-only findings** = 7 high / 2 moderate / 3 low;
- do not use broad `npm audit fix` merely to make the repository-wide total zero;
- AI/security authority boundaries remain unchanged.

## 6. Product contracts carried forward

- deterministic compatibility and life-stage risk remain authoritative;
- AI cannot override hard-safety decisions;
- Tank Copilot keeps separate schema, deterministic-safety and usefulness contracts;
- plant roster editing remains covered;
- share-report server-secret boundary remains covered;
- Care wide-desktop recovery remains covered;
- narrow-desktop Aquarium hierarchy remains `Today → Context → Manage`, while phone stays task-first;
- identification uncertainty requires explicit confirmation;
- Species Detail browsing remains separate from compatibility selection;
- exact return context remains covered across cross-route tasks;
- substrate now has a dedicated surface/rendering regression contract.

## 7. Backend/runtime boundary

Phase 1 authoritative path remains:

`frontend → api client → apps/api/src → Vercel Functions → Supabase / AI / Resend`

Legacy bridges still exist:

- `api/ai/chat.js -> server/index.mjs`
- `api/v1/health.js -> server/index.mjs`

Do not delete them before Phase 2 consumer inventory and one-bridge-at-a-time migration.

## 8. Remaining release risks

1. **Production deployment is not authorized and has not been performed.** RC1 synthetic/browser green is not production proof.
2. **Current Vercel Hobby build-rate-limit can suppress new preview builds.** The #110 product-equivalent preview `fa41972e...` was READY before the limit; no fresh `5e605fb7...` preview was available during this merge verification.
3. **Live AI provider usefulness remains unmeasured.** Repository fixtures prove encoded behavior, not representative provider quality.
4. **Production env/secrets and deployed Supabase/auth/persistence/share-report behavior remain to be proven in the actual deployment environment.**
5. **Legacy server Phase 2 has not started.**
6. **Knowledge Engine remains planned, not implemented.**

## 9. Next execution order

1. Keep RC1 frozen except for production-readiness defects; do not start unrelated feature work before release readiness is understood.
2. Complete live AI usefulness evaluation with representative configured-provider cases.
3. Resolve/observe Vercel preview capacity and obtain a real current-RC1 preview when available; re-check legacy bundle sizes and protected env behavior.
4. Only after explicit production authorization: verify env/secrets, Supabase/auth/persistence, live AI/fallback, Resend/share reports, then run post-deploy golden paths.
5. RC1→`main` remains a separate explicit merge decision.
6. After release foundation is stable: legacy server Phase 2, then Knowledge Engine.

The immediate project state is **RC1 code/regression clean through #110; production readiness remains the next boundary**.
