# AquaGuide — Latest Badcases

**Updated:** 2026-08-22  
**Branch:** `agent/result-ux-v1`  
**Purpose:** current handoff-level badcase ledger. Canonical historical product registry remains under `evaluation/product/`.

## PUI-BC-059 — Tank Copilot accepted schema-valid but non-actionable AI parsing

- **Feature:** Tank Copilot / AI result usefulness
- **Severity:** high
- **Source:** permanent usefulness CI fail-before
- **Status:** regression_verified for tested failure modes
- **Fail-before head:** `ab5243404a3c770ce5a8ed8905008a973de37dfa`
- **Fail-before Result UX:** run `32573810707` — FAIL at `Tank Copilot usefulness contract`
- **Policy fix:** `ef843ef384d09cb79d8ac7df62372e21db0241e8`
- **Prompt + cleanup fix:** `4814e8a0b565f18d9bde7623fd4ebda68049f988`
- **Full regression head:** `e4068dc805422ed4bf797d5223ad0bdd44c2835f`
- **Result UX regression:** run `32573927306` — PASS

### Symptom

The old path treated “valid JSON + no deterministic safety violation” as sufficient. A model could return:

- an acceptable-sounding goal summary;
- `selectedCandidateIds: []` even though local rules had safe candidates;
- `restart_goal` as the primary action;
- generic plan prose such as “先看看候选，再决定下一步”.

That result was safe but not useful. The existing Result UX browser test still passed because it validated AI/local-rule authority, disclosure and action count rather than semantic usefulness.

A second failure mode allowed subjective preference questions to survive even when deterministic tank facts such as size/volume or target temperature were still missing.

### Root causes

1. **Schema validity was confused with product validity.** Normalization checked type/shape but not whether the response advanced the user.
2. **Safety tests dominated the AI contract.** They correctly prevented the model from overriding local rules but did not require useful selection or clarification.
3. **Model emptiness could erase local opportunity.** Empty model selection was accepted instead of falling back to the already-approved candidate pool.
4. **Question priority was model-led.** Required tank facts were not guaranteed to outrank preference chatter.
5. **Prompt allowed workflow filler.** It did not require candidate names/quantities or a concrete fit explanation when a usable candidate pool existed.

### Repair

Product policy now enforces:

- missing deterministic tank facts first;
- `complete_tank_info` when those facts are missing;
- recovery to local safe/adjustable candidates when the model returns an empty selection despite a usable pool;
- `view_safe_candidates` / executable simulation instead of unnecessary `restart_goal` when candidates exist;
- all recovery remains inside the deterministic candidate pool.

Prompt now requires:

- only user-stated preferences to be interpreted;
- at least one local candidate when the tank is ready and candidates exist;
- candidate names + `recommendedQuantity` in concrete plan output;
- no generic “view / simulate / decide later” filler as the entire plan;
- required adjustments to remain explicit for caution/adjustable candidates.

Permanent Result UX now runs `scripts/test-tank-copilot-usability.ts`.

### Verification

True fail-before run `32573810707` failed exactly because the old sanitizer did not recover deterministic candidates.

On final normal verification head `e4068dc...`:

- Production Security Boundary V1 — PASS (`32573927291`)
- Dependency Release Baseline V1 — PASS (`32573927275`)
- Compatibility Stage Risk V1 — PASS (`32573927293`)
- Plant Roster Edit Fix — PASS (`32573927318`)
- Result UX V1 — PASS (`32573927306`), including:
  - Tank Copilot deterministic boundary contract
  - Tank Copilot usefulness contract
  - TypeScript/build
  - Diagnosis/Compatibility/Knowledge/Procedure/Species Detail/Layout Recovery/Identification browser paths
  - Tank Copilot decision-first + AI-authority browser regression

### Remaining boundary

This badcase is closed only for the encoded repository-level failure modes. It does **not** prove that every live provider response is high quality. A live evaluation set with configured provider access is still required before production to measure generic-answer, contradiction, invalid-JSON, fallback and actionability rates.

---

## REL-BC-001 — Production dependency graph contained untriaged high-severity findings

- **Area:** release baseline / dependency security
- **Severity:** high
- **Status:** regression_verified
- **Landed by:** `5c277cec1f99f5bb507b7d50b2018d5d571ef0f1`
- **Permanent dependency regression:** PASS on current verified head

Original production/full audit both reported 18 findings (10 high / 6 moderate / 2 low). Build-only tooling was misclassified as runtime dependencies, direct runtime packages were stale, and the lockfile retained a vulnerable DOMPurify resolution. The repair reclassified build tools, minimally upgraded runtime dependencies, advanced the lockfile, and added a permanent read-only production dependency gate.

Current state: production audit 0; full audit 12 dev-only findings (7 high / 2 moderate / 3 low).

---

## PUI-BC-057 — Wide Care guide stayed narrow inside a wide workspace

- **Feature:** Care / Result UX
- **Severity:** high
- **Status:** regression_verified
- **Fixed by:** `4ecd3cb6741aaa61d76388ea26ec4aa7d1461a17` + `1c8acbcbfa175687dba81d144485ea08a0ee3f89`
- **Regression:** Result UX V1 run `32568805769` — PASS

At 1440px, actionable Care content was first ~340px and then ~818px because two independent legacy constraints remained: the split hero grid and `max-w-[850px]`. The repair made decision content span the wide workspace without lowering the >=940px contract and preserved mobile ordering.

## PUI-BC-058 — Narrow desktop Aquarium pushed tank context below management

- **Feature:** Aquarium home hierarchy
- **Severity:** high
- **Status:** regression_verified
- **Fixed by:** `dbaab622371494a89effafe1e982598c46b2d1f7`
- **Regression:** Result UX V1 run `32568805769` — PASS

At a 768px desktop fixture, the <=719px aquarium container rule applied phone-style `Today → Manage → Context` ordering inside the desktop shell. The fix applies `Today → Context → Manage → Secondary` only for narrow desktop while leaving phone behavior unchanged.

## Carry-forward discipline

- Keep fail-before evidence; never lower a regression threshold merely to turn CI green.
- Treat **schema-valid**, **safe**, and **useful** as separate AI quality dimensions.
- AI cannot override deterministic hard-safety rules, but safety alone is not a sufficient acceptance criterion.
- Required facts must outrank subjective preference questions.
- Do not let model omissions erase deterministic safe candidates.
- A mock/browser fixture proves product behavior under that fixture, not live-provider quality.
- Separate product/browser badcases from release/tooling badcases and preserve the append-only canonical product registry.
