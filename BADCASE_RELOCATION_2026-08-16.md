# AquaGuide Relocation Badcases — 2026-08-16

> Regression-oriented continuation of the current badcase set. These cases define what must fail closed before executable relocation UI is allowed.

## REL-001 — Split remove/add can lose livestock

**Failure:** UI calls `removeLivestock(source)` and then separately calls `addLivestock(destination)`. If the second request fails, the factual record disappears from the source without appearing in the destination.

**Required:** relocation is one repository operation and one cloud database transaction. Local mode also applies source + destination as one state transform.

**Current gate:** PR #62 atomic relocation contract.

## REL-002 — Replay moves the same batch twice

**Failure:** network retry with the same operation key decrements source quantity again or creates a duplicate destination batch.

**Required:** same key + same request replays without a second move; same key + different request is rejected.

**Current gate:** local replay regression + Supabase idempotency acceptance.

## REL-003 — Cross-user destination accepted

**Failure:** authenticated User A can relocate a batch into User B's aquarium by supplying its ID.

**Required:** both source and destination must resolve as active aquariums owned by `auth.uid()` under SECURITY INVOKER/RLS semantics.

**Current live acceptance:** User A → User B destination returned `DESTINATION_AQUARIUM_NOT_FOUND`; transaction left no residue.

## REL-004 — Unresolved source treated as verified

**Failure:** a record with `identity_status='unresolved'` is moved through a path whose destination safety depends on a catalog species identity.

**Required:** verified relocation rejects unresolved source identity.

**Current live acceptance:** returns `UNRESOLVED_SOURCE_SPECIES`; transaction leaves no residue.

## REL-005 — Same aquarium relocation

**Failure:** source and destination are identical, creating a meaningless extra batch or changing quantity unexpectedly.

**Required:** reject before mutation in product contract/API and database function.

## REL-006 — Quantity exceeds source batch

**Failure:** requested move quantity is greater than current batch quantity and source becomes negative/inconsistent.

**Required:** current source batch is row-locked and quantity is checked inside the mutation transaction; local implementation applies the same guard.

## REL-007 — Product requires unavailable DB row version

**Failure:** UI/repository contract requires `sourceBatchVersion`, but repository-hydrated `AquariumSpeciesBatch` does not expose a database version.

**Required:** do not invent an unavailable field. Use transactional row locks/current quantity for mutation concurrency; add explicit version exposure only if a future product need genuinely requires it.

**Status:** corrected before repository/API integration.

## REL-008 — Reciprocal A→B / B→A lock inversion

**Failure:** concurrent opposite-direction relocation requests lock source first and destination second, producing a potential deadlock.

**Required:** acquire a shared advisory lock using the unordered aquarium pair before row locks.

**Current gate:** SQL contract includes `least(source,destination)` / `greatest(source,destination)` pair locking.

## REL-009 — Destination compatibility is assumed from an old card

**Failure:** user viewed a destination as compatible earlier; source/destination facts changed; mutation executes without fresh evaluation.

**Required:** mutation orchestrator must rehydrate/re-evaluate immediately before calling `relocateLivestock()`.

**Status:** next P0. Not solved by PR #62 alone.

## REL-010 — Conditional or insufficient destination becomes executable

**Failure:** `conditional`, `insufficient_data`, or `not_recommended` destination receives the same actionable CTA as a currently compatible destination.

**Required MVP:** only `compatible_by_current_evidence` may reach the mutation call. All other states remain non-executable and retain their reason/evidence gap.

**Status:** next P0.

## REL-011 — Destination evaluation disappears after mutation

**Failure:** move succeeds but UI keeps pre-mutation source/destination decision results, so both tanks show stale conflict/load state.

**Required:** mutation returns latest source + destination canonical snapshots, then decision support must recompute for both tanks.

**PR #62 foundation:** API/repository already returns both latest canonical tank snapshots. Orchestrator/recompute still pending.

## REL-012 — Database is treated as compatibility authority

**Failure:** SQL duplicates tankCompatibilityEngine/reviewed evidence rules and eventually diverges from the product decision layer.

**Required:** DB enforces identity, ownership, atomicity and idempotency only. Compatibility remains in deterministic decision/evidence code.

## Exit gate before executable relocation UI

All of the following must be true:

- PR #62 permanent read-only CI green;
- migration version matches remote migration history;
- live partial/full/replay acceptance green + rollback;
- cross-user and unresolved negative acceptance fail closed + zero residue;
- fresh destination revalidation orchestrator green;
- compatible-only execution policy tested;
- post-mutation both-tank recomputation tested;
- disposable canonical+decision+mutation integration tree passes TypeScript/build and decision regressions.
