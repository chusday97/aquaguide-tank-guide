# Unresolved Existing Livestock Contract

This branch implements one narrow rule: **AquaGuide may record a real animal that is already in the user's aquarium even when the catalog cannot identify it, but an unresolved identity must never be promoted into a canonical species or a complete compatibility verdict.**

## Identity states

- `verified`: backed by a canonical `species_catalog_key`.
- `unresolved`: stores the user's `raw_name`; `species_id` and `species_catalog_key` remain null in canonical storage.

Local/device mirrors use an explicit `unresolved:<record-id>` key only for compatibility with legacy `AquariumFish.fishId` consumers. That key is not a catalog identity.

## Intent boundary

### `record_existing`

If catalog search returns no result, the user may record the real-world name and quantity. The UI labels the record `待确认身份 / Identity pending` and explains that full compatibility remains incomplete.

### `planned_addition`

Catalog misses remain non-addable. The UI does not expose the manual unresolved-record CTA. Planned additions still require a canonical catalog species.

## Compatibility boundary

If current livestock contains one or more unresolved records, verified species can still be evaluated against known facts, but the aggregate result receives the missing-evidence rule `unresolved_existing_livestock` and fails closed to `insufficient_data` rather than ignoring the unknown animals.

## Persistence boundary

The new database RPC `add_unresolved_aquarium_livestock`:

- is `SECURITY INVOKER`;
- validates authenticated aquarium ownership;
- uses idempotency keys/request hashes;
- writes an unresolved aquarium-species record plus its first batch atomically;
- does not query or invent a canonical species;
- revokes execution from `PUBLIC` and `anon`, granting only `authenticated`.

The migration is committed in source control but is **not considered deployed until the dedicated AquaGuide Supabase project reports the migration version and post-change verification passes**.

## Regression gates

Permanent read-only CI covers:

- unresolved core/model/API/repository contract;
- legacy livestock recording and atomic addition regressions;
- core-flow regression;
- static UI intent/identity contract;
- existing livestock drawer browser regression;
- full browser path for unresolved `record_existing` and blocked unresolved `planned_addition`;
- API and app TypeScript;
- production build.
