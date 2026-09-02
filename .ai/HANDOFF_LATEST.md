# AquaGuide Species SEO Admin — HANDOFF LATEST

Updated: 2026-09-02 14:15 +0800
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
- latest functional commit: `16d3f7e` — `feat(admin): add global copy cleanup queue`
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
Latest functional commits:
- `16d3f7e feat(admin): add global copy cleanup queue`
- `8b70a64 fix(seo): decouple code preview from staging snapshot`
- `c82378f fix(admin): block acceptance copy from review and staging`
- previous duplicate authority checkpoint: `4da7849 fix(admin): enforce resolved duplicate policy everywhere`

GitHub Actions:
- Admin Content CI Gate #47 (`33595530355`) SUCCESS on `c82378f`
- Admin Content CI Gate #48 (`33595971134`) SUCCESS on `8b70a64`
- Admin Content CI Gate #49 (`33597791743`) SUCCESS on `16d3f7e`
- #49 covers the global copy-cleanup queue semantics plus the existing deployment-routing, contract, production build, explicit root Species artifact integration, generated-catalog consistency and diff-hygiene gates

Vercel Preview:
- latest AquaGuide deployment `dpl_7wysx8FDcz1CX4oWqNtmmdiLvVzq` — READY on `16d3f7e`
- latest AquaGuide host `aquaguide-8fb3cp5ny-chusday97s-projects.vercel.app`
- previous deployment `dpl_FfdQmQxKfSYhQS8yBz9F7eVukj2b` remains the deployment-boundary checkpoint on `8b70a64`
- stable branch alias: `aquaguide-git-feature-admin-content-v0-chusday97s-projects.vercel.app`
- latest Admin-only deployment `dpl_F6jSc7U9pece3NaprHUdGbsU8Gyp` — READY on `16d3f7e`
- hosted AquaGuide `/admin/seo/` returns 200 and deployment-level `X-Robots-Tag: noindex`; its Admin bundle is `index-Kbs1p-SQ.js`, matching the locally verified global copy-cleanup build
- Vercel build log explicitly reports `Species SEO artifact: skipped (normal code build; no explicit Staging publish input).`
- the immediately prior AquaGuide deployment `dpl_CE1YCbyBG8tQc8C7DR1YB76aVmga` failed on `c82378f` because a normal code Preview still auto-consumed the historical dirty staging snapshot; `8b70a64` fixes that coupling rather than weakening the hygiene gate

Temporary `_vercel_share` links expire and must not be stored as canonical handoff URLs.

## 16. Important recent commits
- `16d3f7e` — global per-locale copy-cleanup queue + sidebar alert + Base-template repair navigation
- `8b70a64` — normal code Preview no longer consumes staging content; only explicit staging-publish snapshot commits generate Species pages
- `c82378f` — content hygiene gate blocks acceptance/test wording from review, Staging and static generation
- `af8ad80` — atomic duplicate review + evidence-guided UI + resolved-state cleanup
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
1. In the **real authenticated Admin**, finish the 白金西非凤凰 review (`sp_0214 / sp_0338`) using the improved `处理重复` flow. Current evidence strongly favors `确认是重复记录` + keep `sp_0214`. Do not bypass the Admin session to write the private repo.
2. Clean `sp_0001` before any new Staging release. The new hygiene gate makes this explicit:
   - English private row: H1 contains `Red Cherry Shrimp Care Guide | Dual-Repo Staging`; use the editor's `恢复基础模板` action, Save, then submit/approve English.
   - Chinese private row: H1 contains `后台真实保存验收`; restore the clean Base H1 and Save. Because the content genuinely changes, this new edit must return to Editing and be reviewed again; this is not a repeat of the earlier acceptance test.
   - both locales must be clean for an independently indexed bilingual page to become Preview-ready.
3. Use the bulk-import flow for the next real content batch only; do not create fake writes merely to populate Activity history.
4. Then explicitly Staging Publish only the intended reviewed Species set. The historical committed staging snapshot is intentionally left untouched; it is evidence from the old acceptance run and now fails the generator hygiene gate.
5. Verify exactly one public staging commit/Preview rebuild, final static EN/ZH HTML, H1/title/meta/canonical/hreflang/robots/CTA, and deployment-level `X-Robots-Tag: noindex`. Do not repeatedly retrigger while the Vercel deployment-rate limit is active.
6. Keep Production locked until the user explicitly decides to move the publication boundary forward.

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

## 21. Duplicate review closure — completed 2026-09-02
Functional commit: `af8ad80`.

