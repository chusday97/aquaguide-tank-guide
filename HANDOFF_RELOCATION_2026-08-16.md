# AquaGuide Relocation Handoff — 2026-08-16

> This is a continuation snapshot. Draft/green CI is not main/production. No product PR was merged or marked Ready during this execution.

## Current product boundary

The read-only decision path is now far enough along to support the next mutation boundary:

`canonical aquarium facts → conflict graph → counterfactual keep/relocate comparison → destination evaluation → atomic relocation mutation`

The executable mutation is intentionally split into two layers:

1. **decision/revalidation layer** — owns aquarium compatibility and evidence;
2. **repository/database mutation layer** — owns one atomic move once the destination has just been revalidated.

Compatibility logic is not duplicated in SQL.

## PR #62 — Atomic verified livestock relocation

Draft PR #62 is stacked on PR #38 (`agent/unresolved-existing-livestock`).

Implemented:

- new `relocateLivestock()` repository contract;
- same semantics in local and API-backed repositories;
- API endpoint performs one relocation request, never `remove + add` as two independent mutations;
- API response returns both latest source and destination canonical aquarium snapshots;
- new Supabase RPC `relocate_verified_aquarium_livestock(...)`;
- verified species only;
- explicit source batch + quantity;
- source/destination must be different tanks owned by the same authenticated user;
- target species record is reused or created;
- target receives a new batch preserving source entry date, life stage, and reproductive state;
- source batch is decremented or soft-deleted;
- existing batch trigger remains the single parent-quantity synchronization mechanism;
- unresolved source livestock is rejected;
- idempotent replay cannot move the same livestock twice;
- reciprocal A→B / B→A moves are serialized using an unordered aquarium-pair advisory lock before row locks.

### Public contract correction

The first draft briefly included `sourceBatchVersion` in the public relocation input.

That was removed before repository/API integration because repository-hydrated product state does not expose the database batch version. The product must not require a field it cannot truthfully obtain.

Concurrency is instead protected by transactional locks and current source-batch quantity validation.

## Permanent code verification

Read-only `Livestock Relocation Contract` CI covers:

- partial relocation;
- full relocation;
- append to an existing destination species;
- preservation of batch metadata;
- replay without duplicate source decrement / target addition;
- same-tank rejection;
- over-quantity rejection;
- unresolved source rejection;
- SQL SECURITY INVOKER / empty search_path / ownership / idempotency / grant contract;
- repository/API wiring;
- existing unresolved-livestock regression;
- existing livestock-recording regression;
- API TypeScript;
- app TypeScript;
- production build.

The exact-anchor write workflow used to modify existing large repository/API files passed all gates before committing, then both the write-enabled workflow and patch script were deleted. Permanent CI is read-only.

## Supabase rollout

Dedicated AquaGuide project: `ydiygvhuqpogmqlcvgob`.

Deployed migration version:

`20260816160129_atomic_verified_livestock_relocation`

The GitHub migration filename and CI contract were aligned to the remote version immediately after deployment to avoid migration drift.

Live schema verification:

- `SECURITY INVOKER` confirmed;
- empty function search path confirmed;
- `anon` cannot execute;
- `authenticated` can execute;
- no active aquarium/livestock/species user data existed before acceptance.

## Live authenticated acceptance

All acceptance fixtures were created inside transactions and rolled back.

### Successful path

User A / Source tank starts with one verified batch of 5.

1. relocate 2 to User A / Destination;
2. replay the exact same operation key;
3. relocate the remaining 3 with a new operation key.

Verified after mutation inside the transaction:

- replay did not decrement the source twice;
- destination ended with quantity 5 across two batches;
- moved batch metadata was retained;
- final source batch removal caused the existing trigger to soft-delete the empty source parent species;
- exactly one idempotency record existed for the replayed first operation.

After rollback:

- test auth users = 0;
- test species = 0;
- test aquariums = 0;
- test idempotency records = 0.

### Cross-user destination

Authenticated User A attempted to relocate to a tank owned by User B.

Expected database error observed:

`DESTINATION_AQUARIUM_NOT_FOUND`

The failed transaction left zero test residue.

### Unresolved source

Authenticated User A attempted to relocate an `identity_status='unresolved'` source record through the verified path.

Expected database error observed:

`UNRESOLVED_SOURCE_SPECIES`

The failed transaction left zero test residue.

## Supabase advisors after rollout

Security Advisor introduced no new warning. The only remaining security INFO is the existing intentional deny-all `species_recognition_misses` table with RLS and no client policy.

Performance Advisor reported only existing INFO items (unindexed foreign keys / currently unused indexes). No relocation-specific performance warning was added.

## What is still deliberately missing

PR #62 alone must **not** make a relocation button executable.

The database knows ownership and transaction integrity; it does not know AquaGuide's reviewed compatibility graph.

The required next boundary is:

`fresh repository hydrate → destination re-evaluation → allowed verdict only → relocateLivestock() → refresh both tanks → recompute decision support`

MVP should permit mutation only for `compatible_by_current_evidence` destinations. `conditional`, `insufficient_data`, and `not_recommended` must remain non-executable until a later explicit policy exists.

## Next execution order

1. Build a pure fail-closed relocation execution orchestrator on top of PR #62 + current decision/destination evaluator.
2. Golden cases: compatible destination executes; caution/insufficient/not-recommended do not; unresolved destination/source do not; stale destination facts require re-evaluation; mutation result forces both source and destination recomputation.
3. Run a disposable canonical+decision+relocation integration audit.
4. Only after that add a confirmation UI; no direct delete/move button before the orchestrator is green.
5. Keep PR #35 real Magic Link/two-device deployment acceptance as a separate rollout gate.

## Non-negotiable constraints

- do not merge or mark Ready without explicit user instruction;
- no `remove + add` two-request relocation;
- no unresolved source relocation through verified safety logic;
- no SQL compatibility logic duplication;
- no mutation on stale/non-revalidated destination state;
- no “safe destination” wording; use evidence-scoped verdicts;
- no Draft/CI result described as main/production.
