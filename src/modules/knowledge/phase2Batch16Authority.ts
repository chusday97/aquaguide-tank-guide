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
export const phase2Batch16Knowledge = Object.fromEntries(Object.entries(phase2Batch16Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch16Authority = Object.fromEntries(Object.entries(phase2Batch16Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch16FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch16FieldAuthority>>;
