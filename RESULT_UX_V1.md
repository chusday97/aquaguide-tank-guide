# Result UX V1

## Purpose

Result UX V1 standardizes AquaGuide result-heavy surfaces so users see the practical decision before long explanations.

The first screen should prioritize:

1. one result / verdict or first operational step;
2. one primary action;
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

### Diagnosis — DONE

- primary action before causal explanation;
- bounded follow-up actions;
- explicit watch / escalation boundaries;
- existing diagnosis context retained.

### Compatibility — DONE

- verdict first;
- deterministic blocking / safety remains authoritative;
- candidate evidence remains fail-closed;
- pair-level details remain behind progressive disclosure.

### Knowledge — DONE

- key takeaway / first action precedes long explanation;
- primary CTA remains first-screen;
- follow-up actions capped at two;
- detailed explanation collapsed by default;
- Care evidence retains original `immediate` action kind and index.

Knowledge fail-before: Result UX V1 / run `32340512920` — expected FAIL only at Knowledge.

### Procedure — DONE

Procedure fail-before: Result UX V1 / run `32341637554` — expected FAIL only at Procedure.

Product migration: `49fd00385126fd4adef3d533ac87d302a3df9943`.

Contract:

- first concrete procedure step is the decision hero;
- next two steps are bounded follow-ups;
- evidence mapping preserves original immediate-action indexes;
- post-operation observation is watch guidance;
- reminders become compact avoid guidance;
- legacy duplicate first-three-step block is removed;
- completion actions remain after the operation;
- detailed explanation remains collapsed.

### Species Detail — DONE

Fail-before: Result UX run `32346056247` — expected FAIL only because the old implementation lacked `species-detail-decision`.

Product / permanent commits:

- `0e7f1dd1e2b8850d473d97f166579f5803889ccd` — decision-first migration;
- `d4e325ad05206f3850ce1845f27ea2e09c32f975` — permanent contract / cleanup.

Contract:

- contextual tank-fit decision is first-screen;
- one stable primary CTA;
- Aquarium-owned tank-record action retained;
- reasons/evidence moved behind progressive disclosure;
- inherited PUI-BC-052 remains mandatory: Aquarium roster → Species Detail → exact immediate-parent roster return, including originating focus and workspace scroll restoration.

### Identification — DONE

Fail-before: Result UX run `32348162424` — expected FAIL only at the absent `identify-decision` in the old implementation.

Product / permanent commits:

- `95538f6cc23afc6e9dc6d3156c489647ca3cb45d` — candidate review migration;
- `fd4a9de553a43d09d560115867c3636cc9e2be38` — permanent uncertainty contract;
- `4f2fa3fa9aa41889b124b1c8097e4fe106c8ea26` — stable confirmed-state contract;
- `6d311ed18fde2241a9aa27400809634155921fa6` — read-only cleanup.

Contract:

- AI candidates are explicitly framed as needing user confirmation;
- ambiguous recognition retains multiple choices;
- no candidate is auto-confirmed;
- explicit candidate buttons continue through `confirmFish`;
- confirmed state is species-bound with `data-identify-confirmed={selectedFish.id}`;
- candidate review and confirmed identity remain separate stages;
- health triage remains a separate explicit action and does not auto-start.

The intermediate failure waiting for `物种已确认` was an evaluator copy mismatch. The permanent browser test now verifies semantic confirmed state rather than translated literal text.

## Authoritative six-consumer baseline

Clean head:

- `6d311ed18fde2241a9aa27400809634155921fa6`

Result UX V1 / run `32357720875` — **PASS**:

- static Result UX contract;
- TypeScript;
- production build;
- Diagnosis browser regression;
- Compatibility browser regression;
- Knowledge browser regression;
- Procedure browser regression;
- Species Detail + parent-context browser regression;
- Identification uncertainty + explicit-confirmation browser regression;
- evidence artifact upload.

Same-head safety gates:

- Plant Roster Edit Fix / run `32357720873` — **PASS** including Navigation Context;
- Compatibility Stage Risk V1 / run `32357720857` — **PASS** including adult-control → fry-treatment browser regression.

All permanent Result UX workflow validation is read-only (`contents: read`).

## Final live consumer: AI Tank Copilot

The last Result UX consumer is the **live AI Tank Copilot embedded in `src/pages/Aquarium.tsx`**.

Architecture clarification:

- `src/pages/AIAssistant.tsx` exists as legacy code but has no route in `App.tsx` and no `taskRoutes` entry;
- README defines the implemented AI module as **AI Tank Copilot**;
- Result UX V1 therefore targets the live Aquarium Copilot rather than reintroducing the unrouted legacy page.

The Copilot already has deterministic safety containment that must not be weakened:

- model-selected species are sanitized against the local deterministic candidate pool;
- missing questions are restricted to locally allowed information keys;
- actions are allowlisted and locally labeled;
- actions are bounded;
- fallback output is generated locally when the model is unavailable.

Remaining presentation acceptance:

- direct actionable answer/result first;
- one primary action and at most two follow-ups;
- long interpretation/explanation behind disclosure;
- visible AI-assistance label / authority boundary;
- model text must never present itself as a Verified compatibility/risk verdict or override deterministic product truth.

## Migration rule

Continue one consumer at a time:

**fail-before contract → product migration → browser proof → permanent contract → documentation update.**

For the final Copilot consumer, the fail-before must be written against the live Aquarium surface before product hierarchy changes.

## Deployment policy during repair

Vercel automatic Git deployments are disabled via `git.deploymentEnabled: false`. GitHub Actions is the iterative validation layer; hosted Preview and Production are explicit milestone actions only.
