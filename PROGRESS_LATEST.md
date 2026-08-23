# AquaGuide — Latest Progress

**Updated:** 2026-08-23
**Branch:** `agent/p0-water-change-authority-v1`
**PR:** #118 `Route Water Change through deterministic authority V1`
**Base:** `agent/p0-existing-tank-authority-wiring-v1` (#117)
**Current RC1 head:** `5e605fb7a68001ecd80096ef42f063909cf5aa03`

## Current phase

**P0 decision-layer consolidation is active: #114 Compatibility → #115 Tank State → #116 Tank Evidence → #117 Existing Tank Authority → #118 Water Change Authority. #118 is Draft and awaiting permanent gates.**

No P0 stack merge to RC1, no merge to `main`, and no production deployment has been performed.

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

## 2026-08-23 — P0 Tank Evidence Adapter V1

- #115 Tank State candidate gates PASS: Tank State `32621472344`, Compatibility `32621472315`.
- added `tank-state-evidence.service.ts` to translate existing persisted facts into Tank State inputs.
- explicit Daily Check / diagnosis answers map to normal, chasing, hiding, appetite, injury, respiratory, death and water-condition observations.
- Planning Compatibility output becomes Prior Risk; only narrow deterministic freshwater/marine rule codes become immediate hard constraints in v1.
- current combination age starts at the latest entry of the currently stocked combination, not the first animal ever added.
- prose/AI/result-summary keywords are not promoted into authoritative observation codes.
- regression includes the concrete 40cm + 2 mini-parrot case: space guidance remains prior and recent normal reality yields current `stable`, not immediate intervention.
- Aquarium UI/Today Action wiring remains intentionally pending for the next stacked PR.

## 2026-08-23 — P0 Existing Tank Authority Wiring V1

- #116 stacked gates confirmed PASS before wiring: Evidence `32621938239`, Compatibility `32621938236`, Tank State `32621938229`.
- Replaced Aquarium page-level static `Aggressive/Large/tankSize/heuristic bioload` current-risk authority with `deriveCurrentTankState()` + presentation adapter.
- Removed `blockingCompatibilityRisk -> Today Action` bypass; Current Tank State now owns current risk and Today Action semantics.
- Normal patrol no longer upgrades to medium from inherited `riskCount`; explicit structured answers remain the observation authority.
- Added permanent source contract plus browser regression for Existing Tank authority.
- Browser PASS 3/3: 40cm + 2 mini-parrots normal -> routine; reviewed tiger-barb + mini-parrot prior normal -> routine; freshwater/marine hard constraint -> high-priority current review.
- Existing GP-003 returning Daily Check and GP-004 abnormal-care browser paths PASS after wiring.
- `AQ-BC-SPACE-001`, `AQ-BC-MIX-001`, `AQ-BC-STATE-001` upgraded to regression-verified on this candidate.
- Pre-existing `test:compatibility-evidence-coverage` provenance drift reproduced on #116 baseline and logged as `AQ-BC-EVAL-002`; intentionally not mixed into this fix.

## 2026-08-23 — P0 Water Change Engine V1

- fail-before commit `1afcd15` reproduces 0/3 gaps on #117 head: shortest species cycle as page authority, calendar overdue -> high priority, and no distinct recommendation engine.
- #117 Existing Tank Authority permanent gates confirmed PASS before this layer: Existing Tank `32623274776`, Evidence `32623274708`, Tank State `32623274730`, Compatibility `32623274742`.
- Added deterministic `packages/domain-rules/src/water-change.ts` plus Aquarium adapter `water-change-decision.service.ts`.
- Completed-water-change history and derived recommendation are now separate; future dates are ignored as completed history by the decision engine.
- Stocked-species `waterChangeCycle` remains a maintenance baseline; Aquarium no longer owns a fallback `shortestCycle -> overdue -> high priority` decision chain.
- Removed overdue-days health-score deduction so maintenance lateness is not silently presented as current biological danger.
- Baseline overdue without abnormal evidence produces a medium maintenance task and explicitly does not imply urgent Current Tank State.
- Current water/physiological signals remain evidence inputs, while Existing Tank Current State keeps higher authority in the Today Action ordering.
- `test:p0-water-change` PASS 8/8; authority source contract PASS; Existing Tank/Tank Evidence/Tank State/Compatibility/Daily Check/Core Flow/Visual Results remain green.
- TypeScript and production build PASS.
- Browser regression PASS at 390/900/1600px; Existing Tank browser 3/3, GP-003 and GP-004 remain PASS.
- `AQ-BC-WATER-001` migrated into the canonical badcase ledger as REGRESSION_VERIFIED on this candidate.
- Draft stacked PR #118 `Route Water Change through deterministic authority V1` opened against #117 head.
- Final PR branch is `agent/p0-water-change-authority-v1`; the parallel `agent/p0-water-change-engine-v1` remains unreviewed and is not used as Product Truth.
- Unconfirmed AQ-WATER-005/006 from that parallel branch were intentionally excluded from #118 in accordance with Context Sync acceptance rules.
- #118 final-head permanent gates PASS: Water Change `32638235738`, Existing Tank `32638235771`, Evidence `32638235730`, Tank State `32638235711`, Compatibility `32638235721`.
- #118 remains Draft/unmerged; next P0 implementation target is the remaining Whole-Tank Feasibility dimensions.
