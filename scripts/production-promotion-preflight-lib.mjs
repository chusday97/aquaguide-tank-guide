export function evaluateProductionPromotionPreflight({
  userSitePhase,
  supabaseProjectStatus,
  coreUserStateParityVerified,
  productionFrozen,
  mainSynchronized,
  deferredAdminMigrationCount,
}) {
  const blockers = [];
  if (userSitePhase !== 'READY_FOR_PROMOTION_DECISION') blockers.push('user_site_not_ready_for_promotion_decision');
  if (productionFrozen !== true) blockers.push('production_freeze_not_preserved');
  if (mainSynchronized !== true) blockers.push('canonical_main_not_synchronized');
  if (supabaseProjectStatus !== 'ACTIVE_HEALTHY') blockers.push(`supabase_not_active:${supabaseProjectStatus ?? 'unknown'}`);
  if (coreUserStateParityVerified !== true) blockers.push('core_user_state_parity_not_verified');

  const deferredMigrations = Number.isInteger(deferredAdminMigrationCount) ? deferredAdminMigrationCount : null;
  return {
    phase: blockers.length === 0 ? 'READY_TO_PROMOTE' : 'BLOCKED_PRE_PROMOTION',
    promotionAuthorized: false,
    blockers,
    facts: {
      userSitePhase,
      supabaseProjectStatus,
      coreUserStateParityVerified: Boolean(coreUserStateParityVerified),
      productionFrozen: Boolean(productionFrozen),
      mainSynchronized: Boolean(mainSynchronized),
      deferredAdminMigrationCount: deferredMigrations,
    },
    separateWork: {
      adminSeoDatabaseParity: deferredMigrations && deferredMigrations > 0
        ? 'DEFERRED_NOT_CORE_BLOCKER'
        : 'NO_DEFERRED_MIGRATIONS_RECORDED',
    },
    requiredActions: [
      ...(supabaseProjectStatus !== 'ACTIVE_HEALTHY'
        ? ['Restore/activate the AquaGuide Supabase project before any Production promotion.']
        : []),
      ...(coreUserStateParityVerified !== true
        ? ['Verify the core mutable user-state tables, RLS, and runtime RPC permissions read-only before any Production promotion.']
        : []),
      ...(deferredMigrations && deferredMigrations > 0
        ? [`Keep ${deferredMigrations} Admin/SEO/database-knowledge migrations in a separate review and authorization track; they are not a core user-site promotion blocker.`]
        : []),
      'Only after all core preflight blockers are cleared may release/production be fast-forwarded to the accepted main SHA.',
      'Production deployment and any database migration remain separate explicit actions.',
    ],
  };
}
