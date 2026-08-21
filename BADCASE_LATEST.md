# AquaGuide Badcase — Latest

更新时间：2026-08-21

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
- **Fix**：`a936233` 将 Rail 内首屏和正文收敛为纵向信息层级并独立滚动。
- **仍需证据**：latest head 下中文长名称、风险区、CTA、底部内容均可读可达。

## PUI-BC-058 — Mobile Surface 方向和高度不一致

- **Severity**：P1 / High
- **Feature**：`mobile_surface_system`
- **Status**：`fix_implemented_validation_pending`
- **Fix**：Detail 约 68dvh bottom sheet；Task 约 82dvh bottom sheet；Blocking Confirmation 继续居中。
- **仍需证据**：390px 实际浏览器验收，无左滑旧结构、横向溢出或正文截断。

## PUI-BC-059 — 全站 Surface Inventory / private popup debt

- **Severity**：P0 / High
- **Feature**：`global_surface_governance`
- **Status**：`inventory_in_progress_migration_pending`

### 已修复

- `FilterBottomSheet` 已迁入 shared Task Surface。
- `cbb6eaa`：`ImagePreviewModal` 从私有 `createPortal` 迁入 shared `surface="media"`。
- `96cadb3`：修复 mobile parent Task Sheet + nested Blocking Confirmation 的 body-lock 引用计数问题，避免子 modal 关闭后错误解锁父 Sheet。
- `2b3dfdc`：Surface workflow 增加 media/private-portal/nested-body-lock 静态契约。

### 已确认残留

1. **Identify private leave confirmation**
   - `src/pages/Identify.tsx` 仍手写 `fixed inset-0 + role="dialog" + aria-modal="true"`。
   - 语义应为 Blocking Confirmation，但绕开 shared Dialog。

2. **Settings native browser confirm**
   - 未提交反馈离开页面使用 `window.confirm`。
   - 语义应为 Blocking Confirmation，但视觉/焦点/布局完全不可控。

3. **Aquarium legacy direct DialogContent**
   - 多数已被 shared auto inference 收敛为 Task / Blocking / Fullscreen 的正确物理位置。
   - Daily Check article、换水提示等浏览内容仍需显式标为 Detail；不能长期依赖 auto inference。

4. **Encyclopedia selectedGroup**
   - 仍为 legacy direct DialogContent；本质应为 Browsing Detail。
   - 主 SpeciesDetailDialog 已合规，不要把两者混为同一问题。

### 关闭条件

- Identify 私有 modal 完成迁移。
- Settings 产品级 `window.confirm` 移除。
- Aquarium / Encyclopedia legacy Surface 完成显式分类或受明确自动化 allowlist 管理。
- 全仓无未知 private modal/drawer/sheet。
- latest head build 可运行。
- 1440 / 1024 / 390 浏览器 Surface 回归通过。

完整 inventory：`SURFACE_INVENTORY_LATEST.md`。

## PUI-BC-061 — Nested modal body lock 可被子确认框提前解除

- **Severity**：P1 / High
- **Feature**：`nested_modal_lock`
- **Status**：`fix_implemented_validation_pending`
- **真实路径**：Mobile Task Sheet（例如 Livestock roster）仍打开时，再打开删除/放弃确认；关闭子确认框后父 Sheet 仍在。
- **根因**：旧 shared Dialog 每个 modal 独立 `add modal-open` / cleanup `remove modal-open`，没有嵌套计数。
- **Fix**：`96cadb39d1560e543f6eedb596a89d757919ca84` 引入 `activeModalBodyLocks` 引用计数；最后一个 modal 关闭时才解除 body lock。
- **验证边界**：代码已修；该 commit Vercel 因 build-rate-limit 没有 latest preview，因此不能标 `regression_verified`。

## PUI-BC-060 — Aquarium 3D framing 在不同 viewport 下视觉尺寸不稳定

- **Severity**：P0 / High
- **Feature**：`aquarium_3d_stage`
- **Status**：`investigating`
- `3a6bb9a` 已收敛 CSS 二次 zoom 与舞台高度，但用户视觉确认尚未完成。
- **验收**：1440 / 1280 / 1024 / 768 / 390 下主舞台感、鱼可读性与玻璃框比例都稳定。

## INFRA-BC-001 — Vercel build-rate-limit 间歇阻塞 latest UI validation

- **Type**：Infrastructure / Acceptance blocker
- **Status**：`open_intermittent`
- `cbb6eaa` 已成功获得 READY deployment，说明限频曾解除。
- 随后 `96cadb3`、`2b3dfdc` 又返回 free-plan build-rate-limit。
- 因此不能写“Vercel 已恢复”或“latest head 构建失败”；准确结论是 **最新 head 的 preview 仍被间歇性限频阻塞**。

## AI Badcase 边界

最近既有 AI/规则评测仍为 deterministic 37/37、mocked provider 10/10、总计 47/47；`evaluation/badcases/registry.jsonl` 0 条。它不证明以上 UI Badcase 已关闭。

## 关闭原则

- `fix_implemented` ≠ `regression_verified`。
- GitHub commit ≠ latest deployment。
- Vercel READY ≠ 人工视觉验收。
- 静态契约 ≠ browser interaction acceptance。
