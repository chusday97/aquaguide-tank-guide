# AquaGuide Species SEO Admin — HANDOFF LATEST

Updated: 2026-09-02 01:04 +08:00
Canonical continuation entry: **read this file first**.
Branch: `feature/admin-content-v0`
Local worktree: `/Users/chuchu/aquaguide-admin-content-v0`

## 1. What this project is
This is not a standalone generic CMS. It is AquaGuide's Species SEO publication system:

`AquaGuide Product Truth + Editorial SEO → Data Review → Editorial Review → explicit Staging Snapshot → static Species HTML → AquaGuide product CTA`

Product Truth stays read-only here. The Admin edits only SEO/editorial content.

## 2. Current repository architecture
**Public app/code repo**
- `chusday97/aquaguide-tank-guide`
- working branch: `feature/admin-content-v0`
- latest functional commit: `c2c4789` — `feat(admin): add bulk import and activity center`
- `main` is not the target of this work and Production is still locked.

**Private editorial content repo**
- `chusday97/aquaguide-seo-content` (PRIVATE)
- Draft branch: `seo-admin-drafts`
- store: `content/species-seo/admin-store.json`
- contains Draft/Review/Revision/Data Review authority.

**Public staging snapshot**
- app repo branch `feature/admin-content-v0`
- `content/species-seo/staging-snapshot.json`
- only written by explicit Staging Publish.
- normal Save/Review must never write here or trigger AquaGuide deployment.

## 3. No-Supabase decision — authoritative
Species SEO Admin runtime/staging does **not** use Supabase.
Do not provision AquaGuide Supabase staging for this feature and do not reuse IceGlide Supabase.
Legacy Supabase migrations/tests are historical compatibility evidence only.

Runtime path:
`/admin/seo/ → HttpOnly Admin Session → /api/admin-content/query → private GitHub content repo`

Translation uses the same Admin session. GitHub token/password/session secret stay server-side.

## 4. Product Truth vs SEO ownership
AquaGuide Product Truth owns:
- catalog key / scientific name
- image asset
- temperature / pH / tank size / difficulty
- compatibility and recommendation logic

Species SEO Admin owns:
- SEO Title
- Meta Description
- H1
- Intro / page-specific supplement
- Image Alt
- English editorial display name
- Index strategy / canonical policy
- Data Review + Editorial Review

Never let SEO Admin silently rewrite `fishData.ts` / Product Truth.

## 5. Current catalog/data-review numbers
Generated source catalog:
- 486 source records
- 276 Base groups
- 28 exact-duplicate extra source rows
- unresolved SEO navigation folds duplicate secondary rows
- current SEO page candidates: 458 before further human duplicate decisions

After the completed 极火虾 duplicate review, UI currently reports:
- Data Review pending: **32**
- affected Base groups in pending filter: **31**

Source rows are not automatically SEO pages.

## 6. Duplicate handling — current product rule
Do not delete source rows from Product Truth inside this Admin.

For an unresolved duplicate pair:
- secondary record is folded from normal SEO navigation
- affected page stays release-blocked until human review

Human decision:
- `不是重复` / `distinct_records` → both rows may remain separate SEO pages
- `是同一个品种` / `duplicate_records` → choose one SEO main page
  - main page automatically gets `index`
  - any existing duplicate SEO row is aligned to `canonical_to_sibling` → main page

The duplicate blocker is page/set scoped. It must not block unrelated variants under the same Base group.

## 7. Duplicate-review UX — latest
Commit `fae815f` makes the left-side duplicate marker an action, not a passive warning.

Current intended flow:
`处理重复 → current group's Data Review drawer → choose one of two decision buttons → choose SEO main page if duplicate → 确认并保存`

There is **no decision dropdown** for duplicate review.
The two primary decision buttons are:
- `是同一个品种` — 只保留 1 个 SEO 页面
- `不是重复` — 两个页面分别保留

Local real-browser regression verified that clicking `处理重复` opens the correct group's drawer.

Example still pending at handoff:
- Base: `Pelvicachromis pulcher`
- duplicate rows: `sp_0214` + `sp_0338`
- both: 白金西非凤凰 / `Pelvicachromis pulcher var. Albino` / same category
- no human decision has been recorded yet at this handoff.

## 8. 极火虾 real hosted acceptance state
The user successfully completed the real hosted UI/API chain through approval for Chinese content.

Duplicate review:
- duplicate pair included `sp_0001 / sp_0027`
- decision: confirmed duplicate
- SEO main page: `sp_0001`
- Product Truth was not deleted/rewritten

Chinese `sp_0001 / zh-CN` current private state:
- status: `draft`
- review_state: `approved`
- reviewed_by: `repo-admin`
- reviewed_at: `2026-09-01T16:13:48.096Z`
- version: `6`
- index_strategy: `index`
- H1: `极火虾饲养指南｜后台真实保存验收`

Chinese Base `base:neocaridina-davidi` is Approved.
English Base is Approved.

English `sp_0001 / en` is **not ready**:
- status: `draft`
- review_state: `editing`
- version: `3`
- H1 still contains acceptance/test copy: `Red Cherry Shrimp Care Guide | Dual-Repo Staging`

