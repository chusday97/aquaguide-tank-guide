# AquaGuide UI/UX — Latest Badcases

**Date:** 2026-08-20  
**Branch:** `agent/result-ux-v1`  
**Draft PR:** #105

## Current closure set

PUI-BC-040..054 are represented in the current UI/UX / Result UX work.

- PUI-BC-049 and PUI-BC-053 are evaluation-system failures, not user-facing product regressions.
- PUI-BC-050 is the Compatibility navigation semantics repair.
- PUI-BC-051/052 are Navigation Context closure cases inherited from #104.
- PUI-BC-054 is the live AI Tank Copilot reachability defect discovered by the final Result UX fail-before.

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

`openTankBuildCopilot()` dispatched:

`aquaguide:feature-preview`

instead of opening the existing Copilot state with:

`setIsTankCopilotOpen(true)`.

The product had both the entry and the implementation, but the entry was still wired to preview semantics.

### Fail-before evidence

- fail-before commit: `2fbdfcb373a9e32ebe274c090c9fdbf8397a6354`;
- Result UX V1 / run `32358918838`;
- static Result UX contract — PASS;
- Tank Copilot deterministic boundary contract — PASS;
- TypeScript / production build — PASS;
- all six earlier Result UX browser consumers — PASS;
- Tank Copilot browser step — FAIL waiting for the real `AI 建缸助手` dialog after clicking the live entry.

This isolated reachability as a real product defect rather than a Copilot policy/model failure.

### Fix

Product migration `582e9e341b0231ae30c6d37fa6536ef0d0498de7`:

- connects the visible quick action directly to the real Copilot dialog state;
- keeps deterministic Copilot sanitization unchanged;
- migrates generated output to shared `DecisionResultSurface`;
- makes the locally controlled next action first-screen primary;
- moves model interpretation/plan text behind disclosure;
- labels model-originated supporting context as `candidate`, never Verified;
- adds an explicit AI/local-rule authority boundary.

### Final evidence

Clean head:

- `4a4388f41ffafa902bf6f9bc25e2d2130cd09498`

Verified workflows:

- Result UX V1 / run `32359908856` — **PASS**, including live Tank Copilot entry + AI-authority browser regression;
- Plant Roster Edit Fix / run `32359908896` — **PASS**;
- Compatibility Stage Risk V1 / run `32359909061` — **PASS**.

### Guardrail

A user-visible feature entry must be browser-tested through the real product navigation path. The existence of an implementation, component, modal, service or README claim is not evidence that the feature is actually reachable.

For AI features specifically, reachability and authority are separate contracts: the feature must open, and once open its model output must still remain subordinate to deterministic product safety rules.

## PUI-BC-053 · Reload persistence test re-seeded the original fixture and manufactured a false regression

- **featureId:** `plant_livestock_edit`
- **source:** `evaluation_system`
- **severity:** medium
- **rootCauseLayer:** `evaluation_fixture`
- **status:** `regression_verified`

### Symptom

The browser regression for legacy `plants[]` data appeared to show:

`1株 → edit → 2株 → reload → back to 1株`

At first glance this looked like a product persistence or React state-sync failure.

### Evidence that disproved the product-bug hypothesis

Diagnostics captured immediately after save proved all relevant product state had already moved to `2`:

- structured record quantity = `2`;
- first batch quantity = `2`;
- legacy `plants[]` mirror still referenced the correct plant species;
- visible roster snapshot already contained `共 2株`.

Therefore the product save path was not losing the edit before reload.

### Root cause

The test helper used `context.addInitScript()` to seed localStorage and session state, but the script unconditionally executed:

- `localStorage.clear()`;
- original fixture write.

Playwright runs init scripts on navigation/reload. The test therefore saved `2株`, then `reload()` itself cleared that persisted state and re-injected the original `1株` fixture.

The evaluator destroyed the state it was attempting to verify.

### Fix

The fixture now uses a per-browser-context `sessionStorage` sentinel:

- seed storage once for the context;
- mark `aquaguide_fixture_seeded = 1`;
- return early on subsequent reload/navigation in the same context.

Reload now observes the product’s persisted state instead of overwriting it.

### Evidence

Implementation/evaluator fix head:

- `34ed3ea9025511a2419f0dd93ed6559bb276d8bb`

Verified workflow:

- Plant Roster Edit Fix / run `32338616480` — PASS
  - Plant livestock contract — PASS
  - Type check — PASS
  - Production build — PASS
  - Plant quantity/edit browser regression — PASS
  - Existing navigation-context regression — PASS

