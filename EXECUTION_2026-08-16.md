# AquaGuide 执行状态补充 — 2026-08-16

> 配套 `HANDOFF_2026-08-16.md` / `BADCASES_2026-08-16.md`。只记录已经实际完成、正在验证或被明确外部依赖阻塞的事项；Draft / green CI 不等于已合并到 main。

## 1. Phase 0：Observation reachability — 已关闭代码 blocker

PR #34 已完成 `记录观察 / Record Observation` 直接入口：

- stocked tank 可打开现有 canonical observation dialog；
- empty tank action disabled；
- 保存继续复用 repository-first `handleObservationSubmit()`；
- canonical observation regression + TypeScript 已通过；
- 临时 write-enabled patch workflow/script 已删除。

真实路径：

`鱼缸首页 → 记录观察 → 正常/异常 → 保存 → canonical care_events → Timeline`

## 2. Auth：代码门禁完成，真实部署仍受外部 blocker

PR #35 仍是 Draft。

已完成：

- 最新 #34 已叠入；
- live two-device harness 已包含真实 observation UI；
- Device A Tank B observation → `observation_record` → Device B hydrate → Tank A isolation 已写入 harness；
- Auth/data contracts、TypeScript、build、preview、GP-002 clean-head CI 已绿。

仍未完成：

1. fresh Vercel deployment；
2. deployed origin 对应的 Supabase Auth redirect；
3. real one-time Magic Link；
4. 完整 two-device deployed-browser acceptance。

当前 GitHub/Vercel 仍受 build-rate-limit，Vercel connector 也没有暴露可管理的 AquaGuide project，因此不得描述为 Auth 已上线。

## 3. Recommendation 基础 contracts

### PR #36 — Catalog Grounding ✅

- canonical ID → `verified`；
- explicit unknown ID → `unresolved`；
- unknown ID 不因相似名称静默回退；
- unique exact name 可解析；
- scientific-name collision → `ambiguous`；
- formal recommendation 必须经过 canonical ID gate。

### PR #37 — Explanation Semantics ✅

- estimated physical water volume 与 heuristic load pressure 分离；
- filter / oxygen / maintenance 不改变用户看到的真实水量；
- unknown capacity 不 fake `0%`；
- load pressure 不是水量占用比例，也不是安全概率。

两条均保持 Draft、未合并。

## 4. PR #38 — Unresolved Existing Livestock：代码 + 数据库门禁已大幅关闭

Draft PR #38：`Support unresolved existing livestock as factual tank state`

Base：PR #34 / `agent/fix-aquarium-completion-state`

关闭的 badcase：`CATALOG-002 / CATALOG-003`。

### 事实记录 contract

`record_existing` 可保存 catalog 外、现实已存在的生物：

- canonical DB：`identity_status='unresolved'`；
- `species_id=NULL`；
- `species_catalog_key=NULL`；
- 保留用户 `raw_name`；
- local/device compatibility mirror 使用显式 `unresolved:<record-id>`，不得当作 catalog ID；
- roster 显示 `待确认身份 / Identity pending`；
- unresolved 可移出，但不开放伪造的 canonical species detail/edit。

`planned_addition` 继续要求 canonical catalog，不开放 unresolved manual-record 绕过。

### Compatibility fail-closed

当前鱼缸存在 unresolved livestock 时：

- verified 部分继续 deterministic evaluation；
- unresolved 作为 `unresolved_existing_livestock` missing evidence；
- aggregate 至少降级为 `insufficient_data`；
- 不允许把未知居民当不存在后给完整兼容结论。

### UI / CI

read-only `Unresolved Livestock Contract` clean head 已全绿：

- core model/API/repository contract；
- legacy livestock recording；
- atomic livestock regression；
- core-flow v1；
- static UI contract；
- livestock state surface；
- API/App TypeScript；
- production build；
- existing livestock drawer browser；
- unresolved `record_existing` / `planned_addition` browser path。

### Supabase rollout — 已部署并验证

Dedicated project：`ydiygvhuqpogmqlcvgob`。

远端 migration：`20260816103423_unresolved_existing_livestock`。

已发现并修复 source-control migration drift：GitHub 原文件名 `20260816100000...` 与远端 version 不一致；现已改为与远端完全一致的 `20260816103423...`，旧文件已删除，contract test 已同步。

Live schema 已验证：

- `identity_status` enum + default `verified`；
- `raw_name`；
- `species_catalog_key` nullable；
- truth constraint 强制 unresolved = null canonical identity + non-empty raw name；
- active unique index 只约束非空 canonical key；
- `add_unresolved_aquarium_livestock()` = `SECURITY INVOKER` + empty search path；
- authenticated 有 execute；anon / PUBLIC 无 execute。

