# AquaGuide UI/UX — Latest Badcases

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**Draft PR:** #105

## Current closure set

PUI-BC-040..055 are represented in the current UI/UX / Result UX / production-readiness work.

- PUI-BC-049 and PUI-BC-053 are evaluation-system failures, not user-facing product regressions.
- PUI-BC-050 is the Compatibility navigation semantics repair.
- PUI-BC-051/052 are Navigation Context closure cases inherited from #104.
- PUI-BC-054 is the live AI Tank Copilot reachability defect discovered by the final Result UX fail-before.
- PUI-BC-055 is the share-report credential-separation and release/deployment-readiness defect found in production audit.

## PUI-BC-055 · Share-report signing reused a high-privilege database secret and release checks could not prove production readiness

- **featureId:** `share_report`
- **source:** `production_readiness_audit`
- **severity:** high
- **rootCauseLayer:** `secret_boundary_release_readiness`
- **status:** `regression_verified`

### Symptom

The share-report route had a fail-closed path when its signing secret was absent, but `apps/api/src/config.ts` prevented that path from being reached by silently falling back from `SHARE_TOKEN_SECRET` to `SUPABASE_SERVICE_ROLE_KEY`.

This created two problems:

1. the highest-privilege database credential was reused for an unrelated HMAC signing purpose;
2. production/release checks could report the API as healthy without proving that share-report signing, admin database access, and canonical public-link configuration were actually ready.

The problem was not a leaked secret value. It was credential-role mixing plus insufficient release/deployment observability.

### Root cause

The old configuration included:

`shareTokenSecret: process.env.SHARE_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''`

The release pipeline also had three gaps:

- RC1 Release Acceptance did not run `test:share-report-contract`;
- `/api/v1/business-health` exposed only general database readiness;
- post-deploy smoke therefore could not detect missing share-report dependencies or a missing canonical `WEB_BASE_URL`.

### Fail-before evidence

The defect was decomposed into four narrow fail-before checks rather than one broad speculative patch:

1. Production Security / `32363518780` — FAIL exactly because service-role fallback still existed.
2. Production Security / `32364388187` — FAIL exactly because RC1 Release Acceptance did not run the share-report security contract.
3. Production Security / `32364742513` — FAIL exactly because business-health lacked a boolean share-report readiness signal.
4. Production Security / `32365165728` — FAIL exactly because readiness did not require `WEB_BASE_URL`.

Expected fail-before failures are evidence for this one underlying product/security badcase; they are not four additional badcases.

### Fix

Key commits:

- `173530bdc5ea34abcea65d00700b145fc7cf88db` — require dedicated `SHARE_TOKEN_SECRET`; remove service-role fallback.
- `8f9bccf3dc7ba85688c9d727dc551cd3898b60d6` — add `test:share-report-contract` to RC1 Release Acceptance.
- `6f4f402414d36296a17b3087ed8ce4e550ba5208` — expose boolean-only `shareReportsConfigured` in business-health and require it in post-deploy smoke.
- `1da62bb1ce11098ce38a489e6a7b95bc40995178` — require `WEB_BASE_URL` as part of share-report readiness.

`shareReportsConfigured` is true only when business database configuration, service-role access, dedicated signing secret, and canonical web base URL are all present. The health response never includes secret values.

### Final evidence

Initial security closure head:

- `1da62bb1ce11098ce38a489e6a7b95bc40995178`

Verified workflows:

- Production Security Boundary V1 / `32365318251` — **PASS**;
- Result UX V1 / `32365318222` — **PASS**;
- Plant Roster Edit Fix / `32365318305` — **PASS**;
- Compatibility Stage Risk V1 / `32365318290` — **PASS**.

Canonical registry + final read-only cleanup is additionally verified on head `363e29bd9a93b4b87f2cd28af1351589a5b84681` by Security `32368279920`, Result UX `32368279929`, Plant `32368279880`, and Stage Risk `32368279892`, all PASS.

### Deployment caveat

The connected Vercel account exposed the team but returned no projects through the available project listing. Therefore this repair does **not** claim that the real target environment already has `SHARE_TOKEN_SECRET` or `WEB_BASE_URL` configured.

The deployed environment must still pass `RC1 Post-Deploy Smoke`, which now requires `shareReportsConfigured:true`.

### Guardrail