### What changed
- duplicate resolution is now one Repo RPC: review decision + canonical/index synchronization are committed atomically in the private content store
- one user action now creates exactly one Activity record and one top-right notification instead of several internal SEO-save notices
- changing a prior duplicate decision to `distinct_records` clears stale sibling-canonical policy and returns affected rows to fail-closed `noindex + editing`
- sidebar `!`, `处理重复`, and editor Data Review launcher now depend on **open review state**, not permanent source duplicate metadata
- after resolution, duplicate badges disappear; folded copy changes from `疑似重复已折叠` to `重复记录已合并`
- the duplicate drawer now shows system comparison evidence, source lineage, recommended primary record, and explicit post-save outcome before confirmation
- 白金西非凤凰 evidence was checked: identity + main care fields and image match; descriptions are two wording variants; `sp_0338` is marked duplicate of `sp_0214`
- no private review decision was written from local tooling because authenticated Admin write credentials are not present locally; the application safety boundary was not bypassed

### Verification
- `npm run test:contract -w @aquaguide/admin-content` PASS
- Repo backend atomic duplicate fixture PASS, including duplicate→distinct rollback safety and one-activity invariant
- full root `npm run build` PASS
- `npm run verify:seo-species-handoff` PASS
- `npm run test:admin-content-ui` PASS
- browser walk-through verified 白金西非凤凰 comparison/recommendation UI and unresolved sidebar copy
- GitHub Admin Content CI Gate #45 PASS on pushed head `5806412`
- new Vercel Preview is temporarily blocked by account deployment-rate limit; do not treat this as a product regression
- `git diff --check` PASS
- only pre-existing Vite chunk-size warnings remain

## 22. Resolved duplicate policy authority — completed locally 2026-09-02
This batch closes write-path bypasses discovered after the duplicate workflow redesign.

### Authority rule
Once a duplicate set is explicitly resolved as `duplicate_records`, the human Data Review decision owns the SEO indexing policy:
- canonical record → `index` + empty sibling canonical key
- folded duplicate record → `canonical_to_sibling` → reviewed canonical record
- changing the human decision to `distinct_records` clears stale canonical policy and returns rows to fail-closed `noindex + editing`

### All write paths now obey the same rule
- single-page Advanced SEO auto-loads the reviewed policy and locks the index/canonical controls; changing the decision requires reopening Data Review
- invalid single-page index/canonical state blocks content Save instead of merely showing a warning
- Batch SEO Draft creation carries the reviewed policy when it creates rows
- CSV template download pre-fills the reviewed canonical/index policy even when a Variant SEO row does not yet exist
- CSV validation rejects a row that contradicts a resolved duplicate decision
- Repo backend stores duplicate `member_ids` on new resolutions and re-applies the reviewed policy on generic `species_seo` upsert/update, so direct Admin API writes cannot bypass the decision

### Verification
- contract test deliberately attempted to upsert a folded duplicate as independent `index`; Repo returned the reviewed `canonical_to_sibling` policy
- contract test deliberately attempted to downgrade the reviewed canonical to `noindex`; Repo retained authoritative `index`
- duplicate→distinct rollback safety still PASS
- `npm run test:contract -w @aquaguide/admin-content` PASS (`revisions: 18`)
- full root `npm run build` PASS
- `npm run verify:seo-species-handoff` PASS
- `npm run test:admin-content-ui` PASS
- `git diff --check` PASS
- new Vercel Preview remains externally blocked by the account deployment-rate limit; do not retrigger repeatedly


## 23. Content hygiene release gate — completed 2026-09-02
This closes the acceptance-copy leak that left `sp_0001` test wording inside Approved/Staging content.

### New authority rule
- Drafts may contain temporary working copy, but `ready_for_review`, `approved`, Staging snapshot creation and static Species generation must reject known test/acceptance markers.
- the gate covers effective SEO title/meta/H1, Base/Variant intro, localized name, image alt and focus keyword; Base templates are checked independently.
- indexable bilingual readiness also checks the approved counterpart locale, so one clean language cannot hide a dirty counterpart.

### UX
- editor shows `检测到测试 / 验收文案` next to the review workflow and identifies the exact field/marker.
- inherited SEO fields with a dirty page Override expose `恢复基础模板`; browser verification on `sp_0001` English changed H1 to `Dual-Repo Staging`, showed the warning, then restored the clean Base H1 in one click.
- Base editor has the same review blocker.

### Defense in depth
- Repo review-state updates reject dirty rows server-side, so API calls cannot approve acceptance copy.
- Repo Staging snapshot creation rejects legacy dirty Approved rows.
- static Species generator independently scans effective content, so old/manually supplied snapshots cannot regenerate acceptance copy.
- the current historical `content/species-seo/staging-snapshot.json` was tested directly and is correctly rejected for `sp_0001/zh-CN` (`验收`) and `sp_0001/en` (`Dual-Repo`). Do not manually rewrite this historical snapshot; create a new one only through explicit Staging Publish after private Draft cleanup.

