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
Opener must display confirmation with mutation count 0.

### REL-051 — rapid/double confirm creates two mutations
Browser must prove exactly one business relocation transition despite rapid interaction.

### REL-052 — stale rendered destination still moves
Target change after card render must fresh-block with mutation count 0.

### REL-053 — success UI leaves conflict cards stale
Rendered Care decisions must reflect canonical post-state without reload.

### REL-054 — Escape/overlay closes uncertainty dialog
Rendered Radix dialog must remain open while reconciliation is required.

### REL-055 — reconciliation visually unlocks before canonical read succeeds
Sync failure/pending keeps lock; successful read renders reconciled state, then Close unlocks.

### REL-056 — deterministic local browser harness is misreported as hosted/Supabase acceptance
Browser harness and real hosted/Auth acceptance remain separate gates.

### REL-057 — browser fixture bypasses real source-scope builder
Browser test must seed the reviewed source community and click the real rendered `进入迁移确认` CTA. Synthetic dialog/request injection is not accepted.

### REL-058 — multi-record/multi-batch case silently hides execution limitation
Rendered user must see deterministic source-scope reason, not merely absence of CTA.

### REL-059 — real species fixture bypasses reviewed conflict construction
Seed full `sp_0021 ×1 + sp_0439 ×6` community plus separate target so the real decision engine creates the formal option.

### REL-060 — browser success checks markers but not visible facts
GP-REL-01 must assert visible `冲突缸 / 安全目标缸 / 虎皮鱼 / 6` and zero relocation before confirm.

## BROWSER-OBS-001 — first valid rendered run failed after completed state, exact assertion not yet recovered

Run `31964201289` is the first browser run with Chromium + pure Vite successfully started and the actual page-level suite executed.

Uploaded screenshot for `gp-rel-01-02-success` shows the real confirmation dialog in green completed state with the correct four visible facts:

- `冲突缸`;
- `安全目标缸`;
- `虎皮鱼`;
- `6`;
- `迁移已完成，并已重新计算两个鱼缸`.

**Bounded classification:**
- GP-REL-01 is rendered-green.
- GP-REL-02 reached `data-relocation-completed`.
- failure is after success rendering, so it can only be in the remaining post-success assertions: source/target stored quantities, business transition count, dialog Close, or Care post-state redraw.

**Do not yet classify this as REL-051 or REL-053.** Current GitHub job-log surface did not expose the Node assertion stderr, and the artifact had only screenshot + healthy Vite log.

**Required diagnostic action:** rerun the exact same script/assertions with stdout/stderr tee'd into an uploaded browser-test log. This is diagnostics-only; no product code and no GP assertion may be changed before the exact failure is known.

## Browser Golden Path exit gate

- GP-REL-01 reviewed rendered intervention → opener → correct four visible facts; zero mutation before confirm — evidence currently green from run `31964201289`, pending full suite rerun.
- GP-REL-02 success + rapid double-confirm → exactly one relocation + visible canonical post-state refresh — incomplete; completed UI reached but post-success assertion failed.
- GP-REL-03 target changes after render → fresh blocked UI, zero mutation — not yet reached.
- GP-REL-04 uncertain mutation → non-dismissible sync-only recovery — not yet reached.
- GP-REL-05 multi-batch source-scope limitation visible — not yet reached.
- local browser harness remains explicitly distinct from hosted/Auth/Supabase acceptance.
- handoff/badcase updated before any browser fix.
