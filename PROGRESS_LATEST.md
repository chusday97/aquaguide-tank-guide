# AquaGuide — Latest Progress

**Updated:** 2026-08-22  
**Sync branch:** `agent/rc1-post-110-release-sync`  
**Release candidate:** `integration/aquaguide-rc1`  
**Current RC1 head:** `5e605fb7a68001ecd80096ef42f063909cf5aa03`

## Current phase

**RC1 feature/UI/evaluator/bundle/substrate repair is converged and regression-clean through #110. Next phase is production readiness, not unrelated feature expansion.**

No merge to `main` and no production deployment has been performed.

## Convergence checklist

- [x] #104 merged to RC1 — UI/UX system convergence.
- [x] #105 merged to RC1 — Result UX V1.
- [x] #107 merged to RC1 — post-#105 evaluator drift repair.
- [x] #109 merged to RC1 — legacy Vercel function bundle trim.
- [x] #110 merged to RC1 — substrate as explicit tank-bottom surface/material.
- [x] RC1 head after #110: `5e605fb7a68001ecd80096ef42f063909cf5aa03`.
- [x] Real RC1→main synthetic release matrix re-run after #110.
- [x] Exact merged-head substrate browser path re-run on isolated AquaGuide preview.
- [ ] RC1→main merge — not authorized.
- [ ] Production deploy — not authorized.

## Post-#110 RC1 release matrix

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

Result: **9/9 PASS** on actual RC1 ancestry after #110.

## Substrate Surface V1 closure

- [x] PR-head permanent gate `32579395579` — PASS.
- [x] Targeted diagnostic `32579071402` — PASS.
- [x] Source contract: no invented substrate fallback; full-bed surface semantics; no grain-mesh cloud.
- [x] Aquarium settings repository contract — PASS.
- [x] TypeScript — PASS.
- [x] Production build — PASS.
- [x] Browser path on merged RC1 head — PASS: `none → 黑金沙 → repository save → 3D consumes 黑金沙`.

An earlier merged-head browser retry on port 4173 timed out because that port was serving IceGlide instead of AquaGuide. A diagnostic confirmed IceGlide page content and missing AquaGuide controls. Re-run on isolated port 4189 passed. This is treated as test-environment contamination, not product failure.

## PUI-BC-060

- [x] Fail mode identified: saved substrate could be visually indistinguishable from an invented default.
- [x] Root semantic mismatch identified: substrate was partly treated like discrete decoration objects.
- [x] Renderer now consumes persisted substrate directly.
- [x] Bare bottom is explicit `none`.
- [x] Configured substrate fills the tank floor as a continuous material layer.
- [x] Browser regression proves persistence and 3D consumption in one path.
- [x] Merged into RC1 and re-proven on final ancestry.

Status: **`regression_verified`**.

## #109 bundle baseline carried forward

- [x] `/api/v1/health` legacy function reduced to 1.13 MB in the verified #109/RC1 preview.
- [x] `/api/ai/chat` legacy function reduced to 1.13 MB.
- [x] canonical `/api/v1/[...path]` stayed 40.13 MB.
- [x] Post-#110 Bundle Audit remains green.

A fresh `5e605fb7...` Vercel preview was not observed during this step because the Hobby project had recently hit build-rate-limit. Do not treat missing preview creation as a product regression.

## Dependency / security baseline

- production audit: **0 findings**;
- full developer/build graph: **12 dev-only findings** = 7 high / 2 moderate / 3 low;
- permanent dependency release gate remains the authority for production dependency blocking;
- broad `npm audit fix` remains disallowed as a shortcut.

## AI usefulness baseline

Encoded repository-level failure modes remain guarded:

- [x] schema-valid is not treated as sufficient;
- [x] deterministic safety stays authoritative;
- [x] blocking tank facts outrank subjective preference chatter;
- [x] candidate-drop recovery is constrained to deterministic safe/adjustable pools;
- [x] unnecessary `restart_goal` is rejected when executable candidates exist;
- [x] concrete candidate/quantity planning is required.

Still open before production:

- [ ] representative live-provider cohort;
- [ ] generic-answer rate;
- [ ] candidate-drop rate;
- [ ] hallucinated-preference rate;
- [ ] contradiction handling;
- [ ] invalid JSON recovery;
- [ ] timeout/network fallback behavior.

## Production-readiness backlog

- [ ] obtain a current-RC1 Vercel preview once build capacity is available;
- [ ] re-check legacy function bundle sizes on that preview;
- [ ] verify production env/secrets rather than assuming Preview settings match Production;
- [ ] verify Supabase auth and persistence in deployed environment;
- [ ] verify live AI provider + fallback behavior;
- [ ] verify Resend/share-report path;
- [ ] run post-deploy golden paths only after explicit deployment authorization;
- [ ] keep RC1→main as a separate explicit merge decision.

## Later maintenance

- [ ] legacy `server/index.mjs` Phase 2 consumer inventory and one-bridge-at-a-time migration;
- [ ] developer/build dependency debt cleanup without expanding production risk;
- [ ] Knowledge Engine: provenance/version schema → trusted ingestion/freshness → evaluation → hybrid retrieval → grounded results → knowledge ops.

## Guardrails

- A merged PR is not automatically production-ready.
- Browser evidence outranks source assumptions for user-visible behavior.
- Test-environment contamination must be separated from product regressions.
- Do not weaken visual/browser thresholds to make CI green.
- Preview/build green is not production proof.
- AI cannot override deterministic safety rules.
- Do not merge RC1 to `main` or deploy production without explicit authorization.
