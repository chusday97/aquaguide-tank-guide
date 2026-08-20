# AquaGuide — Stacked Merge Readiness

**Date:** 2026-08-20  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Child PR:** #105 `Introduce decision-first Result UX V1`

## Decision

**PRODUCT / RESULT UX: READY. STACK INTEGRATION: READY FOR ORDERED REVIEW, NOT YET APPROVED TO MERGE OR DEPLOY.**

All live Result UX consumers are closed and the current pre-merge stack is clean. The remaining repository work is an ordered parent→child transition plus an explicit deployment-policy decision.

## Current pre-merge topology

### Layer 1 — #104

- base: `integration/aquaguide-rc1`
- head: `agent/uiux-system-refactor-v1`
- head: `1c2b5a383da3b0d6a90ba72537395fb41deb7841`
- current compare against RC1: **ahead 102 / behind 0**
- PR state: open, mergeable, non-draft
- submitted reviews: none
- unresolved inline review threads: none

#104’s established engineering gate matrix remains green on its validated code/governance head. Its visible Vercel failure is the documented free-plan build-rate-limit state, not an application build failure.

### Layer 2 — #105

- current base: `agent/uiux-system-refactor-v1`
- head: `agent/result-ux-v1`
- current compare against #104: **ahead-only / behind 0** at audit time
- PR state: open, mergeable, Draft
- submitted reviews: none
- unresolved inline review threads: none

No branch divergence or rebase requirement exists **before #104 is merged**.

## #105 final product gate matrix

The seven-consumer Result UX closure was proven on `4a4388f41ffafa902bf6f9bc25e2d2130cd09498`:

| Gate | Run | Result |
| --- | --- | --- |
| Result UX V1 | `32359908856` | PASS |
| Plant Roster Edit Fix + Navigation Context | `32359908896` | PASS |
| Compatibility Stage Risk V1 | `32359909061` | PASS |

The integration audit then found that these workflows only listened to PRs targeting `agent/uiux-system-refactor-v1`. That would have silently disabled the permanent gates after #104 is integrated and #105 is retargeted to RC1.

Commit `a8e402b0f6b6d83dbed5927ca39e7507fd232548` fixes that blocker by making all three permanent workflows listen to both:

- `agent/uiux-system-refactor-v1`
- `integration/aquaguide-rc1`

Permissions remain `contents: read`.

Retarget-safe trigger validation on `a8e402b0...`:

| Gate | Run | Result |
| --- | --- | --- |
| Result UX V1 | `32362579152` | PASS |
| Plant Roster Edit Fix + Navigation Context | `32362579154` | PASS |
| Compatibility Stage Risk V1 | `32362579151` | PASS |

Result UX #84 passed the static contract, deterministic Copilot contract, TypeScript, production build and all seven browser consumers including live Tank Copilot.

## Correct parent→child transition

Do **not** merge #105 into #104 merely to collapse the stack. That would widen #104 after its review boundary was deliberately frozen.

Correct sequence:

1. review #104 as its bounded UI/UX-system change;
2. when explicitly approved, merge #104 into `integration/aquaguide-rc1` using the chosen repository merge method;
3. retarget #105 from `agent/uiux-system-refactor-v1` to `integration/aquaguide-rc1`;
4. immediately compare the new RC1 base with #105 and inspect the merge-base;
5. if the parent merge method introduced a new merge/squash commit, #105 may legitimately show behind/diverged even when code is compatible; integrate the new RC1 baseline into #105 using an explicit rebase/merge strategy rather than treating `behind > 0` itself as a product failure;
6. confirm there are no unresolved code conflicts or duplicated parent changes;
7. require the same three permanent #105 gates to pass against the RC1 target;
8. review #105 as the separate Result UX / lifecycle / plant-fix layer;
9. merge #105 only after an explicit approval decision.

The post-parent-merge condition is therefore **clean merge-base + no unresolved conflicts + full gate PASS**, not “ahead-only at all costs.”

No merge is performed by this readiness document.

## Production-readiness decision still required

### Vercel deployment policy

#105 adds:

```json
"git": {
  "deploymentEnabled": false
}
```

This was intentional during repair to prevent every development commit from consuming Vercel Preview/build quota. #104 does not contain this setting.

Before production, choose explicitly between:

- **manual / milestone deployment** — keep `deploymentEnabled: false`; or
- **Git-driven deployment** — remove/adjust the setting only as a deliberate release-policy change.

Do not silently re-enable Vercel simply because the code is merge-ready.

### Dependency / bundle debt

Still present and currently classified as non-blocking technical debt rather than regressions introduced by the Result UX slice:

- npm audit: 18 vulnerabilities (2 low, 6 moderate, 10 high);
- mixed static/dynamic imports for `fishData` and `careTopicsData`;
- `react-three-fiber` chunk roughly 889 KB;
- main entry roughly 2.12 MB / gzip ~475 KB;
- thin wrapper/Base architecture inherited from #104.

These need dedicated remediation work; do not broaden #104/#105 with opportunistic refactors or blind `npm audit fix`.

## Badcase governance

PUI-BC-054 is a genuine product badcase and is documented in `BADCASE_LATEST.md` with fail-before and final browser evidence.

The machine-readable `evaluation/product/badcases.v1.jsonl` currently ends at PUI-BC-052. PUI-BC-053 is evaluator-only and correctly excluded. `tank_copilot` is a valid product-evaluation featureId, so PUI-BC-054 is eligible for a future append-only canonical update.

A temporary write-enabled append workflow was tested and removed because its trigger was not reliably observable through the current PR workflow path. **No permanent write-enabled workflow remains.** Canonical append remains a governance follow-up, not a reason to weaken CI permissions.

## Current blockers before any merge/deploy

1. human / explicit approval of #104 merge into RC1;
2. post-merge retarget of #105 plus merge-base/conflict reconciliation appropriate to the merge method;
3. same three #105 permanent gates passing on the resulting RC1-based candidate;
4. explicit choice of Vercel deployment policy before production;
5. explicit merge/deployment authorization.

## Current recommendation

Keep #105 Draft while #104 is still open. The product implementation is closed; the remaining work is stack transition and release governance, not further Result UX feature work.
