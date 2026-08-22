# AquaGuide — Latest Badcases

**Updated:** 2026-08-22  
**Branch:** `agent/rc1-post-105-evaluator-repair`  
**Purpose:** current handoff-level badcase ledger. Canonical historical product registry remains under `evaluation/product/`.

## EVAL-BC-002 — Post-#105 RC1 evaluator drift after real merge

- **Area:** release evaluation / stacked architecture migration
- **Severity:** high
- **Source:** actual RC1→main synthetic validation after #105 merged
- **Status:** regression_verified on repair branch; RC1 closure pending #107 merge authorization
- **RC1 head at fail-before:** `e5a9dd1ccc18a296075521fdd01b0407341af617`
- **RC1 Release Acceptance:** `32575093543` — FAIL
- **UI Interaction Repair V1:** `32575093548` — FAIL
- **Product Golden Path:** `32575093550` — FAIL
- **Repair PR:** #107 `Repair post-#105 RC1 evaluator drift`
- **Executable diagnostic:** `32575689962` — PASS
- **Verified repair head before docs refresh:** `13ef3b4c2fd3c7df9fb43127da4dcf153e1bfc7a`
- **Permanent gates on verified repair head:** Security `32575784071`, Dependency `32575784098`, Compatibility `32575784108`, Plant `32575784097`, Result UX `32575784082` — all PASS

### Symptoms

Three different workflows failed immediately after #105 was actually merged into RC1. The failures appeared release-critical because they touched production runtime, UI interaction and GP-002.

### Root causes

The failures were evaluator drift caused by legitimate prior migrations:

1. **Canonical API app ownership moved.** The production runtime source contract still searched for `legacyApp.use('/api/v1', ...)`, while the canonical Express app now mounts V1 with `app.use('/api/v1', ...)`.
2. **Species Detail implementation moved behind wrapper/Base separation.** Wide/full-screen detail behavior lives in `SpeciesDetailDialogBase.tsx`, while the legacy evaluator scanned only the wrapper.
3. **Atlas implementation moved behind wrapper/Base separation.** Route addressing, return context and compatibility-selection handler live in `EncyclopediaBase.tsx`; `Encyclopedia.tsx` now owns a narrower navigation/surface guard role.
4. **Compatibility Result UX changed its stable semantic boundary.** The old `[data-compatibility-verdict]` + large symbol DOM structure was removed. The current stable result boundary is `DecisionResultSurface`, exposed through `[data-testid="compatibility-decision"][data-result-ux="decision"]` with a status icon/verdict pill and result-first ordering.
5. **GP-002 interaction intentionally became two-stage.** Species Detail first reveals in-context compatibility evidence; a second explicit action enters the full calculator. Browsing still must not silently preselect the species.

### Repair rule

- migrate source assertions to the component/file that now owns the behavior;
- preserve the original semantic contract rather than deleting assertions;
- validate current `DecisionResultSurface` semantics instead of obsolete DOM markers;
- keep result-before-selector ordering, Unknown != Safe, inline AI explanation, browsing-not-selection and exact return-context contracts;
- update GP-002 to follow the current explicit two-stage intent while still proving persisted stocking behavior;
- do not modify product runtime/CSS/persistence/rules merely to satisfy stale evaluators;
- do not weaken thresholds.

### Verification

Temporary PR-only diagnostic run `32575689962` passed:

- production cloud runtime source contract;
- production cloud runtime smoke;
- UI interaction source contract;
- TypeScript;
- production build;
- UI interaction browser regression;
- GP-002 continuous browser path.

The temporary diagnostic workflow was then deleted from the PR.

On repair head `13ef3b4c...`, all five permanent release/product gates also passed.

### Remaining boundary

This badcase is not closed on the RC1 branch yet because PR #107 is still separate from RC1. After a separately authorized #107 merge, the actual RC1→main Release Acceptance, UI Interaction and Product Golden workflows must run green on final ancestry before the badcase can be marked closed for the release candidate.

---

## PUI-BC-059 — Tank Copilot accepted schema-valid but non-actionable AI parsing

