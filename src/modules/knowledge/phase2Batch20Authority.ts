import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch20FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch20Subjects: Record<string, Subject> = {
  sp_0200: { source: 'batch22-fishbase-dario-dario', title: 'Dario dario species review' },
  sp_0216: { source: 'batch22-fishbase-channa-aurantimaculata-gold', title: 'Channa aurantimaculata Gold variant review' },
  sp_0229: { source: 'batch22-fishbase-gyrinocheilus-aymonieri-albino', title: 'Gyrinocheilus aymonieri Albino variant review' },
  sp_0234: { source: 'batch22-fishbase-dario-dario-gold', title: 'Dario dario Gold variant review' },
  sp_0242: { source: 'batch22-fishbase-scleropages-formosus-albino', title: 'Scleropages formosus Albino variant review' },
  sp_0248: { source: 'batch22-fishbase-osphronemus-goramy-gold', title: 'Osphronemus goramy Gold variant review' },
  sp_0268: { source: 'batch22-fishbase-trichopodus-trichopterus-blue-balloon', title: 'Trichopodus trichopterus Blue Balloon variant review' },
  sp_0269: { source: 'batch22-fishbase-trichopodus-trichopterus-gold-balloon', title: 'Trichopodus trichopterus Gold Balloon variant review' },
  sp_0283: { source: 'batch22-fishbase-scleropages-formosus-super-red', title: 'Scleropages formosus Super Red variant review' },
  sp_0284: { source: 'batch22-fishbase-scleropages-formosus-silver-platinum', title: 'Scleropages formosus Silver Platinum variant review' },
};
const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch20Knowledge = Object.fromEntries(Object.entries(phase2Batch20Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch20Authority = Object.fromEntries(Object.entries(phase2Batch20Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch20FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch20FieldAuthority>>;
