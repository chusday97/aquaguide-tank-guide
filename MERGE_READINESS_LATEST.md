# AquaGuide — Stacked Merge & Release Readiness

**Updated:** 2026-08-22  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Child PR:** #105 `Introduce decision-first Result UX V1`  
**Release rule:** #105 merge and production deployment require separate explicit authorization.

## Decision

**#104 PARENT MERGE: COMPLETE.  
#105 RETARGET / ANCESTRY RECONCILIATION: COMPLETE.  
FULL RC1-BASED PARENT + CHILD REGRESSION: 10/10 PASS.  
#105 MERGE: NOT EXECUTED.  
PRODUCTION DEPLOYMENT: NOT EXECUTED.**

Stack convergence is now technically complete on the feature branch. The remaining state transition is a separate #105 merge decision, followed later by a separate production-readiness/deployment decision.

## 1. #104 merged into RC1

#104 was merged with an ancestry-preserving merge commit:

`2f07075e447778ea37229ca07ef485d8c0686d9c`

The merge-commit tree matched the reviewed #104 head tree, so the parent merge introduced no unexpected content drift.

## 2. #105 retargeted and reconciled

#105 now targets:

`integration/aquaguide-rc1`

After retarget, the first comparison was **ahead 185 / behind 1**. The one behind commit was the new #104 merge commit; there was no product-code conflict.

A concurrent child update landed during the first reconciliation attempt. GitHub correctly rejected the stale ref update as non-fast-forward, and no force push was used. The latest child tree was preserved and connected to the merged RC1 parent with ancestry-only two-parent commit:

`ff558c03c5af758b21bcf2098be074189ea7741b`

After reconciliation:

- merge-base = `2f07075e447778ea37229ca07ef485d8c0686d9c`
- behind = **0**
- PR #105 remains Draft / open / mergeable / unmerged

At verified product head `b2b6830f1864f9600fd32a4f87bf6151970545a1`, #105 was **ahead 188 / behind 0** relative to RC1.

## 3. Integration fail-before and evaluator migration

The first RC1-based integration head `ff558c03...` exposed two stale parent visual contracts:

| Gate | Run | Result |
| --- | ---: | --- |
| UI UX Visual QA V2 | `32574163661` | FAIL |
| UI UX Golden V3 | `32574163627` | FAIL |

Security, Dependency, Result UX, Compatibility, Plant, Navigation, Bundle and UI System were green on that integration attempt.

### Root cause

Visual QA still encoded compact-desktop `Today → Manage → Context` at 768px, while approved PUI-BC-058 had already established `Today → Context → Manage` once the desktop shell is active. Phone remains task-first.

Golden V3 changed exactly one state:

- `aquarium-compact-768`: **4.3958% changed**
- the other 7 golden states: **0% changed**

Artifact inspection confirmed the change was the intended Context/Manage reorder, not unrelated drift.

### Repair

Commit `b2b6830f1864f9600fd32a4f87bf6151970545a1`:

- changes only the 768 semantic expectation to `stacked-context-first`;
- preserves phone `stacked-task-first`;
- migrates only `aquarium-compact-768.sig`;
- records PUI-BC-058/run/artifact/head provenance in the manifest;
- keeps Golden `maxDiffRatio` at **0.005**;
- does not change product CSS/layout.

## 4. Final RC1-based full gate matrix

All ten triggered parent + child gates passed on `b2b6830f...`:

| Gate | Run | Result |
| --- | ---: | --- |
| Production Security Boundary V1 | `32574415632` | PASS |
| Dependency Release Baseline V1 | `32574415664` | PASS |
| Result UX V1 | `32574415605` | PASS |
| Compatibility Stage Risk V1 | `32574415639` | PASS |
| Plant Roster Edit Fix | `32574415644` | PASS |
| Navigation Context V1 | `32574415647` | PASS |
| Bundle Audit V1 | `32574415704` | PASS |
| UI UX Golden V3 | `32574415709` | PASS |
| UI UX Visual QA V2 | `32574415581` | PASS |
| UI UX System Refactor V1 | `32574415630` | PASS |

This verifies the actual merged-parent + retargeted-child composition rather than the old stacked ancestry.

## 5. Ready for #105 review / merge decision

Evidence currently supports a separate #105 merge decision because:

- the real RC1 ancestry is reconciled;
- behind count is 0;
- GitHub reports the PR mergeable;
- all ten parent + child gates are green together;
- dependency production audit remains 0;
- PUI-BC-058 now agrees across Result UX, Visual QA and Golden;
- Tank Copilot deterministic-authority and usefulness contracts remain green.

This document does **not** authorize or execute #105 merge.

## 6. Not production-ready yet

Repository CI cannot prove the real deployment environment. Before production still verify:

- Supabase production configuration and server-only service-role use;
- auth + persistence;
- dedicated `SHARE_TOKEN_SECRET`;
- canonical `WEB_BASE_URL`;
- configured AI provider behavior, invalid JSON, timeout/fallback and usefulness;
- Resend/share-report readiness;
- explicit deployment policy (`vercel.json` still suppresses Git deployment for this repair stack);
- `RC1 Post-Deploy Smoke` against the real deployed URL.

## 7. Remaining decisions / debt

1. Explicit #105 merge decision.
2. After any authorized #105 merge, verify the resulting RC1 head/release acceptance rather than assuming PR-head proof transfers automatically.
3. Separate explicit production deployment decision and real environment smoke.
4. Live Tank Copilot evaluation before production sign-off.
5. After release foundation: 12 dev/build audit findings, mixed imports, bundle debt, thin wrappers, legacy `server/index.mjs` bridges, then Knowledge Engine work.

Do not widen #105 with unrelated technical debt before the merge decision. The stack itself is converged and verified.
