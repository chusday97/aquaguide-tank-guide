# AquaGuide Handoff — 2026-08-18 / PUI-BC-035

## Current priority

Functional CTA / Action Completeness.

Acceptance unit:

`Trigger → Execution → Observable result → Persistence（如适用）→ Failure/Retry（如适用）`

## Closed in this Draft PR

### PUI-BC-035 — Care card false save promise

- Trigger: `/care?topic=guide_safe_water_change` → `生成养护卡`。
- Old state: card preview + copy were real; Chinese Dialog copy promised “可保存” with no save/download action; the lone copy action remained inside a two-column footer.
- Fail-before-fix: Product Golden Path #608 / run `32104159714` failed only at Care card action regression after product contracts, typecheck, build, and preview had passed.
- Fix: do not invent download/export. The copy now promises only the real copyable capability, and the lone footer action uses a one-column full-width layout.
- Product verification: Product Golden Path #611 / run `32104536496` — Care card regression, typecheck/build, and GP-001～GP-005 all PASS.
- Permanent browser regression: no save promise without a save action; a lone real footer action must occupy at least 85% of footer width; real clipboard content is still verified.
- Registry: `PUI-BC-035`, `care`, `regression_verified`, fixed by `b4c0453c487681c3b188682f3774565d1468641a`.
- Final latest-head acceptance target: product evaluation must report `18 features / 108 states / 32 Badcases`, with Care card regression, typecheck/build, and GP-001～GP-005 all PASS.
- PR #90 remains Draft/open/unmerged.

## Open Draft PR ordering

- #88 — PUI-BC-033 global search show-all.
- #89 — PUI-BC-034 Identify overflow hint.
- #90 — PUI-BC-035 Care card promise.

These were intentionally developed independently from `main`. Consolidate daily handoff and registry ordering when merging. Do not merge without explicit authorization.

## Compatibility boundary unchanged

- Decision Engine: `stable_under_regression`.
- GP-002: covered.
- Knowledge Coverage: limited.
- Reviewed species profiles: 7.
- Reviewed pair rules: 4.
- Priority recordable directions: 2/132.
- `PUI-BC-025` stays `investigating`.

## Next

Continue promise-level Action Completeness audit. Prefer `handler → business result` mismatches over cosmetic or no-op-only findings. Register a new badcase only after deterministic fail-before evidence.
