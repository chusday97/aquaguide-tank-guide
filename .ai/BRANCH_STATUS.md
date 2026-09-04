# Branch Status

Updated: 2026-09-04
Feature: `feature/admin-content-v0`
Remote feature before this docs sync: `7fb19b28c7105fdfcd9f1f443ea42b82341e64da`
Live main: `64fa58a16a723b74621ac1db513adb1efb47e282`
Merge base: `ed0cf38025652db901ee81aa697ca55b1c1584b6`

## Authoritative divergence
Measured using explicit fetched live refs because this worktree has a narrow/stale default remote-tracking refspec:
- main-only commits: 269
- feature-only commits: 106

Do not use plain `origin/main` as authority in this worktree without verifying it against `git ls-remote` or an explicitly fetched live ref.

## Merge safety
The feature branch is **not merge-ready by default**. Earlier merge-tree audit found overlapping main/feature changes and conflict risk in shared root/app files.

Rule:
1. Complete Admin operational acceptance.
2. Re-read live main/feature heads.
3. Run dedicated reconciliation and validation.
4. Never force-push or blindly merge/rebase main during ordinary Admin work.

Production/main remain outside normal Aqua Operations Studio iteration unless explicitly authorized.
