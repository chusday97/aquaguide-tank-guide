# AquaGuide 当前交接文档

> **用途**：这是项目当前唯一有效 handoff。只记录仍成立的事实、执行顺序和验收标准。历史过程查 `PROGRESS.md` 与 Git history。
>
> 最后更新：2026-08-16（Asia/Tokyo）

## 1. 当前项目状态

- Repo：`chusday97/aquaguide-tank-guide`
- 当前修复分支：`agent/fix-aquarium-completion-state`
- PR：#34 `fix: make aquarium completion factual`
- PR 状态：**Open / Draft / 未合并**。未经用户明确要求，不 merge、不改 Ready for review。
- 本次 handoff 更新前 PR head：`9b67debe70e7705d2f7b0b2ea8ae178f79eec7a6`
- Base：`main@d7f57094691d67972c213a5a8b86fb42503bca0f`

当前产品底层主线已经统一为：

`Supabase / API canonical data -> Repository -> local compatibility mirror -> UI`

后续不再横向堆功能；先保证“记得对”，再做“判断对”，再做“告诉用户下一步”，最后才做增长。

---

## 2. 已完成的基础设施 / canonical state

已进入 repository / canonical data 边界：

- Aquarium setup / onboarding readiness
- Aquarium settings / deletion
- Water change
- Feeding
- Observation
- Diagnosis
- Memorial
- Species favorites / Care favorites
- Collection direct hydration
- Care direct hydration
- Identify direct hydration
- Search direct hydration
- Home direct hydration
- Assistant favorites
- Legacy onboarding history routing

关键原则已经锁定：

- `undefined` = unknown；明确 `无 / false` = 已回答。
- Cloud write 失败时 UI 不先制造 local 假成功。
- 登录用户的 localStorage 只允许作为 compatibility mirror / device preference，不得重新成为账户事实源。
- 页面不得依赖“先访问另一个页面”才能拿到正确数据。
- AI 不得反转 deterministic safety / factual verdict。

---

## 3. 当前正在收尾：Care completed operation

业务代码已采用 canonical event：

- `event_type='care_operation_completed'`
- `source_type='care_operation'`
- `source_id=<care topic id>`
- `aquarium_id=<active aquarium>`

写入顺序：

`repository.saveCareEvent -> repository.getCareEvents -> compatibility mirror -> UI`

相关业务修复已经通过此前 Product Golden Path，并进入分支。

### 仍需完成的两件事

1. 清理 `.github/workflows/product-golden-path.yml` 中一次性 patch / auto-commit / `contents: write` 逻辑，并让 `scripts/test-care-operation-canonical.ts` 永久无条件运行。
2. 给 Supabase `public.care_event_type` 增加 `care_operation_completed` enum migration，并只 rollout 到 AquaGuide project `ydiygvhuqpogmqlcvgob`。

完成后再跑一轮正式 Golden Path，Care completed operation 才算前端 + API contract + DB schema 全闭环。

---

## 4. 项目总执行顺序

### Phase 0 — 收口当前基础设施 PR #34

目标：停止无限扩大 #34，让账户级事实层稳定。

执行：

1. 清理 one-time Golden Path runner。
2. rollout `care_operation_completed` migration。
3. 最终 Golden Path。
4. 做一次 data-state sweep，只修剩余明确的账户级业务事实，不再加入新的业务能力。
5. 审计 Care saved checklist 的语义；只有确认它属于跨设备账户事实后才 canonicalize。
6. 两设备 / 两浏览器真实云端验收：Aquarium、settings、delete、water change、feeding、observation、care operation、favorites 等状态可恢复且 aquarium 之间不串线。

**完成标准：** 新设备登录后，已有账户事实可恢复；刷新不丢；页面访问顺序不影响结果；失败不会伪成功。

---

### Phase 1 — Canonical State Ownership

为整个 AquaGuide 明确状态所有权，形成可维护 contract：

- Aquarium Facts
- Livestock Facts
- Care Events
- Health Facts
- Knowledge Facts

