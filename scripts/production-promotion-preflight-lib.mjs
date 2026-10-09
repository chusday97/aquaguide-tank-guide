export function evaluateProductionPromotionPreflight({
  userSitePhase,
  supabaseProjectStatus,
  supabaseParityVerified,
  productionFrozen,
  mainSynchronized,
  pendingMigrationCount,
}) {
  const blockers = [];
  if (userSitePhase !== 'READY_FOR_PROMOTION_DECISION') blockers.push('user_site_not_ready_for_promotion_decision');
  if (productionFrozen !== true) blockers.push('production_freeze_not_preserved');
  if (mainSynchronized !== true) blockers.push('canonical_main_not_synchronized');
  if (supabaseProjectStatus !== 'ACTIVE_HEALTHY') blockers.push(`supabase_not_active:${supabaseProjectStatus ?? 'unknown'}`);
  if (supabaseParityVerified !== true) blockers.push('supabase_parity_not_verified');

  const pendingMigrations = Number.isInteger(pendingMigrationCount) ? pendingMigrationCount : null;
  return {
    phase: blockers.length === 0 ? 'READY_TO_PROMOTE' : 'BLOCKED_PRE_PROMOTION',
    promotionAuthorized: false,
    blockers,
    facts: {
      userSitePhase,
      supabaseProjectStatus,
      supabaseParityVerified: Boolean(supabaseParityVerified),
      productionFrozen: Boolean(productionFrozen),
      mainSynchronized: Boolean(mainSynchronized),
      pendingMigrationCount: pendingMigrations,
    },
    requiredActions: [
      ...(supabaseProjectStatus !== 'ACTIVE_HEALTHY' ? ['Restore/activate the AquaGuide Supabase project through an explicitly authorized operator action.'] : []),
      ...(supabaseParityVerified !== true ? ['After Supabase is readable, perform a read-only migration/schema parity check before any Production promotion.'] : []),
      ...(pendingMigrations && pendingMigrations > 0 ? ['Classify and explicitly authorize required Production migrations before applying any of them.'] : []),
      'Only after all preflight blockers are cleared may release/production be fast-forwarded to the accepted main SHA.',
      'Deployment and database migration remain separate explicit actions.',
    ],
  };
}
