# AquaGuide 当前交接文档

> **用途**：这是 current-state handoff，只保留当前仍成立的事实、风险和下一步。历史过程查 `PROGRESS.md` 与 Git history，不要再依赖旧 handoff 里已经失效的“Supabase 未执行”等结论。
>
> 最后更新：2026-08-16（Asia/Tokyo）

## 1. 当前状态

- Repo：`chusday97/aquaguide-tank-guide`
- Branch：`agent/fix-aquarium-completion-state`
- PR：#34 `fix: make aquarium completion factual`
- PR 状态：**Open / Draft / 未合并**。未经用户明确要求，不 merge、不改 Ready for review。
- 当前 branch head（本 handoff 更新前）：`c4f433c437987aabf2ffe67b4d4e7d36f43cbe59`
- Care operation canonical business commit：`ffc143d5065f09fbb2cdc7d1c21344d0e26e8e3c`
- Base：`main@d7f57094691d67972c213a5a8b86fb42503bca0f`

AquaGuide 当前主线已经从“localStorage Demo”转为：

`Supabase / API canonical data -> Repository -> local compatibility mirror -> UI`

接下来不应继续堆新功能，而是收口剩余 local-only 业务事实，并完成真实跨设备云端验收。

---

## 2. 已完成的 canonical 数据链路

### Aquarium setup / onboarding

- `getAquariumSetupFacts()` / `getAquariumSetupStatus()` 为唯一建缸完成度模型。
- `undefined` = unknown；明确 `无` / `false` = 已回答。
- setup `usable`：dimensions + waterType。
- setup `complete`：dimensions + waterType + targetTemperature + 已回答 filter。
- onboarding readiness 从真实 aquarium facts 推导，不再相信 stale `aquariumConfigured`。

### Settings / deletion

- Aquarium settings：repository-first 保存，失败不制造 local 假成功。
- Aquarium deletion：Local/API Repository boundary 已完成；云端有 UUID / version / idempotency；Local 保留“不能删除最后一个鱼缸”。

### Water change

Canonical 单日事实：

- `event_type='water_change'`
- `source_type='water_change_day'`
- `source_id=YYYY-MM-DD`

`last_water_change_at` 只作为 derived summary。

已完成 Local/API `setWaterChange()`、Supabase atomic RPC、事务锁、幂等、aquarium/species summary 同事务更新、云端 hydrate 从 `care_events` 重建 history。

### Feeding

- `fedToday` / latest feeding 从 canonical care events 派生。
- 新设备不依赖 local `feedingRecords`。
- repository-first 写入与 persisted-event undo 已完成。
- feeding day identity 稳定，避免重放重复写入。

### Observation

- Observation 已是 append-only canonical `care_events`。
- 同日可多次记录，最新 persisted event 决定今日状态。
- normal / abnormal 互斥。
- 异常 observation 只有保存成功后才进入 diagnosis。
- 新设备可恢复今日观察。

### Diagnosis

- Diagnosis history 进入 Repository。
- 每日巡检：同 aquarium + local date upsert。
- 一般 diagnosis：append。
- direct entry 可 hydrate cloud history。

### Memorial

- Local/API Repository reads 已完成。
- Collection / MemorialDetail direct entry 会主动 hydrate。
- loading 与 genuine missing 已区分。

### Favorites / Collection

- Species wishlist + Care favorites 进入 Repository。
- API 内部 UUID 会映射回稳定 `catalogKey`。
- Collection / Encyclopedia / Care / Identify / Assistant direct entry 都会 hydrate canonical favorites。
- add/remove repository-first。

### Direct-entry hydration

已处理：

- `/collection`
- `/care`
- `/identify`
- `/search`
- `/`
- `/assistant`
- MemorialDetail
- Onboarding legacy-history routing

正式页面不得依赖“先访问另一个页面”才能拿到正确账户数据。

---

## 3. Care completed operation：已完成代码修复

之前的问题：

- `getCompletedCareOperations()` / `setCompletedCareOperations()` 主要依赖 localStorage。
- 新设备无法恢复完成状态。
- completion 没有严格 aquarium scope。
- “已完成过水”曾可能因字符串包含“水”被错误解释成“已记录本次换水”。

现在正式采用：

- `event_type='care_operation_completed'`
- `source_type='care_operation'`
- `source_id=<care topic id>`
- `aquarium_id=<active aquarium>`

写入顺序：

`repository.saveCareEvent -> repository.getCareEvents -> compatibility mirror -> UI`

