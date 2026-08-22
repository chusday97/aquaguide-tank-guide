# AquaGuide — Latest Progress

**Updated:** 2026-08-22  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 (Draft / open / mergeable / unmerged)  
**Base:** `integration/aquaguide-rc1`  
**Latest fully verified product-code head:** `b2b6830f1864f9600fd32a4f87bf6151970545a1`

## Current phase

**#104 merged → #105 retargeted/reconciled → Tank Copilot usefulness repair verified → stale 768px visual evaluator migrated → reconciled stack all-green → live AI evaluation next.**

No #105 merge to RC1/main and no production deployment has been performed by this repair.

## Final reconciled verification matrix

| Gate | Result | Run |
|---|---|---:|
| Production Security Boundary V1 | PASS | 32574415632 |
| Dependency Release Baseline V1 | PASS | 32574415664 |
| Result UX V1 | PASS | 32574415605 |
| Compatibility Stage Risk V1 | PASS | 32574415639 |
| Plant Roster Edit Fix | PASS | 32574415644 |
| Navigation Context V1 | PASS | 32574415647 |
| Bundle Audit V1 | PASS | 32574415704 |
| UI UX Golden V3 | PASS | 32574415709 |
| UI UX Visual QA V2 | PASS | 32574415581 |
| UI UX System Refactor V1 | PASS | 32574415630 |

## PUI-BC-059 — AI parsed result usefulness

Completed for the encoded product-level failure modes:

- [x] Added a permanent usefulness contract separate from schema/safety validation.
- [x] Captured true fail-before in Result UX run `32573810707`.
- [x] Recover deterministic candidates when a model returns an empty selection despite a usable local pool.
- [x] Prevent unnecessary `restart_goal` when the user already has executable local candidates.
- [x] Restore blocking size/volume/temperature/filter questions before preference chatter.
- [x] Keep recovery strictly inside the deterministic safe/adjustable candidate pool.
- [x] Strengthen prompt to require concrete candidate names/quantities and forbid generic workflow filler as the whole plan.
- [x] Preserve required adjustments for caution candidates.
- [x] Remove temporary write workflow after the validated migration.
- [x] Re-verify usefulness + full Result UX on the RC1-reconciled stack.

Fix lineage:

- usefulness fail-before head: `ab5243404a3c770ce5a8ed8905008a973de37dfa`
- policy: `ef843ef384d09cb79d8ac7df62372e21db0241e8`
- prompt/self-cleanup: `4814e8a0b565f18d9bde7623fd4ebda68049f988`
- first full normal verification: `e4068dc805422ed4bf797d5223ad0bdd44c2835f`
- final reconciled verification: `b2b6830f1864f9600fd32a4f87bf6151970545a1`

## Stack convergence

- [x] #104 merged to RC1 via `2f07075e447778ea37229ca07ef485d8c0686d9c`.
- [x] #105 retargeted to `integration/aquaguide-rc1`.
- [x] One-commit divergence identified after retarget.
- [x] Reconciled using ancestry-preserving two-parent commit `ff558c03c5af758b21bcf2098be074189ea7741b`.
- [x] Current merge base is the RC1 parent merge commit; behind count is 0.
- [x] Re-ran product/release/UI gates after reconciliation.

#105 remains Draft/open/unmerged. Structural convergence is complete; merge authorization is still a separate decision.

## EVAL-BC-001 — stale visual evaluator after retarget

- [x] Visual QA fail-before `32574163661` identified an old 768px `Manage → Context` assertion.
- [x] Golden V3 fail-before `32574163627` showed only `aquarium-compact-768` changed (4.3958%); other 7/8 cases were 0% changed.
- [x] Matched the visual difference to approved PUI-BC-058 `Today → Context → Manage` desktop behavior.
- [x] Updated only the 768px evaluator contract.
- [x] Updated only the 768px golden signature.
- [x] Added migration provenance to the visual manifest.
- [x] Kept Golden threshold at 0.5%; no tolerance weakening.
- [x] Final Golden/Visual/System gates all PASS.

## AI work still required before production

Repository tests now reject known non-actionable structured outputs, but live-provider quality is still unmeasured.

Next live evaluation should cover at least:

- [ ] broad goal + ready tank + safe candidates;
- [ ] specific schooling / low-maintenance goals;
- [ ] missing volume/size;
- [ ] missing temperature/filter;
- [ ] adjustable-only candidate pool;
- [ ] no usable candidates;
- [ ] contradictory user goal vs tank constraints;
- [ ] provider timeout/network fallback;
- [ ] invalid JSON/format recovery;
- [ ] generic-answer rate and candidate-drop rate.

Usefulness acceptance should answer:

1. Did AI prioritize a blocking fact when one exists?
2. Otherwise, did it advance the user to a valid local candidate/action?
3. Did it stay inside the local candidate pool?
4. Did the plan reference real candidates/quantities instead of workflow filler?
5. Did it avoid inventing user facts/preferences?
6. Did it preserve deterministic safety and required adjustments?

## Dependency-security baseline

- production audit: 0 findings;
- full developer/build graph: 12 dev-only findings = 7 high / 2 moderate / 3 low;
- permanent read-only production dependency gate remains active.

## Product baseline carried forward

- [x] deterministic compatibility / stage-risk boundary;
- [x] plant roster edit;
- [x] decision-first Result UX;
- [x] production share-report security contract;
- [x] Care/Aquarium layout recovery;
- [x] identification uncertainty / confirmation;
- [x] Tank Copilot authority boundary;
- [x] Tank Copilot usefulness guard;
- [x] parent navigation / visual / golden / UI-system compatibility after RC1 reconciliation.

## Next sequence

1. Live AI usefulness evaluation against the configured provider.
2. #105 final review and explicit merge decision.
3. Production env/secrets and post-deploy golden paths only after deployment authorization.
4. Legacy `server/index.mjs` Phase 2 consumer inventory/migration.
5. Knowledge Engine after release foundation is stable.

## Guardrails

- Schema-valid AI output is not automatically product-valid.
- Safe AI output is not automatically useful.
- AI cannot override deterministic safety rules.
- Required factual gaps outrank subjective preference questions.
- Do not let model omissions erase deterministic safe candidates.
- Do not use mocks as proof of live-provider quality.
- Do not weaken visual thresholds to absorb intentional product changes; migrate baselines only with explicit behavior evidence.
- No #105 merge or production deployment without explicit authorization.
