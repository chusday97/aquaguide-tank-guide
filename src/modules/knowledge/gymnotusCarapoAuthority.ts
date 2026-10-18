import type { SpeciesKnowledgeProfile } from './knowledge.types';

const fishBase = 'fishbase-gymnotus-carapo-phase2-04';
const seriouslyFish = 'seriouslyfish-gymnotus-carapo-phase2-04';
const sourceIds = [fishBase, seriouslyFish];
const reviewedAt = '2026-10-18';

const reviewedEvidence = (ids: string[], note: string) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds: ids,
  reviewedAt,
  note,
});

const unknownSex = (): SpeciesKnowledgeProfile['knowledge']['sexIdentification'] => ({
  title: '暂无稳定的外观公母判断',
  summary: '现有 exact-taxon 来源足以支持环境、空间和混养行为，但没有提供可用于日常观赏鱼识别的稳定外观性别规则。',
  points: ['不要仅凭体型、颜色或鳍形推断公母。'],
  confidence: 'unknown',
  source: {
    type: 'unknown',
    label: '缺少稳定的对象级性别鉴别规则',
    confidence: 'unknown',
  },
  reliableFromLifeStage: 'unknown',
  evidence: {
    confidence: 'unknown',
    reviewStatus: 'reviewed',
    sourceIds,
    reviewedAt,
    note: 'No stable aquarium-level external sex-identification rule is promoted from the reviewed sources.',
  },
});

export const gymnotusCarapoKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: unknownSex(),
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 22, max: 28 },
    phRange: { min: 6, max: 7.5 },
    notes: [
      'FishBase and Seriously Fish independently support the same freshwater temperature and pH envelope.',
      'This is Gymnotus carapo, not an Electrophorus electric eel.',
    ],
    evidence: reviewedEvidence(
      sourceIds,
      'Exact-taxon FishBase and Seriously Fish records support the promoted freshwater environment envelope.',
    ),
  },
  socialBehavior: {
    mode: 'solitary',
    minimumGroupSize: 1,
    territoriality: 'high',
    predationRisk: 'high',
    summary: '会吞食小型鱼；可在足够大的水体中与体型接近的稳健鱼类谨慎混养，但同种间领地性很强，默认单只饲养。',
    evidence: reviewedEvidence(
      [seriouslyFish, fishBase],
      'Seriously Fish explicitly reports strong conspecific territoriality and small-fish predation; FishBase independently records aggression and fish in the diet.',
    ),
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 76, measurement: 'TL' },
    minVolumeLiters: 648,
    minTankLengthCm: 180,
    activityLevel: 'medium',
    needsCover: true,
    needsHidingPlaces: true,
    spaceNotes: [
      'FishBase reports a published maximum of 76 cm TL; Seriously Fish lists 60 cm SL.',
      'Seriously Fish recommends at least 180 × 60 × 60 cm (~648 L) and preferably larger.',
    ],
    evidence: reviewedEvidence(
      sourceIds,
      'FishBase supplies the conservative maximum total length; Seriously Fish supplies the minimum aquarium footprint/volume and cover guidance.',
    ),
  },
};
