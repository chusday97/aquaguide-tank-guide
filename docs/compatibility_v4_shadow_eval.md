# Compatibility V4 Shadow Eval

This artifact is generated from current catalog/runtime authority. It does not call a live model; the provider is deterministic and adversarial so authority guards are regression-testable.

Tank fixture: 120 × 50 × 50 cm, Freshwater, 25°C.

| Case | Species | Deterministic | Rule codes | Shadow AI | Final | Invariant |
| --- | --- | --- | --- | --- | --- | --- |
| V4-SHADOW-3SP-COMPATIBLE | 红莲灯×8 + 喷火灯×8 + 樱桃灯×6 | compatible / reviewed | compatibility_clear | accepted → caution | compatible | PASS |
| V4-SHADOW-3SP-CAUTION | 红莲灯×8 + 喷火灯×8 + 小精灵×1 | caution / reviewed | predation_vulnerability_context | accepted → not_recommended | caution | PASS |
| V4-SHADOW-3SP-BLOCKED | 珍珠麒麟×1 + 变色鱼 (喷火麒麟)×1 + 荷兰凤凰×1 | not_recommended / reviewed | territorial_pressure_context, temperature_range_conflict, tank_temperature_conflict | rejected → compatible | not_recommended | PASS |
| V4-SHADOW-3SP-INSUFFICIENT | 红莲灯×8 + 喷火灯×8 + 黄金灯×1 | insufficient_data / partial | species_evidence_ceiling, water_type_unknown, candidate_water_type_missing | skipped | insufficient_data | PASS |

## Summary

- Total cases: 4
- AI accepted: 2
- AI rejected: 1
- AI skipped: 1
- Final-decision mutations: 0

## Invariants

- Deterministic finalDecision is never mutated by shadow AI.
- Reviewed hard blocks cannot be weakened by AI.
- Incomplete deterministic authority skips the AI provider.
- AI output must remain grounded in allow-listed deterministic rule/evidence authority.
