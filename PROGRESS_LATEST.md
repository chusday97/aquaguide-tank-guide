# AquaGuide Progress — Latest

更新时间：2026-08-21

## 当前结论

当前工作主线仍是 **全站 Surface System 收口**，不是单页弹窗位置微调。当前 head 为 `2b3dfdcda422565e4997a466c3a5bb9c929f265e`。

状态：

- Shared Surface architecture：已建立并继续加固。
- Private Surface migration：进行中。
- Latest-head Vercel preview：受 build-rate-limit 阻塞。
- Human visual acceptance：NOT PASS。
- Release readiness：NOT READY。

## 本轮完成

### 1. Shared Media Surface

`cbb6eaab0eb82a8d0fcc806579f20853f24feb1c`

- `ImagePreviewModal` 从私有 `createPortal` 迁入共享 `Dialog surface="media"`。
- 保留媒体预览必要的深色 overlay、缩放、前后切换和显式关闭。
- Vercel deployment 对该 commit 为 `READY`。

### 2. Nested modal body-lock repair

`96cadb39d1560e543f6eedb596a89d757919ca84`

- 修复移动端 Task Sheet 内再开 Blocking Confirmation 时 body lock 可能被子 modal 提前解除的问题。
- 共享 Dialog 使用引用计数管理 `body.modal-open`。
- 该路径对 Livestock roster 等嵌套任务/删除确认尤其重要。

### 3. Surface CI contract strengthened

`2b3dfdcda422565e4997a466c3a5bb9c929f265e`

- Workflow 强制 shared Dialog 保留 nested body-lock。
- Image Preview 必须显式 `surface="media"`。
- Image Preview 禁止重新引入 `createPortal`。

## Surface Inventory V1

### 已确认合规

- SpeciesDetailDialog → Browsing Detail
- Care main detail → Browsing Detail
- Collection Care detail → Browsing Detail
- Livestock roster → Task Flow
- Collection favorite removal → Blocking Confirmation
- Livestock removal / dirty-close → Blocking Confirmation
- Compatibility clear → Blocking Confirmation
- Settings share revoke → Blocking Confirmation
- Export preview / Image preview → Media
- Search / CollectionHub → 无私有顶层弹层

### 已确认待迁移

1. Identify unsaved diagnosis leave confirm：手写 fixed/aria-modal。
2. Settings unsaved feedback guard：浏览器原生 `window.confirm`。
3. Aquarium legacy direct DialogContent：物理布局多数已由 shared auto 统一，但文章/指南等语义仍隐式。
4. Encyclopedia selectedGroup：legacy direct DialogContent，本质应为 Browsing Detail。

详见 `SURFACE_INVENTORY_LATEST.md`。

## 之前已实现、仍待 latest-head browser acceptance

- `25c7ea9`：desktop non-modal detail rail 不因底层点击自动关闭。
- `0206e3a`：desktop detail persistent right rail / mobile bottom sheet。
- `a936233`：窄 Rail 内详情改纵向层级，移除旧 split-workspace 强制布局。
- `6807029`：mobile Task Flow 统一 bottom sheet，desktop task 统一 right rail。

这些是 code-level implementation；不能因为存在 commit 就标视觉回归 PASS。

## Deployment / Preview

当前证据：

- `cbb6eaa`：Vercel READY。
- `96cadb3`：Vercel build-rate-limit。
- `2b3dfdc`：Vercel build-rate-limit。

因此基础设施问题应表述为 **intermittent build-rate-limit**。它不是编译失败证明，也不是已解决。

## 下一步 P0

1. Identify 私有 Blocking Modal → shared Dialog。
2. Settings `window.confirm` → 可控 Blocking Confirmation。
3. Aquarium / Encyclopedia legacy Surface 显式分类。
4. latest deploy 可用后跑 1440 / 1024 / 390 Surface regression。
5. 单独继续 Aquarium 3D framing 视觉复核。

## Merge / release boundary

- 不合并 `main`。
- 不把 `cbb6eaa READY` 误写成 `2b3dfdc READY`。
- 不用 AI 47/47 证明 UI Surface PASS。
- 当前分支仍需与 RC1/#104/#105 做 semantic reconciliation。
