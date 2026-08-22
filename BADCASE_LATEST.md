# AquaGuide — Latest Badcases

**Updated:** 2026-08-22  
**Sync branch:** `agent/rc1-post-107-release-sync`  
**Purpose:** current handoff-level badcase ledger. Canonical historical product registry remains under `evaluation/product/`.


## PUI-BC-060 — Saved substrate was not visibly applied to the 3D aquarium

- **Feature:** Aquarium / Tank Settings / 3D visualization
- **Severity:** high
- **Status:** `candidate_regression_verified`
- **Repair PR:** #110 `Render substrate as a tank-bottom surface`
- **Candidate browser proof:** `32579071402` — PASS

### Fail-before / root cause

1. `ThreeAquarium` silently rendered River Sand for freshwater or Coral Sand for saltwater when `aquarium.substrate` was empty, so a later real selection could look unchanged.
2. Substrate was partly modeled as hundreds of individual pebble/grain meshes, conflicting with the product meaning of substrate as a continuous tank-floor layer.
3. There was no stable runtime marker proving that the persisted substrate value was the value consumed by the 3D renderer.

### Repair rule

- bare bottom must remain explicit (`none`), with no invented substrate;
- renderer must consume `aquarium.substrate` directly;
- configured substrate must fill the tank bottom as a continuous bed/surface layer;
- hardscape remains object-based; substrate is not a discrete decoration object;
- settings persistence and 3D consumption must be covered by one browser path.

### Candidate verification

Run `32579071402` passed source contract, repository settings contract, TypeScript, production build and Chromium browser regression. The browser flow proved: bare bottom → open Tank Settings → choose `黑金沙` → save → persisted aquarium `substrate=黑金沙` → rendered 3D `data-substrate=黑金沙`.

The candidate is verified on #110 but is **not yet in RC1**, so this badcase does not move to `regression_verified` until #110 is explicitly merged and RC1 regression is re-proven.

---

## EVAL-BC-002 — Post-#105 RC1 evaluator drift after real merge

- **Area:** release evaluation / stacked architecture migration
- **Severity:** high
- **Source:** actual RC1→main synthetic validation after #105 merged
- **Status:** `closed_for_rc_code_regression`
- **Fail-before RC1 head:** `e5a9dd1ccc18a296075521fdd01b0407341af617`
- **Repair PR:** #107 `Repair post-#105 RC1 evaluator drift`
- **#107 merge commit:** `8d506fae4b165fdd4aed5f7a04101dc16d5d7d7f`

### Fail-before

- RC1 Release Acceptance `32575093543` — FAIL
- UI Interaction Repair V1 `32575093548` — FAIL
- Product Golden Path `32575093550` — FAIL

### Root causes

The failures were evaluator drift caused by legitimate prior migrations:

1. canonical API app ownership moved from the old `legacyApp` marker to the current `app.use('/api/v1', ...)` mount;
2. Species Detail wide/full-screen implementation moved behind wrapper/Base separation;
3. Atlas route/navigation/selection behavior moved to `EncyclopediaBase.tsx` while the wrapper retained a narrower guard role;
4. Compatibility Result UX moved from legacy verdict DOM markers to the shared `DecisionResultSurface` semantic boundary;
5. GP-002 intentionally became two-stage: reveal in-context compatibility evidence, then explicitly enter the calculator.

### Repair rule

- migrate assertions to the current owner instead of deleting them;
- preserve result-first ordering, Unknown != Safe, inline AI explanation, browsing-not-selection and exact return context;
- validate the current decision surface instead of obsolete DOM structure;
- update GP-002 to the current explicit two-stage intent while still proving the final persisted stocking write;
- do not modify product runtime/CSS/persistence/rules merely to satisfy stale evaluators;
- do not lower thresholds.

### Verification

Targeted diagnostic before merge:

- run `32575689962` — PASS for cloud runtime source+smoke, UI source, TypeScript/build, UI browser regression and GP-002.

Final real RC1→main matrix after #107 merge:

