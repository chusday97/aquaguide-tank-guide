import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch21FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch21Subjects: Record<string, Subject> = {
  sp_0285: { source: 'batch23-fishbase-channa-aurantimaculata-gold', title: 'Channa aurantimaculata Gold variant review' },
  sp_0286: { source: 'batch23-fishbase-channa-andrao-super-blue', title: 'Channa andrao Super Blue variant review' },
  sp_0296: { source: 'batch23-fishbase-lutjanus-kasmira-var', title: 'Lutjanus kasmira catalog variant review' },
  sp_0297: { source: 'batch23-fishbase-pseudochromis-sp-gold', title: 'Pseudochromis sp. Gold catalog variant review' },
  sp_0318: { source: 'batch23-worms-plerogyra-sinuosa', title: 'Plerogyra sinuosa species review' },
  sp_0319: { source: 'batch23-worms-euphyllia-glabrescens', title: 'Euphyllia glabrescens species review' },
  sp_0321: { source: 'batch23-worms-pachyclavularia-violacea', title: 'Pachyclavularia violacea species review' },
  sp_0322: { source: 'batch23-worms-euphyllia-divisa', title: 'Euphyllia divisa species review' },
  sp_0323: { source: 'batch23-worms-catalaphyllia-jardinei', title: 'Catalaphyllia jardinei species review' },
  sp_0325: { source: 'batch23-worms-heteractis-crispa', title: 'Heteractis crispa species review' },
};
const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch21Knowledge = Object.fromEntries(Object.entries(phase2Batch21Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch21Authority = Object.fromEntries(Object.entries(phase2Batch21Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch21FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch21FieldAuthority>>;
