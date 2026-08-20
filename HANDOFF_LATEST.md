# AquaGuide Handoff — Result UX + Backend Boundary + Knowledge Engine

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Latest fully validated code head:** `52018136bea61082dbf34d7aabf8666b0a1a670e`

## Current state

Result UX, plant/navigation regression coverage, life-stage compatibility, product badcase governance, repository-level share-report security, and **Phase 1 backend/server boundary repair** are complete on the current stacked branch.

PR #105 remains **open / mergeable / Draft / unmerged**. No Production deployment or merge is authorized.

## Current validated gate matrix

Head `52018136bea61082dbf34d7aabf8666b0a1a670e`:

- Production Security Boundary V1 / `32377216683` — **PASS**
- Result UX V1 / `32377216642` — **PASS**
- Compatibility Stage Risk V1 / `32377216676` — **PASS**
- Plant Roster Edit Fix / `32377216744` — **PASS**

Production Security includes `check:api`, `test:api-boundary`, `test:business-api-contract`, product-evaluation governance and share-report security. The API boundary test now permanently guards the standalone production API server boundary.

## Vercel Preview — UNBLOCKED

Git-driven Preview was deliberately restored earlier by commit `22366a1affc70ee7f8364ae47c47867859776436`.

Fail-before state: Vercel reported `1 function exceeded the uncompressed maximum size of 250 MB` on the branch after Git Preview was restored.

Preview-only project variables were configured by the project owner:

- `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`
- `VERCEL_ANALYZE_BUILD_OUTPUT=1`

Phase 1 server-boundary repair then produced a successful Vercel deployment for head `52018136...` (`HCtZ4JFTKQJC3DEDppenTLzkqh9B`). The previous 250 MB Preview blocker is therefore closed at deployment level for this head.

Do not over-attribute the exact byte reduction without the analyzer breakdown: the successful deployment follows both the Preview environment configuration and the dependency-boundary repair. However, the architectural defect itself was real and is now permanently guarded.

## Architecture — current authoritative model

AquaGuide is a full Web application, not a frontend-only or Supabase-only project:

```text
01 Frontend / Presentation
React + Vite (`src/`)
        ↓
02 Application client
frontend services + `src/services/api/api-client.ts`
        ↓
03 Backend
`apps/api/src`
Auth + HTTP contracts + business routes + AI orchestration
        ↓ runs on
04 Server runtime
Vercel Functions
        ↓
05 Data / infrastructure
Supabase PostgreSQL + Auth + Storage
DeepSeek / Vision / Resend
```

Supabase supplies database/auth/storage infrastructure; it is not a replacement for AquaGuide's own backend.

## PUI-BC-056 — production API depended on the legacy all-in-one server

### Original dependency

```text
api/v1/[...path].ts
  ↓
apps/api/src/app.ts
  ↓
server/index.mjs
  ├─ legacy AI routes / prompt logic
  ├─ Express server setup
  ├─ static `dist` serving
  └─ SPA fallback
```

This reversed the intended dependency direction: the new authoritative backend was mounted onto the old all-in-one server. It also made unrelated static/legacy concerns eligible for Vercel Function dependency tracing.

### Phase 1 fix

- `c3937ee5def5fb880af6ff3f6b6b7e233b692d70` — `Detach API app from legacy server`
- `52018136bea61082dbf34d7aabf8666b0a1a670e` — `Guard standalone API server boundary`

`apps/api/src/app.ts` now:

- creates its own `express()` app;
- preserves `TRUST_PROXY_HOPS` behavior;
- preserves the existing `3mb` JSON parser boundary;
- keeps `/api/health` and `/api/v1/health` compatibility responses;
- mounts the existing `/api/v1` router unchanged;
- keeps existing request-id / structured error behavior;
- does **not** import `server/index.mjs`;
- does **not** serve frontend `dist`.

No frontend UI, Supabase schema, deterministic domain rule, security rule, or public `/api/v1/*` business contract was changed.

`test:api-boundary` now statically rejects reintroduction of `server/index.mjs` or static-dist ownership into the production API app, in addition to its existing runtime API assertions.

### Remaining legacy debt

Phase 1 does not claim complete legacy-server retirement. Separate bridge entries still exist, notably:

- `api/ai/chat.js -> server/index.mjs`;
- `api/v1/health.js -> server/index.mjs`.

These should be migrated only in Phase 2 after confirming their live consumers and replacement routes. Do not delete them opportunistically.

## Current database / knowledge architecture

AquaGuide's knowledge layer is **not currently a classic vector-RAG knowledge base**. It is stronger on structured domain decisions and weaker on ingestion/retrieval infrastructure.

Current Supabase model contains three important knowledge/data classes:

1. **Structured domain knowledge** — species, feeding profiles, care articles/steps, compatibility profiles/rules and assets;
2. **Evidence provenance** — `evidence_sources`, compatibility-rule/source joins and care-article reference links with review state;
3. **User state / business data** — profiles, aquariums, livestock, equipment, diagnosis, reminders, favorites, memorial/history records.

