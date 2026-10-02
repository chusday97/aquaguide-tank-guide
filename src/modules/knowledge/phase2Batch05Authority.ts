import type { SpeciesKnowledgeProfile } from './knowledge.types';
export type Phase2Batch05FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type S = { sourceIds: string[]; title: string; note: string };
export const phase2Batch05Subjects: Record<string, S> = {
  sp_0245: { sourceIds: ['batch07-fishbase-poecilia-reticulata'], title: 'Poecilia reticulata FishBase species summary', note: 'Kohaku variant is not identified' },
  sp_0246: { sourceIds: ['batch07-fishbase-poecilia-reticulata'], title: 'Poecilia reticulata FishBase species summary', note: 'Albino Kohaku variant is not identified' },
  sp_0255: { sourceIds: ['batch07-fishbase-hyphessobrycon-sweglesi'], title: 'Hyphessobrycon sweglesi FishBase species summary', note: 'Longfin variant is not identified' },
  sp_0287: { sourceIds: ['batch07-fishbase-hemigrammus-bleheri'], title: 'Hemigrammus bleheri FishBase species summary', note: 'Balloon variant is not identified' },
  sp_0339: { sourceIds: ['batch07-fishbase-hemigrammus-rodwayi'], title: 'Hemigrammus rodwayi FishBase species summary', note: 'Gold variant is not identified' },
  sp_0358: { sourceIds: ['batch07-fishbase-prionobrama-filigera'], title: 'Prionobrama filigera FishBase species summary', note: 'Improved commercial form is not identified' },
  sp_0360: { sourceIds: ['batch07-fishbase-hyphessobrycon-herbertaxelrodi'], title: 'Hyphessobrycon herbertaxelrodi FishBase species summary', note: 'Platinum variant is not identified' },
  sp_0362: { sourceIds: ['batch07-fishbase-hemigrammus-rodwayi'], title: 'Hemigrammus rodwayi FishBase species summary', note: 'The opened source does not establish a complete aquarium Knowledge profile' },
  sp_0375: { sourceIds: ['batch07-fishbase-hyphessobrycon-herbertaxelrodi'], title: 'Hyphessobrycon herbertaxelrodi FishBase species summary', note: 'Balloon variant is not identified' },
  sp_0002: { sourceIds: ['batch07-itis-caridina-cantonensis'], title: 'Caridina cantonensis ITIS taxonomic record', note: 'The commercial Crystal Shrimp form is not identified' },
};
const at = '2026-09-16';
const ev = (s: S, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: s.sourceIds, reviewedAt: at, note: `${s.title} was reviewed for ${field}; ${s.note}. No base-species inheritance or unsupported claim is promoted.` });
const make = (s: S): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成适用于该 catalog object 的稳定性别判断。', points: ['不凭名称、体色、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: ev(s, 'sex identification') },
  environment: { waterType: 'unknown', evidence: ev(s, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认适用于该 catalog object 的稳定水族箱社会模式。', evidence: ev(s, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: ev(s, 'space and growth') },
});
export const phase2Batch05Knowledge = Object.fromEntries(Object.entries(phase2Batch05Subjects).map(([id, s]) => [id, make(s)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch05Authority: Record<string, Partial<Record<'feeding' | 'care', Phase2Batch05FieldAuthority>>> = Object.fromEntries(Object.entries(phase2Batch05Subjects).map(([id, s]) => [id, { feeding: { status: 'reviewed_unknown', citationIds: s.sourceIds, factEvidence: `${s.title} does not establish the object-specific feeding regime; ${s.note}.` }, care: { status: 'reviewed_unknown', citationIds: s.sourceIds, factEvidence: `${s.title} does not establish the object-specific care protocol; ${s.note}.` } }]));
