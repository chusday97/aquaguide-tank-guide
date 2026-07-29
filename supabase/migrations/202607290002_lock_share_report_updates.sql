begin;

drop policy if exists aquarium_share_reports_owner_update
on public.aquarium_share_reports;

comment on table public.aquarium_share_reports is
  'Owner-readable immutable snapshots. Revocation is performed only by the authenticated Express API through service_role after owner verification.';

commit;
