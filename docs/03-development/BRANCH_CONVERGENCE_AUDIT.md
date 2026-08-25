# Branch Convergence Audit

**Status:** Active audit snapshot (captured before docs-only follow-up commits)
**Generated:** 2026-08-25T14:26:01Z  
**Canonical branch:** `codex/unified-rc-visual-v1`  
**Canonical SHA:** `589eb23c8e20b920dfba6eba7396755dc0822980`

At capture time, local and remote canonical SHA matched. The command below is the current source of truth for subsequent local/remote parity.

## What this report proves

This is a Git graph inventory, not a feature-completeness claim. A branch containing commits that are not reachable from the canonical branch does **not** mean those capabilities are missing. The capability decision must still be made in `.ai/RC_MIGRATION_LEDGER.md` using product rules, affected files and regression evidence.

The report is reproducible with:

```bash
git fetch origin --prune
npm run audit:branch-convergence
```

The command is read-only and compares the local SHA, canonical remote-tracking SHA and remote refs; it does not merge, rebase, delete or push anything. To make local/remote parity a blocking check, run `npm run check:branch-convergence`.

## Snapshot

| Comparison | Canonical-only commits | Other-ref-only commits | Interpretation |
|---|---:|---:|---|
| `origin/codex/unified-rc-visual-v1...origin/main` | 149 | 214 | The release line and unified line diverge; neither is a safe wholesale merge source. |
| `origin/codex/unified-rc-visual-v1...origin/integration/aquaguide-rc1` | 149 | 742 | RC1 is a business reference/base for PR #141, not the visual source. |

The remote snapshot contained 156 non-canonical branch refs. 151 had commits not reachable from the canonical branch and 5 were already ancestors of it. These counts describe graph topology only; they do not imply 151 missing features.

## Reconciliation rule

For every historical PR, branch or `origin/main`-only commit group:

1. Identify the product capability and stable rule it claims to change.
2. Compare its affected files and patch against the canonical implementation.
3. Mark the capability as already present, selective migration, contract review, or historical/excluded in the migration ledger.
4. Only migrate a reviewed capability to the canonical branch, together with its regression evidence.
5. Re-run status, truth, type, domain, API, browser, visual and build gates.

No branch is a merge base merely because it is newer, has more commits, or has an attractive PR title.

## Current decision

- Do not merge `origin/main`, `integration/aquaguide-rc1`, PR #140 or any historical branch into the canonical branch wholesale.
- Keep PR #141 as the only convergence entry.
- Resolve remaining ledger rows before creating a separate release PR from the canonical branch to `main`.
