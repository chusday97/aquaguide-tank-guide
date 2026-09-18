# GitHub PR Cleanup Record

**Date:** 2026-08-25
**Historical PR retained:** [#141](https://github.com/chusday97/aquaguide-tank-guide/pull/141)
**Current release candidate:** `codex/main-core-foundation-v1`
**Policy:** PR #142 is the completed source-convergence entry; retain #141 and its branch for traceability until explicitly closed; do not delete branches in this phase.

## Result

The source-convergence entry is now merged PR #142; #141 remains open only as historical migration evidence until explicitly closed:

| PR | Branch | Base | State |
| --- | --- | --- | --- |
| #142 | `codex/main-core-foundation-v1` | `main` | Merged / source convergence complete |
| #141 | `codex/unified-rc-visual-v1` | `integration/aquaguide-rc1` | Draft / historical migration evidence |

The other 55 PRs from the 2026-08-25 inventory are closed. The closure comment points back to #141 and requires any future use to pass through `.ai/RC_MIGRATION_LEDGER.md`. No remote branch was deleted, and `main`, `integration/aquaguide-rc1` and the canonical branch were not changed.

## Closed historical set

`#6`, `#29–#38`, `#40–#65`, `#67`, `#84`, `#88–#96`, `#99–#100`, `#102–#103`, `#108`, `#111`, and `#139`.

## Verification

```bash
gh pr list --state open --limit 100
npm run project:status
```

Expected after phase 1: Draft PR #142 is the only active release entry; #141 remains historical until it is explicitly closed and linked to #142. Branch deletion is a separate, explicitly confirmed phase after the observation window.
