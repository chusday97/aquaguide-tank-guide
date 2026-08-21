# AquaGuide Handoff — Latest

更新时间：2026-08-21 15:06 +08:00

## 当前工作基线

- 当前分支：`codex/interactive-parity-v3`
- 本轮产品代码基线：`68070298e01ffe2547cac444c9cf85df0173d773`
- 不合并 `main`；当前分支与 `main`、RC1/#104/#105 栈存在历史分叉，后续必须做 semantic reconciliation，不能直接互相 merge。
- 当前状态：**代码返修进行中 / 非 release-ready / 非视觉 PASS**。
- Vercel：本轮第一步 `25c7ea9` 已有 READY 预览；`0206e3a`、`a936233`、`6807029` 的完整 Surface 重构在同步时仍受 Vercel build-rate-limit 影响，不能把旧预览当成最新视觉验收。

## 2026-08-21 最新产品决策：统一 Surface System

用户明确反馈：全站详情/弹窗一会儿左、一会儿右、一会儿内嵌双栏；内容被压窄；点击另一物种时详情消失；移动端方向不一致。这不是单页 CSS 问题，而是 Surface 架构问题。

现在统一为三类：

1. **Browsing Detail / 浏览详情**
   - Desktop：固定从右侧拉出的 persistent Detail Rail。
   - 底层左侧页面保持可见、可滚动、可继续点击。
   - 用户点击另一物种/养护对象时，Rail 不关闭，只替换内容。
   - 只有显式关闭按钮才结束当前详情浏览。
   - 无黑色 Overlay，不锁 body。

2. **Task Flow / 任务流**
   - Desktop：右侧 Task Rail。
   - Mobile：从底部上拉的高 Sheet。
   - 允许用户理解自己仍处于原页面上下文，但任务本身拥有独立滚动区域。

3. **Blocking Confirmation / 阻断确认**
   - 删除、放弃未保存、危险操作等仍使用居中 Modal。
   - 这类确认允许遮罩和焦点锁；不能为了“统一右侧”而失去阻断语义。

## 本轮关键实现

- `25c7ea9` — `fix(ui): keep nonmodal detail rails open during background browsing`
  - 修复 Base UI 非模态 Dialog 在 outside-press / focus-out 后自动关闭的问题。
  - `modal=false` 默认开启 `disablePointerDismissal`，支持左侧继续浏览时右侧 Rail 常驻。

- `0206e3a` — `refactor(ui): make desktop details persistent right rails`
  - `AdaptiveDetailContent` 不再使用页面内 split-workspace `section`。
  - Desktop 统一为右侧 Rail：`clamp(480px, 42vw, 600px)`，全高 `100dvh`。
  - Mobile 浏览详情统一为底部 Sheet，目标高度约 `68dvh`。

- `a936233` — `refactor(ui): replace split workspace with persistent detail rail system`
  - 移除旧 50/50 双屏 workspace 的强制网格逻辑。
  - 物种详情在窄 Rail 内改成纵向信息层级，避免按整个浏览器 viewport 触发双列布局后被挤压。
  - 详情正文内部滚动；关闭区 sticky；场景选择结果保持 overlay，不再把互动鱼缸画面向上顶短。

- `6807029` — `refactor(ui): standardize mobile task sheets from bottom`
  - Mobile Task Flow 从旧的左侧/整屏结构统一成底部高 Sheet（约 `82dvh`）。
  - Desktop Task Rail 最大宽度收敛到 760px，避免吞掉底层页面。

## 同日其他重要改动

- `3a6bb9a` — 统一 detail viewport 并重新平衡 Aquarium 3D framing；已撤销此前过度 `1.66–1.78x` CSS 二次放大。
- `1031517` — `/collection` 改为悬浮海洋生物导航：hover/focus 展开细分，点击把对应收藏模块置于中央，保留原有收藏/养护/纪念/成就真实数据与深链。

## 当前仍未关闭的问题

1. **全站 Surface 人工验收未完成**：必须实际验证 Encyclopedia、Care、Aquarium roster、Search/Collection 进入详情时是否全部遵守右侧 Rail / 手机 bottom sheet 规范。
2. **“切换物种时 Rail 保持展开”尚缺最新完整部署浏览器证据**：代码根因已修，但不能仅凭代码宣布 PASS。
3. **物种详情信息密度需要最新视觉复核**：目标是右侧窄 Rail 内清晰纵向阅读，不能再次出现图片/标题/风险卡被横向压缩。
4. **Aquarium 3D framing 仍未获用户视觉确认**：此前用户反馈初始鱼缸过大、缩放后又变得看不清，当前属于继续观察项，不标记完成。
5. **Vercel build-rate-limit** 阻塞最新三段 Surface 改动的 branch preview；属于部署/验收阻塞，不是代码成功证明。
6. **分支整合风险**：`interactive-parity-v3` 与 Result UX / RC1 栈存在明显 diverged ancestry。不要直接覆盖或合并。

## 下一步验收矩阵

最新预览可用后按顺序验证：

- 1440px `/encyclopedia`：打开 A → 左侧点击 B → Rail 保持展开并切换为 B；左侧仍可滚动/点击。
- 1440px `/encyclopedia?mode=browse` 或传统浏览：连续切换卡片，Rail 不消失。
- 1440px `/care` 与 `/care?mode=browse`：右侧详情位置、宽度、滚动一致。
- Aquarium roster → Species Detail：右侧 Rail；关闭后回到 roster；滚动/焦点不丢。
- 1024px：底层浏览区域不能被 Rail 压成不可用窄条。
- 390px：物种/养护详情从底部上拉；普通详情约 68dvh，任务流约 82dvh；无横向溢出。
- 居中 Modal 仅用于阻断确认；所有浏览详情不得出现无意义 Overlay/body lock。
- 检查 Esc、显式 X、返回路径、滚动恢复、焦点恢复。

## 可信边界

- GitHub 代码已更新 ≠ Vercel 最新预览已更新。
- Vercel READY ≠ 用户视觉 PASS。
- 自动构建/类型检查 PASS ≠ Surface 交互正确。
- AI `47/47` 与 `registry.jsonl = 0` 只代表已有 AI/规则评测，不代表 UI Badcase 关闭。

详见：`BADCASE_LATEST.md`、`PROGRESS_LATEST.md`、`evaluation/badcases/LATEST_STATUS.md`。
