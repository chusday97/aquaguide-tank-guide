import type { SpeciesKnowledgeProfile } from './knowledge.types';
export type Phase2Batch12FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch12Subjects: Record<string, Subject> = {
  sp_0263: { source: 'batch14-fishbase-maylandia-estherae-albino', title: 'Maylandia estherae Albino variant review' },
  sp_0264: { source: 'batch14-fishbase-sciaenochromis-fryeri-white', title: 'Sciaenochromis fryeri White variant review' },
  sp_0265: { source: 'batch14-fishbase-nimbochromis-livingstonii-var', title: 'Nimbochromis livingstonii catalog variant review' },
  sp_0266: { source: 'batch14-fishbase-altolamprologus-calvus-gold', title: 'Altolamprologus calvus Gold variant review' },
  sp_0270: { source: 'batch14-fishbase-geophagus-surinamensis-albino', title: 'Geophagus surinamensis Albino variant review' },
  sp_0271: { source: 'batch14-fishbase-hemichromis-bimaculatus-albino', title: 'Hemichromis bimaculatus Albino variant review' },
  sp_0272: { source: 'batch14-fishbase-pterophyllum-scalare-black-longfin', title: 'Pterophyllum scalare Black Longfin variant review' },
  sp_0273: { source: 'batch14-fishbase-apistogramma-cacatuoides-super-red', title: 'Apistogramma cacatuoides Super Red variant review' },
  sp_0282: { source: 'batch14-fishbase-parancistrus-aurantiacus-gold', title: 'Parancistrus aurantiacus Gold variant review' },
  sp_0288: { source: 'batch14-fishbase-gymnocorymbus-ternetzi-platinum-longfin', title: 'Gymnocorymbus ternetzi Platinum Longfin variant review' },
};
const reviewedAt = '2026-09-16';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available record does not establish a complete object-specific aquarium authority. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch12Knowledge = Object.fromEntries(Object.entries(phase2Batch12Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch12Authority = Object.fromEntries(Object.entries(phase2Batch12Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch12FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch12FieldAuthority>>;
