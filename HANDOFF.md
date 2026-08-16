# AquaGuide 当前交接文档

> 这是一份 **current-state handoff**，只保留当前仍然成立的事实、风险和下一步。历史实施细节请查 `PROGRESS.md` 与 Git history，避免旧计划与当前状态互相矛盾。
>
> 最后更新：2026-08-16（Asia/Tokyo）

## 1. 当前结论

AquaGuide 已经从“localStorage 为主的 Demo”推进到 **Repository + API + Supabase 为账户业务事实边界** 的阶段。当前主线不是继续堆功能，而是把仍然残留的 local-only 业务状态逐个改造成 canonical、跨设备、可回归验证的账户事实。

当前修复分支：`agent/fix-aquarium-completion-state`

当前 PR：#34 `fix: make aquarium completion factual`

PR 状态：**Open + Draft + 未合并**。不要在未明确要求时 merge，也不要改为 Ready for review。

当前 PR head（本次 handoff 写入前）：`868ccf95dc294395fb9b36ff18e7bfaef5c04f31`

当前 base：`main@d7f57094691d67972c213a5a8b86fb42503bca0f`

PR 已经很大（当前约 177 commits / 57 changed files），后续必须继续用专项 contract + Golden Path 控制回归，不要再做无关重构。

---

## 2. 产品与数据的核心边界

### 2.1 业务事实优先级

账户级业务事实优先级固定为：

`Supabase / API canonical data -> Repository -> local compatibility mirror -> UI`

禁止重新让页面直接把 localStorage 当成登录用户的账户真值。

### 2.2 现实事实与产品判断分开

- “现实中已经存在于鱼缸里的生物”必须允许先记录，再显示风险。
- `not_recommended` / `insufficient_data` 不能删除或阻止现实事实。
- “计划加入”可以被混养风险阻断，但不能静默写入真实鱼缸。
- AI 只负责解释和辅助；确定性安全规则、状态和指标不能交给 AI 自由生成。

### 2.3 Unknown != None

以下语义必须继续保持：

- `undefined` = 未回答 / 未知。
- `filter='无'`、`light='无'`、`heater=false`、`oxygen=false`、`substrate='无'` = 用户已经明确回答“没有”。
- 不得把未知温度自动变成 `25°C`。
- 不得把未知水体类型自动变成 Freshwater / 淡水。
- 不得把缺失尺寸自动变成事实性的 `0L`。

---

## 3. 本轮已经完成的核心修复

### 3.1 Aquarium setup / onboarding

- `getAquariumSetupFacts()` / `getAquariumSetupStatus()` 已成为建缸完成度的 canonical model。
- setup `usable`：dimensions + waterType。
- setup `complete`：dimensions + waterType + targetTemperature + 已回答 filter。
- Onboarding readiness 不再相信旧的 sticky `aquariumConfigured`，而是从真实 aquarium facts 推导。

### 3.2 Aquarium settings / deletion

- 设置保存改为 repository-first；远端失败时不再先修改本地镜像。
- 删除鱼缸已有 Local/API Repository contract。
- 云端删除使用 UUID、version、idempotency；删除失败不能让本地先消失。
- Local 模式保留“不能删除最后一个鱼缸”的保护。

### 3.3 Water change

canonical 单日换水事实是 `care_events`：

- `event_type='water_change'`
- `source_type='water_change_day'`
- `source_id=YYYY-MM-DD`

`last_water_change_at` 只作为 derived summary，不再是独立真值。

已完成：

- Local/API `setWaterChange()` boundary。
- Supabase atomic RPC。
- aquarium/species summary 同事务更新。
- idempotency + advisory lock。
- 云端 hydrate 从 persisted care events 重建 `waterChangeHistory`。
- mutation 后刷新完整 care event cache，避免切缸丢掉其他鱼缸 timeline。

### 3.4 Feeding

- `fedToday` 与最近喂食时间改为 canonical care event 派生。
- 新设备即使没有 local `feedingRecords`，也能从云端 feeding event 恢复状态。
- 写入 repository-first。
- undo 不再依赖当前设备的 local feeding record ID。
- feeding day 使用稳定日期身份，避免重放重复写入。

### 3.5 Observation

- Observation 已从 local-only 变成 append-only canonical care events。
- 同一天允许多次观察，最新 persisted event 决定今日状态。
- normal 与 abnormal 选项互斥，避免同一条记录内部自相矛盾。
- 异常 observation 只有保存成功后才允许进入 diagnosis。
- 新设备可从云端恢复 observation 状态。

