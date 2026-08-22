# AquaGuide — Stacked Merge & Release Readiness

**Updated:** 2026-08-22  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Child PR:** #105 `Introduce decision-first Result UX V1`  
**Release rule:** no merge or production deployment without explicit authorization.

## Decision

**DEPENDENCY / RELEASE BASELINE: CLOSED ON THE CURRENT FEATURE-BRANCH STACK.  
#104 MERGE-READINESS REVIEW: COMPLETE, NO CURRENT CODE-LEVEL BLOCKER FOUND.  
STACK MERGE / RETARGET / PRODUCTION DEPLOYMENT: NOT AUTHORIZED.**

The next engineering action is no longer dependency remediation or another UI feature. The safe work is complete through parent review; the next state transition requires an explicit merge decision.

## 1. Parent PR #104 review result

Current topology:

- base: `integration/aquaguide-rc1` @ `07a208b68065be1705ba3ee51cde3bbaa398bdaa`
- head: `agent/uiux-system-refactor-v1` @ `1c2b5a383da3b0d6a90ba72537395fb41deb7841`
- relation: **ahead 102 / behind 0**
- GitHub mergeability: **mergeable=true**
- PR state: **open / non-draft / unmerged**
- scope size: **102 commits / 52 changed files**

This is a large parent PR, so mergeability alone is not sufficient evidence. The review boundary remains frozen: do not add dependency upgrades, new UI features, bundle refactors, or wrapper/Base consolidation to #104.

Importantly, `package.json` and `package-lock.json` are not part of the #104 diff. The dependency/security remediation completed on #105 must not be back-ported into the frozen parent just to make its historical audit output look newer.

### #104 mandatory gate matrix

All five parent gates are green on `1c2b5a38`:

| Gate | Run | Result |
| --- | ---: | --- |
| Navigation Context V1 | `32284228596` | PASS |
| UI UX System Refactor V1 | `32284228697` | PASS |
| UI UX Visual QA V2 | `32284228687` | PASS |
| UI UX Golden V3 | `32284228628` | PASS |
| Bundle Audit V1 | `32284228685` | PASS |

No current ancestry divergence or merge conflict was found between #104 and its RC1 base. This review does **not** execute the merge.

## 2. Child #105 dependency/release baseline

Dependency remediation landed in `5c277cec1f99f5bb507b7d50b2018d5d571ef0f1` and the permanent read-only dependency gate was established in `8bd327bf69d7a7b74d9ff91f601accddc0ffe7cb`.

Before remediation:

- production audit: 18 findings = 10 high / 6 moderate / 2 low
- full audit: the same 18 findings

After remediation:

- production audit: **0 findings**
- full audit: **12 dev/build-tooling findings = 7 high / 2 moderate / 3 low**

The remaining full-audit debt is kept visible rather than being represented as zero repository-wide security debt.

### Verified #105 descendant

Head `74738962b3f23631b48973b6d7467276789b4241` passed all five permanent gates:

| Gate | Run | Result |
| --- | ---: | --- |
| Production Security Boundary V1 | `32573206862` | PASS |
| Dependency Release Baseline V1 | `32573206901` | PASS |
| Result UX V1 | `32573206841` | PASS |
| Compatibility Stage Risk V1 | `32573206824` | PASS |
| Plant Roster Edit Fix | `32573206969` | PASS |

The later docs-only head `9750464c449800153ffa8fdf0b6f3bbaafb53b91` also passed all five gates:

| Gate | Run | Result |
| --- | ---: | --- |
| Production Security Boundary V1 | `32573357798` | PASS |
| Dependency Release Baseline V1 | `32573357836` | PASS |
| Compatibility Stage Risk V1 | `32573357801` | PASS |
| Plant Roster Edit Fix | `32573357824` | PASS |
| Result UX V1 | `32573357826` | PASS |

Result UX continues to pass Diagnosis, Compatibility, Knowledge, Procedure, Species Detail, Layout Recovery, Identification, and Tank Copilot after dependency remediation.

## 3. Current stacked topology

Pre-merge structure remains:

- #104: `integration/aquaguide-rc1` → `agent/uiux-system-refactor-v1`
- #105: `agent/uiux-system-refactor-v1` → `agent/result-ux-v1`

The correct transition remains parent-first:

1. explicit authorization to merge #104;
2. merge #104 to `integration/aquaguide-rc1` using an ancestry-preserving method;
3. retarget #105 to `integration/aquaguide-rc1`;
4. inspect the actual post-merge merge-base/history;
5. resolve only real conflicts or duplicated parent changes;
6. rerun all five permanent #105 gates on the retargeted ancestry;
7. review #105 separately;
8. make an explicit #105 merge/deployment decision.

A clean current comparison does not justify skipping the post-retarget verification: the chosen parent merge method can change ancestry even when the pre-merge branches are conflict-free.

## 4. Production readiness remains separate

Repository CI does not prove the deployed environment is ready. Before production, explicitly verify:

- Supabase production configuration and server-only service-role usage;
- `SHARE_TOKEN_SECRET`;
- canonical `WEB_BASE_URL`;
- auth and persistence;
- AI provider behavior and failure fallback;
- Resend configuration;
- share-report readiness;
- deployed golden path / `RC1 Post-Deploy Smoke`.

`vercel.json` currently keeps Git deployment disabled for this repair stack. Do not silently change that release policy.

## 5. Remaining blockers

1. explicit authorization for the #104 parent merge;
2. #105 retarget/reconciliation after the real parent merge;
3. all five #105 gates green on the final RC1-based ancestry;
4. explicit deployment-policy choice;
5. real production environment validation;
6. post-deploy smoke;
7. explicit #105 merge/deploy authorization.

## 6. Non-blocking debt

- 12 remaining dev/build-tooling npm-audit findings;
- mixed static/dynamic imports for fish/care data;
- large main and react-three-fiber chunks;
- thin wrapper/Base structures inherited from #104;
- legacy `server/index.mjs` bridges pending Phase 2 consumer inventory.

Do not widen #104/#105 with these debts during stack convergence. The next decision point is the parent merge authorization, not another repair branch expansion.
