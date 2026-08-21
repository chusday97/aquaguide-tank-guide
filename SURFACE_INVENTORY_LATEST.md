# AquaGuide Surface Inventory — Latest

更新时间：2026-08-21

## Surface contract

AquaGuide 只允许以下四类顶层 Surface：

1. **Browsing Detail** — Desktop persistent right Rail；Mobile bottom sheet；底层浏览页面可继续交互。
2. **Task Flow** — Desktop right Task Rail；Mobile high bottom sheet；任务独立滚动。
3. **Blocking Confirmation** — centered modal；允许 overlay / focus lock；用于删除、放弃未保存、不可逆动作。
4. **Media / Fullscreen** — 图片、导出预览、3D 等视觉内容；允许居中或全屏，但必须显式标记。

未归类的 `DialogContent`、`createPortal`、`fixed inset-0`、`role="dialog"` 或浏览器原生 confirm 都视为 Surface debt。

## 已收口的共享 Surface

- `components/ui/dialog.tsx`
  - 统一 `detail / task / blocking / media / fullscreen` 语义。
  - Detail / Task 在 desktop 默认 non-modal；phone 为 modal sheet。
  - nested modal body lock 使用引用计数，避免关闭子确认框时错误解除父 Sheet 的 body lock。
- `src/components/common/AdaptiveDetailContent.tsx` — 显式 `surface="detail"`。
- `src/components/common/AdaptiveTaskContent.tsx` — 显式 `surface="task"`。
- `src/components/common/FilterBottomSheet.tsx` — 已迁入 Task Surface。
- `src/components/common/ImagePreviewModal.tsx` — `cbb6eaa` 已从私有 `createPortal` 迁入 `surface="media"`。
- `src/components/export/ExportArtifactDialog.tsx` — 显式 `surface="media"`。

## 高频入口检查结果

| Area | Current classification | State |
| --- | --- | --- |
| SpeciesDetailDialog | Browsing Detail / AdaptiveDetailContent | compliant |
| Care main detail | Browsing Detail / AdaptiveDetailContent | compliant |
| Collection Care detail | Browsing Detail / AdaptiveDetailContent | compliant |
| Livestock roster | Task / AdaptiveTaskContent | compliant |
| Livestock remove / discard changes | Blocking Confirmation | compliant |
| Compatibility clear selection | Blocking Confirmation | compliant |
| Collection remove wishlist/care favorite | Blocking Confirmation | compliant |
| Settings revoke share link | Blocking Confirmation | compliant |
| Search page | no top-level popup; routes to target | compliant |
| CollectionHub | no top-level popup/fixed overlay | compliant |
| Image preview | Media / shared Dialog | migrated; latest READY preview exists for `cbb6eaa` |

## 已确认残留

### R1 — Identify leave confirmation bypasses shared Dialog

`src/pages/Identify.tsx` 在未保存诊断离开时仍直接渲染：

- `fixed inset-0`
- `role="dialog"`
- `aria-modal="true"`

语义属于 Blocking Confirmation，但基础设施绕开共享 Dialog。必须迁移；当前不能把 PUI-BC-059 关闭。

### R2 — Settings unsaved-feedback guard uses native `window.confirm`

`src/pages/Settings.tsx` 的导航 guard 在反馈未提交时使用浏览器原生 `window.confirm`。语义属于 Blocking Confirmation，但视觉、焦点、文案布局均不受 Surface System 控制。需要和 WorkspaceNavigation guard 机制一起迁移，不能单纯 CSS 修复。

### R3 — Aquarium legacy direct DialogContent remains semantically implicit

`src/pages/Aquarium.tsx` 仍有多处直接 `DialogContent`。共享层目前会把多数 legacy surface 自动收敛为 Task Rail，并把 `showCloseButton={false}` 的不可逆确认收敛为 Blocking Modal；但以下内容仍应后续显式语义化：

- Daily Check article / 巡检文章：应为 Browsing Detail。
- Water-change guidance / 换水与囤水提示：更接近 Browsing Detail。
- reminders / observation / smart recommendation / conflict handling：Task Flow。
- delete aquarium / delete reminder / diagnosis exit：Blocking Confirmation。
- 3D tank preview：Fullscreen / Media。

`Aquarium.tsx` 约 460 KB，当前 GitHub 写入能力为整文件替换；不为了“形式统一”冒险做大文件盲改。优先通过共享层保证行为正确，再在可安全 patch 的环境中显式迁移。

### R4 — Encyclopedia group detail is legacy direct DialogContent

`src/pages/Encyclopedia.tsx` 的 `selectedGroup` 详情仍为直接 `DialogContent max-w-[920px]`；它本质是 Browsing Detail，但 auto inference 当前会按 Task 处理。主 SpeciesDetail 已合规，因此此项是次级残留，不应与主物种详情混淆。

## Infra / validation evidence

- `cbb6eaab0eb82a8d0fcc806579f20853f24feb1c`：Image Preview 迁入 shared media surface；Vercel deployment `READY`。
- `96cadb39d1560e543f6eedb596a89d757919ca84`：nested modal body-lock 修复；Vercel 因 free-plan build-rate-limit 未生成最新 preview。
- `2b3dfdcda422565e4997a466c3a5bb9c929f265e`：Surface workflow 增加 media/private-portal/body-lock 静态契约；latest Vercel 仍被 build-rate-limit 阻塞。

## PUI-BC-059 关闭条件

PUI-BC-059 当前状态：**inventory_in_progress / migration_pending**。

关闭前必须同时满足：

- Identify 私有 Blocking Modal 迁入 shared Dialog；
- Settings 原生 `window.confirm` 不再作为产品级确认 UI；
- Aquarium / Encyclopedia 的语义性 legacy Surface 至少完成显式分类或有自动化 allowlist；
- 全仓扫描不存在未知 private modal / drawer / sheet；
- latest head 有可运行 build；
- 1440 / 1024 / 390 至少完成一轮浏览器 Surface 回归。
