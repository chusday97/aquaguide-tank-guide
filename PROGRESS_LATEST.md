# AquaGuide Progress — Result UX + Backend Boundary + Knowledge Engine

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105  
**Parent:** #104 → `integration/aquaguide-rc1`

## Phase

**Result UX COMPLETE · production-security repository contracts COMPLETE · backend/server Phase 1 COMPLETE · Vercel Preview UNBLOCKED · Knowledge Engine V1 PLANNED.**

## Current validated head

Head `52018136bea61082dbf34d7aabf8666b0a1a670e`:

- [x] Production Security Boundary V1 / `32377216683` — PASS
- [x] Result UX V1 / `32377216642` — PASS
- [x] Compatibility Stage Risk V1 / `32377216676` — PASS
- [x] Plant Roster Edit Fix / `32377216744` — PASS
- [x] Vercel Preview deployment `HCtZ4JFTKQJC3DEDppenTLzkqh9B` — SUCCESS

## Backend/server Phase 1 — COMPLETE

- [x] `apps/api/src/app.ts` no longer imports `server/index.mjs`.
- [x] `apps/api` creates and owns its own Express app.
- [x] `/api/v1/*` business router remains unchanged.
- [x] request-id / error boundary preserved.
- [x] `TRUST_PROXY_HOPS` preserved.
- [x] `3mb` JSON boundary preserved.
- [x] image-recognition route keeps its own `10mb` raw parser.
- [x] `/api/health` and `/api/v1/health` compatibility response preserved.
- [x] production API app does not serve frontend `dist`.
- [x] permanent `test:api-boundary` guard rejects legacy-server/static-dist reintroduction.
- [x] four permanent gates pass on repaired code head.
- [x] Vercel no longer blocks this head on the prior 250 MB Function error.

Fix commits:

- `c3937ee5def5fb880af6ff3f6b6b7e233b692d70` — detach API app from legacy server;
- `52018136bea61082dbf34d7aabf8666b0a1a670e` — add permanent server-boundary regression guard.

## PUI-BC-056 — CLOSED for authoritative `/api/v1` production boundary

The new backend previously mounted itself onto legacy `server/index.mjs`, which also owned legacy AI and static SPA serving. This violated deployment boundaries and was discovered while Vercel reported one Function over the 250 MB uncompressed limit.

Closure evidence:

- [x] standalone API app implemented;
- [x] API/security contracts PASS;
- [x] Vercel Preview SUCCESS.

Exact dependency byte attribution is not claimed without analyzer output. Remaining legacy bridge files are follow-up debt, not part of this Phase 1 closure.

## Remaining legacy server migration — NOT STARTED

- [ ] inventory live consumers of `api/ai/chat.js`;
- [ ] inventory `api/v1/health.js` routing precedence/use;
- [ ] migrate live AI endpoints into `apps/api/src/ai` / `routes`;
- [ ] verify equivalent API/browser behavior;
- [ ] remove legacy bridge imports only after replacement proof;
- [ ] retire `server/index.mjs` from production dependency graph completely.

## Knowledge Engine V1 — planned

Current state: structured Supabase domain DB + reviewed evidence-source relations + user aquarium state. Classic document ingestion/chunking/vector retrieval is not yet the core retrieval architecture.

### P0 provenance/versioning

- [ ] `evidence_source_versions`
- [ ] `evidence_chunks`
- [ ] `knowledge_claims`
- [ ] `claim_evidence`
- [ ] exact claim → evidence traceability

### P1 ingestion/freshness

- [ ] trusted-source registry
- [ ] fetch/parse pipeline
- [ ] content hash + diff
- [ ] candidate-claim extraction
- [ ] explicit review gate before rule/fact publication
- [ ] freshness/source-health states

### P4 evaluation baseline — before broad vector rollout

- [ ] retrieval golden set
- [ ] expected facts/sources/chunks
- [ ] Recall@K / evidence hit rate
- [ ] citation correctness
- [ ] unsupported-claim rate / groundedness
- [ ] deterministic decision consistency
- [ ] stale-source detection
- [ ] latency tracking

### P2 hybrid retrieval

- [ ] semantic embedding/index only after P0/P1 contracts
- [ ] SQL structured retrieval
- [ ] keyword/full-text retrieval
- [ ] vector evidence retrieval
- [ ] metadata/review/freshness filters
- [ ] reranking

### P3 grounded result

- [ ] deterministic decision remains authoritative
- [ ] retrieved reviewed evidence feeds AI explanation
- [ ] exact citations on Result UX disclosure
- [ ] candidate inference separated from verified facts

### P5 knowledge operations

- [ ] source freshness queue
- [ ] source diff review
- [ ] claim approval/rejection
- [ ] evidence coverage gaps
- [ ] stale/low-confidence rule queue
- [ ] version rollback
- [ ] retrieval badcase/eval dashboard

## Existing completed product/security work retained

- [x] seven Result UX consumers complete;
- [x] PUI-BC-054 Tank Copilot reachability closed;
- [x] PUI-BC-055 share-report secret/release/readiness boundary closed;
- [x] machine product badcase registry append-only contract retained;
- [x] share-report six-state feature contract retained.

## Vercel configuration

Preview-only variables currently configured by the project owner:

- `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`
- `VERCEL_ANALYZE_BUILD_OUTPUT=1`

Git-driven deployments are enabled on the branch. This is a Preview policy; it is not authorization to deploy Production.

## Stack transition — still pending

- [ ] explicit #104 review/merge decision
- [ ] merge #104 to RC1 only after authorization
- [ ] retarget #105 to RC1
- [ ] inspect/reconcile actual new ancestry
- [ ] rerun four permanent gates on RC1 target
- [ ] separate #105 review/merge decision
- [ ] verify real Production environment (`SHARE_TOKEN_SECRET`, `WEB_BASE_URL`, server-only service role)
- [ ] Production deploy only after authorization
- [ ] RC1 post-deploy smoke

## Current judgment

**The prior 250 MB Preview blocker is closed on the current repaired code head. The next architecture work is no longer emergency deployment repair; it should be either controlled legacy-server Phase 2 migration or the separately scoped Knowledge Engine P0 provenance design.**
