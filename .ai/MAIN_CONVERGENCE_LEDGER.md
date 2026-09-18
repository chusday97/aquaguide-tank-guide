# Main Convergence Ledger

Status: `IN_PROGRESS`

## Fixed references

- Release base: `origin/main@ed0cf380`
- Product reference: `origin/codex/unified-rc-visual-v1@8b36a15b`
- Historical business reference: `origin/integration/aquaguide-rc1@895f2f39`
- Historical convergence PR: `#141` (`Draft`, `CONFLICTING`, base `integration/aquaguide-rc1`)
- Current release candidate branch: `codex/main-core-foundation-v1`
- Current release PR: `#142` (`Draft`, base `main`, head tracked by `project:status`)

## Capability status

| Capability | Source | Release-candidate status | Evidence |
| --- | --- | --- | --- |
| Existing-vs-planned livestock intent | `99865414` | `MIGRATED` | local P0 state, addition-intent and repository tests |
| Deterministic compatibility rules | `99865414` | `MIGRATED` | `npm run test:compatibility`, `npx tsx scripts/test-species-fit-engine.ts` |
| Empty-tank preview boundary | `c822bd0e` | `MIGRATED` | empty preview regression; unknown water remains fail-closed |
| Species catalog release snapshot | unified plan | `MIGRATED` | `2eee7c40`, `packages/contracts/src/catalog.ts`, `src/services/catalog/catalog-snapshot.service.ts`, `npm run test:catalog-snapshot` |
| Catalog build/validate/publish pipeline | unified plan | `MIGRATED` | `npm run catalog:build`, `npm run catalog:validate`, `npm run catalog:publish`; publish generates a pending artifact and never uploads automatically |
| Domain compatibility authority foundation | unified plan | `MIGRATED` | Domain Rules owns final status/policy/rule codes and versions; frozen callers use the guarded compatibility facade; authority gate and conflict regressions pass |
| Livestock add intent/version contract | unified plan | `PARTIAL_WITH_FALLBACK` | `packages/contracts/src/business.ts`, Repository command, API errors and server-side Catalog re-evaluation are present; production Catalog is not deployed |
| Cloud/local catalog parity | unified plan | `PENDING` | requires authorized Supabase read-only verification |
| Main release PR | unified plan | `PENDING` | blocked until ledger and all release gates pass |

## Conflict decisions

- Do not merge or rebase PR #141 as a whole.
- The main release candidate starts from `origin/main`; accepted capabilities are migrated by subsystem.
- The current user-approved visual baseline remains protected; main-only UI is not accepted as a visual source.
- Conflicting legacy documentation is not used as product truth; canonical state is recorded in `.ai/PROJECT_STATE.json` and the current handoff.

## Verification rule

An item becomes `MIGRATED` only after its contract, implementation, regression evidence and affected UI/API boundaries are all recorded. Commit ancestry alone is insufficient.

## 4317 visual convergence ledger (2026-08-29)

The detached `37a8d4d1` preview remains the visual mother. The candidate keeps its current data and service behavior; only the approved preview shell and layout-owner changes are allowed.

| Module | Difference classification | Current status | Evidence / next check |
| --- | --- | --- | --- |
| Aquarium | `RESTORE_FROM_4317` + `EXPLICIT_EXCEPTION` (module switch and SHA metadata) | `IN_PROGRESS` | 4319 production preview now renders the stage and transparent creatures; compare camera framing and overlay bounds at 390/600/768/1024/1280/1440/1920px |
| Encyclopedia | `RESTORE_FROM_4317` + `KEEP_CURRENT_LOGIC` | `IN_PROGRESS` | Scene module renders the 4317 atlas surface; verify detail Rail, focus return and transparent assets against the baseline |
| Care | `RESTORE_FROM_4317` + `KEEP_CURRENT_LOGIC` | `IN_PROGRESS` | Scene module renders the 4317 hotspot composition; verify scene single-column and browse-only grid behavior |
| Collection | `RESTORE_FROM_4317` + `APPROVED_DESKTOP_ADAPTATION` | `IN_PROGRESS` | Creature-first scene renders in candidate; verify node bounds and compact fallback at the full viewport matrix |
| Runtime evidence | `EXPLICIT_EXCEPTION` | `PARTIAL` | 4317 stays detached; 4319 is served from the candidate production build so WebGL context and fonts are deterministic; final freeze waits for user acceptance |

The preview capture gate now waits for a ready marker, fonts, Canvas dimensions and failed-request/page-error checks. A route returning HTTP 200 without these conditions is not visual evidence.

## Foundation review checkpoint

- Candidate head: resolved at runtime by `project:status`; local, remote candidate branch and Draft PR #142 must be synchronized.
- Critic: same-thread final recheck, six dimensions `PASS`; `git diff --check origin/main...HEAD` exits 0.
- Candidate CI exposed four contract gaps (Catalog tuple typing, explicit compatibility-record failure state, non-empty-tank detail routing, and the portal/quantity/confirmation Golden Path contract); all are fixed in `2b841e95`. Runs `33041753905`, `33041755993`, `33041756115` passed; current candidate SHA remains runtime-derived from `npm run project:status`.
- Remaining release gates: authorized Supabase read-only parity, real PostgreSQL trigger execution evidence, server-side Catalog re-evaluation before planned writes, Preview SHA parity and release acceptance.
