import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch09FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch09Subjects: Record<string, Subject> = {
  sp_0175: { source: 'batch11-fishbase-pterophyllum-scalare-red', title: 'Pterophyllum scalare Red variant review' },
  sp_0176: { source: 'batch11-fishbase-pterophyllum-scalare-marble', title: 'Pterophyllum scalare Marble variant review' },
  sp_0177: { source: 'batch11-fishbase-pterophyllum-scalare-blue', title: 'Pterophyllum scalare Blue variant review' },
  sp_0178: { source: 'batch11-fishbase-pterophyllum-scalare-panda', title: 'Pterophyllum scalare Panda variant review' },
  sp_0182: { source: 'batch11-fishbase-panaque-sp-l191', title: 'Panaque sp. L191 catalog taxon review' },
  sp_0187: { source: 'batch11-fishbase-chrysiptera-cyanea', title: 'Chrysiptera cyanea FishBase species summary' },
  sp_0201: { source: 'batch11-fishbase-leporacanthicus-cf-galaxias', title: 'Leporacanthicus cf. galaxias catalog taxon review' },
  sp_0202: { source: 'batch11-fishbase-scobinancistrus-aureatus', title: 'Scobinancistrus aureatus FishBase species summary' },
  sp_0207: { source: 'batch11-fishbase-gymnocorymbus-ternetzi-white', title: 'Gymnocorymbus ternetzi White variant review' },
  sp_0208: { source: 'batch11-fishbase-aphyocharax-anisitsi-balloon', title: 'Aphyocharax anisitsi Balloon variant review' },
};

const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available record does not establish a complete object-specific aquarium authority. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch09Knowledge = Object.fromEntries(Object.entries(phase2Batch09Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch09Authority = Object.fromEntries(Object.entries(phase2Batch09Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch09FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch09FieldAuthority>>;
