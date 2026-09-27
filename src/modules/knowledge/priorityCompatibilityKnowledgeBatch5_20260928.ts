import type { SpeciesKnowledgeProfile } from './knowledge.types';
import { phase2Batch07Knowledge } from './phase2Batch07Authority';

const reviewedAt = '2026-09-28';
const ev = (sourceIds: string[]) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
});

/** Exact-object runtime promotions for Compatibility priority batch 5. */
export const priorityCompatibilityKnowledgeBatch5_20260928: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0054: {
    ...phase2Batch07Knowledge.sp_0054,
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 22, max: 28 },
      phRange: { min: 6, max: 7.8 },
      hardnessDgh: { min: 4, max: 18 },
      evidence: ev(['seriouslyfish-hemichromis-bimaculatus', 'batch09-fishbase-hemichromis-bimaculatus']),
    },
    socialBehavior: {
      mode: 'pair',
      territoriality: 'high',
      finNipping: 'unknown',
      predationRisk: 'low',
      swimmingPace: 'moderate',
      summary: '明显领地型慈鲷，不适合作为普通社区鱼；繁殖期攻击性会显著增强。来源允许在足够空间内与更大型、合适的异种搭配，但不将其泛化为安全社区鱼。',
      evidence: ev(['seriouslyfish-hemichromis-bimaculatus']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 15, measurement: 'SL' },
      minVolumeLiters: 108,
      minTankLengthCm: 120,
      activityLevel: 'medium',
      needsHidingPlaces: true,
      spaceNotes: ['至少按 120 × 30 cm 底面积、约 108 L 规划，并提供明确领地与遮蔽。'],
      evidence: ev(['seriouslyfish-hemichromis-bimaculatus']),
    },
  },
  sp_0057: {
    ...phase2Batch07Knowledge.sp_0057,
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 24, max: 27 },
      phRange: { min: 7.5, max: 9 },
      hardnessDgh: { min: 8, max: 20 },
      notes: ['坦噶尼喀湖硬碱水环境；需要岩石洞穴和稳定水质。'],
      evidence: ev(['seriouslyfish-altolamprologus-calvus', 'batch09-fishbase-altolamprologus-calvus']),
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'medium',
      finNipping: 'none',
      predationRisk: 'high',
      swimmingPace: 'slow',
      summary: '领地型捕食慈鲷，会捕食鱼卵、鱼苗和能入口的小鱼；对无法吞食且不过度凶猛喧闹的合适坦湖鱼可谨慎搭配。',
      evidence: ev(['seriouslyfish-altolamprologus-calvus']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 13.8, measurement: 'SL' },
      activityLevel: 'medium',
      needsHidingPlaces: true,
      spaceNotes: ['需要大型岩石洞穴环境；精确来源未提供可审核的固定最低缸体数字，因此不把旧 catalog 的 120 L 升级为 reviewed minimum。'],
      evidence: ev(['seriouslyfish-altolamprologus-calvus', 'batch09-fishbase-altolamprologus-calvus']),
    },
  },
  sp_0058: {
    ...phase2Batch07Knowledge.sp_0058,
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 24, max: 27 },
      phRange: { min: 7.5, max: 9 },
      hardnessDgh: { min: 8, max: 25 },
      notes: ['坦噶尼喀湖硬碱水环境。'],
      evidence: ev(['seriouslyfish-neolamprologus-multifasciatus', 'batch09-fishbase-neolamprologus-multifasciatus']),
    },
    socialBehavior: {
      mode: 'colony',
      sexRatioGuidance: '多只饲养时建议雌鱼数量多于雄鱼；这不是硬性最低群体数量。',
      territoriality: 'medium',
      finNipping: 'none',
      predationRisk: 'low',
      swimmingZone: 'bottom',
      swimmingPace: 'moderate',
      summary: '围绕螺壳建立并积极防守小型领地；可形成群落，也可与主要活动在其他水层的合适坦湖鱼搭配。现有来源不支持把群落建议写成固定最低群体数。',
      evidence: ev(['seriouslyfish-neolamprologus-multifasciatus']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 4.5, measurement: 'SL' },
      minVolumeLiters: 40,
      minTankLengthCm: 45,
      activityLevel: 'medium',
      swimmingZone: 'bottom',
      needsHidingPlaces: true,
      substrateNotes: ['使用细沙，并提供数量多于鱼只的空螺壳。'],
      spaceNotes: ['一对至少按 45 × 30 × 30 cm、约 40 L 规划；群落需要更大的底面积。'],
      evidence: ev(['seriouslyfish-neolamprologus-multifasciatus']),
    },
  },
};
