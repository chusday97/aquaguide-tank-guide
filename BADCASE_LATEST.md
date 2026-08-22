# AquaGuide — Latest Badcases

**Updated:** 2026-08-22  
**Sync branch:** `agent/rc1-post-110-release-sync`  
**Purpose:** current handoff-level badcase ledger. Canonical historical product registry remains under `evaluation/product/`.

## PUI-BC-060 — Saved substrate was not visibly applied to the 3D aquarium

- **Feature:** Aquarium / Tank Settings / 3D visualization
- **Severity:** high
- **Status:** `regression_verified`
- **Repair PR:** #110 `Render substrate as a tank-bottom surface`
- **#110 merge commit:** `5e605fb7a68001ecd80096ef42f063909cf5aa03`
- **Candidate browser proof:** `32579071402` — PASS
- **Permanent PR-head Substrate Surface gate:** `32579395579` — PASS
- **Post-merge RC1 release matrix:** 9/9 PASS

### Fail-before / root cause

1. `ThreeAquarium` silently rendered River Sand for freshwater or Coral Sand for saltwater when `aquarium.substrate` was empty, so a later real selection could look visually unchanged.
2. Substrate was partly represented as hundreds of individual pebble/grain meshes, conflicting with the product meaning of substrate as a continuous tank-floor layer.
3. There was no stable runtime marker proving that the persisted substrate value was the value consumed by the 3D renderer.

### Repair rule

- bare bottom must remain explicit (`none`), with no invented substrate;
- renderer must consume `aquarium.substrate` directly;
- configured substrate must fill the tank bottom as a continuous bed/surface layer;
- hardscape remains object-based; substrate is not a discrete decoration object;
- settings persistence and 3D consumption must be covered by one browser path.

### Verification

Candidate diagnostic run `32579071402` passed source contract, repository settings contract, TypeScript, production build and Chromium browser regression.

Permanent PR-head gate `32579395579` also passed before merge.

After #110 merged, the actual RC1 head `5e605fb7a68001ecd80096ef42f063909cf5aa03` was checked again:

- source contract — PASS;
- aquarium settings repository contract — PASS;
- TypeScript — PASS;
- production build — PASS;
- isolated-port Chromium browser path — PASS: bare bottom `none` → open Tank Settings → choose `黑金沙` → save → persisted aquarium `substrate=黑金沙` → rendered 3D `data-substrate=黑金沙`.

The real RC1→main synthetic matrix on the merged head also finished 9/9 PASS:

- RC1 Release Acceptance `32579834369`
- Product Golden Path `32579834368`
- UI Interaction Repair V1 `32579834400`
- UI UX System Refactor V1 `32579834362`
- UI UX Visual QA V2 `32579834402`
- UI UX Golden V3 `32579834371`
- UI V2 Aquarium `32579834499`
- Navigation Context V1 `32579834412`
- Bundle Audit V1 `32579834439`

### Test-environment note

An initial merged-head browser retry on local port 4173 timed out waiting for `[data-substrate]`. Diagnostic inspection proved that port 4173 was actually serving an unrelated IceGlide preview (`ICEGLIDE / 花样滑冰赛程订阅助手`) and contained no AquaGuide controls or 3D canvas. Re-running AquaGuide on isolated port 4189 passed. This false negative is classified as local test-environment contamination, not an AquaGuide product regression.

---

## REL-BC-002 — Legacy Vercel bridge bundles were production-sized

- **Area:** production readiness / Vercel function packaging
- **Severity:** high
- **Status:** `regression_verified` for repository/preview packaging baseline
- **Repair PR:** #109 `Trim legacy Vercel function bundles before production`
- **#109 merge commit:** `1e455a82a6542b7a8fb684c69da06221ef6bdba0`

### Fail-before

Real RC1 Preview after #107 showed:

- `/api/v1/health` — 229.06 MB
- `/api/ai/chat` — 229.06 MB
- canonical `/api/v1/[...path]` — 40.13 MB

### Repair / proof

#109 excluded `dist/**` from the two legacy bridge bundles without changing the canonical API route.

