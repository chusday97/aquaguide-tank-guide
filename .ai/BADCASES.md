# Badcases

## 已修复

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
