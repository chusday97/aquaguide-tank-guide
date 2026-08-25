# AquaGuide Product Truth

**Status:** Active  
**Updated:** 2026-08-25  
**Scope:** current product promises on the unified visual baseline. This replaces `CURRENT_PRODUCT_STATUS.md` as the current product-status authority; that older file remains a dated historical snapshot.

## Product promise

AquaGuide helps aquarium keepers record a real tank, understand species and compatibility, complete care tasks, and use AI only behind deterministic safety boundaries and explicit fallbacks.

## Product invariants

1. Real livestock and future plans are different facts. Recording an existing animal must not be blocked by a planning verdict; planning must not silently write to the tank.
2. Deterministic rules own compatibility, current-tank safety, task state and persisted facts. AI may explain or assist but cannot invent or override those facts.
3. Visual AI is optional. If it is unavailable, the product must offer manual species confirmation rather than claiming image recognition works.
4. User-facing data writes go through the Repository/API boundary. The UI must not bypass it.
5. The current user-approved UI is authoritative; business migration must adapt into it rather than replace it.

## Current capability map

| Module | Current status | Included promise | Deliberate boundary |
| --- | --- | --- | --- |
| Aquarium | Available | 3D tank stage, livestock, settings, tasks, records and care entry points | New RC authority changes are not yet migrated. |
| Encyclopedia | Available | Species browse, search/filter, details, collection and compatibility entry points | Evidence coverage is incomplete; no fabricated certainty. |
| Care | Available | Interactive exploration, browse fallback, articles, tasks, reminders and daily-check paths | Guidance evidence still needs broader human review. |
| Identification | Partial | Image/manual candidate path, confirmation and safety triage | Visual provider may be unavailable; manual confirmation is mandatory. |
| Collection | Available | Wishlist, care saves, memorials and achievements | Historical visual variants are not active design sources. |
| Compatibility | Available with evidence gate | Deterministic planning/current-tank flows and safe insufficient-data outcomes | The reviewed-evidence expansion from RC is not yet migrated. |
| Supabase-backed capability | Deployed, user-confirmed | Existing cloud architecture, migrations, RLS and API boundaries exist | Exact connected environment/schema/RLS parity with this unified branch is not yet re-verified. |

## Not current product truth

- A historical PR title is not a feature commitment.
- An old prototype, prior visual audit, or legacy status snapshot is not a current UI instruction.
- “Deployed” does not prove the deployed environment is on the current unified SHA.
- “Passing build” does not grant human visual acceptance.

## Next product change boundary

The next proposed business unit is P0 compatibility, current tank state and derived water-change authority. It requires the contract confirmation described in `.ai/P0_MIGRATION_IMPACT.md` before implementation.