High-privilege infrastructure credentials must not be reused as convenience fallbacks for application signing/encryption purposes. A missing dedicated secret should fail closed.

Release readiness and deployment readiness are different contracts: source code can require the right environment variables, but a post-deploy capability check must prove that the actual runtime has them without exposing their values.

## PUI-BC-054 · AI Tank Copilot quick action existed but could not open the real Copilot

- **featureId:** `tank_copilot`
- **source:** `result_ux_fail_before`
- **severity:** high
- **rootCauseLayer:** `feature_entry_wiring`
- **status:** `regression_verified`

### Symptom

Aquarium visibly exposed an `AI 建缸助手 / AI Tank Copilot` quick action and the Copilot dialog implementation already existed in `src/pages/Aquarium.tsx`, but clicking the advertised entry did not open that dialog.

The feature therefore looked available while its real task surface was unreachable from the live product entry.

### Root cause

`openTankBuildCopilot()` dispatched `aquaguide:feature-preview` instead of opening the existing Copilot state with `setIsTankCopilotOpen(true)`.

### Fail-before evidence

- fail-before commit: `2fbdfcb373a9e32ebe274c090c9fdbf8397a6354`;
- Result UX V1 / run `32358918838`;
- static Result UX contract — PASS;
- Tank Copilot deterministic boundary contract — PASS;
- TypeScript / production build — PASS;
- all six earlier Result UX browser consumers — PASS;
- Tank Copilot browser step — FAIL waiting for the real dialog after clicking the live entry.

### Fix

Product migration `582e9e341b0231ae30c6d37fa6536ef0d0498de7`:

- connects the visible quick action to the real Copilot dialog;
- preserves deterministic sanitization;
- uses shared `DecisionResultSurface`;
- keeps locally controlled next action primary;
- puts model interpretation behind disclosure;
- labels model-originated supporting context as `candidate`, never Verified;
- makes the AI/local-rule authority boundary explicit.

### Final evidence

- Result UX V1 / `32359908856` — PASS including live Tank Copilot entry + authority regression;
- Plant / `32359908896` — PASS;
- Stage Risk / `32359909061` — PASS.

### Guardrail

A user-visible feature entry must be browser-tested through the real product path. Existence of an implementation or README claim is not evidence that the feature is reachable. For AI features, reachability and authority are separate contracts.

## PUI-BC-053 · Reload persistence test re-seeded the original fixture and manufactured a false regression

- **featureId:** `plant_livestock_edit`
- **source:** `evaluation_system`
- **severity:** medium
- **rootCauseLayer:** `evaluation_fixture`
- **status:** `regression_verified`

### Symptom

The browser regression for legacy `plants[]` data appeared to show `1株 → edit → 2株 → reload → back to 1株`.

### Root cause

The test helper used `context.addInitScript()` to clear/reseed localStorage on every navigation/reload. The evaluator destroyed the persisted state it intended to verify.

### Fix / evidence

A per-browser-context `sessionStorage` sentinel now seeds once and returns early later.

- evaluator fix head: `34ed3ea9025511a2419f0dd93ed6559bb276d8bb`;
- Plant Roster Edit Fix / `32338616480` — PASS including reload persistence and Navigation Context.

### Guardrail

Do not change product persistence solely to satisfy reload tests until the fixture proves it does not mutate the state under measurement.

## PUI-BC-052 · Aquarium child detail closed to the wrong parent level

- **featureId:** `livestock_state_task`
- **source:** `navigation_context_audit`
- **severity:** medium
- **rootCauseLayer:** `nested_surface_navigation`
- **status:** `regression_verified`

### Symptom

`Aquarium → livestock roster → Species Detail → close` returned to the broad Aquarium page rather than reopening the immediate parent roster.

### Fix / evidence

Roster-scoped return context records originating record/fish + roster scroll, reopens only the matching parent roster after child exit, restores scroll and returns focus to the original profile button.

- true fail-before: Navigation Context #5 / `32281408153`;
- product fixes: `28fb8a796bfd1b6b290daf74284945296daff9a3` + `dbf5546e99306ba078a723115451dcf12123a3b7`;
- final Navigation Context #9 / `32282629416` — PASS.

## PUI-BC-051 · Search deep-result return lost expanded-list context

