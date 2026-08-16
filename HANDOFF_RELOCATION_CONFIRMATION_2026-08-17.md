# AquaGuide Relocation Confirmation Handoff — 2026-08-17

> Living record. PR #62/#63/#64/#65 remain Draft/unmerged. Green branches/CI are not main or production.

## Current safe chain

`formal intervention → #65 entrypoint → #64 confirmation dialog → Care attempt controller → #63 fresh execution policy → #62 atomic receipt → fresh canonical reload/recompute → Care canonical display/mirror refresh`

## Verified foundations

- #62 atomic verified single-batch relocation, receipt-only result.
- #63 fresh source/destination recomputation; only `compatible_by_current_evidence` mutates; unknown/post-state-unavailable reconcile first.
- #64 request-bound confirmation, no repository import/blind retry.
- #65 opener only for lossless one-record + one-positive-batch whole-subject mapping; no cached authorization.
- #65 isolated full-chain run `31961532732` green.
- disposable #62 + #65 audit `31961690289` green, no new conflicts/no merge commit.
- canonical combined implementation bootstrap `31962121116` green; no product PR/main merge.
- Care attempt controller run `31962344545` green.
- reconciliation lifecycle run `31962635712` green.

## Care executable wiring — PERSISTED ON WORKING BRANCH

Working branch: `agent/canonical-care-relocation-wiring`

Persisted Care wiring commit: `9403663c371b8cfa824c92d843a1f57d9b6cbf3e`

This is a normal working-branch commit produced only after the full one-shot gate passed. It is **not** a PR merge and main was not changed.

Persisted flow:

`StepDiagnosisPanel → InterventionComparisonPanel → eligible #65 destination → one Care relocation controller/operationId → RelocationConfirmationDialog → #63 fresh policy → #62 atomic receipt → canonical post-read → Care canonical display/mirror refresh`

Persisted safety:
- no Care direct `.relocateLivestock()` call;
- one opener event creates one operationId;
- one repository session owns pre-load/mutation/post-load/reconcile;
- promise-cached execute blocks duplicate writes;
- fresh degradation blocks before write;
- uncertainty preserves the attempt and reconciliation is read-only;
- uncertain dialog is locked until canonical reconciliation succeeds;
- canonical executed/reconciled state outranks the compatibility mirror;
- mirror failure cannot reclassify canonical success.

## Final Care wiring gate — FULL GREEN

Run `31963163536` passed Care wiring static contract, mirror fallback, controller, confirmation lifecycle, entrypoint, fresh policy, uncertainty, Care hydration, severe-risk, App/API TypeScript, production build, one-shot self-delete and persisted branch commit.

TEST-003 and TYPE-001 were resolved without weakening product/type semantics.

## Real-catalog browser fixture audit — GREEN

Run `31963516019` found reviewed eligible real-catalog scenarios. Primary browser fixture:

- source `冲突缸`: `迷你鹦鹉鱼 sp_0021 ×1 + 虎皮鱼 sp_0439 ×6`;
- target `安全目标缸`: empty freshwater tank;
- one reviewed blocker;
- formal intervention allowed;
- `虎皮鱼 ×6 → target` = `compatible_by_current_evidence`;
- #65 entrypoint = `eligible`.

Browser GP must use this real reviewed community and click the actual rendered #65 CTA. Synthetic request/component injection is not acceptable as GP proof.

## Browser testability markers — GREEN

Run `31963752488` passed pre-marker red check, non-semantic marker patch, Care hydration, Care relocation static contract, TypeScript/build, self-delete and commit. Markers only stabilize selectors; they do not alter behavior.

## Browser Golden Path implementation

Added a Playwright page-level suite that starts at:

`/care?topic=guide_water_deteriorate`

and follows the actual rendered path:

`Care first-screen CTA → aggression diagnosis → real questions → diagnosis result → intervention comparison → #65 target CTA → #64 confirmation → Care/#63/#62 execution path`.

Planned deterministic cases:
- GP-REL-01/02 real opener + four visible facts + zero pre-confirm mutation + rapid double confirm → one actual state transition + immediate post-state redraw;
- GP-REL-03 silently stale target → fresh block + zero relocation;
- GP-REL-04 forced ambiguous local write outcome → close-locked sync-only reconciliation + zero second relocation;
- GP-REL-05 multi-batch whole subject → visible limitation + no executable CTA.

The suite counts actual `sp_0439` source→target state transitions rather than raw localStorage writes, because canonical mirror synchronization may legitimately write the same post-state again.

## Browser run 1 — INFRASTRUCTURE FAILURE BEFORE PRODUCT TEST

Run `31963987371` installed Playwright/Chromium successfully but failed at `Start AquaGuide Vite server`. The actual browser Golden Path step was skipped; **no GP-REL product assertion executed**.

Root cause is confirmed from `package.json`:

`npm run dev` = `node scripts/dev-with-api.mjs`

The workflow mistakenly treated `dev` as a pure Vite command and passed Vite host/port flags to the combined API+web dev orchestrator.

Classification: TEST-004 browser test infrastructure error, not a Care relocation failure.

Correction:
- start the deterministic frontend explicitly with `npx vite --host 127.0.0.1 --port 4173`;
- use bounded readiness curl;
- keep every browser product assertion unchanged.

## What remains unproven

1. real rendered Care navigation reaches the eligible CTA;
2. confirmation shows source/destination/虎皮鱼/6 correctly;
3. rapid double confirm remains one mutation in rendered UI;
4. stale target visibly blocks with zero write;
5. success redraws Care decision surface without reload;
6. Escape/overlay cannot dismiss rendered uncertainty dialog;
7. reconciliation unlocks only after canonical sync;
8. hosted Supabase/Auth/API performs the same flow end-to-end;
9. two-session/device mutation after card render is caught in hosted path.

## Next step

Rerun the exact same deterministic Playwright suite using a pure Vite server. Only after rendered browser cases pass may this branch move to separate hosted/Auth acceptance. Browser-harness success must not be described as production/hosted acceptance.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale destination card as mutation authorization;
- no direct Care UI → repository relocation;
- no local mirror presented as fresh canonical execution state;
- no synthetic catalog/request used to claim rendered GP success;
- no product assertion weakened to fix test infrastructure;
- no partial/multi-batch move described as whole conflict resolution;
- no `conditional` override;
- no blind retry after uncertain mutation outcome;
- no browser-harness success described as hosted production acceptance.
