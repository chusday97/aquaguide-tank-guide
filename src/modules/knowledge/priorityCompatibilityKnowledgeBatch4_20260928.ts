import type { SpeciesKnowledgeProfile } from './knowledge.types';
import { phase2Batch06Knowledge } from './phase2Batch06Authority';
import { phase2Batch17Knowledge } from './phase2Batch17Authority';
import { phase2Batch18Knowledge } from './phase2Batch18Authority';

const reviewedAt = '2026-09-28';
const ev = (sourceIds: string[]) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
});

/**
 * Exact-object runtime promotions for the fourth compatibility priority batch.
 * These overrides do not authorize sibling/trade-form inheritance.
 */
export const priorityCompatibilityKnowledgeBatch4_20260928: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0105: {
    ...phase2Batch17Knowledge.sp_0105,
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 25, max: 28 },
      phRange: { min: 6, max: 8 },
      hardnessDgh: { min: 5, max: 25 },
      evidence: ev(['seriouslyfish-polypterus-ornatapinnis', 'batch19-fishbase-polypterus-ornatipinnis']),
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'unknown',
      finNipping: 'none',
      predationRisk: 'high',
      swimmingZone: 'bottom',
      swimmingPace: 'slow',
      summary: '大型夜行肉食性多鳍鱼。对吞不下的同伴通常不主动冲突，但任何能入口的小鱼都存在明确捕食风险；FishBase 记录其通常偏独居，因此不把“独居”扩大成对所有大型异种的绝对禁配。',
      evidence: ev(['seriouslyfish-polypterus-ornatapinnis', 'batch19-fishbase-polypterus-ornatipinnis']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 60, measurement: 'TL' },
      minVolumeLiters: 648,
      minTankLengthCm: 180,
      activityLevel: 'medium',
      swimmingZone: 'bottom',
      needsCover: true,
      needsHidingPlaces: true,
      spaceNotes: ['长期至少按 180 × 60 cm 底面积、约 648 L 规划，并使用严密缸盖；成鱼可达约 60 cm。'],
      evidence: ev(['seriouslyfish-polypterus-ornatapinnis', 'batch19-fishbase-polypterus-ornatipinnis']),
    },
  },
  sp_0117: {
    ...phase2Batch18Knowledge.sp_0117,
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 20, max: 30 },
      phRange: { min: 5, max: 7.5 },
      hardnessDgh: { min: 2, max: 15 },
      evidence: ev(['seriouslyfish-osteoglossum-bicirrhosum', 'batch20-fishbase-osteoglossum-bicirrhosum']),
    },
    socialBehavior: {
      mode: 'solitary',
      territoriality: 'unknown',
      finNipping: 'unknown',
      predationRisk: 'high',
      swimmingZone: 'surface',
      swimmingPace: 'fast',
      summary: '大型表层捕食鱼，资料明确不把它视为普通社区鱼；小鱼和可吞食对象存在明显捕食风险。Seriously Fish 建议单独饲养，但不把缺乏直接证据的“领地性”额外加入规则。',
      evidence: ev(['seriouslyfish-osteoglossum-bicirrhosum', 'batch20-fishbase-osteoglossum-bicirrhosum']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 90, measurement: 'TL' },
      activityLevel: 'high',
      swimmingZone: 'surface',
      needsCover: true,
      spaceNotes: ['成鱼可达约 90 cm TL；Seriously Fish 未给出可审核的固定最低缸体数字，只明确指出需公共展示级或极大型私人水体，因此这里不把旧 catalog 的 800 L 自动升级为 reviewed minimum。', '必须使用沉重且严密的缸盖，避免跳缸。'],
      evidence: ev(['seriouslyfish-osteoglossum-bicirrhosum', 'batch20-fishbase-osteoglossum-bicirrhosum']),
    },
  },
  sp_0018: {
    ...phase2Batch06Knowledge.sp_0018,
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 24, max: 28 },
      phRange: { min: 7.6, max: 8.8 },
      hardnessDgh: { min: 10, max: 25 },
      evidence: ev(['seriouslyfish-pseudotropheus-socolofi', 'batch08-fishbase-chindongo-socolofi']),
    },
    socialBehavior: {
      mode: 'harem',
      territoriality: 'medium',
      finNipping: 'unknown',
      predationRisk: 'low',
      swimmingPace: 'fast',
      summary: 'Lake Malawi mbuna，不适合普通社区缸。雄鱼具有领地性；同缸多雄需要更大空间，每只雄鱼应配多只雌鱼。这里不把“多雌”误写成所有场景的固定最低群体数量。',
      evidence: ev(['seriouslyfish-pseudotropheus-socolofi', 'batch08-fishbase-chindongo-socolofi']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 11.5, measurement: 'SL' },
      minVolumeLiters: 154,
      minTankLengthCm: 90,
      activityLevel: 'high',
      swimmingZone: 'all',
      needsHidingPlaces: true,
      spaceNotes: ['至少按 90 × 45 cm 底面积、约 154 L 规划，并以岩石洞穴形成视线阻隔和领地。'],
      evidence: ev(['seriouslyfish-pseudotropheus-socolofi']),
    },
  },
};
