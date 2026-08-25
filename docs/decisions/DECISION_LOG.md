# AquaGuide Decision Log

## D-AQUA-004 — P0 compatibility/current-tank authority migration

- **Status:** `ACCEPTED`
- **Date:** 2026-08-25
- **Decision:** selectively port RC compatibility evidence, derived Current Tank State and derived water-change authority into the unified visual baseline.
- **Constraint:** no RC page component, global CSS, new persistence table, API endpoint or stored Current Tank State is included in the first unit.
- **Approval:** user confirmed `P0_COMPATIBILITY_CONTRACT.md` on 2026-08-25. The accepted unit permits local code and shared type changes only; `CONTRACT.md`, database schema and API remain unchanged.
- **Evidence:** `.ai/P0_MIGRATION_IMPACT.md`; `integration/aquaguide-rc1@895f2f39`; current unified visual baseline.
