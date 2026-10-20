# Supabase Observability Budget Policy

This project shares a Free Supabase organization quota with other active projects.

## Logs Query hard rules

- NEVER query Supabase logs without an explicit bounded time window.
- Default diagnostic window: 5 minutes. Maximum default window: 15 minutes.
- A wider window requires a concrete incident and must be narrowed by source/service/path before execution.
- NEVER poll `query_logs`, Logs Explorer, Management API logs, or CLI logs in a loop.
- Prefer one aggregate log query over multiple exploratory queries.
- Prefer database state for routine health checks:
  - `sync_runs`
  - `cron.job_run_details`
  - ingestion target/state tables
  - repair/recovery state
  - public/canonical data completeness
- Use Logs only for unresolved runtime errors, 4xx/5xx investigation, or source-specific failures that cannot be determined from database state.
- Do not use Studio Logs live mode for routine monitoring.
- Do not leave broad Logs Explorer tabs refreshing in the background.

## Logs Ingest rules

- Production Edge Functions should not emit `console.log`, `console.info`, or `console.debug`.
- Keep warning/error payloads small; do not log full HTML, PDF text, large JSON payloads, or full database rows.
- Gate idle cron work in Postgres before booting Edge Functions whenever practical.
- Avoid heartbeat/audit rows and network calls when state is unchanged.

## Query strategy

1. Inspect canonical DB state first.
2. Inspect cron/sync state second.
3. If logs are still necessary, query a single source/path over 5–15 minutes.
4. Expand only when evidence requires it.

This policy is cost-control authority for Supabase diagnostics.

