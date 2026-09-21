export type Phase2Batch48FieldAuthority = { status: 'reviewed_supported' | 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch48Subjects: Record<string, Subject> = {
  sp_0014: { source: 'batch42-fishbase-corydoras-aeneus', title: 'Corydoras aeneus species review' },
  sp_0431: { source: 'batch33-fishbase-paracheirodon-innesi', title: 'Paracheirodon innesi FishBase species review' },
  sp_0432: { source: 'batch42-fishbase-paracheirodon-axelrodi', title: 'Paracheirodon axelrodi species review' },
  sp_0434: { source: 'batch42-fishbase-tanichthys-albonubes', title: 'Tanichthys albonubes species review' },
  sp_0435: { source: 'batch42-fishbase-danio-rerio', title: 'Danio rerio species review' },
  sp_0436: { source: 'batch33-fishbase-poecilia-reticulata', title: 'Poecilia reticulata species review' },
  sp_0439: { source: 'batch37-fishbase-puntigrus-tetrazona', title: 'Puntigrus tetrazona species review' },
  sp_0443: { source: 'batch33-fishbase-corydoras-panda', title: 'Corydoras panda species review' },
  sp_0446: { source: 'batch40-fishbase-pterophyllum-scalare', title: 'Pterophyllum scalare species review' },
};

const supportedEnvironmentFacts: Partial<Record<string, string>> = {
  sp_0431: 'FishBase directly records Paracheirodon innesi as freshwater, 20-26C, pH 5.0-7.0 and dH 1-2.',
  sp_0434: 'FishBase directly records Tanichthys albonubes as freshwater, 18-22C, pH 6-8 and dH 5-19.',
  sp_0435: 'FishBase directly records Danio rerio as freshwater, 18-24C, pH 6-8 and dH 5-19.',
  sp_0439: 'FishBase directly records Puntigrus tetrazona as freshwater, 20-26C, pH 6-8 and dH 5-19.',
  sp_0443: 'FishBase directly records Hoplisoma/Corydoras panda as freshwater, 20-25C, pH 6-8 and dH 2-25.',
};

export const phase2Batch48Authority = Object.fromEntries(Object.entries(phase2Batch48Subjects).map(([id, subject]) => {
  const supportedFact = supportedEnvironmentFacts[id];
  return [id, {
    environment: supportedFact
      ? {
          status: 'reviewed_supported',
          citationIds: [subject.source],
          factEvidence: supportedFact,
        }
      : {
          status: 'reviewed_unknown',
          citationIds: [subject.source],
          factEvidence: id === 'sp_0436'
            ? 'FishBase directly records Poecilia reticulata in both freshwater and brackish water; the current single-value waterType field cannot represent both without loss.'
            : subject.title + ' does not establish complete object-specific environment authority.',
        },
  } satisfies { environment: Phase2Batch48FieldAuthority }];
})) as Record<string, { environment: Phase2Batch48FieldAuthority }>;
