# P0 Compatibility Authority Acceptance

**Status:** `VERIFIED_LOCAL`  
**Scope:** accepted local-only P0 unit; no database, API, Supabase, persisted-state or UI-geometry change.

| Acceptance case | Evidence | Result |
| --- | --- | --- |
| Existing persisted lifecycle values stay valid; `fry` and `subadult` are local compatibility inputs only | Type check and API-boundary separation | Pass |
| A theoretical prior alone is not reported as a current conflict | `test:p0-tank-state` BC-MIX-001 | Pass |
| Cohabitation time alone never proves stability | `test:p0-tank-state` AQ-STATE-003 | Pass |
| Repeated/combined observation evidence escalates while a single signal remains watch | `test:p0-tank-state` AQ-STATE-006 | Pass |
| Existing diagnosis records are the only source for derived observations and true water-type conflicts remain hard constraints | `test:p0-tank-evidence` 10 assertions | Pass |
| Free description never overrides structured diagnosis choices or creates a severe signal | `test:p0-tank-evidence` free-text-negation case | Pass |
| Water-change calendar does not become an emergency diagnosis | `test:p0-water-change` BC-WATER-001 / AQ-WATER-004 | Pass |
| Existing compatibility load behavior remains intact | `test:compatibility` 17/17 | Pass |
| Reviewed species without reviewed pair evidence fail closed; explicit reviewed pair rules retain authority | `test:compatibility-evidence-coverage`, `test:compatibility-coverage-scorecard` | Pass |
| Tank-level aggregate blocks remain visible to result UI when pair evaluation is species-only | `test:visual-results` aggregate blocker assertion | Pass |
| Approved visual baseline geometry remains unchanged | 4320 build preview: layout, framing, interactive scenes and page matrix | Pass |

## Boundaries

- These services derive results only from existing Aquarium and diagnosis records.
- The existing accepted UI is intentionally not rewired in this unit.
- Cloud schema/RLS/Preview SHA parity remains a separate release gate.
