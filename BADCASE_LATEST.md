# AquaGuide Badcase — Latest

更新时间：2026-08-21 16:12 +08:00

> 本文件记录产品/UI/交互 Badcase。`evaluation/badcases/registry.jsonl` 只记录真实 AI/规则评测失败；UI Surface 问题不能混入 AI registry。

## PUI-BC-056 — 浏览详情 Surface 不统一且切换对象会自动消失

- **Severity**：P0 / High
- **Feature**：`detail_surface_system`
- **Status**：`fix_implemented_validation_pending`
- **Fix**：`25c7ea9`、`0206e3a`、`a936233`。
- **仍需证据**：latest head 1440 / 1024 / 390 browser regression。

## PUI-BC-057 — 右侧详情在窄 Rail 内被桌面双列布局挤压

- **Severity**：P0 / High
- **Feature**：`detail_density`
- **Status**：`fix_implemented_validation_pending`
- 主 SpeciesDetail：`a936233` 已收敛为纵向信息层级。
- Encyclopedia species-group：`c603159` 已通过 strict legacy-detail bridge + CSS 将原双列强制为单列。
- **仍需证据**：latest browser 下长名称、变种列表、图片、CTA、滚动均可读可达。

## PUI-BC-058 — Mobile Surface 方向和高度不一致

- **Severity**：P1 / High
- **Feature**：`mobile_surface_system`
- **Status**：`fix_implemented_validation_pending`
- Detail 约 68dvh bottom sheet；Task 约 82dvh；Blocking centered。
- **仍需证据**：390px browser acceptance。

## PUI-BC-059 — 全站 Surface Inventory / private popup debt

- **Severity**：P0 / High
- **Feature**：`global_surface_governance`
- **Status**：`migration_reduced_validation_pending`

### 已修复 / 已桥接

- FilterBottomSheet → Task。
- `cbb6eaa` ImagePreviewModal → Media。
- `96cadb3` nested modal body lock。
- `a087dce` Settings unsaved-feedback native confirm → Blocking。
- `d6bb055` Identify private fixed/aria-modal → Blocking。
- `da195046` AIAssistant clear-history native confirm → Blocking。
- `c603159` Encyclopedia species-group legacy Task inference → Browsing Detail bridge，并处理 Rail 内双列挤压。

### 已确认 residual

1. **Aquarium legacy direct DialogContent**
   - Daily Check article / 换水提示等浏览内容应为 Detail。
   - reminder / observation / smart recommendation / conflict handling 应为 Task。
   - delete aquarium / delete reminder / diagnosis exit 应为 Blocking。
   - 3D preview 应为 Fullscreen / Media。
   - 文件约 460KB，只在完整读取与严格 diff 条件下修改。

2. **AdminContent native confirms**
   - 内部后台切换内容、新建、离开、切换栏目仍有 `window.confirm`。
   - 属于 admin debt / P2，不阻塞当前普通用户视觉 P0。

3. **最终全仓扫描 / browser acceptance**
   - 尚不能声明不存在其他未知 private surface。
   - latest-head browser regression 尚未完成。

### 关闭条件

- Aquarium semantic legacy Surface 收口或建立严格 allowlist。
- 全仓未知 private surface 扫描完成。
- latest head build 可运行。
- 1440 / 1024 / 390 browser Surface regression 通过。

## PUI-BC-061 — Nested modal body lock 可被子确认框提前解除

- **Severity**：P1 / High
- **Feature**：`nested_modal_lock`
- **Status**：`fix_implemented_validation_pending`
- **Fix**：`96cadb39d1560e543f6eedb596a89d757919ca84` reference count。
- **仍需证据**：Mobile parent Task Sheet + child Blocking 关闭后父 Sheet 仍 lock body。

## PUI-BC-060 — Aquarium 3D framing / layout 在不同 viewport 下不稳定

- **Severity**：P0 / High
- **Feature**：`aquarium_3d_stage`
- **Status**：`investigating`
- **用户可见症状**：3D 鱼缸被右侧「今日行动」布局列挤窄，主画面空白大，未形成目标参考图中的单一沉浸式 aquarium stage。
- `3a6bb9a` 曾调整 CSS zoom/framing，但不能证明布局范式已正确。
- **正确目标**：3D/canvas 占满主 stage；标题/状态、今日行动、查看缸内物种、底部 action dock 都作为 stage overlay，不占独立 grid column。
- **验收**：1440 / 1280 / 1024 / 768 / 390 下 stage 宽度、鱼可读性、玻璃框比例、overlay 不遮挡都稳定。

## INFRA-BC-001 — Vercel build-rate-limit 间歇阻塞 latest UI validation

- **Type**：Infrastructure / Acceptance blocker
- **Status**：`open_intermittent`
- `cbb6eaa` READY；`a087dce` success。
- `d6bb055`、`da195046`、`c603159` 均又遭 free-plan build-rate-limit。
- 不能把 rate limit 解释成代码编译失败。

## AI Badcase 边界

最近既有 AI/规则评测仍为 deterministic 37/37、mocked provider 10/10、总计 47/47；`evaluation/badcases/registry.jsonl` 0 条。它不证明 UI Badcase 已关闭。

## 关闭原则

- `fix_implemented` ≠ `regression_verified`。
- GitHub commit ≠ latest deployment。
- Vercel READY/success ≠ 人工视觉验收。
- 静态契约 ≠ browser interaction acceptance。
