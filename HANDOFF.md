# AquaGuide 当前交接文档

> **用途**：这是项目当前唯一有效 handoff。只记录仍成立的事实、执行顺序和验收标准。历史过程查 `PROGRESS.md` 与 Git history。
>
> 最后更新：2026-08-16（Asia/Tokyo）

## 1. 当前项目状态

- Repo：`chusday97/aquaguide-tank-guide`
- 当前修复分支：`agent/fix-aquarium-completion-state`
- PR：#34 `fix: make aquarium completion factual`
- PR 状态：**Open / Draft / 未合并**。未经用户明确要求，不 merge、不改 Ready for review。
- 本次 handoff 更新前业务 / DB head：`fbb697fbdd86670f5c8146e61887f7c5907b46c9`
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
- Care completed operation

关键原则已经锁定：

- `undefined` = unknown；明确 `无 / false` = 已回答。
- Cloud write 失败时 UI 不先制造 local 假成功。
- 登录用户的 localStorage 只允许作为 compatibility mirror / device preference，不得重新成为账户事实源。
- 页面不得依赖“先访问另一个页面”才能拿到正确数据。
- AI 不得反转 deterministic safety / factual verdict。

---

## 3. Care completed operation：已闭环

Canonical event：

- `event_type='care_operation_completed'`
- `source_type='care_operation'`
- `source_id=<care topic id>`
- `aquarium_id=<active aquarium>`

写入顺序：

`repository.saveCareEvent -> repository.getCareEvents -> compatibility mirror -> UI`

已完成：

1. 业务代码 repository-first / event-derived。
2. `scripts/test-care-operation-canonical.ts` 已改为 Product Golden Path 永久无条件运行。
3. `.github/workflows/product-golden-path.yml` 已删除 one-time patch / auto-commit，并恢复 `contents: read`。
4. AquaGuide Supabase project `ydiygvhuqpogmqlcvgob` 已增加 enum value `care_operation_completed`。
5. Remote migration version：`20260816065339_add_care_operation_completed_event`；GitHub migration 文件名已与 remote history 对齐。
6. `pg_enum` 已直接查询确认该 value 实际存在。
7. Product Golden Path #412（run `31932543947`）在 `fbb697fbdd86670f5c8146e61887f7c5907b46c9` 全绿：contracts、TypeScript、Build、Preview、GP-002 均通过。

因此 Care completed operation 的前端 + API contract + DB schema + CI 已闭环。

---

## 4. Phase 0 当前剩余工作

### 4.1 Data-state sweep

只修剩余**明确属于账户 / 鱼缸事实**的 local-only 状态，不再向 PR #34 增加新业务能力。

第一项已确认：Care saved checklist。

当前 `CareSavedChecklist` 实际语义是：

- `topicId`
- `title`
- `savedAt`
- 用户在该 Care topic 下保存 / 勾选的 `actions[]`

它是 **partial checklist progress / saved action set**，不是“整个 checklist 已完成”。

因此后续不能直接把它映射成现有 `checklist_completed=true`。正确下一步是先定义 partial-progress canonical payload / identity，再决定是否使用新 event taxonomy 或独立 repository resource。

需要覆盖：

- aquarium isolation
- topic isolation
- partial action preservation
- duplicate save
- new-device hydrate
- failed-write rollback
- legacy local compatibility

### 4.2 Two-device cloud acceptance

在停止扩大 PR #34 前，做真实两浏览器 / 两设备同账号验收：

1. signup / login
2. 创建鱼缸，刷新仍存在
3. settings 修改后刷新存在
4. 第二鱼缸创建 / 删除不复活
5. water change 跨设备恢复
6. feeding 今日状态跨设备恢复
7. observation 最新状态跨设备恢复
8. care operation completed 跨设备恢复
9. favorites 跨设备恢复
10. 不同 aquarium 的状态不串线
11. timeline 与页面 derived state 一致

只有这组通过，才把“云端同步”从架构能力升级为用户验收能力。

### 4.3 停止扩大 PR #34

Data-state sweep + two-device acceptance 后：

