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
All defined P0 work, P1, and P2 Publish Center V1 are closed in code. Publish Center now has multi-authority ReleaseEvent aggregation, detail/readiness, capability + permission boundaries, code-level Product/Care append-only audit history with migration-safe current-only fallback, and explicit-key cross-authority context with authority jump links. The first unfinished item is **Care SEO as a downstream projection of approved Care Knowledge**. Do not centralize writes, infer cross-authority dependency, split roles without a multi-operator requirement, apply live migrations, or unlock Production.

Continue from `TASK_QUEUE.md`; do not reopen completed Product/Care or SEO P0 work unless a new regression is proven.

## Stable subsystem not to reimplement
Species SEO already has CSV template/preflight/Diff, durable import batch, duplicate review, batch-scoped review, bilingual Staging readiness, Canonical dependency validation and fail-closed publication. Production remains locked.

## Safety
- Do not merge/rebase `main` during ordinary work.
- Re-read live remote refs before branch decisions; do not trust stale `origin/main` blindly.
- Do not make SEO copy authority for pH, temperature, tank size, care actions or compatibility rules.
- Do not bypass authenticated human review or publish Production without explicit authorization.

## Exact prompt for a new conversation
`继续 Aqua 项目。不要根据聊天记忆猜测。先读取 /Users/chuchu/aquaguide-admin-content-v0/.ai/CROSS_SESSION_START.md，再按其中顺序读取 HANDOFF_LATEST / AQUA_OPERATIONS_STUDIO_ARCHITECTURE / CURRENT_GOAL / TASK_QUEUE / LIVE_STATUS / BRANCH_STATUS / EXECUTION_LOG 最新记录。真实核对当前 branch、git status、HEAD 和 live remote refs，然后继续 TASK_QUEUE 中第一个未完成项（当前为 P2 cross-domain orchestration design + stronger roles/audit）。不要重新实现已完成的 Product/Care P0 或 SEO Admin；不要 merge main；不要动 Production；每完成一轮同步 .ai 文档。`

## Update rule after every material round
After meaningful code/product changes, update at minimum: `HANDOFF_LATEST.md`, `CURRENT_GOAL.md`, `TASK_QUEUE.md`, `LIVE_STATUS.md`, `BRANCH_STATUS.md` when branch facts changed, and append `EXECUTION_LOG.md`. Keep this file short and only change it when the recovery protocol itself changes.