Therefore do **not** Staging Publish `sp_0001` yet if the goal is clean final content.
First replace/clean English acceptance copy, save, submit/approve English.
Also replace the Chinese `后台真实保存验收` acceptance wording before any Production release.

## 9. Human Save/Review chain already proven
Do not ask the user to repeat the earlier Save/Submit tests.

Proven:
- hosted Admin login works (`admin@aquaguide.local`; password remains secret)
- real UI Save writes the private content repo
- Save creates a new application Revision
- Save forces Draft + Editing when editorial content changes
- private Save caused **0 AquaGuide Vercel deployments**
- review action now writes review state independently
- real Chinese approval reached `approved`, version 6
- approval caused **0 public/Vercel deployment**

Important historical bug already fixed:
- old review button reused content upsert / release checks and could visually appear to advance while backend reset to `editing`
- current implementation updates review state independently; contract guards this regression

## 10. Status vs action UX contract
Status is read-only information. Action is always a button.

Status examples:
- 发布状态: 草稿 / Published
- 审核状态: 编辑中 / 待审核 / 已批准预览
- 审核进度: 1 编辑中 → 2 待审核 → 3 已批准预览

Action examples:
- 保存修改
- 提交审核
- 批准预览
- 退回编辑
- 发布到 Staging
- 查看发布阻塞项

Do not reintroduce workflow-state dropdowns.

## 11. Template/inheritance UX contract
The old repeated Chinese `公共内容 / 使用 Base 值 / Override` wording was rejected in real use.

Current primary language:
- `管理基础模板`
- `当前页面`
- one centralized `内容来源` manager
- per field inside manager: page-specific vs template source

Meta Title / Meta Description / H1 should not each repeat inheritance explanations under the input.
Chinese rendered primary page was verified with zero repeated `公共` wording after the cleanup pass.

Storage model remains inheritance-based:
- Base owns shared template/content
- Variant/current page stores only explicit overrides
- returning to template means clearing override, not copying Base text

## 12. Work-queue UX state
The old three-column KPI dashboard in the drawer was removed because it broke at narrow widths and mixed English engineering labels.
Current queue is a vertical task list with localized labels and dynamic counts.

Do not restore `Blocked / Ready for Review / Publish-ready` KPI tiles in Chinese UI.

## 13. Static SEO delivery architecture
Root build emits `/admin/seo/` and can merge static Species pages from an explicit snapshot.

Routes:
- EN `/species/<base-scientific-slug>/<catalog-key-with-hyphens>.html`
- ZH `/zh/species/...`

SEO → product CTAs:
- compatibility: `/encyclopedia?mode=compatibility&species=<catalog_key>&source=seo-species`
- browse/detail: `/encyclopedia?mode=browse&species=<catalog_key>&source=seo-species`
- planning: `/aquarium?action=plan-species&species=<catalog_key>&source=seo-species`

Compatibility handoff is browser-regressed: supplied Species enters calculator as a planned candidate.

Production build without explicit publication input skips Species generation.
Production-style release accepts Published only.
Staging release accepts explicitly allowlisted Approved Drafts only.

## 14. Staging/Production safety
Production remains locked:
- no `main` merge implied
- no Production Published unlock
- no Production Supabase work

Controlled/Staging Preview remains non-production and must retain deployment-level noindex.

The public staging snapshot still contains earlier acceptance-test content from the first dual-repo vertical slice. Do not mistake it for the newest private Draft state.
A normal Save/Approve intentionally does not update that snapshot.

## 15. Latest code/deployment evidence
Latest functional commit:
- `c2c4789 feat(admin): add bulk import and activity center`

GitHub Actions:
- Admin Content CI Gate #44
- run id `33535655305`
- head `39f90585ae2cecef0932b439d7b68a70664c4be2`
- result: SUCCESS; all validate steps green

Vercel Preview:
- deployment `dpl_GmHUtFr3xD9N4A7T7XZdQL6eP7rA`
- host `aquaguide-j1gpyblfg-chusday97s-projects.vercel.app`
- state: READY
- stable branch alias: `aquaguide-git-feature-admin-content-v0-chusday97s-projects.vercel.app`
- protected hosted `/admin/seo/` artifact was fetched after deployment and contains `批量导入`, `操作记录`, `import_action`, and `admin_activity_log`

Temporary `_vercel_share` links expire and must not be stored as canonical handoff URLs.

## 16. Important recent commits
- `c2c4789` — batch CSV import + persistent Admin activity center + duplicate-review auto-close
- `fae815f` — duplicate warning becomes direct review action
- `6a99dbb` — repair review-state persistence + simplify template UX
- `7aebaaf` — separate workflow states from actions
- `baf1a6a` — make workflow action-driven; remove review dropdown
- `e19200b` — surface workflow actions near editor top
- `f5a75e1` — rebuild work-queue drawer layout
- `8d1905c` — productize duplicate/page-candidate/inheritance UX
- `711019f` — prefill internal Admin login account
- `118fa21` — first explicit public staging snapshot test

