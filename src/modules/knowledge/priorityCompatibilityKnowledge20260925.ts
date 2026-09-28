import type { SpeciesKnowledgeProfile } from './knowledge.types';
import { phase2Batch06Knowledge } from './phase2Batch06Authority';
import { phase2Batch16Knowledge } from './phase2Batch16Authority';
import { phase2Batch17Knowledge } from './phase2Batch17Authority';
import { phase2Batch19Knowledge } from './phase2Batch19Authority';
import { phase2Batch20Knowledge } from './phase2Batch20Authority';

const reviewedAt = '2026-09-25';
const ev = (sourceIds: string[]) => ({ confidence: 'verified' as const, reviewStatus: 'reviewed' as const, sourceIds, reviewedAt });

export const priorityCompatibilityKnowledge20260925: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0015: {
    ...phase2Batch16Knowledge.sp_0015,
    environment: {
      waterType: 'freshwater', temperatureRangeC: { min: 22, max: 30 }, phRange: { min: 6, max: 8 }, hardnessDgh: { min: 1, max: 20 },
      notes: ['长期饲养按大型淡水鱼规划；不把自然黑水中的极端 pH 当作普通水族箱目标范围。'],
      evidence: ev(['seriouslyfish-helostoma-temminkii', 'batch18-fishbase-helostoma-temminkii']),
    },
    socialBehavior: {
      mode: 'variable', territoriality: 'unknown', finNipping: 'unknown', predationRisk: 'low', swimmingPace: 'moderate',
      summary: '成鱼并非稳定群游鱼；空间不足时可出现明显攻击和支配行为。足够大的系统中可与强健同伴或多个同类共存，但不应把两条同养视为安全默认。',
      evidence: ev(['seriouslyfish-helostoma-temminkii']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 25, measurement: 'SL' }, minVolumeLiters: 304, minTankLengthCm: 150, activityLevel: 'medium', swimmingZone: 'all',
      spaceNotes: ['长期规划基线为至少 150 × 45 cm 缸底、约 304 L；空间不足会放大攻击和支配问题。'],
      evidence: ev(['seriouslyfish-helostoma-temminkii']),
    },
  },
  sp_0059: {
    ...phase2Batch17Knowledge.sp_0059,
    environment: {
      waterType: 'freshwater', temperatureRangeC: { min: 10, max: 22 }, phRange: { min: 6, max: 8 }, hardnessDgh: { min: 5, max: 20 },
      notes: ['多数情况下可使用非加热水族箱；长期不应按典型高温热带鱼条件规划。'],
      evidence: ev(['seriouslyfish-macropodus-opercularis', 'batch19-fishbase-macropodus-opercularis']),
    },
    socialBehavior: {
      mode: 'pair', territoriality: 'high', finNipping: 'unknown', predationRisk: 'low', swimmingPace: 'moderate',
      summary: '雄鱼有明确领地攻击，繁殖期更明显；相似体型鱼应谨慎，和平群游鱼在环境匹配时可作为同伴。',
      evidence: ev(['seriouslyfish-macropodus-opercularis']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 8, measurement: 'SL' }, minVolumeLiters: 72, minTankLengthCm: 80, activityLevel: 'medium', needsCover: true,
      spaceNotes: ['单对至少按 80 × 30 cm、约 72 L 规划，并提供遮蔽和表层植物。'],
      evidence: ev(['seriouslyfish-macropodus-opercularis']),
    },
  },
  sp_0199: {
    ...phase2Batch19Knowledge.sp_0199,
    environment: {
      waterType: 'freshwater', temperatureRangeC: { min: 15, max: 25 }, phRange: { min: 6, max: 7.5 }, hardnessDgh: { min: 3, max: 15 },
      evidence: ev(['seriouslyfish-badis-badis', 'batch21-fishbase-badis-badis']),
    },
    socialBehavior: {
      mode: 'pair', territoriality: 'high', finNipping: 'unknown', predationRisk: 'medium', swimmingPace: 'slow',
      summary: '行动较慢且有领地性；雄鱼之间在狭小空间会明显争斗，也可能捕食 Caridina / Neocaridina 小型淡水虾。',
      evidence: ev(['seriouslyfish-badis-badis']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 6, measurement: 'SL' }, minVolumeLiters: 72, minTankLengthCm: 80, activityLevel: 'low', needsCover: true, needsHidingPlaces: true,
      spaceNotes: ['至少按 80 × 30 cm、约 72 L 规划；多雄鱼需要分散洞穴与独立领地。'],
      evidence: ev(['seriouslyfish-badis-badis']),
    },
  },
  sp_0200: {
    ...phase2Batch20Knowledge.sp_0200,
    environment: {
      waterType: 'freshwater', temperatureRangeC: { min: 18, max: 26 }, phRange: { min: 6.5, max: 8.5 }, hardnessDgh: { min: 1, max: 15 },
      evidence: ev(['seriouslyfish-dario-dario', 'batch22-fishbase-dario-dario']),
    },
    socialBehavior: {
      mode: 'pair', territoriality: 'high', finNipping: 'unknown', predationRisk: 'low', swimmingPace: 'slow',
      summary: '体型很小、行动较慢，容易被大型或活跃鱼压制；雄鱼之间可强烈争斗，社区缸同伴必须谨慎选择。',
      evidence: ev(['seriouslyfish-dario-dario']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 2, measurement: 'SL' }, minVolumeLiters: 41, minTankLengthCm: 45, activityLevel: 'low', needsCover: true, needsHidingPlaces: true,
      spaceNotes: ['单对或一雄多雌至少按 45 × 30 cm、约 41 L 规划；多雄鱼需为每只雄鱼保留独立领地。'],
      evidence: ev(['seriouslyfish-dario-dario']),
    },
  },
  sp_0019: {
    ...phase2Batch06Knowledge.sp_0019,
    environment: {
      waterType: 'freshwater', temperatureRangeC: { min: 28, max: 32 }, phRange: { min: 4.8, max: 6.2 }, hardnessDgh: { min: 0, max: 5 },
      notes: ['需要高温、软且酸性的水；不以普通神仙鱼更宽的范围覆盖 Altum 的对象级要求。'],
      evidence: ev(['seriouslyfish-pterophyllum-altum', 'batch08-fishbase-pterophyllum-altum']),
    },
    socialBehavior: {
      mode: 'unknown', territoriality: 'unknown', finNipping: 'unknown', predationRisk: 'high', swimmingPace: 'moderate',
      summary: '对更大的和平鱼通常可行，但能入口的小型鱼存在明确捕食风险；资料明确举例包括红绿灯、孔雀鱼和小型波鱼。',
      evidence: ev(['seriouslyfish-pterophyllum-altum']),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 17.8, measurement: 'SL' }, activityLevel: 'medium', needsCover: true,
      spaceNotes: ['来源确认成体约 17.8 cm SL 且属于大型、高体型神仙鱼，但没有给出可直接提升的最低缸长/升数。'],
      evidence: ev(['seriouslyfish-pterophyllum-altum']),
    },
  },
};