任何关键状态都必须回答：`Who owns this state?`

页面自己的 `useState` 只能是 view state，不能重新定义业务事实。

---

### Phase 2 — Compatibility v2：可信混养决策系统

这是下一阶段最高优先级业务能力，单独新建 stacked Draft branch / PR，不继续塞进 #34。

建议 branch：`agent/compatibility-evidence-v2`

#### 2.1 V1 Audit + Baseline

先冻结现有行为：

- 现有输入 / 输出
- 哪些字段真正参与判断
- 哪些规则是关键词 / heuristic
- 哪些 verdict 有 reviewed evidence
- 哪些结果存在假确定性

保存 V1 golden baseline，后续每个 verdict 变化都必须可解释。

#### 2.2 Compatibility Contract v2

输入：

`Aquarium + Existing Residents + Candidate Species + Species Facts + Pair Evidence`

输出结构必须包含：

- `verdict`
- `confidence`
- `blockers`
- `majorRisks`
- `conditions`
- `environmentFit`
- `socialFit`
- `communityFit`
- `evidenceIds`
- `engineVersion`
- `evidenceRevision`

Verdict 固定五态：

- `NOT_RECOMMENDED`
- `HIGH_RISK`
- `CONDITIONAL`
- `NO_MAJOR_CONFLICT_FOUND`
- `INSUFFICIENT_DATA`

禁止无校准依据的“兼容度 82%”。

#### 2.3 Deterministic Rule Engine

第一版只做约 10 条核心规则：

1. WATER_TYPE_CONFLICT
2. TEMPERATURE_NO_OVERLAP
3. PREDATOR_PREY
4. FIN_NIPPER_LONG_FIN
5. AGGRESSIVE_VULNERABLE
6. TERRITORIAL_CONFLICT
7. SCHOOLING_REQUIREMENT
8. TANK_SIZE_OR_LENGTH
9. FLOW_CONFLICT
10. INVERTEBRATE_PREDATION

Severity-first，不做平均分；hard blocker 不能被其他优点抵消。

#### 2.4 Evaluation Dataset

先覆盖约 12 个代表性高频物种、约 30 个 deliberately difficult golden cases。

重点覆盖：

- 水参数重合但行为冲突
- predator / prey
- schooling 数量不足
- 同 pair 不同 tank context
- direct pair evidence 与 generic inference 冲突
- evidence 不足必须 fail closed

核心门禁：

- 严重风险 false negative = 0（在 golden set 上）
- 相同输入 verdict deterministic = 100%
- decisive claim 必须 100% 有 reviewed evidence
- AI explanation 不得改变 engine verdict

#### 2.5 Evidence Schema + 第一批 reviewed knowledge

主来源策略：

- FishBase：科学 / 生态事实
- SeriouslyFish：水族物种资料、行为、群体、饲养条件
- Aquarium Co-Op：community tank 实操、fin nipping、群体行为等
- Practical Fishkeeping：复杂场景、慈鲷、领地、繁殖攻击等补充

Evidence 与 Species Fact 分离；任何参与关键判断的事实都必须可追溯到 source URL 和 review 状态。

第一批不要追求 486 种全覆盖；先做约 12 种高频物种，把系统质量证明出来，再扩到 30–50 种。

#### 2.6 Compatibility UI v2

UI 在 engine / evidence / eval 稳定后再改。

用户看到：

- 是否推荐
- 主要风险
- 当前鱼缸哪些条件触发判断
- 需要满足哪些条件
- 来源引用
- 可执行的替代建议

AI 只负责把 structured assessment 翻译成自然语言；若输出与 engine verdict / reasonCode / evidence 不一致，丢弃 AI 文案并退回 deterministic template。

---

### Phase 3 — Aquarium Health / Care System

Compatibility 回答“能不能加入”；这一阶段回答“已经养了以后今天该做什么”。

建设：

- Aquarium Health Model
- Task Engine
- Recommendation Engine
- Daily care loop

不要先造虚假总分；先输出事实型状态：water / care / livestock / risk / maintenance。

