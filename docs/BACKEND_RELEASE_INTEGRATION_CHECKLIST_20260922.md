# Aqua Backend Release Integration Checklist — 2026-09-22

## Scope

This checklist governs integration of `backend/convergence-20260922` into the canonical main line.

Frozen for this integration:
- Image-recognition development.
- UI changes.
- Production deployment.
- Database migration application / DB-authority switch.
- Care indexing/noindex changes.

Current audited branch:
- HEAD: `c0dba9399dd8e6e0b212c732918f39157ecf9d8a`
- Upstream: `origin/backend/convergence-20260922`
- Merge base with `origin/main`: `437fe83fcfe282551806f573b3ca06f5bea37cc3`
- Divergence at audit: main-only 13 commits / backend-only 104 commits.

## Integration rule

Do not blind merge or rebase the convergence branch onto main. Build an explainable integration candidate that preserves main-only work and selects backend changes by scope.

### Include by default
- Compatibility/domain fail-closed logic and presentation contracts.
- Launch-cohort reviewed authority, identity boundaries and evidence ceilings.
- Species knowledge authority registry and completion-matrix tooling.
- Tank State / Tank Evidence / Water Change / Core Flow backend fixes and contracts.
- API origin/CORS/repository/business boundary hardening that is required by backend release gates.
- Deterministic source-controlled knowledge reports.
- Backend release-gate scripts and focused regressions.
- Authority / handoff documentation required to describe the integrated state.

### Freeze / exclude from the first integration candidate
- Vision implementation/tuning: `apps/api/src/ai/provider.ts`, Vision-specific portions of `apps/api/src/routes/species-ai.ts`, `src/lib/speciesRecognition.ts`, Vision contract/test changes unless independently required by main.
- UI modifications, especially `src/pages/Aquarium.tsx` and any visual-result presentation changes not required for backend contract compatibility.
- Repository-only Supabase Compatibility migration application; migration files may remain historical repository evidence but must not be applied as part of integration.
- Production/Vercel promotion changes.
- Care indexing/noindex changes.

## Pre-merge audit

- [ ] Refresh `origin/main`; record new main SHA and `origin/main...candidate` divergence.
- [ ] List all main-only commits and classify whether they touch files selected from backend.
- [ ] Generate a file-level candidate manifest: INCLUDE / EXCLUDE / MANUAL-RECONCILE.
- [ ] Reconcile files touched by both main-only and selected backend work; never resolve by taking one whole side blindly.
- [ ] Confirm no selected diff changes UI, Vision behavior, Production config, migration-application state or Care indexing.
- [ ] Confirm source-controlled generated knowledge artifacts regenerate deterministically.
- [ ] Confirm no secrets, local Vercel cache, build outputs, evaluation reports or `.env*` files enter the candidate.

## Required validation for the integration candidate

- [ ] `git diff --check`
- [ ] `npm run test:backend-release-gate`
- [ ] Compatibility user-conclusion contract PASS.
- [ ] Compatibility pair evidence ceilings PASS; unresolved launch pairs stay explicit/fail-closed.
- [ ] Species knowledge completion matrix PASS; reviewed source IDs resolve.
- [ ] Tank State PASS.
- [ ] Tank Evidence PASS.
- [ ] Water Change PASS.
- [ ] Care Guidance / Core Flow V1/V2 PASS.
- [ ] API origin/CORS/business/repository boundaries PASS.
- [ ] Catalog snapshot/release contracts PASS.
- [ ] API + project TypeScript PASS.
- [ ] Golden-path contracts remain compatible with the integrated backend.
- [ ] Worktree clean after candidate commit.

## Merge decision

A main merge is allowed only when:
1. main-only work is preserved;
2. the candidate manifest is complete;
3. Vision/UI/DB/Production frozen scope is absent from the candidate unless separately re-authorized;
4. all required validation above passes;
5. the final candidate SHA is recorded in `.ai/CURRENT_GOAL.md` and `.ai/HANDOFF_LATEST.md`.

After merge, Production remains a separate decision. No deployment or migration is implied by merging backend code.
