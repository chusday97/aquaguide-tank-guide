# AquaGuide Surface Inventory — Latest

更新时间：2026-08-21 16:12 +08:00

## Surface contract

AquaGuide 只允许以下四类顶层 Surface：

1. **Browsing Detail** — Desktop persistent right Rail；Mobile bottom sheet；底层浏览页面可继续交互。
2. **Task Flow** — Desktop right Task Rail；Mobile high bottom sheet；任务独立滚动。
3. **Blocking Confirmation** — centered modal；允许 overlay / focus lock；用于删除、放弃未保存、不可逆动作。
4. **Media / Fullscreen** — 图片、导出预览、3D 等视觉内容；允许居中或全屏，但必须显式标记。

未归类的 `DialogContent`、私有 modal Portal、`fixed inset-0` + dialog semantics、产品级 native confirm 都视为 Surface debt；普通布局 Portal（例如把过滤面板挂到页面内 host）不等同于 private modal。

## 已收口的共享 Surface

- `components/ui/dialog.tsx`
  - 统一 `detail / task / blocking / media / fullscreen` 语义。
  - Detail / Task 在 desktop 默认 non-modal；phone 为 modal sheet。
  - nested modal body lock 使用引用计数。
- `src/components/common/AdaptiveDetailContent.tsx` — explicit `surface="detail"`。
- `src/components/common/AdaptiveTaskContent.tsx` — explicit `surface="task"`。
- `src/components/common/FilterBottomSheet.tsx` — Task Surface。
- `src/components/common/ImagePreviewModal.tsx` — `cbb6eaa` 已迁入 `surface="media"`。
- `src/components/export/ExportArtifactDialog.tsx` — Media。

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
| Settings unsaved feedback leave | Blocking Confirmation | migrated `a087dce`; build-verified |
| Identify unsaved diagnosis leave | Blocking Confirmation | migrated `d6bb055`; latest preview blocked by rate limit |
| Search page | no top-level popup; routes to target | compliant |
| CollectionHub | no top-level popup/fixed overlay | compliant |
| Image preview | Media / shared Dialog | migrated; READY evidence at `cbb6eaa` |

## 已确认残留

### R1 — Encyclopedia selectedGroup is still legacy direct DialogContent

`src/pages/Encyclopedia.tsx` 的 `selectedGroup` 仍为：

- direct `DialogContent`
- `max-w-[920px]`
- 内部 `md:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)]`

它本质是 **Browsing Detail**，但 auto inference 当前会按 Task 处理。不能只加 `surface="detail"` 就结束：480–600px Detail Rail 内若保留双列，内容会再次被挤压。迁移必须同时把 group detail 收敛为窄 Rail 的纵向布局。

### R2 — Aquarium legacy direct DialogContent remains semantically implicit

`src/pages/Aquarium.tsx` 仍有多处 direct `DialogContent`。共享层已统一大部分物理行为，但长期不能依赖 auto inference：

- Daily Check article / 巡检文章 → Browsing Detail
- Water-change guidance / 换水与囤水提示 → Browsing Detail
- reminders / observation / smart recommendation / conflict handling → Task Flow
- delete aquarium / delete reminder / diagnosis exit → Blocking Confirmation
- 3D tank preview → Fullscreen / Media

该文件约 460KB；只在完整读取、可严格复核 diff 的情况下迁移，不做盲目整文件写入。

### R3 — AIAssistant clear-chat native confirm

`src/pages/AIAssistant.tsx` 清空本地 AI 对话仍使用 native `confirm`。语义为 Blocking Confirmation。它是 legacy 用户入口 debt，优先级低于 Encyclopedia/Aquarium 主浏览路径，但不能忽略。

### R4 — AdminContent native confirms

`src/pages/AdminContent.tsx` 在切换内容、新建、返回、切换栏目时仍使用 `window.confirm`。属于内部后台 Blocking Confirmation debt。它不影响普通用户详情 Rail，但全仓 governance 关闭前需要迁移或明确 admin allowlist。

### 已迁移，不再作为残留

- Identify 未保存诊断确认：`d6bb055` 已从 private fixed/aria-modal → shared Blocking Dialog。
- Settings 未提交反馈确认：`a087dce` 已从 `window.confirm` → shared Blocking Dialog，并保留 navigation guard 的一次性放行逻辑。

## Infra / validation evidence

- `cbb6eaab0eb82a8d0fcc806579f20853f24feb1c`：Image Preview → shared media；Vercel READY。
- `96cadb39d1560e543f6eedb596a89d757919ca84`：nested modal body lock 修复。
- `2b3dfdcda422565e4997a466c3a5bb9c929f265e`：Surface CI 首版。
- `a087dce9da01658287ad29cd40cf18c3bccbdc98`：Settings Blocking migration；Vercel success。
- `d6bb055efe3242c9cc54ce8e93bbcfeeafddd71d`：Identify Blocking migration；Vercel build-rate-limit。

## PUI-BC-059 关闭条件

PUI-BC-059 当前状态：**migration_reduced_validation_pending**。

关闭前必须同时满足：

- Encyclopedia selectedGroup explicit Browsing Detail + Rail 内布局适配；
- Aquarium semantic legacy Surface 显式分类或建立严格 allowlist；
- legacy 用户端 native confirm 清理或 allowlist；
- 全仓扫描不存在未知 private modal / drawer / sheet；
- latest head 有可运行 build；
- 1440 / 1024 / 390 至少完成一轮浏览器 Surface 回归。
