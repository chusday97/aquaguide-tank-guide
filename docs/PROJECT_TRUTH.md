# AquaGuide Project Truth

**Status:** Active
**Updated:** 2026-08-30
**Purpose:** the one reading map for the current product. This file routes facts; it does not duplicate their full definitions.

## Current delivery line

| Concern | Current authority | Rule |
| --- | --- | --- |
| Daily work branch | `main` (after source convergence) | `main` is the single code source; short-lived branches must start from its latest SHA. |
| Source-convergence result | `main` | PR #142 was merged; `codex/main-core-foundation-v1` is historical evidence only. New work starts from the latest `main` in a short-lived `codex/*` branch. |
| Production branch | `release/production` | Deployment-only pointer anchored to the current production SHA; no independent development or direct commits. |
| GitHub convergence | [PR #142](https://github.com/chusday97/aquaguide-tank-guide/pull/142) | Merge is a source-convergence action; release status remains `NOT_READY` until production gates pass. |
| Branch reconciliation | [Branch Convergence Audit](./03-development/BRANCH_CONVERGENCE_AUDIT.md) and [origin/main semantic reconciliation](./03-development/ORIGIN_MAIN_RECONCILIATION.md) | Commit counts alone; a graph difference is not a missing-feature verdict. |
| Approved visual baseline | `37a8d4d1` and `http://127.0.0.1:4317/_preview/interactive` | 4317 is a detached reference; candidate review runs on 4319. No RC page/CSS may replace this baseline wholesale. |
| Current state | `.ai/PROJECT_STATE.json` plus `npm run project:status` | The command reports code source, convergence branch and production pointer separately. |
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
| Proposed product/data decisions | `docs/decisions/` | An unapproved implementation branch or PR |
| What has been deployed and what has been re-verified | [Deployment State](./03-development/DEPLOYMENT_STATE.md) | A successful build or an old deployment URL alone |
| How the visual baseline is accepted | [Visual Acceptance Matrix](./05-validation/VISUAL_ACCEPTANCE_MATRIX.md) | A single route, screenshot or build alone |
| Whether release is actually allowed | [Unified Release Readiness](./05-validation/RELEASE_READINESS.md) | A green deployment or a historical release note |
| Cross-layer module facts | [Module Fact Inventory](./05-validation/MODULE_FACT_INVENTORY.md) | A PR title, branch recency or code presence alone |
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
gh pr view 142 --json headRefOid,baseRefName,headRefName,state,isDraft
gh pr view 141 --json headRefOid,baseRefName,headRefName,state,isDraft
```

After source convergence, local/remote `main` identify the current code source, while `release/production` remains pinned to the last accepted production SHA until release gates pass. A short-lived `codex/*` branch is valid only when it contains the latest `main` ancestor.
