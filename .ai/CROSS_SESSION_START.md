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
A newer user-reported issue overrides the older branch-reconciliation queue: **Species SEO Admin operator usability / acceptance** is the active task on `feature/admin-content-v0`.

Current visual acceptance rule: Graphite / White remain the neutral base, Green remains the primary interaction accent, and semantic health may additionally use only Red / Yellow / Green for error / attention / healthy states; typography must preserve a clear hierarchy. The publishing workflow is permanent compact **Progress Navigation** (no expand/focus mode): it must expose current stage / 4, four clickable stage buttons and one current-action CTA, visually separated from the editor canvas. System progress (`aria-current=step`) and operator queue selection (`aria-pressed`) are distinct states. Preview is explicit-on-demand from the sticky editor bar and opens as an overlay drawer rather than occupying a permanent third column. Current-page review progress is a separate top-level control layer directly below Publish Progress and above the Workspace; it must never be folded back into the editor header/body or duplicated inside mobile editor chrome.

The current usability checkpoint exposes a visible 4-stage publishing workflow (`数据复核 → 内容编辑 → 人工审核 → Staging`), one `现在只做这件事` action, a separate current-page key-action panel, an explicit `详细编辑` section, and collapsed `更多工具`. Screenshot-driven correction is canonical: normal Species selection belongs inside the existing 16×16 square only (single-select radio); no second row ✓ badge; batch mode reuses that slot as checkbox. `当前物种页面` and `基础模板` must stay visibly distinct with plain-language context; do not reintroduce the ambiguous single-character `页 / 模` badge. The safe read-only acceptance entry remains `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1`; it cannot write Production. The next task is user UI/operator acceptance feedback; writable Preview credentials remain separate.

The separate feature↔main reconciliation candidate remains parked on Draft PR #144. Do not continue or merge that branch unless the user explicitly returns to branch convergence. Current work must stay inside the SEO Admin / Species SEO surface.

Care SEO remains `hold_noindex`; Production/index/live migrations remain locked.

## Stable subsystem not to reimplement
Species SEO already has CSV template/preflight/Diff, durable import batch, duplicate review, batch-scoped review, bilingual Staging readiness, Canonical dependency validation and fail-closed publication. Production remains locked.

## Safety
- Do not merge/rebase `main` during ordinary work.
- Re-read live remote refs before branch decisions; do not trust stale `origin/main` blindly.
- Do not make SEO copy authority for pH, temperature, tank size, care actions or compatibility rules.
- Do not bypass authenticated human review or publish Production without explicit authorization.

## Exact prompt for a new conversation
`继续 Aqua SEO Admin。不要根据聊天记忆猜测。先读取 /Users/chuchu/aquaguide-admin-content-v0/.ai/CROSS_SESSION_START.md，再按其中顺序读取 HANDOFF_LATEST / AQUA_OPERATIONS_STUDIO_ARCHITECTURE / CURRENT_GOAL / TASK_QUEUE / LIVE_STATUS / BRANCH_STATUS / EXECUTION_LOG 最新记录。真实核对 feature/admin-content-v0、git status、HEAD 和 live remote refs。当前用户任务是 Species SEO Admin 的可用性与验收，不是 AquaGuide 鱼缸主产品，也不是 PR #144 reconciliation。先验证最新 SEO Admin read-only hosted demo / 当前下一步流程，再继续明确的 SEO Admin bug。Care SEO 继续 hold_noindex；不要 merge main、不要解锁 Production/index、不要应用 live migration；每完成一轮同步 .ai 文档。`

## Update rule after every material round
After meaningful code/product changes, update at minimum: `HANDOFF_LATEST.md`, `CURRENT_GOAL.md`, `TASK_QUEUE.md`, `LIVE_STATUS.md`, `BRANCH_STATUS.md` when branch facts changed, and append `EXECUTION_LOG.md`. Keep this file short and only change it when the recovery protocol itself changes.

## Current UI invariant — task-first editor
For Species SEO editing, preserve: one page identity → actual page-specific tasks → inherited Search Appearance collapsed when healthy → Advanced SEO collapsed. Do not restore the separate Content Source card, duplicate generic editor headings, or a Current Page explanation card. Base may show one compact impact notice because template edits affect multiple pages.
## 2026-09-06 — Preview-linked editor alignment
- User reported that current-page fields and Preview were structurally misaligned, so visible page content could not be edited directly.
- Preview/editor ownership is now explicit: `sharedIntro` belongs to Base, `variantIntro` belongs to Current Page, and both map to their own editor target instead of sharing one ambiguous `intro` element.
- Preview H1 / Meta selection no longer forces inherited content into Base. From Current Page it opens the collapsed Search Appearance section, highlights the exact field, and exposes `Base template / Edit this page`.
- Preview intro is split into separate inspectable Base and current-page regions; inspect mode exposes an `Add page-specific content` target when the current-page addition is empty.
- Switching Current Page ↔ Base no longer resets Preview. Preview always composes the latest Base layer and current-page layer into one final-page snapshot.
- Runtime proof: H1 override updates Preview immediately; current-page intro updates only the current-page Preview region; Base intro updates only the Base region; both remain visible across scope switches; Preview clicks route back to the correct owner editor.
- Contract, repo backend/API/dual-repo gates, full root build and `git diff --check` pass locally. Production/main/live DB remain untouched.