### Guardrail

Do not change product persistence logic solely to satisfy a reload test until the fixture proves it does not mutate or reseed the state under test.

The previously proposed local-aquarium load-race hypothesis was disproved and its temporary self-modifying workflow/script were removed. Do not revive that patch without new independent product evidence.

## PUI-BC-052 · Aquarium child detail closed to the wrong parent level

- **featureId:** `livestock_state_task`
- **source:** `navigation_context_audit`
- **severity:** medium
- **rootCauseLayer:** `nested_surface_navigation`
- **status:** `regression_verified`

### Symptom

`Aquarium → livestock roster → Species Detail → close` returned to the broad Aquarium page rather than reopening the immediate parent roster.

### Fix

Roster-scoped return context now records the originating record/fish and roster scroll, waits for the child detail exit to complete, reopens only the matching parent roster, restores its internal scroll, and returns focus to the original profile button.

### Evidence

- True fail-before: Navigation Context #5 / run `32281408153`.
- Product fixes: `28fb8a796bfd1b6b290daf74284945296daff9a3` + `dbf5546e99306ba078a723115451dcf12123a3b7`.
- Final combined verification: Navigation Context V1 #9 / run `32282629416` — PASS.

## PUI-BC-051 · Search deep-result return lost expanded-list context

- **featureId:** `species_search`
- **source:** `navigation_context_audit`
- **severity:** medium
- **rootCauseLayer:** `navigation_state`
- **status:** `regression_verified`

### Symptom

After explicit “View all”, opening a deep Species/Care result and returning from detail collapsed the list; the original result no longer existed in the DOM, so source-ID focus restoration could not work.

### Fix

Search return context now preserves query, source ID, Species/Care expansion state and workspace scroll. It restores list structure first, then exact scroll + focus, and clears stale context when query changes.

### Evidence

- Fail-before: Navigation Context V1 #1 / run `32280048039`.
- Product fix: `9feaac4d90fef5ce2e4665154f9554759e15f591`.
- Evaluator correction: `7a736ef6349b4b77dceaf240c1fc61f96f769b98`.
- Final combined verification: Navigation Context V1 #9 / run `32282629416` — PASS.

## PUI-BC-050 · Risk review jumped directly into Compatibility and deep-scrolled Atlas

- **featureId:** `compatibility`
- **source:** `user_review`
- **severity:** medium
- **rootCauseLayer:** `navigation_semantics`
- **status:** `regression_verified`

### Symptom

For unsuitable / caution species, the first risk action jumped directly to the full Compatibility calculator; entering Compatibility could also deep-scroll the underlying Atlas surface.

### Fix

Risk review is now two-stage: first action expands in-context Compatibility evidence without changing route; only an explicit second-stage action enters the full calculator. Compatibility is treated as a top-level working surface and no longer requires deep Atlas anchor scrolling.

### Evidence

- Product fixes: `d91a227a58ea6383a2f654d70b54d946f0d2f121` + `0c0189edb9dd707a8e83409dee15b3705ef78d29`.
- UI UX System Refactor V1 #69 / run `32275254732` — PASS.

## PUI-BC-049 · Golden comparator 1024 cross-language rounding false failure

- **featureId:** `evaluation_system`
- **severity:** medium
- **rootCauseLayer:** `evaluation_contract`
- **status:** `regression_verified`

Python banker’s rounding and JavaScript `Math.round()` disagreed on an approved thumbnail dimension. `manifest.json` thumbnail dimensions are now authoritative. This was evaluator drift, not UI drift.

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
- Reload/persistence tests must prove their fixture does not mutate the persisted state being measured.
- Closed disclosure content must be read from DOM text when the test is verifying retained hidden content; `innerText()` only reflects rendered text.
- Canonical product badcase updates remain append-only unless a separately justified correction is required.

## Canonical registry note

PUI-BC-053 is recorded here as an **evaluator-only** badcase. Do not automatically append it to `evaluation/product/badcases.v1.jsonl` until the registry’s intended scope for evaluator failures is explicitly checked.

PUI-BC-054 is a genuine product badcase, but this handoff does not claim it has been appended to the canonical JSONL registry unless that registry is separately inspected and updated.

## Non-claims

- PR #105 remains Draft.
- No merge to RC1/main.
- No production deploy.
- Browser evidence is deterministic PR regression evidence, not production telemetry.
