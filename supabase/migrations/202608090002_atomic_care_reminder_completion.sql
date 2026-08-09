begin;

create or replace function public.complete_care_reminder_with_recurrence(
  reminder_id uuid,
  expected_version integer,
  completion_time timestamptz,
  next_reminder_id uuid,
  operation_key text,
  operation_request_hash text
)
returns table (completed_reminder_id uuid, created_next_reminder_id uuid, replayed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_reminder public.care_reminders%rowtype;
  existing_operation public.idempotency_records%rowtype;
  next_scheduled_for timestamptz;
  resolved_next_id uuid;
begin
  if current_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if completion_time is null then raise exception 'INVALID_COMPLETION_TIME'; end if;
  if operation_key is null or char_length(operation_key) < 1 or char_length(operation_key) > 180 then
    raise exception 'INVALID_OPERATION_KEY';
  end if;
  if operation_request_hash is null or operation_request_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_REQUEST_HASH';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':' || operation_key, 0));

  select * into existing_operation
  from public.idempotency_records
  where owner_id = current_user_id
    and idempotency_key = operation_key
    and deleted_at is null;

  if found then
    if existing_operation.request_hash <> operation_request_hash
      or existing_operation.resource_type <> 'care_reminder_completion'
      or existing_operation.resource_id <> reminder_id then
      raise exception 'DUPLICATE_OPERATION_KEY';
    end if;
    return query select reminder_id, null::uuid, true;
    return;
  end if;

  select * into current_reminder
  from public.care_reminders
  where id = reminder_id
    and owner_id = current_user_id
    and deleted_at is null
  for update;

  if not found then raise exception 'REMINDER_NOT_FOUND'; end if;
  if current_reminder.version <> expected_version then raise exception 'REMINDER_VERSION_CONFLICT'; end if;

  update public.care_reminders
  set completed_at = completion_time
  where id = reminder_id;

  if current_reminder.repeat_enabled
    and current_reminder.repeat_interval_days is not null
    and current_reminder.series_id is not null then
    if next_reminder_id is null then raise exception 'NEXT_REMINDER_ID_REQUIRED'; end if;
    next_scheduled_for := completion_time + make_interval(days => current_reminder.repeat_interval_days);
    resolved_next_id := next_reminder_id;
    insert into public.care_reminders (
      id, owner_id, aquarium_id, source_article_id, source_catalog_key, title,
      reminder_type, scheduled_for, label, series_id, repeat_enabled, repeat_interval_days
    ) values (
      resolved_next_id, current_user_id, current_reminder.aquarium_id, current_reminder.source_article_id,
      current_reminder.source_catalog_key, current_reminder.title, current_reminder.reminder_type,
      next_scheduled_for, current_reminder.repeat_interval_days::text || ' 天循环',
      current_reminder.series_id, true, current_reminder.repeat_interval_days
    ) on conflict (id) do nothing;
  end if;

  insert into public.idempotency_records (
    owner_id, idempotency_key, request_method, request_path, request_hash,
    resource_type, resource_id, response_status, expires_at
  ) values (
    current_user_id, operation_key, 'PATCH', '/api/v1/care-reminders/' || reminder_id::text,
    operation_request_hash, 'care_reminder_completion', reminder_id, 200, now() + interval '7 days'
  );

  return query select reminder_id, resolved_next_id, false;
end;
$$;

revoke all on function public.complete_care_reminder_with_recurrence(uuid, integer, timestamptz, uuid, text, text) from public;
grant execute on function public.complete_care_reminder_with_recurrence(uuid, integer, timestamptz, uuid, text, text) to authenticated;

commit;
