# AquaGuide Result UX V1

## Problem

AquaGuide result-heavy surfaces currently expose too many sections at the same visual priority. The information is often correct but expensive to scan: users must read the explanation before they can answer the practical question, “what should I do now?”

Result UX V1 changes the information architecture from **report-first** to **decision-first**.

## First-screen contract

A result surface must let a user answer these questions in roughly five seconds:

1. What is the result / verdict?
2. What should I do first?
3. What should I do next?
4. What should I watch for, and when should I escalate?
5. Where can I verify the recommendation if I want more detail?

The first screen therefore has a hard hierarchy:

- one verdict or primary action;
- one short summary, visually capped at two lines;
- at most two additional actions (three actions total including the primary action);
- compact watch / escalation guardrails;
- at most two “avoid for now” items;
- reasoning and source detail behind progressive disclosure.

## Evidence contract

Evidence must be attached to the action or deterministic rule it supports. A page-level source list is supplementary; it does not prove every recommendation on the page.

### Reviewed

A source may be displayed as **已核验 / Verified** only when the exact action or deterministic rule has reviewed support.

For Care actions this means `CareActionEvidence.reviewStatus === 'reviewed'`.

For Compatibility this means both the rule and the cited reference are reviewed.

### Candidate

Keyword-matched or otherwise plausible references that have not been checked against the exact action must be displayed as **待逐条核验 / Needs action-level review**. They must never inherit a generic “authoritative” label from the publisher name alone.

## UI hierarchy

### 1. Result hero

Use the strongest visual weight only once:

- compact severity/status token;
- one action-oriented title;
- optional two-line explanation;
- optional action-level source line.

Do not place multiple same-weight headings above the primary action.

### 2. Action stack

The primary action belongs in the hero. Show no more than two follow-up actions underneath. Long implementation notes belong in secondary detail, not in the action title.

### 3. Guardrails

A decision is incomplete without a boundary. Results should state:

- what to observe next;
- what change means the current plan is working;
- what signs require escalation, isolation, more data, or professional help where appropriate.

### 4. Progressive disclosure

The default view should not display the full causal explanation, raw answers, rule evidence, and bibliography simultaneously. Put them under two explicit disclosures:

- `为什么是这个结果？ / Why this result?`
- `信息来源 / Sources`

## Surface-specific first question

The shared hierarchy stays the same, but the hero answers a different user question by surface:

| Surface | First question | Hero content |
| --- | --- | --- |
| Diagnosis | “我现在怎么办？” | primary action + severity |
| Compatibility | “能不能一起养？” | verdict + safest next action |
| Knowledge / Procedure | “我现在怎么做？” | key takeaway + first step |
| Species Detail | “适不适合我？” | fit summary + critical constraints |
| Identification | “这是什么？” | top match + confidence / uncertainty |
| AI Assistant | “直接回答我” | answer + primary next action |

## Rollout order

Result UX V1 intentionally starts with **Diagnosis** and **Compatibility** because they are the highest-decision-cost surfaces and already have deterministic evidence structures.

After those are validated in browser QA, migrate:

1. Knowledge / Procedure;
2. Species Detail;
3. Identification;
4. AI Assistant.

Do not migrate all result pages at once. The first two surfaces establish the pattern and reveal whether the hierarchy is actually faster to scan.

## Acceptance criteria

A migrated result surface fails Result UX V1 if any of these are true:

- the user must read a cause analysis before seeing the primary action;
- more than three same-priority actions are visible by default;
- full evidence or bibliography is expanded by default;
- a candidate source is presented as reviewed;
- there is no observable “what next / when to escalate” boundary for a decision-oriented result;
- a paragraph in the hero is allowed to grow into a long report;
- visual hierarchy depends only on color rather than ordering, typography, spacing, and labels.

## Current implementation boundary

`DecisionResultSurface` and `src/modules/result/resultAdapters.ts` establish the shared UI and evidence semantics. The Diagnosis and Compatibility consumer migration remains a separate implementation step and must be browser-validated before this Draft PR is marked ready for review.
