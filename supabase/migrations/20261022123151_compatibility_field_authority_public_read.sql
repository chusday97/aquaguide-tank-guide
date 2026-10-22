grant select on table public.species_compatibility_field_reviews to anon, authenticated;
grant select on table public.species_compatibility_field_review_sources to anon, authenticated;

drop policy if exists "public_read_published_reviewed_compatibility_fields"
  on public.species_compatibility_field_reviews;
create policy "public_read_published_reviewed_compatibility_fields"
  on public.species_compatibility_field_reviews
  for select
  to anon, authenticated
  using (
    review_status = 'reviewed'
    and resolution = 'supported'
    and deleted_at is null
    and exists (
      select 1
      from public.species s
      where s.id = species_compatibility_field_reviews.species_id
        and s.status = 'published'
        and s.deleted_at is null
    )
  );

drop policy if exists "public_read_published_reviewed_compatibility_field_sources"
  on public.species_compatibility_field_review_sources;
create policy "public_read_published_reviewed_compatibility_field_sources"
  on public.species_compatibility_field_review_sources
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.species_compatibility_field_reviews r
      join public.species s on s.id = r.species_id
      where r.id = species_compatibility_field_review_sources.field_review_id
        and r.review_status = 'reviewed'
        and r.resolution = 'supported'
        and r.deleted_at is null
        and s.status = 'published'
        and s.deleted_at is null
    )
  );

notify pgrst, 'reload schema';
