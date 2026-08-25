# Open PR Registry

**Snapshot:** 2026-08-25  
**Source:** `gh pr list --state open --limit 100`  
**Purpose:** prevent historical PRs from becoming implicit progress sources.

## One active convergence entry

| PR | Branch | Base | State | Decision |
| --- | --- | --- | --- | --- |
| #141 | `codex/unified-rc-visual-v1` | `integration/aquaguide-rc1` | Draft | The only allowed convergence entry. It starts from the user-approved visual baseline and may receive only selectively reviewed RC business migrations. |

## Historical inputs — closed, do not merge directly

The 55 historical PRs in the original 2026-08-25 snapshot are now closed. Their branches are retained for traceability only. None is an approved merge source into the canonical branch, RC, or `main`.

| Group | Open PRs | Why it is not a merge source | Allowed use |
| --- | --- | --- | --- |
| Production/runtime handoff | #139, #111, #108 | Documentation and release-sync branches describe earlier RC states. | Read for specific verified facts only; copy a fact into current docs only after validating it against the target code. |
| Obsolete RC-to-main path | #102 | Its RC-first convergence path is not the approved visual baseline. | Compare business behavior selectively through the RC migration ledger; never merge/rebase wholesale. |
| 2026-08-19 UI branches | #103, #100, #99, #96, #95, #94, #93, #92, #91, #90, #89, #88 | They predate the user-approved visual baseline or have an unrelated UI/product scope. | Inspect individual commits only when a ledger item explicitly names the needed behavior. |
| 2026-08-16 to 2026-08-18 stacked domain chains | #84, #67, #65–#29 | These PRs form several dependency stacks whose bases are other historical feature branches, not the canonical branch. | Treat as historical business research. Extract a rule, evidence, test and affected-file list before any selective port. |
| Early documentation branch | #6 | README-only historical branch. | Read-only reference; not a current delivery path. |

## Operating rule

1. Start all work from `codex/unified-rc-visual-v1`.
2. Use `.ai/RC_MIGRATION_LEDGER.md` to choose a capability, not a PR title or branch recency.
3. A historical PR can supply evidence, but it cannot supply a merge base.
4. Historical PRs are closed for navigation safety; retain their branches until the separately confirmed observation-window cleanup.

## Cleanup result

The exact closure record is `docs/03-development/PR_CLEANUP_RECORD.md`. A fresh GitHub query must show only #141 as open. Remote branch deletion is explicitly deferred until a separate observation-window review.

## Verification

Run:

```bash
npm run project:status
gh pr list --state open --limit 100
```

Expected result: #141 is the only active convergence PR; historical inputs are closed and remain available only through their retained branches and evidence records.
