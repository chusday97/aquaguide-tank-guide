# AquaGuide Product Principles

Status: `ACCEPTED`

This document contains cross-domain product truths. Detailed behavior belongs in `docs/rules/*`.

## AQ-PRINCIPLE-001 — Manage the real tank, not only species theory

AquaGuide is a decision-support product for a specific aquarium over time. Species knowledge and compatibility theory provide prior risk, but the product must distinguish that prior from the current state of the user's actual tank.

The core reasoning direction is:

`Prior Risk + Tank Context + Observed Evidence + Time → Current Tank State → Today Action`

Static species theory must not automatically become a claim that the user's current tank is already unsafe or failing.

## AQ-PRINCIPLE-002 — Planning and existing reality are different intents

Future planning may be safety-gated before a user adds livestock.

Facts that already exist in the user's aquarium must remain recordable even when the system identifies risk. The product may warn after the fact is recorded; it must not rewrite or refuse reality merely because a planning rule would have blocked the same choice.

## AQ-PRINCIPLE-003 — Deterministic rules own product authority

Deterministic domain rules own safety boundaries, current-state classification and actions that materially affect the user's aquarium.

AI may interpret language, summarize, explain, generate candidate hypotheses or make the rules easier to understand, but it must not silently override deterministic conclusions.

## AQ-PRINCIPLE-004 — Evidence outranks speculative precision

Prefer observable facts, explicit unknowns and reviewed evidence over invented precision.

Do not present heuristic calculations as exact biological truth when the underlying inputs do not support that precision. Missing or unreviewed information should remain visible as uncertainty rather than being filled with confident assumptions.

## AQ-PRINCIPLE-005 — Today Action should reflect what matters now

The first action shown for an existing aquarium should come from the current tank state, recent observations, real maintenance history and hard constraints.

When there is no current problem requiring action, a stable “nothing must be handled today” state should not be displaced by a theoretical species warning merely because that warning exists in prior knowledge.

## AQ-PRINCIPLE-006 — Preserve the current UI while the decision layer is rebuilt

The current decision-model refactor is not a full UI redesign. Existing Aquarium, Daily Check, Timeline, risk-detail, species-management and result surfaces should be reused where they can display the new model correctly.

UI changes should be limited to the minimum necessary to prevent incorrect semantics or to expose the new authoritative state. The layout and interaction system must not be rebuilt simply because the underlying reasoning model changes.

## AQ-PRINCIPLE-007 — One authoritative definition per product fact

Product rules, acceptance cases, architecture contracts and implementation status have different responsibilities. The same product fact must not be fully duplicated across Handoff, Progress, Contract, code comments and rule documents.