### 3.6 Diagnosis

- Diagnosis history 已进入 Repository。
- 每日巡检：同 aquarium + local date upsert。
- 一般 diagnosis：append。
- cloud hydrate 不再依赖页面之前是否访问过其他入口。

### 3.7 Memorial

- Memorial reads 已进入 Local/API Repository。
- Collection / MemorialDetail 直接进入时会主动 hydrate canonical memorial records。
- loading 与 genuine missing 已区分，避免新设备短暂显示“记录不存在”。

### 3.8 Favorites / Collection

- Species wishlist + Care favorites 已进入 Repository。
- Server 会把内部 UUID 映射回稳定 `catalogKey`。
- Collection / Encyclopedia / Care / Identify / Assistant 等直接进入时都会 hydrate canonical favorites。
- add/remove 均为 repository-first；失败时不允许 local mirror 假成功。

### 3.9 Direct-entry hydration

已处理的页面顺序依赖包括：

- `/collection`
- `/care`
- `/identify`
- `/search`
- `/`
- `/assistant`
- MemorialDetail
- Onboarding legacy-history routing

原则：直接打开任一正式页面时，都不能要求用户先访问另一个页面才能拿到真实账户数据。

### 3.10 Database security

已完成：

- mutation RPC 改为 `SECURITY INVOKER`。
- anon / PUBLIC execution 收紧。
- mutable function `search_path` 清理。
- privileged admin lookup 移出 exposed `public` schema。
- water-change RPC PL/pgSQL ambiguity 修复。
- RLS 改为 statement-level `auth.uid()` 评估并收窄到 authenticated。
- 删除重叠 SELECT policy。

---

## 4. Supabase 当前真实状态

Dedicated AquaGuide Supabase project：

- Project ref：`ydiygvhuqpogmqlcvgob`
- Region：Tokyo / `ap-northeast-1`

当前已经完成 **22 个 migration**，截至：

`20260815160000_optimize_rls_policies.sql`

关键状态：

- GitHub migration timestamp 与 remote `supabase_migrations.schema_migrations` 已对齐。
- 当前 `public` 表 RLS 已开启。
- Live acceptance 已覆盖 cross-user RLS、profile/role trigger、livestock add/split/merge/memorial/removal、water change、reminder completion 等关键事务。
- Acceptance 测试均 rollback，没有留下测试业务数据。
- Security advisor 当前无 warning。
- Performance advisor 当前无 warning；unindexed FK / unused index 仅作为 INFO，暂时不因为“看起来能优化”而盲目加删索引。

**不要再使用旧 handoff 里的“Supabase 尚未执行 migration”结论。那已经过期。**

---

## 5. 当前正在收尾：Care completed operation canonical event

### 5.1 当前问题

Care `procedure` 的“标记已完成操作”仍有 local-only 历史包袱：

- `getCompletedCareOperations()` / `setCompletedCareOperations()` 主要使用 localStorage。
- 新设备 / 新浏览器无法恢复“这个鱼缸已经完成过该操作”。
- completion 过去没有严格 aquarium scope。
- 文案判断曾用字符串包含关系，`“已完成过水”` 因为包含“水”可能被误判成“已记录本次换水”。

### 5.2 目标设计

新增 canonical event taxonomy：

- `event_type='care_operation_completed'`
- `source_type='care_operation'`
- `source_id=<care topic id>`
- `aquarium_id=<active aquarium>`

写入原则：

`repository.saveCareEvent -> repository.getCareEvents -> compatibility mirror -> UI`

云端模式下：

- canonical care events 是真值。
- legacy completed-operation localStorage 只能作为迁移兼容，不得覆盖云端事实。
- `cloudMigrationConfirmed=true` 后不能继续把旧 local completion 当账户真值。

本地模式仍允许 compatibility mirror，且 completion 必须 aquarium-scoped。

### 5.3 已准备的代码改动

当前一次性 patch 会修改：

- `src/types/database.ts`
- `packages/contracts/src/business.ts`
- `src/services/care/care-activity.service.ts`
- `src/pages/CareEncyclopedia.tsx`
- `scripts/test-care-operation-canonical.ts`

并更新旧 `scripts/test-care-aquarium-hydration.ts`：它原来把源码结构锁死为“只 hydrate favorites + aquariums”，现在改为要求：