Cloud 模式：canonical care events 是真值；`cloudMigrationConfirmed=true` 后旧 local completion 不得反向覆盖云端事实。

Local 模式：保留 compatibility mirror，但 completion 必须 aquarium-scoped。

相关代码已经由 commit `ffc143d5065f09fbb2cdc7d1c21344d0e26e8e3c` 正式写入 branch；一次性 `.agent-care-operation-trigger` 和 patch script 已从该业务 commit 删除。

### 本次 CI 结果

Push run：`31931398433`

**全部通过：**

- one-time patch apply
- Product evaluation contracts
- Care hydration regression
- Type check
- Build
- Preview start
- GP-002 continuous browser path
- auto-commit business patch

旧 `test-care-aquarium-hydration.ts` 也已修正：不再锁死 `Promise.all` 恰好只能有 favorites + aquariums，而是要求 direct Care entry hydrate：

`favorites + aquariums + careEvents`

这是提升业务 contract，不是放宽测试。

---

## 4. Supabase 当前真实状态

Dedicated AquaGuide project：

- Project ref：`ydiygvhuqpogmqlcvgob`
- Region：Tokyo / `ap-northeast-1`

当前 remote 已有 **22 migrations**，截至：

`20260815160000_optimize_rls_policies.sql`

已完成：

- GitHub migration timestamp 与 remote migration history 对齐。
- public 表 RLS 已启用。
- mutation RPC 使用 `SECURITY INVOKER`。
- anon / PUBLIC execution 收紧。
- mutable function search path 清理。
- privileged admin lookup 移出 exposed `public` schema。
- water-change RPC ambiguity 修复。
- RLS statement-level `auth.uid()` 优化。
- Live acceptance 覆盖 cross-user isolation、profile/role trigger、livestock add/split/merge/memorial/removal、water change、reminder completion。
- Acceptance transaction 均 rollback，无测试业务数据残留。
- Security advisor 无 warning。
- Performance advisor 无 warning；unindexed FK / unused index 仅 INFO，不盲目优化。

### 仍未完成

Supabase `care_event_type` 目前还没有 `care_operation_completed` enum value。

因此 **代码修复已完成，但数据库 schema rollout 还没有完成**。在 enum migration 上线前，云端保存这类新 event 仍不能视为正式可用。

不要触碰 IceGlide Supabase project。

---

## 5. 现在的 P0 下一步：严格按顺序

### P0-1 清理一次性 CI workflow

当前 `.github/workflows/product-golden-path.yml` 仍残留一次性 runner 逻辑：

- `permissions: contents: write`
- conditional patch apply step
- conditional canonical test
- auto-commit step

虽然 trigger 已被业务 commit 删除，这些步骤现在不会再执行，但不应长期留在正式 CI。

需要：

1. 删除 one-time patch apply / auto-commit logic。
2. 移除不再需要的 `contents: write`。
3. **把 `scripts/test-care-operation-canonical.ts` 改成永久无条件执行。**
4. 保留正常 Product Golden Path 行为。

### P0-2 新增 Supabase enum migration

新增新 migration，为 `public.care_event_type` 添加：

`care_operation_completed`

要求：

1. migration version 不与现有 22 个版本冲突。
2. GitHub migration 文件先落 branch。
3. 再通过 connected Supabase apply 到 `ydiygvhuqpogmqlcvgob`。
4. apply 后检查 `list_migrations`。
5. 查询 `pg_enum` 确认新 value 实际存在。
6. 不插入 fake business data。
7. 不修改 IceGlide 项目。

### P0-3 最终 Golden Path

workflow cleanup + schema rollout 后再跑完整 Product Golden Path，至少确认：

- product evaluation
- care aquarium hydration
- care unknown facts
- care operation canonical
- feeding
- observation
- diagnosis
- memorial
- favorites
- typecheck
- build
- preview
- GP-002 browser path

只有这一轮绿灯后，Care completed operation 才算真正跨前端 + API contract + DB schema 闭环。

PR #34 继续保持 Draft。

---

## 6. 下一项业务真值修复：Care saved checklist

Care operation 完成后，优先审计 **saved checklist**。

原因：

- 已存在 `checklist_completed` event taxonomy。
- `getSavedCareChecklists()` / `setSavedCareChecklists()` 仍有明显 localStorage compatibility 结构。
- 如果“已完成/已保存护理清单”仍只读本机，会重复出现 completed operation 同类的新设备不一致。

先确认产品语义：

- 用户是在“保存部分已经完成的 action”吗？
- 还是“整个 checklist 已完成”吗？

不要把两个语义混成一个 boolean。

建议实现：

