# AquaGuide Acceptance Cases

Acceptance cases prove product rules. Use `GIVEN / WHEN / THEN / MUST NOT` and link every case to stable Rule IDs.

---

## BC-STATE-001 — Prior risk without current abnormal evidence

**Verifies:** `AQ-STATE-001`, `AQ-STATE-005`, `AQ-DIAG-001`

**GIVEN**  
An existing aquarium contains a species combination with a medium theoretical aggression/territory prior.

**WHEN**  
Recent observations show normal feeding/activity, no persistent chasing, no injury and no hiding abnormality, and no hard constraint is present.

**THEN**  
The current-state layer may remain `stable` or another non-intervention observation state justified by the evidence.

**MUST NOT**  
Convert the theoretical prior directly into a red current-conflict alert or an instruction to remove livestock.

---

## BC-SPACE-001 — Below recommended tank size but currently normal

**Verifies:** `AQ-SPACE-001`, `AQ-SPACE-004`

**GIVEN**  
An existing aquarium is below a species' general recommended volume/length guideline.

**WHEN**  
There is no hard physical constraint and current observations do not show activity restriction, persistent aggression, injury, respiratory distress or another evidence-backed problem.

**THEN**  
The recommendation remains a planning/space prior that can be explained as a future pressure or observation point.

**MUST NOT**  
Diagnose the tank as currently unsafe, claim an exact overload percentage, or make “move fish / upgrade tank now” the primary action solely from the recommendation gap.

---

## BC-MIX-001 — Aggressive metadata is not active predation

**Verifies:** `AQ-MIX-003`, `AQ-DIAG-001`

**GIVEN**  
A stocked species is labeled `Aggressive` or `Territorial` and another stocked species is peaceful/small.

**WHEN**  
There is no reviewed predation evidence and the user has not observed chasing, injury, hiding pressure or feeding exclusion.

**THEN**  
AquaGuide may retain aggression/territory prior risk and suggest what to observe.

**MUST NOT**  
Promote the label alone into an active predation diagnosis or a guaranteed current conflict.

---

## BC-WATER-001 — Maintenance baseline overdue without abnormal evidence

**Verifies:** `AQ-WATER-001`, `AQ-WATER-002`, `AQ-WATER-004`

**GIVEN**  
The configured/derived water-change baseline date has passed.

**WHEN**  
There is no current respiratory, odor, cloudiness, death or other evidence-backed urgent condition.

**THEN**  
The product may surface the maintenance task as due/recommended according to the water-change rule.

**MUST NOT**  
Classify the aquarium as urgent solely because the calendar baseline is overdue.

---

## BC-RECORD-001 — Existing reality survives planning risk

**Verifies:** `AQ-MIX-002`

**GIVEN**  
A user reports livestock that is already physically present in an aquarium.

**WHEN**  
The planning compatibility result is `caution`, `insufficient_data` or `not_recommended`.

**THEN**  
The factual livestock record is saved and the assessment is surfaced after/with the save.

**MUST NOT**  
Reject the factual record merely because a future planned addition would have been gated.

---

## BC-AI-001 — AI cannot downgrade deterministic risk

**Verifies:** `AQ-AI-001`, `AQ-AI-003`

**GIVEN**  
Deterministic rules require a minimum `watch` or `urgent` priority.

**WHEN**  
The AI interpretation returns a lower priority or omits the deterministic blocking fact.

**THEN**  
The final product result preserves the deterministic minimum and the blocking fact remains visible.

**MUST NOT**  
Let the model downgrade or erase deterministic safety/state output.
