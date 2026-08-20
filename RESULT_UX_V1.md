# Result UX V1

## Purpose

Result UX V1 standardizes AquaGuide result-heavy surfaces so users see the practical decision before long explanations.

The first screen should prioritize:

1. one result / verdict;
2. one primary action or first operational step;
3. at most two follow-up actions;
4. what to watch next and when to escalate;
5. evidence and sources behind progressive disclosure.

## Shared contract

`src/components/result/DecisionResultSurface.tsx` provides:

- one decision/action hero;
- bounded hero explanation;
- maximum two follow-up actions;
- compact watch / escalation guardrails;
- compact avoid guidance;
- reasoning and sources collapsed by default;
- explicit reviewed vs candidate evidence state.

Evidence remains action-scoped and fail-closed. A publisher or source name alone never upgrades a recommendation to Verified.

## Migrated and browser-verified consumers

### Diagnosis

- primary action before causal explanation;
- bounded follow-up actions;
- explicit watch / escalation boundaries;
- existing diagnosis context retained.

### Compatibility

- verdict first;
- deterministic blocking / safety remains authoritative;
- candidate evidence remains fail-closed;
- pair-level details remain behind progressive disclosure.

### Knowledge

- key takeaway / first action precedes long explanation;
- primary CTA remains first-screen;
- follow-up actions capped at two;
- detailed explanation collapsed by default;
- Care evidence retains original `immediate` action kind and index.

Knowledge fail-before:

- Result UX V1 / run `32340512920` — expected FAIL only at Knowledge.

### Procedure

Procedure fail-before:

- Result UX V1 / run `32341637554` — expected FAIL only at Procedure because the old implementation did not expose `care-procedure-decision`.

Product migration:

- `49fd00385126fd4adef3d533ac87d302a3df9943` — `Migrate Procedure to decision-first Result UX`.

Procedure contract:

- first concrete procedure step is the decision hero;
- next two steps are bounded follow-ups;
- evidence mapping preserves original immediate-action indexes;
- post-operation observation is watch guidance;
- reminders become compact avoid guidance;
- legacy duplicate `Follow Steps Sequentially / 现在按顺序做` first-screen card is removed;
- completion actions such as `去记录本次换水 / Record Water Change in Tank` remain after the operation;
- detailed explanation remains collapsed behind `secondary_evidence`.

## Authoritative four-consumer baseline

Clean head:

- `bcf2f24911b7516d08dc077a86fcec05b0333c10`

Result UX V1 / run `32345353470` — **PASS**:

- static Result UX contract — PASS;
- TypeScript — PASS;
- production build — PASS;
- Diagnosis browser regression — PASS;
- Compatibility browser regression — PASS;
- Knowledge browser regression — PASS;
- Procedure browser regression — PASS;
- evidence artifact upload — PASS.

Same-head Plant Roster Edit Fix / run `32345353485` — **PASS**, including plant quantity/edit and existing Navigation Context regression.

Permanent cleanup is complete:

- Procedure-specific assertions are in `scripts/test-result-ux-contract.mjs`;
- `.github/workflows/result-ux-v1.yml` is read-only (`contents: read`);
- temporary Procedure migration workflow is removed.

## Remaining consumers

- Species Detail
- Identification
- AI Assistant

## Migration rule

Continue one consumer at a time:

**fail-before contract → product migration → browser proof → permanent contract → documentation update.**

Additional guardrails:

- Species Detail must preserve Aquarium roster → Species Detail → immediate-parent roster return, including applicable focus/scroll context (PUI-BC-052).
- Identification must preserve confidence and uncertainty semantics; uncertain recognition must not be displayed as certain identification.
- AI Assistant must present direct answer/action before long reasoning and must not override deterministic product truth.
- Result UX changes hierarchy and presentation, not underlying domain truth rules.

## Deployment policy during repair

Vercel automatic Git deployments are disabled via `git.deploymentEnabled: false`. GitHub Actions is the iterative validation layer; hosted Preview and Production are explicit milestone actions only.
