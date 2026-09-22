import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch23FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type Subject = { source: string; title: string };
export const phase2Batch23Subjects: Record<string, Subject> = {
  sp_0402: { source: 'batch25-worms-stichodactyla-gigantea-green', title: 'Stichodactyla gigantea Green variant review' },
  sp_0407: { source: 'batch25-fishbase-scleropages-formosus-blood-red-a', title: 'Scleropages formosus Blood Red A variant review' },
  sp_0408: { source: 'batch25-fishbase-scleropages-formosus-gold-head', title: 'Scleropages formosus Gold Head variant review' },
  sp_0409: { source: 'batch25-fishbase-potamotrygon-leopoldi-albino', title: 'Potamotrygon leopoldi Albino variant review' },
  sp_0410: { source: 'batch25-fishbase-potamotrygon-leopoldi-eclipse', title: 'Potamotrygon leopoldi Eclipse variant review' },
  sp_0411: { source: 'batch25-fishbase-channa-stewartii-karbi-anglong', title: 'Channa stewartii Karbi Anglong variant review' },
  sp_0412: { source: 'batch25-fishbase-channa-andrao-red', title: 'Channa andrao Red variant review' },
  sp_0420: { source: 'batch25-fishbase-trichopodus-trichopterus-balloon-gold-xl', title: 'Trichopodus trichopterus Balloon Gold XL variant review' },
  sp_0441: { source: 'batch25-fishbase-gyrinocheilus-aymonieri', title: 'Gyrinocheilus aymonieri species review' },
  sp_0442: { source: 'batch25-fishbase-gyrinocheilus-aymonieri-var', title: 'Gyrinocheilus aymonieri catalog variant review' },
};
const reviewedAt = '2026-09-17';
const evidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: [subject.source], reviewedAt, note: `${subject.title} was reviewed for ${field}; the available professional record does not establish complete object-specific authority for this catalog object. No template, name inference, or base-species inheritance is promoted.` });
const makeKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成稳定的对象级性别判断。', points: ['不凭名称、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: evidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: evidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认稳定水族箱社会模式。', evidence: evidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: evidence(subject, 'space and growth') },
});
export const phase2Batch23Knowledge = Object.fromEntries(Object.entries(phase2Batch23Subjects).map(([id, subject]) => [id, makeKnowledge(subject)])) as Record<string, SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch23Authority = Object.fromEntries(Object.entries(phase2Batch23Subjects).map(([id, subject]) => [id, {
  feeding: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific feeding authority.` },
  care: { status: 'reviewed_unknown', citationIds: [subject.source], factEvidence: `${subject.title} does not establish object-specific care authority.` },
} satisfies Record<'feeding' | 'care', Phase2Batch23FieldAuthority>])) as Record<string, Record<'feeding' | 'care', Phase2Batch23FieldAuthority>>;
