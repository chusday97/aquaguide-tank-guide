# AquaGuide — Latest Handoff

**Updated:** 2026-08-23  
**Repository:** `chusday97/aquaguide-tank-guide`  
**Current RC1:** `integration/aquaguide-rc1` @ `5e605fb7a68001ecd80096ef42f063909cf5aa03`  
**Active context/product-truth PR:** #113 `Adopt AquaGuide Context Sync protocol`  
**Phase:** `P0 Product Truth / decision-layer consolidation`  
**Release boundary:** do not merge RC1 to `main` or deploy production without separate explicit authorization.

## Current product direction

Canonical source-of-truth documents now live under `docs/product/*`, `docs/rules/*`, `docs/cases/*`, `docs/decisions/*`, with routing defined by `docs/CONTEXT_ROUTING.md`.

P0 is focused on replacing duplicated compatibility/capacity/current-risk heuristics with one authoritative decision model while preserving existing UI surfaces.

Relevant accepted rules:

- `AQ-PRINCIPLE-001` — manage the real tank, not only species theory;
- `AQ-MIX-001` — planning compatibility != current tank state;
- `AQ-MIX-006` — pair relationships != whole-tank feasibility;
- `AQ-MIX-009` — existing-tank compatibility becomes Prior Risk input to Tank State;
- `AQ-SPACE-002` — physical space, territory and bioload are separate dimensions;
- `AQ-STATE-001` — Prior Risk + Tank Context + Observed Evidence + Time -> Current Tank State;
- `AQ-AI-001` — AI does not own deterministic product authority.

## P0 freeze

Per `AQ-SEQ-001`:

- PR #112 Interactive Atlas remains Draft and frozen; no further UI expansion during P0;
- isolated capacity fixes are paused unless they implement the shared domain model;
- isolated species-detail fixes are paused unless required to prevent false semantics;
- current UI/layout is preserved while the decision source is rebuilt.

## Compatibility next

Compatibility becomes the Planning / Prior Risk engine.

Canonical planning flow:

`hard constraints -> pair relationships -> whole-tank feasibility -> evidence completeness -> compatible/caution/not_recommended/insufficient_data`

For an existing aquarium, compatibility output is not the final verdict. It is combined with tank context, observations and history by the Tank State layer.

## Next implementation order

1. Finish P0-1 Product Truth and contract alignment.
2. Introduce domain-level Tank State types/evaluator with fail-before acceptance cases.
3. Split Compatibility Prior from Existing Tank current-state interpretation.
4. Separate pair compatibility from whole-tank feasibility.
5. Extract Space / Territory / Bioload into shared domain rules; remove temperament-as-bioload and duplicate page heuristics.
6. Wire existing Aquarium / Visual Result surfaces to the new authoritative outputs without redesigning layout.
7. Only after P0 exit criteria are met, resume paused UI work such as #112.

## Current boundaries

- #113 is docs/agent-instruction only and remains Draft/unmerged.
- #112 remains Draft/unmerged and is explicitly paused for P0.
- `main` is untouched by this P0 work.
- production is not deployed by this work.
