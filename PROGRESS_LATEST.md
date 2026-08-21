# AquaGuide Progress — Latest

更新时间：2026-08-21 16:12 +08:00

## 当前结论

当前 Surface 主线已经从“到处位置不一致”进入 **已知 residual 收口 + browser acceptance** 阶段。当前产品代码 head：`c603159b4dc5dd4a1a61a2ad019022a103782487`。

状态：

- Shared Surface architecture：已建立。
- 用户主路径 private modal/native confirm：已进一步清理。
- Encyclopedia species-group：已从 legacy Task inference 改为 Browsing Detail bridge。
- Aquarium semantic legacy surfaces：仍待收口。
- Human visual acceptance：NOT PASS。
- Release readiness：NOT READY。

## 本轮完成

### 1. AIAssistant clear-history confirmation

`da195046f4803b1ff167d78cb1d0e2b59971aea2`

- native `confirm` → shared `surface="blocking"`。
- 只新增 pending state 与确认 UI；AI 调用、消息历史和收藏逻辑未修改。
- diff 已复核。
- Vercel：build-rate-limit。

### 2. Encyclopedia species-group detail bridge

`c603159b4dc5dd4a1a61a2ad019022a103782487`

- Shared Dialog 对唯一已知 legacy signature `max-w-[920px] + rounded-[24px]` 推断为 Browsing Detail。
- Desktop：persistent non-modal right rail。
- Mobile：68dvh bottom sheet。
- Legacy group detail 的 `modalBody` 独立滚动。
- 原桌面双列强制为单列，避免窄 Rail 内横向挤压。
- 未整写大型 Encyclopedia 页面，也未改物种/收藏/兼容性业务逻辑。
- diff 已复核。
- Vercel：build-rate-limit。

### 3. 此前已完成

- `a087dce` Settings unsaved-feedback → Blocking；Vercel success。
- `d6bb055` Identify unsaved-diagnosis → Blocking。
- `cbb6eaa` Image Preview → Media；Vercel READY。
- `96cadb3` nested modal body lock。
- `25c7ea9 / 0206e3a / a936233 / 6807029` persistent Detail / Task rails & mobile sheets。

## 当前合规矩阵

- Species detail：Browsing Detail
- Care detail：Browsing Detail
- Collection Care detail：Browsing Detail
- Encyclopedia species-group：Browsing Detail bridge
- Livestock roster：Task
- Settings/Identify/AIAssistant destructive or discard confirmations：Blocking
- Image / Export preview：Media
- Search / CollectionHub：无 private top-level popup

## 当前 residual

1. **Aquarium legacy direct DialogContent**：文章、指南、任务、阻断确认、3D preview 仍需语义分类。
2. **AdminContent native confirms**：内部后台 debt，P2。
3. **Browser acceptance**：最新 head 仍没有 1440/1280/1024/768/390 完整证据。
4. **Aquarium 3D stage**：用户明确反馈的视觉 P0 仍未通过。

## Deployment evidence

- `cbb6eaa`：Vercel READY。
- `a087dce`：Vercel success。
- `d6bb055`：build-rate-limit。
- `da195046`：build-rate-limit。
- `c603159`：build-rate-limit。

因此基础设施仍是 **intermittent build-rate-limit**，不等于产品编译失败。

## 下一步 P0

1. 回到 Aquarium 3D 主舞台适配，重新核对实际 DOM / stage wrapper / ThreeAquarium sizing，而不是继续抽象讨论。
2. 目标仍是：单一 full-width aquarium stage，标题/今日行动/物种入口/底部 dock 作为 scene overlay，不允许右侧卡片继续占 grid column 挤压 3D。
3. 建立 1440/1280/1024/768/390 responsive acceptance；尤其验证 canvas 宽度不被 action card 缩小。
4. 与 Aquarium 直接相关的 legacy Surface 同批语义化；Admin 后台 debt 延后。

## Merge boundary

- 不合并 `main`。
- 不把 code/diff-verified 写成 browser PASS。
- 不把 Vercel rate limit 写成 compile failure。
- 当前 branch 与 RC1/#104/#105 仍需后续 semantic reconciliation。
