begin;

create or replace function public.remove_aquarium_species_batch_quantity(
  expected_aquarium_id uuid,
  expected_species_record_id uuid,
  target_batch_id uuid,
  removal_quantity integer,
  operation_key text,
  operation_request_hash text
)
returns table (aquarium_id uuid, replayed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_batch public.aquarium_species_batches%rowtype;
  existing_operation public.idempotency_records%rowtype;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if removal_quantity is null or removal_quantity < 1 then
    raise exception 'INVALID_REMOVAL_QUANTITY';
  end if;
  if operation_key is null or char_length(operation_key) < 1 or char_length(operation_key) > 180 then
    raise exception 'INVALID_OPERATION_KEY';
  end if;
  if operation_request_hash is null or operation_request_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_REQUEST_HASH';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':' || operation_key, 0));

  select *
  into existing_operation
  from public.idempotency_records
  where owner_id = current_user_id
    and idempotency_key = operation_key
    and deleted_at is null;

  if found then
    if existing_operation.request_hash <> operation_request_hash
      or existing_operation.resource_type <> 'livestock_removal'
      or existing_operation.resource_id <> expected_aquarium_id then
      raise exception 'DUPLICATE_OPERATION_KEY';
    end if;
    return query select expected_aquarium_id, true;
    return;
  end if;

  select batch.*
  into current_batch
  from public.aquarium_species_batches batch
  join public.aquarium_species species_record on species_record.id = batch.aquarium_species_id
  join public.aquariums aquarium on aquarium.id = species_record.aquarium_id
  where batch.id = target_batch_id
    and batch.aquarium_species_id = expected_species_record_id
    and species_record.aquarium_id = expected_aquarium_id
    and batch.deleted_at is null
    and species_record.deleted_at is null
    and aquarium.deleted_at is null
    and aquarium.owner_id = current_user_id
  for update of batch;

  if not found then
    raise exception 'BATCH_NOT_FOUND';
  end if;
  if removal_quantity > current_batch.quantity then
    raise exception 'INVALID_REMOVAL_QUANTITY';
  end if;

  if removal_quantity = current_batch.quantity then
    update public.aquarium_species_batches
    set deleted_at = now()
    where id = target_batch_id;
  else
    update public.aquarium_species_batches
    set quantity = current_batch.quantity - removal_quantity,
        state_updated_at = now()
    where id = target_batch_id;
  end if;

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
    '/api/v1/aquariums/' || expected_aquarium_id::text || '/species/' || expected_species_record_id::text || '/batches/' || target_batch_id::text || '/remove',
    operation_request_hash,
    'livestock_removal',
    expected_aquarium_id,
    200,
    now() + interval '7 days'
  );

  return query select expected_aquarium_id, false;
end;
$$;

revoke all on function public.remove_aquarium_species_batch_quantity(uuid, uuid, uuid, integer, text, text) from public;
grant execute on function public.remove_aquarium_species_batch_quantity(uuid, uuid, uuid, integer, text, text) to authenticated;

commit;