- 不再把新业务能力塞进 #34。
- #34 继续保持 Draft，是否 merge 等用户明确指令。
- 从 #34 的稳定基础切新的 Compatibility v2 stacked Draft branch。

---

## 5. 项目总执行顺序

### Phase 1 — Canonical State Ownership

为整个 AquaGuide 明确状态所有权：

- Aquarium Facts
- Livestock Facts
- Care Events
- Health Facts
- Knowledge Facts

任何关键状态都必须回答：`Who owns this state?`

页面 `useState` 只能做 view state，不能重新定义业务事实。

---

### Phase 2 — Compatibility v2：可信混养决策系统

这是下一阶段最高优先级业务能力，单独新建 stacked Draft branch / PR。

建议 branch：`agent/compatibility-evidence-v2`

#### 2.1 V1 Audit + Baseline

冻结现有行为：

- 现有输入 / 输出
- 真正参与判断的字段
- 关键词 / heuristic 规则
- reviewed evidence 覆盖
- 假确定性结果

保存 V1 golden baseline，每个 v2 verdict 变化都必须可解释。

#### 2.2 Compatibility Contract v2

输入：

`Aquarium + Existing Residents + Candidate Species + Species Facts + Pair Evidence`

输出必须包含：

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

第一版约 10 条：

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

重点：

- 水参数重合但行为冲突
- predator / prey
- schooling 数量不足
- 同 pair 不同 tank context
- direct pair evidence 与 generic inference 冲突
- evidence 不足必须 fail closed

核心门禁：

- 严重风险 false negative = 0（golden set）
- 相同输入 verdict deterministic = 100%
- decisive claim 100% 有 reviewed evidence
- AI explanation 不得改变 engine verdict

#### 2.5 Evidence Schema + 第一批 reviewed knowledge

主来源：

- FishBase：科学 / 生态事实
- SeriouslyFish：物种饲养、行为、群体、水参数
- Aquarium Co-Op：community tank 实操、fin nipping、群体行为
- Practical Fishkeeping：复杂 community / 慈鲷 / 领地 / 繁殖攻击补充

Evidence 与 Species Fact 分离；关键事实必须可追溯到 URL、source tier、review 状态。

第一批先做约 12 种高频物种，不追求 486 种自动全覆盖；系统质量证明后再扩到 30–50 种。

#### 2.6 Compatibility UI v2

UI 在 engine / evidence / eval 稳定后再改。

用户看到：

- 是否推荐
- 主要风险
- 当前鱼缸哪些条件触发判断
- 需要满足的条件
- 来源引用
- 可执行替代建议

AI 只负责解释 structured assessment；若与 engine verdict / reasonCode / evidence 不一致，丢弃 AI 输出并退回 deterministic template。

---

### Phase 3 — Aquarium Health / Care System

Compatibility 回答“能不能加入”；这一阶段回答“已经养了以后今天该做什么”。

建设：

- Aquarium Health Model
- Task Engine
- Recommendation Engine
- Daily care loop

目标闭环：

`建立鱼缸 -> 添加生物 -> 系统判断 -> 执行养护 -> 记录结果 -> 系统重新判断`

---

### Phase 4 — Onboarding / Golden Path

目标：

`Landing -> 创建鱼缸 -> 最少必要信息 -> 添加第一种鱼 -> 得到第一条有价值判断 -> 看到今天下一步`

First Value 不是“鱼缸创建成功”，而是 AquaGuide 第一次减少用户一个真实养鱼决策的不确定性。

采用 Progressive Profiling，不在开局要求填写完整大表单。

---

### Phase 5 — Knowledge Ops / 自动更新

流程：

`Source Monitor -> Fetch -> Extract -> Normalize -> Compare -> Conflict Detection -> Review Queue -> Publish`

AI 自动抽取只能生成 candidate evidence，不能自动标成 reviewed production truth。

Review Console：

- New Evidence
- Conflict
- Needs Review
- Approved
- Rejected

---

### Phase 6 — Product Evaluation / Analytics

四层评测：

1. Data：跨设备 / persistence
2. Logic：deterministic rule correctness
3. Product：连续 Golden Path
4. AI：grounding / contradiction

CI 方向：

