# Water Change Rules

Status: `ACCEPTED`

## AQ-WATER-001 — Water-change history and water-change recommendation are separate

A completed water change is a factual event. The decision about whether another water change is needed is a derived recommendation.

Do not use the same field or rule as both historical truth and current decision authority.

## AQ-WATER-002 — Species cycle is a baseline, not the sole decision rule

A species `waterChangeCycle` or the shortest cycle across stocked species may be used as a maintenance baseline, but it must not be the only reason for the final Today Action.

The recommendation layer should also consider relevant tank context, recent maintenance history, observed evidence and time.

## AQ-WATER-003 — Future dates cannot be completed history

A user may record a water change for today or a real past date. A future date must not be stored as an already completed water-change event.

## AQ-WATER-004 — Urgency requires current evidence or a true hard condition

Being late relative to a maintenance baseline does not automatically mean the aquarium is in an urgent current state.

Urgency should be supported by current abnormal evidence or another deterministic condition that genuinely requires immediate action.
