import type { SpeciesKnowledgeProfile } from './knowledge.types';
import { phase2Batch18Knowledge } from './phase2Batch18Authority';
import { phase2Batch19Knowledge } from './phase2Batch19Authority';
const reviewedAt='2026-09-26';
const ev=(sourceIds:string[])=>({confidence:'verified' as const,reviewStatus:'reviewed' as const,sourceIds,reviewedAt});
export const priorityCompatibilityKnowledgeBatch3_20260926: Record<string,SpeciesKnowledgeProfile['knowledge']>={
sp_0181:{...phase2Batch19Knowledge.sp_0181,
 environment:{waterType:'freshwater',temperatureRangeC:{min:23,max:28},phRange:{min:6,max:7.5},hardnessDgh:{min:5,max:15},evidence:ev(['seriouslyfish-gnathonemus-petersii','batch21-fishbase-gnathonemus-petersii'])},
 socialBehavior:{mode:'variable',territoriality:'unknown',finNipping:'none',predationRisk:'low',swimmingZone:'bottom',swimmingPace:'slow',summary:'对异种通常安静和平，但会被活跃或攻击性鱼抢食；同类之间可有领地争斗，因此不把该行为扩展成对所有室友的永久领地冲突。',evidence:ev(['seriouslyfish-gnathonemus-petersii'])},
 spaceAndGrowth:{adultLengthCm:{max:22.5,measurement:'SL'},minVolumeLiters:243,minTankLengthCm:120,activityLevel:'medium',swimmingZone:'bottom',needsCover:true,needsHidingPlaces:true,substrateNotes:['必须使用细软砂质底床，避免损伤其用于觅食的下颌。'],spaceNotes:['单体长期至少按 120 × 45 cm、约 243 L 规划；成组需要更大空间。'],evidence:ev(['seriouslyfish-gnathonemus-petersii'])}},
sp_0139:{...phase2Batch18Knowledge.sp_0139,
 environment:{waterType:'freshwater',temperatureRangeC:{min:23,max:28},phRange:{min:4.8,max:7.5},hardnessDgh:{min:0,max:15},evidence:ev(['seriouslyfish-piaractus-brachypomus','batch20-fishbase-piaractus-brachypomus'])},
 socialBehavior:{mode:'variable',territoriality:'none',finNipping:'low',predationRisk:'high',swimmingPace:'fast',summary:'对大型同伴通常较和平，但小鱼可能被吞食；幼鱼偏群游，成年后趋于更独立，不能据此强制固定最低群体数。',evidence:ev(['seriouslyfish-piaractus-brachypomus'])},
 spaceAndGrowth:{adultLengthCm:{max:88,measurement:'SL'},minVolumeLiters:2430,minTankLengthCm:300,activityLevel:'high',swimmingZone:'all',spaceNotes:['终生饲养需要约 300 × 90 cm 底面积、约 2430 L 以上的超大型系统；幼鱼小缸仅可视为临时过渡。'],evidence:ev(['seriouslyfish-piaractus-brachypomus'])}},
sp_0140:{...phase2Batch18Knowledge.sp_0140,
 environment:{waterType:'freshwater',temperatureRangeC:{min:22.2,max:27.8},phRange:{min:4.5,max:7.5},hardnessDgh:{min:1,max:20},evidence:ev(['seriouslyfish-serrasalmus-rhombeus','batch20-fishbase-serrasalmus-rhombeus'])},
 socialBehavior:{mode:'solitary',territoriality:'high',finNipping:'high',predationRisk:'high',swimmingPace:'fast',summary:'应按单体物种缸规划；成鱼是大型主动捕食者，不把社区混养作为默认可接受方案。',evidence:ev(['seriouslyfish-serrasalmus-rhombeus'])},
 spaceAndGrowth:{adultLengthCm:{max:45,measurement:'SL'},minVolumeLiters:425,minTankLengthCm:210,activityLevel:'high',needsCover:true,spaceNotes:['单条成鱼至少约 210 × 45 cm 底面积、约 425 L，并要求高溶氧和稳定水质。'],evidence:ev(['seriouslyfish-serrasalmus-rhombeus'])}},
sp_0120:{...phase2Batch18Knowledge.sp_0120,
 environment:{waterType:'freshwater',temperatureRangeC:{min:22,max:28},phRange:{min:6,max:7.5},hardnessDgh:{min:2,max:15},evidence:ev(['seriouslyfish-gymnotus-carapo','batch20-fishbase-gymnotus-carapo'])},
 socialBehavior:{mode:'solitary',territoriality:'unknown',finNipping:'unknown',predationRisk:'high',swimmingZone:'bottom',swimmingPace:'slow',summary:'大型夜行捕食鱼；同类间领地性强，但资料允许与大型强健异种共存，因此不将其建模为对所有异种永久 territorial。',evidence:ev(['seriouslyfish-gymnotus-carapo'])},
 spaceAndGrowth:{adultLengthCm:{max:60,measurement:'SL'},minVolumeLiters:648,minTankLengthCm:180,activityLevel:'medium',swimmingZone:'bottom',needsCover:true,needsHidingPlaces:true,spaceNotes:['至少按 180 × 60 cm、约 648 L 规划，并提供大量遮蔽。'],evidence:ev(['seriouslyfish-gymnotus-carapo'])}},
sp_0138:{...phase2Batch18Knowledge.sp_0138,
 environment:{waterType:'freshwater',temperatureRangeC:{min:20,max:28},phRange:{min:5,max:7.5},hardnessDgh:{min:1,max:15},evidence:ev(['seriouslyfish-leporinus-fasciatus','batch20-fishbase-leporinus-fasciatus'])},
 socialBehavior:{mode:'variable',territoriality:'unknown',finNipping:'medium',predationRisk:'high',swimmingPace:'fast',summary:'少量同类容易争斗；可单养，或在足够大的系统中 6 条以上群养。更小型室友存在被捕食风险，因此不把 6 条作为所有场景强制最低数量。',evidence:ev(['seriouslyfish-leporinus-fasciatus'])},
 spaceAndGrowth:{adultLengthCm:{max:27,measurement:'SL'},minVolumeLiters:756,minTankLengthCm:210,activityLevel:'high',swimmingZone:'all',spaceNotes:['长期至少按 210 × 60 cm 底面积、约 756 L 规划，并保证充足溶氧和成熟过滤。'],evidence:ev(['seriouslyfish-leporinus-fasciatus'])}}
};