`favorites + aquariums + careEvents`

这是测试 contract 修正，不是降低回归标准。

### 5.4 当前 CI 状态（写入 handoff 时）

Push run：`31931398433`

当前已经通过：

- one-time canonical care operation patch apply
- `npm ci`
- Playwright install
- Product evaluation contracts
- Type check
- Build
- Preview start

当前正在执行：

- `GP-002 continuous browser path`

只有 GP-002 通过后，workflow 才会执行 `Commit canonical care operation repair`，把业务 patch 真正提交回当前分支。

因此在这个时间点：

**不要把 runner working tree 中的 care-operation patch 当成已经存在于 branch head 的正式代码。**

---

## 6. Care operation 收尾后的严格下一步

### P0-1：确认 one-time patch 真正落到 branch

1. 等当前 push run 完成。
2. 确认 GP-002 success。
3. 确认 workflow 自动产生业务 commit。
4. 确认 `.agent-care-operation-trigger` 与 `scripts/apply-care-operation-canonical-patch.py` 已删除。
5. 重新读取 branch head，确认 `care_operation_completed`、repository-first write、canonical hydrate 和 aquarium-scoped completion 都已经存在于 GitHub 正式文件，而不只是 CI workspace。

如果 run 失败：

- 读具体失败步骤。
- 只修真实原因。
- 不要绕过 / skip Golden Path。
- 不要先升级 Supabase enum。

### P0-2：清理一次性 CI runner 改动

当前 `.github/workflows/product-golden-path.yml` 为了执行一次性 patch 临时增加了：

- `contents: write`
- patch apply step
- conditional canonical test
- auto-commit step

业务 patch 成功落库后必须恢复常规 CI：

- 删除 one-time patch/auto-commit logic。
- 移除不再需要的 `contents: write`。
- **把 `scripts/test-care-operation-canonical.ts` 改为永久、无条件执行**，不能随着 trigger 删除而失去回归覆盖。

### P0-3：新增并 rollout Supabase enum migration

只有代码完整 CI 通过后再做数据库 rollout。

新增一个新的 migration，为 `public.care_event_type` 添加：

`care_operation_completed`

要求：

1. migration filename/version 不与现有 22 个版本冲突。
2. GitHub 先有 migration 文件，再通过 connected Supabase apply。
3. apply 后检查 `list_migrations`。
4. SQL 查询 `pg_enum` 验证新 enum label 实际存在。
5. 不插入 fake business data。
6. 不触碰 IceGlide Supabase project。

### P0-4：完整 Golden Path 再跑一次

schema rollout + workflow cleanup 后，再跑最终 Product Golden Path，至少确认：

- product evaluation contracts
- care aquarium hydration
- care unknown facts
- care operation canonical contract
- feeding / observation / diagnosis / memorial / favorites contracts
- typecheck
- build
- preview
- GP-002 browser path

PR #34 继续保持 Draft。

---

## 7. Care operation 之后的下一项业务真值修复

优先检查 **Care saved checklist**。

原因：

- 当前已有 `checklist_completed` event taxonomy。
- `getSavedCareChecklists()` / `setSavedCareChecklists()` 仍带有明显 localStorage compatibility 结构。
- 如果 UI 仍只从本机读取“已保存护理清单”，它会重复出现和 completed operation 相同的新设备/跨设备不一致问题。

建议执行顺序：

1. 先确认当前 checklist 的真实用户语义：保存部分完成项 vs 完整 checklist completion。
2. 定义 canonical `care_events` payload/source identity，不要只凭字符串 title 判断。
3. repository-first persist。
4. cloud hydrate event-derived state。
5. local fallback 只保留 legacy compatibility。
6. 为 aquarium/date/topic isolation、duplicate submit、new-device hydrate、failed write rollback 建 regression tests。

不要一次性把所有 localStorage 都云端化。以下类型仍可能合理地保持 device-local：

- UI 展开状态
- 当前页面浏览偏好
- Assistant chat transcript（当前明确 browser-local）
- 纯展示型 discovery session state（除非后续产品定义改变）

原则是：**只有跨设备后仍应属于“这个账户/这个鱼缸发生过的事实”才进入 canonical business persistence。**

---

## 8. 数据语义修复完成后，进入真实云端产品验收

