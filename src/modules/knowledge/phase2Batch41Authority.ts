import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch41FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };

export const phase2Batch41Subjects: Record<string, Subject> = {
  sp_0437: { source: 'batch43-fishbase-poecilia-sphenops', title: 'Poecilia sphenops species review' },
  sp_0438: { source: 'batch43-fishbase-xiphophorus-hellerii', title: 'Xiphophorus hellerii species review' },
  sp_0447: { source: 'batch43-fishbase-symphysodon-aequifasciatus', title: 'Symphysodon aequifasciatus variant review' },
  sp_0451: { source: 'batch43-fishbase-astronotus-ocellatus', title: 'Astronotus ocellatus species review' },
  sp_0444: { source: 'batch43-fishbase-trichopodus-leerii', title: 'Trichopodus leerii species review' },
  sp_0468: { source: 'batch43-fishbase-trigonostigma-heteromorpha', title: 'Trigonostigma heteromorpha variant review' },
  sp_0053: { source: 'batch43-fishbase-corydoras-pygmaeus', title: 'Corydoras pygmaeus species review' },
  sp_0114: { source: 'batch43-fishbase-hyphessobrycon-amandae', title: 'Hyphessobrycon amandae species review' },
  sp_0259: { source: 'batch43-fishbase-betta-splendens-halfmoon', title: 'Betta splendens Halfmoon variant review' },
  sp_0260: { source: 'batch43-fishbase-betta-splendens-crown-tail', title: 'Betta splendens Crown-tail variant review' },
};

const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({ sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') }, environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') }, socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') }, spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') } });
export const phase2Batch41Knowledge = Object.fromEntries(Object.entries(phase2Batch41Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch41Authority = Object.fromEntries(Object.entries(phase2Batch41Subjects).map(([id, subject]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` }, care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` } } satisfies Record<'feeding' | 'care', Phase2Batch41FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch41FieldAuthority>>;
