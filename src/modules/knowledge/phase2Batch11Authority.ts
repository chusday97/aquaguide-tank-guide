import type { SpeciesKnowledgeProfile } from './knowledge.types';
export type Phase2Batch11FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch11Subjects: Record<string, Subject> = {
  sp_0236: { source: 'batch13-fishbase-xiphophorus-hellerii-albino-red', title: 'Xiphophorus hellerii Albino Red variant review' },
  sp_0240: { source: 'batch13-fishbase-pterophyllum-scalare-platinum-longfin', title: 'Pterophyllum scalare Platinum Longfin variant review' },
  sp_0241: { source: 'batch13-fishbase-pterophyllum-scalare-marble-balloon', title: 'Pterophyllum scalare Marble Balloon variant review' },
  sp_0243: { source: 'batch13-fishbase-cichlasoma-blood-parrot-balloon', title: 'Cichlasoma Blood Parrot Balloon catalog variant review' },
  sp_0247: { source: 'batch13-fishbase-pterophyllum-scalare-blue-balloon', title: 'Pterophyllum scalare Blue Balloon variant review' },
  sp_0249: { source: 'batch13-fishbase-pomacea-bridgesii-gold', title: 'Pomacea bridgesii Gold variant review' },
  sp_0250: { source: 'batch13-fishbase-pomacea-bridgesii-blue', title: 'Pomacea bridgesii Blue variant review' },
  sp_0251: { source: 'batch13-fishbase-pomacea-bridgesii-purple', title: 'Pomacea bridgesii Purple variant review' },
  sp_0256: { source: 'batch13-fishbase-gymnocorymbus-ternetzi-albino-red-eye', title: 'Gymnocorymbus ternetzi Albino Red Eye variant review' },
  sp_0257: { source: 'batch13-fishbase-peckoltia-compta-gold', title: 'Peckoltia compta Gold variant review' },
};
const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available record does not establish a complete object-specific aquarium authority. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch11Knowledge = Object.fromEntries(Object.entries(phase2Batch11Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch11Authority = Object.fromEntries(Object.entries(phase2Batch11Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch11FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch11FieldAuthority>>;
