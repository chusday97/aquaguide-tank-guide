import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch16FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch16Subjects: Record<string, Subject> = {
  sp_0001: { source: 'batch18-fishbase-neocaridina-davidi-red', title: 'Neocaridina davidi Red variant review' },
  sp_0007: { source: 'batch18-fishbase-ambystoma-mexicanum', title: 'Ambystoma mexicanum species review' },
  sp_0008: { source: 'batch18-fishbase-cynops-orientalis', title: 'Cynops orientalis species review' },
  sp_0009: { source: 'batch18-fishbase-ceratophrys-ornata', title: 'Ceratophrys ornata species review' },
  sp_0015: { source: 'batch18-fishbase-helostoma-temminkii', title: 'Helostoma temminkii species review' },
  sp_0022: { source: 'batch18-fishbase-lutjanus-kasmira', title: 'Lutjanus kasmira species review' },
  sp_0038: { source: 'batch18-fishbase-opsariichthys-bidens', title: 'Opsariichthys bidens species review' },
  sp_0043: { source: 'batch18-fishbase-macropodus-ocellatus', title: 'Macropodus ocellatus species review' },
  sp_0044: { source: 'batch18-fishbase-macropodus-spechti', title: 'Macropodus spechti species review' },
  sp_0047: { source: 'batch18-fishbase-tachysurus-fulvidraco', title: 'Tachysurus fulvidraco species review' },
};
const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
const fireRedShrimpKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...makeKnowledge(phase2Batch16Subjects.sp_0001),
  environment: {
    waterType: 'freshwater',
    notes: ['UF/IFAS identifies the red/cherry morph as Neocaridina davidi and describes the species as a freshwater ornamental shrimp from freshwater streams.'],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['uf-ifas-neocaridina-davidi'],
      reviewedAt: '2026-09-22',
    },
  },
  socialBehavior: {
    mode: 'group',
    swimmingZone: 'bottom',
    territoriality: 'unknown',
    predationRisk: 'unknown',
    summary: 'Peer-reviewed work describes red cherry shrimp as highly gregarious; reviewed ecology sources also place the species as a benthic freshwater shrimp. This supports group-living context, but not a hard minimum group count.',
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['neocaridina-social-environment-study', 'uf-ifas-neocaridina-davidi'],
      reviewedAt: '2026-09-22',
    },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 4, measurement: 'unknown' },
    activityLevel: 'unknown',
    swimmingZone: 'bottom',
    spaceNotes: ['UF/IFAS reports Neocaridina davidi adults around 3-4 cm. No minimum aquarium volume or tank length is inferred from body size alone.'],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['uf-ifas-neocaridina-davidi'],
      reviewedAt: '2026-09-22',
    },
  },
};

export const phase2Batch16Knowledge = Object.fromEntries(Object.entries(phase2Batch16Subjects).map(([id, subject]) => [
  id,
  id === 'sp_0001' ? fireRedShrimpKnowledge : makeKnowledge(subject),
])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch16Authority = Object.fromEntries(Object.entries(phase2Batch16Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch16FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch16FieldAuthority>>;