### Verification
- `npm run test:contract -w @aquaguide/admin-content` PASS, including server approval rejection and legacy-dirty-staging rejection (`revisions: 21`)
- direct static-generator run against the committed historical staging snapshot FAILS CLOSED with the two expected H1 hygiene errors
- browser review-mode walk-through verified warning + one-click Base restore for `sp_0001` English
- full root `npm run build` PASS
- `npm run verify:seo-species-handoff` PASS
- `npm run test:admin-content-ui` PASS
- `git diff --check` PASS
- GitHub Admin Content CI Gate #47 PASS on `c82378f`
- Admin-only Vercel Preview for `c82378f` was READY; the AquaGuide root Preview exposed the remaining build/content coupling described below

## 24. Code Preview vs explicit Staging publication boundary — completed 2026-09-02
Functional commit: `8b70a64`.

### Problem found by the remote gate
- after the hygiene gate landed, the normal AquaGuide code Preview automatically consumed the historical committed staging snapshot
- because that old snapshot correctly fails hygiene on both `sp_0001` H1s, the entire code Preview failed even though the Admin code itself was valid
- this meant code deployment and content publication were still incorrectly coupled

### Fixed boundary
- ordinary `fix/feat` Git/Vercel Preview commits now build AquaGuide + `/admin/seo/` without consuming any Species staging snapshot
- the repo snapshot is auto-consumed only when all conditions are true: Preview environment, `feature/admin-content-v0`, commit subject starts `content(seo): publish staging`, and the commit changes only `content/species-seo/staging-snapshot.json`
- mixed code+snapshot commits and main/default-branch builds cannot impersonate an explicit Staging publish
- explicit `SPECIES_SEO_SNAPSHOT_PATH` remains supported for CI/local artifact verification
- a real explicit Staging publish still fails closed if the snapshot contains dirty acceptance/test content

### Verification
- `npm run test:species-seo-build-routing` PASS
- simulated normal Vercel code Preview PASS and logs `Species SEO artifact: skipped (normal code build; no explicit Staging publish input).`
- simulated `content(seo): publish staging sp_0001` with the historical dirty snapshot FAILS CLOSED on zh `验收` + en `Dual-Repo`
- explicit clean CI fixture still generates 3 bilingual Species / 6 HTML pages and passes root artifact + SEO handoff verification
- GitHub Admin Content CI Gate #48 PASS on `8b70a64`
- AquaGuide Vercel Preview `dpl_FfdQmQxKfSYhQS8yBz9F7eVukj2b` READY
- Admin-only Vercel Preview `dpl_8FuNP96AYyUTDhtaqEEXt2gXv8Y4` READY
- hosted `/admin/seo/` returns 200 with `X-Robots-Tag: noindex`

## 25. Global copy-cleanup queue — completed 2026-09-02
Functional commit: `16d3f7e`.

### What changed
- content hygiene is now a first-class **diagnostic queue**, not a fourth editorial review state
- workflow overview counts dirty effective pages per locale and stores exact Species member IDs for filtering
- Chinese and English task sections each show `需清理文案 / Copy cleanup` with an explanation that review/Preview remains blocked until cleanup
- clicking a hygiene task switches the editor to the corresponding content locale and selects the first affected Species
- sidebar shows a full-width cleanup alert only when the current locale actually has dirty pages, avoiding a fifth cramped quick-filter button
- a current-page dirty Override still offers `恢复基础模板`; inherited Base H1/title/meta or shared intro now offers `去基础模板修复` so the user lands on the real source rather than copying Base content into Variant

### Verification
- semantic contract: one dirty zh-CN page creates exactly one zh cleanup task and zero English false positives
- empty editorial state creates zero hygiene tasks
- review-mode browser verified the new queue rows coexist with the existing 33 Data Review issues / 458 blocked SEO candidates and no console errors
- `npm run test:contract -w @aquaguide/admin-content` PASS
- `npm run test:species-seo-build-routing` PASS
- Admin build + root build PASS; root code build still logs `Species SEO artifact: skipped (normal code build; no explicit Staging publish input).`
- `npm run verify:seo-species-handoff` PASS
- `npm run test:admin-content-ui` PASS
- GitHub Admin Content CI Gate #49 PASS (`33597791743`)
- AquaGuide Preview `dpl_7wysx8FDcz1CX4oWqNtmmdiLvVzq` READY; Admin-only Preview `dpl_F6jSc7U9pece3NaprHUdGbsU8Gyp` READY
- hosted `/admin/seo/` returns 200 + `X-Robots-Tag: noindex`

## 26. Startup instruction for the next conversation
When the user says `继续 Aqua SEO / 继续 SEO 后台 / 同步进度继续修复`:
1. Read `.ai/HANDOFF_LATEST.md` first.
2. Check `git branch --show-current`, `git status --short`, and current HEAD.
3. Do not re-plan completed architecture.
4. Use the private content repo for current editorial state and the public repo only for code/staging snapshot state.
5. Continue the first incomplete item in section 18 unless the user gives a newer concrete UI issue.
6. Execute changes/tests/commit/push in batches; do not stop after merely explaining.
