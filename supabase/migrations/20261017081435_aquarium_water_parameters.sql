begin;

alter table public.aquariums
  add column if not exists ph numeric(4, 2),
  add column if not exists hardness_dgh numeric(6, 2);

alter table public.aquariums
  add constraint aquariums_ph_range_check
  check (ph is null or (ph >= 0 and ph <= 14));

alter table public.aquariums
  add constraint aquariums_hardness_dgh_range_check
  check (hardness_dgh is null or (hardness_dgh >= 0 and hardness_dgh <= 100));

commit;
