# AquaGuide User Journeys

Status: `ACCEPTED`

This document defines durable task-path intent. Detailed rule thresholds and state transitions belong in `docs/rules/*`.

## Journey A — Existing aquarium daily loop

1. User opens My Aquarium.
2. AquaGuide reads the selected aquarium, recent maintenance history, observations and current deterministic state.
3. The first screen communicates the current tank state and one highest-priority Today Action.
4. User may record a normal check, report something abnormal, record feeding/water change, or manage livestock.
5. New observations/history update the current state.
6. The product advances the Today Action instead of repeatedly asking for the same completed task.

The daily loop must distinguish prior theoretical risk from evidence that something is currently wrong.

## Journey B — Record what is already in the aquarium

1. User chooses “record existing livestock”.
2. User records species, quantity and known entry/state facts.
3. AquaGuide saves the real-world fact first.
4. Compatibility / context assessment may then surface warning, unknown or urgent follow-up.
5. The assessment must not block the factual record merely because future planning would have rejected the same combination.

## Journey C — Plan livestock before adding

1. User chooses a species or combination they are considering.
2. AquaGuide evaluates planning priors, tank context, reviewed evidence and missing information.
3. The system returns one of the planning outcomes defined by the compatibility rule set.
4. Caution requires explicit confirmation; insufficient information requires completion or clarification; a true planning block prevents the planned addition action.
5. Browsing species detail remains read-only until the user explicitly enters the planning/addition task.

## Journey D — Daily Check / observed abnormality

1. User starts Daily Check or reports an abnormal observation.
2. The product asks only the questions needed to capture observable evidence.
3. Deterministic diagnosis rules produce priority, immediate actions, avoid actions, missing information and follow-up.
4. Saving a Daily Check writes the observation against the active aquarium and updates the current-state context.
5. A normal observation can increase confidence that the current aquarium remains stable; an abnormal observation may escalate Today Action.

## Journey E — Water-change record and decision

1. User records a water change as a factual event; future dates are not accepted as completed history.
2. AquaGuide keeps historical water-change facts separate from the decision of whether another change is currently needed.
3. The recommendation layer considers maintenance baseline plus relevant tank context, recent evidence and time.
4. The UI may reuse the existing water-change calendar and action controls while the decision source changes.

## Journey F — Timeline / reality history

1. AquaGuide aggregates real aquarium events such as setup, livestock changes, water changes, feeding, checks and completed care plans.
2. Derived legacy events remain identifiable as inferred rather than direct observations.
3. Timeline history becomes evidence available to the current-state engine; elapsed time alone must not be treated as proof that the aquarium was continuously stable.
