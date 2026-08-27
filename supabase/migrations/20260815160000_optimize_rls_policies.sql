begin;

-- User-owned policies only apply to signed-in users. Wrapping auth.uid() in a
-- scalar SELECT lets Postgres evaluate the JWT lookup once per statement rather
-- than once per candidate row.
alter policy profiles_select_own on public.profiles
  to authenticated
  using (user_id = (select auth.uid()));
alter policy profiles_insert_own on public.profiles
  to authenticated
  with check (user_id = (select auth.uid()));
alter policy profiles_update_own on public.profiles
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
alter policy profiles_delete_own on public.profiles
  to authenticated
  using (user_id = (select auth.uid()));

alter policy user_roles_select_own on public.user_roles
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

alter policy aquariums_owner_all on public.aquariums
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

alter policy aquarium_species_owner_all on public.aquarium_species
  to authenticated
  using (
    exists (
      select 1
      from public.aquariums a
      where a.id = aquarium_id
        and a.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.aquariums a
      where a.id = aquarium_id
        and a.owner_id = (select auth.uid())
    )
  );

alter policy aquarium_equipment_owner_all on public.aquarium_equipment
  to authenticated
  using (
    exists (
      select 1
      from public.aquariums a
      where a.id = aquarium_id
        and a.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.aquariums a
      where a.id = aquarium_id
        and a.owner_id = (select auth.uid())
    )
  );

alter policy aquarium_components_owner_all on public.aquarium_components
  to authenticated
  using (
    exists (
      select 1
      from public.aquariums a
      where a.id = aquarium_id
        and a.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.aquariums a
      where a.id = aquarium_id
        and a.owner_id = (select auth.uid())
    )
  );

alter policy aquarium_species_batches_owner_all on public.aquarium_species_batches
  to authenticated
  using (
    exists (
      select 1
      from public.aquarium_species s
      join public.aquariums a on a.id = s.aquarium_id
      where s.id = aquarium_species_id
        and s.deleted_at is null
        and a.deleted_at is null
        and a.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.aquarium_species s
      join public.aquariums a on a.id = s.aquarium_id
      where s.id = aquarium_species_id
        and s.deleted_at is null
        and a.deleted_at is null
        and a.owner_id = (select auth.uid())
    )
  );

alter policy diagnosis_owner_all on public.diagnosis_records
  to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.aquariums a
      where a.id = aquarium_id
        and a.owner_id = (select auth.uid())
    )
  )
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.aquariums a
      where a.id = aquarium_id
        and a.owner_id = (select auth.uid())
    )
  );

alter policy species_favorites_owner_all on public.species_favorites
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

alter policy care_favorites_owner_all on public.care_favorites
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

alter policy memorial_owner_all on public.memorial_records
  to authenticated
  using (
    owner_id = (select auth.uid())
    and (
      aquarium_id is null
      or exists (
        select 1
        from public.aquariums a
        where a.id = aquarium_id
          and a.owner_id = (select auth.uid())
      )
    )
  )
  with check (
    owner_id = (select auth.uid())
    and (
      aquarium_id is null
      or exists (
        select 1
        from public.aquariums a
        where a.id = aquarium_id
          and a.owner_id = (select auth.uid())
      )
    )
  );

alter policy care_reminders_owner_all on public.care_reminders
  to authenticated
  using (
    owner_id = (select auth.uid())
    and (
      aquarium_id is null
      or exists (
        select 1
        from public.aquariums a
        where a.id = aquarium_id
          and a.owner_id = (select auth.uid())
      )
    )
  )
  with check (
    owner_id = (select auth.uid())
    and (
      aquarium_id is null
      or exists (
        select 1
        from public.aquariums a
        where a.id = aquarium_id
          and a.owner_id = (select auth.uid())
      )
    )
  );

alter policy care_events_owner_all on public.care_events
  to authenticated
  using (
    owner_id = (select auth.uid())
    and (
      aquarium_id is null
      or exists (
        select 1
        from public.aquariums a
        where a.id = aquarium_id
          and a.owner_id = (select auth.uid())
      )
    )
  )
  with check (
    owner_id = (select auth.uid())
    and (
      aquarium_id is null
      or exists (
        select 1
        from public.aquariums a
        where a.id = aquarium_id
          and a.owner_id = (select auth.uid())
      )
    )
  );

alter policy migration_batches_owner_all on public.migration_batches
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

alter policy idempotency_records_owner_all on public.idempotency_records
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

alter policy aquarium_share_reports_owner_select on public.aquarium_share_reports
  to authenticated
  using (owner_id = (select auth.uid()));

-- Avoid overlapping SELECT policies: public SELECT already includes the admin
-- path, so keep admin mutations as action-specific policies instead of FOR ALL.
drop policy if exists compatibility_profile_sources_admin_all
  on public.species_compatibility_profile_sources;
create policy compatibility_profile_sources_admin_insert
  on public.species_compatibility_profile_sources for insert
  to authenticated
  with check (public.is_admin());
create policy compatibility_profile_sources_admin_update
  on public.species_compatibility_profile_sources for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy compatibility_profile_sources_admin_delete
  on public.species_compatibility_profile_sources for delete
  to authenticated
  using (public.is_admin());

drop policy if exists pair_compatibility_rule_sources_admin_all
  on public.species_pair_compatibility_rule_sources;
create policy pair_compatibility_rule_sources_admin_insert
  on public.species_pair_compatibility_rule_sources for insert
  to authenticated
  with check (public.is_admin());
create policy pair_compatibility_rule_sources_admin_update
  on public.species_pair_compatibility_rule_sources for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy pair_compatibility_rule_sources_admin_delete
  on public.species_pair_compatibility_rule_sources for delete
  to authenticated
  using (public.is_admin());

commit;

