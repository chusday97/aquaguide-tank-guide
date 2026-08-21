# AquaGuide Handoff — Latest

更新时间：2026-08-21

## 当前工作基线

- 当前分支：`codex/interactive-parity-v3`
- 当前代码 head：`2b3dfdcda422565e4997a466c3a5bb9c929f265e`
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 栈存在历史分叉，后续必须做 semantic reconciliation，不能直接覆盖式 merge。
- 当前状态：**Surface 返修继续 / 非 release-ready / 非视觉 PASS**。
- 最新可确认 READY 的 Vercel 代码为 `cbb6eaab0eb82a8d0fcc806579f20853f24feb1c`；后续 `96cadb3` 与 `2b3dfdc` 再次遭遇 free-plan build-rate-limit。因此“部署一度恢复”不等于 latest head 已部署。

## 统一 Surface System

AquaGuide 当前只允许四类顶层 Surface：

1. **Browsing Detail**
   - Desktop：persistent right Rail。
   - 左侧页面保持可见、可滚动、可继续点击。
   - 点击另一个物种/指南时 Rail 保持打开并替换内容。
   - Mobile：约 68dvh bottom sheet。

2. **Task Flow**
   - Desktop：right Task Rail。
   - Mobile：约 82dvh high bottom sheet。
   - Desktop 不因为任务打开而锁死左侧上下文。

3. **Blocking Confirmation**
   - 删除、撤销、放弃未保存、危险动作等继续居中 Modal。
   - 允许 overlay / focus lock。

4. **Media / Fullscreen**
   - 图片、导出预览、3D 等视觉内容保持居中/全屏，但必须显式标记，不能自己维护第二套 Portal。

## 本轮新增修复

### `cbb6eaa` — Image Preview 迁入共享 Media Surface

- `ImagePreviewModal` 删除私有 `createPortal + fixed inset-0 + role=dialog` 基础设施。
- 改为共享 `Dialog surface="media"`。
- 保留深色遮罩、左右切图、缩放、关闭按钮和键盘箭头操作。
- Vercel 对该 commit 已 `READY`；这证明 build/preview 可生成，不代表人工视觉 PASS。

### `96cadb3` — 修复 nested modal body lock

发现移动端父 Task Sheet + 子 Blocking Confirmation 叠加时，旧逻辑每个 Dialog 都独立 add/remove `body.modal-open`。关闭子确认框可能错误解除仍然打开的父 Sheet body lock。

修复：

- `components/ui/dialog.tsx` 增加 `activeModalBodyLocks` 引用计数。
- 只有最后一个 modal 关闭时才移除 `modal-open`。
- 这直接覆盖 Livestock roster 等“任务 Sheet 内再次删除/放弃确认”的真实路径。

该 commit 的 Vercel status 是 build-rate-limit；不能宣称 latest preview 已验证。

### `2b3dfdc` — 增强 Surface contract

`.github/workflows/surface-system-v1.yml` 新增静态契约：

- shared Dialog 必须保留 nested body-lock 逻辑；
- Image Preview 必须使用 `surface="media"`；
- Image Preview 不允许重新出现 `createPortal`。

## Surface Inventory 当前结论

已经确认合规：

- SpeciesDetailDialog → AdaptiveDetailContent
- Care 主详情 → AdaptiveDetailContent
- Collection Care 详情 → AdaptiveDetailContent
- Livestock roster → AdaptiveTaskContent
- Collection 删除收藏 / Livestock 移出 / Compatibility 清空 / Settings 撤销分享 → Blocking Confirmation
- Export preview → Media
- Search / CollectionHub → 无私有顶层弹层

已确认残留：

1. `Identify.tsx` 未保存诊断离开确认仍手写 `fixed inset-0 + role="dialog" + aria-modal`；语义是 Blocking Confirmation，但绕开共享 Dialog。
2. `Settings.tsx` 未提交反馈离开页面仍使用原生 `window.confirm`；需要与 WorkspaceNavigation guard 一起重构。
3. `Aquarium.tsx` 仍有多处 legacy direct `DialogContent`；共享层已统一物理行为，但 Daily Check article / 换水提示等仍应后续显式标记为 Detail，而不是依赖 auto inference。
4. `Encyclopedia.tsx` 的 selectedGroup 详情仍是 legacy direct DialogContent，本质应为 Browsing Detail；主 SpeciesDetail 已经合规。

完整清单见 `SURFACE_INVENTORY_LATEST.md`。

## 当前 Badcase 状态

- PUI-BC-056 浏览详情位置/切换对象：代码修复已实现，latest-head 浏览器验证待补。
- PUI-BC-057 窄 Rail 双列挤压：代码修复已实现，latest-head 浏览器验证待补。
- PUI-BC-058 Mobile Surface 方向：代码修复已实现，latest-head 浏览器验证待补。
- PUI-BC-059 全站 Surface Inventory：**inventory_in_progress / migration_pending**；不能关闭。
- PUI-BC-060 Aquarium 3D framing：仍 investigating，用户视觉确认未完成。
- INFRA-BC-001 Vercel build-rate-limit：仍 open，且表现为间歇性；`cbb6eaa` READY 后，`96cadb3` / `2b3dfdc` 又被限频。

## 下一步执行顺序

1. 迁移 Identify 的私有离开确认到 shared Blocking Dialog。
2. 改造 Settings navigation guard，去掉产品级 `window.confirm`。
3. 对 Aquarium / Encyclopedia 的 legacy direct Dialog 做显式 Surface 分类，优先浏览文章/组详情，不盲改 460 KB 大文件。
4. 等 latest head 可部署后，跑：
   - 1440 Encyclopedia A → B 连续切换；
   - Care 连续切换；
   - Aquarium roster → Species Detail → nested confirm；
   - 1024 desktop rail 可用性；
   - 390 Detail 68dvh / Task 82dvh / nested blocking modal body lock。
5. 3D framing 单独继续视觉验收，不和弹窗 PASS 混为一谈。

## 可信边界

- GitHub commit 存在 ≠ latest Vercel 页面已部署。
- Vercel READY ≠ 人工视觉 PASS。
- 静态 Surface contract ≠ browser interaction regression。
- AI 47/47 与 UI Surface 无直接证明关系。

详见：`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`SURFACE_INVENTORY_LATEST.md`。
