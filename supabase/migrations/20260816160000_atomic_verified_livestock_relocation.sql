begin;

create or replace function public.relocate_verified_aquarium_livestock(
  source_aquarium_id uuid,
  source_species_record_id uuid,
  source_batch_id uuid,
  source_batch_version integer,
  destination_aquarium_id uuid,
  relocation_quantity integer,
  new_destination_species_record_id uuid,
  new_destination_batch_id uuid,
  operation_key text,
  operation_request_hash text
)
returns table (
  source_aquarium uuid,
  destination_aquarium uuid,
  destination_species_record uuid,
  destination_batch uuid,
  replayed boolean
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  source_species public.aquarium_species%rowtype;
  source_batch public.aquarium_species_batches%rowtype;
  destination_species public.aquarium_species%rowtype;
  existing_operation public.idempotency_records%rowtype;
  operation_replayed boolean := false;
begin
  if current_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if source_aquarium_id = destination_aquarium_id then raise exception 'SAME_AQUARIUM'; end if;
  if relocation_quantity is null or relocation_quantity < 1 then raise exception 'INVALID_RELOCATION_QUANTITY'; end if;
  if source_batch_version is null or source_batch_version < 1 then raise exception 'INVALID_BATCH_VERSION'; end if;
  if new_destination_species_record_id is null or new_destination_batch_id is null then raise exception 'INVALID_RECORD_ID'; end if;
  if operation_key is null or char_length(operation_key) < 1 or char_length(operation_key) > 180 then raise exception 'INVALID_OPERATION_KEY'; end if;
  if operation_request_hash is null or operation_request_hash !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_REQUEST_HASH'; end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':relocation:' || operation_key, 0));

  select * into existing_operation
  from public.idempotency_records
  where owner_id = current_user_id
    and idempotency_key = operation_key
    and deleted_at is null;

  if found then
    if existing_operation.request_hash <> operation_request_hash
      or existing_operation.resource_type <> 'livestock_relocation' then
      raise exception 'DUPLICATE_OPERATION_KEY';
    end if;
    return query select source_aquarium_id, destination_aquarium_id, existing_operation.resource_id, new_destination_batch_id, true;
    return;
  end if;

  perform 1 from public.aquariums
  where id = source_aquarium_id and owner_id = current_user_id and deleted_at is null
  for update;
  if not found then raise exception 'SOURCE_AQUARIUM_NOT_FOUND'; end if;

  perform 1 from public.aquariums
  where id = destination_aquarium_id and owner_id = current_user_id and deleted_at is null
  for update;
  if not found then raise exception 'DESTINATION_AQUARIUM_NOT_FOUND'; end if;

  select * into source_species
  from public.aquarium_species
  where id = source_species_record_id
    and aquarium_id = source_aquarium_id
    and deleted_at is null
  for update;
  if not found then raise exception 'SOURCE_SPECIES_NOT_FOUND'; end if;
  if coalesce(source_species.identity_status, 'verified') <> 'verified'
    or source_species.species_id is null
    or source_species.species_catalog_key is null then
    raise exception 'UNRESOLVED_SOURCE_SPECIES';
  end if;

  select * into source_batch
  from public.aquarium_species_batches
  where id = source_batch_id
    and aquarium_species_id = source_species_record_id
    and deleted_at is null
  for update;
  if not found then raise exception 'SOURCE_BATCH_NOT_FOUND'; end if;
  if source_batch.version <> source_batch_version then raise exception 'SOURCE_BATCH_VERSION_CONFLICT'; end if;
  if relocation_quantity > source_batch.quantity then raise exception 'INVALID_RELOCATION_QUANTITY'; end if;

  perform pg_advisory_xact_lock(hashtextextended(
    current_user_id::text || ':aquarium-species:' || destination_aquarium_id::text || ':' || source_species.species_catalog_key,
    0
  ));

  select * into destination_species
  from public.aquarium_species
  where aquarium_id = destination_aquarium_id
    and species_catalog_key = source_species.species_catalog_key
    and deleted_at is null
  for update;

  if not found then
    insert into public.aquarium_species (
      id, aquarium_id, species_id, species_catalog_key, identity_status, raw_name,
      quantity, entry_date, last_water_change_at
    ) values (
      new_destination_species_record_id, destination_aquarium_id, source_species.species_id,
      source_species.species_catalog_key, 'verified', null,
      relocation_quantity, source_batch.entry_date, null
    ) returning * into destination_species;
  end if;

  insert into public.aquarium_species_batches (
    id, aquarium_species_id, quantity, entry_date, life_stage, reproductive_state, state_updated_at
  ) values (
    new_destination_batch_id, destination_species.id, relocation_quantity, source_batch.entry_date,
    source_batch.life_stage, source_batch.reproductive_state, now()
  );

  if relocation_quantity = source_batch.quantity then
    update public.aquarium_species_batches
    set deleted_at = now()
    where id = source_batch.id;
  else
    update public.aquarium_species_batches
    set quantity = source_batch.quantity - relocation_quantity,
        state_updated_at = now()
    where id = source_batch.id;
  end if;

  insert into public.idempotency_records (
    owner_id, idempotency_key, request_method, request_path, request_hash,
    resource_type, resource_id, response_status, expires_at
  ) values (
    current_user_id, operation_key, 'POST',
    '/api/v1/aquariums/' || source_aquarium_id::text || '/species/' || source_species_record_id::text || '/batches/' || source_batch_id::text || '/relocate',
    operation_request_hash, 'livestock_relocation', destination_species.id, 200,
    now() + interval '7 days'
  );

  return query select source_aquarium_id, destination_aquarium_id, destination_species.id, new_destination_batch_id, operation_replayed;
end;
$$;

revoke all on function public.relocate_verified_aquarium_livestock(uuid, uuid, uuid, integer, uuid, integer, uuid, uuid, text, text) from public;
revoke all on function public.relocate_verified_aquarium_livestock(uuid, uuid, uuid, integer, uuid, integer, uuid, uuid, text, text) from anon;
grant execute on function public.relocate_verified_aquarium_livestock(uuid, uuid, uuid, integer, uuid, integer, uuid, uuid, text, text) to authenticated;

commit;
