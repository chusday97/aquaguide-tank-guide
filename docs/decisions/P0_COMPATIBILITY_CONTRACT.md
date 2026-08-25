# P0 Compatibility and Current-Tank Contract

**Status:** `PROPOSED — approval required before implementation`  
**Target:** `codex/unified-rc-visual-v1`  
**Business reference:** `integration/aquaguide-rc1@895f2f39`

## Goal

Port the reviewed compatibility evidence and derived current-tank/water-change decision rules without changing the accepted UI, storing a second tank-state record, adding a database migration, or adding API endpoints.

## Data contract impact

| Layer | Proposed change | Persistence/API impact |
| --- | --- | --- |
| Existing batch type | Expand `LifeStage` from `unknown / juvenile / adult` to `unknown / fry / juvenile / subadult / adult` | Existing values remain valid; no column/table/API shape change. |
| Local reviewed evidence | Add reviewed species, pair and stage-risk data in `src/data/compatibilityEvidence.ts` | Bundled evidence data only; no remote write. |
| Domain rule | Add pure `TankState`, `WaterChangeDecision` and coarse bioload screening functions | Derived in memory from existing facts; no persistence. |
| Aquarium services | Build priors from existing compatibility results and observations from existing diagnosis/care records | Reads existing models only; no new stored Current Tank State. |
| UI adapter | Render derived result through existing surfaces | Preserve accepted Rail/Sheet/stage owners; no RC page/CSS copy. |

## SQL and API contract

**SQL:** none in this unit. No new table, column, RLS policy, RPC or migration.

**API:** none in this unit. No new endpoint, request field or response field is introduced.

If implementation discovers either is required, stop this unit and submit a new contract revision before code changes.

## Type definitions

```ts
export type LifeStage = 'unknown' | 'fry' | 'juvenile' | 'subadult' | 'adult';

export type TankState = 'stable' | 'watch' | 'intervene' | 'urgent' | 'unknown';
export type TankStateAction = 'no_action' | 'observe' | 'adjust' | 'urgent_action' | 'complete_check';

export type TankObservationCode =
  | 'normal_feeding' | 'normal_activity' | 'no_persistent_chasing' | 'no_injury'
  | 'no_hiding_pressure' | 'persistent_chasing' | 'hiding_pressure'
  | 'feeding_exclusion' | 'appetite_drop' | 'injury' | 'severe_injury'
  | 'respiratory_distress' | 'multiple_deaths' | 'cloudy_water' | 'odor';

export type WaterChangeScheduleStatus = 'unknown' | 'complete' | 'not_due' | 'due' | 'overdue';
export type WaterChangeAction = 'none' | 'record_water_change' | 'check_water_quality';
```

## Product rules

1. Planning compatibility is not a diagnosis of the current tank. Theoretical risk without current observations can at most produce `watch` / `observe`.
2. Current `intervene` or `urgent` requires an active hard constraint or recent observed signal; cohabitation duration alone is never proof of stability.
3. Water-change calendar status is not a current emergency diagnosis. Severe/water-quality signals require checking current conditions before a calendar-driven action.
4. A fry candidate with adult residents returns `insufficient_data` unless reviewed stage evidence supports a stronger conclusion.
5. All existing `unknown`, `juvenile` and `adult` records continue to parse and display unchanged.

## Expected files

- `src/types.ts`
- `src/data/compatibilityEvidence.ts`
- `src/lib/tankCompatibilityEngine.ts`
- `packages/domain-rules/src/{index,bioload,tank-state,water-change}.ts`
- `src/services/aquarium/{tank-state-evidence,tank-state-presentation,water-change,water-change-decision}.service.ts`
- Deterministic tests plus relevant acceptance-case documentation

## Explicit exclusions

- `apps/api/**`, `CONTRACT.md`, Supabase migrations, RLS and new persistence fields
- RC `Aquarium.tsx`, `Encyclopedia.tsx`, `CareEncyclopedia.tsx`, page components and global CSS
- Vercel runtime/deployment contract changes
- Recommendation-authority migration (a later unit)

## Approval question

Approve this contract exactly: **expand only the local `LifeStage` union and add pure/local derived evidence services; make no SQL, API, Supabase, persisted-state or UI-geometry change.**

After approval, implementation will port the listed files with deterministic tests, then run the visual matrix to prove the 4317 baseline did not change.
