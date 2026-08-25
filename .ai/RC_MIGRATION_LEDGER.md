# RC Migration Ledger

**Target:** `codex/unified-rc-visual-v1`  
**Visual baseline:** `37a8d4d1`  
**Business reference:** `integration/aquaguide-rc1@895f2f39`  
**Rule:** a group is migrated only after its product rule, tests, affected files and dependency boundary are reviewed. Never merge the RC branch wholesale.

| Group | RC evidence | Status | Migration rule |
|---|---|---|---|
| P0 compatibility / tank state / water change / whole-tank authority | #113–#120; `53f3729b` through `e67bc9ec` | `MIGRATED_LOCAL_VERIFIED` | User-approved local-only migration is verified in `99865414`; shared API/database `LifeStage` remains unchanged. |
| Species Detail evidence authority | #130; `45e8e610` | `NOT_REVIEWED` | Migrate only canonical result/evidence adapters, not RC detail layout. |
| Recommendation authority and severity | #134–#135; `1f7b7732`, `7a85b5c0` | `NOT_REVIEWED` | Migrate recommendation service and regression tests only after P0 authority is present. |
| Mobile shell / Encyclopedia UI repairs | #124–#128; `66a9ab40`, `f09ece0b`, `a9363238` | `EXCLUDED_BY_DEFAULT` | The visual baseline already owns UI geometry; take only a demonstrated behavioral bug fix. |
| Interactive Atlas RC implementation | #122; `cd0d5fe4`, `3f660361` | `EXCLUDED_BY_DEFAULT` | The approved visual branch already has its own interactive implementation. Do not replace it with RC UI. |
| Vercel/API runtime contract | #136–#138; `daf4b59e`, `0364b290` | `CONTRACT_REVIEW_REQUIRED` | API and deployment boundary changes require a separate contract impact review before code migration. |
| Result UX workflow head integrity | #132; `35655d94`, `261897d5` | `NOT_REVIEWED` | Consider after the unified PR exists; retain candidate-head verification concept, not RC workflow wholesale. |

## Explicit exclusions

- `main` is not a source of current product truth.
- `codex/rc1-visual-convergence-v1` and PR #140 are not migration sources.
- RC page components and global CSS are not copied to the unified branch merely because they contain a business change.

## Next review unit

**Species Detail evidence authority.** Produce a file-level impact list and test map before making any code changes; do not migrate RC detail layout.