`Repository contracts -> Rules -> Golden cases -> Browser Golden Path -> AI grounding eval`

优先补 GP-001 / GP-003 / GP-004 的连续浏览器路径，不继续用越来越多源码 regex 替代真实 E2E。

---

### Phase 7 — Growth / SEO / 分享 / 商业化

核心结果可靠以后再做：

- 分享 Aquarium / Compatibility Result
- 导出诊断
- SEO / 可索引物种页
- Returning loop / reminder
- Landing optimization
- Acquisition / retention experiment
- Commercialization tests

增长只能放大已证明的价值，不能放大错误。

---

## 6. 当前明确“不做”

- 不先做 486 种鱼自动全覆盖。
- 不让 LLM 自由决定 compatibility verdict。
- 不继续给 PR #34 塞新业务功能。
- 不把所有 localStorage 无差别迁到 Supabase。
- 不用“合理默认值”填充 unknown facts。
- 不为了绿 CI 跳过失败 Golden Path。
- 不在没有 workload evidence 时盲目调索引。
- 不泄露 Supabase secret / API key。

---

## 7. 下一步执行队列（由 ChatGPT 继续推进）

已完成：

1. ✅ PR #34 保持 Draft / Open。
2. ✅ 清理 one-time Product Golden Path runner。
3. ✅ rollout `care_operation_completed` Supabase enum migration。
4. ✅ 最终基础设施 Golden Path #412 全绿。

现在从这里继续：

5. 审计 / 设计 Care saved checklist partial-progress canonical model。
6. 完成剩余 PR #34 data-state sweep；只修明确账户事实问题。
7. 完成 two-device cloud acceptance。
8. 停止扩大 #34。
9. 从稳定基础切 `agent/compatibility-evidence-v2` stacked Draft branch。
10. Compatibility V1 audit + baseline。
11. Compatibility v2 contract + 10 条 Rule Spec。
12. 建 12-species / 30-case evaluation dataset。
13. Evidence Schema + 第一批主流来源 reviewed evidence。
14. Rule Engine v2 + invariants + Golden Path。
15. Shadow compare V1 / V2。
16. 再做 Compatibility Result UI 和受约束 AI explanation。
17. Compatibility 稳定后进入 Aquarium Health / Task Engine。

---

## 8. 接手原则

> **先让 AquaGuide 记得对，再让它判断对，然后让用户知道下一步做什么，最后才让更多用户进来。**

所有新改动遵守：

`Fact -> Evidence -> Deterministic Decision -> Action -> Evaluation`

而不是：

`Prompt -> LLM -> 看起来合理的答案`。

## 2026-08-17 Relocation topology convergence — checkpoint 6

- Fresh revalidation corrected a documentation timing error: commit `a28616dd...` only installed the guarded one-shot close-locator patch workflow; it was not itself the product/test locator fix.
- The one-shot run `31994975816` later succeeded and produced real fix commit `8960468085bc1bf539c57076fea33357d79e4b4d` (`Disambiguate relocation confirmation footer close`). The business footer button and browser test now use `data-close-relocation-confirmation` instead of text-only `关闭` matching.
- `PUI-BC-026` is therefore in **fix committed / browser revalidation pending** state, not regression-verified yet. A green static/type/build run is not sufficient; latest-head Care relocation Chromium acceptance must still pass.
- Convergence work remains focused on one source-scope policy: #65 `buildRelocationConfirmationEntrypoint` + canonical Care controller. #64 `buildRelocationConfirmationRequest` must not become a second independently evolving authorization/mapping path.
- The first attempt to journal this checkpoint failed before any job because the temporary workflow YAML embedded an unindented heredoc. That was a process/tooling failure, not product evidence; this corrected workflow records it rather than hiding it.
- Next gate: run latest canonical Care relocation browser Golden Path with an explicit uniqueness assertion for the business footer close locator, then use that evidence to decide `PUI-BC-025/026` closure and request-builder de-duplication.

## 2026-08-17 Relocation topology convergence — checkpoint 7