1. 定义 canonical payload 与 source identity。
2. repository-first persist。
3. cloud hydrate event-derived state。
4. local fallback 只作为 legacy compatibility。
5. regression 覆盖 aquarium/date/topic isolation、duplicate submit、new-device hydrate、failed write rollback。

---

## 7. 哪些状态不要盲目云端化

只有“换设备后仍应该属于这个账户/鱼缸发生过的事实”才进入 canonical persistence。

当前仍可以合理保持 device-local：

- UI 展开状态。
- 当前浏览偏好。
- Assistant chat transcript（当前明确 browser-local）。
- 纯展示型 discovery session state，除非产品定义改变。

不要因为“现在接了 Supabase”就把所有 localStorage 都搬进数据库。

---

## 8. 数据语义收口后：真实云端产品验收

数据库 ready 不等于用户已经完成“云端同步”验收。

### Deployment env

Frontend：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

API：

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- 独立 `SHARE_TOKEN_SECRET`

Secret 不得写进 GitHub / README / HANDOFF / 聊天正文。

### Auth

先读取实际 callback / redirect code，再设置 Supabase Site URL / redirect URL，不猜 route。

### Two-device E2E

至少真实验证：

1. signup / login。
2. 创建第一个鱼缸，刷新仍存在。
3. 修改设置，刷新仍存在。
4. 创建第二个鱼缸。
5. 删除第二个鱼缸，刷新不复活。
6. 记录换水，刷新存在。
7. 记录喂食，新浏览器同账号看到今日已喂。
8. 记录 observation，新浏览器恢复最新状态。
9. 完成 Care operation，新浏览器同账号同 aquarium 恢复 completed state。
10. 不同 aquarium completion 不串线。
11. timeline 与页面状态一致。

只有这组通过，才能把“跨设备云端同步”从架构能力升级为用户验收能力。

---

## 9. Evaluation / CI 债务

### Golden Path coverage

当前 contract 仍提示 GP-001、GP-003、GP-004 只有 partial end-to-end coverage。

后续不要用更多源码 regex 代替连续浏览器路径。优先补：

- 新用户首次成功。
- 第二设备恢复。
- failure / retry / idempotency。

### 测试不要锁死源码形状

本轮旧 Care hydration test 暴露的问题：

测试应该验证业务边界和 badcase，而不是无必要锁死局部变量、Promise.all 项数或实现顺序。

### npm audit

当前 CI `npm ci` 报告依赖漏洞提示，包含 high severity。

这不是本轮 canonical-data 修复的直接 blocker，但需要单独依赖审计。不要直接把大范围自动依赖升级混入 PR #34；先确认具体 package、runtime reachability 和 breaking risk。

---

## 10. 核心产品规则：禁止回退

- 登录用户的 localStorage compatibility mirror 不能重新成为账户 canonical truth。
- Unknown 不能自动补“合理默认值”。
- `undefined` 与明确 `无 / false` 必须区分。
- 风险规则不能删除现实已经存在的事实。
- 规划加入与记录现实存在必须分开。
- AI 不能反转 deterministic safety block。
- 页面不能依赖访问顺序才能拿到正确数据。
- 云端写失败不能让 UI 先显示假成功。
- 不跳过失败 Golden Path 来制造绿色 CI。
- 不在没有 workload evidence 时盲目调整索引。
- 不泄露 Supabase secret / API key。

---

## 11. 新接手者第一步

不要重新做全项目审计，按顺序执行：

1. 确认 PR #34 仍为 Draft / Open。
2. 读取最新 branch head，不依赖本文 SHA 作为永恒值。
3. 清理 one-time Product Golden Path workflow，并让 care-operation canonical test 永久执行。
4. 新增 `care_operation_completed` enum migration。
5. apply 到 AquaGuide Supabase，并验证 migration history + `pg_enum`。
6. 跑最终 Product Golden Path。
7. 通过后审计 Care saved checklist 的 local-only business state。
8. 数据真值收口后执行 Auth + deployment + two-device E2E。

## 12. 当前阶段完成定义

不是“页面能点”，而是：

- 同账户不同设备看到一致 aquarium business facts。
- 关键写入 repository-first。
- 失败不制造 local 假成功。
- refresh / direct entry / new device 不依赖页面访问顺序。
- canonical state 有 deterministic identity、idempotency 和 regression tests。
- unknown / explicit none / derived summary 不混淆。
- GitHub contracts、API contract、Supabase schema、RLS/RPC 同时成立。
- Product Golden Path 通过后才进入下一条 business-fact 修复。