- **Feature:** Tank Copilot / AI result usefulness
- **Severity:** high
- **Status:** regression_verified for encoded failure modes
- **Fail-before head:** `ab5243404a3c770ce5a8ed8905008a973de37dfa`
- **Fail-before Result UX:** `32573810707` — FAIL
- **Policy fix:** `ef843ef384d09cb79d8ac7df62372e21db0241e8`
- **Prompt + cleanup fix:** `4814e8a0b565f18d9bde7623fd4ebda68049f988`
- **RC1-reconciled proof:** Result UX `32574415605` — PASS

### Symptom

The old path treated `valid JSON + no deterministic safety violation` as sufficient. The model could still return no candidates despite a deterministic usable pool, use `restart_goal`, or output generic workflow filler.

### Repair rule

- blocking deterministic tank facts first;
- `complete_tank_info` while those facts are missing;
- recover only inside the deterministic safe/adjustable pool when the model drops all usable candidates;
- reject unnecessary `restart_goal` when executable candidates exist;
- require concrete candidate/quantity planning;
- AI still receives no hard-safety authority.

### Remaining boundary

Repository fixtures do not prove representative live-provider quality. Live usefulness evaluation is still required before production.

---

## EVAL-BC-001 — Parent visual evaluator contradicted approved narrow-desktop hierarchy

- **Area:** UI evaluation / stacked-PR migration
- **Severity:** medium
- **Status:** regression_verified
- **Fail-before head:** `ff558c03c5af758b21bcf2098be074189ea7741b`
- **Visual QA fail:** `32574163661`
- **Golden V3 fail:** `32574163627`
- **Migration fix:** `b2b6830f1864f9600fd32a4f87bf6151970545a1`
- **Final Visual QA:** `32574415581` — PASS
- **Final Golden V3:** `32574415709` — PASS
- **Final UI System:** `32574415630` — PASS

The parent evaluator still expected 768px `Today → Manage → Context`, while approved PUI-BC-058 intentionally established desktop `Today → Context → Manage`. Only the 768px evaluator/reference was migrated; 390px phone ordering and the 0.5% Golden threshold were preserved.

---

## REL-BC-001 — Production dependency graph contained untriaged high-severity findings

- **Area:** release baseline / dependency security
- **Severity:** high
- **Status:** regression_verified
- **Landed by:** `5c277cec1f99f5bb507b7d50b2018d5d571ef0f1`

Current state:

- production audit: 0 findings;
- full developer/build graph: 12 dev-only findings = 7 high / 2 moderate / 3 low;
- permanent production dependency gate remains green and read-only.

---

## PUI-BC-057 — Wide Care guide stayed narrow inside a wide workspace

- **Feature:** Care / Result UX
- **Severity:** high
- **Status:** regression_verified
- **Fixed by:** `4ecd3cb6741aaa61d76388ea26ec4aa7d1461a17` + `1c8acbcbfa175687dba81d144485ea08a0ee3f89`

At 1440px, actionable Care content was constrained first by the split grid and then by `max-w-[850px]`. Repair made the decision content span the wide workspace without lowering the >=940px contract and preserved mobile ordering.

---

## PUI-BC-058 — Narrow desktop Aquarium pushed tank context below management

- **Feature:** Aquarium home hierarchy
- **Severity:** high
- **Status:** regression_verified
- **Fixed by:** `dbaab622371494a89effafe1e982598c46b2d1f7`

Desktop >=768px now preserves `Today → Context → Manage → Secondary` when the Aquarium container is narrow, while phone remains task-first. Parent visual evaluators were later migrated to encode the same approved behavior.

## Carry-forward discipline

- A merged PR is not automatically a release-ready RC.
- Preserve fail-before evidence; do not lower thresholds merely to turn CI green.
- When architecture moves, migrate evaluator ownership rather than deleting semantic assertions.
- Browser evidence outranks source-file assumptions for user-visible behavior.
- Treat schema-valid, safe and useful as separate AI quality dimensions.
- AI cannot override deterministic hard-safety rules.
- A fixture proves behavior under that fixture, not live-provider quality.
- Separate product/browser badcases from release/evaluator badcases.
- Do not mark EVAL-BC-002 closed on RC1 until #107 is explicitly merged and real RC1→main acceptance is green.