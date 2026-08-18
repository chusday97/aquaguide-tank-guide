# AquaGuide handoff — PUI-BC-038

Date: 2026-08-18
Branch: `agent/water-change-cloud-persistence`
PR: #93 `Persist water-change history across cloud reloads`
Status: regression verified on Product Golden Path run 785

## User-visible failure

A water-change action could report failure while part of the cloud mutation had already succeeded. The care timeline was mutated before `repository.saveAquarium(...)`; if the aquarium write then failed, a canonical `water_change_day` event could remain added/removed even though the aquarium state was not saved.

This affected both:

- Today's primary water-change action, including undoing today's record and writing a `water_change_reversal` event.
- Historical calendar add/remove actions.

The result was a half-persisted state that could reappear differently after reload.

## Root cause

The UI performed multiple independent repository writes as if they were one operation, but there was no transaction or compensating action between the care-event write and aquarium write.

## Fix

`src/pages/Aquarium.tsx` now uses a best-effort compensating transaction for water-change writes:

1. Create `rollbackActions` before external mutations.
2. After every successful care-event mutation, register its inverse.
3. Persist the aquarium only after required timeline mutations succeed.
4. If any later operation fails, run compensations in reverse order through `runWaterChangeRollbacks(...)`.
5. Only update visible aquarium state after repository persistence succeeds.
6. If compensation itself fails, show a stronger sync warning that asks the user to refresh before retrying instead of presenting a normal retry error.

## Covered paths

- Add today's water change → remove canonical event on failure.
- Undo today's water change → restore canonical event and remove reversal event on failure.
- Add historical water-change date → remove canonical event on failure.
- Remove historical water-change date → restore canonical event on failure.

## Verification

Fail-before was intentionally established first. The contract failed with:

`Today water-change action must stage compensating care-event rollbacks before repository persistence can fail.`

After the product fix, Product Golden Path run 785 passed:

- Product evaluation contracts
- Water-change cloud persistence contract
- TypeScript check
- Production build
- Care card action regression
- GP-001 first tank setup
- GP-002 continuous path
- GP-003 returning Daily Check
- GP-004 abnormal care
- GP-005 collection context

## Remaining boundary

This is a saga-style best-effort compensation, not a database-level distributed transaction. If both the original write and a compensating write fail because the repository is unavailable, the UI surfaces an explicit inconsistency warning. A future Operations Console should expose these sync failures for manual reconciliation.
