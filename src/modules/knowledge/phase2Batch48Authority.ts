export type Phase2Batch48FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch48Subjects: Record<string, Subject> = {
  sp_0014: { source: 'batch42-fishbase-corydoras-aeneus', title: 'Corydoras aeneus species review' },
  sp_0431: { source: 'batch42-fishbase-paracheirodon-innesi', title: 'Paracheirodon innesi species review' },
  sp_0432: { source: 'batch42-fishbase-paracheirodon-axelrodi', title: 'Paracheirodon axelrodi species review' },
  sp_0434: { source: 'batch42-fishbase-tanichthys-albonubes', title: 'Tanichthys albonubes species review' },
  sp_0435: { source: 'batch42-fishbase-danio-rerio', title: 'Danio rerio species review' },
  sp_0436: { source: 'batch33-fishbase-poecilia-reticulata', title: 'Poecilia reticulata species review' },
  sp_0439: { source: 'batch37-fishbase-puntigrus-tetrazona', title: 'Puntigrus tetrazona species review' },
  sp_0443: { source: 'batch33-fishbase-corydoras-panda', title: 'Corydoras panda species review' },
  sp_0446: { source: 'batch40-fishbase-pterophyllum-scalare', title: 'Pterophyllum scalare species review' },
};

export const phase2Batch48Authority = Object.fromEntries(Object.entries(phase2Batch48Subjects).map(([id, subject]) => [id, {
  environment: {
    status: 'reviewed_unknown',
    citationIds: [subject.source],
    factEvidence: `${subject.title} does not establish complete object-specific environment authority.`,
  },
} satisfies { environment: Phase2Batch48FieldAuthority }])) as Record<string, { environment: Phase2Batch48FieldAuthority }>;
