# AquaGuide Handoff — Latest

更新时间：2026-08-21 16:12 +08:00

## 当前工作基线

- 当前分支：`codex/interactive-parity-v3`
- 当前产品代码 head：`c603159b4dc5dd4a1a61a2ad019022a103782487`
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 栈存在历史分叉，后续必须做 semantic reconciliation，不能直接覆盖式 merge。
- 当前状态：**Surface 收口继续 / 非 release-ready / 非视觉 PASS**。
- Vercel：`a087dce` 曾 success；`d6bb055`、`da195046`、`c603159` 均再次遇到 free-plan build-rate-limit。准确结论仍是 intermittent rate limit，而不是产品编译失败。

## 统一 Surface System

AquaGuide 顶层 Surface 只允许四类：

1. **Browsing Detail**：Desktop persistent right Rail；Mobile 约 68dvh bottom sheet；桌面底层浏览页继续可交互。
2. **Task Flow**：Desktop right Task Rail；Mobile 约 82dvh high bottom sheet；任务独立滚动。
3. **Blocking Confirmation**：删除、撤销、放弃未保存、不可逆动作使用 centered modal；允许 overlay / focus lock。
4. **Media / Fullscreen**：图片、导出预览、3D 等视觉内容；必须显式或受严格 allowlist 管理，不能另建私有 modal 基础设施。

## 本轮新增修复

### `da195046` — AI 助手清空历史迁入 shared Blocking Surface

- 删除 `AIAssistant.tsx` 清空本地历史时的 native `confirm(...)`。
- 新增 `clearChatPending`，确认后才清空 state 与 localStorage。
- 改为 `DialogContent surface="blocking"`。
- AI 请求、上下文历史、收藏逻辑未修改；commit diff 已复核。
- Vercel：build-rate-limit，因此仅 code/diff-verified。

### `c603159` — Encyclopedia species-group 从 legacy Task 纠正为 Browsing Detail

为避免通过 GitHub contents API 整写大型 `Encyclopedia.tsx`，本轮使用严格 legacy signature bridge：

- Shared `inferSurface` 仅对 `max-w-[920px] + rounded-[24px]` 的已知 species-group dialog 判定为 `detail`。
- Desktop：persistent right rail；non-modal；底层图鉴继续可交互。
- Mobile：约 68dvh bottom sheet。
- Shared CSS 对这类 direct legacy Detail：
  - 固定 rail/sheet geometry；
  - `modalBody` 独立滚动；
  - 将原 `md:grid-cols-[...2列...]` 强制收敛为单列，避免 480–600px Rail 再次发生横向挤压。
- 未改 Encyclopedia 的物种数据、收藏、混养计算、路由或 group 业务逻辑。
- Vercel：build-rate-limit，因此仅 code/diff-verified。

### 此前本轮已完成

- `a087dce`：Settings 未提交反馈 `window.confirm` → shared Blocking；Vercel success。
- `d6bb055`：Identify 私有 fixed/aria-modal → shared Blocking。
- `cbb6eaa`：Image Preview → shared Media；Vercel READY。
- `96cadb3`：nested modal body-lock reference count。
- `a564311`：HANDOFF/PROGRESS/BADCASE/INVENTORY 与 CI 同步到前一阶段。

## 当前 Surface Inventory

已确认用户主路径行为收口：

- SpeciesDetailDialog / Care main detail / Collection Care detail → Browsing Detail。
- Encyclopedia species-group → Browsing Detail（legacy signature bridge；页面显式迁移 deferred）。
- Livestock roster → Task Flow。
- Collection 删除收藏 / Livestock 删除与 dirty-close / Compatibility 清空 / Settings 撤销分享 / Settings 未提交反馈 / Identify 未保存诊断 / AI 助手清空历史 → Blocking Confirmation。
- Export / Image preview → Media。
- Search / CollectionHub → 无私有顶层 popup。

仍需处理：

1. `Aquarium.tsx` 多个 legacy direct DialogContent 仍依赖 auto inference；文章/指南、任务、阻断确认、3D preview 应按语义逐类收口。
2. `AdminContent.tsx` 内部后台仍有多处 `window.confirm`；属于 admin debt，不应和普通用户 P0 混在一起。
3. 全仓未知 private surface 的最终扫描与 browser acceptance 尚未完成。

## Badcase 状态

- PUI-BC-056：`fix_implemented_validation_pending`。
- PUI-BC-057：主 Species Detail 已修；Encyclopedia group squeeze 也已有 code-level bridge，仍待 browser validation。
- PUI-BC-058：`fix_implemented_validation_pending`。
- PUI-BC-059：**migration_reduced_validation_pending**；用户主路径 residual 已大幅减少，但 Aquarium semantic debt + admin debt + browser scan 尚未关闭。
- PUI-BC-061：nested modal body lock `fix_implemented_validation_pending`。
- PUI-BC-060：Aquarium 3D framing 仍 `investigating`；这是用户当前视觉 P0，不能被 Surface 清理掩盖。
- INFRA-BC-001：Vercel build-rate-limit `open_intermittent`。

## 下一步执行顺序

1. 转回 Aquarium：先完整读取其 stage / Dialog 使用位置，优先解决用户已指出的 **3D 舞台适配与全宽沉浸布局**，并顺手给直接相关 legacy Surface 显式分类。
2. 不整写 460KB Aquarium 文件，除非已取得完整 blob 且能严格控制 diff；优先抽取小组件/shared CSS/小文件 bridge。
3. latest preview 可用后跑 1440 / 1280 / 1024 / 768 / 390，分别验证 3D stage 与 Surface。
4. AdminContent native confirm 降为后续 P2 governance，不阻塞当前用户主路径视觉修复。

## 可信边界

- GitHub commit 存在 ≠ latest Vercel 页面已部署。
- Vercel READY/success ≠ 人工视觉 PASS。
- 静态 Surface contract ≠ browser interaction regression。
- AI 47/47 与 UI Surface 无直接证明关系。

详见：`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`SURFACE_INVENTORY_LATEST.md`。
