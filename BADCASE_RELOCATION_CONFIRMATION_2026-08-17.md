# AquaGuide Relocation Confirmation Badcases — 2026-08-17

> Living regression record. PR #62/#63/#64/#65 stay Draft/unmerged. Care executable wiring is persisted on the canonical working branch, but browser/hosted acceptance is still outstanding.

## Protected relocation badcases

REL-023…REL-049 remain active:
- committed write/read uncertainty is truthful;
- no stale verdict/direct Care mutation/blind retry;
- source record/batch/quantity mapping fails closed;
- one attempt owns one operationId + one repository session;
- canonical pre/post reads outrank local mirror;
- uncertainty is non-dismissible until reconciliation;
- mirror persistence cannot reclassify canonical success.

## Resolved test/type findings

- TEST-001 optional-call regex false failure — test-only fix.
- TEST-002 guessed parent verifier filename — parent canonical verifier reused.
- TEST-003 Care hydration source-line adjacency — replaced with capability assertions; green in `31963163536`.
- TYPE-001 mirror-result false-branch narrowing — explicit `mirrorPersisted === false`; no union weakening; app/API TS + build green.
- TEST-004 browser workflow started combined API/web dev command instead of plain Vite — corrected without changing GP assertions.

## Persisted Care wiring verification

Branch: `agent/canonical-care-relocation-wiring`

Care wiring commit: `9403663c371b8cfa824c92d843a1f57d9b6cbf3e`

Full one-shot run `31963163536`: GREEN through page static contract, canonical-view/mirror fallback, controller, reconciliation lifecycle, entrypoint, fresh policy, mutation uncertainty, Care hydration, severe-risk, app/API TypeScript, production build, write-tool self-delete and branch commit/push.

## Browser testability / fixture gates

- real-catalog fixture audit `31963516019`: green; primary reviewed path is `sp_0021 ×1 + sp_0439 ×6 → empty freshwater target`, with `sp_0439 ×6` entrypoint eligible.
- browser testability markers run `31963752488`: green; only non-semantic `data-*` selectors were added.

## Browser acceptance badcases

### REL-050 — opening confirmation mutates immediately
Current evidence: **protected in rendered browser**. GP-REL-01 diagnostic rerun confirmed zero business relocation transitions before confirm.

### REL-051 — rapid/double confirm creates two mutations
Current evidence: **protected in rendered browser**. Run `31964475428` reached completed state after programmatic rapid double click and the subsequent assertion `business relocation transition count === 1` passed before the later Close-locator failure.

### REL-052 — stale rendered destination still moves
Target change after card render must fresh-block with mutation count 0. Not yet reached in suite.

### REL-053 — success UI leaves conflict cards stale
Rendered Care decisions must reflect canonical post-state without reload. The assertion exists but has not yet run because the preceding Close locator failed.

### REL-054 — Escape/overlay closes uncertainty dialog
Rendered Radix dialog must remain open while reconciliation is required. Not yet reached.

### REL-055 — reconciliation visually unlocks before canonical read succeeds
Sync failure/pending keeps lock; successful read renders reconciled state, then Close unlocks. Not yet reached.

### REL-056 — deterministic local browser harness is misreported as hosted/Supabase acceptance
Browser harness and real hosted/Auth acceptance remain separate gates.

### REL-057 — browser fixture bypasses real source-scope builder
Browser test seeds the reviewed source community and clicks the real rendered `进入迁移确认` CTA. Synthetic dialog/request injection is not accepted.

### REL-058 — multi-record/multi-batch case silently hides execution limitation
Rendered user must see deterministic source-scope reason, not merely absence of CTA. Not yet reached.

### REL-059 — real species fixture bypasses reviewed conflict construction
Browser GP seeds full `sp_0021 ×1 + sp_0439 ×6` community plus separate target, so the real decision engine creates the formal option.

### REL-060 — browser success checks markers but not visible facts
Current evidence: **protected**. Run `31964475428` passed visible `冲突缸 / 安全目标缸 / 虎皮鱼 / 6` assertions before confirm.

## TEST-005 — ambiguous `关闭` role locator after successful relocation

Diagnostic rerun `31964475428` captured the exact Playwright failure:

`getByRole('button', { name: '关闭' })` violated strict mode because it matched two controls inside/around the rendered dialog:
1. the intended bottom action button containing visible text `关闭`;
2. Radix's built-in `DialogClose` control, whose accessible name is also `关闭`.

Failure line: `scripts/test-care-relocation-browser-golden-path.mjs:242`.

**Classification:** browser test locator ambiguity, not product behavior failure.

**Important proof from execution order:** all assertions before line 242 passed, including:
- GP-REL-01 correct four visible facts and zero pre-confirm relocation;
- rapid double-confirm reaches completed state;
- source tiger quantity becomes 0;
- target tiger quantity becomes 6;
- **actual business relocation transition count is exactly 1**.

Therefore REL-050 and REL-051 are currently green in deterministic rendered browser testing. REL-053 is still unproven because its post-Close redraw assertion occurs after line 242.

**Required fix:** test-only locator refinement to the explicit bottom Close action (e.g. visible-text button within the confirmation dialog), not `.first()` guessing and not any product/assertion change.

## Browser Golden Path exit gate

- GP-REL-01 reviewed rendered intervention → opener → correct four visible facts; zero mutation before confirm — **green** in `31964475428`.
- GP-REL-02 success + rapid double-confirm → exactly one relocation — **core green**; post-Close rendered Care redraw still pending.
- GP-REL-03 target changes after render → fresh blocked UI, zero mutation — not yet reached.
- GP-REL-04 uncertain mutation → non-dismissible sync-only recovery — not yet reached.
- GP-REL-05 multi-batch source-scope limitation visible — not yet reached.
- local browser harness remains explicitly distinct from hosted/Auth/Supabase acceptance.
- handoff/badcase updated before any browser fix.
