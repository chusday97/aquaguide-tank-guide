import assert from 'node:assert/strict';
import { buildSpeciesCarePresentation } from '../src/modules/knowledge/speciesCarePresentation';
import { buildSpeciesKnowledgeProfile, getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import type { Fish } from '../src/types';

const baseFish: Fish = {
  id: 'test-species',
  name: '测试鱼',
  scientificName: 'Testus species',
  category: '淡水鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-28°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: '这段描述不能被当成常见风险。',
  diet: '基础杂食资料',
  tankSize: '至少 30 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingReason: '这段混养说明不能被当成躲藏与造景资料。',
};

const basic = buildSpeciesCarePresentation(baseFish);
assert.equal(basic.sourceStatus, 'pending');
assert.equal(basic.sourceLabel, '资料待核验');
assert.deepEqual(basic.feedingItems, [{ label: '基础资料', value: '基础杂食资料' }]);
assert.equal(basic.feedingItems.some(item => item.value.includes('混养说明')), false);
assert.equal(basic.feedingItems.some(item => item.value.includes('常见风险')), false);

const reviewed = buildSpeciesCarePresentation({
  ...baseFish,
  feedingProfile: {
    feedingType: '杂食性',
    recommendedFoods: '微颗粒饲料',
    feedingFrequency: '每天 1 次',
    portionRule: '2 分钟内吃完',
    avoidFoods: '变质饲料',
    needsReview: true,
    reviewReason: '缺少物种专属来源',
    sourceName: 'rule_fallback',
  },
});
assert.equal(reviewed.sourceStatus, 'pending');
assert.equal(reviewed.sourceDetail, '缺少物种专属来源');
assert.equal(reviewed.feedingItems.some(item => item.label === '推荐食物'), true);

const generic = buildSpeciesCarePresentation({
  ...baseFish,
  feedingProfile: {
    feedingType: '杂食性',
    recommendedFoods: '通用饲料',
    feedingFrequency: '每天 1 次',
    portionRule: '少量',
    avoidFoods: '过量',
    needsReview: false,
    sourceName: 'rule_fallback',
  },
});
assert.equal(generic.sourceStatus, 'generic');
assert.equal(generic.sourceLabel, '通用参考');


const guppyKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0436', name: '孔雀鱼', scientificName: 'Poecilia reticulata' });
assert.equal(guppyKnowledge.knowledge.sexIdentification.confidence, 'verified');
assert.equal(guppyKnowledge.knowledge.reproduction?.mode, 'livebearer');
assert.equal(guppyKnowledge.knowledge.reproduction?.fertilization, 'internal');
assert.ok(guppyKnowledge.knowledge.sexIdentification.maleTraits?.some(item => item.includes('交接器')));
assert.equal(guppyKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 45);
assert.equal(guppyKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 6);

const neonKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0431', name: '红绿灯', scientificName: 'Paracheirodon innesi' });
assert.equal(neonKnowledge.knowledge.socialBehavior?.minimumGroupSize, 8);
assert.equal(neonKnowledge.knowledge.reproduction?.mode, 'egg_scatterer');
assert.equal(neonKnowledge.knowledge.reproduction?.parentalCare, 'none');
assert.equal(neonKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 60);
assert.equal(neonKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 54);

const cardinalKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0432', name: '宝莲灯', scientificName: 'Paracheirodon axelrodi' });
assert.equal(cardinalKnowledge.knowledge.sexIdentification.reliableFromLifeStage, 'adult');
assert.equal(cardinalKnowledge.knowledge.socialBehavior?.recommendedGroupSize?.min, 8);
assert.equal(cardinalKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 3.5);
assert.equal(cardinalKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 60);


const whiteCloudKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0434', name: '白云金丝', scientificName: 'Tanichthys albonubes' });
assert.equal(whiteCloudKnowledge.knowledge.socialBehavior?.minimumGroupSize, 10);
assert.equal(whiteCloudKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 60);
const zebraKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0435', name: '斑马鱼', scientificName: 'Danio rerio' });
assert.equal(zebraKnowledge.knowledge.socialBehavior?.minimumGroupSize, 8);
assert.equal(zebraKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 90);
assert.equal(zebraKnowledge.knowledge.reproduction?.mode, 'egg_scatterer');
const tigerKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0439', name: '虎皮鱼', scientificName: 'Puntigrus tetrazona' });
assert.equal(tigerKnowledge.knowledge.socialBehavior?.minimumGroupSize, 8);
assert.equal(tigerKnowledge.knowledge.socialBehavior?.finNipping, 'medium');
assert.equal(tigerKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 72);

const inheritedBetta = { ...baseFish, id: 'sp_0259', name: '半月斗鱼 (蓝蝴蝶)', scientificName: 'Betta splendens var. Halfmoon' };
const inheritedBettaKnowledge = buildSpeciesKnowledgeProfile(inheritedBetta);
assert.equal(inheritedBettaKnowledge.knowledge.socialBehavior?.mode, 'solitary');
assert.equal(inheritedBettaKnowledge.knowledge.socialBehavior?.finNipVulnerability, 'high');
assert.equal(inheritedBettaKnowledge.knowledge.reproduction?.mode, 'bubble_nester');
assert.ok(inheritedBettaKnowledge.knowledge.socialBehavior?.evidence.sourceIds.includes('seriouslyfish-betta-splendens'));
assert.equal(getReviewedSpeciesKnowledgeForFish(inheritedBetta)?.socialBehavior?.territoriality, 'high');

const angelfishKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0446', name: '天使鱼（神仙鱼）', scientificName: 'Pterophyllum scalare' });
assert.equal(angelfishKnowledge.knowledge.socialBehavior?.finNipVulnerability, 'high');
assert.equal(angelfishKnowledge.knowledge.socialBehavior?.predationRisk, 'medium');
assert.equal(angelfishKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 200);
assert.equal(angelfishKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 100);
const angelfishSources = resolveKnowledgeSources(angelfishKnowledge.knowledge.socialBehavior?.evidence.sourceIds || []);
assert.equal(angelfishSources.length, 2);

const unknownKnowledge = buildSpeciesKnowledgeProfile(baseFish);
assert.equal(unknownKnowledge.knowledge.sexIdentification.confidence, 'unknown');
assert.equal(unknownKnowledge.knowledge.reproduction, undefined);


const reviewedKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0431',
  name: '红绿灯',
  scientificName: 'Paracheirodon innesi',
});
assert.equal(reviewedKnowledge.knowledge.socialBehavior?.minimumGroupSize, 8);
const sexSourceRefs = resolveKnowledgeSources(reviewedKnowledge.knowledge.sexIdentification.evidence?.sourceIds || []);
assert.equal(sexSourceRefs.length, 1);
assert.equal(sexSourceRefs[0]?.publisher, 'Seriously Fish');
assert.ok(sexSourceRefs[0]?.url.includes('paracheirodon-innesi'));
assert.deepEqual(resolveKnowledgeSources(['unknown-source']), []);

console.log('species detail knowledge assertions passed');
