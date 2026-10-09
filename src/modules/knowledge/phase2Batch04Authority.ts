import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch04FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { sourceIds: string[]; sourceTitle: string; variant: string };
export const phase2Batch04Subjects: Record<string, Subject> = {
  sp_0170: { sourceIds: ['batch06-fishbase-poecilia-reticulata'], sourceTitle: 'Poecilia reticulata FishBase species summary', variant: 'Full Black' },
  sp_0204: { sourceIds: ['batch06-fishbase-hemigrammus-bleheri'], sourceTitle: 'Hemigrammus bleheri FishBase species summary', variant: 'Black Diamond' },
  sp_0205: { sourceIds: ['batch06-fishbase-hyphessobrycon-herbertaxelrodi'], sourceTitle: 'Hyphessobrycon herbertaxelrodi FishBase species summary', variant: 'Purple Emperor' },
  sp_0206: { sourceIds: ['batch06-fishbase-paracheirodon-innesi'], sourceTitle: 'Paracheirodon innesi FishBase species summary', variant: 'Diamond' },
  sp_0212: { sourceIds: ['batch06-fishbase-hemigrammus-rodwayi'], sourceTitle: 'Hemigrammus rodwayi FishBase species summary', variant: 'Gold' },
  sp_0225: { sourceIds: ['batch06-fishbase-hemigrammus-bleheri'], sourceTitle: 'Hemigrammus bleheri FishBase species summary', variant: 'Longfin' },
  sp_0226: { sourceIds: ['batch06-fishbase-hemigrammus-bleheri'], sourceTitle: 'Hemigrammus bleheri FishBase species summary', variant: 'Platinum' },
  sp_0231: { sourceIds: ['batch06-fishbase-corydoras-panda'], sourceTitle: 'Corydoras panda FishBase species summary', variant: 'Albino' },
  sp_0232: { sourceIds: ['batch06-fishbase-corydoras-aeneus'], sourceTitle: 'Corydoras aeneus FishBase species summary', variant: 'Platinum' },
  sp_0244: { sourceIds: ['batch06-fishbase-poecilia-reticulata'], sourceTitle: 'Poecilia reticulata FishBase species summary', variant: 'Yellow Grass' },
};
const reviewedAt = '2026-09-16';
const evidence = (s: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: s.sourceIds, reviewedAt, note: `${s.sourceTitle} was reviewed for ${field}, but it does not identify the ${s.variant} commercial variant. Base-species inheritance is prohibited; no unsupported claim is promoted.` });
const knowledge = (s: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供品系级公母辨别规则', summary: '基础种来源未确认该商业品系的独立性别特征。', points: ['不凭品系名称、体色或鳍形猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '品系性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(s, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(s, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '没有该商业品系的直接水族箱社会行为来源。', evidence: evidence(s, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(s, 'space and growth') },
});
export const phase2Batch04Knowledge = Object.fromEntries(Object.entries(phase2Batch04Subjects).map(([id, s]) => [id, knowledge(s)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch04Authority: Record<string, Partial<Record<'feeding' | 'care', Phase2Batch04FieldAuthority>>> = Object.fromEntries(Object.entries(phase2Batch04Subjects).map(([id, s]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: s.sourceIds, factEvidence: `${s.sourceTitle} does not identify the ${s.variant} variant's feeding regime.` },
  care: { status: 'reviewed_unknown', citationIds: s.sourceIds, factEvidence: `${s.sourceTitle} does not identify the ${s.variant} variant's care protocol.` },
}]));
