# AquaGuide — Latest Progress

**Updated:** 2026-08-22  
**Branch:** `agent/rc1-post-105-evaluator-repair`  
**PR:** #107 `Repair post-#105 RC1 evaluator drift`  
**Base:** `integration/aquaguide-rc1`  
**Current RC1 head:** `e5a9dd1ccc18a296075521fdd01b0407341af617`

## Current phase

**#104 merged → #105 merged to RC1 → post-merge evaluator drift reproduced → evaluator repair verified in #107 → final RC1 acceptance blocked only on #107 merge decision.**

No merge to `main` and no production deployment has been performed.

## Stack convergence

- [x] #104 merged to RC1 via `2f07075e447778ea37229ca07ef485d8c0686d9c`.
- [x] #105 reconciled against the merged #104 ancestry.
- [x] #105 merged to RC1 via `e5a9dd1ccc18a296075521fdd01b0407341af617`.
- [x] RC1 branch verified identical to #105 merge commit after merge.
- [ ] #107 merged to RC1 — **not authorized / not done**.
- [ ] RC1→main acceptance re-proven after #107 — blocked until the previous item is explicitly authorized.

## Post-merge fail-before evidence

The real RC1→main synthetic checks surfaced three failures after #105 merged:

| Gate | Result | Run | Classification |
|---|---|---:|---|
| RC1 Release Acceptance | FAIL | 32575093543 | evaluator drift |
| UI Interaction Repair V1 | FAIL | 32575093548 | evaluator drift |
| Product Golden Path | FAIL | 32575093550 | evaluator drift |

Root causes were stale assumptions about:

- canonical API app variable/mount ownership;
- Species Detail and Encyclopedia wrapper/Base file ownership;
- removed legacy Compatibility verdict DOM markers;
- one-click Species Detail → calculator behavior instead of the current two-stage evidence → calculator intent.

No product-code rollback or threshold relaxation was used.

## #107 evaluator repair

Final functional repair scope is limited to four evaluator/test files:

- [x] `scripts/test-production-cloud-runtime-contract.mjs`
- [x] `scripts/test-ui-interaction-repair-v1.mjs`
- [x] `scripts/verify-ui-interaction-repair-v1.mjs`
- [x] `scripts/verify-golden-path-species-to-stocking.mjs`

No product runtime/CSS/persistence/rule/security/deployment code is part of the repair.

## Executable diagnostic proof

Temporary PR-only diagnostic run `32575689962` — **PASS**:

- [x] production cloud runtime source contract
- [x] production cloud runtime smoke
- [x] UI interaction source contract
- [x] TypeScript
- [x] production build
- [x] UI interaction browser regression
- [x] GP-002 continuous browser path

The temporary workflow was deleted after validation and is not part of the final PR diff.

## Permanent gate matrix on verified repair head

Verified repair head before documentation refresh: `13ef3b4c2fd3c7df9fb43127da4dcf153e1bfc7a`.

| Gate | Result | Run |
|---|---|---:|
| Production Security Boundary V1 | PASS | 32575784071 |
| Dependency Release Baseline V1 | PASS | 32575784098 |
| Compatibility Stage Risk V1 | PASS | 32575784108 |
| Plant Roster Edit Fix | PASS | 32575784097 |
| Result UX V1 | PASS | 32575784082 |

## EVAL-BC-002 — post-#105 evaluator drift

- [x] Captured real post-merge failures instead of assuming #105 merge was release-clean.
- [x] Kept source-contract assertions but migrated them to current owners.
- [x] Replaced removed Compatibility DOM marker checks with current `DecisionResultSurface` semantics.
- [x] Preserved result-first ordering, Unknown != Safe, inline AI explanation and exact navigation-context rules.
- [x] Updated GP-002 to the current deliberate two-stage compatibility intent.
- [x] Proved browser behavior after the migration.
- [x] Removed temporary diagnostic workflow.
- [ ] Merge #107 — requires separate explicit authorization.
- [ ] Re-run actual RC1→main acceptance after merge.

## AI usefulness baseline

PUI-BC-059 remains closed for encoded repository-level failure modes:

- [x] schema-valid is not treated as sufficient;
- [x] deterministic safety remains authoritative;
- [x] missing blocking tank facts outrank subjective preference chatter;
- [x] model empty selection cannot erase deterministic safe/adjustable candidates;
- [x] unnecessary `restart_goal` is rejected when executable candidates exist;
- [x] prompt requires concrete candidate/quantity planning.

