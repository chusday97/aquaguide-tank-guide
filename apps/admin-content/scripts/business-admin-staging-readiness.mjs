export const AQUAGUIDE_LIVE_MIGRATION_BASELINE = '20261021142700';

export const BUSINESS_ADMIN_AUTHORITY_MIGRATIONS = [
  '202609040001_product_care_publication_snapshots.sql',
  '202609040002_compatibility_profile_revisions.sql',
  '202609040003_compatibility_pair_rule_revisions.sql',
  '202609040004_compatibility_revision_review_gate.sql',
  '202609050001_compatibility_reviewed_baseline_reconciliation.sql',
  '202609050002_compatibility_versioned_publish.sql',
  '202609050003_content_publication_audit_history.sql',
  '202609050004_care_seo_editorial_revisions.sql',
  '202609110001_compatibility_v3_profile_authority.sql',
  '202609120001_compatibility_recovery_baseline.sql',
  '202609120002_compatibility_harlequin_baseline.sql',
  '202609120003_compatibility_black_skirt_baseline.sql',
  '202609120004_compatibility_cherry_barb_baseline.sql',
  '202609120005_compatibility_ember_tetra_baseline.sql',
  '202609120006_compatibility_denison_barb_baseline.sql',
  '202609120007_compatibility_congo_tetra_baseline.sql',
  '202609120008_compatibility_pearl_gourami_baseline.sql',
  '202609120009_compatibility_agassizii_baseline.sql',
  '202609120010_compatibility_ramirezi_baseline.sql',
  '202609120011_compatibility_discus_baseline.sql',
  '202609120012_compatibility_pygmy_cory_baseline.sql',
  '202609120013_compatibility_sewellia_baseline.sql',
  '202609120014_compatibility_clown_loach_baseline.sql',
  '202609120015_compatibility_red_rainbowfish_baseline.sql',
  '202609160001_compatibility_rummy_oto_oscar_baseline.sql',
  '202610090002_compatibility_rummy_evidence_legacy_bridge.sql',
  '202610090003_compatibility_runtime_authority_reconciliation.sql',
  '20261010101020_compatibility_kissing_gourami_authority.sql',
  '20261010151338_compatibility_next_wave_freshwater_authority.sql',
  '20261010164051_compatibility_macropodus_spechti_authority.sql',
  '20261011020543_compatibility_next_wave_marine_authority.sql',
  '20261011111500_compatibility_chindongo_socolofi_authority.sql',
  '20261011124500_compatibility_opsariichthys_bidens_authority.sql',
  '20261011162500_compatibility_pseudorasbora_parva_authority.sql',
  '20261011170000_compatibility_next_wave_freshwater_batch_authority.sql',
  '20261011213000_compatibility_unified_next_wave_batch_authority.sql',
  '20261011234500_compatibility_unified_next25_authority.sql',
  '20261012001500_compatibility_unified_wave04_authority.sql',
  '20261012014500_compatibility_unified_wave05_authority.sql',
  '20261012023000_compatibility_unified_wave06_authority.sql',
  '20261013153000_compatibility_unified_wave16_authority.sql',
  '20261014133500_compatibility_fast_lane_authority_patch.sql',
  '20261014143000_compatibility_fast_lane_wave2_authority_patch.sql',
  '20261014152500_compatibility_fast_lane_wave3_authority_patch.sql',
  '20261014163500_compatibility_fast_lane_wave4_authority_patch.sql',
  '20261015211500_compatibility_identity_bridge_reconciliation.sql',
  '20261016184500_compatibility_chrysiptera_cyanea_authority_reconciliation.sql',
  '20261020193000_compatibility_reviewed_authority_reconciliation.sql',
  '20261021142700_compatibility_materialized_authority_reconciliation.sql',
];

// Production already includes every committed migration through the live baseline.
// A persistent staging clone taken from current Production therefore has no repository
// migration delta today; the contract test fails closed as soon as a newer migration appears.
export const BUSINESS_ADMIN_STAGING_UPGRADE_MIGRATIONS = [];

export const BUSINESS_ADMIN_SCHEMA_GROUPS = {
  access: ['user_roles', 'idempotency_records'],
  productCare: [
    'species', 'species_feeding_profiles', 'care_articles', 'care_article_steps', 'care_article_assets',
    'content_publications', 'content_publication_events',
  ],
  compatibility: [
    'species_compatibility_profiles', 'species_compatibility_profile_sources',
    'species_pair_compatibility_rules', 'species_pair_compatibility_rule_sources',
    'evidence_sources', 'compatibility_authority_state',
    'species_compatibility_profile_revisions', 'species_compatibility_profile_revision_sources',
    'species_pair_compatibility_rule_revisions', 'species_pair_compatibility_rule_revision_sources',
  ],
  careSeo: ['care_seo_editorial_revisions'],
};

export const BUSINESS_ADMIN_SCHEMA_COLUMN_PROBES = {
  content_publications: ['snapshot', 'source_version'],
  evidence_sources: ['source_key'],
  species_compatibility_profile_revisions: ['impact_report', 'evidence_resolution', 'regression_report'],
  species_pair_compatibility_rule_revisions: ['impact_report', 'evidence_resolution', 'regression_report'],
};

export const BUSINESS_ADMIN_ACCEPTANCE_DATA_REQUIREMENTS = [
  { key: 'admin_roles', label: 'Admin role', minimum: 1 },
  { key: 'species', label: 'Species rows', minimum: 1 },
  { key: 'care_articles', label: 'Care rows', minimum: 1 },
  { key: 'reviewed_profiles', label: 'Reviewed Compatibility profiles', minimum: 1 },
  { key: 'reviewed_pair_rules', label: 'Reviewed Compatibility pair rules', minimum: 1 },
  { key: 'reviewed_evidence', label: 'Reviewed Evidence sources', minimum: 1 },
];

export const flattenBusinessAdminSchemaTables = () => [...new Set(Object.values(BUSINESS_ADMIN_SCHEMA_GROUPS).flat())];

export function evaluateBusinessAdminStagingReadiness({ tableStates = {}, counts = {} } = {}) {
  const groups = Object.fromEntries(Object.entries(BUSINESS_ADMIN_SCHEMA_GROUPS).map(([group, tables]) => {
    const missing = tables.filter(table => tableStates[table] !== 'ready');
    const unavailable = tables.filter(table => tableStates[table] === 'unavailable');
    return [group, { ready: missing.length === 0, missing, unavailable }];
  }));
  const schemaMissing = Object.entries(tableStates).filter(([, state]) => state === 'schema_not_ready').map(([table]) => table);
  const schemaUnavailable = Object.entries(tableStates).filter(([, state]) => state === 'unavailable').map(([table]) => table);
  const dataGaps = BUSINESS_ADMIN_ACCEPTANCE_DATA_REQUIREMENTS.flatMap(requirement => {
    const actual = Number(counts[requirement.key] || 0);
    return actual >= requirement.minimum ? [] : [{ ...requirement, actual }];
  });
  const schemaReady = Object.values(groups).every(group => group.ready);
  const representativeDataReady = dataGaps.length === 0;
  return {
    schemaReady,
    representativeDataReady,
    acceptanceReady: schemaReady && representativeDataReady,
    groups,
    schemaMissing,
    schemaUnavailable,
    dataGaps,
  };
}