数据库 schema 已基本就绪，但不能因此宣称“云端同步已经作为正式产品闭环上线”。还需要检查实际部署/Auth/环境变量和两设备路径。

### 8.1 部署配置

前端：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

API：

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- 独立 `SHARE_TOKEN_SECRET`

Secret 不得写进 GitHub、README、HANDOFF 或聊天输出。

### 8.2 Auth

先读取实际 auth callback/redirect implementation，再配置 Supabase Site URL / redirect URLs；不要猜 route。

### 8.3 两设备 E2E acceptance

至少真实验证：

1. signup / login。
2. 创建第一个鱼缸，刷新仍存在。
3. 修改设置，刷新仍存在。
4. 创建第二个鱼缸。
5. 删除第二个鱼缸，刷新后不会“复活”。
6. 记录换水，刷新后仍存在。
7. 记录喂食，新浏览器同账号能看到今日已喂。
8. 记录 observation，新浏览器同账号能恢复今日最新观察。
9. 完成 Care operation，新浏览器同账号、同 aquarium 能恢复 completed state。
10. 不同 aquarium 不互相污染 completion。
11. timeline 与页面状态一致。

只有这一组通过后，才可以把“跨设备云端同步”从架构能力提升为用户已验收能力。

---

## 9. Evaluation / CI 后续债务

### 9.1 Golden Path 覆盖仍不完整

当前 contract 明确提示：GP-001、GP-003、GP-004 仍属于 partial end-to-end coverage。

不要用更多静态源码 regex 代替真正连续浏览器路径。新增 E2E 时优先覆盖：

- 新用户首次成功路径。
- 已登录用户第二设备恢复路径。
- 失败/重试/idempotency 路径。

### 9.2 避免测试锁死源码形状

本轮 `test-care-aquarium-hydration.ts` 暴露了一个测试设计问题：

旧测试要求 Promise.all **必须恰好只有两项**，导致新增正确的 `getCareEvents()` 反而失败。

以后 contract 应验证：

- 必须存在的业务边界。
- 必须禁止的 badcase。
- 可观察业务结果。

不要无必要地锁定局部变量名、数组元素数量或实现顺序。

### 9.3 npm audit

当前 CI 的 `npm ci` 报告存在依赖漏洞提示（包含 high severity）。这不是本轮 canonical-data 修复的直接 blocker，但需要单独依赖审计。

不要直接执行会大范围升级依赖的自动修复并混入 PR #34；应先定位 package、是否 runtime reachable、breaking change 风险，再单独处理。

---

## 10. 当前禁止事项

- 不 merge PR #34，除非用户明确要求。
- 不把 PR 改成 Ready for review，除非用户明确要求。
- 不触碰 IceGlide Supabase project。
- 不把任何 secret / service key 写入仓库或文档。
- 不把 localStorage compatibility mirror 重新升级为登录用户的 canonical truth。
- 不因为 AI/规则给出风险而删除现实已存在的数据。
- 不给未知事实填“合理默认值”。
- 不跳过失败的 Golden Path 来制造绿色 CI。
- 不在没有 workload evidence 时盲目删 unused index 或加所有 FK index。

---

## 11. 新接手者第一步

按下面顺序执行，不要重新做全项目审计：

1. 打开 PR #34，确认仍为 Draft / Open。
2. 读取当前 branch head，不要依赖本文记录的旧 SHA。
3. 查看最新 Product Golden Path push run。
4. 如果 care-operation one-time run 已通过：确认业务 commit、清理临时 workflow、补 enum migration、rollout Supabase、再跑最终 Golden Path。
5. 如果 run 未通过：只处理最新失败步骤。
6. Care operation 完成后，审计 saved checklist 是否仍为 local-only business fact。
7. 数据语义修复收口后，再进入真实 Auth + deployment + two-device E2E acceptance。

## 12. 当前成功标准

这一阶段完成的定义不是“页面看起来能点”，而是：

- 同一个账户在不同设备看到一致的 aquarium business facts。
- 关键写入全部 repository-first。
- 云端失败不会制造本地假成功。
- refresh / direct entry / new device 不依赖页面访问顺序。
- canonical state 有 deterministic identity、idempotency 和 regression tests。
- unknown、explicit none、derived summary 三类语义不混淆。
- Supabase RLS/RPC/security 与 GitHub contracts 同时成立。
- Product Golden Path 通过后才允许继续下一条业务真值链路。
