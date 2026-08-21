# AquaGuide Badcase — Latest

更新时间：2026-08-21 15:06 +08:00

> 本文件记录 **产品/UI/交互 Badcase**。`evaluation/badcases/registry.jsonl` 仍只记录真实 AI/规则评测失败，不能把 UI 问题混入 AI registry。

## PUI-BC-056 — 浏览详情 Surface 不统一且切换对象会自动消失

- **Severity**：P0 / High
- **Feature**：`detail_surface_system`
- **Status**：`fix_implemented_validation_pending`
- **真实表现**：
  - 同一产品内详情有时在左、有时在右、有时是页面内双栏、有时是居中 Dialog。
  - 用户打开物种详情后，在左侧点另一个物种，右侧详情会消失，而不是保持展开并替换内容。
  - 底层浏览与详情不能稳定并行使用。
- **根因**：
  1. 旧实现同时存在 inline split-workspace、Portal Dialog、desktop side panel、mobile sheet 多套范式。
  2. Base UI `modal=false` 并不等于“永不因 outside interaction 关闭”；底层点击仍触发 dismissal。
  3. 页面把“浏览详情”和“阻断弹窗”混为同一种 Dialog 行为。
- **Fix**：
  - `25c7ea9`：非模态 Dialog 默认 `disablePointerDismissal`，底层点击不再关闭浏览 Rail。
  - `0206e3a`：Desktop 浏览详情统一为 persistent right Rail；Mobile 为 bottom sheet。
  - `a936233`：删除旧 split-workspace 强制布局。
- **验收条件**：
  - 1440px 图鉴打开 A，点击左侧 B，Rail 保持展开且内容变为 B。
  - 左侧场景/列表可继续滚动与点击；无 Overlay、无 body lock。
  - X/Esc 明确关闭后才恢复无 Rail 状态。
  - Encyclopedia、Care、Aquarium roster 至少三种入口一致。
- **当前证据边界**：代码已实现；最新完整 Vercel 预览未生成，因此不能标 `regression_verified`。

## PUI-BC-057 — 右侧物种详情在窄 Rail 内被桌面双列布局严重挤压

- **Severity**：P0 / High
- **Feature**：`species_detail`
- **Status**：`fix_implemented_validation_pending`
- **真实表现**：图片、物种名、喂养速览、适配风险与 CTA 被横向压成狭窄列，长标题和说明难以阅读。
- **根因**：详情内部使用浏览器 viewport media query；即使 Rail 只有约 500–600px，1440px 浏览器仍触发 desktop 双列布局。
- **Fix**：`a936233`
  - Rail 内首屏强制单列纵向信息层级。
  - Hero 图片高度收敛为约 190–250px。
  - 详情正文内部滚动，关闭区 sticky。
  - 旧 50/50 workspace CSS 不再控制右侧详情。
- **验收条件**：
  - 1440/1280/1024 下 Rail 不出现文本挤压、CTA 截断、图片异常留白。
  - 中文长物种名、科学名、风险判断都能完整阅读。
  - 详情底部可通过内部滚动到达，不露出异常页面底色。

## PUI-BC-058 — Mobile Surface 方向和高度不一致

- **Severity**：P1 / High
- **Feature**：`mobile_surface_system`
- **Status**：`fix_implemented_validation_pending`
- **真实表现**：部分详情从底部出现，部分任务却从左侧/整屏进入，用户无法形成稳定空间模型。
- **根因**：`AdaptiveDetailContent` 与 `AdaptiveTaskContent` 使用不同的手机定位规则。
- **Fix**：
  - Browsing Detail：约 68dvh bottom sheet。
  - Task Flow：`6807029` 改为约 82dvh bottom sheet。
  - Blocking Confirmation 仍使用居中确认，不强制伪装成 bottom sheet。
- **验收条件**：390px iPhone UA 下详情与任务都由底部进入；无左侧滑入、无横向溢出、正文可内部滚动。

## PUI-BC-059 — 全站 Dialog/Sheet/Rail 仍缺完整 Surface Inventory

- **Severity**：P0 / High
- **Feature**：`global_surface_governance`
- **Status**：`investigating`
- **问题**：用户明确反馈“所有弹窗分布都很严重”。当前已修共享组件，但仓库仍可能存在直接使用 `DialogContent` 或自定义 fixed layer 的页面，尚未全部逐个归类和实际浏览器验证。
- **要求**：所有 Surface 必须被归入且只能归入：
  1. Browsing Detail → desktop right Rail / mobile bottom sheet；
  2. Task Flow → desktop right Task Rail / mobile high bottom sheet；
  3. Blocking Confirmation → centered modal。
- **验收条件**：完成全仓 Surface inventory；任何未分类的 fixed/portal 弹层都算未关闭。

## PUI-BC-060 — Aquarium 3D framing 在不同 viewport 下视觉尺寸不稳定

- **Severity**：P0 / High
- **Feature**：`aquarium_3d_stage`
- **Status**：`investigating`
- **真实表现**：此前一版初始鱼缸过大、玻璃框变成巨大淡色背景；缩小窗口后又容易变得太小、鱼不可读。
- **根因**：ThreeAquarium `stage-cover` 相机 framing 与 CSS canvas zoom 曾叠加，产生双重放大；单纯固定 zoom 也无法覆盖所有宽高比。
- **Fix 已尝试**：`3a6bb9a` 收敛 CSS 二次 zoom 并降低舞台最大高度。
- **当前判断**：用户尚未确认视觉结果，因此此项不能关闭。
- **验收条件**：1440/1280/1024/768/390 下鱼缸均保持主舞台感、鱼清晰可见、无巨大空玻璃框，也不缩成中间小模型。

## INFRA-BC-001 — Vercel build-rate-limit 导致最新 UI 无法及时视觉验证

- **Type**：Infrastructure / Acceptance blocker
- **Status**：`open`
- `25c7ea9` 已有 READY preview；后续 `0206e3a`、`a936233`、`6807029` 在同步时被 Vercel free-plan build-rate-limit 拦截。
- 该问题不代表代码构建失败，但会阻止用户验证最终 UI，因此不能跳过验收直接标 PASS。

## AI Badcase 边界

最近一次 AI/规则评测仍为：deterministic 37/37、mocked provider 10/10、总计 47/47；`evaluation/badcases/registry.jsonl` 为 0 条。以上 PUI/INFRA badcase 不写入 AI registry。

## 关闭原则

- `fix_implemented` ≠ `regression_verified`。
- GitHub commit 存在 ≠ Vercel 最新页面已部署。
- Vercel READY ≠ 人工视觉验收通过。
- 只有满足对应验收条件并有最新 head 的浏览器证据后，PUI-BC-056/057/058/059/060 才能进入关闭流程。
