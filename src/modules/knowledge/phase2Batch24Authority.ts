import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch24FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch24Subjects: Record<string, Subject> = {
  sp_0445: { source: 'batch26-fishbase-trichopodus-trichopterus-blue', title: 'Trichopodus trichopterus Blue variant review' },
  sp_0453: { source: 'batch26-fishbase-pterois-volitans', title: 'Pterois volitans species review' },
  sp_0459: { source: 'batch26-fishbase-neocaridina-davidi-wild-type', title: 'Neocaridina davidi wild type review' },
  sp_0037: { source: 'batch26-fishbase-acheilognathus-macropterus', title: 'Acheilognathus macropterus species review' },
  sp_0041: { source: 'batch26-fishbase-abbottina-rivularis', title: 'Abbottina rivularis species review' },
  sp_0046: { source: 'batch26-fishbase-aphyocypris-chinensis', title: 'Aphyocypris chinensis species review' },
  sp_0063: { source: 'batch26-fishbase-carassius-auratus-ranchu', title: 'Carassius auratus Ranchu variant review' },
  sp_0064: { source: 'batch26-fishbase-carassius-auratus-oranda', title: 'Carassius auratus Oranda variant review' },
  sp_0065: { source: 'batch26-fishbase-carassius-auratus-butterfly-tail', title: 'Carassius auratus Butterfly Tail variant review' },
  sp_0066: { source: 'batch26-fishbase-carassius-auratus-red-cap', title: 'Carassius auratus Red Cap variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});

const wildTypeNeocaridinaKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...makeKnowledge(phase2Batch24Subjects.sp_0459),
  environment: {
    waterType: 'freshwater',
    notes: ['UF/IFAS explicitly describes wild-type Neocaridina davidi and identifies the species as a freshwater ornamental shrimp native to freshwater streams.'],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['uf-ifas-neocaridina-davidi'],
      reviewedAt: '2026-09-22',
    },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 4, measurement: 'unknown' },
    activityLevel: 'unknown',
    spaceNotes: ['USGS reports body size up to 40 mm. No reviewed minimum aquarium volume is inferred from body length alone.'],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['usgs-neocaridina-davidi'],
      reviewedAt: '2026-09-22',
    },
  },
};

export const phase2Batch24Knowledge = Object.fromEntries(Object.entries(phase2Batch24Subjects).map(([id, subject]) => [
  id,
  id === 'sp_0459' ? wildTypeNeocaridinaKnowledge : makeKnowledge(subject),
])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch24Authority = Object.fromEntries(Object.entries(phase2Batch24Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch24FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch24FieldAuthority>>;
