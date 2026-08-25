# P0 Migration Impact Review

**Status:** `PROPOSED — code migration requires confirmation`  
**Target:** `codex/unified-rc-visual-v1`  
**Source:** `integration/aquaguide-rc1@895f2f39`

## Confirmed scope

| Layer | RC change | Impact |
|---|---|---|
| Product contract | Planning Compatibility and Current Tank State become separate authorities | Changes the meaning of existing compatibility snapshots and Today actions. |
| Frontend data type | `LifeStage` expands from `unknown / juvenile / adult` to `unknown / fry / juvenile / subadult / adult` | Existing records remain valid; new values must be accepted by UI, storage and API boundaries. |
| Evidence data | Reviewed species, pair and life-stage risk profiles are added | Content/data change; source and review status must remain visible. |
| Compatibility engine | Replaces heuristic bioload percentage and keyword schooling inference with reviewed evidence and a coarse screening result | Changes planning verdict explanation and possibly candidate eligibility. |
| Current tank / water change | New derived services use existing aquarium, observation and care facts | RC contract says no new Current Tank State persistence table; verify this remains true in the unified branch. |
| API / deployment | RC later includes Vercel ESM/API changes | Explicitly excluded from this P0 migration; needs its own contract review. |

## Migration order

1. Add compatible `LifeStage` union and evidence data with source-level tests.
2. Migrate the Planning Compatibility engine and its deterministic tests without replacing approved visual page components.
3. Add Current Tank State and Water Change derived services; prove no new persisted state/API field is introduced.
4. Adapt existing visual-branch consumers through adapters, preserving their layout owners.
5. Migrate recommendation authority only after steps 1–4 pass.

## Required acceptance evidence

- Existing `unknown`, `juvenile`, and `adult` records still parse and display.
- A fry candidate beside existing adults becomes `insufficient_data` unless reviewed stage evidence supports a stronger result.
- Planning `caution` does not become an Existing Tank current-danger diagnosis without current evidence.
- Pairwise compatibility does not stand in for whole-tank feasibility.
- No new database table, API endpoint, or stored Current Tank State is introduced in this unit.
- The 4317-approved visual routes remain visually unchanged outside data-dependent labels/results.

## Files expected in the first implementation unit

- `src/types.ts`
- `src/data/compatibilityEvidence.ts`
- `src/lib/tankCompatibilityEngine.ts`
- `packages/domain-rules/src/*` only if required by the engine
- P0 deterministic tests and the relevant product rules/acceptance cases

## Explicitly out of this unit

- `apps/api/**`, `CONTRACT.md` version changes, Supabase migrations, or new persistence fields.
- RC page components, global CSS, Dialog geometry, or Atlas UI.
- Vercel runtime/deployment alignment.
