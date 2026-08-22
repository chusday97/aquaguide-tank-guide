# AquaGuide — Latest Handoff

**Updated:** 2026-08-22  
**Repository:** `chusday97/aquaguide-tank-guide`  
**Active branch:** `agent/result-ux-v1`  
**PR:** #105 `Introduce decision-first Result UX V1` (Draft / open / mergeable / unmerged)  
**Current base:** `integration/aquaguide-rc1`  
**Release rule:** do not merge #105 to RC1 / `main` or deploy production without explicit authorization.

## 1. Current fully verified baseline

Latest fully verified product-code head: `b2b6830f1864f9600fd32a4f87bf6151970545a1`.

Post-parent-merge / reconciled gate matrix:

- Production Security Boundary V1 — **PASS**, run `32574415632`
- Dependency Release Baseline V1 — **PASS**, run `32574415664`
- Result UX V1 — **PASS**, run `32574415605`
- Compatibility Stage Risk V1 — **PASS**, run `32574415639`
- Plant Roster Edit Fix — **PASS**, run `32574415644`
- Navigation Context V1 — **PASS**, run `32574415647`
- Bundle Audit V1 — **PASS**, run `32574415704`
- UI UX Golden V3 — **PASS**, run `32574415709`
- UI UX Visual QA V2 — **PASS**, run `32574415581`
- UI UX System Refactor V1 — **PASS**, run `32574415630`

Result UX includes the permanent Tank Copilot usefulness contract plus the full browser sequence through Diagnosis, Compatibility, Knowledge, Procedure, Species Detail, Layout Recovery, Identification and Tank Copilot.

## 2. PUI-BC-059 — AI parsing could be schema-valid but unusable

The reported issue was real. The old acceptance boundary treated a structured response as usable when it was syntactically valid and did not violate deterministic safety, even if it failed to advance the user.

### Fail-before evidence

On head `ab5243404a3c770ce5a8ed8905008a973de37dfa`, Result UX run `32573810707` failed at the newly added `Tank Copilot usefulness contract` while the older Result UX contract and deterministic Copilot boundary had already passed.

The fail-before fixture deliberately returned:

- a fully configured 63L freshwater tank;
- deterministic local safe candidates already available;
- model `selectedCandidateIds: []`;
- primary action `restart_goal`;
- generic plan copy equivalent to “先看看候选，再决定下一步”.

That proved the previous system guarded **shape + safety**, but not **semantic usefulness**.

### Product-policy repair

Policy commit: `ef843ef384d09cb79d8ac7df62372e21db0241e8`.

The product now enforces:

- required tank facts (size/volume, water type, temperature, filter) outrank preference chatter;
- missing required facts force `complete_tank_info` as the primary action;
- if the tank is sufficiently configured and deterministic safe/adjustable candidates exist, a model response that drops every candidate is recovered to the local candidate pool;
- if usable candidates exist, unnecessary `restart_goal` cannot remain the primary action;
- all recovered candidate IDs remain inside the deterministic safe/adjustable pool, so AI receives no new safety authority.

### Prompt repair

Prompt + self-cleanup commit: `4814e8a0b565f18d9bde7623fd4ebda68049f988`.

The Tank Copilot prompt now explicitly requires:

- interpret only user-stated maintenance, experience, visual-style and target-organism preferences;
- never invent an unstated preference;
- prioritize blocking tank facts before subjective questions;
- when the tank is ready and a local candidate pool exists, return at least one candidate rather than an empty selection / `restart_goal`;
- make `planSummary` concrete with candidate names and `recommendedQuantity` instead of workflow filler;
- make `requiredAdjustments` explicit for adjustable/caution candidates.

The temporary write workflow/helper self-deleted after applying and validating the prompt migration. No permanent `contents: write` workflow remains.

### Permanent regression

`scripts/test-tank-copilot-usability.ts` is now part of Result UX CI. It covers:

1. empty model selection despite a deterministic safe pool;
2. preference-only questions while blocking tank facts are missing;
3. deterministic candidate-pool containment;
4. prompt requirements for candidate selection and concrete plans.

Normal full-verification head `e4068dc805422ed4bf797d5223ad0bdd44c2835f` first closed the AI repair, and the later RC1-reconciled head `b2b6830...` again passed Result UX (`32574415605`).

### Important remaining boundary

This fixes known product-level failure modes; it does **not** prove every live DeepSeek/provider answer is good. Repository CI currently validates fixtures/contracts, not a representative live-provider cohort. Before production, live AI still needs an explicit usefulness evaluation set.

## 3. #104 / #105 stack convergence is now structurally reconciled

PR #104 has been merged into `integration/aquaguide-rc1`:

- #104 merge commit: `2f07075e447778ea37229ca07ef485d8c0686d9c`
- #104 merged at: `2026-08-22T12:50:34Z`

