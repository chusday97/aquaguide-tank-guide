begin;

create or replace function public.add_aquarium_livestock(
  target_aquarium_id uuid,
  target_species_catalog_key text,
  target_quantity integer,
  target_entry_date date,
  target_last_water_change_at timestamptz,
  target_life_stage public.aquarium_life_stage,
  target_reproductive_state public.aquarium_reproductive_state,
  new_species_record_id uuid,
  new_batch_id uuid,
  operation_key text,
  operation_request_hash text
)
returns table (species_record_id uuid, batch_id uuid, replayed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_aquarium public.aquariums%rowtype;
  current_species public.species%rowtype;
  current_species_record public.aquarium_species%rowtype;
  current_batch public.aquarium_species_batches%rowtype;
  existing_operation public.idempotency_records%rowtype;
begin
  if current_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if target_quantity is null or target_quantity < 1 then raise exception 'INVALID_QUANTITY'; end if;
  if target_entry_date is null then raise exception 'INVALID_ENTRY_DATE'; end if;
  if new_species_record_id is null or new_batch_id is null then raise exception 'INVALID_RECORD_ID'; end if;
  if operation_key is null or char_length(operation_key) < 1 or char_length(operation_key) > 180 then
    raise exception 'INVALID_OPERATION_KEY';
  end if;
  if operation_request_hash is null or operation_request_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_REQUEST_HASH';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':operation:' || operation_key, 0));

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

  select * into current_aquarium
  from public.aquariums
  where id = target_aquarium_id
    and owner_id = current_user_id
    and deleted_at is null;
  if not found then raise exception 'AQUARIUM_NOT_FOUND'; end if;

  select * into current_species
  from public.species
  where catalog_key = target_species_catalog_key
    and status = 'published'
    and deleted_at is null;
  if not found then raise exception 'SPECIES_NOT_FOUND'; end if;

  perform pg_advisory_xact_lock(hashtextextended(
    current_user_id::text || ':aquarium-species:' || target_aquarium_id::text || ':' || target_species_catalog_key,
    0
  ));

  select * into current_species_record
  from public.aquarium_species
  where aquarium_id = target_aquarium_id
    and species_catalog_key = target_species_catalog_key
    and deleted_at is null
  for update;

  if not found then
    insert into public.aquarium_species (
      id, aquarium_id, species_id, species_catalog_key, quantity, entry_date, last_water_change_at
    ) values (
      new_species_record_id, target_aquarium_id, current_species.id, current_species.catalog_key,
      target_quantity, target_entry_date, target_last_water_change_at
    ) returning * into current_species_record;
  end if;

  select * into current_batch
  from public.aquarium_species_batches
  where id = new_batch_id
    and deleted_at is null;

  if found then
    if current_batch.aquarium_species_id <> current_species_record.id
      or current_batch.quantity <> target_quantity
      or current_batch.entry_date <> target_entry_date
      or current_batch.life_stage <> target_life_stage
      or current_batch.reproductive_state <> target_reproductive_state then
      raise exception 'DUPLICATE_BATCH_ID';
    end if;
  else
    insert into public.aquarium_species_batches (
      id, aquarium_species_id, quantity, entry_date, life_stage, reproductive_state, state_updated_at
    ) values (
      new_batch_id, current_species_record.id, target_quantity, target_entry_date,
      target_life_stage, target_reproductive_state, now()
    ) returning * into current_batch;
  end if;

  insert into public.idempotency_records (
    owner_id, idempotency_key, request_method, request_path, request_hash,
    resource_type, resource_id, response_status, expires_at
  ) values (
    current_user_id, operation_key, 'POST',
    '/api/v1/aquariums/' || target_aquarium_id::text || '/species',
    operation_request_hash, 'aquarium_species', current_species_record.id, 201,
    now() + interval '7 days'
  );

  return query select current_species_record.id, current_batch.id, false;
end;
$$;

revoke all on function public.add_aquarium_livestock(
  uuid, text, integer, date, timestamptz, public.aquarium_life_stage,
  public.aquarium_reproductive_state, uuid, uuid, text, text
) from public;
grant execute on function public.add_aquarium_livestock(
  uuid, text, integer, date, timestamptz, public.aquarium_life_stage,
  public.aquarium_reproductive_state, uuid, uuid, text, text
) to authenticated;

commit;
