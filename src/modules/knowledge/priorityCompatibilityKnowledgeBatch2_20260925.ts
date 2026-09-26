import type { SpeciesKnowledgeProfile } from './knowledge.types';
import { phase2Batch07Knowledge } from './phase2Batch07Authority';
import { phase2Batch08Knowledge } from './phase2Batch08Authority';
import { phase2Batch16Knowledge } from './phase2Batch16Authority';
import { phase2Batch18Knowledge } from './phase2Batch18Authority';
const reviewedAt='2026-09-25';
const ev=(sourceIds:string[])=>({confidence:'verified' as const,reviewStatus:'reviewed' as const,sourceIds,reviewedAt});
export const priorityCompatibilityKnowledgeBatch2_20260925: Record<string,SpeciesKnowledgeProfile['knowledge']>={
sp_0043:{...phase2Batch16Knowledge.sp_0043,
 environment:{waterType:'freshwater',temperatureRangeC:{min:10,max:22},phRange:{min:6,max:7.5},hardnessDgh:{min:5,max:20},notes:['多数情况下可使用非加热水族箱，并可从较凉冬季阶段获益。'],evidence:ev(['seriouslyfish-macropodus-ocellatus','batch18-fishbase-macropodus-ocellatus'])},
 socialBehavior:{mode:'group',territoriality:'unknown',finNipping:'unknown',predationRisk:'low',swimmingPace:'moderate',summary:'可在足够大且结构丰富的缸中群养；雄鱼仅在繁殖活跃时出现明确领地攻击，因此不建模为永久领地鱼。',evidence:ev(['seriouslyfish-macropodus-ocellatus'])},
 spaceAndGrowth:{adultLengthCm:{max:8,measurement:'SL'},minVolumeLiters:72,minTankLengthCm:80,activityLevel:'medium',needsCover:true,spaceNotes:['单对至少按 80 × 30 cm、约 72 L 规划。'],evidence:ev(['seriouslyfish-macropodus-ocellatus'])}},
sp_0044:{...phase2Batch16Knowledge.sp_0044,
 environment:{waterType:'freshwater',temperatureRangeC:{min:20,max:30},phRange:{min:6,max:8},hardnessDgh:{min:5,max:20},evidence:ev(['seriouslyfish-macropodus-spechti','batch18-fishbase-macropodus-spechti'])},
 socialBehavior:{mode:'variable',territoriality:'low',finNipping:'unknown',predationRisk:'low',swimmingPace:'moderate',summary:'通常较温和，可成对或成群维护；繁殖期才需要额外防范领地防御。',evidence:ev(['seriouslyfish-macropodus-spechti'])},
 spaceAndGrowth:{adultLengthCm:{max:8,measurement:'SL'},minVolumeLiters:72,minTankLengthCm:80,activityLevel:'medium',needsCover:true,spaceNotes:['单对至少按 80 × 30 cm、约 72 L 规划。'],evidence:ev(['seriouslyfish-macropodus-spechti'])}},
sp_0062:{...phase2Batch07Knowledge.sp_0062,
 environment:{waterType:'freshwater',temperatureRangeC:{min:22,max:26},phRange:{min:6,max:8},hardnessDgh:{min:3,max:20},evidence:ev(['seriouslyfish-moenkhausia-sanctaefilomenae','batch09-fishbase-moenkhausia-sanctaefilomenae'])},
 socialBehavior:{mode:'shoal',minimumGroupSize:6,recommendedGroupSize:{min:6,max:8},territoriality:'none',finNipping:'medium',predationRisk:'low',swimmingPace:'fast',summary:'活跃且略显喧闹；至少 6–8 条能把争斗更多限制在群体内部，并显著降低咬鳍风险。',evidence:ev(['seriouslyfish-moenkhausia-sanctaefilomenae'])},
 spaceAndGrowth:{adultLengthCm:{max:7,measurement:'SL'},minVolumeLiters:103,minTankLengthCm:90,activityLevel:'high',swimmingZone:'middle',spaceNotes:['按 90 × 38 cm、约 103 L 起步规划。'],evidence:ev(['seriouslyfish-moenkhausia-sanctaefilomenae'])}},
sp_0119:{...phase2Batch18Knowledge.sp_0119,
 environment:{waterType:'freshwater',temperatureRangeC:{min:23,max:30},phRange:{min:6,max:7.5},hardnessDgh:{min:5,max:15},evidence:ev(['seriouslyfish-pantodon-buchholzi','batch20-fishbase-pantodon-buchholzi'])},
 socialBehavior:{mode:'variable',territoriality:'unknown',finNipping:'unknown',finNipVulnerability:'high',swimmingZone:'surface',swimmingPace:'moderate',predationRisk:'high',summary:'表层捕食者，会吞食能入口的小鱼；拖长鳍也容易成为咬鳍鱼目标，且与其他表层鱼可能出现攻击。',evidence:ev(['seriouslyfish-pantodon-buchholzi'])},
 spaceAndGrowth:{adultLengthCm:{max:12,measurement:'SL'},minVolumeLiters:81,minTankLengthCm:90,activityLevel:'medium',swimmingZone:'surface',needsCover:true,spaceNotes:['至少按 90 × 30 cm、约 81 L 规划，缸宽和严密上盖尤其重要。'],evidence:ev(['seriouslyfish-pantodon-buchholzi'])}},
sp_0125:{...phase2Batch08Knowledge.sp_0125,
 environment:{waterType:'freshwater',temperatureRangeC:{min:22,max:30},phRange:{min:5,max:7.5},hardnessDgh:{min:1,max:15},notes:['需要成熟、洁净且有较高溶氧/水流的系统。'],evidence:ev(['seriouslyfish-hypancistrus-inspector','batch10-fishbase-hypancistrus-inspector'])},
 socialBehavior:{mode:'group',territoriality:'low',finNipping:'none',predationRisk:'low',swimmingZone:'bottom',swimmingPace:'slow',summary:'总体和平，可进入精心选择的社区缸；不与其他 Hypancistrus 混养以避免杂交。现有来源未给出可安全提升的最低群体数量。',evidence:ev(['seriouslyfish-hypancistrus-inspector'])},
 spaceAndGrowth:{adultLengthCm:{max:16,measurement:'SL'},minVolumeLiters:243,minTankLengthCm:120,activityLevel:'medium',swimmingZone:'bottom',needsHidingPlaces:true,spaceNotes:['至少按 120 × 45 cm、约 243 L 规划，并保持水流与高溶氧。'],evidence:ev(['seriouslyfish-hypancistrus-inspector'])}}
};
