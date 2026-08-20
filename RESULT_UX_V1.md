# Result UX V1

## Purpose

Result UX V1 standardizes AquaGuide result-heavy surfaces so users see the practical decision before long explanations.

The first screen should prioritize:

1. one result / verdict;
2. one primary action or first operational step;
3. at most two follow-up actions;
4. what to watch next and when to escalate;
5. evidence and sources behind progressive disclosure.

## Shared surface

`src/components/result/DecisionResultSurface.tsx` provides:

- one decision/action hero;
- bounded hero explanation;
- maximum two follow-up actions;
- compact watch / escalation guardrails;
- compact avoid guidance;
- reasoning and sources collapsed by default;
- explicit reviewed vs candidate evidence state.

Evidence remains action-scoped and fail-closed. A publisher or source name alone never upgrades a recommendation to Verified.

## Migrated consumers

### Diagnosis — browser verified

- shared decision surface;
- primary action before causal explanation;
- bounded follow-up actions;
- explicit watch / escalation boundaries;
- existing diagnosis context retained.

### Compatibility — browser verified

- shared decision surface;
- deterministic blocking / safety remains authoritative;
- candidate evidence remains fail-closed;
- pair-level details remain behind progressive disclosure.

### Knowledge — browser verified

- shared decision surface;
- key takeaway / first action precedes long explanation;
- primary CTA stays on the first decision surface;
- follow-up actions capped at two;
- long detailed explanation collapsed by default;
- Care evidence retains original `immediate` action kind and action index.

Knowledge fail-before:

- Result UX V1 / run `32340512920` — expected FAIL only at Knowledge.

Three-consumer verified baseline:

- code head `ec55754dbbacf038d7b5e48d1a663f9e1a8cea18`;
- Result UX V1 / run `32341238477` — PASS.

### Procedure — migrated, browser verification passed in migration run

Procedure fail-before was established before changing product UI:

- Result UX V1 / run `32341637554` — expected FAIL only at Procedure because the old implementation had no `care-procedure-decision` surface.

Product migration commit:

- `49fd00385126fd4adef3d533ac87d302a3df9943` — `Migrate Procedure to decision-first Result UX`.

Migration behavior:

- first concrete procedure step becomes the shared decision hero;
- next two steps become bounded follow-up actions;
- first-step and follow-up evidence preserve original immediate-action indexes;
- post-operation observation is exposed as `watchFor`;
- procedure reminders feed a bounded avoid list;
- the old duplicate “Follow Steps Sequentially / 现在按顺序做” first-screen card is removed;
- completion actions such as `去记录本次换水 / Record Water Change in Tank` remain post-task actions and are not promoted ahead of the actual operation;
- detailed description remains collapsed behind `secondary_evidence` disclosure.

Migration validation run:

- Result UX V1 / run `32344881783` — Procedure browser regression PASS together with Diagnosis, Compatibility, Knowledge, TypeScript and production build.

Permanent static contract now includes Procedure-specific assertions and the one-off migration workflow has been removed. A clean pure-verification CI run on the post-cleanup head remains the final evidence before declaring Procedure fully closed.

## Remaining Result UX consumers

- Species Detail
- Identification
- AI Assistant

## Migration rule

Continue one consumer at a time:

**fail-before contract → product migration → browser proof → permanent contract → documentation update.**

Species Detail must preserve the inherited Aquarium roster → Species Detail → immediate-parent roster return contract. Identification must preserve uncertainty semantics. AI Assistant must not present model output as deterministic product truth.
