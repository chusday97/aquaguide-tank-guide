# AquaGuide 执行状态补充 — 2026-08-16

> 这是 `HANDOFF_2026-08-16.md` / `BADCASES_2026-08-16.md` 的执行记录。只记录已经实际落地、正在验证或被明确依赖阻塞的事项，不把计划写成完成。

## 1. Phase 0：Observation reachability — 代码门禁已关闭

PR #34 已完成 Observation direct action：

- 鱼缸首页 `commonActions` 已有 `记录观察 / Record Observation`；
- stocked tank 打开原有 canonical observation dialog；
- empty tank action disabled；
- 继续复用 repository-first `handleObservationSubmit()`，没有第二套保存逻辑；
- `scripts/test-observation-canonical-state.ts` 已覆盖 reachability + disabled contract；
- Product Golden Path clean head 已通过。

真实路径现在是：

`鱼缸首页 → 记录观察 → 正常/异常 → 保存 → canonical care_events → Timeline`

为修改大型 `Aquarium.tsx` 使用过一次性 exact-anchor GitHub Actions patch；只有 observation regression + TypeScript 全绿后才提交产品 diff。临时 write-enabled workflow/script 已立即删除。

## 2. Auth / deployment gate

PR #35 仍是 Draft。

代码层已经完成：

- 最新 #34 已无冲突叠入 #35；
- two-device live harness 已加入真实 observation UI：Device A Tank B 记录正常观察 → canonical `observation_record` → Device B cloud hydrate → Tank A isolation；
- Auth/data contracts、TypeScript、production build、preview、GP-002 clean head 全绿；
- 临时 stacking workflow/script 已删除。

**仍未完成 production/真实用户 acceptance：**

1. fresh Vercel deployment；
2. Supabase Auth redirect origin；
3. real one-time Magic Link；
4. two-device cloud harness 全路径。

不得把 #35 描述成 Auth 已上线。

## 3. Recommendation P1 contracts

### PR #36 — Catalog Grounding

已绿：

- canonical species ID → `verified`；
- explicit unknown ID → `unresolved`；
- explicit unknown ID 不因相似名称静默回退；
- unique exact name 可解析；
- scientific-name collision → `ambiguous`；
- formal recommendation 必须经过 canonical ID gate。

### PR #37 — Explanation Semantics

已绿：

- physical/estimated water volume 与 heuristic load pressure 分离；
- filter / oxygen / maintenance 不改变用户看到的真实水量；
- unknown capacity 不 fake `0%`；
- load pressure 不是“用了百分之多少水”或安全概率；
- 50/75/90 只映射 qualitative pressure bands。

两条 PR 都保持 Draft，未合并。

## 4. Draft PR #38 — Unresolved Existing Livestock

新增 Draft PR #38：`Support unresolved existing livestock as factual tank state`

Base：PR #34 / `agent/fix-aquarium-completion-state`

目标：关闭 `CATALOG-002 / CATALOG-003`，但不放宽 planned-addition safety/catalog gate。

### 已落地的数据身份

`aquarium_species` migration 新增：

- `identity_status = verified | unresolved`；
- `raw_name`；
- verified：必须有 canonical `species_catalog_key`；
- unresolved：`species_id = NULL`、`species_catalog_key = NULL`、必须有用户原始 `raw_name`；
- local/device mirror 仅用显式 `unresolved:<record-id>` 兼容 key，不把它当 catalog ID。

### 已落地的 repository / API / RPC

- `LivestockAddCommand` 成为 verified/unresolved discriminated union；
- API contract 区分 canonical `speciesCatalogKey` 与 unresolved `rawName`；
- local repository 可记录 unresolved reality；
- cloud API 为 unresolved 调用独立 atomic RPC；
- `add_unresolved_aquarium_livestock()`：`SECURITY INVOKER`、ownership + idempotency、PUBLIC/anon revoke、authenticated execute；
- 不查询、不制造 canonical species。

### Compatibility fail-closed

`species-addition.service` 不再把 catalog 查不到的当前缸记录静默过滤。

当前鱼缸存在 unresolved livestock 时：

- verified 部分继续判断；
- 增加 `unresolved_existing_livestock` missing-evidence rule；
- aggregate 至少降级为 `insufficient_data`；
- 不允许返回“完整兼容结论”。

### 用户 UI 已落地并有真实浏览器回归

`record_existing`：

- 搜索无结果时显示 `待确认身份`；
- 可按用户输入的真实名称 + 数量 `按此名称记录`；
- 明确提示“身份确认前不会用于完整混养判断，也不会伪造物种资料”；
- 保存后 roster 可见；
- unresolved 可移出；
- 不开放 canonical species detail/edit。