## 17. Tests/gates that must stay green
Primary:
- `npm run test:contract -w @aquaguide/admin-content`
- Repo backend gate (`supabase_started=false`)
- Repo API auth gate
- dual-repo routing gate
- Admin production build
- root AquaGuide build
- SEO Species handoff/browser regression
- diff hygiene

Known build warning: large Vite chunks. This is not currently a Species SEO functional failure.

## 18. Current next actions — in priority order
1. Continue Data Review processing. The current example is 白金西非凤凰 (`sp_0214 / sp_0338`) and can now be handled directly from `处理重复`; once its final outstanding issue is resolved the Data Review drawer auto-closes and the operation is surfaced top-right.
2. Use the new bulk-import flow for the next real batch only when there is real content to import; do not create fake writes merely to populate Activity history.
3. For the original `sp_0001` vertical slice: clean the English test copy, save English, submit and approve English. Do not ask user to re-submit Chinese; Chinese is already Approved.
4. Then explicitly Staging Publish only the intended reviewed Species set.
5. Verify exactly one public staging commit/Preview rebuild, final static EN/ZH HTML, H1/title/meta/canonical/hreflang/robots/CTA, and deployment-level `X-Robots-Tag: noindex`.
6. Clean all acceptance wording before considering Production.
7. Keep Production locked until the user explicitly decides to move the publication boundary forward.

## 19. What NOT to do
- Do not provision Supabase for Species SEO.
- Do not put Draft/revision/review notes in the public AquaGuide repo.
- Do not recreate a public `seo-admin-drafts` branch.
- Do not expose/read GitHub PAT, Admin password/hash or session secret.
- Do not ask the user to repeat Save/Submit actions already proven.
- Do not confuse private approval with Staging publication.
- Do not publish acceptance/test H1 copy to Production.
- Do not let one duplicate pair block unrelated variants.
- Do not restore review-state dropdowns or engineering-language inheritance controls.
- Do not make every tiny docs/UI change a separate deployment when batching is possible.

## 20. Bulk import + operation closure — completed 2026-09-02
Functional commit: `c2c4789`.

### Bulk import UX
- a top-right `批量导入 / Bulk import` entry is always available in the real Admin
- the secondary tools list also keeps the same entry
- download format is CSV, explicitly described as editable in Excel / Numbers
- template is generated for the current content locale and contains all 486 catalog rows plus current SEO values
- Product Truth identity columns (`catalog_key`, source name, scientific name) are reference/identity only; bulk import never writes Product Truth
- every template row defaults to no action
- only rows explicitly marked `import_action=update` / `更新` / `yes` / `1` are written
- import validates catalog key, locale, index strategy, and same-Base canonical target
- imported editorial rows always write as Draft + Editing; changed content cannot retain prior approval
- blank supported overrides intentionally return to Base inheritance

### Operation center / notifications
- every successful normal Repo mutation appends `admin_activity_log` in the **same private-store write**, not a second content commit
- repo store schema upgrades lazily from v1 to v2 on the next write; old stores remain readable
- Staging publish activity is best-effort after the release succeeds; a logging failure must never turn a successful release into a retryable failure
- browser mutations emit one shared `aquaguide-admin-operation` event for top-right success/error notices
- top-right `操作记录 / Activity` shows unread count and opens a persistent activity drawer
- persisted records cover save, submit/approve/return, duplicate/data review, batch Draft creation, bulk import, rollback and Staging publish
- read-only UI Review does not query private operation history

### Data Review auto-close
- after a review decision is saved, the UI recomputes `assessDataReview` for that Base group
- if no issue remains for that group, the Data Review drawer closes automatically
- if another category/duplicate issue still exists, the drawer stays open
- the completed action still appears in the top-right notice and Activity history

### Verification completed locally + remotely
- `npm run test:contract -w @aquaguide/admin-content` PASS, including new bulk/activity contracts
- Admin production build PASS
- full root `npm run build` PASS
- `npm run verify:seo-species-handoff` PASS
- `npm run test:admin-content-ui` PASS
- real browser walk-through in `VITE_ADMIN_REVIEW_MODE=true` verified top-right Bulk import, CSV drawer controls, Activity drawer and read-only privacy message
- `git diff --check` PASS
- GitHub Admin Content CI Gate #44 PASS
- Vercel Preview `dpl_GmHUtFr3xD9N4A7T7XZdQL6eP7rA` READY
- hosted `/admin/seo/` deployment artifact contains the new bulk-import/activity-center code
- only known Vite chunk-size warnings remain

## 21. Startup instruction for the next conversation
When the user says `继续 Aqua SEO / 继续 SEO 后台 / 同步进度继续修复`:
1. Read `.ai/HANDOFF_LATEST.md` first.
2. Check `git branch --show-current`, `git status --short`, and current HEAD.
3. Do not re-plan completed architecture.
4. Use the private content repo for current editorial state and the public repo only for code/staging snapshot state.
5. Continue the first incomplete item in section 18 unless the user gives a newer concrete UI issue.
6. Execute changes/tests/commit/push in batches; do not stop after merely explaining.
