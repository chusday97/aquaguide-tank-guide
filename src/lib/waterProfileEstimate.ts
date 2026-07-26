import type { Aquarium } from '../types';

export type WaterProfileTendency = 'acidic' | 'neutral' | 'alkaline' | 'marine' | 'unknown';

export type WaterProfileEstimate = {
  tendency: WaterProfileTendency;
  confidence: 'low' | 'medium';
  evidence: string[];
  limitation: string;
};

const includesAny = (values: string[], patterns: RegExp[]) => values.some(value => patterns.some(pattern => pattern.test(value)));

export const estimateWaterProfile = (aquarium?: Aquarium | null): WaterProfileEstimate => {
  if (!aquarium) {
    return {
      tendency: 'unknown',
      confidence: 'low',
      evidence: [],
      limitation: '尚未选择鱼缸，无法估计水体倾向。',
    };
  }
  if (aquarium.waterType === 'Saltwater') {
    return {
      tendency: 'marine',
      confidence: 'medium',
      evidence: ['当前鱼缸记录为海水环境'],
      limitation: '海水类型不能替代盐度、KH 或 pH 实测。',
    };
  }

  const substrate = aquarium.substrate ? [aquarium.substrate] : [];
  const hardscape = aquarium.hardscape || [];
  const plants = aquarium.plants || [];
  const acidicEvidence: string[] = [];
  const alkalineEvidence: string[] = [];

  if (includesAny(substrate, [/水草泥|泥炭|黑土|aquarium soil|peat/i])) acidicEvidence.push(`底床：${substrate[0]}`);
  if (includesAny(hardscape, [/沉木|杜鹃根|榄仁叶|driftwood|spider wood|almond/i])) acidicEvidence.push('沉木或落叶类造景');
  if (includesAny(substrate, [/珊瑚砂|贝壳砂|coral sand|aragonite/i])) alkalineEvidence.push(`底床：${substrate[0]}`);
  if (includesAny(hardscape, [/青龙石|石灰石|珊瑚骨|贝壳|seiryu|limestone|coral/i])) alkalineEvidence.push('可能释放矿物质的石材');

  if (acidicEvidence.length > 0 && alkalineEvidence.length > 0) {
    return {
      tendency: 'unknown',
      confidence: 'low',
      evidence: [...acidicEvidence, ...alkalineEvidence],
      limitation: '偏酸与偏碱线索同时存在，不能可靠推断；如饲养敏感物种请使用试纸或滴定测试。',
    };
  }
  if (acidicEvidence.length > 0) {
    return {
      tendency: 'acidic',
      confidence: acidicEvidence.length >= 2 ? 'medium' : 'low',
      evidence: [...acidicEvidence, ...(plants.length >= 5 ? ['水草较多（仅作弱线索）'] : [])],
      limitation: '这里只表示可能偏酸，不代表实际 pH 数值。',
    };
  }
  if (alkalineEvidence.length > 0) {
    return {
      tendency: 'alkaline',
      confidence: alkalineEvidence.length >= 2 ? 'medium' : 'low',
      evidence: alkalineEvidence,
      limitation: '这里只表示可能偏碱，不代表实际 pH 数值。',
    };
  }
  return {
    tendency: 'neutral',
    confidence: 'low',
    evidence: plants.length >= 5 ? ['水草较多，但不能单独判断 pH'] : ['未发现明显改变酸碱倾向的底床或硬景'],
    limitation: '默认只按中性附近理解；敏感物种仍应使用试纸或滴定测试。',
  };
};
