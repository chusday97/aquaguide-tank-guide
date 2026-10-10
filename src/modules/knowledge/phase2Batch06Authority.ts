import type { SpeciesKnowledgeProfile } from './knowledge.types';
export type Phase2Batch06FieldAuthority = { status: 'reviewed_unknown'; citationIds: string[]; factEvidence: string };
type S = { id: string; source: string; title: string };
export const phase2Batch06Subjects: Record<string, S> = Object.fromEntries([
  ['sp_0005','batch08-fishbase-clithon-corona','Clithon corona taxon source'],['sp_0051','batch08-fishbase-acrossocheilus-fasciatus','Acrossocheilus fasciatus FishBase species summary'],['sp_0018','batch08-fishbase-chindongo-socolofi','Chindongo socolofi FishBase species summary'],['sp_0019','batch08-fishbase-pterophyllum-altum','Pterophyllum altum FishBase species summary'],['sp_0023','batch08-fishbase-zebrasoma-flavescens','Zebrasoma flavescens FishBase species summary'],['sp_0024','batch08-fishbase-paracanthurus-hepatus','Paracanthurus hepatus FishBase species summary'],['sp_0026','batch08-fishbase-hypostomus-plecostomus','Hypostomus plecostomus FishBase species summary'],['sp_0033','batch08-fishbase-clithon-corona','Clithon corona taxon source'],['sp_0034','batch08-worms-tylomelania','Tylomelania WoRMS taxonomic source'],['sp_0042','batch08-fishbase-pseudorasbora-parva','Pseudorasbora parva FishBase species summary'],
].map(([id,source,title]) => [id,{id,source,title}]));
const at='2026-09-16';
const ev=(s:S,f:string)=>({confidence:'unknown' as const,reviewStatus:'reviewed' as const,sourceIds:[s.source],reviewedAt:at,note:`${s.title} was reviewed for ${f}; the source does not establish a complete object-specific aquarium authority. No template, name inference, or base-species inheritance is promoted.`});
const make=(s:S):SpeciesKnowledgeProfile['knowledge']=>({sexIdentification:{title:'本轮不提供稳定的公母辨别规则',summary:'来源不足以形成稳定的对象级性别判断。',points:['不凭名称、品系或类别模板猜测性别。'],confidence:'unknown',source:{type:'unknown',label:'本批次性别证据不足',confidence:'unknown'},reliableFromLifeStage:'unknown',evidence:ev(s,'sex identification')},environment:{waterType:'unknown',evidence:ev(s,'environment')},socialBehavior:{mode:'unknown',summary:'来源不足以确认稳定水族箱社会模式。',evidence:ev(s,'social behavior')},spaceAndGrowth:{activityLevel:'unknown',evidence:ev(s,'space and growth')}});

const altumAngelfishKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...make(phase2Batch06Subjects.sp_0019),
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 27, max: 31 },
    phRange: { min: 4.8, max: 6.2 },
    hardnessDgh: { min: 1, max: 5 },
    notes: [
      'FishBase records freshwater habitat at 27–31°C, pH 4.8–6.2 and 1–5 dGH.',
      'Seriously Fish independently describes a very soft, acidic, high-temperature aquarium requirement.',
    ],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch08-fishbase-pterophyllum-altum', 'seriouslyfish-pterophyllum-altum'],
      reviewedAt: '2026-10-10',
      note: 'Object-specific environmental authority from FishBase plus curated aquarium husbandry.',
    },
  },
  socialBehavior: {
    mode: 'variable',
    territoriality: 'unknown',
    predationRisk: 'medium',
    summary: '可与体型较大且温和的鱼同缸，但能入口的小型鱼存在明确被捕食风险；不把基础神仙鱼的领地性模板自动套用到埃及神仙。',
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['seriouslyfish-pterophyllum-altum'],
      reviewedAt: '2026-10-10',
      note: 'Seriously Fish directly warns that small fish fitting in the mouth are prey while larger peaceful tankmates can be suitable.',
    },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 18, measurement: 'TL' },
    activityLevel: 'medium',
    swimmingZone: 'middle',
    spaceNotes: [
      'FishBase reports a maximum length of 18 cm TL.',
      'No reviewed minimum aquarium footprint is asserted because the selected source does not provide one.',
    ],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch08-fishbase-pterophyllum-altum'],
      reviewedAt: '2026-10-10',
      note: 'Adult-size authority is reviewed; minimum tank volume remains intentionally unspecified.',
    },
  },
};

const commonPlecoKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...make(phase2Batch06Subjects.sp_0026),
  environment: {
    waterTypes: ['freshwater', 'brackish'],
    temperatureRangeC: { min: 20, max: 28 },
    phRange: { min: 6.2, max: 8.2 },
    notes: [
      'FishBase records both freshwater and brackish occurrence, 20–28°C and pH 6.2–8.2.',
      'No salinity target is inferred from occurrence alone.',
    ],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch08-fishbase-hypostomus-plecostomus'],
      reviewedAt: '2026-10-10',
      note: 'Object-specific environmental authority from FishBase.',
    },
  },
  socialBehavior: {
    mode: 'unknown',
    swimmingZone: 'bottom',
    territoriality: 'unknown',
    predationRisk: 'unknown',
    summary: 'FishBase establishes demersal ecology but does not establish a species-specific aquarium social rule. General pleco territoriality is not promoted as Hypostomus plecostomus authority.',
    evidence: {
      confidence: 'unknown',
      reviewStatus: 'reviewed',
      sourceIds: ['batch08-fishbase-hypostomus-plecostomus'],
      reviewedAt: '2026-10-10',
      note: 'Social behavior remains fail-closed until species-specific reviewed husbandry evidence is available.',
    },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 25, measurement: 'SL' },
    activityLevel: 'medium',
    swimmingZone: 'bottom',
    needsHidingPlaces: true,
    spaceNotes: [
      'FishBase reports a maximum of 25 cm SL and a common length around 28 cm TL.',
      'No minimum aquarium volume is promoted from body size alone.',
    ],
    evidence: {
      confidence: 'verified',
      reviewStatus: 'reviewed',
      sourceIds: ['batch08-fishbase-hypostomus-plecostomus'],
      reviewedAt: '2026-10-10',
      note: 'Reviewed adult-size and demersal ecology authority; tank-volume formula remains intentionally unspecified.',
    },
  },
};

export const phase2Batch06Knowledge=Object.fromEntries(Object.entries(phase2Batch06Subjects).map(([id,s])=>[id,id === 'sp_0019' ? altumAngelfishKnowledge : id === 'sp_0026' ? commonPlecoKnowledge : make(s)])) as Record<string,SpeciesKnowledgeProfile['knowledge']>;
export const phase2Batch06Authority=Object.fromEntries(Object.entries(phase2Batch06Subjects).map(([id,s])=>[id,{feeding:{status:'reviewed_unknown',citationIds:[s.source],factEvidence:`${s.title} does not establish object-specific feeding authority.`},care:{status:'reviewed_unknown',citationIds:[s.source],factEvidence:`${s.title} does not establish object-specific care authority.`} as Phase2Batch06FieldAuthority}])) as Record<string,Partial<Record<'feeding'|'care',Phase2Batch06FieldAuthority>>>;