目标闭环：

`建立鱼缸 -> 添加生物 -> 系统判断 -> 执行养护 -> 记录结果 -> 系统重新判断`

---

### Phase 4 — Onboarding / Golden Path

目标 Golden Path：

`Landing -> 创建鱼缸 -> 最少必要信息 -> 添加第一种鱼 -> 得到第一条有价值判断 -> 看到今天下一步`

First Value 不是“鱼缸创建成功”，而是 AquaGuide 第一次减少用户一个真实养鱼决策的不确定性。

采用 Progressive Profiling：只在某个判断真正需要事实时再追问，而不是开局要求填完整表单。

---

### Phase 5 — Knowledge Ops / 自动更新

流程：

`Source Monitor -> Fetch -> Extract -> Normalize -> Compare -> Conflict Detection -> Review Queue -> Publish`

自动抓取只能生成 candidate evidence，不能直接把 AI 抽取结果标成 reviewed / production truth。

需要简单 Review Console：

- New Evidence
- Conflict
- Needs Review
- Approved
- Rejected

---

### Phase 6 — Product Evaluation / Analytics

建立四层评测：

1. Data：数据是否丢失、跨设备是否一致
2. Logic：规则是否判断错误
3. Product：用户是否完成核心任务
4. AI：解释是否 grounded、是否改变事实

CI 方向：

`Repository contracts -> Rules -> Golden cases -> Browser Golden Path -> AI grounding eval`

优先补 GP-001 / GP-003 / GP-004 的连续浏览器路径，不用越来越多源码 regex 代替真实 E2E。

---

### Phase 7 — Growth / SEO / 分享 / 商业化

最后再做：

- 分享鱼缸 / Compatibility Result
- 导出 / 保存诊断
- SEO / 可索引物种页
- Returning loop / reminder
- Landing optimization
- Acquisition / retention experiment
- Commercialization tests

只有核心结果真正可靠后，增长才有意义；否则只是放大错误。

---

## 5. 当前明确“不做”

- 不先做 486 种鱼自动全覆盖。
- 不让 LLM 自由决定 compatibility verdict。
- 不继续给 PR #34 塞新业务功能。
- 不把所有 localStorage 无差别迁到 Supabase。
- 不用“合理默认值”填充 unknown facts。
- 不为了绿 CI 跳过失败 Golden Path。
- 不在没有真实 workload evidence 时盲目删/加索引。
- 不把 Supabase secret / API key 写入 README、HANDOFF、GitHub 或聊天正文。

---

## 6. 下一步执行队列（由 ChatGPT 继续推进）

严格按以下顺序，不需要重新做全项目审计：

1. 确认 PR #34 仍 Draft / Open。
2. 清理 Product Golden Path one-time runner；care-operation canonical test 改为永久无条件运行。
3. 新增并 rollout `care_operation_completed` Supabase enum migration。
4. 跑最终基础设施 Golden Path。
5. 完成 PR #34 data-state sweep 与 two-device cloud acceptance；只修明确账户事实问题。
6. 停止扩大 #34。
7. 从 #34 当前稳定基础切 `agent/compatibility-evidence-v2` stacked Draft branch。
8. Compatibility V1 audit + baseline。
9. Compatibility v2 contract + 10 条 Rule Spec。
10. 建 12-species / 30-case evaluation dataset。
11. Evidence Schema + 第一批主流来源 reviewed evidence。
12. Rule Engine v2 + invariants + Golden Path。
13. Shadow compare V1 / V2。
14. 再做 Compatibility Result UI 和受约束 AI explanation。
15. Compatibility 稳定后进入 Aquarium Health / Task Engine。

---

## 7. 接手原则

压缩成一句话：

> **先让 AquaGuide 记得对，再让它判断对，然后让用户知道下一步做什么，最后才让更多用户进来。**

所有新改动都要遵守：

`Fact -> Evidence -> Deterministic Decision -> Action -> Evaluation`

而不是：

`Prompt -> LLM -> 看起来合理的答案`。
