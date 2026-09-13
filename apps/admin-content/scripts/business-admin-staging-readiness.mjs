export const AQUAGUIDE_LIVE_MIGRATION_BASELINE = '20260816160129';

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
];

export const BUSINESS_ADMIN_STAGING_UPGRADE_MIGRATIONS = [
  '202608270001_catalog_releases_and_species_water_type.sql',
  '202608280001_species_seo_admin.sql',
  '202608280002_species_seo_group_inheritance.sql',
  '202608280003_species_seo_localized_name.sql',
  '202608280004_species_seo_index_strategy.sql',
  '202608280005_species_seo_revision_history.sql',
  '202608280006_species_seo_release_gate_probe.sql',
  '202608280007_species_seo_publish_readiness.sql',
  '20260901064408_species_seo_server_export_boundary.sql',
  ...BUSINESS_ADMIN_AUTHORITY_MIGRATIONS,
];

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