Current content ingestion is primarily repository-driven (`fishData`, `careTopicsData` → `scripts/content-import/import-catalog.ts` → Supabase). Search is predominantly relational/field search rather than chunk/embedding semantic retrieval.

## Upgrade plan — Evidence-backed Vertical Knowledge Engine V1

Do **not** replace the structured SQL model with a generic PDF/vector store. The target is a hybrid expert system:

```text
Trusted Sources
      ↓
Ingestion / Parse / Version / Diff
      ↓
┌──────────────────────┬────────────────────────┐
│ Structured Knowledge│ Unstructured Evidence  │
│ facts / rules        │ chunks / embeddings    │
└──────────┬───────────┴────────────┬───────────┘
           ↓                        ↓
      deterministic SQL       semantic retrieval
           └────────────┬───────────┘
                        ↓
                Decision Engine
                        ↓
                AI Explanation
                        ↓
              cited user action
```

### P0 — provenance granularity

Add a separately scoped schema migration later for:

- `evidence_source_versions` — fetched snapshot, content hash, effective/fetched timestamps;
- `evidence_chunks` — exact section/chunk text + source-version location;
- `knowledge_claims` — normalized subject / predicate / value / unit / confidence / review state;
- `claim_evidence` — exact claim ↔ evidence-chunk support relation.

Goal: every decision-relevant fact can answer **which exact evidence supports this claim**.

### P1 — trusted-source ingestion + freshness

Build a controlled pipeline:

```text
trusted source registry
→ fetch
→ parse
→ content hash / diff
→ AI extracts candidate claims
→ validation + human/review gate
→ publish structured fact/rule
```

AI must never automatically overwrite reviewed compatibility/risk rules. Changed sources create candidate updates until review passes.

Add source health/freshness states: `current`, `changed`, `stale`, `fetch_failed`, `review_required`.

### P2 — hybrid retrieval

Only after provenance/versioning exists:

- enable semantic embeddings (Supabase pgvector or an equivalent index);
- retain SQL/metadata filtering for exact facts and user state;
- retrieve unstructured evidence semantically;
- use keyword/full-text fallback;
- add reranking for top evidence;
- filter by review status, locale, species/category, source quality and freshness.

Decision authority remains:

```text
structured reviewed rule > deterministic engine > retrieved evidence > LLM explanation
```

Vector similarity must never directly decide `canAdd`, risk level or compatibility.

### P3 — grounded generation + citations

AI output should receive:

- deterministic decision;
- relevant user aquarium state;
- retrieved reviewed evidence;
- source metadata.

The result surface should expose exact citations behind progressive disclosure. Model-originated inference remains distinct from verified facts.

### P4 — knowledge / retrieval evaluation

Create a golden evaluation set containing:

- user query;
- expected structured facts;
- expected supporting source/chunk;
- acceptable decision/result;
- forbidden unsupported claim.

Measure at minimum:

- Recall@K / hit rate for expected evidence;
- citation correctness;
- groundedness / unsupported-claim rate;
- decision consistency with deterministic rules;
- stale-source detection;
- retrieval latency.

Keep calculation/scoring deterministic; do not let an LLM invent evaluation metrics.

### P5 — knowledge operations / admin

Add an internal knowledge-maintenance surface after the data contracts stabilize:

- source freshness queue;
- changed-source diff review;
- candidate claim approval/rejection;
- evidence coverage gaps;
- stale/low-confidence rules;
- rollback/version history;
- retrieval badcases and evaluation trend.

This is a knowledge operations console, not a generic CMS.

## Upgrade priority

Recommended order:

1. **P0 provenance + version model**;
2. **P1 ingestion/freshness**;
3. **P4 evaluation baseline** before broad semantic rollout;
4. **P2 hybrid retrieval**;
5. **P3 grounded answers/citations**;
6. **P5 knowledge operations console**.

Do not start by adding pgvector alone. A vector index without provenance, freshness and evaluation would make retrieval more flexible but not more trustworthy.

## Stack / integration state

Current topology remains:

- #104: `integration/aquaguide-rc1` → `agent/uiux-system-refactor-v1`;
- #105: `agent/uiux-system-refactor-v1` → `agent/result-ux-v1`.

Correct parent→child transition remains unchanged: explicit #104 merge decision → merge parent → retarget #105 → inspect/reconcile ancestry → rerun permanent gates → review #105 separately → explicit merge/Production-deploy decision.

## Next engineering boundaries

Completed now:

- Phase 1: authoritative `apps/api` production backend detached from legacy server;
- current Vercel Preview blocker closed;
- Knowledge Engine V1 upgrade sequence documented.

Next optional engineering work should be separately scoped:

1. Phase 2 legacy AI/server migration, beginning with consumer inventory for `api/ai/chat.js` and `api/v1/health.js`; **or**
2. Knowledge Engine P0 schema/design work.

Do not merge #104/#105 or deploy Production without explicit authorization.
