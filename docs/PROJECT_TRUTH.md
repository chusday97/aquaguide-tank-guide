# AquaGuide Project Truth

**Status:** Active  
**Updated:** 2026-08-25  
**Purpose:** the one reading map for the current product. This file routes facts; it does not duplicate their full definitions.

## Current delivery line

| Concern | Current authority | Rule |
| --- | --- | --- |
| Daily work branch | `codex/unified-rc-visual-v1` | All new work begins here. |
| GitHub convergence | Draft PR #141 | The only active convergence PR. |
| Approved visual baseline | `37a8d4d1` and `http://127.0.0.1:4317/_preview/interactive` | No RC page/CSS may replace this visual baseline wholesale. |
| Current state | `.ai/PROJECT_STATE.json` | Local branch, remote SHA, PR and preview must agree. |
| Historical PRs | `.ai/OPEN_PR_REGISTRY.md` | Historical inputs only; never direct merge sources. |
| Git/PR delivery rules | [Git Delivery Protocol](./03-development/GIT_DELIVERY_PROTOCOL.md) | Informal branch selection or an old PR base |
| Historical documents | [Historical Evidence Registry](./HISTORICAL_EVIDENCE.md) | Evidence only; never a current decision source. |

## Canonical facts

| Question | Canonical home | Historical material that must not override it |
| --- | --- | --- |
| What the product currently promises | [Product Truth](./01-definition/PRODUCT_TRUTH.md) | Historical PRDs, audits and old product-status snapshots |
| What each feature's current status is | [Feature Catalog](./01-definition/FEATURE_CATALOG.md) | PR titles, commits, deployment history and old status tables |
| What the accepted UI looks and behaves like | [Visual Baseline](./02-design/VISUAL_BASELINE.md) and [`UI_REGRESSION_CONTRACT.md`](../UI_REGRESSION_CONTRACT.md) | Old screenshots, prototype HTML, RC page CSS and stale browser tests |
| What the data/API boundary is | [`CONTRACT.md`](../CONTRACT.md), `packages/contracts/`, `src/types/database.ts` | Planning-only database proposals |
| What has been deployed and what has been re-verified | [Deployment State](./03-development/DEPLOYMENT_STATE.md) | A successful build or an old deployment URL alone |
| How the visual baseline is accepted | [Visual Acceptance Matrix](./05-validation/VISUAL_ACCEPTANCE_MATRIX.md) | A single route, screenshot or build alone |
| What is being done now | `.ai/PROJECT_STATE.json` and `.ai/TASK_QUEUE.md` | `PROGRESS.md` entries |
| What happened before | `PROGRESS.md`, `40-DOCS/CHANGELOG.md`, `HANDOFF.md` | None; they are evidence, not the current decision source |
| How to accept a behavior | `docs/05-validation/`, `scripts/`, and `UI_REGRESSION_CONTRACT.md` | A passing lint/build alone |

## Reading order

1. `.ai/PROJECT_STATE.json`
2. This file
3. Product Truth, Visual Baseline, and Deployment State relevant to the task
4. `CONTRACT.md` only when the task affects data, API, Supabase or persistence
5. `HANDOFF_LATEST.md`, recent commits, and the current diff

## Non-negotiable rules

- A historical branch, PR or document can provide evidence, but cannot become product truth by recency alone.
- A UI change must preserve the Visual Baseline unless the user accepts a replacement baseline.
- A data/API change must update the data contract before implementation.
- Deployment, local preview, browser regression and human acceptance are different evidence levels.
- Do not delete historical files as part of context cleanup. Mark and route them first.

## Fast verification

```bash
npm run project:status
git status --short
gh pr view 141 --json headRefOid,state,isDraft
```

Expected: the local branch, remote branch and Draft PR #141 identify the same SHA; an empty `git status` means no unrecorded local state.