- RC1 Release Acceptance `32576580996` — PASS
- Product Golden Path `32576580976` — PASS
- UI Interaction Repair V1 `32576580968` — PASS
- UI UX System Refactor V1 `32576580986` — PASS
- UI UX Visual QA V2 `32576580966` — PASS
- UI UX Golden V3 `32576581069` — PASS
- UI V2 Aquarium `32576580983` — PASS
- Navigation Context V1 `32576580972` — PASS
- Bundle Audit V1 `32576580993` — PASS

The three original release-level failures are therefore closed on the actual RC1 ancestry. This does **not** mean production is validated; deployed-environment acceptance is a separate release boundary.

---

## PUI-BC-059 — Tank Copilot accepted schema-valid but non-actionable AI parsing

- **Feature:** Tank Copilot / AI result usefulness
- **Severity:** high
- **Status:** `regression_verified` for encoded repository-level failure modes
- **Fail-before Result UX:** `32573810707` — FAIL
- **Policy fix:** `ef843ef384d09cb79d8ac7df62372e21db0241e8`
- **Prompt + cleanup fix:** `4814e8a0b565f18d9bde7623fd4ebda68049f988`

### Repair rule

- blocking deterministic tank facts first;
- `complete_tank_info` while those facts are missing;
- recover only inside the deterministic safe/adjustable pool when the model drops all usable candidates;
- reject unnecessary `restart_goal` when executable candidates exist;
- require concrete candidate/quantity planning;
- AI receives no hard-safety authority.

### Remaining boundary

Repository fixtures do not prove representative live-provider quality. Live usefulness evaluation is still required before production.

---

## EVAL-BC-001 — Parent visual evaluator contradicted approved narrow-desktop hierarchy

- **Area:** UI evaluation / stacked-PR migration
- **Severity:** medium
- **Status:** `regression_verified`
- **Visual QA fail:** `32574163661`
- **Golden V3 fail:** `32574163627`
- **Migration fix:** `b2b6830f1864f9600fd32a4f87bf6151970545a1`

The parent evaluator still expected 768px `Today → Manage → Context`, while approved PUI-BC-058 intentionally established desktop `Today → Context → Manage`. Only the 768px evaluator/reference was migrated; phone ordering and the 0.5% Golden threshold were preserved. Final RC1 visual/golden/system workflows remain green.

---

## REL-BC-001 — Production dependency graph contained untriaged high-severity findings

- **Area:** release baseline / dependency security
- **Severity:** high
- **Status:** `regression_verified`
- **Landed by:** `5c277cec1f99f5bb507b7d50b2018d5d571ef0f1`

Current state:

- production audit: 0 findings;
- full developer/build graph: 12 dev-only findings = 7 high / 2 moderate / 3 low;
- permanent production dependency gate remains read-only.

---

## PUI-BC-057 — Wide Care guide stayed narrow inside a wide workspace

- **Feature:** Care / Result UX
- **Severity:** high
- **Status:** `regression_verified`
- **Fixed by:** `4ecd3cb6741aaa61d76388ea26ec4aa7d1461a17` + `1c8acbcbfa175687dba81d144485ea08a0ee3f89`

Repair removed the wide-workspace split/max-width corridor without lowering the >=940px behavior contract and preserved mobile ordering.

---

## PUI-BC-058 — Narrow desktop Aquarium pushed tank context below management

- **Feature:** Aquarium home hierarchy
- **Severity:** high
- **Status:** `regression_verified`
- **Fixed by:** `dbaab622371494a89effafe1e982598c46b2d1f7`

Desktop >=768px preserves `Today → Context → Manage → Secondary` when the Aquarium container is narrow, while phone remains task-first. Parent visual evaluators encode the same approved behavior.

## Carry-forward discipline

- A release-candidate can be code-clean while still not production-ready.
- Preserve fail-before evidence; do not lower thresholds merely to turn CI green.
- When architecture moves, migrate evaluator ownership rather than deleting semantic assertions.
- Browser evidence outranks source-file assumptions for user-visible behavior.
- Treat schema-valid, safe and useful as separate AI quality dimensions.
- AI cannot override deterministic hard-safety rules.
- A fixture proves behavior under that fixture, not live-provider quality.
- Separate product/browser badcases from release/evaluator badcases.
- Production badcases must be tracked separately from repository/synthetic acceptance.
