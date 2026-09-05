import { fishData } from './fishData';
import { getReviewedCompatibilityProfile } from './compatibilityEvidence';
import { getLifeType } from '../modules/species/species.service';
import type { Fish } from '../types';

/**
 * Research and review queue only. Membership never grants a species a
 * compatibility decision; reviewed evidence remains the only readiness gate.
 */
export const LAUNCH_COHORT_TARGET = 30;

/**
 * Frozen first-release review cohort. IDs are explicit so sorting changes,
 * duplicate variants, or newly added catalog rows cannot silently change the
 * evidence scope. Each ID represents one base species; variants are reviewed
 * through their base record rather than counted as separate species.
 */
export const LAUNCH_COHORT_IDS = [
  'sp_0431', // 红绿灯
  'sp_0432', // 宝莲灯
  'sp_0434', // 白云金丝
  'sp_0436', // 孔雀鱼
  'sp_0435', // 斑马鱼
  'sp_0439', // 虎皮鱼
  'sp_0010', // 黑裙鱼
  'sp_0011', // 月光鱼
  'sp_0437', // 玛丽鱼
  'sp_0438', // 红剑鱼
  'sp_0012', // 樱桃灯
  'sp_0468', // 金三角灯
  'sp_0433', // 红鼻剪刀
  'sp_0443', // 熊猫鼠
  'sp_0014', // 咖啡鼠
  'sp_0013', // 小精灵
  'sp_0444', // 珍珠马甲
  'sp_0016', // 金波子
  'sp_0446', // 天使鱼
  'sp_0447', // 七彩神仙鱼
  'sp_0451', // 地图鱼
  'sp_0021', // 迷你鹦鹉鱼
  'sp_0049', // 珍珠赤雷龙
  'sp_0224', // 白金雷龙
  'sp_0475', // 高体鳑鲏
  'sp_0459', // 黑壳虾
  'sp_0001', // 极火虾
  'sp_0002', // 水晶虾
  'sp_0428', // 斑马螺
  'sp_0258', // 泰国斗鱼品系代表（Betta splendens）
] as const;

if (new Set(LAUNCH_COHORT_IDS).size !== LAUNCH_COHORT_IDS.length) {
  throw new Error('Launch cohort IDs must be unique');
}

if (LAUNCH_COHORT_IDS.length !== LAUNCH_COHORT_TARGET) {
  throw new Error(`Launch cohort must contain exactly ${LAUNCH_COHORT_TARGET} IDs`);
}

const eligibleSpecies = fishData.filter(species => !['plant', 'hardscape'].includes(getLifeType(species)));
const eligibleById = new Map(
  eligibleSpecies.map(species => [species.id, species]),
);

export const selectCompatibilityLaunchCohort = (): Fish[] => {
  const missingIds = LAUNCH_COHORT_IDS.filter(id => !eligibleById.has(id));
  if (missingIds.length > 0) {
    throw new Error(`Launch cohort IDs missing from eligible catalog: ${missingIds.join(', ')}`);
  }
  return LAUNCH_COHORT_IDS.map(id => eligibleById.get(id) as Fish);
};

export const isSpeciesDecisionReady = (speciesId: string) => {
  const profile = getReviewedCompatibilityProfile(speciesId);
  return Boolean(profile && profile.reviewStatus === 'reviewed' && profile.citations.length > 0);
};
