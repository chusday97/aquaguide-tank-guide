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

The dedicated feature ↔ live-main reconciliation audit is technically closed on Draft PR #144. The two-parent merge checkpoint is `6e5d9aab` (feature `3dfa76af` + live main `64fa58a`); the validated functional HEAD is `5169f4fc`. GitHub light CI is green, exact-SHA Preview parity passes through Cloudflare Pages, and the remote formal/mobile browser smoke suites pass. Vercel later hit a free-plan build-rate limit; no paid upgrade is required and this is not a product-code failure.

The first unfinished gate is **human visual acceptance of the reconciled Preview**, followed by a deliberate merge decision. Use `https://2b65ad0a.aquaguide-frontend.pages.dev` (or the current branch Preview if HEAD has advanced) for visual review. Do **not** auto-merge `main`, unlock index/Production, or apply live migrations. Continue from `TASK_QUEUE.md`; do not reopen completed Product/Care, Compatibility, Publish Center, Species SEO, Care SEO or AI-advisory work unless a new regression is proven.

## Stable subsystem not to reimplement
Species SEO already has CSV template/preflight/Diff, durable import batch, duplicate review, batch-scoped review, bilingual Staging readiness, Canonical dependency validation and fail-closed publication. Production remains locked.

## Safety
- Do not merge/rebase `main` during ordinary work.
- Re-read live remote refs before branch decisions; do not trust stale `origin/main` blindly.
- Do not make SEO copy authority for pH, temperature, tank size, care actions or compatibility rules.
- Do not bypass authenticated human review or publish Production without explicit authorization.

## Exact prompt for a new conversation
`继续 Aqua 项目。不要根据聊天记忆猜测。先读取 /Users/chuchu/aquaguide-admin-content-v0/.ai/CROSS_SESSION_START.md，再按其中顺序读取 HANDOFF_LATEST / AQUA_OPERATIONS_STUDIO_ARCHITECTURE / CURRENT_GOAL / TASK_QUEUE / LIVE_STATUS / BRANCH_STATUS / EXECUTION_LOG 最新记录。真实核对当前 branch、git status、HEAD、Draft PR #144 和 live remote refs。feature ↔ live-main reconciliation audit 和当前功能 HEAD 的 Preview parity 已完成，不要重做；继续 TASK_QUEUE 中第一个未完成项：对 reconciliation Preview 做人工视觉验收/UI freeze 决策。若 HEAD 仅因 docs-only 同步前进，先用 `check:preview-parity` 确认 Cloudflare exact-SHA parity，再继续视觉验收。未经明确授权不要 merge main、不要解锁 Production/index、不要应用 live migration。不要重新实现已完成的 Product/Care、Compatibility、Publish Center、Species SEO、Care SEO 或 AI advisory；Care SEO 继续 hold_noindex；每完成一轮同步 .ai 文档。`

## Update rule after every material round
After meaningful code/product changes, update at minimum: `HANDOFF_LATEST.md`, `CURRENT_GOAL.md`, `TASK_QUEUE.md`, `LIVE_STATUS.md`, `BRANCH_STATUS.md` when branch facts changed, and append `EXECUTION_LOG.md`. Keep this file short and only change it when the recovery protocol itself changes.