### Authenticated RLS / idempotency acceptance — 已通过并回滚

在单事务中创建临时 User A/User B + Tank A/Tank B，以真实 `authenticated` role + JWT claim 调用 RPC：

- User A 写自己的 Tank A unresolved record ✅
- 同 operation key/request hash 重放仍只有 1 条 ✅
- User A 尝试写 User B 的 Tank B 被拒绝 ✅
- rollback 后 `auth.users / aquariums / aquarium_species / idempotency_records` 全部恢复为 0 ✅

Supabase security advisor：无 WARNING；仅既有 intentional deny-all `species_recognition_misses` INFO。

performance advisor：INFO-only（unindexed FK / unused index），没有在无 workload evidence 时顺手扩 scope。

### #38 尚未关闭的门禁

- deployed-browser / true cross-device cloud hydrate 尚需可用部署环境；
- 验证真实 cloud unresolved record 经 Device B hydrate 后，再评估新候选必须得到 `insufficient_data`。

因此 #38 仍保持 Draft。

## 5. 重复工作清理

PR #39 是执行过程中建立的窄版 CATALOG-003 guard。发现 #38 已并行完成同一 guard + 完整 persistence/API/UI 后，#39 已关闭为 superseded/duplicate，未合并。

原则：宁可删除重复分支，也不保留两套相似 compatibility guard 让后续漂移。

## 6. PR #40 — Replacement Recommendation MVP：正在验证

Draft PR #40：`Add same-intent replacement recommendation MVP`

Base：PR #36 catalog grounding。

范围仅处理“候选尚未入缸”场景，不处理已经同缸后的移出决策。

已提交纯 deterministic engine：

`原候选 → intent → same-role candidate pool → 每个候选重新跑 tankCompatibility → recommended / conditional / needsConfirmation / zero-safe-alternative`

Intent v1：

- life type；
- canonical water type；
- secondary role/category；
- social mode；
- size；
- difficulty。

关键 contract：

- 不用 unrelated organism 凑 Top 3；
- `not_recommended` 排除；
- `caution` 保持 conditional；
- `insufficient_data` 保持 needsConfirmation；
- tank 有 unresolved current livestock 时 formal recommendation fail-closed；
- 已有 livestock 且 candidate 缺 reviewed behavior evidence 时，不包装成高置信推荐；
- `no_safe_same_intent_alternative` 是合法结果。

Golden cases 已提交：

1. neon tetra → cardinal tetra 保持同类群游意图；
2. reviewed predator + small schooling replacement → 必须允许 0 个安全替代；
3. unresolved current livestock → formal replacement 不得 promoted；
4. unrelated large cichlid 不得拿来填推荐位。

当前 #40 CI 正在执行。

## 7. 当前依赖图

```text
main
├─ #29 catalog / taxonomy / water certainty
│  ├─ #30 collision audit
│  ├─ #31 life-type fit
│  ├─ #36 catalog grounding
│  │  └─ #40 replacement recommendation MVP
│  └─ #37 explanation semantics
│
└─ #34 canonical aquarium state / repository
   ├─ #35 passwordless auth + two-device harness
   └─ #38 unresolved existing livestock
```

Closed duplicate：#39。

## 8. 接下来执行顺序

### External rollout

- Vercel 恢复可部署后：#35 real Magic Link + two-device；
- 同一部署继续跑 #38 unresolved cloud hydrate / fail-closed acceptance。

### Recommendation

1. #40 golden cases + typecheck 全绿；
2. `REC-001`：先把当前假“查看风险与替代方案” CTA 接到真实 result model；
3. UI 必须分别显示：真正替代 / 有条件 / 待确认 / 没有安全同类替代；
4. 再做 whole-community Conflict Graph；
5. 再做 Action Engine / fixability；
6. 最后才进入 keep-A vs keep-B / simulateWithout intervention。

### Explanation / diagnosis

- 把 #37 contract 接真实 UI；
- `EXPLAIN-003` group-size evidence level；
- Care Diagnosis 接 Compatibility Graph，解决泛化 aggression advice。

## 9. 禁止事项

- 不合并任何 PR；
- 不把 Draft / green CI 描述成 main/production；
- 不保留重复 compatibility implementation；
- 不用 synthetic catalog identity 保存 unresolved reality；
- 不让 planned-addition 绕过 catalog；
- 不强行凑替代 Top N；
- 不把 heuristic load / fit score 显示成科学概率或真实水量。
