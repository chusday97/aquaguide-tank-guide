# Result UX V1

## Purpose

Result UX V1 standardizes AquaGuide result-heavy surfaces so users see the practical decision before long explanations.

The first screen prioritizes:

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

Evidence remains action-scoped and fail-closed. A publisher/source name or model output alone never upgrades a recommendation to Verified.

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

Fail-before: Result UX run `32346056247`.

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

Fail-before: Result UX run `32348162424`.

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

### Live AI Tank Copilot — DONE

The authoritative live AI surface is the **AI Tank Copilot embedded in `src/pages/Aquarium.tsx`**. `src/pages/AIAssistant.tsx` remains unrouted legacy code and was not reintroduced.

Fail-before:

- `2fbdfcb373a9e32ebe274c090c9fdbf8397a6354` — live Copilot Result UX browser contract;
- run `32358918838` — all earlier consumers passed, while the live Copilot step failed because the visible quick action did not open the real dialog.

Product / permanent commits:

- `582e9e341b0231ae30c6d37fa6536ef0d0498de7` — live entry + decision-first AI-boundary migration;
- `e33bf81e205e85ec7f4ba59dfd3381f859b0d94c` — temporary migration removed and workflow restored to read-only;
- `4a4388f41ffafa902bf6f9bc25e2d2130cd09498` — evaluator correction for closed disclosure DOM reads.

Contract:

- visible `AI 建缸助手` entry opens the real Copilot dialog;
- generated result consumes shared `DecisionResultSurface`;
- the hero title/summary and primary action come from locally controlled action semantics;
- model `goalUnderstanding` and `planSummary` start behind progressive disclosure;
- model-originated supporting context is `candidate`, never Verified;
- one stable `data-tank-copilot-primary-action` is exposed;
- `data-tank-copilot-ai-boundary` explicitly states that compatibility, risk level and whether an addition is allowed remain governed by local product rules;
- `sanitizeTankCopilotResponse`, candidate filtering, action allowlist and local fallback remain intact;
- no model text is allowed to become the authoritative compatibility/risk verdict.

PUI-BC-054 records the real reachability defect discovered by this fail-before.

## Authoritative seven-consumer baseline

Clean head:

- `4a4388f41ffafa902bf6f9bc25e2d2130cd09498`

Result UX V1 / run `32359908856` — **PASS**:

- static Result UX contract;
- Tank Copilot deterministic boundary contract;
- TypeScript;
- production build;
- Diagnosis browser regression;
- Compatibility browser regression;
- Knowledge browser regression;
- Procedure browser regression;
- Species Detail + parent-context browser regression;
- Identification uncertainty + explicit-confirmation browser regression;
- Tank Copilot live-entry + AI-authority browser regression;
- evidence artifact upload.

Same-head safety gates:

- Plant Roster Edit Fix / run `32359908896` — **PASS** including Navigation Context;
- Compatibility Stage Risk V1 / run `32359909061` — **PASS** including adult-control → fry-treatment browser regression.

All permanent Result UX workflow validation is read-only (`contents: read`).

## Migration status

All intended live Result UX consumers are complete.

The migration sequence remains the required pattern for future result-heavy surfaces:

**fail-before contract → product migration → browser proof → permanent contract → documentation update.**

## Deployment policy during repair

Vercel automatic Git deployments are disabled via `git.deploymentEnabled: false`. GitHub Actions is the iterative validation layer; hosted Preview and Production are explicit milestone actions only.

## Next phase

Result UX itself is no longer the blocker. The remaining work is upstream/integration/production-readiness closure:

1. inspect #104 and the intended integration/RC target;
2. compare branch deltas for conflicts or stale duplicated work;
3. inspect review threads and required checks;
4. resolve evidenced integration blockers only;
5. rerun combined permanent gates after any retarget/rebase;
6. make an explicit merge/deployment decision only when readiness is proven.
