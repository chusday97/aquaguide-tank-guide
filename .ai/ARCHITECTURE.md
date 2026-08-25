# Architecture

> 本文件是当前架构摘要，不替代 `CONTRACT.md`。

## 主要分层

```text
页面组件 → Hooks / 状态 → Repository → 服务/API → Supabase
```

- 游客和登录用户通过不同 Repository 实现本地或云端访问。
- Supabase 写入通过服务端业务 API、RPC 或既有服务层完成；页面组件不应绕过边界直接写库。
- AI handler 返回结构化任务结果及 `source`、`generatedAt`、`failureReason` 等状态元信息。

## 当前视觉工作区

- 正式互动图鉴、互动养护和 3D 主舞台复用现有 React 组件。
- 内部预览路由用于视觉回归，不应创建第二套业务实现。
- 视口验证目标为 390 / 600 / 768 / 1024 / 1440px。

## 变更门禁

涉及数据库、API、持久化或权限时，先阅读并同步 `CONTRACT.md`；涉及纯视觉时，不得顺手修改数据契约。
