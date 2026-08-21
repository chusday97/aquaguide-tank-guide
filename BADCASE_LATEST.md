# AquaGuide Badcase — Latest

更新时间：2026-08-21 16:12 +08:00

> 本文件记录产品/UI/交互 Badcase。`evaluation/badcases/registry.jsonl` 只记录真实 AI/规则评测失败；UI Surface 问题不能混入 AI registry。

## PUI-BC-056 — 浏览详情 Surface 不统一且切换对象会自动消失

- **Severity**：P0 / High
- **Feature**：`detail_surface_system`
- **Status**：`fix_implemented_validation_pending`
- **Fix**：
  - `25c7ea9`：non-modal detail rail 不因 background interaction 自动关闭。
  - `0206e3a`：Desktop 浏览详情统一 persistent right Rail；Mobile bottom sheet。
  - `a936233`：移除旧 split-workspace 强制布局。
- **仍需证据**：latest head 1440 / 1024 / 390 browser regression。

## PUI-BC-057 — 右侧物种详情在窄 Rail 内被桌面双列布局挤压

- **Severity**：P0 / High
- **Feature**：`species_detail`
- **Status**：`fix_implemented_validation_pending`
- **Fix**：`a936233` 将主 Species Detail 在 Rail 内收敛为纵向信息层级并独立滚动。
- **剩余相关 debt**：Encyclopedia `selectedGroup` 仍保留 legacy 双列结构，迁入 Detail Rail 时必须同步改成单列/窄 Rail 适配。
- **仍需证据**：latest head 下中文长名称、风险区、CTA、底部内容均可读可达。

## PUI-BC-058 — Mobile Surface 方向和高度不一致

- **Severity**：P1 / High
- **Feature**：`mobile_surface_system`
- **Status**：`fix_implemented_validation_pending`
- **Fix**：Detail 约 68dvh bottom sheet；Task 约 82dvh bottom sheet；Blocking Confirmation 居中。
- **仍需证据**：390px 实际浏览器验收，无左滑旧结构、横向溢出或正文截断。

## PUI-BC-059 — 全站 Surface Inventory / private popup debt

- **Severity**：P0 / High
- **Feature**：`global_surface_governance`
- **Status**：`migration_reduced_validation_pending`

### 已修复

- `FilterBottomSheet` → shared Task Surface。
- `cbb6eaa`：`ImagePreviewModal` 从私有 `createPortal` → shared `surface="media"`。
- `96cadb3`：nested modal body-lock 引用计数。
- `2b3dfdc`：Surface workflow 首版。
- `a087dce`：Settings 未提交反馈离开确认从 `window.confirm` → shared `surface="blocking"`；Vercel success。
- `d6bb055`：Identify 未保存诊断离开确认从私有 `fixed/aria-modal` → shared `surface="blocking"`；diff 已复核，Vercel 因 build-rate-limit 未生成 latest preview。

### 已确认残留

1. **Encyclopedia selectedGroup**
   - `src/pages/Encyclopedia.tsx` 仍为 legacy direct `DialogContent max-w-[920px]`。
   - 本质是 Browsing Detail，auto inference 当前按 Task 处理。
   - 内部仍有 desktop 双列内容；直接切为窄 Rail 会造成压缩，必须和布局一起改。

2. **Aquarium legacy direct DialogContent**
   - 多数已被 shared auto inference 统一到 Task / Blocking / Fullscreen 的物理位置。
   - Daily Check article、换水提示等浏览内容仍应显式 Detail；reminder / observation / smart recommendation 等应显式 Task；删除/退出应显式 Blocking。
   - 文件约 460KB，不做盲目整文件重写。

3. **AIAssistant native confirm**
   - 清空 AI 助手历史仍使用 `confirm`。
   - 属于 legacy 用户入口 Surface debt，优先级低于 Encyclopedia/Aquarium 主路径。

4. **AdminContent native confirms**
   - 内部后台的切换内容、新建、离开、切换栏目仍有 `window.confirm`。
   - 属于 admin debt；不影响普通用户详情 Rail，但意味着“全仓无 native confirm”尚未成立。

### 关闭条件

- Encyclopedia selectedGroup 显式归类为 Browsing Detail，并完成 Rail 内布局适配。
- Aquarium legacy Surface 完成显式分类或受明确自动化 allowlist 管理。
- 用户端 legacy native confirm 清理或明确 allowlist。
- 全仓无未知 private modal/drawer/sheet。
- latest head build 可运行。
- 1440 / 1024 / 390 浏览器 Surface 回归通过。

完整 inventory：`SURFACE_INVENTORY_LATEST.md`。

## PUI-BC-061 — Nested modal body lock 可被子确认框提前解除

- **Severity**：P1 / High
- **Feature**：`nested_modal_lock`
- **Status**：`fix_implemented_validation_pending`
- **真实路径**：Mobile Task Sheet（例如 Livestock roster）仍打开时，再打开删除/放弃确认；关闭子确认框后父 Sheet 仍在。
- **Fix**：`96cadb39d1560e543f6eedb596a89d757919ca84` 引入 `activeModalBodyLocks` 引用计数；最后一个 modal 关闭时才解除 body lock。
- **验证边界**：代码已修；仍缺 latest browser regression。

## PUI-BC-060 — Aquarium 3D framing 在不同 viewport 下视觉尺寸不稳定

- **Severity**：P0 / High
- **Feature**：`aquarium_3d_stage`
- **Status**：`investigating`
- `3a6bb9a` 已收敛 CSS 二次 zoom 与舞台高度，但用户视觉确认尚未完成。
- **验收**：1440 / 1280 / 1024 / 768 / 390 下主舞台感、鱼可读性与玻璃框比例都稳定。

## INFRA-BC-001 — Vercel build-rate-limit 间歇阻塞 latest UI validation

- **Type**：Infrastructure / Acceptance blocker
- **Status**：`open_intermittent`
- `cbb6eaa` 有 READY deployment。
- `a087dce` 有 success deployment。
- `d6bb055` 再次返回 free-plan build-rate-limit。
- 因此准确结论是 **限频间歇出现**；它不是产品编译失败证明，也不是已解决。

## AI Badcase 边界

最近既有 AI/规则评测仍为 deterministic 37/37、mocked provider 10/10、总计 47/47；`evaluation/badcases/registry.jsonl` 0 条。它不证明以上 UI Badcase 已关闭。

## 关闭原则

- `fix_implemented` ≠ `regression_verified`。
- GitHub commit ≠ latest deployment。
- Vercel READY/success ≠ 人工视觉验收。
- 静态契约 ≠ browser interaction acceptance。
