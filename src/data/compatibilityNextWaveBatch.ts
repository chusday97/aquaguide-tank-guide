export type CompatibilityReleaseMember = {
  speciesId: string;
  expectProfile: boolean;
  evidenceCeilingField?: 'environment' | 'space' | 'social' | 'feeding' | 'care';
};

export type CompatibilityReleaseBatch = {
  batchId: string;
  migrationOwner: string;
  requireReviewedCatalogFields?: boolean;
  members: readonly CompatibilityReleaseMember[];
};

export const compatibilityUnifiedNextWave = {
  policy: {
    progression: 'batch_only',
    validation: 'single_manifest_single_release_gate',
    pendingBehavior: 'fail_closed',
    newSpeciesRule: 'Extend this manifest and existing authority data; do not add per-species or numbered next-wave test entrypoints.',
  },
  releasedBatches: [
    {
      batchId: 'freshwater-foundation-20261010',
      migrationOwner: 'supabase/migrations/20261010151338_compatibility_next_wave_freshwater_authority.sql',
      members: [
        { speciesId: 'sp_0019', expectProfile: true },
        { speciesId: 'sp_0026', expectProfile: true },
        { speciesId: 'sp_0043', expectProfile: true },
      ],
    },
    {
      batchId: 'black-paradise-20261010',
      migrationOwner: 'supabase/migrations/20261010164051_compatibility_macropodus_spechti_authority.sql',
      members: [{ speciesId: 'sp_0044', expectProfile: true }],
    },
    {
      batchId: 'marine-wave-20261011',
      migrationOwner: 'supabase/migrations/20261011020543_compatibility_next_wave_marine_authority.sql',
      requireReviewedCatalogFields: true,
      members: [
        { speciesId: 'sp_0022', expectProfile: true },
        { speciesId: 'sp_0023', expectProfile: true },
        { speciesId: 'sp_0024', expectProfile: true },
      ],
    },
    {
      batchId: 'chindongo-20261011',
      migrationOwner: 'supabase/migrations/20261011111500_compatibility_chindongo_socolofi_authority.sql',
      requireReviewedCatalogFields: true,
      members: [{ speciesId: 'sp_0018', expectProfile: true }],
    },
    {
      batchId: 'opsariichthys-20261011',
      migrationOwner: 'supabase/migrations/20261011124500_compatibility_opsariichthys_bidens_authority.sql',
      requireReviewedCatalogFields: true,
      members: [{ speciesId: 'sp_0038', expectProfile: true }],
    },
    {
      batchId: 'pseudorasbora-20261011',
      migrationOwner: 'supabase/migrations/20261011162500_compatibility_pseudorasbora_parva_authority.sql',
      requireReviewedCatalogFields: true,
      members: [{ speciesId: 'sp_0042', expectProfile: true }],
    },
    {
      batchId: 'freshwater-batch-wave-20261011',
      migrationOwner: 'supabase/migrations/20261011170000_compatibility_next_wave_freshwater_batch_authority.sql',
      requireReviewedCatalogFields: true,
      members: [
        { speciesId: 'sp_0047', expectProfile: false, evidenceCeilingField: 'social' },
        { speciesId: 'sp_0048', expectProfile: true },
        { speciesId: 'sp_0050', expectProfile: true },
        { speciesId: 'sp_0051', expectProfile: true },
        { speciesId: 'sp_0054', expectProfile: true },
        { speciesId: 'sp_0056', expectProfile: true },
        { speciesId: 'sp_0057', expectProfile: true },
        { speciesId: 'sp_0058', expectProfile: true },
      ],
    },
    {
      batchId: 'unified-freshwater-wave-20261011',
      migrationOwner: 'supabase/migrations/20261011213000_compatibility_unified_next_wave_batch_authority.sql',
      requireReviewedCatalogFields: true,
      members: [
        { speciesId: 'sp_0059', expectProfile: true },
        { speciesId: 'sp_0062', expectProfile: true },
        { speciesId: 'sp_0105', expectProfile: true },
        { speciesId: 'sp_0108', expectProfile: true },
        { speciesId: 'sp_0109', expectProfile: true },
        { speciesId: 'sp_0119', expectProfile: true },
        { speciesId: 'sp_0130', expectProfile: true },
        { speciesId: 'sp_0131', expectProfile: true },
        { speciesId: 'sp_0138', expectProfile: true },
        { speciesId: 'sp_0139', expectProfile: true },
        { speciesId: 'sp_0181', expectProfile: true },
      ],
    },
  ] satisfies readonly CompatibilityReleaseBatch[],
  activeQueueSpeciesIds: [
    'sp_0103',
    'sp_0110',
    'sp_0117',
    'sp_0118',
    'sp_0120',
    'sp_0121',
    'sp_0122',
    'sp_0123',
    'sp_0125',
    'sp_0129',
    'sp_0140',
    'sp_0183',
    'sp_0184',
    'sp_0185',
    'sp_0187',
    'sp_0197',
    'sp_0198',
    'sp_0199',
    'sp_0200',
    'sp_0202',
    'sp_0218',
    'sp_0334',
    'sp_0441',
    'sp_0449',
    'sp_0450',
  ] as const,
  terminalHoldSpeciesIds: ['sp_0224', 'sp_0002', 'sp_0428', 'sp_0021', 'sp_0258'] as const,
  terminalHoldPairKeys: [
    'sp_0002__sp_0224',
    'sp_0224__sp_0428',
    'sp_0224__sp_0451',
  ] as const,
} as const;

export const compatibilityProductionRolloutPendingProfileIds = [
  'sp_0059',
  'sp_0062',
  'sp_0105',
  'sp_0108',
  'sp_0109',
  'sp_0119',
  'sp_0130',
  'sp_0131',
  'sp_0138',
  'sp_0139',
  'sp_0181',
] as const;

export const compatibilityReleasedSpeciesIds = compatibilityUnifiedNextWave.releasedBatches.flatMap(batch =>
  batch.members.map(member => member.speciesId),
);
