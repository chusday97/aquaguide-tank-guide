# AquaGuide 执行状态补充 — 2026-08-16

> 这是 `HANDOFF_2026-08-16.md` / `BADCASES_2026-08-16.md` 的执行记录。只记录已经实际落地、正在验证或被明确依赖阻塞的事项，不把计划写成完成。

## 1. Phase 0：Observation reachability

### 已确认

PR #34 已经具备 canonical observation persistence：observation 会通过 repository 写入 `care_events`，支持 normal / abnormal、结构化 checks、同日多次 append，并由 canonical event 推导当天状态。

当前 blocker 不是 persistence，而是 **鱼缸首页没有可达入口打开现有 observation dialog**。

已在 PR #34 留下具体 review contract：

- 在 `commonActions` 增加 `recordObservation`；
- stocked tank 点击后直接 `setIsObservationOpen(true)`；
- empty tank 不允许生成生物观察；
- 复用已有 `handleObservationSubmit()`，禁止重写第二套保存路径；
- `scripts/test-observation-canonical-state.ts` 必须新增 reachability regression；
- 最终路径：`鱼缸首页 → 记录观察 → 正常/异常 → 保存 → canonical care_events → Timeline`。

### 尚未完成

Observation UI source patch 尚未进入 #34，因此 Phase 0 仍未关闭。

原因不是产品决策未定，而是当前 GitHub connector 对 `Aquarium.tsx` 这类大型文件只提供整文件 replace，没有安全的局部 patch write。为避免意外覆盖约数千行页面代码，本轮没有用高风险整文件替换冒充“已修复”。

## 2. Auth / deployment gate

PR #35 仍是 Draft，代码层 Auth Golden Path 已绿，但真实 Magic Link + two-device acceptance 未完成。

当前外部门禁：

- GitHub/Vercel status 仍返回 build-rate-limit failure；
- 当前连接的 Vercel team 可读取，但 Vercel project listing 返回 0 个可管理项目，因此本轮无法从 Vercel connector 安全触发 AquaGuide Preview；
- Observation reachability 修复后，#35 live harness 还需要加入真实 observation UI → Device-B recovery → Tank-A isolation。

不得把这一状态描述成 Auth 已上线。

## 3. P1 executable badcases：Catalog Grounding

新增 Draft PR #36：`Add catalog grounding contracts for recommendations`

Base：PR #29 / `fix/marine-invertebrate-water-type`

新增：

- `src/modules/recommendation/catalog-grounding.ts`
- `scripts/test-catalog-grounding-contract.ts`
- `.github/workflows/recommendation-grounding-contract.yml`

已经固化的合同：

1. canonical species ID → `verified`；
2. 明确提供但 catalog 不存在的 species ID → `unresolved`；
3. 如果显式 ID 不存在，即使同时给了一个“很像”的已知名称，也禁止静默回退；
4. 唯一 exact name 可解析到 canonical record；
5. scientific-name collision → `ambiguous`，禁止 first-row wins；
6. formal recommendation ID list 必须分离 verified / unresolved。

验证：Recommendation Grounding Contract regression ✅；TypeScript ✅。

## 4. P1 executable badcases：专业指标语义

新增 Draft PR #37：`Separate water volume from recommendation load semantics`

Base：PR #29 / `fix/marine-invertebrate-water-type`

新增：

- `src/modules/recommendation/recommendation-explanation.ts`
- `scripts/test-recommendation-explanation-contract.ts`
- `.github/workflows/recommendation-explanation-contract.yml`

已经固化的合同：

1. `estimated water volume` 是物理/估算水量；
2. filter / water-change / oxygen 等 heuristic multiplier 不允许被解释成“鱼缸变成更多升水”；
3. load pressure 是 heuristic stocking pressure，不是“用了百分之多少的水”，也不是安全概率；
4. 容量未知时 load pressure 必须是 `unknown`，不能显示 fake `0%`；
5. 当前 50 / 75 / 90 thresholds 被映射到 qualitative pressure bands，而不是伪精确安全评分；
6. 继续复用 #29 的 recommendation-profile certainty regression。

验证：Recommendation Explanation Contract regression ✅；existing recommendation certainty regression ✅；TypeScript ✅。

## 5. 当前分支依赖图

```text
main
├─ #29 catalog / taxonomy / water certainty
│  ├─ #30 collision audit
│  ├─ #31 life-type fit
│  ├─ #36 recommendation catalog grounding contracts
│  └─ #37 recommendation explanation contracts
│
└─ #34 canonical aquarium state / repository
   └─ #35 passwordless auth + two-device harness
```

因此 `Unresolved Species` 真正持久化现在有一个明确的架构依赖：

- 需要 #29 提供 catalog identity / unknown semantics；
- 同时需要 #34 提供 canonical repository / cross-device persistence boundary。

在两条基线尚未汇合前，不应把 unresolved livestock 强行塞进任一单边分支，否则会产生第三条交叉集成链并扩大回归范围。

## 6. 下一步执行顺序

### P0

1. 对 #34 完成 Observation direct action + reachability regression；
2. #35 延伸 live two-device harness 至 observation；
3. 获得可部署 Preview 后跑真实 Magic Link acceptance；
4. 保持 #34/#35 Draft，直到真实 rollout gate 完成。

### P1

1. #36 已绿，保持 Draft 等待 #29 / Phase-0 stack 清理；
2. #37 已绿，保持 Draft 等待 #29 / Phase-0 stack 清理；
3. 把新增 contract 与 `BADCASES_2026-08-16.md` 的对应 case 建立明确编号映射。

### P2 — 等基线汇合后实施

实现 `verified | pending | unresolved` species identity + unresolved existing-livestock persistence：

- `record_existing`：现实事实允许保存；
- `planned_addition`：unresolved 不允许 high-confidence recommendation；
- compatibility 遇到 unresolved current livestock → `INSUFFICIENT_DATA`，不得忽略；
- Missing Species Queue 记录真实补库需求；
- identity 补齐后再映射到 canonical `species_id`。

### P3

把 #37 的 explanation contract 接入真实 UI，逐步替换 `effectiveVolumeLiters` / raw load percentage 的错误语义。

### P4+

在上述基础稳定后再做 Replacement Recommendation → Conflict Graph → Intervention Simulation → Unified Tank Diagnosis。

## 7. 本轮禁止事项

- 不合并任何 PR；
- 不把 Draft / green CI 描述成 production；
- 不因为连接器缺少局部 patch 就高风险整文件覆盖 `Aquarium.tsx`；
- 不提前实现横跨 #29 + #34 的 unresolved persistence；
- 不让 AI-generated species name 绕过 canonical ID grounding；
- 不把 heuristic load budget 显示成物理水量或安全概率。
