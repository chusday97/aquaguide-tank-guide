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

### Persisted Care flow

`StepDiagnosisPanel → InterventionComparisonPanel → eligible #65 destination → one Care relocation controller/operationId → RelocationConfirmationDialog → #63 fresh policy → #62 atomic receipt → canonical post-read → Care canonical display/mirror refresh`

### Persisted safety semantics

- Care page has no direct `.relocateLivestock()` call.
- one opener event creates one operationId; render does not create IDs.
- one successfully resolved repository instance owns pre-load → mutation → post-load → reconcile for the attempt.
- `execute()` is promise-cached; double click cannot send a second relocation.
- fresh destination degradation blocks before mutation.
- `mutation_state_unknown` preserves the same attempt/operationId and reconciliation is read-only.
- uncertain/post-state-unavailable dialog cannot be dismissed until canonical reconciliation succeeds.
- successful reconciliation enters explicit reconciled state before Close is allowed.
- executed/reconciled canonical aquariums become the current Care-visible truth before mirror persistence.
- compatibility mirror persistence is secondary; mirror failure does not reclassify canonical success.
- strict `mirrorPersisted: true | false` discriminated result remains intact.

## Final one-shot wiring run — FULL GREEN

Run `31963163536` completed **success**.

Passed:
- verifier red before patch ✅
- exact-anchor Care patch ✅
- Care wiring static contract ✅
- canonical view / mirror fallback ✅
- Care relocation controller ✅
- confirmation reconciliation lifecycle ✅
- #65 entrypoint ✅
- #63 fresh execution policy ✅
- mutation uncertainty ✅
- Care hydration ✅
- reviewed severe-risk ✅
- App TypeScript ✅
- API TypeScript ✅
- production build ✅
- one-shot write tooling self-delete ✅
- verified Care wiring commit/push ✅

TEST-003 and TYPE-001 are resolved without weakening product or type semantics.

## Real-catalog browser fixture audit — GREEN

Synthetic catalog controls are **not** accepted for the rendered browser Golden Path. Read-only audit run `31963516019` found reviewed eligible scenarios.

Primary fixture:
- source: `迷你鹦鹉鱼 sp_0021 ×1 + 虎皮鱼 sp_0439 ×6`;
- known blocker count 1, formal intervention allowed;
- `虎皮鱼 sp_0439 ×6 → empty freshwater target` = `compatible_by_current_evidence`;
- #65 entrypoint = `eligible`.

Secondary fixture:
- `珍珠赤雷龙 sp_0049 ×1 + 红绿灯 sp_0431 ×6`;
- `红绿灯 ×6 → empty target` = eligible.

Primary browser path uses `sp_0021 + sp_0439` because the source blocker is backed by the reviewed pair rule. Browser test must begin at rendered Care/intervention card and may not inject a synthetic request/dialog.

## Browser testability markers — GREEN AND PERSISTED

Run `31963752488` completed **success**.

It first proved the marker verifier failed on the pre-marker Care source, then applied only non-semantic `data-*` selectors and passed:
- browser marker static contract ✅
- Care hydration regression ✅
- Care relocation wiring static contract ✅
- App TypeScript ✅
- production build ✅
- one-shot marker tooling self-delete ✅
- marker commit/push ✅

Current branch head after marker commit: `751d883edab9d578165317b4fa55c1851cab9b0e`.

Persisted selectors:
- `data-care-step-diagnosis="true"`
- `data-care-diagnosis-issue={issue.id}`
- `data-care-diagnosis-question={question.id}`
- `data-care-diagnosis-option={`${question.id}:${option.value}`}`
- `data-care-diagnosis-submit="true"`

These markers change no diagnosis/relocation semantics. They only let the browser suite exercise the actual user path without brittle Tailwind/text-structure selectors.

## What this does NOT prove yet

The Care relocation flow is executable on the working branch, but browser and hosted/live acceptance remain separate outstanding gates.

Not yet proven:
1. real rendered Care navigation reaches the eligible CTA;
2. confirmation visually shows the correct four facts;
3. rapid double confirm remains one mutation in the browser;
4. stale destination visibly blocks with zero write;
5. success redraws source/destination decisions without reload;
6. rendered Radix dialog truly stays locked under Escape/overlay during uncertainty;
7. reconciliation visually unlocks only after canonical sync;
8. hosted Supabase/Auth/API performs the same flow on real account data;
9. a two-session/device change after card render is caught in hosted execution.

## Next step — browser Golden Path

Required deterministic browser cases:

### GP-REL-01 — eligible opener → confirmation
- real reviewed fixture renders formal intervention + eligible target;
- click `进入迁移确认`;
- source, destination, 虎皮鱼, quantity 6 are shown;
- mutation count remains 0 until confirm.

### GP-REL-02 — confirm success
- rapid/duplicate confirm interaction still sends one mutation;
- success state renders;
- source/destination Care decisions reflect canonical post-state without reload.

### GP-REL-03 — stale destination blocks
- target becomes unsafe after card render but before confirm;
- fresh blocked UI says `条件已变化，本次没有执行迁移`;
- mutation count 0.

### GP-REL-04 — ambiguous outcome / reconcile
- uncertainty dialog cannot close via Escape/overlay;
- only sync action is available;
- sync sends no second relocation;
- canonical reconciliation renders synced state, then Close unlocks.

### GP-REL-05 — source-scope fail-closed
- multi-record / multi-batch formal subject exposes no direct confirmation opener;
- deterministic limitation text is visible.

Deterministic browser harness success must remain explicitly separate from real hosted/Auth/Supabase acceptance.

## Non-negotiable constraints

- no merge/Ready without explicit user instruction;
- no stale destination card as mutation authorization;
- no direct Care UI → repository relocation;
- no local mirror presented as fresh canonical execution state;
- no synthetic catalog/request used to claim the actual rendered Golden Path;
- no partial/multi-batch move described as whole conflict resolution;
- no `conditional` override;
- no blind retry after uncertain mutation outcome;
- no browser-harness success described as hosted production acceptance.
