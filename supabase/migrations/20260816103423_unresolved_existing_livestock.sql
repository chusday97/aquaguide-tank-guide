begin;

create type public.livestock_identity_status as enum ('verified', 'unresolved');

alter table public.aquarium_species
  add column identity_status public.livestock_identity_status not null default 'verified',
  add column raw_name text;

alter table public.aquarium_species
  alter column species_catalog_key drop not null;

drop index if exists public.aquarium_species_active_key_idx;
create unique index aquarium_species_active_key_idx
  on public.aquarium_species(aquarium_id, species_catalog_key)
  where deleted_at is null and species_catalog_key is not null;

alter table public.aquarium_species
  add constraint aquarium_species_identity_truth_check
  check (
    (
      identity_status = 'verified'
      and species_catalog_key is not null
      and raw_name is null
    )
    or
    (
      identity_status = 'unresolved'
      and species_id is null
      and species_catalog_key is null
      and raw_name is not null
      and char_length(btrim(raw_name)) between 1 and 160
    )
  );

create or replace function public.add_unresolved_aquarium_livestock(
  target_aquarium_id uuid,
  target_raw_name text,
  target_quantity integer,
  target_entry_date date,
  target_life_stage public.aquarium_life_stage,
  target_reproductive_state public.aquarium_reproductive_state,
  new_species_record_id uuid,
  new_batch_id uuid,
  operation_key text,
  operation_request_hash text
)
returns table (species_record_id uuid, batch_id uuid, replayed boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_raw_name text := nullif(pg_catalog.btrim(target_raw_name), '');
  current_species_record public.aquarium_species%rowtype;
  current_batch public.aquarium_species_batches%rowtype;
  existing_operation public.idempotency_records%rowtype;
begin
  if current_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if normalized_raw_name is null or pg_catalog.char_length(normalized_raw_name) > 160 then raise exception 'INVALID_RAW_NAME'; end if;
  if target_quantity is null or target_quantity < 1 then raise exception 'INVALID_QUANTITY'; end if;
  if target_entry_date is null then raise exception 'INVALID_ENTRY_DATE'; end if;
  if new_species_record_id is null or new_batch_id is null then raise exception 'INVALID_RECORD_ID'; end if;
  if operation_key is null or pg_catalog.char_length(operation_key) < 1 or pg_catalog.char_length(operation_key) > 180 then
    raise exception 'INVALID_OPERATION_KEY';
  end if;
  if operation_request_hash is null or operation_request_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_REQUEST_HASH';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(current_user_id::text || ':operation:' || operation_key, 0));

  select * into existing_operation
  from public.idempotency_records
  where owner_id = current_user_id
    and idempotency_key = operation_key
    and deleted_at is null;

  if found then
    if existing_operation.request_hash <> operation_request_hash
      or existing_operation.resource_type <> 'aquarium_species' then
      raise exception 'DUPLICATE_OPERATION_KEY';
    end if;
    return query select existing_operation.resource_id, new_batch_id, true;
    return;
  end if;

  perform 1
  from public.aquariums
  where id = target_aquarium_id
    and owner_id = current_user_id
    and deleted_at is null;
  if not found then raise exception 'AQUARIUM_NOT_FOUND'; end if;

  insert into public.aquarium_species (
    id,
    aquarium_id,
    species_id,
    species_catalog_key,
    identity_status,
    raw_name,
    quantity,
    entry_date
  ) values (
    new_species_record_id,
    target_aquarium_id,
    null,
    null,
    'unresolved',
    normalized_raw_name,
    target_quantity,
    target_entry_date
  )
  returning * into current_species_record;

  insert into public.aquarium_species_batches (
    id,
    aquarium_species_id,
    quantity,
    entry_date,
    life_stage,
    reproductive_state,
    state_updated_at
  ) values (
    new_batch_id,
    current_species_record.id,
    target_quantity,
    target_entry_date,
    target_life_stage,
    target_reproductive_state,
    pg_catalog.now()
  )
  returning * into current_batch;

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
    'POST',
    '/api/v1/aquariums/' || target_aquarium_id::text || '/species',
    operation_request_hash,
    'aquarium_species',
    current_species_record.id,
    201,
    pg_catalog.now() + interval '7 days'
  );

  return query select current_species_record.id, current_batch.id, false;
end;
$$;

revoke all on function public.add_unresolved_aquarium_livestock(
  uuid, text, integer, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state,
  uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.add_unresolved_aquarium_livestock(
  uuid, text, integer, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state,
  uuid, uuid, text, text
) to authenticated;

commit;