`planned_addition`：

- 搜索无结果只提示“规划模式只接受已收录生物”；
- 不显示 unresolved manual-record CTA；
- 不允许绕过 catalog direct-add。

Playwright 已实际验证：

`记录已有生物 → 搜索库外名称 → 按名称记录 → local mirror identityStatus=unresolved/rawName → 缸内物种可见待确认记录 → planned mode 同名逻辑不可绕过`

### 永久门禁

新增 read-only `Unresolved Livestock Contract` workflow（`contents: read`），覆盖：

- unresolved core/model/API/repository contract；
- legacy livestock recording；
- atomic livestock regression；
- core-flow v1；
- static UI contract；
- livestock state surface；
- API/app TypeScript；
- production build；
- existing livestock drawer browser；
- unresolved record-existing/planned-addition browser path。

所有一次性 write-enabled patch workflow/scripts 已删除。

## 5. Supabase remote baseline / rollout

Dedicated AquaGuide project：`ydiygvhuqpogmqlcvgob` 当前实时状态：`ACTIVE_HEALTHY`，Postgres 17。

实时 migration list 已比旧 handoff 更新：当前远端已有 24 条 migration，最新包括：

- `20260816065339_add_care_operation_completed_event`
- `20260816072659_care_checklist_progress`

因此后续 rollout 不再引用旧的“22 migrations”数字，必须以实时 `list_migrations` 为准。

PR #38 的 `20260816100000_unresolved_existing_livestock.sql` **尚未部署**。远端当前事实仍是：

- `species_id` nullable；
- `species_catalog_key` NOT NULL；
- `identity_status/raw_name` 尚不存在。

当前 security advisor：无 WARNING；仅保留 intentional deny-all `species_recognition_misses` 的 RLS-no-policy INFO。

performance advisor：INFO-only（unindexed FK / unused index），不在 #38 rollout 中顺手改索引，避免没有 workload evidence 就扩大 schema scope。

官方当前 function-security guidance 与 #38 migration 方向一致：普通业务函数优先 `SECURITY INVOKER`，且 function execution 默认可能由 PUBLIC 获得，应显式 revoke/grant。

## 6. 当前分支依赖图

```text
main
├─ #29 catalog / taxonomy / water certainty
│  ├─ #30 collision audit
│  ├─ #31 life-type fit
│  ├─ #36 catalog grounding contract
│  └─ #37 explanation semantics
│
└─ #34 canonical aquarium state / repository
   ├─ #35 passwordless auth + two-device harness
   └─ #38 unresolved existing livestock
```

#38 故意 base 在 #34，而不是强行制造 #29 + #34 的交叉 merge：

- 现实事实记录只要求 canonical repository；
- unresolved 不依赖 catalog 猜测；
- planned addition 继续要求 canonical catalog，因此没有绕开 #29 的 safety/identity 边界。

## 7. 下一步执行顺序

### P0 external

1. 等可用 fresh Vercel deployment；
2. 完成 #35 real Magic Link + two-device rollout acceptance。

### P1 #38 rollout

1. clean-head permanent read-only CI；
2. apply Supabase migration；
3. 验证 enum/columns/check/index/function grants；
4. authenticated ownership / idempotency / cross-user isolation acceptance；
5. 清理/回滚 acceptance test data；
6. rerun security/performance advisors；
7. cloud unresolved record cross-device hydrate；
8. verified candidate + unresolved current livestock → `insufficient_data` cloud acceptance。

### P2

- 修 pure-local unresolved → cloud aggregate `saveAquarium()` create-path guard；
- Missing Species Queue；
- unresolved → canonical identity resolution / rebind。

### P3

修 `REC-001`：Replacement Engine 上线前，先让 CTA 文案与真实行为一致；然后实现同意图候选、安全重算、允许 0 个安全替代。

### P4

Explanation UI migration → Conflict Graph → Action Engine / fixability → Intervention Simulation → Unified Tank Diagnosis。

## 8. 禁止事项

- 不合并任何 PR；
- 不把 Draft / green CI 描述成 production；
- 不把 committed migration 描述成 remote deployed；
- 不用 synthetic catalog ID 解决 unresolved reality；
- 不让 planned-addition 通过 unresolved manual path 绕过 catalog；
- 不因为 advisor INFO 顺手做无证据索引清理；
- 不把 heuristic load budget 显示成物理水量或安全概率。
