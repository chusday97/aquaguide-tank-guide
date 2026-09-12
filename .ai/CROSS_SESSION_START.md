# AquaGuide Cross-Session Start

Updated: 2026-09-12
Canonical repo: `chusday97/aquaguide-tank-guide`
Canonical local worktree: `/Users/chuchu/aquaguide-main`
Canonical working branch: `main`

## One-file recovery rule
A new conversation must start from this file in the canonical `main` worktree. Do not infer project state from chat memory and do not continue from another AquaGuide worktree just because it contains an `.ai` directory.

Before reading or changing code, run these guards from `/Users/chuchu/aquaguide-main`:
1. `pwd` must be `/Users/chuchu/aquaguide-main`.
2. `git branch --show-current` must be `main`.
3. `git status --short` must be reviewed before any edit.
4. `git rev-parse HEAD` and `git ls-remote origin refs/heads/main` must be compared; reconcile any mismatch before editing.
5. Historical worktrees (`feature/admin-content-v0`, `reconcile/admin-content-main-20260911`, `product-recovery-20260911`, preview/RC worktrees) are not the default Admin continuation path.
6. `node_modules` in canonical main must be its own directory from `npm ci`; do not symlink dependencies from a historical worktree.

## Canonical read order
1. `.ai/HANDOFF_LATEST.md`
2. `.ai/AQUA_OPERATIONS_STUDIO_ARCHITECTURE.md`
3. `.ai/CURRENT_GOAL.md`
4. `.ai/TASK_QUEUE.md`
5. `.ai/LIVE_STATUS.md`
6. `.ai/BRANCH_STATUS.md`
7. tail of `.ai/EXECUTION_LOG.md`

## Current product / authority model
Treat the Admin as **Aqua Operations Studio**, with Product Data, Care Knowledge, Compatibility Rules and SEO Editorial as separate authorities. Durable Local File + Git runtime authority is the accepted single-machine operating path; Supabase Staging is not an implicit prerequisite.

## Current state and next-work rule
- GitHub `main` and canonical local `main` are the active Admin baseline. At the time of this recovery update they are synchronized through the post-release Local File reliability closeout.
- Vercel Production remains on the validated Business API release; DEV-only Local Admin maintenance must not trigger a Production promotion.
- Care SEO remains `hold_noindex`; Supabase Staging / Production DB migration / indexing remain separate explicit gates.
- There is no speculative feature milestone queued. Continue only from a **new reproducible operator/runtime/data-reliability badcase** or an explicitly authorized Staging/indexing decision.
- Do not resume historical reconciliation or the old `feature/admin-content-v0` workflow by default; that work has already been integrated into main.

## Safety
- Never force-push main.
- Preserve Product/Care, Compatibility, SEO and user-data authority boundaries.
- Do not make SEO copy authoritative for decision-critical Product or Compatibility facts.
- Do not bypass authenticated human review.
- Do not unlock indexing or apply cloud migrations without an explicit release decision.
- Do not delete or reset historical worktrees merely to simplify the local filesystem; some contain intentionally preserved history.

## Exact prompt for a new conversation
`继续 Aqua / Aqua Operations Studio。不要根据聊天记忆猜测项目状态。先进入 /Users/chuchu/aquaguide-main，确认 pwd 正确、branch=main、git status、HEAD，并用 git ls-remote origin refs/heads/main 核对 GitHub main；如果不一致先停止修改并判断关系。然后读取 .ai/CROSS_SESSION_START.md，再按 HANDOFF_LATEST / AQUA_OPERATIONS_STUDIO_ARCHITECTURE / CURRENT_GOAL / TASK_QUEUE / LIVE_STATUS / BRANCH_STATUS / EXECUTION_LOG 最新记录继续。历史 feature/reconcile/product-recovery worktree 不是默认开发入口，不要误进。只修当前可复现的 operator/runtime/data-reliability badcase；不要把 Supabase Staging 当成前置条件，不要自动解锁 indexing 或 cloud migration；每完成一轮同步 .ai 文档。`

## Historical records below
The sections below preserve older SEO Admin / feature-branch implementation history for audit purposes. They are **not** the current branch-routing authority. If any historical branch/path statement conflicts with the recovery rules above, the rules above win.

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
## 2026-09-06 — explicit submit-review handoff
- User reported that the editor did not make the path to the next review stage obvious. Root cause: after any edit, the top review CTA was replaced by a generic Save action, so `Submit for review` disappeared exactly when the operator needed it.
- Editing state now always keeps review progression visible. Clean state shows `提交审核 →`; dirty state shows secondary `仅保存草稿` plus primary `保存并提交审核 →`.
- Dirty save-and-submit persists the content/template changes and `ready_for_review` in one write; clean submit keeps the existing metadata-only review transition. Current Page and Base Template share the same rule.
- Desktop top review bar stays compact at ~61px: `下一步：进入待审核 · 2/3` sits inline with the 148px primary CTA. Mobile stays 60px with a 112px `提交审核 →` CTA and zero horizontal overflow.
- Contract now protects visible submit-review continuity and the atomic dirty save-and-submit path. Admin contract, repo backend/API/dual-repo gates and full root build pass locally. Production/main/live DB remain untouched.

## 2026-09-06 17:52 +08:00 — exact branch / progress sync
- Working branch: `feature/admin-content-v0` at `03919cb65d0a0d1f85860e83e5176dbfa8d075f4` before this docs-only checkpoint. Remote feature matches that SHA; worktree was clean before documentation sync.
- Live `main`: `64fa58a16a723b74621ac1db513adb1efb47e282`. Merge base: `ed0cf38025652db901ee81aa697ca55b1c1584b6`.
- Exact divergence from live main: **269 main-only / 184 feature-only commits**. This is a two-way divergence, not a simple feature-ahead-of-main relationship.
- A read-only `git merge-tree` probe reports real conflicts across `.ai` state docs, `.gitignore`, `HANDOFF.md`, `PROGRESS.md`, `package.json`, `src/App.tsx`, compatibility files, `src/pages/CareEncyclopedia.tsx`, etc. Therefore do **not** blind merge/rebase this feature into main.
- Draft reconciliation PR #144 (`codex/reconcile-admin-content-v0-main-20260905` → `main`) remains OPEN / Draft / UNSTABLE and stays PARKED while Species SEO Admin operator acceptance continues.
- Latest functional SEO Admin checkpoint: `03919cb6 fix(admin): keep review handoff visible`. Review progression is now continuous: clean Editing shows `提交审核 →`; dirty Editing shows `仅保存草稿` + primary `保存并提交审核 →`; desktop also shows `下一步：进入待审核 · 2/3`. Current Page and Base share the same rule.
- Previous accepted checkpoints immediately beneath it: `798596af` Preview↔Editor 1:1 ownership/alignment; `2e741fac` task-first editor; `dbf29f35` clean neutral editor canvas; `2d0aa1a8` Data Review action-first workspace.
- Latest GitHub Admin Content CI run `34026353946`: `validate` PASS; heavy browser/SEO handoff gate correctly SKIPPED by low-cost policy. Cloudflare exact-SHA deployment for the functional checkpoint is successful; verified Preview: `https://7ff827d1.aquaguide-frontend.pages.dev/admin/seo/?demo=1`. Stable branch Preview remains `https://feature-admin-content-v0.aquaguide-frontend.pages.dev/admin/seo/?demo=1`.
- Production, live DB, `main`, Care SEO `hold_noindex`, and public indexing remain untouched.
- Active next work is still **Species SEO Admin operator acceptance / usability convergence**. Do not resume PR #144 reconciliation until the user explicitly returns to branch convergence.
