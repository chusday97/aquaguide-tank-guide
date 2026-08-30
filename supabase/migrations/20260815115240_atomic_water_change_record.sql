begin;

create or replace function public.set_aquarium_water_change_day(
  target_aquarium_id uuid,
  water_change_date date,
  should_record boolean,
  operation_key text,
  operation_request_hash text
)
returns table (
  aquarium_id uuid,
  recorded boolean,
  latest_water_change_at timestamptz,
  replayed boolean
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_aquarium public.aquariums%rowtype;
  existing_operation public.idempotency_records%rowtype;
  latest_at timestamptz;
begin
  if current_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if target_aquarium_id is null then raise exception 'AQUARIUM_REQUIRED'; end if;
  if water_change_date is null then raise exception 'WATER_CHANGE_DATE_REQUIRED'; end if;
  if should_record is null then raise exception 'WATER_CHANGE_STATE_REQUIRED'; end if;
  if operation_key is null or char_length(operation_key) < 1 or char_length(operation_key) > 180 then
    raise exception 'INVALID_OPERATION_KEY';
  end if;
  if operation_request_hash is null or operation_request_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_REQUEST_HASH';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':' || target_aquarium_id::text, 0));

  select * into existing_operation
  from public.idempotency_records
  where owner_id = current_user_id
    and idempotency_key = operation_key
    and deleted_at is null;

  if found then
    if existing_operation.request_hash is distinct from operation_request_hash
      or existing_operation.resource_type is distinct from 'water_change_day'
      or existing_operation.resource_id is distinct from target_aquarium_id then
      raise exception 'DUPLICATE_OPERATION_KEY';
    end if;

    select max(occurred_at) into latest_at
    from public.care_events
    where owner_id = current_user_id
      and aquarium_id = target_aquarium_id
      and event_type = 'water_change'
      and source_type = 'water_change_day'
      and deleted_at is null;

    return query select target_aquarium_id, should_record, latest_at, true;
    return;
  end if;

  select * into current_aquarium
  from public.aquariums
  where id = target_aquarium_id
    and owner_id = current_user_id
    and deleted_at is null
  for update;

  if not found then raise exception 'AQUARIUM_NOT_FOUND'; end if;

  if should_record then
    if not exists (
      select 1
      from public.care_events
      where owner_id = current_user_id
        and aquarium_id = target_aquarium_id
        and event_type = 'water_change'
        and source_type = 'water_change_day'
        and source_id = water_change_date::text
        and deleted_at is null
    ) then
      insert into public.care_events (
        owner_id,
        aquarium_id,
        event_type,
        title,
        label,
        payload,
        occurred_at,
        source_type,
        source_id,
        is_inferred
      ) values (
        current_user_id,
        target_aquarium_id,
        'water_change',
        '换水记录',
        water_change_date::text,
        jsonb_build_object('localDate', water_change_date::text),
        (water_change_date + time '12:00') at time zone 'UTC',
        'water_change_day',
        water_change_date::text,
        false
      );
    end if;
  else
    update public.care_events
    set deleted_at = now()
    where owner_id = current_user_id
      and aquarium_id = target_aquarium_id
      and event_type = 'water_change'
      and source_type = 'water_change_day'
      and source_id = water_change_date::text
      and deleted_at is null;
  end if;

  select max(occurred_at) into latest_at
  from public.care_events
  where owner_id = current_user_id
    and aquarium_id = target_aquarium_id
    and event_type = 'water_change'
    and source_type = 'water_change_day'
    and deleted_at is null;

  update public.aquariums
  set last_water_change_at = latest_at
  where id = target_aquarium_id
    and owner_id = current_user_id
    and deleted_at is null;

  update public.aquarium_species
  set last_water_change_at = latest_at
  where aquarium_id = target_aquarium_id
    and deleted_at is null;

  insert into public.idempotency_records (
    owner_id,
    idempotency_key,
    request_method,
    request_path,
    request_hash,
    resource_type,
    resource_id,
    response_status,
    expires_at
  ) values (
    current_user_id,
    operation_key,
    'PUT',
    '/api/v1/aquariums/' || target_aquarium_id::text || '/water-changes/' || water_change_date::text,
    operation_request_hash,
    'water_change_day',
    target_aquarium_id,
    200,
    now() + interval '7 days'
  );

  return query select target_aquarium_id, should_record, latest_at, false;
end;
$$;

revoke all on function public.set_aquarium_water_change_day(uuid, date, boolean, text, text) from public;
revoke all on function public.set_aquarium_water_change_day(uuid, date, boolean, text, text) from anon;
grant execute on function public.set_aquarium_water_change_day(uuid, date, boolean, text, text) to authenticated;

commit;
