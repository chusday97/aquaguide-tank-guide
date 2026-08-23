# Diagnosis and Observation Rules

Status: `ACCEPTED`

## AQ-DIAG-001 — Theoretical risk is not a current diagnosis

Species traits, compatibility priors and recommended husbandry constraints may guide what to observe, but they do not by themselves prove that the user's current aquarium is presently abnormal.

A current diagnosis must be grounded in observable evidence, explicit hard constraints, or other deterministic facts that actually describe the current tank.

## AQ-DIAG-002 — Ask for observable evidence first

Diagnosis questions should prioritize facts a user can observe or reliably report, such as:

- breathing / surface gasping;
- appetite;
- hiding / inactivity;
- persistent chasing or fighting;
- visible injury;
- deaths;
- water appearance / odor;
- recent water change, medication, feeding or livestock changes.

Do not ask users to provide specialist measurements when the decision can safely be made from simpler evidence.

## AQ-DIAG-003 — Current evidence may escalate state

Repeated or severe abnormal observations may move Current Tank State from `stable` to `watch`, `intervene` or `urgent` according to deterministic rules.

Normal observations can increase confidence in `stable`, but they do not erase a true hard constraint.

## AQ-DIAG-004 — Preserve uncertainty

If required current evidence is missing, report the relevant unknowns instead of silently converting theoretical prior into a current diagnosis.

## AQ-DIAG-005 — Daily Check is a real observation record

A saved Daily Check belongs to the active aquarium and becomes part of its observation history. Repeating a Daily Check on the same local day should update the day's observation rather than create misleading duplicate state history.
