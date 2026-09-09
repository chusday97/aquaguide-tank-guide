export const BUSINESS_ADMIN_SCHEMA_GROUPS = {
  access: ['user_roles', 'idempotency_records'],
  productCare: [
    'species', 'care_articles', 'care_article_steps', 'care_article_assets',
    'content_publications', 'content_publication_events',
  ],
  compatibility: [
    'species_compatibility_profiles', 'species_pair_compatibility_rules',
    'evidence_sources', 'compatibility_authority_state',
    'species_compatibility_profile_revisions', 'species_pair_compatibility_rule_revisions',
  ],
  careSeo: ['care_seo_editorial_revisions'],
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
