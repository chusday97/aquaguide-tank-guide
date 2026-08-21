# AquaGuide Surface Inventory — Latest

更新时间：2026-08-21 16:12 +08:00

## Surface contract

AquaGuide 只允许以下四类顶层 Surface：

1. **Browsing Detail** — Desktop persistent right Rail；Mobile 约 68dvh bottom sheet；desktop 底层页面可继续交互。
2. **Task Flow** — Desktop right Task Rail；Mobile 约 82dvh high bottom sheet；任务独立滚动。
3. **Blocking Confirmation** — centered modal；允许 overlay / focus lock；用于删除、放弃未保存、不可逆动作。
4. **Media / Fullscreen** — 图片、导出预览、3D 等视觉内容；允许居中或全屏，但必须显式标记或进入严格 legacy allowlist。

未归类的 direct `DialogContent`、private modal Portal、`fixed inset-0` + dialog semantics、产品级 native confirm 都视为 Surface debt。普通布局 Portal（例如把过滤面板挂到页面内 host）不等同于 private modal。

## 已收口的共享 Surface

- `components/ui/dialog.tsx`
  - `detail / task / blocking / media / fullscreen`。
  - desktop Detail/Task 默认 non-modal；phone 为 modal sheet。
  - nested modal body lock reference count。
  - `c603159` 新增严格 legacy Encyclopedia group signature → Detail bridge。
- `AdaptiveDetailContent.tsx` → explicit Detail。
- `AdaptiveTaskContent.tsx` → explicit Task。
- `FilterBottomSheet.tsx` → Task。
- `ImagePreviewModal.tsx` → Media。
- `ExportArtifactDialog.tsx` → Media。

## 高频入口检查结果

| Area | Current classification | State |
| --- | --- | --- |
| SpeciesDetailDialog | Browsing Detail | compliant |
| Care main detail | Browsing Detail | compliant |
| Collection Care detail | Browsing Detail | compliant |
| Encyclopedia species-group | Browsing Detail via strict legacy bridge | code/diff-verified; browser pending |
| Livestock roster | Task | compliant |
| Livestock remove / discard changes | Blocking | compliant |
| Compatibility clear selection | Blocking | compliant |
| Collection remove favorite | Blocking | compliant |
| Settings revoke share | Blocking | compliant |
| Settings unsaved feedback leave | Blocking | migrated `a087dce`; build-verified |
| Identify unsaved diagnosis leave | Blocking | migrated `d6bb055`; browser pending |
| AIAssistant clear history | Blocking | migrated `da195046`; browser pending |
| Search | no top-level popup | compliant |
| CollectionHub | no top-level popup | compliant |
| Image / export preview | Media | compliant |

## Encyclopedia legacy bridge

`src/pages/Encyclopedia.tsx` 暂不整文件重写。`c603159` 在 shared layer 对唯一已知 species-group signature：

- `max-w-[920px]`
- `rounded-[24px]`

判定为 Browsing Detail。并在 CSS 中对 `[data-dialog-surface="detail"]:not([data-detail-viewport])` 做：

- desktop 480–600px right rail；
- mobile 68dvh bottom sheet；
- `modalBody` 独立滚动；
- `modalBody > .grid` 强制单列，覆盖旧 desktop 双列。

这是明确 allowlist，不是泛化“所有 920px dialog 都变 detail”的长期设计。页面未来可安全 patch 时，应改成 explicit `AdaptiveDetailContent` / `surface="detail"` 后删除该 legacy signature。

## 已确认 residual

### R1 — Aquarium legacy direct DialogContent

`src/pages/Aquarium.tsx` 仍有多处 direct DialogContent：

- Daily Check article / 巡检文章 → Detail
- Water-change guidance / 换水与囤水提示 → Detail
- reminders / observation / smart recommendation / conflict handling → Task
- delete aquarium / delete reminder / diagnosis exit → Blocking
- 3D preview → Fullscreen / Media

该文件约 460KB；只在完整读取、严格 diff 或小组件/shared-layer bridge 条件下修改。

### R2 — AdminContent native confirms

`src/pages/AdminContent.tsx` 的切换内容、新建、返回、切换栏目仍使用 `window.confirm`。属于 admin debt / P2，不影响普通用户详情 Rail。

### R3 — Final unknown-surface scan + browser acceptance

已知主用户入口大部分已经分类，但尚未完成全仓最终扫描，也没有 latest-head 1440/1024/390 browser regression，因此不能关闭治理 badcase。

## Infra / validation evidence

- `cbb6eaa`：Image Preview → Media；Vercel READY。
- `a087dce`：Settings Blocking migration；Vercel success。
- `d6bb055`：Identify Blocking migration；Vercel build-rate-limit。
- `da195046`：AIAssistant Blocking migration；Vercel build-rate-limit。
- `c603159`：Encyclopedia group Detail bridge；Vercel build-rate-limit。

## PUI-BC-059 关闭条件

当前：**migration_reduced_validation_pending**。

关闭前必须：

- Aquarium semantic legacy Surface 收口或进入严格 allowlist；
- 完成全仓未知 private Surface 扫描；
- latest head 有可运行 build；
- 1440 / 1024 / 390 browser Surface regression 通过。

AdminContent 可作为 admin governance 单独关闭，不应阻塞当前用户 3D 舞台 P0 的继续修复。
