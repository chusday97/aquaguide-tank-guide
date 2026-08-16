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

## Persisted Care wiring verification

Branch: `agent/canonical-care-relocation-wiring`

Care wiring commit: `9403663c371b8cfa824c92d843a1f57d9b6cbf3e`

Full one-shot run `31963163536`: **GREEN** through page static contract, canonical-view/mirror fallback, controller, reconciliation lifecycle, entrypoint, fresh policy, mutation uncertainty, Care hydration, severe-risk, app/API TypeScript, production build, write-tool self-delete and branch commit/push.

This closes static/logic/type/build, not browser/hosted acceptance.

## Browser acceptance badcases

### REL-050 — opening confirmation mutates immediately
Opener must display confirmation with mutation count 0.

### REL-051 — rapid/double confirm creates two mutations
Browser must prove exactly one mutation despite rapid interaction.

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

**Risk:** test directly constructs `RelocationConfirmationDialog` with a synthetic request/species and never proves the actual user path through Care → InterventionComparisonPanel → #65 entrypoint.

**Real-catalog audit:** run `31963516019` found reviewed eligible fixtures:

- `迷你鹦鹉鱼 sp_0021 ×1 + 虎皮鱼 sp_0439 ×6` → move `虎皮鱼 ×6` to empty freshwater target: `compatible_by_current_evidence`, entrypoint `eligible`;
- `珍珠赤雷龙 sp_0049 ×1 + 红绿灯 sp_0431 ×6` → move `红绿灯 ×6` to empty target: `compatible_by_current_evidence`, entrypoint `eligible`.

**Required browser fixture:** primary GP uses the first pair (`sp_0021` + `sp_0439`) because its source blocker is the reviewed pair rule. Test starts from the rendered intervention/destination card and clicks actual `进入迁移确认`. No synthetic catalog/request is acceptable as proof of GP-REL-01/02.

### REL-058 — multi-record/multi-batch case silently hides execution limitation
Rendered user must see deterministic source-scope reason, not merely absence of CTA.

### REL-059 — browser fixture uses a real species but bypasses reviewed conflict construction
**Failure:** test seeds only the relocating species and directly manufactures an intervention card/URL.

**Required:** seed the complete reviewed source community (`sp_0021 ×1 + sp_0439 ×6`) plus separate target aquarium so the formal option is produced by the real conflict/decision engine.

### REL-060 — browser success is based only on component data markers without checking visible facts
**Failure:** test sees `data-open-relocation-confirmation`/dialog marker but never checks displayed source/destination/species/quantity.

**Required:** GP-REL-01 asserts visible labels/values: source tank name, destination tank name, `虎皮鱼`, quantity `6`, plus mutation count 0 before confirm.

## Browser Golden Path exit gate

- GP-REL-01 real reviewed rendered intervention → opener → correct four visible facts; zero mutation before confirm;
- GP-REL-02 success + rapid double-confirm → one mutation and visible canonical post-state refresh;
- GP-REL-03 target changes after render → fresh blocked UI, zero mutation;
- GP-REL-04 uncertain mutation → non-dismissible sync-only recovery; reconciliation sends no second mutation and unlocks only after read;
- GP-REL-05 multi-record/multi-batch source-scope limitation visible;
- actual Care/intervention/confirmation path is exercised, not isolated component injection;
- local browser harness is explicitly not hosted/Auth/Supabase acceptance;
- handoff/badcase updated immediately for any new browser failure.
