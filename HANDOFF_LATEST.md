# AquaGuide Handoff — Latest

更新时间：2026-08-21 16:12 +08:00

## 当前工作基线

- 当前分支：`codex/interactive-parity-v3`
- 当前代码 head：`d6bb055efe3242c9cc54ce8e93bbcfeeafddd71d`
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 栈存在历史分叉，后续必须做 semantic reconciliation，不能直接覆盖式 merge。
- 当前状态：**Surface 收口继续 / 非 release-ready / 非视觉 PASS**。
- 最新部署证据：`a087dce` 的 Vercel preview 为 success；`d6bb055` 再次触发 free-plan build-rate-limit。因此当前准确表述是：Settings 修复 build-verified；Identify 修复 code/diff-verified 但 latest preview 未生成。

## 统一 Surface System

AquaGuide 顶层 Surface 只允许四类：

1. **Browsing Detail**：Desktop persistent right Rail；Mobile bottom sheet；底层浏览页继续可交互。
2. **Task Flow**：Desktop right Task Rail；Mobile high bottom sheet；任务拥有独立滚动。
3. **Blocking Confirmation**：删除、撤销、放弃未保存、不可逆动作使用 centered modal；允许 overlay / focus lock。
4. **Media / Fullscreen**：图片、导出预览、3D 等视觉内容；必须显式标记，不能维护第二套 Portal。

## 本轮新增修复

### `a087dce` — Settings 原生 confirm 迁入 shared Blocking Surface

- 删除未提交反馈离开页面时的 `window.confirm`。
- Navigation guard 改为 pending-path + 一次性放行 ref，避免用户确认离开后被 guard 再次拦截。
- 新增 shared `DialogContent surface="blocking"`。
- Settings 的撤销分享链接也显式标为 `surface="blocking"`。
- Vercel 对该 commit 为 success；这证明 build/preview 可生成，不代表人工视觉 PASS。

### `d6bb055` — Identify 私有离开确认迁入 shared Blocking Surface

- 删除手写 `fixed inset-0 + role="dialog" + aria-modal="true"`。
- 改为 shared `DialogContent surface="blocking"`。
- 保留 reset、history back、诊断取消、普通 route navigation 的原逻辑。
- 对 50KB+ 文件先读取完整 blob 再整文件写回，并复核 commit diff；差异仅为 shared Dialog import 与文件尾弹窗替换。
- 该 commit 的 Vercel status 为 build-rate-limit，不能宣称 latest preview 已验证。

### 之前已完成

- `cbb6eaa`：Image Preview → shared Media Surface；Vercel READY。
- `96cadb3`：nested modal body lock 引用计数修复。
- `2b3dfdc`：Surface CI 首版，锁定 media/private-portal/body-lock 契约。

## 当前 Surface Inventory

已确认合规：

- SpeciesDetailDialog / Care main detail / Collection Care detail → Browsing Detail。
- Livestock roster → Task Flow。
- Collection 删除收藏 / Livestock 删除与 dirty-close / Compatibility 清空 / Settings 撤销分享 / Settings 未提交反馈 / Identify 未保存诊断 → Blocking Confirmation。
- Export preview / Image preview → Media。
- Search / CollectionHub → 无私有顶层弹层。

已确认剩余 debt：

1. `Encyclopedia.tsx` 的 `selectedGroup` 仍是 legacy direct `DialogContent`，本质应为 Browsing Detail；当前 auto inference 会按 Task 处理。
2. `Aquarium.tsx` 多个 legacy direct `DialogContent` 仍依赖 auto inference；Daily Check article / 换水提示等浏览内容应显式 Detail，reminder/observation/recommendation 应显式 Task，删除/退出应显式 Blocking。
3. `AIAssistant.tsx` 仍有“清空聊天”原生 `confirm`，属于 legacy 用户入口 debt，优先级低于主浏览 Surface。
4. `AdminContent.tsx` 内部后台仍有多处 `window.confirm`；属于 admin debt，不影响普通用户详情 Rail，但不能算全仓 clean。

## Badcase 状态

- PUI-BC-056 浏览详情位置/切换对象：`fix_implemented_validation_pending`。
- PUI-BC-057 窄 Rail 挤压：`fix_implemented_validation_pending`。
- PUI-BC-058 Mobile Surface 方向：`fix_implemented_validation_pending`。
- PUI-BC-059 全站 Surface governance：**migration_reduced_validation_pending**；Identify/Settings 已迁，Encyclopedia/Aquarium/legacy confirm 尚未全部收口。
- PUI-BC-061 nested modal body lock：`fix_implemented_validation_pending`。
- PUI-BC-060 Aquarium 3D framing：仍 investigating；不要和 Surface PASS 混为一谈。
- INFRA-BC-001 Vercel build-rate-limit：仍 intermittent/open。

## 下一步执行顺序

1. 将 Encyclopedia `selectedGroup` 从 legacy Task inference 改为 explicit Browsing Detail，且避免在 480–600px Rail 内继续双列挤压。
2. 对 Aquarium legacy direct Dialog 做语义分类；由于文件约 460KB，只在能完整读取并严格 diff 的情况下改，不做盲目整文件重写。
3. 把 Settings / Identify 防回退写入 Surface CI：Settings 禁止重新出现 `window.confirm`，Identify 禁止重新出现 private `aria-modal`，二者必须存在 shared `surface="blocking"`。
4. latest deploy 可用后跑 1440 / 1024 / 390 browser Surface regression，包括 nested modal body lock。
5. 单独继续 Aquarium 3D framing 视觉验收。

## 可信边界

- GitHub commit 存在 ≠ latest Vercel 页面已部署。
- Vercel READY/success ≠ 人工视觉 PASS。
- 静态 Surface contract ≠ browser interaction regression。
- AI 47/47 与 UI Surface 无直接证明关系。

详见：`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`SURFACE_INVENTORY_LATEST.md`。
