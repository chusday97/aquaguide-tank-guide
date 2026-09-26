import type { SpeciesKnowledgeProfile } from './knowledge.types';

export type Phase2Batch03FieldAuthority = {
  status: 'reviewed_supported' | 'reviewed_unknown';
  citationIds: string[];
  factEvidence: string;
};

type Subject = { sourceIds: string[]; sourceTitle: string; variantNote?: string };

export const phase2Batch03Subjects: Record<string, Subject> = {
  sp_0052: { sourceIds: ['batch05-fishbase-gastrodermus-hastatus'], sourceTitle: 'Gastrodermus hastatus FishBase species summary' },
  sp_0112: { sourceIds: ['batch05-fishbase-poropanchax-normani'], sourceTitle: 'Poropanchax normani FishBase species summary' },
  sp_0115: { sourceIds: ['batch05-fishbase-hyphessobrycon-amapaensis'], sourceTitle: 'Hyphessobrycon amapaensis FishBase species summary' },
  sp_0141: { sourceIds: ['batch05-fishbase-hyphessobrycon-pulchripinnis'], sourceTitle: 'Hyphessobrycon pulchripinnis FishBase species summary', variantNote: 'The source describes the base species and does not identify the Sweet Lemon commercial variant.' },
  sp_0143: { sourceIds: ['batch05-fishbase-poecilia-reticulata'], sourceTitle: 'Poecilia reticulata FishBase species summary', variantNote: 'The source describes the base species and does not identify the Red Grass commercial variant.' },
  sp_0144: { sourceIds: ['batch05-fishbase-poecilia-reticulata'], sourceTitle: 'Poecilia reticulata FishBase species summary', variantNote: 'The source describes the base species and does not identify the Blue Grass commercial variant.' },
  sp_0145: { sourceIds: ['batch05-fishbase-poecilia-reticulata'], sourceTitle: 'Poecilia reticulata FishBase species summary', variantNote: 'The source describes the base species and does not identify the Dumbo commercial variant.' },
  sp_0154: { sourceIds: ['batch05-fishbase-hemigrammus-bleheri'], sourceTitle: 'Hemigrammus bleheri FishBase species summary', variantNote: 'The source describes the base species and does not identify the Improved commercial variant.' },
  sp_0155: { sourceIds: ['batch05-fishbase-paracheirodon-innesi'], sourceTitle: 'Paracheirodon innesi FishBase species summary', variantNote: 'The source describes the base species and does not identify the Longfin commercial variant.' },
  sp_0167: { sourceIds: ['batch05-fishbase-hemigrammus-bleheri'], sourceTitle: 'Hemigrammus bleheri FishBase species summary', variantNote: 'The source describes the base species and does not identify the Balloon commercial variant.' },
};

const reviewedAt = '2026-09-16';
const unknownEvidence = (subject: Subject, field: string) => ({ confidence: 'unknown' as const, reviewStatus: 'reviewed' as const, sourceIds: subject.sourceIds, reviewedAt, note: `${subject.sourceTitle} was reviewed for ${field}. ${subject.variantNote ?? 'The source does not establish a complete aquarium protocol for this field.'} No unsupported claim is promoted.` });
const supportedEvidence = (sourceIds: string[], note: string) => ({ confidence: 'verified' as const, reviewStatus: 'reviewed' as const, sourceIds, reviewedAt, note });

const makeUnknownKnowledge = (subject: Subject): SpeciesKnowledgeProfile['knowledge'] => ({
  sexIdentification: { title: '本轮不提供稳定的公母辨别规则', summary: '来源不足以形成适用于该 catalog object 的稳定性别判断。', points: ['不凭名称、体色、品系或类别模板猜测性别。'], confidence: 'unknown', source: { type: 'unknown', label: '本批次性别证据不足', confidence: 'unknown' }, reliableFromLifeStage: 'unknown', evidence: unknownEvidence(subject, 'sex identification') },
  environment: { waterType: 'unknown', evidence: unknownEvidence(subject, 'environment') },
  socialBehavior: { mode: 'unknown', summary: '来源不足以确认适用于该 catalog object 的稳定水族箱社会模式。', evidence: unknownEvidence(subject, 'social behavior') },
  spaceAndGrowth: { activityLevel: 'unknown', evidence: unknownEvidence(subject, 'space and growth') },
});

export const phase2Batch03Knowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = Object.fromEntries(Object.entries(phase2Batch03Subjects).map(([speciesId, subject]) => [speciesId, makeUnknownKnowledge(subject)]));

Object.assign(phase2Batch03Knowledge.sp_0052!, {
  environment: { waterType: 'freshwater', temperatureRangeC: { min: 25, max: 28 }, phRange: { min: 6, max: 8 }, evidence: supportedEvidence(['batch05-fishbase-gastrodermus-hastatus'], 'FishBase records freshwater, pH 6–8 and 25–28°C.') },
  socialBehavior: { mode: 'shoal', swimmingZone: 'bottom', summary: 'FishBase records that the species forms small schools; no hard aquarium minimum is promoted.', evidence: supportedEvidence(['batch05-fishbase-gastrodermus-hastatus'], 'FishBase records formation of small schools.') },
  spaceAndGrowth: { adultLengthCm: { max: 2.4, measurement: 'SL' }, activityLevel: 'unknown', swimmingZone: 'bottom', evidence: supportedEvidence(['batch05-fishbase-gastrodermus-hastatus'], 'FishBase records a maximum length of 2.4 cm SL.') },
});
Object.assign(phase2Batch03Knowledge.sp_0112!, {
  environment: { waterType: 'freshwater', temperatureRangeC: { min: 22, max: 26 }, phRange: { min: 6.5, max: 7.2 }, evidence: supportedEvidence(['batch05-fishbase-poropanchax-normani'], 'FishBase records freshwater, pH 6.5–7.2 and 22–26°C.') },
  spaceAndGrowth: { adultLengthCm: { max: 4.5, measurement: 'TL' }, activityLevel: 'unknown', evidence: supportedEvidence(['batch05-fishbase-poropanchax-normani'], 'FishBase records a maximum length of 4.5 cm TL for male/unsexed specimens.') },
});
Object.assign(phase2Batch03Knowledge.sp_0115!, {
  environment: { waterType: 'freshwater', evidence: supportedEvidence(['batch05-fishbase-hyphessobrycon-amapaensis'], 'FishBase records freshwater habitat; no temperature or pH range is supplied.') },
  spaceAndGrowth: { adultLengthCm: { max: 3, measurement: 'SL' }, activityLevel: 'unknown', evidence: supportedEvidence(['batch05-fishbase-hyphessobrycon-amapaensis'], 'FishBase records a maximum length of 3.0 cm SL.') },
});

export const phase2Batch03Authority: Record<string, Partial<Record<'feeding' | 'care', Phase2Batch03FieldAuthority>>> = Object.fromEntries(Object.entries(phase2Batch03Subjects).map(([speciesId, subject]) => [speciesId, {
  feeding: { status: 'reviewed_unknown', citationIds: subject.sourceIds, factEvidence: `${subject.sourceTitle} was reviewed for feeding. ${subject.variantNote ?? 'The source does not establish a defensible object-specific feeding regime.'} No template or name inference is promoted.` },
  care: { status: 'reviewed_unknown', citationIds: subject.sourceIds, factEvidence: `${subject.sourceTitle} was reviewed for care. ${subject.variantNote ?? 'The source does not establish a complete object-specific care protocol.'} No unsupported claim is promoted.` },
}]));
