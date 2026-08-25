# GitHub PR Cleanup Record

**Date:** 2026-08-25  
**Canonical PR retained:** [#141](https://github.com/chusday97/aquaguide-tank-guide/pull/141)  
**Canonical branch:** `codex/unified-rc-visual-v1`  
**Policy:** close historical PRs for navigation safety; retain branches for traceability; do not delete branches in this phase.

## Result

The repository was re-queried after cleanup and contains exactly one open PR:

| PR | Branch | Base | State |
| --- | --- | --- | --- |
| #141 | `codex/unified-rc-visual-v1` | `integration/aquaguide-rc1` | Draft / active convergence |

The other 55 PRs from the 2026-08-25 inventory are closed. The closure comment points back to #141 and requires any future use to pass through `.ai/RC_MIGRATION_LEDGER.md`. No remote branch was deleted, and `main`, `integration/aquaguide-rc1` and the canonical branch were not changed.

## Closed historical set

`#6`, `#29–#38`, `#40–#65`, `#67`, `#84`, `#88–#96`, `#99–#100`, `#102–#103`, `#108`, `#111`, and `#139`.

## Verification

```bash
gh pr list --state open --limit 100
npm run project:status
```

Expected: only #141 is open; `project:status` confirms local and remote branch SHA, while the CI PR-governance API check confirms PR #141 head/base and head SHA. Branch deletion is a separate, explicitly confirmed phase after the observation window.
