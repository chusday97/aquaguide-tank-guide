# AquaGuide Progress — Latest

更新时间：2026-08-21 16:12 +08:00

## 当前结论

当前主线仍是 **全站 Surface System 收口**，不是单页弹窗位置微调。当前代码 head 为 `d6bb055efe3242c9cc54ce8e93bbcfeeafddd71d`。

状态：

- Shared Surface architecture：已建立并加固。
- Private Surface migration：主用户入口已进一步减少。
- Settings unsaved-feedback confirmation：已迁移并 build-verified。
- Identify unsaved-diagnosis confirmation：已迁移，latest preview 受 build-rate-limit 阻塞。
- Human visual acceptance：NOT PASS。
- Release readiness：NOT READY。

## 本轮完成

### 1. Settings native confirm migration

`a087dce9da01658287ad29cd40cf18c3bccbdc98`

- 移除 Settings 产品级 `window.confirm`。
- Navigation guard 改成 pending target + 一次性放行机制。
- 新增 `DialogContent surface="blocking"`。
- 撤销分享链接也显式 `surface="blocking"`。
- Vercel status：success。

### 2. Identify private modal migration

`d6bb055efe3242c9cc54ce8e93bbcfeeafddd71d`

- 删除手写 `fixed inset-0 + role="dialog" + aria-modal="true"`。
- 改为 shared `DialogContent surface="blocking"`。
- 原 reset / history back / cancel diagnosis / route navigation 行为保持。
- 整文件写入前读取完整 blob，提交后 diff 复核只包含 import + modal replacement。
- Vercel status：free-plan build-rate-limit；不能标 build-verified。

### 3. Shared Media / nested modal / CI foundation

- `cbb6eaa`：Image Preview → shared Media Surface；Vercel READY。
- `96cadb3`：nested modal body-lock reference count。
- `2b3dfdc`：Surface CI 首版。

## 当前 Surface Inventory

### 已确认合规

- SpeciesDetailDialog → Browsing Detail
- Care main detail → Browsing Detail
- Collection Care detail → Browsing Detail
- Livestock roster → Task Flow
- Collection favorite removal → Blocking Confirmation
- Livestock removal / dirty-close → Blocking Confirmation
- Compatibility clear selection → Blocking Confirmation
- Settings revoke share → Blocking Confirmation
- Settings unsaved feedback leave → Blocking Confirmation
- Identify unsaved diagnosis leave → Blocking Confirmation
- Export / image preview → Media
- Search / CollectionHub → 无私有顶层 popup

### 已确认待收口

1. Encyclopedia `selectedGroup`：legacy direct DialogContent；语义应为 Browsing Detail，当前会被 auto inference 当 Task。
2. Aquarium legacy direct DialogContent：文章/指南、任务、阻断确认仍需显式分类。
3. AIAssistant clear-chat：仍是 native `confirm`，属于 legacy 用户入口 debt。
4. AdminContent：内部后台有多处 `window.confirm`，属于 admin debt。

## 仍待 latest-head browser acceptance

- `25c7ea9`：desktop non-modal detail rail 不因底层点击自动关闭。
- `0206e3a`：desktop persistent detail rail / mobile bottom sheet。
- `a936233`：窄 Rail 内详情纵向层级。
- `6807029`：mobile Task bottom sheet / desktop task rail。
- `96cadb3`：nested modal body lock。
- `a087dce`：Settings shared blocking confirmation。
- `d6bb055`：Identify shared blocking confirmation。

这些是 implementation / build evidence，不等于人工视觉 PASS。

## Deployment / Preview

当前证据：

- `cbb6eaa`：Vercel READY。
- `a087dce`：Vercel success。
- `d6bb055`：Vercel build-rate-limit。

因此基础设施问题应继续表述为 **intermittent build-rate-limit**，不是产品编译失败。

## 下一步 P0

1. Encyclopedia selectedGroup → explicit Browsing Detail，并消除 Rail 内双列挤压。
2. Aquarium legacy Surface 显式分类；大文件只做完整读取 + 严格 diff 的安全修改。
3. Surface CI 加 Settings / Identify 防回退。
4. latest deploy 可用后跑 1440 / 1024 / 390 regression。
5. Aquarium 3D framing 单独继续视觉复核。

## Merge / release boundary

- 不合并 `main`。
- 不把 `a087dce success` 误写成 `d6bb055 success`。
- 不用 AI 47/47 证明 UI Surface PASS。
- 当前分支仍需与 RC1/#104/#105 做 semantic reconciliation。
