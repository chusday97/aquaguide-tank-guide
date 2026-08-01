begin;

alter table public.memorial_records
  add column if not exists cause_codes text[] not null default '{}'::text[];

alter table public.memorial_records
  drop constraint if exists memorial_records_cause_codes_check;

alter table public.memorial_records
  add constraint memorial_records_cause_codes_check check (
    cardinality(cause_codes) <= 5
    and cause_codes <@ array[
      'water_quality_change',
      'oxygen_shortage',
      'temperature_stress',
      'acclimation_stress',
      'aggression_or_injury',
      'feeding_or_digestive',
      'suspected_illness',
      'recent_medication_or_change',
      'age_related',
      'unknown',
      'other'
    ]::text[]
    and (not ('unknown' = any(cause_codes)) or cardinality(cause_codes) = 1)
  );

alter table public.feedback_submissions
  add column if not exists email_delivery_status text not null default 'not_configured',
  add column if not exists email_delivery_id text,
  add column if not exists email_delivery_error text,
  add column if not exists emailed_at timestamptz;

alter table public.feedback_submissions
  drop constraint if exists feedback_submissions_email_delivery_status_check;

alter table public.feedback_submissions
  add constraint feedback_submissions_email_delivery_status_check check (
    email_delivery_status in ('not_configured', 'sent', 'failed')
  );

drop function if exists public.record_livestock_memorial(uuid, uuid, uuid, integer, date, text, text, text, uuid);

create or replace function public.record_livestock_memorial(
  target_aquarium_id uuid,
  target_species_record_id uuid,
  target_batch_id uuid,
  target_batch_version integer,
  target_memorial_date date,
  target_cause_codes text[],
  target_observation text,
  target_reason text,
  target_improvement text,
  new_memorial_id uuid
)
returns public.memorial_records
language plpgsql
as $$
declare
  batch_row public.aquarium_species_batches%rowtype;
  species_record public.aquarium_species%rowtype;
  memorial_row public.memorial_records%rowtype;
begin
  select * into memorial_row from public.memorial_records where id = new_memorial_id;
  if found then return memorial_row; end if;

  select * into batch_row
  from public.aquarium_species_batches
  where id = target_batch_id
    and aquarium_species_id = target_species_record_id
    and version = target_batch_version
    and deleted_at is null
  for update;
  if not found then raise exception using errcode = '40001', message = 'BATCH_VERSION_CONFLICT'; end if;

  select * into species_record
  from public.aquarium_species
  where id = target_species_record_id
    and aquarium_id = target_aquarium_id
    and deleted_at is null;
  if not found then raise exception using errcode = '42501', message = 'SPECIES_PATH_MISMATCH'; end if;

  if batch_row.quantity = 1 then
    update public.aquarium_species_batches set deleted_at = now() where id = target_batch_id;
  else
    update public.aquarium_species_batches set quantity = batch_row.quantity - 1 where id = target_batch_id;
  end if;

  insert into public.memorial_records (
    id,
    owner_id,
    aquarium_id,
    species_id,
    species_catalog_key,
    memorial_date,
    cause_codes,
    observation,
    reason,
    improvement
  ) values (
    new_memorial_id,
    auth.uid(),
    species_record.aquarium_id,
    species_record.species_id,
    species_record.species_catalog_key,
    target_memorial_date,
    coalesce(target_cause_codes, '{}'::text[]),
    target_observation,
    target_reason,
    target_improvement
  ) returning * into memorial_row;

  return memorial_row;
end;
$$;

revoke all on function public.record_livestock_memorial(uuid, uuid, uuid, integer, date, text[], text, text, text, uuid) from public;
grant execute on function public.record_livestock_memorial(uuid, uuid, uuid, integer, date, text[], text, text, text, uuid) to authenticated;

commit;
