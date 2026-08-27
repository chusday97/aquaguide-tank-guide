# Fixed-viewport visual evidence — 2026-08-27

This evidence compares the user-approved baseline and the current release candidate under the same locale (`zh-CN`) and routes.

| Set | Source | Preview |
| --- | --- | --- |
| Baseline | detached worktree `37a8d4d1` | `http://127.0.0.1:4317` |
| Candidate | `codex/main-core-foundation-v1@b9203dd3` | `http://127.0.0.1:4319` |

Routes captured at 390×844, 600×900 and 1280×900:

`/_preview/interactive`, `/aquarium`, `/encyclopedia`, `/care`, `/collection`

The PNG files are intentionally kept in the local evidence directory `/private/tmp/aquaguide-visual-matrix/` until the user completes visual release acceptance. They are not promoted as golden snapshots yet. The candidate build exposes its branch, full SHA, seed and build timestamp in `[data-preview-metadata]`; the formal scene gate verifies that identity before exercising the routes.

Status: `RECOVERY_IN_PROGRESS`; current candidate screenshots include the Aquarium learn-zone and viewport-contract fixes. Human comparison and release acceptance are still required.
