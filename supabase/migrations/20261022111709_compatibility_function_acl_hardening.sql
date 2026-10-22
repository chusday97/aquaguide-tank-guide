revoke all on function public.bump_compatibility_authority_state()
  from public, anon, authenticated;
grant execute on function public.bump_compatibility_authority_state()
  to service_role;

revoke all on function public.bump_compatibility_for_evidence_change()
  from public, anon, authenticated;
grant execute on function public.bump_compatibility_for_evidence_change()
  to service_role;

revoke all on function public.bump_compatibility_for_species_publication()
  from public, anon, authenticated;
grant execute on function public.bump_compatibility_for_species_publication()
  to service_role;

revoke all on function public.publish_compatibility_profile_revision(uuid,integer)
  from public, anon, authenticated;
grant execute on function public.publish_compatibility_profile_revision(uuid,integer)
  to authenticated, service_role;

revoke all on function public.publish_compatibility_pair_rule_revision(uuid,integer)
  from public, anon, authenticated;
grant execute on function public.publish_compatibility_pair_rule_revision(uuid,integer)
  to authenticated, service_role;
