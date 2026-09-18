# Catalog Migration 授权包（仅准备，不执行）

更新时间：2026-08-28

本文件只说明第 27 个 migration 的生产执行方案。当前未执行 SQL、未修改生产数据、未发布 Catalog，也未改变现有 UI。

## 目标 migration

`supabase/migrations/202608270001_catalog_releases_and_species_water_type.sql`

新增或约束：

- `public.species.water_type`：`freshwater | saltwater | unknown`，旧行默认 `unknown`。
- `public.species_reference_links`：物种、证据来源、字段组和审核状态的引用关系。
- `public.catalog_releases`：版本、Schema 版本、SHA-256、对象数量、存储路径、发布状态和时间。
- 已发布 Catalog 不可更新或删除的触发器。
- 匿名只读、登录读取、管理员草稿维护和服务端发布所需的显式 GRANT/RLS。

## 执行前只读检查

在生产执行前保存以下非敏感结果：

1. 当前 migration revision，必须为 `20260816160129` 之后的前 26 个版本。
2. `public.species` 当前列、约束、索引、触发器和 RLS 状态。
3. 现有 RPC 签名、`security_definer`、`search_path` 和 EXECUTE 权限。
4. 旧物种、鱼缸、生物、换水、养护、批次和纪念 API 的只读健康检查。
5. 生产中不存在 `catalog_releases`、`species_reference_links` 和 `species.water_type`，或已明确记录冲突。

## 执行后验证

- migration 数量变为 27，且版本顺序正确。
- `species.water_type` 旧数据全部为 `unknown`，没有从文本推断值。
- 匿名用户只能读取已发布 Catalog 和已审核证据。
- 普通登录用户不能维护 Catalog；管理员可维护草稿。
- 已发布 `catalog_releases` 的更新和删除被拒绝。
- 旧 API、RPC、RLS 和幂等行为无回归。
- Catalog Snapshot 发布前后 checksum、对象数量和引用关系一致。

## 停止条件与回退

出现以下任一情况立即停止，不执行生产 migration：

- 前 26 个 migration、RPC、RLS 或字段与只读基线不一致。
- 目标对象已存在但定义冲突。
- 旧 API 或权限模型出现回归。
- 无法保存执行前快照或无法完成执行后验证。

该 migration 没有自动回退生产业务数据的步骤。失败时保留事务失败结果，先修正 SQL/权限并重新审查；已成功执行但后续验证失败时，采用前向修复或经授权的反向 DDL，不直接删除业务数据。

## 独立授权边界

本授权包不等于授权。只有用户明确批准后才可执行第 27 个 migration；Catalog 发布和 `main` 合并仍是另外两个独立授权点。
