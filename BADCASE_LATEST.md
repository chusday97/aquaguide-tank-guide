# AquaGuide — Latest Badcases

**Updated:** 2026-08-22  
**Branch:** `agent/result-ux-v1`  
**Purpose:** current handoff-level badcase ledger. Canonical historical product registry remains under `evaluation/product/`.

## PUI-BC-059 — Tank Copilot accepted schema-valid but non-actionable AI parsing

- **Feature:** Tank Copilot / AI result usefulness
- **Severity:** high
- **Source:** permanent usefulness CI fail-before
- **Status:** regression_verified for encoded failure modes
- **Fail-before head:** `ab5243404a3c770ce5a8ed8905008a973de37dfa`
- **Fail-before Result UX:** `32573810707` — FAIL at `Tank Copilot usefulness contract`
- **Policy fix:** `ef843ef384d09cb79d8ac7df62372e21db0241e8`
- **Prompt + cleanup fix:** `4814e8a0b565f18d9bde7623fd4ebda68049f988`
- **First normal full regression:** `e4068dc805422ed4bf797d5223ad0bdd44c2835f`, Result UX `32573927306` — PASS
- **RC1-reconciled regression:** `b2b6830f1864f9600fd32a4f87bf6151970545a1`, Result UX `32574415605` — PASS

### Symptom

The old path treated `valid JSON + no deterministic safety violation` as sufficient. A model could return:

- a plausible goal summary;
- `selectedCandidateIds: []` although local rules already exposed safe candidates;
- `restart_goal` as the primary action;
- generic plan prose such as “先看看候选，再决定下一步”.

That result was safe but not useful. A second failure mode allowed subjective preference questions to survive even when deterministic tank facts such as size/volume or target temperature were missing.

### Root causes

1. **Schema validity was confused with product validity.**
2. **Safety coverage did not require semantic usefulness.**
3. **Model emptiness could erase deterministic local opportunity.**
4. **Question priority was model-led instead of fact-led.**
5. **Prompt allowed workflow filler instead of concrete candidate/quantity planning.**

### Repair rule

Product policy now guarantees:

- blocking deterministic tank facts first;
- `complete_tank_info` when those facts are missing;
- recovery to local safe/adjustable candidates when a model returns an empty selection despite a usable pool;
- executable candidate-view/simulation actions instead of unnecessary `restart_goal` when candidates exist;
- all recovery remains inside the deterministic candidate pool.

Prompt now requires:

- only user-stated preferences may be interpreted;
- at least one local candidate when the tank is ready and candidates exist;
- candidate names + `recommendedQuantity` in the plan;
- no generic workflow filler as the entire result;
- required adjustments remain explicit for caution/adjustable candidates.

Permanent Result UX now runs `scripts/test-tank-copilot-usability.ts`.

### Remaining boundary

This badcase is closed only for the encoded repository-level failure modes. It does **not** prove every live provider answer is high quality. Live evaluation is still required to measure generic-answer, contradiction, candidate-drop, invalid-JSON, timeout and fallback rates.

---

## EVAL-BC-001 — Parent visual evaluator contradicted approved narrow-desktop hierarchy

- **Area:** UI evaluation / stacked-PR migration
- **Severity:** medium
- **Source:** post-#104-merge / #105-retarget CI
- **Status:** regression_verified
- **Fail-before head:** `ff558c03c5af758b21bcf2098be074189ea7741b`
- **Visual QA fail:** `32574163661`
- **Golden V3 fail:** `32574163627`
- **Migration fix:** `b2b6830f1864f9600fd32a4f87bf6151970545a1`
- **Final Visual QA:** `32574415581` — PASS
- **Final Golden V3:** `32574415709` — PASS
- **Final UI System:** `32574415630` — PASS

### Symptom

After #104 merged and #105 was retargeted/reconciled, the parent visual suite asserted:

`compact-desktop-768: recurrent Manage actions must appear before contextual 3D tank`