Verified preview after repair:

- `/api/v1/health` — 1.13 MB
- `/api/ai/chat` — 1.13 MB
- canonical `/api/v1/[...path]` — 40.13 MB

Post-#110 Bundle Audit remains PASS. A fresh #110-merged Vercel preview was not observed during this verification because the Hobby project had recently hit build-rate-limit; this does not replace later deployed-environment verification.

---

## EVAL-BC-002 — Post-#105 RC1 evaluator drift after real merge

- **Area:** release evaluation / stacked architecture migration
- **Severity:** high
- **Status:** `closed_for_rc_code_regression`
- **Fail-before RC1 head:** `e5a9dd1ccc18a296075521fdd01b0407341af617`
- **Repair PR:** #107 `Repair post-#105 RC1 evaluator drift`
- **#107 merge commit:** `8d506fae4b165fdd4aed5f7a04101dc16d5d7d7f`

### Fail-before

- RC1 Release Acceptance `32575093543` — FAIL
- UI Interaction Repair V1 `32575093548` — FAIL
- Product Golden Path `32575093550` — FAIL

### Root causes

The failures were evaluator drift after legitimate architecture/interaction migrations:

1. canonical API ownership moved to the current `app.use('/api/v1', ...)` mount;
2. Species Detail wide/full-screen implementation moved behind wrapper/Base separation;
3. Atlas route/navigation/selection behavior moved into `EncyclopediaBase.tsx`;
4. Compatibility Result UX moved from obsolete verdict DOM markers to `DecisionResultSurface`;
5. GP-002 intentionally became a two-stage evidence → calculator intent.

### Closure

- targeted repair diagnostic `32575689962` — PASS;
- #107 merged to RC1;
- final RC1 release matrix passed after #107 and continued to pass after #109/#110.

---

## PUI-BC-059 — Tank Copilot accepted schema-valid but non-actionable AI parsing

- **Feature:** Tank Copilot / AI result usefulness
- **Severity:** high
- **Status:** `regression_verified` for encoded repository-level failure modes
- **Fail-before Result UX:** `32573810707` — FAIL
- **Policy fix:** `ef843ef384d09cb79d8ac7df62372e21db0241e8`
- **Prompt + cleanup fix:** `4814e8a0b565f18d9bde7623fd4ebda68049f988`

Repository fixtures cover the encoded safety/usefulness failures, but representative live-provider usefulness remains a production-readiness task.

---

## EVAL-BC-001 — Parent visual evaluator contradicted approved narrow-desktop hierarchy

- **Area:** UI evaluation / stacked-PR migration
- **Severity:** medium
- **Status:** `regression_verified`
- **Visual QA fail:** `32574163661`
- **Golden V3 fail:** `32574163627`
- **Migration fix:** `b2b6830f1864f9600fd32a4f87bf6151970545a1`

The evaluator was migrated to the approved desktop `Today → Context → Manage` hierarchy without lowering the 0.5% Golden threshold or changing phone task-first ordering.

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

Repair removed the wide-workspace split/max-width corridor without weakening the >=940px contract and preserved mobile ordering.

---

## PUI-BC-058 — Narrow desktop Aquarium pushed tank context below management

- **Feature:** Aquarium home hierarchy
- **Severity:** high
- **Status:** `regression_verified`
- **Fixed by:** `dbaab622371494a89effafe1e982598c46b2d1f7`

Desktop >=768px preserves `Today → Context → Manage → Secondary` when the Aquarium container is narrow, while phone remains task-first.

## Carry-forward discipline

- A release candidate can be code-clean while still not production-ready.
- Preserve fail-before evidence; do not lower thresholds merely to turn CI green.
- Browser evidence outranks source-file assumptions for user-visible behavior.
- Diagnose test-environment contamination before modifying product code.
- Treat schema-valid, safe and useful as separate AI quality dimensions.
- AI cannot override deterministic hard-safety rules.
- Separate product/browser badcases from release/evaluator/deployment badcases.
- Production environment proof remains separate from repository/preview acceptance.
