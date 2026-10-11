import type { SpeciesKnowledgeProfile } from './knowledge.types';

const reviewedAt = '2026-10-11';
const fishBase = 'fishbase-opsariichthys-bidens';
const dietStudy = 'doi-opsariichthys-bidens-ontogeny-diet';
const enrichmentStudy = 'doi-opsariichthys-bidens-enrichment-2024';

const reviewedEvidence = (sourceIds: string[], note: string) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

export const opsariichthysBidensKnowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0038: {
    sexIdentification: {
      title: '成鱼公母有可核验的外观差异',
      summary: 'FishBase 记录成体雄鱼臀鳍条突出、下颌联合处有明显突起并带不规则暗纹；雌鱼体色相对素。',
      points: [
        '成体雄鱼：臀鳍条更突出。',
        '成体雄鱼：下颌联合处有明显突起。',
        '成体雄鱼可见不规则暗纹；雌鱼体色相对素。',
      ],
      confidence: 'verified',
      source: { type: 'species_data', label: 'FishBase', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['臀鳍条突出', '下颌联合处明显突起', '不规则暗纹'],
      femaleTraits: ['体色相对素'],
      evidence: reviewedEvidence([fishBase], 'FishBase directly describes adult sexual dichromatism and male morphological traits.'),
    },
    environment: {
      waterType: 'freshwater',
      notes: [
        'FishBase 将该物种记录为淡水、底中层活动的温带鱼。',
        'FishBase 的 10–20°C 是生态/气候记录；当前不把它直接当成家庭水族箱目标温度。',
      ],
      evidence: reviewedEvidence([fishBase], 'Freshwater environment is directly supported; the ecological climate range is retained as context rather than promoted to an aquarium setpoint.'),
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'unknown',
      predationRisk: 'medium',
      summary: '实验中记录到聚集、追逐和啃咬等攻击行为，并讨论了社会层级；同时，大型个体会明显转向食鱼。长期混养应把小型鱼视为捕食对象，不能因为幼鱼阶段暂时和平就判定安全。',
      evidence: reviewedEvidence(
        [enrichmentStudy, dietStudy],
        'The 2024 controlled study directly observed clustering and aggressive chasing/nipping; the ontogenetic diet study found fish-dominated diets in large individuals. No fixed aquarium group minimum is inferred.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 26.1, measurement: 'TL' },
      activityLevel: 'unknown',
      spaceNotes: [
        'FishBase 最大记录为 26.1 cm TL。',
        '当前没有经过审核的家庭水族箱最小缸长/体积证据，因此不从成体长度反推缸体尺寸。',
      ],
      evidence: reviewedEvidence([fishBase], 'FishBase directly supports the maximum total length; aquarium minimum dimensions remain unknown.'),
    },
  },
};
