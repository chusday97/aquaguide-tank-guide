import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch26FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch26Subjects: Record<string, Subject> = {
  sp_0160: { source: 'batch28-fishbase-ancistrus-sp-longfin-platinum', title: 'Ancistrus sp. Longfin Platinum variant review' },
  sp_0161: { source: 'batch28-fishbase-poecilia-sphenops-chocolate', title: 'Poecilia sphenops Chocolate variant review' },
  sp_0162: { source: 'batch28-fishbase-carassius-auratus-red-grass', title: 'Carassius auratus Red Grass variant review' },
  sp_0168: { source: 'batch28-fishbase-poecilia-latipinna-gold', title: 'Poecilia latipinna Gold variant review' },
  sp_0169: { source: 'batch28-fishbase-poecilia-latipinna-silver', title: 'Poecilia latipinna Silver variant review' },
  sp_0180: { source: 'batch28-fishbase-carassius-auratus-telescope', title: 'Carassius auratus Telescope variant review' },
  sp_0188: { source: 'batch28-fishbase-lysmata-amboinensis', title: 'Lysmata amboinensis species review' },
  sp_0189: { source: 'batch28-fishbase-thor-amboinensis', title: 'Thor amboinensis species review' },
  sp_0190: { source: 'batch28-fishbase-lysmata-boggesi', title: 'Lysmata boggesi species review' },
  sp_0196: { source: 'batch28-fishbase-sahyadria-denisonii-gold', title: 'Sahyadria denisonii Gold variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});

export const phase2Batch26Knowledge = Object.fromEntries(Object.entries(phase2Batch26Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch26Authority = Object.fromEntries(Object.entries(phase2Batch26Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch26FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch26FieldAuthority>>;
