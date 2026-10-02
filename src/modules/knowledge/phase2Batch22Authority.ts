import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch22FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch22Subjects: Record<string, Subject> = {
  sp_0333: { source: 'batch24-worms-stichodactyla-haddoni-blue', title: 'Stichodactyla haddoni Blue variant review' },
  sp_0334: { source: 'batch24-worms-stichodactyla-gigantea', title: 'Stichodactyla gigantea species review' },
  sp_0365: { source: 'batch24-fishbase-lutjanus-kasmira-longfin', title: 'Lutjanus kasmira Longfin variant review' },
  sp_0368: { source: 'batch24-worms-catalaphyllia-jardinei-green', title: 'Catalaphyllia jardinei Green variant review' },
  sp_0370: { source: 'batch24-worms-entacmaea-quadricolor-red', title: 'Entacmaea quadricolor Red variant review' },
  sp_0379: { source: 'batch24-worms-chrysaora-quinquecirrha', title: 'Chrysaora quinquecirrha species review' },
  sp_0382: { source: 'batch24-worms-chrysaora-melanaster', title: 'Chrysaora melanaster species review' },
  sp_0384: { source: 'batch24-worms-sanderia-malayensis', title: 'Sanderia malayensis species review' },
  sp_0400: { source: 'batch24-worms-catalaphyllia-jardinei-ultra-green', title: 'Catalaphyllia jardinei Ultra Green variant review' },
  sp_0401: { source: 'batch24-worms-entacmaea-quadricolor-rose', title: 'Entacmaea quadricolor Rose variant review' },
};
const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch22Knowledge = Object.fromEntries(Object.entries(phase2Batch22Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch22Authority = Object.fromEntries(Object.entries(phase2Batch22Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch22FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch22FieldAuthority>>;
