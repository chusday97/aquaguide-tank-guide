import type { SpeciesKnowledgeProfile } from './knowledge.types';

const reviewedAt = '2026-10-11';
const fishBase = 'batch08-fishbase-pseudorasbora-parva';
const spawningStudy = 'doi-pseudorasbora-parva-spawning-competition-2004';
const shoalingStudy = 'doi-pseudorasbora-parva-shoaling-2005';

const reviewedEvidence = (sourceIds: string[], note: string) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

export const pseudorasboraParvaKnowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0042: {
    sexIdentification: {
      title: '本轮不提供稳定的公母外观判断',
      summary: 'FishBase 仅支持成体存在性二型，但当前证据不足以形成可稳定执行的家庭水族箱公母辨别规则。',
      points: ['不凭体色或体型单独猜测性别。', '繁殖期行为可作为观察线索，但不替代明确的形态鉴别证据。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '成体性二型存在，但对象级辨别规则不足', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
      evidence: {
        confidence: 'unknown',
        reviewStatus: 'reviewed',
        sourceIds: [fishBase],
        reviewedAt,
        note: 'FishBase reports sexual dimorphism in large adults but does not provide enough detail here for a robust product identification rule.',
      },
    },
    reproduction: {
      mode: 'substrate_spawner',
      plainLanguageLabel: '基质产卵 / 雄鱼护卵',
      summary: '繁殖期雄鱼会围绕石块、植物或贝壳等产卵基质建立领地；雌鱼产卵后由雄鱼受精并护卵。此阶段追逐、顶撞和驱赶竞争者会明显增强。',
      fertilization: 'external',
      parentalCare: 'egg_guarding',
      breedingBehavior: [
        '雄鱼围绕产卵基质建立繁殖领地。',
        '优势雄鱼可追逐、顶撞或绕行攻击竞争雄鱼。',
        '雄鱼守护受精卵直到孵化前后。',
      ],
      breedingAggression: 'medium',
      evidence: reviewedEvidence(
        [fishBase, spawningStudy],
        'FishBase and a controlled Ichthyological Research study directly support substrate-centered male territorial competition and egg guarding.',
      ),
    },
    environment: {
      waterType: 'freshwater',
      waterTypes: ['freshwater', 'brackish'],
      notes: [
        'FishBase 同时记录淡水与半咸水环境。',
        '5–22°C 为生态/气候记录；当前不把它直接当成家庭水族箱目标温度。',
        '常见于植被较多的小水道、池塘和小湖，成鱼也可出现在较凉的流水环境。',
      ],
      evidence: reviewedEvidence(
        [fishBase],
        'Freshwater and brackish occurrence are directly supported; ecological temperature is retained as context rather than promoted to an aquarium setpoint.',
      ),
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'unknown',
      predationRisk: 'unknown',
      summary: '会出现结群，但结群频率和群体大小会随捕食压力与昼夜变化；繁殖期雄鱼又会转为围绕产卵基质的局部护域。混养时应把“常态群聚”和“繁殖期护域”分开判断，而不是永久贴上强领地鱼标签。',
      evidence: reviewedEvidence(
        [shoalingStudy, spawningStudy],
        'Hydrobiologia documents context-dependent shoaling; the spawning competition study documents breeding-context male aggression. No fixed minimum group size or permanent territory rule is inferred.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 12.5, measurement: 'TL' },
      activityLevel: 'unknown',
      spaceNotes: [
        'FishBase 最大记录为 12.5 cm TL。',
        '当前没有经过审核的家庭水族箱最小缸长/体积证据，因此不从成体长度反推缸体尺寸。',
      ],
      evidence: reviewedEvidence([fishBase], 'FishBase directly supports the maximum total length; aquarium minimum dimensions remain unknown.'),
    },
  },
};
