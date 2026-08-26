# Badcases

## 已修复

### PUI-BC-024 — Daily Check 否定水质答案被模糊匹配为异常

- **现象：** “没有异味”等分类否定答案包含“异味”子串，可能误触发水体异常摘要和换水动作。
- **处理：** 水体异常改用分类值精确匹配；同时保留“经常浮头”本身的高风险结论，并加入正/负回归。
- **证据：** `npm run test:daily-check`、`npm run lint`、`npm run build`；来源 `origin/main@37177a60` 已按语义选择性迁移。
- **状态：** `REGRESSION_VERIFIED`

### PUI-BC-023 — Daily Check 与 Care troubleshooting 入口含义不清

- **现象：** 桌面“我的鱼缸”只有一级入口，用户无法从导航区分实际巡检任务与养护百科排查。
- **处理：** 增加明确命名的每日鱼缸检查子入口，直达 canonical daily-check route；保留 Care 独立入口。
- **证据：** `npm run test:task-entry-contract`、`npm run test:task-routes`、`npm run lint`；来源 `origin/main@2add55a5` 已按语义选择性迁移。
- **状态：** `REGRESSION_VERIFIED`

### PUI-BC-025 — 空养护计划按钮未定位到推荐区

- **现象：** 鱼缸没有养护计划时，“浏览养护”只打开 Care 首页，用户仍需自行寻找推荐区。
- **处理：** 增加 canonical `taskRoutes.care.recommendations` 深链，并让鱼缸页空计划按钮消费 `/care#care-recommendations`；新增 task-entry contract 断言。
- **证据：** `npm run test:task-entry-contract`、`npm run test:task-routes`、`npm run lint`、`npm run build`；来源 `origin/main@d464e24b` 已按语义选择性迁移。
- **状态：** `REGRESSION_VERIFIED`

### AQUA-UI-001 — 非 Portal Popup 导致页面错误

- **现象：** 首轮非 Portal 写法曾触发 Base UI 页面错误，养护详情也未进入实际双屏父网格。
- **处理：** 改为页面内 `section` 工作区，恢复 Popup 的 Portal 不变量并修正 shell 网格。
- **证据：** `PROGRESS.md` 与 `HANDOFF.md` 记录的修复提交 `fe8c4aa`、`fa54b7c`、`d988380` 及后续浏览器门禁。
- **状态：** `REGRESSION_VERIFIED`

## 当前评测状态

- `evaluation/badcases/registry.jsonl` 当前记录为 0 条真实 AI/规则失败。
- UI、响应式和部署问题不写入 AI registry；应继续记录在项目 Badcase 文档与交接文档中。

## 记录规则

确认失败后补充：复现路径、根因、修复、回归测试和证据；没有证据的怀疑标为待确认。
