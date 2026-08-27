begin;

-- Keep the privileged admin lookup outside the exposed public schema. The public
-- wrapper remains SECURITY INVOKER so RLS policies can keep calling public.is_admin()
-- without exposing a SECURITY DEFINER RPC through the Data API.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
      and deleted_at is null
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_admin();
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Trigger-only helpers must not be directly callable through the public API.
alter function public.set_updated_at_and_version()
  set search_path = '';
revoke all on function public.set_updated_at_and_version() from public, anon, authenticated;

alter function public.handle_new_auth_user()
  set search_path = '';
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

alter function public.sync_aquarium_species_batch_quantity()
  security invoker;
alter function public.sync_aquarium_species_batch_quantity()
  set search_path = '';
revoke all on function public.sync_aquarium_species_batch_quantity() from public, anon, authenticated;

-- User-facing mutation RPCs execute as the authenticated caller and rely on RLS
-- plus their existing ownership/idempotency checks. Explicitly remove anon access
-- because Supabase project defaults can grant EXECUTE to API roles on new routines.
alter function public.split_aquarium_species_batch(
  uuid, uuid, integer, integer, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state, uuid
) security invoker;
alter function public.split_aquarium_species_batch(
  uuid, uuid, integer, integer, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state, uuid
) set search_path = '';
revoke all on function public.split_aquarium_species_batch(
  uuid, uuid, integer, integer, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state, uuid
) from public, anon, authenticated;
grant execute on function public.split_aquarium_species_batch(
  uuid, uuid, integer, integer, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state, uuid
) to authenticated;

alter function public.merge_aquarium_species_batches(
  uuid, uuid, uuid, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state, integer, integer
) security invoker;
alter function public.merge_aquarium_species_batches(
  uuid, uuid, uuid, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state, integer, integer
) set search_path = '';
revoke all on function public.merge_aquarium_species_batches(
  uuid, uuid, uuid, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state, integer, integer
) from public, anon, authenticated;
grant execute on function public.merge_aquarium_species_batches(
  uuid, uuid, uuid, date,
  public.aquarium_life_stage, public.aquarium_reproductive_state, integer, integer
) to authenticated;

alter function public.record_livestock_memorial(
  uuid, uuid, uuid, integer, date, text[], text, text, text, uuid
) security invoker;
alter function public.record_livestock_memorial(
  uuid, uuid, uuid, integer, date, text[], text, text, text, uuid
) set search_path = '';
revoke all on function public.record_livestock_memorial(
  uuid, uuid, uuid, integer, date, text[], text, text, text, uuid
) from public, anon, authenticated;
grant execute on function public.record_livestock_memorial(
  uuid, uuid, uuid, integer, date, text[], text, text, text, uuid
) to authenticated;

alter function public.remove_aquarium_species_batch_quantity(
  uuid, uuid, uuid, integer, text, text
) security invoker;
alter function public.remove_aquarium_species_batch_quantity(
  uuid, uuid, uuid, integer, text, text
) set search_path = '';
revoke all on function public.remove_aquarium_species_batch_quantity(
  uuid, uuid, uuid, integer, text, text
) from public, anon, authenticated;
grant execute on function public.remove_aquarium_species_batch_quantity(
  uuid, uuid, uuid, integer, text, text
) to authenticated;

alter function public.complete_care_reminder_with_recurrence(
  uuid, integer, timestamptz, uuid, text, text
) security invoker;
alter function public.complete_care_reminder_with_recurrence(
  uuid, integer, timestamptz, uuid, text, text
) set search_path = '';
revoke all on function public.complete_care_reminder_with_recurrence(
  uuid, integer, timestamptz, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.complete_care_reminder_with_recurrence(
  uuid, integer, timestamptz, uuid, text, text
) to authenticated;

alter function public.add_aquarium_livestock(
  uuid, text, integer, date, timestamptz,
  public.aquarium_life_stage, public.aquarium_reproductive_state,
  uuid, uuid, text, text
) security invoker;
alter function public.add_aquarium_livestock(
  uuid, text, integer, date, timestamptz,
  public.aquarium_life_stage, public.aquarium_reproductive_state,
  uuid, uuid, text, text
) set search_path = '';
revoke all on function public.add_aquarium_livestock(
  uuid, text, integer, date, timestamptz,
  public.aquarium_life_stage, public.aquarium_reproductive_state,
  uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.add_aquarium_livestock(
  uuid, text, integer, date, timestamptz,
  public.aquarium_life_stage, public.aquarium_reproductive_state,
  uuid, uuid, text, text
) to authenticated;

-- Reassert the already-correct water-change RPC contract so all public mutations
-- follow one explicit grant pattern.
alter function public.set_aquarium_water_change_day(uuid, date, boolean, text, text)
  security invoker;
alter function public.set_aquarium_water_change_day(uuid, date, boolean, text, text)
  set search_path = '';
revoke all on function public.set_aquarium_water_change_day(uuid, date, boolean, text, text)
  from public, anon, authenticated;
grant execute on function public.set_aquarium_water_change_day(uuid, date, boolean, text, text)
  to authenticated;

commit;