Still open before production:

- [ ] representative live-provider cohort;
- [ ] generic-answer rate;
- [ ] candidate-drop rate;
- [ ] hallucinated-preference rate;
- [ ] contradiction handling;
- [ ] invalid JSON recovery;
- [ ] timeout/network fallback behavior.

## Dependency-security baseline

- production audit: **0 findings**;
- full developer/build graph: **12 dev-only findings** = 7 high / 2 moderate / 3 low;
- permanent production dependency gate remains read-only and green.

## Product baseline carried forward

- [x] deterministic compatibility / stage-risk authority boundary;
- [x] plant roster edit;
- [x] decision-first Result UX;
- [x] share-report server-secret boundary;
- [x] Care wide-desktop layout recovery;
- [x] narrow-desktop Aquarium `Today → Context → Manage` hierarchy;
- [x] phone task-first hierarchy preserved;
- [x] identification uncertainty / explicit confirmation;
- [x] Species Detail browsing separated from compatibility selection;
- [x] exact return context across cross-route tasks;
- [x] Tank Copilot authority + usefulness guards.

## Next sequence

1. Make #107 review-ready after final diff/gate confirmation.
2. Await explicit #107 merge authorization.
3. If authorized, merge #107 to RC1 with expected-head protection.
4. Validate the actual RC1→main Release Acceptance / UI Interaction / Product Golden / permanent gates on final ancestry.
5. Run live AI usefulness evaluation.
6. Production env/secrets + post-deploy golden paths only after deployment authorization.
7. Legacy `server/index.mjs` Phase 2 consumer inventory/migration.
8. Knowledge Engine after the release foundation is reproducible.

## Guardrails

- A merged PR is not automatically a release-ready RC.
- Source-contract failures must be classified before modifying product code.
- Browser evidence outranks assumptions from file layout.
- Do not delete assertions merely because architecture moved; migrate them to the real owner.
- Do not weaken visual or browser thresholds to make CI green.
- Preview/build success is not production proof.
- AI cannot override deterministic safety rules.
- Do not merge #107, merge RC1 to `main`, or deploy production without explicit authorization.

## 2026-08-23 — P0 Compatibility decision-layer refactor

- P0-2 Contract Alignment: Planning Compatibility and Current Tank State separated in `CONTRACT.md` (`4d4a238`).
- Fail-before proof `9ed2d76`: 0/4 Product Truth checks passed on the legacy model.
- Candidate P0 engine extracts temperament-independent bioload screening to `packages/domain-rules`.
- `CompatibilityDecision` now carries explicit `wholeTankFeasibility`; 3 × 7 quantity regression proves full-tank aggregation occurs once outside pair loops.
- Generic free-text tank-size guidance is planning pressure, not an implicit hard block.
- Species-fit predation now requires reviewed pair/profile evidence rather than `Large`/`Aggressive` proxy inference.
- Stale addition-intent and visual-result fixtures were migrated without changing UI.
- Targeted compatibility/species-fit/addition/livestock/visual/type/build validation is green locally.

## 2026-08-23 — P0 Tank State Engine V1

- #114 P0 Compatibility dedicated workflow PASS: `32620810633`.
- fail-before commit `72ae99e` reproduced 0/3 Existing Tank authority failures: static aggression -> danger/removal, generic tank-size guidance -> upgrade/move instruction, static compatibility danger -> high-priority Today Action.
- added deterministic `packages/domain-rules/src/tank-state.ts`.
- canonical states: `stable / watch / intervene / urgent / unknown`.
- recent normal evidence can keep a prior-risk tank stable; weak single abnormality watches; repeated/correlated abnormality intervenes; urgent physiological evidence and true hard constraints retain immediate authority.
- cohabitation duration alone never proves stability.
- `test:p0-tank-state` passes 11/11 together with P0 Compatibility, Compatibility, Daily Check, Species Diagnosis and TypeScript.
- Aquarium UI is intentionally not rewired in this candidate; `AQ-BC-MIX-001`, `AQ-BC-SPACE-001`, `AQ-BC-STATE-001` remain OPEN until the Existing Tank wiring PR.
