# AquaGuide Cross-Session Start

Updated: 2026-09-05
Canonical repo: `chusday97/aquaguide-tank-guide`
Local worktree: `/Users/chuchu/aquaguide-admin-content-v0`
Working branch: `feature/admin-content-v0`

## One-file recovery rule
A new conversation should read this file first, then read the canonical set below before planning or changing code. Do not infer current state from chat memory.

## Canonical read order
1. `.ai/HANDOFF_LATEST.md`
2. `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`
3. `.ai/CURRENT_GOAL.md`
4. `.ai/TASK_QUEUE.md`
5. `.ai/LIVE_STATUS.md`
6. `.ai/BRANCH_STATUS.md`
7. tail of `.ai/EXECUTION_LOG.md`

## Current product model
Treat the Admin as **Aqua Operations Studio**, not one SEO CMS. Keep Product Data, Care Knowledge, Compatibility Rules, SEO Editorial and user-specific context as separate authorities.

## Current first incomplete milestone
All defined P0/P1/P2 Operations Studio work is closed, including Care SEO `hold_noindex` release decision and AI-assisted Published-Care analysis/Draft suggestions. The final accepted Care SEO Preview is snapshot commit `fd960667` on Vercel `dpl_Fx1NEVe7safjqmte2QPY6zvPQB5D`; 2/2 bilingual pages passed hosted verification and remain `noindex`. Acceptance + `hold_noindex` are rebound in `5899d643` and release readiness is intentionally false only because the human decision is to hold.

The first unfinished milestone is now the **dedicated feature ↔ live-main reconciliation audit** already required by `BRANCH_STATUS.md`. This means inspect/reconcile in isolation first; it does **not** authorize merging `main`, Production deployment, index unlock, or live migrations.

Continue from `TASK_QUEUE.md`; do not reopen completed Product/Care, Compatibility, Publish Center, Species SEO, Care SEO or AI-advisory work unless a new regression is proven.

## Stable subsystem not to reimplement
Species SEO already has CSV template/preflight/Diff, durable import batch, duplicate review, batch-scoped review, bilingual Staging readiness, Canonical dependency validation and fail-closed publication. Production remains locked.

## Safety
- Do not merge/rebase `main` during ordinary work.
- Re-read live remote refs before branch decisions; do not trust stale `origin/main` blindly.
- Do not make SEO copy authority for pH, temperature, tank size, care actions or compatibility rules.
- Do not bypass authenticated human review or publish Production without explicit authorization.

## Exact prompt for a new conversation
`继续 Aqua 项目。不要根据聊天记忆猜测。先读取 /Users/chuchu/aquaguide-admin-content-v0/.ai/CROSS_SESSION_START.md，再按其中顺序读取 HANDOFF_LATEST / AQUA_OPERATIONS_STUDIO_ARCHITECTURE / CURRENT_GOAL / TASK_QUEUE / LIVE_STATUS / BRANCH_STATUS / EXECUTION_LOG 最新记录。真实核对当前 branch、git status、HEAD 和 live remote refs，然后继续 TASK_QUEUE 中第一个未完成项（当前为 dedicated feature ↔ live-main reconciliation audit，只做隔离审计/候选验证，不直接 merge main）。不要重新实现已完成的 Product/Care、Compatibility、Publish Center、Species SEO、Care SEO projection/editorial/handoff/hosted acceptance/release gate 或 AI advisory；Care SEO 的明确决策是 hold_noindex，继续锁定 Production/index；不要应用 live migration；每完成一轮同步 .ai 文档。`

## Update rule after every material round
After meaningful code/product changes, update at minimum: `HANDOFF_LATEST.md`, `CURRENT_GOAL.md`, `TASK_QUEUE.md`, `LIVE_STATUS.md`, `BRANCH_STATUS.md` when branch facts changed, and append `EXECUTION_LOG.md`. Keep this file short and only change it when the recovery protocol itself changes.