Golden V3 simultaneously reported:

- `aquarium-compact-768`: 4.3958% changed vs 0.5% threshold;
- other 7/8 golden cases: 0% changed.

### Root cause

The parent #104 visual contract predated PUI-BC-058. It still encoded 768px `Today → Manage → Context`, while the later approved desktop behavior intentionally used `Today → Context → Manage` whenever the desktop shell is active but the Aquarium container remains narrow. Phone remains task-first.

### Repair rule

- change only the 768px desktop hierarchy expectation;
- preserve 390px phone ordering;
- migrate only the `aquarium-compact-768` reference;
- record badcase/run/artifact provenance in the visual manifest;
- do not change the Golden threshold;
- leave every other golden reference untouched.

### Verification

The migration kept the threshold at **0.5%** and produced PASS on Visual QA, Golden V3 and UI System at final reconciled head `b2b6830...`.

This is an evaluator migration following an already approved product behavior, not a product regression and not a tolerance relaxation.

---

## REL-BC-001 — Production dependency graph contained untriaged high-severity findings

- **Area:** release baseline / dependency security
- **Severity:** high
- **Status:** regression_verified
- **Landed by:** `5c277cec1f99f5bb507b7d50b2018d5d571ef0f1`
- **Final reconciled dependency gate:** `32574415664` — PASS

Original production/full audit both reported 18 findings (10 high / 6 moderate / 2 low). Build-only tooling was misclassified as runtime dependencies, direct runtime packages were stale, and the lockfile retained a vulnerable DOMPurify resolution.

Current state:

- production audit: 0 findings;
- full developer/build graph: 12 dev-only findings = 7 high / 2 moderate / 3 low.

---

## PUI-BC-057 — Wide Care guide stayed narrow inside a wide workspace

- **Feature:** Care / Result UX
- **Severity:** high
- **Status:** regression_verified
- **Fixed by:** `4ecd3cb6741aaa61d76388ea26ec4aa7d1461a17` + `1c8acbcbfa175687dba81d144485ea08a0ee3f89`
- **Original regression:** Result UX `32568805769` — PASS
- **Current reconciled Result UX:** `32574415605` — PASS

At 1440px, actionable Care content was first ~340px and then ~818px because two independent legacy constraints remained: the split hero grid and `max-w-[850px]`. Repair made decision content span the wide workspace without lowering the >=940px contract and preserved mobile ordering.

---

## PUI-BC-058 — Narrow desktop Aquarium pushed tank context below management

- **Feature:** Aquarium home hierarchy
- **Severity:** high
- **Status:** regression_verified
- **Fixed by:** `dbaab622371494a89effafe1e982598c46b2d1f7`
- **Original Result UX proof:** `32568805769` — PASS
- **Parent visual evaluator migration:** `b2b6830f1864f9600fd32a4f87bf6151970545a1`
- **Current Visual QA / Golden proof:** `32574415581` / `32574415709` — PASS

At a 768px desktop fixture, the <=719px Aquarium container rule applied phone-style `Today → Manage → Context` ordering inside the desktop shell. The product fix established `Today → Context → Manage → Secondary` for narrow desktop while keeping phone ordering unchanged. Parent visual baselines now encode the same contract.

## Carry-forward discipline

- Keep fail-before evidence; never lower a regression threshold merely to turn CI green.
- Treat **schema-valid**, **safe**, and **useful** as separate AI quality dimensions.
- AI cannot override deterministic hard-safety rules, but safety alone is not a sufficient acceptance criterion.
- Required facts must outrank subjective preference questions.
- Do not let model omissions erase deterministic safe candidates.
- A mock/browser fixture proves product behavior under that fixture, not live-provider quality.
- When a visual baseline legitimately changes, migrate only the proven surface and record provenance; do not broadly regenerate goldens.
- Separate product/browser badcases from release/evaluator badcases and preserve the append-only canonical product registry.
