import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch27FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch27Subjects: Record<string, Subject> = {
  sp_0203: { source: 'batch29-fishbase-poecilia-sphenops-green', title: 'Poecilia sphenops Green variant review' },
  sp_0209: { source: 'batch29-fishbase-poecilia-latipinna-blood', title: 'Poecilia latipinna Blood variant review' },
  sp_0213: { source: 'batch29-fishbase-crossocheilus-langei-gold', title: 'Crossocheilus langei Gold variant review' },
  sp_0215: { source: 'batch29-fishbase-sahyadria-denisonii-longfin', title: 'Sahyadria denisonii Longfin variant review' },
  sp_0230: { source: 'batch29-fishbase-ancistrus-sp-gold-longfin', title: 'Ancistrus sp. Gold Longfin variant review' },
  sp_0237: { source: 'batch29-fishbase-poecilia-latipinna-high-fin-red', title: 'Poecilia latipinna High Fin Red variant review' },
  sp_0253: { source: 'batch29-fishbase-sahyadria-denisonii-red-line', title: 'Sahyadria denisonii Red Line variant review' },
  sp_0254: { source: 'batch29-fishbase-crossocheilus-langei-platinum', title: 'Crossocheilus langei Platinum variant review' },
  sp_0280: { source: 'batch29-fishbase-ancistrus-sp-gold-longfin-2', title: 'Ancistrus sp. Gold Longfin catalog variant review' },
  sp_0281: { source: 'batch29-fishbase-ancistrus-sp-white-longfin', title: 'Ancistrus sp. White Longfin variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});

export const phase2Batch27Knowledge = Object.fromEntries(Object.entries(phase2Batch27Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch27Authority = Object.fromEntries(Object.entries(phase2Batch27Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch27FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch27FieldAuthority>>;