- **featureId:** `species_search`
- **source:** `navigation_context_audit`
- **severity:** medium
- **rootCauseLayer:** `navigation_state`
- **status:** `regression_verified`

### Symptom

After explicit “View all”, opening a deep Species/Care result and returning collapsed the list, removing the original result from the DOM and breaking exact focus/scroll restoration.

### Fix / evidence

Search return context preserves query, source ID, Species/Care expansion state and workspace scroll, restores list structure first, then exact scroll/focus.

- fail-before Navigation Context #1 / `32280048039`;
- fix `9feaac4d90fef5ce2e4665154f9554759e15f591`;
- evaluator correction `7a736ef6349b4b77dceaf240c1fc61f96f769b98`;
- final Navigation Context #9 / `32282629416` — PASS.

## PUI-BC-050 · Risk review jumped directly into Compatibility and deep-scrolled Atlas

- **featureId:** `compatibility`
- **source:** `user_review`
- **severity:** medium
- **rootCauseLayer:** `navigation_semantics`
- **status:** `regression_verified`

### Symptom

For unsuitable/caution species, the first risk action jumped directly to the full Compatibility calculator, and Compatibility could deep-scroll the underlying Atlas.

### Fix / evidence

Risk review is two-stage: first expand in-context Compatibility evidence; only explicit second-stage action enters full calculator. Compatibility is a top-level working surface.

- fixes `d91a227a58ea6383a2f654d70b54d946f0d2f121` + `0c0189edb9dd707a8e83409dee15b3705ef78d29`;
- UI UX System Refactor V1 #69 / `32275254732` — PASS.

## PUI-BC-049 · Golden comparator 1024 cross-language rounding false failure

- **featureId:** `evaluation_system`
- **severity:** medium
- **rootCauseLayer:** `evaluation_contract`
- **status:** `regression_verified`

Python banker’s rounding and JavaScript `Math.round()` disagreed on approved thumbnail geometry. `manifest.json` dimensions are now authoritative. This was evaluator drift, not UI drift.

## Prior UI/UX closure retained

- PUI-BC-040 — Collection top-level IA converged on a 3-live-module focus carousel; Achievements removed from primary business IA.
- PUI-BC-041 — typography/design-token ownership converged on the foundation layer.
- PUI-BC-042 — Search Care results gained explicit show-all parity.
- PUI-BC-043 — inactive-carousel focusability + sub-44px named controls closed.
- PUI-BC-044 — iPad widthless-UA fallback ordering corrected.
- PUI-BC-045 — narrow Aquarium workspace preserves task-first hierarchy.
- PUI-BC-046 — 1024 sidebar width cliff removed.
- PUI-BC-047 — Search nested layout follows real content width.
- PUI-BC-048 — return-context navigation band no longer overlaps Aquarium chrome/content.

## Evidence-quality rules retained

- Validate user-visible state from deterministic state/data when available, not labels alone.
- Test the real visible surface, not a zero-layout wrapper around a fixed child.
- Navigation tests must distinguish “review evidence” from “change task/mode”.
- Scroll restoration is part of navigation correctness.
- Nested task surfaces must restore the immediate parent task before broader page context.
- Browser code inside `waitForFunction/evaluate` must be plain browser-valid JavaScript.
- Reload/persistence tests must prove their fixture does not mutate persisted state.
- Closed disclosure content should use DOM text when verifying retained hidden content.
- Security-sensitive credentials must have one explicit role; missing dedicated secrets fail closed.
- Release source contracts do not prove deployed environment configuration; use runtime health/post-deploy smoke.
- Canonical product badcase updates remain append-only unless a separately justified correction is required.

## Canonical registry note

PUI-BC-053 is evaluator-only and remains intentionally outside the product-only canonical registry.

PUI-BC-054 and PUI-BC-055 are now appended to `evaluation/product/badcases.v1.jsonl`. PUI-BC-055 is backed by the new six-state `share_report` feature contract in `evaluation/product/feature-states.v1.json`. The append was guarded as +2/-0, validated by `npm run test:product-evaluation`, and finalized under read-only CI on head `363e29bd9a93b4b87f2cd28af1351589a5b84681` / Security run `32368279920`.

## Non-claims

- PR #105 remains Draft.
- No merge to RC1/main.
- No production deploy.
- Repository CI evidence is not production telemetry.
- The current Vercel connector could not verify actual project environment-variable configuration.
