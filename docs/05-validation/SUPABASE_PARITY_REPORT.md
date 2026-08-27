# Supabase 只读 Parity 报告

更新时间：2026-08-28

本报告只记录通过 Supabase 管理接口执行的只读检查。没有执行 SQL migration、Catalog 上传或业务数据写入。

## 结论

| 检查项 | 状态 | 证据 |
| --- | --- | --- |
| 生产 migration 历史（26 个） | `EQUIVALENT` | `supabase.list_migrations` 返回 `202607160001` → `20260816160129`，版本顺序与候选已恢复的 26 个文件一致 |
| public 表数量与 RLS 覆盖 | `EQUIVALENT`（数量层） | `pg_class` 只读查询：35 张表、35 张启用 RLS |
| public policy 数量 | `EQUIVALENT`（数量层） | `pg_policies` 只读查询：89 条 policy |
| 外键数量 | `UNVERIFIED` | 生产只读查询得到 56 条；候选 SQL 逐约束语义尚未完成逐项 diff |
| 索引数量 | `UNVERIFIED` | 生产只读查询得到 86 个；候选 SQL 逐索引语义尚未完成逐项 diff |
| 触发器数量 | `UNVERIFIED` | 生产只读查询得到 33 个；候选 SQL 逐触发器语义尚未完成逐项 diff |
| `catalog_releases` | `MIGRATION_REQUIRED` | 生产 `to_regclass('public.catalog_releases')` 返回 `null` |
| `species_reference_links` | `MIGRATION_REQUIRED` | 生产 `to_regclass('public.species_reference_links')` 返回 `null` |
| `species.water_type` | `MIGRATION_REQUIRED` | 生产 `information_schema.columns` 查询数量为 `0` |
| 当前发布 Catalog 与 checksum | `UNVERIFIED` | Catalog 表尚未存在，不能读取发布版本或 checksum；不能用空表结果代替 parity |
| RPC 名称/参数/安全属性 | `UNVERIFIED` | 已读取 13 个 public RPC 的名称、参数和 `security_definer`；候选逐函数签名与行为回归待完成 |
| 公共用户/owner/管理员 RLS 行为 | `UNVERIFIED` | 已确认 RLS 覆盖数量；需要匿名、owner、管理员三种身份的真实策略回归 |

## 生产只读事实

- 项目：`ydiygvhuqpogmqlcvgob`
- migration：26 个，最后一个为 `20260816160129_atomic_verified_livestock_relocation`
- public 表：35 张，全部启用 RLS
- public policy：89 条
- public 外键：56 条
- public 索引：86 个
- public 非内部触发器：33 个
- 生产 `species` 当前没有 `water_type` 字段；`catalog_releases` 和 `species_reference_links` 均不存在。
- 已读取的 RPC 包括鱼缸生物新增、未解析生物新增、换水、提醒完成、批次拆分/合并、移缸、删除、纪念记录等；没有执行这些 RPC。

## 与候选的关系

候选分支包含生产 26 个历史 migration，并额外保留未执行的
`202608270001_catalog_releases_and_species_water_type.sql`。因此当前发布链必须停在
`MIGRATION_REQUIRED`：

1. 先在干净 PostgreSQL 重放 26 个历史 migration 并完成逐表/逐 policy/RPC 回归。
2. 单独取得授权后，才执行第 27 个 Catalog migration。
3. migration 回归通过后，再单独取得 Catalog 发布授权。
4. 发布后重新读取 Catalog 版本和 checksum，才能把 parity 更新为 `EQUIVALENT`。

## 停止条件

- 不能把 `list_tables` 的空行数当成“没有数据”或“数据已同步”；当前数据数量属于权限/环境观察结果，需通过发布 Catalog API 或受控查询复核。
- 任何字段、RLS、RPC 或 migration 顺序冲突都会停止 Preview/main 发布。
- 本报告中的数量等价不代表策略语义已经等价；逐条策略和身份回归仍是 release gate。
