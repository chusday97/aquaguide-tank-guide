# AquaGuide Module Fact Inventory

**Status:** Active  
**Updated:** 2026-08-25  
**Purpose:** cross-layer inventory for the unified branch. This is an evidence index; product promises, data contracts and visual rules remain in their canonical documents.

## Status vocabulary

Only the statuses defined by `docs/01-definition/FEATURE_CATALOG.md` are allowed:

- `CURRENT_VERIFIED`
- `DEPLOYED_REVERIFY_PENDING`
- `PARTIAL_WITH_FALLBACK`
- `RC_MIGRATION_PROPOSED`
- `HISTORICAL_OR_EXCLUDED`

## Current inventory

| Module | Product/UI entry | Domain/Service authority | Data/API dependency | Evidence | Deploy status | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| App shell and surfaces | `src/App.tsx`, shared surface primitives | `UI_REGRESSION_CONTRACT.md` | local route state | layout, surface and page runtime matrices | local verified; deployed parity pending | `CURRENT_VERIFIED` |
| Aquarium workspace | `src/pages/Aquarium.tsx` | `src/services/aquarium/`, `packages/domain-rules/` | Repository, aquarium/livestock contracts | aquarium stage, surfaces, factual-flow and primary-tools tests | deployed reverify pending | `CURRENT_VERIFIED` |
| Livestock fact vs planning | Aquarium livestock flows | `livestock-recording.service.ts`, addition policy | `CONTRACT.md` livestock and intent rules | factual-flow, addition-intents, atomic-addition tests | deployed reverify pending | `CURRENT_VERIFIED` |
| Compatibility | species detail, compatibility and recommendation entry points | `src/lib/tankCompatibilityEngine.ts`, `packages/domain-rules/bioload.ts`, `src/modules/recommendation/recommendation.service.ts` | species/tank facts; local compatibility input | compatibility 17/17, recommendation authority contract, P0 evidence/state tests | local P0 verified; evidence coverage and cloud parity pending | `PARTIAL_WITH_FALLBACK` |
| Tank state and water change | diagnosis/tank task adapters | `packages/domain-rules/tank-state.ts`, `water-change.ts`, aquarium services | existing aquarium/diagnosis records | P0 tank-state 11/11, evidence 10 assertions, water 8/8 | local P0 verified; cloud parity pending | `PARTIAL_WITH_FALLBACK` |
| Encyclopedia and species detail | `src/pages/Encyclopedia.tsx`, `src/components/SpeciesDetailDialog.tsx` | species/compatibility services, canonical evidence presentation and visual result adapters | species catalog, optional API content | interactive scenes, split workspace, species detail and compatibility-evidence tests | deployed reverify pending | `CURRENT_VERIFIED` |
| Care | `src/pages/CareEncyclopedia.tsx` | care category, activity, timeline and task-route services | care articles, reminders and timeline records | care, category, timeline, task-route and mobile-care tests | deployed reverify pending | `CURRENT_VERIFIED` |
| Identification and health triage | `src/pages/Identify.tsx` | identification and triage flow services | candidate confirmation, diagnosis records, optional visual provider | identification/triage separation and fallback tests | deployed reverify pending | `PARTIAL_WITH_FALLBACK` |
| Text AI | assistant and daily-check surfaces | `src/services/ai/ai.service.ts` and API handlers | optional text provider configuration | AI capability, entry-policy and copilot contract tests | provider/fallback parity pending | `PARTIAL_WITH_FALLBACK` |
| Collection and memorials | `src/pages/Collection*.tsx` | collection and memorial services | favorites, memorial and achievement records | collection and memorial tests, collection UI matrix | deployed reverify pending | `CURRENT_VERIFIED` |
| Repository/API/Supabase | repository provider and API services | `src/services/repository/`, `apps/api/` | `CONTRACT.md`, database types, RLS | three-tier, API boundary and repository tests | user-confirmed deployed; exact parity pending | `DEPLOYED_REVERIFY_PENDING` |
| Sharing, feedback and admin content | share/feedback/admin services and pages | corresponding service modules | share, feedback, content API and RLS | share, feedback and admin contract/UI tests | exact Preview/Supabase parity pending | `DEPLOYED_REVERIFY_PENDING` |
| Visual AI | identify fallback surface | AI capability service | optional provider configuration | capability contract and manual-confirmation fallback | provider intentionally optional | `PARTIAL_WITH_FALLBACK` |

## Cross-layer invariants

1. Product rules live in `docs/01-definition/` and `packages/domain-rules/`; components do not reimplement them.
2. Data/API changes follow `database/SQL → database.ts → Service → Repository/API → UI` and require a contract update first.
3. Supabase calls remain behind services/repositories; no component writes directly to the database.
4. UI conclusions are adapted from domain results and evidence; display text cannot raise severity.
5. A local pass, a CI pass, a deployed environment and human acceptance are separate evidence levels.
6. A historical PR may supply evidence only after the affected rule, files, dependency boundary and tests are named in `.ai/RC_MIGRATION_LEDGER.md`.

## Update rule

When a module changes, update this inventory, the linked canonical document, and its acceptance evidence in the same change. A PR title or branch recency never changes a module status.
