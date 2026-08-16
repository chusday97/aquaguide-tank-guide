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

## Care executable wiring — persisted on working branch

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

## Static / logic / type / build gates

Run `31963163536` passed Care wiring static contract, mirror fallback, controller, confirmation lifecycle, entrypoint, fresh policy, uncertainty, Care hydration, severe-risk, App/API TypeScript, production build, one-shot self-delete and persisted branch commit.

TEST-003 and TYPE-001 were resolved without weakening product/type semantics.

Real-catalog fixture audit `31963516019` is green. Primary browser fixture is the reviewed community:
- source `冲突缸`: `迷你鹦鹉鱼 sp_0021 ×1 + 虎皮鱼 sp_0439 ×6`;
- target `安全目标缸`: empty freshwater tank;
- reviewed blocker exists;
- `虎皮鱼 ×6 → target` is `compatible_by_current_evidence` and #65 entrypoint `eligible`.

Browser marker gate `31963752488` is green; only non-semantic selectors were added.

## Browser Golden Path

Playwright starts at `/care?topic=guide_water_deteriorate` and follows the actual rendered path:

`Care first-screen CTA → aggression diagnosis → real questions → diagnosis result → intervention comparison → #65 target CTA → #64 confirmation → Care/#63/#62 execution path`.

Cases:
- GP-REL-01/02 real opener + four visible facts + zero pre-confirm mutation + rapid double confirm → one actual state transition + immediate post-state redraw;
- GP-REL-03 silently stale target → fresh block + zero relocation;
- GP-REL-04 forced ambiguous local write outcome → close-locked sync-only reconciliation + zero second relocation;
- GP-REL-05 multi-batch whole subject → visible limitation + no executable CTA.

The suite counts actual `sp_0439` source→target state transitions rather than raw localStorage writes.

### Browser run 1 — TEST-004 infrastructure only

Run `31963987371` never entered product assertions because workflow started the combined `npm run dev` orchestrator instead of plain Vite. Fixed to explicit Vite; no GP assertion changed.

### Browser run 2 — first valid rendered run

Run `31964201289` reached the real green relocation-completed dialog with correct `冲突缸 / 安全目标缸 / 虎皮鱼 / 6`, proving GP-REL-01 and execution through success UI. Exact assertion stderr was initially unavailable.

### Diagnostic rerun — exact failure recovered

Run `31964475428` reran the **same unchanged browser assertions** with stdout/stderr captured into the diagnostics artifact.

Exact failure:

`getByRole('button', { name: '关闭' })` failed Playwright strict mode because it resolved to two elements:
1. the explicit bottom action button with visible text `关闭`;
2. Radix's built-in dialog-close control, whose accessible name is also `关闭`.

Failure line: `scripts/test-care-relocation-browser-golden-path.mjs:242`, after the success-state assertions.

This is **TEST-005 locator ambiguity**, not a product relocation failure.

Crucially, because line 242 occurs after these assertions, run `31964475428` proves all of them passed before the locator failed:

- visible confirmation source = `冲突缸` ✅
- destination = `安全目标缸` ✅
- species = `虎皮鱼` ✅
- quantity = `6` ✅
- opening confirmation caused zero relocation transitions ✅
- rapid double confirm reached `data-relocation-completed` ✅
- source canonical/local test state has tiger-barb quantity `0` after success ✅
- target state has tiger-barb quantity `6` after success ✅
- **business relocation transition count is exactly `1`** despite rapid double click ✅

Therefore:
- **GP-REL-01 is green** in deterministic rendered browser acceptance.
- **GP-REL-02's execution/idempotency core is green**: one relocation, not two.
- The only remaining GP-REL-02 assertion not yet reached is the post-Close rendered Care decision redraw (`REL-053`).

Next change is test-only: target the explicit bottom Close action by visible button text within the confirmation dialog instead of ambiguous accessible-name matching. No product code and no business assertion will change.

## Still unproven

- GP-REL-02 post-Close rendered Care decision redraw / REL-053;
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
