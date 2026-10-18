import type { SpeciesKnowledgeProfile } from './knowledge.types';
import { phase2Batch03Knowledge } from './phase2Batch03Authority';

const reviewedAt = '2026-10-18';

const reviewedEvidence = (sourceIds: string[], note: string) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

const normaniSource = 'aquaristatlas-poropanchax-normani-behavior-phase2-05';
const amapaensisSource = 'seriouslyfish-hyphessobrycon-amapaensis-behavior-phase2-05';

export const poropanchaxNormaniKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...phase2Batch03Knowledge.sp_0112!,
  socialBehavior: {
    mode: 'school',
    minimumGroupSize: 6,
    recommendedGroupSize: { min: 6 },
    swimmingZone: 'upper',
    territoriality: 'low',
    predationRisk: 'low',
    summary: '温和的上层群游鳉鱼，建议至少 6 条；对体型相近的温和鱼通常不具攻击性，也没有稳定的领地防御行为。',
    evidence: reviewedEvidence(
      [normaniSource],
      'Exact-taxon Aquarist Atlas husbandry evidence supports schooling, six-or-more grouping, non-aggression toward similarly sized tankmates and lack of spawning-site territory defence.',
    ),
  },
};

export const hyphessobryconAmapaensisKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  ...phase2Batch03Knowledge.sp_0115!,
  socialBehavior: {
    mode: 'school',
    minimumGroupSize: 8,
    recommendedGroupSize: { min: 8, max: 10 },
    swimmingZone: 'middle',
    territoriality: 'low',
    predationRisk: 'low',
    summary: '非常温和的群游灯鱼，建议至少 8–10 条；适合与体型接近的温和社区鱼混养。',
    evidence: reviewedEvidence(
      [amapaensisSource],
      'Seriously Fish exact-taxon husbandry evidence supports very peaceful schooling behaviour, an 8–10 specimen minimum and compatibility with similarly sized community fishes.',
    ),
  },
};
