export type Phase2Batch49FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };

export const phase2Batch49Authority = {
  sp_0455: {
    environment: {
      status: 'reviewed_unknown',
      citationIds: ['batch42-professional-neritina-natalensis'],
      factEvidence: 'Neritina natalensis species review does not establish complete object-specific environment authority for this duplicate catalog object.',
    },
  },
} satisfies Record<string, { environment: Phase2Batch49FieldAuthority }>;
