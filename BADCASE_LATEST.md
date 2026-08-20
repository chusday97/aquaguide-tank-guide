# AquaGuide — Latest Badcases

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**Draft PR:** #105

## Current closure set

PUI-BC-040..056 are represented in the current UI/UX / Result UX / production-readiness / deployment-boundary work.

- PUI-BC-049 and PUI-BC-053 are evaluation-system failures, not user-facing product regressions.
- PUI-BC-054 is the live Tank Copilot reachability defect.
- PUI-BC-055 is the share-report credential/release/deployment-readiness defect.
- **PUI-BC-056 is the production API → legacy all-in-one server dependency-boundary defect discovered through the Vercel 250 MB Preview failure.**

## PUI-BC-056 · Authoritative `/api/v1` backend depended on the legacy all-in-one server

- **featureId:** `api_runtime_boundary`
- **source:** `vercel_preview_deployment`
- **severity:** high
- **rootCauseLayer:** `server_dependency_boundary`
- **status:** `regression_verified`

### Symptom

After Git-driven Preview was restored, Vercel failed deployment with:

`1 function exceeded the uncompressed maximum size of 250 MB.`

The failure was a serverless Function packaging problem, not evidence that the browser frontend itself was 250 MB.

### Root cause / architecture defect

The authoritative production entry was:

```text
api/v1/[...path].ts
  ↓
apps/api/src/app.ts
  ↓
server/index.mjs
```

`server/index.mjs` was not a narrow reusable backend module. It combined:

- legacy AI endpoints/prompt logic;
- Express server setup;
- frontend `dist` static serving;
- SPA fallback behavior.

Therefore the new `apps/api` backend depended backwards on a legacy all-in-one server, making unrelated server/static concerns part of the production Function dependency boundary.

This dependency direction is independently defective even without assigning an exact byte count to each traced dependency.

### Scope constraint

The repair was intentionally narrow:

- no frontend UI changes;
- no Supabase schema changes;
- no deterministic compatibility/risk changes;
- no share-report/security semantic changes;
- no public `/api/v1/*` business-route changes.

### Fix

`c3937ee5def5fb880af6ff3f6b6b7e233b692d70` — `Detach API app from legacy server`

`apps/api/src/app.ts` now creates its own Express app and directly mounts the existing `v1Router`. It preserves trust-proxy configuration, the existing `3mb` JSON boundary, request-id/error middleware, and legacy/versioned health compatibility. It does not import `server/index.mjs` and does not serve `dist`.

`52018136bea61082dbf34d7aabf8666b0a1a670e` — `Guard standalone API server boundary`

`test:api-boundary` now permanently asserts that the production API app source cannot re-import `server/index.mjs` or take ownership of frontend static `dist`, while continuing to exercise business-health, content fallback, auth guards, public-share validation and legacy health compatibility.

### Final evidence

Head `52018136bea61082dbf34d7aabf8666b0a1a670e`:

- Production Security Boundary V1 / `32377216683` — **PASS**;
- Result UX V1 / `32377216642` — **PASS**;
- Compatibility Stage Risk V1 / `32377216676` — **PASS**;
- Plant Roster Edit Fix / `32377216744` — **PASS**;
- Vercel Preview `HCtZ4JFTKQJC3DEDppenTLzkqh9B` — **SUCCESS**.

The previous 250 MB deployment blocker no longer reproduces on this repaired head.

### Attribution caveat

Preview-only `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` and `VERCEL_ANALYZE_BUILD_OUTPUT=1` were also configured before the successful deployment. Without the analyzer breakdown, do not claim a precise number of megabytes removed by the code repair or that one import was the only possible size contributor.

The defensible claim is narrower: the legacy dependency boundary was real, it has been removed from the authoritative `/api/v1` app, permanent API/security gates pass, and the subsequent Preview deployment succeeds.

### Remaining debt

This badcase does **not** claim total `server/index.mjs` retirement. Separate legacy bridge entries remain, including:

- `api/ai/chat.js -> server/index.mjs`;
- `api/v1/health.js -> server/index.mjs`.

They require consumer inventory and verified replacement before deletion.

### Guardrail

The authoritative production backend must own only backend/runtime concerns. It must not import a development/legacy server that also owns frontend static serving.

A deployment-size failure should be fixed by dependency-boundary evidence first; increasing platform limits is a mitigation, not a substitute for correcting an invalid production dependency graph.

### Canonical registry note

PUI-BC-056 is an infrastructure/deployment-boundary badcase and is **not automatically appended to the product-only machine registry**. Do not widen `evaluation/product/badcases.v1.jsonl` unless a separately justified product feature-state mapping is defined.

## PUI-BC-055 · Share-report signing secret / release readiness

**Status: regression_verified.** Dedicated `SHARE_TOKEN_SECRET` is required; service-role fallback is removed; RC1 release acceptance enforces the share-report contract; business-health exposes boolean `shareReportsConfigured`; post-deploy smoke requires the database/service-role/signing-secret/`WEB_BASE_URL` readiness chain.

Key fixes:

- `173530bdc5ea34abcea65d00700b145fc7cf88db`
- `8f9bccf3dc7ba85688c9d727dc551cd3898b60d6`
- `6f4f402414d36296a17b3087ed8ce4e550ba5208`
- `1da62bb1ce11098ce38a489e6a7b95bc40995178`

PUI-BC-055 is canonicalized in the product badcase registry as `share_report`.

## PUI-BC-054 · Live Tank Copilot entry did not open the real Copilot

**Status: regression_verified.** The visible quick action previously dispatched feature-preview instead of opening the implemented Copilot dialog. Fix `582e9e341b0231ae30c6d37fa6536ef0d0498de7` connects the live entry, preserves deterministic authority and uses shared Result UX. PUI-BC-054 is canonicalized as `tank_copilot`.

## PUI-BC-053 · Reload persistence evaluator re-seeded its own fixture

**Evaluator-only.** Session-scoped seeding fixed the false regression. It remains intentionally outside the product-only machine registry.

## PUI-BC-050..052 navigation closure retained

- PUI-BC-050 — Compatibility risk review now expands evidence in context before explicit calculator entry.
- PUI-BC-051 — Search return context preserves expanded result structure, scroll and focus.
- PUI-BC-052 — Aquarium child Species Detail returns to the immediate parent roster with correct scroll/focus.

## PUI-BC-040..049 retained

Earlier UI/UX system, responsive layout, search, carousel, typography, focus-target and evaluator-contract closures remain protected by their permanent workflows. PUI-BC-049 is evaluator-only.

## Current evidence-quality / architecture rules

- deterministic product state outranks labels and model prose;
- AI explanations cannot override compatibility/risk/addition authority;
- credentials have one explicit role; missing dedicated secrets fail closed;
- deployed readiness requires runtime proof, not repository configuration claims;
- production backend dependency graphs must exclude frontend static serving;
- architecture badcases do not enter the product-only registry without a valid feature-state mapping;
- source → claim → rule → decision provenance is the next knowledge-quality target;
- semantic retrieval must not become decision authority.

## Non-claims

- PR #105 remains Draft/unmerged.
- No merge to RC1/main.
- No Production deploy.
- Successful Preview is not Production readiness.
- Remaining legacy server bridges are not yet retired.