PR #105 was retargeted to `integration/aquaguide-rc1` and then reconciled with an ancestry-preserving two-parent commit:

- reconciliation commit: `ff558c03c5af758b21bcf2098be074189ea7741b`
- parent 1: previous #105 head
- parent 2: #104 merge commit `2f07075e...`

After reconciliation:

- merge base = `2f07075e447778ea37229ca07ef485d8c0686d9c`
- #105 is ahead of RC1 and **behind 0**
- PR remains mergeable

This resolves the previous one-commit ancestry divergence. It does **not** authorize merging #105.

## 4. EVAL-BC-001 — parent visual contract contradicted approved PUI-BC-058

Retargeting #105 onto the merged RC1 parent activated #104 visual gates and exposed stale evaluator expectations.

### Fail-before

On reconciled head `ff558c03c5af758b21bcf2098be074189ea7741b`:

- UI UX Visual QA V2 run `32574163661` — **FAIL**
  - exact assertion: `compact-desktop-768: recurrent Manage actions must appear before contextual 3D tank`
- UI UX Golden V3 run `32574163627` — **FAIL**
  - only `aquarium-compact-768` changed: **4.3958%** vs existing 0.5% threshold
  - the other 7/8 golden cases were **0% changed**

The old parent contract required 768px `Today → Manage → Context`. PUI-BC-058 had already intentionally established desktop >=768px narrow-workspace `Today → Context → Manage`, while phone remains task-first.

### Evidence-based evaluator migration

Commit `b2b6830f1864f9600fd32a4f87bf6151970545a1`:

- changes only the 768px hierarchy expectation in `verify-uiux-aquarium-visual-hierarchy.mjs`;
- leaves 390px phone behavior task-first;
- migrates only the `aquarium-compact-768` golden signature;
- records PUI-BC-058, behavior proof run `32568805769`, visual capture run `32574163627`, artifact `9476119033`, and captured head in the manifest;
- **does not lower the 0.5% Golden threshold**;
- leaves the other 7 golden references untouched.

Final proof on `b2b6830...`:

- UI UX Golden V3 `32574415709` — **PASS**
- UI UX Visual QA V2 `32574415581` — **PASS**
- UI UX System Refactor V1 `32574415630` — **PASS**

This is an evaluator migration following a previously approved product behavior, not a new UI feature or threshold relaxation.

## 5. Dependency/security baseline remains closed

Production dependency audit remains **0 findings**. The full developer/build graph still has 12 dev-only findings (7 high / 2 moderate / 3 low), tracked separately as tooling debt.

The permanent Dependency Release Baseline gate remains read-only and blocks production high/critical findings.

## 6. Product baseline carried forward

- deterministic compatibility and life-stage risk remain authoritative;
- AI cannot override hard safety decisions;
- plant roster editing remains covered;
- share-report security/readiness contracts remain covered;
- Care wide-desktop 340/850px corridor regression remains closed;
- narrow-desktop Aquarium context hierarchy remains closed and now agrees across Result UX + parent visual gates;
- identification uncertainty / explicit confirmation remains covered;
- navigation-context and responsive UI-system gates are green on the reconciled stack.

## 7. Backend/runtime boundary

Phase 1 authoritative path remains:

`frontend → api client → apps/api/src → Vercel Functions → Supabase / AI / Resend`

Known legacy bridges still exist:

- `api/ai/chat.js -> server/index.mjs`
- `api/v1/health.js -> server/index.mjs`

The AI usefulness prompt repair touched `server/index.mjs` because the live `/api/ai/chat` bridge still consumes it. Do not delete or broadly rewrite the legacy server before Phase 2 consumer inventory.

## 8. Next execution order

1. **Live AI evaluation** — create a small representative real-provider cohort covering broad/specific goals, missing tank facts, safe/adjustable/no-candidate states, contradiction, invalid JSON, timeout/fallback and generic-answer rate. Define a usefulness pass rubric before production.
2. **#105 review / release decision** — stack ancestry and gates are reconciled, but #105 stays Draft/open/unmerged until explicit merge authorization.
3. **Production readiness** — only after explicit deployment authorization: verify production env/secrets, Supabase/auth/persistence, real AI provider/fallback, Resend/share reports, then run post-deploy golden paths.
4. **Legacy server Phase 2** — inventory consumers and migrate one bridge at a time with regression proof.
5. **Knowledge Engine** — provenance/version schema → trusted ingestion/freshness → evaluation baseline → hybrid retrieval → grounded result/citations → knowledge ops.

The immediate AI objective is no longer “让模型输出 JSON”; it is **measure whether real outputs correctly identify blocking facts or advance the user to a valid local action without inventing facts or weakening deterministic safety**.
