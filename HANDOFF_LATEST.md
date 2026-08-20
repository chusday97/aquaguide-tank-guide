# AquaGuide Handoff — Result UX + Production Readiness

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1`  
**Parent PR:** #104 `Converge AquaGuide UI/UX system on RC1`  
**Latest fully validated product baseline:** `9f82b54ef1772239bbb4c37aa296f95f3edc7f18`  
**Current branch head before this handoff sync:** `22366a1affc70ee7f8364ae47c47867859776436`

## Current state

Result UX, lifecycle/plant regressions, production-security contracts, and machine-readable badcase governance are complete. PR #105 remains **open / mergeable / Draft / not merged**. No production deployment has been performed.

Verified live Result UX consumers:

1. Diagnosis — DONE
2. Compatibility — DONE
3. Knowledge — DONE
4. Procedure — DONE
5. Species Detail — DONE
6. Identification — DONE
7. Live AI Tank Copilot — DONE

## Authoritative clean gate matrix

Latest fully validated baseline `9f82b54ef1772239bbb4c37aa296f95f3edc7f18`:

- Production Security Boundary V1 / `32368840837` — **PASS**
- Result UX V1 / `32368840832` — **PASS**
- Plant Roster Edit Fix / `32368840889` — **PASS**
- Compatibility Stage Risk V1 / `32368840922` — **PASS**

Permanent CI permissions remain `contents: read`.

## Product badcase registry — CLOSED

The machine-readable product registry includes:

- `PUI-BC-054` → `tank_copilot`;
- `PUI-BC-055` → `share_report`.

`evaluation/product/feature-states.v1.json` contains the six-state `share_report` contract. `PUI-BC-053` remains evaluator-only and intentionally excluded.

Registry product commit: `e59a73ab85ba1f72a562c511675cc776aeb1725c`.

## Production security closure — PUI-BC-055

Repository-level security closure remains valid:

1. dedicated `SHARE_TOKEN_SECRET` only — no service-role fallback;
2. RC1 release acceptance enforces the share-report contract;
3. `/api/v1/business-health` exposes boolean `shareReportsConfigured`;
4. readiness requires database config + service-role + dedicated signing secret + canonical `WEB_BASE_URL`.

Production must still pass `RC1 Post-Deploy Smoke`, including `shareReportsConfigured:true`.

## Vercel Preview policy — CHANGED INTENTIONALLY

The prior repair policy `vercel.json -> git.deploymentEnabled: false` was deliberately removed on commit:

`22366a1affc70ee7f8364ae47c47867859776436` — `Restore Vercel preview deployments`

This restores Git-driven Vercel deployments for the branch. It was an explicit Preview decision, not a production deploy decision.

GitHub status now identifies the connected Vercel project as `aquaguide` and the push generated a Vercel deployment attempt. That deployment failed before a usable Preview URL was produced.

### Current Preview blocker

Vercel reports the **Function 250 MB size limit** as the deployment blocker.

This is not currently treated as evidence that the frontend site itself is 250 MB. The relevant problem is the serverless function dependency/output bundle.

Recommended Preview-only diagnostic flags in Vercel project environment settings:

- `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`
- `VERCEL_ANALYZE_BUILD_OUTPUT=1`

Use them for **Preview only**, then redeploy to obtain real function-size/dependency output before making deeper bundle claims.

## Current architecture — clarified

AquaGuide does have a backend. The current system should be understood as:

```text
React / Vite frontend
  ├─ Supabase Auth (browser session / access token)
  └─ /api/v1/*
       ↓
Vercel Functions (server runtime)
       ↓
AquaGuide backend: apps/api/src
  ├─ auth / HTTP boundary
  ├─ business routes
  ├─ AI orchestration
  ├─ admin / share reports / feedback
  └─ Supabase clients
       ↓
Supabase PostgreSQL + Auth
External: DeepSeek / Vision / Resend
```

Layer meanings:

- **Frontend:** `src/` — React UI, client-side services and interaction;
- **Frontend API SDK:** `src/services/api/api-client.ts` — calls `/api/v1/*` and forwards the Supabase access token;
- **Backend:** `apps/api/src/` — business logic, authorization, API contracts, AI orchestration;
- **Server/runtime:** Vercel Functions — where backend code executes;
- **Database/auth infrastructure:** Supabase — PostgreSQL, Auth, user/public/admin data access;
- **External services:** DeepSeek / Vision / Resend.

Supabase is therefore not a replacement for the backend. It supplies database/auth infrastructure; AquaGuide still needs its own server-side business/API layer.

## Architecture debt discovered during Preview debugging

The main server-boundary problem is not the existence of a catch-all route by itself. The stronger problem is the dependency direction:

```text
api/v1/[...path].ts
  ↓
apps/api/src/app.ts
  ↓
server/index.mjs   ← legacy server
```

`apps/api/src/app.ts` currently imports the legacy `server/index.mjs` and mounts the new `v1Router` onto it.

The legacy server is not a pure backend module. It also contains:

- Express server setup;
- legacy AI routes / prompt logic;
- static `dist` serving;
- SPA fallback handling.

That means the production API dependency tree can pull legacy server concerns back into the Vercel Function. This is a plausible contributor to oversized function output and is an architecture issue even if it is not the sole 250 MB cause.

Additional duplicate legacy entry points remain, including paths such as:

- `api/ai/chat.js -> server/index.mjs`;
- `api/v1/health.js -> server/index.mjs`.

## Recommended backend/server refactor order

Do **not** start by splitting every endpoint into a separate Vercel Function.

### Phase 1 — detach the new backend from legacy server

Target:

```text
api/v1/[...path].ts
  ↓
apps/api/src/app.ts
  ↓
express() + v1Router
```

`apps/api/src/app.ts` should create and own its own Express app. Production `/api/v1` must no longer import `server/index.mjs` or static `dist` handling.

Keep the public API contract `/api/v1/*` unchanged.

### Phase 2 — migrate remaining legacy AI/server responsibilities

Move live AI endpoints and orchestration still living in `server/index.mjs` into `apps/api/src/ai` / `apps/api/src/routes`.

Remove bridge entries that import the legacy server once equivalent new routes are verified.

Keep `server/index.mjs` only as a local-development compatibility layer until it can be retired completely.

### Phase 3 — remeasure the Vercel function bundle

After Phase 1/2:

1. rerun TypeScript/build/API contracts;
2. rerun the four permanent #105 gates;
3. redeploy Preview with build-output analysis;
4. inspect actual Function size and dependency contributors.

Only if the cleaned catch-all remains materially oversized should `/api/v1` be split into a few deployment domains such as core / AI / admin/share. Avoid one-function-per-endpoint overengineering.

## Target architecture

```text
01 Presentation
React / Vite / UI
        ↓
02 Application client
Frontend services + API client
        ↓
03 Backend
apps/api/src
Auth + business rules + API + AI orchestration
        ↓
04 Runtime
Vercel Functions
        ↓
05 Data / external infrastructure
Supabase PostgreSQL + Auth
DeepSeek / Vision / Resend
```

The immediate optimization goal is to make `apps/api` the single authoritative production backend and remove the reverse dependency on `server/index.mjs`.

## Stack / integration state

Current stacked topology remains:

- #104: `integration/aquaguide-rc1` → `agent/uiux-system-refactor-v1`;
- #105: `agent/uiux-system-refactor-v1` → `agent/result-ux-v1`.

Correct transition remains:

1. review #104 as its bounded UI/UX-system PR;
2. merge #104 to RC1 only with explicit authorization;
3. retarget #105 to RC1;
4. inspect/reconcile actual new ancestry;
5. rerun all four permanent #105 gates against RC1;
6. review #105 separately;
7. make explicit merge/deploy decisions.

## Non-blocking engineering debt

- npm audit: 18 findings (2 low, 6 moderate, 10 high);
- mixed dynamic/static Vite imports;
- large main / react-three-fiber chunks;
- wrapper/Base structures inherited from #104.

Do not blindly run `npm audit fix` or widen the stack without a validated reason.

## Next engineering action

The next architecture repair should be **Phase 1: make `apps/api/src/app.ts` independent from `server/index.mjs` while preserving `/api/v1/*` behavior and all deterministic/security contracts**.

This is separate from the #104 merge decision. No merge or production deployment is authorized by this handoff update.
