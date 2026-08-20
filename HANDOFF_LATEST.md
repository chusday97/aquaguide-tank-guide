# AquaGuide Handoff — Result UX V1

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`

## Current state

Result UX consumer migration is complete. PR #105 remains **open / mergeable / Draft / not merged**. No production deployment is claimed.

Verified live Result UX consumers:

1. Diagnosis — DONE
2. Compatibility — DONE
3. Knowledge — DONE
4. Procedure — DONE
5. Species Detail — DONE
6. Identification — DONE
7. Live AI Tank Copilot — DONE

## Authoritative product closure

Clean seven-consumer product baseline `4a4388f41ffafa902bf6f9bc25e2d2130cd09498`:

- Result UX V1 / `32359908856` — PASS;
- Plant Roster Edit Fix / `32359908896` — PASS;
- Compatibility Stage Risk V1 / `32359909061` — PASS.

Tank Copilot true fail-before: `32358918838`. Product migration: `582e9e341b0231ae30c6d37fa6536ef0d0498de7`. The live quick action now opens the real Copilot; local deterministic rules remain authoritative over compatibility/risk/addition permission; model context is candidate evidence behind disclosure.

PUI-BC-054 records the real feature-entry defect in `BADCASE_LATEST.md`.

## Integration audit — current focus

The current pre-merge stack is clean:

- `integration/aquaguide-rc1` → `agent/uiux-system-refactor-v1` (#104): ahead 102 / behind 0;
- `agent/uiux-system-refactor-v1` → `agent/result-ux-v1` (#105): ahead-only / behind 0 at audit time.

#104 is open, mergeable and non-draft. #105 is open, mergeable and Draft. Neither PR has submitted reviews or unresolved inline review threads.

### Retarget blocker found and fixed

The three #105 permanent workflows originally triggered only when the PR base was `agent/uiux-system-refactor-v1`. After #104 is integrated and #105 is retargeted to RC1, those gates would have silently stopped running.

Commit `a8e402b0f6b6d83dbed5927ca39e7507fd232548` makes all three workflows listen to both the stacked parent branch and `integration/aquaguide-rc1`. Permissions remain `contents: read`.

Verified on `a8e402b0...`:

- Result UX V1 / `32362579152` — PASS;
- Plant Roster Edit Fix / `32362579154` — PASS;
- Compatibility Stage Risk V1 / `32362579151` — PASS.

## Correct repository transition

1. keep #105 Draft while #104 is still open;
2. review/approve #104 as its bounded UI/UX-system PR;
3. only with explicit authorization, merge #104 into `integration/aquaguide-rc1`;
4. retarget #105 to `integration/aquaguide-rc1`;
5. compare the new RC1 base with #105 and inspect merge-base/conflicts;
6. if the chosen #104 merge method creates a new merge/squash commit, #105 may legitimately become behind/diverged; reconcile the new RC1 baseline explicitly instead of assuming behind>0 is a regression;
7. rerun the same three #105 gates on the reconciled RC1-based candidate;
8. review #105 separately;
9. merge/deploy only after explicit approval.

Do not merge #105 into #104 merely to flatten the stack. Post-parent-merge readiness means **clean merge-base/conflict resolution + all permanent gates PASS**, not necessarily ahead-only history.

## Production policy still unresolved

#105 adds `vercel.json -> git.deploymentEnabled: false`. This intentionally suppressed per-commit Vercel deployments during repair, but #104 does not contain it.

Before production, explicitly choose:

- retain manual / milestone deployment; or
- restore Git-driven Vercel deployment as a deliberate release-policy change.

Do not guess this policy and do not silently re-enable Vercel.

## Badcase registry governance

`BADCASE_LATEST.md` contains PUI-BC-054. The machine-readable `evaluation/product/badcases.v1.jsonl` currently ends at PUI-BC-052; PUI-BC-053 is evaluator-only. `tank_copilot` is a valid featureId, so 054 is eligible for future append-only canonical registration.

A temporary write-enabled append workflow was removed after its trigger path proved insufficiently observable. No permanent write-enabled CI remains. This canonical append is a governance follow-up, not a product blocker.

## Engineering debt / non-blockers

- npm audit: 18 vulnerabilities (2 low, 6 moderate, 10 high);
- mixed dynamic/static Vite imports remain;
- large entry / three-fiber chunks remain;
- wrapper/Base debt inherited from #104 remains.

Do not broaden the stacked PRs with unrelated dependency, bundle or architectural refactors.

## Next owner action

Integration readiness is documented in `MERGE_READINESS_LATEST.md`. The next state-changing action would be an explicit decision on #104 review/merge; until then, do not expand #105 with new feature work.
