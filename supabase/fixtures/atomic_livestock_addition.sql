begin;

create or replace function public.fail_test_batch_insert()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.fail_batch_insert', true) = 'on' then
    raise exception 'INJECTED_BATCH_FAILURE';
  end if;
  return new;
end;
$$;

create trigger fail_test_batch_insert
before insert on public.aquarium_species_batches
for each row execute function public.fail_test_batch_insert();

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('app.fail_batch_insert', 'on', true);
set local role authenticated;

do $$
begin
  perform * from public.add_aquarium_livestock(
    '20000000-0000-4000-8000-000000000001', 'sp_0001', 2, '2026-08-09', null,
    'unknown', 'unknown',
    '40000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    'record-existing-sp-0001', repeat('a', 64)
  );
  raise exception 'EXPECTED_BATCH_FAILURE';
exception
  when others then
    if sqlerrm <> 'INJECTED_BATCH_FAILURE' then raise; end if;
end;
$$;

reset role;

do $$
begin
  if (select count(*) from public.aquarium_species) <> 0 then
    raise exception 'PARENT_WAS_NOT_ROLLED_BACK';
  end if;
  if (select count(*) from public.aquarium_species_batches) <> 0 then
    raise exception 'BATCH_WAS_NOT_ROLLED_BACK';
  end if;
  if (select count(*) from public.idempotency_records) <> 0 then
    raise exception 'OPERATION_WAS_NOT_ROLLED_BACK';
  end if;
end;
$$;

select set_config('app.fail_batch_insert', 'off', true);
set local role authenticated;

select * from public.add_aquarium_livestock(
  '20000000-0000-4000-8000-000000000001', 'sp_0001', 2, '2026-08-09', null,
  'unknown', 'unknown',
  '40000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  'record-existing-sp-0001', repeat('a', 64)
);

select * from public.add_aquarium_livestock(
  '20000000-0000-4000-8000-000000000001', 'sp_0001', 2, '2026-08-09', null,
  'unknown', 'unknown',
  '40000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  'record-existing-sp-0001', repeat('a', 64)
);

reset role;

do $$
declare
  parent_quantity integer;
  batch_quantity integer;
begin
  if (select count(*) from public.aquarium_species) <> 1 then raise exception 'EXPECTED_ONE_PARENT'; end if;
  if (select count(*) from public.aquarium_species_batches) <> 1 then raise exception 'EXPECTED_ONE_BATCH'; end if;
  if (select count(*) from public.idempotency_records) <> 1 then raise exception 'EXPECTED_ONE_OPERATION'; end if;
  select quantity into parent_quantity from public.aquarium_species;
  select sum(quantity)::integer into batch_quantity from public.aquarium_species_batches where deleted_at is null;
  if parent_quantity <> batch_quantity then raise exception 'PARENT_BATCH_QUANTITY_MISMATCH'; end if;
end;
$$;

rollback;
