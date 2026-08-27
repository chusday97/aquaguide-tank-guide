# Supabase 只读 Parity 报告

更新时间：2026-08-28

报告前半部分只记录通过 Supabase 管理接口执行的生产只读检查；后附本地 Supabase 重放证据。整个过程中没有执行生产 SQL migration、Catalog 上传或生产业务数据写入。

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

## 2026-08-28 本地 Supabase 26+1 重放证据

本节记录候选分支在本机 Supabase CLI 栈中的可复现实验，不改变上面的生产只读结论，也不代表已执行生产 migration 或写入。

### 前 26 个生产版本

本地从零重放至 `20260816160129_atomic_verified_livestock_relocation` 后，规范化结构清单与生产只读基线逐项匹配：

| 对象 | 数量 | SHA-256（本地 = 生产） |
| --- | ---: | --- |
| columns | 480 | `2a9109a0af89bd0c7ccf048071559d7f` |
| constraints | 203 | `2f2129eff15bce6c57b63950f594160c` |
| functions | 13 | `ea62f23288ff3869354e19110e895812` |
| indexes | 86 | `42f4e1cbfb24275267e5b3103683d866` |
| policies | 89 | `fe306d2ff4f4e66d7cccca6e9d17db44` |
| table grants | 980 | `496e09488c420b883880edee52b80724` |
| triggers | 33 | `757f63626496733cee00d13083e3b7eb` |

因此，前 26 个版本的本地结构与已取得的生产规范化基线标记为 `EQUIVALENT`。这仍不替代生产身份写入、并发和回滚验证。

### 第 27 个 Catalog 提案

- 完整重放 26+1 migration 成功；`supabase db lint --local --schema public --level error --fail-on error` 返回 0 条错误。
- `supabase test db --local` 通过 19/19 个 Catalog/RLS pgTAP 断言，覆盖匿名读取、匿名/普通用户写入拒绝、管理员草稿写入和已发布记录不可变性。
- 本地 PostgREST 匿名 `GET /rest/v1/catalog_releases` 返回已发布记录（HTTP 200）；匿名 `POST` 被权限拒绝（HTTP 401，PostgreSQL `42501`）。这是本地权限证据，不是生产写入验证。
- Catalog 快照仍为本地 486 个物种、13 个证据来源，checksum 为 `45f4f10ec1199f16543c93d12cd68526cce97b13bd7633aa04d156b1ab4a835a`；本地/云端生产 Catalog checksum 仍为 `UNVERIFIED`，因为生产表尚不存在。
- 生产 `catalog_releases`、`species_reference_links` 和 `species.water_type` 仍未部署；第 27 个 migration、Catalog 发布和 `main` 合并均未执行。

### 本地门禁命令

```text
supabase db reset --local --no-seed
supabase test db --local
supabase db lint --local --schema public --level error --fail-on error
npm run test:catalog-release-contract
npm run test:catalog-snapshot
npm run catalog:validate
npm run check:ui-freeze
```

结果仅证明候选分支可在本地重放并通过权限回归；生产 parity 仍须在独立授权后重新读取确认。
