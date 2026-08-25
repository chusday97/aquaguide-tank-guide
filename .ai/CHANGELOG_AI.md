# AI Changelog

## 2026-08-25

### Added

- 初始化 `.ai/` 上下文目录及四个标准文件。
- 补齐 `PRODUCT_CONTEXT.md`、`ARCHITECTURE.md`、`DECISION_LOG.md` 与 `BADCASES.md`。
- 新增项目根目录 `AI_PROJECT_PROTOCOL.md`，明确编码前读取与变更后更新要求。

### Notes

- 本次仅新增项目上下文文档，没有修改产品代码、业务数据或远端状态。
- 本轮只做上下文协议落地，未执行 `git push`，未触发 Vercel 部署。
- 协议与路由文档本地提交：`de906c2`。
## 2026-08-25 — Unified progress baseline

- Added `.ai/PROJECT_STATE.json` to name the one canonical branch, visual baseline, RC business reference, local preview, and deprecated integration PR.
- Changed the active goal from partial visual convergence to local/GitHub progress unification.
- Added a grouped RC migration ledger; API/persistence changes are explicitly held for contract review.
- Closed deprecated PR #140 and created Draft PR #141 as the sole RC convergence entry.
- Added the P0 data/contract impact review; no P0 runtime code was migrated.
- Added an executable project-status contract and RC convergence CI workflow.
- Changed the official daily local worktree to the canonical branch; legacy `codex/rc1-visual-integration` is no longer a valid starting point.
- Verified the RC Convergence CI in GitHub Actions run `32846848569`; the gate now runs on pushes to the canonical branch.
- Added `.ai/OPEN_PR_REGISTRY.md` to classify all 56 open PRs and prevent old stacked branches from being treated as parallel delivery paths.
- Started the eight-phase project truth consolidation: added canonical project, product, visual and deployment routing without changing UI, data or deployed environments.
- Added a historical-evidence registry and explicit supersession markers for the most misleading old Handoff, audit and cloud-planning documents.
- Added a visual acceptance matrix so the approved 4317 direction is tied to route-level browser and human evidence instead of informal references.
- Added the canonical Feature Catalog with one status vocabulary for current, deployed-but-unreverified, partial, proposed RC and archived capability.
