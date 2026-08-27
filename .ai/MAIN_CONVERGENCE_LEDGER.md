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
| Domain compatibility authority foundation | unified plan | `PARTIAL_WITH_FALLBACK` | `2e8d3ceb`, `5eaba64a`, Critic fix; `packages/domain-rules/src/compatibility.ts`, `npm run test:domain-compatibility`; legacy UI engine remains adapter |
| Livestock add intent/version contract | unified plan | `PARTIAL_WITH_FALLBACK` | `packages/contracts/src/business.ts`, Repository command, API errors and addition tests; server re-evaluation pending |
| Cloud/local catalog parity | unified plan | `PENDING` | requires authorized Supabase read-only verification |
| Main release PR | unified plan | `PENDING` | blocked until ledger and all release gates pass |

## Conflict decisions

- Do not merge or rebase PR #141 as a whole.
- The main release candidate starts from `origin/main`; accepted capabilities are migrated by subsystem.
- The current user-approved visual baseline remains protected; main-only UI is not accepted as a visual source.
- Conflicting legacy documentation is not used as product truth; canonical state is recorded in `.ai/PROJECT_STATE.json` and the current handoff.

## Verification rule

An item becomes `MIGRATED` only after its contract, implementation, regression evidence and affected UI/API boundaries are all recorded. Commit ancestry alone is insufficient.

## Foundation review checkpoint

- Candidate head: resolved at runtime by `project:status`; local, remote candidate branch and Draft PR #142 must be synchronized.
- Critic: same-thread final recheck, six dimensions `PASS`; `git diff --check origin/main...HEAD` exits 0.
- Remaining release gates: authorized Supabase read-only parity, real PostgreSQL trigger execution evidence, server-side Catalog re-evaluation before planned writes, Preview SHA parity and release acceptance.
