begin;

-- Share reports are created only by the Express API after it verifies aquarium
-- ownership and overwrites the token hash, frozen snapshot, and seven-day expiry.
drop policy if exists aquarium_share_reports_owner_insert
on public.aquarium_share_reports;

commit;
