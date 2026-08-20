# AquaGuide Handoff — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Base:** `agent/uiux-system-refactor-v1` (#104)  
**Latest browser-verified Result UX code baseline:** `ec55754dbbacf038d7b5e48d1a663f9e1a8cea18`

## Current state

PR #105 is **open, mergeable and Draft**. It is **not merged** and no production deployment is claimed.

Result UX V1 now has three browser-verified consumers:

1. Diagnosis;
2. Compatibility;
3. Knowledge.

The project is no longer in a “shared component only” state. The permanent Result UX gate proves the first three consumers against the same decision-first contract.

## Shared Result UX contract

`src/components/result/DecisionResultSurface.tsx` establishes:

- one primary result / verdict;
- one primary action;
- maximum two follow-up actions;
- compact watch / escalation guardrails;
- compact avoid list;
- bounded hero explanation;
- reasoning and sources behind progressive disclosure;
- reviewed vs candidate evidence state.

Evidence remains fail-closed and action-scoped. A publisher/source name by itself never upgrades a recommendation to Verified.

## Consumer status

### Diagnosis — browser verified

- primary action appears before causal explanation;
- follow-up actions stay bounded;
- watch/escalation boundaries remain available;
- existing diagnosis context remains intact.

### Compatibility — browser verified

- verdict appears first;
- deterministic blocking/safety rules remain authoritative;
- AI presentation does not override deterministic rules;
- candidate source state remains fail-closed.

### Knowledge — browser verified

Fail-before was explicitly captured before product migration:

- Result UX V1 / run `32340512920` — FAIL only at Knowledge;
- contract, TypeScript, build, Diagnosis and Compatibility passed;
- failure was the expected absence of `care-knowledge-decision` in the old Knowledge implementation.

Current Knowledge behavior:

- shared `DecisionResultSurface` is used;
- key takeaway / first action precedes the long explanation;
- primary CTA remains first-screen;
- shared follow-up actions are capped at two;
- detailed long-form explanation is collapsed by default;
- action evidence retains the original Care `immediate` kind and action index so source identity is not changed by presentation reordering.

Implementation commit:

- `472d53859726c9828caa5d73716f06ed9b198190` — migrate Knowledge to decision-first Result UX.

Follow-up evidence API correction was required after TypeScript correctly rejected a two-argument `getCareActionEvidenceForText` call. The fixed implementation passes the explicit `immediate` kind and original index rather than weakening the type/evidence contract.

## Authoritative Result UX evidence

Verified code baseline:

- `ec55754dbbacf038d7b5e48d1a663f9e1a8cea18`

Permanent workflow:

- `.github/workflows/result-ux-v1.yml`

Result UX V1 / run `32341238477` — **PASS**:

- Result UX static contract — PASS;
- TypeScript — PASS;
- production build — PASS;
- Diagnosis decision-first browser regression — PASS;
- Compatibility decision-first browser regression — PASS;
- Knowledge decision-first browser regression — PASS;
- Result UX evidence artifact upload — PASS.

The one-off migration workflow/scripts used to make surgical edits were removed after the product changes landed. There is no remaining Knowledge self-modifying workflow on the branch.

## Plant roster / legacy plant closure retained

The prior legacy plant path:

`1株 → edit → 2株 → reload`

was investigated before changing product persistence logic.

Diagnostics proved the saved record, batch quantity and visible roster were already `2` immediately after save. The reload failure came from the Playwright fixture re-running `localStorage.clear()` and restoring the original `1株` fixture on reload.

Final evaluator fix seeds storage only once per browser context.

- Plant Roster Edit Fix / run `32338616480` — PASS.
- Evaluator defect is recorded as PUI-BC-053 in `BADCASE_LATEST.md`.

Do not reopen the disproven local-aquarium load-race hypothesis without new independent product evidence.

## Upstream #104 relationship

#105 still targets `agent/uiux-system-refactor-v1` (#104) and assumes its UI/UX system and navigation contracts.

Important inherited contracts include:

- PUI-BC-050 Compatibility risk-review/navigation semantics;
- PUI-BC-051 Search deep-result return context;
- PUI-BC-052 Aquarium roster → Species Detail → immediate-parent roster return.

Any future Species Detail Result UX migration must explicitly preserve PUI-BC-052. Do not simplify the result UI by breaking nested parent return, focus restoration or roster context.

## Remaining Result UX boundary

Not yet declared migrated:

- Procedure;
- Species Detail;
- Identification;
- AI Assistant.

The continuation rule remains:

**one consumer → fail-before contract → product migration → browser proof → documentation update.**

Procedure is the next candidate because it shares the CareEncyclopedia evidence/CTA model with Knowledge and has lower navigation regression risk than Species Detail. It must still receive its own fail-before proof before migration.

## Current non-blockers / engineering debt

- Vite still reports large-chunk and mixed dynamic/static-import warnings.
- Existing npm dependency vulnerability debt remains outside Result UX scope.
- Vercel free-plan preview quota can fail externally; do not treat that as an application build failure.
- Thin wrapper/Base structures inherited from #104 remain deliberate risk-containment debt.

## Merge-readiness judgment

**The three-consumer Result UX slice is verified, but PR #105 is not yet declared merge-ready.**

Keep Draft because:

1. #105 still depends on #104 and final upstream branch disposition is unresolved;
2. four result consumers remain explicitly unmigrated;
3. any retarget/rebase requires the permanent gates to rerun;
4. Species Detail must retain #104 nested-navigation guarantees when its turn comes.

## Next owner action

1. Treat `ec55754...` + run `32341238477` as the current three-consumer verified Result UX baseline.
2. Start Procedure with a fail-before browser contract, not a direct product rewrite.
3. Keep Species Detail behind explicit Navigation Context acceptance criteria.
4. Do not append evaluator-only PUI-BC-053 to a product-only canonical registry until registry scope is checked.
5. Keep #105 Draft; do not merge or production-deploy from this handoff alone.

## Confidence snapshot

- Result UX shared contract: **verified**
- Diagnosis migration: **verified**
- Compatibility migration: **verified**
- Knowledge migration: **verified**
- Plant structured edit persistence: **verified**
- Legacy `plants[]` edit + reload persistence: **verified**
- Procedure migration: **not started**
- Species Detail migration: **not started**
- Identification migration: **not started**
- AI Assistant migration: **not started**
- #105 merge readiness: **not yet declared**
