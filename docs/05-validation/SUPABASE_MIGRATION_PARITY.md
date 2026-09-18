# Supabase Migration Parity

更新时间：2026-08-28

## 当前结论

本地候选已恢复生产报告的 26 个 migration 版本；候选另有一个尚未执行的 Catalog 提案。生产 migration、Catalog 发布和业务数据均未被本文件或本轮代码修改。

最新只读 parity 细项见 [SUPABASE_PARITY_REPORT.md](./SUPABASE_PARITY_REPORT.md)。
第 27 个 migration 的执行前检查、影响范围、验证命令和停止条件见
[SUPABASE_CATALOG_MIGRATION_AUTHORIZATION.md](./SUPABASE_CATALOG_MIGRATION_AUTHORIZATION.md)。

| 环境 | 版本范围 | 状态 |
| --- | --- | --- |
| 生产 Supabase | `202607160001` → `20260816160129`（26 个） | `EQUIVALENT`，由 `supabase.list_migrations` 复核 |
| 候选本地 | 同上 26 个 + `202608270001_catalog_releases_and_species_water_type.sql` | 历史已对齐，Catalog 待授权 |

## 已对齐的生产历史补回

- `20260815115240_atomic_water_change_record.sql`
- `20260815154000_harden_database_function_security.sql`
- `20260815155000_fix_water_change_rpc_ambiguity.sql`
- `20260815160000_optimize_rls_policies.sql`
- `20260816065339_add_care_operation_completed_event.sql`
- `20260816072659_care_checklist_progress.sql`
- `20260816103423_unresolved_existing_livestock.sql`
- `20260816160129_atomic_verified_livestock_relocation.sql`
- memorial 迁移文件已从重复的 `202607290001_memorial_reflection_fields.sql` 对齐为 `202607290004_memorial_reflection_fields.sql`。

## 下一步验证

1. 在干净 PostgreSQL 中从零执行 26 个历史 migration，检查版本顺序、函数签名、RLS 和旧 API 契约。
2. 对真实 Supabase 只读核对 schema revision、表/字段、外键、索引、RLS、RPC 和 Catalog checksum。
3. 只有在取得独立授权后，才执行第 27 个 Catalog migration；再另行授权 Catalog 发布。

### 停止条件

任一历史版本、RPC、RLS 或字段与生产不一致时，停止 Preview/main 流程，不执行生产 migration。
