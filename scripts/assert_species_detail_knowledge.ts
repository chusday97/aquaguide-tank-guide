import assert from 'node:assert/strict';
import { buildSpeciesCarePresentation } from '../src/modules/knowledge/speciesCarePresentation';
import { buildSpeciesKnowledgeProfile, getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { fishData } from '../src/data/fishData';
import { getSpeciesHousingAuthority } from '../src/modules/knowledge/speciesHousingAuthority';
import { getPhase2Authority, phase2AuthorityBatchCount, phase2AuthorityBySpeciesId } from '../src/modules/knowledge/speciesKnowledge';
import { getSpeciesFilterTags, getSpeciesPositioning, getSpeciesRoleLabel } from '../src/modules/species/species.service';
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

const platyKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0011',
  name: '月光鱼',
  scientificName: 'Xiphophorus maculatus',
  waterTemperature: '20-28°C',
  phLevel: '7.0-8.5',
  tankSize: '至少 48 升',
});
assert.deepEqual(platyKnowledge.facts.temperatureRange, { min: 20, max: 26 });
assert.deepEqual(platyKnowledge.facts.phRange, { min: 7, max: 8.2 });
assert.equal(platyKnowledge.knowledge.sexIdentification.confidence, 'verified');
assert.equal(platyKnowledge.knowledge.reproduction?.mode, 'livebearer');
assert.equal(platyKnowledge.knowledge.reproduction?.gestationOrIncubation?.minDays, 24);
assert.equal(platyKnowledge.knowledge.environment?.hardnessDgh?.min, 10);
assert.equal(platyKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 6);
assert.equal(platyKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 60);
const platySources = resolveKnowledgeSources(platyKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(platySources.length, 2);
assert.ok(platySources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(platySources.some(source => source.publisher === 'FishBase'));

const mollyKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0437',
  name: '玛丽鱼',
  scientificName: 'Poecilia sphenops',
  waterTemperature: '22-28°C',
  phLevel: '7.0-8.5',
  tankSize: '至少 48 升',
});
assert.deepEqual(mollyKnowledge.facts.temperatureRange, { min: 21, max: 28 });
assert.deepEqual(mollyKnowledge.facts.phRange, { min: 7, max: 8.5 });
assert.equal(mollyKnowledge.knowledge.environment?.hardnessDgh?.min, 15);
assert.equal(mollyKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 8);
assert.equal(mollyKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 81);
assert.equal(mollyKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 90);
assert.equal(mollyKnowledge.knowledge.reproduction?.mode, 'livebearer');
assert.equal(mollyKnowledge.knowledge.reproduction?.gestationOrIncubation, undefined, 'conflicting gestation sources must not be collapsed into one fake exact range');
const mollySources = resolveKnowledgeSources(mollyKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(mollySources.length, 1);
assert.equal(mollySources[0]?.publisher, 'Seriously Fish');

const swordtailKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0438',
  name: '红剑鱼',
  scientificName: 'Xiphophorus hellerii',
  waterTemperature: '20-28°C',
  phLevel: '7.0-8.5',
  tankSize: '至少 96 升',
});
assert.deepEqual(swordtailKnowledge.facts.temperatureRange, { min: 16, max: 28 });
assert.deepEqual(swordtailKnowledge.facts.phRange, { min: 7, max: 8 });
assert.equal(swordtailKnowledge.knowledge.environment?.hardnessDgh?.min, 10);
assert.equal(swordtailKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 14);
assert.equal(swordtailKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 108);
assert.equal(swordtailKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 120);
assert.equal(swordtailKnowledge.knowledge.reproduction?.gestationOrIncubation?.minDays, 24);
assert.ok(swordtailKnowledge.knowledge.sexIdentification.maleTraits?.some(item => item.includes('交接器')));
assert.equal(getReviewedSpeciesKnowledgeForFish({ id: 'sp_0236', scientificName: 'Xiphophorus hellerii var. Albino Red' }), undefined, 'commercial swordtail variants must not inherit standard-species authority automatically');

const blackSkirtKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0010',
  name: '黑裙鱼',
  scientificName: 'Gymnocorymbus ternetzi',
  waterTemperature: '20-28°C',
  phLevel: '6.0-8.5',
  tankSize: '至少 48 升',
  temperament: 'Territorial',
});
assert.deepEqual(blackSkirtKnowledge.facts.temperatureRange, { min: 20, max: 26 });
assert.deepEqual(blackSkirtKnowledge.facts.phRange, { min: 6, max: 7 });
assert.deepEqual(blackSkirtKnowledge.knowledge.environment?.hardnessDgh, { min: 5, max: 20 });
assert.equal(blackSkirtKnowledge.knowledge.socialBehavior?.minimumGroupSize, 12);
assert.equal(blackSkirtKnowledge.knowledge.socialBehavior?.territoriality, 'none');
assert.equal(blackSkirtKnowledge.knowledge.socialBehavior?.finNipping, 'medium');
assert.equal(blackSkirtKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 68);
assert.equal(blackSkirtKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 75);
assert.equal(blackSkirtKnowledge.knowledge.reproduction?.mode, 'egg_scatterer');
assert.equal(getReviewedSpeciesKnowledgeForFish({ id: 'sp_0227', scientificName: 'Gymnocorymbus ternetzi var. Longfin' }), undefined, 'black-skirt ornamental variants must not inherit standard-species authority automatically');

const cherryBarbKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0012',
  name: '樱桃灯',
  scientificName: 'Puntius titteya',
  waterTemperature: '23-27°C',
  phLevel: '6.0-8.0',
  tankSize: '至少 40 升',
});
assert.deepEqual(cherryBarbKnowledge.facts.temperatureRange, { min: 20, max: 27 });
assert.deepEqual(cherryBarbKnowledge.facts.phRange, { min: 6, max: 8 });
assert.deepEqual(cherryBarbKnowledge.knowledge.environment?.hardnessDgh, { min: 2, max: 20 });
assert.equal(cherryBarbKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
assert.deepEqual(cherryBarbKnowledge.knowledge.socialBehavior?.recommendedGroupSize, { min: 6, max: 10 });
assert.equal(cherryBarbKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 5);
assert.equal(cherryBarbKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 54);
assert.equal(cherryBarbKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 60);
assert.equal(cherryBarbKnowledge.knowledge.reproduction?.mode, 'egg_scatterer');
assert.deepEqual(cherryBarbKnowledge.knowledge.reproduction?.gestationOrIncubation, { minDays: 1, maxDays: 2, label: '鱼卵通常约 24–48 小时孵化' });
const cherryBarbSources = resolveKnowledgeSources(cherryBarbKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(cherryBarbSources.length, 2);
assert.ok(cherryBarbSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(cherryBarbSources.some(source => source.publisher === 'FishBase'));

const emberKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0114',
  name: '红莲灯',
  scientificName: 'Hyphessobrycon amandae',
  waterTemperature: '24-29°C',
  phLevel: '5.0-7.0',
  tankSize: '至少 30 升',
});
assert.deepEqual(emberKnowledge.facts.temperatureRange, { min: 20, max: 28 });
assert.deepEqual(emberKnowledge.facts.phRange, { min: 5, max: 7 });
assert.deepEqual(emberKnowledge.knowledge.environment?.hardnessDgh, { min: 1, max: 10 });
assert.equal(emberKnowledge.knowledge.socialBehavior?.minimumGroupSize, 8);
assert.deepEqual(emberKnowledge.knowledge.socialBehavior?.recommendedGroupSize, { min: 8, max: 10 });
assert.equal(emberKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 2);
assert.equal(emberKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 41);
assert.equal(emberKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 45);
assert.equal(emberKnowledge.knowledge.reproduction?.mode, 'egg_scatterer');
const emberAliasKnowledge = getReviewedSpeciesKnowledgeForFish({ id: 'sp_0469', scientificName: 'Hyphessobrycon amandae' });
assert.equal(emberAliasKnowledge, getReviewedSpeciesKnowledgeForFish({ id: 'sp_0114', scientificName: 'Hyphessobrycon amandae' }), 'duplicate Ember-tetra catalog aliases must share one reviewed biological knowledge object');
const emberSources = resolveKnowledgeSources(emberKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(emberSources.length, 2);
assert.ok(emberSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(emberSources.some(source => source.publisher === 'FishBase'));

const denisonKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0440',
  name: '一眉道人',
  scientificName: 'Sahyadria denisonii',
  waterTemperature: '15-25°C',
  phLevel: '6.5-7.8',
  tankSize: '至少 120 升',
});
assert.deepEqual(denisonKnowledge.facts.temperatureRange, { min: 15, max: 25 });
assert.deepEqual(denisonKnowledge.facts.phRange, { min: 6.5, max: 7.8 });
assert.deepEqual(denisonKnowledge.knowledge.environment?.hardnessDgh, { min: 5, max: 25 });
assert.equal(denisonKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
assert.deepEqual(denisonKnowledge.knowledge.socialBehavior?.recommendedGroupSize, { min: 6, max: 10 });
assert.equal(denisonKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 11);
assert.equal(denisonKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 243);
assert.equal(denisonKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 120);
assert.equal(denisonKnowledge.knowledge.reproduction, undefined, 'Denison barb reproduction stays absent until stronger reviewed captive-breeding authority exists');
assert.equal(getReviewedSpeciesKnowledgeForFish({ id: 'sp_0196', scientificName: 'Sahyadria denisonii var. Gold' }), undefined, 'Denison ornamental variants must not inherit standard-species authority automatically');
const denisonSources = resolveKnowledgeSources(denisonKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(denisonSources.length, 2);
assert.ok(denisonSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(denisonSources.some(source => source.publisher === 'FishBase'));

const pygmyCoryKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0053',
  name: '精灵鼠',
  scientificName: 'Corydoras pygmaeus',
  waterTemperature: '22-26°C',
  phLevel: '6.0-7.5',
  tankSize: '至少 30 升',
});
assert.deepEqual(pygmyCoryKnowledge.facts.temperatureRange, { min: 22, max: 26 });
assert.deepEqual(pygmyCoryKnowledge.facts.phRange, { min: 6.4, max: 7.4 });
assert.deepEqual(pygmyCoryKnowledge.knowledge.environment?.hardnessDgh, { min: 0, max: 8 });
assert.equal(pygmyCoryKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
assert.deepEqual(pygmyCoryKnowledge.knowledge.socialBehavior?.recommendedGroupSize, { min: 10 });
assert.equal(pygmyCoryKnowledge.knowledge.socialBehavior?.predationVulnerability, 'high');
assert.equal(pygmyCoryKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 3);
assert.equal(pygmyCoryKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 41);
assert.equal(pygmyCoryKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 45);
const pygmyCorySources = resolveKnowledgeSources(pygmyCoryKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(pygmyCorySources.length, 2);
assert.ok(pygmyCorySources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(pygmyCorySources.some(source => source.publisher === 'FishBase'));

const redRainbowfishKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0133',
  name: '红苹果美人',
  scientificName: 'Glossolepis incisus',
  waterTemperature: '22-26°C',
  phLevel: '7.0-8.0',
  tankSize: '至少 96 升',
});
assert.deepEqual(redRainbowfishKnowledge.facts.temperatureRange, { min: 22, max: 25 });
assert.deepEqual(redRainbowfishKnowledge.facts.phRange, { min: 7, max: 8 });
assert.deepEqual(redRainbowfishKnowledge.knowledge.environment?.hardnessDgh, { min: 10, max: 20 });
assert.equal(redRainbowfishKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
assert.deepEqual(redRainbowfishKnowledge.knowledge.socialBehavior?.recommendedGroupSize, { min: 6, max: 8 });
assert.equal(redRainbowfishKnowledge.knowledge.socialBehavior?.territoriality, 'none');
assert.equal(redRainbowfishKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 15);
assert.equal(redRainbowfishKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 108);
assert.equal(redRainbowfishKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 120);
assert.equal(redRainbowfishKnowledge.knowledge.reproduction?.mode, 'egg_scatterer');
const redRainbowfishSources = resolveKnowledgeSources(redRainbowfishKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(redRainbowfishSources.length, 2);
assert.ok(redRainbowfishSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(redRainbowfishSources.some(source => source.publisher === 'FishBase'));

const clownLoachKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0126',
  name: '三间鼠',
  scientificName: 'Chromobotia macracanthus',
  waterTemperature: '24-30°C',
  phLevel: '6.0-7.5',
  tankSize: '至少 240 升',
  temperament: 'Territorial',
});
assert.deepEqual(clownLoachKnowledge.facts.temperatureRange, { min: 24, max: 30 });
assert.deepEqual(clownLoachKnowledge.facts.phRange, { min: 5, max: 7 });
assert.deepEqual(clownLoachKnowledge.knowledge.environment?.hardnessDgh, { min: 1, max: 12 });
assert.equal(clownLoachKnowledge.knowledge.socialBehavior?.minimumGroupSize, 5);
assert.deepEqual(clownLoachKnowledge.knowledge.socialBehavior?.recommendedGroupSize, { min: 10 });
assert.equal(clownLoachKnowledge.knowledge.socialBehavior?.territoriality, 'low');
assert.equal(clownLoachKnowledge.knowledge.socialBehavior?.finNipping, 'medium');
assert.equal(clownLoachKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 40);
assert.equal(clownLoachKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 648);
assert.equal(clownLoachKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 180);
assert.equal(clownLoachKnowledge.knowledge.reproduction, undefined, 'Clown-loach reproduction stays absent because normal private-aquarium breeding is not established enough for a user rule');
const clownLoachSources = resolveKnowledgeSources(clownLoachKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(clownLoachSources.length, 2);
assert.ok(clownLoachSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(clownLoachSources.some(source => source.publisher === 'FishBase'));

const hillstreamLoachKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0045',
  name: '越南爬岩鳅',
  scientificName: 'Sewellia lineolata',
  waterTemperature: '18-24°C',
  phLevel: '6.5-7.5',
  tankSize: '至少 48 升',
});
assert.deepEqual(hillstreamLoachKnowledge.facts.temperatureRange, { min: 20, max: 24 });
assert.deepEqual(hillstreamLoachKnowledge.facts.phRange, { min: 6, max: 7.5 });
assert.deepEqual(hillstreamLoachKnowledge.knowledge.environment?.hardnessDgh, { min: 1, max: 10 });
assert.equal(hillstreamLoachKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
assert.equal(hillstreamLoachKnowledge.knowledge.socialBehavior?.territoriality, 'low');
assert.equal(hillstreamLoachKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 6.5);
assert.equal(hillstreamLoachKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 68);
assert.equal(hillstreamLoachKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 75);
assert.equal(hillstreamLoachKnowledge.knowledge.reproduction, undefined, 'Hillstream-loach reproduction stays absent until a dedicated reviewed reproduction rule is needed');
const hillstreamLoachSources = resolveKnowledgeSources(hillstreamLoachKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(hillstreamLoachSources.length, 1);
assert.equal(hillstreamLoachSources[0]?.publisher, 'Seriously Fish');

const discusKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0447',
  name: '七彩神仙鱼（七彩鱼）',
  scientificName: 'Symphysodon aequifasciatus',
  waterTemperature: '28-32°C',
  phLevel: '5.0-6.5',
  tankSize: '至少 160 升',
});
assert.deepEqual(discusKnowledge.facts.temperatureRange, { min: 26, max: 30 });
assert.deepEqual(discusKnowledge.facts.phRange, { min: 5, max: 8 });
assert.deepEqual(discusKnowledge.knowledge.environment?.hardnessDgh, { min: 0, max: 12 });
assert.equal(discusKnowledge.knowledge.sexIdentification.confidence, 'unknown');
assert.equal(discusKnowledge.knowledge.reproduction, undefined, 'Discus reproduction stays absent until a stronger dedicated reviewed source is added');
assert.equal(discusKnowledge.knowledge.socialBehavior?.minimumGroupSize, 5);
assert.equal(discusKnowledge.knowledge.socialBehavior?.territoriality, 'none');
assert.equal(discusKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 14);
assert.equal(discusKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 255);
assert.equal(discusKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 120);
const discusSources = resolveKnowledgeSources(discusKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(discusSources.length, 2);
assert.ok(discusSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(discusSources.some(source => source.publisher === 'FishBase'));

const ramireziKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0448',
  name: '荷兰凤凰',
  scientificName: 'Mikrogeophagus ramirezi',
  waterTemperature: '26-30°C',
  phLevel: '5.0-6.5',
  tankSize: '至少 48 升',
});
assert.deepEqual(ramireziKnowledge.facts.temperatureRange, { min: 27, max: 30 });
assert.deepEqual(ramireziKnowledge.facts.phRange, { min: 4, max: 7 });
assert.deepEqual(ramireziKnowledge.knowledge.environment?.hardnessDgh, { min: 1, max: 10 });
assert.equal(ramireziKnowledge.knowledge.socialBehavior?.mode, 'pair');
assert.equal(ramireziKnowledge.knowledge.socialBehavior?.territoriality, 'none');
assert.equal(ramireziKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 4.2);
assert.equal(ramireziKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 54);
assert.equal(ramireziKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 60);
assert.equal(ramireziKnowledge.knowledge.reproduction?.mode, 'substrate_spawner');
assert.equal(ramireziKnowledge.knowledge.reproduction?.parentalCare, 'fry_guarding');
assert.equal(getReviewedSpeciesKnowledgeForFish({ id: 'sp_0157', scientificName: 'Mikrogeophagus ramirezi var. Blue' }), undefined, 'Ramirezi ornamental variants must not inherit standard-species authority automatically');
const ramireziSources = resolveKnowledgeSources(ramireziKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(ramireziSources.length, 2);
assert.ok(ramireziSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(ramireziSources.some(source => source.publisher === 'FishBase'));

const agassiziiKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0017',
  name: '阿卡西短鲷',
  scientificName: 'Apistogramma agassizii',
  waterTemperature: '24-28°C',
  phLevel: '5.0-7.0',
  tankSize: '至少 64 升',
});
assert.deepEqual(agassiziiKnowledge.facts.temperatureRange, { min: 22, max: 29 });
assert.deepEqual(agassiziiKnowledge.facts.phRange, { min: 5, max: 7 });
assert.deepEqual(agassiziiKnowledge.knowledge.environment?.hardnessDgh, { min: 0, max: 10 });
assert.equal(agassiziiKnowledge.knowledge.socialBehavior?.mode, 'harem');
assert.equal(agassiziiKnowledge.knowledge.socialBehavior?.territoriality, 'low');
assert.equal(agassiziiKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 7.5);
assert.equal(agassiziiKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 54);
assert.equal(agassiziiKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 60);
assert.equal(agassiziiKnowledge.knowledge.reproduction?.mode, 'cave_spawner');
assert.equal(agassiziiKnowledge.knowledge.reproduction?.parentalCare, 'fry_guarding');
assert.equal(getReviewedSpeciesKnowledgeForFish({ id: 'sp_0221', scientificName: 'Apistogramma agassizii var. Fire Red' }), undefined, 'Agassizii ornamental variants must not inherit standard-species authority automatically');
const agassiziiSources = resolveKnowledgeSources(agassiziiKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(agassiziiSources.length, 2);
assert.ok(agassiziiSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(agassiziiSources.some(source => source.publisher === 'FishBase'));

const pearlGouramiKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0444',
  name: '珍珠马甲',
  scientificName: 'Trichopodus leerii',
  waterTemperature: '24-28°C',
  phLevel: '6.0-8.0',
  tankSize: '至少 96 升',
});
assert.deepEqual(pearlGouramiKnowledge.facts.temperatureRange, { min: 24, max: 30 });
assert.deepEqual(pearlGouramiKnowledge.facts.phRange, { min: 5.5, max: 8 });
assert.deepEqual(pearlGouramiKnowledge.knowledge.environment?.hardnessDgh, { min: 2, max: 30 });
assert.equal(pearlGouramiKnowledge.knowledge.socialBehavior?.territoriality, 'none');
assert.equal(pearlGouramiKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 12);
assert.equal(pearlGouramiKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 81);
assert.equal(pearlGouramiKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 120);
assert.equal(pearlGouramiKnowledge.knowledge.reproduction?.mode, 'bubble_nester');
assert.equal(pearlGouramiKnowledge.knowledge.reproduction?.breedingAggression, 'medium');
assert.equal(getReviewedSpeciesKnowledgeForFish({ id: 'sp_0153', scientificName: 'Trichopodus leerii var. Balloon' }), undefined, 'Pearl-gourami ornamental variants must not inherit standard-species authority automatically');
const pearlGouramiSources = resolveKnowledgeSources(pearlGouramiKnowledge.knowledge.spaceAndGrowth?.evidence.sourceIds || []);
assert.equal(pearlGouramiSources.length, 2);
assert.ok(pearlGouramiSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(pearlGouramiSources.some(source => source.publisher === 'FishBase'));

const congoTetraKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0020',
  name: '刚果美人',
  scientificName: 'Phenacogrammus interruptus',
  waterTemperature: '23-28°C',
  phLevel: '6.0-7.5',
  tankSize: '至少 80 升',
});
assert.deepEqual(congoTetraKnowledge.facts.temperatureRange, { min: 23, max: 28 });
assert.deepEqual(congoTetraKnowledge.facts.phRange, { min: 6, max: 7.5 });
assert.deepEqual(congoTetraKnowledge.knowledge.environment?.hardnessDgh, { min: 3, max: 18 });
assert.equal(congoTetraKnowledge.knowledge.socialBehavior?.minimumGroupSize, 5);
assert.equal(congoTetraKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 8);
assert.equal(congoTetraKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 108);
assert.equal(congoTetraKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 120);
assert.equal(congoTetraKnowledge.knowledge.reproduction?.mode, 'egg_scatterer');
assert.deepEqual(congoTetraKnowledge.knowledge.reproduction?.gestationOrIncubation, { minDays: 6, maxDays: 6, label: '鱼卵通常约 6 天孵化' });
const congoTetraSources = resolveKnowledgeSources(congoTetraKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(congoTetraSources.length, 2);
assert.ok(congoTetraSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(congoTetraSources.some(source => source.publisher === 'FishBase'));

const harlequinKnowledge = buildSpeciesKnowledgeProfile({
  ...baseFish,
  id: 'sp_0468',
  name: '金三角灯',
  scientificName: 'Trigonostigma heteromorpha',
  waterTemperature: '23-28°C',
  phLevel: '6.0-7.5',
  tankSize: '至少 40 升',
});
assert.deepEqual(harlequinKnowledge.facts.temperatureRange, { min: 21, max: 28 });
assert.deepEqual(harlequinKnowledge.facts.phRange, { min: 5, max: 7.5 });
assert.deepEqual(harlequinKnowledge.knowledge.environment?.hardnessDgh, { min: 1, max: 12 });
assert.equal(harlequinKnowledge.knowledge.socialBehavior?.minimumGroupSize, 8);
assert.deepEqual(harlequinKnowledge.knowledge.socialBehavior?.recommendedGroupSize, { min: 8, max: 10 });
assert.equal(harlequinKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 4.5);
assert.equal(harlequinKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 54);
assert.equal(harlequinKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 60);
assert.equal(harlequinKnowledge.knowledge.reproduction?.mode, 'other');
const harlequinSources = resolveKnowledgeSources(harlequinKnowledge.knowledge.environment?.evidence.sourceIds || []);
assert.equal(harlequinSources.length, 2);
assert.ok(harlequinSources.some(source => source.publisher === 'Seriously Fish'));
assert.ok(harlequinSources.some(source => source.publisher === 'FishBase'));

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


const bronzeCoryKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0014', name: '咖啡鼠', scientificName: 'Corydoras aeneus' });
assert.equal(bronzeCoryKnowledge.knowledge.socialBehavior?.minimumGroupSize, 4);
assert.equal(bronzeCoryKnowledge.knowledge.socialBehavior?.swimmingZone, 'bottom');
assert.equal(bronzeCoryKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 80);
assert.equal(bronzeCoryKnowledge.knowledge.spaceAndGrowth?.adultLengthCm?.max, 7.5);

const pandaCoryKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0443', name: '熊猫鼠', scientificName: 'Corydoras panda' });
assert.equal(pandaCoryKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
assert.equal(pandaCoryKnowledge.knowledge.socialBehavior?.swimmingZone, 'bottom');
assert.equal(pandaCoryKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 45);
assert.equal(pandaCoryKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 41);

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

const miniParrot = { ...baseFish, id: 'sp_0021', name: '迷你鹦鹉鱼', scientificName: 'Amatitlania nigrofasciata var.', temperament: 'Aggressive' as const };
const miniParrotKnowledge = buildSpeciesKnowledgeProfile(miniParrot);
assert.equal(miniParrotKnowledge.knowledge.sexIdentification.confidence, 'unknown');
assert.equal(miniParrotKnowledge.knowledge.socialBehavior?.territoriality, 'high');
assert.equal(miniParrotKnowledge.knowledge.socialBehavior?.finNipping, 'medium');
assert.equal(miniParrotKnowledge.knowledge.reproduction, undefined);
assert.equal(miniParrotKnowledge.knowledge.spaceAndGrowth, undefined);
const miniParrotSources = resolveKnowledgeSources(miniParrotKnowledge.knowledge.socialBehavior?.evidence.sourceIds || []);
assert.equal(miniParrotSources.length, 1);
assert.equal(miniParrotSources[0]?.publisher, 'Integrative and Comparative Biology');

const inheritedMiniParrot = { ...baseFish, id: 'sp_0147', name: '蓝宝鹦鹉鱼', scientificName: 'Amatitlania nigrofasciata var. Blue', temperament: 'Aggressive' as const };
assert.equal(getReviewedSpeciesKnowledgeForFish(inheritedMiniParrot)?.socialBehavior?.territoriality, 'high');

const pearlSnakehead = { ...baseFish, id: 'sp_0049', name: '珍珠赤雷龙', scientificName: 'Channa asiatica', temperament: 'Aggressive' as const };
const pearlSnakeheadKnowledge = buildSpeciesKnowledgeProfile(pearlSnakehead);
assert.equal(pearlSnakeheadKnowledge.knowledge.sexIdentification.confidence, 'unknown');
assert.equal(pearlSnakeheadKnowledge.knowledge.socialBehavior?.mode, 'solitary');
assert.equal(pearlSnakeheadKnowledge.knowledge.socialBehavior?.predationRisk, 'high');
assert.equal(pearlSnakeheadKnowledge.knowledge.socialBehavior?.territoriality, 'unknown');
assert.equal(pearlSnakeheadKnowledge.knowledge.reproduction, undefined);
assert.equal(pearlSnakeheadKnowledge.knowledge.spaceAndGrowth, undefined);
const pearlSnakeheadSources = resolveKnowledgeSources(pearlSnakeheadKnowledge.knowledge.socialBehavior?.evidence.sourceIds || []);
assert.equal(pearlSnakeheadSources.length, 1);
assert.equal(pearlSnakeheadSources[0]?.publisher, 'U.S. Fish and Wildlife Service');

const inheritedAlbinoSnakehead = { ...baseFish, id: 'sp_0223', name: '红眼白子雷龙', scientificName: 'Channa asiatica var. Albino', temperament: 'Aggressive' as const };
assert.equal(getReviewedSpeciesKnowledgeForFish(inheritedAlbinoSnakehead)?.socialBehavior?.mode, 'solitary');
assert.equal(getReviewedSpeciesKnowledgeForFish(inheritedAlbinoSnakehead)?.socialBehavior?.predationRisk, 'high');

const inheritedBetta = { ...baseFish, id: 'sp_0259', name: '半月斗鱼 (蓝蝴蝶)', scientificName: 'Betta splendens var. Halfmoon' };
const inheritedBettaKnowledge = buildSpeciesKnowledgeProfile(inheritedBetta);
assert.equal(inheritedBettaKnowledge.knowledge.socialBehavior?.mode, 'solitary');
assert.equal(inheritedBettaKnowledge.knowledge.socialBehavior?.finNipVulnerability, 'high');
assert.equal(inheritedBettaKnowledge.knowledge.reproduction?.mode, 'bubble_nester');
assert.ok(inheritedBettaKnowledge.knowledge.socialBehavior?.evidence.sourceIds.includes('seriouslyfish-betta-splendens'));
assert.equal(getReviewedSpeciesKnowledgeForFish(inheritedBetta)?.socialBehavior?.territoriality, 'high');

const cherryShrimpKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0001', name: '极火虾', scientificName: 'Neocaridina davidi var. Red', category: '虾螺蟹' });
assert.equal(cherryShrimpKnowledge.knowledge.socialBehavior?.predationVulnerability, 'high');
assert.equal(cherryShrimpKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
const wildShrimpKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0459', name: '黑壳虾', scientificName: 'Neocaridina davidi wild type', category: '虾螺蟹' });
assert.equal(wildShrimpKnowledge.knowledge.socialBehavior?.predationVulnerability, 'high');
assert.equal(wildShrimpKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
const crystalShrimpKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0002', name: '水晶虾', scientificName: 'Caridina cantonensis var.', category: '虾螺蟹' });
assert.equal(crystalShrimpKnowledge.knowledge.socialBehavior?.predationVulnerability, 'high');
assert.equal(crystalShrimpKnowledge.knowledge.socialBehavior?.minimumGroupSize, 10);
const reviewedNeriteKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0428', name: '斑马螺', scientificName: 'Neritina natalensis', category: '虾螺蟹' });
assert.equal(reviewedNeriteKnowledge.knowledge.socialBehavior?.minimumGroupSize, undefined);
assert.equal(reviewedNeriteKnowledge.knowledge.socialBehavior?.predationVulnerability, undefined);

const angelfishKnowledge = buildSpeciesKnowledgeProfile({ ...baseFish, id: 'sp_0446', name: '天使鱼（神仙鱼）', scientificName: 'Pterophyllum scalare' });
assert.equal(angelfishKnowledge.knowledge.socialBehavior?.finNipVulnerability, 'high');
assert.equal(angelfishKnowledge.knowledge.socialBehavior?.predationRisk, 'medium');
assert.equal(angelfishKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 200);
assert.equal(angelfishKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 100);
const angelfishSources = resolveKnowledgeSources(angelfishKnowledge.knowledge.socialBehavior?.evidence.sourceIds || []);
assert.equal(angelfishSources.length, 2);


const cherryShrimpFish: Fish = { ...baseFish, id: 'sp_0001', name: '极火虾', scientificName: 'Neocaridina davidi var. Red', category: '虾螺蟹', housingMode: '谨慎混养' };
const wildNeocaridinaFish: Fish = { ...baseFish, id: 'sp_0459', name: '黑壳虾', scientificName: 'Neocaridina davidi wild type', category: '虾螺蟹', housingMode: '谨慎混养' };
const cherryKnowledge = buildSpeciesKnowledgeProfile(cherryShrimpFish);
const wildNeocaridinaKnowledge = buildSpeciesKnowledgeProfile(wildNeocaridinaFish);
assert.equal(cherryKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
assert.equal(wildNeocaridinaKnowledge.knowledge.socialBehavior?.minimumGroupSize, 6);
assert.equal(cherryKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 20);
assert.equal(cherryKnowledge.knowledge.sexIdentification.confidence, 'verified');
assert.equal(getSpeciesHousingAuthority(cherryShrimpFish).label, '群体 6+');
assert.equal(getSpeciesHousingAuthority(wildNeocaridinaFish).source, 'reviewed');

const crystalShrimpFish: Fish = { ...baseFish, id: 'sp_0002', name: '水晶虾', scientificName: 'Caridina cantonensis var.', category: '虾螺蟹', difficulty: 'Hard', housingMode: '谨慎混养' };
const crystalKnowledge = buildSpeciesKnowledgeProfile(crystalShrimpFish);
assert.equal(crystalKnowledge.knowledge.socialBehavior?.minimumGroupSize, 10);
assert.equal(crystalKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 19);
assert.equal(crystalKnowledge.knowledge.sexIdentification.confidence, 'unknown');
assert.equal(getSpeciesHousingAuthority(crystalShrimpFish).label, '群体 10+');

const neriteFish: Fish = { ...baseFish, id: 'sp_0428', name: '斑马螺', scientificName: 'Neritina natalensis', category: '虾螺蟹', housingMode: '谨慎混养' };
const neriteKnowledge = buildSpeciesKnowledgeProfile(neriteFish);
assert.equal(neriteKnowledge.knowledge.socialBehavior?.mode, 'variable');
assert.equal(neriteKnowledge.knowledge.socialBehavior?.minimumGroupSize, undefined);
assert.equal(neriteKnowledge.knowledge.spaceAndGrowth?.minVolumeLiters, 20);
assert.equal(getSpeciesHousingAuthority(neriteFish).source, 'reviewed');
assert.equal(getSpeciesHousingAuthority(neriteFish).minimumGroupSize, undefined);

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

const rummyNoseFish = fishData.find(fish => fish.id === 'sp_0433');
assert.ok(rummyNoseFish, 'Rummy-nose tetra must exist in catalog');
const rummyNoseKnowledge = buildSpeciesKnowledgeProfile(rummyNoseFish);
assert.deepEqual(rummyNoseKnowledge.facts.temperatureRange, { min: 24, max: 27 });
assert.deepEqual(rummyNoseKnowledge.facts.phRange, { min: 5.5, max: 7 });
assert.equal(rummyNoseKnowledge.knowledge.socialBehavior?.minimumGroupSize, 10);
assert.equal(rummyNoseKnowledge.knowledge.spaceAndGrowth?.minTankLengthCm, 90);
assert.equal(resolveKnowledgeSources(rummyNoseKnowledge.knowledge.socialBehavior?.evidence.sourceIds || []).length, 2);

const otocinclusFish = fishData.find(fish => fish.id === 'sp_0013');
assert.ok(otocinclusFish, 'Otocinclus vittatus must exist in catalog');
const otocinclusKnowledge = buildSpeciesKnowledgeProfile(otocinclusFish);
assert.deepEqual(otocinclusKnowledge.facts.temperatureRange, { min: 20, max: 25 });
assert.deepEqual(otocinclusKnowledge.facts.phRange, { min: 6, max: 7.5 });
assert.equal(otocinclusKnowledge.knowledge.socialBehavior?.mode, 'group');
assert.equal(otocinclusKnowledge.knowledge.socialBehavior?.minimumGroupSize, undefined, 'do not invent a fixed Otocinclus group-size threshold');
assert.equal(otocinclusKnowledge.knowledge.socialBehavior?.predationVulnerability, 'high');
assert.equal(resolveKnowledgeSources(otocinclusKnowledge.knowledge.socialBehavior?.evidence.sourceIds || []).length, 2);

const reviewedAuthorityGaps = fishData
  .filter(fish => getReviewedCompatibilityProfileForFish(fish) && !getReviewedSpeciesKnowledgeForFish(fish))
  .map(fish => ({ id: fish.id, name: fish.name, scientificName: fish.scientificName }));
assert.deepEqual(reviewedAuthorityGaps, [], 'every Compatibility-reviewed catalog fish must resolve to Species Knowledge V2 authority');



const tigerHousingFish: Fish = { ...baseFish, id: 'sp_0439', name: '虎皮鱼', scientificName: 'Puntigrus tetrazona', temperament: 'Aggressive', housingMode: '建议单养' };
const tigerHousing = getSpeciesHousingAuthority(tigerHousingFish);
assert.equal(tigerHousing.source, 'reviewed');
assert.equal(tigerHousing.label, '群体 8+');
assert.equal(tigerHousing.minimumGroupSize, 8);
assert.equal(tigerHousing.solitaryRequired, false);
assert.equal(tigerHousing.status, 'warning');
assert.equal(tigerHousing.communityCategory, '谨慎混养');
assert.equal(getSpeciesFilterTags(tigerHousingFish).housingTags.includes('建议单养'), false);
assert.equal(getSpeciesFilterTags(tigerHousingFish).housingTags.includes('谨慎混养'), true);
assert.doesNotMatch(getSpeciesRoleLabel(tigerHousingFish), /建议单养/);
assert.match(getSpeciesPositioning(tigerHousingFish), /至少 8/);

const bettaVariantHousing = getSpeciesHousingAuthority({ ...baseFish, id: 'test-betta-halfmoon', name: '半月斗鱼', scientificName: 'Betta splendens var. Halfmoon', housingMode: '适合混养' });
assert.equal(bettaVariantHousing.source, 'reviewed');
assert.equal(bettaVariantHousing.solitaryRequired, true);
assert.equal(bettaVariantHousing.communityCategory, '建议单养');

const legacyHousing = getSpeciesHousingAuthority({ ...baseFish, id: 'legacy-species', housingMode: '谨慎混养' });
assert.equal(legacyHousing.source, 'legacy');
assert.equal(legacyHousing.status, 'warning');
assert.equal(legacyHousing.communityCategory, '谨慎混养');

assert.equal(phase2AuthorityBatchCount, 49, 'all Phase 2 authority batches must be registered');
for (const [speciesId, authority] of Object.entries(phase2AuthorityBySpeciesId)) {
  assert.ok(fishData.some(fish => fish.id === speciesId), `${speciesId} authority must resolve to a catalog object`);
  for (const field of Object.values(authority)) {
    for (const sourceId of field?.citationIds || []) {
      assert.ok(resolveKnowledgeSources([sourceId]).length === 1, `${speciesId} authority citation ${sourceId} must be in knowledgeSources`);
    }
  }
}

for (const fish of fishData) {
  const reviewedKnowledge = getReviewedSpeciesKnowledgeForFish(fish);
  if (!reviewedKnowledge) continue;
  const reviewedEvidence = [
    ['sexIdentification', reviewedKnowledge.sexIdentification?.evidence],
    ['environment', reviewedKnowledge.environment?.evidence],
    ['socialBehavior', reviewedKnowledge.socialBehavior?.evidence],
    ['spaceAndGrowth', reviewedKnowledge.spaceAndGrowth?.evidence],
  ] as const;
  for (const [field, evidence] of reviewedEvidence) {
    for (const sourceId of evidence?.sourceIds || []) {
      assert.equal(resolveKnowledgeSources([sourceId]).length, 1, `${fish.id}/${field} reviewed source ${sourceId} must be in knowledgeSources`);
    }
  }
}
assert.equal(getPhase2Authority('sp_0455')?.environment?.status, 'reviewed_unknown');
assert.equal(getPhase2Authority('sp_0016')?.feeding?.status, 'reviewed_supported');
assert.equal(getPhase2Authority('sp_0016')?.care?.status, 'reviewed_supported');

const goldRam = fishData.find(fish => fish.id === 'sp_0016');
assert.ok(goldRam, 'gold ram catalog object must exist');
const goldRamKnowledge = getReviewedSpeciesKnowledgeForFish(goldRam);
assert.ok(goldRamKnowledge, 'gold ram must resolve its direct reviewed Phase 2 knowledge');
assert.deepEqual(goldRamKnowledge.environment?.temperatureRangeC, { min: 24, max: 28 });
assert.deepEqual(goldRamKnowledge.environment?.phRange, { min: 5, max: 7.2 });
assert.ok(
  goldRamKnowledge.environment?.evidence.sourceIds.includes('aquarium-industries-ramirezi-care-sheet'),
  'gold ram runtime knowledge must preserve its direct variant-aware source',
);

const reviewedBaseInheritance = getReviewedSpeciesKnowledgeForFish({
  id: 'sp_0147',
  scientificName: 'Amatitlania nigrofasciata var. Blue',
});
assert.equal(reviewedBaseInheritance?.socialBehavior?.evidence.sourceIds[0], 'convict-cichlid-territory-study', 'matrix-only variant must inherit the reviewed base runtime boundary');
assert.equal(getPhase2Authority('sp_0147')?.feeding?.status, 'reviewed_unknown', 'matrix-only variant authority must remain reviewed_unknown');

const reviewedUnknownVariant = getReviewedSpeciesKnowledgeForFish({
  id: 'sp_0224',
  scientificName: 'Channa argus var. Platinum',
});
assert.equal(getPhase2Authority('sp_0224')?.feeding?.status, 'reviewed_unknown');
assert.equal(getPhase2Authority('sp_0224')?.care?.status, 'reviewed_unknown');
assert.equal(reviewedUnknownVariant, undefined, 'matrix-only reviewed_unknown must remain fail-closed without reviewed base runtime authority');

const directReviewedSpecies = getReviewedSpeciesKnowledgeForFish({
  id: 'sp_0016',
  scientificName: 'Mikrogeophagus ramirezi var. Gold',
});
assert.equal(directReviewedSpecies, goldRamKnowledge, 'exact reviewed species authority must win before base inheritance');

console.log('species detail knowledge assertions passed');
