# origin/main 功能语义复核

**状态：** Active / 首轮高影响能力复核  
**复核日期：** 2026-08-26  
**目标线：** `codex/unified-rc-visual-v1`  
**来源线：** `origin/main`（仅证据来源，不是合并源）

## 目的

`origin/main` 相对统一分支有大量独有提交。提交数量、分支新旧或 PR 标题都不能证明功能缺失。本表只记录已经对照当前代码、产品契约和回归证据完成的高影响能力复核；未列出的提交仍保持待审，不得直接合并。

## 首轮复核结果

| 来源提交/能力 | 当前统一分支证据 | 决定 |
| --- | --- | --- |
| `ed0cf380` Care card reachability | `CareEncyclopedia` 已有唯一“分享卡片”入口，打开现有本地 `生成养护卡` 预览；`npm run test:care-card-action-ui` 在 4317 通过 | `ALREADY_PRESENT`；只保留回归证据，不复制旧入口 |
| `37177a60` Daily Check negative answer matching | `diagnosis.rules.ts` 已使用分类水体答案精确匹配；`npm run test:daily-check` 覆盖“没有异味/清澈”负向与“明显异味”正向场景，并已纳入 RC Convergence | `SELECTIVE_MIGRATION`；只迁移规则边界和回归，不迁移旧 workflow/UI |
| `2add55a5` Daily Check navigation ambiguity | `src/App.tsx` 的桌面 `/aquarium` 子菜单现在明确显示每日鱼缸检查并直达 `taskRoutes.aquarium.dailyCheck`；`npm run test:task-entry-contract` 锁定入口契约 | `SELECTIVE_MIGRATION`；只迁移明确任务入口和契约，不迁移旧页面/UI 样式 |
| `d464e24b` Empty care plan recommendation deep link | `taskRoutes.care.recommendations` 统一指向 `/care#care-recommendations`；鱼缸页空计划按钮消费该路由，避免只进入 Care 首页 | `SELECTIVE_MIGRATION`；只迁移已存在的推荐区深链，不迁移旧组件布局 |
| `5bf9800c` Remove fake CTA from building achievement module | 当前产品契约将 8 枚勋章定义为已完成的派生模块；`CollectionHub` 已有成就生物入口和可达预览，`/collection/achievements` 由核心浏览器回归验证锁定 | `HISTORICAL_OR_EXCLUDED`；来源提交针对旧版建设中卡片，不能覆盖当前已完成成就状态；补充成就入口预览回归，不迁移旧 UI |
| `daadc2a3` Settings sharing marked building | 统一分支的 Settings 已有“已分享报告”真实状态区和“打开导出与分享”导航；`npm run test:settings-share-action-ui` 验证进入 `/aquarium?action=exports`，分享契约/API/公共报告回归也通过 | `ALREADY_PRESENT / DEPLOYED_REVERIFY_PENDING`；不降级为建设中，等待云端 parity |
| `8e0238dc` surface sizing / typography / collection rails | 当前视觉基线 `37a8d4d1`、`UI_REGRESSION_CONTRACT.md`、surface/layout 回归已定义另一套 owner | `HISTORICAL_OR_EXCLUDED`；禁止整体搬运 CSS/UI |
| `2416e5b4` compatibility mixing-flow rebuild | 当前 `evaluateTankCompatibility`、证据边界和推荐 authority 已在 `.ai/RC_MIGRATION_LEDGER.md` 记录并有专项回归 | `HISTORICAL_OR_EXCLUDED`；不替换当前领域引擎或 UI |
| `098ff59c` / `77ae4276` task deep links | `src/services/navigation/task-routes.ts` 与 `npm run test:task-routes`、任务浏览器回归覆盖当前正式地址 | `ALREADY_PRESENT`；不迁移旧 workflow |
| `9f7fed5d` / `87251111` / `19ef8d62` / `df4ad1cc` compatibility evidence batches | 已按审核状态和 `species_only` 配对边界选择性迁入；覆盖 scorecard 明确 501 条物种、7 个 reviewed profiles、4 个 reviewed pair rules | `SELECTIVE_MIGRATION`；不得整批 cherry-pick |
| `2eaa20c2` / `e8d6c652` compatibility research deferral | 来源只增加 research-only 队列的无配对证据延期记录；当前统一分支没有对应的研究队列运行时入口，且现行契约要求未审核配对保持 `insufficient_data` | `HISTORICAL_OR_EXCLUDED`；不把研究计划或“未找到证据”写入运行时结论，待独立 research-planning 契约后再评估 |
| `328b070b` export removal 与 `c63964d8` interaction consistency | 当前媒体/导出和四类 surface 由共享组件与专项回归持有 | `CONTRACT_REVIEWED`；后续只接受能复现的行为修复 |
| `fe3fbc0c` / `9c31ce14` product UX closure | 当前鱼缸事实/规划 Intent、未知资料和任务闭环由 Repository/Service/任务路由测试持有 | `CONTRACT_REVIEWED`；不以旧页面 patch 作为迁移依据 |

## 复核规则

1. 先确认产品能力是否在当前分支可达，再决定是否迁移代码。
2. 已存在的能力只补回归证据，不新增第二入口或第二套规则。
3. 与当前视觉或数据契约冲突的来源标记为排除，不使用 merge/rebase 覆盖。
4. 只有同时具备规则、受影响文件、回归测试和边界说明的能力，才可进入 `.ai/RC_MIGRATION_LEDGER.md` 的迁移记录。

## 当前未完成

- `origin/main` 其余独有提交尚未全部完成逐项能力复核；本表不是 214 个提交的完成声明。
- Vercel exact Preview SHA、Supabase schema/RLS parity 和 release acceptance 仍是外部门禁。

可复核命令：

```bash
git log --oneline HEAD..origin/main
npm run audit:branch-convergence
npm run test:care-card-action-ui
```
