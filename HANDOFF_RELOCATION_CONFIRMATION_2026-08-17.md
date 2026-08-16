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

Run `31963516019` found reviewed eligible real-catalog scenarios. Primary fixture:

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

Playwright page-level suite starts at `/care?topic=guide_water_deteriorate` and follows the actual rendered path:

`Care first-screen CTA → aggression diagnosis → real questions → diagnosis result → intervention comparison → #65 target CTA → #64 confirmation → Care/#63/#62 execution path`.

Cases:
- GP-REL-01/02 real opener + four visible facts + zero pre-confirm mutation + rapid double confirm → one actual state transition + immediate post-state redraw;
- GP-REL-03 silently stale target → fresh block + zero relocation;
- GP-REL-04 forced ambiguous local write outcome → close-locked sync-only reconciliation + zero second relocation;
- GP-REL-05 multi-batch whole subject → visible limitation + no executable CTA.

The suite counts actual `sp_0439` source→target state transitions rather than raw localStorage writes.

## Browser run 1 — TEST-004 infrastructure failure

Run `31963987371` never entered product browser assertions because the workflow treated `npm run dev` as Vite even though it runs `scripts/dev-with-api.mjs`. Corrected to explicit `npx vite --host 127.0.0.1 --port 4173`; no product assertion was changed.

## Browser run 2 — first valid rendered run, partial boundary confirmed

Run `31964201289` successfully installed Chromium and started the pure Vite frontend, so it is the first run that actually exercised the rendered Care relocation path.

The run failed inside the first case `gp-rel-01-02-success`, but the uploaded failure screenshot proves the flow had already reached the **completed relocation state**. The rendered confirmation shows:

- source: `冲突缸`;
- destination: `安全目标缸`;
- livestock: `虎皮鱼`;
- quantity: `6`;
- green terminal state: `迁移已完成，并已重新计算两个鱼缸`.

Therefore the current evidence supports these bounded conclusions:

1. **GP-REL-01 is rendered-green**: real Care navigation reached the real #65 opener and the four visible confirmation facts are correct. Opening confirmation did not fail or bypass the real reviewed fixture path.
2. **GP-REL-02 reached the executed/completed UI state**: confirm passed fresh execution and rendered success.
3. The first failure occurred **after** `data-relocation-completed` became visible. Remaining possible assertions are narrowed to post-action local state quantities, business transition count, closing the dialog, or rendered Care decision redraw after Close.
4. This is not enough evidence yet to label the failure REL-053 or to claim GP-REL-02 fully green.

Diagnostics limitation: Actions did not expose the Node assertion stderr through the available job-log interface, and the first artifact contained only the failure screenshot plus a healthy Vite log. The exact post-success assertion is therefore still unknown.

Next action is diagnostic-only: rerun the **same unchanged browser assertions** while teeing browser stdout/stderr into the diagnostics artifact. No product code or GP assertion will be changed until the exact failing assertion is recovered.

## What remains unproven

- GP-REL-02 exactly one business relocation transition + post-state redraw;
- GP-REL-03 stale target fresh-block;
- GP-REL-04 rendered non-dismissible reconcile lifecycle;
- GP-REL-05 visible multi-batch fail-closed limitation;
- hosted Supabase/Auth/API end-to-end behavior;
- two-session/device stale-target hosted behavior.

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