- Code-level convergence audit found #65 + canonical controller does not yet cover one #64 request-builder invariant: blank/invalid `operationId`.
- #64 rejects blank operationId before building an execution request. The current canonical controller generates an id and assumes it is valid; its regression proves stability/reuse but not fail-close when the generator returns an empty string.
- New badcase `PUI-BC-027` records this gap. #64 request-builder must not be removed until controller-level operation identity validation and regression exist.
- Required fix: validate generated operation identity synchronously at controller creation, before repository resolution/read/write; add a regression proving blank id causes zero repository resolutions, zero reads and zero mutations.
- Browser run `31995177363` is separately validating the close-locator fix on head `a515736...`; its result can close PUI-BC-026 but cannot by itself close PUI-BC-025.

## 2026-08-17 Relocation topology convergence — checkpoint 8

- Latest real Chromium run `31995177363` on head `a515736...` passed the permanent close-locator uniqueness gate, GP-REL-01/02 success flow, and GP-REL-03 stale-destination blocking.
- GP-REL-04 failed with `Escape must not dismiss uncertain dialog`: the confirmation surface was already marked `data-relocation-close-locked=true`, yet Escape detached it before canonical reconciliation. This is a distinct runtime lifecycle defect, not the earlier text-locator ambiguity.
- `PUI-BC-026` locator ambiguity is therefore regression-verified as a subproblem, while the full browser suite remains blocked by new `PUI-BC-028`.
- A guarded repair attempt (`31995381732`) proved the new blank-operation-id regression fails on the old controller and passes after adding a synchronous non-empty operation identity guard. However the same runner was stopped by TypeScript before commit because this project's `DialogContent` exposes `DialogPopupProps`, which does not accept the assumed Radix `onEscapeKeyDown` prop.
- Consequently the operation-id and uncertain-dialog product patches from that runner are **not committed**. `PUI-BC-027` has fail-before-fix + runner-only post-fix evidence but remains pending a type-correct committed implementation; `PUI-BC-028` remains open.
- Next step is to inspect the project's actual Dialog implementation / underlying UI library and fix close locking with supported lifecycle primitives, then rerun controller/static/type/build and the real Chromium GP-REL-04/05 path.

## 2026-08-17 Relocation topology convergence — checkpoint 9

- Correct UI-library contract confirmed: project dialog wrapper is `@base-ui/react/dialog` 1.4, and `DialogContent` is a `Dialog.Popup`; the failed Radix-style popup-event patch was discarded.
- PUI-BC-028 fix now uses Base UI Root semantics: `eventDetails.cancel()` cancels blocked close requests (including Escape), while `disablePointerDismissal={!canClose}` blocks outside presses. Both are driven by the existing single `canClose` predicate.
- PUI-BC-027 fix validates generated operationId synchronously before constructing the execution request; its regression first failed on the old controller and now proves zero repository resolution/read/write on blank identity.
- Controller regression, confirmation static contract, app TypeScript, API TypeScript and production build passed before commit. PUI-BC-027/028 remain browser-revalidation pending until latest-head Care relocation Chromium GP-REL-04/05 pass.

## 2026-08-17 Relocation topology convergence — checkpoint 10

- Latest Chromium run `31995724881` tested head `1cbd4f9...`. The permanent Base UI close-lock static gate passed, GP-REL-01/02 and GP-REL-03 passed again, but GP-REL-04 still failed on `Escape must not dismiss uncertain dialog`.
- This disproves the narrower hypothesis that the confirmation Dialog Root alone owned the Escape lifecycle. The child confirmation now correctly calls `eventDetails.cancel()` and sets `disablePointerDismissal={!canClose}`, yet the rendered confirmation is still removed after Escape.
- Failure screenshot falls back to the underlying Care detail surface rather than leaving the intervention/confirmation stack visible. Current leading hypothesis is multi-dialog topology: the sibling/ancestor InterventionComparisonPanel also handles the same Escape and its close callback tears down the confirmation controller/intent.
- PUI-BC-028 remains open. Next repair must lock the intervention comparison layer while a relocation confirmation is active/reconciliation-locked, using the same explicit state rather than another independent boolean guess.
- This checkpoint also starts a one-shot source audit that prints the real Care-page mount/callback context before editing, so the next patch is anchored to actual component topology.
